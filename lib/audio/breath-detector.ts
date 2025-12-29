export type BreathPhase = "inhale" | "exhale" | "hold" | "idle";

export interface BreathState {
  phase: BreathPhase;
  volume: number; // 0-1 normalized volume
  duration: number; // current phase duration in ms
  confidence: number; // 0-1 detection confidence
}

export interface BreathDetectorOptions {
  onStateChange?: (state: BreathState) => void;
  onBreathComplete?: (inhaleDuration: number, exhaleDuration: number) => void;
  sensitivity?: number; // 0-1, default 0.5
  smoothingFactor?: number; // 0-1, default 0.8
}

const DEFAULT_OPTIONS: Required<Omit<BreathDetectorOptions, 'onStateChange' | 'onBreathComplete'>> = {
  sensitivity: 0.5,
  smoothingFactor: 0.8,
};

export class BreathDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private options: Required<Omit<BreathDetectorOptions, 'onStateChange' | 'onBreathComplete'>> & BreathDetectorOptions;

  private currentPhase: BreathPhase = "idle";
  private phaseStartTime: number = 0;
  private smoothedVolume: number = 0;
  private volumeHistory: number[] = [];
  private lastInhaleDuration: number = 0;
  private volumeThreshold: number = 0.02;
  private isCalibrating: boolean = true;
  private calibrationSamples: number[] = [];
  private baselineVolume: number = 0;

  constructor(options: BreathDetectorOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async start(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      // Create audio context and analyzer
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = this.options.smoothingFactor;

      // Connect microphone to analyzer
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      // Start calibration
      this.isCalibrating = true;
      this.calibrationSamples = [];
      this.phaseStartTime = Date.now();

      // Start analysis loop
      this.analyze();
    } catch (error) {
      console.error("Failed to start breath detector:", error);
      throw error;
    }
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.currentPhase = "idle";
  }

  private analyze = (): void => {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength) / 255;

    // Apply smoothing
    this.smoothedVolume =
      this.smoothedVolume * this.options.smoothingFactor +
      rms * (1 - this.options.smoothingFactor);

    // Calibration phase (first 2 seconds)
    if (this.isCalibrating) {
      this.calibrationSamples.push(this.smoothedVolume);
      if (Date.now() - this.phaseStartTime > 2000) {
        // Calculate baseline from calibration
        this.baselineVolume =
          this.calibrationSamples.reduce((a, b) => a + b, 0) /
          this.calibrationSamples.length;
        this.volumeThreshold = this.baselineVolume + 0.02 * this.options.sensitivity;
        this.isCalibrating = false;
        this.phaseStartTime = Date.now();
      }
    }

    // Track volume history for trend detection
    this.volumeHistory.push(this.smoothedVolume);
    if (this.volumeHistory.length > 10) {
      this.volumeHistory.shift();
    }

    // Detect breath phase based on volume changes
    const normalizedVolume = Math.max(
      0,
      Math.min(1, (this.smoothedVolume - this.baselineVolume) * 10)
    );

    const trend = this.calculateTrend();
    const now = Date.now();
    const phaseDuration = now - this.phaseStartTime;

    let newPhase = this.currentPhase;
    let confidence = 0.5;

    if (this.isCalibrating) {
      newPhase = "idle";
      confidence = 0;
    } else if (normalizedVolume > 0.3 && trend > 0.002) {
      // Volume increasing = inhale
      newPhase = "inhale";
      confidence = Math.min(1, normalizedVolume + Math.abs(trend) * 10);
    } else if (normalizedVolume > 0.3 && trend < -0.002) {
      // Volume decreasing = exhale
      newPhase = "exhale";
      confidence = Math.min(1, normalizedVolume + Math.abs(trend) * 10);
    } else if (normalizedVolume > 0.1 && Math.abs(trend) < 0.002) {
      // Stable volume = hold
      newPhase = "hold";
      confidence = 0.7;
    } else {
      // Low volume = idle/between breaths
      if (phaseDuration > 500) {
        newPhase = "idle";
        confidence = 0.6;
      }
    }

    // Track phase transitions
    if (newPhase !== this.currentPhase) {
      // Breath cycle complete when transitioning from exhale to inhale/idle
      if (this.currentPhase === "exhale" && (newPhase === "inhale" || newPhase === "idle")) {
        const exhaleDuration = phaseDuration;
        this.options.onBreathComplete?.(this.lastInhaleDuration, exhaleDuration);
      }

      if (this.currentPhase === "inhale") {
        this.lastInhaleDuration = phaseDuration;
      }

      this.currentPhase = newPhase;
      this.phaseStartTime = now;
    }

    // Emit state update
    const state: BreathState = {
      phase: this.currentPhase,
      volume: normalizedVolume,
      duration: phaseDuration,
      confidence,
    };
    this.options.onStateChange?.(state);

    // Continue analysis loop
    this.animationFrame = requestAnimationFrame(this.analyze);
  };

  private calculateTrend(): number {
    if (this.volumeHistory.length < 5) return 0;

    const recent = this.volumeHistory.slice(-5);
    const older = this.volumeHistory.slice(-10, -5);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    return recentAvg - olderAvg;
  }

  isRunning(): boolean {
    return this.animationFrame !== null;
  }

  getPhase(): BreathPhase {
    return this.currentPhase;
  }
}

// Pranayama breathing patterns
export interface BreathingPattern {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  phases: {
    type: BreathPhase;
    duration: number; // seconds
    instruction: string;
  }[];
  benefits: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: "box",
    name: "Box Breathing",
    sanskritName: "Sama Vritti",
    description:
      "Equal duration breathing in a square pattern. Calms the nervous system and improves focus.",
    phases: [
      { type: "inhale", duration: 4, instruction: "Breathe in slowly" },
      { type: "hold", duration: 4, instruction: "Hold your breath" },
      { type: "exhale", duration: 4, instruction: "Breathe out slowly" },
      { type: "hold", duration: 4, instruction: "Hold empty" },
    ],
    benefits: ["Reduces stress", "Improves concentration", "Calms anxiety"],
    difficulty: "beginner",
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    sanskritName: "Relaxing Breath",
    description:
      "A natural tranquilizer for the nervous system. Helps with sleep and relaxation.",
    phases: [
      { type: "inhale", duration: 4, instruction: "Breathe in through nose" },
      { type: "hold", duration: 7, instruction: "Hold your breath" },
      { type: "exhale", duration: 8, instruction: "Exhale through mouth" },
    ],
    benefits: ["Promotes sleep", "Reduces anxiety", "Manages cravings"],
    difficulty: "beginner",
  },
  {
    id: "ujjayi",
    name: "Ocean Breath",
    sanskritName: "Ujjayi Pranayama",
    description:
      "Create a soft sound in the throat like ocean waves. Builds heat and focus.",
    phases: [
      { type: "inhale", duration: 5, instruction: "Inhale with throat constriction" },
      { type: "exhale", duration: 5, instruction: "Exhale with 'ha' sound" },
    ],
    benefits: ["Builds internal heat", "Increases oxygen", "Improves focus"],
    difficulty: "intermediate",
  },
  {
    id: "kapalabhati",
    name: "Skull Shining Breath",
    sanskritName: "Kapalabhati",
    description:
      "Quick, forceful exhales with passive inhales. Energizing and cleansing.",
    phases: [
      { type: "exhale", duration: 0.5, instruction: "Sharp exhale, pull belly in" },
      { type: "inhale", duration: 0.5, instruction: "Passive inhale" },
    ],
    benefits: ["Energizes", "Clears sinuses", "Strengthens core"],
    difficulty: "advanced",
  },
  {
    id: "alternate",
    name: "Alternate Nostril",
    sanskritName: "Nadi Shodhana",
    description:
      "Alternating breath between nostrils. Balances left and right brain hemispheres.",
    phases: [
      { type: "inhale", duration: 4, instruction: "Inhale through left nostril" },
      { type: "hold", duration: 2, instruction: "Hold briefly" },
      { type: "exhale", duration: 4, instruction: "Exhale through right nostril" },
      { type: "inhale", duration: 4, instruction: "Inhale through right nostril" },
      { type: "hold", duration: 2, instruction: "Hold briefly" },
      { type: "exhale", duration: 4, instruction: "Exhale through left nostril" },
    ],
    benefits: ["Balances energy", "Calms mind", "Improves focus"],
    difficulty: "intermediate",
  },
];
