const fs = require('fs');
const data = fs.readFileSync('src/data/kharjiBooksData.ts', 'utf8');
const regex = /id:\s*['"]([^'"]*)['"][\s\S]*?subject:\s*['"]aqaid['"]/g;
let match;
while ((match = regex.exec(data)) !== null) {
  console.log(match[1]);
}
