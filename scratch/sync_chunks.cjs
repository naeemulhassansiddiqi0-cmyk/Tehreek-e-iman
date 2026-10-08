const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'public', 'data', 'musnad-ahmad', 'chunks');
const dstDir = path.join(__dirname, '..', 'dist', 'data', 'musnad-ahmad', 'chunks');

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

const files = ["meta.json","chunk-11.json","chunk-12.json","chunk-13.json","chunk-14.json","chunk-15.json","chunk-16.json","chunk-17.json","chunk-18.json","chunk-19.json","chunk-20.json","chunk-21.json","chunk-22.json","chunk-23.json","chunk-24.json","chunk-25.json","chunk-26.json","chunk-27.json","chunk-28.json","chunk-29.json","chunk-30.json","chunk-31.json","chunk-32.json","chunk-33.json","chunk-34.json","chunk-35.json","chunk-36.json","chunk-37.json","chunk-38.json","chunk-39.json","chunk-40.json","chunk-41.json","chunk-42.json","chunk-43.json","chunk-44.json","chunk-45.json","chunk-46.json","chunk-47.json","chunk-48.json","chunk-49.json"];

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
