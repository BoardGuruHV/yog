import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useStreakStore } from '@/store';
import { Card } from '@/components/common';
import { StreakBadge, StreakStats, StreakCalendar } from '@/components/streak';

export function StreaksScreen() {
  const { streak, practiceHistory, fetchStreak, fetchPracticeHistory } = useStreakStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStreak();
    fetchPracticeHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStreak(), fetchPracticeHistory()]);
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
      {/* Current Streak */}
      <Card variant="elevated" padding="lg" style={styles.streakCard}>
        <Text style={styles.sectionTitle}>Your Streak</Text>
        <View style={styles.streakDisplay}>
          <StreakBadge streak={streak} size="lg" />
        </View>
        <StreakStats streak={streak} />
      </Card>

      {/* Calendar */}
      <Card variant="elevated" padding="none" style={styles.calendarCard}>
        <StreakCalendar practiceLogs={practiceHistory} />
      </Card>

      {/* Milestones */}
      <Card variant="outlined" padding="md" style={styles.milestonesCard}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.milestones}>
          <MilestoneItem
            days={7}
            label="Week Warrior"
            emoji="🌟"
            achieved={(streak?.longestStreak || 0) >= 7}
          />
          <MilestoneItem
            days={30}
            label="Monthly Master"
            emoji="🏆"
            achieved={(streak?.longestStreak || 0) >= 30}
          />
          <MilestoneItem
            days={100}
            label="Century Yogi"
            emoji="💯"
            achieved={(streak?.longestStreak || 0) >= 100}
          />
          <MilestoneItem
            days={365}
            label="Year of Yoga"
            emoji="👑"
            achieved={(streak?.longestStreak || 0) >= 365}
          />
        </View>
      </Card>

      {/* Tips */}
      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Tips to maintain your streak</Text>
        <Text style={styles.tip}>• Set a daily reminder</Text>
        <Text style={styles.tip}>• Start with short sessions</Text>
        <Text style={styles.tip}>• Practice at the same time each day</Text>
        <Text style={styles.tip}>• Even 5 minutes counts!</Text>
      </View>
    </ScrollView>
  );
}

interface MilestoneItemProps {
  days: number;
  label: string;
  emoji: string;
  achieved: boolean;
}

function MilestoneItem({ days, label, emoji, achieved }: MilestoneItemProps) {
  return (
    <View style={[styles.milestone, achieved && styles.milestoneAchieved]}>
      <Text style={styles.milestoneEmoji}>{achieved ? emoji : '🔒'}</Text>
      <View style={styles.milestoneInfo}>
        <Text style={[styles.milestoneLabel, achieved && styles.milestoneLabelAchieved]}>
          {label}
        </Text>
        <Text style={styles.milestoneDays}>{days} days</Text>
      </View>
      {achieved && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  streakCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  streakDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarCard: {
    marginBottom: 16,
  },
  milestonesCard: {
    marginBottom: 16,
  },
  milestones: {
    gap: 12,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  milestoneAchieved: {
    backgroundColor: '#dcfce7',
  },
  milestoneEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
  },
  milestoneLabelAchieved: {
    color: '#166534',
  },
  milestoneDays: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: '#22c55e',
    fontWeight: '700',
  },
  tips: {
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 6,
  },
});

export default StreaksScreen;
