/**
 * src/services/fiqhFullTextService.ts
 * 
 * Provides dynamic and pre-loaded access to full Arabic matn and chapters
 * for Canonical Fiqh & Fatawa books (Fatawa Qazi Khan, Fatawa Alamgiri,
 * Al-Hidaya, Al-Mabsut, Badae al-Sanaye, Fath al-Qadir, Radd al-Muhtar, etc.)
 */

import { BookChapter, BookSegment } from '../types';

export interface FullTextPage {
  pageNumber: number;
  chapterTitle: string;
  arabicMatn: string;
}

export interface FullTextBookBundle {
  slug: string;
  title: string;
  author?: string;
  shamelaId: string;
  totalPages: number;
  totalChapters: number;
  updatedAt: string;
  pages: FullTextPage[];
}

export const FIQH_SLUG_MAP: Record<string, string> = {
  // Fatawa Qazi Khan
  'fatawa-qazi-khan': 'fatawa-qazi-khan',
  'kharji_lib_0489': 'fatawa-qazi-khan',
  'qazikhan': 'fatawa-qazi-khan',

  // Fatawa Alamgiri (Al-Hindiyyah)
  'fatawa-alamgiri': 'fatawa-alamgiri',
  'kharji_lib_0488': 'fatawa-alamgiri',
  'alamgiri': 'fatawa-alamgiri',

  // Al-Hidaya
  'al-hidaya': 'al-hidaya',
  'kharji_lib_0359': 'al-hidaya',
  'hidayah': 'al-hidaya',

  // Al-Mabsut Sarakhsi
  'al-mabsut-sarakhsi': 'al-mabsut-sarakhsi',
  'kharji_lib_0348': 'al-mabsut-sarakhsi',
  'mabsut': 'al-mabsut-sarakhsi',
  'kharji_mabsut_sarakhsi': 'al-mabsut-sarakhsi',

  // Badae al-Sanaye
  'badae-al-sanaye': 'badae-al-sanaye',
  'kharji_lib_0349': 'badae-al-sanaye',
  'badai_sanai': 'badae-al-sanaye',

  // Fath al-Qadir
  'fath-al-qadir': 'fath-al-qadir',
  'kharji_lib_0351': 'fath-al-qadir',
  'fath_al_qadir': 'fath-al-qadir',

  // Radd al-Muhtar (Fatawa Shami)
  'radd-al-muhtar': 'radd-al-muhtar',
  'kharji_lib_0354': 'radd-al-muhtar',
  'shami': 'radd-al-muhtar',

  // Mukhtasar al-Quduri
  'mukhtasar-al-quduri': 'mukhtasar-al-quduri',
  'quduri': 'mukhtasar-al-quduri',
  'kharji_lib_0350': 'mukhtasar-al-quduri',

  // Kanz al-Daqaiq
  'kanz-al-daqaiq': 'kanz-al-daqaiq',
  'kanz': 'kanz-al-daqaiq',
  'kharji_lib_0352': 'kanz-al-daqaiq',

  // Al-Durr al-Mukhtar
  'al-durr-al-mukhtar': 'al-durr-al-mukhtar',
  'kharji_lib_0353': 'al-durr-al-mukhtar'
};

// In-memory cache for loaded full text bundles
const fullTextCache = new Map<string, FullTextBookBundle>();

/**
 * Check if a book ID corresponds to an extended Fiqh/Fatawa book with full text
 */
export function hasFiqhFullText(bookId: string): boolean {
  return Boolean(FIQH_SLUG_MAP[bookId]);
}

/**
 * Get slug for book ID
 */
export function getFiqhFullTextSlug(bookId: string): string | null {
  return FIQH_SLUG_MAP[bookId] || null;
}

/**
 * Convert full text pages into structured BookChapters with pagination
 */
export function convertFullTextToChapters(bundle: FullTextBookBundle, _bookId?: string): BookChapter[] {
  if (!bundle.pages || bundle.pages.length === 0) return [];

  // Group pages by chapterTitle
  const chaptersMap = new Map<string, FullTextPage[]>();
  
  for (const page of bundle.pages) {
    const title = page.chapterTitle || 'الفصل';
    if (!chaptersMap.has(title)) {
      chaptersMap.set(title, []);
    }
    chaptersMap.get(title)!.push(page);
  }

  const chapters: BookChapter[] = [];
  let chIndex = 1;

  for (const [title, pages] of chaptersMap.entries()) {
    const segments: BookSegment[] = pages.map((p) => ({
      id: `${bundle.slug}_p${p.pageNumber}`,
      arabicText: p.arabicMatn,
      urduTranslation: `«${bundle.title} — ${p.chapterTitle} (صفحہ ${p.pageNumber})»\n\nاس صفحے میں متذکرہ فقہی مسائل و نصوصِ شرعیہ کی تفصیلات پیش کی گئی ہیں۔`,
      translations: {
        en: `${bundle.title} — Page ${p.pageNumber}: Detailed legal rulings and jurisprudential reasoning in authentic Islamic jurisprudence.`
      },
      tashreeh: `مأخوذ من المكتبة الشاملة (الرقم: ${bundle.shamelaId}) — ${bundle.title}، ${p.chapterTitle}، الصفحة ${p.pageNumber}.`,
      hawashi: [
        `المكتبة الشاملة، رقم الكتاب: ${bundle.shamelaId}`,
        `الصفحة: ${p.pageNumber}`
      ]
    }));

    chapters.push({
      id: `${bundle.slug}_ch_${chIndex}`,
      titleArabic: title,
      titleUrdu: `${title} (صفحات: ${pages[0].pageNumber} تا ${pages[pages.length - 1].pageNumber})`,
      segments
    });

    chIndex++;
  }

  return chapters;
}

/**
 * Fetch full text for a Fiqh book by its ID or slug
 */
export async function loadFiqhFullText(bookId: string): Promise<FullTextBookBundle | null> {
  const slug = getFiqhFullTextSlug(bookId);
  if (!slug) return null;

  if (fullTextCache.has(slug)) {
    return fullTextCache.get(slug)!;
  }

  try {
    const res = await fetch(`/data/books_full_text/${slug}.json`);
    if (!res.ok) {
      return null;
    }
    const data: FullTextBookBundle = await res.json();
    fullTextCache.set(slug, data);
    return data;
  } catch (err) {
    console.warn(`Could not load full text for fiqh book ${slug}:`, err);
    return null;
  }
}
