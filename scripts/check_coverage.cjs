const fs = require('fs');
const path = require('path');

const hadithDir = 'D:/Antigravity/public/hadith-data';
const files = fs.readdirSync(hadithDir).filter(f => f.endsWith('.json'));

files.forEach(f => {
  const p = path.join(hadithDir, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const hList = data.hadiths || [];
  let arabCount = 0;
  let urduCount = 0;
  hList.forEach(h => {
    if (h.arab && h.arab.trim().length > 0) arabCount++;
    if (h.urdu && h.urdu.trim().length > 0) urduCount++;
  });
  console.log(`${f}: Total=${hList.length}, WithArab=${arabCount}, WithUrdu=${urduCount}`);
});
