const fs = require('fs');
const path = require('path');

const backupDir = 'D:/Antigravity/backup_all_chunks_before_v2';
const raw = fs.readFileSync(path.join(backupDir, 'chunk-20.json'), 'utf8');
const data = JSON.parse(raw);

console.log('Chunk 20 items count:', data.length);
console.log('Sample item 0 (first 300 chars):');
console.log(data[0].substring(0, 300));
console.log('---');
console.log('Sample item 1 (first 300 chars):');
console.log(data[1].substring(0, 300));
console.log('---');
console.log('Sample item 50 (first 300 chars):');
console.log(data[50].substring(0, 300));

// Check uniqueness across items in chunk-20
const matns = new Set();
data.forEach(item => {
  const m = item.match(/【متنِ کتاب.*?】\s*([\s\S]*?)\n\n【/);
  if (m) matns.add(m[1].trim());
});
console.log(`Unique matns in chunk-20: ${matns.size} / ${data.length}`);
