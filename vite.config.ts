/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/background.ts'),
        popup: resolve(__dirname, 'src/popup/popup.tsx'),
        window: resolve(__dirname, 'src/window/window.tsx'),
        sidebar: resolve(__dirname, 'src/sidebar/sidebar.tsx'),
        'sidebar-demo': resolve(__dirname, 'src/sidebar/demo.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content.css') {
            return 'content.css';
          }
          return '[name].[ext]';
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@popup': resolve(__dirname, 'src/popup'),
      '@window': resolve(__dirname, 'src/window'),
      '@options': resolve(__dirname, 'src/options'),
      '@background': resolve(__dirname, 'src/background'),
      '@content': resolve(__dirname, 'src/content'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    css: true,
    exclude: [
      'node_modules/**',
      'e2e/**/*.spec.ts',
      '**/node_modules/**',
      '**/*.e2e.ts',
      '**/*.e2e.js',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/helpers/test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'e2e/**/*',
      ],
    },
  },
});
