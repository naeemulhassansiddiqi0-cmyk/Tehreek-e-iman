const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'public', 'data', 'musnad-ahmad', 'chunks');
const dstDir = path.join(__dirname, '..', 'dist', 'data', 'musnad-ahmad', 'chunks');

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

const files = ['meta.json', 'chunk-11.json', 'chunk-12.json', 'chunk-15.json', 'chunk-16.json', 'chunk-17.json'];

files.forEach(file => {
  const src = path.join(srcDir, file);
  const dst = path.join(dstDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    const stat = fs.statSync(dst);
    console.log(`Copied ${file} -> size: ${stat.size} bytes`);
  } else {
    console.warn(`Source not found: ${src}`);
  }
});

console.log('SYNC_COMPLETE');
