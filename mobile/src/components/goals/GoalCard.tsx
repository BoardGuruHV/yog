import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Goal } from "@/types";
import { format, differenceInDays, isPast } from "date-fns";
import { Card, Badge } from "@/components/common";

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const daysLeft = differenceInDays(new Date(goal.endDate), new Date());
  const isExpired = isPast(new Date(goal.endDate));

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

  const getGoalIcon = (type: Goal["type"]) => {
    switch (type) {
      case "practice_days":
        return "📅";
      case "duration_minutes":
        return "⏱️";
      case "poses_completed":
        return "🧘";
    }
  };

  const getStatusBadge = () => {
    if (goal.completed) {
      return <Badge label="Completed" variant="success" size="sm" />;
    }
    if (isExpired) {
      return <Badge label="Expired" variant="error" size="sm" />;
    }
    if (daysLeft <= 3) {
      return <Badge label={`${daysLeft}d left`} variant="warning" size="sm" />;
    }
    return <Badge label={`${daysLeft}d left`} variant="info" size="sm" />;
  };

  return (
    <Card
      onPress={onPress}
      variant="elevated"
      padding="md"
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{getGoalIcon(goal.type)}</Text>
          <Text style={styles.typeLabel}>{getGoalTypeLabel(goal.type)}</Text>
        </View>
        {getStatusBadge()}
      </View>

      <View style={styles.progressSection}>
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
      </View>

      <View style={styles.footer}>
        <Text style={styles.dateRange}>
          {format(new Date(goal.startDate), "MMM d")} -{" "}
          {format(new Date(goal.endDate), "MMM d, yyyy")}
        </Text>
      </View>
    </Card>
  );
}

interface GoalProgressProps {
  goal: Goal;
}

export function GoalProgress({ goal }: GoalProgressProps) {
  const progress = Math.min((goal.current / goal.target) * 100, 100);

  return (
    <View style={styles.miniProgress}>
      <View style={styles.miniProgressBar}>
        <View
          style={[
            styles.miniProgressFill,
            { width: `${progress}%` },
            goal.completed && styles.progressCompleted,
          ]}
        />
      </View>
      <Text style={styles.miniProgressText}>
        {goal.current}/{goal.target}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
  },
  targetValue: {
    fontSize: 18,
    fontWeight: "500",
    color: "#94a3b8",
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 4,
  },
  progressCompleted: {
    backgroundColor: "#22c55e",
  },
  progressPercent: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  dateRange: {
    fontSize: 12,
    color: "#94a3b8",
  },

  // Mini progress
  miniProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 2,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 2,
  },
  miniProgressText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});

export default GoalCard;
