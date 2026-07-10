export class SoundManager {
  constructor(musicSettings = { hilo: { enabled: true } }, soundFxEnabled = true) {
    this.musicSettings = musicSettings;
    this.soundFxEnabled = soundFxEnabled;
    this.musicTracks = {};
    this.soundEffects = {};
    this.currentMusic = null;
    
    // Initialize audio
    this.initAudio();
  }
  
  /**
   * Initialize audio tracks and effects
   */
  initAudio() {
    // Music tracks
    this.musicTracks = {
      background: new Audio('/assets/hilo/audio/hilo.4aa95fcb.mp3')
    };
    
    // Configure music tracks
    Object.values(this.musicTracks).forEach(track => {
      track.loop = true;
      track.volume = 0.5;
    });
    
    // Sound effects
    this.soundEffects = {
      card: new Audio('/assets/audio/hilo/card_flip.mp3'),
      button: new Audio('/assets/hilo/audio/bet.9fe42261.mp3'),
      win: new Audio('/assets/hilo/audio/win.ae4b0d6d.mp3'),
      lose: new Audio('/assets/hilo/audio/giraffe.f1576e60.mp3'),
      skip: new Audio('/assets/hilo/audio/skip.2122e51f.mp3'),
      cashout: new Audio('/assets/hilo/audio/cashout.41167174.mp3')
    };
    
    // Configure sound effects
    Object.values(this.soundEffects).forEach(effect => {
      effect.volume = 0.7;
    });
    
    // Special volume adjustments
    if (this.soundEffects.win) this.soundEffects.win.volume = 0.6;
    if (this.soundEffects.lose) this.soundEffects.lose.volume = 0.5;
  }
  
  /**
   * Play background music
   */
  playMusic() {
    if (!this.musicSettings.hilo.enabled) return;
    
    const track = this.musicTracks.background;
    if (track && track.paused) {
      track.currentTime = 0;
      track.play().catch(error => {
        console.warn('Failed to play music:', error);
      });
      this.currentMusic = track;
    }
  }
  
  /**
   * Stop background music
   */
  stopMusic() {
    if (this.currentMusic && !this.currentMusic.paused) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }
  }
  
  /**
   * Play a sound effect
   * @param {string} soundName - Name of the sound effect
   * @param {Object} options - Options for playing the sound
   */
  playSound(soundName, options = {}) {
    if (!this.soundFxEnabled) return;
    
    const sound = this.soundEffects[soundName];
    if (!sound) return;
    
    // Apply volume if specified
    if (options.volume !== undefined) {
      sound.volume = Math.min(1, Math.max(0, options.volume));
    }
    
    // Reset and play
    sound.currentTime = 0;
    sound.play().catch(error => {
      console.warn(`Failed to play sound ${soundName}:`, error);
    });
  }
  
  /**
   * Play a game event sound
   * @param {string} event - Game event name
   * @param {Object} data - Event data
   */
  playGameEvent(event, data = {}) {
    switch (event) {
      case 'card':
        this.playSound('card');
        break;
      case 'button':
        this.playSound('button');
        break;
      case 'win':
        this.playSound('win', { volume: Math.min(0.8, 0.5 + (data.payout || 1) / 20) });
        break;
      case 'lose':
        this.playSound('lose');
        break;
      case 'skip':
        this.playSound('skip');
        break;
      case 'cashout':
        this.playSound('cashout');
        break;
      default:
        break;
    }
  }
  
  /**
   * Set music enabled state
   * @param {boolean} enabled - Whether music is enabled
   */
  setMusicEnabled(enabled) {
    this.musicSettings.hilo.enabled = enabled;
    
    if (enabled) {
      this.playMusic();
    } else {
      this.stopMusic();
    }
  }
  
  /**
   * Set sound effects enabled state
   * @param {boolean} enabled - Whether sound effects are enabled
   */
  setSoundFxEnabled(enabled) {
    this.soundFxEnabled = enabled;
  }
  
  /**
   * Stop all audio
   */
  stop() {
    this.stopMusic();
    
    // Stop all sound effects
    Object.values(this.soundEffects).forEach(effect => {
      effect.pause();
      effect.currentTime = 0;
    });
  }
}

export default SoundManager;