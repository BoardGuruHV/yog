import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { getPrograms } from '@/api/endpoints/programs';
import { Program } from '@/types';
import { Card, Loading, EmptyState, Badge } from '@/components/common';
import { PracticeStackScreenProps } from '@/navigation/types';

export function ProgramSelectScreen({
  navigation,
}: PracticeStackScreenProps<'ProgramSelect'>) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProgramsData = async () => {
    const response = await getPrograms();
    if (response.success && response.data) {
      setPrograms(response.data.programs);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProgramsData().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProgramsData();
    setIsRefreshing(false);
  };

  const handleProgramSelect = (program: Program) => {
    navigation.navigate('PracticeTimer', { program });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const renderProgram = ({ item }: { item: Program }) => (
    <Card
      variant="elevated"
      padding="md"
      style={styles.programCard}
      onPress={() => handleProgramSelect(item)}
    >
      <View style={styles.programHeader}>
        <Text style={styles.programName}>{item.name}</Text>
        <Badge label={formatDuration(item.totalDuration)} variant="info" size="sm" />
      </View>

      {item.description && (
        <Text style={styles.programDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.programMeta}>
        <Text style={styles.poseCount}>
          {item.asanas.length} pose{item.asanas.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Card>
  );

  if (isLoading) {
    return <Loading fullScreen message="Loading programs..." />;
  }

  if (programs.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No programs yet"
          description="Create your first program in the web app to start practicing"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={programs}
        renderItem={renderProgram}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#6366f1"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  list: {
    padding: 16,
  },
  programCard: {
    marginBottom: 12,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  programName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  programDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  programMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  poseCount: {
    fontSize: 14,
    color: '#94a3b8',
  },
  chevron: {
    fontSize: 24,
    color: '#94a3b8',
  },
});

export default ProgramSelectScreen;
