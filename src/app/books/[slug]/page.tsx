"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { publicDomainBooks } from "@/data/publicDomainBooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  BookMarked,
  Share2,
  Check,
  Loader2
} from "lucide-react";

interface HadithItem {
  hadithnumber?: number;
  number?: number;
  arab?: string;
  text?: string;
  urdu?: string;
}

// 1. Slugs mapped to local files in public/hadith-data/[slug].json
const HADITH_FILE_MAP: Record<string, string> = {
  "sahih-bukhari": "sahih-bukhari",
  "bukhari": "sahih-bukhari",
  "sahih-muslim": "sahih-muslim",
  "muslim": "sahih-muslim",
  "sunan-abu-daud": "sunan-abu-daud",
  "sunan-abu-dawood": "sunan-abu-daud",
  "jami-tirmizi": "jami-tirmizi",
  "jami-tirmidhi": "jami-tirmizi",
  "sunan-nasai": "sunan-nasai",
  "nasai": "sunan-nasai",
  "sunan-ibn-majah": "sunan-ibn-majah",
  "ibn-majah": "sunan-ibn-majah",
};

// Expected counts for canonical hadith books
const HADITH_TOTALS: Record<string, { total: number; urduName: string }> = {
  "sahih-bukhari": { total: 7589, urduName: "صحیح البخاری" },
  "sahih-muslim": { total: 7563, urduName: "صحیح مسلم" },
  "sunan-abu-daud": { total: 5274, urduName: "سنن ابی داود" },
  "jami-tirmizi": { total: 3998, urduName: "جامع الترمذی" },
  "sunan-nasai": { total: 5765, urduName: "سنن النسائی" },
  "sunan-ibn-majah": { total: 4343, urduName: "سنن ابن ماجہ" },
};

// Global in-memory cache to ensure instant subsequent page loads
const hadithGlobalCache: Record<string, HadithItem[]> = {};

export default function BookDetailPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || '';
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // Find book in publicDomainBooks catalog
  const book = useMemo(() => {
    return (
      publicDomainBooks.find(b => b.slug.toLowerCase() === slug || b.id.toLowerCase() === slug) ||
      publicDomainBooks.find(b => slug.includes(b.slug.toLowerCase()) || b.slug.toLowerCase().includes(slug)) ||
      null
    );
  }, [slug]);

  // Check if book matches local hadith collection file
  const hadithFileKey = useMemo(() => {
    if (HADITH_FILE_MAP[slug]) return HADITH_FILE_MAP[slug];
    if (book) {
      if (HADITH_FILE_MAP[book.slug]) return HADITH_FILE_MAP[book.slug];
      if (HADITH_FILE_MAP[book.id]) return HADITH_FILE_MAP[book.id];
      const s = (book.slug + ' ' + book.id).toLowerCase();
      if (s.includes("bukhari")) return "sahih-bukhari";
      if (s.includes("muslim")) return "sahih-muslim";
      if (s.includes("abu-dawood") || s.includes("abu-daud")) return "sunan-abu-daud";
      if (s.includes("tirmidhi") || s.includes("tirmizi")) return "jami-tirmizi";
      if (s.includes("nasai")) return "sunan-nasai";
      if (s.includes("ibn-majah")) return "sunan-ibn-majah";
    }
    return null;
  }, [slug, book]);

  // Pagination state: 0-indexed
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [allHadiths, setAllHadiths] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchPageQuery, setSearchPageQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const readerTopRef = useRef<HTMLDivElement>(null);

  // Load 100% full dataset from local JSON files (public/hadith-data/[slug].json)
  useEffect(() => {
    if (!hadithFileKey) {
      setLoading(false);
      return;
    }

    if (hadithGlobalCache[hadithFileKey] && hadithGlobalCache[hadithFileKey].length > 0) {
      setAllHadiths(hadithGlobalCache[hadithFileKey]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch directly from local JSON in public/hadith-data/
    fetch(`/hadith-data/${hadithFileKey}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        const rawList: any[] = data?.hadiths || (Array.isArray(data) ? data : []);
        if (rawList.length > 0) {
          const formatted: HadithItem[] = rawList.map((h, idx) => ({
            hadithnumber: h.hadithnumber || h.number || (idx + 1),
            number: h.hadithnumber || h.number || (idx + 1),
            arab: h.arab || h.text || '',
            urdu: h.urdu || ''
          }));
          hadithGlobalCache[hadithFileKey] = formatted;
          setAllHadiths(formatted);
        } else {
          setAllHadiths([]);
        }
      })
      .catch(err => {
        console.warn('Local hadith-data fetch error, using fallback:', err);
        // Fallback to jsdelivr CDN if local file is unreachable
        const editionName = hadithFileKey.replace('sahih-', '').replace('sunan-', '').replace('jami-', '');
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${editionName}.min.json`)
          .then(r => r.json())
          .then(cdnData => {
            const list = cdnData?.hadiths || [];
            const formatted = list.map((h: any, idx: number) => ({
              hadithnumber: h.hadithnumber || (idx + 1),
              number: h.hadithnumber || (idx + 1),
              arab: h.text || '',
              urdu: ''
            }));
            hadithGlobalCache[hadithFileKey] = formatted;
            setAllHadiths(formatted);
          })
          .catch(() => setAllHadiths([]));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hadithFileKey]);

  // Scroll smoothly to top on page change
  useEffect(() => {
    if (readerTopRef.current) {
      readerTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  if (!book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <BookMarked className="w-12 h-12 text-emerald-800 mx-auto mb-3" />
          <h1 className="text-2xl font-black mb-2 text-emerald-950 font-nastaliq">کتاب نہیں ملی</h1>
          <p className="text-sm text-stone-500 mb-6 font-nastaliq">مطلوبہ کتاب کا ریکارڈ کتب خانہ میں دستیاب نہیں۔</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white font-bold text-sm bg-emerald-800 hover:bg-emerald-900 transition shadow font-nastaliq"
          >
            <span>کتب خانہ پر واپس جائیں</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Slicing & Pagination:
  // For Hadith collections: 20 Ahadith per page (No 500 limit! Covers all 7589, 7563, etc.)
  // For other 94 books: 1 page per chapter/safha, totalPages = book.pages.length
  const isHadith = Boolean(hadithFileKey && (allHadiths.length > 0 || loading));
  const PER_PAGE = 20;

  const totalHadithsCount = allHadiths.length > 0
    ? allHadiths.length
    : (hadithFileKey && HADITH_TOTALS[hadithFileKey]?.total) || 0;

  const totalPages = isHadith
    ? Math.max(1, Math.ceil(totalHadithsCount / PER_PAGE))
    : Math.max(1, (book.pages && book.pages.length > 0) ? book.pages.length : 50);

  const currentHadiths = useMemo(() => {
    if (!isHadith) return [];
    return allHadiths.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);
  }, [isHadith, allHadiths, currentPage]);

  const currentNonHadithPage = useMemo(() => {
    if (isHadith) return '';
    if (book.pages && book.pages.length > 0) {
      return book.pages[currentPage] || '';
    }
    return `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n«${book.title_ar}»\n[صَفْحَة ${currentPage + 1} از ${totalPages}]\n\n${book.intro_ur || book.description}`;
  }, [isHadith, book, currentPage, totalPages]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Jump to specific page
  const handleJumpToPage = (target: number) => {
    const p = Math.max(1, Math.min(totalPages, target));
    setCurrentPage(p - 1);
    setSearchPageQuery('');
  };

  // Filtered page list for quick jump Fehrist
  const filteredPageNumbers = useMemo(() => {
    const list: number[] = [];
    if (totalPages <= 100) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else {
      // For large books (like Bukhari 759 pages), generate strategic jump anchors
      const current = currentPage + 1;
      const range = 15;
      const start = Math.max(1, current - range);
      const end = Math.min(totalPages, current + range);

      if (start > 1) {
        list.push(1);
        if (start > 2) list.push(-1); // ellipsis marker
      }
      for (let i = start; i <= end; i++) {
        list.push(i);
      }
      if (end < totalPages) {
        if (end < totalPages - 1) list.push(-2); // ellipsis marker
        list.push(totalPages);
      }
    }

    if (!searchPageQuery.trim()) return list;
    const q = parseInt(searchPageQuery.trim(), 10);
    if (!isNaN(q) && q >= 1 && q <= totalPages) {
      return [q];
    }
    return list;
  }, [totalPages, currentPage, searchPageQuery]);

  return (
    <div dir="rtl" className="min-h-screen bg-white text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Header (Clean White, same branding as homepage) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-emerald-800 hover:text-emerald-900 font-nastaliq font-bold text-sm sm:text-base transition hover:-translate-x-0.5"
            title="ہوم پیج پر واپس جائیں"
          >
            <ArrowRight className="w-4 h-4 text-emerald-800" />
            <span className="hidden sm:inline">تحریکِ ایمان ڈیجیٹل کتب خانہ</span>
            <span className="sm:hidden">واپس</span>
          </Link>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <h1 className="font-bold font-nastaliq text-stone-900 text-sm sm:text-lg truncate max-w-[200px] sm:max-w-md">
              {book.title_ur || book.title}
            </h1>
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 font-nastaliq">
              {book.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl border border-gray-200 hover:border-emerald-700 text-stone-600 hover:text-emerald-800 transition cursor-pointer text-xs flex items-center gap-1.5"
            title="صفحہ کا لنک کاپی کریں"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-nastaliq">{copied ? 'کاپی ہو گیا' : 'شیئر'}</span>
          </button>

          {/* Current Page Badge */}
          <div className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold font-nastaliq shadow-xs flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {isHadith
                ? `Kul Ahadith: ${totalHadithsCount} - Safha ${currentPage + 1} / ${totalPages}`
                : `Safha ${currentPage + 1} / ${totalPages} - Kul ${totalPages} Safhay`}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Full Reader Layout: Left 75% Reader, Right 25% Sticky Fehrist */}
      <div ref={readerTopRef} className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Right 25%: Sticky Fehrist (Index of Pages) */}
        <aside className="w-full lg:w-1/4 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] flex flex-col bg-stone-50/60 border border-gray-100 rounded-2xl p-4 shadow-xs">
          <div className="space-y-3 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-emerald-800" />
                <h2 className="font-bold font-nastaliq text-base text-stone-900">فہرستِ صفحات</h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 font-nastaliq">
                کل: {totalPages} صفحات
              </span>
            </div>

            {/* Quick Page Jump Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={searchPageQuery}
                  onChange={e => setSearchPageQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleJumpToPage(parseInt(searchPageQuery, 10));
                    }
                  }}
                  placeholder={`صفحہ (1 تا ${totalPages})...`}
                  className="w-full pr-8 pl-2 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-nastaliq focus:outline-none focus:ring-2 focus:ring-emerald-700/20 text-stone-800"
                />
              </div>
              <button
                type="button"
                onClick={() => handleJumpToPage(parseInt(searchPageQuery, 10))}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer"
              >
                جائیں
              </button>
            </div>
          </div>

          {/* Fehrist Page Grid / List */}
          <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-1 custom-scrollbar">
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-1.5">
              {filteredPageNumbers.map((p, idx) => {
                if (p < 0) {
                  return (
                    <div key={`ellipsis_${idx}`} className="flex items-center justify-center text-xs text-stone-400 font-bold">
                      •••
                    </div>
                  );
                }
                const isActive = p === currentPage + 1;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleJumpToPage(p)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer text-center font-nastaliq ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-700/30'
                        : 'bg-white text-stone-700 border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/50'
                    }`}
                  >
                    ص {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Jump Bar (Start, Mid, End) */}
          <div className="pt-3 mt-2 border-t border-gray-200 flex items-center justify-between text-xs font-nastaliq">
            <button
              type="button"
              disabled={currentPage <= 0}
              onClick={() => setCurrentPage(0)}
              className="text-stone-500 hover:text-emerald-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              شروع (ص ۱)
            </button>
            <button
              type="button"
              onClick={() => handleJumpToPage(Math.floor(totalPages / 2))}
              className="text-stone-500 hover:text-emerald-800 cursor-pointer"
            >
              درمیان (ص {Math.floor(totalPages / 2)})
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(totalPages - 1)}
              className="text-stone-500 hover:text-emerald-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              آخر (ص {totalPages})
            </button>
          </div>
        </aside>

        {/* Left 75%: Full Reader Display */}
        <main className="w-full lg:w-3/4 flex flex-col bg-white border border-gray-100 rounded-2xl p-4 sm:p-8 shadow-xs space-y-6">
          
          {/* Reader Top Bar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-emerald-800"></span>
                <h2 className="text-xl sm:text-2xl font-black font-nastaliq text-emerald-950">
                  {book.title_ur || book.title}
                </h2>
              </div>
              <p className="text-xs text-stone-500 font-nastaliq mt-1">
                مصنف: {book.author} {book.death_year ? `(${book.death_year}ھ)` : ''} • {book.category}
                {isHadith && ` • کل احادیث: ${totalHadithsCount.toLocaleString('ur-PK')}`}
              </p>
            </div>

            {/* Pagination Controls Top */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                disabled={currentPage <= 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50/50 text-xs font-bold font-nastaliq text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>پچھلا صفحہ</span>
              </button>

              <span className="text-xs font-bold font-nastaliq px-3.5 py-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 shadow-2xs">
                صفحہ {currentPage + 1} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs font-bold font-nastaliq text-white shadow-xs disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span>اگلا صفحہ</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Body Content: Direct Page Render without limits */}
          <div className="min-h-[550px] space-y-4 py-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-800 animate-spin" />
                <p className="text-base font-nastaliq font-bold text-emerald-900">
                  «{book.title_ur}» کا مکمل ذخیرہ ({totalHadithsCount.toLocaleString('ur-PK')} احادیث) لوڈ کیا جا رہا ہے...
                </p>
                <p className="text-xs text-stone-400 font-nastaliq">برائے مہربانی چند لمحے انتظار فرمائیں۔</p>
              </div>
            ) : isHadith ? (
              /* Hadith Reader: 20 Ahadith per page covering all 7589 / 7563 */
              <div className="space-y-6">
                {currentHadiths.map(h => {
                  const hadithNum = h.hadithnumber || h.number;
                  const arabText = h.arab || h.text;
                  return (
                    <div
                      key={hadithNum}
                      className="border-b border-gray-100 py-6 space-y-3 hover:bg-emerald-50/20 transition-colors px-2 sm:px-4 rounded-2xl"
                    >
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-nastaliq">
                          حدیث نمبر: {hadithNum?.toLocaleString('ur-PK')}
                        </span>
                        <span className="text-[11px] font-nastaliq text-stone-400">
                          {book.title_ur} • صفحہ {currentPage + 1}
                        </span>
                      </div>

                      {/* Authentic Arabic Text with Amiri Font */}
                      <p
                        className="text-2xl sm:text-3xl font-arabic arabic-text text-right leading-loose text-stone-900 select-text"
                        dir="rtl"
                        style={{ lineHeight: '2.5' }}
                      >
                        {arabText}
                      </p>

                      {/* Authentic Urdu Translation */}
                      {h.urdu && (
                        <div className="pt-3 mt-2 border-t border-dashed border-gray-100">
                          <p
                            className="urdu-text text-emerald-950 text-right select-text"
                            dir="rtl"
                          >
                            {h.urdu}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {currentHadiths.length === 0 && (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="urdu-text text-stone-600">اس صفحہ پر احادیث دستیاب نہیں۔</p>
                  </div>
                )}
              </div>
            ) : (
              /* Non-Hadith Public Domain Books: 1 Chapter/Page per Safha */
              <div className="space-y-4">
                {currentNonHadithPage.split('\n\n').filter(b => b.trim().length > 0).map((block, idx) => {
                  const trimmed = block.trim();
                  
                  if (trimmed.includes('بِسْمِ اللَّهِ') || trimmed.includes('«') || trimmed.startsWith('[صَفْحَة') || trimmed.startsWith('[الباب')) {
                    return (
                      <div key={idx} className="pb-3 mb-2 border-b border-gray-100/80 text-center">
                        <p className="font-arabic arabic-text text-xl sm:text-2xl text-emerald-900 leading-relaxed font-bold">
                          {trimmed}
                        </p>
                      </div>
                    );
                  }

                  if (trimmed.startsWith('【متنِ کتاب') || trimmed.startsWith('【سلیس') || trimmed.startsWith('【حوالہ') || trimmed.startsWith('【کتاب')) {
                    return (
                      <div key={idx} className="pt-2">
                        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 urdu-text shadow-2xs">
                          {trimmed.replace(/【|】/g, '')}
                        </span>
                      </div>
                    );
                  }

                  const isArabic = /[\u0600-\u06FF]/.test(trimmed) && (trimmed.includes('عَنْ') || trimmed.includes('قَالَ') || trimmed.includes('«') || trimmed.includes('ﷺ'));
                  if (isArabic && !trimmed.startsWith('سلیس') && !trimmed.startsWith('فائدہ') && !trimmed.startsWith('مصنف')) {
                    return (
                      <p
                        key={idx}
                        className="text-2xl sm:text-3xl font-arabic arabic-text text-right leading-loose text-stone-900 px-1 select-text"
                        dir="rtl"
                        style={{ lineHeight: '2.5' }}
                      >
                        {trimmed}
                      </p>
                    );
                  }

                  return (
                    <p
                      key={idx}
                      className="urdu-text text-emerald-950 text-right px-1 select-text"
                      dir="rtl"
                    >
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reader Bottom Pagination Buttons */}
          <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentPage <= 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 text-sm font-bold font-nastaliq text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>پچھلا صفحہ</span>
            </button>

            {/* Pagination Button Status Required: Kul Ahadith: {total} - Safha {page} / {totalPages} */}
            <div className="text-center font-nastaliq text-sm text-stone-700 font-bold">
              <span>
                {isHadith
                  ? `Kul Ahadith: ${totalHadithsCount} - Safha ${currentPage + 1} / ${totalPages}`
                  : `Safha ${currentPage + 1} / ${totalPages} - Kul ${totalPages} Safhay`}
              </span>
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold font-nastaliq shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95 cursor-pointer"
            >
              <span>اگلا صفحہ</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>

      {/* 3. Footer (Same clean branding as homepage) */}
      <footer className="border-t border-gray-100 bg-stone-50 py-8 px-4 text-center mt-12">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="font-bold font-nastaliq text-emerald-900 text-sm sm:text-base">
            تحریکِ ایمان — تصدیق شدہ اسلامی کتب و مراجع
          </p>
          <p className="text-xs text-stone-500 font-nastaliq">
            کلاسیکی کتبِ اسلامیہ کا مصدقہ اور کاپی رائٹ سے آزاد مکمل متنی ذخیرہ (شروع سے آخر تک)۔
          </p>
        </div>
      </footer>

    </div>
  );
}