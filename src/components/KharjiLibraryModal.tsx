import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  X, 
  Search, 
  ArrowLeft, 
  FolderOpen, 
  List, 
  RotateCcw,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  AlignJustify
} from 'lucide-react';
import { booksDatabase } from '../data/booksData';
import { Book } from '../types';

interface KharjiLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
  onSendToAI: (arabicText: string, bookName: string) => void;
  initialSubject?: string;
  initialBook?: Book | null;
}

export const KharjiLibraryModal: React.FC<KharjiLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectBook,
  onSendToAI,
  initialSubject = 'all',
  initialBook = null,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(36);
  const [activeBook, setActiveBook] = useState<Book | null>(initialBook);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [activeSegmentIdx, setActiveSegmentIdx] = useState<number>(0);
  const [readingMode, setReadingMode] = useState<'page' | 'scroll'>('page');

  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize initialSubject and initialBook when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialSubject) setSelectedSubject(initialSubject);
      setActiveBook(initialBook || null);
      setActiveChapterIdx(0);
      setActiveSegmentIdx(0);
      setVisibleCount(36);
    }
  }, [isOpen, initialSubject, initialBook]);

  // ESC key listener & body overflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (activeBook) {
          setActiveBook(null);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeBook, onClose]);

  // All 1000 Kharji Books
  const allKharjiBooks = useMemo(() => {
    return booksDatabase.filter(b => b.category === 'kharji_kitab');
  }, []);

  // Filtered Kharji Books
  const filteredBooks = useMemo(() => {
    return allKharjiBooks.filter(b => {
      let matchesSubject = true;
      if (selectedSubject === 'quran_tafseer') {
        matchesSubject = b.subject === 'quran' || b.subject === 'tafseer';
      } else if (selectedSubject === 'hadith') {
        matchesSubject = b.subject === 'hadith';
      } else if (selectedSubject === 'fiqh_usul') {
        matchesSubject = b.subject === 'fiqh' || b.subject === 'usul';
      } else if (selectedSubject === 'fatawa') {
        matchesSubject = b.subject === 'fatawa';
      } else if (selectedSubject === 'seerah') {
        matchesSubject = b.subject === 'seerah';
      } else if (selectedSubject === 'tarikh') {
        matchesSubject = b.subject === 'tarikh';
      } else if (selectedSubject === 'tazkiyah') {
        matchesSubject = b.subject === 'tazkiyah' || b.subject === 'adab';
      } else if (selectedSubject === 'aqaid') {
        matchesSubject = b.subject === 'aqaid';
      } else if (selectedSubject === 'nahw_balaghah') {
        matchesSubject = b.subject === 'nahw' || b.subject === 'balaghah' || b.subject === 'sarf';
      } else if (selectedSubject !== 'all') {
        matchesSubject = b.subject === selectedSubject;
      }

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.subjectNameUrdu.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);

      return matchesSubject && matchesSearch;
    });
  }, [allKharjiBooks, selectedSubject, searchQuery]);

  const displayedBooks = useMemo(() => {
    return filteredBooks.slice(0, visibleCount);
  }, [filteredBooks, visibleCount]);

  // Current active chapter and segment
  const currentChapter = useMemo(() => {
    if (!activeBook || !activeBook.chapters.length) return null;
    return activeBook.chapters[activeChapterIdx] || activeBook.chapters[0];
  }, [activeBook, activeChapterIdx]);

  const currentSegment = useMemo(() => {
    if (!currentChapter || !currentChapter.segments.length) return null;
    return currentChapter.segments[activeSegmentIdx] || currentChapter.segments[0];
  }, [currentChapter, activeSegmentIdx]);

  // Calculate global pages and progress across entire book
  const { 
    totalBookPages, 
    currentGlobalPage, 
    progressPercent, 
    isFirstPage, 
    isLastPageOfBook,
    hasNextSegmentInChapter,
    hasNextChapter
  } = useMemo(() => {
    if (!activeBook || !activeBook.chapters.length) {
      return { 
        totalBookPages: 0, 
        currentGlobalPage: 0, 
        progressPercent: 0, 
        isFirstPage: true, 
        isLastPageOfBook: false,
        hasNextSegmentInChapter: false,
        hasNextChapter: false
      };
    }

    let total = 0;
    let current = 0;
    for (let i = 0; i < activeBook.chapters.length; i++) {
      const segCount = activeBook.chapters[i].segments.length || 1;
      if (i < activeChapterIdx) {
        current += segCount;
      } else if (i === activeChapterIdx) {
        current += (activeSegmentIdx + 1);
      }
      total += segCount;
    }

    const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    const isFirst = activeChapterIdx === 0 && activeSegmentIdx === 0;
    const isLast = current >= total;
    const hasNextSeg = currentChapter ? activeSegmentIdx < currentChapter.segments.length - 1 : false;
    const hasNextCh = activeChapterIdx < activeBook.chapters.length - 1;

    return {
      totalBookPages: total,
      currentGlobalPage: current,
      progressPercent: pct,
      isFirstPage: isFirst,
      isLastPageOfBook: isLast,
      hasNextSegmentInChapter: hasNextSeg,
      hasNextChapter: hasNextCh
    };
  }, [activeBook, activeChapterIdx, activeSegmentIdx, currentChapter]);

  // Next Page Handler with Cross-Chapter Progression
  const handleNextPage = () => {
    if (!activeBook) return;
    const ch = activeBook.chapters[activeChapterIdx];
    if (!ch) return;

    if (activeSegmentIdx < ch.segments.length - 1) {
      setActiveSegmentIdx(prev => prev + 1);
    } else if (activeChapterIdx < activeBook.chapters.length - 1) {
      setActiveChapterIdx(prev => prev + 1);
      setActiveSegmentIdx(0);
    }

    if (readerContainerRef.current) {
      readerContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Previous Page Handler
  const handlePrevPage = () => {
    if (!activeBook) return;

    if (activeSegmentIdx > 0) {
      setActiveSegmentIdx(prev => prev - 1);
    } else if (activeChapterIdx > 0) {
      const prevCh = activeBook.chapters[activeChapterIdx - 1];
      setActiveChapterIdx(prev => prev - 1);
      setActiveSegmentIdx(Math.max(0, (prevCh?.segments.length || 1) - 1));
    }

    if (readerContainerRef.current) {
      readerContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation listener (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyNav = (e: KeyboardEvent) => {
      if (!isOpen || !activeBook) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        // In Urdu RTL, Left arrow progresses forward
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        // Right arrow goes back
        handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [isOpen, activeBook, activeChapterIdx, activeSegmentIdx]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl h-[95vh] flex flex-col rounded-3xl card-jewel-dark border-2 border-amber-400/90 shadow-2xl overflow-hidden animate-scaleUp text-amber-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-950 via-[#102018] to-stone-950 border-b-2 border-amber-400/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md shrink-0">
                <FolderOpen className="w-5 h-5 text-stone-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-nastaliq text-amber-200">
                    شعبۂ خارجی کتب — تحریکِ ایمان
                  </h2>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black font-nastaliq">
                    {allKharjiBooks.length} کتب کا ذخیرہ
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 font-nastaliq">
                  علوم القرآن، حدیث، فقہ، فتاویٰ، سیرت، تاریخ، تزکیہ اور لغت کی ۱۰۰۰ معتمد کتب
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-xl bg-black/40 text-amber-200 hover:text-white border border-amber-400/40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Instant Search Bar right in Modal Header */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400/80 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(36);
                }}
                placeholder="۱۰۰۰ خارجی کتب میں تلاش کریں..."
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-black/50 text-amber-100 placeholder-emerald-200/60 border border-emerald-700/60 focus:border-amber-400 focus:outline-none text-xs font-nastaliq shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-amber-400 hover:text-white font-nastaliq px-1.5 py-0.5 rounded bg-emerald-950 border border-amber-400/40 cursor-pointer"
                >
                  صاف
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="hidden md:flex p-2 rounded-2xl bg-black/40 hover:bg-black/70 text-amber-200 hover:text-white border border-amber-400/40 transition-all cursor-pointer shadow-sm shrink-0"
              title="بند کریں (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Secondary Bar: Subject Filters (hidden in activeBook mode for clean reading) */}
        {!activeBook && (
          <div className="px-4 py-2.5 bg-black/40 border-b border-emerald-800/60 shrink-0 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              {[
                { id: 'all', label: `تمام کتب (${allKharjiBooks.length})` },
                { id: 'quran_tafseer', label: 'علوم القرآن و التفسیر' },
                { id: 'hadith', label: 'حدیث و علوم الحدیث' },
                { id: 'fiqh_usul', label: 'فقہ و اصول' },
                { id: 'fatawa', label: 'فتاویٰ و نوازل' },
                { id: 'seerah', label: 'سیرت النبی ﷺ' },
                { id: 'tarikh', label: 'تاریخ و تراجم' },
                { id: 'tazkiyah', label: 'تزکیۂ نفس و اخلاق' },
                { id: 'aqaid', label: 'عقائد و کلام' },
                { id: 'nahw_balaghah', label: 'لغت، نحو و بلاغت' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedSubject(tab.id);
                    setVisibleCount(36);
                    setActiveBook(null);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-nastaliq transition-all cursor-pointer border ${
                    selectedSubject === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black border-amber-300 shadow-md ring-1 ring-amber-400/50'
                      : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/70 hover:border-amber-400/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Main Body */}
        <div 
          ref={readerContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6"
        >
          
          {/* Active Book In-Popup Reader Mode */}
          {activeBook ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Back to List & Reader Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-800/60">
                <button
                  onClick={() => {
                    setActiveBook(null);
                    setActiveChapterIdx(0);
                    setActiveSegmentIdx(0);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-950 text-amber-300 hover:text-amber-100 border border-amber-400/50 text-xs font-nastaliq font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-amber-400" />
                  <span>‹ تمام {filteredBooks.length} کتب کی فہرست پر واپس</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Mode Selector Toggle */}
                  <div className="inline-flex rounded-xl p-0.5 bg-black/60 border border-emerald-700/60 text-xs font-nastaliq">
                    <button
                      onClick={() => setReadingMode('page')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        readingMode === 'page'
                          ? 'bg-amber-400 text-stone-950 font-black shadow-xs'
                          : 'text-stone-300 hover:text-amber-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>صفحہ بہ صفحہ مطالعہ</span>
                    </button>
                    <button
                      onClick={() => setReadingMode('scroll')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        readingMode === 'scroll'
                          ? 'bg-amber-400 text-stone-950 font-black shadow-xs'
                          : 'text-stone-300 hover:text-amber-200'
                      }`}
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                      <span>مکمل باب یکجا</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onSelectBook(activeBook);
                      onClose();
                    }}
                    className="btn-3d-emerald px-3.5 py-1.5 rounded-xl text-xs font-black font-nastaliq text-amber-200 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>مکمل فل اسکرین ریڈر</span>
                  </button>

                  <button
                    onClick={() => {
                      const sample = currentSegment?.arabicText || activeBook.title;
                      onSendToAI(sample, activeBook.title);
                      onClose();
                    }}
                    className="btn-3d-gold px-3.5 py-1.5 rounded-xl text-xs font-black font-nastaliq text-stone-950 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                    <span>اے آئی سے استفسار</span>
                  </button>
                </div>
              </div>

              {/* Book Details Box */}
              <div className={`p-5 rounded-2xl bg-gradient-to-r ${activeBook.coverColor} text-white border-2 border-amber-400/50 shadow-lg space-y-2`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold font-nastaliq">
                    {activeBook.subjectNameUrdu}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-200 font-nastaliq font-black border border-amber-300/40">
                    {activeBook.grade}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/30 text-amber-200 font-nastaliq font-bold">
                    {activeBook.chapters.length} ابواب
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 font-nastaliq font-bold border border-emerald-500/40">
                    کل {totalBookPages} صفحات
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-amiri tracking-wide drop-shadow-md text-amber-200">
                  {activeBook.title}
                </h3>
                <p className="text-xs sm:text-sm text-amber-300 font-black font-nastaliq">
                  {activeBook.author}
                </p>
                <p className="text-xs sm:text-sm font-nastaliq text-emerald-100 leading-[2.4] text-justify pt-1">
                  {activeBook.description}
                </p>
              </div>

              {/* Global Continuous Progress Bar */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-700/60 shadow-inner space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs font-nastaliq gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-black">
                      کتابی صفحہ {currentGlobalPage} از {totalBookPages}
                    </span>
                    <span className="text-emerald-300/70">•</span>
                    <span className="text-emerald-200">
                      باب {activeChapterIdx + 1} از {activeBook.chapters.length}: {currentChapter?.titleUrdu || currentChapter?.titleArabic}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                      {progressPercent}% مطالعہ مکمل
                    </span>
                  </div>
                </div>

                <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-emerald-800/80">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-300 transition-all duration-300 rounded-full shadow-md"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Chapter Tabs Carousel */}
              {activeBook.chapters.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 font-nastaliq block">
                      فہرستِ ابواب (کل {activeBook.chapters.length} ابواب):
                    </span>
                    <span className="text-[11px] text-emerald-300/80 font-nastaliq">
                      (باب منتخب کر کے فوری مطالعہ فرمائیں)
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {activeBook.chapters.map((ch, idx) => (
                      <button
                        key={ch.id || idx}
                        onClick={() => {
                          setActiveChapterIdx(idx);
                          setActiveSegmentIdx(0);
                          if (readerContainerRef.current) {
                            readerContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-nastaliq shrink-0 transition-all cursor-pointer border ${
                          activeChapterIdx === idx
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black border-amber-300 shadow-md ring-2 ring-amber-400/40'
                            : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/70 hover:border-amber-400'
                        }`}
                      >
                        {ch.titleUrdu || ch.titleArabic || `باب ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* In-Chapter Page Navigation Bar (Top) */}
              {currentChapter && (
                <div className="p-3 rounded-2xl bg-black/50 border border-emerald-700/60 flex flex-wrap items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300 font-nastaliq">
                      {currentChapter.titleUrdu || currentChapter.titleArabic}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-200 border border-emerald-700/60 font-mono">
                      صفحہ {activeSegmentIdx + 1} / {currentChapter.segments.length}
                    </span>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={isFirstPage}
                      className={`px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold flex items-center gap-1.5 transition-all ${
                        isFirstPage
                          ? 'opacity-40 cursor-not-allowed bg-stone-900 border border-stone-800 text-stone-500'
                          : 'bg-emerald-950 text-amber-300 hover:text-amber-100 border border-amber-400/50 hover:border-amber-400 shadow-xs cursor-pointer active:scale-95'
                      }`}
                      title="پچھلا صفحہ"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>پچھلا صفحہ</span>
                    </button>

                    <span className="text-xs font-mono font-bold text-amber-200 px-2 py-1 bg-black/40 rounded-lg border border-emerald-800">
                      {activeSegmentIdx + 1} / {currentChapter.segments.length}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={isLastPageOfBook}
                      className={`px-3 py-1.5 rounded-xl text-xs font-nastaliq font-black flex items-center gap-1.5 transition-all ${
                        isLastPageOfBook
                          ? 'opacity-40 cursor-not-allowed bg-stone-900 border border-stone-800 text-stone-500'
                          : 'btn-3d-gold text-stone-950 shadow-xs cursor-pointer active:scale-95'
                      }`}
                      title="اگلا صفحہ"
                    >
                      <span>اگلا صفحہ</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Reading Area */}
              {currentChapter && (
                <div className="space-y-5">
                  
                  {/* Mode 1: Dedicated Page-by-Page Reading View */}
                  {readingMode === 'page' && currentSegment ? (
                    <div className="space-y-5 animate-fadeIn">
                      
                      {/* Current Page Content Card */}
                      <div className="p-5 sm:p-7 rounded-3xl bg-black/50 border-2 border-emerald-700/80 shadow-2xl space-y-5 relative overflow-hidden">
                        {/* Page Ornamental Corner Accents */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400/15 to-transparent pointer-events-none rounded-bl-3xl" />
                        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-amber-400/15 to-transparent pointer-events-none rounded-br-3xl" />

                        {/* Page Sub-Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                            <h4 className="text-sm sm:text-base font-black font-nastaliq text-amber-300">
                              {currentChapter.titleUrdu || currentChapter.titleArabic}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2.5 py-0.5 rounded-full card-jewel-dark text-amber-200 border border-emerald-700/60 font-nastaliq">
                              صفحہ {activeSegmentIdx + 1} از {currentChapter.segments.length}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-300/70">
                              (کل صفحہ {currentGlobalPage}/{totalBookPages})
                            </span>
                          </div>
                        </div>

                        {/* Arabic Classical Text */}
                        <div className="p-5 rounded-2xl bg-black/40 border border-amber-400/30 shadow-inner">
                          <div className="font-amiri text-xl sm:text-2xl md:text-3xl text-amber-100 leading-[2.6] text-right font-semibold selection:bg-amber-400/30 selection:text-white">
                            {currentSegment.arabicText}
                          </div>
                        </div>

                        {/* Urdu Translation */}
                        {currentSegment.urduTranslation && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 space-y-1.5 shadow-sm">
                            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 font-nastaliq">
                              <span>اردو ترجمہ و مفہوم:</span>
                            </div>
                            <div className="font-nastaliq text-sm sm:text-base text-emerald-50 leading-[2.6] text-justify font-medium">
                              {currentSegment.urduTranslation}
                            </div>
                          </div>
                        )}

                        {/* Detailed Tashreeh & Classical Commentary */}
                        {currentSegment.tashreeh && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900/90 to-emerald-950/80 border border-amber-400/40 space-y-1.5 shadow-md">
                            <div className="flex items-center gap-2 text-xs font-black text-amber-300 font-nastaliq">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>تحقیق، علمی تشریح و تربیتی فوائد:</span>
                            </div>
                            <div className="font-nastaliq text-xs sm:text-sm text-amber-100/95 leading-[2.4] text-justify">
                              {currentSegment.tashreeh}
                            </div>
                          </div>
                        )}

                        {/* Grammatical Analysis (محلِ اعراب) if available */}
                        {currentSegment.mahalIraab && currentSegment.mahalIraab.length > 0 && (
                          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-800/70 space-y-2">
                            <span className="text-xs font-black text-amber-300 font-nastaliq block">
                              محلِ اعراب و نحوی ترکیب:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {currentSegment.mahalIraab.map((ir, iIdx) => (
                                <div key={iIdx} className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-xs font-nastaliq space-y-1">
                                  <div className="flex items-center justify-between border-b border-emerald-800/60 pb-1">
                                    <strong className="font-amiri text-sm text-amber-200">{ir.word}</strong>
                                    <span className="text-emerald-300 text-[11px] font-bold">{ir.role}</span>
                                  </div>
                                  <div className="text-[11px] text-emerald-100 flex items-center justify-between">
                                    <span>علامت: {ir.sign}</span>
                                  </div>
                                  {ir.detail && (
                                    <p className="text-[10px] text-stone-300/80 leading-tight">
                                      {ir.detail}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Scholarly Footnotes & Takhrij (حواشی) if available */}
                        {currentSegment.hawashi && currentSegment.hawashi.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-black/30 border border-emerald-900 text-xs font-nastaliq text-emerald-200/90 space-y-1">
                            <span className="font-bold text-amber-400 block text-[11px]">حواشی و تخریج:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                              {currentSegment.hawashi.map((hw, hIdx) => (
                                <li key={hIdx}>{hw}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Potential Study / Exam Questions if available */}
                        {currentSegment.potentialQuestions && currentSegment.potentialQuestions.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs font-nastaliq space-y-1">
                            <span className="font-black text-amber-300 block text-[11px] flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>امتحانی و فکری سوالات:</span>
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-emerald-100 text-[11px]">
                              {currentSegment.potentialQuestions.map((q, qIdx) => (
                                <li key={qIdx}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* English Translation if available */}
                        {currentSegment.translations?.en && (
                          <div className="font-sans text-xs text-stone-300/90 leading-relaxed dir-ltr text-left border-t border-stone-800 pt-3">
                            <span className="font-bold text-amber-400 mr-1.5">English Translation:</span>
                            {currentSegment.translations.en}
                          </div>
                        )}

                        {/* Ask AI about this page */}
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              onSendToAI(currentSegment.arabicText, `${activeBook.title} - ${currentChapter.titleUrdu || currentChapter.titleArabic} (صفحہ ${activeSegmentIdx + 1})`);
                              onClose();
                            }}
                            className="text-xs font-nastaliq font-bold text-amber-300 hover:text-amber-100 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 border border-amber-400/40 hover:border-amber-400 transition-all cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>اس صفحے پر اے آئی سے مکمل بحث و رہنمائی حاصل کریں</span>
                          </button>
                        </div>
                      </div>

                      {/* Continuous Guided Progression Box ("رہنمائی برائے اگلا صفحہ") */}
                      <div className="animate-fadeIn">
                        {hasNextSegmentInChapter ? (
                          /* Case 1: Next page in the same chapter */
                          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#12281c] to-stone-950 border-2 border-amber-400/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg shrink-0">
                                <span className="text-xl">👉</span>
                              </div>
                              <div className="space-y-0.5 text-right">
                                <div className="text-xs text-amber-300 font-nastaliq font-black flex items-center gap-1.5">
                                  <span>اگلے صفحے کی رہنمائی:</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 font-mono">
                                    صفحہ {activeSegmentIdx + 2} / {currentChapter.segments.length}
                                  </span>
                                </div>
                                <div className="text-sm sm:text-base font-nastaliq font-bold text-white">
                                  اگلے صفحے کی عبارت کا مطالعہ فرمائیں
                                </div>
                                <p className="text-[11px] font-nastaliq text-emerald-200/80">
                                  (کل کتابی صفحہ {currentGlobalPage + 1} از {totalBookPages} پر منتقل ہوں گے)
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={handleNextPage}
                              className="w-full sm:w-auto btn-3d-gold px-6 py-3 rounded-2xl text-stone-950 font-black font-nastaliq text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                            >
                              <span>اگلے صفحے پر جائیں</span>
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                          </div>
                        ) : hasNextChapter ? (
                          /* Case 2: Last page of chapter, but next chapter exists */
                          (() => {
                            const nextChapter = activeBook.chapters[activeChapterIdx + 1];
                            return (
                              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/90 via-stone-900 to-emerald-950 border-2 border-amber-400 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center shadow-lg shrink-0">
                                    <BookOpen className="w-6 h-6 text-stone-950" />
                                  </div>
                                  <div className="space-y-0.5 text-right">
                                    <div className="text-xs text-amber-300 font-nastaliq font-black flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>ماشاء اللہ! باب {activeChapterIdx + 1} مکمل ہوا</span>
                                    </div>
                                    <div className="text-sm sm:text-base font-nastaliq font-bold text-white">
                                      اگلا باب: {nextChapter?.titleUrdu || nextChapter?.titleArabic}
                                    </div>
                                    <p className="text-[11px] font-nastaliq text-emerald-200/80">
                                      (باب {activeChapterIdx + 2} از {activeBook.chapters.length} کا صفحہ ۱ شروع کریں)
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={handleNextPage}
                                  className="w-full sm:w-auto btn-3d-emerald px-6 py-3 rounded-2xl text-amber-200 font-black font-nastaliq text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                                >
                                  <span>اگلا باب شروع کریں (باب {activeChapterIdx + 2})</span>
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                              </div>
                            );
                          })()
                        ) : (
                          /* Case 3: Absolute end of the book (Khatm-e-Kitab) */
                          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#102018] to-amber-950 border-2 border-amber-400 shadow-2xl text-center space-y-4">
                            <div className="inline-flex p-3.5 rounded-full bg-amber-400/20 text-amber-300 border-2 border-amber-400/50 shadow-lg">
                              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xl sm:text-2xl font-black font-nastaliq text-amber-200">
                                🎉 الحمد للہ رب العالمین! ختمِ کتاب کی مبارکباد
                              </h4>
                              <p className="text-xs sm:text-sm font-nastaliq text-emerald-100 max-w-xl mx-auto leading-relaxed">
                                آپ نے «<strong className="text-amber-300">{activeBook.title}</strong>» کے تمام <strong className="text-amber-300">{activeBook.chapters.length}</strong> ابواب اور کل <strong className="text-amber-300">{totalBookPages}</strong> صفحات کا مطالعہ اول تا آخر بحسن و خوبی مکمل فرما لیا ہے۔ اللہ تعالیٰ اس علم کو آپ کے لیے دنیا و آخرت میں نافع بنائے۔
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                              <button
                                onClick={() => {
                                  setActiveChapterIdx(0);
                                  setActiveSegmentIdx(0);
                                  if (readerContainerRef.current) {
                                    readerContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                  }
                                }}
                                className="btn-3d-emerald px-4 py-2.5 rounded-xl text-xs font-nastaliq font-black text-amber-200 flex items-center gap-2 cursor-pointer shadow-md"
                              >
                                <RotateCcw className="w-4 h-4 text-amber-400" />
                                <span>کتاب کا اعادہ کریں (صفحہ اول)</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveBook(null);
                                  setActiveChapterIdx(0);
                                  setActiveSegmentIdx(0);
                                }}
                                className="btn-3d-gold px-4 py-2.5 rounded-xl text-xs font-nastaliq font-black text-stone-950 flex items-center gap-2 cursor-pointer shadow-md"
                              >
                                <BookOpen className="w-4 h-4 text-stone-950" />
                                <span>دیگر خارجی کتب کا مطالعہ فرمائیں</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    /* Mode 2: Full Chapter Continuous Scroll View */
                    <div className="space-y-4">
                      {currentChapter.segments.map((seg, sIdx) => (
                        <div 
                          key={seg.id || sIdx}
                          className="p-5 rounded-2xl bg-black/40 border border-emerald-700/60 space-y-3 shadow-inner"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60 text-xs font-nastaliq">
                            <span className="text-amber-400 font-bold">
                              صفحہ / عبارت {sIdx + 1} از {currentChapter.segments.length}
                            </span>
                            <button
                              onClick={() => {
                                setReadingMode('page');
                                setActiveSegmentIdx(sIdx);
                                if (readerContainerRef.current) {
                                  readerContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                              }}
                              className="text-[11px] text-emerald-300 hover:text-amber-200 underline cursor-pointer"
                            >
                              صفحہ بہ صفحہ موڈ میں دیکھیں
                            </button>
                          </div>

                          <div className="font-amiri text-lg sm:text-xl text-amber-100 leading-[2.4] text-right font-semibold">
                            {seg.arabicText}
                          </div>

                          {seg.urduTranslation && (
                            <div className="pt-3 border-t border-emerald-800/60 font-nastaliq text-xs sm:text-sm text-emerald-100 leading-[2.4] text-justify font-medium">
                              <strong className="text-amber-300 font-bold ml-1">ترجمہ:</strong>
                              {seg.urduTranslation}
                            </div>
                          )}

                          {seg.tashreeh && (
                            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 font-nastaliq text-xs text-amber-200/90 leading-[2.2] text-justify">
                              <strong className="text-amber-300 font-bold ml-1">تحقیق و تشریح:</strong>
                              {seg.tashreeh}
                            </div>
                          )}

                          {seg.translations?.en && (
                            <div className="font-sans text-xs text-stone-300/90 leading-relaxed dir-ltr text-left border-t border-stone-800 pt-2">
                              <span className="font-bold text-amber-400/90 mr-1">English:</span>
                              {seg.translations.en}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Advance to next chapter button in scroll mode */}
                      {activeChapterIdx < activeBook.chapters.length - 1 ? (
                        <div className="p-4 rounded-2xl bg-emerald-950 border border-amber-400/50 flex items-center justify-between gap-3">
                          <span className="text-xs font-nastaliq font-bold text-emerald-100">
                            اگلا باب: {activeBook.chapters[activeChapterIdx + 1]?.titleUrdu || activeBook.chapters[activeChapterIdx + 1]?.titleArabic}
                          </span>
                          <button
                            onClick={() => {
                              setActiveChapterIdx(prev => prev + 1);
                              setActiveSegmentIdx(0);
                              if (readerContainerRef.current) {
                                readerContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className="btn-3d-emerald px-4 py-2 rounded-xl text-xs font-black font-nastaliq text-amber-200 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>اگلا باب شروع کریں</span>
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-amber-400 text-center font-nastaliq text-amber-200 text-sm font-black">
                          🎉 ماشاء اللہ! آپ نے اس کتاب کے تمام ابواب کا مطالعہ مکمل کر لیا ہے۔
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* Bottom Quick Toolbar */}
              {currentChapter && (
                <div className="p-3 bg-black/60 rounded-2xl border border-emerald-800/80 flex items-center justify-between text-xs font-nastaliq text-amber-200">
                  <button
                    onClick={handlePrevPage}
                    disabled={isFirstPage}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
                      isFirstPage
                        ? 'opacity-40 cursor-not-allowed border-stone-800 text-stone-500'
                        : 'card-jewel-dark text-amber-200 hover:text-white border-emerald-700/60 hover:border-amber-400 cursor-pointer'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>پچھلا صفحہ</span>
                  </button>

                  <span className="text-emerald-300 font-mono text-[11px]">
                    صفحہ {activeSegmentIdx + 1} / {currentChapter.segments.length} (کتابی صفحہ {currentGlobalPage} / {totalBookPages})
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={isLastPageOfBook}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
                      isLastPageOfBook
                        ? 'opacity-40 cursor-not-allowed border-stone-800 text-stone-500'
                        : 'btn-3d-emerald text-amber-200 cursor-pointer'
                    }`}
                  >
                    <span>اگلا صفحہ</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* Books Cards Grid Mode */
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-nastaliq text-amber-200 pb-2 border-b border-emerald-800/60">
                <span>
                  دکھائی جانے والی کتب: <strong className="text-amber-300 font-black">{displayedBooks.length}</strong> از <strong className="text-amber-300 font-black">{filteredBooks.length}</strong> کتب
                </span>
                <span className="text-emerald-300/80">
                  (کسی بھی کتاب پر کلک کر کے فوری مطالعہ فرمائیں)
                </span>
              </div>

              {displayedBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedBooks.map((book) => (
                    <div 
                      key={book.id}
                      onClick={() => {
                        setActiveBook(book);
                        setActiveChapterIdx(0);
                        setActiveSegmentIdx(0);
                      }}
                      className="card-jewel-dark hover:border-amber-400 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group overflow-hidden shadow-md hover:scale-[1.01]"
                    >
                      <div>
                        <div className={`h-24 bg-gradient-to-r ${book.coverColor} p-4 flex flex-col justify-between text-white relative`}>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold font-nastaliq truncate max-w-[60%]">
                              {book.subjectNameUrdu.split('،')[0]}
                            </span>
                            <span className="text-[11px] text-amber-200 font-nastaliq font-black">
                              {book.grade}
                            </span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-black font-amiri tracking-wide drop-shadow-md group-hover:text-amber-200 transition-colors truncate">
                            {book.title}
                          </h4>
                        </div>

                        <div className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-amber-300 font-black font-nastaliq truncate max-w-[70%]">
                              {book.author}
                            </p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full card-jewel-dark text-amber-200 font-black font-nastaliq border border-emerald-700/60 flex items-center gap-1 shadow-xs">
                              <List className="w-3 h-3 text-amber-400" />
                              {book.chapters.length} ابواب
                            </span>
                          </div>

                          <p className="text-xs font-bold font-nastaliq text-emerald-100/90 leading-[2.2] line-clamp-3 text-justify">
                            {book.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-emerald-800/40 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveBook(book);
                            setActiveChapterIdx(0);
                            setActiveSegmentIdx(0);
                          }}
                          className="flex-1 btn-3d-emerald py-1.5 px-3 rounded-xl text-xs font-black font-nastaliq text-amber-200 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          <span>فوری مطالعہ</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const sampleSegment = book.chapters[0]?.segments[0];
                            if (sampleSegment) {
                              onSendToAI(sampleSegment.arabicText, book.title);
                              onClose();
                            }
                          }}
                          title="اے آئی کے ذریعے حل کریں"
                          className="btn-3d-gold p-2 rounded-xl text-stone-950 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <BookMarked className="w-12 h-12 text-amber-400/50 mx-auto" />
                  <h4 className="text-lg font-black font-nastaliq text-amber-200">
                    اس تلاش یا موضوع میں کوئی کتاب نہیں ملی
                  </h4>
                  <p className="text-xs font-nastaliq text-emerald-200">
                    براہِ کرم تلاش کا لفظ تبدیل کریں یا تمام کتب پر کلک فرمائیں۔
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSubject('all');
                    }}
                    className="btn-3d-emerald px-4 py-2 rounded-xl text-xs font-nastaliq font-bold text-amber-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>فلٹر ختم کریں</span>
                  </button>
                </div>
              )}

              {/* Load More Button */}
              {filteredBooks.length > visibleCount && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 36)}
                    className="btn-3d-emerald py-2.5 px-6 rounded-2xl text-xs font-black font-nastaliq text-amber-200 flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                  >
                    <span>مزید 36 کتب لوڈ کریں (باقی {filteredBooks.length - visibleCount} کتب)</span>
                  </button>

                  <button
                    onClick={() => setVisibleCount(filteredBooks.length)}
                    className="btn-3d-gold py-2.5 px-6 rounded-2xl text-xs font-black font-nastaliq text-stone-950 shadow-md cursor-pointer active:scale-95"
                  >
                    <span>تمام {filteredBooks.length} کتب یکجا دیکھیں</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-black/60 border-t border-emerald-800/80 flex items-center justify-between text-xs font-nastaliq text-amber-200 shrink-0">
          <span>
            کل خارجی ذخیرہ: <strong className="text-amber-300 font-bold">{allKharjiBooks.length} کتب</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl card-jewel-dark text-stone-300 hover:text-white border border-emerald-700/60 hover:border-amber-400 text-xs font-bold transition-all cursor-pointer"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
