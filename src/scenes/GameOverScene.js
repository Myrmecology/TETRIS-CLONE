import { CONFIG } from '../config.js';

export default class GameOverScene {
    constructor(engine, canvas, sceneManager, score, level, lines) {
        this.engine = engine;
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.score = score;
        this.level = level;
        this.lines = lines;
        
        this.scene = new BABYLON.Scene(this.engine);
        this.setupScene();
        this.createUI();
    }

    // Setup scene with enhanced drama and atmosphere
    setupScene() {
        // Darker, more dramatic background
        this.scene.clearColor = new BABYLON.Color4(
            CONFIG.COLORS.DARK_BLUE.r * 0.2,
            CONFIG.COLORS.DARK_BLUE.g * 0.2,
            CONFIG.COLORS.DARK_BLUE.b * 0.2,
            1
        );

        // Enhanced fog for mood
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.025;
        this.scene.fogColor = new BABYLON.Color3(0.05, 0.1, 0.15);

        // Create camera
        this.camera = new BABYLON.ArcRotateCamera(
            'gameOverCamera',
            Math.PI / 4,
            Math.PI / 3,
            15,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        this.camera.attachControl(this.canvas, false);
        this.camera.lowerRadiusLimit = 15;
        this.camera.upperRadiusLimit = 15;

        // Dim, moody lighting
        const ambientLight = new BABYLON.HemisphericLight(
            'ambientLight',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.25;
        ambientLight.diffuse = CONFIG.COLORS.DARK_BLUE;
        ambientLight.groundColor = new BABYLON.Color3(0.05, 0.05, 0.1);

        // Dramatic red-amber spotlight from above
        const spotlight = new BABYLON.SpotLight(
            'spotlight',
            new BABYLON.Vector3(0, 15, 0),
            new BABYLON.Vector3(0, -1, 0),
            Math.PI / 2,
            2,
            this.scene
        );
        spotlight.diffuse = new BABYLON.Color3(0.8, 0.3, 0.1); // Darker amber/red
        spotlight.intensity = 1.5;

        // Create dramatic shattered crystals
        this.createShatteredCrystals();

        // Create falling particle debris
        this.createDebrisParticles();

        // Add glow layer
        const glowLayer = new BABYLON.GlowLayer('glow', this.scene, {
            mainTextureFixedSize: 1024,
            blurKernelSize: 64
        });
        glowLayer.intensity = 0.4;

        // Slow, dramatic camera rotation
        this.scene.registerBeforeRender(() => {
            this.camera.alpha += 0.0015;
        });
    }

    // Create enhanced shattered crystal effects
    createShatteredCrystals() {
        for (let i = 0; i < 20; i++) {
            // Varied shard sizes
            const width = 0.2 + Math.random() * 0.4;
            const height = 0.6 + Math.random() * 1.0;
            const depth = 0.2 + Math.random() * 0.4;
            
            const shard = BABYLON.MeshBuilder.CreateBox(
                `shard_${i}`,
                { width, height, depth },
                this.scene
            );

            // Position in expanding sphere
            const angle = (i / 20) * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI * 0.5;
            const radius = 4 + Math.random() * 3;
            
            shard.position.x = Math.cos(angle) * Math.cos(elevation) * radius;
            shard.position.y = -2 + Math.random() * 8;
            shard.position.z = Math.sin(angle) * Math.cos(elevation) * radius;

            // Random rotation
            shard.rotation.x = Math.random() * Math.PI * 2;
            shard.rotation.y = Math.random() * Math.PI * 2;
            shard.rotation.z = Math.random() * Math.PI * 2;

            // Dark, broken amber material
            const material = new BABYLON.PBRMetallicRoughnessMaterial(`shardMat_${i}`, this.scene);
            
            // Darker amber with variation
            const darkness = 0.4 + Math.random() * 0.3;
            material.baseColor = new BABYLON.Color3(
                CONFIG.COLORS.AMBER_DARK.r * darkness,
                CONFIG.COLORS.AMBER_DARK.g * darkness,
                CONFIG.COLORS.AMBER_DARK.b * darkness
            );
            
            material.metallic = 0.6;
            material.roughness = 0.5;
            material.alpha = 0.6 + Math.random() * 0.2;
            
            // Dim emissive glow
            material.emissiveColor = new BABYLON.Color3(0.4, 0.2, 0.05);
            material.emissiveIntensity = 0.15 + Math.random() * 0.15;
            
            shard.material = material;

            // Falling and tumbling animation
            const fallSpeed = 0.008 + Math.random() * 0.015;
            const rotSpeed = new BABYLON.Vector3(
                (Math.random() - 0.5) * 0.03,
                (Math.random() - 0.5) * 0.03,
                (Math.random() - 0.5) * 0.03
            );
            const startY = shard.position.y;
            const fallDistance = 12;
            
            this.scene.registerBeforeRender(() => {
                shard.position.y -= fallSpeed;
                
                // Reset to top when falls too far
                if (shard.position.y < startY - fallDistance) {
                    shard.position.y = startY;
                }
                
                // Tumbling rotation
                shard.rotation.x += rotSpeed.x;
                shard.rotation.y += rotSpeed.y;
                shard.rotation.z += rotSpeed.z;
            });
        }
    }

    // Create falling debris particle system
    createDebrisParticles() {
        const particleSystem = new BABYLON.ParticleSystem(
            'debris',
            150,
            this.scene
        );

        particleSystem.particleTexture = new BABYLON.Texture(
            'https://www.babylonjs-playground.com/textures/flare.png',
            this.scene
        );

        // Emit from above
        particleSystem.emitter = new BABYLON.Vector3(0, 8, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-5, 0, -5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(5, 2, 5);

        // Dark amber particle colors
        particleSystem.color1 = new BABYLON.Color4(
            CONFIG.COLORS.AMBER_DARK.r,
            CONFIG.COLORS.AMBER_DARK.g,
            CONFIG.COLORS.AMBER_DARK.b,
            0.3
        );
        particleSystem.color2 = new BABYLON.Color4(
            CONFIG.COLORS.AMBER_DARK.r * 0.5,
            CONFIG.COLORS.AMBER_DARK.g * 0.5,
            CONFIG.COLORS.AMBER_DARK.b * 0.5,
            0.2
        );
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

        // Small particle size
        particleSystem.minSize = 0.08;
        particleSystem.maxSize = 0.25;

        // Particle lifetime
        particleSystem.minLifeTime = 3;
        particleSystem.maxLifeTime = 6;

        particleSystem.emitRate = 20;

        // Falling with slight drift
        particleSystem.direction1 = new BABYLON.Vector3(-0.5, -1.5, -0.5);
        particleSystem.direction2 = new BABYLON.Vector3(0.5, -1, 0.5);

        particleSystem.minEmitPower = 0.5;
        particleSystem.maxEmitPower = 1.5;
        particleSystem.updateSpeed = 0.015;

        // Gravity
        particleSystem.gravity = new BABYLON.Vector3(0, -2, 0);

        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        particleSystem.start();
    }

    // Create UI with enhanced styling
    createUI() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

        // Fade in animation
        let fadeAlpha = 0;
        const fadeInterval = setInterval(() => {
            fadeAlpha += 0.015;
            if (fadeAlpha >= 1) {
                fadeAlpha = 1;
                clearInterval(fadeInterval);
            }
        }, 16);

        // Game Over title with dramatic styling
        const gameOverText = new BABYLON.GUI.TextBlock('gameOver', 'Game Over');
        gameOverText.fontSize = 90;
        gameOverText.color = '#FFB833';
        gameOverText.fontWeight = 'bold';
        gameOverText.top = '-240px';
        gameOverText.shadowColor = '#CC3333';
        gameOverText.shadowBlur = 40;
        gameOverText.shadowOffsetX = 4;
        gameOverText.shadowOffsetY = 4;
        advancedTexture.addControl(gameOverText);

        // Pulsing animation for Game Over text
        this.scene.registerBeforeRender(() => {
            const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.1;
            gameOverText.scaleX = pulse;
            gameOverText.scaleY = pulse;
        });

        // Stats panel with enhanced background
        const statsBackground = new BABYLON.GUI.Rectangle();
        statsBackground.width = '500px';
        statsBackground.height = '180px';
        statsBackground.top = '-60px';
        statsBackground.background = 'rgba(26, 51, 102, 0.7)';
        statsBackground.color = '#66B3FF';
        statsBackground.thickness = 3;
        statsBackground.cornerRadius = 20;
        statsBackground.shadowColor = '#000000';
        statsBackground.shadowBlur = 25;
        advancedTexture.addControl(statsBackground);

        const statsPanel = new BABYLON.GUI.StackPanel();
        statsPanel.width = '450px';
        statsPanel.top = '-60px';
        statsPanel.spacing = 18;
        advancedTexture.addControl(statsPanel);

        // Final score with emphasis
        const scoreText = new BABYLON.GUI.TextBlock('finalScore', `Final Score: ${this.score}`);
        scoreText.fontSize = 42;
        scoreText.color = '#FFB833';
        scoreText.fontWeight = 'bold';
        scoreText.height = '50px';
        scoreText.shadowColor = '#1A3366';
        scoreText.shadowBlur = 10;
        statsPanel.addControl(scoreText);

        // Level reached
        const levelText = new BABYLON.GUI.TextBlock('finalLevel', `Level Reached: ${this.level}`);
        levelText.fontSize = 30;
        levelText.color = '#66B3FF';
        levelText.height = '40px';
        statsPanel.addControl(levelText);

        // Lines cleared
        const linesText = new BABYLON.GUI.TextBlock('finalLines', `Lines Cleared: ${this.lines}`);
        linesText.fontSize = 30;
        linesText.color = '#BFBFBF';
        linesText.height = '40px';
        statsPanel.addControl(linesText);

        // Button container
        const buttonPanel = new BABYLON.GUI.StackPanel();
        buttonPanel.width = '450px';
        buttonPanel.top = '160px';
        buttonPanel.spacing = 25;
        advancedTexture.addControl(buttonPanel);

        // Play Again button
        const playAgainButton = this.createButton('Play Again', () => {
            this.sceneManager.goToGame();
        });
        buttonPanel.addControl(playAgainButton);

        // Return to Title button
        const titleButton = this.createButton('Return to Title Screen', () => {
            this.sceneManager.goToTitle();
        });
        buttonPanel.addControl(titleButton);
    }

    // Create enhanced styled button
    createButton(text, onClick) {
        const button = BABYLON.GUI.Button.CreateSimpleButton('btn_' + text, text);
        button.width = '420px';
        button.height = '70px';
        button.color = '#BFBFBF';
        button.background = 'rgba(26, 51, 102, 0.8)';
        button.fontSize = 26;
        button.cornerRadius = 15;
        button.thickness = 3;
        button.shadowColor = '#FFB833';
        button.shadowBlur = 15;
        button.shadowOffsetY = 4;

        button.onPointerEnterObservable.add(() => {
            button.background = 'rgba(255, 184, 51, 0.9)';
            button.color = '#1A3366';
            button.thickness = 4;
            button.shadowBlur = 25;
        });

        button.onPointerOutObservable.add(() => {
            button.background = 'rgba(26, 51, 102, 0.8)';
            button.color = '#BFBFBF';
            button.thickness = 3;
            button.shadowBlur = 15;
        });

        button.onPointerClickObservable.add(onClick);

        return button;
    }

    // Pause (not used, but required for consistency)
    pause() {
        // Game Over scene doesn't need pause functionality
    }

    // Dispose scene
    dispose() {
        if (this.scene) {
            this.scene.dispose();
        }
    }
}