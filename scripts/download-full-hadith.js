import fs from 'fs';
import path from 'path';

async function download() {
  const books = [
    { slug: 'sahih-bukhari', file: 'ara-bukhari', urdFile: 'urd-bukhari', expected: 7000, alias: 'bukhari' },
    { slug: 'sahih-muslim', file: 'ara-muslim', urdFile: 'urd-muslim', expected: 7000, alias: 'muslim' },
    { slug: 'sunan-abu-daud', file: 'ara-abudawud', urdFile: 'urd-abudawud', expected: 5000, alias: 'sunan-abu-dawood' },
    { slug: 'jami-tirmizi', file: 'ara-tirmidhi', urdFile: 'urd-tirmidhi', expected: 3000, alias: 'jami-tirmidhi' },
    { slug: 'sunan-nasai', file: 'ara-nasai', urdFile: 'urd-nasai', expected: 5000, alias: 'nasai' },
    { slug: 'sunan-ibn-majah', file: 'ara-ibnmajah', urdFile: 'urd-ibnmajah', expected: 4000, alias: 'ibn-majah' }
  ];

  const targetDir = path.join(process.cwd(), 'public', 'hadith-data');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const b of books) {
    console.log(`Downloading ${b.slug}...`);
    let araJson = null;
    let urdJson = null;

    // Fetch Arabic edition
    const araUrls = [
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${b.file}.min.json`,
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${b.file}.json`,
      `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/${b.file}.min.json`
    ];

    for (const u of araUrls) {
      try {
        const res = await fetch(u);
        if (res.ok) {
          araJson = await res.json();
          if (araJson && araJson.hadiths && araJson.hadiths.length > 0) break;
        }
      } catch (e) {
        // try next
      }
    }

    if (!araJson || !araJson.hadiths) {
      throw new Error(`Failed to download Arabic edition for ${b.slug}`);
    }

    // Try fetching Urdu translation
    const urdUrls = [
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${b.urdFile}.min.json`,
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${b.urdFile}.json`,
      `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/${b.urdFile}.min.json`
    ];

    for (const u of urdUrls) {
      try {
        const res = await fetch(u);
        if (res.ok) {
          urdJson = await res.json();
          if (urdJson && urdJson.hadiths && urdJson.hadiths.length > 0) break;
        }
      } catch (e) {
        // optional Urdu fallback
      }
    }

    const mainPath = path.join(targetDir, `${b.slug}.json`);
    if (fs.existsSync(mainPath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
        if (existingData?.hadiths?.length >= b.expected) {
          console.log(`${b.slug} -> Total hadiths: ${existingData.hadiths.length}`);
          continue;
        }
      } catch (e) {
        // re-download if file corrupted
      }
    }

    // Merge Urdu text into hadith objects
    const urdHadiths = urdJson?.hadiths || [];
    const mergedHadiths = araJson.hadiths.map((h, idx) => ({
      hadithnumber: h.hadithnumber || (idx + 1),
      arab: h.text,
      urdu: urdHadiths[idx]?.text || ''
    }));

    const finalResult = {
      ...araJson,
      metadata: {
        ...araJson.metadata,
        slug: b.slug
      },
      hadiths: mergedHadiths
    };

    console.log(`${b.slug} -> Total hadiths: ${finalResult.hadiths.length}`);
    if (finalResult.hadiths.length < b.expected) {
      throw new Error(`${b.slug} incomplete: got ${finalResult.hadiths.length}, expected at least ${b.expected}`);
    }

    fs.writeFileSync(mainPath, JSON.stringify(finalResult));
  }

  console.log('ALL FULL BOOKS DOWNLOADED SUCCESSFULLY');
}

download().catch(err => {
  console.error('Download error:', err.message);
  process.exit(1);
});
