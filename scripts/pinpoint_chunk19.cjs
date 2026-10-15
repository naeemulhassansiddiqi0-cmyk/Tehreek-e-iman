const fs = require('fs');

const p = 'D:/Antigravity/backup_all_chunks_before_v2/chunk-19.json';
const content = fs.readFileSync(p, 'utf8');
const pos = 59160;

console.log('Context around position 59160:');
console.log(content.substring(Math.max(0, pos - 150), Math.min(content.length, pos + 150)));
