const fs = require('fs');
const path = require('path');

const distChunks = 'D:/Antigravity/dist/data/musnad-ahmad/chunks';
const publicChunks = 'D:/Antigravity/public/data/musnad-ahmad/chunks';

console.log('Public chunks count:', fs.readdirSync(publicChunks).filter(f => f.startsWith('chunk-')).length);
console.log('Public meta.json:', fs.readFileSync(path.join(publicChunks, 'meta.json'), 'utf8'));

if (!fs.existsSync(distChunks)) {
  fs.mkdirSync(distChunks, { recursive: true });
}

// Copy all files from publicChunks to distChunks if missing or different
let copiedCount = 0;
fs.readdirSync(publicChunks).forEach(f => {
  const src = path.join(publicChunks, f);
  const dst = path.join(distChunks, f);
  if (!fs.existsSync(dst) || fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
    fs.copyFileSync(src, dst);
    copiedCount++;
  }
});

console.log(`Dist synchronized: ${fs.readdirSync(distChunks).filter(f => f.startsWith('chunk-')).length} chunks present in dist.`);
