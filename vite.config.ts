import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copy } from 'vite-plugin-copy';

export default defineConfig({
  plugins: [
    react(),
    copy({
      patterns: [
        { from: 'manifest.json', to: 'dist' },
        { from: 'icons', to: 'dist/icons' },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        window: resolve(__dirname, 'src/window/window.html'),
        options: resolve(__dirname, 'src/options/options.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
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
});
