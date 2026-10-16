import fs from 'fs';
import path from 'path';

if (fs.existsSync('public/data/books_full_text')) {
  const list = fs.readdirSync('public/data/books_full_text');
  console.log('Files in public/data/books_full_text:', list);
} else {
  console.log('public/data/books_full_text does not exist');
}
