const fs = require('fs');

// Let's read musnadAhmadChapters from musnadAhmadData.ts
const code = fs.readFileSync('src/data/musnadAhmadData.ts', 'utf8');

// We simulate bookContentProvider for musnad-ahmad
const mockBook = {
  id: "musnad-ahmad",
  slug: "musnad-ahmad",
  title_ur: "مسند احمد بن حنبل",
  title_ar: "المسند للإمام أحمد بن حنبل",
  author: "امام احمد بن حنبل الشیبانی",
  death_year: 241,
  category: "Hadith",
  pages: 27647,
  volumes: 50,
  intro_ur: "دنیائے اسلام کا عظیم ترین حدیثی انسائیکلوپیڈیا",
  cover_url: "/images/books/musnad-ahmad.svg",
  source_type: "public"
};

// Check the file content of bookContentProvider.ts
const providerCode = fs.readFileSync('src/data/bookContentProvider.ts', 'utf8');

console.log('Provider imports musnadAhmadChapters:', providerCode.includes('import { musnadAhmadChapters }'));
console.log('Provider dispatches musnadAhmadChapters:', providerCode.includes("s.includes('musnad-ahmad')"));
