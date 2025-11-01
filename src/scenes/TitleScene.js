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

    // Setup scene with enhanced camera, lighting, and dramatic background
    setupScene() {
        // Enhanced gradient background
        this.scene.clearColor = new BABYLON.Color4(
            CONFIG.COLORS.DARK_BLUE.r * 0.5,
            CONFIG.COLORS.DARK_BLUE.g * 0.5,
            CONFIG.COLORS.DARK_BLUE.b * 0.5,
            1
        );

        // Volumetric fog for atmosphere
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.015;
        this.scene.fogColor = new BABYLON.Color3(0.1, 0.15, 0.25);

        // Create camera with cinematic angle
        this.camera = new BABYLON.ArcRotateCamera(
            'titleCamera',
            Math.PI / 4,
            Math.PI / 3,
            20,
            new BABYLON.Vector3(0, 2, 0),
            this.scene
        );
        this.camera.attachControl(this.canvas, false);
        this.camera.lowerRadiusLimit = 20;
        this.camera.upperRadiusLimit = 20;

        // Enhanced ambient lighting
        const ambientLight = new BABYLON.HemisphericLight(
            'ambientLight',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.4;
        ambientLight.diffuse = CONFIG.COLORS.LIGHT_BLUE;
        ambientLight.groundColor = CONFIG.COLORS.DARK_BLUE;

        // Dramatic amber spotlight
        const spotlight = new BABYLON.SpotLight(
            'spotlight',
            new BABYLON.Vector3(0, 15, -10),
            new BABYLON.Vector3(0, -1, 0.3),
            Math.PI / 3,
            2,
            this.scene
        );
        spotlight.diffuse = CONFIG.COLORS.AMBER_GLOW;
        spotlight.intensity = 2.0;

        // Accent point lights
        const pointLight1 = new BABYLON.PointLight(
            'pointLight1',
            new BABYLON.Vector3(-8, 5, -5),
            this.scene
        );
        pointLight1.diffuse = CONFIG.COLORS.AMBER;
        pointLight1.intensity = 0.8;

        const pointLight2 = new BABYLON.PointLight(
            'pointLight2',
            new BABYLON.Vector3(8, 3, 5),
            this.scene
        );
        pointLight2.diffuse = CONFIG.COLORS.LIGHT_BLUE;
        pointLight2.intensity = 0.6;

        // Create massive centerpiece crystal
        this.createCenterpiece();

        // Create decorative floating crystals
        this.createDecorativeCrystals();

        // Create particle field
        this.createParticleField();

        // Add enhanced glow layer
        const glowLayer = new BABYLON.GlowLayer('glow', this.scene, {
            mainTextureFixedSize: 1024,
            blurKernelSize: 64
        });
        glowLayer.intensity = 0.7;

        // Cinematic camera rotation
        this.scene.registerBeforeRender(() => {
            this.camera.alpha += 0.0008;
        });
    }

    // Create massive centerpiece crystal
    createCenterpiece() {
        // Central large crystal cluster
        const centerCrystal = BABYLON.MeshBuilder.CreatePolyhedron(
            'centerCrystal',
            { type: 1, size: 3 },
            this.scene
        );
        centerCrystal.position.y = 2;

        // Enhanced amber material
        const material = new BABYLON.PBRMetallicRoughnessMaterial('centerMat', this.scene);
        material.baseColor = CONFIG.COLORS.AMBER;
        material.metallic = 0.3;
        material.roughness = 0.1;
        material.alpha = 0.88;
        material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        
        // Strong inner glow
        material.emissiveColor = CONFIG.COLORS.AMBER_GLOW;
        material.emissiveIntensity = 0.8;
        
        // Subsurface scattering
        material.subSurface.isTranslucencyEnabled = true;
        material.subSurface.translucencyIntensity = 1.0;
        material.subSurface.tintColor = CONFIG.COLORS.AMBER;
        
        centerCrystal.material = material;

        // Slow rotation
        this.scene.registerBeforeRender(() => {
            centerCrystal.rotation.y += 0.003;
            centerCrystal.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
        });

        // Surrounding smaller crystals
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = 5;
            
            const smallCrystal = BABYLON.MeshBuilder.CreatePolyhedron(
                `orbitCrystal_${i}`,
                { type: 0, size: 0.8 + Math.random() * 0.5 },
                this.scene
            );
            
            smallCrystal.position.x = Math.cos(angle) * radius;
            smallCrystal.position.y = 1 + Math.random() * 2;
            smallCrystal.position.z = Math.sin(angle) * radius;
            
            const smallMat = material.clone(`orbitMat_${i}`);
            smallMat.emissiveIntensity = 0.6;
            smallCrystal.material = smallMat;
            
            // Orbit animation
            const orbitSpeed = 0.001 + Math.random() * 0.001;
            this.scene.registerBeforeRender(() => {
                const time = Date.now() * orbitSpeed;
                smallCrystal.position.x = Math.cos(angle + time) * radius;
                smallCrystal.position.z = Math.sin(angle + time) * radius;
                smallCrystal.rotation.y += 0.01;
            });
        }
    }

    // Create decorative floating crystals
    createDecorativeCrystals() {
        for (let i = 0; i < 15; i++) {
            const crystal = BABYLON.MeshBuilder.CreateBox(
                `crystal_${i}`,
                { 
                    width: 0.3 + Math.random() * 0.4,
                    height: 0.8 + Math.random() * 0.8,
                    depth: 0.3 + Math.random() * 0.4
                },
                this.scene
            );

            // Random position in a sphere
            const angle = Math.random() * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI;
            const radius = 8 + Math.random() * 5;
            
            crystal.position.x = Math.cos(angle) * Math.cos(elevation) * radius;
            crystal.position.y = Math.sin(elevation) * radius;
            crystal.position.z = Math.sin(angle) * Math.cos(elevation) * radius;

            // Random rotation
            crystal.rotation.x = Math.random() * Math.PI;
            crystal.rotation.y = Math.random() * Math.PI;
            crystal.rotation.z = Math.random() * Math.PI;

            // Varied amber material
            const material = new BABYLON.PBRMetallicRoughnessMaterial(`crystalMat_${i}`, this.scene);
            const colorVariation = 0.8 + Math.random() * 0.4;
            material.baseColor = new BABYLON.Color3(
                CONFIG.COLORS.AMBER.r * colorVariation,
                CONFIG.COLORS.AMBER.g * colorVariation,
                CONFIG.COLORS.AMBER.b * colorVariation
            );
            material.metallic = 0.4;
            material.roughness = 0.2;
            material.alpha = 0.5 + Math.random() * 0.3;
            material.emissiveColor = CONFIG.COLORS.AMBER_DARK;
            material.emissiveIntensity = 0.3 + Math.random() * 0.3;
            crystal.material = material;

            // Floating animation
            const floatSpeed = 0.0003 + Math.random() * 0.0005;
            const rotSpeed = 0.003 + Math.random() * 0.005;
            const startY = crystal.position.y;
            
            this.scene.registerBeforeRender(() => {
                crystal.position.y = startY + Math.sin(Date.now() * floatSpeed) * 1.5;
                crystal.rotation.y += rotSpeed;
                crystal.rotation.x += rotSpeed * 0.5;
            });
        }
    }

    // Create particle field background
    createParticleField() {
        const particleSystem = new BABYLON.ParticleSystem(
            'particles',
            300,
            this.scene
        );

        particleSystem.particleTexture = new BABYLON.Texture(
            'https://www.babylonjs-playground.com/textures/flare.png',
            this.scene
        );

        particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-15, -10, -15);
        particleSystem.maxEmitBox = new BABYLON.Vector3(15, 15, 15);

        // Amber particle colors
        particleSystem.color1 = new BABYLON.Color4(
            CONFIG.COLORS.AMBER.r,
            CONFIG.COLORS.AMBER.g,
            CONFIG.COLORS.AMBER.b,
            0.2
        );
        particleSystem.color2 = new BABYLON.Color4(
            CONFIG.COLORS.AMBER_GLOW.r,
            CONFIG.COLORS.AMBER_GLOW.g,
            CONFIG.COLORS.AMBER_GLOW.b,
            0.15
        );
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.2;

        particleSystem.minLifeTime = 10;
        particleSystem.maxLifeTime = 20;

        particleSystem.emitRate = 15;

        particleSystem.direction1 = new BABYLON.Vector3(-0.5, 0.5, -0.5);
        particleSystem.direction2 = new BABYLON.Vector3(0.5, 0.5, 0.5);

        particleSystem.minEmitPower = 0.1;
        particleSystem.maxEmitPower = 0.3;
        particleSystem.updateSpeed = 0.008;

        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        particleSystem.start();
    }

    // Create UI with enhanced styling
    createUI() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

        // Title: "Amber Tetris" with enhanced styling
        const title = new BABYLON.GUI.TextBlock('title', 'Amber Tetris');
        title.fontSize = 90;
        title.color = '#FFB833';
        title.fontWeight = 'bold';
        title.top = '-200px';
        title.shadowColor = '#FF8800';
        title.shadowBlur = 30;
        title.shadowOffsetX = 3;
        title.shadowOffsetY = 3;
        advancedTexture.addControl(title);

        // Subtitle: "A Tetris Clone"
        const subtitle = new BABYLON.GUI.TextBlock('subtitle', 'A Tetris Clone');
        subtitle.fontSize = 32;
        subtitle.color = '#66B3FF';
        subtitle.top = '-120px';
        subtitle.fontStyle = 'italic';
        subtitle.shadowColor = '#1A3366';
        subtitle.shadowBlur = 15;
        advancedTexture.addControl(subtitle);

        // Button container
        const buttonPanel = new BABYLON.GUI.StackPanel();
        buttonPanel.width = '450px';
        buttonPanel.top = '70px';
        buttonPanel.spacing = 25;
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

    // Create enhanced styled button
    createButton(text, onClick) {
        const button = BABYLON.GUI.Button.CreateSimpleButton('btn_' + text, text);
        button.width = '400px';
        button.height = '70px';
        button.color = '#BFBFBF';
        button.background = 'rgba(26, 51, 102, 0.8)';
        button.fontSize = 28;
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

    // Show settings overlay
    showSettings(advancedTexture) {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = '550px';
        panel.height = '450px';
        panel.background = 'rgba(26, 51, 102, 0.95)';
        panel.color = '#66B3FF';
        panel.thickness = 4;
        panel.cornerRadius = 20;
        panel.shadowColor = '#000000';
        panel.shadowBlur = 30;
        advancedTexture.addControl(panel);

        const stack = new BABYLON.GUI.StackPanel();
        stack.spacing = 25;
        panel.addControl(stack);

        // Title
        const settingsTitle = new BABYLON.GUI.TextBlock('settingsTitle', 'Settings');
        settingsTitle.fontSize = 42;
        settingsTitle.color = '#FFB833';
        settingsTitle.height = '70px';
        settingsTitle.fontWeight = 'bold';
        stack.addControl(settingsTitle);

        // Music toggle
        const musicText = new BABYLON.GUI.TextBlock('musicText', `Music: ${this.soundManager.musicEnabled ? 'ON' : 'OFF'}`);
        musicText.fontSize = 26;
        musicText.color = '#BFBFBF';
        musicText.height = '45px';
        stack.addControl(musicText);

        const musicButton = this.createButton('Toggle Music', () => {
            this.soundManager.toggleMusic();
            musicText.text = `Music: ${this.soundManager.musicEnabled ? 'ON' : 'OFF'}`;
        });
        stack.addControl(musicButton);

        // SFX toggle
        const sfxText = new BABYLON.GUI.TextBlock('sfxText', `Sound Effects: ${this.soundManager.sfxEnabled ? 'ON' : 'OFF'}`);
        sfxText.fontSize = 26;
        sfxText.color = '#BFBFBF';
        sfxText.height = '45px';
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
        panel.width = '650px';
        panel.height = '550px';
        panel.background = 'rgba(26, 51, 102, 0.95)';
        panel.color = '#66B3FF';
        panel.thickness = 4;
        panel.cornerRadius = 20;
        panel.shadowColor = '#000000';
        panel.shadowBlur = 30;
        advancedTexture.addControl(panel);

        const stack = new BABYLON.GUI.StackPanel();
        stack.spacing = 18;
        panel.addControl(stack);

        // Title
        const howToTitle = new BABYLON.GUI.TextBlock('howToTitle', 'How to Play');
        howToTitle.fontSize = 42;
        howToTitle.color = '#FFB833';
        howToTitle.height = '70px';
        howToTitle.fontWeight = 'bold';
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
            line.fontSize = text === '' ? 15 : 22;
            line.color = '#BFBFBF';
            line.height = '35px';
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