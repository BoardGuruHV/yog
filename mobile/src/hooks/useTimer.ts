import { useState, useEffect, useRef, useCallback } from 'react';
import { ProgramAsana, TimerState } from '@/types';
import { PracticeTimerEngine, TimerCallbacks } from '@/services/timer/engine';
import { soundPlayer } from '@/services/audio/soundPlayer';

interface UseTimerOptions {
  asanas: ProgramAsana[];
  onComplete?: () => void;
  playAudio?: boolean;
}

interface UseTimerReturn {
  state: TimerState;
  currentPose: ProgramAsana | null;
  nextPose: ProgramAsana | null;
  totalPoses: number;
  isTransitioning: boolean;
  nextPoseIndex: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  goToPose: (index: number) => void;
  reset: () => void;
}

export function useTimer({
  asanas,
  onComplete,
  playAudio = true,
}: UseTimerOptions): UseTimerReturn {
  const [state, setState] = useState<TimerState>({
    status: 'idle',
    currentPoseIndex: 0,
    poseTimeRemaining: asanas[0]?.duration || 0,
    totalTimeRemaining: 0,
    totalTimeElapsed: 0,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPoseIndex, setNextPoseIndex] = useState(0);

  const engineRef = useRef<PracticeTimerEngine | null>(null);

  useEffect(() => {
    const callbacks: TimerCallbacks = {
      onTick: (newState) => setState(newState),
      onPoseChange: (_index, _isLast) => {
        setIsTransitioning(false);
        if (playAudio) {
          soundPlayer.playTransitionBell();
        }
      },
      onTransitionStart: (nextIndex) => {
        setNextPoseIndex(nextIndex);
        setIsTransitioning(true);
        if (playAudio) {
          soundPlayer.playTransitionBell();
        }
      },
      onComplete: () => {
        if (playAudio) {
          soundPlayer.playCompletionSound();
        }
        onComplete?.();
      },
    };

    engineRef.current = new PracticeTimerEngine(asanas, callbacks);

    return () => {
      engineRef.current?.destroy();
    };
  }, [asanas, playAudio, onComplete]);

  const start = useCallback(() => engineRef.current?.start(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const resume = useCallback(() => engineRef.current?.resume(), []);
  const toggle = useCallback(() => engineRef.current?.toggle(), []);
  const skipToNext = useCallback(() => engineRef.current?.skipToNext(), []);
  const skipToPrevious = useCallback(() => engineRef.current?.skipToPrevious(), []);
  const goToPose = useCallback((index: number) => engineRef.current?.goToPose(index), []);
  const reset = useCallback(() => engineRef.current?.reset(), []);

  return {
    state,
    currentPose:
      engineRef.current?.getCurrentPose() || asanas[state.currentPoseIndex] || null,
    nextPose:
      engineRef.current?.getNextPose() || asanas[state.currentPoseIndex + 1] || null,
    totalPoses: asanas.length,
    isTransitioning,
    nextPoseIndex,
    start,
    pause,
    resume,
    toggle,
    skipToNext,
    skipToPrevious,
    goToPose,
    reset,
  };
}

export default useTimer;
