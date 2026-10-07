const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('Data.ts'));
const results = [];

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    const chapterIds = (content.match(/id:\s*['"][^'"]*-ch\d+['"]/g) || []);
    const segmentIds = (content.match(/id:\s*['"][^'"]*-s\d+['"]/g) || []);
    const arabicTexts = (content.match(/arabicText:\s*`([^`]+)`/g) || []);
    const urduTexts = (content.match(/urduTranslation:\s*`([^`]+)`/g) || []);
    
    // Detect copy-paste: check if first 50 chars of each arabicText are the same
    const snippets = arabicTexts.map(t => t.substring(0, 80));
    const uniqueSnippets = new Set(snippets).size;
    const isLoop = arabicTexts.length > 1 && uniqueSnippets < arabicTexts.length * 0.5;
    
    let status = 'OK';
    let note = '';
    
    if (chapterIds.length === 0) {
      status = 'NO_CHAPTERS';
      note = 'کوئی باب (chapter) نہیں ملا';
    } else if (segmentIds.length === 0) {
      status = 'NO_SEGMENTS';
      note = 'کوئی حصہ (segment) نہیں ملا';
    } else if (isLoop) {
      status = 'COPY_PASTE_LOOP';
      note = `${arabicTexts.length} عربی متون میں صرف ${uniqueSnippets} منفرد — لوپ کا شبہ`;
    } else if (chapterIds.length < 3) {
      status = 'STUB';
      note = `صرف ${chapterIds.length} باب — نامکمل`;
    } else {
      status = 'COMPLETE';
      note = `${chapterIds.length} ابواب، ${segmentIds.length} حصص`;
    }
    
    results.push({
      file: file.replace('Data.ts',''),
      chapters: chapterIds.length,
      segments: segmentIds.length,
      arabicTexts: arabicTexts.length,
      urduTexts: urduTexts.length,
      status,
      note,
      fileKB: Math.round(fs.statSync(path.join(dataDir, file)).size / 1024)
    });
  } catch(e) {
    results.push({ file, status: 'ERROR', note: e.message });
  }
});

fs.writeFileSync(path.join(process.cwd(), 'scratch', 'auditResult.json'), JSON.stringify(results, null, 2));
console.log('Done! Results written to scratch/auditResult.json');
console.log(`Total files: ${results.length}`);
console.log('Summary:');
const statuses = {};
results.forEach(r => { statuses[r.status] = (statuses[r.status]||0)+1; });
console.log(JSON.stringify(statuses, null, 2));
