const fs = require('fs');

const raw = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');

// Match each chapter
const chapters = [];
const chBlocks = raw.split(/\{\s*id:\s*'musnad_ahmad_\d+'/g);
console.log('Total chapter splits:', chBlocks.length - 1);
