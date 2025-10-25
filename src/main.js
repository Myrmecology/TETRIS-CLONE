/**
 * main.js - Main entry point for the Tetris Clone
 * Initializes the game, renderer, and all systems
 */

import { Game } from './engine/Game.js';
import { Scene } from './renderer/Scene.js';
import { BlockMesh } from './renderer/BlockMesh.js';
import { Lighting } from './renderer/Lighting.js';
import { Effects } from './renderer/Effects.js';
import { Particles } from './renderer/Particles.js';
import { HUD } from './ui/HUD.js';
import { Menu } from './ui/Menu.js';
import { GameOver } from './ui/GameOver.js';

/**
 * Main Application Class
 */
class TetrisApp {
  constructor() {
    this.game = null;
    this.scene = null;
    this.blockMesh = null;
    this.lighting = null;
    this.effects = null;
    this.particles = null;
    this.hud = null;
    this.menu = null;
    this.gameOver = null;
    
    this.isRunning = false;
    this.isPaused = false;
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Hide loading screen after a short delay
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
          loadingScreen.classList.add('hidden');
          setTimeout(() => {
            loadingScreen.style.display = 'none';
          }, 500);
        }
      }, 1000);

      // Initialize renderer
      this.initRenderer();

      // Initialize UI
      this.initUI();

      // Setup event listeners
      this.setupEventListeners();

      console.log('✅ Tetris Clone initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize Tetris Clone:', error);
      this.showError('Failed to initialize game. Please refresh the page.');
    }
  }

  /**
   * Initialize Three.js renderer and systems
   */
  initRenderer() {
    const container = document.getElementById('game-canvas').parentElement;

    // Create scene
    this.scene = new Scene(container);

    // Create block mesh system
    this.blockMesh = new BlockMesh();

    // Create lighting system
    this.lighting = new Lighting(this.scene.getScene());

    // Create effects system
    this.effects = new Effects(this.scene.getScene(), this.scene.getCamera());

    // Create particle system
    this.particles = new Particles(this.scene.getScene());

    // Add board grid and boundaries
    const grid = this.blockMesh.createBoardGrid();
    this.scene.add(grid);

    const boundaries = this.blockMesh.createBoardBoundaries();
    this.scene.add(boundaries);

    // Create ambient particles for atmosphere
    this.particles.createAmbientParticles(30);

    // Start rendering
    this.scene.onUpdate(() => this.update());
    this.scene.start();
  }

  /**
   * Initialize UI systems
   */
  initUI() {
    // Initialize HUD
    this.hud = new HUD();

    // Initialize Menu
    this.menu = new Menu(
      () => this.startGame(),
      () => this.resumeGame()
    );

    // Initialize Game Over screen
    this.gameOver = new GameOver(
      () => this.restartGame(),
      () => this.returnToMenu()
    );
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Window visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isRunning && !this.isPaused) {
        this.pauseGame();
      }
    });
  }

  /**
   * Handle keyboard input
   */
  handleKeyDown(e) {
    // Pause/Unpause
    if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && this.isRunning) {
      if (this.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
      return;
    }

    // Prevent default for game keys
    if (this.isRunning && !this.isPaused) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
    }
  }

  /**
   * Start a new game
   */
  startGame() {
    // Get settings from menu
    const settings = this.menu.getSettings();

    // Create new game instance
    this.game = new Game({
      startLevel: parseInt(settings.startLevel) || 1,
      ghostPiece: settings.ghostPiece,
      particles: settings.particles,
      screenShake: settings.screenShake
    });

    // Setup game event listeners
    this.setupGameEvents();

    // Start the game
    this.game.start();
    this.isRunning = true;
    this.isPaused = false;

    // Hide menu
    this.menu.hide();

    console.log('🎮 Game started!');
  }

  /**
   * Setup game event listeners
   */
  setupGameEvents() {
    if (!this.game) return;

    // Score update
    this.game.on('scoreUpdate', (data) => {
      this.hud.updateScore(data.score);
    });

    // Level update
    this.game.on('levelUp', (data) => {
      this.hud.updateLevel(data.level);
      this.effects.createLevelUpEffect();
      this.lighting.intensify(1.5, 500);
      this.hud.showMessage('LEVEL UP!', 1500);
    });

    // Lines cleared update
    this.game.on('linesCleared', (data) => {
      this.hud.updateLines(data.totalLines);
      
      // Visual effects for line clears
      if (data.lines === 4) {
        this.hud.showMessage('TETRIS!', 2000);
        this.effects.shake(10, 400);
        this.effects.flash(0xffff00, 0.6, 200);
      } else if (data.lines === 3) {
        this.hud.showMessage('TRIPLE!', 1500);
      } else if (data.lines === 2) {
        this.hud.showMessage('DOUBLE!', 1000);
      }
    });

    // Combo
    this.game.on('combo', (data) => {
      if (data.combo > 1) {
        this.hud.showCombo(data.combo);
        this.effects.zoomPulse(0.1, 300);
      }
    });

    // Game over
    this.game.on('gameOver', (data) => {
      this.handleGameOver(data);
    });

    // Next piece update
    this.game.on('nextPiece', (data) => {
      this.hud.showNextPiece(data.type);
    });

    // Hold piece update
    this.game.on('holdPiece', (data) => {
      this.hud.showHoldPiece(data.type);
    });
  }

  /**
   * Pause the game
   */
  pauseGame() {
    if (!this.isRunning || this.isPaused) return;

    this.game?.pause();
    this.isPaused = true;
    this.hud.showPause();

    console.log('⏸️ Game paused');
  }

  /**
   * Resume the game
   */
  resumeGame() {
    if (!this.isRunning || !this.isPaused) return;

    this.game?.resume();
    this.isPaused = false;
    this.hud.hidePause();

    console.log('▶️ Game resumed');
  }

  /**
   * Restart the game
   */
  restartGame() {
    this.cleanup();
    this.startGame();
  }

  /**
   * Return to main menu
   */
  returnToMenu() {
    this.cleanup();
    this.menu.show();
    this.menu.disableResume();
  }

  /**
   * Handle game over
   */
  handleGameOver(data) {
    this.isRunning = false;

    // Check for new high score
    const isNewHighScore = this.hud.saveHighScore(data.score);

    // Create effects
    this.effects.createGameOverEffect();

    // Show game over screen after delay
    setTimeout(() => {
      this.gameOver.show({
        score: data.score,
        level: data.level,
        lines: data.lines,
        isNewHighScore: isNewHighScore,
        singles: data.singles || 0,
        doubles: data.doubles || 0,
        triples: data.triples || 0,
        tetrises: data.tetrises || 0,
        maxCombo: data.maxCombo || 0,
        playTime: data.playTime || 0
      });

      // Enable resume in menu (in case they want to go back)
      this.menu.enableResume();
    }, 2000);

    console.log('💀 Game over! Final score:', data.score);
  }

  /**
   * Update loop (called every frame)
   */
  update() {
    // Update lighting effects
    const time = Date.now();
    this.lighting.update();
    this.lighting.animateAccentLights(time);

    // Update visual effects
    this.effects.update();

    // Update particles
    this.particles.update();

    // Update game if running
    if (this.isRunning && !this.isPaused && this.game) {
      this.game.update();
    }
  }

  /**
   * Cleanup game resources
   */
  cleanup() {
    if (this.game) {
      this.game.dispose();
      this.game = null;
    }

    this.isRunning = false;
    this.isPaused = false;

    // Clear any visual effects
    // (Scene, lighting, particles persist across games)
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translate(-50%, -50%)';
    errorDiv.style.background = 'rgba(255, 0, 0, 0.9)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.borderRadius = '10px';
    errorDiv.style.zIndex = '10000';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
  }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TetrisApp();
  });
} else {
  new TetrisApp();
}