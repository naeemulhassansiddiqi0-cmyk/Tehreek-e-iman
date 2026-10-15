const fs = require('fs');
const path = require('path');

const chunk7Path = 'D:/Antigravity/backup_all_chunks_before_v2/chunk-7.json';
let raw = fs.readFileSync(chunk7Path, 'utf8');

// Insert missing comma and quotes between array elements
const idx = raw.indexOf('لْمُؤْمِنِينَ عَلِيِّ بْنِ أَبِي طَالِب');
if (idx !== -1) {
  const nextBismillah = raw.indexOf('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', idx);
  if (nextBismillah !== -1) {
    // Find where the previous string ended or needs closing
    const quoteBefore = raw.lastIndexOf('"', nextBismillah);
    const beforePart = raw.substring(0, nextBismillah);
    const afterPart = raw.substring(nextBismillah);

    let fixedBefore = beforePart.trim();
    if (!fixedBefore.endsWith('",') && !fixedBefore.endsWith('",\n')) {
      if (fixedBefore.endsWith('"')) {
        fixedBefore += ',';
      } else {
        fixedBefore += '",';
      }
    }
    
    let fixedAfter = afterPart.trim();
    if (!fixedAfter.startsWith('"')) {
      fixedAfter = '"' + fixedAfter;
    }

    raw = fixedBefore + '\n  ' + fixedAfter;
  }
}

try {
  const parsed = JSON.parse(raw);
  console.log('✓ Successfully fixed chunk-7.json! Total pages:', parsed.length);
  fs.writeFileSync(chunk7Path, JSON.stringify(parsed, null, 2), 'utf8');
} catch (e) {
  console.error('Still error in chunk-7:', e.message);
}
