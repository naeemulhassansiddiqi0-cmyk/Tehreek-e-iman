const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function testMatch() {
  const backupDir = 'D:/Antigravity/backup_all_chunks_before_v2';
  const csvFile = 'D:/Antigravity/musnad_downloaded/musnad_ahmad_arabic.csv';

  // Read first 2000 lines from CSV into map
  const csvHadiths = new Map();
  const fileStream = fs.createReadStream(csvFile);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    const match = line.match(/^"(\d+)",\s*"(.*)"$/);
    if (!match) continue;
    const num = parseInt(match[1], 10);
    if (num > 2000) break;
    csvHadiths.set(num, match[2].trim());
  }

  function normalizeArabic(text) {
    if (!text) return '';
    return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[ـ\s‏]+/g, ' ').trim();
  }

  console.log('CSV hadiths loaded up to 2000.');

  for (let c = 0; c <= 18; c++) {
    const chunkFile = c === 7 
      ? path.join(backupDir, 'chunk-7-clean.json')
      : path.join(backupDir, `chunk-${c}.json`);
    
    if (!fs.existsSync(chunkFile)) {
      console.log(`Chunk ${c} not found`);
      continue;
    }

    let raw = fs.readFileSync(chunkFile, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const pages = JSON.parse(raw);

    let matchCount = 0;
    pages.forEach((p, idx) => {
      const pageNum = c * 100 + idx + 1;
      const csvText = csvHadiths.get(pageNum);
      if (!csvText) return;

      const normCsv = normalizeArabic(csvText).substring(0, 40);
      const normPage = normalizeArabic(p);

      if (normPage.includes(normCsv)) {
        matchCount++;
      }
    });

    console.log(`Chunk ${c} (Pages ${c*100+1}-${(c+1)*100}): ${matchCount}/100 match authentic CSV text.`);
  }
}

testMatch();
