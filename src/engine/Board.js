/**
 * Board.js - Game board management
 * Handles the Tetris grid, collision detection, and line clearing
 */

import { BOARD } from '../utils/Constants.js';
import { EventEmitter } from './EventEmitter.js';

export class Board extends EventEmitter {
  constructor() {
    super();
    this.grid = [];
    this.init();
  }

  /**
   * Initialize empty board
   */
  init() {
    this.grid = [];
    for (let row = 0; row < BOARD.TOTAL_HEIGHT; row++) {
      this.grid[row] = [];
      for (let col = 0; col < BOARD.WIDTH; col++) {
        this.grid[row][col] = null;
      }
    }
  }

  /**
   * Check if a position is valid (within bounds and empty)
   */
  isValidPosition(row, col) {
    if (col < 0 || col >= BOARD.WIDTH) return false;
    if (row < 0 || row >= BOARD.TOTAL_HEIGHT) return false;
    return this.grid[row][col] === null;
  }

  /**
   * Check if a piece can be placed at a position
   */
  canPlacePiece(piece, offsetRow = 0, offsetCol = 0) {
    const shape = piece.getCurrentShape();
    const row = piece.row + offsetRow;
    const col = piece.col + offsetCol;

    for (const [r, c] of shape) {
      const boardRow = row + r;
      const boardCol = col + c;

      if (!this.isValidPosition(boardRow, boardCol)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Lock a piece onto the board
   */
  lockPiece(piece) {
    const shape = piece.getCurrentShape();
    const blocks = [];

    for (const [r, c] of shape) {
      const boardRow = piece.row + r;
      const boardCol = piece.col + c;

      if (boardRow >= 0 && boardRow < BOARD.TOTAL_HEIGHT) {
        this.grid[boardRow][boardCol] = piece.type;
        blocks.push({ row: boardRow, col: boardCol, type: piece.type });
      }
    }

    this.emit('pieceLocked', { blocks, pieceType: piece.type });
    return blocks;
  }

  /**
   * Check for completed lines and return their indices
   */
  checkLines() {
    const completedLines = [];

    for (let row = 0; row < BOARD.TOTAL_HEIGHT; row++) {
      let isComplete = true;

      for (let col = 0; col < BOARD.WIDTH; col++) {
        if (this.grid[row][col] === null) {
          isComplete = false;
          break;
        }
      }

      if (isComplete) {
        completedLines.push(row);
      }
    }

    return completedLines;
  }

  /**
   * Clear completed lines
   */
  clearLines(lines) {
    if (lines.length === 0) return;

    // Sort lines from top to bottom
    lines.sort((a, b) => a - b);

    // Remove cleared lines
    for (const line of lines) {
      this.grid.splice(line, 1);
    }

    // Add empty lines at the top
    for (let i = 0; i < lines.length; i++) {
      const emptyLine = new Array(BOARD.WIDTH).fill(null);
      this.grid.unshift(emptyLine);
    }

    this.emit('linesCleared', { lines, count: lines.length });
  }

  /**
   * Get the ghost piece position (where piece would land)
   */
  getGhostPosition(piece) {
    let ghostRow = piece.row;

    while (this.canPlacePiece(piece, ghostRow - piece.row + 1, 0)) {
      ghostRow++;
    }

    return ghostRow;
  }

  /**
   * Check if the board has any blocks above the visible area
   */
  isGameOver() {
    for (let row = BOARD.HEIGHT; row < BOARD.TOTAL_HEIGHT; row++) {
      for (let col = 0; col < BOARD.WIDTH; col++) {
        if (this.grid[row][col] !== null) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get cell value at position
   */
  getCell(row, col) {
    if (row < 0 || row >= BOARD.TOTAL_HEIGHT) return undefined;
    if (col < 0 || col >= BOARD.WIDTH) return undefined;
    return this.grid[row][col];
  }

  /**
   * Get the entire board state
   */
  getBoard() {
    return this.grid;
  }

  /**
   * Clear the entire board
   */
  clear() {
    this.init();
    this.emit('boardCleared');
  }

  /**
   * Check if board is completely empty (perfect clear)
   */
  isPerfectClear() {
    for (let row = 0; row < BOARD.HEIGHT; row++) {
      for (let col = 0; col < BOARD.WIDTH; col++) {
        if (this.grid[row][col] !== null) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get board statistics
   */
  getStats() {
    let filledCells = 0;
    let highestBlock = 0;

    for (let row = 0; row < BOARD.HEIGHT; row++) {
      for (let col = 0; col < BOARD.WIDTH; col++) {
        if (this.grid[row][col] !== null) {
          filledCells++;
          if (row > highestBlock) {
            highestBlock = row;
          }
        }
      }
    }

    return {
      filledCells,
      emptyCells: (BOARD.HEIGHT * BOARD.WIDTH) - filledCells,
      highestBlock,
      fillPercentage: (filledCells / (BOARD.HEIGHT * BOARD.WIDTH)) * 100
    };
  }
}