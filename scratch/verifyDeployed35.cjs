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
            const has31 = js.includes('musnad_ahmad_31');
            const hasJundub = js.includes('فَتَعَلَّمْنَا الإِيمَانَ قَبْلَ أَنْ نَتَعَلَّمَ القُرْآنَ');
            const segMatches = (js.match(/musnad_ahmad_\d+_\d+/g) || []);
            const uniqueSegs = new Set(segMatches);
            
            console.log(`RESULT FOR: ${targetUrl}`);
            console.log(`- Bundle contains musnad_ahmad_31: ${has31}`);
            console.log(`- Bundle contains Hadith of Jundub (35th page text): ${hasJundub}`);
            console.log(`- Total unique Musnad Ahmad segments in bundle: ${uniqueSegs.size}`);
            
            if (uniqueSegs.size >= 35 && has31 && hasJundub) {
              console.log(`>>> VERIFIED: 35 PAGES ARE LIVE! <<<`);
              resolve(true);
            } else {
              console.log(`>>> NOT FULLY PROPAGATED YET <<<`);
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

async function run() {
  await testUrl('https://88937f9e.tehreek-e-iman.pages.dev');
  await testUrl('https://tehreek-e-iman.pages.dev');
}

run();
