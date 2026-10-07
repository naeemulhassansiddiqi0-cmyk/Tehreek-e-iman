const fs = require('fs');
const path = require('path');

const chunkDir = path.join(__dirname, '..', 'public', 'data', 'musnad-ahmad', 'chunks');
if (!fs.existsSync(chunkDir)) {
  console.log('Chunk dir does not exist!');
  process.exit(1);
}

const files = fs.readdirSync(chunkDir).filter(f => f.endsWith('.json'));
console.log('Found chunk files:', files);

let totalPages = 0;
for (const f of files) {
  if (f === 'meta.json') {
    const meta = JSON.parse(fs.readFileSync(path.join(chunkDir, f), 'utf-8'));
    console.log('meta.json:', meta);
  } else {
    const data = JSON.parse(fs.readFileSync(path.join(chunkDir, f), 'utf-8'));
    console.log(`${f}: array length = ${data.length}`);
    totalPages += data.length;
    // Show sample first page header
    if (data.length > 0) {
      const firstPage = data[0];
      const match = firstPage.match(/\[صَفْحَة\s+(\d+)/);
      const lastPage = data[data.length - 1];
      const lastMatch = lastPage.match(/\[صَفْحَة\s+(\d+)/);
      console.log(`  Start page: ${match ? match[1] : 'unknown'}, End page: ${lastMatch ? lastMatch[1] : 'unknown'}`);
    }
  }
}
console.log('Total page entries across chunks:', totalPages);
