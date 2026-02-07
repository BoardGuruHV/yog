// Sound Player Service for React Native
// Uses react-native-sound for audio playback

import Sound from 'react-native-sound';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

type SoundType = 'bell' | 'complete' | 'rain' | 'ocean' | 'forest' | 'gong';

class SoundPlayerService {
  private sounds: Map<SoundType, Sound | null> = new Map();
  private ambientSound: Sound | null = null;
  private isAmbientPlaying: boolean = false;

  // Preload common sounds
  async preloadSounds(): Promise<void> {
    const soundFiles: Record<SoundType, string> = {
      bell: 'bell.mp3',
      complete: 'complete.mp3',
      rain: 'rain.mp3',
      ocean: 'ocean.mp3',
      forest: 'forest.mp3',
      gong: 'gong.mp3',
    };

    for (const [type, file] of Object.entries(soundFiles) as [SoundType, string][]) {
      try {
        const sound = new Sound(file, Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            console.warn(`Failed to load sound: ${file}`, error);
            this.sounds.set(type, null);
          } else {
            this.sounds.set(type, sound);
          }
        });
      } catch (error) {
        console.warn(`Error loading sound: ${file}`, error);
        this.sounds.set(type, null);
      }
    }
  }

  // Play a one-shot sound (bell, complete, etc.)
  playSound(type: SoundType, volume: number = 1.0): void {
    const sound = this.sounds.get(type);
    if (sound) {
      sound.setVolume(volume);
      sound.play((success) => {
        if (!success) {
          console.warn(`Sound playback failed: ${type}`);
        }
      });
    } else {
      // Fallback: generate a simple tone using system audio
      this.playFallbackTone(type);
    }
  }

  // Play transition bell
  playTransitionBell(): void {
    this.playSound('bell', 0.5);
  }

  // Play completion sound
  playCompletionSound(): void {
    this.playSound('complete', 0.7);
  }

  // Play interval bell (meditation)
  playIntervalBell(): void {
    this.playSound('gong', 0.4);
  }

  // Start ambient sound (for meditation)
  startAmbientSound(
    type: 'rain' | 'ocean' | 'forest' | 'none',
    volume: number = 0.3
  ): void {
    // Stop any currently playing ambient sound
    this.stopAmbientSound();

    if (type === 'none') {
      return;
    }

    const sound = this.sounds.get(type);
    if (sound) {
      sound.setVolume(volume);
      sound.setNumberOfLoops(-1); // Loop indefinitely
      sound.play();
      this.ambientSound = sound;
      this.isAmbientPlaying = true;
    }
  }

  // Stop ambient sound
  stopAmbientSound(): void {
    if (this.ambientSound) {
      this.ambientSound.stop();
      this.ambientSound.setNumberOfLoops(0);
      this.ambientSound = null;
      this.isAmbientPlaying = false;
    }
  }

  // Set ambient sound volume
  setAmbientVolume(volume: number): void {
    if (this.ambientSound) {
      this.ambientSound.setVolume(Math.max(0, Math.min(1, volume)));
    }
  }

  // Check if ambient is playing
  isAmbientSoundPlaying(): boolean {
    return this.isAmbientPlaying;
  }

  // Fallback tone generator (if sound files are missing)
  private playFallbackTone(type: SoundType): void {
    // In React Native, we can't easily generate tones without native modules
    // This is a no-op fallback - sounds will simply not play
    console.log(`Fallback tone for ${type} (sound file missing)`);
  }

  // Cleanup
  release(): void {
    this.stopAmbientSound();

    for (const sound of this.sounds.values()) {
      if (sound) {
        sound.release();
      }
    }
    this.sounds.clear();
  }
}

// Singleton instance
export const soundPlayer = new SoundPlayerService();

// Export class for testing
export { SoundPlayerService };
