const fs = require('fs');
const https = require('https');

// Check dist JS bundle
const js = fs.readFileSync('dist/assets/index-CGPBFyGO.js', 'utf8');
const pIndex = js.indexOf('id:"musnad-ahmad"');
console.log('Dist JS musnad-ahmad entry:');
console.log(js.slice(pIndex, pIndex + 120));

// Check live main HTML
https.get('https://tehreek-e-iman.pages.dev/books/musnad-ahmad', (res) => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    console.log('Live page status:', res.statusCode);
    const matchScript = html.match(/index-[^"]+\.js/);
    console.log('Live script reference:', matchScript ? matchScript[0] : 'no script');
  });
});
