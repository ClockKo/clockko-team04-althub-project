/*
soundService.ts - Audio notification service for time tracker
Provides different sound themes and notifications for timer events
*/

export type SoundTheme = 'upbeat' | 'gentle' | 'digital' | 'nature';

export interface SoundThemeConfig {
  name: string;
  description: string;
  focusComplete: number[];
  breakComplete: number[];
  sessionPaused: number;
  sessionResumed: number;
}

class SoundService {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private currentTheme: SoundTheme = 'upbeat';
  private volume: number = 0.8; // Increased from 0.1 to 0.6 for better audibility
  
  private themes: Record<SoundTheme, SoundThemeConfig> = {
    upbeat: {
      name: 'Upbeat',
      description: 'Energetic and motivating tones',
      focusComplete: [523, 659, 784, 1047], // C5, E5, G5, C6 - Major chord progression
      breakComplete: [440, 554, 659, 523], // A4, C#5, E5, C5 - Energetic sequence
      sessionPaused: 392, // G4 - Clear pause tone
      sessionResumed: 659 // E5 - Bright resume tone
    },
    gentle: {
      name: 'Gentle',
      description: 'Soft and calming tones',
      focusComplete: [261, 329, 392, 523], // C4, E4, G4, C5 - Gentle progression
      breakComplete: [349, 415, 493, 440], // F4, G#4, B4, A4 - Soothing sequence
      sessionPaused: 293, // D4 - Soft pause
      sessionResumed: 440 // A4 - Warm resume
    },
    digital: {
      name: 'Digital',
      description: 'Modern tech-inspired beeps',
      focusComplete: [800, 1000, 1200, 1600], // High-tech ascending
      breakComplete: [600, 800, 1000, 800], // Digital pattern
      sessionPaused: 400, // Low digital tone
      sessionResumed: 1200 // High digital tone
    },
    nature: {
      name: 'Nature',
      description: 'Natural and organic tones',
      focusComplete: [174, 220, 277, 349], // Lower natural frequencies
      breakComplete: [196, 247, 311, 262], // Earthy tones
      sessionPaused: 146, // Very low pause
      sessionResumed: 311 // Natural resume
    }
  };

  constructor() {
    // Load saved preferences
    const savedEnabled = localStorage.getItem('timetracker_sound_enabled');
    this.isEnabled = savedEnabled !== null ? JSON.parse(savedEnabled) : true;
    
    const savedTheme = localStorage.getItem('timetracker_sound_theme') as SoundTheme;
    this.currentTheme = savedTheme && this.themes[savedTheme] ? savedTheme : 'upbeat';
    
    // Load saved volume or use default
    const savedVolume = localStorage.getItem('timetracker_sound_volume');
    this.volume = savedVolume ? parseFloat(savedVolume) : 0.8;
    
    // Initialize audio context when first used
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      // Create audio context (modern browsers)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
      this.audioContext = null;
    }
  }

  // Enable/disable sound notifications
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    // Store preference in localStorage
    localStorage.setItem('timetracker_sound_enabled', enabled.toString());
  }

  // Get sound enabled state from localStorage
  getEnabled(): boolean {
    const stored = localStorage.getItem('timetracker_sound_enabled');
    return stored ? stored === 'true' : true; // Default to enabled
  }

  // Set sound theme
  setTheme(theme: SoundTheme) {
    if (this.themes[theme]) {
      this.currentTheme = theme;
      localStorage.setItem('timetracker_sound_theme', theme);
    }
  }

  // Get current theme
  getTheme(): SoundTheme {
    return this.currentTheme;
  }

  // Get all available themes
  getThemes(): Record<SoundTheme, SoundThemeConfig> {
    return this.themes;
  }

  // Get current theme config
  private getCurrentThemeConfig(): SoundThemeConfig {
    return this.themes[this.currentTheme];
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    localStorage.setItem('timetracker_sound_volume', this.volume.toString());
  }

  // Get current volume
  getVolume(): number {
    return this.volume;
  }

  // Resume audio context if suspended (required for autoplay policies)
  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Could not resume audio context:', error);
      }
    }
  }

  // Generate a tone using Web Audio API
  private async playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      await this.resumeAudioContext();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;

      // Fade in and out to avoid clicks - using higher volume for better audibility
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration - 0.05);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

    } catch (error) {
      console.warn('Error playing tone:', error);
    }
  }

  // Play a sequence of tones
  private async playToneSequence(tones: Array<{frequency: number, duration: number, delay?: number}>) {
    if (!this.isEnabled) return;

    let currentTime = 0;
    for (const tone of tones) {
      setTimeout(() => {
        this.playTone(tone.frequency, tone.duration);
      }, currentTime);
      currentTime += (tone.duration * 1000) + (tone.delay || 0);
    }
  }

  // Focus session completed - Success chime (theme-based progression)
  async playFocusComplete() {
    console.log('🔔 Playing focus completion sound');
    const config = this.getCurrentThemeConfig();
    const frequencies = config.focusComplete;
    
    const tones = frequencies.map((freq, index) => ({
      frequency: freq,
      duration: 0.3 + (index * 0.1), // Slightly longer each time
      delay: index > 0 ? 100 : 0
    }));
    
    await this.playToneSequence(tones);
  }

  // Break session completed - Gentle chime (theme-based)
  async playBreakComplete() {
    console.log('🔔 Playing break completion sound');
    const config = this.getCurrentThemeConfig();
    const frequencies = config.breakComplete;
    
    const tones = frequencies.map((freq, index) => ({
      frequency: freq,
      duration: 0.4,
      delay: index > 0 ? 150 : 0
    }));
    
    await this.playToneSequence(tones);
  }

  // Session paused - Theme-based tone
  async playSessionPaused() {
    console.log('🔔 Playing session paused sound');
    const config = this.getCurrentThemeConfig();
    await this.playTone(config.sessionPaused, 0.3);
  }

  // Session resumed - Theme-based tone
  async playSessionResumed() {
    console.log('🔔 Playing session resumed sound');
    const config = this.getCurrentThemeConfig();
    await this.playToneSequence([
      { frequency: config.sessionResumed * 0.8, duration: 0.2 }, // Lower tone first
      { frequency: config.sessionResumed, duration: 0.3, delay: 100 }  // Main resume tone
    ]);
  }

  // Test sound for settings - plays current theme's focus complete sound
  async playTestSound() {
    console.log('🔔 Playing test sound at volume:', this.volume);
    await this.playFocusComplete();
  }

  // Preview a specific theme's focus complete sound
  async playThemePreview(theme: SoundTheme) {
    if (!this.isEnabled || !this.audioContext) return;
    
    console.log(`🔔 Playing preview for ${theme} theme`);
    const config = this.themes[theme];
    const frequencies = config.focusComplete;
    
    const tones = frequencies.map((freq, index) => ({
      frequency: freq,
      duration: 0.3,
      delay: index > 0 ? 100 : 0
    }));
    
    await this.playToneSequence(tones);
  }

  // Initialize audio context on user interaction (required for autoplay policies)
  async initializeOnUserAction() {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }
    await this.resumeAudioContext();
  }
}

// Export singleton instance
export const soundService = new SoundService();

// Export class for testing
export { SoundService };