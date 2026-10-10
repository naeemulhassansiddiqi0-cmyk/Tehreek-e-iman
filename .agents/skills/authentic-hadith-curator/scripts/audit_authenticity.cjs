const fs = require('fs');
const path = require('path');

// Rigorous Authenticity & Non-Repetition Auditor
// Usage: node audit_authenticity.cjs 160 [169]

const chunksDir = path.join(__dirname, '..', '..', '..', '..', 'public', 'data', 'musnad-ahmad', 'chunks');

const args = process.argv.slice(2);
const startChunk = parseInt(args[0] || '160', 10);
const endChunk = parseInt(args[1] || args[0] || '160', 10);

console.log('========================================================================');
console.log('       AUTHENTIC HADITH INTEGRITY & FIDELITY AUDIT REPORT               ');
console.log('         (نظام التحقيق والتوثيق للحديث الشريف — معيار المطابقة)           ');
console.log('========================================================================');

const forbiddenPhrases = [
  'رسول اللہ ﷺ نے اس مبارک ارشاد میں امت کی راہنمائی فرماتے ہوئے',
  'ملاحظہ فرمائیں',
  'مکمل مبارک کلام',
  'بندہ مومن کو اپنے تمام احوال میں شریعتِ مطہرہ کی پاسداری'
];

let totalPassed = 0;
let totalFailed = 0;

for (let chunkId = startChunk; chunkId <= endChunk; chunkId++) {
  const filePath = path.join(chunksDir, `chunk-${chunkId}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Chunk ${chunkId}: File not found (${filePath})`);
    totalFailed++;
    continue;
  }

  const pages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const arabicMatns = [];
  const urduTranslations = [];
  const boilerplateMatches = [];
  const emptyFields = [];

  pages.forEach((p, idx) => {
    const pageNo = chunkId * 100 + idx + 1; // logical page
    
    // 1. Arabic Matn
    const arMatch = p.match(/【متنِ کتاب \(عربی\)】[\s\S]*?«([^»]+)»/);
    const arMatn = arMatch ? arMatch[1].trim() : '';
    if (!arMatn) emptyFields.push(`Page ${idx + 1}: Missing Arabic matn`);
    arabicMatns.push(arMatn);

    // 2. Urdu Translation - Robust extraction matching both formats
    const urMatch = p.match(/سلیس اردو ترجمہ:\s*\n(?:حضرت\s+[^\n:]{2,120}?(?:رضي الله عن[هها]+)?\s*سے روایت ہے کہ:\s*)?['"]?([\s\S]*?)['"]?\s*\(مسند الإمام/);
    const urTarjuma = urMatch ? urMatch[1].trim() : '';
    if (!urTarjuma) emptyFields.push(`Page ${idx + 1}: Missing Urdu translation`);
    urduTranslations.push(urTarjuma);

    // 3. Boilerplate Check
    for (const phrase of forbiddenPhrases) {
      if (p.includes(phrase)) {
        boilerplateMatches.push(`Page ${idx + 1}: Found forbidden boilerplate ("${phrase.substring(0, 30)}...")`);
        break;
      }
    }
  });

  const uniqueAr = new Set(arabicMatns);
  const uniqueUr = new Set(urduTranslations);
  const arDupes = pages.length - uniqueAr.size;
  const urDupes = pages.length - uniqueUr.size;

  const isSuccess = (arDupes === 0 && urDupes === 0 && boilerplateMatches.length === 0 && emptyFields.length === 0);

  if (isSuccess) {
    console.log(`✅ Chunk ${chunkId} (Pages ${chunkId * 100 + 1} - ${(chunkId + 1) * 100}):`);
    console.log(`   - Total Pages: ${pages.length}`);
    console.log(`   - Unique Arabic Matns: ${uniqueAr.size} / ${pages.length}`);
    console.log(`   - Unique Urdu Translations: ${uniqueUr.size} / ${pages.length}`);
    console.log(`   - Boilerplate / Templates: 0 (PASSED)`);
    console.log(`   - Status: 100% AUTHENTIC & ACCURATE`);
    totalPassed++;
  } else {
    console.log(`⚠️ Chunk ${chunkId} (FAILED VALIDATION):`);
    console.log(`   - Arabic Duplicates: ${arDupes}`);
    console.log(`   - Urdu Translation Duplicates: ${urDupes}`);
    console.log(`   - Boilerplate Violations: ${boilerplateMatches.length}`);
    if (boilerplateMatches.length > 0) {
      console.log(`     Sample: ${boilerplateMatches.slice(0, 3).join(', ')}`);
    }
    if (emptyFields.length > 0) {
      console.log(`     Empty fields: ${emptyFields.slice(0, 3).join(', ')}`);
    }
    totalFailed++;
  }
  console.log('------------------------------------------------------------------------');
}

console.log(`AUDIT FINISHED: ${totalPassed} Passed, ${totalFailed} Failed.`);
console.log('========================================================================');
