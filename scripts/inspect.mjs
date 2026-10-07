import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') searchDir(full);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        const c = fs.readFileSync(full, 'utf-8');
        if (c.includes('musnad-ahmad') || c.includes('musnadAhmadData')) {
          console.log(full);
        }
      }
    }
  }
}
searchDir('./src');
