import React, { useState, useMemo } from 'react';
import { BookOpen, ExternalLink, Sparkles, BookMarked, Award } from 'lucide-react';
import { publicDomainBooks, modernBooks, PublicDomainBook, BookCategoryTitle } from '../data/publicDomainBooks';
import { AppTab } from '../types';
import { NaatPlayer } from './NaatPlayer';
import { BayanSection } from './BayanSection';
import { GlobalComments } from './GlobalComments';

interface DashboardProps {
  onSelectPublicBook?: (book: PublicDomainBook) => void;
  onSelectBook?: (book: any) => void;
  setActiveTab: (tab: AppTab) => void;
  searchQuery?: string;
  onSendToAI?: (arabicText: string, bookName: string) => void;
  onOpenKharjiBooks?: (book?: any) => void;
  onOpenAdmin?: () => void;
  userName?: string;
  customLogoSrc?: string;
  onOpenNaatPlayer?: () => void;
}

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

export const URDU_BADGES: Record<string, string> = {
  'all': 'تمام کتب',
  'Quran & Tafseer': 'قرآن و تفسیر',
  'Hadith': 'حدیث شریف',
  'Seerat': 'سیرتِ نبوی',
  'Fiqh': 'فقہ و فتاویٰ',
  'Tareekh': 'تاریخ و سوانح',
  'Aqeedah': 'عقائد و کلام',
  'Dars-e-Nizami': 'درسِ نظامی',
  'Exam Papers': 'امتحانی پرچے'
};

const CATEGORY_HEADERS: Record<string, { title: string; subtitle: string }> = {
  'all': {
    title: 'جامع تراثِ اسلامی و ڈیجیٹل کتب خانہ',
    subtitle: 'کاپی رائٹ سے آزاد کلاسیکی متون و شروحات • مصدقہ متن اور معیاری نسخے'
  },
  'Quran & Tafseer': {
    title: 'قرآنِ کریم اور مستند تفاسیر',
    subtitle: 'مصحف عثمانی، ترجمہ و 4 معتمد کلاسیکی تفاسیر (ابن کثیر، جلالین، بیضاوی، عثمانی)'
  },
  'Hadith': {
    title: 'متونِ حدیث اور شروحاتِ سنت',
    subtitle: 'صحاح ستہ، مسانید، معاجم و سنن مع اعراب، سلیس ترجمہ، سند و متن تجزیہ'
  },
  'Seerat': {
    title: 'سیرتِ سید المرسلین ﷺ و شمائلِ محمدیہ',
    subtitle: 'سرورِ کونین ﷺ کے اسفار، اخلاق، عبادات اور مبارک معمولات کا مستند ذخیرہ'
  },
  'Fiqh': {
    title: 'فقہِ اسلامی، فتاویٰ اور احکامِ شریعت',
    subtitle: 'متونِ اربعہ، اصولِ فقہ، شروحات اور فقہ حنفی و مقارن کی امہات الکتب'
  },
  'Tareekh': {
    title: 'تاریخِ اسلام، طبقات و سوانحِ صحابہ',
    subtitle: 'سلف صالحین، ائمہ مجتہدین اور صحابہ کرام رضی اللہ عنہم کے مفصل حالات و تراجم'
  },
  'Aqeedah': {
    title: 'عقائدِ اہلِ سنت اور علم الکلام',
    subtitle: 'عقیدہ طحاویہ، ماتریدیہ و اشعریہ کے براہین اور دفاعِ سنت کے کلامی متون'
  },
  'Dars-e-Nizami': {
    title: 'نصابِ درسِ نظامی (تمام درجاتِ عالیہ و عالمیہ)',
    subtitle: 'صرف، نحو، اصول، منطق، بلاغت، فقہ، ادب اور حدیث کے درسی متون و حواشی'
  },
  'Exam Papers': {
    title: 'وفاق المدارس امتحانی پرچہ جات و حل شدہ نوٹس',
    subtitle: 'سالانہ امتحانات کے حل شدہ سوالات، نحوی تراکیب، اعراب و ممتحن کے قیمتی مشورے'
  }
};

interface DarjaOption {
  key: string;
  label: string;
  matchPattern?: RegExp;
}

const DARJA_OPTIONS: DarjaOption[] = [
  { key: 'all', label: 'تمام درجات' },
  { key: 'ula', label: 'درجہ اولیٰ (عامہ اول)', matchPattern: /اولیٰ|عامہ اول|صرف میر|نحو میر|تیسیر المنطق|مالا بد منہ|القراءۃ الواضحۃ/i },
  { key: 'sania', label: 'درجہ ثانیہ (عامہ دوم)', matchPattern: /ثانیہ|عامہ دوم|علم الصیغہ|نور الایضاح|مرقاۃ|الفصول الاکبری|ہدایۃ النحو/i },
  { key: 'salisa', label: 'درجہ ثالثہ (خاصہ اول)', matchPattern: /ثالثہ|خاصہ اول|القدوری|کنز الدقائق|کافیہ|قطبی|اصول الشاشی|ریاض الصالحین|دروس البلاغۃ/i },
  { key: 'rabia', label: 'درجہ رابعہ (خاصہ دوم)', matchPattern: /رابعہ|خاصہ دوم|شرح الوقایہ|شرح جامی|شرح التہذیب|دیوان الحماسۃ|نفحۃ الیمن/i },
  { key: 'khamisa', label: 'درجہ خامسہ (عالیہ اول)', matchPattern: /خامسہ|عالیہ اول|نور الانوار|مختصر المعانی|الفوز الکبیر|مقامات الحریری|السراجی/i },
  { key: 'sadisa', label: 'درجہ سادسہ (عالیہ دوم)', matchPattern: /سادسہ|عالیہ دوم|مشکوۃ|مشکوٰۃ|الہدایہ|حسامی|شرح العقائد النسفیۃ|مسلم الثبوت/i },
  { key: 'sabia', label: 'درجہ سابعہ (موقوف علیہ)', matchPattern: /سابعہ|موقوف علیہ|بیضاوی|طحاوی شریف|ہدایہ ثالث|ہدایہ رابع/i },
  { key: 'aalamia', label: 'دورۂ حدیث شریف (عالمیہ)', matchPattern: /دورۂ حدیث|عالمیہ|بخاری|مسلم|ترمذی|ابو داود|نسائی|ابن ماجہ|موطا|شمائل/i },
  { key: 'takhasus', label: 'تخصص فی الفقہ والافتاء', matchPattern: /تخصص|افتاء|رسم المفتي|الأشباہ والنظائر|قواعد الفقہ|درر الحکام/i }
];

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectPublicBook,
  onSelectBook,
  setActiveTab,
  searchQuery = '',
  onOpenNaatPlayer
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BookCategoryTitle | 'all'>('all');
  const [selectedDarja, setSelectedDarja] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [showNaatPlayer, setShowNaatPlayer] = useState(false);

  const handleOpenBook = (slug: string) => {
    if (onSelectBook) {
      onSelectBook(slug);
    } else if (onSelectPublicBook) {
      const found = publicDomainBooks.find(b => b.slug === slug);
      if (found) onSelectPublicBook(found);
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/books/${slug}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.dispatchEvent(new CustomEvent('tehreek:navigate', { detail: { url: `/books/${slug}` } }));
      window.scrollTo(0, 0);
    }
  };

  const effectiveSearch = (searchQuery || localSearch).trim().toLowerCase();

  // FIX CRITICAL BUG: Strict deduplication ensuring 1 book = 1 card only
  const uniquePublicBooks = useMemo(() => {
    return publicDomainBooks.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, []);

  const uniqueModernBooks = useMemo(() => {
    return modernBooks.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, []);

  // Filter public domain books
  const filteredPublicBooks = useMemo(() => {
    return uniquePublicBooks.filter(book => {
      const matchCat = selectedCategory === 'all' || book.category === selectedCategory;
      if (!matchCat) return false;

      // Darja sub-filter for Dars-e-Nizami and Exam Papers
      if ((selectedCategory === 'Dars-e-Nizami' || selectedCategory === 'Exam Papers') && selectedDarja !== 'all') {
        const darjaOpt = DARJA_OPTIONS.find(d => d.key === selectedDarja);
        if (darjaOpt?.matchPattern) {
          const combinedMeta = `${book.title_ur} ${book.title_ar} ${book.intro_ur} ${book.id} ${book.slug}`;
          if (!darjaOpt.matchPattern.test(combinedMeta)) {
            return false;
          }
        }
      }

      if (!effectiveSearch) return true;
      return (
        book.title_ur.toLowerCase().includes(effectiveSearch) ||
        book.title_ar.toLowerCase().includes(effectiveSearch) ||
        book.author.toLowerCase().includes(effectiveSearch) ||
        book.intro_ur.toLowerCase().includes(effectiveSearch) ||
        book.category.toLowerCase().includes(effectiveSearch)
      );
    });
  }, [uniquePublicBooks, selectedCategory, selectedDarja, effectiveSearch]);

  // Filter modern books
  const filteredModernBooks = useMemo(() => {
    return uniqueModernBooks.filter(book => {
      const matchCat = selectedCategory === 'all' || book.category === selectedCategory;
      if (!matchCat) return false;
      if (!effectiveSearch) return true;
      return (
        book.title_ur.toLowerCase().includes(effectiveSearch) ||
        book.title_ar.toLowerCase().includes(effectiveSearch) ||
        book.author.toLowerCase().includes(effectiveSearch) ||
        book.intro_ur.toLowerCase().includes(effectiveSearch)
      );
    });
  }, [uniqueModernBooks, selectedCategory, effectiveSearch]);

  const activeHeader = CATEGORY_HEADERS[selectedCategory] || CATEGORY_HEADERS['all'];
  const showDarjaFilter = selectedCategory === 'Dars-e-Nizami' || selectedCategory === 'Exam Papers';

  return (
    <div className="bg-white min-h-screen text-stone-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* Top: 6 Category Chips Filter */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="flex flex-wrap items-center justify-center gap-2"
            style={{ marginBottom: '0.75rem', position: 'relative', zIndex: 2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>مکتبہ شاملہ طرز — کتبِ علومِ اسلامیہ</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-nastaliq font-bold shadow-2xs transition cursor-pointer"
              title="امتحانی کوئز اور خود تشخیصی مرکز کھولیں"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>امتحانی کوئز سنٹر (MCQs)</span>
            </button>
          </div>

          <h1
            className="font-nastaliq text-[#064e3b] text-center tracking-tight"
            style={{
              fontSize: '2.8rem',
              fontWeight: 700,
              lineHeight: 2.2,
              margin: '1rem 0',
              display: 'block',
              color: '#064e3b',
            }}
          >
            تحریکِ ایمان ڈیجیٹل کتب خانہ
          </h1>
          <p
            className="max-w-2xl text-stone-500 font-nastaliq"
            style={{ marginTop: '0.5rem', lineHeight: 2.2, fontSize: '1rem' }}
          >
            مستند اسلامی تراث کا جامع ذخیرہ۔ تمام کلاسیکی کتب کاپی رائٹ سے آزاد اور پبلک ڈومین ہیں، جبکہ جدید کتب اصل مراجع کے ذریعے فراہم کی گئی ہیں۔
          </p>

          {/* 6 Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {CATEGORY_CHIPS.map(chip => {
              const isSelected = selectedCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(chip.id);
                    setSelectedDarja('all');
                  }}
                  className={`px-5 py-2 rounded-2xl text-sm font-nastaliq font-bold transition-all duration-150 cursor-pointer ${
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

          {/* Secondary Sub-Filter Bar for Darjaat (Dars-e-Nizami & Exam Papers) */}
          {showDarjaFilter && (
            <div className="w-full max-w-4xl bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 sm:p-4 mt-2 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-nastaliq text-emerald-950 font-bold px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                  <span>وفاق المدارس درجات کے لحاظ سے چھانٹی (Sub-Filter):</span>
                </span>
                <span className="text-[11px] text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  {DARJA_OPTIONS.find(d => d.key === selectedDarja)?.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar justify-start sm:justify-center">
                {DARJA_OPTIONS.map(darja => {
                  const isDarjaSelected = selectedDarja === darja.key;
                  return (
                    <button
                      key={darja.key}
                      type="button"
                      onClick={() => setSelectedDarja(darja.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold shrink-0 transition-all cursor-pointer border ${
                        isDarjaSelected
                          ? 'bg-emerald-900 text-amber-300 border-emerald-950 shadow-xs'
                          : 'bg-white hover:bg-emerald-100 text-stone-700 border-emerald-200'
                      }`}
                    >
                      {darja.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Main Section: Dynamic Category Header (4 columns desktop, 2 mobile) */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-emerald-800"></span>
                <h2 className="text-2xl sm:text-3xl font-black font-nastaliq text-emerald-900">
                  {activeHeader.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 font-nastaliq mt-1">
                {activeHeader.subtitle}
              </p>
            </div>

            <div className="text-xs font-bold font-nastaliq text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-100 self-start md:self-auto">
              کل دستیاب کتب: {filteredPublicBooks.length}
            </div>
          </div>

          {filteredPublicBooks.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <BookMarked className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-base font-nastaliq text-stone-600">آپ کی تلاش سے مطابقت رکھنے والی کوئی کتاب نہیں ملی۔</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setLocalSearch('');
                }}
                className="mt-3 px-4 py-1.5 text-xs font-nastaliq font-bold bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 transition"
              >
                تمام کتب دیکھیں
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredPublicBooks.map(book => (
                <div
                  key={book.id}
                  onClick={() => handleOpenBook(book.slug)}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-emerald-700/40 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
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
                      <span 
                        className="absolute top-2 right-2 rounded-md bg-emerald-950/90 backdrop-blur-md text-amber-300 font-bold font-nastaliq shadow-xs border border-amber-400/30 z-10"
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        {URDU_BADGES[book.category] || book.category}
                      </span>
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
                    <p className="text-[11px] text-stone-600 font-nastaliq line-clamp-2 leading-relaxed text-justify">
                      {book.intro_ur}
                    </p>
                  </div>

                  {/* Card Footer Button */}
                  <div className="pt-4 mt-2 border-t border-gray-50 flex items-center justify-between text-xs font-bold font-nastaliq text-emerald-800 group-hover:text-emerald-900">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenBook(book.slug);
                      }}
                      className="flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                      <span>کتاب پڑھیں</span>
                    </button>
                    <span className="text-[11px] text-stone-400">
                      {(Array.isArray(book.pages) ? book.pages.length : book.pages).toLocaleString('ur-PK')} ص
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* Section 2: Link Library - جدید کتب (Different Style + External Link Button) */}
        {/* ========================================================================= */}
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

                  <p className="text-xs text-stone-700 font-nastaliq leading-relaxed line-clamp-3 text-justify">
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

                {/* UI must show button "اصل ماخذ پر پڑھیں" which opens external_link in new tab */}
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

        {/* ========================================================================= */}
        {/* Bayanat & Video Lectures Section with YouTube Style Comment System */}
        {/* ========================================================================= */}
        <div id="bayan-section" className="pt-10 border-t border-gray-100">
          <BayanSection />
        </div>

        {/* 100 Naats & Hamds Hybrid Draggable Player (Fallback if not handled globally) */}
        {!onOpenNaatPlayer && (
          <NaatPlayer 
            isOpen={showNaatPlayer} 
            onClose={() => setShowNaatPlayer(false)} 
          />
        )}

        {/* Global Website Feedback & Comments (Left bottom corner floating card) */}
        <GlobalComments floating={true} page="/" title="اس ویب سائٹ کے بارے میں تبصرہ کریں" />

      </div>
    </div>
  );
};