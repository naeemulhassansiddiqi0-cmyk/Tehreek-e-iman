const fs = require('fs');
const p = 'D:/Antigravity/src/data/publicDomainBooks.ts';
const content = fs.readFileSync(p, 'utf8');

const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('mishkat-al-masabih')) {
    console.log(`Line ${idx + 1}: ${l}`);
    for (let j = idx; j < idx + 25; j++) {
      console.log(lines[j]);
    }
  }
});
