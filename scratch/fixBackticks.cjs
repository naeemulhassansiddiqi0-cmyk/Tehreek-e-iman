const fs = require('fs');
let content = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');

console.log('Occurrences of escaped backticks before:', (content.match(/\\`/g) || []).length);

content = content.replace(/\\`/g, '`');

fs.writeFileSync('src/data/musnadAhmadData.ts', content, 'utf8');

console.log('Occurrences of escaped backticks after:', (content.match(/\\`/g) || []).length);
console.log('Successfully cleaned backticks in musnadAhmadData.ts!');
