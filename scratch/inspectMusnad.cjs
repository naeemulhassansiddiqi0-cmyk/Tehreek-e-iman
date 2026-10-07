const fs = require('fs');
const path = require('path');

// Read musnadAhmadData.ts
const content = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');

// Count chapters and segments
const chapters = content.match(/titleArabic:\s*['"][^'"]+['"]/g) || [];
const segments = content.match(/arabicText:\s*`[^`]+`/g) || [];

console.log('Chapters found in file:', chapters.length);
console.log('Segments found in file:', segments.length);

chapters.forEach((ch, i) => console.log(`Chapter ${i+1}: ${ch}`));

// Check all unique arabic texts to see if there is any repetition
const set = new Set(segments);
console.log('Unique segments:', set.size, 'out of', segments.length);
