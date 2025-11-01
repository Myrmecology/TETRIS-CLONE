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

    // Setup scene with enhanced lighting and atmosphere
    setupScene() {
        // Enhanced background with gradient
        this.scene.clearColor = new BABYLON.Color4(
            CONFIG.COLORS.DARK_BLUE.r * 0.3,
            CONFIG.COLORS.DARK_BLUE.g * 0.3,
            CONFIG.COLORS.DARK_BLUE.b * 0.3,
            1
        );

        // Volumetric fog for atmosphere
        if (CONFIG.VISUALS.FOG_ENABLED) {
            this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            this.scene.fogDensity = CONFIG.VISUALS.FOG_DENSITY;
            this.scene.fogColor = CONFIG.COLORS.FOG_COLOR;
        }

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

        // Enhanced ambient light (cool blue from above)
        const ambientLight = new BABYLON.HemisphericLight(
            'ambientLight',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = CONFIG.VISUALS.AMBIENT_INTENSITY;
        ambientLight.diffuse = CONFIG.COLORS.LIGHT_BLUE;
        ambientLight.groundColor = new BABYLON.Color3(0.05, 0.1, 0.15);
        ambientLight.specular = new BABYLON.Color3(0.2, 0.3, 0.5);

        // Main directional light (warm amber from side)
        const directionalLight = new BABYLON.DirectionalLight(
            'directionalLight',
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        directionalLight.diffuse = CONFIG.COLORS.AMBER_GLOW;
        directionalLight.intensity = CONFIG.VISUALS.DIRECTIONAL_INTENSITY;
        directionalLight.specular = CONFIG.COLORS.AMBER;

        // Accent point light (warm glow near board)
        const accentLight = new BABYLON.PointLight(
            'accentLight',
            new BABYLON.Vector3(5, 15, 5),
            this.scene
        );
        accentLight.diffuse = CONFIG.COLORS.AMBER;
        accentLight.intensity = CONFIG.VISUALS.POINT_LIGHT_INTENSITY;
        accentLight.range = 30;

        // Secondary accent light (cool blue from other side)
        const accentLight2 = new BABYLON.PointLight(
            'accentLight2',
            new BABYLON.Vector3(5, 10, -5),
            this.scene
        );
        accentLight2.diffuse = CONFIG.COLORS.LIGHT_BLUE;
        accentLight2.intensity = 0.4;
        accentLight2.range = 25;

        // Enhanced shadow system
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 64;
        shadowGenerator.blurScale = 2;
        shadowGenerator.darkness = 0.3;

        // Enhanced glow layer for ambient lighting
        const glowLayer = new BABYLON.GlowLayer('glow', this.scene, {
            mainTextureFixedSize: 1024,
            blurKernelSize: CONFIG.VISUALS.GLOW_BLUR_KERNEL
        });
        glowLayer.intensity = CONFIG.VISUALS.GLOW_INTENSITY;

        // Create atmospheric particles (floating dust motes)
        this.createAtmosphericParticles();
    }

    // Create floating ambient particles for atmosphere
    createAtmosphericParticles() {
        const particleSystem = new BABYLON.ParticleSystem(
            'atmosphere',
            200,
            this.scene
        );

        particleSystem.particleTexture = new BABYLON.Texture(
            'https://www.babylonjs-playground.com/textures/flare.png',
            this.scene
        );

        // Emitter area around the board
        particleSystem.emitter = new BABYLON.Vector3(5, 10, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-8, -10, -5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(8, 10, 5);

        // Particle appearance - subtle amber dust
        particleSystem.color1 = new BABYLON.Color4(
            CONFIG.COLORS.AMBER_DARK.r,
            CONFIG.COLORS.AMBER_DARK.g,
            CONFIG.COLORS.AMBER_DARK.b,
            0.15
        );
        particleSystem.color2 = new BABYLON.Color4(
            CONFIG.COLORS.AMBER.r,
            CONFIG.COLORS.AMBER.g,
            CONFIG.COLORS.AMBER.b,
            0.1
        );
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

        // Very small particles
        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.15;

        // Long lifetime, slow movement
        particleSystem.minLifeTime = 8;
        particleSystem.maxLifeTime = 15;

        particleSystem.emitRate = 10;

        // Slow upward drift
        particleSystem.direction1 = new BABYLON.Vector3(-0.5, 0.5, -0.5);
        particleSystem.direction2 = new BABYLON.Vector3(0.5, 1, 0.5);

        particleSystem.minEmitPower = 0.2;
        particleSystem.maxEmitPower = 0.5;
        particleSystem.updateSpeed = 0.01;

        // Additive blending for glow
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        particleSystem.start();
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