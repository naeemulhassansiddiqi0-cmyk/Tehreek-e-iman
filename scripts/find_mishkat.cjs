const fs = require('fs');
const p = 'D:/Antigravity/src/data/publicDomainBooks.ts';
const content = fs.readFileSync(p, 'utf8');

const matches = [];
const regex = /"id":\s*"([^"]+)"/g;
let m;
while ((m = regex.exec(content)) !== null) {
  if (m[1].includes('mishkat') || m[1].includes('masabih')) {
    matches.push(m[1]);
  }
}
console.log('Matches for mishkat/masabih:', matches);
