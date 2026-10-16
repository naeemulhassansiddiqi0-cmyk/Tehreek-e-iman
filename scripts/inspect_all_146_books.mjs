import fs from 'fs';
import path from 'path';

// Load publicDomainBooks metadata
const content = fs.readFileSync('src/data/publicDomainBooks.ts', 'utf-8');
const rawPubMatches = content.match(/const rawPublicDomainBooks: RawPublicDomainBook\[\] = \[([\s\S]*?)\];/);

const books = [];
const itemRegex = /\{[\s\S]*?"id":\s*"([^"]+)"[\s\S]*?"slug":\s*"([^"]+)"[\s\S]*?"title_ur":\s*"([^"]+)"[\s\S]*?"title_ar":\s*"([^"]+)"[\s\S]*?"category":\s*"([^"]+)"[\s\S]*?\}/g;

let match;
while ((match = itemRegex.exec(rawPubMatches[1])) !== null) {
  books.push({
    id: match[1],
    slug: match[2],
    title_ur: match[3],
    title_ar: match[4],
    category: match[5]
  });
}

console.log(`Found ${books.length} raw public domain books.`);

// Check how many have dedicated chapters in bookContentProvider.ts
const providerContent = fs.readFileSync('src/data/bookContentProvider.ts', 'utf-8');

let mappedCount = 0;
let unmappedBooks = [];

for (const b of books) {
  const slug = b.slug.toLowerCase();
  // check if slug is in HADITH_FILE_MAP or is chunked or matched in getDarsChaptersForBook
  const isHadithFile = ['sahih-bukhari', 'sahih-muslim', 'sunan-abu-daud', 'sunan-abu-dawood', 'jami-tirmizi', 'jami-tirmidhi', 'sunan-nasai', 'sunan-ibn-majah'].some(k => slug.includes(k) || b.id.includes(k));
  const isMusnadAhmad = slug.includes('musnad-ahmad') || b.id.includes('musnad-ahmad');
  const isQuran = slug === 'quran';

  // check providerContent for slug match
  const slugInProvider = providerContent.includes(`'${slug}'`) || providerContent.includes(`"${slug}"`) || providerContent.includes(`includes('${slug}')`);
  
  if (isHadithFile || isMusnadAhmad || isQuran || slugInProvider) {
    mappedCount++;
  } else {
    unmappedBooks.push(b);
  }
}

console.log(`Explicitly mapped books: ${mappedCount} / ${books.length}`);
console.log(`Books using general Islamic discipline curriculum: ${unmappedBooks.length}`);
if (unmappedBooks.length > 0) {
  console.log('Sample unmapped books:', unmappedBooks.slice(0, 5).map(b => b.slug));
}
