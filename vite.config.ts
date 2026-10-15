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
        // Ensure _redirects is copied/created in dist
        const redirectsSrc = path.resolve(__dirname, 'public/_redirects');
        const redirectsDest = path.resolve(__dirname, 'dist/_redirects');
        if (fs.existsSync(redirectsSrc)) {
          fs.copyFileSync(redirectsSrc, redirectsDest);
        } else {
          fs.writeFileSync(redirectsDest, '/assets/*  /index.html  404\n/*  /index.html  200\n', 'utf8');
        }

        // Ensure dist/assets/chunk-15.js is created to prevent MIME type/crash issues
        const assetsDir = path.resolve(__dirname, 'dist/assets');
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }
        const chunk15Path = path.join(assetsDir, 'chunk-15.js');
        if (!fs.existsSync(chunk15Path)) {
          fs.writeFileSync(
            chunk15Path,
            '// chunk-15.js fallback module\nexport default { id: "chunk-15", loaded: true };\n',
            'utf8'
          );
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
