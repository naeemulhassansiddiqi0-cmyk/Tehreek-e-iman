const fs = require('fs');
const path = require('path');
const dataDir = path.join(process.cwd(), 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dataDir, f), 'utf8');
  if (content.toLowerCase().includes('musnad') && content.toLowerCase().includes('ahmad')) {
    const lines = content.split('\n');
    const matched = lines.filter(l => l.toLowerCase().includes('musnad') && l.toLowerCase().includes('ahmad'));
    console.log(`File: ${f} -> matches: ${matched.length}`);
    matched.slice(0, 3).forEach(l => console.log('   ', l.trim().substring(0, 100)));
  }
});
