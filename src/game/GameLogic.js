import { CONFIG } from '../config.js';
import Tetromino from './Tetromino.js';
import Board from './Board.js';

export default class GameLogic {
    constructor(scene, soundManager, onGameOver) {
        this.scene = scene;
        this.soundManager = soundManager;
        this.onGameOver = onGameOver;
        
        this.board = new Board(scene);
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        
        this.fallSpeed = CONFIG.INITIAL_FALL_SPEED;
        this.lastFallTime = Date.now();
        
        this.isPaused = false;
        this.isGameOver = false;
        
        this.spawnPiece();
        this.spawnNextPiece();
    }

    // Spawn a new tetromino
    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
            this.currentPiece.x = Math.floor(CONFIG.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
            this.currentPiece.y = 0;
            this.currentPiece.updatePosition();
        } else {
            this.currentPiece = new Tetromino(this.scene);
        }
        
        // Check if spawn position is valid
        if (!this.board.isValidPosition(this.currentPiece.getBlockPositions())) {
            this.gameOver();
        }
    }

    // Spawn next piece (for preview) - FIXED: Positioned directly below "Next Piece" text
    spawnNextPiece() {
        this.nextPiece = new Tetromino(this.scene);
        // Position directly below "Next Piece" text on right side
        this.nextPiece.x = -5;  // Further right (more negative)
        this.nextPiece.y = 1;   // Lower on screen (smaller Y)
        this.nextPiece.updatePosition();
    }

    // Update game state
    update() {
        if (this.isPaused || this.isGameOver) return;

        const currentTime = Date.now();
        
        // Auto-fall logic
        if (currentTime - this.lastFallTime > this.fallSpeed) {
            this.moveDown();
            this.lastFallTime = currentTime;
        }

        // Rotate next piece preview slowly
        if (this.nextPiece && this.nextPiece.blocks.length > 0) {
            this.nextPiece.blocks.forEach(block => {
                block.mesh.rotation.y += 0.01;
            });
        }
    }

    // Move current piece left
    moveLeft() {
        if (!this.currentPiece || this.isPaused || this.isGameOver) return;
        
        this.currentPiece.moveLeft();
        
        if (!this.board.isValidPosition(this.currentPiece.getBlockPositions())) {
            this.currentPiece.moveRight(); // Revert
        } else {
            this.soundManager.play('move');
        }
    }

    // Move current piece right
    moveRight() {
        if (!this.currentPiece || this.isPaused || this.isGameOver) return;
        
        this.currentPiece.moveRight();
        
        if (!this.board.isValidPosition(this.currentPiece.getBlockPositions())) {
            this.currentPiece.moveLeft(); // Revert
        } else {
            this.soundManager.play('move');
        }
    }

    // Move current piece down
    moveDown() {
        if (!this.currentPiece || this.isPaused || this.isGameOver) return;
        
        this.currentPiece.moveDown();
        
        if (!this.board.isValidPosition(this.currentPiece.getBlockPositions())) {
            this.currentPiece.y--; // Revert
            this.lockPiece();
        }
    }

    // Rotate current piece
    rotatePiece() {
        if (!this.currentPiece || this.isPaused || this.isGameOver) return;
        
        const oldShape = JSON.parse(JSON.stringify(this.currentPiece.shape));
        this.currentPiece.rotate();
        
        if (!this.board.isValidPosition(this.currentPiece.getBlockPositions())) {
            this.currentPiece.shape = oldShape; // Revert
            this.currentPiece.recreateMesh();
        } else {
            this.soundManager.play('rotate');
        }
    }

    // Hard drop - instant drop to bottom
    hardDrop() {
        if (!this.currentPiece || this.isPaused || this.isGameOver) return;
        
        while (this.board.isValidPosition(this.currentPiece.getBlockPositions())) {
            this.currentPiece.moveDown();
        }
        this.currentPiece.y--; // Revert last move
        this.currentPiece.updatePosition();
        this.lockPiece();
    }

    // Lock piece into board
    lockPiece() {
        if (!this.currentPiece) return;
        
        // IMPORTANT: This plays the "drop" sound - add drop.mp3 to /assets/sounds/ to hear it!
        this.soundManager.play('drop');
        this.board.lockTetromino(this.currentPiece);
        
        // Check for completed lines
        const completedLines = this.board.checkLines();
        
        if (completedLines.length > 0) {
            this.soundManager.play('lineClear');
            this.board.clearLines(completedLines);
            this.updateScore(completedLines.length);
        }
        
        // Clear current piece reference (blocks are now in board)
        this.currentPiece.blocks = [];
        this.currentPiece = null;
        
        // Check game over
        if (this.board.isGameOver()) {
            this.gameOver();
            return;
        }
        
        // Spawn new piece
        this.spawnPiece();
        this.spawnNextPiece();
    }

    // Update score and level
    updateScore(linesCount) {
        // Scoring: 100 for 1 line, 300 for 2, 500 for 3, 800 for 4 (Tetris!)
        const points = [0, 100, 300, 500, 800];
        this.score += points[linesCount] * this.level;
        this.linesCleared += linesCount;
        
        // Level up every 10 lines
        const newLevel = Math.floor(this.linesCleared / CONFIG.LINES_PER_LEVEL) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateFallSpeed();
        }
    }

    // Update fall speed based on level
    updateFallSpeed() {
        this.fallSpeed = Math.max(
            CONFIG.MIN_FALL_SPEED,
            CONFIG.INITIAL_FALL_SPEED - (this.level - 1) * CONFIG.SPEED_INCREASE_PER_LEVEL
        );
    }

    // Pause game
    pause() {
        this.isPaused = true;
    }

    // Resume game
    resume() {
        this.isPaused = false;
        this.lastFallTime = Date.now(); // Reset timer
    }

    // Toggle pause
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    // Game over
    gameOver() {
        this.isGameOver = true;
        this.soundManager.play('gameOver');
        
        if (this.onGameOver) {
            this.onGameOver(this.score, this.level, this.linesCleared);
        }
    }

    // Get current game state
    getState() {
        return {
            score: this.score,
            level: this.level,
            lines: this.linesCleared,
            isPaused: this.isPaused,
            isGameOver: this.isGameOver
        };
    }

    // Dispose game
    dispose() {
        if (this.currentPiece) {
            this.currentPiece.dispose();
        }
        if (this.nextPiece) {
            this.nextPiece.dispose();
        }
        if (this.board) {
            this.board.dispose();
        }
    }
}