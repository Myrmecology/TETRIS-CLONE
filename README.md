# TETRIS CLONE - Neon Edition

A stunning, modern Tetris clone built with **Three.js** featuring 3D graphics, particle effects, and a cyberpunk aesthetic. Experience classic Tetris gameplay with next-generation visual effects.

## ✨ Features

### Core Gameplay
- **Classic Tetris mechanics** - Standard SRS rotation system
- **7 unique pieces** (I, O, T, S, Z, J, L)
- **Ghost piece preview** - See where your piece will land
- **Hold piece system** - Save pieces for strategic play
- **Next piece preview** - Plan your moves ahead
- **Progressive difficulty** - Speed increases with each level
- **Combo system** - Chain line clears for bonus points

### Visual Effects
- **Three.js 3D rendering** - Beautiful WebGL graphics
- **Particle explosions** - Line clears trigger particle effects
- **Dynamic lighting** - Responsive lighting that reacts to gameplay
- **Screen shake effects** - Impactful visual feedback
- **Neon glow aesthetics** - Cyberpunk-inspired visual style
- **Smooth animations** - Professional transitions and effects

### Audio & Settings
- **Background music** - Immersive soundtrack (when implemented)
- **Sound effects** - Audio feedback for actions
- **Customizable settings** - Adjust volume, effects, and gameplay
- **Configurable starting level** - Jump straight to higher difficulty

### User Interface
- **Modern HUD** - Clean, informative heads-up display
- **Statistics tracking** - Singles, doubles, triples, Tetris count
- **High score system** - Persistent localStorage save
- **Game over screen** - Detailed performance breakdown
- **Pause functionality** - Pause and resume anytime

## 🚀 Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Setup Instructions

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/tetris-clone.git
   cd tetris-clone
```

2. **Install dependencies**
```bash
   npm install
```

3. **Run the development server**
```bash
   npm run dev
```

4. **Open in browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

5. **Build for production** (optional)
```bash
   npm run build
   npm run preview
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `←` / `→` | Move piece left/right |
| `↑` or `Z` | Rotate clockwise |
| `X` | Rotate counter-clockwise |
| `↓` | Soft drop (faster) |
| `Space` | Hard drop (instant) |
| `C` or `Shift` | Hold piece |
| `P` or `ESC` | Pause game |

## 📊 Scoring System

| Action | Points |
|--------|--------|
| Single line | 100 × level |
| Double lines | 300 × level |
| Triple lines | 500 × level |
| Tetris (4 lines) | 800 × level |
| Soft drop | 1 point per cell |
| Hard drop | 2 points per cell |
| Combos | Bonus multiplier |

## 📁 Project Structure
```
tetris-clone/
├── src/
│   ├── engine/          # Game logic
│   │   ├── Board.js
│   │   ├── EventEmitter.js
│   │   ├── Game.js
│   │   ├── Input.js
│   │   ├── Piece.js
│   │   └── Score.js
│   ├── renderer/        # Three.js rendering
│   │   ├── BlockMesh.js
│   │   ├── Effects.js
│   │   ├── Lighting.js
│   │   ├── Particles.js
│   │   ├── Scene.js
│   │   └── Shaders.js
│   ├── audio/           # Sound system
│   │   ├── MusicController.js
│   │   └── SoundEngine.js
│   ├── ui/              # User interface
│   │   ├── GameOver.js
│   │   ├── HUD.js
│   │   └── Menu.js
│   └── utils/           # Helper functions
│       ├── Colors.js
│       ├── Constants.js
│       └── Helpers.js
├── styles/              # CSS stylesheets
│   ├── hud.css
│   ├── main.css
│   └── menu.css
├── config/              # Configuration files
│   ├── gameConfig.js
│   └── renderConfig.js
├── assets/              # Game assets
│   ├── sounds/
│   ├── textures/
│   └── fonts/
├── index.html           # Main HTML file
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## 🛠️ Technologies Used

- **[Three.js](https://threejs.org/)** (v0.160.0) - 3D graphics library
- **[Vite](https://vitejs.dev/)** (v5.0.10) - Build tool and dev server
- **[GSAP](https://greensock.com/gsap/)** (v3.12.4) - Animation library
- **[Howler.js](https://howlerjs.com/)** (v2.2.4) - Audio library
- **Vanilla JavaScript (ES6+)** - Core logic
- **CSS3** - Styling and animations

## 🎯 Game Mechanics

### Level Progression
- Clear **10 lines** to advance to the next level
- Gravity speed increases with each level
- Maximum of 30+ levels with extended gameplay

### Combo System
- Clear lines consecutively without gaps for combo bonuses
- Higher combos = higher score multipliers
- Combo counter resets when a piece locks without clearing lines

### Hold Feature
- Press `C` or `Shift` to hold the current piece
- Can only be used once per piece drop
- Strategically save pieces for optimal placement

## 🚧 Future Enhancements

- [ ] Add background music tracks
- [ ] Implement more sound effects
- [ ] Add multiplayer mode
- [ ] Leaderboard system
- [ ] More visual themes
- [ ] Mobile touch controls
- [ ] Custom key bindings
- [ ] Replay system
- [ ] Marathon mode
- [ ] Sprint mode (40 lines)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by classic Tetris and modern interpretations
- Built with Three.js for stunning 3D graphics
- Special thanks to the open-source community

## 🐛 Known Issues

- Audio files not yet implemented (placeholder system in place)
- Best experienced on desktop/laptop browsers
- Performance may vary on older devices

## 💡 Tips for Players

1. **Build flat** - Avoid creating gaps in your stack
2. **Save I-pieces** - Use them for Tetris (4-line clears)
3. **Plan ahead** - Use the next piece preview
4. **Use hold strategically** - Don't waste it on every piece
5. **Stay low** - Keep your stack as low as possible

## 📧 Contact

For questions, suggestions, or bug reports, please open an issue on GitHub.

---

**Enjoy the game! 🎮✨**
Happy coding 
