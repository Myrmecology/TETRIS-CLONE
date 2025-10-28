import TitleScene from '../scenes/TitleScene.js';
import GameScene from '../scenes/GameScene.js';
import GameOverScene from '../scenes/GameOverScene.js';

export default class SceneManager {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.currentScene = null;
        this.isTransitioning = false;
    }

    // Render the current scene
    render() {
        if (this.currentScene && this.currentScene.scene) {
            this.currentScene.scene.render();
        }
    }

    // Transition to Title Scene
    goToTitle() {
        this.transitionTo(() => {
            if (this.currentScene) {
                this.currentScene.dispose();
            }
            this.currentScene = new TitleScene(this.engine, this.canvas, this);
        });
    }

    // Transition to Game Scene
    goToGame() {
        this.transitionTo(() => {
            if (this.currentScene) {
                this.currentScene.dispose();
            }
            this.currentScene = new GameScene(this.engine, this.canvas, this);
        });
    }

    // Transition to Game Over Scene
    goToGameOver(score, level, lines) {
        this.transitionTo(() => {
            if (this.currentScene) {
                this.currentScene.dispose();
            }
            this.currentScene = new GameOverScene(this.engine, this.canvas, this, score, level, lines);
        });
    }

    // Smooth fade transition between scenes
    transitionTo(callback) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Fade out
        const fadeOut = () => {
            return new Promise((resolve) => {
                if (!this.currentScene || !this.currentScene.scene) {
                    resolve();
                    return;
                }

                const startTime = Date.now();
                const duration = 500; // 500ms fade

                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Fade effect using scene clear color alpha
                    if (this.currentScene.scene.clearColor) {
                        this.currentScene.scene.clearColor.a = 1 - progress;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                };
                animate();
            });
        };

        // Fade in
        const fadeIn = () => {
            return new Promise((resolve) => {
                if (!this.currentScene || !this.currentScene.scene) {
                    resolve();
                    return;
                }

                const startTime = Date.now();
                const duration = 500; // 500ms fade

                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Fade effect
                    if (this.currentScene.scene.clearColor) {
                        this.currentScene.scene.clearColor.a = progress;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                };
                animate();
            });
        };

        // Execute transition
        fadeOut().then(() => {
            callback();
            return fadeIn();
        }).then(() => {
            this.isTransitioning = false;
        });
    }

    // Pause current scene (for when tab loses focus)
    pause() {
        if (this.currentScene && this.currentScene.pause) {
            this.currentScene.pause();
        }
    }
}