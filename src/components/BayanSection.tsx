import React, { useState, useMemo } from 'react';
import YouTube from 'react-youtube';
import { 
  Video, 
  Play, 
  Clock, 
  User, 
  Search, 
  Tv
} from 'lucide-react';
import { CommentSection } from './CommentSection';

export interface BayanItem {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  category: string;
  date: string;
  description: string;
  videoId: string;
}

export const BAYANAT_DATABASE: BayanItem[] = [
  {
    id: 'bayan-01',
    title: 'عظمتِ مصطفیٰ ﷺ اور عقیدۂ ختمِ نبوت',
    speaker: 'حضرت مولانا محمد نعیم الحسن صدیقی',
    duration: '42:15',
    category: 'سیرت و عقائد',
    date: '15 ربیع الاول 1447ھ',
    description: 'ختمِ نبوت کے قطعی قرآنی دلائل، شانِ رسالت مآب ﷺ اور امت کی بنیادی ذمہ داریاں۔',
    videoId: '0pWyYq5W6gE'
  },
  {
    id: 'bayan-02',
    title: 'درسِ قرآن: سورۃ البقرۃ کی جامعیت اور احکام',
    speaker: 'حضرت مولانا محمد نعیم الحسن صدیقی',
    duration: '38:40',
    category: 'تفسیرِ قرآن',
    date: '10 رمضان المبارک 1447ھ',
    description: 'سورۃ البقرۃ کے معارف، تقویٰ کی حقیقت اور امتِ مسلمہ کے لیے ہدایاتِ ربانی۔',
    videoId: 'M7lc1UVf-VE'
  },
  {
    id: 'bayan-03',
    title: 'تزکیۂ نفس، اصلاحِ باطن اور حلاوتِ ذکر',
    speaker: 'حضرت مولانا محمد نعیم الحسن صدیقی',
    duration: '48:10',
    category: 'تصوف و اخلاق',
    date: '22 رجب 1447ھ',
    description: 'قلب کی صفائی، باطنی امراض کا علاج اور اللہ رب العزت کی یاد میں قلبی سکون۔',
    videoId: 'kJQP7kiw5Fk'
  },
  {
    id: 'bayan-04',
    title: 'فقہِ حنفی کے زریں اصول اور اسلاف کی فقاہت',
    speaker: 'حضرت مولانا محمد نعیم الحسن صدیقی',
    duration: '35:20',
    category: 'فقہ و اصول',
    date: '05 شوال 1447ھ',
    description: 'امام اعظم ابو حنیفہؒ کا منہجِ استنباط، قیاسِ شرعی اور جدید معاشی مسائل کا حل۔',
    videoId: 'RgKAFK5djSk'
  },
  {
    id: 'bayan-05',
    title: 'وفاق المدارس کے طلبہ کے لیے درسی نصائح',
    speaker: 'حضرت مولانا محمد نعیم الحسن صدیقی',
    duration: '29:50',
    category: 'تعلیم و تربیت',
    date: '18 شعبان المعظم 1447ھ',
    description: 'کتبِ درسیہ کا تحقیقی مطالعہ، فہمِ عبارت، اور امتحانات میں اعلیٰ کارکردگی کے اصول۔',
    videoId: 'fJ9rUzIMcZQ'
  },
  {
    id: 'bayan-06',
    title: 'صحابہ کرامؓ کی استقامت اور سیرتِ صدیقِ اکبرؓ',
    speaker: 'حضرت مولانا محمد نعیم الحسن صدیقی',
    duration: '51:05',
    category: 'سیرت و تاریخ',
    date: '12 محرم الحرام 1447ھ',
    description: 'حضرت ابو بکر صدیقؓ کے دورِ خلافت کے تابناک کارنامے اور فتنوں کے خلاف آہنی عزم۔',
    videoId: 'L_LUpnjgPso'
  }
];

interface BayanSectionProps {
  className?: string;
}

export const BayanSection: React.FC<BayanSectionProps> = ({ className = '' }) => {
  const [selectedBayanId, setSelectedBayanId] = useState<string>('bayan-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('تمام');

  // Currently playing Bayan
  const bayan = useMemo(() => {
    return BAYANAT_DATABASE.find(b => b.id === selectedBayanId) || BAYANAT_DATABASE[0];
  }, [selectedBayanId]);

  // Categories list
  const categories = useMemo(() => {
    const list = ['تمام'];
    BAYANAT_DATABASE.forEach(b => {
      if (!list.includes(b.category)) list.push(b.category);
    });
    return list;
  }, []);

  // Filtered bayanat
  const filteredBayanat = useMemo(() => {
    return BAYANAT_DATABASE.filter(item => {
      const matchCat = selectedCategory === 'تمام' || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        item.speaker.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section dir="rtl" className={`space-y-8 text-right ${className}`}>
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-stone-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Tv className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-nastaliq">خطابات و مواعظِ حسنہ — ویڈیو و آڈیو سلسلہ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-nastaliq text-emerald-900 dark:text-emerald-100">
            بیانات و خطاباتِ عالیہ
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-nastaliq mt-1">
            حضرت مولانا محمد نعیم الحسن صدیقی مدظلہ العالی کے علمی و فکری خطابات مع یوٹیوب ویڈیو و تبصرہ جات
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بیان یا موضوع تلاش کریں..."
            className="w-full pr-9 pl-3 py-2 bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-nastaliq text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Main Grid: Video Player + Comments on Left/Center (7 cols) & Playlist on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left/Center Column: VIDEO PLAYER + YOUTUBE COMMENT SECTION */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* VIDEO / PLAYER CARD */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-stone-800 shadow-md">
            {/* 1. YouTube Video Embed */}
            <div className="aspect-video w-full bg-black relative">
              <YouTube
                videoId={bayan.videoId}
                className="w-full h-full"
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                    rel: 0,
                    modestbranding: 1
                  }
                }}
              />
            </div>

            {/* 2. Bayan Info & Meta */}
            <div className="p-4 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-nastaliq font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {bayan.category}
                </span>

                <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 font-sans">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{bayan.duration}</span>
                  </span>
                  <span>•</span>
                  <span className="font-nastaliq">{bayan.date}</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black font-nastaliq text-emerald-950 dark:text-emerald-100 leading-snug">
                {bayan.title}
              </h3>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-nastaliq text-stone-600 dark:text-stone-300">
                <User className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  مقرر: {bayan.speaker}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-nastaliq leading-relaxed pt-1 border-t border-gray-100 dark:border-stone-800/80">
                {bayan.description}
              </p>
            </div>
          </div>

          {/* 3. YOUTUBE STYLE COMMENT SYSTEM PER BAYAN (Directly after video/player) */}
          <CommentSection 
            contentId={bayan.id} 
            contentTitle={bayan.title} 
          />

        </div>

        {/* Right Column: PLAYLIST / OTHER BAYANAT (5 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-stone-800 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-stone-800 pb-3">
              <h4 className="font-nastaliq font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-700" />
                <span>فہرستِ خطابات ({filteredBayanat.length})</span>
              </h4>
              <span className="text-[11px] font-nastaliq text-stone-400">
                منتخب فرمائیں
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-nastaliq font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Bayanat List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {filteredBayanat.map((item, idx) => {
                const isSelected = item.id === selectedBayanId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBayanId(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-white dark:bg-stone-800/40 border-gray-100 dark:border-stone-800 hover:border-emerald-500/40 hover:bg-stone-50'
                    }`}
                  >
                    {/* Index or Play icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}>
                      {isSelected ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h5 className={`font-nastaliq text-xs sm:text-sm font-bold leading-snug truncate ${
                        isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-stone-800 dark:text-stone-100'
                      }`}>
                        {item.title}
                      </h5>

                      <p className="text-[11px] text-stone-500 dark:text-stone-400 font-nastaliq truncate">
                        {item.speaker}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5 font-sans">
                        <span>{item.duration}</span>
                        <span className="font-nastaliq bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-600 dark:text-stone-300">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredBayanat.length === 0 && (
                <div className="text-center py-6 text-stone-400 font-nastaliq text-xs bg-stone-50 dark:bg-stone-800/30 rounded-xl border border-dashed border-gray-200">
                  کوئی بیان دستیاب نہیں ملا۔ تلاش کا لفظ تبدیل فرمائیں۔
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
