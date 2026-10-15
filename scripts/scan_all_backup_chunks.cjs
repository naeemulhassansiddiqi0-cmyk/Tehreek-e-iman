const fs = require('fs');
const path = require('path');

const backupDir = 'D:/Antigravity/backup_all_chunks_before_v2';
const files = fs.readdirSync(backupDir).filter(f => f.startsWith('chunk-') && f.endsWith('.json') && !f.includes('clean') && !f.includes('new'));

files.sort((a,b) => {
  const numA = parseInt(a.replace('chunk-', '').replace('.json', ''), 10);
  const numB = parseInt(b.replace('chunk-', '').replace('.json', ''), 10);
  return numA - numB;
});

console.log(`Found ${files.length} chunk files in backup.`);

const allGlobalMatns = new Map(); // normalized matn -> first seen chunk & page
let duplicateChunks = [];
let validUniqueChunks = [];

function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove harakat/diacritics
    .replace(/[ـ\s‏]+/g, ' ')
    .trim();
}

for (const file of files) {
  const chunkNum = parseInt(file.replace('chunk-', '').replace('.json', ''), 10);
  const p = path.join(backupDir, file);
  try {
    let raw = fs.readFileSync(p, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const data = JSON.parse(raw);
    
    let localMatns = new Set();
    let internalDups = 0;
    let globalDups = 0;

    data.forEach((item, idx) => {
      let matn = '';
      const m = item.match(/【متنِ کتاب.*?】\s*([\s\S]*?)\n\n【/);
      if (m) matn = m[1];
      else {
        const m2 = item.match(/【متن.*?】\s*([\s\S]*?)\n\n【/);
        if (m2) matn = m2[1];
      }
      
      const norm = normalizeArabic(matn);
      if (norm.length > 20) {
        if (localMatns.has(norm)) {
          internalDups++;
        } else {
          localMatns.add(norm);
        }

        if (allGlobalMatns.has(norm)) {
          globalDups++;
        } else {
          allGlobalMatns.set(norm, `${chunkNum}:${idx}`);
        }
      }
    });

    if (internalDups > 10 || globalDups > 50) {
      console.log(`Chunk ${chunkNum}: DUPLICATE LOOP DETECTED (items=${data.length}, internalDups=${internalDups}, globalDups=${globalDups})`);
      duplicateChunks.push(chunkNum);
    } else {
      validUniqueChunks.push({ chunkNum, count: data.length, internalDups, globalDups });
    }
  } catch (err) {
    console.log(`Chunk ${chunkNum}: PARSE ERROR (${err.message.substring(0, 60)})`);
  }
}

console.log('--- SCAN SUMMARY ---');
console.log(`Total valid unique chunks: ${validUniqueChunks.length}`);
console.log(`First 20 valid: ${validUniqueChunks.slice(0, 20).map(c => c.chunkNum).join(', ')}`);
console.log(`Duplicate chunks count: ${duplicateChunks.length}`);
if (duplicateChunks.length > 0) {
  console.log(`First duplicate chunk starts at: ${duplicateChunks[0]}`);
}
