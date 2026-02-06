import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  MeditationTimerEngine,
  MeditationTimerState,
} from "@/services/timer/meditationTimer";
import { soundPlayer } from "@/services/audio/soundPlayer";
import { formatTime } from "@/services/timer/engine";

interface MeditationTimerProps {
  durationMinutes: number;
  bellIntervalMinutes: number;
  ambientSound: "none" | "rain" | "ocean" | "forest";
  onComplete: (totalSeconds: number) => void;
  onExit: () => void;
}

export function MeditationTimer({
  durationMinutes,
  bellIntervalMinutes,
  ambientSound,
  onComplete,
  onExit,
}: MeditationTimerProps) {
  const [timerState, setTimerState] = useState<MeditationTimerState>({
    status: "idle",
    timeRemaining: durationMinutes * 60,
    timeElapsed: 0,
    totalDuration: durationMinutes * 60,
  });

  const engineRef = useRef<MeditationTimerEngine | null>(null);

  // Breathing animation
  const breathScale = useSharedValue(1);
  const breathOpacity = useSharedValue(0.3);

  useEffect(() => {
    const engine = new MeditationTimerEngine(
      durationMinutes * 60,
      bellIntervalMinutes,
      {
        onTick: (state) => setTimerState(state),
        onIntervalBell: () => {
          soundPlayer.playIntervalBell();
        },
        onComplete: () => {
          soundPlayer.stopAmbientSound();
          soundPlayer.playCompletionSound();
          onComplete(timerState.timeElapsed);
        },
      }
    );

    engineRef.current = engine;

    return () => {
      engine.destroy();
      soundPlayer.stopAmbientSound();
    };
  }, [durationMinutes, bellIntervalMinutes]);

  // Start breathing animation when playing
  useEffect(() => {
    if (timerState.status === "playing") {
      // 4 seconds inhale, 4 seconds exhale
      breathScale.value = withRepeat(
        withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      breathOpacity.value = withRepeat(
        withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [timerState.status]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
    opacity: breathOpacity.value,
  }));

  const handlePlayPause = () => {
    if (timerState.status === "idle") {
      if (ambientSound !== "none") {
        soundPlayer.startAmbientSound(ambientSound);
      }
    }
    engineRef.current?.toggle();
  };

  const handleAddTime = (minutes: number) => {
    engineRef.current?.addTime(minutes * 60);
  };

  const handleExit = () => {
    soundPlayer.stopAmbientSound();
    onExit();
  };

  const progress = 1 - timerState.timeRemaining / timerState.totalDuration;

  if (timerState.status === "completed") {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit}>
          <Text style={styles.exitButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meditation</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Breathing Circle */}
      <View style={styles.circleContainer}>
        <Animated.View style={[styles.breathCircle, animatedCircleStyle]} />
        <View style={styles.timerCircle}>
          {/* Progress ring */}
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressRingFill,
                {
                  transform: [{ rotate: `${progress * 360}deg` }],
                },
              ]}
            />
          </View>

          <Text style={styles.timeDisplay}>
            {formatTime(timerState.timeRemaining)}
          </Text>

          {timerState.status === "playing" && (
            <Text style={styles.breathGuide}>
              {Math.floor(timerState.timeElapsed / 4) % 2 === 0
                ? "Inhale"
                : "Exhale"}
            </Text>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.addTimeButton}
          onPress={() => handleAddTime(1)}
        >
          <Text style={styles.addTimeText}>+1 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={handlePlayPause}
        >
          <Text style={styles.playPauseIcon}>
            {timerState.status === "playing" ? "⏸" : "▶️"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addTimeButton}
          onPress={() => handleAddTime(5)}
        >
          <Text style={styles.addTimeText}>+5 min</Text>
        </TouchableOpacity>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>{durationMinutes} min</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Bells</Text>
          <Text style={styles.infoValue}>
            {bellIntervalMinutes > 0 ? `Every ${bellIntervalMinutes} min` : "Off"}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Sound</Text>
          <Text style={styles.infoValue}>
            {ambientSound === "none"
              ? "Silent"
              : ambientSound.charAt(0).toUpperCase() + ambientSound.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  exitButton: {
    fontSize: 24,
    color: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  circleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  breathCircle: {
    position: "absolute",
    width: screenWidth - 100,
    height: screenWidth - 100,
    borderRadius: (screenWidth - 100) / 2,
    backgroundColor: "#6366f1",
  },
  timerCircle: {
    width: screenWidth - 120,
    height: screenWidth - 120,
    borderRadius: (screenWidth - 120) / 2,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  progressRing: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: (screenWidth - 120) / 2,
    borderWidth: 4,
    borderColor: "#334155",
  },
  progressRingFill: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: (screenWidth - 120) / 2,
    borderWidth: 4,
    borderColor: "#6366f1",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  timeDisplay: {
    fontSize: 56,
    fontWeight: "300",
    color: "#fff",
    fontVariant: ["tabular-nums"],
  },
  breathGuide: {
    fontSize: 18,
    color: "#94a3b8",
    marginTop: 8,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 40,
  },
  addTimeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#1e293b",
  },
  addTimeText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseIcon: {
    fontSize: 36,
  },
  sessionInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#334155",
    marginHorizontal: 20,
  },
});

export default MeditationTimer;
