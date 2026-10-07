const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') searchDir(full);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      const code = fs.readFileSync(full, 'utf8');
      if (code.includes('generateBookPages')) {
        console.log('generateBookPages used in:', full);
      }
    }
  }
}

searchDir('src');
