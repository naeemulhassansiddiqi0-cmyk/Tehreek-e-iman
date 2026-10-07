const fs = require('fs');
const data = fs.readFileSync('src/data/kharjiBooksData.ts', 'utf8');
const books = data.split('id: "');
books.forEach(b => {
  if (b.includes('subject: "aqaid"')) {
    console.log(b.substring(0, b.indexOf('"')));
  }
});
