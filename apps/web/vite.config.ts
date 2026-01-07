import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Brotli compression for production
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Only compress files larger than 1KB
      deleteOriginFile: false,
    }),
    // Also generate gzip for broader compatibility
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Optimize build output
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: (id) => {
          // Lucide React: Keep in separate chunk for tree-shaking
          // Vite will automatically tree-shake unused icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          // React core
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react';
          }

          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-ui';
          }

          // i18n libraries
          if (id.includes('i18next')) {
            return 'vendor-i18n';
          }

          // HTTP client
          if (id.includes('axios')) {
            return 'vendor-http';
          }

          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit (default is 500kB)
    chunkSizeWarningLimit: 600,
    // Enable source maps for production (helps debugging)
    sourcemap: true,
    // Minification with esbuild (faster than terser)
    minify: 'esbuild',
  },
});
