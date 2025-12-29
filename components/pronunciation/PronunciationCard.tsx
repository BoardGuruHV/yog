"use client";

import { useState, useEffect } from "react";
import { Volume2, BookOpen, Loader2, Info } from "lucide-react";
import SyllableBreakdown, { Syllable } from "./SyllableBreakdown";
import AudioPlayer from "./AudioPlayer";

interface PronunciationData {
  id: string;
  phonetic: string;
  audioPath: string | null;
  syllables: Syllable[];
  ipa: string | null;
  meaning: string | null;
}

interface PronunciationCardProps {
  asanaId: string;
  nameSanskrit: string;
  compact?: boolean;
}

export default function PronunciationCard({
  asanaId,
  nameSanskrit,
  compact = false,
}: PronunciationCardProps) {
  const [pronunciation, setPronunciation] = useState<PronunciationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState(-1);
  const [showMeaning, setShowMeaning] = useState(false);

  useEffect(() => {
    fetchPronunciation();
  }, [asanaId]);

  const fetchPronunciation = async () => {
    try {
      const res = await fetch(`/api/pronunciation/${asanaId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.pronunciation) {
          setPronunciation({
            ...data.pronunciation,
            syllables: data.pronunciation.syllables as Syllable[],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching pronunciation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!pronunciation) {
    // Fallback: Show basic pronunciation without database data
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Volume2 className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Sanskrit Pronunciation</h3>
        </div>

        <div className="text-center py-4">
          <p className="text-2xl font-serif text-indigo-900 mb-2">{nameSanskrit}</p>
          <p className="text-sm text-gray-500">
            Pronunciation guide coming soon
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
        <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{nameSanskrit}</p>
          <p className="text-xs text-indigo-600">{pronunciation.phonetic}</p>
        </div>
        <button
          onClick={() => {
            // Quick play using speech synthesis
            if (typeof window !== "undefined" && window.speechSynthesis) {
              const utterance = new SpeechSynthesisUtterance(nameSanskrit);
              utterance.rate = 0.8;
              window.speechSynthesis.speak(utterance);
            }
          }}
          className="p-2 bg-indigo-100 rounded-full hover:bg-indigo-200 transition-colors"
        >
          <Volume2 className="w-4 h-4 text-indigo-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-indigo-100/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Volume2 className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Sanskrit Pronunciation</h3>
        </div>
        <p className="text-sm text-gray-500">
          Learn to pronounce the Sanskrit name correctly
        </p>
      </div>

      {/* Sanskrit Name */}
      <div className="p-6 text-center bg-white/50">
        <p className="text-3xl font-serif text-indigo-900 mb-2">{nameSanskrit}</p>
        <p className="text-lg text-indigo-600 font-mono">{pronunciation.phonetic}</p>
        {pronunciation.ipa && (
          <p className="text-sm text-gray-500 mt-1 font-mono">/{pronunciation.ipa}/</p>
        )}
      </div>

      {/* Syllable Breakdown */}
      <div className="p-6 bg-white/30">
        <p className="text-sm text-gray-600 text-center mb-4">
          Tap syllables or press play to hear pronunciation
        </p>
        <SyllableBreakdown
          syllables={pronunciation.syllables}
          activeSyllableIndex={activeSyllableIndex}
          onSyllableClick={(index) => {
            setActiveSyllableIndex(index);
            // Speak just this syllable
            if (typeof window !== "undefined" && window.speechSynthesis) {
              const utterance = new SpeechSynthesisUtterance(
                pronunciation.syllables[index].text
              );
              utterance.rate = 0.6;
              window.speechSynthesis.speak(utterance);
            }
            setTimeout(() => setActiveSyllableIndex(-1), 500);
          }}
        />
      </div>

      {/* Audio Player */}
      <div className="p-6 border-t border-indigo-100/50 bg-white/50">
        <AudioPlayer
          text={nameSanskrit}
          syllables={pronunciation.syllables}
          audioPath={pronunciation.audioPath}
          onSyllableChange={setActiveSyllableIndex}
          onComplete={() => setActiveSyllableIndex(-1)}
        />
      </div>

      {/* Meaning Section */}
      {pronunciation.meaning && (
        <div className="border-t border-indigo-100/50">
          <button
            onClick={() => setShowMeaning(!showMeaning)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">
                Sanskrit Meaning
              </span>
            </div>
            <span className="text-indigo-500 text-sm">
              {showMeaning ? "Hide" : "Show"}
            </span>
          </button>
          {showMeaning && (
            <div className="px-6 pb-6">
              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <p className="text-gray-700 leading-relaxed">
                  {pronunciation.meaning}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      <div className="px-6 pb-6">
        <div className="flex items-start gap-2 text-xs text-indigo-600 bg-indigo-100/50 rounded-lg p-3">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Tip:</strong> Stressed syllables are shown in{" "}
            <span className="font-bold text-amber-700">bold amber</span>. Focus on
            these for authentic pronunciation.
          </p>
        </div>
      </div>
    </div>
  );
}
