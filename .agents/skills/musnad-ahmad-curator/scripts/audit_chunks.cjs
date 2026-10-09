const fs = require('fs');
const path = require('path');

// Musnad Ahmad Automated Quality & De-duplication Auditor
// Usage:
//   node audit_chunks.cjs 159         -> Audits chunk 159
//   node audit_chunks.cjs 160 169     -> Audits chunks 160 through 169
//   node audit_chunks.cjs all         -> Audits all chunks from 0 to current max

const chunksDir = path.join(__dirname, '..', '..', '..', '..', 'public', 'data', 'musnad-ahmad', 'chunks');

function auditChunkFile(chunkId) {
  const filePath = path.join(chunksDir, `chunk-${chunkId}.json`);
  if (!fs.existsSync(filePath)) {
    return { chunkId, error: `File not found: ${filePath}` };
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  let pages;
  try {
    pages = JSON.parse(rawData);
  } catch (e) {
    return { chunkId, error: `JSON Parse error: ${e.message}` };
  }

  const totalPages = pages.length;
  const arabicMatns = [];
  const urduTranslations = [];
  const hadithTitles = [];
  const placeholdersFound = [];

  pages.forEach((pageContent, idx) => {
    // Extract Hadith Title
    const titleMatch = pageContent.match(/«المسند للإمام أحمد بن حنبل» — مُسْنَدُ ([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : `Page ${idx + 1}`;
    hadithTitles.push(title);

    // Extract Arabic Matn
    const arMatch = pageContent.match(/【متنِ کتاب \(عربی\)】[\s\S]*?«([^»]+)»/);
    const arMatn = arMatch ? arMatch[1].trim() : '';
    arabicMatns.push(arMatn);

    // Extract Urdu Tarjuma
    const urMatch = pageContent.match(/سلیس اردو ترجمہ:\s*\nحضرت [^:]+:\s*['"]?([\s\S]*?)['"]?\s*\(مسند الإمام/);
    const urTarjuma = urMatch ? urMatch[1].trim() : '';
    urduTranslations.push(urTarjuma);

    // Check for unwanted placeholder phrases
    if (pageContent.includes('ملاحظہ فرمائیں') || pageContent.includes('مکمل مبارک کلام')) {
      placeholdersFound.push(idx + 1);
    }
  });

  // Calculate uniqueness
  const uniqueArabic = new Set(arabicMatns);
  const uniqueUrdu = new Set(urduTranslations);
  const duplicatesAr = totalPages - uniqueArabic.size;
  const duplicatesUr = totalPages - uniqueUrdu.size;

  // Detect repeating loop patterns (e.g. cycle length of 4, 5, etc.)
  let detectedCycle = null;
  for (let cycleLen = 2; cycleLen <= 10; cycleLen++) {
    let isRepeating = true;
    for (let i = cycleLen; i < Math.min(totalPages, cycleLen * 4); i++) {
      if (arabicMatns[i] !== arabicMatns[i % cycleLen]) {
        isRepeating = false;
        break;
      }
    }
    if (isRepeating && totalPages >= cycleLen * 2) {
      detectedCycle = cycleLen;
      break;
    }
  }

  return {
    chunkId,
    totalPages,
    uniqueArabicCount: uniqueArabic.size,
    uniqueUrduCount: uniqueUrdu.size,
    duplicatesAr,
    duplicatesUr,
    duplicationRatePercent: ((duplicatesAr / totalPages) * 100).toFixed(2),
    detectedCycle,
    placeholdersFound: placeholdersFound.length,
    status: (duplicatesAr === 0 && placeholdersFound.length === 0) ? 'PASSED_100_PERCENT_UNIQUE' : 'HAS_REPETITION'
  };
}

// CLI Argument Handling
const args = process.argv.slice(2);
let chunkList = [];

if (args.length === 0 || args[0] === '159') {
  chunkList = [159];
} else if (args[0] === 'all') {
  const metaPath = path.join(chunksDir, 'meta.json');
  let totalChunks = 170;
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    totalChunks = meta.totalChunks || 170;
  }
  for (let c = 0; c < totalChunks; c++) chunkList.push(c);
} else if (args.length === 2 && !isNaN(args[0]) && !isNaN(args[1])) {
  const start = parseInt(args[0], 10);
  const end = parseInt(args[1], 10);
  for (let c = start; c <= end; c++) chunkList.push(c);
} else if (!isNaN(args[0])) {
  chunkList = [parseInt(args[0], 10)];
}

console.log('========================================================================');
console.log('       MUSNAD AHMAD INTEGRITY & AUDIT REPORT (نظام التوثيق والمراقبة)     ');
console.log('========================================================================');
console.log(`Auditing ${chunkList.length} Chunk(s)...`);

let passCount = 0;
let failCount = 0;

chunkList.forEach(chunkId => {
  const result = auditChunkFile(chunkId);
  if (result.error) {
    console.log(`❌ Chunk ${chunkId}: ERROR - ${result.error}`);
    failCount++;
    return;
  }

  const icon = result.status === 'PASSED_100_PERCENT_UNIQUE' ? '✅' : '⚠️';
  console.log(`${icon} Chunk ${result.chunkId} (Pages ${result.chunkId * 100 + 1} - ${(result.chunkId + 1) * 100}):`);
  console.log(`   - Total Pages: ${result.totalPages}`);
  console.log(`   - Unique Hadiths: ${result.uniqueArabicCount} / ${result.totalPages}`);
  console.log(`   - Duplication Rate: ${result.duplicationRatePercent}%`);
  if (result.detectedCycle) {
    console.log(`   - [WARNING] Modulo Cycle Detected: Exact repeat every ${result.detectedCycle} pages!`);
  }
  if (result.placeholdersFound > 0) {
    console.log(`   - [ERROR] Placeholders found on ${result.placeholdersFound} page(s)!`);
  }
  console.log(`   - Verification Status: ${result.status}`);
  console.log('------------------------------------------------------------------------');

  if (result.status === 'PASSED_100_PERCENT_UNIQUE') passCount++;
  else failCount++;
});

console.log(`AUDIT COMPLETE: ${passCount} Passed (100% Unique), ${failCount} With Repetition.`);
console.log('========================================================================');
