"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  CloudRain,
  Waves,
  TreePine,
  Flame,
  Wind,
  Bird,
  VolumeX,
  Volume2,
  LucideIcon,
} from "lucide-react";
import { AmbientSound, AMBIENT_SOUNDS } from "@/types/meditation";

interface AmbientSoundsProps {
  selected: string;
  onSelect: (soundId: string) => void;
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const iconMap: Record<string, LucideIcon> = {
  CloudRain,
  Waves,
  TreePine,
  Flame,
  Wind,
  Bird,
  VolumeX,
};

// Ambient sound generator using Web Audio API
class AmbientSoundGenerator {
  private audioContext: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext!.currentTime);
    }
  }

  stop() {
    this.nodes.forEach((node) => {
      try {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          node.stop();
        }
        node.disconnect();
      } catch (e) {
        // Ignore errors when stopping
      }
    });
    this.nodes = [];
    this.isPlaying = false;
  }

  // Generate white noise for rain/ocean sounds
  private createNoiseBuffer(seconds: number = 2): AudioBuffer {
    const bufferSize = this.audioContext!.sampleRate * seconds;
    const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playRain() {
    if (!this.audioContext || !this.gainNode) return;
    this.stop();

    const noiseBuffer = this.createNoiseBuffer(2);
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Bandpass filter for rain sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;

    // Light LFO for variation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(this.gainNode);

    noiseSource.start();
    lfo.start();

    this.nodes.push(noiseSource, filter, lfo, lfoGain);
    this.isPlaying = true;
  }

  playOcean() {
    if (!this.audioContext || !this.gainNode) return;
    this.stop();

    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Lowpass filter for ocean rumble
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    // Slow LFO for wave effect
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.3;

    const waveGain = this.audioContext.createGain();
    waveGain.gain.value = 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.gainNode);

    noiseSource.start();
    lfo.start();

    this.nodes.push(noiseSource, filter, lfo, lfoGain, waveGain);
    this.isPlaying = true;
  }

  playForest() {
    if (!this.audioContext || !this.gainNode) return;
    this.stop();

    // Light white noise for rustling leaves
    const noiseBuffer = this.createNoiseBuffer(2);
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 2000;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0.15;

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noiseSource.start();

    this.nodes.push(noiseSource, filter, gain);
    this.isPlaying = true;
  }

  playFire() {
    if (!this.audioContext || !this.gainNode) return;
    this.stop();

    // Crackling noise
    const noiseBuffer = this.createNoiseBuffer(1);
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1500;
    filter.Q.value = 2;

    // Random crackle modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 3;
    lfo.type = "square";
    lfoGain.gain.value = 0.2;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0.2;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noiseSource.start();
    lfo.start();

    this.nodes.push(noiseSource, filter, lfo, lfoGain, gain);
    this.isPlaying = true;
  }

  playWind() {
    if (!this.audioContext || !this.gainNode) return;
    this.stop();

    const noiseBuffer = this.createNoiseBuffer(3);
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Sweeping bandpass for wind
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 400;
    filter.Q.value = 1;

    // LFO for sweeping effect
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(this.gainNode);

    noiseSource.start();
    lfo.start();

    this.nodes.push(noiseSource, filter, lfo, lfoGain);
    this.isPlaying = true;
  }

  playBirds() {
    if (!this.audioContext || !this.gainNode) return;
    this.stop();

    // Simple bird chirp simulation
    const createChirp = () => {
      if (!this.audioContext || !this.gainNode) return;

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(2000 + Math.random() * 2000, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        3000 + Math.random() * 2000,
        this.audioContext.currentTime + 0.1
      );

      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.gainNode);

      osc.start();
      osc.stop(this.audioContext.currentTime + 0.2);
    };

    // Random chirps
    const interval = setInterval(() => {
      if (this.isPlaying) {
        createChirp();
      }
    }, 800 + Math.random() * 2000);

    this.isPlaying = true;

    // Store cleanup
    const cleanup = {
      stop: () => clearInterval(interval),
      disconnect: () => {},
    } as unknown as AudioNode;
    this.nodes.push(cleanup);
  }

  play(soundId: string) {
    switch (soundId) {
      case "rain":
        this.playRain();
        break;
      case "ocean":
        this.playOcean();
        break;
      case "forest":
        this.playForest();
        break;
      case "fire":
        this.playFire();
        break;
      case "wind":
        this.playWind();
        break;
      case "birds":
        this.playBirds();
        break;
      case "silence":
      default:
        this.stop();
    }
  }

  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default function AmbientSounds({
  selected,
  onSelect,
  isPlaying,
  volume,
  onVolumeChange,
}: AmbientSoundsProps) {
  const generatorRef = useRef<AmbientSoundGenerator | null>(null);

  useEffect(() => {
    generatorRef.current = new AmbientSoundGenerator();
    return () => {
      generatorRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (generatorRef.current) {
      generatorRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (generatorRef.current) {
      if (isPlaying && selected !== "silence") {
        generatorRef.current.play(selected);
      } else {
        generatorRef.current.stop();
      }
    }
  }, [selected, isPlaying]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Ambient Sound</h3>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {AMBIENT_SOUNDS.map((sound) => {
          const Icon = iconMap[sound.icon] || VolumeX;
          const isSelected = selected === sound.id;

          return (
            <button
              key={sound.id}
              onClick={() => onSelect(sound.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isSelected
                  ? "bg-sage-100 text-sage-700 border border-sage-300"
                  : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {sound.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
