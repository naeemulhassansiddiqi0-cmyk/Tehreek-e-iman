const fs = require('fs');

const p = 'D:/Antigravity/backup_all_chunks_before_v2/chunk-19.json';
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  const m = l.match(/\[صَفْحَة (\d+)/);
  if (m) {
    console.log(`Line ${idx + 1}: Page ${m[1]}`);
  }
});
