import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  IntervalTimerEngine,
  IntervalTimerState,
  IntervalTimerConfig,
} from "@/services/timer/intervalTimer";
import { soundPlayer } from "@/services/audio/soundPlayer";
import { formatTime } from "@/services/timer/engine";

interface IntervalTimerProps {
  config: IntervalTimerConfig;
  onComplete: (totalSeconds: number) => void;
  onExit: () => void;
}

export function IntervalTimer({
  config,
  onComplete,
  onExit,
}: IntervalTimerProps) {
  const [timerState, setTimerState] = useState<IntervalTimerState>({
    status: "idle",
    phase: "work",
    currentRound: 1,
    totalRounds: config.rounds,
    currentExerciseIndex: 0,
    phaseTimeRemaining: config.workDuration,
    totalTimeRemaining: 0,
    totalTimeElapsed: 0,
  });

  const engineRef = useRef<IntervalTimerEngine | null>(null);

  useEffect(() => {
    const engine = new IntervalTimerEngine(config, {
      onTick: (state) => setTimerState(state),
      onPhaseChange: (_phase) => {
        soundPlayer.playTransitionBell();
      },
      onExerciseChange: () => {},
      onRoundComplete: () => {
        soundPlayer.playTransitionBell();
      },
      onComplete: () => {
        soundPlayer.playCompletionSound();
        onComplete(timerState.totalTimeElapsed);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, [config]);

  const handlePlayPause = () => {
    engineRef.current?.toggle();
  };

  const handleSkipPhase = () => {
    engineRef.current?.skipPhase();
  };

  const handleReset = () => {
    engineRef.current?.reset();
  };

  const currentExercise = config.exercises[timerState.currentExerciseIndex];
  const isWork = timerState.phase === "work";

  if (timerState.status === "completed") {
    return null;
  }

  return (
    <View style={[styles.container, isWork ? styles.workBg : styles.restBg]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit}>
          <Text style={styles.exitButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.roundCounter}>
          Round {timerState.currentRound} / {timerState.totalRounds}
        </Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetButton}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Phase Label */}
      <View style={styles.phaseContainer}>
        <Text style={[styles.phaseLabel, isWork ? styles.workText : styles.restText]}>
          {isWork ? "WORK" : "REST"}
        </Text>
      </View>

      {/* Exercise Name */}
      {currentExercise && isWork && (
        <View style={styles.exerciseContainer}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseIndex}>
            {timerState.currentExerciseIndex + 1} / {config.exercises.length}
          </Text>
        </View>
      )}

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timeDisplay}>
          {formatTime(timerState.phaseTimeRemaining)}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              isWork ? styles.workProgress : styles.restProgress,
              {
                width: `${
                  (1 -
                    timerState.phaseTimeRemaining /
                      (isWork ? config.workDuration : config.restDuration)) *
                  100
                }%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipPhase}
        >
          <Text style={styles.skipText}>Skip ⏭</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playPauseButton, isWork ? styles.workButton : styles.restButton]}
          onPress={handlePlayPause}
        >
          <Text style={styles.playPauseIcon}>
            {timerState.status === "playing" ? "⏸" : "▶️"}
          </Text>
        </TouchableOpacity>

        <View style={{ width: 80 }} />
      </View>

      {/* Total Progress */}
      <View style={styles.totalProgress}>
        <Text style={styles.totalLabel}>Total Time</Text>
        <Text style={styles.totalTime}>
          {formatTime(timerState.totalTimeElapsed)} /{" "}
          {formatTime(
            config.rounds *
              config.exercises.length *
              (config.workDuration + config.restDuration)
          )}
        </Text>
      </View>

      {/* Next Exercise Preview */}
      {!isWork && (
        <View style={styles.nextExercise}>
          <Text style={styles.nextLabel}>Next:</Text>
          <Text style={styles.nextName}>
            {config.exercises[
              (timerState.currentExerciseIndex + 1) % config.exercises.length
            ]?.name || "Complete!"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  workBg: {
    backgroundColor: "#dc2626",
  },
  restBg: {
    backgroundColor: "#16a34a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  exitButton: {
    fontSize: 24,
    color: "#fff",
  },
  roundCounter: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  resetButton: {
    fontSize: 24,
    color: "#fff",
  },
  phaseContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  phaseLabel: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 8,
  },
  workText: {
    color: "#fecaca",
  },
  restText: {
    color: "#bbf7d0",
  },
  exerciseContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  exerciseIndex: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
  },
  timerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  timeDisplay: {
    fontSize: 120,
    fontWeight: "200",
    color: "#fff",
    fontVariant: ["tabular-nums"],
  },
  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 30,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  workProgress: {
    backgroundColor: "#fecaca",
  },
  restProgress: {
    backgroundColor: "#bbf7d0",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 30,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: 80,
  },
  skipText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  workButton: {
    backgroundColor: "#fecaca",
  },
  restButton: {
    backgroundColor: "#bbf7d0",
  },
  playPauseIcon: {
    fontSize: 36,
  },
  totalProgress: {
    alignItems: "center",
    paddingBottom: 20,
  },
  totalLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
  },
  totalTime: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  nextExercise: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
    gap: 8,
  },
  nextLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  nextName: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
});

export default IntervalTimer;
