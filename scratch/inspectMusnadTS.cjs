const fs = require('fs');
const content = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');
const matches = content.match(/id:\s*'musnad_ahmad_\d+'/g) || [];
console.log('Total chapters in musnadAhmadData.ts:', matches.length);
const segMatches = content.match(/id:\s*'musnad_ahmad_\d+_\d+'/g) || [];
console.log('Total segments in musnadAhmadData.ts:', segMatches.length);
