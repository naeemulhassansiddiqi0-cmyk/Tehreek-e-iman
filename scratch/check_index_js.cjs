const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'dist', 'assets', 'index-DaxYcS_k.js');
const content = fs.readFileSync(file, 'utf8');
let idx = 0;
while ((idx = content.indexOf('1574', idx)) !== -1) {
  console.log('Snippet at', idx, ':', content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 100)));
  idx += 4;
}
