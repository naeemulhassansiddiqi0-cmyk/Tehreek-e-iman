const fs = require('fs');
const path = require('path');

const hadithDir = 'D:/Antigravity/public/hadith-data';
const p = path.join(hadithDir, 'sahih-bukhari.json');
const raw = fs.readFileSync(p, 'utf8');
const data = JSON.parse(raw);

console.log('Top keys in sahih-bukhari.json:', Object.keys(data));
if (data.hadiths) {
  console.log('data.hadiths length:', data.hadiths.length);
  console.log('data.hadiths[0]:', JSON.stringify(data.hadiths[0]).substring(0, 300));
} else {
  // Print first 5 keys
  const keys = Object.keys(data).slice(0, 5);
  console.log('First 5 keys:', keys);
  console.log('Sample value for key', keys[0], ':', JSON.stringify(data[keys[0]]).substring(0, 300));
}
