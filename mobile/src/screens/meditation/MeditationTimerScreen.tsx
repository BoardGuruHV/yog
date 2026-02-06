import React from "react";
import { View, StyleSheet } from "react-native";
import { MeditationTimer } from "@/components/timer";
import { PracticeStackScreenProps } from "@/navigation/types";

export function MeditationTimerScreen({
  route,
  navigation,
}: PracticeStackScreenProps<"MeditationTimer">) {
  const { durationMinutes, bellIntervalMinutes, ambientSound } = route.params;

  const handleComplete = (totalSeconds: number) => {
    navigation.replace("PracticeComplete", {
      durationSeconds: totalSeconds,
      type: "meditation",
    });
  };

  const handleExit = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MeditationTimer
        durationMinutes={durationMinutes}
        bellIntervalMinutes={bellIntervalMinutes}
        ambientSound={ambientSound}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MeditationTimerScreen;
