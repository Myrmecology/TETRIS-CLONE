/**
 * Scene.js - Three.js scene management and 3D world setup
 * Handles camera, renderer, scene initialization and animation loop
 */

import * as THREE from 'three';
import { BOARD } from '../utils/Constants.js';

export class Scene {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animationFrameId = null;
    this.updateCallbacks = [];
    
    this.init();
  }

  /**
   * Initialize the Three.js scene, camera, and renderer
   */
  init() {
    // Create the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.Fog(0x0a0a0f, 400, 1000);

    // Setup camera
    this.setupCamera();

    // Setup renderer
    this.setupRenderer();

    // Setup lights (basic ambient and directional)
    this.setupBasicLights();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Setup the perspective camera with optimal viewing angle
   */
  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000);
    
    // Position camera to view the game board optimally
    // Adjust based on board size
    const boardWidth = BOARD.WIDTH * BOARD.BLOCK_SIZE;
    const boardHeight = BOARD.HEIGHT * BOARD.BLOCK_SIZE;
    
    // Camera positioned to center the board and provide good perspective
    this.camera.position.set(
      boardWidth * 0.5,
      boardHeight * 0.6,
      boardHeight * 2.2
    );
    
    this.camera.lookAt(
      boardWidth * 0.5,
      boardHeight * 0.4,
      0
    );
  }

  /**
   * Setup WebGL renderer with optimal settings
   */
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enable shadows for depth
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Tone mapping for better colors
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    // Output encoding
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * Setup basic lighting before custom lighting is added
   */
  setupBasicLights() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    this.scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(50, 100, 50);
    mainLight.castShadow = true;
    
    // Shadow settings
    mainLight.shadow.camera.left = -200;
    mainLight.shadow.camera.right = 200;
    mainLight.shadow.camera.top = 200;
    mainLight.shadow.camera.bottom = -200;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    
    this.scene.add(mainLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    fillLight.position.set(-50, 50, -50);
    this.scene.add(fillLight);

    // Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xff6644, 0.2);
    rimLight.position.set(0, 50, -100);
    this.scene.add(rimLight);
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Register a callback to be called every frame
   */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
  }

  /**
   * Remove an update callback
   */
  offUpdate(callback) {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Call all registered update callbacks
    this.updateCallbacks.forEach(callback => callback());

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Start the animation loop
   */
  start() {
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  /**
   * Stop the animation loop
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Add an object to the scene
   */
  add(object) {
    this.scene.add(object);
  }

  /**
   * Remove an object from the scene
   */
  remove(object) {
    this.scene.remove(object);
  }

  /**
   * Get the scene object
   */
  getScene() {
    return this.scene;
  }

  /**
   * Get the camera object
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Get the renderer object
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stop();
    
    // Remove event listeners
    window.removeEventListener('resize', () => this.onWindowResize());
    
    // Dispose renderer
    this.renderer.dispose();
    
    // Remove canvas from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    
    // Clear callbacks
    this.updateCallbacks = [];
  }
}