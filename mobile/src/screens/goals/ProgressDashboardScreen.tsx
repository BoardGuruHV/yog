import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useStreakStore, useGoalStore } from "@/store";
import { Card } from "@/components/common";
import { StreakBadge, StreakStats } from "@/components/streak";
import { GoalCard } from "@/components/goals";
import { ProgressStackScreenProps } from "@/navigation/types";

export function ProgressDashboardScreen({
  navigation,
}: ProgressStackScreenProps<"ProgressDashboard">) {
  const { streak, practiceHistory, fetchStreak, fetchPracticeHistory } =
    useStreakStore();
  const { activeGoals, completedGoals, fetchGoals } = useGoalStore();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useEffect(() => {
    fetchStreak();
    fetchPracticeHistory();
    fetchGoals();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStreak(), fetchPracticeHistory(), fetchGoals()]);
    setIsRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#6366f1"
        />
      }
    >
      {/* Streak Section */}
      <TouchableOpacity onPress={() => navigation.navigate("Streaks")}>
        <Card variant="elevated" padding="lg" style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.sectionTitle}>Your Streak</Text>
            <Text style={styles.viewAll}>View Details ›</Text>
          </View>
          <View style={styles.streakContent}>
            <StreakBadge streak={streak} size="lg" />
          </View>
          <StreakStats streak={streak} />
        </Card>
      </TouchableOpacity>

      {/* Active Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Goals")}>
            <Text style={styles.viewAll}>View All ›</Text>
          </TouchableOpacity>
        </View>

        {activeGoals.length === 0 ? (
          <Card variant="outlined" padding="md" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate("CreateGoal")}>
              <Text style={styles.createGoalLink}>Create your first goal</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          activeGoals
            .slice(0, 2)
            .map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={() =>
                  navigation.navigate("GoalDetail", { goalId: goal.id })
                }
              />
            ))
        )}
      </View>

      {/* Quick Stats */}
      <Card variant="outlined" padding="md" style={styles.statsCard}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>
              {practiceHistory.filter((p) => {
                const date = new Date(p.completedAt);
                const now = new Date();
                return (
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                );
              }).length}
            </Text>
            <Text style={styles.quickStatLabel}>Sessions</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>
              {Math.round(
                practiceHistory
                  .filter((p) => {
                    const date = new Date(p.completedAt);
                    const now = new Date();
                    return (
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear()
                    );
                  })
                  .reduce((sum, p) => sum + p.durationSeconds, 0) / 60
              )}
            </Text>
            <Text style={styles.quickStatLabel}>Minutes</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>
              {completedGoals.filter((g) => {
                const date = new Date(g.updatedAt);
                const now = new Date();
                return (
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                );
              }).length}
            </Text>
            <Text style={styles.quickStatLabel}>Goals Met</Text>
          </View>
        </View>
      </Card>

      {/* Favorites Link */}
      <TouchableOpacity
        style={styles.favoritesLink}
        onPress={() => navigation.navigate("Favorites")}
      >
        <Card variant="elevated" padding="md">
          <View style={styles.linkContent}>
            <Text style={styles.linkIcon}>❤️</Text>
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>Favorite Poses</Text>
              <Text style={styles.linkDescription}>
                Quick access to your saved poses
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </Card>
      </TouchableOpacity>
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
  streakCard: {
    marginBottom: 24,
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  streakContent: {
    alignItems: "center",
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  viewAll: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "500",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 8,
  },
  createGoalLink: {
    fontSize: 15,
    color: "#6366f1",
    fontWeight: "500",
  },
  statsCard: {
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: "row",
    marginTop: 16,
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
  },
  quickStatValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
  },
  quickStatLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  favoritesLink: {
    marginTop: 8,
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
  linkDescription: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: "#94a3b8",
  },
});

export default ProgressDashboardScreen;
