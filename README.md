# 🟨 Amber Tetris

For a video demo of this project, please visit: https://www.youtube.com/watch?v=oRNTdbrCgj8 

A visually stunning 3D Tetris clone built with Babylon.js, featuring rich amber crystal aesthetics, dramatic particle effects, and cinematic lighting.

## 🎮 Features

- **3D Amber Crystals** - Translucent mineral blocks with subsurface scattering and inner glow
- **Glowing Blue Outlines** - Beautiful contrast between warm amber and cool blue edges
- **Explosive Line Clears** - Screen flash, camera shake, and massive particle explosions
- **Dramatic Lighting** - Volumetric fog, multiple light sources, and enhanced shadows
- **Cinematic Title Screen** - Massive rotating crystal centerpiece with orbiting satellites
- **Professional UI** - Clean, polished interface with glowing effects
- **Progressive Difficulty** - Game speeds up smoothly as you level up
- **Atmospheric Effects** - Floating dust particles and ambient lighting
- **Custom Music Support** - Drop your own music files into the assets folder

## 🚀 How to Run

### Prerequisites
- Python 3.x installed on your system
- Modern web browser (Chrome, Firefox, Edge, or Safari)

### Steps

1. **Clone or download this repository**
```bash
   git clone https://github.com/yourusername/amber-tetris.git
   cd amber-tetris
```

2. **Start a local web server**
```bash
   python -m http.server 8000
```

3. **Open your browser**
   - Navigate to: `http://localhost:8000`
   - Press `Ctrl + Shift + R` (hard refresh) to ensure latest files load

4. **Play the game!**
   - Click "Start" to begin
   - Use arrow keys to play
   - Press P to pause

## 🎵 Adding Custom Music

1. Create or download your music file (`.wav` or `.mp3`)
2. Rename it to `music.wav` or `music.mp3`
3. Place it in `/assets/sounds/`
4. Update `src/config.js` if using `.mp3`:
```javascript
   MUSIC: './assets/sounds/music.mp3'
```
5. Refresh the browser - music will play automatically on game start

### Optional: Add Sound Effects

Create short audio clips and place them in `/assets/sounds/` with these names:
- `drop.mp3` - Plays when pieces lock (the satisfying click!)
- `move.mp3` - Plays when moving pieces
- `rotate.mp3` - Plays when rotating pieces
- `line_clear.mp3` - Plays when clearing lines
- `game_over.mp3` - Plays at game over

## 🎯 Controls

| Key | Action |
|-----|--------|
| **Left Arrow** | Move piece left |
| **Right Arrow** | Move piece right |
| **Up Arrow** | Rotate piece clockwise |
| **Down Arrow** | Soft drop (move down faster) |
| **Space Bar** | Hard drop (instant drop to bottom) |
| **P** | Pause/Resume game |

## 📁 Project Structure
```
amber-tetris/
├── assets/
│   ├── sounds/          # Audio files (music and SFX)
│   └── textures/        # Texture files (currently unused)
├── src/
│   ├── game/
│   │   ├── Board.js           # Game board, walls, particle effects
│   │   ├── GameLogic.js       # Core game mechanics and scoring
│   │   └── Tetromino.js       # Piece generation and materials
│   ├── scenes/
│   │   ├── GameOverScene.js   # Game over screen
│   │   ├── GameScene.js       # Main gameplay scene
│   │   └── TitleScene.js      # Title screen
│   ├── utils/
│   │   ├── SceneManager.js    # Scene transitions
│   │   └── SoundManager.js    # Audio management
│   └── config.js              # Game configuration and constants
├── index.html          # Entry point
├── style.css          # Global styles
├── main.js           # Application initialization
└── README.md        # This file
```

## 🛠️ Technologies Used

- **Babylon.js 7.x** - 3D rendering engine
- **Howler.js 2.2.3** - Audio management
- **JavaScript ES6+** - Modern JavaScript modules
- **HTML5 Canvas** - Rendering surface
- **Python** - Local development server

## 🎨 Visual Features

### Materials & Lighting
- PBR (Physically Based Rendering) materials for realistic amber
- Subsurface scattering for light transmission through crystals
- Multiple light sources (ambient, directional, point, spot)
- Volumetric fog for atmospheric depth
- Enhanced glow layers with bloom effects

### Particle Systems
- Line clear explosions (150+ particles per line)
- Ambient floating dust particles
- Falling debris on game over screen
- Additive blending for glowing effects

### Camera & Animation
- Fixed perspective camera with slight tilt
- Screen shake on line clears (intensity scales with lines cleared)
- Smooth scene transitions with fade effects
- Rotating crystals and floating animations

## 🎮 Gameplay Mechanics

- **Scoring**: 100 points per line, bonus for multiple lines (Tetris = 800 points)
- **Levels**: Progress every 10 lines cleared
- **Speed**: Increases by 50ms per level (minimum 100ms between falls)
- **Game Over**: Triggered when pieces stack to the top row
- **Board Size**: Standard 10×20 Tetris grid
- **Piece Types**: All 7 classic Tetrominos (I, O, T, S, Z, J, L)

## 🔧 Configuration

Edit `src/config.js` to customize:
- Board dimensions
- Fall speed and difficulty curve
- Color palette
- Visual effect intensities
- Particle counts
- Camera positioning
- Sound file paths

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Google Chrome 120+
- ✅ Mozilla Firefox 120+
- ✅ Microsoft Edge 120+
- ✅ Safari 17+

**Note**: Modern browsers may block audio autoplay. Click "Start" on the title screen to enable audio.

## 📝 Development Notes

- Uses ES6 modules - must be run from a web server (not `file://`)
- All dependencies loaded via CDN (no npm installation required)
- Hard refresh (`Ctrl + Shift + R`) recommended after code changes
- Browser console (F12) shows helpful debug information

## 🐛 Troubleshooting

**Music not playing?**
- Check browser console for errors
- Verify file is named correctly (`music.wav` or `music.mp3`)
- Ensure config.js has correct file extension
- Try clicking "Start" twice (some browsers require user interaction for audio)

**Blocks look yellow instead of amber?**
- Hard refresh the browser (`Ctrl + Shift + R`)
- Clear browser cache

**Performance issues?**
- Reduce particle counts in `src/config.js`
- Disable fog by setting `FOG_ENABLED: false`
- Close other browser tabs

## 📜 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Babylon.js team for the incredible 3D engine
- Howler.js for robust audio handling
- Classic Tetris for timeless gameplay

---

## 📚 About Babylon.js

**Babylon.js** is a powerful, open-source 3D engine built with JavaScript and WebGL. It enables developers to create rich, interactive 3D experiences that run directly in web browsers without plugins.

### Key Features Used in This Project

- **PBR Materials** - Physically Based Rendering for realistic materials with proper light interaction
- **Particle Systems** - GPU-accelerated particle effects for explosions and ambient atmosphere  
- **Glow Layer** - Post-processing effect that creates realistic bloom and glow around emissive objects
- **Advanced GUI** - 2D UI system for menus and HUD overlays
- **Scene Management** - Efficient handling of multiple game states and transitions
- **Animation System** - Built-in animation framework for smooth transitions
- **Arc Rotate Camera** - Easy-to-configure camera system for 3D perspective

### Why Babylon.js?

1. **Performance** - Optimized WebGL rendering with minimal overhead
2. **Features** - Comprehensive 3D toolkit (physics, particles, post-processing, etc.)
3. **Cross-Platform** - Works on desktop, mobile, and VR/AR devices
4. **Active Development** - Regular updates and strong community support
5. **Developer-Friendly** - Excellent documentation and TypeScript support
6. **No Installation** - Can be loaded via CDN (as used in this project)

### Technical Details

This project uses:
- **Babylon.js Core** - Main rendering engine
- **Babylon.js Loaders** - Asset loading capabilities  
- **Babylon.js GUI** - 2D user interface system

All loaded from official CDN: `https://cdn.babylonjs.com/`

### Learning Resources

- Official Documentation: https://doc.babylonjs.com/
- Playground (Interactive Examples): https://playground.babylonjs.com/
- Community Forum: https://forum.babylonjs.com/
- GitHub Repository: https://github.com/BabylonJS/Babylon.js

### Version Information

This project uses Babylon.js 7.x (latest stable release as of November 2025), which includes:
- Enhanced PBR material system with subsurface scattering
- Improved particle system performance
- Better GUI rendering and interaction
- Optimized glow and post-processing effects

Babylon.js is maintained by Microsoft and has been in active development since 2013, making it one of the most mature and reliable 3D engines for the web.

---

**Built with ❤️ using Babylon.js**