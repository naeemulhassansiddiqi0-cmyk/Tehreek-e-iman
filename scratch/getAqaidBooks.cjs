const fs = require('fs');
const content = fs.readFileSync('src/data/kharjiBooksData.ts', 'utf8');
const lines = content.split('\n');
const aqaidIds = [];
let lastId = '';

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"id":')) {
    const match = lines[i].match(/"id":\s*"([^"]+)"/);
    if (match) lastId = match[1];
  }
  if (lines[i].includes('"subject": "aqaid"')) {
    aqaidIds.push(lastId);
  }
}
console.log(aqaidIds.join('\n'));
