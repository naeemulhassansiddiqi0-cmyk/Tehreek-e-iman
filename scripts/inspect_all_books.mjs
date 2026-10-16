import fs from 'fs';
import path from 'path';

console.log('=== Inspecting public/hadith-data ===');
const hadithDataFiles = fs.readdirSync('public/hadith-data');
for (const f of hadithDataFiles) {
  const p = path.join('public/hadith-data', f);
  const stat = fs.statSync(p);
  console.log(`${f} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
}

console.log('\n=== Inspecting public/data ===');
if (fs.existsSync('public/data')) {
  const dataDirs = fs.readdirSync('public/data');
  for (const d of dataDirs) {
    console.log(`Directory: ${d}`);
  }
}

// Check how many hadiths in each file and if they have urdu translations
for (const f of hadithDataFiles) {
  if (!f.endsWith('.json')) continue;
  const p = path.join('public/hadith-data', f);
  try {
    const content = JSON.parse(fs.readFileSync(p, 'utf8'));
    const hadiths = content.hadiths || [];
    let withUrdu = 0;
    let withoutUrdu = 0;
    for (const h of hadiths) {
      if (h.urdu && h.urdu.trim().length > 10 && !h.urdu.includes('لوڈ کیا جا رہا ہے')) {
        withUrdu++;
      } else {
        withoutUrdu++;
      }
    }
    console.log(`\n[${f}] Total: ${hadiths.length} | With Urdu: ${withUrdu} | Missing/Placeholder: ${withoutUrdu}`);
    if (hadiths.length > 0) {
      console.log(`  Sample #1 Urdu: ${hadiths[0].urdu ? hadiths[0].urdu.substring(0, 100) : 'none'}...`);
    }
  } catch (err) {
    console.error(`Error reading ${f}:`, err.message);
  }
}
