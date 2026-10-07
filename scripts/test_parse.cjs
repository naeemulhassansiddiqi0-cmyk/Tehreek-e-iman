const fs = require('fs');

const raw = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');
const jsCode = raw.replace('export const musnadAhmadChapters =', 'const musnadAhmadChapters =') + '\nmodule.exports = { musnadAhmadChapters };';

fs.writeFileSync('scripts/tempMusnadData.cjs', jsCode, 'utf8');
const { musnadAhmadChapters } = require('./tempMusnadData.cjs');
console.log('Successfully loaded musnadAhmadChapters! Count:', musnadAhmadChapters.length);

let totalSegs = 0;
for (const ch of musnadAhmadChapters) {
  totalSegs += (ch.segments || []).length;
}
console.log('Total segments across all chapters:', totalSegs);
console.log('First chapter:', musnadAhmadChapters[0].titleUrdu);
console.log('First segment arabic:', musnadAhmadChapters[0].segments[0].arabicText.slice(0, 100));
