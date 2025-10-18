/**
 * Helpers.js - Utility functions and helpers for Tetris Neon Shatter
 * Mathematical operations, array manipulations, and game-specific utilities
 */

import { BOARD, TIMING, PIECES } from './Constants.js';

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Create a 2D array filled with a value
 */
export function create2DArray(rows, cols, fillValue = 0) {
  return Array(rows).fill(null).map(() => Array(cols).fill(fillValue));
}

/**
 * Deep clone a 2D array
 */
export function clone2DArray(array) {
  return array.map(row => [...row]);
}

/**
 * Rotate a 2D matrix 90 degrees clockwise
 */
export function rotateMatrixCW(matrix) {
  const n = matrix.length;
  const rotated = create2DArray(n, n, 0);
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[j][n - 1 - i] = matrix[i][j];
    }
  }
  
  return rotated;
}

/**
 * Rotate a 2D matrix 90 degrees counter-clockwise
 */
export function rotateMatrixCCW(matrix) {
  const n = matrix.length;
  const rotated = create2DArray(n, n, 0);
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[n - 1 - j][i] = matrix[i][j];
    }
  }
  
  return rotated;
}

/**
 * Check if a position is within board bounds
 */
export function isInBounds(row, col) {
  return row >= 0 && 
         row < BOARD.TOTAL_HEIGHT && 
         col >= 0 && 
         col < BOARD.WIDTH;
}

/**
 * Check if a piece position is valid (no collisions)
 */
export function isValidPosition(board, piece, row, col) {
  const shape = piece.shape || piece;
  
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const newRow = row + r;
        const newCol = col + c;
        
        // Check bounds
        if (!isInBounds(newRow, newCol)) {
          return false;
        }
        
        // Check collision with placed blocks
        if (board[newRow][newCol]) {
          return false;
        }
      }
    }
  }
  
  return true;
}

/**
 * Get the ghost piece position (where piece would land)
 */
export function getGhostPosition(board, piece, currentRow, currentCol) {
  let ghostRow = currentRow;
  
  // Move down until collision
  while (isValidPosition(board, piece, ghostRow + 1, currentCol)) {
    ghostRow++;
  }
  
  return ghostRow;
}

/**
 * Check for completed lines
 */
export function findCompletedLines(board) {
  const completedLines = [];
  
  for (let row = 0; row < BOARD.TOTAL_HEIGHT; row++) {
    if (board[row].every(cell => cell !== 0)) {
      completedLines.push(row);
    }
  }
  
  return completedLines;
}

/**
 * Remove completed lines and return new board
 */
export function clearLines(board, linesToClear) {
  const newBoard = clone2DArray(board);
  
  // Remove cleared lines
  linesToClear.forEach(row => {
    newBoard.splice(row, 1);
  });
  
  // Add empty lines at the top
  while (newBoard.length < BOARD.TOTAL_HEIGHT) {
    newBoard.unshift(Array(BOARD.WIDTH).fill(0));
  }
  
  return newBoard;
}

// ============================================
// MATHEMATICAL UTILITIES
// ============================================

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Smooth step interpolation
 */
export function smoothstep(start, end, factor) {
  const t = clamp((factor - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Exponential interpolation
 */
export function expInterp(start, end, factor, exp = 2) {
  return start + (end - start) * Math.pow(factor, exp);
}

/**
 * Random number between min and max
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate angle between two points
 */
export function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Calculate distance between two points
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

// ============================================
// TIMING UTILITIES
// ============================================

/**
 * Get gravity (fall speed) for current level
 */
export function getGravity(level) {
  if (level <= 0) return TIMING.GRAVITY[0];
  if (level > TIMING.GRAVITY.length) return TIMING.GRAVITY_EXTENDED;
  return TIMING.GRAVITY[level - 1];
}

/**
 * Calculate frames to milliseconds
 */
export function framesToMs(frames, fps = 60) {
  return (frames / fps) * 1000;
}

/**
 * Calculate milliseconds to frames
 */
export function msToFrames(ms, fps = 60) {
  return Math.floor((ms / 1000) * fps);
}

/**
 * Format time as MM:SS
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format score with commas
 */
export function formatScore(score) {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ============================================
// PIECE GENERATION UTILITIES
// ============================================

/**
 * Generate a bag of pieces (7-bag randomizer)
 */
export function generatePieceBag() {
  const pieceTypes = Object.keys(PIECES);
  return shuffleArray(pieceTypes);
}

/**
 * Get next piece from bag (refills when empty)
 */
export class PieceBag {
  constructor() {
    this.bag = [];
    this.nextBag = generatePieceBag();
  }
  
  getNext() {
    if (this.bag.length === 0) {
      this.bag = this.nextBag;
      this.nextBag = generatePieceBag();
    }
    return this.bag.shift();
  }
  
  peek(count = 1) {
    const upcoming = [...this.bag, ...this.nextBag];
    return upcoming.slice(0, count);
  }
  
  reset() {
    this.bag = [];
    this.nextBag = generatePieceBag();
  }
}

// ============================================
// COLLISION DETECTION UTILITIES
// ============================================

/**
 * Get bounding box of a piece
 */
export function getPieceBounds(shape) {
  let minRow = shape.length;
  let maxRow = -1;
  let minCol = shape[0].length;
  let maxCol = -1;
  
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }
  
  return {
    minRow,
    maxRow,
    minCol,
    maxCol,
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1
  };
}

/**
 * Check if game is over (piece at spawn collides)
 */
export function isGameOver(board, piece) {
  return !isValidPosition(board, piece, BOARD.SPAWN_ROW, BOARD.SPAWN_COL);
}

/**
 * Get wall kick offsets for rotation (SRS - Super Rotation System)
 */
export function getWallKickOffsets(piece, fromRotation, toRotation) {
  // Standard wall kick data for all pieces except I
  const standardKicks = {
    '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
  };
  
  // I-piece has special wall kicks
  const iPieceKicks = {
    '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
  };
  
  const key = `${fromRotation}->${toRotation}`;
  
  if (piece.name === 'I-piece') {
    return iPieceKicks[key] || [[0, 0]];
  }
  
  return standardKicks[key] || [[0, 0]];
}

// ============================================
// PERFORMANCE UTILITIES
// ============================================

/**
 * Throttle function calls
 */
export function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Request animation frame with fallback
 */
export const raf = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  ((callback) => window.setTimeout(callback, 1000 / 60));

/**
 * Cancel animation frame with fallback
 */
export const caf = window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.clearTimeout;

// ============================================
// LOCAL STORAGE UTILITIES
// ============================================

/**
 * Safe local storage get
 */
export function getLocalStorage(key, defaultValue = null) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safe local storage set
 */
export function setLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear specific local storage key
 */
export function removeLocalStorage(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

// ============================================
// DEVICE DETECTION
// ============================================

/**
 * Check if device is mobile
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device supports touch
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get device pixel ratio
 */
export function getPixelRatio() {
  return window.devicePixelRatio || 1;
}

// Export all utilities
export default {
  // Array utilities
  create2DArray,
  clone2DArray,
  rotateMatrixCW,
  rotateMatrixCCW,
  isInBounds,
  isValidPosition,
  getGhostPosition,
  findCompletedLines,
  clearLines,
  
  // Math utilities
  clamp,
  lerp,
  smoothstep,
  expInterp,
  random,
  randomInt,
  shuffleArray,
  angle,
  distance,
  degToRad,
  radToDeg,
  
  // Timing utilities
  getGravity,
  framesToMs,
  msToFrames,
  formatTime,
  formatScore,
  
  // Piece utilities
  generatePieceBag,
  PieceBag,
  getPieceBounds,
  isGameOver,
  getWallKickOffsets,
  
  // Performance utilities
  throttle,
  debounce,
  raf,
  caf,
  
  // Storage utilities
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  
  // Device utilities
  isMobile,
  isTouchDevice,
  getPixelRatio
};