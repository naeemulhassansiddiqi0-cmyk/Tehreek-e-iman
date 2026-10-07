const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        searchDir(fullPath);
      }
    } else if (entry.isFile()) {
      if (fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.json') || fullPath.endsWith('.html')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('1574')) {
            console.log(`FOUND 1574 IN: ${fullPath}`);
          }
        } catch (e) {}
      }
    }
  }
}

searchDir(path.join(__dirname, '..', 'dist'));
searchDir(path.join(__dirname, '..', 'src'));
console.log('SEARCH_DONE');
