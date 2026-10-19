import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowLeft, Layers, Scroll, Scale, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import { booksDatabase } from '../data/booksData';
import { Book } from '../types';
import { 
  executeGlobalSearch, 
  getAutoSuggestions, 
  GlobalSearchResult, 
  SearchCategoryFilter,
  SearchAutoSuggestion
} from '../services/globalSearchService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (book: Book, segmentId: string) => void;
  initialQuery?: string;
  initialCategory?: SearchCategoryFilter;
}

const CATEGORY_TABS: { id: SearchCategoryFilter; name: string; icon: React.ReactNode }[] = [
  { id: 'all', name: 'تمام کتب (147 کتب)', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'hadith', name: 'حدیث شریف', icon: <Scroll className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'tafseer', name: 'القرآن والتفاسیر', icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" /> },
  { id: 'fiqh', name: 'فقہ و فتاویٰ', icon: <Scale className="w-3.5 h-3.5 text-indigo-400" /> },
  { id: 'aqeedah', name: 'عقائد و کلام', icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> },
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  initialQuery = '',
  initialCategory = 'all'
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategoryFilter>(initialCategory);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'hadith' | 'translation' | 'tashreeh' | 'footnote' | 'book'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial props when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) setSearchTerm(initialQuery);
      if (initialCategory) setSelectedCategory(initialCategory);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, initialQuery, initialCategory]);

  // Instant Auto-Suggestions
  const suggestions: SearchAutoSuggestion[] = useMemo(() => {
    return getAutoSuggestions(searchTerm, selectedCategory, 8);
  }, [searchTerm, selectedCategory]);

  // Deep Search across all 147 books, chapter headings, Hadith texts, translations, Darsi Tashreeh, and footnotes
  const allResults: GlobalSearchResult[] = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) return [];
    return executeGlobalSearch(searchTerm, selectedCategory, 60);
  }, [searchTerm, selectedCategory]);

  // Secondary match-type filter (e.g. only Hadith texts, or only Translations, or only Footnotes)
  const filteredResults = useMemo(() => {
    if (activeTabFilter === 'all') return allResults;
    return allResults.filter(r => r.matchType === activeTabFilter);
  }, [allResults, activeTabFilter]);

  if (!isOpen) return null;

  const handleResultClick = (res: GlobalSearchResult) => {
    onClose();
    // 1. If parent provided onSelectResult and it's a curriculum book
    const targetBook = booksDatabase.find(b => b.id === res.bookId);
    if (targetBook && res.segmentId && onSelectResult) {
      onSelectResult(targetBook, res.segmentId);
      return;
    }

    // 2. Direct SPA Route Navigation to Book Reader
    if (typeof window !== 'undefined') {
      if (res.sourceType === 'external' && res.externalLink) {
        window.open(res.externalLink, '_blank', 'noopener,noreferrer');
      } else {
        const targetUrl = `/books/${res.bookSlug}${res.pageNumber ? `?page=${res.pageNumber}` : ''}`;
        window.history.pushState({}, '', targetUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.dispatchEvent(new CustomEvent('tehreek:navigate', { detail: { url: targetUrl } }));
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-[#01140e]/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="modal-contrast-card rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl text-amber-50 flex flex-col max-h-[90vh] mt-4 sm:mt-6 border border-emerald-500/40">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3.5 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-xs">
              <Search className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-nastaliq text-amber-300">
                عالمی سرچ انجن — تمام ۱۴۷ کتب، متون، شروحات و حواشی
              </h3>
              <p className="text-xs text-emerald-200/90 font-nastaliq">
                عربی، اردو یا رومن اردو میں مطلوبہ حدیث، قرآنی آیت، فقہی مسئلہ، یا درسی عبارت تلاش فرمائیں
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-amber-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer border border-transparent hover:border-amber-400/40"
            title="بند کریں (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spacious Search Input Box */}
        <div className="relative mb-3">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="عربی لفظ (مع اعراب یا بغیر اعراب)، اردو عنوان، رومن (namaz, roza, bukhari) یا راوی کا نام..."
            className="w-full pr-11 pl-10 py-3.5 rounded-2xl input-jewel text-base font-arabic focus:outline-none shadow-inner"
          />
          <Search className="w-5 h-5 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition cursor-pointer p-1"
              title="تلاش صاف کریں"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 4 Primary Category Filters (Hadith, Tafseer, Fiqh, Aqeedah) */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pb-2.5 border-b border-emerald-800/40">
          <span className="text-xs font-bold text-amber-300 font-nastaliq ml-1 hidden sm:inline">
            شعبہ:
          </span>
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nastaliq transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-md border border-amber-300 ring-2 ring-amber-400/40'
                  : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-100 hover:text-white border border-emerald-800/60'
              }`}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Instant Auto-Suggestions Tag Bar */}
        {suggestions.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 border-b border-emerald-800/30 scrollbar-none">
            <span className="text-[11px] font-bold text-emerald-300 font-nastaliq shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>فوری تجاویز:</span>
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSearchTerm(sug.text)}
                className="px-2.5 py-1 rounded-xl text-xs font-nastaliq font-medium bg-emerald-900/60 hover:bg-amber-400 hover:text-emerald-950 text-emerald-200 border border-emerald-700/60 transition shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>{sug.text}</span>
                <span className="text-[9px] opacity-75 bg-black/20 px-1 rounded">
                  {sug.typeUrdu}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Secondary Match-Type Filter Tabs (when results exist) */}
        {allResults.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-2 text-[11px] font-nastaliq text-stone-300 scrollbar-none">
            <span className="text-emerald-300 font-bold shrink-0 ml-1">تطبیق بلحاظِ محل:</span>
            <button
              type="button"
              onClick={() => setActiveTabFilter('all')}
              className={`px-2.5 py-0.5 rounded-lg border transition ${
                activeTabFilter === 'all'
                  ? 'bg-emerald-800 text-amber-200 border-amber-400 font-bold'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              تمام ({allResults.length})
            </button>
            {allResults.some(r => r.matchType === 'hadith') && (
              <button
                type="button"
                onClick={() => setActiveTabFilter('hadith')}
                className={`px-2.5 py-0.5 rounded-lg border transition ${
                  activeTabFilter === 'hadith'
                    ? 'bg-amber-900/90 text-amber-200 border-amber-400 font-bold'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                احادیث و آیات ({allResults.filter(r => r.matchType === 'hadith').length})
              </button>
            )}
            {allResults.some(r => r.matchType === 'translation') && (
              <button
                type="button"
                onClick={() => setActiveTabFilter('translation')}
                className={`px-2.5 py-0.5 rounded-lg border transition ${
                  activeTabFilter === 'translation'
                    ? 'bg-emerald-800 text-emerald-200 border-emerald-400 font-bold'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                ترجمہ ({allResults.filter(r => r.matchType === 'translation').length})
              </button>
            )}
            {allResults.some(r => r.matchType === 'tashreeh') && (
              <button
                type="button"
                onClick={() => setActiveTabFilter('tashreeh')}
                className={`px-2.5 py-0.5 rounded-lg border transition ${
                  activeTabFilter === 'tashreeh'
                    ? 'bg-indigo-900/90 text-indigo-200 border-indigo-400 font-bold'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                درسی تشریح ({allResults.filter(r => r.matchType === 'tashreeh').length})
              </button>
            )}
            {allResults.some(r => r.matchType === 'footnote') && (
              <button
                type="button"
                onClick={() => setActiveTabFilter('footnote')}
                className={`px-2.5 py-0.5 rounded-lg border transition ${
                  activeTabFilter === 'footnote'
                    ? 'bg-amber-900/90 text-amber-200 border-amber-400 font-bold'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                حواشی و تخریج ({allResults.filter(r => r.matchType === 'footnote').length})
              </button>
            )}
            {allResults.some(r => r.matchType === 'book') && (
              <button
                type="button"
                onClick={() => setActiveTabFilter('book')}
                className={`px-2.5 py-0.5 rounded-lg border transition ${
                  activeTabFilter === 'book'
                    ? 'bg-teal-900/90 text-teal-200 border-teal-400 font-bold'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                کتاب و مصنف ({allResults.filter(r => r.matchType === 'book').length})
              </button>
            )}
          </div>
        )}

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[240px]">
          {searchTerm.trim().length >= 2 && filteredResults.length === 0 ? (
            <div className="text-center py-12 text-stone-300 font-nastaliq card-jewel-dark rounded-2xl p-6 border border-emerald-800/50">
              <Layers className="w-10 h-10 mx-auto text-amber-400/60 mb-2" />
              <p className="text-base text-amber-200 font-bold">اس تلاش کے مطابق کوئی عبارت یا مسئلہ موصول نہیں ہوا</p>
              <p className="text-xs text-emerald-200/80 mt-1">
                کوئی دوسرا کلمہ، عربی لفظ یا مادہ لکھ کر تلاش فرمائیں (مثلاً: نیت، صلوۃ، وضو، زکوٰۃ، ہجرت)
              </p>
            </div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((res, idx) => (
              <div
                key={res.id || idx}
                onClick={() => handleResultClick(res)}
                className="group cursor-pointer rounded-2xl p-3.5 sm:p-4 card-jewel-dark hover:border-amber-400 transition-all space-y-2 shadow-md hover:shadow-lg"
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/90 text-amber-200 font-bold font-arabic border border-amber-400/40">
                      {res.bookTitleUr}
                    </span>
                    {res.chapterTitle && (
                      <span className="text-[11px] text-emerald-200/90 font-nastaliq font-medium">
                        • {res.chapterTitle}
                      </span>
                    )}
                    <span className="text-[10px] text-stone-400 font-nastaliq">
                      ({res.categoryUrdu})
                    </span>
                  </div>

                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    res.matchType === 'hadith'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      : res.matchType === 'translation'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : res.matchType === 'tashreeh'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'
                      : res.matchType === 'footnote'
                      ? 'bg-amber-600/20 text-amber-200 border-amber-500/40'
                      : 'bg-teal-500/20 text-teal-300 border-teal-400/40'
                  }`}>
                    {res.matchTypeUrdu}
                  </span>
                </div>

                {/* Primary Arabic / Matn text if available */}
                {res.arabicText && (
                  <p className="font-arabic text-sm sm:text-base text-amber-100 line-clamp-2 leading-loose drop-shadow-xs">
                    {res.arabicText}
                  </p>
                )}

                {/* Urdu Translation / Tashreeh Snippet */}
                <p className="font-nastaliq text-xs sm:text-sm text-emerald-100/90 line-clamp-2 leading-relaxed">
                  {res.matchedTextSnippet}
                </p>

                {/* Footer with author and direct click action */}
                <div className="flex justify-between items-center pt-1 border-t border-emerald-900/50 text-[11px] text-stone-400 font-nastaliq">
                  <span>مصنف: {res.author} {res.pageNumber ? `• صفحہ / حدیث نمبر: ${res.pageNumber}` : ''}</span>
                  <div className="flex items-center gap-1 font-bold text-amber-300 group-hover:text-amber-200">
                    <span>{res.sourceType === 'external' ? 'بیرونی مصدقہ نسخہ دیکھیں' : 'کتاب کے اس صفحے پر جائیں'}</span>
                    {res.sourceType === 'external' ? (
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-amber-400" />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-stone-300 font-nastaliq card-jewel-dark rounded-2xl p-6 border border-emerald-800/50 space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-amber-400 mb-2" />
              <p className="text-base font-bold text-amber-200">
                حدیث، فقہی مسئلہ، قرآنی آیت، یا درسی عبارت تلاش فرمائیں
              </p>
              <p className="text-xs text-emerald-200/80 max-w-lg mx-auto">
                تحریکِ ایمان کے ڈیجیٹل سرچ انجن میں تمام ۱۴۷ کتب، صحاحِ ستہ، متونِ فقہ اور حواشی کو ایک ساتھ تلاش کیا جا سکتا ہے۔
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {[
                  'إنما الأعمال بالنيات',
                  'بني الإسلام على خمس',
                  'العقيدة الطحاوية',
                  'الهدایة شرح بدایة المبتدي',
                  'مختصر القدوري',
                  'تفسیر ابن کثیر',
                  'نماز کے فرائض',
                  'وضو کے احکام',
                  'زکوٰۃ کا نصاب',
                  'namaz',
                  'roza',
                  'bukhari'
                ].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchTerm(term)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 text-amber-200 font-arabic border border-emerald-700/60 hover:border-amber-400 transition-all cursor-pointer"
                  >
                    ⚡ {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-3 pt-3 border-t border-emerald-800/60 flex justify-between items-center text-xs text-emerald-200/80 font-nastaliq">
          <span>
            کل نتائج: <strong className="text-amber-300 font-bold">{filteredResults.length}</strong> عبارتیں دستیاب ہیں
          </span>
          <span className="text-[11px] text-stone-400">
            تحریکِ ایمان ڈیجیٹل سرچ انجن • بانی: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم
          </span>
        </div>

      </div>
    </div>
  );
};
