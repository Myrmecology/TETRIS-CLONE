/**
 * Shaders.js - Custom GLSL shaders for advanced visual effects
 * Provides custom shaders for glow, hologram, and other effects
 */

export const Shaders = {
  /**
   * Vertex shader for glow effect
   */
  glowVertex: `
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  /**
   * Fragment shader for glow effect
   */
  glowFragment: `
    uniform vec3 glowColor;
    uniform float glowIntensity;
    uniform float glowPower;
    
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    
    void main() {
      float intensity = pow(glowIntensity - dot(vNormal, vPositionNormal), glowPower);
      gl_FragColor = vec4(glowColor, 1.0) * intensity;
    }
  `,

  /**
   * Vertex shader for hologram effect
   */
  hologramVertex: `
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  /**
   * Fragment shader for hologram effect
   */
  hologramFragment: `
    uniform vec3 hologramColor;
    uniform float time;
    uniform float opacity;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      // Scanline effect
      float scanline = sin(vUv.y * 100.0 + time * 5.0) * 0.5 + 0.5;
      
      // Fresnel effect for edge glow
      vec3 viewDirection = normalize(cameraPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDirection)), 3.0);
      
      // Noise flicker
      float flicker = sin(time * 10.0) * 0.1 + 0.9;
      
      vec3 color = hologramColor * (scanline * 0.5 + 0.5);
      float alpha = (fresnel * 0.7 + scanline * 0.3) * opacity * flicker;
      
      gl_FragColor = vec4(color, alpha);
    }
  `,

  /**
   * Vertex shader for neon effect
   */
  neonVertex: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  /**
   * Fragment shader for neon effect
   */
  neonFragment: `
    uniform vec3 neonColor;
    uniform float neonIntensity;
    uniform float time;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
      
      // Pulsing effect
      float pulse = sin(time * 2.0) * 0.2 + 0.8;
      
      vec3 color = neonColor * neonIntensity * fresnel * pulse;
      float alpha = fresnel * 0.9;
      
      gl_FragColor = vec4(color, alpha);
    }
  `,

  /**
   * Vertex shader for wave distortion
   */
  waveVertex: `
    uniform float time;
    uniform float waveAmplitude;
    uniform float waveFrequency;
    
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      
      vec3 pos = position;
      pos.z += sin(pos.x * waveFrequency + time) * waveAmplitude;
      pos.z += cos(pos.y * waveFrequency + time) * waveAmplitude;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,

  /**
   * Fragment shader for wave distortion
   */
  waveFragment: `
    uniform vec3 baseColor;
    uniform float time;
    
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // Animated color shift
      float colorShift = sin(uv.x * 10.0 + time) * 0.1;
      vec3 color = baseColor + vec3(colorShift, -colorShift * 0.5, colorShift * 0.5);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,

  /**
   * Vertex shader for particle system
   */
  particleVertex: `
    uniform float time;
    uniform float size;
    
    varying vec3 vColor;
    
    void main() {
      vColor = color;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      // Billboard effect (always face camera)
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  /**
   * Fragment shader for particle system
   */
  particleFragment: `
    varying vec3 vColor;
    
    void main() {
      // Circular particle shape
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) {
        discard;
      }
      
      // Soft edge falloff
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      
      gl_FragColor = vec4(vColor, alpha);
    }
  `,

  /**
   * Vertex shader for energy field effect
   */
  energyVertex: `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  /**
   * Fragment shader for energy field effect
   */
  energyFragment: `
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float time;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Animated noise pattern
      float noise = fract(sin(dot(vUv + time * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
      
      // Flowing gradient
      float gradient = sin(vPosition.y * 0.5 + time * 2.0) * 0.5 + 0.5;
      
      vec3 color = mix(color1, color2, gradient);
      color += vec3(noise * 0.1);
      
      float alpha = 0.3 + noise * 0.2;
      
      gl_FragColor = vec4(color, alpha);
    }
  `,

  /**
   * Vertex shader for grid effect
   */
  gridVertex: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  /**
   * Fragment shader for grid effect
   */
  gridFragment: `
    uniform vec3 gridColor;
    uniform float gridSpacing;
    uniform float lineWidth;
    uniform float opacity;
    
    varying vec2 vUv;
    
    void main() {
      vec2 grid = abs(fract(vUv * gridSpacing - 0.5) - 0.5) / fwidth(vUv * gridSpacing);
      float line = min(grid.x, grid.y);
      float alpha = 1.0 - min(line, 1.0);
      
      alpha *= opacity;
      
      gl_FragColor = vec4(gridColor, alpha);
    }
  `,

  /**
   * Create a glow material
   */
  createGlowMaterial(color = 0x00ffff, intensity = 1.0, power = 3.0) {
    return {
      uniforms: {
        glowColor: { value: new THREE.Color(color) },
        glowIntensity: { value: intensity },
        glowPower: { value: power }
      },
      vertexShader: this.glowVertex,
      fragmentShader: this.glowFragment,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    };
  },

  /**
   * Create a hologram material
   */
  createHologramMaterial(color = 0x00ffff, opacity = 0.6) {
    return {
      uniforms: {
        hologramColor: { value: new THREE.Color(color) },
        time: { value: 0 },
        opacity: { value: opacity }
      },
      vertexShader: this.hologramVertex,
      fragmentShader: this.hologramFragment,
      transparent: true,
      side: THREE.DoubleSide
    };
  },

  /**
   * Create a neon material
   */
  createNeonMaterial(color = 0xff00ff, intensity = 2.0) {
    return {
      uniforms: {
        neonColor: { value: new THREE.Color(color) },
        neonIntensity: { value: intensity },
        time: { value: 0 }
      },
      vertexShader: this.neonVertex,
      fragmentShader: this.neonFragment,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending
    };
  },

  /**
   * Create a wave material
   */
  createWaveMaterial(color = 0x4466ff, amplitude = 2.0, frequency = 0.5) {
    return {
      uniforms: {
        baseColor: { value: new THREE.Color(color) },
        time: { value: 0 },
        waveAmplitude: { value: amplitude },
        waveFrequency: { value: frequency }
      },
      vertexShader: this.waveVertex,
      fragmentShader: this.waveFragment
    };
  },

  /**
   * Create an energy field material
   */
  createEnergyMaterial(color1 = 0x4466ff, color2 = 0xff4466) {
    return {
      uniforms: {
        color1: { value: new THREE.Color(color1) },
        color2: { value: new THREE.Color(color2) },
        time: { value: 0 }
      },
      vertexShader: this.energyVertex,
      fragmentShader: this.energyFragment,
      transparent: true,
      side: THREE.DoubleSide
    };
  },

  /**
   * Create a grid material
   */
  createGridMaterial(color = 0x1a1a2e, spacing = 10.0, lineWidth = 0.05, opacity = 0.3) {
    return {
      uniforms: {
        gridColor: { value: new THREE.Color(color) },
        gridSpacing: { value: spacing },
        lineWidth: { value: lineWidth },
        opacity: { value: opacity }
      },
      vertexShader: this.gridVertex,
      fragmentShader: this.gridFragment,
      transparent: true,
      depthWrite: false
    };
  },

  /**
   * Update time uniform for animated shaders
   */
  updateTime(material, deltaTime) {
    if (material.uniforms && material.uniforms.time) {
      material.uniforms.time.value += deltaTime;
    }
  }
};

// Note: THREE needs to be imported where this is used
// import * as THREE from 'three';