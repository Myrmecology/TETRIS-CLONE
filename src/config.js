// Game Configuration
export const CONFIG = {
    // Board dimensions
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    BLOCK_SIZE: 1,

    // Game timing (in milliseconds)
    INITIAL_FALL_SPEED: 1000,
    MIN_FALL_SPEED: 100,
    SPEED_INCREASE_PER_LEVEL: 50,
    LINES_PER_LEVEL: 10,

    // Enhanced Color Palette - Rich Amber Theme
    COLORS: {
        // Primary amber (warm orange-gold)
        AMBER: new BABYLON.Color3(0.95, 0.6, 0.15),        // Rich amber
        AMBER_GLOW: new BABYLON.Color3(1, 0.7, 0.2),       // Brighter for glow
        AMBER_DARK: new BABYLON.Color3(0.7, 0.4, 0.1),     // Darker amber variant
        
        // Supporting colors
        SILVER: new BABYLON.Color3(0.75, 0.75, 0.75),      // Metallic silver
        LIGHT_BLUE: new BABYLON.Color3(0.4, 0.7, 1),       // Cool accent
        DARK_BLUE: new BABYLON.Color3(0.1, 0.2, 0.4),      // Deep background
        
        // New atmospheric colors
        FOG_COLOR: new BABYLON.Color3(0.15, 0.25, 0.4),    // Atmospheric fog
        PLATFORM_COLOR: new BABYLON.Color3(0.08, 0.12, 0.2) // Dark platform
    },

    // Tetromino shapes (standard Tetris pieces)
    SHAPES: {
        I: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        O: [
            [1, 1],
            [1, 1]
        ],
        T: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        S: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        Z: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        J: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        L: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ]
    },

    // Camera settings
    CAMERA: {
        ALPHA: Math.PI / 2,
        BETA: Math.PI / 3,
        RADIUS: 25,
        TARGET: new BABYLON.Vector3(4.5, 10, 0)
    },

    // Visual Enhancement Settings
    VISUALS: {
        // Material properties
        BLOCK_ALPHA: 0.92,                    // Slight transparency
        BLOCK_METALLIC: 0.2,                  // Minimal metallic
        BLOCK_ROUGHNESS: 0.15,                // Smooth/polished
        EMISSIVE_INTENSITY: 0.5,              // Inner glow strength
        
        // Glow layer
        GLOW_INTENSITY: 0.6,                  // Overall glow effect
        GLOW_BLUR_KERNEL: 64,                 // Glow softness
        
        // Lighting
        AMBIENT_INTENSITY: 0.4,               // Base ambient light
        DIRECTIONAL_INTENSITY: 1.2,           // Main amber light
        POINT_LIGHT_INTENSITY: 0.6,           // Additional accent lights
        
        // Particle effects
        PARTICLE_CAPACITY: 100,               // Max particles per system
        LINE_CLEAR_PARTICLE_COUNT: 50,        // Particles when line clears
        DROP_PARTICLE_COUNT: 20,              // Particles when piece drops
        
        // Atmosphere
        FOG_DENSITY: 0.02,                    // Volumetric fog density
        FOG_ENABLED: true                     // Toggle fog
    },

    // Sound file paths - UPDATED TO .wav
    SOUNDS: {
        MOVE: './assets/sounds/move.mp3',
        ROTATE: './assets/sounds/rotate.mp3',
        DROP: './assets/sounds/drop.mp3',
        LINE_CLEAR: './assets/sounds/line_clear.mp3',
        GAME_OVER: './assets/sounds/game_over.mp3',
        MUSIC: './assets/sounds/music.wav'  // ← CHANGED TO .wav!
    }
};