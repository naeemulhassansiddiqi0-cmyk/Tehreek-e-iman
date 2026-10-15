const fs = require('fs');
const path = require('path');

const hadithDir = 'D:/Antigravity/public/hadith-data';
const files = fs.readdirSync(hadithDir).filter(f => f.endsWith('.json'));

files.forEach(f => {
  const p = path.join(hadithDir, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const hList = data.hadiths || (Array.isArray(data) ? data : []);
  console.log(`=== ${f} ===`);
  console.log(`Total Hadiths: ${hList.length}`);
  if (hList.length > 0) {
    const sample = hList[0];
    console.log('Keys:', Object.keys(sample));
    console.log('Hadith Number:', sample.hadithnumber || sample.hadith_no || sample.number);
    console.log('Arabic exists:', Boolean(sample.arab || sample.arabic || sample.text_ar));
    console.log('Urdu exists:', Boolean(sample.urdu || sample.text || sample.text_ur || sample.urduText));
    // Sample urdu key
    const urduKey = Object.keys(sample).find(k => k.toLowerCase().includes('urdu') || k === 'text');
    if (urduKey) {
      console.log(`Urdu key "${urduKey}" snippet:`, String(sample[urduKey]).substring(0, 80));
    }
  }
});
