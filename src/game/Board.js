import { CONFIG } from '../config.js';

export default class Board {
    constructor(scene) {
        this.scene = scene;
        this.width = CONFIG.BOARD_WIDTH;
        this.height = CONFIG.BOARD_HEIGHT;
        this.grid = this.createEmptyGrid();
        this.lockedBlocks = [];
        
        this.createBoardVisuals();
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

    // Create visual board boundaries
    createBoardVisuals() {
        const blockSize = CONFIG.BLOCK_SIZE;
        
        // Create board platform/floor
        const platform = BABYLON.MeshBuilder.CreateBox(
            'platform',
            {
                width: this.width * blockSize,
                height: 0.2,
                depth: blockSize
            },
            this.scene
        );
        
        platform.position.x = (this.width * blockSize) / 2 - blockSize / 2;
        platform.position.y = -0.1;
        platform.position.z = 0;

        // Platform material (dark metallic)
        const platformMaterial = new BABYLON.PBRMetallicRoughnessMaterial('platformMat', this.scene);
        platformMaterial.baseColor = CONFIG.COLORS.DARK_BLUE;
        platformMaterial.metallic = 0.8;
        platformMaterial.roughness = 0.3;
        platform.material = platformMaterial;

        // Create side walls
        this.createWall(-blockSize / 2, 'left');
        this.createWall((this.width - 0.5) * blockSize, 'right');

        // Create back wall
        const backWall = BABYLON.MeshBuilder.CreateBox(
            'backWall',
            {
                width: this.width * blockSize,
                height: this.height * blockSize,
                depth: 0.1
            },
            this.scene
        );
        
        backWall.position.x = (this.width * blockSize) / 2 - blockSize / 2;
        backWall.position.y = (this.height * blockSize) / 2;
        backWall.position.z = -blockSize / 2;

        const backWallMaterial = new BABYLON.PBRMetallicRoughnessMaterial('backWallMat', this.scene);
        backWallMaterial.baseColor = CONFIG.COLORS.DARK_BLUE;
        backWallMaterial.metallic = 0.6;
        backWallMaterial.roughness = 0.4;
        backWallMaterial.alpha = 0.3;
        backWall.material = backWallMaterial;
    }

    // Create a side wall
    createWall(xPosition, name) {
        const blockSize = CONFIG.BLOCK_SIZE;
        const wall = BABYLON.MeshBuilder.CreateBox(
            `wall_${name}`,
            {
                width: 0.1,
                height: this.height * blockSize,
                depth: blockSize
            },
            this.scene
        );
        
        wall.position.x = xPosition;
        wall.position.y = (this.height * blockSize) / 2;
        wall.position.z = 0;

        const wallMaterial = new BABYLON.PBRMetallicRoughnessMaterial(`wallMat_${name}`, this.scene);
        wallMaterial.baseColor = CONFIG.COLORS.SILVER;
        wallMaterial.metallic = 0.7;
        wallMaterial.roughness = 0.3;
        wallMaterial.alpha = 0.5;
        wall.material = wallMaterial;
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

    // Clear completed lines with animation
    clearLines(lines) {
        const blockSize = CONFIG.BLOCK_SIZE;
        
        // Dispose meshes in completed lines
        lines.forEach(lineY => {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[lineY][x]) {
                    const mesh = this.grid[lineY][x];
                    
                    // Add glow effect before disposal
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = 1.0;
                    }
                    
                    // Dispose after short delay
                    setTimeout(() => {
                        mesh.dispose();
                    }, 200);
                    
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
                        
                        // Update mesh position
                        if (this.grid[y][x]) {
                            this.grid[y][x].position.y -= blockSize;
                        }
                    }
                }
                
                // Clear top line
                for (let x = 0; x < this.width; x++) {
                    this.grid[0][x] = null;
                }
            });
        }, 250);
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
    }
}