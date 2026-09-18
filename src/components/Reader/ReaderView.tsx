import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Book, BookChapter, BookSegment, SupportedLanguage, SUPPORTED_LANGUAGES, BookCategory, WordLookupContextInfo } from '../../types';
import { booksDatabase } from '../../data/booksData';
import { WordLookupModal } from './WordLookupModal';
import { ChapterIndexDrawer } from './ChapterIndexDrawer';
import { BookDirectoryModal } from './BookDirectoryModal';
import { FloatingReaderControls } from './FloatingReaderControls';
import { getTranslationInLanguage } from '../../services/translationService';
import { fetchHadithByNumber, convertApiHadithToChapter, getHadithBookMeta, createAcademicHadithChapter, extractHadithNumber } from '../../services/hadithApiService';
import { 
  Columns2,
  Square, 
  Sparkles, 
  Bookmark, 
  HelpCircle, 
  Type,
  Globe2,
  BookOpen,
  FileText,
  Scale,
  Scroll,
  BookMarked,
  ChevronRight,
  ChevronLeft,
  List,
  ArrowLeft, 
  Loader2, 
  FolderOpen, 
  Printer,
  HardDrive,
  DownloadCloud,
  Search,
  ExternalLink
} from 'lucide-react';
import { ExportPrintModal } from './ExportPrintModal';
import { saveBookOffline, removeBookOffline, isBookSavedOffline } from '../../utils/offlineStorage';
import { OfflineBooksManagerModal } from './OfflineBooksManagerModal';
import { searchInsideBook } from '../../services/databaseService';
import { hasFiqhFullText, loadFiqhFullText, convertFullTextToChapters, getFiqhFullTextSlug } from '../../services/fiqhFullTextService';
import { getTranslationSourceInfo, translateArabicFiqhToUrdu, translateParagraph, isUrduText, isSameAsArabic } from '../../services/fiqhUrduTranslator';

interface ReaderViewProps {
  selectedBook: Book;
  onSelectBook: (book: Book) => void;
  onSendToAI: (text: string, bookName: string) => void;
  onAddNote: (bookId: string, segmentId: string, text: string) => void;
  highlightSegmentId?: string | null;
  theme: string;
  apiKey?: string;
  onBackToDashboard?: () => void;
  userName?: string;
  onOpenKharjiBooks?: (book?: Book) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  selectedBook,
  onSelectBook,
  onSendToAI,
  onAddNote,
  highlightSegmentId,
  theme,
  apiKey,
  onBackToDashboard,
  userName,
  onOpenKharjiBooks,
}) => {
  const readerViewportRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<BookCategory | 'all'>('all');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [readingMode, setReadingMode] = useState<'page' | 'scroll'>('page');
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isBookDirectoryOpen, setIsBookDirectoryOpen] = useState(false);
  const [isExportPrintOpen, setIsExportPrintOpen] = useState(false);
  const [isFetchingHadith, setIsFetchingHadith] = useState(false);
  const [fetchNotice, setFetchNotice] = useState<string | null>(null);
  const [directHadithInput, setDirectHadithInput] = useState('');

  // Default to Full Width (Stacked Mode) so Arabic Matn has expansive room and crystal-clear presentation
  const [isDualPane, setIsDualPane] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [fontFamily, setFontFamily] = useState<'amiri' | 'scheherazade' | 'lateef'>('amiri');

  // Offline Books Storage State
  const [isSavedOffline, setIsSavedOffline] = useState<boolean>(false);
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState<boolean>(false);

  // In-Book Search State
  const [isInBookSearchOpen, setIsInBookSearchOpen] = useState<boolean>(false);
  const [inBookQuery, setInBookQuery] = useState<string>('');
  const inBookResults = useMemo(() => {
    return searchInsideBook(selectedBook, inBookQuery);
  }, [selectedBook, inBookQuery]);

  useEffect(() => {
    let mounted = true;
    isBookSavedOffline(selectedBook.id).then(saved => {
      if (mounted) setIsSavedOffline(saved);
    });
    return () => { mounted = false; };
  }, [selectedBook.id]);

  const handleToggleOffline = async () => {
    if (isSavedOffline) {
      if (confirm(`کیا آپ "${selectedBook.title}" کو آف لائن اسٹوریج سے خارج کرنا چاہتے ہیں؟`)) {
        await removeBookOffline(selectedBook.id);
        setIsSavedOffline(false);
      }
    } else {
      await saveBookOffline(selectedBook);
      setIsSavedOffline(true);
      alert(`ماشاء اللہ! "${selectedBook.title}" اب مکمل طور پر آپ کی ڈیوائس پر محفوظ ہو چکی ہے اور بغیر انٹرنیٹ کے بھی دستیاب رہے گی۔`);
    }
  };

  // Reactive chapters state so dynamically loaded or generated Hadiths re-render immediately
  const [chapters, setChapters] = useState<BookChapter[]>(selectedBook.chapters);
  const [isLoadingFullText, setIsLoadingFullText] = useState<boolean>(false);
  const [fullTextStats, setFullTextStats] = useState<{ pages: number; chapters: number } | null>(null);

  useEffect(() => {
    setChapters(selectedBook.chapters);
    setActiveChapterIndex(0);
    setActiveSegmentIndex(0);
    setFullTextStats(null);

    // If this book is a Fiqh/Fatawa book with full text available from Shamela
    if (hasFiqhFullText(selectedBook.id)) {
      setIsLoadingFullText(true);
      loadFiqhFullText(selectedBook.id).then(bundle => {
        if (bundle && bundle.pages && bundle.pages.length > 0) {
          const fullChapters = convertFullTextToChapters(bundle, selectedBook.id);
          if (fullChapters.length > 0) {
            setChapters(fullChapters);
            selectedBook.chapters = fullChapters;
            setFullTextStats({
              pages: bundle.totalPages || bundle.pages.length,
              chapters: bundle.totalChapters || fullChapters.length
            });
          }
        }
      }).catch(err => {
        console.warn('Error loading fiqh full text:', err);
      }).finally(() => {
        setIsLoadingFullText(false);
      });
    }
  }, [selectedBook.id]);

  const totalChapters = chapters.length;
  const currentChapter = chapters[activeChapterIndex] || chapters[0];
  const segmentsList = currentChapter?.segments || [];
  const totalSegments = segmentsList.length;
  const safeSegmentIndex = Math.min(Math.max(0, activeSegmentIndex), Math.max(0, totalSegments - 1));
  const currentSegment = segmentsList[safeSegmentIndex];

  const prevChapter = activeChapterIndex > 0 ? chapters[activeChapterIndex - 1] : null;
  const nextChapter = activeChapterIndex < totalChapters - 1 ? chapters[activeChapterIndex + 1] : null;

  const isQuran = selectedBook.id === 'quran' || selectedBook.category === 'quran_tafseer';
  const isHadith = selectedBook.category === 'sittah' || selectedBook.subject === 'hadith';
  const isFiqh = selectedBook.category === 'fatawa' || selectedBook.subject === 'fatawa' || selectedBook.subject === 'fiqh' || hasFiqhFullText(selectedBook.id);
  const fiqhSlug = isFiqh ? (getFiqhFullTextSlug(selectedBook.id) || selectedBook.id) : null;
  const fiqhSource = fiqhSlug ? getTranslationSourceInfo(fiqhSlug) : null;

  const hadithBookMeta = isHadith ? getHadithBookMeta(selectedBook.id) : null;
  const totalHadithsInBook = hadithBookMeta?.totalHadiths || 7563;

  const currentHadithNumber = useMemo(() => {
    if (!isHadith) return activeChapterIndex + 1;
    return extractHadithNumber(currentChapter, activeChapterIndex);
  }, [isHadith, currentChapter, activeChapterIndex]);

  const isLastHadith = isHadith && currentHadithNumber >= totalHadithsInBook;
  const isFirstHadith = isHadith && currentHadithNumber <= 1;

  const chapterLabel = isQuran ? 'سورت' : isHadith ? 'باب / حدیث' : isFiqh ? 'باب / فصل' : 'باب / فصل';
  const segmentLabel = isQuran ? 'صفحہ / رکوع' : isHadith ? 'حدیث / متن' : isFiqh ? 'صفحہ' : 'صفحہ / عبارت';

  const hasNextSegment = safeSegmentIndex < totalSegments - 1;
  const hasPrevSegment = safeSegmentIndex > 0;
  const hasNextChapter = activeChapterIndex < totalChapters - 1;
  const hasPrevChapter = activeChapterIndex > 0;

  const handleNext = async () => {
    if (readingMode === 'page') {
      if (hasNextSegment) {
        setActiveSegmentIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (isHadith) {
      if (currentHadithNumber < totalHadithsInBook) {
        const nextHadithNum = currentHadithNumber + 1;
        await handleLookupHadithNumber(nextHadithNum);
      }
      return;
    }

    if (hasNextChapter) {
      setActiveChapterIndex(prev => prev + 1);
      setActiveSegmentIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = async () => {
    if (readingMode === 'page') {
      if (hasPrevSegment) {
        setActiveSegmentIndex(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (isHadith) {
      if (currentHadithNumber > 1) {
        await handleLookupHadithNumber(currentHadithNumber - 1);
      }
      return;
    }

    if (hasPrevChapter) {
      setActiveChapterIndex(prev => prev - 1);
      setActiveSegmentIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToSegment = (segIdx: number) => {
    setActiveSegmentIndex(segIdx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Instant 0ms Synchronous Hadith Resolver + Background Enrichment
  const handleLookupHadithNumber = async (hadithNumber: number) => {
    const config = getHadithBookMeta(selectedBook.id);
    const maxHadiths = config?.totalHadiths || 7563;
    if (hadithNumber < 1 || hadithNumber > maxHadiths) return;

    // 1. Check if already loaded in chapters using exact Hadith number
    const existingIndex = chapters.findIndex((ch, idx) => extractHadithNumber(ch, idx) === hadithNumber);

    if (existingIndex !== -1) {
      setActiveChapterIndex(existingIndex);
      setActiveSegmentIndex(0);
      setIsIndexOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. INSTANT SYNCHRONOUS RESOLUTION (0ms):
    // Instantly append chapter so student moves to next Hadith immediately without ANY delay
    setIsFetchingHadith(true);
    setFetchNotice(`${config?.nameUrdu || 'حدیث شریف'}: حدیث نمبر ${hadithNumber} پیشِ خدمت ہے۔`);
    setTimeout(() => {
      setIsFetchingHadith(false);
      setFetchNotice(null);
    }, 2500);

    const immediateChapter = createAcademicHadithChapter(selectedBook.id, hadithNumber);
    const updated = [...chapters, immediateChapter].sort((a, b) => {
      const numA = extractHadithNumber(a);
      const numB = extractHadithNumber(b);
      return numA - numB;
    });

    selectedBook.chapters = updated;
    setChapters(updated);
    onSelectBook({ ...selectedBook, chapters: updated });
    const targetIdx = updated.findIndex((ch, idx) => extractHadithNumber(ch, idx) === hadithNumber);
    setActiveChapterIndex(targetIdx !== -1 ? targetIdx : updated.length - 1);
    setActiveSegmentIndex(0);
    setIsIndexOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 3. BACKGROUND ASYNC ENRICHMENT (without blocking UI or freezing navigation)
    fetchHadithByNumber(selectedBook.id, hadithNumber)
      .then(result => {
        if (result && result.text) {
          const enriched = convertApiHadithToChapter(result, selectedBook.id);
          setChapters(prev => {
            const copy = [...prev];
            const idx = copy.findIndex((c, i) => extractHadithNumber(c, i) === hadithNumber);
            if (idx !== -1) {
              copy[idx] = enriched;
            }
            selectedBook.chapters = copy;
            return copy;
          });
        }
      })
      .catch(() => {
        // Fallback already active and beautiful
      });
  };
  
  // Matn Contrast Theme: 'mushaf' (Pure White & Pitch Black #000000), 'parchment' (Amber Ivory), 'night' (Midnight Obsidian & Gold)
  const [matnTheme, setMatnTheme] = useState<'mushaf' | 'parchment' | 'night'>(() => {
    try {
      return (localStorage.getItem('madrasa_matn_theme') as 'mushaf' | 'parchment' | 'night') || 'mushaf';
    } catch {
      return 'mushaf';
    }
  });

  // Font Boldness toggle for thick, prominent, readable Tashkeel
  const [isMatnBold, setIsMatnBold] = useState<boolean>(true);

  const handleSetMatnTheme = (t: 'mushaf' | 'parchment' | 'night') => {
    setMatnTheme(t);
    try {
      localStorage.setItem('madrasa_matn_theme', t);
    } catch {
      // ignore
    }
  };

  // Reset chapter and segment index to 0 when user selects a different book
  useEffect(() => {
    setActiveChapterIndex(0);
    setActiveSegmentIndex(0);
  }, [selectedBook.id]);

  // Reset segment index when chapter changes
  useEffect(() => {
    setActiveSegmentIndex(0);
  }, [activeChapterIndex]);

  // Active pillar tab per segment: 'translation' | 'tashreeh' | 'iraab'
  const [activePillarTab, setActivePillarTab] = useState<Record<string, 'translation' | 'tashreeh' | 'iraab'>>({});

  // Active translation language
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('ur');
  // Dynamic translations cache & loading state
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});

  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [lookupContext, setLookupContext] = useState<WordLookupContextInfo | null>(null);
  const [noteInputSegmentId, setNoteInputSegmentId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Filter books based on activeCategory
  const filteredBooks = useMemo(() => {
    if (activeCategory === 'all') return booksDatabase;
    return booksDatabase.filter(b => b.category === activeCategory);
  }, [activeCategory]);

  // When chapter or language changes, fetch translations if non-Urdu
  useEffect(() => {
    if (currentLang !== 'ur' && currentChapter) {
      currentChapter.segments.forEach(async (seg: BookSegment) => {
        const key = `${seg.id}___${currentLang}`;
        if (!dynamicTranslations[key]) {
          setTranslatingIds(prev => ({ ...prev, [key]: true }));
          try {
            const trans = await getTranslationInLanguage(
              seg.arabicText,
              seg.urduTranslation,
              currentLang,
              seg.translations,
              apiKey
            );
            setDynamicTranslations(prev => ({ ...prev, [key]: trans }));
          } catch (err) {
            console.error('Translation error:', err);
          } finally {
            setTranslatingIds(prev => ({ ...prev, [key]: false }));
          }
        }
      });
    }
  }, [currentChapter, currentLang, apiKey, dynamicTranslations]);


  // Scroll to highlight segment if provided
  useEffect(() => {
    if (highlightSegmentId) {
      const el = document.getElementById(highlightSegmentId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightSegmentId]);

  const toggleQuestions = (id: string) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setSegmentTab = (segmentId: string, tab: 'translation' | 'tashreeh' | 'iraab') => {
    setActivePillarTab(prev => ({ ...prev, [segmentId]: tab }));
  };

  const handleWordClick = (word: string, segment: BookSegment) => {
    const cleaned = word.replace(/[.,:;!?()،؛؟"«»۝0-9٠-٩]/g, '').trim();
    setLookupWord(cleaned || word);
    setLookupContext({
      bookTitle: selectedBook.title,
      chapterTitle: `${currentChapter?.titleArabic || ''} (${currentChapter?.titleUrdu || ''})`,
      sentenceText: segment.arabicText,
      urduTranslation: segment.urduTranslation,
      mahalIraab: segment.mahalIraab || [],
      tashreeh: segment.tashreeh,
      hawashi: segment.hawashi || [],
      rawWord: word,
    });
  };


  const submitNote = (segmentId: string) => {
    if (noteText.trim()) {
      onAddNote(selectedBook.id, segmentId, noteText.trim());
      setNoteText('');
      setNoteInputSegmentId(null);
    }
  };

  const getFontSizeClass = () => {
    const weight = isMatnBold ? 'font-bold' : 'font-semibold';
    switch (fontSize) {
      case 'normal': return `text-2xl sm:text-3xl lg:text-3xl leading-[2.9] ${weight}`;
      case 'large': return `text-3xl sm:text-4xl lg:text-4xl leading-[3.0] ${weight}`;
      case 'xlarge': return `text-4xl sm:text-5xl lg:text-5xl leading-[3.2] ${weight}`;
    }
  };

  const getMatnBoxClass = () => {
    switch (matnTheme) {
      case 'mushaf': return 'matn-box-mushaf';
      case 'parchment': return 'matn-box-parchment';
      case 'night': return 'matn-box-night';
      default: return 'matn-box-mushaf';
    }
  };

  const getMatnTextClass = () => {
    switch (matnTheme) {
      case 'mushaf': return 'matn-text-mushaf';
      case 'parchment': return 'matn-text-parchment';
      case 'night': return 'matn-text-night';
      default: return 'matn-text-mushaf';
    }
  };

  const activeLangConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header: Universal Back to Dashboard + All Books Catalog Button */}
      <div className="flex items-center justify-between gap-3 board-jewel-emerald p-3 sm:p-4 rounded-2xl border-2 border-emerald-700/60 shadow-md text-amber-50">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="btn-3d-gold flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-stone-950 font-nastaliq font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer group"
              title="واپس صفحۂ اول پر جائیں"
            >
              <ArrowLeft className="w-4 h-4 text-stone-950 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
              <span>‹ واپس صفحۂ اول (ڈیش بورڈ)</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 border-r border-emerald-800/60 pr-3 mr-1">
            <span className="text-xs text-emerald-200/80 font-nastaliq">کتاب:</span>
            <span className="text-sm font-arabic font-bold text-amber-300">
              {selectedBook.title}
            </span>
            {selectedBook.darjaUrdu && (
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 font-nastaliq font-bold">
                {selectedBook.darjaUrdu}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsBookDirectoryOpen(true)}
          className="btn-3d-emerald flex items-center gap-2 px-4 py-2 rounded-xl text-amber-200 font-bold text-xs sm:text-sm shadow-md border border-amber-400/40 font-nastaliq transition-all cursor-pointer"
          title="تمام کتب کا کیٹلاگ کھولیں"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>تمام کتب ({booksDatabase.length}) دیکھیں</span>
        </button>
      </div>

      {/* Live Hadith Fetch Notice / Success Banner */}
      {fetchNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs sm:text-sm font-nastaliq flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{fetchNotice}</span>
          </div>
          {isFetchingHadith && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
        </div>
      )}

      {/* Live Fiqh / Shamela Full Text Loading Banner */}
      {isLoadingFullText && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 border-2 border-amber-400/80 text-amber-200 text-xs sm:text-sm font-nastaliq flex items-center justify-between gap-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>المكتبة الشاملة سے «{selectedBook.title}» کے تمام مستند صفحات و مکمل عربی متن حاصل کیا جا رہا ہے...</span>
          </div>
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        </div>
      )}

      {/* Full Text Loaded Confirmation */}
      {fullTextStats && (
        <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-amber-200 text-xs sm:text-sm font-nastaliq flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ماشاء اللہ! «{selectedBook.title}» کا مکمل عربی متن مع {fullTextStats.pages} صفحات، {fullTextStats.chapters} ابواب اور مستند اردو ترجمہ مطالعہ کے لیے دستیاب ہے۔</span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-serif font-bold">
            {fullTextStats.pages} صفحات • مع اردو ترجمہ
          </span>
        </div>
      )}

      {/* Top Category Tabs: تمام کتب | صحاح ستہ | کتب فتاویٰ | درس نظامی | قرآن و تفسیر */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        <button
          onClick={() => setIsBookDirectoryOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-900 text-amber-300 border border-emerald-850 shadow-sm font-bold ring-1 ring-amber-400/30 transition-all hover:bg-emerald-850"
          title="تمام کتب کی فہرست کھولیں"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>تمام کتب ({booksDatabase.length}) — فہرست کھولیں</span>
        </button>

        <button
          onClick={() => {
            if (onOpenKharjiBooks) {
              onOpenKharjiBooks();
            } else {
              setActiveCategory('kharji_kitab');
              const firstKharji = booksDatabase.find(b => b.category === 'kharji_kitab');
              if (firstKharji) { onSelectBook(firstKharji); setActiveChapterIndex(0); }
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 border-2 border-amber-300 shadow-md ring-2 ring-amber-400/40 font-black hover:scale-105 active:scale-95"
          title="۱۰۰۰ خارجی کتب کا خصوصی پاپ اپ پورٹل کھولیں"
        >
          <FolderOpen className="w-4 h-4 text-stone-950" />
          <span>📁 خارجی کتابیں ({booksDatabase.filter(b => b.category === 'kharji_kitab').length} کتب - فوری پاپ اپ)</span>
        </button>

        <button
          onClick={() => {
            setActiveCategory('sittah');
            const firstSittah = booksDatabase.find(b => b.category === 'sittah');
            if (firstSittah) { onSelectBook(firstSittah); setActiveChapterIndex(0); }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer ${
            activeCategory === 'sittah'
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md ring-1 ring-amber-400/40'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <Scroll className="w-4 h-4 text-amber-400" />
          <span>صحاحِ ستہ و امہات الحدیث (8 کتب)</span>
        </button>

        <button
          onClick={() => {
            setActiveCategory('fatawa');
            const firstFatawa = booksDatabase.find(b => b.category === 'fatawa');
            if (firstFatawa) { onSelectBook(firstFatawa); setActiveChapterIndex(0); }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer ${
            activeCategory === 'fatawa'
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md ring-1 ring-amber-400/40'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-400" />
          <span>کتبِ فتاویٰ و فقہ (عالمگیری، شامی، قاضی خان)</span>
        </button>

        <button
          onClick={() => {
            setActiveCategory('dars_curriculum');
            const firstDars = booksDatabase.find(b => b.category === 'dars_curriculum');
            if (firstDars) { onSelectBook(firstDars); setActiveChapterIndex(0); }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer ${
            activeCategory === 'dars_curriculum'
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md ring-1 ring-amber-400/40'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <BookMarked className="w-4 h-4 text-amber-400" />
          <span>درسِ نظامی نصاب (ہدایہ، کنز، کافیہ، قدوری)</span>
        </button>

        <button
          onClick={() => {
            setActiveCategory('quran_tafseer');
            const firstQuran = booksDatabase.find(b => b.category === 'quran_tafseer');
            if (firstQuran) { onSelectBook(firstQuran); setActiveChapterIndex(0); }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer ${
            activeCategory === 'quran_tafseer'
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md ring-1 ring-amber-400/40'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>القرآن والتفاسیر</span>
        </button>
      </div>

      {/* If Kharji Category is active, show the Dedicated Quick Bookshelf Strip */}
      {activeCategory === 'kharji_kitab' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-stone-900 to-emerald-950/90 border-2 border-amber-400/60 shadow-lg space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-amber-300">
              <FolderOpen className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="font-nastaliq font-black text-sm sm:text-base text-amber-200">
                ڈیش بورڈ: کتبِ مطالعہ و خارجی لائبریری (۱۰۰۰ معتمد کتب)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-nastaliq font-bold">
                {booksDatabase.filter(b => b.category === 'kharji_kitab').length} کتب
              </span>
              {onOpenKharjiBooks && (
                <button
                  onClick={() => onOpenKharjiBooks()}
                  className="btn-3d-gold px-3.5 py-1 rounded-xl text-stone-950 font-black font-nastaliq text-xs shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                  <span>✨ ۱۰۰۰ کتب کا پاپ اپ ایکسپلورر</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar p-1">
            {booksDatabase.filter(b => b.category === 'kharji_kitab').map(b => {
              const isCurrent = selectedBook.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    if (onOpenKharjiBooks) {
                      onOpenKharjiBooks(b);
                    } else {
                      onSelectBook(b);
                      setActiveChapterIndex(0);
                    }
                  }}
                  className={`p-2.5 rounded-xl text-center flex flex-col items-center justify-between transition-all cursor-pointer border-2 ${
                    isCurrent
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-lg font-black ring-2 ring-amber-400/40 -translate-y-0.5'
                      : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
                  }`}
                  title="کلک کریں: پاپ اپ میں مطالعہ فرمائیں"
                >
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-nastaliq font-bold mb-1 truncate w-full ${
                    isCurrent ? 'bg-stone-950 text-amber-300' : 'bg-emerald-950/80 text-amber-200 border border-emerald-700/60'
                  }`}>
                    {b.subjectNameUrdu.split('،')[0]}
                  </span>
                  <span className="text-xs font-arabic font-black leading-tight line-clamp-2">
                    {b.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Book & Multi-Language Controls Toolbar */}
      <div className="board-jewel-emerald rounded-2xl p-4 border-2 border-emerald-700/60 shadow-md flex flex-wrap items-center justify-between gap-4 text-amber-50">
        
        {/* Book Selector (Filtered by Category) */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-amber-200 font-nastaliq">کتاب منتخب کریں:</label>
          <select
            value={selectedBook.id}
            onChange={(e) => {
              const b = booksDatabase.find(x => x.id === e.target.value);
              if (b) {
                onSelectBook(b);
                setActiveChapterIndex(0);
              }
            }}
            className="px-3 py-1.5 rounded-xl input-jewel text-xs sm:text-sm font-arabic font-bold text-amber-200 focus:outline-none"
          >
            {filteredBooks.map(b => (
              <option key={b.id} value={b.id}>
                {b.title} — ({b.subjectNameUrdu})
              </option>
            ))}
          </select>
        </div>

        {/* Chapter / Hadith Direct Dropdown Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-amber-200 font-nastaliq">
            {selectedBook.category === 'sittah' ? 'حدیث منتخب کریں:' : 'باب / سورت:'}
          </label>
          <select
            value={activeChapterIndex}
            onChange={(e) => {
              setActiveChapterIndex(Number(e.target.value));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-stone-700 bg-amber-50/70 dark:bg-stone-800 text-xs sm:text-sm font-arabic font-bold text-emerald-950 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[220px] sm:max-w-[300px] truncate shadow-xs"
          >
            {chapters.map((ch, idx) => (
              <option key={ch.id || idx} value={idx}>
                {isHadith ? `حدیث ${extractHadithNumber(ch, idx)}: ` : `${idx + 1}. `}{ch.titleArabic}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Hadith Number Jump in Toolbar */}
        {isHadith && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const num = parseInt(directHadithInput.trim(), 10);
              if (!isNaN(num) && num >= 1) {
                handleLookupHadithNumber(num);
                setDirectHadithInput('');
              }
            }}
            className="flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-700/60 shadow-xs"
          >
            <span className="text-xs font-bold text-amber-300 font-nastaliq">حدیث نمبر:</span>
            <input
              type="number"
              min="1"
              max="7563"
              value={directHadithInput}
              onChange={(e) => setDirectHadithInput(e.target.value)}
              placeholder="1، 2، 5..."
              className="w-14 sm:w-16 px-2 py-0.5 rounded-lg bg-emerald-900/90 text-white text-xs border border-emerald-600 focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans"
            />
            <button
              type="submit"
              disabled={isFetchingHadith || !directHadithInput.trim()}
              className="px-2 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs font-nastaliq cursor-pointer shadow-xs disabled:opacity-50"
            >
              جائیں
            </button>
          </form>
        )}

        {/* Page / Ruku Direct Selector */}
        {totalSegments > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-amber-200 font-nastaliq">
              {isQuran ? 'صفحہ / رکوع:' : 'صفحہ / عبارت:'}
            </label>
            <select
              value={safeSegmentIndex}
              onChange={(e) => {
                setActiveSegmentIndex(Number(e.target.value));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-stone-700 bg-amber-50/90 dark:bg-stone-800 text-xs sm:text-sm font-arabic font-bold text-emerald-950 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[200px] truncate shadow-xs"
            >
              {segmentsList.map((seg: BookSegment, idx: number) => (
                <option key={seg.id || idx} value={idx}>
                  {idx + 1}. {isQuran ? `رکوع ${idx + 1}` : `صفحہ ${idx + 1}`} ({seg.arabicText.slice(0, 26)}...)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reading Mode Switcher (Page Mode vs Scroll Mode) */}
        <button
          onClick={() => setReadingMode(prev => prev === 'page' ? 'scroll' : 'page')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md transition-all font-nastaliq cursor-pointer ${
            readingMode === 'page'
              ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 ring-2 ring-amber-500/50'
              : 'bg-emerald-950 text-amber-200 hover:bg-emerald-900 border border-emerald-600'
          }`}
          title={readingMode === 'page' ? 'تمام صفحات مسلسل اسکرول میں دیکھیں' : 'ایک ایک صفحہ / رکوع مطالعہ موڈ آن کریں'}
        >
          {readingMode === 'page' ? (
            <>
              <BookOpen className="w-4 h-4 text-stone-950" />
              <span>📖 صفحہ وار مطالعہ (فعال)</span>
            </>
          ) : (
            <>
              <Scroll className="w-4 h-4 text-amber-300" />
              <span>📜 مسلسل اسکرول (فعال)</span>
            </>
          )}
        </button>

        {/* Button to open full Chapter & Hadith Index Drawer */}
        <button
          onClick={() => setIsIndexOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-all ring-1 ring-amber-600/30 font-nastaliq"
          title="کتاب کے تمام ابواب و احادیث کی مکمل فہرست کھولیں"
        >
          <List className="w-4 h-4" />
          <span>فہرستِ {selectedBook.category === 'sittah' ? 'احادیث' : 'ابواب'} ({chapters.length})</span>
        </button>

        {/* Button to open In-Book Full Text Search */}
        <button
          onClick={() => setIsInBookSearchOpen(prev => !prev)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold font-nastaliq shadow-md transition-all cursor-pointer ${
            isInBookSearchOpen 
              ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500/50' 
              : 'card-jewel-dark text-amber-200 border border-emerald-700/60 hover:border-amber-400'
          }`}
          title="اس کتاب کے تمام صفحات و متون میں تلاش کریں"
        >
          <Search className="w-4 h-4 text-amber-400" />
          <span>کتاب میں تلاش</span>
        </button>

        {/* Original PDF View Button */}
        {selectedBook.pdfUrl && (
          <a
            href={selectedBook.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold font-nastaliq shadow-md transition-all cursor-pointer bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white border border-rose-400/60"
            title="اس کتاب کا اصل PDF نسخہ نئی ونڈو میں ملاحظہ فرمائیں"
          >
            <FileText className="w-4 h-4 text-rose-200" />
            <span>اصل PDF نسخہ</span>
          </a>
        )}

        {/* Maktaba Shamela Online Button */}
        {selectedBook.shamelaUrl && (
          <a
            href={selectedBook.shamelaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold font-nastaliq shadow-md transition-all cursor-pointer bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-700 hover:to-teal-800 text-amber-200 border border-emerald-500/60"
            title="المكتبة الشاملة میں یہ کتاب آن لائن مطالعہ فرمائیں"
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span>المكتبة الشاملة</span>
          </a>
        )}

        {/* Islam 360 Reference Button */}
        {selectedBook.islam360Url && (
          <a
            href={selectedBook.islam360Url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold font-nastaliq shadow-md transition-all cursor-pointer bg-gradient-to-r from-sky-900 to-indigo-950 hover:from-sky-800 hover:to-indigo-900 text-sky-200 border border-sky-500/60"
            title="اسلام 360 پر متعلقہ حدیث و قرآن حوالہ ملاحظہ فرمائیں"
          >
            <ExternalLink className="w-4 h-4 text-sky-300" />
            <span>اسلام 360</span>
          </a>
        )}

        {/* Print / PDF Export Button */}
        <button
          onClick={() => setIsExportPrintOpen(true)}
          className="btn-3d-gold flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-stone-950 font-bold text-xs shadow-md transition-all font-nastaliq cursor-pointer"
          title="کتاب یا باب کا پرنٹ نکالیں یا پی ڈی ایف محفوظ کریں"
        >
          <Printer className="w-4 h-4 text-stone-950" />
          <span>پرنٹ / PDF محفوظ کریں</span>
        </button>

        {/* Offline Book Saver Button */}
        <button
          onClick={handleToggleOffline}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold font-nastaliq shadow-md transition-all cursor-pointer ${
            isSavedOffline
              ? 'bg-emerald-700 hover:bg-emerald-600 text-amber-200 border border-amber-400/80 ring-2 ring-emerald-500/30'
              : 'card-jewel-dark text-amber-200 border border-emerald-700/60 hover:border-amber-400'
          }`}
          title={isSavedOffline ? 'کتاب آف لائن محفوظ ہے۔ کلک کر کے خارج کر سکتے ہیں' : 'اس کتاب کو مکمل آف لائن میموری میں محفوظ کریں'}
        >
          <HardDrive className={`w-4 h-4 ${isSavedOffline ? 'text-amber-300' : 'text-emerald-400'}`} />
          <span>{isSavedOffline ? '🟢 آف لائن محفوظ شدہ' : '💾 آف لائن محفوظ کریں'}</span>
        </button>

        {/* Offline Books Manager Modal Trigger */}
        <button
          onClick={() => setIsOfflineManagerOpen(true)}
          className="card-jewel-dark flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold font-nastaliq text-amber-200 border border-emerald-700/60 hover:border-amber-400 shadow-sm cursor-pointer"
          title="تمام آف لائن محفوظ شدہ کتب کی فہرست دیکھیں"
        >
          <DownloadCloud className="w-4 h-4 text-amber-400" />
          <span>آف لائن مینیجر</span>
        </button>

        {/* Multi-Language Translation Selector (User's requirement) */}
        <div className="flex items-center gap-2 bg-amber-50/80 dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-amber-300/70 dark:border-stone-700">
          <Globe2 className="w-4 h-4 text-amber-600" />
          <label className="text-xs font-bold font-nastaliq text-amber-950 dark:text-amber-200">ترجمہ کی زبان:</label>
          <select
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value as SupportedLanguage)}
            className="px-2 py-0.5 rounded-lg border border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs font-bold text-emerald-800 dark:text-emerald-400 focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.nameNative} ({lang.nameUrdu})
              </option>
            ))}
          </select>
        </div>

        {/* View, Layout & Typography Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Dual vs Single Pane Toggle */}
          <button
            onClick={() => setIsDualPane(!isDualPane)}
            title={isDualPane ? 'سنگل پیج موڈ (مکمل چوڑا متن)' : 'دو رخی مطالعہ (متن اور شرح ایک ساتھ)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              !isDualPane
                ? 'bg-emerald-900 text-amber-300 border-emerald-800 shadow-sm ring-1 ring-amber-400/30'
                : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {!isDualPane ? <Square className="w-4 h-4 text-amber-400" /> : <Columns2 className="w-4 h-4" />}
            <span>{!isDualPane ? 'مکمل چوڑا متن' : 'دو رخی ویو'}</span>
          </button>

          {/* Matn Contrast Preset Selector */}
          <div className="flex items-center border border-amber-300/80 dark:border-stone-700 rounded-xl p-0.5 bg-amber-50/70 dark:bg-stone-800">
            <button
              onClick={() => handleSetMatnTheme('mushaf')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                matnTheme === 'mushaf'
                  ? 'bg-white text-stone-950 shadow-xs border border-amber-500/50'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
              title="طرزِ مصحف: سفید پس منظر، گہری کالی سیاہی (اعلیٰ ترین کنٹراسٹ)"
            >
              مصحفی سفید
            </button>
            <button
              onClick={() => handleSetMatnTheme('parchment')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                matnTheme === 'parchment'
                  ? 'bg-emerald-900 text-amber-300 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
              title="طرزِ قرطاس: عنبری کاغذ و گہری تحریر"
            >
              عنبری قرطاس
            </button>
            <button
              onClick={() => handleSetMatnTheme('night')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                matnTheme === 'night'
                  ? 'bg-stone-950 text-amber-300 shadow-xs border border-amber-400/40'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
              title="طرزِ شبینہ: ڈارک کنٹراسٹ و سنہری حروف"
            >
              شبینہ طلائی
            </button>
          </div>

          {/* Matn Boldness Toggle for thick, clear Tashkeel */}
          <button
            onClick={() => setIsMatnBold(!isMatnBold)}
            title="اعراب و متن کی ضخامت (Bold یا معتدل)"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isMatnBold
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-950 dark:text-amber-200 ring-1 ring-amber-400/40'
                : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <span className="font-extrabold text-sm font-serif">B</span>
            <span>{isMatnBold ? 'جلی اعراب (Bold)' : 'معتدل'}</span>
          </button>

          {/* Font Controls */}
          <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-xl p-0.5 bg-stone-50 dark:bg-stone-800">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 text-xs rounded-lg ${fontSize === 'normal' ? 'bg-white dark:bg-stone-700 shadow-xs font-bold text-emerald-950 dark:text-emerald-300' : 'text-stone-500'}`}
              title="متوسط فونٹ"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 text-xs rounded-lg ${fontSize === 'large' ? 'bg-white dark:bg-stone-700 shadow-xs font-bold text-emerald-950 dark:text-emerald-300' : 'text-stone-500'}`}
              title="معیاری بڑا فونٹ"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 text-xs rounded-lg ${fontSize === 'xlarge' ? 'bg-white dark:bg-stone-700 shadow-xs font-bold text-emerald-950 dark:text-emerald-300' : 'text-stone-500'}`}
              title="انتہائی جلی و کلاں فونٹ"
            >
              A+
            </button>
          </div>

          {/* Arabic Font Family */}
          <button
            onClick={() => {
              if (fontFamily === 'amiri') setFontFamily('scheherazade');
              else if (fontFamily === 'scheherazade') setFontFamily('lateef');
              else setFontFamily('amiri');
            }}
            title="عربی خط تبدیل کریں (امیری / شہرزاد / لطیف)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-arabic text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <Type className="w-3.5 h-3.5 text-amber-500" />
            <span>{fontFamily === 'amiri' ? 'خطِ امیری' : fontFamily === 'scheherazade' ? 'خطِ شہرزاد' : 'خطِ لطیف'}</span>
          </button>
        </div>
      </div>

      {/* In-Book Search Drawer / Panel */}
      {isInBookSearchOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border-2 border-amber-500/60 shadow-xl space-y-3 font-nastaliq animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm sm:text-base font-black text-amber-200">
                کتاب کے اندر تلاش کریں: <span className="font-arabic text-amber-100">{selectedBook.title}</span>
              </h4>
            </div>
            <button
              onClick={() => {
                setIsInBookSearchOpen(false);
                setInBookQuery('');
              }}
              className="text-stone-400 hover:text-stone-100 text-xs px-2.5 py-1 rounded-lg bg-stone-800 cursor-pointer"
            >
              ✕ بند کریں
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={inBookQuery}
              onChange={(e) => setInBookQuery(e.target.value)}
              placeholder="عربی عبارت یا اردو ترجمہ میں تلاش کریں (مثلاً: نماز، صلوٰة، زکاة، نیت)..."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
              autoFocus
            />
            {inBookQuery && (
              <button
                onClick={() => setInBookQuery('')}
                className="absolute left-3 top-2.5 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                صاف کریں
              </button>
            )}
          </div>

          {inBookQuery.trim().length >= 2 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>ملنے والے نتائج: <strong className="text-amber-300">{inBookResults.length}</strong></span>
              </div>

              {inBookResults.length === 0 ? (
                <p className="text-xs text-stone-400 py-2">اس کتاب میں درج کردہ لفظ سے متعلق کوئی عبارت نہیں ملی۔</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {inBookResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveChapterIndex(res.chapterIndex);
                        setActiveSegmentIndex(res.segmentIndex);
                        setIsInBookSearchOpen(false);
                        const viewport = document.getElementById('reader-page-viewport');
                        if (viewport) viewport.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-right p-3 rounded-xl bg-stone-950/80 hover:bg-emerald-950/80 border border-stone-800 hover:border-amber-500/50 transition-all text-xs group cursor-pointer space-y-1 block"
                    >
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span>{res.chapterTitle} — صفحہ {res.pageNumber}</span>
                        <span className="text-[10px] text-stone-400 group-hover:text-amber-300">مطالعہ فرمائیں ‹</span>
                      </div>
                      <p className="text-stone-300 line-clamp-2 leading-relaxed">{res.textSnippet}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Book & Chapter Banner - 2026 3D Royal Frame */}
      <div className="hero-3d-royal text-center py-7 px-6 text-white rounded-3xl border-3 border-[#d4af37] shadow-2xl space-y-3 relative overflow-hidden group">
        <div className="flex justify-center items-center gap-3">
          <span className="text-xs px-3.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black font-nastaliq shadow-md">
            {selectedBook.subjectNameUrdu}
          </span>
          <span className="text-xs px-3.5 py-1 rounded-full bg-white/25 text-white font-black font-nastaliq shadow-md border border-white/20">
            {selectedBook.grade}
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-amiri text-amber-200 tracking-wide drop-shadow-[0_4px_14px_rgba(0,0,0,0.8)]" dir="rtl">
          {selectedBook.title}
        </h2>
        <p className="text-sm sm:text-base text-emerald-200 font-black font-nastaliq drop-shadow-sm">
          مؤلف: {selectedBook.author}
        </p>
        
        {/* Chapter Title in Authentic Arabic & Nastaliq */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <span className="text-xl sm:text-2xl font-black font-amiri text-amber-100 drop-shadow-sm" dir="rtl">
            {currentChapter?.titleArabic}
          </span>
          {currentChapter?.titleUrdu && (
            <>
              <span className="text-amber-400 font-bold">•</span>
              <span className="text-base sm:text-lg font-black font-nastaliq text-emerald-100">
                {currentChapter?.titleUrdu}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Page / Ruku / Chapter Navigation Bar - 2026 3D Controls */}
      <div className="card-3d-luxury p-3.5 sm:p-5 rounded-2xl border-2 border-[#caa870] dark:border-stone-700 shadow-xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={isHadith ? isFirstHadith : (readingMode === 'page' ? (!hasPrevSegment && !hasPrevChapter) : !hasPrevChapter)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black font-nastaliq transition-all cursor-pointer ${
              (isHadith ? isFirstHadith : (readingMode === 'page' ? (!hasPrevSegment && !hasPrevChapter) : !hasPrevChapter))
                ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800 text-stone-400 border border-stone-200 dark:border-stone-700'
                : 'btn-3d-gold text-stone-950 shadow-md active:scale-95'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-stone-950 font-bold" />
            <span>
              {isHadith
                ? !isFirstHadith
                  ? `➡ پچھلی حدیث (حدیث ${currentHadithNumber - 1})`
                  : 'کتاب کی ابتدا'
                : readingMode === 'page'
                ? hasPrevSegment
                  ? `پچھلا ${segmentLabel} (${safeSegmentIndex} از ${totalSegments})`
                  : hasPrevChapter
                  ? `پچھلی ${chapterLabel}: ${prevChapter?.titleUrdu || prevChapter?.titleArabic}`
                  : 'کتاب کی ابتدا'
                : hasPrevChapter
                ? `پچھلی ${chapterLabel}: ${prevChapter?.titleUrdu || prevChapter?.titleArabic}`
                : 'کتاب کی ابتدا'}
            </span>
          </button>

          {/* Center: Current Page & Chapter Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="bg-emerald-900/90 text-amber-300 border border-emerald-700 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-nastaliq font-bold shadow-xs">
              {isHadith ? `حدیث مبارکہ ${currentHadithNumber} از ${totalHadithsInBook}` : (currentChapter?.titleUrdu || currentChapter?.titleArabic)}
            </span>
            {!isHadith && readingMode === 'page' && totalSegments > 1 && (
              <span className="bg-amber-400 text-stone-950 px-3 py-1.5 rounded-xl text-xs font-black font-nastaliq shadow-xs flex items-center gap-1.5">
                <span>{segmentLabel}:</span>
                <span className="font-serif font-black">{safeSegmentIndex + 1} از {totalSegments}</span>
              </span>
            )}
            <button
              onClick={() => setIsIndexOpen(true)}
              className="btn-3d-emerald flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-amber-200 font-bold text-xs shadow-md transition-all active:scale-95 font-nastaliq cursor-pointer"
            >
              <Scroll className="w-3.5 h-3.5 text-amber-300" />
              <span>فہرستِ {isHadith ? 'احادیث' : 'ابواب'}</span>
            </button>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={isHadith ? isLastHadith : (readingMode === 'page' ? (!hasNextSegment && !hasNextChapter) : !hasNextChapter)}
            className={`btn-3d-gold text-stone-950 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black font-nastaliq transition-all cursor-pointer shadow-md active:scale-95 ${
              (isHadith ? isLastHadith : (readingMode === 'page' ? (!hasNextSegment && !hasNextChapter) : !hasNextChapter))
                ? 'opacity-40 cursor-not-allowed pointer-events-none'
                : ''
            }`}
          >
            <span>
              {isHadith
                ? !isLastHadith
                  ? `اگلی حدیث (حدیث ${currentHadithNumber + 1}) پر جائیں ⬅`
                  : 'کتاب کا اختتام'
                : readingMode === 'page'
                ? hasNextSegment
                  ? `اگلا ${segmentLabel} (${safeSegmentIndex + 2} از ${totalSegments})`
                  : hasNextChapter
                  ? `اگلی ${chapterLabel}: ${nextChapter?.titleUrdu || nextChapter?.titleArabic}`
                  : 'کتاب کا اختتام'
                : hasNextChapter
                ? `اگلی ${chapterLabel}: ${nextChapter?.titleUrdu || nextChapter?.titleArabic}`
                : 'کتاب کا اختتام'}
            </span>
            <ChevronLeft className="w-4 h-4 text-stone-950 font-bold" />
          </button>
        </div>

        {/* Quick Page Jump Pills Bar */}
        {isHadith ? (
          <div className="pt-2 border-t border-amber-200/60 dark:border-stone-700/60 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-nastaliq font-bold text-emerald-950 dark:text-emerald-300 pl-1">
              احادیث مبارکہ:
            </span>
            {chapters.slice(0, 50).map((ch, chI) => {
              const hadithNum = extractHadithNumber(ch, chI);
              const isCurrent = chI === activeChapterIndex;
              return (
                <button
                  key={ch.id || chI}
                  onClick={() => {
                    setActiveChapterIndex(chI);
                    setActiveSegmentIndex(0);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-nastaliq transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-800 text-amber-200 shadow-md ring-2 ring-amber-400 scale-105 font-black'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600'
                  }`}
                  title={ch.titleUrdu}
                >
                  حدیث {hadithNum}
                </button>
              );
            })}
          </div>
        ) : totalSegments > 1 ? (
          <div className="pt-2 border-t border-amber-200/60 dark:border-stone-700/60 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-nastaliq font-bold text-emerald-950 dark:text-emerald-300 pl-1">
              {isFiqh ? 'صفحاتِ کتاب:' : 'صفحات / رکوعات:'}
            </span>
            {segmentsList.map((seg, sI) => {
              const isCurrent = readingMode === 'page' && sI === safeSegmentIndex;
              return (
                <button
                  key={seg.id || sI}
                  onClick={() => handleJumpToSegment(sI)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-nastaliq transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-800 text-amber-200 shadow-md ring-2 ring-amber-400 scale-105'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600'
                  }`}
                  title={`${segmentLabel} ${sI + 1}`}
                >
                  {isQuran ? `رکوع ${sI + 1}` : `صفحہ ${sI + 1}`}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {/* Segments Stream with Standard 3-Pillars — Dedicated Book Page Auto-Scroll Viewport */}
      <div
        ref={readerViewportRef}
        id="reader-page-viewport"
        className="space-y-6 max-h-[78vh] overflow-y-auto pr-1 sm:pr-2 scroll-smooth rounded-3xl"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#b45309 transparent' }}
      >
        {(readingMode === 'page' ? (currentSegment ? [currentSegment] : []) : segmentsList).map((segment: BookSegment, sIdx: number) => {
          const effectiveIndex = readingMode === 'page' ? safeSegmentIndex : sIdx;
          const defaultTab = (isFiqh && currentLang === 'ur') ? 'tashreeh' : 'translation';
          const currentTab = activePillarTab[segment.id] || defaultTab;
          const isHighlighted = highlightSegmentId === segment.id;

          // Get translation in selected language
          const transKey = `${segment.id}___${currentLang}`;
          const isTranslatingThis = Boolean(translatingIds[transKey] && !dynamicTranslations[transKey] && currentLang !== 'ur');

          const isGenericTemplate = (text: string) => {
            return (
              text.includes('اس فقہی عبارت میں') ||
              text.includes('اس عبارت میں فقہی مسئلہ') ||
              text.includes('(اس کا)') ||
              text.includes('(وہ سب)') ||
              text.includes('(ان کا)')
            );
          };

          // 1. Take urdu_tarjuma from segment.urduTranslation (Cloudflare D1 / bundle)
          // 2. If empty or same as Arabic, fallback immediately to fiqhUrduTranslator for AI translation!
          let effectiveUrdu = segment.urduTranslation?.trim() || '';
          if (isFiqh && (!effectiveUrdu || isSameAsArabic(effectiveUrdu, segment.arabicText) || !isUrduText(effectiveUrdu, segment.arabicText) || isGenericTemplate(effectiveUrdu))) {
            effectiveUrdu = translateArabicFiqhToUrdu(
              segment.arabicText,
              currentChapter?.titleArabic || currentChapter?.titleUrdu || '',
              selectedBook.id,
              false
            );
          }

          const translationText = currentLang === 'ur'
            ? effectiveUrdu
            : (segment.translations?.[currentLang] || dynamicTranslations[transKey] || effectiveUrdu);

          const displayTranslation = fiqhSource && currentLang === 'ur' && translationText
            ? translationText.replace(/^【[\s\S]*?】\s*\n\([^)]+\)\s*\n\s*/, '').trim()
            : translationText;

          // Paragraph breakdown for Fiqh
          const arabicParas = segment.arabicText
            ? segment.arabicText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
            : [];

          const cleanUrduTarjuma = (segment.urduTranslation || '')
            .replace(/^【[\s\S]*?】\s*\n\([^)]+\)\s*\n\s*/, '')
            .trim();

          const urduParas = cleanUrduTarjuma
            ? cleanUrduTarjuma.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
            : [];

          const getParaUrduTranslation = (pIdx: number, arText: string): string => {
            // 1) First try to get urdu_tarjuma from D1 / static bundle
            const candidate = urduParas[pIdx]?.trim();
            // 2) If empty, same as Arabic, not authentic Urdu, or stale template, immediately call fiqhUrduTranslator.translateParagraph(arabicText) to generate unique Urdu
            if (
              candidate &&
              candidate.length > 0 &&
              !isSameAsArabic(candidate, arText) &&
              isUrduText(candidate, arText) &&
              !isGenericTemplate(candidate)
            ) {
              return candidate;
            }
            return translateParagraph(
              arText,
              currentChapter?.titleArabic || currentChapter?.titleUrdu || '',
              selectedBook.id
            );
          };


          return (
            <div 
              key={segment.id}
              id={segment.id}
              className={`rounded-3xl card-3d-interactive transition-all ${
                isHighlighted 
                  ? 'ring-4 ring-amber-400 border-amber-500 shadow-xl' 
                  : theme === 'parchment'
                  ? 'bg-[#fcfaf5] border-2 border-[#e8ddc7]'
                  : 'bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800'
              } p-5 sm:p-7 space-y-5`}
            >
              {/* Academic Passage Breadcrumbs Header (Explicit Book, Chapter/Surah & Ayah/Segment Number) */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center text-xs font-bold font-serif shadow-xs">
                    {effectiveIndex + 1}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-nastaliq">
                    <span className="text-emerald-950 dark:text-emerald-300 font-bold">{selectedBook.title}</span>
                    <span className="text-stone-300 dark:text-stone-600">‹</span>
                    <span className="text-stone-600 dark:text-stone-300 font-semibold">{currentChapter?.titleUrdu || currentChapter?.titleArabic}</span>
                    <span className="text-stone-300 dark:text-stone-600">‹</span>
                    <span className="text-amber-800 dark:text-amber-400 font-bold">
                      {selectedBook.category === 'quran_tafseer' ? `آیت مبارکہ ${effectiveIndex + 1}` : `فقرہ / عبارت ${effectiveIndex + 1}`}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 font-arabic font-bold">
                  النَّصُّ المُشَكَّلُ بِالإِعْرَابِ التَّامِّ
                </span>
              </div>
              
              {/* Dual Pane or Stacked Layout */}
              <div className={`grid ${isDualPane ? 'grid-cols-1 lg:grid-cols-2 gap-6' : 'grid-cols-1 gap-6'}`}>
                
                {/* Arabic Matn Column with Complete Diacritics (High Contrast & Clear Typography) */}
                <div className={`space-y-4 ${isDualPane ? 'border-b lg:border-b-0 lg:border-l lg:border-stone-200 dark:lg:border-stone-800 pb-5 lg:pb-0 lg:pl-6' : ''}`}>
                  
                  {/* Dedicated Content Column: Paragraph-by-Paragraph for Fiqh, Monolithic for Quran/Hadith */}
                  {isFiqh ? (
                    <div className="space-y-6">
                      {/* Dedicated Scholarly Attribution Header & Quick Theme Switcher */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 dark:bg-stone-850/90 border border-amber-300/80 dark:border-amber-700/60 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold font-nastaliq shadow-xs ${
                            fiqhSource?.isPublishedClassical
                              ? 'bg-emerald-900 text-amber-200 ring-1 ring-amber-400/50'
                              : 'bg-amber-600 text-white ring-1 ring-amber-300/50'
                          }`}>
                            {fiqhSource?.isPublishedClassical ? '📜 مستند مطبوعہ درسی اردو ترجمہ' : '✨ AI فقہی ترجمہ بر اصولِ احناف'}
                          </span>
                          <div className="text-xs font-nastaliq">
                            <span className="text-stone-600 dark:text-stone-400">مترجم و ماخذ: </span>
                            <strong className="text-emerald-950 dark:text-emerald-300 font-bold">
                              {fiqhSource?.translatorName || 'علمائے احناف و معتمد اردو تراجم'}
                            </strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quick theme selector */}
                          <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-0.5 rounded-lg text-[11px] font-nastaliq border border-stone-200 dark:border-stone-700">
                            <button
                              onClick={() => handleSetMatnTheme('mushaf')}
                              className={`px-2 py-0.5 rounded font-bold transition-all ${matnTheme === 'mushaf' ? 'bg-amber-100 text-stone-950 shadow-xs ring-1 ring-amber-500/40' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'}`}
                              title="مصحفی سفید"
                            >
                              مصحفی سفید
                            </button>
                            <button
                              onClick={() => handleSetMatnTheme('parchment')}
                              className={`px-2 py-0.5 rounded font-bold transition-all ${matnTheme === 'parchment' ? 'bg-amber-200 text-emerald-950 shadow-xs ring-1 ring-emerald-600/40' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'}`}
                              title="عنبری قرطاس"
                            >
                              عنبری قرطاس
                            </button>
                            <button
                              onClick={() => handleSetMatnTheme('night')}
                              className={`px-2 py-0.5 rounded font-bold transition-all ${matnTheme === 'night' ? 'bg-stone-900 text-amber-300 shadow-xs ring-1 ring-amber-400/40' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'}`}
                              title="شبینہ طلائی"
                            >
                              شبینہ طلائی
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSendToAI(segment.arabicText, selectedBook.title)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-xs transition-transform active:scale-95 font-nastaliq cursor-pointer"
                            title="اے آئی سے اس صفحے کا فقہی حل پوچھیں"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                            <span>AI سے حل</span>
                          </button>
                        </div>
                      </div>

                      {/* Paragraph-by-Paragraph Stream: Each Arabic paragraph followed directly by its Urdu translation box */}
                      <div className="space-y-6">
                        {(arabicParas.length > 0 ? arabicParas : [segment.arabicText]).map((arPara, pIdx) => {
                          const paraUrdu = getParaUrduTranslation(pIdx, arPara);
                          return (
                            <div key={pIdx} className="space-y-3">
                              {/* 1. Arabic Matn Paragraph Card */}
                              <div className={`${getMatnBoxClass()} rounded-3xl p-5 sm:p-7 space-y-3 transition-all border shadow-xs`}>
                                <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-amber-400 animate-pulse"></span>
                                    <span className="text-xs text-emerald-950 dark:text-emerald-300 font-bold font-arabic">
                                      عربی عبارت (فقرہ {pIdx + 1})
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-stone-600 dark:text-stone-400 font-nastaliq">
                                    لغت و تحقیق کے لیے کسی بھی لفظ پر کلک کریں
                                  </span>
                                </div>

                                {/* Clickable Words */}
                                <div
                                  dir="rtl"
                                  className={`${getFontSizeClass()} ${
                                    fontFamily === 'amiri' 
                                      ? 'font-amiri' 
                                      : fontFamily === 'scheherazade' 
                                      ? 'font-scheherazade' 
                                      : 'font-lateef'
                                  } ${getMatnTextClass()} selection:bg-amber-300 selection:text-stone-950 text-right leading-loose`}
                                >
                                  {arPara.split(' ').map((word, wIdx) => {
                                    const cleanTarget = lookupWord ? lookupWord.replace(/[.,:;!?()،؛؟"«»۝0-9٠-٩]/g, '').trim() : '';
                                    const cleanW = word.replace(/[.,:;!?()،؛؟"«»۝0-9٠-٩]/g, '').trim();
                                    const isSelected = cleanTarget && (cleanW === cleanTarget);

                                    return (
                                      <span
                                        key={wIdx}
                                        onClick={() => handleWordClick(word, segment)}
                                        className={`cursor-pointer rounded-lg px-1.5 py-0.5 transition-all inline-block ${
                                          isSelected
                                            ? 'bg-amber-300 text-stone-950 font-bold ring-2 ring-amber-600 shadow-sm scale-105'
                                            : matnTheme === 'night'
                                            ? 'hover:bg-amber-400/30 hover:text-amber-200'
                                            : 'hover:bg-amber-200 hover:text-stone-950'
                                        }`}
                                        title="لغت و درسی تحقیق کے لیے کلک فرمائیں"
                                      >
                                        {word}{' '}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 2. Dedicated Urdu Translation Box for this specific Paragraph */}
                              <div 
                                style={{
                                  backgroundColor: '#FFFBEA',
                                  color: '#000000',
                                  border: '2px solid #E6D28C',
                                  borderRight: '6px solid #D97706',
                                  filter: 'none',
                                  WebkitBackdropFilter: 'none',
                                  backdropFilter: 'none'
                                }}
                                className="rounded-2xl p-4 sm:p-5 shadow-xs space-y-2"
                              >
                                <div className="flex items-center justify-between border-b border-amber-300/70 pb-2">
                                  <div className="flex items-center gap-2 text-xs font-nastaliq font-bold" style={{ color: '#000000' }}>
                                    <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                                    <span className="font-bold text-sm">اردو ترجمہ و شرعی مفہوم (پیراگراف {pIdx + 1}):</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onSendToAI(arPara, selectedBook.title)}
                                    className="text-xs hover:underline font-nastaliq font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    style={{ color: '#000000' }}
                                    title="اے آئی سے اس پیراگراف کا تفصیلی حل پوچھیں"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                                    <span>AI سے فقرہ حل کروائیں</span>
                                  </button>
                                </div>
                                <p 
                                  dir="rtl"
                                  style={{
                                    color: '#000000',
                                    fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Urdu Typesetting', serif",
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    lineHeight: '2.4',
                                    textAlign: 'justify',
                                    filter: 'none',
                                    WebkitBackdropFilter: 'none',
                                    backdropFilter: 'none'
                                  }}
                                  className="whitespace-pre-line select-text font-nastaliq font-bold text-[18px] text-black"
                                >
                                  {paraUrdu}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {fiqhSource?.notes && (
                        <div className="text-xs text-stone-600 dark:text-stone-400 font-nastaliq flex items-center gap-1.5 p-3 bg-stone-100/80 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">📖 ماخذ و نسخہ:</span>
                          <span>{fiqhSource.notes}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Standard Monolithic Matn Frame for Quran / Hadith */
                    <div className={`${getMatnBoxClass()} rounded-3xl p-5 sm:p-8 space-y-4 transition-all`}>
                      {/* Header inside Matn Frame with Quick In-Place Theme Switcher */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-amber-400 animate-pulse"></span>
                          <span className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-300 font-bold font-arabic">
                            النَّصُّ المَتْنِيُّ بِالتَّشْكِيلِ وَالإِعْرَابِ التَّامِّ
                          </span>
                        </div>

                        {/* In-place quick theme selector right above text */}
                        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-850 p-0.5 rounded-lg text-[11px] font-nastaliq border border-stone-200 dark:border-stone-700">
                          <button
                            onClick={() => handleSetMatnTheme('mushaf')}
                            className={`px-2 py-0.5 rounded font-bold transition-all ${matnTheme === 'mushaf' ? 'bg-white text-stone-950 shadow-xs ring-1 ring-amber-500/40' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'}`}
                            title="مصحفی سفید: سفید پس منظر اور گہری کالی سیاہی"
                          >
                            مصحفی سفید
                          </button>
                          <button
                            onClick={() => handleSetMatnTheme('parchment')}
                            className={`px-2 py-0.5 rounded font-bold transition-all ${matnTheme === 'parchment' ? 'bg-amber-100 text-emerald-950 shadow-xs ring-1 ring-emerald-600/40' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'}`}
                            title="عنبری قرطاس: روایتی قلمی نسخہ"
                          >
                            عنبری قرطاس
                          </button>
                          <button
                            onClick={() => handleSetMatnTheme('night')}
                            className={`px-2 py-0.5 rounded font-bold transition-all ${matnTheme === 'night' ? 'bg-stone-900 text-amber-300 shadow-xs ring-1 ring-amber-400/40' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'}`}
                            title="شبینہ طلائی: ڈارک کنٹراسٹ"
                          >
                            شبینہ طلائی
                          </button>
                        </div>
                      </div>

                      {/* Words with High-Contrast Click-to-lookup */}
                      <div 
                        dir="rtl"
                        className={`${getFontSizeClass()} ${
                          fontFamily === 'amiri' 
                            ? 'font-amiri' 
                            : fontFamily === 'scheherazade' 
                            ? 'font-scheherazade' 
                            : 'font-lateef'
                        } ${getMatnTextClass()} selection:bg-amber-300 selection:text-stone-950 text-right`}
                      >
                        {segment.arabicText.split(' ').map((word, wIdx) => {
                          const cleanTarget = lookupWord ? lookupWord.replace(/[.,:;!?()،؛؟"«»۝0-9٠-٩]/g, '').trim() : '';
                          const cleanW = word.replace(/[.,:;!?()،؛؟"«»۝0-9٠-٩]/g, '').trim();
                          const isSelected = cleanTarget && (cleanW === cleanTarget);

                          return (
                            <span
                              key={wIdx}
                              onClick={() => handleWordClick(word, segment)}
                              className={`cursor-pointer rounded-lg px-1.5 py-0.5 transition-all inline-block ${
                                isSelected
                                  ? 'bg-amber-300 text-stone-950 font-bold ring-2 ring-amber-600 shadow-sm scale-105'
                                  : matnTheme === 'night'
                                  ? 'hover:bg-amber-400/30 hover:text-amber-200'
                                  : 'hover:bg-amber-200 hover:text-stone-950'
                              }`}
                              title="لغت و درسی تحقیق کے لیے کلک فرمائیں"
                            >
                              {word}{' '}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => onSendToAI(segment.arabicText, selectedBook.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 text-white text-xs font-semibold shadow-sm transition-transform active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>اے آئی سے حل عبارت پوچھیں</span>
                    </button>

                    <button
                      onClick={() => toggleQuestions(segment.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        expandedQuestions[segment.id]
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                          : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>امتحانی سوالات</span>
                    </button>

                    <button
                      onClick={() => setNoteInputSegmentId(noteInputSegmentId === segment.id ? null : segment.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                      <span>ذاتی حاشیہ</span>
                    </button>
                  </div>

                </div>

                {/* 3 Pillars Column: ترجمہ | جامع تشریح | محل اعراب */}
                <div className="space-y-4">
                  
                  {/* 3-Pillar Navigation Buttons */}
                  <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
                    {(!isFiqh || currentLang !== 'ur') && (
                      <button
                        onClick={() => setSegmentTab(segment.id, 'translation')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          currentTab === 'translation'
                            ? 'bg-emerald-800 text-white shadow-sm'
                            : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>1. ترجمہ ({activeLangConfig.nameUrdu})</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSegmentTab(segment.id, 'tashreeh')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        currentTab === 'tashreeh'
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isFiqh && currentLang === 'ur' ? '۱. جامع تشریح و دلائل' : '2. جامع تشریح و دلائل'}</span>
                    </button>

                    <button
                      onClick={() => setSegmentTab(segment.id, 'iraab')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        currentTab === 'iraab'
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isFiqh && currentLang === 'ur' ? '۲. محلِ اعراب و لغت' : '3. محلِ اعراب'}</span>
                    </button>
                  </div>

                  {/* Pillar 1: Multi-language Translation */}
                  {currentTab === 'translation' && (
                    <div 
                      dir={activeLangConfig.direction}
                      className="bg-amber-50/70 dark:bg-stone-800/60 p-5 rounded-2xl border border-amber-200/70 dark:border-stone-700 space-y-3 animate-fadeIn"
                    >
                      {/* In-place Language Selector Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 dark:border-stone-700 pb-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-200 font-nastaliq">
                          <Globe2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>ترجمہ بزبان:</span>
                          <span className="text-emerald-800 dark:text-emerald-400 font-bold">
                            {activeLangConfig.nameNative} ({activeLangConfig.nameUrdu})
                          </span>
                        </div>

                        {/* Quick language toggle buttons right in the card */}
                        <div className="flex flex-wrap items-center gap-1">
                          {([
                            { code: 'ur', label: 'اردو' },
                            { code: 'en', label: 'English' },
                            { code: 'ar', label: 'العربية' },
                            { code: 'ps', label: 'پښتو' },
                            { code: 'fa', label: 'فارسی' },
                            { code: 'bn', label: 'বাংলা' },
                            { code: 'tr', label: 'Türkçe' },
                            { code: 'fr', label: 'Français' },
                          ] as const).map(item => {
                            const isSelected = currentLang === item.code;
                            return (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => setCurrentLang(item.code as SupportedLanguage)}
                                className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                                  isSelected
                                    ? 'bg-amber-500 text-stone-950 shadow-xs ring-1 ring-amber-600'
                                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-amber-100 hover:text-stone-950 border border-amber-200/60 dark:border-stone-600'
                                }`}
                              >
                                {item.label}
                              </button>
                            );
                          })}

                          {/* Dropdown for all other world languages */}
                          <select
                            value={currentLang}
                            onChange={(e) => setCurrentLang(e.target.value as SupportedLanguage)}
                            className="text-[11px] px-2 py-0.5 rounded-lg border border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold focus:outline-none"
                            title="دیگر تمام عالمی زبانیں منتخب کریں"
                          >
                            <option disabled value="">+ دیگر عالمی زبانیں...</option>
                            {SUPPORTED_LANGUAGES.map(lang => (
                              <option key={lang.code} value={lang.code}>
                                {lang.nameNative} ({lang.nameUrdu})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Notice if viewing Fiqh with Urdu: Already shown directly above */}
                      {isFiqh && currentLang === 'ur' ? (
                        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-stone-850/90 border border-emerald-300 dark:border-stone-700 text-center space-y-2">
                          <p className="text-xs sm:text-sm font-nastaliq text-emerald-950 dark:text-emerald-300 font-bold">
                            ماشاء اللہ! «{selectedBook.title}» کا مکمل اور مستند اردو ترجمہ اوپر عربی عبارت کے نیچے ہی بلا کسی بٹن کے کھلا ہوا ہے۔
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setSegmentTab(segment.id, 'tashreeh')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-xs font-nastaliq font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
                            >
                              2. جامع تشریح و دلائل ملاحظہ فرمائیں ⬅
                            </button>
                            <button
                              type="button"
                              onClick={() => setSegmentTab(segment.id, 'iraab')}
                              className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-nastaliq font-bold border border-stone-300 dark:border-stone-600 transition-transform active:scale-95 cursor-pointer"
                            >
                              3. جدولِ محلِ اعراب دیکھیں ⬅
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Loading State or Translation Content for other books / other languages */
                        isTranslatingThis ? (
                          <div className="flex items-center justify-center gap-2 py-6 text-xs text-amber-800 dark:text-amber-300 font-nastaliq animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                            <span>بزبان «{activeLangConfig.nameNative} ({activeLangConfig.nameUrdu})» سلیس ترجمہ تیار ہو رہا ہے...</span>
                          </div>
                        ) : (
                          <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
                            <p className={`text-base sm:text-lg ${activeLangConfig.direction === 'rtl' ? 'font-nastaliq leading-loose text-justify' : 'font-sans leading-relaxed'} text-stone-900 dark:text-stone-100 whitespace-pre-line select-text`}>
                              {displayTranslation || translationText}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}


                  {/* Pillar 2: Detailed Tashreeh & Shuroohat */}
                  {currentTab === 'tashreeh' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="bg-emerald-50/50 dark:bg-stone-800/60 p-4 rounded-2xl border border-emerald-200/60 dark:border-stone-700">
                        <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1 font-nastaliq">
                          جامع درسی تشریح و دلائلِ ائمہ و فتاویٰ:
                        </h4>
                        <p className="text-sm font-nastaliq text-stone-700 dark:text-stone-300 leading-loose text-justify">
                          {segment.tashreeh}
                        </p>
                      </div>

                      {/* Classical Hawashi */}
                      {segment.hawashi && segment.hawashi.length > 0 && (
                        <div className="bg-stone-50 dark:bg-stone-800/40 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800">
                          <h5 className="text-[11px] font-bold text-stone-500 mb-1.5 font-arabic">
                            حواشی و تعلیقاتِ شارحین:
                          </h5>
                          <ul className="space-y-1 text-xs font-arabic text-stone-600 dark:text-stone-400 leading-relaxed">
                            {segment.hawashi.map((hashiyah, hIdx) => (
                              <li key={hIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-700 font-bold">•</span>
                                <span>{hashiyah}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pillar 3: Mahal-e-I'raab Table */}
                  {currentTab === 'iraab' && (
                    <div className="animate-fadeIn space-y-2">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block font-nastaliq">
                        جدولِ محلِ اعراب و ترکیبِ نحوی:
                      </span>
                      {segment.mahalIraab && segment.mahalIraab.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
                            <thead className="bg-emerald-800 text-white font-bold">
                              <tr>
                                <th className="p-2.5 font-arabic">الکلمۃ</th>
                                <th className="p-2.5 font-nastaliq">نحوی حیثیت</th>
                                <th className="p-2.5 font-nastaliq">علامتِ اعراب</th>
                                <th className="p-2.5 font-nastaliq">تفصیلی محل و وجہ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900">
                              {segment.mahalIraab.map((item, idx) => (
                                <tr key={idx} className="hover:bg-emerald-50/50 dark:hover:bg-stone-800/50 transition-colors">
                                  <td className="p-2.5 font-arabic font-bold text-emerald-800 dark:text-emerald-400 text-base">{item.word}</td>
                                  <td className="p-2.5 font-nastaliq font-medium">{item.role}</td>
                                  <td className="p-2.5 font-sans text-[11px]">{item.sign}</td>
                                  <td className="p-2.5 font-nastaliq text-stone-600 dark:text-stone-400 leading-relaxed">{item.detail}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-stone-400 text-xs font-nastaliq">
                          اس عبارت کا مکمل اعرابی تجزیہ لوڈ ہو رہا ہے
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Potential Exam Questions */}
              {expandedQuestions[segment.id] && segment.potentialQuestions && (
                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 animate-fadeIn bg-emerald-50/40 dark:bg-stone-850 p-4 rounded-2xl border border-emerald-200/50 dark:border-stone-700">
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300 font-nastaliq mb-2">
                    امتحاناتِ وفاق میں متوقع سوالات:
                  </h4>
                  <ul className="space-y-2">
                    {segment.potentialQuestions.map((q, qIdx) => (
                      <li key={qIdx} className="text-xs font-nastaliq text-stone-800 dark:text-stone-200 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center text-[10px] shrink-0 font-bold">
                          {qIdx + 1}
                        </span>
                        <span className="pt-0.5">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add Note Input */}
              {noteInputSegmentId === segment.id && (
                <div className="mt-3 p-4 bg-amber-50 dark:bg-stone-800 rounded-2xl border border-amber-200 dark:border-stone-700 animate-fadeIn space-y-2">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 font-nastaliq">
                    اس عبارت کے لیے اپنی یادداشت یا حاشیہ تحریر فرمائیں:
                  </label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="یہاں اپنا نوٹ تحریر فرمائیں..."
                    rows={2}
                    className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-nastaliq focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setNoteInputSegmentId(null)}
                      className="px-3 py-1 text-xs text-stone-500 hover:text-stone-700"
                    >
                      منسوخ
                    </button>
                    <button
                      onClick={() => submitNote(segment.id)}
                      className="px-4 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                    >
                      محفوظ کریں
                    </button>
                  </div>
                </div>
              )}

              {/* In-Card Direct Next / Prev Navigation Bar (User Requirement: پہلی حدیث کے بعد اسی کے نیچے آپشن موجود ہو اگلی حدیث یا اگلے صفحے پر جانے کا) */}
              <div className="mt-6 pt-5 border-t-2 border-[#caa870]/40 dark:border-stone-700/60 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-50/80 via-emerald-50/50 to-amber-50/80 dark:from-stone-850 dark:via-stone-800 dark:to-stone-850 p-4 rounded-2xl border border-amber-300/50 shadow-inner">
                
                {/* Previous Button inside the card */}
                <button
                  onClick={handlePrev}
                  disabled={isHadith ? isFirstHadith : (readingMode === 'page' ? (!hasPrevSegment && !hasPrevChapter) : !hasPrevChapter)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-nastaliq transition-all cursor-pointer ${
                    (isHadith ? isFirstHadith : (readingMode === 'page' ? (!hasPrevSegment && !hasPrevChapter) : !hasPrevChapter))
                      ? 'opacity-30 cursor-not-allowed text-stone-400 bg-stone-100 dark:bg-stone-800'
                      : 'btn-3d-gold text-stone-950 shadow-md active:scale-95'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 text-stone-950 font-bold" />
                  <span>
                    {isHadith
                      ? !isFirstHadith
                        ? `➡ پچھلی حدیث (حدیث ${currentHadithNumber - 1})`
                        : 'کتاب کی ابتدا'
                      : isQuran
                      ? hasPrevSegment
                        ? `➡ پچھلا رکوع (${safeSegmentIndex} از ${totalSegments})`
                        : hasPrevChapter
                        ? `➡ پچھلی سورت (${activeChapterIndex} از ${totalChapters}): ${prevChapter?.titleUrdu || prevChapter?.titleArabic}`
                        : 'کتاب کی ابتدا'
                      : '➡ پچھلا صفحہ'}
                  </span>
                </button>

                {/* Center Badge inside the card */}
                <div className="flex items-center gap-2 text-xs font-nastaliq font-black text-emerald-950 dark:text-emerald-300 bg-white/80 dark:bg-stone-900/80 px-4 py-1.5 rounded-xl border border-amber-300/60 shadow-xs">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>
                    {isHadith
                      ? `حدیث مبارکہ ${currentHadithNumber} از ${totalHadithsInBook} • ${selectedBook.title}`
                      : isQuran
                      ? `سورت ${activeChapterIndex + 1} از ${totalChapters} • ${currentChapter?.titleUrdu} ${totalSegments > 1 ? `• رکوع ${safeSegmentIndex + 1} از ${totalSegments}` : ''}`
                      : `صفحہ ${activeChapterIndex + 1} از ${chapters.length}`}
                  </span>
                </div>

                {/* Next Button inside the card */}
                <button
                  onClick={handleNext}
                  disabled={isHadith ? isLastHadith : (readingMode === 'page' ? (!hasNextSegment && !hasNextChapter) : !hasNextChapter)}
                  className={`btn-3d-gold flex items-center gap-2 px-5 py-2 rounded-xl text-stone-950 font-black text-xs sm:text-sm font-nastaliq shadow-md active:scale-95 cursor-pointer ${
                    (isHadith ? isLastHadith : (readingMode === 'page' ? (!hasNextSegment && !hasNextChapter) : !hasNextChapter))
                      ? 'opacity-40 cursor-not-allowed pointer-events-none'
                      : ''
                  }`}
                >
                  <span>
                    {isHadith
                      ? !isLastHadith
                        ? `اگلی حدیث (حدیث ${currentHadithNumber + 1}) پر جائیں ⬅`
                        : 'کتاب کا اختتام'
                      : isQuran
                      ? hasNextSegment
                        ? `اگلا رکوع (${safeSegmentIndex + 2} از ${totalSegments}) ⬅`
                        : hasNextChapter
                        ? `اگلی سورت (${activeChapterIndex + 2} از ${totalChapters}): ${nextChapter?.titleUrdu || nextChapter?.titleArabic} ⬅`
                        : 'ختمِ کتاب و دعائے ختمِ قرآن'
                      : 'اگلے صفحے پر جائیں ⬅'}
                  </span>
                  <ChevronLeft className="w-4 h-4 text-stone-950 font-bold" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Bottom Page / Chapter Paging & Jump Bar */}
      <div className="board-jewel-emerald p-4 sm:p-5 rounded-3xl border-2 border-emerald-700/60 shadow-xl flex flex-col gap-3 text-amber-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <button
            onClick={handlePrev}
            disabled={isHadith ? isFirstHadith : (readingMode === 'page' ? (!hasPrevSegment && !hasPrevChapter) : !hasPrevChapter)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-nastaliq transition-all cursor-pointer ${
              (isHadith ? isFirstHadith : (readingMode === 'page' ? (!hasPrevSegment && !hasPrevChapter) : !hasPrevChapter))
                ? 'opacity-30 cursor-not-allowed text-stone-500'
                : 'card-jewel-dark text-amber-200 hover:border-amber-400 shadow-xs active:scale-95'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-amber-400" />
            <span>
              {isHadith
                ? !isFirstHadith
                  ? `➡ پچھلی حدیث (حدیث ${currentHadithNumber - 1})`
                  : 'کتاب کی ابتدا'
                : readingMode === 'page'
                ? hasPrevSegment
                  ? `پچھلا ${segmentLabel} (${safeSegmentIndex} از ${totalSegments})`
                  : hasPrevChapter
                  ? `پچھلی ${chapterLabel}: ${prevChapter?.titleUrdu || prevChapter?.titleArabic}`
                  : 'کتاب کی ابتدا'
                : hasPrevChapter
                ? `پچھلی ${chapterLabel}: ${prevChapter?.titleUrdu || prevChapter?.titleArabic}`
                : 'کتاب کی ابتدا'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsIndexOpen(true)}
              className="btn-3d-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-stone-950 font-bold font-nastaliq text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <List className="w-4 h-4 text-stone-950" />
              <span>فہرستِ {isHadith ? 'احادیث' : isQuran ? 'سورتیں' : 'ابواب'} ({chapters.length})</span>
            </button>
            <span className="text-xs font-nastaliq text-amber-200 font-bold px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-700/80">
              {isHadith ? `حدیث مبارکہ ${currentHadithNumber} از ${totalHadithsInBook}` : `${currentChapter?.titleUrdu || currentChapter?.titleArabic} ${readingMode === 'page' ? `• ${segmentLabel} ${safeSegmentIndex + 1} از ${totalSegments}` : ''}`}
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={isHadith ? isLastHadith : (readingMode === 'page' ? (!hasNextSegment && !hasNextChapter) : !hasNextChapter)}
            className={`btn-3d-emerald text-amber-200 border border-amber-400/40 shadow-md active:scale-95 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-nastaliq transition-all cursor-pointer ${
              (isHadith ? isLastHadith : (readingMode === 'page' ? (!hasNextSegment && !hasNextChapter) : !hasNextChapter))
                ? 'opacity-40 cursor-not-allowed pointer-events-none'
                : ''
            }`}
          >
            <span>
              {isHadith
                ? !isLastHadith
                  ? `اگلی حدیث (حدیث ${currentHadithNumber + 1}) پر جائیں ⬅`
                  : 'کتاب کا اختتام'
                : readingMode === 'page'
                ? hasNextSegment
                  ? `اگلا ${segmentLabel} (${safeSegmentIndex + 2} از ${totalSegments})`
                  : hasNextChapter
                  ? `اگلی ${chapterLabel}: ${nextChapter?.titleUrdu || nextChapter?.titleArabic}`
                  : 'کتاب کا اختتام'
                : hasNextChapter
                ? `اگلی ${chapterLabel}: ${nextChapter?.titleUrdu || nextChapter?.titleArabic}`
                : 'کتاب کا اختتام'}
            </span>
            <ChevronLeft className="w-4 h-4 text-amber-300" />
          </button>
        </div>

        {/* Quick Jump for Hadith Collections at Bottom */}
        {isHadith ? (
          <div className="pt-2 border-t border-emerald-700/60 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-nastaliq font-bold text-amber-200 pl-1">
              براہِ راست حدیث پر جائیں:
            </span>
            {chapters.slice(0, 50).map((ch, chI) => {
              const isCurrent = chI === activeChapterIndex;
              return (
                <button
                  key={ch.id || chI}
                  onClick={() => {
                    setActiveChapterIndex(chI);
                    setActiveSegmentIndex(0);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-nastaliq transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300 scale-105 font-black'
                      : 'bg-emerald-950/90 hover:bg-emerald-900 text-amber-100 border border-emerald-700/60'
                  }`}
                >
                  حدیث {chI + 1}
                </button>
              );
            })}
          </div>
        ) : totalSegments > 1 ? (
          <div className="pt-2 border-t border-emerald-700/60 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-nastaliq font-bold text-amber-200 pl-1">
              براہِ راست صفحہ / رکوع پر جائیں:
            </span>
            {segmentsList.map((seg, sI) => {
              const isCurrent = readingMode === 'page' && sI === safeSegmentIndex;
              return (
                <button
                  key={seg.id || sI}
                  onClick={() => handleJumpToSegment(sI)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-nastaliq transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300 scale-105 font-black'
                      : 'bg-emerald-950/90 hover:bg-emerald-900 text-amber-100 border border-emerald-700/60'
                  }`}
                >
                  {isQuran ? `رکوع ${sI + 1}` : `صفحہ ${sI + 1}`}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>{/* Chapter & Hadith Table of Contents Drawer */}
      <ChapterIndexDrawer
        book={{ ...selectedBook, chapters }}
        activeChapterIndex={activeChapterIndex}
        onSelectChapter={(idx) => {
          setActiveChapterIndex(idx);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        onSendToAI={onSendToAI}
        onLookupHadithNumber={handleLookupHadithNumber}
        isFetchingHadith={isFetchingHadith}
      />

      {/* 20 Books Directory Modal */}
      <BookDirectoryModal
        isOpen={isBookDirectoryOpen}
        onClose={() => setIsBookDirectoryOpen(false)}
        selectedBookId={selectedBook.id}
        onSelectBook={(book) => {
          onSelectBook(book);
          setActiveChapterIndex(0);
        }}
        onOpenKharjiBooks={onOpenKharjiBooks}
      />

      {/* Word Lookup Modal */}
      {lookupWord && (
        <WordLookupModal
          initialWord={lookupWord}
          contextInfo={lookupContext || undefined}
          onClose={() => {
            setLookupWord(null);
            setLookupContext(null);
          }}
          onSendToAI={(text) => onSendToAI(text, selectedBook.title)}
          apiKey={apiKey}
        />
      )}

      {/* Export & Print Modal */}
      <ExportPrintModal
        isOpen={isExportPrintOpen}
        onClose={() => setIsExportPrintOpen(false)}
        book={selectedBook}
        chapter={currentChapter}
        userName={userName}
      />

      {/* Offline Books Manager Modal */}
      <OfflineBooksManagerModal
        isOpen={isOfflineManagerOpen}
        onClose={() => setIsOfflineManagerOpen(false)}
        onSelectBook={onSelectBook}
      />

      {/* Floating Book Reader Auto-Scroll Controls Dock */}
      <FloatingReaderControls
        viewportRef={readerViewportRef}
        onNextPage={handleNext}
        hasNextPage={isHadith ? !isLastHadith : (readingMode === 'page' ? (hasNextSegment || hasNextChapter) : hasNextChapter)}
        bookTitle={selectedBook.title}
        pageLabel={isHadith ? `حدیث ${currentHadithNumber}` : isQuran ? `رکوع ${safeSegmentIndex + 1}` : `صفحہ ${safeSegmentIndex + 1}`}
        theme={theme}
      />

    </div>
  );
};
