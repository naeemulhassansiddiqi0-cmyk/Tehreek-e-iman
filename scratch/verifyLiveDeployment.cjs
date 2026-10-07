const https = require('https');
const http = require('http');
const fs = require('fs');

async function checkDeployment(url) {
  console.log(`Checking deployment at ${url}...`);
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        // Find JS bundle
        const jsMatch = html.match(/\/assets\/index-[a-zA-Z0-9_-]+\.js/);
        if (!jsMatch) {
          console.log('No index bundle found in HTML response');
          resolve({ success: false, reason: 'bundle_not_found' });
          return;
        }
        
        const jsUrl = new URL(jsMatch[0], url).toString();
        console.log(`Checking JS bundle: ${jsUrl}`);
        
        https.get(jsUrl, (jsRes) => {
          let js = '';
          jsRes.on('data', chunk => js += chunk);
          jsRes.on('end', () => {
            const has31 = js.includes('musnad_ahmad_31');
            const hasC30 = js.includes('musnad_ahmad_30');
            const hasC25 = js.includes('musnad_ahmad_25');
            const hasJundub = js.includes('جُنْدُبِ بْنِ عَبْدِ اللَّهِ') || js.includes('جندب بن عبد الله') || js.includes('فَتَعَلَّمْنَا الإِيمَانَ');
            
            // Count total musnad segments in the live bundle:
            const segMatches = (js.match(/musnad_ahmad_\d+_\d+/g) || []);
            const uniqueSegs = new Set(segMatches);
            
            console.log(`Live bundle check:`);
            console.log(`- Includes musnad_ahmad_31: ${has31}`);
            console.log(`- Includes musnad_ahmad_30: ${hasC30}`);
            console.log(`- Includes musnad_ahmad_25: ${hasC25}`);
            console.log(`- Includes Hadith of Jundub: ${hasJundub}`);
            console.log(`- Total unique Musnad Ahmad segments in live bundle: ${uniqueSegs.size}`);
            
            resolve({
              success: has31 && uniqueSegs.size >= 35,
              totalSegments: uniqueSegs.size,
              has31
            });
          });
        }).on('error', reject);
      });
    }).on('error', reject);
  });
}

// Read wrangler deployment log to get latest URL if available, else test tehreek-e-iman.pages.dev
async function main() {
  const defaultUrl = 'https://tehreek-e-iman.pages.dev';
  await checkDeployment(defaultUrl);
}

main();
