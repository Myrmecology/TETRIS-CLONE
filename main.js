import SceneManager from './src/utils/SceneManager.js';

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas');
    
    // Create Babylon.js engine
    const engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true
    });

    // Initialize Scene Manager and start with Title Scene
    const sceneManager = new SceneManager(engine, canvas);
    sceneManager.goToTitle();

    // Handle window resize
    window.addEventListener('resize', () => {
        engine.resize();
    });

    // Run the render loop
    engine.runRenderLoop(() => {
        sceneManager.render();
    });

    // Handle browser tab visibility
    window.addEventListener('blur', () => {
        sceneManager.pause();
    });
});