import React, { useState } from 'react';
import { Book } from '../../types';
import { 
  BookOpen, 
  X, 
  Search, 
  CheckCircle2, 
  ChevronLeft, 
  Scroll, 
  Sparkles,
  Loader2,
  Hash
} from 'lucide-react';
import { 
  BUKHARI_CANONICAL_BOOKS, 
  MUSLIM_CANONICAL_BOOKS,
  getHadithBookMeta,
  extractHadithNumber
} from '../../services/hadithApiService';
import { 
  matchesSearch, 
  POPULAR_SEARCH_TOPICS 
} from '../../utils/searchNormalizer';
import { QURAN_SURAHS_CANONICAL } from '../../data/quranData';

const POPULAR_QURAN_SURAHS = [
  { label: 'الفاتحة', query: 'الفاتحة' },
  { label: 'البقرة', query: 'البقرة' },
  { label: 'آل عمران', query: 'عمران' },
  { label: 'الکہف', query: 'الكهف' },
  { label: 'یٰس', query: 'يس' },
  { label: 'الرحمن', query: 'الرحمن' },
  { label: 'الواقعہ', query: 'الواقعة' },
  { label: 'الملک', query: 'الملك' },
  { label: 'النبأ', query: 'النبأ' },
  { label: 'الإخلاص', query: 'الإخلاص' },
  { label: 'الفلق', query: 'الفلق' },
  { label: 'الناس', query: 'الناس' },
];

const QURAN_JUZ_LIST = [
  { juz: 1, name: 'پارہ ۱ (الم)' },
  { juz: 2, name: 'پارہ ۲ (سیقول)' },
  { juz: 3, name: 'پارہ ۳ (تلک الرسل)' },
  { juz: 4, name: 'پارہ ۴ (لن تنالوا)' },
  { juz: 5, name: 'پارہ ۵ (والمحصنت)' },
  { juz: 6, name: 'پارہ ۶ (لا یحب اللہ)' },
  { juz: 7, name: 'پارہ ۷ (واذا سمعوا)' },
  { juz: 8, name: 'پارہ ۸ (ولو اننا)' },
  { juz: 9, name: 'پارہ ۹ (قال الملا)' },
  { juz: 10, name: 'پارہ ۱۰ (واعلموا)' },
  { juz: 11, name: 'پارہ ۱۱ (یعتذرون)' },
  { juz: 12, name: 'پارہ ۱۲ (وما من دابة)' },
  { juz: 13, name: 'پارہ ۱۳ (وما ابری)' },
  { juz: 14, name: 'پارہ ۱۴ (ربما)' },
  { juz: 15, name: 'پارہ ۱۵ (سبحن الذی)' },
  { juz: 16, name: 'پارہ ۱۶ (قال الم)' },
  { juz: 17, name: 'پارہ ۱۷ (اقترب)' },
  { juz: 18, name: 'پارہ ۱۸ (قد افلح)' },
  { juz: 19, name: 'پارہ ۱۹ (وقال الذین)' },
  { juz: 20, name: 'پارہ ۲۰ (امن خلق)' },
  { juz: 21, name: 'پارہ ۲۱ (اتل ما اوحی)' },
  { juz: 22, name: 'پارہ ۲۲ (ومن یقنت)' },
  { juz: 23, name: 'پارہ ۲۳ (وما لی)' },
  { juz: 24, name: 'پارہ ۲۴ (فمن اظلم)' },
  { juz: 25, name: 'پارہ ۲۵ (الیہ یرد)' },
  { juz: 26, name: 'پارہ ۲۶ (حم)' },
  { juz: 27, name: 'پارہ ۲۷ (قال فما خطبکم)' },
  { juz: 28, name: 'پارہ ۲۸ (قد سمع اللہ)' },
  { juz: 29, name: 'پارہ ۲۹ (تبارک الذی)' },
  { juz: 30, name: 'پارہ ۳۰ (عم یتساءلون)' },
];


interface ChapterIndexDrawerProps {
  book: Book;
  activeChapterIndex: number;
  onSelectChapter: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
  onSendToAI?: (prompt: string, bookTitle: string) => void;
  onLookupHadithNumber?: (hadithNumber: number) => Promise<void>;
  isFetchingHadith?: boolean;
}

export const ChapterIndexDrawer: React.FC<ChapterIndexDrawerProps> = ({
  book,
  activeChapterIndex,
  onSelectChapter,
  isOpen,
  onClose,
  onSendToAI,
  onLookupHadithNumber,
  isFetchingHadith = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hadithInput, setHadithInput] = useState('');
  const [surahInput, setSurahInput] = useState('');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'hadiths' | 'books'>('hadiths');

  if (!isOpen) return null;

  const isQuran = book.id === 'quran' || book.id === 'jalalayn' || book.category === 'quran_tafseer';
  const hadithMeta = getHadithBookMeta(book.id);
  const isBukhari = book.id === 'bukhari';
  const isMuslim = book.id === 'muslim';
  const isHadithBook = !!hadithMeta || book.category === 'sittah' || book.subject === 'hadith';
  const maxHadiths = hadithMeta ? hadithMeta.totalHadiths : 1000;
  const canonicalBooks = isBukhari ? BUKHARI_CANONICAL_BOOKS : isMuslim ? MUSLIM_CANONICAL_BOOKS : [];

  const handleHadithJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(hadithInput.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= maxHadiths && onLookupHadithNumber) {
      onLookupHadithNumber(num);
      setHadithInput('');
    }
  };

  const handleSurahJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(surahInput.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= 114) {
      onSelectChapter(num - 1);
      setSurahInput('');
      onClose();
    }
  };

  // Multilingual matching across Urdu, English, Arabic without diacritics, and Roman Urdu
  const filteredChapters = book.chapters.map((ch, originalIndex) => ({
    chapter: ch,
    index: originalIndex,
  })).filter(({ chapter, index }) => {
    // If Quran and a specific Juz is selected, filter by that Juz
    if (isQuran && selectedJuz !== 'all') {
      const qMeta = QURAN_SURAHS_CANONICAL[index];
      if (qMeta && qMeta.juz !== selectedJuz) {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;
    const segArabic = chapter.segments.map(s => s.arabicText).join(' ');
    const segUrdu = chapter.segments.map(s => s.urduTranslation).join(' ');
    const segTranslations = chapter.segments
      .flatMap(s => s.translations ? Object.values(s.translations) : [])
      .join(' ');
    const segTashreeh = chapter.segments.map(s => s.tashreeh).join(' ');

    const qMeta = isQuran ? QURAN_SURAHS_CANONICAL[index] : null;

    return matchesSearch(
      [
        chapter.titleArabic,
        chapter.titleUrdu,
        String(index + 1),
        qMeta?.nameArabic || '',
        qMeta?.nameUrdu || '',
        qMeta?.nameEnglish || '',
        segArabic,
        segUrdu,
        segTranslations,
        segTashreeh,
      ],
      searchQuery
    );
  });

  const filteredCanonicalBooks = canonicalBooks.filter(b => {
    if (!searchQuery.trim()) return true;
    return matchesSearch(
      [
        b.titleArabic,
        b.titleUrdu,
        String(b.id),
        String(b.start),
        String(b.end),
      ],
      searchQuery
    );
  });

  const isSearching = searchQuery.trim().length > 0;
  const totalMatches = (isBukhari || isMuslim)
    ? (filteredCanonicalBooks.length + filteredChapters.length)
    : filteredChapters.length;

  const itemLabel = isHadithBook ? 'حدیث' : book.category === 'quran_tafseer' ? 'سورت / آیت' : 'باب / فصل';


  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Drawer Overlay backdrop click */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Drawer Content */}
      <div 
        dir="rtl"
        className="relative z-10 w-full max-w-xl bg-gradient-to-b from-[#021e17] via-[#032a1f] to-[#01140e] text-amber-50 h-full shadow-2xl flex flex-col border-l-2 border-amber-400/50"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-emerald-800/60 bg-gradient-to-l from-emerald-950 via-emerald-900 to-emerald-850 text-white space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-sm">
                <Scroll className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-arabic font-bold text-lg sm:text-xl text-amber-200">
                  {isQuran ? 'فہرستِ مبارکہ ۱۱۴ سورتیں و ۳۰ پارے' : isHadithBook ? 'فہرستِ ابواب و احادیث' : 'فہرستِ ابواب و مضامین'}
                </h3>
                <p className="text-xs text-emerald-200 font-nastaliq">
                  {isQuran 
                    ? 'القرآن الکریم — (مکمل ۱۱۴ سورتیں و ۳۰ پارے مع درسی تشریح و اعراب)' 
                    : `${book.title} — (${hadithMeta ? `مکمل احادیث: 1 تا ${hadithMeta.totalHadiths}` : `مجموعی ${itemLabel}یں: ${book.chapters.length}`})`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-stone-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              title="بند کریں"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Direct Hadith Number Search Input */}
          {isHadithBook && onLookupHadithNumber && (
            <form onSubmit={handleHadithJump} className="bg-emerald-900/90 border border-amber-400/40 rounded-2xl p-2.5 flex items-center gap-2 shadow-inner">
              <div className="flex items-center gap-1 text-amber-300 text-xs font-nastaliq font-bold shrink-0 pr-1">
                <Hash className="w-4 h-4 text-amber-400" />
                <span>حدیث نمبر:</span>
              </div>
              <input
                type="number"
                min="1"
                max={maxHadiths}
                value={hadithInput}
                onChange={(e) => setHadithInput(e.target.value)}
                placeholder={`1 تا ${maxHadiths} میں سے کوئی بھی نمبر لکھیں...`}
                className="flex-1 bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-emerald-300/50 font-sans focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={isFetchingHadith || !hadithInput.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-bold text-xs font-nastaliq shrink-0 shadow-xs flex items-center gap-1"
              >
                {isFetchingHadith ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>لوڈ ہو رہی ہے...</span>
                  </>
                ) : (
                  <span>حدیث کھولیں</span>
                )}
              </button>
            </form>
          )}

          {/* Direct Surah Number Search/Jump Input for Holy Quran */}
          {isQuran && (
            <form onSubmit={handleSurahJump} className="bg-emerald-900/90 border border-amber-400/40 rounded-2xl p-2.5 flex items-center gap-2 shadow-inner">
              <div className="flex items-center gap-1 text-amber-300 text-xs font-nastaliq font-bold shrink-0 pr-1">
                <Hash className="w-4 h-4 text-amber-400" />
                <span>سورت نمبر:</span>
              </div>
              <input
                type="number"
                min="1"
                max="114"
                value={surahInput}
                onChange={(e) => setSurahInput(e.target.value)}
                placeholder="1 تا 114 میں سے سورت نمبر لکھیں (مثلاً: 2 البقرۃ، 36 یٰس، 18 الکہف)..."
                className="flex-1 bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-emerald-300/50 font-sans focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={!surahInput.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-bold text-xs font-nastaliq shrink-0 shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>سورت کھولیں</span>
              </button>
            </form>
          )}

          {/* Spacious Multilingual Search Bar */}
          <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-2xl p-3 space-y-2.5 shadow-inner">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isQuran ? "🔍 سورت کا نام تلاش کریں (مثلاً: البقرة، Baqarah، کہف، یاسین، ملک، فاتحہ، ۲)..." : "🔍 اردو، English، العربية، یا رومن میں تلاش کریں (مثلاً: نماز، Prayer، وضو، Wudu، علم...)"}
                className="w-full pr-11 pl-20 py-2.5 sm:py-3 rounded-xl bg-emerald-900/90 border border-emerald-600/60 focus:border-amber-400 text-white placeholder-emerald-200/60 text-xs sm:text-sm font-nastaliq focus:outline-none focus:ring-2 focus:ring-amber-400/50 shadow-xs"
              />
              <Search className="w-5 h-5 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-xs font-nastaliq transition-colors flex items-center gap-1 shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>صاف</span>
                </button>
              )}
            </div>

            {/* Match Counter & Query Badge */}
            {isSearching && (
              <div className="flex items-center justify-between text-xs font-nastaliq text-emerald-200 bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-amber-400/30">
                <span className="flex items-center gap-1">
                  <span>تلاش کا نتیجہ برائے:</span>
                  <strong className="text-amber-300 font-sans">«{searchQuery}»</strong>
                </span>
                <span className="font-bold text-amber-300">
                  {totalMatches} {isQuran ? 'سورتیں دستیاب ہیں' : isHadithBook ? 'عنوانات و احادیث دستیاب ہیں' : 'ابواب ملے ہیں'}
                </span>
              </div>
            )}

            {/* Quick Topic Chips / Popular Surahs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-thin">
              <span className="text-[11px] text-amber-300 font-nastaliq shrink-0 pl-1 font-bold">
                {isQuran ? 'اہم سورتیں:' : 'مقبول موضوعات:'}
              </span>
              {(isQuran ? POPULAR_QURAN_SURAHS : POPULAR_SEARCH_TOPICS).map(item => {
                const q = 'query' in item ? item.query : (item as any).query;
                const label = 'label' in item ? item.label : (item as any).labelUrdu;
                const isSelected = searchQuery.toLowerCase() === q.toLowerCase();
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSearchQuery(isSelected ? '' : q)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-nastaliq shrink-0 transition-all border ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 font-bold border-amber-400 shadow-xs'
                        : 'bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 border-emerald-700/70 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 30 Paras / Juz Selector for Quran */}
          {isQuran && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/50 rounded-xl p-2 text-xs">
              <label className="text-amber-300 font-nastaliq font-bold shrink-0 pr-1">پارہ منتخب کریں:</label>
              <select
                value={selectedJuz}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
                  setSelectedJuz(val);
                }}
                className="flex-1 bg-emerald-900 border border-emerald-700 rounded-lg px-2.5 py-1 text-xs text-amber-200 font-nastaliq focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="all">تمام ۳۰ پارے (۱۱۴ سورتیں)</option>
                {QURAN_JUZ_LIST.map(j => (
                  <option key={j.juz} value={j.juz}>
                    {j.name}
                  </option>
                ))}
              </select>
              {selectedJuz !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedJuz('all')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-xs font-nastaliq cursor-pointer"
                >
                  تمام سورتیں
                </button>
              )}
            </div>
          )}


          {/* Dual Tabs for Hadith Books (Only shown when not searching) */}
          {!isSearching && (isBukhari || isMuslim) && (
            <div className="flex bg-emerald-950/70 p-1 rounded-xl border border-emerald-700/50 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('hadiths')}
                className={`flex-1 py-1.5 rounded-lg font-nastaliq font-bold transition-all ${
                  activeTab === 'hadiths'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                منتخب احادیث مع شروحات ({book.chapters.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('books')}
                className={`flex-1 py-1.5 rounded-lg font-nastaliq font-bold transition-all ${
                  activeTab === 'books'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                {isBukhari ? 'تمام 97 کتب و ابواب' : 'تمام 56 کتب و ابواب'}
              </button>
            </div>
          )}
        </div>

        {/* Chapters / Hadith List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* SEARCH MODE: Display all matching canonical books and hadiths */}
          {isSearching ? (
            totalMatches === 0 ? (
              <div className="text-center py-12 space-y-3">
                <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-sm font-nastaliq text-stone-500">
                  کوئی {itemLabel} یا باب اس تلاش «{searchQuery}» کے مطابق نہیں ملا۔
                </p>
                {onSendToAI && (
                  <button
                    onClick={() => {
                      onSendToAI(`برائے مہربانی کتاب «${book.title}» سے موضوع «${searchQuery}» کی متعلقہ حدیث، عربی متن مع اعراب، اردو ترجمہ اور درسی تشریح پیش فرمائیں۔`, book.title);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 text-amber-300 text-xs font-semibold shadow-sm hover:bg-emerald-800"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>اے آئی سے «{searchQuery}» تلاش کروائیں</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Matching Canonical Books (e.g. کتاب الصلاۃ, کتاب مواقیت الصلاۃ, etc.) */}
                {filteredCanonicalBooks.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/60 border border-amber-400/40 text-amber-200">
                      <span className="flex items-center gap-1.5 text-xs font-nastaliq font-bold text-amber-300">
                        <Scroll className="w-4 h-4 text-amber-400" />
                        <span>متعلقہ بنیادی کتب و ابواب ({filteredCanonicalBooks.length} کتب ملی ہیں)</span>
                      </span>
                      <span className="text-[11px] font-nastaliq text-emerald-200/80">
                        کلک کرنے پر حدیث کھل جائے گی
                      </span>
                    </div>

                    <div className="space-y-2">
                      {filteredCanonicalBooks.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => {
                            if (onLookupHadithNumber) {
                              onLookupHadithNumber(b.start);
                            }
                            onClose();
                          }}
                          className="cursor-pointer rounded-2xl p-4 transition-all card-jewel-dark hover:border-amber-400 flex items-center justify-between group shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs font-serif shrink-0 shadow-xs">
                              {b.id}
                            </span>
                            <div>
                              <h4 className="font-arabic font-bold text-base text-amber-100 group-hover:text-amber-300">
                                {b.titleArabic}
                              </h4>
                              <p className="text-xs font-nastaliq text-emerald-100/80">
                                {b.titleUrdu} — (الحدیث {b.start} تا {b.end})
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-nastaliq font-bold text-amber-300 flex items-center gap-1 group-hover:-translate-x-1 transition-transform shrink-0">
                            کھولیں <ChevronLeft className="w-4 h-4" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Matching Detailed Chapters with Tashreeh */}
                {filteredChapters.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/70 border border-emerald-700/60">
                      <span className="flex items-center gap-1.5 text-xs font-nastaliq font-bold text-amber-300">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span>متعلقہ احادیث و فصول مع شروحات ({filteredChapters.length} روایات)</span>
                      </span>
                      <span className="text-[11px] font-nastaliq text-emerald-200/80">
                        مکمل درسی متن
                      </span>
                    </div>

                    <div className="space-y-2">
                      {filteredChapters.map(({ chapter, index }) => {
                        const isActive = index === activeChapterIndex;
                        const firstSegment = chapter.segments[0];

                        return (
                          <div
                            key={chapter.id || index}
                            onClick={() => {
                              onSelectChapter(index);
                              onClose();
                            }}
                            className={`cursor-pointer rounded-2xl p-4 transition-all group ${
                              isActive
                                ? 'border-2 border-amber-400 bg-gradient-to-r from-[#074332] to-[#032a1f] shadow-lg ring-2 ring-amber-400/40 text-amber-100'
                                : 'card-jewel-dark hover:border-amber-400/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <span className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs font-serif shadow-xs ${
                                  isActive
                                    ? 'bg-amber-400 text-stone-950 font-black'
                                    : 'bg-emerald-950 text-amber-300 border border-emerald-700/60'
                                }`}>
                                  {isHadithBook ? extractHadithNumber(chapter, index) : index + 1}
                                </span>

                                <div className="space-y-1.5 flex-1">
                                  <h4 className={`font-arabic font-bold text-sm sm:text-base leading-relaxed ${
                                    isActive
                                      ? 'text-amber-200'
                                      : 'text-amber-100 group-hover:text-amber-300'
                                  }`}>
                                    {chapter.titleArabic}
                                  </h4>

                                  <p className="text-xs font-nastaliq text-emerald-100/90 leading-normal">
                                    {chapter.titleUrdu}
                                  </p>

                                  {isQuran && QURAN_SURAHS_CANONICAL[index] && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-amber-300 border border-emerald-700/60 text-[10px] font-nastaliq font-bold">
                                        {QURAN_SURAHS_CANONICAL[index].revelationType}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-200 border border-emerald-700/60 text-[10px] font-nastaliq">
                                        آیات: {QURAN_SURAHS_CANONICAL[index].ayahCount}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-amber-200 border border-emerald-700/60 text-[10px] font-nastaliq">
                                        پارہ: {QURAN_SURAHS_CANONICAL[index].juz}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-nastaliq">
                                        رکوع: {QURAN_SURAHS_CANONICAL[index].rukus}
                                      </span>
                                    </div>
                                  )}

                                  {firstSegment && (
                                    <p className="text-[11px] font-arabic text-stone-400 line-clamp-1 truncate">
                                      «{firstSegment.arabicText.slice(0, 90)}...»
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0 pt-1">
                                {isActive ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-200 bg-emerald-900/90 px-2.5 py-0.5 rounded-full border border-amber-400/40 font-nastaliq">
                                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                                    <span>زیرِ مطالعہ</span>
                                  </span>
                                ) : (
                                  <ChevronLeft className="w-4 h-4 text-amber-400/70 group-hover:text-amber-300 group-hover:-translate-x-1 transition-transform" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            /* NON-SEARCH MODE: Standard dual tabs */
            activeTab === 'books' && (isBukhari || isMuslim) ? (
              filteredCanonicalBooks.length === 0 ? (
                <div className="text-center py-12 text-sm font-nastaliq text-stone-500">
                  کوئی کتاب اس فہرست میں نہیں ملی۔
                </div>
              ) : (
                filteredCanonicalBooks.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (onLookupHadithNumber) {
                        onLookupHadithNumber(b.start);
                      }
                      onClose();
                    }}
                    className="cursor-pointer rounded-2xl p-4 transition-all card-jewel-dark hover:border-amber-400 flex items-center justify-between group shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs font-serif shrink-0">
                        {b.id}
                      </span>
                      <div>
                        <h4 className="font-arabic font-bold text-base text-amber-100 group-hover:text-amber-300">
                          {b.titleArabic}
                        </h4>
                        <p className="text-xs font-nastaliq text-emerald-100/80">
                          {b.titleUrdu} — (الحدیث {b.start} تا {b.end})
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-nastaliq font-bold text-amber-300 flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                      کھولیں <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>
                ))
              )
            ) : (
              filteredChapters.map(({ chapter, index }) => {
                const isActive = index === activeChapterIndex;
                const firstSegment = chapter.segments[0];

                return (
                  <div
                    key={chapter.id || index}
                    onClick={() => {
                      onSelectChapter(index);
                      onClose();
                    }}
                    className={`cursor-pointer rounded-2xl p-4 transition-all group ${
                      isActive
                        ? 'border-2 border-amber-400 bg-gradient-to-r from-[#074332] to-[#032a1f] shadow-lg ring-2 ring-amber-400/40 text-amber-100'
                        : 'card-jewel-dark hover:border-amber-400/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs font-serif shadow-xs ${
                          isActive
                            ? 'bg-amber-400 text-stone-950 font-black'
                            : 'bg-emerald-950 text-amber-300 border border-emerald-700/60'
                        }`}>
                          {index + 1}
                        </span>

                        <div className="space-y-1.5 flex-1">
                          <h4 className={`font-arabic font-bold text-sm sm:text-base leading-relaxed ${
                            isActive
                              ? 'text-amber-200'
                              : 'text-amber-100 group-hover:text-amber-300'
                          }`}>
                            {chapter.titleArabic}
                          </h4>

                          <p className="text-xs font-nastaliq text-emerald-100/90 leading-normal">
                            {chapter.titleUrdu}
                          </p>

                          {isQuran && QURAN_SURAHS_CANONICAL[index] && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-amber-300 border border-emerald-700/60 text-[10px] font-nastaliq font-bold">
                                {QURAN_SURAHS_CANONICAL[index].revelationType}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-200 border border-emerald-700/60 text-[10px] font-nastaliq">
                                آیات: {QURAN_SURAHS_CANONICAL[index].ayahCount}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-amber-200 border border-emerald-700/60 text-[10px] font-nastaliq">
                                پارہ: {QURAN_SURAHS_CANONICAL[index].juz}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-nastaliq">
                                رکوع: {QURAN_SURAHS_CANONICAL[index].rukus}
                              </span>
                            </div>
                          )}

                          {firstSegment && (
                            <p className="text-[11px] font-arabic text-stone-400 line-clamp-1 truncate">
                              «{firstSegment.arabicText.slice(0, 90)}...»
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 pt-1">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-200 bg-emerald-900/90 px-2.5 py-0.5 rounded-full border border-amber-400/40 font-nastaliq">
                            <CheckCircle2 className="w-3 h-3 text-amber-400" />
                            <span>زیرِ مطالعہ</span>
                          </span>
                        ) : (
                          <ChevronLeft className="w-4 h-4 text-amber-400/70 group-hover:text-amber-300 group-hover:-translate-x-1 transition-transform" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>


        {/* Drawer Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 shrink-0 flex items-center justify-between gap-3 text-xs">
          <span className="text-stone-500 font-nastaliq">
            کل {itemLabel}یں: <strong className="text-emerald-900 dark:text-emerald-300">{book.chapters.length}</strong>
            {isBukhari && ' (مکمل ذخیرہ: 7563 احادیث)'}
            {isMuslim && ' (مکمل ذخیرہ: 5390 احادیث)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-300 transition-colors font-nastaliq"
          >
            صفحہ پر واپس جائیں
          </button>
        </div>
      </div>
    </div>
  );
};
