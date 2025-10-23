/**
 * Input.js - Input handling system for Tetris Neon Shatter
 * Manages keyboard input with DAS (Delayed Auto Shift) and ARR (Auto Repeat Rate)
 */

import { CONTROLS, TIMING } from '../utils/Constants.js';
import { gameEventBus, GAME_EVENTS } from './EventEmitter.js';

/**
 * Input Handler Class
 * Provides professional Tetris controls with proper DAS/ARR implementation
 */
export class InputHandler {
  constructor() {
    // Key states
    this.keys = new Map();
    this.keyTimers = new Map();
    this.keyRepeating = new Map();
    
    // Control mappings (can be remapped)
    this.controls = { ...CONTROLS };
    
    // DAS (Delayed Auto Shift) settings
    this.dasDelay = TIMING.DAS;
    this.arr = TIMING.ARR;
    
    // Input state
    this.enabled = true;
    this.isPaused = false;
    
    // Special key states
    this.shiftKey = false;
    this.ctrlKey = false;
    this.altKey = false;
    
    // Action callbacks
    this.actions = new Map();
    
    // Input buffer for frame-perfect inputs
    this.inputBuffer = [];
    this.bufferSize = 3; // frames
    this.bufferTimer = 0;
    
    // Statistics
    this.stats = {
      totalKeyPresses: 0,
      actionsPerMinute: 0,
      lastActions: []
    };
    
    // Touch/gamepad support flags
    this.touchEnabled = false;
    this.gamepadEnabled = false;
    this.gamepadIndex = null;
    
    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    
    this.setupEventListeners();
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // Handle tab switching / window blur
    window.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleBlur);
    
    // Prevent default for game keys
    window.addEventListener('keydown', (e) => {
      if (this.isGameKey(e.code)) {
        e.preventDefault();
      }
    });
  }
  
  /**
   * Remove event listeners
   */
  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleBlur);
    
    this.keys.clear();
    this.keyTimers.clear();
    this.keyRepeating.clear();
    this.actions.clear();
  }
  
  /**
   * Handle key down event
   */
  handleKeyDown(event) {
    if (!this.enabled) return;
    
    const code = event.code;
    
    // Update modifier keys
    this.shiftKey = event.shiftKey;
    this.ctrlKey = event.ctrlKey;
    this.altKey = event.altKey;
    
    // Ignore if key is already down
    if (this.keys.get(code)) return;
    
    // Mark key as pressed
    this.keys.set(code, true);
    this.keyTimers.set(code, 0);
    this.keyRepeating.set(code, false);
    
    // Update statistics
    this.stats.totalKeyPresses++;
    this.trackAction(code);
    
    // Emit key press event
    gameEventBus.emit(GAME_EVENTS.KEY_PRESS, { code, event });
    
    // Check for immediate action
    this.checkAction(code, true);
    
    // Add to input buffer for frame-perfect inputs
    this.addToBuffer(code);
  }
  
  /**
   * Handle key up event
   */
  handleKeyUp(event) {
    const code = event.code;
    
    // Update modifier keys
    this.shiftKey = event.shiftKey;
    this.ctrlKey = event.ctrlKey;
    this.altKey = event.altKey;
    
    // Mark key as released
    this.keys.set(code, false);
    this.keyTimers.delete(code);
    this.keyRepeating.delete(code);
    
    // Emit key release event
    gameEventBus.emit(GAME_EVENTS.KEY_RELEASE, { code, event });
    
    // Handle key release actions (like stopping soft drop)
    this.checkReleaseAction(code);
  }
  
  /**
   * Handle visibility change (tab switching)
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.releaseAllKeys();
    }
  }
  
  /**
   * Handle window blur
   */
  handleBlur() {
    this.releaseAllKeys();
  }
  
  /**
   * Release all keys (used when window loses focus)
   */
  releaseAllKeys() {
    for (const [code] of this.keys) {
      this.keys.set(code, false);
      this.checkReleaseAction(code);
    }
    this.keyTimers.clear();
    this.keyRepeating.clear();
  }
  
  /**
   * Update input system (called each frame)
   */
  update(deltaTime) {
    if (!this.enabled || this.isPaused) return;
    
    // Update input buffer
    this.updateBuffer(deltaTime);
    
    // Update DAS/ARR for held keys
    for (const [code, isPressed] of this.keys) {
      if (!isPressed) continue;
      
      const timer = this.keyTimers.get(code) || 0;
      const isRepeating = this.keyRepeating.get(code) || false;
      
      // Check if this key should repeat
      if (!this.shouldRepeat(code)) continue;
      
      if (!isRepeating) {
        // Waiting for DAS delay
        const newTimer = timer + deltaTime;
        this.keyTimers.set(code, newTimer);
        
        if (newTimer >= this.dasDelay) {
          // Start repeating
          this.keyRepeating.set(code, true);
          this.keyTimers.set(code, 0);
          this.checkAction(code, false);
        }
      } else {
        // Already repeating - check ARR
        const newTimer = timer + deltaTime;
        this.keyTimers.set(code, newTimer);
        
        if (newTimer >= this.arr) {
          this.keyTimers.set(code, 0);
          this.checkAction(code, false);
        }
      }
    }
    
    // Update APM (actions per minute)
    this.updateAPM();
  }
  
  /**
   * Check if a key should repeat
   */
  shouldRepeat(code) {
    // Check if key is in no-repeat list
    for (const key of CONTROLS.NO_REPEAT) {
      if (code === key) return false;
    }
    
    // Check if it's a movement or drop key
    return this.isControlKey(code, 'MOVE_LEFT') ||
           this.isControlKey(code, 'MOVE_RIGHT') ||
           this.isControlKey(code, 'SOFT_DROP');
  }
  
  /**
   * Check if a code matches a control
   */
  isControlKey(code, control) {
    const keys = this.controls[control];
    if (!keys) return false;
    
    if (Array.isArray(keys)) {
      return keys.includes(code);
    }
    return keys === code;
  }
  
  /**
   * Check for action execution
   */
  checkAction(code, isInitial) {
    // Check each control
    for (const [action, keys] of Object.entries(this.controls)) {
      const keyList = Array.isArray(keys) ? keys : [keys];
      
      if (keyList.includes(code)) {
        // Execute action callback if registered
        const callback = this.actions.get(action);
        if (callback) {
          callback(isInitial);
        }
      }
    }
  }
  
  /**
   * Check for release actions
   */
  checkReleaseAction(code) {
    // Check for soft drop release
    if (this.isControlKey(code, 'SOFT_DROP')) {
      const callback = this.actions.get('SOFT_DROP_RELEASE');
      if (callback) callback();
    }
  }
  
  /**
   * Register an action callback
   */
  onAction(action, callback) {
    this.actions.set(action, callback);
  }
  
  /**
   * Unregister an action callback
   */
  offAction(action) {
    this.actions.delete(action);
  }
  
  /**
   * Check if a control is currently pressed
   */
  isPressed(control) {
    const keys = this.controls[control];
    if (!keys) return false;
    
    const keyList = Array.isArray(keys) ? keys : [keys];
    
    for (const key of keyList) {
      if (this.keys.get(key)) return true;
    }
    
    return false;
  }
  
  /**
   * Add key to input buffer
   */
  addToBuffer(code) {
    this.inputBuffer.push({
      code,
      time: Date.now(),
      frame: 0
    });
    
    // Limit buffer size
    if (this.inputBuffer.length > 10) {
      this.inputBuffer.shift();
    }
  }
  
  /**
   * Update input buffer
   */
  updateBuffer(deltaTime) {
    this.bufferTimer += deltaTime;
    
    // Update frame counters
    for (const input of this.inputBuffer) {
      input.frame++;
    }
    
    // Remove old inputs
    this.inputBuffer = this.inputBuffer.filter(
      input => input.frame <= this.bufferSize
    );
  }
  
  /**
   * Check if an action was buffered
   */
  checkBufferedAction(action) {
    const keys = this.controls[action];
    if (!keys) return false;
    
    const keyList = Array.isArray(keys) ? keys : [keys];
    
    for (const input of this.inputBuffer) {
      if (keyList.includes(input.code)) {
        // Remove from buffer
        this.inputBuffer = this.inputBuffer.filter(i => i !== input);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Track action for APM calculation
   */
  trackAction(code) {
    const now = Date.now();
    this.stats.lastActions.push(now);
    
    // Keep only actions from last minute
    const oneMinuteAgo = now - 60000;
    this.stats.lastActions = this.stats.lastActions.filter(
      time => time > oneMinuteAgo
    );
  }
  
  /**
   * Update actions per minute
   */
  updateAPM() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentActions = this.stats.lastActions.filter(
      time => time > oneMinuteAgo
    );
    
    this.stats.actionsPerMinute = recentActions.length;
  }
  
  /**
   * Check if a key is a game key
   */
  isGameKey(code) {
    for (const keys of Object.values(this.controls)) {
      const keyList = Array.isArray(keys) ? keys : [keys];
      if (keyList.includes(code)) return true;
    }
    return false;
  }
  
  /**
   * Enable input
   */
  enable() {
    this.enabled = true;
  }
  
  /**
   * Disable input
   */
  disable() {
    this.enabled = false;
    this.releaseAllKeys();
  }
  
  /**
   * Pause input handling
   */
  pause() {
    this.isPaused = true;
  }
  
  /**
   * Resume input handling
   */
  resume() {
    this.isPaused = false;
  }
  
  /**
   * Remap a control
   */
  remapControl(action, newKeys) {
    if (this.controls[action] !== undefined) {
      this.controls[action] = newKeys;
    }
  }
  
  /**
   * Reset controls to default
   */
  resetControls() {
    this.controls = { ...CONTROLS };
  }
  
  /**
   * Get current control mappings
   */
  getControls() {
    return { ...this.controls };
  }
  
  /**
   * Set DAS delay
   */
  setDAS(delay) {
    this.dasDelay = Math.max(0, delay);
  }
  
  /**
   * Set ARR (Auto Repeat Rate)
   */
  setARR(rate) {
    this.arr = Math.max(0, rate);
  }
  
  /**
   * Get input statistics
   */
  getStats() {
    return {
      ...this.stats,
      dasDelay: this.dasDelay,
      arr: this.arr,
      activeKeys: Array.from(this.keys.entries())
        .filter(([_, pressed]) => pressed)
        .map(([code]) => code)
    };
  }
}

/**
 * Create singleton input handler
 */
export const inputHandler = new InputHandler();

export default InputHandler;