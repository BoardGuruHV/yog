// Meditation Timer - Simple countdown timer with interval bells

export interface MeditationTimerState {
  status: "idle" | "playing" | "paused" | "completed";
  timeRemaining: number;
  timeElapsed: number;
  totalDuration: number;
}

export interface MeditationTimerCallbacks {
  onTick: (state: MeditationTimerState) => void;
  onIntervalBell: (timeElapsed: number) => void;
  onComplete: () => void;
}

export class MeditationTimerEngine {
  private state: MeditationTimerState;
  private callbacks: MeditationTimerCallbacks;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private bellIntervalSeconds: number; // 0 means no interval bells

  constructor(
    durationSeconds: number,
    bellIntervalMinutes: number,
    callbacks: MeditationTimerCallbacks
  ) {
    this.callbacks = callbacks;
    this.bellIntervalSeconds = bellIntervalMinutes * 60;

    this.state = {
      status: "idle",
      timeRemaining: durationSeconds,
      timeElapsed: 0,
      totalDuration: durationSeconds,
    };
  }

  getState(): MeditationTimerState {
    return { ...this.state };
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

  addTime(seconds: number): void {
    this.state.timeRemaining += seconds;
    this.state.totalDuration += seconds;
    this.callbacks.onTick(this.getState());
  }

  reset(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state = {
      status: "idle",
      timeRemaining: this.state.totalDuration,
      timeElapsed: 0,
      totalDuration: this.state.totalDuration,
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

    this.state.timeRemaining--;
    this.state.timeElapsed++;

    // Check for interval bell
    if (
      this.bellIntervalSeconds > 0 &&
      this.state.timeElapsed > 0 &&
      this.state.timeElapsed % this.bellIntervalSeconds === 0 &&
      this.state.timeRemaining > 0
    ) {
      this.callbacks.onIntervalBell(this.state.timeElapsed);
    }

    if (this.state.timeRemaining <= 0) {
      this.complete();
      return;
    }

    this.callbacks.onTick(this.getState());
  }

  private complete(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state.status = "completed";
    this.state.timeRemaining = 0;

    this.callbacks.onComplete();
    this.callbacks.onTick(this.getState());
  }
}
