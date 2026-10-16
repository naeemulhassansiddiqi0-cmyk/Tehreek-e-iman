import fs from 'fs';
import path from 'path';

const files = [
  'sahih-bukhari.json',
  'sahih-muslim.json',
  'sunan-abu-daud.json',
  'jami-tirmizi.json',
  'sunan-nasai.json',
  'sunan-ibn-majah.json'
];

for (const f of files) {
  const p = path.join('public/hadith-data', f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const list = data.hadiths || [];

  let emptyUrdu = 0;
  let loadingStr = 0;
  let shortUrdu = 0;
  let placeholder = 0;

  for (let i = 0; i < list.length; i++) {
    const h = list[i];
    const u = h.urdu ? h.urdu.trim() : '';
    if (!u) {
      emptyUrdu++;
    } else if (u.includes('لوڈ کیا جا رہا ہے') || u.includes('جاری ہے...')) {
      loadingStr++;
    } else if (u.includes('مشینی مسودہ') || u.includes('امت مسلمہ کے لیے')) {
      placeholder++;
    } else if (u.length < 15) {
      shortUrdu++;
    }
  }

  console.log(`[${f}] Total: ${list.length}`);
  console.log(`  Empty Urdu: ${emptyUrdu}`);
  console.log(`  Loading string: ${loadingStr}`);
  console.log(`  Placeholder: ${placeholder}`);
  console.log(`  Short (<15 chars): ${shortUrdu}`);
  console.log(`  Valid Urdu: ${list.length - emptyUrdu - loadingStr - placeholder - shortUrdu}`);
}
