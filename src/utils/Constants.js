/**
 * Constants.js - Core game configuration and constants
 * All game parameters, timings, and settings centralized for easy tuning
 */

// ============================================
// GAME BOARD CONFIGURATION
// ============================================
export const BOARD = {
  WIDTH: 10,                    // Standard Tetris width
  HEIGHT: 20,                   // Standard Tetris visible height  
  HIDDEN_ROWS: 2,              // Buffer rows above visible area
  TOTAL_HEIGHT: 22,            // Total height including hidden rows
  BLOCK_SIZE: 30,              // Size of each block in pixels
  BORDER_WIDTH: 3,             // Border thickness for blocks
  GHOST_OPACITY: 0.3,          // Opacity for ghost piece preview
  GRID_OPACITY: 0.1,           // Background grid line opacity
  SPAWN_ROW: 20,               // Row where new pieces spawn
  SPAWN_COL: 4                 // Column where new pieces spawn (center-ish)
};

// ============================================
// TIMING CONFIGURATION (in milliseconds)
// ============================================
export const TIMING = {
  // Gravity (drop speed) by level - frames per grid cell
  // Based on official Tetris guidelines
  GRAVITY: [
    48, 43, 38, 33, 28, 23, 18, 13, 8, 6,
    5, 5, 5, 4, 4, 4, 3, 3, 3, 2,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 1
  ],
  
  // Extended gravity for levels 30+ (infinite play)
  GRAVITY_EXTENDED: 1,
  
  // Input timings
  DAS: 133,                    // Delayed Auto Shift initial delay
  ARR: 10,                     // Auto Repeat Rate
  SOFT_DROP_MULTIPLIER: 20,    // How much faster soft drop is
  
  // Lock delay system
  LOCK_DELAY: 500,             // Time before piece locks in place
  MAX_LOCK_MOVES: 15,          // Maximum moves/rotations during lock delay
  
  // Animation timings
  LINE_CLEAR_DELAY: 500,       // Time for line clear animation
  SPAWN_DELAY: 200,            // Delay before spawning new piece
  GAME_OVER_DELAY: 2000,       // Delay before game over screen
  
  // Visual effect timings
  FLASH_DURATION: 100,         // Flash effect duration
  PARTICLE_LIFETIME: 1500,     // How long particles live
  SHATTER_DURATION: 800,       // Line clear shatter animation
  DROP_TRAIL_DURATION: 300,    // Hard drop trail effect
  COMBO_DISPLAY_TIME: 2000     // How long combo text displays
};

// ============================================
// SCORING SYSTEM
// ============================================
export const SCORING = {
  // Points for line clears by number of lines
  LINE_CLEAR: {
    1: 100,   // Single
    2: 300,   // Double
    3: 500,   // Triple
    4: 800    // Tetris!
  },
  
  // Score multipliers
  LEVEL_MULTIPLIER: 1,         // Multiply by current level
  SOFT_DROP: 1,                // Points per cell for soft drop
  HARD_DROP: 2,                // Points per cell for hard drop
  
  // Combo system
  COMBO_MULTIPLIER: 50,        // Bonus per consecutive clear
  BACK_TO_BACK_MULTIPLIER: 1.5, // Bonus for consecutive Tetrises
  
  // Special bonuses
  PERFECT_CLEAR: 1000,         // Clearing entire board
  T_SPIN_MULTIPLIER: 2,        // T-spin bonus multiplier
  
  // Level progression
  LINES_PER_LEVEL: 10,         // Lines needed to advance level
  SPEED_CAP_LEVEL: 29          // Level where speed maxes out
};

// ============================================
// CONTROLS CONFIGURATION
// ============================================
export const CONTROLS = {
  // Primary controls
  MOVE_LEFT: ['ArrowLeft', 'KeyA'],
  MOVE_RIGHT: ['ArrowRight', 'KeyD'],
  ROTATE_CW: ['ArrowUp', 'KeyX'],        // Clockwise
  ROTATE_CCW: ['KeyZ', 'Control'],       // Counter-clockwise
  SOFT_DROP: ['ArrowDown', 'KeyS'],
  HARD_DROP: ['Space'],
  
  // Secondary controls
  HOLD: ['KeyC', 'Shift'],
  PAUSE: ['KeyP', 'Escape'],
  RESTART: ['KeyR'],
  
  // UI controls
  TOGGLE_GHOST: ['KeyG'],
  TOGGLE_GRID: ['KeyH'],
  TOGGLE_STATS: ['F3'],
  TOGGLE_SOUND: ['KeyM'],
  
  // Prevent these keys from being held
  NO_REPEAT: ['Space', 'KeyC', 'Shift', 'KeyP', 'Escape', 'KeyR']
};

// ============================================
// TETROMINO DEFINITIONS
// ============================================
export const PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00F0F0',  // Cyan
    name: 'I-piece',
    rotationPoint: [1.5, 1.5]  // Center of rotation
  },
  
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#F0F000',  // Yellow
    name: 'O-piece',
    rotationPoint: [0.5, 0.5]  // Doesn't rotate
  },
  
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#A000F0',  // Purple
    name: 'T-piece',
    rotationPoint: [1, 1]
  },
  
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00F000',  // Green
    name: 'S-piece',
    rotationPoint: [1, 1]
  },
  
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#F00000',  // Red
    name: 'Z-piece',
    rotationPoint: [1, 1]
  },
  
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000F0',  // Blue
    name: 'J-piece',
    rotationPoint: [1, 1]
  },
  
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#F0A000',  // Orange
    name: 'L-piece',
    rotationPoint: [1, 1]
  }
};

// ============================================
// GAME STATES
// ============================================
export const GAME_STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LINE_CLEAR: 'LINE_CLEAR',
  GAME_OVER: 'GAME_OVER',
  COUNTDOWN: 'COUNTDOWN',
  LEVEL_TRANSITION: 'LEVEL_TRANSITION'
};

// ============================================
// VISUAL EFFECTS CONFIGURATION
// ============================================
export const EFFECTS = {
  // Particle system
  PARTICLES: {
    COUNT_PER_BLOCK: 15,       // Particles per shattered block
    MIN_SIZE: 2,               // Minimum particle size
    MAX_SIZE: 8,               // Maximum particle size
    MIN_SPEED: 100,            // Minimum particle velocity
    MAX_SPEED: 400,            // Maximum particle velocity
    GRAVITY: 500,              // Particle gravity
    FADE_RATE: 2,              // How fast particles fade
    ROTATION_SPEED: 5,         // Particle rotation speed
    MAX_PARTICLES: 5000        // Performance cap
  },
  
  // Camera effects
  CAMERA: {
    SHAKE_INTENSITY: 5,        // Screen shake amount
    SHAKE_DURATION: 200,       // Screen shake time
    ZOOM_AMOUNT: 1.02,         // Zoom on hard drop
    ZOOM_DURATION: 100,        // Zoom animation time
    FOV: 60,                   // Field of view
    NEAR: 0.1,                 // Near clipping plane
    FAR: 1000                  // Far clipping plane
  },
  
  // Lighting
  LIGHTING: {
    AMBIENT_INTENSITY: 0.4,    // Base light level
    DIRECTIONAL_INTENSITY: 0.6, // Main light intensity
    BLOCK_GLOW_INTENSITY: 1.5, // Block emission strength
    PULSE_SPEED: 2,            // Light pulsing speed
    COLOR_SHIFT_SPEED: 0.5     // Rainbow effect speed
  },
  
  // Post-processing
  POST: {
    BLOOM_STRENGTH: 1.5,       // Glow intensity
    BLOOM_RADIUS: 0.8,         // Glow spread
    BLOOM_THRESHOLD: 0.7,      // What glows
    CHROMATIC_ABERRATION: 0.002, // Color split effect
    FILM_GRAIN: 0.05,          // Noise amount
    VIGNETTE: 0.3              // Edge darkening
  }
};

// ============================================
// AUDIO CONFIGURATION
// ============================================
export const AUDIO = {
  // Volume levels (0-1)
  MASTER_VOLUME: 0.7,
  MUSIC_VOLUME: 0.5,
  SFX_VOLUME: 0.8,
  
  // Sound effect names
  SFX: {
    MOVE: 'move',
    ROTATE: 'rotate',
    SOFT_DROP: 'softDrop',
    HARD_DROP: 'hardDrop',
    LINE_CLEAR: 'lineClear',
    TETRIS: 'tetris',
    LEVEL_UP: 'levelUp',
    GAME_OVER: 'gameOver',
    PAUSE: 'pause',
    MENU_SELECT: 'menuSelect',
    COMBO: 'combo',
    HOLD: 'hold'
  },
  
  // Music tracks
  MUSIC: {
    MENU: 'menuTheme',
    GAME: 'gameTheme',
    GAME_FAST: 'gameThemeFast',
    GAME_OVER: 'gameOverTheme'
  },
  
  // Audio settings
  FADE_DURATION: 1000,        // Music fade time
  SPEED_UP_LEVEL: 15          // When to switch to fast music
};

// ============================================
// PERFORMANCE CONFIGURATION
// ============================================
export const PERFORMANCE = {
  TARGET_FPS: 60,
  ENABLE_STATS: true,          // Show FPS counter
  ENABLE_DEBUG: true,          // Show debug panel
  MAX_DELTA_TIME: 100,         // Max frame time (prevent spiral of death)
  FIXED_TIME_STEP: 1000 / 60, // Fixed update rate
  INTERPOLATION: true,         // Smooth rendering
  ANTIALIAS: true,             // Edge smoothing
  PIXEL_RATIO: window.devicePixelRatio || 1,
  SHADOW_MAP_SIZE: 2048,       // Shadow quality
  ENABLE_SHADOWS: true
};

// ============================================
// DEVELOPMENT SETTINGS
// ============================================
export const DEV = {
  SKIP_MENU: false,            // Start game immediately
  INVINCIBLE: false,           // Can't lose
  START_LEVEL: 1,              // Starting level for testing
  SHOW_COLLISION_BOXES: false, // Debug collision
  LOG_PERFORMANCE: false,      // Console performance stats
  PIECE_SEQUENCE: null,        // Force specific piece order for testing
  FAST_DROP: false,            // All pieces drop instantly
  UNLOCK_ALL: false            // All features unlocked
};

// Freeze all objects to prevent accidental modification
Object.freeze(BOARD);
Object.freeze(TIMING);
Object.freeze(SCORING);
Object.freeze(CONTROLS);
Object.freeze(PIECES);
Object.freeze(GAME_STATE);
Object.freeze(EFFECTS);
Object.freeze(AUDIO);
Object.freeze(PERFORMANCE);
Object.freeze(DEV);

export default {
  BOARD,
  TIMING,
  SCORING,
  CONTROLS,
  PIECES,
  GAME_STATE,
  EFFECTS,
  AUDIO,
  PERFORMANCE,
  DEV
};