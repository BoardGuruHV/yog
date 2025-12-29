"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Settings,
  Volume2,
  VolumeX,
  X,
  RotateCcw,
} from "lucide-react";
import {
  VoiceSettings as VoiceSettingsType,
  DEFAULT_VOICE_SETTINGS,
  speak,
  stopSpeaking,
} from "@/lib/voice/speech";
import {
  generateSessionScript,
  SessionScript,
  getCountdownAnnouncement,
} from "@/lib/voice/scripts";
import VoiceSettings from "./VoiceSettings";

interface ProgramAsana {
  id: string;
  asanaId: string;
  duration: number;
  order: number;
  asana: {
    id: string;
    nameEnglish: string;
    nameSanskrit: string;
    category: string;
    svgPath: string;
  };
}

interface GuidedSessionProps {
  programName: string;
  asanas: ProgramAsana[];
  onClose: () => void;
}

type SessionPhase = "welcome" | "pose" | "transition" | "closing" | "complete";

export default function GuidedSession({
  programName,
  asanas,
  onClose,
}: GuidedSessionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("welcome");
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsType>(
    DEFAULT_VOICE_SETTINGS
  );
  const [showSettings, setShowSettings] = useState(false);
  const [sessionScript, setSessionScript] = useState<SessionScript | null>(null);
  const [currentInstruction, setCurrentInstruction] = useState("");
  const [holdCueIndex, setHoldCueIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnnouncedTime = useRef<number>(-1);

  // Generate session script on mount
  useEffect(() => {
    const poses = asanas.map((pa) => ({
      englishName: pa.asana.nameEnglish,
      sanskritName: pa.asana.nameSanskrit,
      category: pa.asana.category,
      duration: pa.duration,
    }));

    const script = generateSessionScript(programName, poses);
    setSessionScript(script);
  }, [asanas, programName]);

  // Speak function with mute check
  const speakText = useCallback(
    async (text: string) => {
      if (isMuted) return;
      setCurrentInstruction(text);
      try {
        await speak(text, voiceSettings);
      } catch (error) {
        console.error("Speech error:", error);
      }
    },
    [isMuted, voiceSettings]
  );

  // Start session
  const startSession = useCallback(async () => {
    if (!sessionScript) return;

    setIsPlaying(true);
    setSessionPhase("welcome");

    await speakText(sessionScript.welcome);

    // Move to first pose
    if (asanas.length > 0) {
      setSessionPhase("pose");
      setCurrentPoseIndex(0);
      setTimeRemaining(asanas[0].duration);
      setHoldCueIndex(0);

      await speakText(sessionScript.poseScripts[0].script.enter);
    } else {
      setSessionPhase("closing");
      await speakText(sessionScript.closing);
      setSessionPhase("complete");
    }
  }, [sessionScript, asanas, speakText]);

  // Handle timer
  useEffect(() => {
    if (!isPlaying || sessionPhase !== "pose") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, sessionPhase]);

  // Handle time announcements and hold cues
  useEffect(() => {
    if (!isPlaying || sessionPhase !== "pose" || !sessionScript) return;

    const currentScript = sessionScript.poseScripts[currentPoseIndex];
    if (!currentScript) return;

    // Countdown announcements
    if (timeRemaining !== lastAnnouncedTime.current) {
      const announcement = getCountdownAnnouncement(timeRemaining);
      if (announcement) {
        speakText(announcement);
      }
      lastAnnouncedTime.current = timeRemaining;
    }

    // Hold cues (roughly every 15 seconds)
    const holdCues = currentScript.script.hold;
    const breathCues = currentScript.script.breathCues;
    const allCues = [...holdCues, ...breathCues];

    if (allCues.length > 0) {
      const currentDuration = asanas[currentPoseIndex].duration;
      const elapsed = currentDuration - timeRemaining;
      const cueInterval = Math.floor(currentDuration / (allCues.length + 1));

      const expectedCueIndex = Math.floor(elapsed / cueInterval);
      if (
        expectedCueIndex > holdCueIndex &&
        expectedCueIndex <= allCues.length &&
        timeRemaining > 10
      ) {
        setHoldCueIndex(expectedCueIndex);
        speakText(allCues[expectedCueIndex - 1]);
      }
    }
  }, [timeRemaining, isPlaying, sessionPhase, sessionScript, currentPoseIndex, holdCueIndex, asanas, speakText]);

  // Handle pose transitions
  useEffect(() => {
    if (timeRemaining !== 0 || sessionPhase !== "pose" || !isPlaying) return;

    const handleTransition = async () => {
      if (!sessionScript) return;

      const currentScript = sessionScript.poseScripts[currentPoseIndex];

      // Speak exit instruction
      await speakText(currentScript.script.exit);

      // Check if there are more poses
      if (currentPoseIndex < asanas.length - 1) {
        // Transition
        if (currentScript.transition) {
          setSessionPhase("transition");
          await speakText(currentScript.transition);
        }

        // Move to next pose
        const nextIndex = currentPoseIndex + 1;
        setCurrentPoseIndex(nextIndex);
        setTimeRemaining(asanas[nextIndex].duration);
        setHoldCueIndex(0);
        lastAnnouncedTime.current = -1;
        setSessionPhase("pose");

        await speakText(sessionScript.poseScripts[nextIndex].script.enter);
      } else {
        // Session complete
        setSessionPhase("closing");
        await speakText(sessionScript.closing);
        setSessionPhase("complete");
        setIsPlaying(false);
      }
    };

    handleTransition();
  }, [timeRemaining, sessionPhase, isPlaying, sessionScript, currentPoseIndex, asanas, speakText]);

  // Pause/Resume
  const togglePlayPause = () => {
    if (!isPlaying && sessionPhase === "welcome") {
      startSession();
    } else {
      stopSpeaking();
      setIsPlaying(!isPlaying);
    }
  };

  // Skip to next pose
  const skipNext = async () => {
    if (currentPoseIndex < asanas.length - 1) {
      stopSpeaking();
      const nextIndex = currentPoseIndex + 1;
      setCurrentPoseIndex(nextIndex);
      setTimeRemaining(asanas[nextIndex].duration);
      setHoldCueIndex(0);
      lastAnnouncedTime.current = -1;

      if (sessionScript && isPlaying) {
        await speakText(sessionScript.poseScripts[nextIndex].script.enter);
      }
    }
  };

  // Skip to previous pose
  const skipPrev = async () => {
    if (currentPoseIndex > 0) {
      stopSpeaking();
      const prevIndex = currentPoseIndex - 1;
      setCurrentPoseIndex(prevIndex);
      setTimeRemaining(asanas[prevIndex].duration);
      setHoldCueIndex(0);
      lastAnnouncedTime.current = -1;

      if (sessionScript && isPlaying) {
        await speakText(sessionScript.poseScripts[prevIndex].script.enter);
      }
    }
  };

  // Restart session
  const restartSession = () => {
    stopSpeaking();
    setCurrentPoseIndex(0);
    setTimeRemaining(0);
    setSessionPhase("welcome");
    setIsPlaying(false);
    setHoldCueIndex(0);
    lastAnnouncedTime.current = -1;
  };

  // Toggle mute
  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate total progress
  const totalDuration = asanas.reduce((sum, a) => sum + a.duration, 0);
  const elapsedDuration =
    asanas.slice(0, currentPoseIndex).reduce((sum, a) => sum + a.duration, 0) +
    (asanas[currentPoseIndex]?.duration || 0) -
    timeRemaining;
  const progressPercent = (elapsedDuration / totalDuration) * 100;

  const currentAsana = asanas[currentPoseIndex]?.asana;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button
          onClick={() => {
            stopSpeaking();
            onClose();
          }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-medium">{programName}</h2>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {sessionPhase === "complete" ? (
          <div className="text-center text-white">
            <div className="text-6xl mb-6">🙏</div>
            <h2 className="text-3xl font-bold mb-4">Practice Complete</h2>
            <p className="text-white/70 mb-8">Namaste. Great job today!</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={restartSession}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Restart
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-sage-600 hover:bg-sage-700 rounded-xl transition-colors"
              >
                Finish
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Pose Image */}
            {currentAsana && (
              <div className="mb-8">
                <div className="w-64 h-64 bg-white/10 rounded-3xl p-6 flex items-center justify-center">
                  <Image
                    src={currentAsana.svgPath}
                    alt={currentAsana.nameEnglish}
                    width={200}
                    height={200}
                    className="max-w-full max-h-full"
                  />
                </div>
              </div>
            )}

            {/* Pose Info */}
            <div className="text-center text-white mb-8">
              {sessionPhase === "welcome" ? (
                <>
                  <h2 className="text-3xl font-bold mb-2">Ready to Begin?</h2>
                  <p className="text-white/70">
                    Press play to start your guided practice
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-2">
                    {currentAsana?.nameEnglish}
                  </h2>
                  <p className="text-white/70">{currentAsana?.nameSanskrit}</p>
                </>
              )}
            </div>

            {/* Timer */}
            {sessionPhase === "pose" && (
              <div className="text-center mb-8">
                <div className="text-6xl font-mono font-bold text-white mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-white/50 text-sm">
                  Pose {currentPoseIndex + 1} of {asanas.length}
                </p>
              </div>
            )}

            {/* Current Instruction */}
            {currentInstruction && isPlaying && (
              <div className="max-w-md text-center mb-8">
                <p className="text-white/80 italic">&ldquo;{currentInstruction}&rdquo;</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-4">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage-500 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="p-6">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleMute}
            className="p-3 text-white/70 hover:text-white transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={skipPrev}
            disabled={currentPoseIndex === 0 || sessionPhase === "welcome"}
            className="p-3 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack className="w-8 h-8" />
          </button>

          <button
            onClick={togglePlayPause}
            className="p-6 bg-sage-600 hover:bg-sage-700 rounded-full text-white transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10" />
            ) : (
              <Play className="w-10 h-10 ml-1" />
            )}
          </button>

          <button
            onClick={skipNext}
            disabled={currentPoseIndex >= asanas.length - 1 || sessionPhase === "welcome"}
            className="p-3 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="w-8 h-8" />
          </button>

          <button
            onClick={restartSession}
            className="p-3 text-white/70 hover:text-white transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettings
        settings={voiceSettings}
        onChange={setVoiceSettings}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
