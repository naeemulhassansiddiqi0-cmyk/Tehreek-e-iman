import fs from 'fs';

const code = fs.readFileSync('src/data/booksData.ts', 'utf8');
const regex = /id:\s*"([^"]+)",\s*title:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)"/g;
let match;
const books = [];
while ((match = regex.exec(code)) !== null) {
  books.push({ id: match[1], title: match[2], category: match[3] });
}
console.log('Total books matched:', books.length);
books.forEach((b, i) => console.log(i + 1, b.id, '->', b.title, '(', b.category, ')'));
