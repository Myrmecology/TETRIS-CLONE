/**
 * Score.js - Scoring system for Tetris
 * Handles score calculation, level progression, and statistics
 */

import { SCORING, TIMING } from '../utils/Constants.js';
import { EventEmitter } from './EventEmitter.js';

export class Score extends EventEmitter {
  constructor(startLevel = 1) {
    super();
    
    this.score = 0;
    this.level = startLevel;
    this.lines = 0;
    this.combo = 0;
    this.backToBack = false;
    
    // Statistics
    this.stats = {
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      maxCombo: 0,
      totalPiecesPlaced: 0,
      totalDropDistance: 0,
      startTime: Date.now(),
      endTime: null
    };
  }

  /**
   * Add points for line clears
   */
  addLineClearScore(linesCleared) {
    if (linesCleared === 0) {
      this.combo = 0;
      this.backToBack = false;
      return 0;
    }

    let points = 0;

    // Base points for line clear
    switch (linesCleared) {
      case 1:
        points = SCORING.LINE_CLEAR[1] * this.level;
        this.stats.singles++;
        this.backToBack = false;
        break;
      case 2:
        points = SCORING.LINE_CLEAR[2] * this.level;
        this.stats.doubles++;
        this.backToBack = false;
        break;
      case 3:
        points = SCORING.LINE_CLEAR[3] * this.level;
        this.stats.triples++;
        this.backToBack = false;
        break;
      case 4:
        points = SCORING.LINE_CLEAR[4] * this.level;
        this.stats.tetrises++;
        
        // Back-to-back bonus for consecutive Tetrises
        if (this.backToBack) {
          points = Math.floor(points * SCORING.BACK_TO_BACK_MULTIPLIER);
          this.emit('backToBack', { lines: linesCleared, points });
        }
        this.backToBack = true;
        break;
    }

    // Combo bonus
    this.combo++;
    if (this.combo > 1) {
      const comboBonus = SCORING.COMBO_BONUS * (this.combo - 1) * this.level;
      points += comboBonus;
      
      if (this.combo > this.stats.maxCombo) {
        this.stats.maxCombo = this.combo;
      }
      
      this.emit('combo', { combo: this.combo, bonus: comboBonus });
    }

    // Update score and lines
    this.score += points;
    this.lines += linesCleared;

    // Check for level up
    this.checkLevelUp();

    this.emit('scoreUpdate', {
      score: this.score,
      points: points,
      lines: this.lines,
      level: this.level
    });

    return points;
  }

  /**
   * Add points for soft drop
   */
  addSoftDropScore(cellsDropped) {
    const points = cellsDropped * SCORING.SOFT_DROP;
    this.score += points;
    this.stats.totalDropDistance += cellsDropped;

    this.emit('scoreUpdate', {
      score: this.score,
      points: points,
      lines: this.lines,
      level: this.level
    });

    return points;
  }

  /**
   * Add points for hard drop
   */
  addHardDropScore(cellsDropped) {
    const points = cellsDropped * SCORING.HARD_DROP;
    this.score += points;
    this.stats.totalDropDistance += cellsDropped;

    this.emit('scoreUpdate', {
      score: this.score,
      points: points,
      lines: this.lines,
      level: this.level
    });

    return points;
  }

  /**
   * Add points for perfect clear
   */
  addPerfectClearBonus() {
    const bonus = SCORING.PERFECT_CLEAR * this.level;
    this.score += bonus;

    this.emit('perfectClear', { bonus });
    this.emit('scoreUpdate', {
      score: this.score,
      points: bonus,
      lines: this.lines,
      level: this.level
    });

    return bonus;
  }

  /**
   * Increment pieces placed count
   */
  incrementPiecesPlaced() {
    this.stats.totalPiecesPlaced++;
  }

  /**
   * Check if player should level up
   */
  checkLevelUp() {
    const newLevel = Math.floor(this.lines / 10) + 1;
    
    if (newLevel > this.level) {
      this.level = newLevel;
      this.emit('levelUp', { level: this.level });
      return true;
    }
    
    return false;
  }

  /**
   * Get current level
   */
  getLevel() {
    return this.level;
  }

  /**
   * Get current score
   */
  getScore() {
    return this.score;
  }

  /**
   * Get total lines cleared
   */
  getLines() {
    return this.lines;
  }

  /**
   * Get current combo count
   */
  getCombo() {
    return this.combo;
  }

  /**
   * Get gravity speed for current level (frames per cell)
   */
  getGravitySpeed() {
    if (this.level <= TIMING.GRAVITY.length) {
      return TIMING.GRAVITY[this.level - 1];
    }
    return TIMING.GRAVITY_EXTENDED;
  }

  /**
   * Get lines needed for next level
   */
  getLinesUntilNextLevel() {
    return (this.level * 10) - this.lines;
  }

  /**
   * Get all statistics
   */
  getStats() {
    return {
      score: this.score,
      level: this.level,
      lines: this.lines,
      combo: this.combo,
      singles: this.stats.singles,
      doubles: this.stats.doubles,
      triples: this.stats.triples,
      tetrises: this.stats.tetrises,
      maxCombo: this.stats.maxCombo,
      totalPiecesPlaced: this.stats.totalPiecesPlaced,
      totalDropDistance: this.stats.totalDropDistance,
      playTime: this.getPlayTime()
    };
  }

  /**
   * Get play time in milliseconds
   */
  getPlayTime() {
    const endTime = this.stats.endTime || Date.now();
    return endTime - this.stats.startTime;
  }

  /**
   * Calculate pieces per minute
   */
  getPiecesPerMinute() {
    const minutes = this.getPlayTime() / 60000;
    return minutes > 0 ? Math.round(this.stats.totalPiecesPlaced / minutes) : 0;
  }

  /**
   * Calculate lines per minute
   */
  getLinesPerMinute() {
    const minutes = this.getPlayTime() / 60000;
    return minutes > 0 ? Math.round(this.lines / minutes) : 0;
  }

  /**
   * Get efficiency rating (Tetrises / total line clears)
   */
  getEfficiencyRating() {
    const totalClears = this.stats.singles + this.stats.doubles + this.stats.triples + this.stats.tetrises;
    if (totalClears === 0) return 0;
    
    const tetrisWeight = this.stats.tetrises * 4;
    const tripleWeight = this.stats.triples * 3;
    const doubleWeight = this.stats.doubles * 2;
    const singleWeight = this.stats.singles * 1;
    
    const efficiency = (tetrisWeight + tripleWeight * 0.75 + doubleWeight * 0.5 + singleWeight * 0.25) / totalClears;
    return Math.round(efficiency * 100);
  }

  /**
   * Mark game as ended
   */
  endGame() {
    this.stats.endTime = Date.now();
  }

  /**
   * Reset score system
   */
  reset(startLevel = 1) {
    this.score = 0;
    this.level = startLevel;
    this.lines = 0;
    this.combo = 0;
    this.backToBack = false;
    
    this.stats = {
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      maxCombo: 0,
      totalPiecesPlaced: 0,
      totalDropDistance: 0,
      startTime: Date.now(),
      endTime: null
    };

    this.emit('reset');
  }

  /**
   * Serialize score data for saving
   */
  toJSON() {
    return {
      score: this.score,
      level: this.level,
      lines: this.lines,
      combo: this.combo,
      backToBack: this.backToBack,
      stats: this.stats
    };
  }

  /**
   * Load score data from saved state
   */
  fromJSON(data) {
    this.score = data.score || 0;
    this.level = data.level || 1;
    this.lines = data.lines || 0;
    this.combo = data.combo || 0;
    this.backToBack = data.backToBack || false;
    this.stats = data.stats || this.stats;
  }
}