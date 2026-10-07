const fs = require('fs');
const path = require('path');

console.log('--- scratch/ ---');
console.log(fs.readdirSync(path.join(__dirname, '..', 'scratch')));

console.log('--- scripts/ ---');
console.log(fs.readdirSync(path.join(__dirname, '..', 'scripts')));
