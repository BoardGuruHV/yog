export interface VoiceSettings {
  rate: number; // 0.5 - 2.0
  pitch: number; // 0 - 2
  volume: number; // 0 - 1
  voiceURI?: string;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  rate: 0.9,
  pitch: 1,
  volume: 1,
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

export function getPreferredVoices(): SpeechSynthesisVoice[] {
  const voices = getAvailableVoices();

  // Prefer English voices, with preference for natural/enhanced voices
  const englishVoices = voices.filter(
    (v) => v.lang.startsWith("en")
  );

  // Sort by quality indicators in name
  return englishVoices.sort((a, b) => {
    const aScore = getVoiceQualityScore(a);
    const bScore = getVoiceQualityScore(b);
    return bScore - aScore;
  });
}

function getVoiceQualityScore(voice: SpeechSynthesisVoice): number {
  let score = 0;
  const name = voice.name.toLowerCase();

  // Premium/enhanced voices get higher scores
  if (name.includes("premium")) score += 10;
  if (name.includes("enhanced")) score += 8;
  if (name.includes("natural")) score += 6;
  if (name.includes("neural")) score += 6;

  // Prefer female voices for yoga (common preference)
  if (name.includes("female") || name.includes("samantha") || name.includes("karen")) {
    score += 2;
  }

  // Local voices are usually better quality
  if (!voice.localService) score -= 2;

  return score;
}

export function speak(
  text: string,
  settings: VoiceSettings = DEFAULT_VOICE_SETTINGS,
  onEnd?: () => void,
  onStart?: () => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    // Cancel any ongoing speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    // Set voice if specified
    if (settings.voiceURI) {
      const voices = getAvailableVoices();
      const voice = voices.find((v) => v.voiceURI === settings.voiceURI);
      if (voice) {
        utterance.voice = voice;
      }
    } else {
      // Use first preferred voice
      const preferredVoices = getPreferredVoices();
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
      resolve();
    };

    utterance.onerror = (event) => {
      currentUtterance = null;
      if (event.error !== "canceled") {
        reject(new Error(`Speech error: ${event.error}`));
      } else {
        resolve();
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function pauseSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.pause();
}

export function resumeSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.resume();
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}

export function isPaused(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.paused;
}

// Wait for voices to load (they load asynchronously)
export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const voices = getAvailableVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(getAvailableVoices());
    };

    // Fallback timeout
    setTimeout(() => {
      resolve(getAvailableVoices());
    }, 1000);
  });
}
