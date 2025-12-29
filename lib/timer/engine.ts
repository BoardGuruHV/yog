import { ProgramAsana } from "@/types";

export interface TimerState {
  status: "idle" | "playing" | "paused" | "completed";
  currentPoseIndex: number;
  poseTimeRemaining: number;
  totalTimeRemaining: number;
  totalTimeElapsed: number;
}

export interface TimerCallbacks {
  onTick: (state: TimerState) => void;
  onPoseChange: (poseIndex: number, isLast: boolean) => void;
  onComplete: () => void;
  onTransitionStart: (nextPoseIndex: number) => void;
}

export class PracticeTimerEngine {
  private asanas: ProgramAsana[];
  private state: TimerState;
  private callbacks: TimerCallbacks;
  private intervalId: NodeJS.Timeout | null = null;
  private transitionDuration: number = 5; // seconds between poses

  constructor(asanas: ProgramAsana[], callbacks: TimerCallbacks) {
    this.asanas = asanas;
    this.callbacks = callbacks;

    const totalDuration = asanas.reduce((sum, a) => sum + a.duration, 0) +
      (asanas.length - 1) * this.transitionDuration;

    this.state = {
      status: "idle",
      currentPoseIndex: 0,
      poseTimeRemaining: asanas[0]?.duration || 0,
      totalTimeRemaining: totalDuration,
      totalTimeElapsed: 0,
    };
  }

  getState(): TimerState {
    return { ...this.state };
  }

  getCurrentPose(): ProgramAsana | null {
    return this.asanas[this.state.currentPoseIndex] || null;
  }

  getNextPose(): ProgramAsana | null {
    return this.asanas[this.state.currentPoseIndex + 1] || null;
  }

  getTotalPoses(): number {
    return this.asanas.length;
  }

  start(): void {
    if (this.state.status === "playing") return;

    this.state.status = "playing";
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.callbacks.onTick(this.getState());
  }

  pause(): void {
    if (this.state.status !== "playing") return;

    this.state.status = "paused";
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callbacks.onTick(this.getState());
  }

  resume(): void {
    if (this.state.status !== "paused") return;
    this.start();
  }

  toggle(): void {
    if (this.state.status === "playing") {
      this.pause();
    } else if (this.state.status === "paused" || this.state.status === "idle") {
      this.start();
    }
  }

  skipToNext(): void {
    if (this.state.currentPoseIndex >= this.asanas.length - 1) {
      this.complete();
      return;
    }

    const remainingTime = this.state.poseTimeRemaining;
    this.state.totalTimeRemaining -= remainingTime;
    this.state.totalTimeElapsed += remainingTime;

    this.moveToNextPose();
  }

  skipToPrevious(): void {
    if (this.state.currentPoseIndex <= 0) return;

    const currentPoseDuration = this.asanas[this.state.currentPoseIndex].duration;
    const elapsedInCurrentPose = currentPoseDuration - this.state.poseTimeRemaining;

    this.state.totalTimeRemaining += elapsedInCurrentPose + this.transitionDuration;
    this.state.totalTimeElapsed -= elapsedInCurrentPose + this.transitionDuration;

    this.state.currentPoseIndex--;
    this.state.poseTimeRemaining = this.asanas[this.state.currentPoseIndex].duration;

    const isLast = this.state.currentPoseIndex === this.asanas.length - 1;
    this.callbacks.onPoseChange(this.state.currentPoseIndex, isLast);
    this.callbacks.onTick(this.getState());
  }

  goToPose(index: number): void {
    if (index < 0 || index >= this.asanas.length) return;

    // Recalculate times
    let elapsed = 0;
    for (let i = 0; i < index; i++) {
      elapsed += this.asanas[i].duration + this.transitionDuration;
    }

    const totalDuration = this.asanas.reduce((sum, a) => sum + a.duration, 0) +
      (this.asanas.length - 1) * this.transitionDuration;

    this.state.currentPoseIndex = index;
    this.state.poseTimeRemaining = this.asanas[index].duration;
    this.state.totalTimeElapsed = elapsed;
    this.state.totalTimeRemaining = totalDuration - elapsed;

    const isLast = index === this.asanas.length - 1;
    this.callbacks.onPoseChange(index, isLast);
    this.callbacks.onTick(this.getState());
  }

  reset(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const totalDuration = this.asanas.reduce((sum, a) => sum + a.duration, 0) +
      (this.asanas.length - 1) * this.transitionDuration;

    this.state = {
      status: "idle",
      currentPoseIndex: 0,
      poseTimeRemaining: this.asanas[0]?.duration || 0,
      totalTimeRemaining: totalDuration,
      totalTimeElapsed: 0,
    };

    this.callbacks.onTick(this.getState());
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    if (this.state.status !== "playing") return;

    this.state.poseTimeRemaining--;
    this.state.totalTimeRemaining--;
    this.state.totalTimeElapsed++;

    if (this.state.poseTimeRemaining <= 0) {
      if (this.state.currentPoseIndex >= this.asanas.length - 1) {
        this.complete();
        return;
      }

      // Notify about transition
      this.callbacks.onTransitionStart(this.state.currentPoseIndex + 1);

      // Wait for transition, then move to next pose
      setTimeout(() => {
        if (this.state.status === "playing" || this.state.status === "paused") {
          this.moveToNextPose();
        }
      }, this.transitionDuration * 1000);

      // Pause during transition
      this.pause();
      this.state.status = "playing"; // Keep showing as playing

      return;
    }

    this.callbacks.onTick(this.getState());
  }

  private moveToNextPose(): void {
    this.state.currentPoseIndex++;
    this.state.poseTimeRemaining = this.asanas[this.state.currentPoseIndex].duration;

    const isLast = this.state.currentPoseIndex === this.asanas.length - 1;
    this.callbacks.onPoseChange(this.state.currentPoseIndex, isLast);

    // Resume the timer
    if (this.state.status === "playing") {
      this.intervalId = setInterval(() => this.tick(), 1000);
    }

    this.callbacks.onTick(this.getState());
  }

  private complete(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state.status = "completed";
    this.state.poseTimeRemaining = 0;
    this.state.totalTimeRemaining = 0;

    this.callbacks.onComplete();
    this.callbacks.onTick(this.getState());
  }
}

// Audio utilities
export function playBellSound(type: "transition" | "complete" = "transition"): void {
  if (typeof window === "undefined") return;

  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === "transition") {
    // Single bell tone
    oscillator.frequency.setValueAtTime(528, audioContext.currentTime); // C5
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.5);
  } else {
    // Triple bell for completion
    oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.8);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
