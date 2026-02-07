import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStreakStore } from '@/store';
import { Card, Button } from '@/components/common';
import { StreakBadge } from '@/components/streak';
import { PracticeStackScreenProps } from '@/navigation/types';

export function PracticeCompleteScreen({
  route,
  navigation,
}: PracticeStackScreenProps<'PracticeComplete'>) {
  const { durationSeconds, programId, type } = route.params;
  const { streak, logPractice, fetchStreak } = useStreakStore();
  const [, setIsLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    handleLogPractice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogPractice = async () => {
    if (logged) {
      return;
    }

    setIsLogging(true);
    await logPractice({
      programId,
      durationSeconds,
    });
    await fetchStreak();
    setLogged(true);
    setIsLogging(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`;
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'practice':
        return 'Practice Complete!';
      case 'meditation':
        return 'Meditation Complete!';
      case 'interval':
        return 'Workout Complete!';
    }
  };

  const getTypeEmoji = () => {
    switch (type) {
      case 'practice':
        return '🧘';
      case 'meditation':
        return '🧘‍♀️';
      case 'interval':
        return '💪';
    }
  };

  const handleDone = () => {
    navigation.popToTop();
  };

  const handleViewProgress = () => {
    navigation.navigate('PracticeHome');
    // Navigate to progress tab
    navigation.getParent()?.navigate('ProgressTab');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Celebration */}
        <View style={styles.celebration}>
          <Text style={styles.celebrationEmoji}>{getTypeEmoji()}</Text>
          <Text style={styles.title}>{getTypeTitle()}</Text>
          <Text style={styles.subtitle}>Great job! Keep up the momentum.</Text>
        </View>

        {/* Stats */}
        <Card variant="elevated" padding="lg" style={styles.statsCard}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatDuration(durationSeconds)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          </View>
        </Card>

        {/* Streak */}
        <Card variant="elevated" padding="lg" style={styles.streakCard}>
          <Text style={styles.streakTitle}>Your Streak</Text>
          <View style={styles.streakContent}>
            <StreakBadge streak={streak} size="lg" />
          </View>
          {streak && streak.currentStreak > 0 && (
            <Text style={styles.streakMessage}>
              {streak.currentStreak === 1
                ? "You've started a new streak! Keep it going!"
                : `${streak.currentStreak} days strong! Don't break the chain!`}
            </Text>
          )}
        </Card>

        {/* Motivation */}
        <View style={styles.motivation}>
          <Text style={styles.motivationText}>
            "The body benefits from movement, and the mind benefits from stillness."
          </Text>
          <Text style={styles.motivationAuthor}>— Sakyong Mipham</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button title="Done" onPress={handleDone} style={styles.doneButton} />
          <Button title="View Progress" variant="outline" onPress={handleViewProgress} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
  },
  celebration: {
    alignItems: 'center',
    marginBottom: 32,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsCard: {
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  streakCard: {
    marginBottom: 24,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  streakContent: {
    alignItems: 'center',
  },
  streakMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
  },
  motivation: {
    alignItems: 'center',
    marginBottom: 32,
  },
  motivationText: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  motivationAuthor: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  actions: {
    gap: 12,
  },
  doneButton: {
    marginBottom: 4,
  },
});

export default PracticeCompleteScreen;
