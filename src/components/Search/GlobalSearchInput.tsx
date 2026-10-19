import React, { useState, useRef, useEffect } from 'react';
import { Search, X, BookOpen, Scroll, Sparkles, Scale, ShieldCheck, ArrowLeft, Command, CornerDownLeft } from 'lucide-react';
import { 
  executeGlobalSearch, 
  getAutoSuggestions, 
  GlobalSearchResult, 
  SearchAutoSuggestion, 
  SearchCategoryFilter 
} from '../../services/globalSearchService';

interface GlobalSearchInputProps {
  onSelectResult?: (result: GlobalSearchResult) => void;
  onOpenFullModal?: (query?: string, category?: SearchCategoryFilter) => void;
  onQueryChange?: (query: string) => void;
  initialQuery?: string;
  className?: string;
  placeholder?: string;
}

const CATEGORY_TABS: { id: SearchCategoryFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'تمام کتب (147)', icon: <BookOpen className="w-3 h-3 text-emerald-600" /> },
  { id: 'hadith', label: 'حدیث شریف', icon: <Scroll className="w-3 h-3 text-amber-600" /> },
  { id: 'tafseer', label: 'القرآن والتفاسیر', icon: <Sparkles className="w-3 h-3 text-teal-600" /> },
  { id: 'fiqh', label: 'فقہ و فتاویٰ', icon: <Scale className="w-3 h-3 text-indigo-600" /> },
  { id: 'aqeedah', label: 'عقائد و کلام', icon: <ShieldCheck className="w-3 h-3 text-purple-600" /> },
];

export const GlobalSearchInput: React.FC<GlobalSearchInputProps> = ({
  onSelectResult,
  onOpenFullModal,
  onQueryChange,
  initialQuery = '',
  className = '',
  placeholder = '147 کتب، احادیث، تفاسیر، فقہ و حواشی میں تلاش فرمائیں...'
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategoryFilter>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [liveResults, setLiveResults] = useState<GlobalSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchAutoSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal query if initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Update suggestions & results as user types
  useEffect(() => {
    const sug = getAutoSuggestions(query, selectedCategory, 6);
    setSuggestions(sug);

    if (query.trim().length >= 2) {
      const res = executeGlobalSearch(query, selectedCategory, 6);
      setLiveResults(res);
    } else {
      setLiveResults([]);
    }
    setSelectedIndex(-1);
  }, [query, selectedCategory]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < liveResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && liveResults[selectedIndex]) {
        handleSelect(liveResults[selectedIndex]);
      } else {
        // Open full search modal
        if (onOpenFullModal) {
          onOpenFullModal(query, selectedCategory);
          setIsOpen(false);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (res: GlobalSearchResult) => {
    setIsOpen(false);
    if (onSelectResult) {
      onSelectResult(res);
    } else {
      // Default direct navigation
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
    }
  };

  const handleSuggestionClick = (sug: SearchAutoSuggestion) => {
    setQuery(sug.text);
    if (sug.bookSlug && sug.type === 'book') {
      // Direct book navigation
      const res: GlobalSearchResult = {
        id: `sug_${sug.bookSlug}`,
        bookId: sug.bookSlug,
        bookSlug: sug.bookSlug,
        bookTitleUr: sug.text,
        bookTitleAr: sug.text,
        author: sug.author || '',
        category: sug.category === 'all' ? 'Other' : (sug.category.charAt(0).toUpperCase() + sug.category.slice(1)) as any,
        categoryUrdu: sug.categoryUrdu,
        matchType: 'book',
        matchTypeUrdu: 'کتاب',
        matchedTextSnippet: `${sug.text} — ${sug.author || ''}`,
        sourceType: 'public',
        score: 100
      };
      handleSelect(res);
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} dir="rtl">
      {/* Search Input Bar (Spacious, Wide & Prominent) */}
      <div className="relative flex items-center w-full">
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-800 flex items-center justify-center">
          <Search className="w-4 h-4 text-emerald-700" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (onQueryChange) onQueryChange(val);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pr-10 pl-20 py-2 sm:py-2.5 bg-stone-50/90 hover:bg-stone-100/90 focus:bg-white text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm rounded-full border border-emerald-200/90 focus:border-emerald-600 focus:outline-none focus:ring-3 focus:ring-emerald-700/20 transition-all font-nastaliq shadow-2xs"
        />

        {/* Left Side: Shortcut Badge & Clear Button */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setLiveResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-full transition cursor-pointer"
              title="تلاش صاف کریں"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-sans font-semibold text-stone-400 bg-stone-200/60 border border-stone-300/80 rounded-md shadow-2xs select-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </kbd>
          )}
        </div>
      </div>

      {/* Live Search & Autocomplete Dropdown Palette */}
      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-2 z-50 bg-white/98 backdrop-blur-xl border border-emerald-300/80 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Category Filter Chips Bar */}
          <div className="p-2 sm:p-2.5 bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-950 border-b border-emerald-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {CATEGORY_TABS.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-nastaliq font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-emerald-950 shadow-xs ring-1 ring-amber-300 font-black'
                      : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800/80 hover:text-white border border-emerald-700/50'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Auto-Suggestions Tray */}
          {suggestions.length > 0 && (
            <div className="px-3 py-2 bg-emerald-50/50 border-b border-emerald-100/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-emerald-900 font-nastaliq shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>تجاویز:</span>
              </span>
              {suggestions.map((sug, sidx) => (
                <button
                  key={sidx}
                  type="button"
                  onClick={() => handleSuggestionClick(sug)}
                  className="px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-nastaliq font-medium bg-white hover:bg-emerald-100 text-stone-800 hover:text-emerald-950 border border-emerald-200 transition shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span>{sug.text}</span>
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 rounded">
                    {sug.typeUrdu}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Live Search Results List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 p-1">
            {query.trim().length >= 2 && liveResults.length === 0 ? (
              <div className="text-center py-8 px-4 text-stone-500 font-nastaliq">
                <BookOpen className="w-8 h-8 mx-auto text-stone-300 mb-1.5" />
                <p className="text-sm font-bold text-stone-800">اس لفظ کے مطابق کوئی نتیجہ نہیں ملا</p>
                <p className="text-xs text-stone-500 mt-0.5">دوسرا لفظ یا مادہ لکھ کر تلاش فرمائیں، یا مکمل سرچ موڈل کھولیں۔</p>
              </div>
            ) : liveResults.length > 0 ? (
              liveResults.map((res, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={res.id || idx}
                    onClick={() => handleSelect(res)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-2.5 sm:p-3 rounded-xl transition cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-emerald-50/90 border border-emerald-200 shadow-2xs'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-emerald-950 font-nastaliq bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200/80">
                          {res.bookTitleUr}
                        </span>
                        {res.chapterTitle && (
                          <span className="text-[11px] text-stone-600 font-nastaliq">
                            • {res.chapterTitle}
                          </span>
                        )}
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        res.matchType === 'hadith'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : res.matchType === 'translation'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : res.matchType === 'tashreeh'
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                          : 'bg-stone-100 text-stone-800 border-stone-200'
                      }`}>
                        {res.matchTypeUrdu}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-800 font-arabic line-clamp-1 leading-relaxed">
                      {res.matchedTextSnippet}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-500 font-nastaliq">
                      <span>مصنف: {res.author}</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        مطالعہ فرمائیں
                        <ArrowLeft className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 px-4 text-stone-600 font-nastaliq space-y-2">
                <p className="text-xs sm:text-sm font-bold text-emerald-900">
                  تمام ۱۴۷ کتب کے متون، شروحات اور حواشی میں سیکنڈوں میں تلاش فرمائیں
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {['الأعمال بالنيات', 'نماز کے ارکان', 'وضو اور طہارت', 'زکوٰۃ کا نصاب', 'روزے کے مسائل', 'العقيدة الطحاوية'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-950 border border-stone-200 transition cursor-pointer"
                    >
                      ⚡ {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-2 sm:p-2.5 bg-stone-50 border-t border-gray-200 flex items-center justify-between text-xs font-nastaliq text-stone-600">
            <button
              type="button"
              onClick={() => {
                if (onOpenFullModal) {
                  onOpenFullModal(query, selectedCategory);
                  setIsOpen(false);
                }
              }}
              className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-emerald-700" />
              <span>تمام تفصیلی نتائج سرچ موڈل میں دیکھیں</span>
              <CornerDownLeft className="w-3 h-3 text-stone-400" />
            </button>
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Enter دبائیں یا کسی بھی نتیجے پر کلک کریں
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
