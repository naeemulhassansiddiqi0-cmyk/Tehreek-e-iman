const fs = require('fs');

const raw = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');
const lines = raw.split('\n');
console.log('Total lines in file:', lines.length);

const chapters = [];
let currentCh = null;
let currentSeg = null;
let state = null; // 'arabicText', 'urduTranslation', 'tashreeh', etc.
let buffer = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line.startsWith("id: 'musnad_ahmad_") && !line.includes('_0') && !line.includes('_1') && !line.includes('_2')) {
    // New chapter, e.g. id: 'musnad_ahmad_01'
    if (currentCh) chapters.push(currentCh);
    currentCh = { id: line.match(/'([^']+)'/)?.[1], segments: [] };
    continue;
  }

  if (currentCh && line.startsWith("titleArabic:")) {
    currentCh.titleArabic = line.replace(/^titleArabic:\s*['"`]/, '').replace(/['"`],?$/, '').trim();
    continue;
  }
  if (currentCh && line.startsWith("titleUrdu:")) {
    currentCh.titleUrdu = line.replace(/^titleUrdu:\s*['"`]/, '').replace(/['"`],?$/, '').trim();
    continue;
  }

  if (line.startsWith("id: 'musnad_ahmad_") && (line.includes('_01') || line.includes('_02') || line.includes('_03'))) {
    if (currentSeg && currentCh) currentCh.segments.push(currentSeg);
    currentSeg = { id: line.match(/'([^']+)'/)?.[1] };
    continue;
  }

  if (currentSeg) {
    if (state) {
      if (line.includes('`,') || line.endsWith('`')) {
        buffer.push(line.replace(/`,?$/, '').replace(/`$/, ''));
        currentSeg[state] = buffer.join('\n').trim();
        state = null;
        buffer = [];
      } else {
        buffer.push(line);
      }
    } else {
      if (line.startsWith("arabicText: `")) {
        if (line.endsWith("`,") || (line.endsWith("`") && line.length > 14)) {
          currentSeg.arabicText = line.slice(13).replace(/`,?$/, '').trim();
        } else {
          state = 'arabicText';
          buffer = [line.slice(13)];
        }
      } else if (line.startsWith("urduTranslation: `")) {
        if (line.endsWith("`,") || (line.endsWith("`") && line.length > 19)) {
          currentSeg.urduTranslation = line.slice(18).replace(/`,?$/, '').trim();
        } else {
          state = 'urduTranslation';
          buffer = [line.slice(18)];
        }
      } else if (line.startsWith("tashreeh: `")) {
        if (line.endsWith("`,") || (line.endsWith("`") && line.length > 12)) {
          currentSeg.tashreeh = line.slice(11).replace(/`,?$/, '').trim();
        } else {
          state = 'tashreeh';
          buffer = [line.slice(11)];
        }
      }
    }
  }
}
if (currentSeg && currentCh) currentCh.segments.push(currentSeg);
if (currentCh) chapters.push(currentCh);

console.log('Parsed chapters count:', chapters.length);
if (chapters.length > 0) {
  console.log('Chapter 1:', chapters[0].titleUrdu, '| Segments:', chapters[0].segments.length);
  if (chapters[0].segments.length > 0) {
    console.log('Seg 1 Arabic:', chapters[0].segments[0].arabicText?.slice(0, 80));
    console.log('Seg 1 Urdu:', chapters[0].segments[0].urduTranslation?.slice(0, 80));
  }
}
