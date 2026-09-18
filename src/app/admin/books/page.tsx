'use client';

import { useState, useMemo } from 'react';
import { publicDomainBooks, modernBooks, ModernBook } from '../../../data/publicDomainBooks';
import { ShieldCheck, Search, BookOpen, ExternalLink } from 'lucide-react';

export default function AdminBooksPage() {
  const [filterType, setFilterType] = useState<'all' | 'public' | 'external'>('all');
  const [search, setSearch] = useState('');

  // Strict deduplication
  const deduplicatedPublic = useMemo(() => {
    return publicDomainBooks.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, []);

  const deduplicatedModern = useMemo(() => {
    return modernBooks.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, []);

  const allBooks = useMemo(() => {
    const combined = [...deduplicatedPublic, ...deduplicatedModern];
    return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, [deduplicatedPublic, deduplicatedModern]);

  const filtered = useMemo(() => {
    return allBooks.filter(b => {
      if (filterType === 'public' && b.source_type !== 'public') return false;
      if (filterType === 'external' && b.source_type !== 'external') return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        b.title_ur.toLowerCase().includes(q) ||
        b.title_ar.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    });
  }, [allBooks, filterType, search]);

  return (
    <div className="min-h-screen bg-white text-stone-900 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-nastaliq text-emerald-950">
                انتظامیہ: کتب خانہ کنٹرول پینل
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-nastaliq">
                پبلک ڈومین اور جدید کتب کے ڈیٹا کی درستگی اور مانیٹرنگ
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-center">
              <span className="text-xs text-stone-500 font-nastaliq block">پبلک ڈومین</span>
              <span className="text-lg font-bold text-emerald-900">{deduplicatedPublic.length}</span>
            </div>
            <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 text-center">
              <span className="text-xs text-stone-500 font-nastaliq block">جدید مراجع</span>
              <span className="text-lg font-bold text-amber-900">{deduplicatedModern.length}</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-nastaliq transition ${
                filterType === 'all' ? 'bg-emerald-800 text-white' : 'bg-white text-stone-700 border border-gray-200'
              }`}
            >
              تمام ({allBooks.length})
            </button>
            <button
              onClick={() => setFilterType('public')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-nastaliq transition ${
                filterType === 'public' ? 'bg-emerald-800 text-white' : 'bg-white text-stone-700 border border-gray-200'
              }`}
            >
              صرف پبلک ڈومین ({deduplicatedPublic.length})
            </button>
            <button
              onClick={() => setFilterType('external')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-nastaliq transition ${
                filterType === 'external' ? 'bg-emerald-800 text-white' : 'bg-white text-stone-700 border border-gray-200'
              }`}
            >
              صرف جدید کتب ({deduplicatedModern.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="تلاش کریں..."
              className="w-full pr-9 pl-4 py-2 bg-white text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 font-nastaliq"
            />
          </div>
        </div>

        {/* Clean Table of Books */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-stone-500 font-nastaliq">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">کتاب کا نام</th>
                  <th className="py-3 px-4">مصنف</th>
                  <th className="py-3 px-4">موضوع</th>
                  <th className="py-3 px-4">قسم</th>
                  <th className="py-3 px-4">صفحات / جلدیں</th>
                  <th className="py-3 px-4 text-center">ایکشن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4 text-stone-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-stone-900 font-nastaliq text-sm">
                      {b.title_ur}
                      <span className="block text-[11px] text-stone-400 font-arabic font-normal mt-0.5">{b.title_ar}</span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-nastaliq">
                      {b.author}
                      {b.death_year && <span className="text-[10px] text-stone-400 block font-sans">وفات: {b.death_year}ھ</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.source_type === 'public' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-blue-50 text-blue-900 border border-blue-200'
                      }`}>
                        {b.source_type === 'public' ? 'پبلک ڈومین' : 'بیرونی ماخذ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-sans">
                      {b.volumes} جلد / {Array.isArray(b.pages) ? b.pages.length : b.pages} ص
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.source_type === 'public' ? (
                        <a
                          href={`/books/${b.slug}`}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold font-nastaliq hover:underline"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>مطالعہ</span>
                        </a>
                      ) : (
                        <a
                          href={(b as ModernBook).external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-bold font-nastaliq hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>ماخذ</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}