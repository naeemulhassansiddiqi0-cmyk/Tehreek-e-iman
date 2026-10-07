const fs = require('fs');

const content = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');

// Quick test of regex extraction
const chapters = [];
const blocks = content.split(/\{\s*id:\s*['"]musnad_ahmad_\d+['"]/);
console.log('Blocks count:', blocks.length);

for (let i = 1; i < Math.min(blocks.length, 6); i++) {
  const b = blocks[i];
  const arTitleMatch = b.match(/titleArabic:\s*['"`]([^'"`]+)['"`]/);
  const urTitleMatch = b.match(/titleUrdu:\s*['"`]([^'"`]+)['"`]/);
  const arTextMatch = b.match(/arabicText:\s*`([^`]+)`/);
  const urTextMatch = b.match(/urduTranslation:\s*`([^`]+)`/);
  const tashreehMatch = b.match(/tashreeh:\s*`([^`]+)`/);
  console.log(`\n--- Chapter ${i} ---`);
  console.log('Ar Title:', arTitleMatch ? arTitleMatch[1] : 'N/A');
  console.log('Ur Title:', urTitleMatch ? urTitleMatch[1] : 'N/A');
  console.log('Ar Text:', arTextMatch ? arTextMatch[1].slice(0, 80) : 'N/A');
  console.log('Ur Text:', urTextMatch ? urTextMatch[1].slice(0, 80) : 'N/A');
}
