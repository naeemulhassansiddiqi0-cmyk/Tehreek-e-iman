const fs = require('fs');
const content = fs.readFileSync('src/data/kharjiBooksData.ts', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"kharji_fiqh_akbar_abu_hanifah"')) {
    console.log(lines[i+1]);
    console.log(lines[i+2]);
    break;
  }
}
