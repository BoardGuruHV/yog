import React from "react";
import { View, StyleSheet } from "react-native";
import { IntervalTimer } from "@/components/timer";
import { PracticeStackScreenProps } from "@/navigation/types";

export function IntervalTimerScreen({
  route,
  navigation,
}: PracticeStackScreenProps<"IntervalTimer">) {
  const { config } = route.params;

  const handleComplete = (totalSeconds: number) => {
    navigation.replace("PracticeComplete", {
      durationSeconds: totalSeconds,
      type: "interval",
    });
  };

  const handleExit = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <IntervalTimer
        config={config}
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

export default IntervalTimerScreen;
