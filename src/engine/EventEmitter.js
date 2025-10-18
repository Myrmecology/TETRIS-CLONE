/**
 * EventEmitter.js - Event system for Tetris Neon Shatter
 * Provides a robust event handling system for game components
 */

/**
 * Enhanced Event Emitter Class
 * Handles all game events with support for once, priority, and wildcard listeners
 */
export class EventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
    this.wildcardListeners = new Set();
  }
  
  /**
   * Add an event listener
   */
  on(event, listener, options = {}) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    
    // Handle wildcard listeners
    if (event === '*') {
      this.wildcardListeners.add(listener);
      return this;
    }
    
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listeners = this.events.get(event);
    
    // Check max listeners
    if (listeners.length >= this.maxListeners) {
      console.warn(`MaxListenersExceeded: Event '${event}' has more than ${this.maxListeners} listeners`);
    }
    
    // Create listener wrapper with metadata
    const listenerWrapper = {
      callback: listener,
      once: options.once || false,
      priority: options.priority || 0,
      context: options.context || null
    };
    
    // Add listener and sort by priority
    listeners.push(listenerWrapper);
    listeners.sort((a, b) => b.priority - a.priority);
    
    return this;
  }
  
  /**
   * Add a one-time event listener
   */
  once(event, listener, options = {}) {
    return this.on(event, listener, { ...options, once: true });
  }
  
  /**
   * Remove an event listener
   */
  off(event, listenerToRemove) {
    // Remove from wildcard listeners
    if (event === '*') {
      this.wildcardListeners.delete(listenerToRemove);
      return this;
    }
    
    if (!this.events.has(event)) return this;
    
    const listeners = this.events.get(event);
    const filteredListeners = listeners.filter(
      wrapper => wrapper.callback !== listenerToRemove
    );
    
    if (filteredListeners.length === 0) {
      this.events.delete(event);
    } else {
      this.events.set(event, filteredListeners);
    }
    
    return this;
  }
  
  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event) {
    if (event === undefined) {
      this.events.clear();
      this.wildcardListeners.clear();
    } else if (event === '*') {
      this.wildcardListeners.clear();
    } else {
      this.events.delete(event);
    }
    
    return this;
  }
  
  /**
   * Emit an event
   */
  emit(event, ...args) {
    // Emit to wildcard listeners first
    for (const listener of this.wildcardListeners) {
      try {
        listener.call(null, event, ...args);
      } catch (error) {
        console.error(`Error in wildcard listener for event '${event}':`, error);
      }
    }
    
    if (!this.events.has(event)) return false;
    
    const listeners = this.events.get(event);
    const listenersToKeep = [];
    
    for (const wrapper of listeners) {
      try {
        // Call with context if provided
        if (wrapper.context) {
          wrapper.callback.apply(wrapper.context, args);
        } else {
          wrapper.callback(...args);
        }
        
        // Keep listener if not once
        if (!wrapper.once) {
          listenersToKeep.push(wrapper);
        }
      } catch (error) {
        console.error(`Error in listener for event '${event}':`, error);
        // Keep listener even if it errored (unless it was once)
        if (!wrapper.once) {
          listenersToKeep.push(wrapper);
        }
      }
    }
    
    // Update listeners
    if (listenersToKeep.length === 0) {
      this.events.delete(event);
    } else {
      this.events.set(event, listenersToKeep);
    }
    
    return true;
  }
  
  /**
   * Emit an event asynchronously
   */
  async emitAsync(event, ...args) {
    // Emit to wildcard listeners
    for (const listener of this.wildcardListeners) {
      try {
        await listener.call(null, event, ...args);
      } catch (error) {
        console.error(`Error in wildcard listener for event '${event}':`, error);
      }
    }
    
    if (!this.events.has(event)) return [];
    
    const listeners = this.events.get(event);
    const listenersToKeep = [];
    const results = [];
    
    for (const wrapper of listeners) {
      try {
        // Call with context if provided
        const result = wrapper.context
          ? await wrapper.callback.apply(wrapper.context, args)
          : await wrapper.callback(...args);
        
        results.push(result);
        
        // Keep listener if not once
        if (!wrapper.once) {
          listenersToKeep.push(wrapper);
        }
      } catch (error) {
        console.error(`Error in async listener for event '${event}':`, error);
        results.push(undefined);
        
        if (!wrapper.once) {
          listenersToKeep.push(wrapper);
        }
      }
    }
    
    // Update listeners
    if (listenersToKeep.length === 0) {
      this.events.delete(event);
    } else {
      this.events.set(event, listenersToKeep);
    }
    
    return results;
  }
  
  /**
   * Get listener count for an event
   */
  listenerCount(event) {
    if (event === '*') {
      return this.wildcardListeners.size;
    }
    
    if (!this.events.has(event)) return 0;
    return this.events.get(event).length;
  }
  
  /**
   * Get all event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }
  
  /**
   * Set max listeners
   */
  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }
  
  /**
   * Get max listeners
   */
  getMaxListeners() {
    return this.maxListeners;
  }
}

/**
 * Global Event Bus for cross-component communication
 */
export class GameEventBus extends EventEmitter {
  constructor() {
    super();
    this.eventLog = [];
    this.logEnabled = false;
    this.maxLogSize = 100;
  }
  
  /**
   * Enable event logging for debugging
   */
  enableLogging() {
    this.logEnabled = true;
  }
  
  /**
   * Disable event logging
   */
  disableLogging() {
    this.logEnabled = false;
  }
  
  /**
   * Override emit to add logging
   */
  emit(event, ...args) {
    if (this.logEnabled) {
      this.logEvent(event, args);
    }
    
    return super.emit(event, ...args);
  }
  
  /**
   * Log an event
   */
  logEvent(event, args) {
    const entry = {
      event,
      args: args.map(arg => {
        // Serialize complex objects safely
        try {
          return JSON.parse(JSON.stringify(arg));
        } catch {
          return '[Complex Object]';
        }
      }),
      timestamp: Date.now(),
      listeners: this.listenerCount(event)
    };
    
    this.eventLog.push(entry);
    
    // Trim log if too large
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
  }
  
  /**
   * Get event log
   */
  getEventLog() {
    return [...this.eventLog];
  }
  
  /**
   * Clear event log
   */
  clearEventLog() {
    this.eventLog = [];
  }
  
  /**
   * Get event statistics
   */
  getEventStats() {
    const stats = {};
    
    for (const entry of this.eventLog) {
      if (!stats[entry.event]) {
        stats[entry.event] = {
          count: 0,
          lastEmitted: null,
          averageListeners: 0
        };
      }
      
      stats[entry.event].count++;
      stats[entry.event].lastEmitted = entry.timestamp;
      stats[entry.event].averageListeners = 
        (stats[entry.event].averageListeners + entry.listeners) / 2;
    }
    
    return stats;
  }
}

/**
 * Create a singleton game event bus
 */
export const gameEventBus = new GameEventBus();

/**
 * Game Events Constants
 * Centralized list of all game events
 */
export const GAME_EVENTS = {
  // Game State
  GAME_START: 'gameStart',
  GAME_PAUSE: 'gamePause',
  GAME_RESUME: 'gameResume',
  GAME_OVER: 'gameOver',
  LEVEL_UP: 'levelUp',
  
  // Piece Events
  PIECE_SPAWN: 'pieceSpawn',
  PIECE_MOVE: 'pieceMove',
  PIECE_ROTATE: 'pieceRotate',
  PIECE_LOCK: 'pieceLock',
  PIECE_HOLD: 'pieceHold',
  HARD_DROP: 'hardDrop',
  SOFT_DROP: 'softDrop',
  
  // Line Clear Events
  LINE_CLEAR: 'lineClear',
  TETRIS: 'tetris',
  PERFECT_CLEAR: 'perfectClear',
  COMBO: 'combo',
  BACK_TO_BACK: 'backToBack',
  
  // Score Events
  SCORE_UPDATE: 'scoreUpdate',
  HIGH_SCORE: 'highScore',
  MILESTONE: 'milestone',
  
  // Visual Events
  SCREEN_SHAKE: 'screenShake',
  PARTICLE_BURST: 'particleBurst',
  COLOR_SHIFT: 'colorShift',
  EFFECT_TRIGGER: 'effectTrigger',
  
  // Audio Events
  PLAY_SOUND: 'playSound',
  PLAY_MUSIC: 'playMusic',
  STOP_MUSIC: 'stopMusic',
  VOLUME_CHANGE: 'volumeChange',
  
  // UI Events
  MENU_OPEN: 'menuOpen',
  MENU_CLOSE: 'menuClose',
  SETTINGS_CHANGE: 'settingsChange',
  
  // Input Events
  KEY_PRESS: 'keyPress',
  KEY_RELEASE: 'keyRelease',
  
  // Performance Events
  FPS_UPDATE: 'fpsUpdate',
  LAG_DETECTED: 'lagDetected'
};

// Freeze events object
Object.freeze(GAME_EVENTS);

export default EventEmitter;