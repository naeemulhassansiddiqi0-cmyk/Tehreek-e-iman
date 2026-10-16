import fs from 'fs';

const content = fs.readFileSync('src/data/publicDomainBooks.ts', 'utf8');
const lines = content.split('\n');
let found = 0;
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('mishkat') || l.includes('مشکوۃ') || l.includes('مشكاة')) {
    console.log(`${i + 1}: ${l}`);
    found++;
  }
});
if (found === 0) {
  console.log('No mention of mishkat in publicDomainBooks.ts');
}

// Check other files in src/data
const dataFiles = fs.readdirSync('src/data');
console.log('Files in src/data:', dataFiles);
for (const f of dataFiles) {
  if (f.endsWith('.ts') || f.endsWith('.json')) {
    const txt = fs.readFileSync(`src/data/${f}`, 'utf8');
    if (txt.toLowerCase().includes('mishkat') || txt.includes('مشکوۃ') || txt.includes('مشكاة')) {
      console.log(`Found mention in src/data/${f}`);
    }
  }
}
