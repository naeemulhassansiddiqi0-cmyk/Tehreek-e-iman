const fs = require('fs');
const content = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');
const chapters = (content.match(/id:\s*'musnad_ahmad_\d+'/g) || []).length;
const segments = (content.match(/id:\s*'musnad_ahmad_\d+_\d+'/g) || []).length;
const segIds = content.match(/id:\s*'(musnad_ahmad_\d+_\d+)'/g) || [];
const set = new Set(segIds);
console.log(JSON.stringify({ chapters, segments, duplicates: segIds.length - set.size }));
