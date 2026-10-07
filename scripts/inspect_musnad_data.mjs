import fs from 'fs';
import path from 'path';

const fileContent = fs.readFileSync('./src/data/musnadAhmadData.ts', 'utf-8');

// Parse segments from musnadAhmadData.ts
// Each chapter has titleArabic, titleUrdu, segments: [{ id, arabicText, urduTranslation, tashreeh, mahalIraab, hawashi }]
console.log('File size:', fileContent.length);

const chapterRegex = /titleArabic:\s*['"`]([^'"`]+)['"`],\s*titleUrdu:\s*['"`]([^'"`]+)['"`]/g;
let match;
let count = 0;
while ((match = chapterRegex.exec(fileContent)) !== null && count < 10) {
  console.log(`Chapter ${count + 1}: ${match[2]} | ${match[1]}`);
  count++;
}
