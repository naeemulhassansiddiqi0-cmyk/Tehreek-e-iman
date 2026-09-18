const fs = require('fs');
const path = require('path');
const dataDir = path.join('C:', 'Users', 'CoreCom', 'OneDrive', 'Desktop', 'Antigravity', 'src', 'data');

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') || f.endsWith('.json'));
let totalUrls = 0;
let urlMatches = [];

for (const f of files) {
  const content = fs.readFileSync(path.join(dataDir, f), 'utf8');
  const urls = content.match(/https?:\/\/[^\s"'\`]+/g) || [];
  totalUrls += urls.length;
  for (const u of urls) {
    urlMatches.push({ file: f, url: u });
  }
}

console.log('Total URLs found in data files:', totalUrls);
const uniqueUrls = [...new Set(urlMatches.map(m => m.url))];
console.log('Unique URLs:', uniqueUrls.length);
console.log('Sample URLs:', uniqueUrls.slice(0, 10));
