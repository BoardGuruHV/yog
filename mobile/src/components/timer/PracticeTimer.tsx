import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ProgramAsana, TimerState } from '@/types';
import { PracticeTimerEngine, formatTime } from '@/services/timer/engine';
import { soundPlayer } from '@/services/audio/soundPlayer';
import { AsanaSvg, AsanaSvgPlaceholder } from '@/components/asana';

interface PracticeTimerProps {
  asanas: ProgramAsana[];
  onComplete: (totalSeconds: number) => void;
  onExit: () => void;
}

export function PracticeTimer({ asanas, onComplete, onExit }: PracticeTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>({
    status: 'idle',
    currentPoseIndex: 0,
    poseTimeRemaining: asanas[0]?.duration || 0,
    totalTimeRemaining: 0,
    totalTimeElapsed: 0,
  });
  const [showTransition, setShowTransition] = useState(false);
  const [nextPoseIndex, setNextPoseIndex] = useState(0);

  const engineRef = useRef<PracticeTimerEngine | null>(null);

  useEffect(() => {
    const engine = new PracticeTimerEngine(asanas, {
      onTick: (state) => setTimerState(state),
      onPoseChange: (_index, _isLast) => {
        setShowTransition(false);
        soundPlayer.playTransitionBell();
      },
      onTransitionStart: (nextIndex) => {
        setNextPoseIndex(nextIndex);
        setShowTransition(true);
        soundPlayer.playTransitionBell();
      },
      onComplete: () => {
        soundPlayer.playCompletionSound();
        onComplete(timerState.totalTimeElapsed);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asanas]);

  const currentPose = asanas[timerState.currentPoseIndex];
  const nextPose = asanas[timerState.currentPoseIndex + 1];

  const progress = currentPose
    ? 1 - timerState.poseTimeRemaining / currentPose.duration
    : 0;

  const handlePlayPause = () => {
    engineRef.current?.toggle();
  };

  const handleSkipNext = () => {
    engineRef.current?.skipToNext();
  };

  const handleSkipPrevious = () => {
    engineRef.current?.skipToPrevious();
  };

  if (timerState.status === 'completed') {
    return null; // Parent handles completion screen
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit}>
          <Text style={styles.exitButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.poseCounter}>
          {timerState.currentPoseIndex + 1} / {asanas.length}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Transition Overlay */}
      {showTransition && (
        <View style={styles.transitionOverlay}>
          <Text style={styles.transitionText}>Next Up</Text>
          <Text style={styles.transitionPoseName}>
            {asanas[nextPoseIndex]?.asana?.nameEnglish || 'Next Pose'}
          </Text>
        </View>
      )}

      {/* Pose Display */}
      <View style={styles.poseContainer}>
        {currentPose?.asana?.svgPath ? (
          <AsanaSvg
            svgPath={currentPose.asana.svgPath}
            width={screenWidth - 80}
            height={screenWidth - 80}
          />
        ) : (
          <AsanaSvgPlaceholder width={screenWidth - 80} height={screenWidth - 80} />
        )}
      </View>

      {/* Pose Info */}
      <View style={styles.poseInfo}>
        <Text style={styles.poseName}>
          {currentPose?.asana?.nameEnglish || 'Loading...'}
        </Text>
        <Text style={styles.poseSanskrit}>{currentPose?.asana?.nameSanskrit}</Text>
        {currentPose?.notes && <Text style={styles.poseNotes}>{currentPose.notes}</Text>}
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <Text style={styles.timeDisplay}>{formatTime(timerState.poseTimeRemaining)}</Text>

        <Text style={styles.totalTime}>
          Total: {formatTime(timerState.totalTimeRemaining)}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleSkipPrevious}
          disabled={timerState.currentPoseIndex === 0}
        >
          <Text
            style={[
              styles.controlIcon,
              timerState.currentPoseIndex === 0 && styles.controlIconDisabled,
            ]}
          >
            ⏮
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
          <Text style={styles.playPauseIcon}>
            {timerState.status === 'playing' ? '⏸' : '▶️'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleSkipNext}>
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Next Pose Preview */}
      {nextPose && (
        <View style={styles.nextPosePreview}>
          <Text style={styles.nextPoseLabel}>Up Next:</Text>
          <Text style={styles.nextPoseName}>
            {nextPose.asana?.nameEnglish || 'Loading...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  exitButton: {
    fontSize: 24,
    color: '#fff',
  },
  poseCounter: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(99, 102, 241, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  transitionText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  transitionPoseName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  poseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  poseInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  poseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  poseSanskrit: {
    fontSize: 18,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  poseNotes: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  timeDisplay: {
    fontSize: 64,
    fontWeight: '300',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  totalTime: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginBottom: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 28,
  },
  controlIconDisabled: {
    opacity: 0.3,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    fontSize: 36,
  },
  nextPosePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 8,
  },
  nextPoseLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  nextPoseName: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
});

export default PracticeTimer;
