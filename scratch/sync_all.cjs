const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'public', 'data', 'musnad-ahmad', 'chunks');
const dstDir = path.join(__dirname, '..', 'dist', 'data', 'musnad-ahmad', 'chunks');

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
let count = 0;
for (const file of files) {
  if (file.endsWith('.json')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(dstDir, file));
    count++;
  }
}

console.log(`Synced ${count} JSON files from public to dist`);
