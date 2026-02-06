import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card, Button } from "@/components/common";
import { PracticeStackScreenProps } from "@/navigation/types";

type AmbientSound = "none" | "rain" | "ocean" | "forest";

export function MeditationSelectScreen({
  navigation,
}: PracticeStackScreenProps<"MeditationSelect">) {
  const [duration, setDuration] = useState(10);
  const [bellInterval, setBellInterval] = useState(0);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>("none");

  const durations = [5, 10, 15, 20, 30, 45, 60];
  const bellIntervals = [0, 1, 2, 5, 10];
  const sounds: Array<{ value: AmbientSound; label: string; emoji: string }> = [
    { value: "none", label: "Silent", emoji: "🔇" },
    { value: "rain", label: "Rain", emoji: "🌧️" },
    { value: "ocean", label: "Ocean", emoji: "🌊" },
    { value: "forest", label: "Forest", emoji: "🌲" },
  ];

  const handleStart = () => {
    navigation.navigate("MeditationTimer", {
      durationMinutes: duration,
      bellIntervalMinutes: bellInterval,
      ambientSound,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Duration Selection */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.options}>
          {durations.map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                styles.option,
                duration === mins && styles.optionSelected,
              ]}
              onPress={() => setDuration(mins)}
            >
              <Text
                style={[
                  styles.optionText,
                  duration === mins && styles.optionTextSelected,
                ]}
              >
                {mins}
              </Text>
              <Text
                style={[
                  styles.optionUnit,
                  duration === mins && styles.optionTextSelected,
                ]}
              >
                min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Bell Interval */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Interval Bells</Text>
        <Text style={styles.sectionSubtitle}>
          Play a gentle bell at regular intervals
        </Text>
        <View style={styles.options}>
          {bellIntervals.map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                styles.option,
                bellInterval === mins && styles.optionSelected,
              ]}
              onPress={() => setBellInterval(mins)}
            >
              <Text
                style={[
                  styles.optionText,
                  bellInterval === mins && styles.optionTextSelected,
                ]}
              >
                {mins === 0 ? "Off" : mins}
              </Text>
              {mins > 0 && (
                <Text
                  style={[
                    styles.optionUnit,
                    bellInterval === mins && styles.optionTextSelected,
                  ]}
                >
                  min
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Ambient Sound */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Ambient Sound</Text>
        <View style={styles.soundOptions}>
          {sounds.map((sound) => (
            <TouchableOpacity
              key={sound.value}
              style={[
                styles.soundOption,
                ambientSound === sound.value && styles.soundOptionSelected,
              ]}
              onPress={() => setAmbientSound(sound.value)}
            >
              <Text style={styles.soundEmoji}>{sound.emoji}</Text>
              <Text
                style={[
                  styles.soundLabel,
                  ambientSound === sound.value && styles.soundLabelSelected,
                ]}
              >
                {sound.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Summary & Start */}
      <Card variant="elevated" padding="lg" style={styles.summaryCard}>
        <View style={styles.summary}>
          <Text style={styles.summaryDuration}>{duration} minutes</Text>
          <Text style={styles.summaryDetails}>
            {bellInterval > 0
              ? `Bell every ${bellInterval} min`
              : "No interval bells"}
            {" • "}
            {sounds.find((s) => s.value === ambientSound)?.label}
          </Text>
        </View>

        <Button
          title="Begin Meditation"
          onPress={handleStart}
          size="lg"
          style={styles.startButton}
        />
      </Card>

      {/* Tips */}
      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Tips for meditation</Text>
        <Text style={styles.tip}>• Find a quiet, comfortable space</Text>
        <Text style={styles.tip}>• Sit with your spine straight</Text>
        <Text style={styles.tip}>• Focus on your breath</Text>
        <Text style={styles.tip}>• Let thoughts pass without judgment</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    minWidth: 60,
  },
  optionSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  optionUnit: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  optionTextSelected: {
    color: "#fff",
  },
  soundOptions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  soundOption: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  soundOptionSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  soundEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  soundLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  soundLabelSelected: {
    color: "#fff",
  },
  summaryCard: {
    marginTop: 8,
  },
  summary: {
    alignItems: "center",
    marginBottom: 16,
  },
  summaryDuration: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1e293b",
  },
  summaryDetails: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  startButton: {
    marginTop: 8,
  },
  tips: {
    marginTop: 24,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 6,
  },
});

export default MeditationSelectScreen;
