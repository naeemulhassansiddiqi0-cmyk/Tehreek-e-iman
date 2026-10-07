const https = require('https');
const fs = require('fs');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function run() {
  const metaRes = await get('https://tehreek-e-iman.pages.dev/data/musnad-ahmad/chunks/meta.json');
  const chunk0Res = await get('https://tehreek-e-iman.pages.dev/data/musnad-ahmad/chunks/chunk-0.json');
  
  const meta = JSON.parse(metaRes.data);
  const chunk0 = JSON.parse(chunk0Res.data);

  const report = {
    meta,
    page1: {
      pageNumber: chunk0[0].pageNumber,
      title: chunk0[0].title,
      contentSnippet: chunk0[0].content.substring(0, 300)
    },
    page100: {
      pageNumber: chunk0[99].pageNumber,
      title: chunk0[99].title
    }
  };

  fs.writeFileSync('scripts/live_report.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('SUCCESS');
}

run().catch(err => {
  fs.writeFileSync('scripts/live_report.json', JSON.stringify({ error: err.message }), 'utf8');
});
