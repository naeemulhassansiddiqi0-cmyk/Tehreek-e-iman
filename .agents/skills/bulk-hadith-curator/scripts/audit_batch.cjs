// audit_batch.cjs
// Rigorous Bulk Authenticity & Zero-Repetition Auditor for Musnad Ahmad

const fs = require('fs');
const path = require('path');

const chunksDir = path.join(__dirname, '..', '..', '..', '..', 'public', 'data', 'musnad-ahmad', 'chunks');

const args = process.argv.slice(2);
const startChunk = parseInt(args[0] || '10', 10);
const endChunk = parseInt(args[1] || args[0] || '14', 10);

console.log('========================================================================');
console.log('     BULK HADITH INTEGRITY & FIDELITY AUDIT REPORT                     ');
console.log('   (نظام التحقيق والتوثيق للحديث الشريف — فحص الجودة والمطابقة)          ');
console.log(`   Auditing Chunks ${startChunk} to ${endChunk}`);
console.log('========================================================================\n');

const forbiddenPhrases = [
  'رسول اللہ ﷺ نے اس مبارک ارشاد میں امت کی راہنمائی فرماتے ہوئے',
  'ملاحظہ فرمائیں',
  'مکمل مبارک کلام',
  'بندہ مومن کو اپنے تمام احوال میں شریعتِ مطہرہ کی پاسداری'
];

let totalChunksPassed = 0;
let totalChunksFailed = 0;
let grandTotalPages = 0;

for (let chunkId = startChunk; chunkId <= endChunk; chunkId++) {
  const filePath = path.join(chunksDir, `chunk-${chunkId}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Chunk ${chunkId}: File not found at ${filePath}`);
    totalChunksFailed++;
    continue;
  }

  const pages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  grandTotalPages += pages.length;

  const arabicMatns = [];
  const urduTranslations = [];
  const boilerplateMatches = [];
  const emptyFields = [];

  pages.forEach((p, idx) => {
    // 1. Arabic Matn Check
    const arMatch = p.match(/【متنِ کتاب \(عربی\)】[\s\S]*?«([^»]+)»/);
    const arMatn = arMatch ? arMatch[1].trim() : '';
    if (!arMatn) {
      emptyFields.push(`Page ${idx + 1}: Missing Arabic matn`);
    } else {
      arabicMatns.push(arMatn);
    }

    // 2. Urdu Translation Check
    const urMatch = p.match(/سلیس اردو ترجمہ:\s*\n([\s\S]*?)\n\nدرسی تشریح و حل:/);
    const urTarjuma = urMatch ? urMatch[1].trim() : '';
    if (!urTarjuma) {
      emptyFields.push(`Page ${idx + 1}: Missing Urdu translation`);
    } else {
      urduTranslations.push(urTarjuma);
    }

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
    console.log(`✅ Chunk ${chunkId} (Hadiths ${chunkId * 100 + 1} - ${(chunkId + 1) * 100}):`);
    console.log(`   - Total Pages: ${pages.length}`);
    console.log(`   - Unique Arabic Matns: ${uniqueAr.size}/${pages.length} (100% Unique)`);
    console.log(`   - Unique Urdu Translations: ${uniqueUr.size}/${pages.length} (100% Unique)`);
    console.log(`   - Boilerplate / Templates: 0 (PASSED)`);
    console.log(`   - Empty Fields: 0 (PASSED)`);
    totalChunksPassed++;
  } else {
    console.log(`⚠️ Chunk ${chunkId} FAILED AUDIT:`);
    if (arDupes > 0) console.log(`   - Arabic Duplicates: ${arDupes}`);
    if (urDupes > 0) console.log(`   - Urdu Duplicates: ${urDupes}`);
    if (boilerplateMatches.length > 0) console.log(`   - Boilerplate Violations: ${boilerplateMatches.length}`);
    if (emptyFields.length > 0) console.log(`   - Empty Fields: ${emptyFields.length}`);
    totalChunksFailed++;
  }
  console.log('------------------------------------------------------------------------');
}

console.log(`\nAUDIT SUMMARY: ${totalChunksPassed} Chunks Passed, ${totalChunksFailed} Chunks Failed. Total Pages: ${grandTotalPages}`);
console.log('========================================================================');
