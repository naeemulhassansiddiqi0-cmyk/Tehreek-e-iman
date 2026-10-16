import fs from 'fs';
import path from 'path';

console.log('--- Checking books_full_text ---');
if (fs.existsSync('public/data/books_full_text')) {
  const fullTextFiles = fs.readdirSync('public/data/books_full_text');
  console.log(`Found ${fullTextFiles.length} files in public/data/books_full_text`);
  console.log('Sample:', fullTextFiles.slice(0, 10));
}

// Let's inspect src/data/booksData.ts
import { books } from '../src/data/booksData.js';
console.log(`Total books in booksData.ts: ${books?.length || 0}`);
if (books && books.length > 0) {
  console.log('Sample book slugs from booksData:', books.slice(0, 10).map(b => ({ id: b.id, slug: b.slug, title: b.title_ur })));
}
