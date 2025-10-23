/**
 * BlockMesh.js - 3D block mesh creation and management
 * Creates beautiful Three.js meshes for Tetris blocks with materials and effects
 */

import * as THREE from 'three';
import { BOARD } from '../utils/Constants.js';
import { PIECE_COLORS } from '../utils/Colors.js';

export class BlockMesh {
  constructor() {
    this.blockSize = BOARD.BLOCK_SIZE;
    this.geometryCache = new Map();
    this.materialCache = new Map();
    
    this.initGeometries();
  }

  /**
   * Initialize and cache geometries to avoid recreation
   */
  initGeometries() {
    // Main block geometry with slight bevel for realism
    const blockGeometry = new THREE.BoxGeometry(
      this.blockSize * 0.95,
      this.blockSize * 0.95,
      this.blockSize * 0.95
    );
    
    this.geometryCache.set('block', blockGeometry);

    // Inner glow geometry (slightly smaller)
    const glowGeometry = new THREE.BoxGeometry(
      this.blockSize * 0.85,
      this.blockSize * 0.85,
      this.blockSize * 0.85
    );
    
    this.geometryCache.set('glow', glowGeometry);
  }

  /**
   * Get or create a material for a specific piece type
   */
  getMaterial(pieceType, options = {}) {
    const {
      opacity = 1.0,
      emissiveIntensity = 0.3,
      ghost = false
    } = options;

    const cacheKey = `${pieceType}_${opacity}_${emissiveIntensity}_${ghost}`;
    
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey);
    }

    const color = PIECE_COLORS[pieceType] || PIECE_COLORS.I;

    // Create material with neon-like properties
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color.primary),
      emissive: new THREE.Color(color.primary),
      emissiveIntensity: ghost ? 0.1 : emissiveIntensity,
      metalness: 0.3,
      roughness: 0.4,
      opacity: ghost ? BOARD.GHOST_OPACITY : opacity,
      transparent: ghost || opacity < 1.0,
      side: THREE.FrontSide
    });

    this.materialCache.set(cacheKey, material);
    return material;
  }

  /**
   * Create a 3D block mesh at specific grid position
   */
  createBlock(row, col, pieceType, options = {}) {
    const { ghost = false } = options;
    
    const geometry = this.geometryCache.get('block');
    const material = this.getMaterial(pieceType, options);

    const mesh = new THREE.Mesh(geometry, material);
    
    // Position in 3D space based on grid coordinates
    mesh.position.set(
      col * this.blockSize + this.blockSize / 2,
      row * this.blockSize + this.blockSize / 2,
      0
    );

    // Enable shadows unless it's a ghost piece
    if (!ghost) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }

    // Store metadata
    mesh.userData = {
      row,
      col,
      pieceType,
      isGhost: ghost,
      createdAt: Date.now()
    };

    return mesh;
  }

  /**
   * Create an inner glow effect for a block
   */
  createGlow(row, col, pieceType) {
    const geometry = this.geometryCache.get('glow');
    const color = PIECE_COLORS[pieceType] || PIECE_COLORS.I;

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color.glow || color.primary),
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide
    });

    const glowMesh = new THREE.Mesh(geometry, glowMaterial);
    
    glowMesh.position.set(
      col * this.blockSize + this.blockSize / 2,
      row * this.blockSize + this.blockSize / 2,
      0
    );

    glowMesh.userData = {
      row,
      col,
      pieceType,
      isGlow: true
    };

    return glowMesh;
  }

  /**
   * Create edge highlights for a block (wireframe effect)
   */
  createEdges(row, col, pieceType) {
    const geometry = this.geometryCache.get('block');
    const edges = new THREE.EdgesGeometry(geometry);
    const color = PIECE_COLORS[pieceType] || PIECE_COLORS.I;

    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(color.primary).multiplyScalar(1.5),
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });

    const edgeMesh = new THREE.LineSegments(edges, lineMaterial);
    
    edgeMesh.position.set(
      col * this.blockSize + this.blockSize / 2,
      row * this.blockSize + this.blockSize / 2,
      0
    );

    edgeMesh.userData = {
      row,
      col,
      pieceType,
      isEdge: true
    };

    return edgeMesh;
  }

  /**
   * Create a complete block with all effects (main mesh + glow + edges)
   */
  createCompleteBlock(row, col, pieceType, options = {}) {
    const group = new THREE.Group();
    
    // Main block mesh
    const block = this.createBlock(row, col, pieceType, options);
    group.add(block);

    // Add glow effect unless it's a ghost piece
    if (!options.ghost) {
      const glow = this.createGlow(row, col, pieceType);
      group.add(glow);

      // Add edge highlights
      const edges = this.createEdges(row, col, pieceType);
      group.add(edges);
    }

    group.userData = {
      row,
      col,
      pieceType,
      isGhost: options.ghost || false
    };

    return group;
  }

  /**
   * Create a ghost piece preview
   */
  createGhostBlock(row, col, pieceType) {
    return this.createBlock(row, col, pieceType, { 
      ghost: true,
      opacity: BOARD.GHOST_OPACITY,
      emissiveIntensity: 0.1
    });
  }

  /**
   * Update block position smoothly
   */
  updateBlockPosition(mesh, row, col, duration = 0) {
    const targetX = col * this.blockSize + this.blockSize / 2;
    const targetY = row * this.blockSize + this.blockSize / 2;

    if (duration === 0) {
      // Instant update
      mesh.position.set(targetX, targetY, mesh.position.z);
    } else {
      // Animated update (for smooth transitions)
      // Note: This would typically use GSAP, but we'll set up a simple lerp
      mesh.userData.targetPosition = { x: targetX, y: targetY };
      mesh.userData.animationDuration = duration;
      mesh.userData.animationStart = Date.now();
    }

    mesh.userData.row = row;
    mesh.userData.col = col;
  }

  /**
   * Create the game board grid (background visualization)
   */
  createBoardGrid() {
    const group = new THREE.Group();
    const gridColor = new THREE.Color(0x1a1a2e);

    // Create grid lines
    for (let row = 0; row <= BOARD.HEIGHT; row++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, row * this.blockSize, -1),
        new THREE.Vector3(BOARD.WIDTH * this.blockSize, row * this.blockSize, -1)
      ]);

      const material = new THREE.LineBasicMaterial({
        color: gridColor,
        transparent: true,
        opacity: BOARD.GRID_OPACITY
      });

      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    for (let col = 0; col <= BOARD.WIDTH; col++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(col * this.blockSize, 0, -1),
        new THREE.Vector3(col * this.blockSize, BOARD.HEIGHT * this.blockSize, -1)
      ]);

      const material = new THREE.LineBasicMaterial({
        color: gridColor,
        transparent: true,
        opacity: BOARD.GRID_OPACITY
      });

      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    return group;
  }

  /**
   * Create board boundaries (walls)
   */
  createBoardBoundaries() {
    const group = new THREE.Group();
    const wallColor = 0x0f0f1e;
    const wallThickness = 5;
    const wallHeight = BOARD.HEIGHT * this.blockSize;
    const wallWidth = BOARD.WIDTH * this.blockSize;

    // Material for walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      metalness: 0.5,
      roughness: 0.5,
      emissive: new THREE.Color(0x1a1a3e),
      emissiveIntensity: 0.2
    });

    // Left wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, 30),
      wallMaterial
    );
    leftWall.position.set(-wallThickness / 2, wallHeight / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, 30),
      wallMaterial
    );
    rightWall.position.set(wallWidth + wallThickness / 2, wallHeight / 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    group.add(rightWall);

    // Bottom wall
    const bottomWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallWidth + wallThickness * 2, wallThickness, 30),
      wallMaterial
    );
    bottomWall.position.set(wallWidth / 2, -wallThickness / 2, 0);
    bottomWall.castShadow = true;
    bottomWall.receiveShadow = true;
    group.add(bottomWall);

    // Back wall (optional, for depth)
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness),
      wallMaterial
    );
    backWall.position.set(wallWidth / 2, wallHeight / 2, -20);
    backWall.receiveShadow = true;
    group.add(backWall);

    return group;
  }

  /**
   * Clean up cached resources
   */
  dispose() {
    // Dispose geometries
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.geometryCache.clear();

    // Dispose materials
    this.materialCache.forEach(material => material.dispose());
    this.materialCache.clear();
  }
}