import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { format, differenceInDays } from "date-fns";
import { useGoalStore } from "@/store";
import { Card, Button, Badge, Loading } from "@/components/common";
import { Goal } from "@/types";
import { ProgressStackScreenProps } from "@/navigation/types";

export function GoalDetailScreen({
  route,
  navigation,
}: ProgressStackScreenProps<"GoalDetail">) {
  const { goalId } = route.params;
  const { fetchGoalById, deleteGoal, selectedGoal } = useGoalStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchGoalById(goalId).finally(() => setIsLoading(false));
  }, [goalId]);

  const goal = selectedGoal;

  const handleDelete = () => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            await deleteGoal(goalId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading goal..." />;
  }

  if (!goal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Goal not found</Text>
      </View>
    );
  }

  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const daysLeft = differenceInDays(new Date(goal.endDate), new Date());
  const totalDays = differenceInDays(
    new Date(goal.endDate),
    new Date(goal.startDate)
  );
  const daysPassed = totalDays - daysLeft;

  const getGoalTypeLabel = (type: Goal["type"]) => {
    switch (type) {
      case "practice_days":
        return "Practice Days";
      case "duration_minutes":
        return "Minutes Practiced";
      case "poses_completed":
        return "Poses Completed";
    }
  };

  const getGoalTypeIcon = (type: Goal["type"]) => {
    switch (type) {
      case "practice_days":
        return "📅";
      case "duration_minutes":
        return "⏱️";
      case "poses_completed":
        return "🧘";
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{getGoalTypeIcon(goal.type)}</Text>
        <Text style={styles.typeLabel}>{getGoalTypeLabel(goal.type)}</Text>
        {goal.completed ? (
          <Badge label="Completed" variant="success" />
        ) : daysLeft < 0 ? (
          <Badge label="Expired" variant="error" />
        ) : daysLeft <= 3 ? (
          <Badge label={`${daysLeft} days left`} variant="warning" />
        ) : null}
      </View>

      {/* Progress Card */}
      <Card variant="elevated" padding="lg" style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.currentValue}>{goal.current}</Text>
          <Text style={styles.targetValue}>/ {goal.target}</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              goal.completed && styles.progressCompleted,
            ]}
          />
        </View>

        <Text style={styles.progressPercent}>
          {Math.round(progress)}% complete
        </Text>
      </Card>

      {/* Timeline */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>

        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Start</Text>
            <Text style={styles.timelineValue}>
              {format(new Date(goal.startDate), "MMM d, yyyy")}
            </Text>
          </View>
          <View style={styles.timelineDivider}>
            <View style={styles.timelineProgress}>
              <View
                style={[
                  styles.timelineProgressFill,
                  { width: `${Math.min((daysPassed / totalDays) * 100, 100)}%` },
                ]}
              />
            </View>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>End</Text>
            <Text style={styles.timelineValue}>
              {format(new Date(goal.endDate), "MMM d, yyyy")}
            </Text>
          </View>
        </View>

        <View style={styles.daysInfo}>
          <View style={styles.daysItem}>
            <Text style={styles.daysValue}>{daysPassed}</Text>
            <Text style={styles.daysLabel}>Days Passed</Text>
          </View>
          <View style={styles.daysItem}>
            <Text style={styles.daysValue}>{Math.max(0, daysLeft)}</Text>
            <Text style={styles.daysLabel}>Days Left</Text>
          </View>
        </View>
      </Card>

      {/* Required Pace */}
      {!goal.completed && daysLeft > 0 && (
        <Card variant="outlined" padding="md" style={styles.section}>
          <Text style={styles.sectionTitle}>To Reach Your Goal</Text>
          <Text style={styles.paceText}>
            You need{" "}
            <Text style={styles.paceHighlight}>
              {Math.ceil((goal.target - goal.current) / daysLeft)}
            </Text>{" "}
            {goal.type === "practice_days"
              ? "practice sessions"
              : goal.type === "duration_minutes"
              ? "minutes"
              : "poses"}{" "}
            per day
          </Text>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Delete Goal"
          variant="outline"
          onPress={handleDelete}
          loading={isDeleting}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 16,
  },
  currentValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#1e293b",
  },
  targetValue: {
    fontSize: 24,
    fontWeight: "500",
    color: "#94a3b8",
    marginLeft: 4,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 6,
  },
  progressCompleted: {
    backgroundColor: "#22c55e",
  },
  progressPercent: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
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
  timeline: {
    flexDirection: "row",
    alignItems: "center",
  },
  timelineItem: {
    alignItems: "center",
  },
  timelineLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  timelineDivider: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timelineProgress: {
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
  },
  timelineProgressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 2,
  },
  daysInfo: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  daysItem: {
    flex: 1,
    alignItems: "center",
  },
  daysValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  daysLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  paceText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
  },
  paceHighlight: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6366f1",
  },
  actions: {
    marginTop: 16,
  },
  deleteButton: {
    borderColor: "#ef4444",
  },
  deleteButtonText: {
    color: "#ef4444",
  },
});

export default GoalDetailScreen;
