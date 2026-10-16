import fs from 'fs';
import path from 'path';

const books = [
  { slug: 'sahih-bukhari', file: 'public/hadith-data/sahih-bukhari.json' },
  { slug: 'sahih-muslim', file: 'public/hadith-data/sahih-muslim.json' },
  { slug: 'sunan-abu-daud', file: 'public/hadith-data/sunan-abu-daud.json' },
  { slug: 'jami-tirmizi', file: 'public/hadith-data/jami-tirmizi.json' },
  { slug: 'sunan-nasai', file: 'public/hadith-data/sunan-nasai.json' },
  { slug: 'sunan-ibn-majah', file: 'public/hadith-data/sunan-ibn-majah.json' },
];

console.log('=== VERIFYING ALL HADITH DATASETS ===\n');

let totalHadiths = 0;
let totalMissingUrdu = 0;
let totalPlaceholderUrdu = 0;

for (const b of books) {
  const filePath = path.resolve(b.file);
  if (!fs.existsSync(filePath)) {
    console.error(`[MISSING] File not found: ${b.file}`);
    continue;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  const count = data.hadiths ? data.hadiths.length : data.length;
  const list = data.hadiths || data;
  
  let missingUrdu = 0;
  let placeholderUrdu = 0;

  for (const h of list) {
    const urdu = (h.urdu || '').trim();
    if (!urdu) {
      missingUrdu++;
    } else if (
      urdu.includes('امتِ مسلمہ کے لیے دینی رہنمائی') ||
      urdu.includes('ترجمہ لوڈ') ||
      urdu === '۔'
    ) {
      placeholderUrdu++;
    }
  }

  totalHadiths += count;
  totalMissingUrdu += missingUrdu;
  totalPlaceholderUrdu += placeholderUrdu;

  console.log(`📖 ${b.slug.padEnd(20)}: ${count.toString().padStart(6)} Hadiths | Missing: ${missingUrdu} | Placeholders: ${placeholderUrdu}`);
}

// Musnad Ahmad
const musnadDir = path.resolve('public/data/musnad-ahmad/chunks');
if (fs.existsSync(musnadDir)) {
  const chunkFiles = fs.readdirSync(musnadDir).filter(f => f.endsWith('.json'));
  let musnadCount = 0;
  let musnadMissingUrdu = 0;
  let musnadPlaceholder = 0;
  for (const cf of chunkFiles) {
    const chunkData = JSON.parse(fs.readFileSync(path.join(musnadDir, cf), 'utf-8'));
    const list = Array.isArray(chunkData) ? chunkData : (chunkData.hadiths || chunkData.data || []);
    musnadCount += list.length;
    for (const h of list) {
      const urdu = (h.urdu || '').trim();
      if (!urdu) musnadMissingUrdu++;
      else if (urdu.includes('امتِ مسلمہ کے لیے دینی رہنمائی') || urdu.includes('ترجمہ لوڈ')) musnadPlaceholder++;
    }
  }
  totalHadiths += musnadCount;
  totalMissingUrdu += musnadMissingUrdu;
  totalPlaceholderUrdu += musnadPlaceholder;
  console.log(`📖 ${'musnad-ahmad'.padEnd(20)}: ${musnadCount.toString().padStart(6)} Hadiths across ${chunkFiles.length} chunks | Missing: ${musnadMissingUrdu} | Placeholders: ${musnadPlaceholder}`);
}

console.log('\n=======================================');
console.log(`TOTAL CANONICAL HADITHS VERIFIED : ${totalHadiths.toLocaleString()}`);
console.log(`TOTAL MISSING URDU               : ${totalMissingUrdu}`);
console.log(`TOTAL PLACEHOLDERS               : ${totalPlaceholderUrdu}`);
console.log('=======================================');
