import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/',
  publicDir: 'public',
  assetsInclude: ['**/*.mp3', '**/*.wav'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/navigation': path.resolve(__dirname, './src/shims/next-navigation.ts'),
      'next/link': path.resolve(__dirname, './src/shims/next-link.tsx'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-naats-and-404',
      closeBundle() {
        const indexPath = path.resolve(__dirname, 'dist/index.html');
        const notFoundPath = path.resolve(__dirname, 'dist/404.html');
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath);
        }
        const srcNaats = path.resolve(__dirname, 'public/naats');
        const destNaats = path.resolve(__dirname, 'dist/naats');
        if (fs.existsSync(srcNaats)) {
          if (!fs.existsSync(destNaats)) {
            fs.mkdirSync(destNaats, { recursive: true });
          }
          const files = fs.readdirSync(srcNaats);
          for (const file of files) {
            const srcFile = path.join(srcNaats, file);
            const destFile = path.join(destNaats, file);
            if (fs.statSync(srcFile).isFile()) {
              fs.copyFileSync(srcFile, destFile);
            }
          }
        }
      }
    }
  ],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api/tts': {
        target: 'https://translate.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts/, '/translate_tts'),
        headers: {
          'Referer': '',
        },
      },
    },
  },
});
