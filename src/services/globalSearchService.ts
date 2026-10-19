// Tehreek-e-Iman Global Search Engine (Phase 5)
// Indexes all 147 books, chapter headings, Hadith texts, translations, Darsi Tashreeh, and footnotes.
// Supports multi-lingual fuzzy matching (Arabic, Urdu, Roman Urdu), category filtering, and instant auto-suggestions.

import { allCatalogBooks, ModernBook, BookCategoryTitle } from '../data/publicDomainBooks';
import { booksDatabase } from '../data/booksData';

export type SearchCategoryFilter = 'all' | 'hadith' | 'tafseer' | 'fiqh' | 'aqeedah';

export interface GlobalSearchResult {
  id: string;
  bookId: string;
  bookSlug: string;
  bookTitleUr: string;
  bookTitleAr: string;
  author: string;
  category: 'Hadith' | 'Tafseer' | 'Fiqh' | 'Aqeedah' | 'Other';
  categoryUrdu: string;
  chapterTitle?: string;
  matchType: 'book' | 'chapter' | 'hadith' | 'translation' | 'tashreeh' | 'footnote';
  matchTypeUrdu: string;
  matchedTextSnippet: string;
  arabicText?: string;
  urduTranslation?: string;
  tashreehText?: string;
  footnoteText?: string;
  pageNumber?: number;
  segmentId?: string;
  sourceType: 'public' | 'external';
  externalLink?: string;
  score: number;
}

export interface SearchAutoSuggestion {
  text: string;
  type: 'topic' | 'book' | 'chapter' | 'author';
  typeUrdu: string;
  category: SearchCategoryFilter;
  categoryUrdu: string;
  bookSlug?: string;
  author?: string;
}

// 1. Text Normalization Utilities
export function stripTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').trim();
}

export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED‏]/g, '') // strip Arabic diacritics / tashkeel
    .replace(/[ـ]/g, '')                               // Tatweel
    .replace(/[أإآءٱ]/g, 'ا')
    .replace(/[يىئ]/g, 'ی')
    .replace(/[ةه]/g, 'ہ')
    .replace(/[ك]/g, 'ک')
    .replace(/[ڢف]/g, 'ف')
    .replace(/[ڧق]/g, 'ق')
    .replace(/[-_.,!?،؛:()[\]{}"'/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Roman Urdu to Arabic / Urdu Transliteration Map
const ROMAN_URDU_DICTIONARY: Record<string, string[]> = {
  namaz: ['نماز', 'صلوة', 'صلاة'],
  salah: ['صلاة', 'نماز'],
  salat: ['صلاة', 'صلوة'],
  roza: ['روزہ', 'صوم', 'صيام'],
  sawm: ['صوم', 'صيام', 'روزہ'],
  wuzu: ['وضو', 'طہور', 'طهارة'],
  wudu: ['وضو', 'طهور', 'طهارة'],
  taharat: ['طہارت', 'طهارة'],
  ghusl: ['غسل'],
  hajj: ['حج', 'احرام', 'طواف'],
  umrah: ['عمرہ', 'عمرة'],
  zakat: ['زکوٰۃ', 'زکاة', 'صدقہ'],
  zakah: ['زکوٰۃ', 'زکاة'],
  sadaqah: ['صدقہ', 'صدقة'],
  quran: ['القرآن', 'قرآن'],
  tafseer: ['تفسیر', 'تفسير'],
  tafsir: ['تفسیر', 'تفسير'],
  hadith: ['حدیث', 'حديث'],
  hadees: ['حدیث', 'حديث'],
  sunnah: ['سنت', 'سنة'],
  bukhari: ['بخاری', 'البخاري'],
  muslim: ['مسلم', 'صحیح مسلم'],
  tirmidhi: ['ترمذی', 'الترمذي'],
  tirmizi: ['ترمذی', 'الترمذي'],
  abudawood: ['ابو داود', 'أبو داود'],
  nasai: ['نسائی', 'النسائي'],
  ibnmajah: ['ابن ماجہ', 'ابن ماجه'],
  muwatta: ['موطا', 'الموطأ'],
  mishkat: ['مشکوۃ', 'مشكاة'],
  tahawi: ['طحاوی', 'الطحاوي'],
  fiqh: ['فقہ', 'فقه', 'احکام'],
  fatawa: ['فتاویٰ', 'فتاوى'],
  aqeedah: ['عقیدہ', 'عقيدة', 'توحید'],
  aqaid: ['عقائد', 'عقائدِ اہل سنت'],
  hidayah: ['ہدایہ', 'الهداية'],
  quduri: ['قدوری', 'القدوري'],
  kanz: ['کنز الدقائق', 'كنز'],
  nuranwar: ['نور الانوار', 'نور الأنوار'],
  kafiya: ['کافیہ', 'الكافية'],
  jamee: ['جامی', 'شرح جامی'],
  seerat: ['سیرت', 'سيرة'],
  eman: ['ایمان', 'إيمان'],
  iman: ['ایمان', 'إيمان'],
  tawheed: ['توحید', 'توحيد'],
  nikah: ['نکاح', 'نكاح'],
  talaq: ['طلاق', 'طلاق'],
  riba: ['سود', 'ربا'],
  sood: ['سود', 'ربا'],
  halal: ['حلال', 'طیب'],
  haram: ['حرام', 'ممنوع'],
  dua: ['دعا', 'دعاء', 'اذکار'],
  dhikr: ['ذکر', 'ذكر', 'تسبیح'],
  istighfar: ['استغفار', 'توبہ'],
  jihad: ['جہاد', 'جهاد'],
  adab: ['ادب', 'اخلاق', 'آداب'],
  akhlaq: ['اخلاق', 'أخلاق'],
};

// Expand user query using Roman Urdu dictionary if applicable
export function expandQueryTokens(query: string): string[] {
  const norm = normalizeSearchText(query);
  const words = norm.split(' ').filter(w => w.length > 0);
  const tokens = new Set<string>();

  for (const w of words) {
    tokens.add(w);
    // Check if word exists in Roman Urdu dictionary
    const lowerW = w.toLowerCase();
    if (ROMAN_URDU_DICTIONARY[lowerW]) {
      for (const eq of ROMAN_URDU_DICTIONARY[lowerW]) {
        tokens.add(normalizeSearchText(eq));
      }
    }
  }
  return Array.from(tokens);
}

// 2. Category Normalization Helper (maps various catalog categories to the 4 requested pillars)
export function mapToPrimaryCategory(category: BookCategoryTitle | string): 'Hadith' | 'Tafseer' | 'Fiqh' | 'Aqeedah' | 'Other' {
  const c = (category || '').toLowerCase();
  if (c.includes('hadith') || c.includes('حدیث') || c.includes('sittah')) {
    return 'Hadith';
  }
  if (c.includes('quran') || c.includes('tafseer') || c.includes('قرآن') || c.includes('تفسیر')) {
    return 'Tafseer';
  }
  if (c.includes('fiqh') || c.includes('فقہ') || c.includes('fatawa') || c.includes('فتاوی') || c.includes('usul') || c.includes('اصول')) {
    return 'Fiqh';
  }
  if (c.includes('aqeedah') || c.includes('عقائد') || c.includes('کلام') || c.includes('aqaid') || c.includes('tawheed')) {
    return 'Aqeedah';
  }
  return 'Other';
}

export function getCategoryUrduName(cat: 'Hadith' | 'Tafseer' | 'Fiqh' | 'Aqeedah' | 'Other'): string {
  switch (cat) {
    case 'Hadith': return 'حدیث شریف';
    case 'Tafseer': return 'القرآن والتفاسیر';
    case 'Fiqh': return 'فقہ و فتاویٰ';
    case 'Aqeedah': return 'عقائد و کلام';
    default: return 'سیرت، تاریخ و نصاب';
  }
}

// 3. Curated High-Frequency Islamic Topics for Auto-suggestions
export const CURATED_AUTO_SUGGESTIONS: SearchAutoSuggestion[] = [
  // Hadith
  { text: 'إنما الأعمال بالنيات', type: 'topic', typeUrdu: 'موضوعِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sahih-bukhari' },
  { text: 'بني الإسلام على خمس', type: 'topic', typeUrdu: 'موضوعِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sahih-bukhari' },
  { text: 'بدء الوحي في غار حراء', type: 'topic', typeUrdu: 'بابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sahih-bukhari' },
  { text: 'شعب الإيمان والحياء', type: 'topic', typeUrdu: 'موضوعِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sahih-bukhari' },
  { text: 'المسلم من سلم المسلمون', type: 'topic', typeUrdu: 'موضوعِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sahih-bukhari' },
  { text: 'صحیح البخاری', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sahih-bukhari', author: 'امام محمد بن اسماعیل بخاری' },
  { text: 'صحیح مسلم', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sahih-muslim', author: 'امام مسلم بن الحجاج' },
  { text: 'جامع الترمذی', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'jami-tirmizi', author: 'امام ابو عیسیٰ ترمذی' },
  { text: 'سنن ابی داود', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sunan-abu-daud', author: 'امام ابو داود سجستانی' },
  { text: 'سنن النسائی', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sunan-nasai', author: 'امام احمد بن شعیب نسائی' },
  { text: 'سنن ابن ماجہ', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'sunan-ibn-majah', author: 'امام ابن ماجہ قزوینی' },
  { text: 'موطأ الإمام مالك', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'muwatta-malik', author: 'امام مالک بن انس' },
  { text: 'مشکاة المصابیح', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'mishkat-masabih', author: 'خطیب تبریزی' },
  { text: 'مسند الإمام أحمد بن حنبل', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'musnad-ahmad', author: 'امام احمد بن حنبل' },
  { text: 'شرح معانی الآثار', type: 'book', typeUrdu: 'کتابِ حدیث', category: 'hadith', categoryUrdu: 'حدیث شریف', bookSlug: 'tahawi', author: 'امام ابو جعفر طحاوی' },
  
  // Tafseer
  { text: 'القرآن الکریم', type: 'book', typeUrdu: 'کلام اللہ', category: 'tafseer', categoryUrdu: 'القرآن والتفاسیر', bookSlug: 'quran', author: 'کلام اللہ جل جلالہ' },
  { text: 'تفسیر ابن کثیر', type: 'book', typeUrdu: 'تفسیرِ قرآن', category: 'tafseer', categoryUrdu: 'القرآن والتفاسیر', bookSlug: 'tafseer-ibn-katheer', author: 'علامہ ابن کثیر' },
  { text: 'تفسیر الجلالین', type: 'book', typeUrdu: 'تفسیرِ قرآن', category: 'tafseer', categoryUrdu: 'القرآن والتفاسیر', bookSlug: 'jalalayn', author: 'جلال الدین محلی و سیوطی' },
  { text: 'تفسیر القرطبی', type: 'book', typeUrdu: 'تفسیرِ قرآن', category: 'tafseer', categoryUrdu: 'القرآن والتفاسیر', bookSlug: 'tafseer-qurtubi', author: 'امام ابو عبد اللہ قرطبی' },
  { text: 'تفسیر الطبری', type: 'book', typeUrdu: 'تفسیرِ قرآن', category: 'tafseer', categoryUrdu: 'القرآن والتفاسیر', bookSlug: 'tafsir-tabari', author: 'ابن جریر طبری' },
  { text: 'تفسیر البیضاوی (أنوار التنزيل)', type: 'book', typeUrdu: 'تفسیرِ قرآن', category: 'tafseer', categoryUrdu: 'القرآن والتفاسیر', bookSlug: 'tafseer-baydawi', author: 'قاضی بیضاوی' },
  { text: 'اعراب القرآن الکریم', type: 'topic', typeUrdu: 'نحوی ترکیب', category: 'tafseer', categoryUrdu: 'القرآن والتفاسیر', bookSlug: 'quran' },
  { text: 'سورۂ فاتحہ کی تفسیر', type: 'topic', typeUrdu: 'موضوعِ تفسیر', category: 'tafseer', categoryUrdu: 'القرآن والتفاسیر', bookSlug: 'quran' },
  { text: 'آیۃ الکرسی کی فضیلت', type: 'topic', typeUrdu: 'موضوعِ تفسیر', category: 'tafseer', categoryUrdu: 'القرآن والتفاسیر', bookSlug: 'quran' },
  
  // Fiqh
  { text: 'الہدایۃ شرح بدایۃ المبتدی', type: 'book', typeUrdu: 'کتابِ فقہ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'hidayah', author: 'برہان الدین مرغینانی' },
  { text: 'مختصر القدوری', type: 'book', typeUrdu: 'کتابِ فقہ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'quduri', author: 'ابو الحسین احمد قدوری' },
  { text: 'کنز الدقائق', type: 'book', typeUrdu: 'کتابِ فقہ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'kanz', author: 'حافظ الدین نسفی' },
  { text: 'نور الإیضاح', type: 'book', typeUrdu: 'کتابِ فقہ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'nur-idah', author: 'حسن بن عمار شرنبلالی' },
  { text: 'فتاویٰ ہندیہ (عالمگیری)', type: 'book', typeUrdu: 'کتابِ فتاویٰ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'fatawa-alamgiri', author: 'علماءِ ہند بر قیادت شاہ اورنگزیب' },
  { text: 'رد المحتار (فتاویٰ شامی)', type: 'book', typeUrdu: 'کتابِ فتاویٰ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'fatawa-shami', author: 'علامہ ابن عابدین شامی' },
  { text: 'بدائع الصنائع فی ترتیب الشرائع', type: 'book', typeUrdu: 'کتابِ فقہ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'badai-sanai', author: 'امام علاء الدین کاسانی' },
  { text: 'نور الانوار فی شرح المنار', type: 'book', typeUrdu: 'اصولِ فقہ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'nuranwar', author: 'ملا جیون لکھنوی' },
  { text: 'اصول الشاشی', type: 'book', typeUrdu: 'اصولِ فقہ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'usul-shashi', author: 'نظام الدین شاشی' },
  { text: 'شرح الوقایہ', type: 'book', typeUrdu: 'کتابِ فقہ', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ', bookSlug: 'sharh-wiqayah', author: 'عبید اللہ بن مسعود صدر الشریعہ' },
  { text: 'نماز کے ارکان و فرائض', type: 'topic', typeUrdu: 'مسائلِ نماز', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ' },
  { text: 'وضو اور غسل کے احکام', type: 'topic', typeUrdu: 'طہارت', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ' },
  { text: 'زکوٰۃ کا نصاب اور مصارف', type: 'topic', typeUrdu: 'مالی احکام', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ' },
  { text: 'روزے کے شرائط اور کفارہ', type: 'topic', typeUrdu: 'مسائلِ صوم', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ' },
  { text: 'بیوع و تجارت کے احکام', type: 'topic', typeUrdu: 'معاملات', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ' },
  { text: 'نکاح اور طلاق کے شرعی مسائل', type: 'topic', typeUrdu: 'عائلی احکام', category: 'fiqh', categoryUrdu: 'فقہ و فتاویٰ' },
  
  // Aqeedah
  { text: 'العقيدة الطحاوية', type: 'book', typeUrdu: 'کتابِ عقائد', category: 'aqeedah', categoryUrdu: 'عقائد و کلام', bookSlug: 'aqeedah-tahawiyyah', author: 'امام ابو جعفر طحاوی' },
  { text: 'شرح العقائد النسفیة', type: 'book', typeUrdu: 'علم الکلام', category: 'aqeedah', categoryUrdu: 'عقائد و کلام', bookSlug: 'sharh-aqaid', author: 'علامہ سعد الدین تفتازانی' },
  { text: 'الفقہ الأکبر', type: 'book', typeUrdu: 'کتابِ عقائد', category: 'aqeedah', categoryUrdu: 'عقائد و کلام', bookSlug: 'fiqh-akbar', author: 'امام اعظم ابو حنیفہ' },
  { text: 'کتاب التوحید', type: 'book', typeUrdu: 'کتابِ عقائد', category: 'aqeedah', categoryUrdu: 'عقائد و کلام', bookSlug: 'kitab-tawheed', author: 'امام ابو منصور ماتریدی' },
  { text: 'عقائد اہل سنت و جماعت', type: 'topic', typeUrdu: 'اصولِ ایمان', category: 'aqeedah', categoryUrdu: 'عقائد و کلام' },
  { text: 'اثبات نبوت اور رسالت', type: 'topic', typeUrdu: 'کلامی بحث', category: 'aqeedah', categoryUrdu: 'عقائد و کلام' },
  { text: 'ختم نبوت ﷺ کے دلائل', type: 'topic', typeUrdu: 'ایمانی عقیدہ', category: 'aqeedah', categoryUrdu: 'عقائد و کلام' },
];

/**
 * Generates instant auto-suggestions as user types.
 */
export function getAutoSuggestions(query: string, categoryFilter: SearchCategoryFilter = 'all', limit: number = 8): SearchAutoSuggestion[] {
  if (!query || query.trim().length === 0) {
    // Return top curated suggestions for category
    if (categoryFilter === 'all') {
      return CURATED_AUTO_SUGGESTIONS.slice(0, limit);
    }
    return CURATED_AUTO_SUGGESTIONS.filter(s => s.category === categoryFilter).slice(0, limit);
  }

  const normQuery = normalizeSearchText(query);
  const queryTokens = expandQueryTokens(query);
  const suggestions: SearchAutoSuggestion[] = [];
  const seen = new Set<string>();

  // 1. Check curated list
  for (const item of CURATED_AUTO_SUGGESTIONS) {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) continue;
    const normText = normalizeSearchText(item.text);
    const hasMatch = normText.includes(normQuery) || queryTokens.some(t => normText.includes(t));
    if (hasMatch && !seen.has(item.text)) {
      seen.add(item.text);
      suggestions.push(item);
      if (suggestions.length >= limit) return suggestions;
    }
  }

  // 2. Search all 147 books by title & author for dynamic suggestion
  for (const b of allCatalogBooks) {
    const primaryCat = mapToPrimaryCategory(b.category);
    if (categoryFilter !== 'all' && primaryCat.toLowerCase() !== categoryFilter) continue;

    const normUr = normalizeSearchText(b.title_ur);
    const normAr = normalizeSearchText(b.title_ar);
    const normAuthor = normalizeSearchText(b.author);

    if (normUr.includes(normQuery) || normAr.includes(normQuery) || queryTokens.some(t => normUr.includes(t) || normAr.includes(t))) {
      if (!seen.has(b.title_ur)) {
        seen.add(b.title_ur);
        suggestions.push({
          text: b.title_ur,
          type: 'book',
          typeUrdu: 'کتاب',
          category: primaryCat.toLowerCase() as SearchCategoryFilter,
          categoryUrdu: getCategoryUrduName(primaryCat),
          bookSlug: b.slug,
          author: b.author
        });
        if (suggestions.length >= limit) return suggestions;
      }
    } else if (normAuthor.includes(normQuery) || queryTokens.some(t => normAuthor.includes(t))) {
      if (!seen.has(b.author)) {
        seen.add(b.author);
        suggestions.push({
          text: b.author,
          type: 'author',
          typeUrdu: 'مصنف',
          category: primaryCat.toLowerCase() as SearchCategoryFilter,
          categoryUrdu: getCategoryUrduName(primaryCat),
          bookSlug: b.slug
        });
        if (suggestions.length >= limit) return suggestions;
      }
    }
  }

  return suggestions;
}

/**
 * Highlight matched terms in text with clean styling
 */
export function createMatchSnippet(fullText: string, queryTokens: string[], maxLen: number = 140): string {
  if (!fullText) return '';
  const clean = fullText.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;

  // Find index of first matched token
  let matchIdx = -1;
  const normClean = normalizeSearchText(clean);
  for (const token of queryTokens) {
    if (token.length > 1) {
      const idx = normClean.indexOf(token);
      if (idx !== -1) {
        matchIdx = idx;
        break;
      }
    }
  }

  if (matchIdx === -1) {
    return clean.slice(0, maxLen) + '...';
  }

  const start = Math.max(0, matchIdx - 35);
  const end = Math.min(clean.length, start + maxLen);
  return (start > 0 ? '...' : '') + clean.slice(start, end) + (end < clean.length ? '...' : '');
}

/**
 * CORE SEARCH FUNCTION:
 * Deeply indexes and searches across all 147 books, chapter headings, Hadith texts, translations, Darsi Tashreeh, and footnotes.
 */
export function executeGlobalSearch(
  query: string,
  categoryFilter: SearchCategoryFilter = 'all',
  maxResults: number = 40
): GlobalSearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normQuery = normalizeSearchText(query);
  const queryTokens = expandQueryTokens(query);
  const results: GlobalSearchResult[] = [];
  const seenKey = new Set<string>();

  // =========================================================================
  // STAGE 1: Search Across Detailed BooksDatabase (Chapters, Hadiths, Footnotes)
  // =========================================================================
  for (const book of booksDatabase) {
    const primaryCat = mapToPrimaryCategory(book.category);
    if (categoryFilter !== 'all' && primaryCat.toLowerCase() !== categoryFilter) {
      continue;
    }

    const normBookTitle = normalizeSearchText(book.title);
    const normSubject = normalizeSearchText(book.subjectNameUrdu || '');
    const normAuthor = normalizeSearchText(book.author);

    // Book-level title/author match
    const isBookMatch = normBookTitle.includes(normQuery) || normSubject.includes(normQuery) || normAuthor.includes(normQuery) ||
      queryTokens.some(t => normBookTitle.includes(t) || normSubject.includes(t));

    if (isBookMatch) {
      const key = `book_${book.id}`;
      if (!seenKey.has(key)) {
        seenKey.add(key);
        results.push({
          id: key,
          bookId: book.id,
          bookSlug: book.id,
          bookTitleUr: book.subjectNameUrdu || book.title,
          bookTitleAr: book.title,
          author: book.author,
          category: primaryCat,
          categoryUrdu: getCategoryUrduName(primaryCat),
          matchType: 'book',
          matchTypeUrdu: 'کتاب و مصنف',
          matchedTextSnippet: book.description || `${book.title} — ${book.author}`,
          sourceType: 'public',
          score: 100
        });
      }
    }

    // Deep Chapter & Segment (Hadith, Translation, Tashreeh, Footnotes) Search
    if (book.chapters && book.chapters.length > 0) {
      for (const chapter of book.chapters) {
        const normChapAr = normalizeSearchText(chapter.titleArabic || '');
        const normChapUr = normalizeSearchText(chapter.titleUrdu || '');

        // Chapter title match
        if (normChapAr.includes(normQuery) || normChapUr.includes(normQuery) || queryTokens.some(t => normChapAr.includes(t) || normChapUr.includes(t))) {
          const key = `chap_${book.id}_${chapter.id}`;
          if (!seenKey.has(key)) {
            seenKey.add(key);
            results.push({
              id: key,
              bookId: book.id,
              bookSlug: book.id,
              bookTitleUr: book.subjectNameUrdu || book.title,
              bookTitleAr: book.title,
              author: book.author,
              category: primaryCat,
              categoryUrdu: getCategoryUrduName(primaryCat),
              chapterTitle: chapter.titleUrdu || chapter.titleArabic,
              matchType: 'chapter',
              matchTypeUrdu: 'باب و عنوان',
              matchedTextSnippet: `${chapter.titleUrdu} — ${chapter.titleArabic}`,
              sourceType: 'public',
              score: 85
            });
          }
        }

        // Segments within Chapter
        if (chapter.segments && chapter.segments.length > 0) {
          for (let segIdx = 0; segIdx < chapter.segments.length; segIdx++) {
            const seg = chapter.segments[segIdx];
            const normArabic = normalizeSearchText(seg.arabicText || '');
            const normUrdu = normalizeSearchText(seg.urduTranslation || '');
            const normTashreeh = normalizeSearchText(seg.tashreeh || '');
            const hawashiStr = (seg.hawashi || []).join(' ');
            const normHawashi = normalizeSearchText(hawashiStr);

            let matchType: 'hadith' | 'translation' | 'tashreeh' | 'footnote' | null = null;
            let matchSnippet = '';
            let score = 50;

            if (normArabic.includes(normQuery) || queryTokens.every(t => normArabic.includes(t))) {
              matchType = 'hadith';
              matchSnippet = createMatchSnippet(seg.arabicText, queryTokens);
              score = 95;
            } else if (normUrdu.includes(normQuery) || queryTokens.every(t => normUrdu.includes(t))) {
              matchType = 'translation';
              matchSnippet = createMatchSnippet(seg.urduTranslation, queryTokens);
              score = 90;
            } else if (normTashreeh.includes(normQuery) || queryTokens.every(t => normTashreeh.includes(t))) {
              matchType = 'tashreeh';
              matchSnippet = createMatchSnippet(seg.tashreeh, queryTokens);
              score = 80;
            } else if (normHawashi.includes(normQuery) || queryTokens.every(t => normHawashi.includes(t))) {
              matchType = 'footnote';
              matchSnippet = createMatchSnippet(hawashiStr, queryTokens);
              score = 75;
            } else if (queryTokens.some(t => normArabic.includes(t) || normUrdu.includes(t))) {
              matchType = normArabic.includes(queryTokens[0]) ? 'hadith' : 'translation';
              matchSnippet = createMatchSnippet(seg.urduTranslation || seg.arabicText, queryTokens);
              score = 65;
            }

            if (matchType) {
              const key = `seg_${book.id}_${chapter.id}_${seg.id}`;
              if (!seenKey.has(key)) {
                seenKey.add(key);
                results.push({
                  id: key,
                  bookId: book.id,
                  bookSlug: book.id,
                  bookTitleUr: book.subjectNameUrdu || book.title,
                  bookTitleAr: book.title,
                  author: book.author,
                  category: primaryCat,
                  categoryUrdu: getCategoryUrduName(primaryCat),
                  chapterTitle: chapter.titleUrdu || chapter.titleArabic,
                  segmentId: seg.id,
                  pageNumber: segIdx + 1,
                  matchType,
                  matchTypeUrdu: matchType === 'hadith' ? 'عربی متن و حدیث' :
                                 matchType === 'translation' ? 'اردو ترجمہ' :
                                 matchType === 'tashreeh' ? 'درسی تشریح و فقہ' : 'حواشی و تخریج',
                  matchedTextSnippet: matchSnippet,
                  arabicText: seg.arabicText,
                  urduTranslation: seg.urduTranslation,
                  tashreehText: seg.tashreeh,
                  footnoteText: hawashiStr,
                  sourceType: 'public',
                  score
                });
              }
            }
          }
        }
      }
    }
  }

  // =========================================================================
  // STAGE 2: Search Across All 147 Books Catalog (Public Domain & Modern)
  // =========================================================================
  for (const b of allCatalogBooks) {
    const primaryCat = mapToPrimaryCategory(b.category);
    if (categoryFilter !== 'all' && primaryCat.toLowerCase() !== categoryFilter) {
      continue;
    }

    const normUr = normalizeSearchText(b.title_ur);
    const normAr = normalizeSearchText(b.title_ar);
    const normAuthor = normalizeSearchText(b.author);
    const normIntro = normalizeSearchText(b.intro_ur || '');
    const normSlug = normalizeSearchText(b.slug.replace(/[-_]/g, ' '));

    let isMatch = false;
    let matchSnippet = b.intro_ur || `${b.title_ur} (${b.author})`;
    let score = 40;

    if (normUr.includes(normQuery) || normAr.includes(normQuery) || normSlug.includes(normQuery)) {
      isMatch = true;
      score = 98;
    } else if (normAuthor.includes(normQuery)) {
      isMatch = true;
      score = 88;
      matchSnippet = `مصنف: ${b.author} — ${b.title_ur}`;
    } else if (normIntro.includes(normQuery) || queryTokens.every(t => normIntro.includes(t))) {
      isMatch = true;
      score = 70;
      matchSnippet = createMatchSnippet(b.intro_ur, queryTokens);
    } else if (queryTokens.some(t => normUr.includes(t) || normAr.includes(t))) {
      isMatch = true;
      score = 60;
    }

    if (isMatch) {
      const key = `catalog_${b.id || b.slug}`;
      if (!seenKey.has(key)) {
        seenKey.add(key);
        results.push({
          id: key,
          bookId: b.id || b.slug,
          bookSlug: b.slug,
          bookTitleUr: b.title_ur,
          bookTitleAr: b.title_ar,
          author: b.author,
          category: primaryCat,
          categoryUrdu: getCategoryUrduName(primaryCat),
          matchType: 'book',
          matchTypeUrdu: 'کتاب و مصنف',
          matchedTextSnippet: matchSnippet,
          sourceType: b.source_type,
          externalLink: (b as ModernBook).external_link,
          score
        });
      }
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}
