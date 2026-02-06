// Interval Training Timer - HIIT-style work/rest intervals

export interface IntervalTimerState {
  status: "idle" | "playing" | "paused" | "completed";
  phase: "work" | "rest";
  currentRound: number;
  totalRounds: number;
  currentExerciseIndex: number;
  phaseTimeRemaining: number;
  totalTimeRemaining: number;
  totalTimeElapsed: number;
}

export interface IntervalTimerCallbacks {
  onTick: (state: IntervalTimerState) => void;
  onPhaseChange: (phase: "work" | "rest", round: number) => void;
  onExerciseChange: (exerciseIndex: number) => void;
  onRoundComplete: (round: number) => void;
  onComplete: () => void;
}

export interface IntervalTimerConfig {
  workDuration: number; // seconds
  restDuration: number; // seconds
  rounds: number;
  exercises: Array<{ name: string; asanaId?: string }>;
}

export class IntervalTimerEngine {
  private state: IntervalTimerState;
  private config: IntervalTimerConfig;
  private callbacks: IntervalTimerCallbacks;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: IntervalTimerConfig, callbacks: IntervalTimerCallbacks) {
    this.config = config;
    this.callbacks = callbacks;

    const totalRounds = config.rounds;
    const exercisesPerRound = config.exercises.length;
    const totalDuration =
      totalRounds *
      exercisesPerRound *
      (config.workDuration + config.restDuration);

    this.state = {
      status: "idle",
      phase: "work",
      currentRound: 1,
      totalRounds,
      currentExerciseIndex: 0,
      phaseTimeRemaining: config.workDuration,
      totalTimeRemaining: totalDuration,
      totalTimeElapsed: 0,
    };
  }

  getState(): IntervalTimerState {
    return { ...this.state };
  }

  getCurrentExercise(): { name: string; asanaId?: string } | null {
    return this.config.exercises[this.state.currentExerciseIndex] || null;
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

  skipPhase(): void {
    this.advancePhase();
  }

  reset(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const totalDuration =
      this.config.rounds *
      this.config.exercises.length *
      (this.config.workDuration + this.config.restDuration);

    this.state = {
      status: "idle",
      phase: "work",
      currentRound: 1,
      totalRounds: this.config.rounds,
      currentExerciseIndex: 0,
      phaseTimeRemaining: this.config.workDuration,
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

    this.state.phaseTimeRemaining--;
    this.state.totalTimeRemaining--;
    this.state.totalTimeElapsed++;

    if (this.state.phaseTimeRemaining <= 0) {
      this.advancePhase();
      return;
    }

    this.callbacks.onTick(this.getState());
  }

  private advancePhase(): void {
    if (this.state.phase === "work") {
      // Switch to rest
      this.state.phase = "rest";
      this.state.phaseTimeRemaining = this.config.restDuration;
      this.callbacks.onPhaseChange("rest", this.state.currentRound);
    } else {
      // Rest complete - move to next exercise or round
      this.state.currentExerciseIndex++;

      if (this.state.currentExerciseIndex >= this.config.exercises.length) {
        // Round complete
        this.callbacks.onRoundComplete(this.state.currentRound);
        this.state.currentRound++;
        this.state.currentExerciseIndex = 0;

        if (this.state.currentRound > this.state.totalRounds) {
          // All rounds complete
          this.complete();
          return;
        }
      }

      // Start next work phase
      this.state.phase = "work";
      this.state.phaseTimeRemaining = this.config.workDuration;
      this.callbacks.onPhaseChange("work", this.state.currentRound);
      this.callbacks.onExerciseChange(this.state.currentExerciseIndex);
    }

    this.callbacks.onTick(this.getState());
  }

  private complete(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state.status = "completed";
    this.state.phaseTimeRemaining = 0;
    this.state.totalTimeRemaining = 0;

    this.callbacks.onComplete();
    this.callbacks.onTick(this.getState());
  }
}
