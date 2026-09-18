/**
 * Tehreek-e-Imaan Book Auto-Fetcher Service
 * Searches Maktaba Shamela, Waqfeya, Islam 360, Archive.org, Open Library, and Google Books
 * for Islamic classical & modern books, interactive digital text, and direct PDF downloads.
 */

export interface AutoFetchResult {
  found: boolean;
  source?: 'shamela' | 'waqfeya' | 'islam360' | 'archive.org' | 'openlibrary' | 'googlebooks';
  sourceNameUrdu?: string;
  title?: string;
  author?: string;
  description?: string;
  coverImage?: string;
  pdfUrl?: string;
  shamelaUrl?: string;
  islam360Url?: string;
  message: string;
  details?: {
    identifier?: string;
    fileSize?: string;
    format?: string;
    pageCount?: number;
    shamelaId?: string;
  };
}

/**
 * Clean and normalize search query for Islamic Arabic/Urdu titles
 */
export function cleanSearchQuery(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[«»""''()\[\]{}،؛:؟!?]/g, ' ')
    // Remove Arabic/Urdu diacritics (harakat, tashkeel, tanween, dagger alif, etc.)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // Normalize Alef variations
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize Yeh/Alef Maksura
    .replace(/[ىي]/g, 'ي')
    // Normalize Teh Marbuta
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect Islam 360 URL based on Islamic title (Quran, Tafseer, Hadith collections)
 */
export function resolveIslam360Url(title: string): string {
  const norm = cleanSearchQuery(title).toLowerCase();
  
  if (norm.includes('قران') || norm.includes('تفسير') || norm.includes('فاتحه') || norm.includes('بقره') || norm.includes('جلالين')) {
    return 'https://theislam360.com/quran';
  }
  
  if (
    norm.includes('بخاري') || 
    norm.includes('مسلم') || 
    norm.includes('ترمذي') || 
    norm.includes('ابو داود') || 
    norm.includes('داود') || 
    norm.includes('نسائي') || 
    norm.includes('ابن ماجه') || 
    norm.includes('مشكاة') || 
    norm.includes('موطا') || 
    norm.includes('احمد') || 
    norm.includes('طحاوي') ||
    norm.includes('حديث')
  ) {
    return 'https://theislam360.com/hadith';
  }

  return `https://theislam360.com/?s=${encodeURIComponent(norm)}`;
}

/**
 * 1. Search Maktaba Shamela (المكتبة الشاملة - shamela.ws)
 * Checks through Netlify proxy (in browser) or direct URL (in Node/backend)
 */
export async function searchMaktabaShamela(query: string, author?: string): Promise<{
  found: boolean;
  shamelaId?: string;
  shamelaUrl?: string;
  title?: string;
  author?: string;
} | null> {
  try {
    const cleaned = cleanSearchQuery(query);
    if (!cleaned) return null;

    // Use relative Netlify proxy if window exists, otherwise direct shamela URL
    const isBrowser = typeof window !== 'undefined';
    const baseUrl = isBrowser ? '/api/shamela/' : 'https://shamela.ws/';
    const searchUrl = `${baseUrl}ajax/books/?term=${encodeURIComponent(cleaned)}`;

    const res = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!res.ok) return null;

    const data = await res.json();
    const items = data?.results?.items || [];
    
    // Filter out generic header items (e.g. id = -1 "جميع الكتب")
    const validItems = items.filter((item: any) => item.id && item.id !== '-1' && item.id !== -1);
    if (validItems.length === 0) return null;

    // Find best match
    const best = validItems[0];
    const shamelaId = String(best.id);
    const shamelaUrl = `https://shamela.ws/book/${shamelaId}`;

    return {
      found: true,
      shamelaId,
      shamelaUrl,
      title: best.text || query,
      author: author || ''
    };
  } catch (err) {
    console.warn('searchMaktabaShamela error:', err);
    return null;
  }
}

/**
 * 2. Search Waqfeya & Islamic Collections on Archive.org
 * Prioritizes collection:waqfya, collection:waqfeya, collection:shamela, collection:alfirdwsiy2018
 */
export async function searchWaqfeyaAndIslamicCollections(query: string, author?: string): Promise<AutoFetchResult | null> {
  try {
    const cleaned = cleanSearchQuery(query);
    if (!cleaned) return null;

    // Targeted Islamic collections query
    const qIslamic = `(title:("${cleaned}") OR description:("${cleaned}")) AND mediatype:(texts) AND (collection:(waqfya OR waqfeya OR shamela OR alfirdwsiy2018 OR islamic-library) OR subject:("المكتبة الوقفية" OR "المكتبة الشاملة" OR "فقه" OR "حديث"))`;
    const searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(qIslamic)}&fl[]=identifier,title,creator,collection,description,year&sort[]=downloads+desc&rows=4&output=json`;

    const res = await fetch(searchUrl);
    if (!res.ok) return null;

    const data = await res.json();
    const docs = data?.response?.docs || [];
    if (docs.length === 0) return null;

    for (const doc of docs) {
      const identifier = doc.identifier;
      if (!identifier) continue;

      try {
        const metaUrl = `https://archive.org/metadata/${identifier}/files`;
        const metaRes = await fetch(metaUrl);
        if (!metaRes.ok) continue;

        const metaData = await metaRes.json();
        const files: any[] = metaData?.result || [];

        const pdfFile = files.find(f => 
          f.name && 
          f.name.toLowerCase().endsWith('.pdf') && 
          !f.name.toLowerCase().includes('_thumb') &&
          !f.name.toLowerCase().includes('_jp2')
        );

        if (pdfFile) {
          const directPdfUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(pdfFile.name)}`;
          const coverImgUrl = `https://archive.org/services/img/${identifier}`;
          const isWaqfeya = JSON.stringify(doc.collection || '').toLowerCase().includes('waqf');

          return {
            found: true,
            source: isWaqfeya ? 'waqfeya' : 'archive.org',
            sourceNameUrdu: isWaqfeya ? 'المكتبة الوقفية (Waqfeya)' : 'الأرشيف الإسلامي العام (Archive.org)',
            title: doc.title || query,
            author: doc.creator || author || '',
            description: Array.isArray(doc.description) ? doc.description.join(' ') : (doc.description || ''),
            coverImage: coverImgUrl,
            pdfUrl: directPdfUrl,
            message: isWaqfeya 
              ? 'کتاب المكتبة الوقفية سے مل گئی اور محفوظ ہو گئی ہے' 
              : 'کتاب معتبر اسلامی آرکائیو سے مل گئی اور محفوظ ہو گئی ہے',
            details: {
              identifier,
              fileSize: pdfFile.size ? `${(parseInt(pdfFile.size, 10) / (1024 * 1024)).toFixed(1)} MB` : undefined,
              format: 'PDF'
            }
          };
        }
      } catch (e) {
        console.warn('Error checking Waqfeya/Islamic files for', identifier, e);
      }
    }

    return null;
  } catch (err) {
    console.warn('searchWaqfeyaAndIslamicCollections error:', err);
    return null;
  }
}

/**
 * 3. Search Internet Archive (Archive.org general)
 */
export async function searchArchiveOrg(query: string, author?: string): Promise<AutoFetchResult | null> {
  try {
    const cleaned = cleanSearchQuery(query);
    if (!cleaned) return null;

    let qParam = `title:(${cleaned}) AND mediatype:(texts)`;
    if (author && author.trim()) {
      const cleanedAuthor = cleanSearchQuery(author);
      qParam += ` OR creator:(${cleanedAuthor})`;
    }

    const searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(qParam)}&fl[]=identifier,title,creator,description,year,mediatype&sort[]=&rows=4&page=1&output=json`;

    const res = await fetch(searchUrl);
    if (!res.ok) return null;

    const data = await res.json();
    const docs = data?.response?.docs || [];
    if (docs.length === 0) return null;

    for (const doc of docs) {
      const identifier = doc.identifier;
      if (!identifier) continue;

      try {
        const metaUrl = `https://archive.org/metadata/${identifier}/files`;
        const metaRes = await fetch(metaUrl);
        if (!metaRes.ok) continue;

        const metaData = await metaRes.json();
        const files: any[] = metaData?.result || [];

        const pdfFile = files.find(f => 
          f.name && 
          f.name.toLowerCase().endsWith('.pdf') && 
          !f.name.toLowerCase().includes('_thumb') &&
          !f.name.toLowerCase().includes('_jp2')
        );

        if (pdfFile) {
          const directPdfUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(pdfFile.name)}`;
          const coverImgUrl = `https://archive.org/services/img/${identifier}`;
          
          return {
            found: true,
            source: 'archive.org',
            sourceNameUrdu: 'انٹرنیٹ آرکائیو (Archive.org)',
            title: doc.title || query,
            author: doc.creator || author || '',
            description: Array.isArray(doc.description) ? doc.description.join(' ') : (doc.description || ''),
            coverImage: coverImgUrl,
            pdfUrl: directPdfUrl,
            message: 'کتاب انٹرنیٹ سے مل گئی اور محفوظ ہو گئی ہے',
            details: {
              identifier,
              fileSize: pdfFile.size ? `${(parseInt(pdfFile.size, 10) / (1024 * 1024)).toFixed(1)} MB` : undefined,
              format: 'PDF'
            }
          };
        }
      } catch (err) {
        console.warn('Error checking Archive.org files for', identifier, err);
      }
    }

    return null;
  } catch (e) {
    console.warn('searchArchiveOrg error:', e);
    return null;
  }
}

/**
 * 4. Search Open Library API
 */
export async function searchOpenLibrary(query: string, author?: string): Promise<AutoFetchResult | null> {
  try {
    const cleaned = cleanSearchQuery(query);
    let url = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleaned)}&limit=3`;
    if (author && author.trim()) {
      url += `&author=${encodeURIComponent(cleanSearchQuery(author))}`;
    }

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const docs = data?.docs;
    if (!docs || docs.length === 0) return null;

    for (const doc of docs) {
      if (doc.ia && Array.isArray(doc.ia) && doc.ia.length > 0) {
        const iaId = doc.ia[0];
        const coverImg = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : `https://archive.org/services/img/${iaId}`;
        const pdfUrl = `https://archive.org/download/${iaId}/${iaId}.pdf`;

        return {
          found: true,
          source: 'openlibrary',
          sourceNameUrdu: 'اوپن لائبریری (Open Library)',
          title: doc.title || query,
          author: (doc.author_name && doc.author_name[0]) || author || '',
          description: typeof doc.first_sentence === 'string' ? doc.first_sentence : '',
          coverImage: coverImg,
          pdfUrl,
          message: 'کتاب انٹرنیٹ سے مل گئی اور محفوظ ہو گئی ہے',
          details: {
            identifier: iaId,
            format: 'PDF'
          }
        };
      }
    }

    return null;
  } catch (e) {
    console.warn('searchOpenLibrary error:', e);
    return null;
  }
}

/**
 * 5. Search Google Books API
 */
export async function searchGoogleBooks(query: string, author?: string): Promise<AutoFetchResult | null> {
  try {
    const cleaned = cleanSearchQuery(query);
    let q = `intitle:${cleaned}`;
    if (author && author.trim()) {
      q += `+inauthor:${cleanSearchQuery(author)}`;
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=3`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const items = data?.items;
    if (!items || items.length === 0) return null;

    for (const item of items) {
      const vol = item.volumeInfo || {};
      const access = item.accessInfo || {};
      const pdf = access.pdf || {};

      const pdfUrl = pdf.downloadLink || pdf.acsTokenLink || access.webReaderLink;
      const thumbnail = vol.imageLinks?.thumbnail || vol.imageLinks?.smallThumbnail;

      if (pdfUrl || (vol.title && thumbnail)) {
        return {
          found: true,
          source: 'googlebooks',
          sourceNameUrdu: 'گوگل بکس (Google Books)',
          title: vol.title || query,
          author: (vol.authors && vol.authors[0]) || author || '',
          description: vol.description || '',
          coverImage: thumbnail ? thumbnail.replace('http://', 'https://') : undefined,
          pdfUrl: pdfUrl || undefined,
          message: 'کتاب انٹرنیٹ سے مل گئی اور محفوظ ہو گئی ہے',
          details: {
            identifier: item.id,
            pageCount: vol.pageCount
          }
        };
      }
    }

    return null;
  } catch (e) {
    console.warn('searchGoogleBooks error:', e);
    return null;
  }
}

/**
 * Master Book Auto-Fetcher Function
 * Pipeline:
 * 1. Waqfeya & Classical Islamic Collections (direct PDF)
 * 2. Maktaba Shamela (shamela.ws reading link & metadata)
 * 3. Islam 360 (Quran & Hadith portal link)
 * 4. Archive.org General
 * 5. Open Library & Google Books
 */
export async function autoFetchBookFromInternet(title: string, author?: string): Promise<AutoFetchResult> {
  if (!title || title.trim().length < 2) {
    return {
      found: false,
      message: 'برائے مہربانی پہلے کتاب کا نام درج فرمائیں۔'
    };
  }

  // Generate Islam360 reference URL
  const islam360Url = resolveIslam360Url(title);

  // 1. Try Waqfeya & Islamic Collections first (best source for scanned Arabic PDFs)
  const waqfeyaResult = await searchWaqfeyaAndIslamicCollections(title, author);

  // 2. Try Maktaba Shamela for official digital library listing
  const shamelaResult = await searchMaktabaShamela(title, author);

  // If Waqfeya found a PDF
  if (waqfeyaResult && waqfeyaResult.pdfUrl) {
    return {
      ...waqfeyaResult,
      shamelaUrl: shamelaResult?.shamelaUrl,
      islam360Url,
      source: 'waqfeya',
      sourceNameUrdu: 'المكتبة الوقفية و ذخائر التراث',
      message: shamelaResult?.shamelaUrl 
        ? 'کتاب المكتبة الوقفية اور المكتبة الشاملة سے حاصل ہو گئی ہے' 
        : 'کتاب المكتبة الوقفية سے مل گئی اور محفوظ ہو گئی ہے'
    };
  }

  // 3. If Shamela matched
  if (shamelaResult && shamelaResult.found) {
    // Check if general archive has a PDF
    const archiveResult = await searchArchiveOrg(title, author);
    if (archiveResult && archiveResult.pdfUrl) {
      return {
        ...archiveResult,
        shamelaUrl: shamelaResult.shamelaUrl,
        islam360Url,
        source: 'shamela',
        sourceNameUrdu: 'المكتبة الشاملة (Shamela)',
        message: 'کتاب المكتبة الشاملة سے مل گئی اور محفوظ ہو گئی ہے'
      };
    }

    // Return Shamela digital reference even without PDF
    return {
      found: true,
      source: 'shamela',
      sourceNameUrdu: 'المكتبة الشاملة (Shamela.ws)',
      title: shamelaResult.title || title,
      author: shamelaResult.author || author || '',
      shamelaUrl: shamelaResult.shamelaUrl,
      islam360Url,
      message: 'کتاب کا نسخہ المكتبة الشاملة سے مل گیا اور محفوظ ہو گیا ہے',
      details: {
        shamelaId: shamelaResult.shamelaId
      }
    };
  }

  // 4. Try general Archive.org
  const archiveResult = await searchArchiveOrg(title, author);
  if (archiveResult && archiveResult.pdfUrl) {
    return {
      ...archiveResult,
      islam360Url,
      sourceNameUrdu: 'الأرشيف الإسلامي (Internet Archive)'
    };
  }

  // 5. Try Open Library
  const openLibResult = await searchOpenLibrary(title, author);
  if (openLibResult && openLibResult.pdfUrl) {
    return {
      ...openLibResult,
      islam360Url
    };
  }

  // 6. Try Google Books
  const googleResult = await searchGoogleBooks(title, author);
  if (googleResult && (googleResult.pdfUrl || googleResult.coverImage)) {
    return {
      ...googleResult,
      islam360Url
    };
  }

  // If no PDF found, but Islam 360 applies for Quran/Hadith
  if (islam360Url && (islam360Url.includes('/quran') || islam360Url.includes('/hadith'))) {
    return {
      found: true,
      source: 'islam360',
      sourceNameUrdu: 'اسلام 360 (Islam 360)',
      title,
      author: author || '',
      islam360Url,
      message: 'کتاب اسلام 360 کے ذخیرۂ حدیث و قرآن سے منسلک کر دی گئی ہے'
    };
  }

  // If not found anywhere on internet
  return {
    found: false,
    message: 'یہ کتاب انٹرنیٹ پر نہیں ملی، براہِ مہربانی PDF اپ لوڈ کریں'
  };
}

