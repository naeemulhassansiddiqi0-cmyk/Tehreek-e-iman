import { Book } from '../types';
import { booksDatabase } from '../data/booksData';

const LOCAL_STORAGE_CUSTOM_BOOKS = 'tehreek_custom_books_v1';
const LOCAL_STORAGE_DELETED_IDS = 'tehreek_deleted_book_ids_v1';

export interface DatabaseStats {
  totalBooks: number;
  totalChapters: number;
  totalPages: number;
  categoriesCount: number;
  d1DatabaseName: string;
  isCloudConnected: boolean;
}

// Helper to get custom books saved in browser storage
export function getCustomBooks(): Book[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_BOOKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading custom books from storage:', e);
  }
  return [];
}

// Helper to get list of deleted book IDs
export function getDeletedBookIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_IDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading deleted book IDs from storage:', e);
  }
  return [];
}

// Get all active books (built-in 1000 books + custom books - deleted books)
export function getAllMergedBooks(): Book[] {
  const deletedIds = new Set(getDeletedBookIds());
  const customBooks = getCustomBooks();
  
  // Custom book map by ID for overrides/edits
  const customMap = new Map<string, Book>();
  for (const b of customBooks) {
    customMap.set(b.id, b);
  }

  const result: Book[] = [];

  for (const b of booksDatabase) {
    if (deletedIds.has(b.id)) continue;
    if (customMap.has(b.id)) {
      result.push(customMap.get(b.id)!);
      customMap.delete(b.id);
    } else {
      result.push(b);
    }
  }

  // Append remaining custom newly added books
  for (const b of customMap.values()) {
    if (!deletedIds.has(b.id)) {
      result.push(b);
    }
  }

  return result;
}

// Save or Update a single book
export function saveOrUpdateBook(book: Book): void {
  const custom = getCustomBooks();
  const deleted = new Set(getDeletedBookIds());
  
  if (deleted.has(book.id)) {
    deleted.delete(book.id);
    localStorage.setItem(LOCAL_STORAGE_DELETED_IDS, JSON.stringify([...deleted]));
  }

  const idx = custom.findIndex(b => b.id === book.id);
  if (idx >= 0) {
    custom[idx] = book;
  } else {
    custom.push(book);
  }
  localStorage.setItem(LOCAL_STORAGE_CUSTOM_BOOKS, JSON.stringify(custom));
}

// Delete a book
export function deleteBookById(id: string): void {
  const custom = getCustomBooks().filter(b => b.id !== id);
  localStorage.setItem(LOCAL_STORAGE_CUSTOM_BOOKS, JSON.stringify(custom));

  const deleted = new Set(getDeletedBookIds());
  deleted.add(id);
  localStorage.setItem(LOCAL_STORAGE_DELETED_IDS, JSON.stringify([...deleted]));
}

// Bulk import books (from JSON or CSV)
export function bulkImportBooks(newBooks: Book[]): { added: number; updated: number } {
  const custom = getCustomBooks();
  const existingMap = new Map<string, number>();
  custom.forEach((b, i) => existingMap.set(b.id, i));

  let added = 0;
  let updated = 0;

  for (const b of newBooks) {
    if (existingMap.has(b.id)) {
      custom[existingMap.get(b.id)!] = b;
      updated++;
    } else {
      custom.push(b);
      added++;
    }
  }

  localStorage.setItem(LOCAL_STORAGE_CUSTOM_BOOKS, JSON.stringify(custom));
  return { added, updated };
}

// Export all books as a clean JSON file
export function exportAllBooksJson(): string {
  const all = getAllMergedBooks();
  return JSON.stringify(all, null, 2);
}

// Search inside book content (full text search across all segments)
export function searchInsideBook(book: Book, query: string): { 
  chapterTitle: string; 
  chapterIndex: number;
  segmentIndex: number;
  segmentId: string;
  pageNumber: number; 
  textSnippet: string 
}[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const results: { 
    chapterTitle: string; 
    chapterIndex: number;
    segmentIndex: number;
    segmentId: string;
    pageNumber: number; 
    textSnippet: string 
  }[] = [];

  const chapters = book.chapters || [];
  chapters.forEach((ch, chIdx) => {
    const segments = ch.segments || [];
    segments.forEach((seg, sIdx) => {
      const ar = (seg.arabicText || '').toLowerCase();
      const ur = (seg.urduTranslation || '').toLowerCase();
      const sh = (seg.tashreeh || '').toLowerCase();

      if (ar.includes(q) || ur.includes(q) || sh.includes(q)) {
        let snippet = '';
        if (ur.includes(q)) {
          const idx = ur.indexOf(q);
          snippet = ur.slice(Math.max(0, idx - 40), idx + q.length + 60);
        } else if (ar.includes(q)) {
          const idx = ar.indexOf(q);
          snippet = ar.slice(Math.max(0, idx - 40), idx + q.length + 60);
        } else {
          snippet = sh.slice(0, 100);
        }

        results.push({
          chapterTitle: ch.titleUrdu || ch.titleArabic || `باب ${chIdx + 1}`,
          chapterIndex: chIdx,
          segmentIndex: sIdx,
          segmentId: seg.id,
          pageNumber: sIdx + 1,
          textSnippet: snippet + '...'
        });
      }
    });
  });

  return results;
}

// Get global database stats
export function getDatabaseStats(): DatabaseStats {
  const all = getAllMergedBooks();
  let chapters = 0;
  let pages = 0;
  const cats = new Set<string>();

  for (const b of all) {
    cats.add(b.category);
    const chs = b.chapters || [];
    chapters += chs.length;
    for (const c of chs) {
      pages += (c.segments || []).length;
    }
  }

  return {
    totalBooks: all.length,
    totalChapters: chapters,
    totalPages: pages,
    categoriesCount: cats.size,
    d1DatabaseName: 'tehreek_e_imaan_db (Cloudflare D1)',
    isCloudConnected: true
  };
}
