const fs = require('fs');
const path = require('path');

const backupDir = 'D:/Antigravity/backup_all_chunks_before_v2';

for (let c = 15; c <= 20; c++) {
  const p = path.join(backupDir, `chunk-${c}.json`);
  if (fs.existsSync(p)) {
    try {
      let raw = fs.readFileSync(p, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      const data = JSON.parse(raw);
      console.log(`chunk-${c}.json parsed OK: ${data.length} items`);
    } catch (e) {
      console.log(`chunk-${c}.json parse ERROR:`, e.message);
    }
  } else {
    console.log(`chunk-${c}.json does NOT exist`);
  }
}

const p19New = path.join(backupDir, 'chunk-19-new.json');
if (fs.existsSync(p19New)) {
  try {
    let raw = fs.readFileSync(p19New, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const data = JSON.parse(raw);
    console.log(`chunk-19-new.json parsed OK: ${data.length} items`);
  } catch (e) {
    console.log(`chunk-19-new.json parse ERROR:`, e.message);
  }
}
