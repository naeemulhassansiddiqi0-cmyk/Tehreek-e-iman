// ============================================================================
// تَحْرِيكِ إِيمَان — نِظَامُ الحِفْظِ غَيْرِ المُتَّصِلِ (OFFLINE INDEXEDDB STORAGE)
// سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی
// ============================================================================

import { Book } from '../types';

const DB_NAME = 'TehreekIman_OfflineLibrary';
const DB_VERSION = 1;
const STORE_NAME = 'books_cache';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface OfflineBookMeta {
  id: string;
  title: string;
  author: string;
  subjectNameUrdu: string;
  grade: string;
  savedAt: string;
  approxSizeKb: number;
}

/**
 * Save a complete book into local IndexedDB
 */
export async function saveBookOffline(book: Book): Promise<void> {
  const db = await openDB();
  const bookWithMeta = {
    ...book,
    savedAt: new Date().toLocaleDateString('ur-PK', { year: 'numeric', month: 'long', day: 'numeric' }),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(bookWithMeta);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove a book from local IndexedDB
 */
export async function removeBookOffline(bookId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(bookId);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Check if a book is saved offline
 */
export async function isBookSavedOffline(bookId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(bookId);

      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Get all books stored offline
 */
export async function getAllOfflineBooks(): Promise<Book[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Calculate total offline library storage usage
 */
export async function getOfflineStorageUsage(): Promise<{ count: number; approxBytes: number }> {
  try {
    const books = await getAllOfflineBooks();
    const str = JSON.stringify(books);
    return {
      count: books.length,
      approxBytes: new Blob([str]).size,
    };
  } catch {
    return { count: 0, approxBytes: 0 };
  }
}
