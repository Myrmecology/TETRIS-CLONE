/**
 * GameOver.js - Game over screen and results display
 * Shows final score, statistics, and options to restart or return to menu
 */

export class GameOver {
  constructor(onRestart, onMainMenu) {
    this.onRestart = onRestart;
    this.onMainMenu = onMainMenu;
    this.elements = {};
    this.isVisible = false;
    
    this.init();
  }

  /**
   * Initialize game over screen
   */
  init() {
    // Get or create game over container
    this.elements.container = document.getElementById('game-over-screen');
    
    if (!this.elements.container) {
      this.createGameOverScreen();
    }

    // Get DOM elements
    this.elements.finalScore = document.getElementById('final-score');
    this.elements.finalLevel = document.getElementById('final-level');
    this.elements.finalLines = document.getElementById('final-lines');
    this.elements.newHighScore = document.getElementById('new-high-score');
    this.elements.restartButton = document.getElementById('restart-button');
    this.elements.menuButton = document.getElementById('menu-button');
    this.elements.statsDisplay = document.getElementById('game-over-stats');

    // Setup event listeners
    this.setupEventListeners();

    // Initially hidden
    this.hide();
  }

  /**
   * Create game over screen HTML structure
   */
  createGameOverScreen() {
    const screen = document.createElement('div');
    screen.id = 'game-over-screen';
    screen.className = 'game-over-screen';
    screen.innerHTML = `
      <div class="game-over-content">
        <h1 class="game-over-title">GAME OVER</h1>
        
        <div id="new-high-score" class="new-high-score" style="display: none;">
          <span class="star">⭐</span>
          NEW HIGH SCORE!
          <span class="star">⭐</span>
        </div>
        
        <div class="game-over-stats" id="game-over-stats">
          <div class="stat-item">
            <span class="stat-label">Final Score</span>
            <span class="stat-value" id="final-score">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Level Reached</span>
            <span class="stat-value" id="final-level">1</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Lines Cleared</span>
            <span class="stat-value" id="final-lines">0</span>
          </div>
        </div>

        <div class="detailed-stats" id="detailed-stats">
          <h3>Performance</h3>
          <div class="detailed-stats-grid">
            <div class="detail-stat">
              <span class="detail-label">Singles</span>
              <span class="detail-value" id="singles-count">0</span>
            </div>
            <div class="detail-stat">
              <span class="detail-label">Doubles</span>
              <span class="detail-value" id="doubles-count">0</span>
            </div>
            <div class="detail-stat">
              <span class="detail-label">Triples</span>
              <span class="detail-value" id="triples-count">0</span>
            </div>
            <div class="detail-stat">
              <span class="detail-label">Tetrises</span>
              <span class="detail-value" id="tetrises-count">0</span>
            </div>
            <div class="detail-stat">
              <span class="detail-label">Max Combo</span>
              <span class="detail-value" id="max-combo">0</span>
            </div>
            <div class="detail-stat">
              <span class="detail-label">Play Time</span>
              <span class="detail-value" id="play-time">0:00</span>
            </div>
          </div>
        </div>
        
        <div class="game-over-buttons">
          <button id="restart-button" class="game-over-btn primary">
            <span>Play Again</span>
          </button>
          <button id="menu-button" class="game-over-btn secondary">
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(screen);
    this.elements.container = screen;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Restart button
    if (this.elements.restartButton) {
      this.elements.restartButton.addEventListener('click', () => {
        this.hide();
        if (this.onRestart) {
          this.onRestart();
        }
      });
    }

    // Main menu button
    if (this.elements.menuButton) {
      this.elements.menuButton.addEventListener('click', () => {
        this.hide();
        if (this.onMainMenu) {
          this.onMainMenu();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.isVisible) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.elements.restartButton?.click();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          this.elements.menuButton?.click();
        }
      }
    });
  }

  /**
   * Show game over screen with game statistics
   */
  show(gameStats) {
    if (!this.elements.container) return;

    // Update statistics
    this.updateStats(gameStats);

    // Show container with animation
    this.elements.container.style.display = 'flex';
    setTimeout(() => {
      this.elements.container.classList.add('visible');
    }, 50);

    this.isVisible = true;
  }

  /**
   * Hide game over screen
   */
  hide() {
    if (!this.elements.container) return;

    this.elements.container.classList.remove('visible');
    setTimeout(() => {
      this.elements.container.style.display = 'none';
    }, 300);

    this.isVisible = false;
  }

  /**
   * Update statistics display
   */
  updateStats(stats) {
    // Basic stats
    if (this.elements.finalScore) {
      this.elements.finalScore.textContent = (stats.score || 0).toLocaleString();
    }
    if (this.elements.finalLevel) {
      this.elements.finalLevel.textContent = stats.level || 1;
    }
    if (this.elements.finalLines) {
      this.elements.finalLines.textContent = stats.lines || 0;
    }

    // Check for new high score
    if (stats.isNewHighScore) {
      this.showNewHighScore();
    } else {
      this.hideNewHighScore();
    }

    // Detailed stats
    this.updateDetailedStats(stats);
  }

  /**
   * Update detailed statistics
   */
  updateDetailedStats(stats) {
    // Line clear counts
    const singlesEl = document.getElementById('singles-count');
    const doublesEl = document.getElementById('doubles-count');
    const triplesEl = document.getElementById('triples-count');
    const tetrisesEl = document.getElementById('tetrises-count');
    const maxComboEl = document.getElementById('max-combo');
    const playTimeEl = document.getElementById('play-time');

    if (singlesEl) singlesEl.textContent = stats.singles || 0;
    if (doublesEl) doublesEl.textContent = stats.doubles || 0;
    if (triplesEl) triplesEl.textContent = stats.triples || 0;
    if (tetrisesEl) tetrisesEl.textContent = stats.tetrises || 0;
    if (maxComboEl) maxComboEl.textContent = stats.maxCombo || 0;
    
    if (playTimeEl && stats.playTime) {
      playTimeEl.textContent = this.formatTime(stats.playTime);
    }
  }

  /**
   * Format time in milliseconds to MM:SS
   */
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Show new high score banner
   */
  showNewHighScore() {
    if (this.elements.newHighScore) {
      this.elements.newHighScore.style.display = 'flex';
      this.elements.newHighScore.classList.add('celebrate');
    }
  }

  /**
   * Hide new high score banner
   */
  hideNewHighScore() {
    if (this.elements.newHighScore) {
      this.elements.newHighScore.style.display = 'none';
      this.elements.newHighScore.classList.remove('celebrate');
    }
  }

  /**
   * Show a rank/grade based on performance
   */
  showRank(score, lines, level) {
    let rank = 'C';
    let color = '#888';

    // Calculate rank based on performance
    if (score > 100000) {
      rank = 'S';
      color = '#FFD700';
    } else if (score > 50000) {
      rank = 'A';
      color = '#00FF00';
    } else if (score > 25000) {
      rank = 'B';
      color = '#4488FF';
    }

    // Create rank display if it doesn't exist
    let rankDisplay = document.getElementById('rank-display');
    if (!rankDisplay) {
      rankDisplay = document.createElement('div');
      rankDisplay.id = 'rank-display';
      rankDisplay.className = 'rank-display';
      this.elements.statsDisplay?.appendChild(rankDisplay);
    }

    rankDisplay.innerHTML = `
      <div class="rank-letter" style="color: ${color}; text-shadow: 0 0 20px ${color};">
        ${rank}
      </div>
      <div class="rank-label">Rank</div>
    `;
  }

  /**
   * Add a message to the game over screen
   */
  addMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `game-over-message ${type}`;
    messageEl.textContent = message;

    const content = this.elements.container?.querySelector('.game-over-content');
    if (content) {
      const buttons = content.querySelector('.game-over-buttons');
      if (buttons) {
        content.insertBefore(messageEl, buttons);
      } else {
        content.appendChild(messageEl);
      }
    }
  }

  /**
   * Show encouraging message based on performance
   */
  showEncouragingMessage(score) {
    const messages = [
      { threshold: 0, message: "Practice makes perfect!" },
      { threshold: 5000, message: "You're getting the hang of it!" },
      { threshold: 10000, message: "Nice work!" },
      { threshold: 25000, message: "Impressive skills!" },
      { threshold: 50000, message: "Outstanding performance!" },
      { threshold: 100000, message: "You're a Tetris master!" },
      { threshold: 200000, message: "Legendary! 🏆" }
    ];

    let message = messages[0].message;
    for (const msg of messages) {
      if (score >= msg.threshold) {
        message = msg.message;
      }
    }

    this.addMessage(message, 'encouragement');
  }

  /**
   * Check if game over screen is visible
   */
  isGameOverVisible() {
    return this.isVisible;
  }

  /**
   * Reset game over screen
   */
  reset() {
    this.hide();
    this.hideNewHighScore();
  }

  /**
   * Clean up
   */
  dispose() {
    if (this.elements.container) {
      this.elements.container.remove();
    }
  }
}