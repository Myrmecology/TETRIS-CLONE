/**
 * Game.js - Main game engine for Tetris Neon Shatter
 * Orchestrates all game systems and manages the game loop
 */

import { GAME_STATE, TIMING, BOARD, PERFORMANCE, DEV } from '../utils/Constants.js';
import { PieceBag, getGravity, framesToMs } from '../utils/Helpers.js';
import { Board } from './Board.js';
import { Piece } from './Piece.js';
import { ScoreManager } from './Score.js';
import { inputHandler } from './Input.js';
import { gameEventBus, GAME_EVENTS } from './EventEmitter.js';

/**
 * Main Game Engine Class
 * Coordinates all game systems and runs the game loop
 */
export class Game {
  constructor() {
    // Core systems
    this.board = new Board();
    this.scoreManager = new ScoreManager();
    this.pieceBag = new PieceBag();
    
    // Game state
    this.state = GAME_STATE.MENU;
    this.previousState = null;
    
    // Pieces
    this.currentPiece = null;
    this.heldPiece = null;
    this.nextPieces = [];
    this.canHold = true;
    
    // Timing
    this.gameTime = 0;
    this.frameTime = 0;
    this.deltaTime = 0;
    this.lastFrameTime = performance.now();
    this.accumulator = 0;
    this.fixedTimeStep = PERFORMANCE.FIXED_TIME_STEP;
    
    // Game loop
    this.animationId = null;
    this.isRunning = false;
    
    // Performance monitoring
    this.fps = 60;
    this.frameCount = 0;
    this.fpsUpdateTimer = 0;
    
    // Game flow
    this.countdownTimer = 0;
    this.gameOverTimer = 0;
    this.levelTransitionTimer = 0;
    
    // Effects and animations
    this.screenShake = 0;
    this.screenFlash = 0;
    this.speedLinesIntensity = 0;
    
    // Development/debug
    this.debugMode = DEV.SHOW_COLLISION_BOXES;
    this.stats = {
      updates: 0,
      renders: 0,
      pieceCount: 0
    };
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize game systems
   */
  init() {
    // Setup input handlers
    this.setupInput();
    
    // Setup board event listeners
    this.setupBoardEvents();
    
    // Setup game event listeners
    this.setupGameEvents();
    
    // Generate initial piece queue
    this.refillNextPieces();
    
    // Set initial state
    if (DEV.SKIP_MENU) {
      this.state = GAME_STATE.COUNTDOWN;
    }
    
    console.log('🎮 Tetris Neon Shatter initialized');
  }
  
  /**
   * Setup input handlers
   */
  setupInput() {
    // Movement
    inputHandler.onAction('MOVE_LEFT', () => {
      if (this.state === GAME_STATE.PLAYING && this.currentPiece) {
        if (this.currentPiece.moveLeft()) {
          gameEventBus.emit(GAME_EVENTS.PIECE_MOVE, { direction: 'left' });
        }
      }
    });
    
    inputHandler.onAction('MOVE_RIGHT', () => {
      if (this.state === GAME_STATE.PLAYING && this.currentPiece) {
        if (this.currentPiece.moveRight()) {
          gameEventBus.emit(GAME_EVENTS.PIECE_MOVE, { direction: 'right' });
        }
      }
    });
    
    // Rotation
    inputHandler.onAction('ROTATE_CW', () => {
      if (this.state === GAME_STATE.PLAYING && this.currentPiece) {
        if (this.currentPiece.rotateCW()) {
          gameEventBus.emit(GAME_EVENTS.PIECE_ROTATE, { direction: 'cw' });
        }
      }
    });
    
    inputHandler.onAction('ROTATE_CCW', () => {
      if (this.state === GAME_STATE.PLAYING && this.currentPiece) {
        if (this.currentPiece.rotateCCW()) {
          gameEventBus.emit(GAME_EVENTS.PIECE_ROTATE, { direction: 'ccw' });
        }
      }
    });
    
    // Drops
    inputHandler.onAction('SOFT_DROP', () => {
      if (this.state === GAME_STATE.PLAYING && this.currentPiece) {
        this.currentPiece.softDropping = true;
        gameEventBus.emit(GAME_EVENTS.SOFT_DROP, { start: true });
      }
    });
    
    inputHandler.onAction('SOFT_DROP_RELEASE', () => {
      if (this.currentPiece) {
        this.currentPiece.softDropping = false;
        gameEventBus.emit(GAME_EVENTS.SOFT_DROP, { start: false });
      }
    });
    
    inputHandler.onAction('HARD_DROP', (isInitial) => {
      if (!isInitial) return; // Only on key press, not repeat
      if (this.state === GAME_STATE.PLAYING && this.currentPiece) {
        const distance = this.currentPiece.hardDrop();
        this.scoreManager.addHardDropScore(distance);
        
        // Add effects
        this.screenShake = 10;
        this.screenFlash = 0.5;
        
        gameEventBus.emit(GAME_EVENTS.HARD_DROP, { distance });
        
        // Immediately lock and spawn next
        this.handlePieceLock();
      }
    });
    
    // Hold
    inputHandler.onAction('HOLD', (isInitial) => {
      if (!isInitial) return;
      if (this.state === GAME_STATE.PLAYING) {
        this.holdPiece();
      }
    });
    
    // Pause
    inputHandler.onAction('PAUSE', (isInitial) => {
      if (!isInitial) return;
      this.togglePause();
    });
    
    // Restart
    inputHandler.onAction('RESTART', (isInitial) => {
      if (!isInitial) return;
      if (this.state === GAME_STATE.GAME_OVER) {
        this.restart();
      }
    });
  }
  
  /**
   * Setup board event listeners
   */
  setupBoardEvents() {
    this.board.on('linesCleared', (data) => {
      const score = this.scoreManager.addLineClearScore(data.count);
      
      // Add effects based on lines cleared
      if (data.count === 4) {
        this.screenShake = 20;
        this.screenFlash = 1;
        gameEventBus.emit(GAME_EVENTS.TETRIS);
      } else {
        this.screenShake = data.count * 5;
        this.screenFlash = data.count * 0.2;
      }
      
      gameEventBus.emit(GAME_EVENTS.LINE_CLEAR, {
        lines: data.count,
        score,
        combo: data.combo
      });
    });
    
    this.board.on('perfectClear', () => {
      const bonus = this.scoreManager.addPerfectClearScore();
      this.screenFlash = 2;
      gameEventBus.emit(GAME_EVENTS.PERFECT_CLEAR, { bonus });
    });
    
    this.board.on('dangerHigh', (level) => {
      this.speedLinesIntensity = level / 100;
    });
  }
  
  /**
   * Setup game event listeners
   */
  setupGameEvents() {
    gameEventBus.on(GAME_EVENTS.LEVEL_UP, (data) => {
      this.state = GAME_STATE.LEVEL_TRANSITION;
      this.levelTransitionTimer = 0;
    });
  }
  
  /**
   * Start the game
   */
  start() {
    if (this.isRunning) return;
    
    console.log('🚀 Starting game');
    
    this.reset();
    this.state = GAME_STATE.COUNTDOWN;
    this.countdownTimer = 3000; // 3 second countdown
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
    
    gameEventBus.emit(GAME_EVENTS.GAME_START);
  }
  
  /**
   * Main game loop
   */
  gameLoop = (currentTime) => {
    if (!this.isRunning) return;
    
    // Calculate delta time
    this.deltaTime = Math.min(currentTime - this.lastFrameTime, PERFORMANCE.MAX_DELTA_TIME);
    this.lastFrameTime = currentTime;
    
    // Fixed timestep with interpolation
    this.accumulator += this.deltaTime;
    
    while (this.accumulator >= this.fixedTimeStep) {
      this.fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }
    
    // Variable update for animations
    this.update(this.deltaTime);
    
    // Update FPS
    this.updateFPS(this.deltaTime);
    
    // Continue loop
    this.animationId = requestAnimationFrame(this.gameLoop);
  }
  
  /**
   * Fixed timestep update (game logic)
   */
  fixedUpdate(deltaTime) {
    this.stats.updates++;
    
    // Update based on game state
    switch (this.state) {
      case GAME_STATE.COUNTDOWN:
        this.updateCountdown(deltaTime);
        break;
        
      case GAME_STATE.PLAYING:
        this.updatePlaying(deltaTime);
        break;
        
      case GAME_STATE.LINE_CLEAR:
        this.updateLineClear(deltaTime);
        break;
        
      case GAME_STATE.LEVEL_TRANSITION:
        this.updateLevelTransition(deltaTime);
        break;
        
      case GAME_STATE.GAME_OVER:
        this.updateGameOver(deltaTime);
        break;
    }
  }
  
  /**
   * Variable timestep update (animations)
   */
  update(deltaTime) {
    // Update input system
    inputHandler.update(deltaTime);
    
    // Update score animations
    this.scoreManager.update(deltaTime);
    
    // Update visual effects
    this.updateEffects(deltaTime);
    
    // Update game time
    if (this.state === GAME_STATE.PLAYING) {
      this.gameTime += deltaTime;
    }
    
    this.stats.renders++;
  }
  
  /**
   * Update countdown state
   */
  updateCountdown(deltaTime) {
    this.countdownTimer -= deltaTime;
    
    if (this.countdownTimer <= 0) {
      this.state = GAME_STATE.PLAYING;
      this.spawnNextPiece();
      inputHandler.enable();
    }
  }
  
  /**
   * Update playing state
   */
  updatePlaying(deltaTime) {
    if (!this.currentPiece) {
      this.spawnNextPiece();
      return;
    }
    
    // Update current piece with gravity
    const gravity = framesToMs(getGravity(this.scoreManager.level));
    this.currentPiece.update(deltaTime, gravity);
    
    // Check if piece is locked
    if (this.currentPiece.locked) {
      this.handlePieceLock();
    }
    
    // Update board animations
    if (this.board.isClearing) {
      this.state = GAME_STATE.LINE_CLEAR;
    }
  }
  
  /**
   * Update line clear state
   */
  updateLineClear(deltaTime) {
    this.board.updateLineClear(deltaTime);
    
    if (!this.board.isClearing) {
      this.state = GAME_STATE.PLAYING;
      this.spawnNextPiece();
    }
  }
  
  /**
   * Update level transition
   */
  updateLevelTransition(deltaTime) {
    this.levelTransitionTimer += deltaTime;
    
    if (this.levelTransitionTimer >= 2000) {
      this.state = GAME_STATE.PLAYING;
      this.levelTransitionTimer = 0;
    }
  }
  
  /**
   * Update game over state
   */
  updateGameOver(deltaTime) {
    this.gameOverTimer += deltaTime;
    
    if (this.gameOverTimer >= TIMING.GAME_OVER_DELAY) {
      // Save high score
      if (this.scoreManager.isNewHighScore) {
        this.scoreManager.saveHighScore();
      }
    }
  }
  
  /**
   * Update visual effects
   */
  updateEffects(deltaTime) {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.9;
      if (this.screenShake < 0.1) this.screenShake = 0;
    }
    
    // Screen flash decay
    if (this.screenFlash > 0) {
      this.screenFlash -= deltaTime / 1000;
      if (this.screenFlash < 0) this.screenFlash = 0;
    }
    
    // Speed lines decay
    if (this.speedLinesIntensity > 0) {
      this.speedLinesIntensity *= 0.95;
      if (this.speedLinesIntensity < 0.01) this.speedLinesIntensity = 0;
    }
  }
  
  /**
   * Handle piece locking
   */
  handlePieceLock() {
    // Place piece on board
    const linesCleared = this.board.placePiece(this.currentPiece);
    
    // Update score for soft drops during the piece lifetime
    if (this.currentPiece.distanceFallen > 0) {
      this.scoreManager.addSoftDropScore(this.currentPiece.distanceFallen);
    }
    
    // Update statistics
    this.scoreManager.addPiece();
    this.stats.pieceCount++;
    
    // Clear current piece
    this.currentPiece = null;
    this.canHold = true;
    
    // Check for game over
    const nextPieceType = this.nextPieces[0];
    const testPiece = new Piece(nextPieceType, this.board.grid);
    
    if (this.board.checkGameOver(testPiece)) {
      this.gameOver();
    } else if (!this.board.isClearing) {
      // Spawn next piece if not clearing lines
      this.spawnNextPiece();
    }
    
    gameEventBus.emit(GAME_EVENTS.PIECE_LOCK);
  }
  
  /**
   * Spawn next piece
   */
  spawnNextPiece() {
    // Get next piece type
    const pieceType = this.nextPieces.shift();
    this.refillNextPieces();
    
    // Create new piece
    this.currentPiece = new Piece(pieceType, this.board.grid);
    
    // Check spawn collision (game over)
    if (!this.currentPiece.calculateGhostPosition()) {
      this.gameOver();
      return;
    }
    
    gameEventBus.emit(GAME_EVENTS.PIECE_SPAWN, {
      type: pieceType,
      position: { row: this.currentPiece.row, col: this.currentPiece.col }
    });
  }
  
  /**
   * Hold current piece
   */
  holdPiece() {
    if (!this.currentPiece || !this.canHold) return;
    
    const currentType = this.currentPiece.type;
    
    if (this.heldPiece === null) {
      // First hold
      this.heldPiece = currentType;
      this.spawnNextPiece();
    } else {
      // Swap with held piece
      const tempType = this.heldPiece;
      this.heldPiece = currentType;
      this.currentPiece = new Piece(tempType, this.board.grid);
    }
    
    this.canHold = false;
    
    gameEventBus.emit(GAME_EVENTS.PIECE_HOLD, {
      held: this.heldPiece,
      swapped: currentType
    });
  }
  
  /**
   * Refill next pieces queue
   */
  refillNextPieces() {
    while (this.nextPieces.length < 5) {
      this.nextPieces.push(this.pieceBag.getNext());
    }
  }
  
  /**
   * Toggle pause
   */
  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.pause();
    } else if (this.state === GAME_STATE.PAUSED) {
      this.resume();
    }
  }
  
  /**
   * Pause game
   */
  pause() {
    if (this.state !== GAME_STATE.PLAYING) return;
    
    this.previousState = this.state;
    this.state = GAME_STATE.PAUSED;
    this.scoreManager.pause();
    inputHandler.pause();
    
    gameEventBus.emit(GAME_EVENTS.GAME_PAUSE);
  }
  
  /**
   * Resume game
   */
  resume() {
    if (this.state !== GAME_STATE.PAUSED) return;
    
    this.state = this.previousState || GAME_STATE.PLAYING;
    this.scoreManager.resume();
    inputHandler.resume();
    
    gameEventBus.emit(GAME_EVENTS.GAME_RESUME);
  }
  
  /**
   * Game over
   */
  gameOver() {
    this.state = GAME_STATE.GAME_OVER;
    this.gameOverTimer = 0;
    inputHandler.disable();
    
    gameEventBus.emit(GAME_EVENTS.GAME_OVER, {
      score: this.scoreManager.score,
      level: this.scoreManager.level,
      lines: this.scoreManager.lines,
      time: this.gameTime
    });
  }
  
  /**
   * Restart game
   */
  restart() {
    this.reset();
    this.start();
  }
  
  /**
   * Reset game state
   */
  reset() {
    // Reset all systems
    this.board.reset();
    this.scoreManager.reset();
    this.pieceBag.reset();
    
    // Reset pieces
    this.currentPiece = null;
    this.heldPiece = null;
    this.nextPieces = [];
    this.canHold = true;
    
    // Reset timing
    this.gameTime = 0;
    this.frameTime = 0;
    
    // Reset effects
    this.screenShake = 0;
    this.screenFlash = 0;
    this.speedLinesIntensity = 0;
    
    // Refill pieces
    this.refillNextPieces();
  }
  
  /**
   * Stop game
   */
  stop() {
    this.isRunning = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    inputHandler.disable();
  }
  
  /**
   * Update FPS counter
   */
  updateFPS(deltaTime) {
    this.frameCount++;
    this.fpsUpdateTimer += deltaTime;
    
    if (this.fpsUpdateTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTimer = 0;
      
      gameEventBus.emit(GAME_EVENTS.FPS_UPDATE, { fps: this.fps });
    }
  }
  
  /**
   * Get game state for rendering
   */
  getRenderState() {
    return {
      state: this.state,
      board: this.board.getRenderState(),
      currentPiece: this.currentPiece,
      heldPiece: this.heldPiece,
      nextPieces: this.nextPieces,
      score: this.scoreManager.getDisplayData(),
      effects: {
        screenShake: this.screenShake,
        screenFlash: this.screenFlash,
        speedLines: this.speedLinesIntensity
      },
      countdown: Math.ceil(this.countdownTimer / 1000),
      fps: this.fps,
      gameTime: this.gameTime
    };
  }
  
  /**
   * Get game statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      score: this.scoreManager.getStatistics(),
      board: this.board.statistics,
      fps: this.fps
    };
  }
}

export default Game;