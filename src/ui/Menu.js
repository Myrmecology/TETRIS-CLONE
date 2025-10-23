/**
 * Menu.js - Main menu and navigation system
 * Handles main menu, settings, and game mode selection
 */

export class Menu {
  constructor(onStartGame, onResumeGame) {
    this.onStartGame = onStartGame;
    this.onResumeGame = onResumeGame;
    this.elements = {};
    this.isVisible = true;
    
    this.init();
  }

  /**
   * Initialize menu elements and event listeners
   */
  init() {
    // Get DOM elements
    this.elements.mainMenu = document.getElementById('main-menu');
    this.elements.startButton = document.getElementById('start-button');
    this.elements.resumeButton = document.getElementById('resume-button');
    this.elements.settingsButton = document.getElementById('settings-button');
    this.elements.instructionsButton = document.getElementById('instructions-button');
    this.elements.settingsPanel = document.getElementById('settings-panel');
    this.elements.instructionsPanel = document.getElementById('instructions-panel');
    this.elements.closeSettings = document.getElementById('close-settings');
    this.elements.closeInstructions = document.getElementById('close-instructions');

    // Setup event listeners
    this.setupEventListeners();

    // Load settings
    this.loadSettings();
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Start button
    if (this.elements.startButton) {
      this.elements.startButton.addEventListener('click', () => {
        this.hide();
        if (this.onStartGame) {
          this.onStartGame();
        }
      });
    }

    // Resume button
    if (this.elements.resumeButton) {
      this.elements.resumeButton.addEventListener('click', () => {
        this.hide();
        if (this.onResumeGame) {
          this.onResumeGame();
        }
      });
      // Initially hidden until there's a game to resume
      this.elements.resumeButton.style.display = 'none';
    }

    // Settings button
    if (this.elements.settingsButton) {
      this.elements.settingsButton.addEventListener('click', () => {
        this.showSettings();
      });
    }

    // Instructions button
    if (this.elements.instructionsButton) {
      this.elements.instructionsButton.addEventListener('click', () => {
        this.showInstructions();
      });
    }

    // Close settings
    if (this.elements.closeSettings) {
      this.elements.closeSettings.addEventListener('click', () => {
        this.hideSettings();
      });
    }

    // Close instructions
    if (this.elements.closeInstructions) {
      this.elements.closeInstructions.addEventListener('click', () => {
        this.hideInstructions();
      });
    }

    // Settings controls
    this.setupSettingsControls();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.isVisible && e.key === 'Enter') {
        this.elements.startButton?.click();
      }
      if (e.key === 'Escape') {
        this.hideSettings();
        this.hideInstructions();
      }
    });
  }

  /**
   * Setup settings panel controls
   */
  setupSettingsControls() {
    // Music volume
    const musicVolume = document.getElementById('music-volume');
    const musicValue = document.getElementById('music-value');
    if (musicVolume && musicValue) {
      musicVolume.addEventListener('input', (e) => {
        const value = e.target.value;
        musicValue.textContent = value + '%';
        this.saveSetting('musicVolume', value);
      });
    }

    // SFX volume
    const sfxVolume = document.getElementById('sfx-volume');
    const sfxValue = document.getElementById('sfx-value');
    if (sfxVolume && sfxValue) {
      sfxVolume.addEventListener('input', (e) => {
        const value = e.target.value;
        sfxValue.textContent = value + '%';
        this.saveSetting('sfxVolume', value);
      });
    }

    // Ghost piece toggle
    const ghostToggle = document.getElementById('ghost-toggle');
    if (ghostToggle) {
      ghostToggle.addEventListener('change', (e) => {
        this.saveSetting('ghostPiece', e.target.checked);
      });
    }

    // Particle effects toggle
    const particlesToggle = document.getElementById('particles-toggle');
    if (particlesToggle) {
      particlesToggle.addEventListener('change', (e) => {
        this.saveSetting('particles', e.target.checked);
      });
    }

    // Screen shake toggle
    const shakeToggle = document.getElementById('shake-toggle');
    if (shakeToggle) {
      shakeToggle.addEventListener('change', (e) => {
        this.saveSetting('screenShake', e.target.checked);
      });
    }

    // Starting level
    const startLevel = document.getElementById('start-level');
    const levelValue = document.getElementById('level-value-setting');
    if (startLevel && levelValue) {
      startLevel.addEventListener('input', (e) => {
        const value = e.target.value;
        levelValue.textContent = value;
        this.saveSetting('startLevel', value);
      });
    }
  }

  /**
   * Show the menu
   */
  show() {
    if (this.elements.mainMenu) {
      this.elements.mainMenu.style.display = 'flex';
      this.isVisible = true;
    }
  }

  /**
   * Hide the menu
   */
  hide() {
    if (this.elements.mainMenu) {
      this.elements.mainMenu.style.display = 'none';
      this.isVisible = false;
    }
  }

  /**
   * Show settings panel
   */
  showSettings() {
    if (this.elements.settingsPanel) {
      this.elements.settingsPanel.style.display = 'flex';
    }
  }

  /**
   * Hide settings panel
   */
  hideSettings() {
    if (this.elements.settingsPanel) {
      this.elements.settingsPanel.style.display = 'none';
    }
  }

  /**
   * Show instructions panel
   */
  showInstructions() {
    if (this.elements.instructionsPanel) {
      this.elements.instructionsPanel.style.display = 'flex';
    }
  }

  /**
   * Hide instructions panel
   */
  hideInstructions() {
    if (this.elements.instructionsPanel) {
      this.elements.instructionsPanel.style.display = 'none';
    }
  }

  /**
   * Enable resume button (when a game is in progress)
   */
  enableResume() {
    if (this.elements.resumeButton) {
      this.elements.resumeButton.style.display = 'block';
    }
  }

  /**
   * Disable resume button
   */
  disableResume() {
    if (this.elements.resumeButton) {
      this.elements.resumeButton.style.display = 'none';
    }
  }

  /**
   * Save a setting to localStorage
   */
  saveSetting(key, value) {
    try {
      localStorage.setItem(`tetris-setting-${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save setting:', e);
    }
  }

  /**
   * Load a setting from localStorage
   */
  loadSetting(key, defaultValue) {
    try {
      const saved = localStorage.getItem(`tetris-setting-${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  /**
   * Load all settings and apply to UI
   */
  loadSettings() {
    // Music volume
    const musicVolume = this.loadSetting('musicVolume', 70);
    const musicSlider = document.getElementById('music-volume');
    const musicValue = document.getElementById('music-value');
    if (musicSlider && musicValue) {
      musicSlider.value = musicVolume;
      musicValue.textContent = musicVolume + '%';
    }

    // SFX volume
    const sfxVolume = this.loadSetting('sfxVolume', 80);
    const sfxSlider = document.getElementById('sfx-volume');
    const sfxValue = document.getElementById('sfx-value');
    if (sfxSlider && sfxValue) {
      sfxSlider.value = sfxVolume;
      sfxValue.textContent = sfxVolume + '%';
    }

    // Ghost piece
    const ghostPiece = this.loadSetting('ghostPiece', true);
    const ghostToggle = document.getElementById('ghost-toggle');
    if (ghostToggle) {
      ghostToggle.checked = ghostPiece;
    }

    // Particles
    const particles = this.loadSetting('particles', true);
    const particlesToggle = document.getElementById('particles-toggle');
    if (particlesToggle) {
      particlesToggle.checked = particles;
    }

    // Screen shake
    const screenShake = this.loadSetting('screenShake', true);
    const shakeToggle = document.getElementById('shake-toggle');
    if (shakeToggle) {
      shakeToggle.checked = screenShake;
    }

    // Start level
    const startLevel = this.loadSetting('startLevel', 1);
    const levelSlider = document.getElementById('start-level');
    const levelValue = document.getElementById('level-value-setting');
    if (levelSlider && levelValue) {
      levelSlider.value = startLevel;
      levelValue.textContent = startLevel;
    }
  }

  /**
   * Get all current settings
   */
  getSettings() {
    return {
      musicVolume: this.loadSetting('musicVolume', 70),
      sfxVolume: this.loadSetting('sfxVolume', 80),
      ghostPiece: this.loadSetting('ghostPiece', true),
      particles: this.loadSetting('particles', true),
      screenShake: this.loadSetting('screenShake', true),
      startLevel: this.loadSetting('startLevel', 1)
    };
  }

  /**
   * Show achievement notification
   */
  showAchievement(title, description) {
    const achievement = document.createElement('div');
    achievement.className = 'achievement-notification';
    achievement.innerHTML = `
      <div class="achievement-icon">🏆</div>
      <div class="achievement-content">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    `;

    document.body.appendChild(achievement);

    // Animate in
    setTimeout(() => {
      achievement.classList.add('show');
    }, 100);

    // Remove after delay
    setTimeout(() => {
      achievement.classList.remove('show');
      setTimeout(() => {
        achievement.remove();
      }, 300);
    }, 4000);
  }

  /**
   * Toggle menu visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if menu is visible
   */
  isMenuVisible() {
    return this.isVisible;
  }

  /**
   * Reset menu to default state
   */
  reset() {
    this.hideSettings();
    this.hideInstructions();
    this.disableResume();
  }

  /**
   * Clean up event listeners
   */
  dispose() {
    // Remove all event listeners if needed
    // (In a production app, you'd track listeners to remove them properly)
  }
}