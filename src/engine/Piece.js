/**
 * Piece.js - Tetris piece (tetromino) management
 * Handles piece shapes, rotations, and movement
 */

import { BOARD } from '../utils/Constants.js';
import { PIECE_COLORS } from '../utils/Colors.js';

/**
 * Piece shape definitions (Standard Rotation System - SRS)
 * Each piece has 4 rotation states
 */
const PIECES = {
  I: {
    shape: [
      [[0, 0], [0, 1], [0, 2], [0, 3]], // 0°
      [[0, 2], [1, 2], [2, 2], [3, 2]], // 90°
      [[2, 0], [2, 1], [2, 2], [2, 3]], // 180°
      [[0, 1], [1, 1], [2, 1], [3, 1]]  // 270°
    ],
    color: PIECE_COLORS.I
  },
  O: {
    shape: [
      [[0, 1], [0, 2], [1, 1], [1, 2]], // All rotations are the same
      [[0, 1], [0, 2], [1, 1], [1, 2]],
      [[0, 1], [0, 2], [1, 1], [1, 2]],
      [[0, 1], [0, 2], [1, 1], [1, 2]]
    ],
    color: PIECE_COLORS.O
  },
  T: {
    shape: [
      [[0, 1], [1, 0], [1, 1], [1, 2]], // 0°
      [[0, 1], [1, 1], [1, 2], [2, 1]], // 90°
      [[1, 0], [1, 1], [1, 2], [2, 1]], // 180°
      [[0, 1], [1, 0], [1, 1], [2, 1]]  // 270°
    ],
    color: PIECE_COLORS.T
  },
  S: {
    shape: [
      [[0, 1], [0, 2], [1, 0], [1, 1]], // 0°
      [[0, 1], [1, 1], [1, 2], [2, 2]], // 90°
      [[1, 1], [1, 2], [2, 0], [2, 1]], // 180°
      [[0, 0], [1, 0], [1, 1], [2, 1]]  // 270°
    ],
    color: PIECE_COLORS.S
  },
  Z: {
    shape: [
      [[0, 0], [0, 1], [1, 1], [1, 2]], // 0°
      [[0, 2], [1, 1], [1, 2], [2, 1]], // 90°
      [[1, 0], [1, 1], [2, 1], [2, 2]], // 180°
      [[0, 1], [1, 0], [1, 1], [2, 0]]  // 270°
    ],
    color: PIECE_COLORS.Z
  },
  J: {
    shape: [
      [[0, 0], [1, 0], [1, 1], [1, 2]], // 0°
      [[0, 1], [0, 2], [1, 1], [2, 1]], // 90°
      [[1, 0], [1, 1], [1, 2], [2, 2]], // 180°
      [[0, 1], [1, 1], [2, 0], [2, 1]]  // 270°
    ],
    color: PIECE_COLORS.J
  },
  L: {
    shape: [
      [[0, 2], [1, 0], [1, 1], [1, 2]], // 0°
      [[0, 1], [1, 1], [2, 1], [2, 2]], // 90°
      [[1, 0], [1, 1], [1, 2], [2, 0]], // 180°
      [[0, 0], [0, 1], [1, 1], [2, 1]]  // 270°
    ],
    color: PIECE_COLORS.L
  }
};

/**
 * Piece types array for random generation
 */
export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * Piece class
 */
export class Piece {
  constructor(type, row = BOARD.SPAWN_ROW, col = BOARD.SPAWN_COL) {
    if (!PIECES[type]) {
      throw new Error(`Invalid piece type: ${type}`);
    }

    this.type = type;
    this.row = row;
    this.col = col;
    this.rotation = 0;
    this.shapes = PIECES[type].shape;
    this.color = PIECES[type].color;
    this.locked = false;
  }

  /**
   * Get current shape based on rotation
   */
  getCurrentShape() {
    return this.shapes[this.rotation];
  }

  /**
   * Get shape for a specific rotation
   */
  getShapeAtRotation(rotation) {
    const normalizedRotation = ((rotation % 4) + 4) % 4;
    return this.shapes[normalizedRotation];
  }

  /**
   * Rotate clockwise
   */
  rotateClockwise() {
    this.rotation = (this.rotation + 1) % 4;
  }

  /**
   * Rotate counter-clockwise
   */
  rotateCounterClockwise() {
    this.rotation = (this.rotation - 1 + 4) % 4;
  }

  /**
   * Get next rotation (clockwise) without changing current state
   */
  getNextRotation() {
    return (this.rotation + 1) % 4;
  }

  /**
   * Get previous rotation (counter-clockwise) without changing current state
   */
  getPreviousRotation() {
    return (this.rotation - 1 + 4) % 4;
  }

  /**
   * Move piece
   */
  move(rowDelta, colDelta) {
    this.row += rowDelta;
    this.col += colDelta;
  }

  /**
   * Set position
   */
  setPosition(row, col) {
    this.row = row;
    this.col = col;
  }

  /**
   * Set rotation
   */
  setRotation(rotation) {
    this.rotation = ((rotation % 4) + 4) % 4;
  }

  /**
   * Get all block positions in board coordinates
   */
  getBlockPositions() {
    const shape = this.getCurrentShape();
    return shape.map(([r, c]) => ({
      row: this.row + r,
      col: this.col + c
    }));
  }

  /**
   * Get block positions for a specific rotation
   */
  getBlockPositionsAtRotation(rotation) {
    const shape = this.getShapeAtRotation(rotation);
    return shape.map(([r, c]) => ({
      row: this.row + r,
      col: this.col + c
    }));
  }

  /**
   * Clone the piece
   */
  clone() {
    const cloned = new Piece(this.type, this.row, this.col);
    cloned.rotation = this.rotation;
    cloned.locked = this.locked;
    return cloned;
  }

  /**
   * Get piece bounding box
   */
  getBoundingBox() {
    const positions = this.getBlockPositions();
    
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    for (const pos of positions) {
      minRow = Math.min(minRow, pos.row);
      maxRow = Math.max(maxRow, pos.row);
      minCol = Math.min(minCol, pos.col);
      maxCol = Math.max(maxCol, pos.col);
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
   * Check if piece is at spawn position
   */
  isAtSpawn() {
    return this.row === BOARD.SPAWN_ROW && this.col === BOARD.SPAWN_COL;
  }

  /**
   * Lock the piece (mark as placed)
   */
  lock() {
    this.locked = true;
  }

  /**
   * Check if piece is locked
   */
  isLocked() {
    return this.locked;
  }

  /**
   * Get piece info
   */
  getInfo() {
    return {
      type: this.type,
      row: this.row,
      col: this.col,
      rotation: this.rotation,
      color: this.color,
      locked: this.locked,
      blocks: this.getBlockPositions()
    };
  }
}

/**
 * Create a random piece
 */
export function createRandomPiece() {
  const randomType = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return new Piece(randomType);
}

/**
 * Bag randomizer for fair piece distribution (7-bag system)
 */
export class PieceBag {
  constructor() {
    this.bag = [];
    this.refillBag();
  }

  /**
   * Refill the bag with all 7 pieces in random order
   */
  refillBag() {
    this.bag = [...PIECE_TYPES];
    
    // Fisher-Yates shuffle
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
  }

  /**
   * Get next piece from the bag
   */
  getNext() {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    
    const type = this.bag.pop();
    return new Piece(type);
  }

  /**
   * Peek at next piece without removing it
   */
  peek() {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    
    const type = this.bag[this.bag.length - 1];
    return type;
  }

  /**
   * Get remaining pieces in bag
   */
  getRemainingCount() {
    return this.bag.length;
  }

  /**
   * Reset the bag
   */
  reset() {
    this.bag = [];
    this.refillBag();
  }
}

export { PIECES };