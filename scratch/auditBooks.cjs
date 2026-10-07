const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('Data.ts'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const chaptersMatches = content.match(/\{[\s\S]*?id:\s*['"][^'"]+['"]/g);
  const segmentMatches = content.match(/segments:\s*\[/g);
  const chapterCount = (content.match(/id:\s*['"][^'"]*-ch\d+['"]/g) || []).length;
  const segmentCount = (content.match(/id:\s*['"][^'"]*-s\d+['"]/g) || []).length;
  const arabicTexts = content.match(/arabicText:\s*`[^`]+`/g) || [];
  const isLoop = arabicTexts.length > 1 && arabicTexts.every(t => t === arabicTexts[0]);
  
  console.log(JSON.stringify({
    file,
    chapters: chapterCount,
    segments: segmentCount,
    arabicUniqueTexts: arabicTexts.length,
    possibleLoop: isLoop,
    fileSize: fs.statSync(path.join(dataDir, file)).size
  }));
});
