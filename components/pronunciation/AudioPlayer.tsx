"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Syllable } from "./SyllableBreakdown";

interface AudioPlayerProps {
  text: string;
  syllables: Syllable[];
  audioPath?: string | null;
  onSyllableChange?: (index: number) => void;
  onComplete?: () => void;
}

export default function AudioPlayer({
  text,
  syllables,
  audioPath,
  onSyllableChange,
  onComplete,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.8); // Slower for learning
  const [isSupported, setIsSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const syllableTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setIsSupported(false);
    }

    return () => {
      // Cleanup
      if (syllableTimeoutRef.current) {
        clearTimeout(syllableTimeoutRef.current);
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const animateSyllables = useCallback(() => {
    if (syllables.length === 0) return;

    // Estimate syllable duration based on playback rate
    const baseDuration = 400; // ms per syllable at normal speed
    const syllableDuration = baseDuration / playbackRate;

    let currentIndex = 0;

    const showNextSyllable = () => {
      if (currentIndex < syllables.length) {
        onSyllableChange?.(currentIndex);
        currentIndex++;
        syllableTimeoutRef.current = setTimeout(showNextSyllable, syllableDuration);
      } else {
        onSyllableChange?.(-1);
        onComplete?.();
      }
    };

    showNextSyllable();
  }, [syllables, playbackRate, onSyllableChange, onComplete]);

  const playWithSpeechSynthesis = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackRate;
    utterance.pitch = 1;
    utterance.volume = isMuted ? 0 : 1;

    // Try to find a good voice for Sanskrit-like pronunciation
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("hi") || // Hindi
        v.lang.startsWith("en-IN") || // Indian English
        v.lang.startsWith("en-GB") // British English as fallback
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      animateSyllables();
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, playbackRate, isMuted, animateSyllables]);

  const playAudio = useCallback(() => {
    if (audioPath && audioRef.current) {
      // Use audio file if available
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.muted = isMuted;
      audioRef.current.play();
      setIsPlaying(true);
      animateSyllables();
    } else {
      // Fall back to speech synthesis
      playWithSpeechSynthesis();
    }
  }, [audioPath, playbackRate, isMuted, animateSyllables, playWithSpeechSynthesis]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (syllableTimeoutRef.current) {
      clearTimeout(syllableTimeoutRef.current);
    }
    setIsPlaying(false);
    onSyllableChange?.(-1);
  }, [onSyllableChange]);

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const handleReplay = () => {
    stopAudio();
    setTimeout(playAudio, 100);
  };

  if (!isSupported && !audioPath) {
    return (
      <div className="text-sm text-gray-500 text-center py-2">
        Audio pronunciation not available in your browser
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Audio element for custom audio files */}
      {audioPath && (
        <audio
          ref={audioRef}
          src={audioPath}
          onEnded={() => {
            setIsPlaying(false);
            onComplete?.();
          }}
        />
      )}

      {/* Main Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`
            p-4 rounded-full transition-all duration-200 shadow-lg
            ${isPlaying
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
            }
          `}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>

        {/* Replay Button */}
        <button
          onClick={handleReplay}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Replay"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Mute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Speed:</span>
        <div className="flex gap-1">
          {[0.5, 0.8, 1.0].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`
                px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${playbackRate === rate
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-100"
                }
              `}
            >
              {rate === 0.5 ? "Slow" : rate === 0.8 ? "Normal" : "Fast"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
