import fs from 'fs';

const content = fs.readFileSync('src/data/publicDomainBooks.ts', 'utf-8');
const rawPubMatches = content.match(/const rawPublicDomainBooks: RawPublicDomainBook\[\] = \[([\s\S]*?)\];/);
const modernMatches = content.match(/const modernBooks: ModernBook\[\] = \[([\s\S]*?)\];/);

console.log('rawPublicDomainBooks matches found:', !!rawPubMatches);
console.log('modernBooks matches found:', !!modernMatches);

// Let's count items by counting "slug":
const pubSlugs = [];
const regex = /"slug":\s*"([^"]+)"/g;
let m;
if (rawPubMatches) {
  while ((m = regex.exec(rawPubMatches[1])) !== null) {
    pubSlugs.push(m[1]);
  }
}
console.log(`Public Domain Books count: ${pubSlugs.length}`);

const modSlugs = [];
if (modernMatches) {
  while ((m = regex.exec(modernMatches[1])) !== null) {
    modSlugs.push(m[1]);
  }
}
console.log(`Modern Books count: ${modSlugs.length}`);
console.log(`Total books in allCatalogBooks: ${pubSlugs.length + modSlugs.length}`);
