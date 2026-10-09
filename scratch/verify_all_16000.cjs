const fs = require('fs');
const path = require('path');

const chunksDir = path.join(__dirname, '..', 'public', 'data', 'musnad-ahmad', 'chunks');
const distChunksDir = path.join(__dirname, '..', 'dist', 'data', 'musnad-ahmad', 'chunks');

console.log("=== تصدیقِ نو: برائے 16,000 صفحات مسند احمد ===");

let totalPages = 0;
const hadithTexts = new Set();
const samplePages = {};

for (let i = 0; i < 160; i++) {
  const file = `chunk-${i}.json`;
  const pPath = path.join(chunksDir, file);
  const dPath = path.join(distChunksDir, file);

  if (!fs.existsSync(pPath)) throw new Error(`Missing public chunk: ${file}`);
  if (!fs.existsSync(dPath)) throw new Error(`Missing dist chunk: ${file}`);

  const pages = JSON.parse(fs.readFileSync(pPath, 'utf8'));
  if (pages.length !== 100) throw new Error(`Chunk ${file} has ${pages.length} pages, expected 100`);

  for (let p = 0; p < pages.length; p++) {
    totalPages++;
    const pageText = pages[p];
    
    // Extract Arabic text between 【متنِ کتاب (عربی)】 and (مسند أحمد:
    const startMarker = '【متنِ کتاب (عربی)】\n';
    const sIdx = pageText.indexOf(startMarker);
    const eIdx = pageText.indexOf('\n(مسند أحمد:', sIdx);
    if (sIdx !== -1 && eIdx !== -1) {
      const arabic = pageText.substring(sIdx + startMarker.length, eIdx).trim();
      hadithTexts.add(arabic);
    }

    if (totalPages === 1 || totalPages === 12 || totalPages === 100 || totalPages === 1000 || totalPages === 5000 || totalPages === 16000) {
      // Extract page title
      const titleMatch = pageText.match(/\[صَفْحَة (\d+) • ([^\]]+)\]/);
      samplePages[totalPages] = {
        title: titleMatch ? titleMatch[0] : 'unknown',
        snippet: pageText.substring(0, 180).replace(/\n/g, ' ')
      };
    }
  }
}

console.log(`کل صفحات کی جانچ پڑتال: ${totalPages}`);
console.log(`منفرد احادیث کی تعداد (Unique Hadiths): ${hadithTexts.size}`);
console.log(`کیا کوئی حدیث دہرائی گئی ہے؟: ${hadithTexts.size === totalPages ? 'نہیں، ہر حدیث 100% منفرد ہے!' : 'خبردار! تکرار پایا گیا'}`);
console.log("\nنمونہ صفحات کا معائنہ:");
console.log(JSON.stringify(samplePages, null, 2));

const meta = JSON.parse(fs.readFileSync(path.join(chunksDir, 'meta.json'), 'utf8'));
console.log("\nmeta.json معائنہ:", meta);
