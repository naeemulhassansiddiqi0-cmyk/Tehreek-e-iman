import React, { useState } from 'react';
import { Book, BookCategory, DarsDarja } from '../../types';
import { booksDatabase } from '../../data/booksData';
import { DARS_DARAJAAT_CONFIG } from '../../data/darajaatConfig';
import { 
  X, 
  Search, 
  BookOpen, 
  Scroll, 
  Scale, 
  BookMarked, 
  Sparkles, 
  CheckCircle2,
  ChevronLeft,
  FolderOpen
} from 'lucide-react';

interface BookDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBookId: string;
  onSelectBook: (book: Book) => void;
  onOpenKharjiBooks?: () => void;
}

export const BookDirectoryModal: React.FC<BookDirectoryModalProps> = ({
  isOpen,
  onClose,
  selectedBookId,
  onSelectBook,
  onOpenKharjiBooks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<BookCategory | 'all'>('all');
  const [activeDarja, setActiveDarja] = useState<DarsDarja | 'all'>('all');

  if (!isOpen) return null;

  const darjaKeys: DarsDarja[] = ['ula', 'sania', 'salisa', 'rabia', 'khamisa', 'sadisa', 'sabia', 'samina', 'takhasus'];

  const filteredBooks = booksDatabase.filter(book => {
    const matchesCategory = activeCategory === 'all' || book.category === activeCategory;
    const matchesDarja = activeDarja === 'all' || book.darjaKey === activeDarja;
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.subjectNameUrdu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDarja && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#01140e]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="modal-contrast-card rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-amber-50"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-850 text-white border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-nastaliq text-amber-300">
                  جامع کتب خانہ و امہات الکتب
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-200 font-bold border border-amber-400/40">
                  {booksDatabase.length} بنیادی کتب
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-nastaliq mt-0.5">
                وفاق المدارس کے نصاب و امہات الحدیث و الفقہ سے مطلوبہ کتاب منتخب فرمائیں
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

        {/* Filters & Search Toolbar */}
        <div className="p-4 sm:p-5 bg-[#022119] border-b border-emerald-800/60 space-y-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="کتاب کا نام، مصنف یا موضوع تلاش کریں (مثلاً: بخاری، ہدایہ، شامی، قدوری)..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl input-jewel text-xs sm:text-sm font-nastaliq focus:outline-none placeholder:text-emerald-300/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:text-amber-200 font-nastaliq"
              >
                صاف کریں
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nastaliq transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md font-black ring-1 ring-amber-400/40'
                  : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>تمام کتب ({booksDatabase.length})</span>
            </button>

            <button
              onClick={() => {
                if (onOpenKharjiBooks) {
                  onClose();
                  onOpenKharjiBooks();
                } else {
                  setActiveCategory('kharji_kitab');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nastaliq transition-all cursor-pointer ${
                activeCategory === 'kharji_kitab'
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 border-2 border-amber-300 shadow-md font-black ring-1 ring-amber-400/40'
                  : 'card-jewel-dark text-amber-300 hover:text-amber-100 border border-amber-500/50 hover:border-amber-400'
              }`}
              title="۱۰۰۰ کتب کا پاپ اپ ایکسپلورر کھولیں"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>📁 خارجی کتب ({booksDatabase.filter(b => b.category === 'kharji_kitab').length} - پاپ اپ)</span>
            </button>

            <button
              onClick={() => setActiveCategory('sittah')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nastaliq transition-all cursor-pointer ${
                activeCategory === 'sittah'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md font-black ring-1 ring-amber-400/40'
                  : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400/50'
              }`}
            >
              <Scroll className="w-3.5 h-3.5 text-amber-400" />
              <span>صحاحِ ستہ و امہات الحدیث (8)</span>
            </button>

            <button
              onClick={() => setActiveCategory('fatawa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nastaliq transition-all cursor-pointer ${
                activeCategory === 'fatawa'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md font-black ring-1 ring-amber-400/40'
                  : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400/50'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>کتبِ فتاویٰ و فقہ (4)</span>
            </button>

            <button
              onClick={() => setActiveCategory('dars_curriculum')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nastaliq transition-all cursor-pointer ${
                activeCategory === 'dars_curriculum'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md font-black ring-1 ring-amber-400/40'
                  : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400/50'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 text-amber-400" />
              <span>درسِ نظامی نصاب (6)</span>
            </button>

            <button
              onClick={() => setActiveCategory('quran_tafseer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nastaliq transition-all cursor-pointer ${
                activeCategory === 'quran_tafseer'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md font-black ring-1 ring-amber-400/40'
                  : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>القرآن والتفاسیر</span>
            </button>
          </div>

          {/* Darajaat Grade Filter Pills */}
          <div className="pt-2 border-t border-emerald-800/50 flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-amber-300 font-nastaliq shrink-0 ml-1">
              درجہ وار نصاب:
            </span>

            <button
              onClick={() => setActiveDarja('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-nastaliq shrink-0 transition-all cursor-pointer ${
                activeDarja === 'all'
                  ? 'bg-amber-400 text-stone-950 font-black shadow-xs'
                  : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60'
              }`}
            >
              تمام درجات
            </button>

            {darjaKeys.map((key) => {
              const meta = DARS_DARAJAAT_CONFIG[key];
              const isSelected = activeDarja === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveDarja(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-nastaliq shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950 text-amber-300 font-black border-2 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60'
                  }`}
                >
                  {meta.nameUrdu}
                </button>
              );
            })}
          </div>
        </div>

        {/* Books Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gradient-to-b from-[#021d15] to-[#01140e]">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 text-stone-300 font-nastaliq card-jewel-dark rounded-2xl p-6 border border-emerald-800/50">
              کوئی کتاب تلاش کے مطابق نہیں ملی۔
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => {
                const isCurrent = book.id === selectedBookId;
                return (
                  <div
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book);
                      onClose();
                    }}
                    className={`cursor-pointer rounded-2xl border transition-all text-right flex flex-col justify-between overflow-hidden shadow-md hover:scale-[1.02] ${
                      isCurrent
                        ? 'border-2 border-amber-400 bg-gradient-to-b from-[#064332] to-[#032a1f] ring-2 ring-amber-400/50'
                        : 'card-jewel-dark hover:border-amber-400'
                    }`}
                  >
                    <div>
                      <div className={`p-4 bg-gradient-to-r ${book.coverColor} text-white flex flex-col justify-between min-h-[85px]`}>
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs font-medium">
                            {book.subjectNameUrdu}
                          </span>
                          {book.darjaUrdu && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/30 text-amber-200 font-nastaliq font-bold border border-amber-400/40">
                              {book.darjaUrdu}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              زیرِ مطالعہ
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold font-arabic text-lg leading-tight mt-2 drop-shadow-xs text-amber-100">
                          {book.title}
                        </h3>
                      </div>

                      <div className="p-4 space-y-2">
                        <p className="text-xs text-amber-300 font-bold truncate">
                          {book.author}
                        </p>
                        <p className="text-xs text-emerald-100/90 line-clamp-2 leading-relaxed font-nastaliq">
                          {book.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between border-t border-emerald-900/60 mt-2">
                      <span className="text-[11px] text-stone-300 font-medium font-nastaliq">
                        {book.chapters.length} {book.category === 'sittah' ? 'احادیث' : 'ابواب'}
                      </span>
                      <span className="text-xs text-amber-300 font-bold flex items-center gap-1 font-nastaliq">
                        مطالعہ کھولیں <ChevronLeft className="w-3.5 h-3.5 text-amber-400" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#021a13] border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-200/90 font-nastaliq">
          <span>
            کل کتب: <strong className="text-amber-300">{booksDatabase.length} کتب</strong> — وفاق المدارس العربیہ و درسِ نظامی
          </span>
          <button
            onClick={onClose}
            className="btn-3d-gold px-5 py-1.5 rounded-xl text-stone-950 font-bold transition-all cursor-pointer"
          >
            بند کریں
          </button>
        </div>

      </div>
    </div>
  );
};
