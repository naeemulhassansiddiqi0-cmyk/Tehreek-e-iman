const fs = require('fs');
const path = require('path');

const backupDir = 'D:/Antigravity/backup_all_chunks_before_v2';
[20, 50, 100, 150, 170].forEach(c => {
  const p = path.join(backupDir, `chunk-${c}.json`);
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    console.log(`=== Chunk ${c} (Total: ${data.length}) ===`);
    console.log('Item 0:', data[0].substring(0, 180));
    console.log('Item 1:', data[1].substring(0, 180));
  }
});
