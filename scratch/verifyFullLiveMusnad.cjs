const https = require('https');

async function testUrl(targetUrl) {
  console.log(`\n========================================`);
  console.log(`Fetching: ${targetUrl}`);
  
  return new Promise((resolve) => {
    https.get(targetUrl, (res) => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        const match = html.match(/\/assets\/index-[a-zA-Z0-9_-]+\.js/);
        if (!match) {
          console.log('No index bundle match found in HTML');
          return resolve(false);
        }
        
        const bundleUrl = new URL(match[0], targetUrl).toString();
        console.log(`Bundle URL: ${bundleUrl}`);
        
        https.get(bundleUrl, (bRes) => {
          let js = '';
          bRes.on('data', c => js += c);
          bRes.on('end', () => {
            const has100 = js.includes('musnad_ahmad_100');
            const has150 = js.includes('musnad_ahmad_150');
            const hasUrwah = js.includes('عُرْوَةَ بْنِ الجَعْدِ');
            const hasZainab = js.includes('زَيْنَبَ بِنْتِ جَحْشٍ');
            const hasSafiyyah = js.includes('صَفِيَّةَ بِنْتِ حُيَيٍّ');
            const hasUmmeSinan = js.includes('أُمِّ سِنَانٍ');
            const hasKhatima = js.includes('يَسِّرُوا وَلَا تُعَسِّرُوا');
            
            const segMatches = (js.match(/musnad_ahmad_\d+_\d+/g) || []);
            const uniqueSegs = new Set(segMatches);
            
            console.log(`RESULT FOR: ${targetUrl}`);
            console.log(`- Bundle contains musnad_ahmad_100: ${has100}`);
            console.log(`- Bundle contains musnad_ahmad_150 (Chapter 150): ${has150}`);
            console.log(`- Bundle contains Musnad Urwah al-Bariqi: ${hasUrwah}`);
            console.log(`- Bundle contains Musnad Zainab bint Jahsh: ${hasZainab}`);
            console.log(`- Bundle contains Musnad Safiyyah bint Huyayy: ${hasSafiyyah}`);
            console.log(`- Bundle contains Musnad Umm Sinan al-Aslamiyyah: ${hasUmmeSinan}`);
            console.log(`- Bundle contains Khatima Hadith: ${hasKhatima}`);
            console.log(`- Total unique Musnad Ahmad segments in live bundle: ${uniqueSegs.size}`);
            
            if (uniqueSegs.size >= 154 && has150) {
              console.log(`>>> VERIFIED: 154 PAGES (150 CHAPTERS) FULLY PROPAGATED & 100% LIVE! <<<`);
              resolve(true);
            } else {
              console.log(`>>> Current live segments: ${uniqueSegs.size} (Waiting for propagation if < 154) <<<`);
              resolve(false);
            }
          });
        }).on('error', (e) => {
          console.error('Bundle error:', e.message);
          resolve(false);
        });
      });
    }).on('error', (e) => {
      console.error('HTML error:', e.message);
      resolve(false);
    });
  });
}

async function run(deployUrl) {
  if (deployUrl) {
    await testUrl(deployUrl);
  }
  await testUrl('https://tehreek-e-iman.pages.dev');
}

const argUrl = process.argv[2];
run(argUrl);
