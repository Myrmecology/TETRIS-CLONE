/**
 * HUD.js - Heads-Up Display for game information
 * Displays score, level, lines, next piece, and hold piece
 */

export class HUD {
  constructor() {
    this.elements = {};
    this.init();
  }

  /**
   * Initialize HUD elements
   */
  init() {
    // Get DOM elements
    this.elements.score = document.getElementById('score-value');
    this.elements.level = document.getElementById('level-value');
    this.elements.lines = document.getElementById('lines-value');
    this.elements.highScore = document.getElementById('high-score-value');
    this.elements.nextPiece = document.getElementById('next-piece');
    this.elements.holdPiece = document.getElementById('hold-piece');
    this.elements.comboText = document.getElementById('combo-text');
    this.elements.statsContainer = document.getElementById('game-stats');

    // Initialize all values
    this.updateScore(0);
    this.updateLevel(1);
    this.updateLines(0);
    this.updateHighScore(this.loadHighScore());
    this.hideCombo();
  }

  /**
   * Update score display
   */
  updateScore(score) {
    if (this.elements.score) {
      this.elements.score.textContent = score.toLocaleString();
      this.animateValue(this.elements.score);
    }
  }

  /**
   * Update level display
   */
  updateLevel(level) {
    if (this.elements.level) {
      this.elements.level.textContent = level;
      this.animateValue(this.elements.level);
      
      // Flash level up effect
      if (level > 1) {
        this.flashElement(this.elements.level);
      }
    }
  }

  /**
   * Update lines cleared display
   */
  updateLines(lines) {
    if (this.elements.lines) {
      this.elements.lines.textContent = lines;
      this.animateValue(this.elements.lines);
    }
  }

  /**
   * Update high score display
   */
  updateHighScore(highScore) {
    if (this.elements.highScore) {
      this.elements.highScore.textContent = highScore.toLocaleString();
    }
  }

  /**
   * Display next piece preview
   */
  showNextPiece(pieceType) {
    if (!this.elements.nextPiece) return;

    // Clear previous preview
    this.elements.nextPiece.innerHTML = '';

    // Create a mini grid for the piece
    const previewGrid = this.createPiecePreview(pieceType);
    this.elements.nextPiece.appendChild(previewGrid);
  }

  /**
   * Display hold piece
   */
  showHoldPiece(pieceType) {
    if (!this.elements.holdPiece) return;

    // Clear previous hold piece
    this.elements.holdPiece.innerHTML = '';

    if (pieceType) {
      const previewGrid = this.createPiecePreview(pieceType);
      this.elements.holdPiece.appendChild(previewGrid);
    }
  }

  /**
   * Create a preview grid for a piece
   */
  createPiecePreview(pieceType) {
    const container = document.createElement('div');
    container.className = 'piece-preview-grid';

    // Get piece shape from Constants (we'll need to import PIECES from Game or create a helper)
    const shapes = this.getPieceShapes();
    const shape = shapes[pieceType] || shapes.I;
    const color = this.getPieceColor(pieceType);

    // Create a 4x4 grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cell = document.createElement('div');
        cell.className = 'preview-cell';

        // Check if this position has a block
        const hasBlock = shape.some(([r, c]) => r === row && c === col);
        
        if (hasBlock) {
          cell.classList.add('filled');
          cell.style.backgroundColor = color.primary;
          cell.style.boxShadow = `0 0 10px ${color.glow || color.primary}`;
        }

        container.appendChild(cell);
      }
    }

    return container;
  }

  /**
   * Get piece shapes (simplified representation)
   */
  getPieceShapes() {
    return {
      I: [[0, 0], [0, 1], [0, 2], [0, 3]],
      O: [[0, 1], [0, 2], [1, 1], [1, 2]],
      T: [[0, 1], [1, 0], [1, 1], [1, 2]],
      S: [[0, 1], [0, 2], [1, 0], [1, 1]],
      Z: [[0, 0], [0, 1], [1, 1], [1, 2]],
      J: [[0, 0], [1, 0], [1, 1], [1, 2]],
      L: [[0, 2], [1, 0], [1, 1], [1, 2]]
    };
  }

  /**
   * Get piece colors (should match Colors.js)
   */
  getPieceColor(pieceType) {
    const colors = {
      I: { primary: '#00f0ff', glow: '#00f0ff' },
      O: { primary: '#f0f000', glow: '#f0f000' },
      T: { primary: '#a000f0', glow: '#a000f0' },
      S: { primary: '#00f000', glow: '#00f000' },
      Z: { primary: '#f00000', glow: '#f00000' },
      J: { primary: '#0000f0', glow: '#0000f0' },
      L: { primary: '#f0a000', glow: '#f0a000' }
    };

    return colors[pieceType] || colors.I;
  }

  /**
   * Show combo text
   */
  showCombo(combo) {
    if (!this.elements.comboText) return;

    this.elements.comboText.textContent = `${combo}x COMBO!`;
    this.elements.comboText.style.display = 'block';
    this.elements.comboText.classList.add('combo-animation');

    // Remove after animation
    setTimeout(() => {
      this.hideCombo();
    }, 2000);
  }

  /**
   * Hide combo text
   */
  hideCombo() {
    if (this.elements.comboText) {
      this.elements.comboText.style.display = 'none';
      this.elements.comboText.classList.remove('combo-animation');
    }
  }

  /**
   * Show special message (Tetris!, Perfect Clear!, etc.)
   */
  showMessage(message, duration = 2000) {
    // Create message element if it doesn't exist
    let messageEl = document.getElementById('special-message');
    
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.id = 'special-message';
      messageEl.className = 'special-message';
      document.body.appendChild(messageEl);
    }

    messageEl.textContent = message;
    messageEl.style.display = 'block';
    messageEl.classList.add('message-animation');

    setTimeout(() => {
      messageEl.style.display = 'none';
      messageEl.classList.remove('message-animation');
    }, duration);
  }

  /**
   * Animate value change
   */
  animateValue(element) {
    element.classList.remove('value-change');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('value-change');
  }

  /**
   * Flash element for emphasis
   */
  flashElement(element) {
    element.classList.add('flash');
    setTimeout(() => {
      element.classList.remove('flash');
    }, 500);
  }

  /**
   * Show pause overlay
   */
  showPause() {
    let pauseOverlay = document.getElementById('pause-overlay');
    
    if (!pauseOverlay) {
      pauseOverlay = document.createElement('div');
      pauseOverlay.id = 'pause-overlay';
      pauseOverlay.className = 'pause-overlay';
      pauseOverlay.innerHTML = `
        <div class="pause-content">
          <h1>PAUSED</h1>
          <p>Press ESC or P to resume</p>
        </div>
      `;
      document.body.appendChild(pauseOverlay);
    }

    pauseOverlay.style.display = 'flex';
  }

  /**
   * Hide pause overlay
   */
  hidePause() {
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
      pauseOverlay.style.display = 'none';
    }
  }

  /**
   * Load high score from localStorage
   */
  loadHighScore() {
    const saved = localStorage.getItem('tetris-high-score');
    return saved ? parseInt(saved, 10) : 0;
  }

  /**
   * Save high score to localStorage
   */
  saveHighScore(score) {
    const currentHigh = this.loadHighScore();
    if (score > currentHigh) {
      localStorage.setItem('tetris-high-score', score.toString());
      this.updateHighScore(score);
      return true; // New high score!
    }
    return false;
  }

  /**
   * Show FPS counter (for debugging)
   */
  showFPS(fps) {
    let fpsCounter = document.getElementById('fps-counter');
    
    if (!fpsCounter) {
      fpsCounter = document.createElement('div');
      fpsCounter.id = 'fps-counter';
      fpsCounter.className = 'fps-counter';
      document.body.appendChild(fpsCounter);
    }

    fpsCounter.textContent = `FPS: ${Math.round(fps)}`;
  }

  /**
   * Hide FPS counter
   */
  hideFPS() {
    const fpsCounter = document.getElementById('fps-counter');
    if (fpsCounter) {
      fpsCounter.remove();
    }
  }

  /**
   * Update all HUD elements at once
   */
  update(gameState) {
    if (gameState.score !== undefined) this.updateScore(gameState.score);
    if (gameState.level !== undefined) this.updateLevel(gameState.level);
    if (gameState.lines !== undefined) this.updateLines(gameState.lines);
    if (gameState.nextPiece) this.showNextPiece(gameState.nextPiece);
    if (gameState.holdPiece !== undefined) this.showHoldPiece(gameState.holdPiece);
  }

  /**
   * Reset HUD to initial state
   */
  reset() {
    this.updateScore(0);
    this.updateLevel(1);
    this.updateLines(0);
    this.hideCombo();
    this.hidePause();
    
    if (this.elements.nextPiece) {
      this.elements.nextPiece.innerHTML = '';
    }
    if (this.elements.holdPiece) {
      this.elements.holdPiece.innerHTML = '';
    }
  }

  /**
   * Show game info
   */
  showInfo() {
    const info = `
      <div class="info-panel">
        <h3>Controls</h3>
        <ul>
          <li><strong>←/→</strong> - Move</li>
          <li><strong>↑</strong> - Rotate</li>
          <li><strong>↓</strong> - Soft Drop</li>
          <li><strong>Space</strong> - Hard Drop</li>
          <li><strong>C</strong> - Hold Piece</li>
          <li><strong>P/ESC</strong> - Pause</li>
        </ul>
        <h3>Scoring</h3>
        <ul>
          <li>Single: 100 × level</li>
          <li>Double: 300 × level</li>
          <li>Triple: 500 × level</li>
          <li>Tetris: 800 × level</li>
          <li>Combos give bonus points!</li>
        </ul>
      </div>
    `;
    
    this.showMessage(info, 5000);
  }

  /**
   * Clean up
   */
  dispose() {
    this.hidePause();
    this.hideCombo();
    this.hideFPS();
  }
}