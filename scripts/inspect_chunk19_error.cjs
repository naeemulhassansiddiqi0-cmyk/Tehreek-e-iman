const fs = require('fs');
const path = require('path');

const p = 'D:/Antigravity/backup_all_chunks_before_v2/chunk-19.json';
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');

console.log('Total lines in chunk-19.json:', lines.length);
for (let i = 25; i <= 35; i++) {
  if (lines[i]) {
    console.log(`Line ${i + 1} (length ${lines[i].length}):`, lines[i].substring(0, 150), '...');
  }
}
