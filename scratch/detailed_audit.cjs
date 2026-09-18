const fs = require('fs');
const path = require('path');
const dataDir = path.join('C:', 'Users', 'CoreCom', 'OneDrive', 'Desktop', 'Antigravity', 'src', 'data');

// Load kharjiBooksExtra.json
const extra = JSON.parse(fs.readFileSync(path.join(dataDir, 'kharjiBooksExtra.json'), 'utf8'));

// Parse kharjiBooksData.ts base books
const kharjiTs = fs.readFileSync(path.join(dataDir, 'kharjiBooksData.ts'), 'utf8');
const idRegex = /"id":\s*"([^"]+)"/g;
let match;
const baseIds = [];
// Only match in baseKharjiBooks before the import
const baseContent = kharjiTs.split("import extraKharjiBooks")[0];
while ((match = idRegex.exec(baseContent)) !== null) {
  if (!match[1].includes('_ch') && !match[1].includes('_seg_') && !match[1].includes('fasl') && !match[1].includes('kitab')) {
    baseIds.push(match[1]);
  }
}
const uniqueBaseIds = [...new Set(baseIds)];

console.log('=== AUDIT REPORT: BOOKS INVENTORY ===');
console.log('Base Kharji Books count in TS:', uniqueBaseIds.length);
console.log('Extra Kharji Books count in JSON:', extra.length);
console.log('Combined Kharji Books count:', uniqueBaseIds.length + extra.length);

// Analyze extra books
const categoryMap = {};
const subjectMap = {};
let totalExtraChapters = 0;
let totalExtraSegments = 0;
let singlePageBooks = 0;
let multiPageBooks = 0;
let zeroPageBooks = 0;

for (const b of extra) {
  categoryMap[b.category] = (categoryMap[b.category] || 0) + 1;
  subjectMap[b.subject] = (subjectMap[b.subject] || 0) + 1;
  const chs = b.chapters || [];
  totalExtraChapters += chs.length;
  let segCount = 0;
  for (const c of chs) {
    segCount += (c.segments || []).length;
  }
  totalExtraSegments += segCount;
  if (segCount === 0) zeroPageBooks++;
  else if (segCount === 1) singlePageBooks++;
  else multiPageBooks++;
}

console.log('\n--- EXTRA BOOKS PAGE DISTRIBUTION ---');
console.log('Books with 0 pages/segments:', zeroPageBooks);
console.log('Books with exactly 1 page/segment:', singlePageBooks);
console.log('Books with 2+ pages/segments:', multiPageBooks);
console.log('Total chapters in extra books:', totalExtraChapters);
console.log('Total segments/pages in extra books:', totalExtraSegments);
console.log('\n--- SUBJECTS DISTRIBUTION ---');
console.log(JSON.stringify(subjectMap, null, 2));

// Check duplicates between base and extra
const allIds = new Set();
const dups = [];
for (const id of uniqueBaseIds) allIds.add(id);
for (const b of extra) {
  if (allIds.has(b.id)) dups.push(b.id);
  allIds.add(b.id);
}
console.log('\nDuplicate IDs across base & extra:', dups.length);
