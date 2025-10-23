/**
 * Score.js - Scoring system for Tetris Neon Shatter
 * Handles score calculation, level progression, and high scores
 */

import { SCORING, TIMING } from '../utils/Constants.js';
import { getLocalStorage, setLocalStorage, formatScore } from '../utils/Helpers.js';
import { gameEventBus, GAME_EVENTS } from './EventEmitter.js';

/**
 * Score Manager Class
 * Manages all scoring, levels, and achievements
 */
export class ScoreManager {
  constructor() {
    // Current game stats
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.targetLines = SCORING.LINES_PER_LEVEL;
    
    // High scores
    this.highScores = this.loadHighScores();
    this.isNewHighScore = false;
    
    // Scoring multipliers
    this.combo = 0;
    this.backToBack = false;
    this.lastClearWasTetris = false;
    
    // Statistics
    this.statistics = {
      totalScore: 0,
      totalLines: 0,
      totalPieces: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      perfectClears: 0,
      maxCombo: 0,
      tSpins: 0,
      softDropScore: 0,
      hardDropScore: 0,
      gameTime: 0,
      piecesPerMinute: 0,
      linesPerMinute: 0
    };
    
    // Milestones and achievements
    this.milestones = {
      firstTetris: false,
      first100Lines: false,
      first10000Points: false,
      first100000Points: false,
      firstMillionPoints: false,
      firstPerfectClear: false,
      combo10: false,
      combo15: false,
      level20: false,
      level30: false,
      speedDemon: false, // 200+ PPM
      marathon: false     // 30 minutes played
    };
    
    // Score animations queue
    this.scoreAnimations = [];
    this.comboAnimations = [];
    
    // Time tracking
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.lastUpdateTime = Date.now();
  }
  
  /**
   * Reset score manager for new game
   */
  reset() {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.targetLines = SCORING.LINES_PER_LEVEL;
    this.combo = 0;
    this.backToBack = false;
    this.lastClearWasTetris = false;
    this.isNewHighScore = false;
    
    // Reset statistics
    this.statistics = {
      totalScore: 0,
      totalLines: 0,
      totalPieces: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      perfectClears: 0,
      maxCombo: 0,
      tSpins: 0,
      softDropScore: 0,
      hardDropScore: 0,
      gameTime: 0,
      piecesPerMinute: 0,
      linesPerMinute: 0
    };
    
    // Clear animations
    this.scoreAnimations = [];
    this.comboAnimations = [];
    
    // Reset time
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.lastUpdateTime = Date.now();
  }
  
  /**
   * Add score for soft drop
   */
  addSoftDropScore(cells) {
    const points = cells * SCORING.SOFT_DROP;
    this.addScore(points);
    this.statistics.softDropScore += points;
    return points;
  }
  
  /**
   * Add score for hard drop
   */
  addHardDropScore(cells) {
    const points = cells * SCORING.HARD_DROP;
    this.addScore(points);
    this.statistics.hardDropScore += points;
    
    // Add animation
    this.addScoreAnimation(points, 'hardDrop');
    
    return points;
  }
  
  /**
   * Add score for line clear
   */
  addLineClearScore(numLines, isTSpin = false) {
    let baseScore = SCORING.LINE_CLEAR[numLines] || 0;
    
    // Apply level multiplier
    baseScore *= this.level;
    
    // T-Spin bonus
    if (isTSpin) {
      baseScore *= SCORING.T_SPIN_MULTIPLIER;
      this.statistics.tSpins++;
    }
    
    // Back-to-back Tetris bonus
    if (numLines === 4) {
      if (this.backToBack) {
        baseScore = Math.floor(baseScore * SCORING.BACK_TO_BACK_MULTIPLIER);
        this.addScoreAnimation(Math.floor(baseScore * 0.5), 'backToBack');
      }
      this.backToBack = true;
      this.lastClearWasTetris = true;
    } else if (numLines > 0) {
      this.backToBack = false;
      this.lastClearWasTetris = false;
    }
    
    // Combo bonus
    if (numLines > 0) {
      this.combo++;
      if (this.combo > 1) {
        const comboBonus = SCORING.COMBO_MULTIPLIER * this.combo * this.level;
        baseScore += comboBonus;
        this.addComboAnimation(this.combo, comboBonus);
      }
      
      // Track max combo
      if (this.combo > this.statistics.maxCombo) {
        this.statistics.maxCombo = this.combo;
        this.checkComboMilestone(this.combo);
      }
    } else {
      this.combo = 0;
    }
    
    // Update statistics
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
        this.checkTetrisMilestone();
        break;
    }
    
    // Add the score
    this.addScore(baseScore);
    
    // Add line clear animation
    this.addScoreAnimation(baseScore, `line${numLines}`);
    
    // Update lines
    this.addLines(numLines);
    
    return baseScore;
  }
  
  /**
   * Add score for perfect clear
   */
  addPerfectClearScore() {
    const bonus = SCORING.PERFECT_CLEAR * this.level;
    this.addScore(bonus);
    this.statistics.perfectClears++;
    
    // Add animation
    this.addScoreAnimation(bonus, 'perfectClear');
    
    // Check milestone
    if (!this.milestones.firstPerfectClear) {
      this.milestones.firstPerfectClear = true;
      gameEventBus.emit(GAME_EVENTS.MILESTONE, {
        type: 'firstPerfectClear',
        message: 'First Perfect Clear!'
      });
    }
    
    return bonus;
  }
  
  /**
   * Add score
   */
  addScore(points) {
    const oldScore = this.score;
    this.score += points;
    this.statistics.totalScore = this.score;
    
    // Check for high score
    if (!this.isNewHighScore && this.score > this.getTopScore()) {
      this.isNewHighScore = true;
      gameEventBus.emit(GAME_EVENTS.HIGH_SCORE, {
        score: this.score,
        previous: this.getTopScore()
      });
    }
    
    // Check score milestones
    this.checkScoreMilestones(oldScore, this.score);
    
    // Emit score update
    gameEventBus.emit(GAME_EVENTS.SCORE_UPDATE, {
      score: this.score,
      delta: points
    });
  }
  
  /**
   * Add lines cleared
   */
  addLines(numLines) {
    this.lines += numLines;
    this.statistics.totalLines = this.lines;
    
    // Check for level up
    while (this.lines >= this.targetLines) {
      this.levelUp();
    }
    
    // Check line milestones
    if (this.lines >= 100 && !this.milestones.first100Lines) {
      this.milestones.first100Lines = true;
      gameEventBus.emit(GAME_EVENTS.MILESTONE, {
        type: 'first100Lines',
        message: '100 Lines Cleared!'
      });
    }
  }
  
  /**
   * Level up
   */
  levelUp() {
    this.level++;
    this.targetLines += SCORING.LINES_PER_LEVEL;
    
    // Add level up bonus score
    const bonus = 1000 * this.level;
    this.addScore(bonus);
    
    // Add animation
    this.addScoreAnimation(bonus, 'levelUp');
    
    // Check level milestones
    if (this.level === 20 && !this.milestones.level20) {
      this.milestones.level20 = true;
      gameEventBus.emit(GAME_EVENTS.MILESTONE, {
        type: 'level20',
        message: 'Level 20 Reached!'
      });
    } else if (this.level === 30 && !this.milestones.level30) {
      this.milestones.level30 = true;
      gameEventBus.emit(GAME_EVENTS.MILESTONE, {
        type: 'level30',
        message: 'Level 30 - Speed Demon!'
      });
    }
    
    // Emit level up event
    gameEventBus.emit(GAME_EVENTS.LEVEL_UP, {
      level: this.level,
      bonus: bonus
    });
  }
  
  /**
   * Update statistics
   */
  update(deltaTime) {
    // Update game time
    const now = Date.now();
    this.statistics.gameTime = now - this.startTime - this.pausedTime;
    
    // Calculate pieces per minute
    const minutes = this.statistics.gameTime / 60000;
    if (minutes > 0) {
      this.statistics.piecesPerMinute = Math.round(this.statistics.totalPieces / minutes);
      this.statistics.linesPerMinute = Math.round(this.statistics.totalLines / minutes);
      
      // Check speed milestone
      if (this.statistics.piecesPerMinute >= 200 && !this.milestones.speedDemon) {
        this.milestones.speedDemon = true;
        gameEventBus.emit(GAME_EVENTS.MILESTONE, {
          type: 'speedDemon',
          message: '200+ Pieces Per Minute!'
        });
      }
      
      // Check marathon milestone (30 minutes)
      if (minutes >= 30 && !this.milestones.marathon) {
        this.milestones.marathon = true;
        gameEventBus.emit(GAME_EVENTS.MILESTONE, {
          type: 'marathon',
          message: '30 Minute Marathon!'
        });
      }
    }
    
    // Update animations
    this.updateAnimations(deltaTime);
    
    this.lastUpdateTime = now;
  }
  
  /**
   * Add piece placed
   */
  addPiece() {
    this.statistics.totalPieces++;
  }
  
  /**
   * Pause time tracking
   */
  pause() {
    this.pauseStartTime = Date.now();
  }
  
  /**
   * Resume time tracking
   */
  resume() {
    if (this.pauseStartTime) {
      this.pausedTime += Date.now() - this.pauseStartTime;
      this.pauseStartTime = null;
    }
  }
  
  /**
   * Add score animation
   */
  addScoreAnimation(points, type) {
    this.scoreAnimations.push({
      points,
      type,
      time: 0,
      opacity: 1,
      y: 0,
      scale: 1
    });
    
    // Limit animations
    if (this.scoreAnimations.length > 10) {
      this.scoreAnimations.shift();
    }
  }
  
  /**
   * Add combo animation
   */
  addComboAnimation(combo, points) {
    this.comboAnimations.push({
      combo,
      points,
      time: 0,
      opacity: 1,
      x: 0,
      scale: 1.5
    });
    
    // Limit animations
    if (this.comboAnimations.length > 5) {
      this.comboAnimations.shift();
    }
  }
  
  /**
   * Update animations
   */
  updateAnimations(deltaTime) {
    // Update score animations
    this.scoreAnimations = this.scoreAnimations.filter(anim => {
      anim.time += deltaTime;
      anim.y -= deltaTime * 0.05;
      anim.opacity = Math.max(0, 1 - anim.time / 2000);
      anim.scale = 1 + Math.sin(anim.time * 0.01) * 0.1;
      return anim.opacity > 0;
    });
    
    // Update combo animations
    this.comboAnimations = this.comboAnimations.filter(anim => {
      anim.time += deltaTime;
      anim.x = Math.sin(anim.time * 0.005) * 10;
      anim.opacity = Math.max(0, 1 - anim.time / 3000);
      anim.scale = Math.max(1, 1.5 - anim.time / 2000);
      return anim.opacity > 0;
    });
  }
  
  /**
   * Check score milestones
   */
  checkScoreMilestones(oldScore, newScore) {
    const milestones = [
      { threshold: 10000, key: 'first10000Points', message: '10,000 Points!' },
      { threshold: 100000, key: 'first100000Points', message: '100,000 Points!' },
      { threshold: 1000000, key: 'firstMillionPoints', message: 'One Million Points!' }
    ];
    
    for (const milestone of milestones) {
      if (oldScore < milestone.threshold && 
          newScore >= milestone.threshold && 
          !this.milestones[milestone.key]) {
        this.milestones[milestone.key] = true;
        gameEventBus.emit(GAME_EVENTS.MILESTONE, {
          type: milestone.key,
          message: milestone.message
        });
      }
    }
  }
  
  /**
   * Check Tetris milestone
   */
  checkTetrisMilestone() {
    if (!this.milestones.firstTetris) {
      this.milestones.firstTetris = true;
      gameEventBus.emit(GAME_EVENTS.MILESTONE, {
        type: 'firstTetris',
        message: 'First Tetris!'
      });
    }
  }
  
  /**
   * Check combo milestone
   */
  checkComboMilestone(combo) {
    if (combo >= 10 && !this.milestones.combo10) {
      this.milestones.combo10 = true;
      gameEventBus.emit(GAME_EVENTS.MILESTONE, {
        type: 'combo10',
        message: '10x Combo!'
      });
    } else if (combo >= 15 && !this.milestones.combo15) {
      this.milestones.combo15 = true;
      gameEventBus.emit(GAME_EVENTS.MILESTONE, {
        type: 'combo15',
        message: '15x Combo - Unstoppable!'
      });
    }
  }
  
  /**
   * Get current gravity speed
   */
  getGravity() {
    const levelIndex = Math.min(this.level - 1, TIMING.GRAVITY.length - 1);
    return TIMING.GRAVITY[levelIndex];
  }
  
  /**
   * Save high score
   */
  saveHighScore(name = 'Player') {
    const entry = {
      name,
      score: this.score,
      level: this.level,
      lines: this.lines,
      date: new Date().toISOString(),
      time: this.statistics.gameTime
    };
    
    this.highScores.push(entry);
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10); // Keep top 10
    
    setLocalStorage('tetrisHighScores', this.highScores);
    
    return entry;
  }
  
  /**
   * Load high scores
   */
  loadHighScores() {
    return getLocalStorage('tetrisHighScores', []);
  }
  
  /**
   * Get top score
   */
  getTopScore() {
    return this.highScores.length > 0 ? this.highScores[0].score : 0;
  }
  
  /**
   * Get formatted display data
   */
  getDisplayData() {
    return {
      score: formatScore(this.score),
      level: this.level,
      lines: this.lines,
      nextLines: this.targetLines - this.lines,
      combo: this.combo,
      highScore: formatScore(this.getTopScore()),
      isNewHighScore: this.isNewHighScore,
      animations: {
        score: [...this.scoreAnimations],
        combo: [...this.comboAnimations]
      }
    };
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    return { ...this.statistics, milestones: { ...this.milestones } };
  }
}

export default ScoreManager;