import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Card, Button, Input } from "@/components/common";
import { IntervalConfig } from "@/types";
import { PracticeStackScreenProps } from "@/navigation/types";

export function IntervalSelectScreen({
  navigation,
}: PracticeStackScreenProps<"IntervalSelect">) {
  const [workDuration, setWorkDuration] = useState(30);
  const [restDuration, setRestDuration] = useState(10);
  const [rounds, setRounds] = useState(5);
  const [exercises, setExercises] = useState<Array<{ name: string }>>([
    { name: "Sun Salutation A" },
    { name: "Plank Hold" },
    { name: "Warrior Flow" },
  ]);
  const [newExercise, setNewExercise] = useState("");

  const presets = [
    { label: "Quick", work: 20, rest: 10, rounds: 4 },
    { label: "Standard", work: 30, rest: 15, rounds: 6 },
    { label: "Intense", work: 45, rest: 15, rounds: 8 },
    { label: "Tabata", work: 20, rest: 10, rounds: 8 },
  ];

  const handlePreset = (preset: (typeof presets)[0]) => {
    setWorkDuration(preset.work);
    setRestDuration(preset.rest);
    setRounds(preset.rounds);
  };

  const handleAddExercise = () => {
    if (newExercise.trim()) {
      setExercises([...exercises, { name: newExercise.trim() }]);
      setNewExercise("");
    }
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    const config: IntervalConfig = {
      workDuration,
      restDuration,
      rounds,
      exercises,
    };
    navigation.navigate("IntervalTimer", { config });
  };

  const totalDuration = rounds * exercises.length * (workDuration + restDuration);
  const formatTotalTime = () => {
    const minutes = Math.floor(totalDuration / 60);
    const seconds = totalDuration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Presets */}
      <Text style={styles.sectionTitle}>Presets</Text>
      <View style={styles.presets}>
        {presets.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            style={styles.preset}
            onPress={() => handlePreset(preset)}
          >
            <Text style={styles.presetLabel}>{preset.label}</Text>
            <Text style={styles.presetDetails}>
              {preset.work}s/{preset.rest}s × {preset.rounds}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Settings */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Settings</Text>

        <View style={styles.timeInputs}>
          <View style={styles.timeInput}>
            <Text style={styles.timeLabel}>Work</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setWorkDuration(Math.max(5, workDuration - 5))}
              >
                <Text style={styles.stepperText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.timeValue}>{workDuration}s</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setWorkDuration(workDuration + 5)}
              >
                <Text style={styles.stepperText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeInput}>
            <Text style={styles.timeLabel}>Rest</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setRestDuration(Math.max(5, restDuration - 5))}
              >
                <Text style={styles.stepperText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.timeValue}>{restDuration}s</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setRestDuration(restDuration + 5)}
              >
                <Text style={styles.stepperText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeInput}>
            <Text style={styles.timeLabel}>Rounds</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setRounds(Math.max(1, rounds - 1))}
              >
                <Text style={styles.stepperText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.timeValue}>{rounds}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setRounds(rounds + 1)}
              >
                <Text style={styles.stepperText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>

      {/* Exercises */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>
          Exercises ({exercises.length})
        </Text>

        {exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
              <Text style={styles.removeButton}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addExercise}>
          <TextInput
            style={styles.addInput}
            placeholder="Add exercise..."
            value={newExercise}
            onChangeText={setNewExercise}
            onSubmitEditing={handleAddExercise}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddExercise}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Summary */}
      <Card variant="elevated" padding="md" style={styles.summaryCard}>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatTotalTime()}</Text>
            <Text style={styles.summaryLabel}>Total Time</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {rounds * exercises.length}
            </Text>
            <Text style={styles.summaryLabel}>Intervals</Text>
          </View>
        </View>

        <Button
          title="Start Workout"
          onPress={handleStart}
          disabled={exercises.length === 0}
          style={styles.startButton}
        />
      </Card>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  preset: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    minWidth: "48%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  presetDetails: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  timeInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeInput: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  stepperText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6366f1",
  },
  timeValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    minWidth: 50,
    textAlign: "center",
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  exerciseName: {
    fontSize: 15,
    color: "#1e293b",
  },
  removeButton: {
    fontSize: 18,
    color: "#94a3b8",
    padding: 4,
  },
  addExercise: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  summaryCard: {
    marginTop: 8,
  },
  summary: {
    flexDirection: "row",
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  startButton: {
    marginTop: 8,
  },
});

export default IntervalSelectScreen;
