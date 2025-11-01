import { CONFIG } from '../config.js';

export default class Board {
    constructor(scene) {
        this.scene = scene;
        this.width = CONFIG.BOARD_WIDTH;
        this.height = CONFIG.BOARD_HEIGHT;
        this.grid = this.createEmptyGrid();
        this.lockedBlocks = [];
        this.particleSystem = null;
        this.camera = null; // Will be set by GameScene for shake effect
        
        this.createBoardVisuals();
        this.createParticleSystem();
    }

    // Set camera reference for shake effects
    setCamera(camera) {
        this.camera = camera;
    }

    // Create empty grid
    createEmptyGrid() {
        const grid = [];
        for (let y = 0; y < this.height; y++) {
            grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                grid[y][x] = null;
            }
        }
        return grid;
    }

    // Create visual board boundaries with enhanced materials
    createBoardVisuals() {
        const blockSize = CONFIG.BLOCK_SIZE;
        
        // Create enhanced platform/floor
        const platform = BABYLON.MeshBuilder.CreateBox(
            'platform',
            {
                width: this.width * blockSize,
                height: 0.3,
                depth: blockSize * 1.5
            },
            this.scene
        );
        
        platform.position.x = (this.width * blockSize) / 2 - blockSize / 2;
        platform.position.y = -0.15;
        platform.position.z = 0;

        // Enhanced platform material - dark stone/obsidian
        const platformMaterial = new BABYLON.PBRMetallicRoughnessMaterial('platformMat', this.scene);
        platformMaterial.baseColor = CONFIG.COLORS.PLATFORM_COLOR;
        platformMaterial.metallic = 0.9;
        platformMaterial.roughness = 0.2;
        platformMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.15);
        platformMaterial.emissiveIntensity = 0.2;
        platform.material = platformMaterial;

        // Create glowing grid lines on platform
        this.createGridLines();

        // Create enhanced side walls
        this.createWall(-blockSize / 2, 'left');
        this.createWall((this.width - 0.5) * blockSize, 'right');

        // Create enhanced back wall with depth
        const backWall = BABYLON.MeshBuilder.CreateBox(
            'backWall',
            {
                width: this.width * blockSize,
                height: this.height * blockSize,
                depth: 0.2
            },
            this.scene
        );
        
        backWall.position.x = (this.width * blockSize) / 2 - blockSize / 2;
        backWall.position.y = (this.height * blockSize) / 2;
        backWall.position.z = -blockSize / 2;

        const backWallMaterial = new BABYLON.PBRMetallicRoughnessMaterial('backWallMat', this.scene);
        backWallMaterial.baseColor = CONFIG.COLORS.DARK_BLUE;
        backWallMaterial.metallic = 0.7;
        backWallMaterial.roughness = 0.3;
        backWallMaterial.alpha = 0.4;
        backWallMaterial.emissiveColor = CONFIG.COLORS.DARK_BLUE;
        backWallMaterial.emissiveIntensity = 0.1;
        backWall.material = backWallMaterial;
    }

    // Create glowing grid lines on the platform
    createGridLines() {
        const blockSize = CONFIG.BLOCK_SIZE;
        
        // Vertical grid lines
        for (let x = 0; x <= this.width; x++) {
            const line = BABYLON.MeshBuilder.CreateBox(
                `gridLine_v_${x}`,
                { width: 0.02, height: 0.02, depth: this.height * blockSize },
                this.scene
            );
            line.position.x = x * blockSize;
            line.position.y = 0;
            line.position.z = (this.height * blockSize) / 2 - blockSize / 2;
            
            const lineMaterial = new BABYLON.StandardMaterial(`gridLineMat_v_${x}`, this.scene);
            lineMaterial.emissiveColor = CONFIG.COLORS.AMBER_DARK;
            lineMaterial.alpha = 0.3;
            line.material = lineMaterial;
        }

        // Horizontal grid lines
        for (let z = 0; z <= this.height; z++) {
            const line = BABYLON.MeshBuilder.CreateBox(
                `gridLine_h_${z}`,
                { width: this.width * blockSize, height: 0.02, depth: 0.02 },
                this.scene
            );
            line.position.x = (this.width * blockSize) / 2 - blockSize / 2;
            line.position.y = 0;
            line.position.z = z * blockSize;
            
            const lineMaterial = new BABYLON.StandardMaterial(`gridLineMat_h_${z}`, this.scene);
            lineMaterial.emissiveColor = CONFIG.COLORS.AMBER_DARK;
            lineMaterial.alpha = 0.3;
            line.material = lineMaterial;
        }
    }

    // Create a side wall with enhanced material
    createWall(xPosition, name) {
        const blockSize = CONFIG.BLOCK_SIZE;
        const wall = BABYLON.MeshBuilder.CreateBox(
            `wall_${name}`,
            {
                width: 0.15,
                height: this.height * blockSize,
                depth: blockSize * 1.2
            },
            this.scene
        );
        
        wall.position.x = xPosition;
        wall.position.y = (this.height * blockSize) / 2;
        wall.position.z = 0;

        const wallMaterial = new BABYLON.PBRMetallicRoughnessMaterial(`wallMat_${name}`, this.scene);
        wallMaterial.baseColor = CONFIG.COLORS.SILVER;
        wallMaterial.metallic = 0.8;
        wallMaterial.roughness = 0.25;
        wallMaterial.alpha = 0.6;
        wallMaterial.emissiveColor = CONFIG.COLORS.LIGHT_BLUE;
        wallMaterial.emissiveIntensity = 0.15;
        wall.material = wallMaterial;
    }

    // Create particle system for line clear effects
    createParticleSystem() {
        this.particleSystem = new BABYLON.ParticleSystem(
            'lineClearing',
            CONFIG.VISUALS.PARTICLE_CAPACITY * 2, // Double capacity for explosion
            this.scene
        );

        // Particle appearance - amber shards
        this.particleSystem.particleTexture = new BABYLON.Texture(
            'https://www.babylonjs-playground.com/textures/flare.png',
            this.scene
        );

        // Particle colors - amber glow
        this.particleSystem.color1 = new BABYLON.Color4(
            CONFIG.COLORS.AMBER_GLOW.r,
            CONFIG.COLORS.AMBER_GLOW.g,
            CONFIG.COLORS.AMBER_GLOW.b,
            1
        );
        this.particleSystem.color2 = new BABYLON.Color4(
            CONFIG.COLORS.AMBER.r,
            CONFIG.COLORS.AMBER.g,
            CONFIG.COLORS.AMBER.b,
            0.8
        );
        this.particleSystem.colorDead = new BABYLON.Color4(
            CONFIG.COLORS.AMBER_DARK.r,
            CONFIG.COLORS.AMBER_DARK.g,
            CONFIG.COLORS.AMBER_DARK.b,
            0
        );

        // Particle size
        this.particleSystem.minSize = 0.15;
        this.particleSystem.maxSize = 0.4;

        // Particle lifetime
        this.particleSystem.minLifeTime = 0.4;
        this.particleSystem.maxLifeTime = 1.2;

        // Emission rate (manual trigger)
        this.particleSystem.manualEmitCount = 0;
        this.particleSystem.emitRate = 0;

        // Gravity and direction - EXPLOSIVE
        this.particleSystem.gravity = new BABYLON.Vector3(0, -12, 0);
        this.particleSystem.direction1 = new BABYLON.Vector3(-2, 2, -2);
        this.particleSystem.direction2 = new BABYLON.Vector3(2, 3, 2);

        // Speed - MUCH FASTER
        this.particleSystem.minEmitPower = 4;
        this.particleSystem.maxEmitPower = 8;

        // Blending mode for glow
        this.particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        this.particleSystem.start();
    }

    // ENHANCED: Trigger massive particle burst at position
    triggerParticleBurst(x, y) {
        const blockSize = CONFIG.BLOCK_SIZE;
        this.particleSystem.emitter = new BABYLON.Vector3(
            x * blockSize,
            (CONFIG.BOARD_HEIGHT - y) * blockSize,
            0
        );
        // TRIPLE the particles for explosive effect
        this.particleSystem.manualEmitCount = CONFIG.VISUALS.LINE_CLEAR_PARTICLE_COUNT * 3;
    }

    // NEW: Screen flash effect
    createScreenFlash() {
        if (!this.scene.activeCamera) return;
        
        // Create flash overlay
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('flash', true, this.scene);
        const flash = new BABYLON.GUI.Rectangle();
        flash.width = 1;
        flash.height = 1;
        flash.thickness = 0;
        flash.background = 'white';
        flash.alpha = 0;
        advancedTexture.addControl(flash);

        // Flash animation
        let flashAlpha = 0.6;
        const flashInterval = setInterval(() => {
            flashAlpha -= 0.06;
            flash.alpha = Math.max(0, flashAlpha);
            
            if (flashAlpha <= 0) {
                clearInterval(flashInterval);
                advancedTexture.dispose();
            }
        }, 16);
    }

    // NEW: Camera shake effect
    triggerCameraShake(intensity = 0.3) {
        if (!this.camera) return;

        const originalPosition = this.camera.position.clone();
        let shakeTime = 0;
        const shakeDuration = 300; // milliseconds
        
        const shakeInterval = setInterval(() => {
            shakeTime += 16;
            
            if (shakeTime >= shakeDuration) {
                this.camera.position = originalPosition;
                clearInterval(shakeInterval);
            } else {
                // Random shake
                this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
                this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity;
            }
        }, 16);
    }

    // Check if position is valid
    isValidPosition(positions) {
        for (const pos of positions) {
            // Check boundaries
            if (pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height) {
                return false;
            }
            // Check collision with locked blocks
            if (this.grid[pos.y][pos.x] !== null) {
                return false;
            }
        }
        return true;
    }

    // Lock tetromino blocks into the grid
    lockTetromino(tetromino) {
        const positions = tetromino.getBlockPositions();
        
        positions.forEach((pos, index) => {
            if (pos.y >= 0 && pos.y < this.height && pos.x >= 0 && pos.x < this.width) {
                this.grid[pos.y][pos.x] = tetromino.blocks[index].mesh;
                this.lockedBlocks.push(tetromino.blocks[index].mesh);
            }
        });
    }

    // Check for completed lines
    checkLines() {
        const completedLines = [];
        
        for (let y = 0; y < this.height; y++) {
            let isComplete = true;
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === null) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                completedLines.push(y);
            }
        }
        
        return completedLines;
    }

    // ENHANCED: Clear completed lines with EXPLOSIVE animation
    clearLines(lines) {
        const blockSize = CONFIG.BLOCK_SIZE;
        
        // SCREEN FLASH!
        this.createScreenFlash();
        
        // CAMERA SHAKE! (intensity increases with more lines)
        this.triggerCameraShake(0.2 * lines.length);
        
        // MASSIVE PARTICLE EXPLOSIONS for each cleared line
        lines.forEach(lineY => {
            // Multiple particle bursts across the line
            for (let x = 0; x < this.width; x += 2) {
                this.triggerParticleBurst(x, lineY);
            }
            
            for (let x = 0; x < this.width; x++) {
                if (this.grid[lineY][x]) {
                    const mesh = this.grid[lineY][x];
                    
                    // INTENSE glow pulse before disposal
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = 3.0; // SUPER bright!
                        
                        // Rapid pulse animation
                        let pulseCount = 0;
                        const pulseInterval = setInterval(() => {
                            if (mesh.material) {
                                mesh.material.emissiveIntensity = 3.0 + Math.sin(pulseCount * 1.0) * 1.5;
                            }
                            pulseCount++;
                            if (pulseCount > 8) {
                                clearInterval(pulseInterval);
                            }
                        }, 30);
                    }
                    
                    // Scale up explosion effect
                    BABYLON.Animation.CreateAndStartAnimation(
                        'explode',
                        mesh,
                        'scaling',
                        60,
                        10,
                        mesh.scaling.clone(),
                        new BABYLON.Vector3(1.5, 1.5, 1.5),
                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                    );
                    
                    // Dispose after animation
                    setTimeout(() => {
                        if (mesh) {
                            mesh.dispose();
                        }
                    }, 300);
                    
                    this.grid[lineY][x] = null;
                }
            }
        });

        // Drop lines above
        setTimeout(() => {
            lines.sort((a, b) => b - a); // Sort descending
            
            lines.forEach(clearedLine => {
                // Move all lines above down
                for (let y = clearedLine; y > 0; y--) {
                    for (let x = 0; x < this.width; x++) {
                        this.grid[y][x] = this.grid[y - 1][x];
                        
                        // Update mesh position with smooth animation
                        if (this.grid[y][x]) {
                            BABYLON.Animation.CreateAndStartAnimation(
                                'dropAnim',
                                this.grid[y][x],
                                'position.y',
                                60,
                                15,
                                this.grid[y][x].position.y,
                                this.grid[y][x].position.y - blockSize,
                                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                            );
                        }
                    }
                }
                
                // Clear top line
                for (let x = 0; x < this.width; x++) {
                    this.grid[0][x] = null;
                }
            });
        }, 350);
    }

    // Check if game is over (top row has blocks)
    isGameOver() {
        for (let x = 0; x < this.width; x++) {
            if (this.grid[0][x] !== null) {
                return true;
            }
        }
        return false;
    }

    // Dispose all locked blocks
    dispose() {
        this.lockedBlocks.forEach(block => {
            if (block) {
                block.dispose();
            }
        });
        this.lockedBlocks = [];
        this.grid = this.createEmptyGrid();
        
        if (this.particleSystem) {
            this.particleSystem.dispose();
        }
    }
}