const fs = require('fs');
const path = require('path');

const dataDir = path.join('C:', 'Users', 'CoreCom', 'OneDrive', 'Desktop', 'Antigravity', 'src', 'data');

// 1. Check kharjiBooksExtra.json
const extraPath = path.join(dataDir, 'kharjiBooksExtra.json');
const extraBooks = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
console.log('--- KHARJI BOOKS EXTRA JSON ---');
console.log('Total books in kharjiBooksExtra.json:', extraBooks.length);

// Sample book structure
if (extraBooks.length > 0) {
  console.log('Sample book keys:', Object.keys(extraBooks[0]));
  console.log('Sample book:', JSON.stringify(extraBooks[0], null, 2).slice(0, 500));
}

// Check duplicates in extraBooks
const extraIds = new Set();
const duplicateExtraIds = [];
const duplicateTitles = [];
const titleMap = new Map();

for (const b of extraBooks) {
  if (extraIds.has(b.id)) duplicateExtraIds.push(b.id);
  extraIds.add(b.id);

  const t = (b.title || '').trim();
  if (titleMap.has(t)) duplicateTitles.push({ title: t, id1: titleMap.get(t), id2: b.id });
  titleMap.set(t, b.id);
}

console.log('Duplicate IDs in kharjiBooksExtra:', duplicateExtraIds.length);
console.log('Duplicate Titles in kharjiBooksExtra:', duplicateTitles.length);

// Check content/pages/chapters
let totalChaptersCount = 0;
let totalSegmentsCount = 0;
let booksWithNoChapters = 0;
let booksWithEmptyContent = 0;

for (const b of extraBooks) {
  const chs = b.chapters || [];
  totalChaptersCount += chs.length;
  if (chs.length === 0) booksWithNoChapters++;
  for (const ch of chs) {
    const segs = ch.segments || [];
    totalSegmentsCount += segs.length;
    if (segs.length === 0) booksWithEmptyContent++;
  }
}

console.log('Total Chapters in kharjiBooksExtra:', totalChaptersCount);
console.log('Total Segments/Pages in kharjiBooksExtra:', totalSegmentsCount);
console.log('Books with 0 chapters:', booksWithNoChapters);
console.log('Chapters with 0 segments:', booksWithEmptyContent);
