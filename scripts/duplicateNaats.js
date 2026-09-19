import fs from 'fs';
import path from 'path';

const sourceFile = 'public/naats/correct-naat.mp3';

if (!fs.existsSync(sourceFile)) {
  console.error('sourceFile does not exist!');
  process.exit(1);
}

// 1. Copy to track-01.mp3 through track-100.mp3
for (let i = 1; i <= 100; i++) {
  const num = i < 10 ? '0' + i : '' + i;
  const target = `public/naats/track-${num}.mp3`;
  fs.copyFileSync(sourceFile, target);
}

// 2. Also copy to all matches in naatsData.ts
const data = fs.readFileSync('src/data/naatsData.ts', 'utf8');
const matches = [...data.matchAll(/\/naats\/([^\s\"']+\.mp3)/g)];
const files = [...new Set(matches.map(m => m[1]))];
files.forEach(f => {
  const full = path.join('public', 'naats', f);
  const dir = path.dirname(full);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(sourceFile, full);
});

// 3. Also copy to test-naat-01.mp3
fs.copyFileSync(sourceFile, 'public/naats/test-naat-01.mp3');

const allFiles = fs.readdirSync('public/naats');
console.log('SUCCESS: Finished copying all tracks! Total files in public/naats:', allFiles.length);
