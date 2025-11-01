import { CONFIG } from '../config.js';

export default class Tetromino {
    constructor(scene, type = null) {
        this.scene = scene;
        this.type = type || this.getRandomType();
        this.shape = CONFIG.SHAPES[this.type];
        this.x = Math.floor(CONFIG.BOARD_WIDTH / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
        this.blocks = [];
        
        this.createMesh();
    }

    // Get a random tetromino type
    getRandomType() {
        const types = Object.keys(CONFIG.SHAPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    // Create 3D mesh for the tetromino with rich amber crystal material
    createMesh() {
        const blockSize = CONFIG.BLOCK_SIZE;

        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    // Create box for each block with slight bevel
                    const block = BABYLON.MeshBuilder.CreateBox(
                        `block_${this.type}_${row}_${col}`,
                        { 
                            size: blockSize * 0.95,
                            width: blockSize * 0.95,
                            height: blockSize * 0.95,
                            depth: blockSize * 0.95
                        },
                        this.scene
                    );

                    // Create rich amber crystal PBR material
                    const material = new BABYLON.PBRMetallicRoughnessMaterial(
                        `amberMaterial_${row}_${col}`,
                        this.scene
                    );

                    // Rich amber color with slight variation per block
                    const variation = 0.9 + Math.random() * 0.2; // Slight color variation
                    material.baseColor = new BABYLON.Color3(
                        CONFIG.COLORS.AMBER.r * variation,
                        CONFIG.COLORS.AMBER.g * variation,
                        CONFIG.COLORS.AMBER.b * variation
                    );

                    // Material properties for crystal look
                    material.metallic = CONFIG.VISUALS.BLOCK_METALLIC;
                    material.roughness = CONFIG.VISUALS.BLOCK_ROUGHNESS;
                    material.alpha = CONFIG.VISUALS.BLOCK_ALPHA;
                    
                    // Enable alpha blending for translucency
                    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
                    material.separateCullingPass = true;

                    // Inner glow effect (warm amber light from within)
                    material.emissiveColor = CONFIG.COLORS.AMBER_GLOW;
                    material.emissiveIntensity = CONFIG.VISUALS.EMISSIVE_INTENSITY;

                    // Subsurface effect - light passes through
                    material.subSurface.isTranslucencyEnabled = true;
                    material.subSurface.translucencyIntensity = 0.8;
                    material.subSurface.tintColor = CONFIG.COLORS.AMBER;

                    // Environmental reflections
                    material.environmentIntensity = 0.4;

                    block.material = material;

                    // Position relative to tetromino origin
                    block.position.x = (this.x + col) * blockSize;
                    block.position.y = (CONFIG.BOARD_HEIGHT - (this.y + row)) * blockSize;
                    block.position.z = 0;

                    // Slight random rotation for organic crystal feel
                    block.rotation.y = (Math.random() - 0.5) * 0.1;

                    this.blocks.push({
                        mesh: block,
                        localX: col,
                        localY: row
                    });
                }
            }
        }
    }

    // Update position of all blocks
    updatePosition() {
        const blockSize = CONFIG.BLOCK_SIZE;
        this.blocks.forEach(block => {
            block.mesh.position.x = (this.x + block.localX) * blockSize;
            block.mesh.position.y = (CONFIG.BOARD_HEIGHT - (this.y + block.localY)) * blockSize;
        });
    }

    // Move tetromino left
    moveLeft() {
        this.x++;
        this.updatePosition();
    }

    // Move tetromino right
    moveRight() {
        this.x--;
        this.updatePosition();
    }

    // Move tetromino down
    moveDown() {
        this.y++;
        this.updatePosition();
    }

    // Rotate tetromino clockwise
    rotate() {
        const newShape = [];
        const rows = this.shape.length;
        const cols = this.shape[0].length;

        // Transpose and reverse for clockwise rotation
        for (let col = 0; col < cols; col++) {
            newShape[col] = [];
            for (let row = rows - 1; row >= 0; row--) {
                newShape[col].push(this.shape[row][col]);
            }
        }

        this.shape = newShape;
        this.recreateMesh();
    }

    // Recreate mesh after rotation
    recreateMesh() {
        // Dispose old blocks
        this.blocks.forEach(block => block.mesh.dispose());
        this.blocks = [];

        // Create new blocks with rotated shape
        this.createMesh();
    }

    // Get current block positions
    getBlockPositions() {
        const positions = [];
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    positions.push({
                        x: this.x + col,
                        y: this.y + row
                    });
                }
            }
        }
        return positions;
    }

    // Dispose of all meshes
    dispose() {
        this.blocks.forEach(block => {
            if (block.mesh) {
                block.mesh.dispose();
            }
        });
        this.blocks = [];
    }
}