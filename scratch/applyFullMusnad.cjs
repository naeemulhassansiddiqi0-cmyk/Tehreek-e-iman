const fs = require('fs');
const path = require('path');

const targetFile = path.join(process.cwd(), 'src', 'data', 'musnadAhmadData.ts');
let content = fs.readFileSync(targetFile, 'utf8');

const lastCloseIdx = content.lastIndexOf('];');
if (lastCloseIdx === -1) {
  console.error("Could not find closing '];'");
  process.exit(1);
}

// Read the new chapters from generateFullMusnad.cjs
const generatorSource = fs.readFileSync(path.join(process.cwd(), 'scratch', 'generateFullMusnad.cjs'), 'utf8');
const startMarker = 'const newChapters = `';
const endMarker = '`;';
const startIdx = generatorSource.indexOf(startMarker);
const endIdx = generatorSource.indexOf(endMarker, startIdx + startMarker.length);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not extract newChapters');
  process.exit(1);
}

const newChapters = generatorSource.substring(startIdx + startMarker.length, endIdx);

const updatedContent = content.substring(0, lastCloseIdx).trimEnd() + ',\n' + newChapters;
fs.writeFileSync(targetFile, updatedContent, 'utf8');
console.log('Successfully updated musnadAhmadData.ts with all chapters!');
