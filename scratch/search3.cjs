const fs = require('fs');
const data = fs.readFileSync('src/data/kharjiBooksData.ts', 'utf8');
const books = data.split('id: "');
const results = [];
for (let i=1; i<books.length; i++) {
  const b = books[i];
  if (b.includes('subject: "aqaid"')) {
    results.push(b.substring(0, b.indexOf('"')));
  }
}
fs.writeFileSync('scratch/aqaid_list.txt', results.join('\n'));
