'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, Sparkles, BookMarked, Search, GraduationCap, Layers, Award } from 'lucide-react';
import { publicDomainBooks, modernBooks, BookCategoryTitle } from '../data/publicDomainBooks';
import { NaatPlayer } from '../components/NaatPlayer';
import { WIFAQ_DARJAT, getDarjaForBookSlug } from '../data/wifaqCurriculum';
import { BookmarksHistoryModal } from '../components/Reader/BookmarksHistoryModal';
import { 
  getLastRead, 
  ReadingHistoryEntry, 
  formatTimeAgoUrdu 
} from '../services/bookmarkHistoryService';

const CATEGORY_CHIPS: { id: BookCategoryTitle | 'all'; title_ur: string }[] = [
  { id: 'all', title_ur: 'تمام کتب' },
  { id: 'Quran & Tafseer', title_ur: 'قرآن و تفسیر' },
  { id: 'Hadith', title_ur: 'حدیث شریف' },
  { id: 'Seerat', title_ur: 'سیرتِ نبوی' },
  { id: 'Fiqh', title_ur: 'فقہ و فتاویٰ' },
  { id: 'Tareekh', title_ur: 'تاریخ و سوانح' },
  { id: 'Aqeedah', title_ur: 'عقائد و کلام' },
  { id: 'Dars-e-Nizami', title_ur: 'درسِ نظامی' },
  { id: 'Exam Papers', title_ur: 'امتحانی پرچہ جات' }
];

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'categories' | 'dars-e-nizami'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<BookCategoryTitle | 'all'>('all');
  const [selectedDarjaId, setSelectedDarjaId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNaatPlayer, setShowNaatPlayer] = useState(false);
  const [lastRead, setLastRead] = useState<ReadingHistoryEntry | null>(null);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);

  useEffect(() => {
    setLastRead(getLastRead());
    const handleUpdate = () => setLastRead(getLastRead());
    window.addEventListener('tehreek_history_updated', handleUpdate);
    return () => window.removeEventListener('tehreek_history_updated', handleUpdate);
  }, []);

  // FIX CRITICAL BUG: Guaranteed deduplication: 1 book = 1 card only
  const uniquePublicBooks = useMemo(() => {
    return publicDomainBooks.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, []);

  const uniqueModernBooks = useMemo(() => {
    return modernBooks.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, []);

  const selectedDarja = useMemo(() => {
    return WIFAQ_DARJAT.find(d => d.id === selectedDarjaId);
  }, [selectedDarjaId]);

  const filteredPublicBooks = useMemo(() => {
    return uniquePublicBooks.filter(book => {
      // 1. View Mode Filtering
      if (viewMode === 'dars-e-nizami') {
        if (selectedDarjaId === 'all') {
          const allDarsiSlugs = new Set(WIFAQ_DARJAT.flatMap(d => d.bookSlugs));
          if (!allDarsiSlugs.has(book.slug)) return false;
        } else {
          const darja = WIFAQ_DARJAT.find(d => d.id === selectedDarjaId);
          if (!darja || !darja.bookSlugs.includes(book.slug)) return false;
        }
      } else {
        const matchCat = selectedCategory === 'all' || book.category === selectedCategory;
        if (!matchCat) return false;
      }

      // 2. Search Query Filtering
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        book.title_ur.toLowerCase().includes(q) ||
        book.title_ar.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.intro_ur.toLowerCase().includes(q)
      );
    });
  }, [uniquePublicBooks, viewMode, selectedCategory, selectedDarjaId, searchQuery]);

  const filteredModernBooks = useMemo(() => {
    // If user is filtering specifically by Dars-e-Nizami darjat, we only show modern books if relevant
    if (viewMode === 'dars-e-nizami') {
      return [];
    }
    return uniqueModernBooks.filter(book => {
      const matchCat = selectedCategory === 'all' || book.category === selectedCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        book.title_ur.toLowerCase().includes(q) ||
        book.title_ar.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.intro_ur.toLowerCase().includes(q)
      );
    });
  }, [uniqueModernBooks, viewMode, selectedCategory, searchQuery]);

  return (
    <div className="bg-white min-h-screen text-stone-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* Top: Header, Search, and Curriculum Mode Toggle */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>مکتبہ شاملہ طرز — کتبِ علومِ اسلامیہ مع وفاق المدارس نصاب</span>
            </div>

            {/* Bookmarks & History Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsBookmarksModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-nastaliq font-bold shadow-2xs transition cursor-pointer"
              title="محفوظ شدہ بُک مارکس اور مطالعہ کی تاریخ دیکھیں"
            >
              <BookMarked className="w-3.5 h-3.5 text-amber-600" />
              <span>میرے محفوظ شدہ بُک مارکس و تاریخ</span>
            </button>

            {/* Interactive Quiz Center Trigger */}
            <a
              href="/?tab=quiz"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/?tab=quiz');
                window.dispatchEvent(new CustomEvent('tehreek:navigate', { detail: { url: '/?tab=quiz' } }));
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 text-xs font-nastaliq font-bold shadow-2xs transition cursor-pointer"
              title="صحیح البخاری و فقہ کے خود امتحانی کوئز حل کریں"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>امتحانی کوئز سنٹر (MCQs)</span>
            </a>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-nastaliq text-emerald-900 leading-relaxed">
            تحریکِ ایمان ڈیجیٹل کتب خانہ
          </h1>
          <p className="max-w-2xl text-stone-500 text-sm sm:text-base font-nastaliq leading-loose">
            مستند اسلامی کتب کا صاف ستھرا ذخیرہ۔ تمام کلاسیکی کتب پبلک ڈومین ہیں، جبکہ جدید کتب اصل مراجع کے ساتھ فراہم کی گئی ہیں۔
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-md relative my-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="کتاب، مصنف یا موضوع تلاش کریں..."
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-nastaliq focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          {/* Resume Reading Banner (جہاں سے چھوڑا تھا وہیں سے مطالعہ جاری رکھیں) */}
          {lastRead && (
            <div className="w-full max-w-2xl bg-gradient-to-r from-emerald-950 via-[#0d3b28] to-emerald-950 text-white rounded-2xl p-4 sm:p-5 border-2 border-amber-400/80 shadow-lg text-right relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                    <BookMarked className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-nastaliq">
                        جہاں سے چھوڑا تھا وہیں سے پڑھیں
                      </span>
                      <span className="text-[11px] text-emerald-200 font-nastaliq">
                        {formatTimeAgoUrdu(lastRead.lastReadAt)}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-nastaliq text-amber-100">
                      {lastRead.bookTitle} {lastRead.chapterTitle ? `— ${lastRead.chapterTitle}` : ''}
                    </h3>
                    <p className="text-xs text-emerald-200 font-nastaliq">
                      صفحہ نمبر: {(lastRead.pageNumber).toLocaleString('ur-PK')} از {(lastRead.totalSections).toLocaleString('ur-PK')}
                      {lastRead.progressPercent !== undefined && ` (${(lastRead.progressPercent).toLocaleString('ur-PK')}٪ مطالعہ مکمل)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/books/${lastRead.bookSlug}?page=${lastRead.pageNumber}`}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-nastaliq font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    <span>مطالعہ جاری رکھیں</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* View Mode Switcher: Categories vs Wifaq ul Madaris Classes */}
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl border border-stone-200 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('categories')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-nastaliq font-bold transition-all duration-150 cursor-pointer ${
                viewMode === 'categories'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>موضوعاتی کتب خانہ (تمام علوم)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dars-e-nizami')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-nastaliq font-bold transition-all duration-150 cursor-pointer ${
                viewMode === 'dars-e-nizami'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>وفاق المدارس نصاب (درجات وار)</span>
            </button>
          </div>

          {/* Filter Chips Layer */}
          {viewMode === 'categories' ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {CATEGORY_CHIPS.map(chip => {
                const isSelected = selectedCategory === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedCategory(chip.id)}
                    className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-700/30 -translate-y-0.5'
                        : 'bg-white text-stone-700 border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50/50 shadow-xs'
                    }`}
                  >
                    {chip.title_ur}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedDarjaId('all')}
                  className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all duration-150 cursor-pointer ${
                    selectedDarjaId === 'all'
                      ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-600/30 -translate-y-0.5'
                      : 'bg-white text-stone-700 border border-amber-200 hover:border-amber-600 hover:bg-amber-50/50 shadow-xs'
                  }`}
                >
                  تمام درسی کتب ({WIFAQ_DARJAT.reduce((acc, d) => acc + d.bookSlugs.length, 0)})
                </button>
                {WIFAQ_DARJAT.map(darja => {
                  const isSelected = selectedDarjaId === darja.id;
                  return (
                    <button
                      key={darja.id}
                      type="button"
                      onClick={() => setSelectedDarjaId(darja.id)}
                      className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-600/30 -translate-y-0.5'
                          : 'bg-white text-stone-700 border border-amber-200 hover:border-amber-600 hover:bg-amber-50/50 shadow-xs'
                      }`}
                    >
                      {darja.title_ur}
                    </button>
                  );
                })}
              </div>

              {/* Darja Informative Banner */}
              {selectedDarja && (
                <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border border-amber-200 rounded-2xl p-4 text-center max-w-2xl mx-auto space-y-1 shadow-xs">
                  <div className="inline-block px-3 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold font-nastaliq">
                    {selectedDarja.stage_ur}
                  </div>
                  <h3 className="font-bold text-amber-950 font-nastaliq text-base sm:text-lg">
                    {selectedDarja.title_ur} — نصابِ کتب
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-700 font-nastaliq leading-relaxed">
                    {selectedDarja.description_ur}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Hamd & Naat Player Button */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button 
              onClick={() => setShowNaatPlayer(true)} 
              title="حمد و نعتِ رسول ﷺ سنیں"
              aria-label="حمد و نعتِ رسول ﷺ پلیئر"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl shadow font-nastaliq font-bold flex items-center gap-2 cursor-pointer transition active:scale-95 text-xs sm:text-sm border border-emerald-500/40"
            >
              🎙️ حمد و نعتِ رسول ﷺ - 100 نعتیں
            </button>
          </div>
        </div>

        {/* Section 1: Public Domain کتب خانہ (4 columns desktop, 2 mobile) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-emerald-800"></span>
                <h2 className="text-2xl sm:text-3xl font-black font-nastaliq text-emerald-900">
                  Public Domain کتب خانہ
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 font-nastaliq mt-1">
                کاپی رائٹ سے آزاد کلاسیکی متون و شروحات • مصدقہ متن اور معیاری نسخے
              </p>
            </div>
            <div className="text-xs font-bold font-nastaliq text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-100 self-start sm:self-auto">
              کل دستیاب کتب: {filteredPublicBooks.length}
            </div>
          </div>

          {filteredPublicBooks.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <BookMarked className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-base font-nastaliq text-stone-600">آپ کی تلاش سے مطابقت رکھنے والی کوئی کتاب نہیں ملی۔</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredPublicBooks.map(book => (
                <div
                  key={book.id}
                  onClick={() => {
                    if (!book.cover_only) {
                      window.location.href = `/books/${book.slug}`;
                    }
                  }}
                  className={`group bg-white rounded-2xl border border-gray-100 hover:border-emerald-700/40 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${book.cover_only ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                >
                  <div className="space-y-3">
                    {/* Cover Image: 3D Mockup with Spotlight Background */}
                    <div className="book-spotlight-container">
                      <div className="premium-book-cover w-40 sm:w-44 h-60 sm:h-64 mx-auto">
                        <img
                          src={book.cover_url}
                          alt={book.title_ur}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.endsWith('.svg')) {
                              target.src = book.cover_url.replace(/\.svg$/, '.jpg');
                            }
                          }}
                        />
                      </div>
                      <span className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-emerald-950/90 backdrop-blur-md text-amber-300 text-[10px] font-bold font-nastaliq shadow-sm border border-amber-400/30 z-10">
                        {book.category}
                      </span>
                      {(() => {
                        const darjaInfo = getDarjaForBookSlug(book.slug);
                        if (!darjaInfo) return null;
                        return (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/95 backdrop-blur-md text-stone-950 text-[10px] font-bold font-nastaliq shadow-sm border border-amber-300/80 z-10">
                            {darjaInfo.badge_ur}
                          </span>
                        );
                      })()}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/85 backdrop-blur-md text-amber-100 text-[10px] font-semibold border border-stone-700 z-10">
                        {book.volumes} جلدیں
                      </span>
                    </div>

                    {/* Book Name in Jameel Noori Nastaleeq */}
                    <h3 className="font-bold font-nastaliq text-base sm:text-lg text-stone-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-1">
                      {book.title_ur}
                    </h3>

                    {/* Arabic Title */}
                    <p className="font-arabic text-xs text-stone-500 line-clamp-1 leading-relaxed">
                      {book.title_ar}
                    </p>

                    {/* Author Name in small gray */}
                    <p className="text-xs text-stone-500 font-nastaliq line-clamp-1">
                      {book.author} {book.death_year ? `(${book.death_year}ھ)` : ''}
                    </p>

                    {/* 2-Line Intro */}
                    <p className="text-[11px] text-stone-600 font-nastaliq line-clamp-2 leading-relaxed text-right">
                      {book.intro_ur}
                    </p>
                  </div>

                  {/* Card Footer Button */}
                  <div className="pt-4 mt-2 border-t border-gray-50 flex items-center justify-between text-xs font-bold font-nastaliq text-emerald-800 group-hover:text-emerald-900">
                    {book.cover_only ? (
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <span>جلد آ رہی ہے (اجازت درکار)</span>
                      </span>
                    ) : (
                      <a
                        href={`/books/${book.slug}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/books/${book.slug}`;
                        }}
                        className="flex items-center gap-1 hover:underline"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>کتاب پڑھیں</span>
                      </a>
                    )}
                    <span className="text-[11px] text-stone-400">
                      {book.cover_only ? 'اجازت درکار' : `${(Array.isArray(book.pages) ? book.pages.length : book.pages).toLocaleString('ur-PK')} ص`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Link Library — جدید کتب */}
        <section className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-amber-500"></span>
                <h2 className="text-2xl sm:text-3xl font-black font-nastaliq text-emerald-900">
                  Link Library — جدید کتب
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 font-nastaliq mt-1">
                کاپی رائٹ کی پاسداری: جدید معتمد علمی مراجع کے مصدقہ اصل ماخذ کے براہِ راست روابط
              </p>
            </div>
            <span className="text-xs font-bold font-nastaliq text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 self-start sm:self-auto">
              بیرونی ماخذ کتب: {filteredModernBooks.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModernBooks.map(book => (
              <div
                key={book.id}
                className="bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/20 rounded-2xl border-2 border-emerald-100 hover:border-emerald-600/50 p-5 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/60 font-nastaliq">
                        {book.category} • جدید مرجع
                      </span>
                      <h3 className="font-bold font-nastaliq text-lg sm:text-xl text-emerald-950 leading-snug">
                        {book.title_ur}
                      </h3>
                      <p className="text-xs text-stone-600 font-nastaliq">
                        {book.author} {book.death_year ? `(${book.death_year})` : ''}
                      </p>
                    </div>

                    <div className="book-spotlight-container shrink-0 p-1">
                      <div className="premium-book-cover w-16 h-24">
                        <img
                          src={book.cover_url}
                          alt={book.title_ur}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.endsWith('.svg')) {
                              target.src = book.cover_url.replace(/\.svg$/, '.jpg');
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 font-nastaliq leading-relaxed line-clamp-3 text-right">
                    {book.intro_ur}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500 font-nastaliq pt-1">
                    <span>{book.volumes} جلدیں</span>
                    <span>•</span>
                    <span>{book.pages.toLocaleString('ur-PK')} صفحات</span>
                    {book.publisher && (
                      <>
                        <span>•</span>
                        <span className="truncate">{book.publisher}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-emerald-100/70">
                  <a
                    href={book.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold font-nastaliq shadow-sm hover:shadow transition-all active:scale-95"
                  >
                    <span>اصل ماخذ پر پڑھیں</span>
                    <ExternalLink className="w-4 h-4 text-amber-300" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 100 Naats & Hamds Hybrid Draggable Player */}
        <NaatPlayer 
          isOpen={showNaatPlayer} 
          onClose={() => setShowNaatPlayer(false)} 
        />

        {/* User Bookmarks & Reading History Modal */}
        <BookmarksHistoryModal
          isOpen={isBookmarksModalOpen}
          onClose={() => setIsBookmarksModalOpen(false)}
        />

      </div>
    </div>
  );
}