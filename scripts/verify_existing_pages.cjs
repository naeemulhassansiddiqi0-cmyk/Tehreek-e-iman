const fs = require('fs');
const path = require('path');

function checkFile(fname) {
  const p = path.join(__dirname, fname);
  if (!fs.existsSync(p)) return null;
  const content = fs.readFileSync(p, 'utf8');
  const matches = content.match(/\[صَفْحَة\s+(\d+)/g) || [];
  return { file: fname, count: matches.length, samples: matches.slice(0, 3) };
}

console.log(checkFile('generateMusnadPages525_574.cjs'));
console.log(checkFile('generateMusnadPages575_624.cjs'));
console.log(checkFile('appendMusnad625_674.cjs'));
console.log(checkFile('appendMusnad675_724.cjs'));
console.log(checkFile('appendMusnad725_774.cjs'));
console.log(checkFile('appendMusnad775_824.cjs'));
console.log(checkFile('appendMusnad825_874.cjs'));
