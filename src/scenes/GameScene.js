import { CONFIG } from '../config.js';
import GameLogic from '../game/GameLogic.js';
import SoundManager from '../utils/SoundManager.js';

export default class GameScene {
    constructor(engine, canvas, sceneManager) {
        this.engine = engine;
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = new SoundManager();
        this.soundManager.init();
        
        this.scene = new BABYLON.Scene(this.engine);
        this.setupScene();
        this.createHUD();
        this.initializeGame();
        this.setupInput();
    }

    // Setup scene with camera and lighting
    setupScene() {
        // Set background color
        this.scene.clearColor = new BABYLON.Color4(
            CONFIG.COLORS.DARK_BLUE.r * 0.5,
            CONFIG.COLORS.DARK_BLUE.g * 0.5,
            CONFIG.COLORS.DARK_BLUE.b * 0.5,
            1
        );

        // Create camera - tilted forward for 3D depth
        this.camera = new BABYLON.ArcRotateCamera(
            'gameCamera',
            CONFIG.CAMERA.ALPHA,
            CONFIG.CAMERA.BETA,
            CONFIG.CAMERA.RADIUS,
            CONFIG.CAMERA.TARGET,
            this.scene
        );
        this.camera.attachControl(this.canvas, false);
        
        // Lock camera movement
        this.camera.lowerRadiusLimit = CONFIG.CAMERA.RADIUS;
        this.camera.upperRadiusLimit = CONFIG.CAMERA.RADIUS;
        this.camera.lowerAlphaLimit = CONFIG.CAMERA.ALPHA;
        this.camera.upperAlphaLimit = CONFIG.CAMERA.ALPHA;
        this.camera.lowerBetaLimit = CONFIG.CAMERA.BETA;
        this.camera.upperBetaLimit = CONFIG.CAMERA.BETA;

        // Ambient light (cool blue)
        const ambientLight = new BABYLON.HemisphericLight(
            'ambientLight',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.6;
        ambientLight.diffuse = CONFIG.COLORS.LIGHT_BLUE;
        ambientLight.groundColor = CONFIG.COLORS.DARK_BLUE;

        // Directional light (warm amber)
        const directionalLight = new BABYLON.DirectionalLight(
            'directionalLight',
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        directionalLight.diffuse = CONFIG.COLORS.AMBER;
        directionalLight.intensity = 0.8;

        // Add shadows
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;

        // Add glow layer for ambient effect
        const glowLayer = new BABYLON.GlowLayer('glow', this.scene);
        glowLayer.intensity = 0.4;
    }

    // Initialize game logic
    initializeGame() {
        this.gameLogic = new GameLogic(
            this.scene,
            this.soundManager,
            (score, level, lines) => {
                this.sceneManager.goToGameOver(score, level, lines);
            }
        );

        // Update loop
        this.scene.registerBeforeRender(() => {
            this.gameLogic.update();
            this.updateHUD();
        });
    }

    // Create HUD overlay
    createHUD() {
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

        // Score panel (top-left)
        const scorePanel = new BABYLON.GUI.StackPanel();
        scorePanel.width = '250px';
        scorePanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        scorePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        scorePanel.left = '20px';
        scorePanel.top = '20px';
        scorePanel.spacing = 10;
        this.advancedTexture.addControl(scorePanel);

        // Score text
        this.scoreText = new BABYLON.GUI.TextBlock('score', 'Score: 0');
        this.scoreText.fontSize = 28;
        this.scoreText.color = '#FFB833'; // Amber
        this.scoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreText.height = '35px';
        scorePanel.addControl(this.scoreText);

        // Level text
        this.levelText = new BABYLON.GUI.TextBlock('level', 'Level: 1');
        this.levelText.fontSize = 24;
        this.levelText.color = '#66B3FF'; // Light Blue
        this.levelText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.levelText.height = '30px';
        scorePanel.addControl(this.levelText);

        // Lines text
        this.linesText = new BABYLON.GUI.TextBlock('lines', 'Lines: 0');
        this.linesText.fontSize = 24;
        this.linesText.color = '#BFBFBF'; // Silver
        this.linesText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.linesText.height = '30px';
        scorePanel.addControl(this.linesText);

        // Next piece label (top-right)
        const nextLabel = new BABYLON.GUI.TextBlock('nextLabel', 'Next Piece');
        nextLabel.fontSize = 24;
        nextLabel.color = '#FFB833';
        nextLabel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        nextLabel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        nextLabel.top = '20px';
        nextLabel.left = '-20px';
        nextLabel.height = '30px';
        nextLabel.width = '200px';
        nextLabel.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.advancedTexture.addControl(nextLabel);

        // Pause text (hidden by default)
        this.pauseText = new BABYLON.GUI.TextBlock('pause', 'PAUSED');
        this.pauseText.fontSize = 72;
        this.pauseText.color = '#FFB833';
        this.pauseText.fontWeight = 'bold';
        this.pauseText.isVisible = false;
        this.pauseText.shadowColor = '#1A3366';
        this.pauseText.shadowBlur = 20;
        this.advancedTexture.addControl(this.pauseText);

        // Controls hint (bottom-left)
        const controlsText = new BABYLON.GUI.TextBlock('controls', 'Arrows: Move/Rotate | Space: Drop | P: Pause');
        controlsText.fontSize = 16;
        controlsText.color = '#BFBFBF';
        controlsText.alpha = 0.7;
        controlsText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        controlsText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        controlsText.left = '20px';
        controlsText.top = '-20px';
        controlsText.height = '25px';
        controlsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.advancedTexture.addControl(controlsText);
    }

    // Update HUD with current game state
    updateHUD() {
        const state = this.gameLogic.getState();
        this.scoreText.text = `Score: ${state.score}`;
        this.levelText.text = `Level: ${state.level}`;
        this.linesText.text = `Lines: ${state.lines}`;
        this.pauseText.isVisible = state.isPaused;
    }

    // Setup keyboard input
    setupInput() {
        this.keyStates = {};

        this.scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key;

            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                // Prevent repeated key events
                if (this.keyStates[key]) return;
                this.keyStates[key] = true;

                switch(key) {
                    case 'ArrowLeft':
                        this.gameLogic.moveLeft();
                        break;
                    case 'ArrowRight':
                        this.gameLogic.moveRight();
                        break;
                    case 'ArrowUp':
                        this.gameLogic.rotatePiece();
                        break;
                    case 'ArrowDown':
                        this.gameLogic.moveDown();
                        break;
                    case ' ':
                        this.gameLogic.hardDrop();
                        break;
                    case 'p':
                    case 'P':
                        this.gameLogic.togglePause();
                        break;
                }
            } else if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
                this.keyStates[key] = false;
            }
        });
    }

    // Pause game
    pause() {
        if (this.gameLogic) {
            this.gameLogic.pause();
        }
    }

    // Dispose scene
    dispose() {
        if (this.gameLogic) {
            this.gameLogic.dispose();
        }
        if (this.soundManager) {
            this.soundManager.stopMusic();
        }
        if (this.scene) {
            this.scene.dispose();
        }
    }
}