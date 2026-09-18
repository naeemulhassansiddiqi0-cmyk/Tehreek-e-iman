const fs = require('fs');
const path = require('path');

const dataDir = path.join('C:', 'Users', 'CoreCom', 'OneDrive', 'Desktop', 'Antigravity', 'src', 'data');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// 1. Categories
const categories = [
  { id: 'cat_quran', slug: 'quran_tafseer', name_urdu: 'علوم القرآن والتفاسیر', name_arabic: 'القرآن والتفاسیر' },
  { id: 'cat_hadith', slug: 'sittah', name_urdu: 'صحاحِ ستہ و امہات الحدیث', name_arabic: 'الحديث الشريف' },
  { id: 'cat_fatawa', slug: 'fatawa', name_urdu: 'کتبِ فتاویٰ و فقہ حنفی', name_arabic: 'الفقه والفتاوى' },
  { id: 'cat_dars', slug: 'dars_curriculum', name_urdu: 'درسِ نظامی نصاب', name_arabic: 'المنهج الدراسي' },
  { id: 'cat_kharji', slug: 'kharji_kitab', name_urdu: 'جامع ذخیرۂ کتبِ مطالعہ (خارجی کتب)', name_arabic: 'كتب المطالعة' }
];

let sqlStatements = [];
sqlStatements.push('-- SEED CATEGORIES');
for (const c of categories) {
  sqlStatements.push(`INSERT OR REPLACE INTO categories (id, slug, name_urdu, name_arabic, description) VALUES (${escapeSql(c.id)}, ${escapeSql(c.slug)}, ${escapeSql(c.name_urdu)}, ${escapeSql(c.name_arabic)}, ${escapeSql(c.name_urdu)});`);
}

// 2. Load kharjiBooksExtra.json
const extra = JSON.parse(fs.readFileSync(path.join(dataDir, 'kharjiBooksExtra.json'), 'utf8'));

// 3. Extract base kharji books
const kharjiTs = fs.readFileSync(path.join(dataDir, 'kharjiBooksData.ts'), 'utf8');
// Evaluate base books or parse them
let baseBooks = [];
try {
  // Use Function to safely evaluate baseKharjiBooks array
  const cleanCode = kharjiTs.split('import extraKharjiBooks')[0]
    .replace('import { Book } from \'../types\';', '')
    .replace('const baseKharjiBooks: Book[] =', 'return');
  const fn = new Function(cleanCode);
  baseBooks = fn();
} catch (e) {
  console.warn('Could not eval baseKharjiBooks directly:', e.message);
}

console.log('Base books parsed:', baseBooks.length);
console.log('Extra books parsed:', extra.length);

const allBooks = [...baseBooks, ...extra];
console.log('Total books to seed:', allBooks.length);

sqlStatements.push('\n-- SEED BOOKS, CHAPTERS & SEGMENTS');

let bookCount = 0;
let chapterCount = 0;
let segmentCount = 0;

for (const b of allBooks) {
  const chapters = b.chapters || [];
  let pageCount = 0;
  for (const ch of chapters) {
    pageCount += (ch.segments || []).length;
  }

  sqlStatements.push(`INSERT OR REPLACE INTO books (id, title, author, category, subject, subject_name_urdu, grade, darja_key, darja_urdu, cover_color, cover_image, description, total_chapters, total_pages) VALUES (${escapeSql(b.id)}, ${escapeSql(b.title)}, ${escapeSql(b.author)}, ${escapeSql(b.category || 'kharji_kitab')}, ${escapeSql(b.subject)}, ${escapeSql(b.subjectNameUrdu)}, ${escapeSql(b.grade)}, ${escapeSql(b.darjaKey)}, ${escapeSql(b.darjaUrdu)}, ${escapeSql(b.coverColor)}, ${escapeSql(b.coverImage || null)}, ${escapeSql(b.description)}, ${chapters.length}, ${pageCount});`);
  bookCount++;

  for (let chIdx = 0; chIdx < chapters.length; chIdx++) {
    const ch = chapters[chIdx];
    const chId = ch.id || `${b.id}_ch_${chIdx}`;
    sqlStatements.push(`INSERT OR REPLACE INTO book_chapters (id, book_id, chapter_index, title_arabic, title_urdu) VALUES (${escapeSql(chId)}, ${escapeSql(b.id)}, ${chIdx}, ${escapeSql(ch.titleArabic)}, ${escapeSql(ch.titleUrdu)});`);
    chapterCount++;

    const segments = ch.segments || [];
    for (let segIdx = 0; segIdx < segments.length; segIdx++) {
      const seg = segments[segIdx];
      const segId = seg.id || `${chId}_seg_${segIdx}`;
      const mahalIraab = seg.mahalIraab ? JSON.stringify(seg.mahalIraab) : null;
      const hawashi = seg.hawashi ? JSON.stringify(seg.hawashi) : null;
      const translations = seg.translations ? JSON.stringify(seg.translations) : null;

      sqlStatements.push(`INSERT OR REPLACE INTO book_segments (id, chapter_id, book_id, segment_index, arabic_text, urdu_translation, tashreeh, mahal_iraab, hawashi, translations) VALUES (${escapeSql(segId)}, ${escapeSql(chId)}, ${escapeSql(b.id)}, ${segIdx}, ${escapeSql(seg.arabicText)}, ${escapeSql(seg.urduTranslation)}, ${escapeSql(seg.tashreeh)}, ${escapeSql(mahalIraab)}, ${escapeSql(hawashi)}, ${escapeSql(translations)});`);
      segmentCount++;
    }
  }
}

console.log(`Generated SQL for: ${bookCount} books, ${chapterCount} chapters, ${segmentCount} segments/pages.`);

fs.writeFileSync(
  path.join('C:', 'Users', 'CoreCom', 'OneDrive', 'Desktop', 'Antigravity', 'seed_books.sql'),
  sqlStatements.join('\n'),
  'utf8'
);
console.log('Saved seed_books.sql successfully.');
