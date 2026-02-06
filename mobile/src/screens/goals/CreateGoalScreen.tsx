import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { useGoalStore } from "@/store";
import { Card, Button } from "@/components/common";
import { Goal } from "@/types";
import { ProgressStackScreenProps } from "@/navigation/types";

type GoalType = Goal["type"];

export function CreateGoalScreen({
  navigation,
}: ProgressStackScreenProps<"CreateGoal">) {
  const { createGoal } = useGoalStore();
  const [type, setType] = useState<GoalType>("practice_days");
  const [target, setTarget] = useState(7);
  const [duration, setDuration] = useState<"week" | "month" | "custom">("week");
  const [isCreating, setIsCreating] = useState(false);

  const goalTypes: Array<{ value: GoalType; label: string; emoji: string }> = [
    { value: "practice_days", label: "Practice Days", emoji: "📅" },
    { value: "duration_minutes", label: "Minutes", emoji: "⏱️" },
    { value: "poses_completed", label: "Poses", emoji: "🧘" },
  ];

  const getTargetOptions = () => {
    switch (type) {
      case "practice_days":
        return duration === "week" ? [3, 5, 7] : [15, 20, 25, 30];
      case "duration_minutes":
        return duration === "week" ? [60, 120, 180] : [300, 500, 750, 1000];
      case "poses_completed":
        return duration === "week" ? [20, 35, 50] : [100, 150, 200, 300];
    }
  };

  const getEndDate = () => {
    const now = new Date();
    switch (duration) {
      case "week":
        return addWeeks(now, 1);
      case "month":
        return addMonths(now, 1);
      default:
        return addWeeks(now, 2);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);

    const startDate = new Date();
    const endDate = getEndDate();

    const success = await createGoal({
      type,
      target,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    setIsCreating(false);

    if (success) {
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Goal Type */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>What do you want to track?</Text>
        <View style={styles.typeOptions}>
          {goalTypes.map((goalType) => (
            <TouchableOpacity
              key={goalType.value}
              style={[
                styles.typeOption,
                type === goalType.value && styles.typeOptionSelected,
              ]}
              onPress={() => setType(goalType.value)}
            >
              <Text style={styles.typeEmoji}>{goalType.emoji}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  type === goalType.value && styles.typeLabelSelected,
                ]}
              >
                {goalType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Duration */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Time Period</Text>
        <View style={styles.durationOptions}>
          <TouchableOpacity
            style={[
              styles.durationOption,
              duration === "week" && styles.durationOptionSelected,
            ]}
            onPress={() => setDuration("week")}
          >
            <Text
              style={[
                styles.durationText,
                duration === "week" && styles.durationTextSelected,
              ]}
            >
              1 Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.durationOption,
              duration === "month" && styles.durationOptionSelected,
            ]}
            onPress={() => setDuration("month")}
          >
            <Text
              style={[
                styles.durationText,
                duration === "month" && styles.durationTextSelected,
              ]}
            >
              1 Month
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Target */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Your Target</Text>
        <View style={styles.targetOptions}>
          {getTargetOptions().map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.targetOption,
                target === value && styles.targetOptionSelected,
              ]}
              onPress={() => setTarget(value)}
            >
              <Text
                style={[
                  styles.targetValue,
                  target === value && styles.targetValueSelected,
                ]}
              >
                {value}
              </Text>
              <Text
                style={[
                  styles.targetUnit,
                  target === value && styles.targetUnitSelected,
                ]}
              >
                {type === "practice_days"
                  ? "days"
                  : type === "duration_minutes"
                  ? "min"
                  : "poses"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Summary */}
      <Card variant="elevated" padding="lg" style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Goal Summary</Text>
        <Text style={styles.summaryText}>
          {type === "practice_days"
            ? `Practice ${target} days`
            : type === "duration_minutes"
            ? `Practice for ${target} minutes`
            : `Complete ${target} poses`}
        </Text>
        <Text style={styles.summaryDates}>
          {format(new Date(), "MMM d")} - {format(getEndDate(), "MMM d, yyyy")}
        </Text>

        <Button
          title="Create Goal"
          onPress={handleCreate}
          loading={isCreating}
          style={styles.createButton}
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  typeOptions: {
    flexDirection: "row",
    gap: 12,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  typeOptionSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  typeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  typeLabelSelected: {
    color: "#fff",
  },
  durationOptions: {
    flexDirection: "row",
    gap: 12,
  },
  durationOption: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  durationOptionSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  durationText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#475569",
  },
  durationTextSelected: {
    color: "#fff",
  },
  targetOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  targetOption: {
    minWidth: "22%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  targetOptionSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  targetValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  targetValueSelected: {
    color: "#fff",
  },
  targetUnit: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  targetUnitSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  summaryCard: {
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  summaryDates: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  createButton: {
    marginTop: 8,
  },
});

export default CreateGoalScreen;
