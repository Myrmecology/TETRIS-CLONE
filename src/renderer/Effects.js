/**
 * Effects.js - Visual effects system for game events
 * Handles screen shake, camera effects, post-processing, and visual feedback
 */

import * as THREE from 'three';
import { BOARD } from '../utils/Constants.js';

export class Effects {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.originalCameraPosition = camera.position.clone();
    this.shakeIntensity = 0;
    this.shakeDecay = 0.95;
    this.isShaking = false;
    
    this.effects = [];
  }

  /**
   * Trigger screen shake effect
   */
  shake(intensity = 5, duration = 300) {
    this.shakeIntensity = intensity;
    this.isShaking = true;
    
    setTimeout(() => {
      this.isShaking = false;
      this.resetCamera();
    }, duration);
  }

  /**
   * Update screen shake (call every frame)
   */
  updateShake() {
    if (!this.isShaking || this.shakeIntensity <= 0.01) {
      if (this.shakeIntensity > 0) {
        this.shakeIntensity = 0;
        this.resetCamera();
      }
      return;
    }

    // Apply random offset based on intensity
    const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
    const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
    const offsetZ = (Math.random() - 0.5) * this.shakeIntensity * 0.5;

    this.camera.position.set(
      this.originalCameraPosition.x + offsetX,
      this.originalCameraPosition.y + offsetY,
      this.originalCameraPosition.z + offsetZ
    );

    // Decay shake over time
    this.shakeIntensity *= this.shakeDecay;
  }

  /**
   * Reset camera to original position
   */
  resetCamera() {
    this.camera.position.copy(this.originalCameraPosition);
  }

  /**
   * Create a camera zoom pulse effect
   */
  zoomPulse(intensity = 0.1, duration = 200) {
    const originalFOV = this.camera.fov;
    const targetFOV = originalFOV * (1 - intensity);
    
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 0.5) {
        // Zoom in
        const zoomProgress = progress * 2;
        this.camera.fov = originalFOV + (targetFOV - originalFOV) * zoomProgress;
      } else {
        // Zoom out
        const zoomProgress = (progress - 0.5) * 2;
        this.camera.fov = targetFOV + (originalFOV - targetFOV) * zoomProgress;
      }
      
      this.camera.updateProjectionMatrix();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  /**
   * Create a flash overlay effect
   */
  flash(color = 0xffffff, intensity = 0.8, duration = 150) {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: intensity,
      depthTest: false,
      depthWrite: false
    });

    const flashMesh = new THREE.Mesh(geometry, material);
    flashMesh.position.z = this.camera.position.z - 1;
    flashMesh.position.x = this.camera.position.x;
    flashMesh.position.y = this.camera.position.y;
    flashMesh.lookAt(this.camera.position);

    this.scene.add(flashMesh);

    const startTime = Date.now();
    const startOpacity = intensity;

    const fadeOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.scene.remove(flashMesh);
        geometry.dispose();
        material.dispose();
      } else {
        material.opacity = startOpacity * (1 - progress);
        requestAnimationFrame(fadeOut);
      }
    };

    fadeOut();
  }

  /**
   * Create a glow ring effect at a specific position
   */
  createGlowRing(x, y, z, color = 0x00ffff, size = 50) {
    const ringGeometry = new THREE.RingGeometry(size * 0.8, size, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(x, y, z);
    
    this.scene.add(ring);

    const startTime = Date.now();
    const duration = 800;
    const startSize = size;
    const endSize = size * 2;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.scene.remove(ring);
        ringGeometry.dispose();
        ringMaterial.dispose();
      } else {
        const currentSize = startSize + (endSize - startSize) * progress;
        ring.scale.set(currentSize / startSize, currentSize / startSize, 1);
        ringMaterial.opacity = 0.8 * (1 - progress);
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Create a shockwave effect
   */
  createShockwave(row, col, radius = 100, color = 0xff00ff) {
    const x = col * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
    const y = row * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
    const z = 20;

    // Create multiple expanding rings for depth
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createGlowRing(x, y, z + i * 5, color, radius * 0.5);
      }, i * 100);
    }
  }

  /**
   * Create a line clear sweep effect
   */
  createLineSweep(rows, color = 0xffffff) {
    rows.forEach((row, index) => {
      setTimeout(() => {
        const y = row * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
        const width = BOARD.WIDTH * BOARD.BLOCK_SIZE;

        // Create a horizontal bar that sweeps across
        const geometry = new THREE.PlaneGeometry(width, BOARD.BLOCK_SIZE);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        });

        const sweep = new THREE.Mesh(geometry, material);
        sweep.position.set(width / 2, y, 10);

        this.scene.add(sweep);

        const startTime = Date.now();
        const duration = 400;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = elapsed / duration;

          if (progress >= 1) {
            this.scene.remove(sweep);
            geometry.dispose();
            material.dispose();
          } else {
            // Pulse and fade
            const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
            sweep.scale.set(1, scale, 1);
            material.opacity = 0.6 * (1 - progress);
            requestAnimationFrame(animate);
          }
        };

        animate();
      }, index * 50);
    });
  }

  /**
   * Create a hard drop trail effect
   */
  createDropTrail(startRow, endRow, col, color = 0x00ffff) {
    const x = col * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
    const startY = startRow * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
    const endY = endRow * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
    const height = Math.abs(startY - endY);

    const geometry = new THREE.PlaneGeometry(BOARD.BLOCK_SIZE * 0.8, height);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });

    const trail = new THREE.Mesh(geometry, material);
    trail.position.set(x, (startY + endY) / 2, 5);

    this.scene.add(trail);

    const startTime = Date.now();
    const duration = 300;

    const fadeOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.scene.remove(trail);
        geometry.dispose();
        material.dispose();
      } else {
        material.opacity = 0.5 * (1 - progress);
        requestAnimationFrame(fadeOut);
      }
    };

    fadeOut();
  }

  /**
   * Create combo text effect (floating 3D text would require TextGeometry)
   * For now, we'll create a glowing plane as placeholder
   */
  createComboEffect(combo, row, col) {
    const x = col * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
    const y = row * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
    
    // Create a glowing orb that rises
    const geometry = new THREE.SphereGeometry(15 + combo * 3, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.9
    });

    const orb = new THREE.Mesh(geometry, material);
    orb.position.set(x, y, 30);

    this.scene.add(orb);

    const startTime = Date.now();
    const duration = 1500;
    const riseHeight = 100;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.scene.remove(orb);
        geometry.dispose();
        material.dispose();
      } else {
        orb.position.y = y + riseHeight * progress;
        material.opacity = 0.9 * (1 - progress);
        orb.rotation.y += 0.05;
        orb.rotation.x += 0.02;
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Create level up effect
   */
  createLevelUpEffect() {
    const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;
    const boardHeight = BOARD.HEIGHT * BOARD.BLOCK_SIZE;

    // Flash effect
    this.flash(0xffff00, 0.6, 200);

    // Zoom pulse
    this.zoomPulse(0.15, 400);

    // Multiple shockwaves from center
    const centerX = boardWidth / 2;
    const centerY = boardHeight / 2;

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createGlowRing(centerX, centerY, 20, 0xffaa00, 80);
      }, i * 150);
    }
  }

  /**
   * Create game over effect
   */
  createGameOverEffect() {
    // Strong screen shake
    this.shake(15, 500);

    // Red flash
    this.flash(0xff0000, 0.7, 300);

    // Darken screen gradually
    const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;
    const boardHeight = BOARD.HEIGHT * BOARD.BLOCK_SIZE;

    const geometry = new THREE.PlaneGeometry(boardWidth * 2, boardHeight * 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      depthTest: false
    });

    const overlay = new THREE.Mesh(geometry, material);
    overlay.position.set(boardWidth / 2, boardHeight / 2, 50);

    this.scene.add(overlay);

    const startTime = Date.now();
    const duration = 1000;

    const darken = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        material.opacity = 0.7;
      } else {
        material.opacity = 0.7 * progress;
        requestAnimationFrame(darken);
      }
    };

    darken();
  }

  /**
   * Update all effects (call every frame)
   */
  update() {
    this.updateShake();
  }

  /**
   * Clean up effects
   */
  dispose() {
    this.isShaking = false;
    this.resetCamera();
    this.effects = [];
  }
}