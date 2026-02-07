import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PracticeTimer } from '@/components/timer';
import { PracticeStackScreenProps } from '@/navigation/types';

export function PracticeTimerScreen({
  route,
  navigation,
}: PracticeStackScreenProps<'PracticeTimer'>) {
  const { program } = route.params;

  const handleComplete = (totalSeconds: number) => {
    navigation.replace('PracticeComplete', {
      durationSeconds: totalSeconds,
      programId: program.id,
      type: 'practice',
    });
  };

  const handleExit = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <PracticeTimer
        asanas={program.asanas}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PracticeTimerScreen;
