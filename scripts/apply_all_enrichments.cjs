// Apply all enrichments (1175 - 1274) to chunk-11.json and chunk-12.json
const fs = require('fs');
const path = require('path');

const chunksDir = path.join(__dirname, '../public/data/musnad-ahmad/chunks');
const scriptsDir = __dirname;

const base = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'enrichments_base.json'), 'utf-8'));
const part1 = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'enrichments_part1.json'), 'utf-8'));
const part2 = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'enrichments_part2.json'), 'utf-8'));
const part3 = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'enrichments_part3.json'), 'utf-8'));

const allEnrichments = { ...base, ...part1, ...part2, ...part3 };
console.log('Total enrichment pages loaded:', Object.keys(allEnrichments).length);

function updatePage(pageText, pageNum) {
  const enrich = allEnrichments[pageNum];
  if (!enrich) {
    console.error(`Missing enrichment for page ${pageNum}`);
    return pageText;
  }

  // Regex matching from "محلِ اعراب و نحوی ترکیب" up to "【حوالہ و تصدیقِ ماخذ】"
  const regex = /محلِ اعراب و نحوی ترکیب[\s\S]*?(?=【حوالہ و تصدیقِ ماخذ】)/;
  if (!regex.test(pageText)) {
    console.error(`Could not find section regex in page ${pageNum}`);
    return pageText;
  }

  const irabContent = enrich.irab.map(item => `• • ${item}`).join('\n');
  const hawashiContent = enrich.hawashi.map(item => `• ${item}`).join('\n');

  const replacement = `محلِ اعراب و نحوی ترکیب و حلِ لغات:\n${irabContent}\n\nحواشی و درسی فوائد:\n${hawashiContent}\n\n`;
  return pageText.replace(regex, replacement);
}

// 1. Process chunk-11.json (indices 74 to 99 -> pages 1175 to 1200)
const chunk11Path = path.join(chunksDir, 'chunk-11.json');
const chunk11 = JSON.parse(fs.readFileSync(chunk11Path, 'utf-8'));
console.log('Loaded chunk-11 with pages:', chunk11.length);

for (let i = 74; i <= 99; i++) {
  const pageNum = 1101 + i;
  chunk11[i] = updatePage(chunk11[i], pageNum);
}
fs.writeFileSync(chunk11Path, JSON.stringify(chunk11, null, 2), 'utf-8');
console.log('Successfully updated chunk-11.json (pages 1175-1200)');

// 2. Process chunk-12.json (indices 0 to 73 -> pages 1201 to 1274)
const chunk12Path = path.join(chunksDir, 'chunk-12.json');
const chunk12 = JSON.parse(fs.readFileSync(chunk12Path, 'utf-8'));
console.log('Loaded chunk-12 with pages:', chunk12.length);

for (let i = 0; i <= 73; i++) {
  const pageNum = 1201 + i;
  chunk12[i] = updatePage(chunk12[i], pageNum);
}
fs.writeFileSync(chunk12Path, JSON.stringify(chunk12, null, 2), 'utf-8');
console.log('Successfully updated chunk-12.json (pages 1201-1274)');
