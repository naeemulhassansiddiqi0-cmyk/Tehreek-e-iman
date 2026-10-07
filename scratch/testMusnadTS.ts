import { generateBookPages } from '../src/data/bookContentProvider';
import { publicDomainBooks } from '../src/data/publicDomainBooks';

const musnad = publicDomainBooks.find(b => b.id === 'musnad-ahmad');
if (!musnad) {
  console.log('Musnad Ahmad not found in publicDomainBooks!');
} else {
  console.log('Musnad Ahmad found!');
  console.log('Total pages generated:', musnad.pages.length);
  console.log('Sample Page 1:');
  console.log(musnad.pages[0].substring(0, 300));
  console.log('\nSample Page 2:');
  console.log(musnad.pages[1] ? musnad.pages[1].substring(0, 300) : 'NO PAGE 2');
  console.log('\nSample Page 24:');
  console.log(musnad.pages[23] ? musnad.pages[23].substring(0, 300) : 'NO PAGE 24');

  // Check uniqueness of pages:
  const uniquePages = new Set(musnad.pages);
  console.log('\nUnique pages count:', uniquePages.size, 'out of', musnad.pages.length);
  if (uniquePages.size === musnad.pages.length) {
    console.log('ALL PAGES ARE 100% UNIQUE! NO COPY-PASTE LOOP!');
  } else {
    console.log('WARNING: DUPLICATES DETECTED!');
  }
}
