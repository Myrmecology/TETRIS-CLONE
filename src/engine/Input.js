/**
 * Input.js - Input handling system
 * Manages keyboard input with DAS (Delayed Auto Shift) and ARR (Auto Repeat Rate)
 */

import { TIMING } from '../utils/Constants.js';
import { EventEmitter } from './EventEmitter.js';

export class Input extends EventEmitter {
  constructor() {
    super();
    
    this.keys = {};
    this.keyTimers = {};
    this.enabled = true;
    
    // DAS/ARR settings
    this.dasDelay = TIMING.DAS; // Initial delay before auto-repeat
    this.arrRate = TIMING.ARR;  // Auto-repeat rate
    
    this.init();
  }

  /**
   * Initialize input handlers
   */
  init() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  /**
   * Handle key down event
   */
  handleKeyDown(e) {
    if (!this.enabled) return;

    const key = e.key;

    // Prevent default for game keys
    if (this.isGameKey(key)) {
      e.preventDefault();
    }

    // Check if key is already pressed (held down)
    if (this.keys[key]) return;

    this.keys[key] = true;

    // Emit initial key press
    this.emitKeyEvent(key, 'press');

    // Setup auto-repeat for movement keys
    if (this.isMovementKey(key)) {
      this.setupAutoRepeat(key);
    }
  }

  /**
   * Handle key up event
   */
  handleKeyUp(e) {
    const key = e.key;

    if (this.keys[key]) {
      this.keys[key] = false;
      this.emitKeyEvent(key, 'release');
    }

    // Clear auto-repeat timer
    if (this.keyTimers[key]) {
      clearTimeout(this.keyTimers[key].dasTimer);
      clearInterval(this.keyTimers[key].arrInterval);
      delete this.keyTimers[key];
    }
  }

  /**
   * Setup auto-repeat for a key (DAS/ARR)
   */
  setupAutoRepeat(key) {
    // Clear existing timers
    if (this.keyTimers[key]) {
      clearTimeout(this.keyTimers[key].dasTimer);
      clearInterval(this.keyTimers[key].arrInterval);
    }

    this.keyTimers[key] = {};

    // DAS delay before auto-repeat starts
    this.keyTimers[key].dasTimer = setTimeout(() => {
      // ARR - auto-repeat at specified rate
      this.keyTimers[key].arrInterval = setInterval(() => {
        if (this.keys[key]) {
          this.emitKeyEvent(key, 'repeat');
        }
      }, this.arrRate);
    }, this.dasDelay);
  }

  /**
   * Emit key event with mapped action
   */
  emitKeyEvent(key, type) {
    const action = this.mapKeyToAction(key);
    
    if (action) {
      this.emit('input', { action, type, key });
      this.emit(action, { type, key });
    }
  }

  /**
   * Map keyboard key to game action
   */
  mapKeyToAction(key) {
    const keyMap = {
      // Movement
      'ArrowLeft': 'moveLeft',
      'ArrowRight': 'moveRight',
      'ArrowDown': 'softDrop',
      
      // Rotation
      'ArrowUp': 'rotateClockwise',
      'z': 'rotateClockwise',
      'Z': 'rotateClockwise',
      'x': 'rotateCounterClockwise',
      'X': 'rotateCounterClockwise',
      
      // Hard drop
      ' ': 'hardDrop',
      
      // Hold
      'c': 'hold',
      'C': 'hold',
      'Shift': 'hold',
      
      // Pause
      'p': 'pause',
      'P': 'pause',
      'Escape': 'pause'
    };

    return keyMap[key] || null;
  }

  /**
   * Check if key is a game-related key
   */
  isGameKey(key) {
    const gameKeys = [
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      ' ', 'z', 'Z', 'x', 'X', 'c', 'C', 'Shift',
      'p', 'P', 'Escape'
    ];
    return gameKeys.includes(key);
  }

  /**
   * Check if key is a movement key (for DAS/ARR)
   */
  isMovementKey(key) {
    return ['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(key);
  }

  /**
   * Check if a key is currently pressed
   */
  isKeyPressed(key) {
    return this.keys[key] || false;
  }

  /**
   * Check if an action is currently active
   */
  isActionActive(action) {
    for (const [key, pressed] of Object.entries(this.keys)) {
      if (pressed && this.mapKeyToAction(key) === action) {
        return true;
      }
    }
    return false;
  }

  /**
   * Enable input handling
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable input handling
   */
  disable() {
    this.enabled = false;
    this.clearAllKeys();
  }

  /**
   * Clear all pressed keys and timers
   */
  clearAllKeys() {
    this.keys = {};
    
    // Clear all timers
    for (const key in this.keyTimers) {
      if (this.keyTimers[key].dasTimer) {
        clearTimeout(this.keyTimers[key].dasTimer);
      }
      if (this.keyTimers[key].arrInterval) {
        clearInterval(this.keyTimers[key].arrInterval);
      }
    }
    
    this.keyTimers = {};
  }

  /**
   * Set DAS delay
   */
  setDAS(delay) {
    this.dasDelay = delay;
  }

  /**
   * Set ARR rate
   */
  setARR(rate) {
    this.arrRate = rate;
  }

  /**
   * Get DAS delay
   */
  getDAS() {
    return this.dasDelay;
  }

  /**
   * Get ARR rate
   */
  getARR() {
    return this.arrRate;
  }

  /**
   * Get all currently pressed keys
   */
  getPressedKeys() {
    return Object.keys(this.keys).filter(key => this.keys[key]);
  }

  /**
   * Get all active actions
   */
  getActiveActions() {
    return this.getPressedKeys()
      .map(key => this.mapKeyToAction(key))
      .filter(action => action !== null);
  }

  /**
   * Reset input system
   */
  reset() {
    this.clearAllKeys();
    this.enable();
  }

  /**
   * Clean up event listeners
   */
  dispose() {
    this.clearAllKeys();
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.removeAllListeners();
  }
}