import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

// Vite configuration for optimal performance and compatibility
export default defineConfig({
  // Development server settings
  server: {
    port: 3000,
    open: true,
    cors: true,
    // Improved hot module replacement
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost'
    }
  },

  // Build optimization
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-animation': ['gsap'],
          'vendor-audio': ['howler'],
          'vendor-effects': ['postprocessing']
        },
        // Asset naming patterns
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';
          } else if (/woff|woff2|ttf|otf|eot/i.test(extType)) {
            extType = 'fonts';
          } else if (/mp3|wav|ogg|m4a/i.test(extType)) {
            extType = 'audio';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Asset inlining threshold
    assetsInlineLimit: 4096
  },

  // Module resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@engine': resolve(__dirname, './src/engine'),
      '@renderer': resolve(__dirname, './src/renderer'),
      '@audio': resolve(__dirname, './src/audio'),
      '@ui': resolve(__dirname, './src/ui'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './assets'),
      '@styles': resolve(__dirname, './styles'),
      '@config': resolve(__dirname, './config')
    },
    extensions: ['.js', '.json', '.css']
  },

  // Dependencies optimization
  optimizeDeps: {
    include: [
      'three',
      'gsap',
      'howler',
      'postprocessing'
    ],
    exclude: ['dat.gui', 'stats.js']
  },

  // Plugins
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],

  // Global defines
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    postcss: {
      plugins: []
    }
  },

  // Asset handling
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr', '**/*.exr'],

  // Preview server (production build preview)
  preview: {
    port: 8080,
    open: true
  },

  // Logging level
  logLevel: 'info',

  // Clear screen on dev server start
  clearScreen: true,

  // Environment directory
  envDir: './',
  
  // Public base path
  base: './'
});