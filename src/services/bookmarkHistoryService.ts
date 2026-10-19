export interface ReadingHistoryEntry {
  bookSlug: string;
  bookTitle: string;
  category?: string;
  pageNumber: number; // 1-based page number
  totalSections: number;
  chapterTitle?: string;
  previewText?: string;
  scrollPosition?: number;
  lastReadAt: number; // timestamp in ms
  progressPercent?: number; // 0 - 100
}

export interface BookmarkEntry {
  id: string; // e.g. "bm-quran-p1"
  bookSlug: string;
  bookTitle: string;
  pageNumber: number; // 1-based
  chapterTitle?: string;
  snippet?: string;
  createdAt: number;
}

const HISTORY_KEY = 'tehreek_reading_history_list';
const LAST_READ_KEY = 'tehreek_last_read_entry';
const BOOKMARKS_KEY = 'tehreek_user_bookmarks';
const MAX_HISTORY_ITEMS = 25;

/* -------------------------------------------------------------------------- */
/*                          READING HISTORY FUNCTIONS                         */
/* -------------------------------------------------------------------------- */

export function saveReadingHistory(entry: Omit<ReadingHistoryEntry, 'lastReadAt' | 'progressPercent'> & { progressPercent?: number }): void {
  if (typeof window === 'undefined' || !entry.bookSlug) return;

  try {
    const total = Math.max(1, entry.totalSections || 1);
    const page = Math.max(1, entry.pageNumber || 1);
    const progressPercent = entry.progressPercent ?? Math.min(100, Math.round((page / total) * 100));

    const completeEntry: ReadingHistoryEntry = {
      ...entry,
      pageNumber: page,
      totalSections: total,
      progressPercent,
      lastReadAt: Date.now()
    };

    // 1. Save single last-read shortcut
    localStorage.setItem(LAST_READ_KEY, JSON.stringify(completeEntry));

    // 2. Update multi-book history list
    const existingList = getReadingHistory();
    const filtered = existingList.filter(item => item.bookSlug !== entry.bookSlug);
    const updatedList = [completeEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedList));

    // 3. Dispatch reactive custom event
    window.dispatchEvent(new CustomEvent('tehreek_history_updated', { detail: completeEntry }));
  } catch (err) {
    console.warn('Failed to save reading history:', err);
  }
}

export function getReadingHistory(): ReadingHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getLastRead(): ReadingHistoryEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function removeReadingHistoryItem(bookSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getReadingHistory().filter(item => item.bookSlug !== bookSlug);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));

    const last = getLastRead();
    if (last && last.bookSlug === bookSlug) {
      if (list.length > 0) {
        localStorage.setItem(LAST_READ_KEY, JSON.stringify(list[0]));
      } else {
        localStorage.removeItem(LAST_READ_KEY);
      }
    }
    window.dispatchEvent(new CustomEvent('tehreek_history_updated'));
  } catch (err) {
    console.warn('Failed to remove history item:', err);
  }
}

export function clearReadingHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(LAST_READ_KEY);
    window.dispatchEvent(new CustomEvent('tehreek_history_updated'));
  } catch (err) {
    console.warn('Failed to clear reading history:', err);
  }
}

/* -------------------------------------------------------------------------- */
/*                             BOOKMARK FUNCTIONS                             */
/* -------------------------------------------------------------------------- */

export function getBookmarks(): BookmarkEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function isBookmarked(bookSlug: string, pageNumber: number): boolean {
  if (typeof window === 'undefined' || !bookSlug) return false;
  const list = getBookmarks();
  return list.some(bm => bm.bookSlug === bookSlug && bm.pageNumber === pageNumber);
}

export function addBookmark(bookmark: Omit<BookmarkEntry, 'id' | 'createdAt'>): BookmarkEntry {
  const list = getBookmarks();
  const existing = list.find(bm => bm.bookSlug === bookmark.bookSlug && bm.pageNumber === bookmark.pageNumber);
  if (existing) return existing;

  const newBm: BookmarkEntry = {
    ...bookmark,
    id: `bm-${bookmark.bookSlug}-p${bookmark.pageNumber}-${Date.now()}`,
    createdAt: Date.now()
  };

  const updated = [newBm, ...list];
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    // Also update legacy single-key compatibility
    localStorage.setItem(`tehreek_bm_${bookmark.bookSlug}_p${bookmark.pageNumber}`, 'true');
    window.dispatchEvent(new CustomEvent('tehreek_bookmarks_updated', { detail: newBm }));
  } catch (err) {
    console.warn('Failed to add bookmark:', err);
  }
  return newBm;
}

export function removeBookmark(bookSlug: string, pageNumber: number): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getBookmarks();
    const updated = list.filter(bm => !(bm.bookSlug === bookSlug && bm.pageNumber === pageNumber));
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    localStorage.setItem(`tehreek_bm_${bookSlug}_p${pageNumber}`, 'false');
    window.dispatchEvent(new CustomEvent('tehreek_bookmarks_updated'));
  } catch (err) {
    console.warn('Failed to remove bookmark:', err);
  }
}

export function toggleBookmark(bookmark: Omit<BookmarkEntry, 'id' | 'createdAt'>): boolean {
  if (isBookmarked(bookmark.bookSlug, bookmark.pageNumber)) {
    removeBookmark(bookmark.bookSlug, bookmark.pageNumber);
    return false;
  } else {
    addBookmark(bookmark);
    return true;
  }
}

export function clearAllBookmarks(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
    window.dispatchEvent(new CustomEvent('tehreek_bookmarks_updated'));
  } catch (err) {
    console.warn('Failed to clear bookmarks:', err);
  }
}

/* -------------------------------------------------------------------------- */
/*                               TIME FORMATTER                               */
/* -------------------------------------------------------------------------- */

export function formatTimeAgoUrdu(timestamp: number): string {
  if (!timestamp) return '';
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 60) return 'ابھی ابھی';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} منٹ پہلے`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} گھنٹے پہلے`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'کل';
  if (diffDays < 7) return `${diffDays} دن پہلے`;
  
  const d = new Date(timestamp);
  return d.toLocaleDateString('ur-PK', { month: 'short', day: 'numeric' });
}
