'use client';

import { useState, useMemo } from 'react';
import { BookOpen, ExternalLink, Sparkles, BookMarked, Search } from 'lucide-react';
import { publicDomainBooks, modernBooks, BookCategoryTitle } from '../data/publicDomainBooks';

const CATEGORY_CHIPS: { id: BookCategoryTitle | 'all'; title_ur: string }[] = [
  { id: 'all', title_ur: 'تمام کتب' },
  { id: 'Quran & Tafseer', title_ur: 'قرآن و تفسیر' },
  { id: 'Hadith', title_ur: 'حدیث شریف' },
  { id: 'Seerat', title_ur: 'سیرتِ نبوی' },
  { id: 'Fiqh', title_ur: 'فقہ و فتاویٰ' },
  { id: 'Tareekh', title_ur: 'تاریخ و سوانح' },
  { id: 'Aqeedah', title_ur: 'عقائد و کلام' }
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<BookCategoryTitle | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // FIX CRITICAL BUG: Guaranteed deduplication: 1 book = 1 card only
  const uniquePublicBooks = useMemo(() => {
    return publicDomainBooks.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, []);

  const uniqueModernBooks = useMemo(() => {
    return modernBooks.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, []);

  const filteredPublicBooks = useMemo(() => {
    return uniquePublicBooks.filter(book => {
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
  }, [uniquePublicBooks, selectedCategory, searchQuery]);

  const filteredModernBooks = useMemo(() => {
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
  }, [uniqueModernBooks, selectedCategory, searchQuery]);

  return (
    <div className="bg-white min-h-screen text-stone-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* Top: 6 Category Chips Filter & Search */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>مکتبہ شاملہ طرز — کتبِ علومِ اسلامیہ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-nastaliq text-emerald-900 leading-relaxed">
            تحریکِ ایمان ڈیجیٹل کتب خانہ
          </h1>
          <p className="max-w-2xl text-stone-500 text-sm sm:text-base font-nastaliq leading-loose">
            مستند اسلامی کتب کا صاف ستھرا ذخیرہ۔ تمام کلاسیکی کتب پبلک ڈومین ہیں، جبکہ جدید کتب اصل مراجع کے ساتھ فراہم کی گئی ہیں۔
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-md relative my-2">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="کتاب، مصنف یا موضوع تلاش کریں..."
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-nastaliq focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          {/* 6 Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {CATEGORY_CHIPS.map(chip => {
              const isSelected = selectedCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedCategory(chip.id)}
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
                  onClick={() => { window.location.href = `/books/${book.slug}`; }}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-emerald-700/40 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* Cover Image: object-cover h-64 */}
                    <div className="relative overflow-hidden rounded-xl bg-gray-100 shadow-inner">
                      <img
                        src={book.cover_url}
                        alt={book.title_ur}
                        loading="lazy"
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-emerald-900/85 backdrop-blur-md text-amber-300 text-[10px] font-bold font-nastaliq shadow-sm">
                        {book.category}
                      </span>
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-stone-800 text-[10px] font-semibold">
                        {book.volumes} جلدیں
                      </span>
                    </div>

                    {/* Book Name in Noto Nastaliq */}
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
                    <span className="text-[11px] text-stone-400">
                      {(Array.isArray(book.pages) ? book.pages.length : book.pages).toLocaleString('ur-PK')} ص
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

                    <img
                      src={book.cover_url}
                      alt={book.title_ur}
                      className="w-16 h-22 object-cover rounded-xl shadow-xs border border-gray-200 shrink-0"
                    />
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

      </div>
    </div>
  );
}