/**
 * Piece.js - Tetromino piece management for Tetris Neon Shatter
 * Handles piece creation, rotation, movement, and validation
 */

import { PIECES, BOARD, TIMING } from '../utils/Constants.js';
import { 
  rotateMatrixCW, 
  rotateMatrixCCW, 
  isValidPosition,
  getWallKickOffsets,
  getPieceBounds
} from '../utils/Helpers.js';

/**
 * Tetromino Piece Class
 * Represents a single falling piece in the game
 */
export class Piece {
  constructor(type, board) {
    this.type = type;
    this.board = board;
    this.definition = PIECES[type];
    this.shape = this.definition.shape.map(row => [...row]); // Deep copy
    this.color = this.definition.color;
    this.name = this.definition.name;
    this.rotationPoint = this.definition.rotationPoint;
    
    // Position and state
    this.row = BOARD.SPAWN_ROW;
    this.col = BOARD.SPAWN_COL;
    this.rotation = 0; // 0, 1, 2, 3 representing 0°, 90°, 180°, 270°
    this.locked = false;
    this.holdUsed = false;
    
    // Lock delay system
    this.lockDelayTimer = 0;
    this.lockDelayMoves = 0;
    this.isInLockDelay = false;
    this.lowestRow = this.row;
    
    // Movement tracking
    this.lastMoveTime = Date.now();
    this.dropTimer = 0;
    this.softDropping = false;
    
    // Statistics
    this.rotations = 0;
    this.movements = 0;
    this.distanceFallen = 0;
    
    // Visual effects data
    this.ghostRow = this.calculateGhostPosition();
    this.trailPositions = [];
    this.lastPositions = [];
    
    // Center the piece if needed
    this.centerPiece();
  }
  
  /**
   * Center the piece horizontally on spawn
   */
  centerPiece() {
    const bounds = getPieceBounds(this.shape);
    const pieceWidth = bounds.width;
    this.col = Math.floor((BOARD.WIDTH - pieceWidth) / 2);
  }
  
  /**
   * Move the piece left
   */
  moveLeft() {
    if (this.locked) return false;
    
    const newCol = this.col - 1;
    if (isValidPosition(this.board, this.shape, this.row, newCol)) {
      // Track trail for visual effects
      this.addTrailPosition();
      
      this.col = newCol;
      this.movements++;
      
      // Reset lock delay if moved during lock phase
      if (this.isInLockDelay) {
        this.resetLockDelay();
      }
      
      this.updateGhostPosition();
      return true;
    }
    return false;
  }
  
  /**
   * Move the piece right
   */
  moveRight() {
    if (this.locked) return false;
    
    const newCol = this.col + 1;
    if (isValidPosition(this.board, this.shape, this.row, newCol)) {
      // Track trail for visual effects
      this.addTrailPosition();
      
      this.col = newCol;
      this.movements++;
      
      // Reset lock delay if moved during lock phase
      if (this.isInLockDelay) {
        this.resetLockDelay();
      }
      
      this.updateGhostPosition();
      return true;
    }
    return false;
  }
  
  /**
   * Move the piece down (soft drop or gravity)
   */
  moveDown(isSoftDrop = false) {
    if (this.locked) return false;
    
    const newRow = this.row + 1;
    if (isValidPosition(this.board, this.shape, newRow, this.col)) {
      // Track trail for visual effects
      this.addTrailPosition();
      
      this.row = newRow;
      this.distanceFallen++;
      this.softDropping = isSoftDrop;
      
      // Track lowest position reached
      if (this.row > this.lowestRow) {
        this.lowestRow = this.row;
      }
      
      // Exit lock delay if we can still move down
      if (this.isInLockDelay) {
        this.exitLockDelay();
      }
      
      return true;
    } else {
      // Can't move down - enter lock delay
      if (!this.isInLockDelay) {
        this.enterLockDelay();
      }
      return false;
    }
  }
  
  /**
   * Hard drop - instantly drop to bottom
   */
  hardDrop() {
    if (this.locked) return 0;
    
    let dropDistance = 0;
    const startRow = this.row;
    
    // Create trail effect data
    this.trailPositions = [];
    
    // Drop until we can't
    while (this.moveDown(false)) {
      dropDistance++;
      this.trailPositions.push({ row: this.row, col: this.col });
    }
    
    // Instant lock on hard drop
    this.lock();
    
    return dropDistance;
  }
  
  /**
   * Rotate the piece clockwise
   */
  rotateCW() {
    if (this.locked) return false;
    if (this.type === 'O') return false; // O-piece doesn't rotate
    
    const rotatedShape = rotateMatrixCW(this.shape);
    const newRotation = (this.rotation + 1) % 4;
    
    // Try rotation with wall kicks
    if (this.tryRotationWithKicks(rotatedShape, this.rotation, newRotation)) {
      this.shape = rotatedShape;
      this.rotation = newRotation;
      this.rotations++;
      
      // Reset lock delay on successful rotation
      if (this.isInLockDelay) {
        this.resetLockDelay();
      }
      
      this.updateGhostPosition();
      return true;
    }
    
    return false;
  }
  
  /**
   * Rotate the piece counter-clockwise
   */
  rotateCCW() {
    if (this.locked) return false;
    if (this.type === 'O') return false; // O-piece doesn't rotate
    
    const rotatedShape = rotateMatrixCCW(this.shape);
    const newRotation = (this.rotation - 1 + 4) % 4;
    
    // Try rotation with wall kicks
    if (this.tryRotationWithKicks(rotatedShape, this.rotation, newRotation)) {
      this.shape = rotatedShape;
      this.rotation = newRotation;
      this.rotations++;
      
      // Reset lock delay on successful rotation
      if (this.isInLockDelay) {
        this.resetLockDelay();
      }
      
      this.updateGhostPosition();
      return true;
    }
    
    return false;
  }
  
  /**
   * Try rotation with Super Rotation System wall kicks
   */
  tryRotationWithKicks(rotatedShape, fromRotation, toRotation) {
    const kickOffsets = getWallKickOffsets(this.definition, fromRotation, toRotation);
    
    for (const [offsetCol, offsetRow] of kickOffsets) {
      const testRow = this.row + offsetRow;
      const testCol = this.col + offsetCol;
      
      if (isValidPosition(this.board, rotatedShape, testRow, testCol)) {
        // Apply the offset if valid
        this.row = testRow;
        this.col = testCol;
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Update piece based on gravity
   */
  update(deltaTime, gravity) {
    if (this.locked) return;
    
    // Update lock delay if active
    if (this.isInLockDelay) {
      this.updateLockDelay(deltaTime);
      return;
    }
    
    // Apply gravity
    this.dropTimer += deltaTime;
    const dropInterval = this.softDropping ? 
      gravity / TIMING.SOFT_DROP_MULTIPLIER : 
      gravity;
    
    if (this.dropTimer >= dropInterval) {
      this.dropTimer = 0;
      this.moveDown(this.softDropping);
    }
  }
  
  /**
   * Enter lock delay phase
   */
  enterLockDelay() {
    this.isInLockDelay = true;
    this.lockDelayTimer = 0;
    this.lockDelayMoves = 0;
  }
  
  /**
   * Exit lock delay phase
   */
  exitLockDelay() {
    this.isInLockDelay = false;
    this.lockDelayTimer = 0;
  }
  
  /**
   * Reset lock delay (after successful move/rotation)
   */
  resetLockDelay() {
    this.lockDelayMoves++;
    
    // Check if we've exceeded maximum moves
    if (this.lockDelayMoves >= TIMING.MAX_LOCK_MOVES) {
      this.lock();
    } else {
      // Reset timer but keep move count
      this.lockDelayTimer = 0;
    }
  }
  
  /**
   * Update lock delay timer
   */
  updateLockDelay(deltaTime) {
    this.lockDelayTimer += deltaTime;
    
    if (this.lockDelayTimer >= TIMING.LOCK_DELAY) {
      this.lock();
    }
  }
  
  /**
   * Lock the piece in place
   */
  lock() {
    this.locked = true;
    this.placeOnBoard();
  }
  
  /**
   * Place the piece on the board
   */
  placeOnBoard() {
    for (let r = 0; r < this.shape.length; r++) {
      for (let c = 0; c < this.shape[r].length; c++) {
        if (this.shape[r][c]) {
          const boardRow = this.row + r;
          const boardCol = this.col + c;
          
          if (boardRow >= 0 && boardRow < BOARD.TOTAL_HEIGHT &&
              boardCol >= 0 && boardCol < BOARD.WIDTH) {
            // Store piece type for color reference
            this.board[boardRow][boardCol] = this.type;
          }
        }
      }
    }
  }
  
  /**
   * Calculate ghost piece position
   */
  calculateGhostPosition() {
    let ghostRow = this.row;
    
    while (isValidPosition(this.board, this.shape, ghostRow + 1, this.col)) {
      ghostRow++;
    }
    
    return ghostRow;
  }
  
  /**
   * Update ghost position after movement
   */
  updateGhostPosition() {
    this.ghostRow = this.calculateGhostPosition();
  }
  
  /**
   * Add current position to trail (for visual effects)
   */
  addTrailPosition() {
    this.lastPositions.unshift({
      row: this.row,
      col: this.col,
      time: Date.now()
    });
    
    // Keep only recent positions
    if (this.lastPositions.length > 10) {
      this.lastPositions.pop();
    }
  }
  
  /**
   * Get piece blocks in world coordinates
   */
  getWorldBlocks() {
    const blocks = [];
    
    for (let r = 0; r < this.shape.length; r++) {
      for (let c = 0; c < this.shape[r].length; c++) {
        if (this.shape[r][c]) {
          blocks.push({
            row: this.row + r,
            col: this.col + c,
            type: this.type,
            color: this.color
          });
        }
      }
    }
    
    return blocks;
  }
  
  /**
   * Get ghost piece blocks in world coordinates
   */
  getGhostBlocks() {
    const blocks = [];
    
    for (let r = 0; r < this.shape.length; r++) {
      for (let c = 0; c < this.shape[r].length; c++) {
        if (this.shape[r][c]) {
          blocks.push({
            row: this.ghostRow + r,
            col: this.col + c,
            type: this.type,
            color: this.color,
            isGhost: true
          });
        }
      }
    }
    
    return blocks;
  }
  
  /**
   * Check if piece can be held (first hold only)
   */
  canHold() {
    return !this.holdUsed && !this.locked;
  }
  
  /**
   * Mark piece as having been held
   */
  markHeld() {
    this.holdUsed = true;
  }
  
  /**
   * Get piece statistics
   */
  getStats() {
    return {
      type: this.type,
      rotations: this.rotations,
      movements: this.movements,
      distanceFallen: this.distanceFallen,
      lockDelayMoves: this.lockDelayMoves,
      position: { row: this.row, col: this.col },
      rotation: this.rotation,
      locked: this.locked
    };
  }
  
  /**
   * Clone the piece (for preview/hold display)
   */
  clone() {
    const cloned = new Piece(this.type, this.board);
    cloned.shape = this.shape.map(row => [...row]);
    cloned.rotation = this.rotation;
    return cloned;
  }
  
  /**
   * Reset piece to spawn position
   */
  reset() {
    this.row = BOARD.SPAWN_ROW;
    this.col = BOARD.SPAWN_COL;
    this.rotation = 0;
    this.shape = this.definition.shape.map(row => [...row]);
    this.locked = false;
    this.holdUsed = false;
    this.lockDelayTimer = 0;
    this.lockDelayMoves = 0;
    this.isInLockDelay = false;
    this.ghostRow = this.calculateGhostPosition();
    this.centerPiece();
  }
}

export default Piece;