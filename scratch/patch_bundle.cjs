const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'dist', 'assets', 'index-DaxYcS_k.js');
let content = fs.readFileSync(file, 'utf8');

// Replace all occurrences of 1574 with 1624 in the bundled JS
const updated = content.replaceAll('1574', '1624');
fs.writeFileSync(file, updated, 'utf8');
console.log('REPLACED_1574_WITH_1624_IN_BUNDLE');
