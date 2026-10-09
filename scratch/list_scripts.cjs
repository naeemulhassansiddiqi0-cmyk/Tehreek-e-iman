const fs = require('fs');
const files = fs.readdirSync('scripts');
console.log('Scripts:', files.filter(f => f.includes('musnad') || f.includes('chunk')));
