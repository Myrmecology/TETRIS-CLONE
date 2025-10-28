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

    // Setup scene with camera and lighting
    setupScene() {
        // Set background color (darker)
        this.scene.clearColor = new BABYLON.Color4(
            CONFIG.COLORS.DARK_BLUE.r * 0.3,
            CONFIG.COLORS.DARK_BLUE.g * 0.3,
            CONFIG.COLORS.DARK_BLUE.b * 0.3,
            1
        );

        // Create camera
        this.camera = new BABYLON.ArcRotateCamera(
            'gameOverCamera',
            0,
            Math.PI / 3,
            12,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        this.camera.attachControl(this.canvas, false);
        this.camera.lowerRadiusLimit = 12;
        this.camera.upperRadiusLimit = 12;

        // Dim lighting
        const ambientLight = new BABYLON.HemisphericLight(
            'ambientLight',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.3;
        ambientLight.diffuse = CONFIG.COLORS.LIGHT_BLUE;

        // Create some shattered crystal pieces for dramatic effect
        this.createShatteredCrystals();

        // Add glow layer
        const glowLayer = new BABYLON.GlowLayer('glow', this.scene);
        glowLayer.intensity = 0.3;

        // Slow camera rotation
        this.scene.registerBeforeRender(() => {
            this.camera.alpha += 0.002;
        });
    }

    // Create shattered crystal effects
    createShatteredCrystals() {
        for (let i = 0; i < 12; i++) {
            const shard = BABYLON.MeshBuilder.CreateBox(
                `shard_${i}`,
                { 
                    width: 0.3 + Math.random() * 0.3,
                    height: 0.8 + Math.random() * 0.5,
                    depth: 0.3 + Math.random() * 0.3
                },
                this.scene
            );

            // Random position
            const angle = (i / 12) * Math.PI * 2;
            const radius = 4 + Math.random() * 2;
            shard.position.x = Math.cos(angle) * radius;
            shard.position.y = -3 + Math.random() * 6;
            shard.position.z = Math.sin(angle) * radius;

            // Random rotation
            shard.rotation.x = Math.random() * Math.PI;
            shard.rotation.y = Math.random() * Math.PI;
            shard.rotation.z = Math.random() * Math.PI;

            // Darker amber material
            const material = new BABYLON.PBRMetallicRoughnessMaterial(`shardMat_${i}`, this.scene);
            material.baseColor = new BABYLON.Color3(0.6, 0.4, 0.1);
            material.metallic = 0.5;
            material.roughness = 0.4;
            material.alpha = 0.5;
            material.emissiveColor = new BABYLON.Color3(0.5, 0.3, 0.05);
            material.emissiveIntensity = 0.2;
            shard.material = material;

            // Slow falling animation
            const fallSpeed = 0.01 + Math.random() * 0.02;
            this.scene.registerBeforeRender(() => {
                shard.position.y -= fallSpeed;
                if (shard.position.y < -5) {
                    shard.position.y = 5;
                }
                shard.rotation.y += 0.01;
            });
        }
    }

    // Create UI
    createUI() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

        // Fade in effect
        let alpha = 0;
        const fadeInterval = setInterval(() => {
            alpha += 0.02;
            if (alpha >= 1) {
                alpha = 1;
                clearInterval(fadeInterval);
            }
        }, 16);

        // Game Over title
        const gameOverText = new BABYLON.GUI.TextBlock('gameOver', 'Game Over');
        gameOverText.fontSize = 80;
        gameOverText.color = '#FFB833'; // Amber
        gameOverText.fontWeight = 'bold';
        gameOverText.top = '-220px';
        gameOverText.shadowColor = '#FF4444';
        gameOverText.shadowBlur = 30;
        advancedTexture.addControl(gameOverText);

        // Stats panel
        const statsPanel = new BABYLON.GUI.StackPanel();
        statsPanel.width = '400px';
        statsPanel.top = '-80px';
        statsPanel.spacing = 15;
        advancedTexture.addControl(statsPanel);

        // Final score
        const scoreText = new BABYLON.GUI.TextBlock('finalScore', `Final Score: ${this.score}`);
        scoreText.fontSize = 36;
        scoreText.color = '#FFB833';
        scoreText.height = '45px';
        statsPanel.addControl(scoreText);

        // Level reached
        const levelText = new BABYLON.GUI.TextBlock('finalLevel', `Level Reached: ${this.level}`);
        levelText.fontSize = 28;
        levelText.color = '#66B3FF';
        levelText.height = '35px';
        statsPanel.addControl(levelText);

        // Lines cleared
        const linesText = new BABYLON.GUI.TextBlock('finalLines', `Lines Cleared: ${this.lines}`);
        linesText.fontSize = 28;
        linesText.color = '#BFBFBF';
        linesText.height = '35px';
        statsPanel.addControl(linesText);

        // Button container
        const buttonPanel = new BABYLON.GUI.StackPanel();
        buttonPanel.width = '400px';
        buttonPanel.top = '120px';
        buttonPanel.spacing = 20;
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

    // Create styled button
    createButton(text, onClick) {
        const button = BABYLON.GUI.Button.CreateSimpleButton('btn_' + text, text);
        button.width = '380px';
        button.height = '60px';
        button.color = '#BFBFBF'; // Silver
        button.background = '#1A3366'; // Dark Blue
        button.fontSize = 24;
        button.cornerRadius = 10;
        button.thickness = 2;
        button.shadowColor = '#66B3FF';
        button.shadowBlur = 10;

        button.onPointerEnterObservable.add(() => {
            button.background = '#66B3FF'; // Light Blue
            button.color = '#1A3366'; // Dark Blue
        });

        button.onPointerOutObservable.add(() => {
            button.background = '#1A3366';
            button.color = '#BFBFBF';
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