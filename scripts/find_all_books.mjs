import fs from 'fs';
import path from 'path';

console.log('--- Scanning data directories ---');
if (fs.existsSync('public/hadith-data')) {
  console.log('public/hadith-data:', fs.readdirSync('public/hadith-data'));
}
if (fs.existsSync('public/data')) {
  console.log('public/data:', fs.readdirSync('public/data'));
}
if (fs.existsSync('src/data')) {
  console.log('src/data:', fs.readdirSync('src/data'));
}

// Find files containing book listings
function searchInSrc(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      searchInSrc(full);
    } else if (f.name.endsWith('.ts') || f.name.endsWith('.tsx') || f.name.endsWith('.json')) {
      const content = fs.readFileSync(full, 'utf-8');
      if (content.includes('146') || (content.includes('muwatta') && content.includes('slug'))) {
        console.log('Found reference in:', full);
      }
    }
  }
}

searchInSrc('src');
