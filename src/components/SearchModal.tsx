import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, ArrowLeft, Layers, Scroll, Scale, Sparkles, BookMarked, FolderOpen } from 'lucide-react';
import { booksDatabase } from '../data/booksData';
import { Book, SearchResult, BookCategory } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (book: Book, segmentId: string) => void;
}

// Normalize Arabic text to strip diacritics / harakat for flexible matching
function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ٟ]/g, '') // Remove tashkeel
    .replace(/[ٱإأآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'all'>('all');

  const categories: { id: BookCategory | 'all'; name: string; icon: React.ReactNode }[] = [
    { id: 'all', name: `تمام کتب (${booksDatabase.length} کتب)`, icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'kharji_kitab', name: `خارجی کتبِ مطالعہ (${booksDatabase.filter(b => b.category === 'kharji_kitab').length} کتب)`, icon: <FolderOpen className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'sittah', name: 'صحاحِ ستہ و کتبِ حدیث (8)', icon: <Scroll className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'fatawa', name: 'کتبِ فتاویٰ و فقہ (4)', icon: <Scale className="w-3.5 h-3.5 text-red-500" /> },
    { id: 'dars_curriculum', name: 'درسِ نظامی نصاب (6)', icon: <BookMarked className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'quran_tafseer', name: 'القرآن والتفاسیر (2)', icon: <Sparkles className="w-3.5 h-3.5 text-teal-500" /> },
  ];

  const results: SearchResult[] = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) return [];

    const queryNorm = normalizeArabic(searchTerm);
    const queryRaw = searchTerm.toLowerCase().trim();
    const matches: SearchResult[] = [];

    for (const book of booksDatabase) {
      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        continue;
      }

      for (const chapter of book.chapters) {
        for (const segment of chapter.segments) {
          const arabicNorm = normalizeArabic(segment.arabicText);
          const urduTrans = segment.urduTranslation.toLowerCase();
          const tashreeh = segment.tashreeh.toLowerCase();

          // Check match type
          if (arabicNorm.includes(queryNorm)) {
            matches.push({
              bookId: book.id,
              bookTitle: book.title,
              category: book.category,
              subjectNameUrdu: book.subjectNameUrdu,
              chapterTitle: chapter.titleUrdu,
              segmentId: segment.id,
              arabicText: segment.arabicText,
              translation: segment.urduTranslation,
              matchType: 'arabic',
              snippet: segment.arabicText.slice(0, 120) + '...'
            });
          } else if (urduTrans.includes(queryRaw)) {
            matches.push({
              bookId: book.id,
              bookTitle: book.title,
              category: book.category,
              subjectNameUrdu: book.subjectNameUrdu,
              chapterTitle: chapter.titleUrdu,
              segmentId: segment.id,
              arabicText: segment.arabicText,
              translation: segment.urduTranslation,
              matchType: 'translation',
              snippet: segment.urduTranslation.slice(0, 120) + '...'
            });
          } else if (tashreeh.includes(queryRaw)) {
            matches.push({
              bookId: book.id,
              bookTitle: book.title,
              category: book.category,
              subjectNameUrdu: book.subjectNameUrdu,
              chapterTitle: chapter.titleUrdu,
              segmentId: segment.id,
              arabicText: segment.arabicText,
              translation: segment.urduTranslation,
              matchType: 'tashreeh',
              snippet: segment.tashreeh.slice(0, 120) + '...'
            });
          } else if (segment.mahalIraab?.some(i => i.word.includes(queryRaw) || i.role.includes(queryRaw) || i.detail.includes(queryRaw))) {
            matches.push({
              bookId: book.id,
              bookTitle: book.title,
              category: book.category,
              subjectNameUrdu: book.subjectNameUrdu,
              chapterTitle: chapter.titleUrdu,
              segmentId: segment.id,
              arabicText: segment.arabicText,
              translation: segment.urduTranslation,
              matchType: 'iraab',
              snippet: `محلِ اعراب: ${segment.arabicText.slice(0, 100)}...`
            });
          }
        }
      }
    }

    return matches;
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-[#01140e]/80 backdrop-blur-md animate-fadeIn">
      <div className="modal-contrast-card rounded-3xl max-w-3xl w-full p-6 shadow-2xl text-amber-50 flex flex-col max-h-[85vh] mt-8">
        
        {/* Header with Search Input */}
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <Search className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-nastaliq text-amber-300">
                ذہین سرچ انجن (صحاحِ ستہ، فتاویٰ، اور درسی کتب)
              </h3>
              <p className="text-xs text-emerald-200/90 font-nastaliq">
                عربی، اردو یا رومن اردو میں مطلوبہ حدیث یا فقہی مسئلہ تلاش فرمائیں
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-amber-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer border border-transparent hover:border-amber-400/40"
            title="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative mb-3.5">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            placeholder="عربی لفظ (اعراب کے ساتھ یا بغیر)، رومن اردو (namaz, roza)، حدیث کا متن یا فتوے کا عنوان..."
            className="w-full pr-11 pl-4 py-3 rounded-2xl input-jewel text-base font-arabic focus:outline-none shadow-inner"
          />
          <Search className="w-5 h-5 text-amber-400 absolute right-3.5 top-3.5" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-emerald-800/50">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nastaliq transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md font-black ring-1 ring-amber-400/40'
                  : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400/50'
              }`}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {searchTerm.trim().length >= 2 && results.length === 0 ? (
            <div className="text-center py-12 text-stone-300 font-nastaliq card-jewel-dark rounded-2xl p-6 border border-emerald-800/50">
              <Layers className="w-10 h-10 mx-auto text-amber-400/60 mb-2" />
              <p className="text-base text-amber-200 font-bold">اس لفظ کے مطابق کوئی عبارت یا مسئلہ تلاش نہیں ہوا</p>
              <p className="text-xs text-emerald-200/80 mt-1">کوئی دوسرا لفظ یا مادہ لکھ کر تلاش فرمائیں</p>
            </div>
          ) : results.length > 0 ? (
            results.map((res, idx) => {
              const targetBook = booksDatabase.find(b => b.id === res.bookId);
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (targetBook) {
                      onSelectResult(targetBook, res.segmentId);
                      onClose();
                    }
                  }}
                  className="group cursor-pointer rounded-2xl p-4 card-jewel-dark hover:border-amber-400 transition-all space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/90 text-amber-200 font-bold font-arabic border border-amber-400/40">
                        {res.bookTitle}
                      </span>
                      <span className="text-[11px] text-emerald-200/80 font-nastaliq">
                        {res.chapterTitle}
                      </span>
                    </div>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/40">
                      {res.matchType === 'arabic' && 'عربی متن'}
                      {res.matchType === 'translation' && 'ترجمہ'}
                      {res.matchType === 'tashreeh' && 'تشریح و فتاویٰ'}
                      {res.matchType === 'iraab' && 'محلِ اعراب'}
                    </span>
                  </div>

                  <p className="font-arabic text-base text-amber-100 line-clamp-2 leading-loose drop-shadow-xs">
                    {res.arabicText}
                  </p>

                  <p className="font-nastaliq text-xs text-emerald-100/90 line-clamp-1 leading-relaxed">
                    {res.translation}
                  </p>

                  <div className="flex justify-end items-center gap-1 text-[11px] font-bold text-amber-300 group-hover:text-amber-200 font-nastaliq">
                    <span>کتاب میں کھولیں</span>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform text-amber-400" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-stone-300 font-nastaliq card-jewel-dark rounded-2xl p-6 border border-emerald-800/50">
              <BookOpen className="w-10 h-10 mx-auto text-amber-400 mb-2" />
              <p className="text-sm font-bold text-amber-200">حدیث، فقہی مسئلہ، یا درسی عبارت تلاش کریں</p>
              <p className="text-xs text-emerald-200/80 mt-1 mb-4">نیچے دیے گئے عمومی عنوانات پر کلک کر کے بھی سرچ کیا جا سکتا ہے:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['الأعمال بالنيات', 'بني الإسلام على خمس', 'الطهور', 'فتاوى', 'القياس', 'الكلمة', 'namaz', 'roza'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-amber-200 font-arabic border border-emerald-700/60 hover:border-amber-400 transition-all cursor-pointer"
                  >
                    ⚡ {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 flex justify-between items-center text-xs text-emerald-200/80 font-nastaliq">
          <span>نتائج: {results.length} عبارتیں دستیاب ہیں</span>
          <span>تحریکِ ایمان ڈیجیٹل سرچ انجن</span>
        </div>

      </div>
    </div>
  );
};
