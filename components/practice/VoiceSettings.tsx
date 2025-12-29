"use client";

import { useState, useEffect } from "react";
import { Volume2, Settings, X } from "lucide-react";
import {
  VoiceSettings as VoiceSettingsType,
  DEFAULT_VOICE_SETTINGS,
  getPreferredVoices,
  waitForVoices,
  speak,
  stopSpeaking,
} from "@/lib/voice/speech";

interface VoiceSettingsProps {
  settings: VoiceSettingsType;
  onChange: (settings: VoiceSettingsType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceSettings({
  settings,
  onChange,
  isOpen,
  onClose,
}: VoiceSettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    waitForVoices().then((availableVoices) => {
      const preferred = getPreferredVoices();
      setVoices(preferred.length > 0 ? preferred : availableVoices.slice(0, 10));
    });
  }, []);

  const testVoice = async () => {
    setIsTesting(true);
    try {
      await speak(
        "Welcome to your yoga practice. Take a deep breath and relax.",
        settings
      );
    } catch (error) {
      console.error("Voice test error:", error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    onChange(DEFAULT_VOICE_SETTINGS);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sage-600" />
            <h3 className="text-lg font-semibold text-gray-800">Voice Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Voice Selection */}
          {voices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice
              </label>
              <select
                value={settings.voiceURI || ""}
                onChange={(e) =>
                  onChange({ ...settings, voiceURI: e.target.value || undefined })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              >
                <option value="">Default</option>
                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Speed/Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Speed</label>
              <span className="text-sm text-gray-500">
                {settings.rate.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={settings.rate}
              onChange={(e) =>
                onChange({ ...settings, rate: parseFloat(e.target.value) })
              }
              className="w-full accent-sage-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Slower</span>
              <span>Normal</span>
              <span>Faster</span>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Pitch</label>
              <span className="text-sm text-gray-500">
                {settings.pitch.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={settings.pitch}
              onChange={(e) =>
                onChange({ ...settings, pitch: parseFloat(e.target.value) })
              }
              className="w-full accent-sage-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Lower</span>
              <span>Normal</span>
              <span>Higher</span>
            </div>
          </div>

          {/* Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Volume</label>
              <span className="text-sm text-gray-500">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) =>
                onChange({ ...settings, volume: parseFloat(e.target.value) })
              }
              className="w-full accent-sage-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={testVoice}
              disabled={isTesting}
              className="flex-1 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              {isTesting ? "Playing..." : "Test Voice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
