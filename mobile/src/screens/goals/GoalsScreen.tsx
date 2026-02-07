import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useGoalStore } from '@/store';
import { GoalCard } from '@/components/goals';
import { EmptyState } from '@/components/common';
import { Goal } from '@/types';
import { ProgressStackScreenProps } from '@/navigation/types';

type TabType = 'active' | 'completed';

export function GoalsScreen({ navigation }: ProgressStackScreenProps<'Goals'>) {
  const { activeGoals, completedGoals, fetchGoals } = useGoalStore();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGoals();
    setIsRefreshing(false);
  };

  const currentGoals = activeTab === 'active' ? activeGoals : completedGoals;

  const renderGoal = ({ item }: { item: Goal }) => (
    <GoalCard
      goal={item}
      onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({activeGoals.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text
            style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}
          >
            Completed ({completedGoals.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      <FlatList
        data={currentGoals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          currentGoals.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={activeTab === 'active' ? 'No active goals' : 'No completed goals'}
            description={
              activeTab === 'active'
                ? 'Set a goal to track your progress'
                : 'Complete your active goals to see them here'
            }
            actionLabel={activeTab === 'active' ? 'Create Goal' : undefined}
            onAction={
              activeTab === 'active' ? () => navigation.navigate('CreateGoal') : undefined
            }
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGoal')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});

export default GoalsScreen;
