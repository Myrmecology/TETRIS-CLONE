/**
 * Board.js - Game board management for Tetris Neon Shatter
 * Handles the game grid, line clearing, and board state
 */

import { BOARD, TIMING, SCORING, GAME_STATE } from '../utils/Constants.js';
import { 
  create2DArray, 
  clone2DArray,
  findCompletedLines,
  clearLines,
  isValidPosition,
  isGameOver
} from '../utils/Helpers.js';
import { EventEmitter } from './EventEmitter.js';

/**
 * Game Board Class
 * Manages the Tetris playing field and game logic
 */
export class Board extends EventEmitter {
  constructor() {
    super();
    
    // Board state
    this.grid = create2DArray(BOARD.TOTAL_HEIGHT, BOARD.WIDTH, 0);
    this.previousGrid = null;
    
    // Line clearing
    this.linesClearing = [];
    this.lineClearTimer = 0;
    this.isClearing = false;
    this.totalLinesCleared = 0;
    this.linesToClear = [];
    
    // Statistics
    this.statistics = {
      linesCleared: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      perfectClears: 0,
      combo: 0,
      backToBack: false,
      maxCombo: 0,
      totalPiecesPlaced: 0
    };
    
    // Board analysis
    this.heightMap = new Array(BOARD.WIDTH).fill(0);
    this.holes = 0;
    this.roughness = 0;
    this.aggregateHeight = 0;
    this.bumpiness = 0;
    
    // Visual effects data
    this.shakeIntensity = 0;
    this.flashTimer = 0;
    this.lastClearPosition = null;
    this.clearAnimationProgress = 0;
    this.blockAnimations = new Map();
    
    // Danger level (for visual effects)
    this.dangerLevel = 0;
    this.maxHeight = 0;
    
    this.updateAnalysis();
  }
  
  /**
   * Reset the board to initial state
   */
  reset() {
    this.grid = create2DArray(BOARD.TOTAL_HEIGHT, BOARD.WIDTH, 0);
    this.previousGrid = null;
    this.linesClearing = [];
    this.lineClearTimer = 0;
    this.isClearing = false;
    this.totalLinesCleared = 0;
    this.linesToClear = [];
    
    // Reset statistics
    this.statistics = {
      linesCleared: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      perfectClears: 0,
      combo: 0,
      backToBack: false,
      maxCombo: 0,
      totalPiecesPlaced: 0
    };
    
    // Reset analysis
    this.heightMap.fill(0);
    this.holes = 0;
    this.roughness = 0;
    this.aggregateHeight = 0;
    this.bumpiness = 0;
    this.dangerLevel = 0;
    this.maxHeight = 0;
    
    // Clear animations
    this.blockAnimations.clear();
    this.shakeIntensity = 0;
    
    this.emit('boardReset');
  }
  
  /**
   * Get a cell value from the grid
   */
  getCell(row, col) {
    if (row < 0 || row >= BOARD.TOTAL_HEIGHT || 
        col < 0 || col >= BOARD.WIDTH) {
      return null;
    }
    return this.grid[row][col];
  }
  
  /**
   * Set a cell value in the grid
   */
  setCell(row, col, value) {
    if (row >= 0 && row < BOARD.TOTAL_HEIGHT && 
        col >= 0 && col < BOARD.WIDTH) {
      this.grid[row][col] = value;
    }
  }
  
  /**
   * Check if a piece can be placed at position
   */
  canPlacePiece(piece, row, col) {
    return isValidPosition(this.grid, piece.shape, row, col);
  }
  
  /**
   * Place a piece on the board
   */
  placePiece(piece) {
    // Save previous state for animations
    this.previousGrid = clone2DArray(this.grid);
    
    // Place the piece
    piece.placeOnBoard();
    this.statistics.totalPiecesPlaced++;
    
    // Check for completed lines
    const completedLines = findCompletedLines(this.grid);
    
    if (completedLines.length > 0) {
      this.startLineClear(completedLines);
      return completedLines.length;
    } else {
      // Reset combo if no lines cleared
      this.statistics.combo = 0;
      this.statistics.backToBack = false;
    }
    
    // Update board analysis
    this.updateAnalysis();
    
    // Check for perfect clear
    if (this.isPerfectClear()) {
      this.statistics.perfectClears++;
      this.emit('perfectClear');
    }
    
    // Emit piece placed event
    this.emit('piecePlaced', piece);
    
    return 0;
  }
  
  /**
   * Start line clear animation
   */
  startLineClear(lines) {
    this.isClearing = true;
    this.linesToClear = lines;
    this.lineClearTimer = 0;
    this.clearAnimationProgress = 0;
    
    // Update statistics
    const numLines = lines.length;
    this.statistics.linesCleared += numLines;
    this.totalLinesCleared += numLines;
    
    // Track line clear types
    switch (numLines) {
      case 1:
        this.statistics.singles++;
        break;
      case 2:
        this.statistics.doubles++;
        break;
      case 3:
        this.statistics.triples++;
        break;
      case 4:
        this.statistics.tetrises++;
        // Check for back-to-back Tetris
        if (this.statistics.backToBack) {
          this.emit('backToBackTetris');
        }
        this.statistics.backToBack = true;
        break;
    }
    
    // Update combo
    this.statistics.combo++;
    if (this.statistics.combo > this.statistics.maxCombo) {
      this.statistics.maxCombo = this.statistics.combo;
    }
    
    // Store position for visual effects
    this.lastClearPosition = {
      rows: lines,
      centerRow: lines[Math.floor(lines.length / 2)],
      time: Date.now()
    };
    
    // Trigger shake effect based on lines cleared
    this.shakeIntensity = numLines * 2;
    
    // Create block animations for cleared lines
    for (const row of lines) {
      for (let col = 0; col < BOARD.WIDTH; col++) {
        if (this.grid[row][col]) {
          const key = `${row}-${col}`;
          this.blockAnimations.set(key, {
            type: 'shatter',
            progress: 0,
            row,
            col,
            color: this.grid[row][col],
            velocity: {
              x: (Math.random() - 0.5) * 10,
              y: Math.random() * -10 - 5,
              z: Math.random() * 10
            },
            rotation: {
              x: Math.random() * Math.PI * 2,
              y: Math.random() * Math.PI * 2,
              z: Math.random() * Math.PI * 2
            }
          });
        }
      }
    }
    
    // Emit line clear event
    this.emit('linesCleared', {
      count: numLines,
      lines: lines,
      combo: this.statistics.combo,
      backToBack: this.statistics.backToBack
    });
  }
  
  /**
   * Update line clear animation
   */
  updateLineClear(deltaTime) {
    if (!this.isClearing) return;
    
    this.lineClearTimer += deltaTime;
    this.clearAnimationProgress = Math.min(1, this.lineClearTimer / TIMING.LINE_CLEAR_DELAY);
    
    // Update individual block animations
    for (const [key, animation] of this.blockAnimations) {
      animation.progress = this.clearAnimationProgress;
      
      // Update physics
      animation.velocity.y += 20 * (deltaTime / 1000); // Gravity
      animation.rotation.x += 5 * (deltaTime / 1000);
      animation.rotation.y += 3 * (deltaTime / 1000);
      animation.rotation.z += 4 * (deltaTime / 1000);
    }
    
    // Update shake decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity *= 0.9;
      if (this.shakeIntensity < 0.1) {
        this.shakeIntensity = 0;
      }
    }
    
    // Complete line clear
    if (this.lineClearTimer >= TIMING.LINE_CLEAR_DELAY) {
      this.completeLineClear();
    }
  }
  
  /**
   * Complete the line clear process
   */
  completeLineClear() {
    // Clear the lines from the grid
    this.grid = clearLines(this.grid, this.linesToClear);
    
    // Reset clear state
    this.isClearing = false;
    this.linesToClear = [];
    this.lineClearTimer = 0;
    this.clearAnimationProgress = 0;
    
    // Clear animations
    this.blockAnimations.clear();
    
    // Update board analysis
    this.updateAnalysis();
    
    // Emit clear complete event
    this.emit('lineClearComplete');
  }
  
  /**
   * Update board analysis metrics
   */
  updateAnalysis() {
    // Calculate height map
    for (let col = 0; col < BOARD.WIDTH; col++) {
      this.heightMap[col] = 0;
      for (let row = BOARD.TOTAL_HEIGHT - 1; row >= 0; row--) {
        if (this.grid[row][col]) {
          this.heightMap[col] = BOARD.TOTAL_HEIGHT - row;
          break;
        }
      }
    }
    
    // Calculate aggregate height
    this.aggregateHeight = this.heightMap.reduce((sum, height) => sum + height, 0);
    
    // Calculate max height
    this.maxHeight = Math.max(...this.heightMap);
    
    // Calculate bumpiness (height differences)
    this.bumpiness = 0;
    for (let i = 0; i < BOARD.WIDTH - 1; i++) {
      this.bumpiness += Math.abs(this.heightMap[i] - this.heightMap[i + 1]);
    }
    
    // Calculate holes
    this.holes = 0;
    for (let col = 0; col < BOARD.WIDTH; col++) {
      let blockFound = false;
      for (let row = 0; row < BOARD.TOTAL_HEIGHT; row++) {
        if (this.grid[row][col]) {
          blockFound = true;
        } else if (blockFound) {
          this.holes++;
        }
      }
    }
    
    // Calculate danger level (0-100)
    this.dangerLevel = Math.min(100, (this.maxHeight / BOARD.HEIGHT) * 100);
    
    // Emit danger level change if significant
    if (this.dangerLevel > 80) {
      this.emit('dangerHigh', this.dangerLevel);
    } else if (this.dangerLevel > 60) {
      this.emit('dangerMedium', this.dangerLevel);
    }
  }
  
  /**
   * Check if the board is completely clear
   */
  isPerfectClear() {
    for (let row = 0; row < BOARD.TOTAL_HEIGHT; row++) {
      for (let col = 0; col < BOARD.WIDTH; col++) {
        if (this.grid[row][col]) {
          return false;
        }
      }
    }
    return true;
  }
  
  /**
   * Check if game is over
   */
  checkGameOver(nextPiece) {
    return isGameOver(this.grid, nextPiece);
  }
  
  /**
   * Get visible portion of the board (excluding hidden rows)
   */
  getVisibleGrid() {
    return this.grid.slice(BOARD.HIDDEN_ROWS);
  }
  
  /**
   * Get board state for rendering
   */
  getRenderState() {
    return {
      grid: this.grid,
      visibleGrid: this.getVisibleGrid(),
      heightMap: this.heightMap,
      dangerLevel: this.dangerLevel,
      isClearing: this.isClearing,
      clearingLines: this.linesToClear,
      clearProgress: this.clearAnimationProgress,
      blockAnimations: Array.from(this.blockAnimations.values()),
      shakeIntensity: this.shakeIntensity,
      statistics: { ...this.statistics }
    };
  }
  
  /**
   * Calculate score for line clear
   */
  calculateLineScore(numLines, level) {
    let baseScore = SCORING.LINE_CLEAR[numLines] || 0;
    
    // Apply level multiplier
    baseScore *= (level + 1);
    
    // Apply combo bonus
    if (this.statistics.combo > 1) {
      baseScore += SCORING.COMBO_MULTIPLIER * this.statistics.combo * level;
    }
    
    // Apply back-to-back bonus for Tetrises
    if (numLines === 4 && this.statistics.backToBack) {
      baseScore *= SCORING.BACK_TO_BACK_MULTIPLIER;
    }
    
    return Math.floor(baseScore);
  }
  
  /**
   * Get fill percentage for effects
   */
  getFillPercentage() {
    let filledCells = 0;
    const visibleHeight = BOARD.HEIGHT;
    const startRow = BOARD.HIDDEN_ROWS;
    
    for (let row = startRow; row < BOARD.TOTAL_HEIGHT; row++) {
      for (let col = 0; col < BOARD.WIDTH; col++) {
        if (this.grid[row][col]) {
          filledCells++;
        }
      }
    }
    
    return (filledCells / (visibleHeight * BOARD.WIDTH)) * 100;
  }
  
  /**
   * Serialize board state
   */
  serialize() {
    return {
      grid: this.grid,
      statistics: this.statistics,
      totalLinesCleared: this.totalLinesCleared
    };
  }
  
  /**
   * Deserialize board state
   */
  deserialize(data) {
    this.grid = data.grid || create2DArray(BOARD.TOTAL_HEIGHT, BOARD.WIDTH, 0);
    this.statistics = data.statistics || this.statistics;
    this.totalLinesCleared = data.totalLinesCleared || 0;
    this.updateAnalysis();
  }
}

/**
 * Simple Event Emitter for the Board class
 */
export class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  off(event, listenerToRemove) {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(
      listener => listener !== listenerToRemove
    );
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(listener => listener.apply(this, args));
  }
}

export default Board;