import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import path from 'path';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // MDX support - must come before React plugin
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      ],
      providerImportSource: '@mdx-js/react',
    }),
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
        manualChunks: {
          // React core - keep react and react-dom together for proper initialization
          'vendor-react': ['react', 'react-dom', 'scheduler'],
          // React Router in its own chunk
          'vendor-router': ['react-router', 'react-router-dom'],
          // React Query
          'vendor-query': ['@tanstack/react-query'],
          // i18n libraries
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // HTTP client
          'vendor-http': ['axios'],
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
