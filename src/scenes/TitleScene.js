import { CONFIG } from '../config.js';
import SoundManager from '../utils/SoundManager.js';

export default class TitleScene {
    constructor(engine, canvas, sceneManager) {
        this.engine = engine;
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.soundManager = new SoundManager();
        this.soundManager.init();
        
        this.scene = new BABYLON.Scene(this.engine);
        this.setupScene();
        this.createUI();
    }

    // Setup scene with camera, lighting, and background
    setupScene() {
        // Set background color (dark blue gradient)
        this.scene.clearColor = new BABYLON.Color4(
            CONFIG.COLORS.DARK_BLUE.r,
            CONFIG.COLORS.DARK_BLUE.g,
            CONFIG.COLORS.DARK_BLUE.b,
            1
        );

        // Create camera
        this.camera = new BABYLON.ArcRotateCamera(
            'titleCamera',
            0,
            Math.PI / 3,
            15,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        this.camera.attachControl(this.canvas, false);
        this.camera.lowerRadiusLimit = 15;
        this.camera.upperRadiusLimit = 15;

        // Create lighting
        const ambientLight = new BABYLON.HemisphericLight(
            'ambientLight',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.5;
        ambientLight.diffuse = CONFIG.COLORS.LIGHT_BLUE;

        const amberLight = new BABYLON.PointLight(
            'amberLight',
            new BABYLON.Vector3(5, 5, 5),
            this.scene
        );
        amberLight.diffuse = CONFIG.COLORS.AMBER;
        amberLight.intensity = 0.8;

        // Create decorative 3D amber crystals
        this.createDecorativeCrystals();

        // Add glow layer
        const glowLayer = new BABYLON.GlowLayer('glow', this.scene);
        glowLayer.intensity = 0.5;

        // Slow camera rotation
        this.scene.registerBeforeRender(() => {
            this.camera.alpha += 0.001;
        });
    }

    // Create decorative floating crystals
    createDecorativeCrystals() {
        for (let i = 0; i < 8; i++) {
            const crystal = BABYLON.MeshBuilder.CreateBox(
                `crystal_${i}`,
                { size: 0.5 + Math.random() * 0.5 },
                this.scene
            );

            // Position randomly around origin
            const angle = (i / 8) * Math.PI * 2;
            const radius = 5 + Math.random() * 3;
            crystal.position.x = Math.cos(angle) * radius;
            crystal.position.y = -2 + Math.random() * 4;
            crystal.position.z = Math.sin(angle) * radius;

            // Amber material
            const material = new BABYLON.PBRMetallicRoughnessMaterial(`crystalMat_${i}`, this.scene);
            material.baseColor = CONFIG.COLORS.AMBER;
            material.metallic = 0.3;
            material.roughness = 0.2;
            material.alpha = 0.7;
            material.emissiveColor = new BABYLON.Color3(1, 0.6, 0.1);
            material.emissiveIntensity = 0.4;
            crystal.material = material;

            // Slow rotation animation
            this.scene.registerBeforeRender(() => {
                crystal.rotation.y += 0.005;
                crystal.rotation.x += 0.003;
            });
        }
    }

    // Create UI with Babylon.js GUI
    createUI() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

        // Title: "Amber Tetris"
        const title = new BABYLON.GUI.TextBlock('title', 'Amber Tetris');
        title.fontSize = 80;
        title.color = '#FFB833'; // Amber
        title.fontWeight = 'bold';
        title.top = '-200px';
        title.shadowColor = '#FF8800';
        title.shadowBlur = 20;
        advancedTexture.addControl(title);

        // Subtitle: "A Tetris Clone"
        const subtitle = new BABYLON.GUI.TextBlock('subtitle', 'A Tetris Clone');
        subtitle.fontSize = 28;
        subtitle.color = '#66B3FF'; // Light Blue
        subtitle.top = '-130px';
        subtitle.fontStyle = 'italic';
        advancedTexture.addControl(subtitle);

        // Button container
        const buttonPanel = new BABYLON.GUI.StackPanel();
        buttonPanel.width = '400px';
        buttonPanel.top = '50px';
        buttonPanel.spacing = 20;
        advancedTexture.addControl(buttonPanel);

        // Start button
        const startButton = this.createButton('Start', () => {
            this.soundManager.playMusic();
            this.sceneManager.goToGame();
        });
        buttonPanel.addControl(startButton);

        // Settings button
        const settingsButton = this.createButton('Settings', () => {
            this.showSettings(advancedTexture);
        });
        buttonPanel.addControl(settingsButton);

        // How to Play button
        const howToPlayButton = this.createButton('How to Play', () => {
            this.showHowToPlay(advancedTexture);
        });
        buttonPanel.addControl(howToPlayButton);
    }

    // Create styled button
    createButton(text, onClick) {
        const button = BABYLON.GUI.Button.CreateSimpleButton('btn_' + text, text);
        button.width = '350px';
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

    // Show settings overlay
    showSettings(advancedTexture) {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = '500px';
        panel.height = '400px';
        panel.background = '#1A3366';
        panel.color = '#66B3FF';
        panel.thickness = 3;
        panel.cornerRadius = 15;
        panel.alpha = 0.95;
        advancedTexture.addControl(panel);

        const stack = new BABYLON.GUI.StackPanel();
        stack.spacing = 20;
        panel.addControl(stack);

        // Title
        const settingsTitle = new BABYLON.GUI.TextBlock('settingsTitle', 'Settings');
        settingsTitle.fontSize = 36;
        settingsTitle.color = '#FFB833';
        settingsTitle.height = '60px';
        stack.addControl(settingsTitle);

        // Music toggle
        const musicText = new BABYLON.GUI.TextBlock('musicText', `Music: ${this.soundManager.musicEnabled ? 'ON' : 'OFF'}`);
        musicText.fontSize = 24;
        musicText.color = '#BFBFBF';
        musicText.height = '40px';
        stack.addControl(musicText);

        const musicButton = this.createButton('Toggle Music', () => {
            this.soundManager.toggleMusic();
            musicText.text = `Music: ${this.soundManager.musicEnabled ? 'ON' : 'OFF'}`;
        });
        stack.addControl(musicButton);

        // SFX toggle
        const sfxText = new BABYLON.GUI.TextBlock('sfxText', `Sound Effects: ${this.soundManager.sfxEnabled ? 'ON' : 'OFF'}`);
        sfxText.fontSize = 24;
        sfxText.color = '#BFBFBF';
        sfxText.height = '40px';
        stack.addControl(sfxText);

        const sfxButton = this.createButton('Toggle SFX', () => {
            this.soundManager.toggleSFX();
            sfxText.text = `Sound Effects: ${this.soundManager.sfxEnabled ? 'ON' : 'OFF'}`;
        });
        stack.addControl(sfxButton);

        // Close button
        const closeButton = this.createButton('Close', () => {
            advancedTexture.removeControl(panel);
        });
        stack.addControl(closeButton);
    }

    // Show how to play overlay
    showHowToPlay(advancedTexture) {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = '600px';
        panel.height = '500px';
        panel.background = '#1A3366';
        panel.color = '#66B3FF';
        panel.thickness = 3;
        panel.cornerRadius = 15;
        panel.alpha = 0.95;
        advancedTexture.addControl(panel);

        const stack = new BABYLON.GUI.StackPanel();
        stack.spacing = 15;
        panel.addControl(stack);

        // Title
        const howToTitle = new BABYLON.GUI.TextBlock('howToTitle', 'How to Play');
        howToTitle.fontSize = 36;
        howToTitle.color = '#FFB833';
        howToTitle.height = '60px';
        stack.addControl(howToTitle);

        // Instructions
        const instructions = [
            'Arrow Keys: Move and Rotate',
            'Left/Right: Move piece',
            'Up: Rotate clockwise',
            'Down: Soft drop',
            'Space: Hard drop',
            'P: Pause',
            '',
            'Clear lines to score points!',
            'Game speeds up as you level up.'
        ];

        instructions.forEach(text => {
            const line = new BABYLON.GUI.TextBlock('instruction', text);
            line.fontSize = text === '' ? 10 : 20;
            line.color = '#BFBFBF';
            line.height = '30px';
            line.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            stack.addControl(line);
        });

        // Close button
        const closeButton = this.createButton('Close', () => {
            advancedTexture.removeControl(panel);
        });
        stack.addControl(closeButton);
    }

    // Pause (not used in title, but required for consistency)
    pause() {
        // Title scene doesn't need pause functionality
    }

    // Dispose scene
    dispose() {
        if (this.scene) {
            this.scene.dispose();
        }
    }
}