const fs = require('fs');
const content = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');
console.log('File size KB:', Math.round(content.length / 1024));

// Count brackets
const opens = (content.match(/\{/g) || []).length;
const closes = (content.match(/\}/g) || []).length;
const openArr = (content.match(/\[/g) || []).length;
const closeArr = (content.match(/\]/g) || []).length;

console.log('{ count:', opens, '} count:', closes);
console.log('[ count:', openArr, '] count:', closeArr);

if (opens !== closes || openArr !== closeArr) {
  console.log('SYNTAX BRACKET MISMATCH!');
} else {
  console.log('Brackets matched perfectly!');
}
