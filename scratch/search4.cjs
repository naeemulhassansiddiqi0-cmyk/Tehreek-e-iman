const fs = require('fs');
const lines = fs.readFileSync('src/data/kharjiBooksData.ts', 'utf8').split('\n');
let id = '';
for (let line of lines) {
  if (line.includes('id:')) {
    id = line.trim();
  }
  if (line.includes('subject: "aqaid"')) {
    console.log(id);
  }
}
