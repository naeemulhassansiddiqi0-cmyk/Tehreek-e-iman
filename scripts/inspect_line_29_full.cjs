const fs = require('fs');

const p = 'D:/Antigravity/backup_all_chunks_before_v2/chunk-19.json';
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');

console.log('Line 29 full:');
console.log(lines[28]);
