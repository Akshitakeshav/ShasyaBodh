import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all local interfaces for external mobile testing
  },
  optimizeDeps: {
    // Exclude tfjs-tflite from dependency pre-bundling — it uses WASM
    exclude: ['@tensorflow/tfjs-tflite'],
  },
  build: {
    // Allow large WASM-related chunks without warnings
    chunkSizeWarningLimit: 5000,
  },
  assetsInclude: ['**/*.tfliteQuant', '**/*.tflite'],
});
