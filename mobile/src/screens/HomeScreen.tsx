import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore, useStreakStore, useGoalStore, useSubscriptionStore } from "@/store";
import { Card, Button } from "@/components/common";
import { StreakBadge } from "@/components/streak";
import { GoalProgress } from "@/components/goals";

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { streak, fetchStreak } = useStreakStore();
  const { activeGoals, fetchGoals } = useGoalStore();
  const { fetchSubscription, isPremium } = useSubscriptionStore();

  useEffect(() => {
    fetchStreak();
    fetchGoals();
    fetchSubscription();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || "Yogi"}</Text>
          </View>
          <StreakBadge streak={streak} size="sm" />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate("PracticeTab" as never)}
          >
            <Text style={styles.quickActionIcon}>🧘</Text>
            <Text style={styles.quickActionLabel}>Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate("PracticeTab", {
                screen: "MeditationSelect",
              } as never)
            }
          >
            <Text style={styles.quickActionIcon}>🧘‍♀️</Text>
            <Text style={styles.quickActionLabel}>Meditate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate("ExploreTab" as never)}
          >
            <Text style={styles.quickActionIcon}>🔍</Text>
            <Text style={styles.quickActionLabel}>Explore</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate("ProgressTab", {
                screen: "Favorites",
              } as never)
            }
          >
            <Text style={styles.quickActionIcon}>❤️</Text>
            <Text style={styles.quickActionLabel}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Goal */}
        {activeGoals.length > 0 && (
          <Card variant="elevated" padding="md" style={styles.goalCard}>
            <Text style={styles.cardTitle}>Today's Goal</Text>
            <GoalProgress goal={activeGoals[0]} />
            <Button
              title="View All Goals"
              variant="ghost"
              size="sm"
              onPress={() =>
                navigation.navigate("ProgressTab", { screen: "Goals" } as never)
              }
              style={styles.viewAllButton}
            />
          </Card>
        )}

        {/* Start a Session */}
        <Card variant="elevated" padding="lg" style={styles.sessionCard}>
          <Text style={styles.cardTitle}>Start a Session</Text>

          <TouchableOpacity
            style={styles.sessionOption}
            onPress={() =>
              navigation.navigate("PracticeTab", {
                screen: "ProgramSelect",
              } as never)
            }
          >
            <View style={styles.sessionOptionIcon}>
              <Text style={styles.sessionIcon}>📋</Text>
            </View>
            <View style={styles.sessionOptionInfo}>
              <Text style={styles.sessionOptionTitle}>Follow a Program</Text>
              <Text style={styles.sessionOptionDesc}>
                Guided sequences with timer
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sessionOption}
            onPress={() =>
              navigation.navigate("PracticeTab", {
                screen: "MeditationSelect",
              } as never)
            }
          >
            <View style={styles.sessionOptionIcon}>
              <Text style={styles.sessionIcon}>🧘‍♀️</Text>
            </View>
            <View style={styles.sessionOptionInfo}>
              <Text style={styles.sessionOptionTitle}>Meditation</Text>
              <Text style={styles.sessionOptionDesc}>
                Timer with breathing guide
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sessionOption}
            onPress={() =>
              navigation.navigate("PracticeTab", {
                screen: "IntervalSelect",
              } as never)
            }
          >
            <View style={styles.sessionOptionIcon}>
              <Text style={styles.sessionIcon}>⏱️</Text>
            </View>
            <View style={styles.sessionOptionInfo}>
              <Text style={styles.sessionOptionTitle}>Interval Training</Text>
              <Text style={styles.sessionOptionDesc}>
                Work/rest intervals
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Premium Upsell */}
        {!isPremium() && (
          <Card
            variant="elevated"
            padding="md"
            style={styles.premiumCard}
            onPress={() =>
              navigation.navigate("ProfileTab", {
                screen: "Subscription",
              } as never)
            }
          >
            <View style={styles.premiumContent}>
              <Text style={styles.premiumIcon}>⭐</Text>
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumDesc}>
                  Offline access, unlimited programs & more
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: "#64748b",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quickAction: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "23%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  goalCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  viewAllButton: {
    marginTop: 12,
  },
  sessionCard: {
    marginBottom: 16,
  },
  sessionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sessionOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sessionIcon: {
    fontSize: 24,
  },
  sessionOptionInfo: {
    flex: 1,
  },
  sessionOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
  sessionOptionDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: "#94a3b8",
  },
  premiumCard: {
    backgroundColor: "#6366f1",
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  premiumIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  premiumDesc: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
});

export default HomeScreen;
