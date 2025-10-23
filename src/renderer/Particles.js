/**
 * Particles.js - Particle system for explosive visual effects
 * Creates particle explosions, trails, and ambient effects using Three.js
 */

import * as THREE from 'three';
import { BOARD, TIMING } from '../utils/Constants.js';
import { PIECE_COLORS } from '../utils/Colors.js';

export class Particles {
  constructor(scene) {
    this.scene = scene;
    this.particleSystems = [];
    this.particlePool = [];
    this.maxPoolSize = 500;
    
    this.initParticlePool();
  }

  /**
   * Initialize a pool of reusable particles for performance
   */
  initParticlePool() {
    const geometry = new THREE.SphereGeometry(1, 8, 8);
    
    for (let i = 0; i < this.maxPoolSize; i++) {
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 1
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.userData.inUse = false;
      particle.visible = false;
      
      this.scene.add(particle);
      this.particlePool.push(particle);
    }
  }

  /**
   * Get an available particle from the pool
   */
  getParticle() {
    for (let particle of this.particlePool) {
      if (!particle.userData.inUse) {
        particle.userData.inUse = true;
        particle.visible = true;
        return particle;
      }
    }
    return null; // Pool exhausted
  }

  /**
   * Return a particle to the pool
   */
  returnParticle(particle) {
    particle.userData.inUse = false;
    particle.visible = false;
    particle.position.set(0, 0, 0);
    particle.scale.set(1, 1, 1);
    particle.material.opacity = 1;
  }

  /**
   * Create an explosion of particles at a position
   */
  createExplosion(x, y, z, color = 0xffffff, count = 20, speed = 5) {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      // Random direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      const velocityX = Math.sin(phi) * Math.cos(theta) * speed;
      const velocityY = Math.sin(phi) * Math.sin(theta) * speed;
      const velocityZ = Math.cos(phi) * speed * 0.5;
      
      particle.position.set(x, y, z);
      particle.material.color.setHex(color);
      particle.scale.set(2, 2, 2);
      
      particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(velocityX, velocityY, velocityZ),
        lifetime: TIMING.PARTICLE_LIFETIME,
        createdAt: Date.now()
      });
    }
    
    this.particleSystems.push({
      particles,
      type: 'explosion'
    });
  }

  /**
   * Create particles for line clear effect
   */
  createLineClearParticles(rows, pieceType) {
    const color = PIECE_COLORS[pieceType]?.primary || 0xffffff;
    const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;
    
    rows.forEach((row, rowIndex) => {
      const y = row * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
      
      // Create particles along the entire row
      for (let col = 0; col < BOARD.WIDTH; col++) {
        const x = col * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
        
        // Multiple particles per block for density
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.createExplosion(
              x + (Math.random() - 0.5) * BOARD.BLOCK_SIZE,
              y + (Math.random() - 0.5) * BOARD.BLOCK_SIZE,
              10 + Math.random() * 20,
              color,
              5,
              3 + Math.random() * 2
            );
          }, col * 20 + rowIndex * 50);
        }
      }
    });
  }

  /**
   * Create particle burst when a piece locks
   */
  createLockParticles(blocks, pieceType) {
    const color = PIECE_COLORS[pieceType]?.primary || 0xffffff;
    
    blocks.forEach(block => {
      const x = block.col * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
      const y = block.row * BOARD.BLOCK_SIZE + BOARD.BLOCK_SIZE / 2;
      
      this.createExplosion(x, y, 10, color, 8, 2);
    });
  }

  /**
   * Create a particle trail effect
   */
  createTrail(startX, startY, endX, endY, color = 0x00ffff, count = 15) {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      const progress = i / count;
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      const z = 5 + Math.random() * 10;
      
      particle.position.set(x, y, z);
      particle.material.color.setHex(color);
      particle.scale.set(1.5, 1.5, 1.5);
      
      particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          0
        ),
        lifetime: 500,
        createdAt: Date.now(),
        delay: i * 10
      });
    }
    
    this.particleSystems.push({
      particles,
      type: 'trail'
    });
  }

  /**
   * Create ambient floating particles for atmosphere
   */
  createAmbientParticles(count = 50) {
    const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;
    const boardHeight = BOARD.HEIGHT * BOARD.BLOCK_SIZE;
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      particle.position.set(
        Math.random() * boardWidth,
        Math.random() * boardHeight,
        Math.random() * 100 - 50
      );
      
      const colors = [0x4466ff, 0xff4466, 0x44ff66, 0xff66ff, 0x66ffff];
      particle.material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
      particle.scale.set(0.5, 0.5, 0.5);
      particle.material.opacity = 0.3;
      
      particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        lifetime: Infinity, // Ambient particles never die
        createdAt: Date.now(),
        isAmbient: true
      });
    }
    
    this.particleSystems.push({
      particles,
      type: 'ambient'
    });
  }

  /**
   * Create a spiral particle effect
   */
  createSpiral(centerX, centerY, centerZ, color = 0xffff00, count = 30) {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      const angle = (i / count) * Math.PI * 4; // Two full rotations
      const radius = 20 + (i / count) * 40;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const z = centerZ + (i / count) * 50;
      
      particle.position.set(x, y, z);
      particle.material.color.setHex(color);
      particle.scale.set(2, 2, 2);
      
      particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(0, 0, 2),
        lifetime: 1500,
        createdAt: Date.now(),
        rotationSpeed: 0.1
      });
    }
    
    this.particleSystems.push({
      particles,
      type: 'spiral'
    });
  }

  /**
   * Create confetti effect for celebrations
   */
  createConfetti(centerX, centerY, centerZ, count = 40) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      const velocityX = (Math.random() - 0.5) * 8;
      const velocityY = Math.random() * 10 + 5;
      const velocityZ = (Math.random() - 0.5) * 8;
      
      particle.position.set(centerX, centerY, centerZ);
      particle.material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
      particle.scale.set(1.5, 1.5, 0.5);
      
      particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(velocityX, velocityY, velocityZ),
        angularVelocity: new THREE.Vector3(
          Math.random() * 0.2,
          Math.random() * 0.2,
          Math.random() * 0.2
        ),
        lifetime: 2000,
        createdAt: Date.now(),
        gravity: -0.3
      });
    }
    
    this.particleSystems.push({
      particles,
      type: 'confetti'
    });
  }

  /**
   * Update all particle systems
   */
  update() {
    const now = Date.now();
    const systemsToRemove = [];
    
    this.particleSystems.forEach((system, systemIndex) => {
      const particlesToRemove = [];
      
      system.particles.forEach((particleData, particleIndex) => {
        const age = now - particleData.createdAt;
        
        // Handle delayed particles
        if (particleData.delay && age < particleData.delay) {
          particleData.mesh.visible = false;
          return;
        } else {
          particleData.mesh.visible = true;
        }
        
        // Check lifetime (except ambient particles)
        if (!particleData.isAmbient && age >= particleData.lifetime) {
          this.returnParticle(particleData.mesh);
          particlesToRemove.push(particleIndex);
          return;
        }
        
        // Update position
        particleData.mesh.position.add(particleData.velocity);
        
        // Apply gravity if present
        if (particleData.gravity !== undefined) {
          particleData.velocity.y += particleData.gravity;
        }
        
        // Apply rotation if present
        if (particleData.angularVelocity) {
          particleData.mesh.rotation.x += particleData.angularVelocity.x;
          particleData.mesh.rotation.y += particleData.angularVelocity.y;
          particleData.mesh.rotation.z += particleData.angularVelocity.z;
        }
        
        if (particleData.rotationSpeed) {
          particleData.mesh.rotation.z += particleData.rotationSpeed;
        }
        
        // Fade out over lifetime (except ambient)
        if (!particleData.isAmbient) {
          const progress = age / particleData.lifetime;
          particleData.mesh.material.opacity = 1 - progress;
          
          // Shrink over time for some effects
          if (system.type === 'explosion') {
            const scale = 1 - progress * 0.5;
            particleData.mesh.scale.set(scale * 2, scale * 2, scale * 2);
          }
        } else {
          // Ambient particles drift and wrap around
          const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;
          const boardHeight = BOARD.HEIGHT * BOARD.BLOCK_SIZE;
          
          if (particleData.mesh.position.x < 0) particleData.mesh.position.x = boardWidth;
          if (particleData.mesh.position.x > boardWidth) particleData.mesh.position.x = 0;
          if (particleData.mesh.position.y < 0) particleData.mesh.position.y = boardHeight;
          if (particleData.mesh.position.y > boardHeight) particleData.mesh.position.y = 0;
        }
      });
      
      // Remove expired particles
      particlesToRemove.reverse().forEach(index => {
        system.particles.splice(index, 1);
      });
      
      // Mark empty systems for removal
      if (system.particles.length === 0 && system.type !== 'ambient') {
        systemsToRemove.push(systemIndex);
      }
    });
    
    // Remove empty systems
    systemsToRemove.reverse().forEach(index => {
      this.particleSystems.splice(index, 1);
    });
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particleSystems.forEach(system => {
      system.particles.forEach(particleData => {
        this.returnParticle(particleData.mesh);
      });
    });
    
    this.particleSystems = [];
  }

  /**
   * Clean up all resources
   */
  dispose() {
    this.clear();
    
    this.particlePool.forEach(particle => {
      this.scene.remove(particle);
      particle.geometry.dispose();
      particle.material.dispose();
    });
    
    this.particlePool = [];
  }
}