const fs = require('fs');
const path = require('path');

const hadithDir = 'D:/Antigravity/public/hadith-data';
const files = fs.readdirSync(hadithDir).filter(f => f.endsWith('.json'));

files.forEach(f => {
  const p = path.join(hadithDir, f);
  const raw = fs.readFileSync(p, 'utf8');
  try {
    const data = JSON.parse(raw);
    console.log(`=== ${f} ===`);
    console.log(`Total items: ${Array.isArray(data) ? data.length : typeof data}`);
    if (Array.isArray(data) && data.length > 0) {
      console.log('Item 0 keys:', Object.keys(data[0]));
      console.log('Sample Hadith #:', data[0].hadithNumber || data[0].hadith_no || data[0].number || data[0].id);
      console.log('Arabic snippet:', (data[0].arabic || data[0].arabicText || data[0].text_ar || '').substring(0, 100));
      console.log('Urdu snippet:', (data[0].urdu || data[0].urduText || data[0].text_ur || '').substring(0, 100));
    }
  } catch (e) {
    console.log(`Error parsing ${f}:`, e.message);
  }
});
