/**
 * Game.js - Main game logic controller
 * Orchestrates all game systems and manages game state
 */

import { EventEmitter } from './EventEmitter.js';
import { Board } from './Board.js';
import { Piece, PieceBag } from './Piece.js';
import { Score } from './Score.js';
import { Input } from './Input.js';
import { BOARD, TIMING } from '../utils/Constants.js';

export class Game extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    
    // Game systems
    this.board = new Board();
    this.score = new Score(options.startLevel || 1);
    this.input = new Input();
    this.pieceBag = new PieceBag();
    
    // Current pieces
    this.currentPiece = null;
    this.nextPiece = null;
    this.holdPiece = null;
    this.canHold = true;
    
    // Game settings
    this.settings = {
      ghostPiece: options.ghostPiece !== false,
      particles: options.particles !== false,
      screenShake: options.screenShake !== false
    };
    
    // Timing
    this.lastUpdateTime = 0;
    this.dropCounter = 0;
    this.lockDelay = 0;
    this.lockMoves = 0;
    
    this.init();
  }

  /**
   * Initialize game systems
   */
  init() {
    // Setup input listeners
    this.setupInputListeners();
    
    // Setup board listeners
    this.setupBoardListeners();
    
    // Setup score listeners
    this.setupScoreListeners();
  }

  /**
   * Setup input event listeners
   */
  setupInputListeners() {
    this.input.on('moveLeft', () => this.movePiece(-1));
    this.input.on('moveRight', () => this.movePiece(1));
    this.input.on('softDrop', () => this.softDrop());
    this.input.on('hardDrop', () => this.hardDrop());
    this.input.on('rotateClockwise', () => this.rotatePiece(1));
    this.input.on('rotateCounterClockwise', () => this.rotatePiece(-1));
    this.input.on('hold', () => this.holdCurrentPiece());
    this.input.on('pause', () => this.togglePause());
  }

  /**
   * Setup board event listeners
   */
  setupBoardListeners() {
    this.board.on('linesCleared', (data) => {
      this.emit('linesCleared', {
        lines: data.count,
        totalLines: this.score.getLines()
      });
    });
  }

  /**
   * Setup score event listeners
   */
  setupScoreListeners() {
    this.score.on('scoreUpdate', (data) => {
      this.emit('scoreUpdate', data);
    });

    this.score.on('levelUp', (data) => {
      this.emit('levelUp', data);
    });

    this.score.on('combo', (data) => {
      this.emit('combo', data);
    });
  }

  /**
   * Start the game
   */
  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;
    
    // Reset systems
    this.board.clear();
    this.score.reset(this.score.getLevel());
    this.pieceBag.reset();
    
    // Spawn initial pieces
    this.nextPiece = this.pieceBag.getNext();
    this.emit('nextPiece', { type: this.nextPiece.type });
    
    this.spawnPiece();
    
    this.lastUpdateTime = Date.now();
    
    this.emit('gameStart', {
      level: this.score.getLevel()
    });
  }

  /**
   * Update game state (called every frame)
   */
  update() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    // Apply gravity
    this.updateGravity(deltaTime);
  }

  /**
   * Update gravity and piece falling
   */
  updateGravity(deltaTime) {
    if (!this.currentPiece) return;

    const gravitySpeed = this.score.getGravitySpeed();
    const dropInterval = gravitySpeed * 16.67; // Convert frames to ms (60fps)

    this.dropCounter += deltaTime;

    if (this.dropCounter >= dropInterval) {
      this.dropCounter = 0;
      
      if (this.board.canPlacePiece(this.currentPiece, 1, 0)) {
        this.currentPiece.move(1, 0);
        this.lockDelay = 0;
        this.lockMoves = 0;
      } else {
        this.handleLockDelay(deltaTime);
      }
    }
  }

  /**
   * Handle lock delay when piece touches ground
   */
  handleLockDelay(deltaTime) {
    this.lockDelay += deltaTime;

    if (this.lockDelay >= TIMING.LOCK_DELAY || this.lockMoves >= TIMING.MAX_LOCK_MOVES) {
      this.lockPiece();
    }
  }

  /**
   * Spawn a new piece
   */
  spawnPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.pieceBag.getNext();
    this.canHold = true;
    
    this.emit('nextPiece', { type: this.nextPiece.type });
    this.emit('pieceSpawn', { type: this.currentPiece.type });

    // Check if piece can spawn
    if (!this.board.canPlacePiece(this.currentPiece)) {
      this.endGame();
    }
  }

  /**
   * Move piece horizontally
   */
  movePiece(direction) {
    if (!this.currentPiece || this.isGameOver) return;

    if (this.board.canPlacePiece(this.currentPiece, 0, direction)) {
      this.currentPiece.move(0, direction);
      this.lockMoves++;
      this.emit('pieceMove', { direction });
    }
  }

  /**
   * Rotate piece
   */
  rotatePiece(direction) {
    if (!this.currentPiece || this.isGameOver) return;

    const oldRotation = this.currentPiece.rotation;
    
    if (direction > 0) {
      this.currentPiece.rotateClockwise();
    } else {
      this.currentPiece.rotateCounterClockwise();
    }

    // Try rotation, with wall kicks
    if (!this.board.canPlacePiece(this.currentPiece)) {
      // Try wall kicks
      const kicked = this.tryWallKicks();
      
      if (!kicked) {
        // Revert rotation if all kicks fail
        this.currentPiece.setRotation(oldRotation);
        return;
      }
    }

    this.lockMoves++;
    this.emit('pieceRotate', { direction });
  }

  /**
   * Try wall kick positions
   */
  tryWallKicks() {
    const kicks = [
      [0, 1],   // Right
      [0, -1],  // Left
      [0, 2],   // Right 2
      [0, -2],  // Left 2
      [-1, 0],  // Up
      [-1, 1],  // Up-Right
      [-1, -1]  // Up-Left
    ];

    for (const [rowOffset, colOffset] of kicks) {
      if (this.board.canPlacePiece(this.currentPiece, rowOffset, colOffset)) {
        this.currentPiece.move(rowOffset, colOffset);
        return true;
      }
    }

    return false;
  }

  /**
   * Soft drop (move piece down faster)
   */
  softDrop() {
    if (!this.currentPiece || this.isGameOver) return;

    if (this.board.canPlacePiece(this.currentPiece, 1, 0)) {
      this.currentPiece.move(1, 0);
      this.score.addSoftDropScore(1);
      this.dropCounter = 0;
      this.lockDelay = 0;
    } else {
      this.lockPiece();
    }
  }

  /**
   * Hard drop (instantly drop piece)
   */
  hardDrop() {
    if (!this.currentPiece || this.isGameOver) return;

    const startRow = this.currentPiece.row;
    const ghostRow = this.board.getGhostPosition(this.currentPiece);
    const distance = ghostRow - startRow;

    this.currentPiece.setPosition(ghostRow, this.currentPiece.col);
    this.score.addHardDropScore(distance);
    
    this.emit('hardDrop', { distance });
    
    this.lockPiece();
  }

  /**
   * Hold current piece
   */
  holdCurrentPiece() {
    if (!this.canHold || !this.currentPiece || this.isGameOver) return;

    if (this.holdPiece) {
      // Swap with held piece
      const temp = this.holdPiece;
      this.holdPiece = new Piece(this.currentPiece.type);
      this.currentPiece = new Piece(temp.type);
    } else {
      // Store current piece and spawn next
      this.holdPiece = new Piece(this.currentPiece.type);
      this.currentPiece = this.nextPiece;
      this.nextPiece = this.pieceBag.getNext();
      this.emit('nextPiece', { type: this.nextPiece.type });
    }

    this.canHold = false;
    this.lockDelay = 0;
    this.lockMoves = 0;
    this.dropCounter = 0;

    this.emit('holdPiece', { type: this.holdPiece ? this.holdPiece.type : null });
    this.emit('pieceSpawn', { type: this.currentPiece.type });
  }

  /**
   * Lock piece to board
   */
  lockPiece() {
    if (!this.currentPiece) return;

    // Lock piece
    const blocks = this.board.lockPiece(this.currentPiece);
    this.score.incrementPiecesPlaced();

    // Check for line clears
    const completedLines = this.board.checkLines();
    
    if (completedLines.length > 0) {
      this.board.clearLines(completedLines);
      this.score.addLineClearScore(completedLines.length);
      
      // Check for perfect clear
      if (this.board.isPerfectClear()) {
        this.score.addPerfectClearBonus();
        this.emit('perfectClear');
      }
    } else {
      // Reset combo if no lines cleared
      this.score.combo = 0;
    }

    // Reset lock delay
    this.lockDelay = 0;
    this.lockMoves = 0;
    this.dropCounter = 0;

    // Spawn next piece
    setTimeout(() => {
      this.spawnPiece();
    }, TIMING.SPAWN_DELAY);
  }

  /**
   * Pause the game
   */
  pause() {
    if (!this.isRunning || this.isGameOver) return;
    this.isPaused = true;
    this.input.disable();
    this.emit('gamePause');
  }

  /**
   * Resume the game
   */
  resume() {
    if (!this.isRunning || !this.isPaused || this.isGameOver) return;
    this.isPaused = false;
    this.input.enable();
    this.lastUpdateTime = Date.now();
    this.emit('gameResume');
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * End the game
   */
  endGame() {
    this.isGameOver = true;
    this.isRunning = false;
    this.score.endGame();
    this.input.disable();

    const stats = this.score.getStats();
    
    this.emit('gameOver', stats);
  }

  /**
   * Get current game state
   */
  getState() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      isGameOver: this.isGameOver,
      score: this.score.getScore(),
      level: this.score.getLevel(),
      lines: this.score.getLines(),
      currentPiece: this.currentPiece ? this.currentPiece.getInfo() : null,
      nextPiece: this.nextPiece ? this.nextPiece.type : null,
      holdPiece: this.holdPiece ? this.holdPiece.type : null,
      canHold: this.canHold,
      board: this.board.getBoard()
    };
  }

  /**
   * Get ghost piece position
   */
  getGhostPosition() {
    if (!this.currentPiece || !this.settings.ghostPiece) return null;
    
    const ghostRow = this.board.getGhostPosition(this.currentPiece);
    return {
      row: ghostRow,
      col: this.currentPiece.col,
      type: this.currentPiece.type,
      rotation: this.currentPiece.rotation,
      shape: this.currentPiece.getCurrentShape()
    };
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.isRunning = false;
    this.input.dispose();
    this.removeAllListeners();
    this.board.removeAllListeners();
    this.score.removeAllListeners();
  }
}