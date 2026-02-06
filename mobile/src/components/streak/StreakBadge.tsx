import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Streak } from "@/types";

interface StreakBadgeProps {
  streak: Streak | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StreakBadge({
  streak,
  size = "md",
  showLabel = true,
}: StreakBadgeProps) {
  const currentStreak = streak?.currentStreak || 0;

  // Determine badge style based on streak length
  const getBadgeStyle = () => {
    if (currentStreak >= 365) return styles.legendaryBadge;
    if (currentStreak >= 100) return styles.masterBadge;
    if (currentStreak >= 30) return styles.expertBadge;
    if (currentStreak >= 7) return styles.consistentBadge;
    return styles.defaultBadge;
  };

  const getFireEmoji = () => {
    if (currentStreak >= 365) return "🔥🔥🔥";
    if (currentStreak >= 100) return "🔥🔥";
    if (currentStreak >= 7) return "🔥";
    return "✨";
  };

  const sizeStyles = {
    sm: {
      container: styles.smContainer,
      number: styles.smNumber,
      label: styles.smLabel,
    },
    md: {
      container: styles.mdContainer,
      number: styles.mdNumber,
      label: styles.mdLabel,
    },
    lg: {
      container: styles.lgContainer,
      number: styles.lgNumber,
      label: styles.lgLabel,
    },
  };

  return (
    <View style={[styles.container, sizeStyles[size].container, getBadgeStyle()]}>
      <Text style={styles.emoji}>{getFireEmoji()}</Text>
      <Text style={[styles.number, sizeStyles[size].number]}>{currentStreak}</Text>
      {showLabel && (
        <Text style={[styles.label, sizeStyles[size].label]}>
          day{currentStreak !== 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );
}

interface StreakStatsProps {
  streak: Streak | null;
}

export function StreakStats({ streak }: StreakStatsProps) {
  if (!streak) return null;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{streak.currentStreak}</Text>
        <Text style={styles.statLabel}>Current</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{streak.longestStreak}</Text>
        <Text style={styles.statLabel}>Longest</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{streak.totalPracticeDays}</Text>
        <Text style={styles.statLabel}>Total Days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  defaultBadge: {
    backgroundColor: "#f1f5f9",
  },
  consistentBadge: {
    backgroundColor: "#fef3c7",
  },
  expertBadge: {
    backgroundColor: "#fed7aa",
  },
  masterBadge: {
    backgroundColor: "#fecaca",
  },
  legendaryBadge: {
    backgroundColor: "#fde68a",
  },
  emoji: {
    marginBottom: 4,
  },
  number: {
    fontWeight: "700",
    color: "#1e293b",
  },
  label: {
    color: "#64748b",
    fontWeight: "500",
  },

  // Size variants
  smContainer: {
    padding: 8,
    minWidth: 50,
  },
  smNumber: {
    fontSize: 18,
  },
  smLabel: {
    fontSize: 10,
  },

  mdContainer: {
    padding: 16,
    minWidth: 80,
  },
  mdNumber: {
    fontSize: 28,
  },
  mdLabel: {
    fontSize: 12,
  },

  lgContainer: {
    padding: 24,
    minWidth: 120,
  },
  lgNumber: {
    fontSize: 48,
  },
  lgLabel: {
    fontSize: 16,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0",
  },
});

export default StreakBadge;
