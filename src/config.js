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

    // Colors (Amber, Silver, Light Blue, Dark Blue)
    COLORS: {
        AMBER: new BABYLON.Color3(1, 0.75, 0.2),      // #FFBf33
        SILVER: new BABYLON.Color3(0.75, 0.75, 0.75), // #BFBFBF
        LIGHT_BLUE: new BABYLON.Color3(0.4, 0.7, 1),  // #66B3FF
        DARK_BLUE: new BABYLON.Color3(0.1, 0.2, 0.4)  // #1A3366
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

    // Sound file paths
    SOUNDS: {
        MOVE: './assets/sounds/move.mp3',
        ROTATE: './assets/sounds/rotate.mp3',
        DROP: './assets/sounds/drop.mp3',
        LINE_CLEAR: './assets/sounds/line_clear.mp3',
        GAME_OVER: './assets/sounds/game_over.mp3',
        MUSIC: './assets/sounds/music.mp3'
    }
};