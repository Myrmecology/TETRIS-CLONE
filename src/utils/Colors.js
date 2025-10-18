/**
 * Colors.js - Advanced color management system for Tetris Neon Shatter
 * Handles all color schemes, gradients, and dynamic color effects
 */

import * as THREE from 'three';

// ============================================
// COLOR SCHEMES
// ============================================
export const THEMES = {
  NEON: {
    name: 'Neon Dreams',
    background: '#0a0a0f',
    backgroundGradient: ['#0a0a0f', '#1a0525'],
    grid: 'rgba(100, 100, 255, 0.1)',
    border: '#2a2a4a',
    text: '#ffffff',
    textShadow: '#00ffff',
    uiBackground: 'rgba(10, 10, 30, 0.9)',
    uiAccent: '#00ffff',
    particleGlow: '#ffffff',
    
    // Piece colors with glow variants
    pieces: {
      I: { base: '#00f0f0', glow: '#00ffff', dark: '#005555', light: '#80ffff' },
      O: { base: '#f0f000', glow: '#ffff00', dark: '#555500', light: '#ffff80' },
      T: { base: '#a000f0', glow: '#ff00ff', dark: '#4a0055', light: '#ff80ff' },
      S: { base: '#00f000', glow: '#00ff00', dark: '#005500', light: '#80ff80' },
      Z: { base: '#f00000', glow: '#ff0000', dark: '#550000', light: '#ff8080' },
      J: { base: '#0000f0', glow: '#0080ff', dark: '#000055', light: '#8080ff' },
      L: { base: '#f0a000', glow: '#ffaa00', dark: '#554400', light: '#ffcc80' }
    }
  },
  
  CYBERPUNK: {
    name: 'Cyberpunk',
    background: '#0d0015',
    backgroundGradient: ['#0d0015', '#1a0025', '#250035'],
    grid: 'rgba(255, 0, 150, 0.08)',
    border: '#ff0080',
    text: '#ffffff',
    textShadow: '#ff00ff',
    uiBackground: 'rgba(25, 0, 50, 0.95)',
    uiAccent: '#ff00aa',
    particleGlow: '#ff00ff',
    
    pieces: {
      I: { base: '#ff00ff', glow: '#ff00ff', dark: '#660066', light: '#ff80ff' },
      O: { base: '#ffff00', glow: '#ffff00', dark: '#666600', light: '#ffff80' },
      T: { base: '#00ffff', glow: '#00ffff', dark: '#006666', light: '#80ffff' },
      S: { base: '#00ff00', glow: '#00ff00', dark: '#006600', light: '#80ff80' },
      Z: { base: '#ff0080', glow: '#ff0080', dark: '#660033', light: '#ff80c0' },
      J: { base: '#8000ff', glow: '#8000ff', dark: '#330066', light: '#c080ff' },
      L: { base: '#ff8000', glow: '#ff8000', dark: '#663300', light: '#ffc080' }
    }
  },
  
  VAPORWAVE: {
    name: 'Vaporwave',
    background: '#1a0033',
    backgroundGradient: ['#1a0033', '#330066', '#4d0099'],
    grid: 'rgba(255, 100, 200, 0.1)',
    border: '#ff66cc',
    text: '#ffffff',
    textShadow: '#ff99ff',
    uiBackground: 'rgba(51, 0, 102, 0.85)',
    uiAccent: '#ff66ff',
    particleGlow: '#ff99ff',
    
    pieces: {
      I: { base: '#ff99ff', glow: '#ffaaff', dark: '#663366', light: '#ffccff' },
      O: { base: '#99ffff', glow: '#aaffff', dark: '#336666', light: '#ccffff' },
      T: { base: '#ff99cc', glow: '#ffaadd', dark: '#663355', light: '#ffccee' },
      S: { base: '#99ff99', glow: '#aaffaa', dark: '#336633', light: '#ccffcc' },
      Z: { base: '#ff9999', glow: '#ffaaaa', dark: '#663333', light: '#ffcccc' },
      J: { base: '#9999ff', glow: '#aaaaff', dark: '#333366', light: '#ccccff' },
      L: { base: '#ffcc99', glow: '#ffddaa', dark: '#665533', light: '#ffeedd' }
    }
  }
};

// ============================================
// DYNAMIC COLOR FUNCTIONS
// ============================================

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Interpolate between two colors
 */
export function lerpColor(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return rgbToHex(r, g, b);
}

/**
 * Generate gradient array between colors
 */
export function generateGradient(startColor, endColor, steps) {
  const gradient = [];
  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    gradient.push(lerpColor(startColor, endColor, factor));
  }
  return gradient;
}

/**
 * Add glow effect to color (increases brightness)
 */
export function addGlow(color, intensity = 1.5) {
  const rgb = hexToRgb(color);
  const r = Math.min(255, Math.round(rgb.r * intensity));
  const g = Math.min(255, Math.round(rgb.g * intensity));
  const b = Math.min(255, Math.round(rgb.b * intensity));
  return rgbToHex(r, g, b);
}

/**
 * Create rainbow color based on time
 */
export function getRainbowColor(time, speed = 1) {
  const hue = (time * speed) % 360;
  return `hsl(${hue}, 100%, 50%)`;
}

/**
 * Pulse color brightness based on time
 */
export function pulseColor(baseColor, time, speed = 1, minBrightness = 0.5) {
  const pulse = (Math.sin(time * speed) + 1) / 2;
  const brightness = minBrightness + (1 - minBrightness) * pulse;
  const rgb = hexToRgb(baseColor);
  
  const r = Math.round(rgb.r * brightness);
  const g = Math.round(rgb.g * brightness);
  const b = Math.round(rgb.b * brightness);
  
  return rgbToHex(r, g, b);
}

/**
 * Get complementary color
 */
export function getComplementary(color) {
  const rgb = hexToRgb(color);
  const r = 255 - rgb.r;
  const g = 255 - rgb.g;
  const b = 255 - rgb.b;
  return rgbToHex(r, g, b);
}

/**
 * Convert hex to Three.js color
 */
export function toThreeColor(hex) {
  return new THREE.Color(hex);
}

/**
 * Create material with emissive glow
 */
export function createGlowMaterial(color, glowColor, glowIntensity = 1) {
  return new THREE.MeshPhongMaterial({
    color: toThreeColor(color),
    emissive: toThreeColor(glowColor || color),
    emissiveIntensity: glowIntensity,
    shininess: 100,
    specular: 0x222222,
    transparent: true,
    opacity: 1
  });
}

/**
 * Create gradient texture for backgrounds
 */
export function createGradientTexture(colors, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  
  const gradient = context.createLinearGradient(0, 0, 0, size);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ============================================
// SPECIAL EFFECTS COLORS
// ============================================
export const EFFECTS_COLORS = {
  // Line clear effects
  LINE_CLEAR: {
    SINGLE: '#00ff00',
    DOUBLE: '#00ffff',
    TRIPLE: '#ffff00',
    TETRIS: '#ff00ff'
  },
  
  // Combo colors (escalating intensity)
  COMBO: [
    '#ffffff',  // 1x
    '#80ff80',  // 2x
    '#00ff00',  // 3x
    '#00ffff',  // 4x
    '#0080ff',  // 5x
    '#8000ff',  // 6x
    '#ff00ff',  // 7x
    '#ff0080',  // 8x
    '#ff0000',  // 9x
    '#ff8000',  // 10x+
  ],
  
  // Power-up colors
  POWERUPS: {
    SLOW_TIME: '#00ffff',
    CLEAR_LINE: '#ffff00',
    BOMB: '#ff0000',
    GHOST: '#8080ff',
    MAGNET: '#ff00ff'
  },
  
  // Particle trail colors
  TRAILS: {
    SOFT_DROP: '#00ff00',
    HARD_DROP: '#ff00ff',
    MOVEMENT: '#00ffff',
    ROTATION: '#ffff00'
  },
  
  // Level transition colors
  LEVEL_COLORS: generateGradient('#0000ff', '#ff0000', 30),
  
  // Warning/danger colors
  DANGER: {
    LOW: '#ffff00',
    MEDIUM: '#ff8800',
    HIGH: '#ff0000',
    CRITICAL: '#ff0040'
  }
};

// ============================================
// COLOR MANAGER CLASS
// ============================================
export class ColorManager {
  constructor(themeName = 'NEON') {
    this.currentTheme = THEMES[themeName];
    this.time = 0;
  }
  
  setTheme(themeName) {
    if (THEMES[themeName]) {
      this.currentTheme = THEMES[themeName];
    }
  }
  
  update(deltaTime) {
    this.time += deltaTime;
  }
  
  getPieceColor(pieceType, variant = 'base') {
    return this.currentTheme.pieces[pieceType][variant];
  }
  
  getPulsedPieceColor(pieceType) {
    const baseColor = this.getPieceColor(pieceType, 'base');
    return pulseColor(baseColor, this.time, 2, 0.7);
  }
  
  getRainbowPieceColor() {
    return getRainbowColor(this.time, 0.5);
  }
  
  getComboColor(comboLevel) {
    const index = Math.min(comboLevel - 1, EFFECTS_COLORS.COMBO.length - 1);
    return EFFECTS_COLORS.COMBO[Math.max(0, index)];
  }
  
  getLevelColor(level) {
    const index = Math.min(level - 1, EFFECTS_COLORS.LEVEL_COLORS.length - 1);
    return EFFECTS_COLORS.LEVEL_COLORS[Math.max(0, index)];
  }
  
  getDangerColor(fillPercentage) {
    if (fillPercentage < 40) return EFFECTS_COLORS.DANGER.LOW;
    if (fillPercentage < 60) return EFFECTS_COLORS.DANGER.MEDIUM;
    if (fillPercentage < 80) return EFFECTS_COLORS.DANGER.HIGH;
    return EFFECTS_COLORS.DANGER.CRITICAL;
  }
}

// Create singleton instance
export const colorManager = new ColorManager();

// Freeze objects to prevent modification
Object.freeze(THEMES);
Object.freeze(EFFECTS_COLORS);

export default {
  THEMES,
  EFFECTS_COLORS,
  ColorManager,
  colorManager,
  hexToRgb,
  rgbToHex,
  lerpColor,
  generateGradient,
  addGlow,
  getRainbowColor,
  pulseColor,
  getComplementary,
  toThreeColor,
  createGlowMaterial,
  createGradientTexture
};