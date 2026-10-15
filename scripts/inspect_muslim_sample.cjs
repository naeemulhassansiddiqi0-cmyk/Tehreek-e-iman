const fs = require('fs');
const path = require('path');

const p = 'D:/Antigravity/public/hadith-data/sahih-muslim.json';
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

console.log('sahih-muslim.json sample item 0:');
console.log(data.hadiths[0]);
console.log('sahih-muslim.json sample item 1:');
console.log(data.hadiths[1]);
console.log('sahih-muslim.json sample item 100:');
console.log(data.hadiths[100]);
