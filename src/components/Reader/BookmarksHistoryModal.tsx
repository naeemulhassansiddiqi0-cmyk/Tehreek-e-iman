import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Bookmark, 
  Clock, 
  Trash2, 
  ArrowRight, 
  Search, 
  Sparkles,
  BookMarked
} from 'lucide-react';
import { 
  BookmarkEntry, 
  ReadingHistoryEntry, 
  getBookmarks, 
  removeBookmark, 
  clearAllBookmarks,
  getReadingHistory,
  removeReadingHistoryItem,
  clearReadingHistory,
  formatTimeAgoUrdu
} from '../../services/bookmarkHistoryService';

interface BookmarksHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPage?: (bookSlug: string, pageNumber: number) => void;
  currentBookSlug?: string;
}

export const BookmarksHistoryModal: React.FC<BookmarksHistoryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPage,
  currentBookSlug
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState<string | null>(null);

  // Load bookmarks & history on open or custom events
  useEffect(() => {
    if (!isOpen) return;

    const refreshData = () => {
      setBookmarks(getBookmarks());
      setHistory(getReadingHistory());
    };

    refreshData();

    window.addEventListener('tehreek_bookmarks_updated', refreshData);
    window.addEventListener('tehreek_history_updated', refreshData);

    return () => {
      window.removeEventListener('tehreek_bookmarks_updated', refreshData);
      window.removeEventListener('tehreek_history_updated', refreshData);
    };
  }, [isOpen]);

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const q = searchQuery.toLowerCase().trim();
    return bookmarks.filter(bm => 
      bm.bookTitle.toLowerCase().includes(q) ||
      (bm.chapterTitle && bm.chapterTitle.toLowerCase().includes(q)) ||
      (bm.snippet && bm.snippet.toLowerCase().includes(q)) ||
      String(bm.pageNumber).includes(q)
    );
  }, [bookmarks, searchQuery]);

  // Filtered history
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter(h => 
      h.bookTitle.toLowerCase().includes(q) ||
      (h.chapterTitle && h.chapterTitle.toLowerCase().includes(q)) ||
      String(h.pageNumber).includes(q)
    );
  }, [history, searchQuery]);

  if (!isOpen) return null;

  const handleSelectBookmark = (bm: BookmarkEntry) => {
    if (onNavigateToPage) {
      onNavigateToPage(bm.bookSlug, bm.pageNumber);
      onClose();
    } else {
      window.location.href = `/books/${bm.bookSlug}?page=${bm.pageNumber}`;
    }
  };

  const handleSelectHistory = (h: ReadingHistoryEntry) => {
    if (onNavigateToPage) {
      onNavigateToPage(h.bookSlug, h.pageNumber);
      onClose();
    } else {
      window.location.href = `/books/${h.bookSlug}?page=${h.pageNumber}`;
    }
  };

  const handleDeleteBookmark = (e: React.MouseEvent, bm: BookmarkEntry) => {
    e.stopPropagation();
    removeBookmark(bm.bookSlug, bm.pageNumber);
    setBookmarks(prev => prev.filter(b => !(b.bookSlug === bm.bookSlug && b.pageNumber === bm.pageNumber)));
  };

  const handleDeleteHistory = (e: React.MouseEvent, h: ReadingHistoryEntry) => {
    e.stopPropagation();
    removeReadingHistoryItem(h.bookSlug);
    setHistory(prev => prev.filter(item => item.bookSlug !== h.bookSlug));
  };

  const handleClearAll = () => {
    if (activeTab === 'bookmarks') {
      clearAllBookmarks();
      setBookmarks([]);
    } else {
      clearReadingHistory();
      setHistory([]);
    }
    setConfirmClear(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-sm animate-fadeIn"
      dir="rtl"
      style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-stone-900 border-2 border-amber-400/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-stone-900 dark:text-stone-100 transition-all select-none animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* 1. Modal Header & Tabs Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-950 p-4 sm:p-5 border-b border-amber-400/60 text-white shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black font-nastaliq text-amber-300">
                  میرے بُک مارکس و تاریخِ مطالعہ
                </h3>
                <p className="text-[11px] text-stone-300 font-nastaliq">
                  ذاتی نشانات اور سابقہ مطالعہ پر واپسی کی سہولت
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
              title="بند کریں (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-stone-900/80 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => { setActiveTab('bookmarks'); setConfirmClear(null); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold font-nastaliq transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>محفوظ شدہ بُک مارکس</span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                activeTab === 'bookmarks' ? 'bg-stone-950 text-amber-300' : 'bg-white/20 text-stone-200'
              }`}>
                {bookmarks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('history'); setConfirmClear(null); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold font-nastaliq transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>مطالعہ کی تاریخ (ہسٹری)</span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                activeTab === 'history' ? 'bg-stone-950 text-amber-300' : 'bg-white/20 text-stone-200'
              }`}>
                {history.length}
              </span>
            </button>
          </div>
        </div>

        {/* 2. Search Toolbar */}
        <div className="p-3 border-b border-gray-100 dark:border-stone-800 bg-gray-50/70 dark:bg-stone-950/40 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'bookmarks' ? 'بُک مارک تلاش کریں (کتاب، سورت، آیت یا لفظ)...' : 'ہسٹری میں کتاب یا صفحہ تلاش کریں...'}
              className="w-full pr-9 pl-3 py-1.5 rounded-xl text-xs font-nastaliq bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(activeTab === 'bookmarks' ? bookmarks.length > 0 : history.length > 0) && (
            confirmClear === activeTab ? (
              <div className="flex items-center gap-1.5 shrink-0 animate-fadeIn">
                <span className="text-[11px] text-red-600 font-bold font-nastaliq">کیا آپ واقعی سب ختم کرنا چاہتے ہیں؟</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold font-nastaliq hover:bg-red-700 transition cursor-pointer"
                >
                  ہاں، مٹا دیں
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(null)}
                  className="px-2 py-1 rounded-lg bg-gray-200 text-stone-700 text-[11px] font-nastaliq hover:bg-gray-300 transition cursor-pointer"
                >
                  منسوخ
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(activeTab)}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-stone-700 hover:border-red-300 text-stone-400 hover:text-red-600 transition cursor-pointer shrink-0"
                title="سب صاف کریں"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* 3. Modal Content List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
          
          {/* TAB 1: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <>
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-2 border-amber-300/60 flex items-center justify-center mx-auto shadow-sm">
                    <Bookmark className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-stone-800 dark:text-stone-200 font-nastaliq">
                    {searchQuery ? 'تلاش کے مطابق کوئی بُک مارک نہیں ملا' : 'ابھی تک کوئی بُک مارک محفوظ نہیں کیا گیا'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto font-nastaliq leading-relaxed">
                    مطالعہ کے دوران کسی بھی صفحے، آیت یا حدیث کے اوپر موجود{' '}
                    <span className="font-bold text-amber-600">"بک مارک محفوظ کریں"</span> بٹن پر کلک کریں تاکہ وہ یہاں محفوظ ہو جائے۔
                  </p>
                </div>
              ) : (
                filteredBookmarks.map(bm => {
                  const isCurrent = currentBookSlug === bm.bookSlug;
                  return (
                    <div
                      key={bm.id}
                      onClick={() => handleSelectBookmark(bm)}
                      className={`group rounded-2xl border p-3.5 sm:p-4 transition-all cursor-pointer relative shadow-xs hover:shadow-md ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                          : 'border-gray-200 dark:border-stone-800 hover:border-emerald-400 bg-white dark:bg-stone-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-300 font-nastaliq">
                              {bm.bookTitle}
                            </span>
                            <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-md font-mono border border-amber-300/60">
                              صفحہ {bm.pageNumber}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.2 rounded-full font-nastaliq">
                                زیرِ مطالعہ کتاب
                              </span>
                            )}
                          </div>

                          {bm.chapterTitle && (
                            <p className="text-xs text-stone-600 dark:text-stone-300 font-nastaliq truncate">
                              {bm.chapterTitle}
                            </p>
                          )}

                          {bm.snippet && (
                            <p 
                              className="text-xs text-stone-800 dark:text-stone-200 line-clamp-2 bg-stone-50 dark:bg-stone-900/60 p-2 rounded-xl border border-gray-100 dark:border-stone-800"
                              dir="rtl"
                            >
                              {bm.snippet}
                            </p>
                          )}

                          <p className="text-[10px] text-stone-400 font-nastaliq pt-0.5">
                            محفوظ کیا گیا: {formatTimeAgoUrdu(bm.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBookmark(e, bm)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                            title="یہ بُک مارک ہٹائیں"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 group-hover:translate-x-[-2px] transition">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: READING HISTORY */}
          {activeTab === 'history' && (
            <>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-2 border-emerald-300/60 flex items-center justify-center mx-auto shadow-sm">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-stone-800 dark:text-stone-200 font-nastaliq">
                    {searchQuery ? 'تلاش کے مطابق کوئی تاریخ نہیں ملی' : 'ابھی تک کوئی مطالعہ ریکارڈ نہیں ہوا'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto font-nastaliq leading-relaxed">
                    جیسے ہی آپ کسی کتاب کا مطالعہ شروع کریں گے، آخری پڑھا ہوا صفحہ خود بخود یہاں ریکارڈ ہو جائے گا تاکہ آپ وہیں سے جاری رکھ سکیں۔
                  </p>
                </div>
              ) : (
                filteredHistory.map((h, idx) => {
                  const isCurrent = currentBookSlug === h.bookSlug;
                  return (
                    <div
                      key={h.bookSlug}
                      onClick={() => handleSelectHistory(h)}
                      className={`group rounded-2xl border p-3.5 sm:p-4 transition-all cursor-pointer relative shadow-xs hover:shadow-md ${
                        idx === 0
                          ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/30 ring-1 ring-amber-400/50'
                          : 'border-gray-200 dark:border-stone-800 hover:border-emerald-400 bg-white dark:bg-stone-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-xs sm:text-sm text-emerald-950 dark:text-emerald-300 font-nastaliq">
                              {h.bookTitle}
                            </span>
                            {idx === 0 && (
                              <span className="text-[10px] font-bold bg-amber-400 text-stone-950 px-2 py-0.2 rounded-full font-nastaliq flex items-center gap-1 shadow-2xs">
                                <Sparkles className="w-3 h-3" />
                                <span>تازہ ترین مطالعہ</span>
                              </span>
                            )}
                            {isCurrent && idx !== 0 && (
                              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.2 rounded-full font-nastaliq">
                                زیرِ مطالعہ کتاب
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300 font-nastaliq">
                            <span className="font-bold text-amber-800 dark:text-amber-300">
                              صفحہ {h.pageNumber} از {h.totalSections}
                            </span>
                            {h.chapterTitle && (
                              <>
                                <span>•</span>
                                <span className="truncate">{h.chapterTitle}</span>
                              </>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-stone-700 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-600 to-amber-400 rounded-full"
                              style={{ width: `${h.progressPercent || 1}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-stone-400 font-nastaliq pt-0.5">
                            <span>پیش رفت: {h.progressPercent}%</span>
                            <span>آخری بار پڑھا گیا: {formatTimeAgoUrdu(h.lastReadAt)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteHistory(e, h)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                            title="یہ ریکارڈ ہٹائیں"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 group-hover:translate-x-[-2px] transition">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

        </div>

        {/* 4. Modal Footer Bar */}
        <div className="p-3 bg-gray-50 dark:bg-stone-950/80 border-t border-gray-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 font-nastaliq shrink-0">
          <span>
            {activeTab === 'bookmarks' 
              ? `کل بُک مارکس: ${bookmarks.length}` 
              : `کل مطالعہ ریکارڈ: ${history.length} کتب`}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold font-nastaliq text-xs transition cursor-pointer"
          >
            بند کریں
          </button>
        </div>

      </div>
    </div>
  );
};
