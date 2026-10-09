const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'musnad_downloaded', 'musnad_ahmad_arabic.csv');
console.time('readCSV');
const content = fs.readFileSync(csvPath, 'utf8');
console.timeEnd('readCSV');

console.log('File length:', content.length);
const lines = content.split('\n');
console.log('Total raw lines:', lines.length);
