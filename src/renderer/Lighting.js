/**
 * Lighting.js - Advanced lighting system for dramatic 3D effects
 * Creates dynamic, colorful lighting that responds to game events
 */

import * as THREE from 'three';
import { BOARD } from '../utils/Constants.js';
import { PIECE_COLORS } from '../utils/Colors.js';

export class Lighting {
  constructor(scene) {
    this.scene = scene;
    this.lights = new Map();
    this.dynamicLights = [];
    
    this.init();
  }

  /**
   * Initialize the lighting system
   */
  init() {
    this.createAmbientLighting();
    this.createKeyLights();
    this.createAccentLights();
  }

  /**
   * Create ambient and hemisphere lighting for base illumination
   */
  createAmbientLighting() {
    // Soft ambient light
    const ambientLight = new THREE.AmbientLight(0x2a2a4a, 0.3);
    this.scene.add(ambientLight);
    this.lights.set('ambient', ambientLight);

    // Hemisphere light for subtle color variation
    const hemisphereLight = new THREE.HemisphereLight(
      0x4466ff, // Sky color
      0x221144, // Ground color
      0.4
    );
    hemisphereLight.position.set(0, 100, 0);
    this.scene.add(hemisphereLight);
    this.lights.set('hemisphere', hemisphereLight);
  }

  /**
   * Create main directional lights (key, fill, rim)
   */
  createKeyLights() {
    const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;
    const boardHeight = BOARD.HEIGHT * BOARD.BLOCK_SIZE;
    const centerX = boardWidth / 2;
    const centerY = boardHeight / 2;

    // Main key light (primary illumination)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(centerX + 150, boardHeight + 100, 150);
    keyLight.castShadow = true;
    
    // Configure shadow properties
    keyLight.shadow.camera.left = -250;
    keyLight.shadow.camera.right = 250;
    keyLight.shadow.camera.top = 250;
    keyLight.shadow.camera.bottom = -250;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 600;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    
    this.scene.add(keyLight);
    this.lights.set('key', keyLight);

    // Fill light (softer, opposite side)
    const fillLight = new THREE.DirectionalLight(0x6688ff, 0.5);
    fillLight.position.set(centerX - 100, boardHeight + 50, 100);
    this.scene.add(fillLight);
    this.lights.set('fill', fillLight);

    // Rim light (edge definition from behind)
    const rimLight = new THREE.DirectionalLight(0xff4466, 0.4);
    rimLight.position.set(centerX, centerY, -150);
    this.scene.add(rimLight);
    this.lights.set('rim', rimLight);
  }

  /**
   * Create accent lights for atmosphere
   */
  createAccentLights() {
    const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;
    const boardHeight = BOARD.HEIGHT * BOARD.BLOCK_SIZE;

    // Left accent (cyan glow)
    const leftAccent = new THREE.PointLight(0x00ffff, 0.6, 300);
    leftAccent.position.set(-50, boardHeight * 0.5, 50);
    this.scene.add(leftAccent);
    this.lights.set('leftAccent', leftAccent);

    // Right accent (magenta glow)
    const rightAccent = new THREE.PointLight(0xff00ff, 0.6, 300);
    rightAccent.position.set(boardWidth + 50, boardHeight * 0.5, 50);
    this.scene.add(rightAccent);
    this.lights.set('rightAccent', rightAccent);

    // Top accent (warm white)
    const topAccent = new THREE.PointLight(0xffffaa, 0.4, 400);
    topAccent.position.set(boardWidth * 0.5, boardHeight + 100, 100);
    this.scene.add(topAccent);
    this.lights.set('topAccent', topAccent);
  }

  /**
   * Create a temporary spotlight for piece lock events
   */
  createPieceLockSpotlight(row, col, pieceType) {
    const color = PIECE_COLORS[pieceType]?.primary || 0xffffff;
    const spotlight = new THREE.SpotLight(color, 2.0, 200, Math.PI / 6, 0.5, 2);
    
    spotlight.position.set(
      col * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2,
      row * BOARD.BLOCK_SIZE + 150,
      100
    );
    
    spotlight.target.position.set(
      col * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2,
      row * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2,
      0
    );
    
    this.scene.add(spotlight);
    this.scene.add(spotlight.target);
    
    this.dynamicLights.push({
      light: spotlight,
      target: spotlight.target,
      createdAt: Date.now(),
      duration: 800,
      initialIntensity: 2.0
    });

    return spotlight;
  }

  /**
   * Create an explosion of point lights for line clears
   */
  createLineClearLights(rows, pieceType) {
    const color = PIECE_COLORS[pieceType]?.primary || 0xffffff;
    const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;

    rows.forEach((row, index) => {
      // Create multiple point lights along the cleared line
      for (let i = 0; i < 5; i++) {
        const light = new THREE.PointLight(color, 3.0, 150);
        
        light.position.set(
          (boardWidth / 4) * i,
          row * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2,
          30
        );
        
        this.scene.add(light);
        
        this.dynamicLights.push({
          light: light,
          createdAt: Date.now(),
          duration: 1000,
          initialIntensity: 3.0,
          pulseSpeed: 0.01 + (index * 0.002)
        });
      }
    });
  }

  /**
   * Create a dramatic flash effect
   */
  createFlashEffect(color = 0xffffff, intensity = 5.0, duration = 200) {
    const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;
    const boardHeight = BOARD.HEIGHT * BOARD.BLOCK_SIZE;

    const flashLight = new THREE.PointLight(color, intensity, 500);
    flashLight.position.set(boardWidth / 2, boardHeight / 2, 100);
    
    this.scene.add(flashLight);
    
    this.dynamicLights.push({
      light: flashLight,
      createdAt: Date.now(),
      duration: duration,
      initialIntensity: intensity,
      isFlash: true
    });
  }

  /**
   * Update dynamic lights (fade out, pulse effects)
   */
  update() {
    const now = Date.now();
    const lightsToRemove = [];

    this.dynamicLights.forEach((lightData, index) => {
      const age = now - lightData.createdAt;
      const progress = age / lightData.duration;

      if (progress >= 1.0) {
        // Light has expired
        this.scene.remove(lightData.light);
        if (lightData.target) {
          this.scene.remove(lightData.target);
        }
        lightsToRemove.push(index);
      } else {
        // Update light based on effect type
        if (lightData.isFlash) {
          // Fast fade out
          lightData.light.intensity = lightData.initialIntensity * (1 - progress);
        } else if (lightData.pulseSpeed) {
          // Pulsing effect with fade
          const pulse = Math.sin(age * lightData.pulseSpeed) * 0.3 + 0.7;
          lightData.light.intensity = lightData.initialIntensity * pulse * (1 - progress);
        } else {
          // Standard fade out
          lightData.light.intensity = lightData.initialIntensity * (1 - progress);
        }
      }
    });

    // Remove expired lights from array
    lightsToRemove.reverse().forEach(index => {
      this.dynamicLights.splice(index, 1);
    });
  }

  /**
   * Animate accent lights with subtle pulsing
   */
  animateAccentLights(time) {
    const leftAccent = this.lights.get('leftAccent');
    const rightAccent = this.lights.get('rightAccent');
    const topAccent = this.lights.get('topAccent');

    if (leftAccent) {
      leftAccent.intensity = 0.6 + Math.sin(time * 0.001) * 0.2;
    }

    if (rightAccent) {
      rightAccent.intensity = 0.6 + Math.cos(time * 0.001) * 0.2;
    }

    if (topAccent) {
      topAccent.intensity = 0.4 + Math.sin(time * 0.0015) * 0.15;
    }
  }

  /**
   * Intensify lighting for special events (Tetris, combos)
   */
  intensify(multiplier = 1.5, duration = 500) {
    const keyLight = this.lights.get('key');
    const fillLight = this.lights.get('fill');

    if (keyLight) {
      const originalIntensity = 1.0;
      keyLight.intensity = originalIntensity * multiplier;

      setTimeout(() => {
        if (keyLight) keyLight.intensity = originalIntensity;
      }, duration);
    }

    if (fillLight) {
      const originalIntensity = 0.5;
      fillLight.intensity = originalIntensity * multiplier;

      setTimeout(() => {
        if (fillLight) fillLight.intensity = originalIntensity;
      }, duration);
    }
  }

  /**
   * Change ambient lighting mood
   */
  setMood(mood = 'normal') {
    const ambientLight = this.lights.get('ambient');
    const hemisphereLight = this.lights.get('hemisphere');

    switch (mood) {
      case 'intense':
        if (ambientLight) ambientLight.intensity = 0.5;
        if (hemisphereLight) hemisphereLight.intensity = 0.6;
        break;
      case 'danger':
        if (ambientLight) ambientLight.color.setHex(0x4a2a2a);
        if (hemisphereLight) {
          hemisphereLight.color.setHex(0xff4466);
          hemisphereLight.groundColor.setHex(0x441122);
        }
        break;
      case 'normal':
      default:
        if (ambientLight) {
          ambientLight.intensity = 0.3;
          ambientLight.color.setHex(0x2a2a4a);
        }
        if (hemisphereLight) {
          hemisphereLight.intensity = 0.4;
          hemisphereLight.color.setHex(0x4466ff);
          hemisphereLight.groundColor.setHex(0x221144);
        }
        break;
    }
  }

  /**
   * Get a specific light by name
   */
  getLight(name) {
    return this.lights.get(name);
  }

  /**
   * Clean up all lights
   */
  dispose() {
    this.lights.forEach(light => {
      this.scene.remove(light);
    });
    this.lights.clear();

    this.dynamicLights.forEach(lightData => {
      this.scene.remove(lightData.light);
      if (lightData.target) {
        this.scene.remove(lightData.target);
      }
    });
    this.dynamicLights = [];
  }
}