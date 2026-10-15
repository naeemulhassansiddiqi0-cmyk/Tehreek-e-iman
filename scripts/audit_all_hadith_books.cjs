const fs = require('fs');
const path = require('path');

const hadithDir = 'D:/Antigravity/public/hadith-data';
const files = fs.readdirSync(hadithDir).filter(f => f.endsWith('.json'));

function normalize(text) {
  if (!text) return '';
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[ـ\s‏]+/g, ' ').trim();
}

files.forEach(file => {
  const p = path.join(hadithDir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const hadiths = data.hadiths || [];

  const seenNumbers = new Set();
  const seenMatns = new Map();
  let numDuplicates = 0;
  let matnDuplicates = 0;

  hadiths.forEach((h, idx) => {
    const num = h.hadithnumber || h.number;
    if (seenNumbers.has(num)) {
      numDuplicates++;
    } else {
      seenNumbers.add(num);
    }

    const norm = normalize(h.arab || h.text);
    if (norm.length > 30) {
      if (seenMatns.has(norm)) {
        matnDuplicates++;
      } else {
        seenMatns.set(norm, num);
      }
    }
  });

  console.log(`=== AUDIT: ${file} ===`);
  console.log(`Total Hadiths: ${hadiths.length}`);
  console.log(`Unique Hadith Numbers: ${seenNumbers.size} (Duplicate Numbers: ${numDuplicates})`);
  console.log(`Unique Arabic Matns: ${seenMatns.size} (Identical Matns with different isnads: ${matnDuplicates})`);
});
