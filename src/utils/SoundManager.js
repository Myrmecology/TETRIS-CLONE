import { CONFIG } from '../config.js';

export default class SoundManager {
    constructor() {
        this.sounds = {};
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.initialized = false;
    }

    // Initialize all sounds
    init() {
        if (this.initialized) return;

        try {
            // Load sound effects
            this.sounds.move = new Howl({
                src: [CONFIG.SOUNDS.MOVE],
                volume: 0.3,
                onloaderror: () => console.log('Move sound not found (optional)')
            });

            this.sounds.rotate = new Howl({
                src: [CONFIG.SOUNDS.ROTATE],
                volume: 0.3,
                onloaderror: () => console.log('Rotate sound not found (optional)')
            });

            this.sounds.drop = new Howl({
                src: [CONFIG.SOUNDS.DROP],
                volume: 0.5,
                onloaderror: () => console.log('Drop sound not found (optional)')
            });

            this.sounds.lineClear = new Howl({
                src: [CONFIG.SOUNDS.LINE_CLEAR],
                volume: 0.6,
                onloaderror: () => console.log('Line clear sound not found (optional)')
            });

            this.sounds.gameOver = new Howl({
                src: [CONFIG.SOUNDS.GAME_OVER],
                volume: 0.5,
                onloaderror: () => console.log('Game over sound not found (optional)')
            });

            // Load background music
            this.sounds.music = new Howl({
                src: [CONFIG.SOUNDS.MUSIC],
                volume: 0.4,
                loop: true,
                onloaderror: () => console.log('Background music not found (optional)')
            });

            this.initialized = true;
        } catch (error) {
            console.log('Sound initialization skipped (assets not yet added)');
        }
    }

    // Play a sound effect
    play(soundName) {
        if (!this.sfxEnabled || !this.initialized) return;
        
        try {
            if (this.sounds[soundName]) {
                this.sounds[soundName].play();
            }
        } catch (error) {
            console.log(`Could not play sound: ${soundName}`);
        }
    }

    // Start background music
    playMusic() {
        if (!this.musicEnabled || !this.initialized) return;
        
        try {
            if (this.sounds.music && !this.sounds.music.playing()) {
                this.sounds.music.play();
            }
        } catch (error) {
            console.log('Could not play music');
        }
    }

    // Stop background music
    stopMusic() {
        try {
            if (this.sounds.music) {
                this.sounds.music.stop();
            }
        } catch (error) {
            console.log('Could not stop music');
        }
    }

    // Toggle music on/off
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.playMusic();
        } else {
            this.stopMusic();
        }
        return this.musicEnabled;
    }

    // Toggle sound effects on/off
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    // Set music volume (0.0 to 1.0)
    setMusicVolume(volume) {
        if (this.sounds.music) {
            this.sounds.music.volume(volume);
        }
    }

    // Set SFX volume (0.0 to 1.0)
    setSFXVolume(volume) {
        Object.keys(this.sounds).forEach(key => {
            if (key !== 'music' && this.sounds[key]) {
                this.sounds[key].volume(volume);
            }
        });
    }
}