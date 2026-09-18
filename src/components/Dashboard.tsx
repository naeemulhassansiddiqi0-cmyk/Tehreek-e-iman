import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, GraduationCap, ArrowLeft, Bookmark, Flame, Scroll, Scale, BookMarked, List, Award, FolderOpen, Search, Brain, X, ChevronLeft, ChevronRight, FileText, AlignJustify, RotateCcw, Clock, ShieldCheck } from 'lucide-react';
import { booksDatabase } from '../data/booksData';
import { Book, BookCategory, DarsDarja, AppTab } from '../types';
import { DARS_DARAJAAT_CONFIG } from '../data/darajaatConfig';
import { TehreekImanLogo } from './TehreekImanLogo';

interface DashboardProps {
  onSelectBook: (book: Book) => void;
  setActiveTab: (tab: AppTab) => void;
  onSendToAI: (arabicText: string, bookName: string) => void;
  onOpenKharjiBooks: (book?: Book) => void;
  onOpenAdmin?: () => void;
  userName: string;
  customLogoSrc: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectBook,
  setActiveTab,
  onSendToAI,
  onOpenKharjiBooks,
  onOpenAdmin,
  userName,
  customLogoSrc,
}) => {
  const [dashCategory, setDashCategory] = useState<BookCategory | 'all'>('all');
  const [selectedDarja, setSelectedDarja] = useState<DarsDarja>('ula');
  const [kharjiSubjectFilter, setKharjiSubjectFilter] = useState<string>('all');
  const [kharjiSearchQuery, setKharjiSearchQuery] = useState<string>('');
  const [kharjiVisibleCount, setKharjiVisibleCount] = useState<number>(24);

  // In-Place Book Quick Reader Modal State (Prevents scrolling down)
  const [modalBook, setModalBook] = useState<Book | null>(null);
  const [modalChapterIdx, setModalChapterIdx] = useState<number>(0);
  const [modalSegmentIdx, setModalSegmentIdx] = useState<number>(0);
  const [modalReadingMode, setModalReadingMode] = useState<'page' | 'scroll'>('page');

  const handleOpenBookModal = (book: Book) => {
    setModalBook(book);
    setModalChapterIdx(0);
    setModalSegmentIdx(0);
    setModalReadingMode('page');
  };

  const handleModalNextPage = () => {
    if (!modalBook) return;
    const ch = modalBook.chapters[modalChapterIdx];
    if (!ch) return;
    if (modalSegmentIdx < ch.segments.length - 1) {
      setModalSegmentIdx(prev => prev + 1);
    } else if (modalChapterIdx < modalBook.chapters.length - 1) {
      setModalChapterIdx(prev => prev + 1);
      setModalSegmentIdx(0);
    }
  };

  const handleModalPrevPage = () => {
    if (!modalBook) return;
    if (modalSegmentIdx > 0) {
      setModalSegmentIdx(prev => prev - 1);
    } else if (modalChapterIdx > 0) {
      const prevCh = modalBook.chapters[modalChapterIdx - 1];
      setModalChapterIdx(prev => prev - 1);
      setModalSegmentIdx(Math.max(0, (prevCh?.segments.length || 1) - 1));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalBook) {
        setModalBook(null);
      }
    };
    if (modalBook) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalBook]);

  const darjaKeys: DarsDarja[] = ['ula', 'sania', 'salisa', 'rabia', 'khamisa', 'sadisa', 'sabia', 'samina', 'takhasus'];
  const currentDarjaMeta = DARS_DARAJAAT_CONFIG[selectedDarja];
  const darjaBooks = booksDatabase.filter(b => b.darjaKey === selectedDarja);
  const allKharjiBooks = booksDatabase.filter(b => b.category === 'kharji_kitab');

  const filteredKharjiBooks = allKharjiBooks.filter(b => {
    let matchesSubject = true;
    if (kharjiSubjectFilter === 'quran_tafseer') {
      matchesSubject = b.subject === 'quran' || b.subject === 'tafseer';
    } else if (kharjiSubjectFilter === 'fiqh_usul') {
      matchesSubject = b.subject === 'fiqh' || b.subject === 'usul';
    } else if (kharjiSubjectFilter === 'nahw_balaghah') {
      matchesSubject = b.subject === 'nahw' || b.subject === 'balaghah';
    } else if (kharjiSubjectFilter !== 'all') {
      matchesSubject = b.subject === kharjiSubjectFilter;
    }

    const q = kharjiSearchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      b.title.toLowerCase().includes(q) || 
      b.author.toLowerCase().includes(q) || 
      b.subjectNameUrdu.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q);

    return matchesSubject && matchesSearch;
  });

  const displayedKharjiBooks = filteredKharjiBooks.slice(0, kharjiVisibleCount);

  const displayedBooks = dashCategory === 'all'
    ? booksDatabase
    : booksDatabase.filter(b => b.category === dashCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Hero Welcome Banner with Tehreek-e-Iman Branding (2026 3D Royal Islamic Architecture) */}
      <div className="hero-3d-royal rounded-3xl text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-x-24 -translate-y-24 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl translate-x-20 translate-y-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            
            {/* Tehreek-e-Iman & Patron Attribution Badges with 3D Depth */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md text-amber-200 text-xs font-bold border-2 border-amber-400/50 shadow-lg">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="font-amiri font-black text-amber-300 text-sm tracking-wide">تَحْرِيكِ إِيمَان</span>
                <span className="text-emerald-400 font-bold">•</span>
                <span className="font-nastaliq font-bold text-emerald-100 text-xs">شعبہ تعلیم و تحقیق</span>
              </div>

              {userName && (
                <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-950 via-black to-emerald-950 text-white border-2 border-amber-400 shadow-xl">
                  <span className="text-xs sm:text-sm text-amber-300 font-black font-nastaliq">زیرِ سرپرستیِ عالیہ:</span>
                  <span className="text-sm sm:text-lg font-black font-nastaliq text-amber-100 tracking-wide drop-shadow-sm">
                    {userName}
                  </span>
                </div>
              )}
            </div>

            {/* Arabic Welcome in Authentic Calligraphy (Amiri Black with Tashkeel) */}
            <h1 
              dir="rtl"
              className="text-3xl sm:text-5xl lg:text-6xl font-black font-amiri text-amber-200 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-[2.4] mb-2 tracking-wide"
            >
              أَهْلاً وَسَهْلاً بِطَالِبِ العِلْمِ النَّبِيلِ!
            </h1>

            {/* Urdu Subtitle in Grand Nastaliq with High Contrast */}
            <p className="text-emerald-50 text-base sm:text-xl lg:text-2xl font-black font-nastaliq leading-[2.8] text-justify drop-shadow-md">
              تحریکِ ایمان کے زیرِ اہتمام: علومِ اسلامیہ، درسِ نظامی کے مکمل نصاب، شروحاتِ متون، اور امتحانی تیاری کو اب جدید مصنوعی ذہانت (AI) کے ساتھ سیکنڈوں میں سمجھیں، حل کریں اور مستحضر فرمائیں۔
            </p>

            {/* 3D Tactile Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setActiveTab('reader')}
                className="btn-3d-gold flex items-center gap-2.5 px-6 py-3 rounded-2xl text-stone-950 font-black font-nastaliq text-base sm:text-lg shadow-xl cursor-pointer active:scale-95 transition-all"
              >
                <BookOpen className="w-5 h-5 text-stone-950 font-bold" />
                <span>کتب خانے میں داخل ہوں</span>
              </button>
              <button
                onClick={() => setActiveTab('ai-tutor')}
                className="btn-3d-emerald flex items-center gap-2.5 px-6 py-3 rounded-2xl text-amber-200 font-black font-nastaliq text-base sm:text-lg shadow-xl cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>اے آئی اتالیق سے حلِ عبارت پوچھیں</span>
              </button>
              <button
                onClick={() => setActiveTab('prayer-times')}
                className="btn-3d-sapphire flex items-center gap-2.5 px-6 py-3 rounded-2xl text-amber-200 font-black font-nastaliq text-base sm:text-lg shadow-xl cursor-pointer active:scale-95 transition-all"
                title="اوقاتِ صلوٰۃ و دائمی جنتری"
              >
                <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>اوقاتِ صلوٰۃ و دائمی جنتری</span>
              </button>
            </div>
          </div>

          {/* Grand 3D Logo Emblem Pedestal */}
          <div className="hidden md:flex flex-col items-center gap-3 p-6 rounded-3xl bg-black/50 backdrop-blur-md border-2 border-amber-400/60 shadow-[0_15px_35px_rgba(0,0,0,0.7)] shrink-0 group-hover:scale-105 transition-transform duration-300">
            <TehreekImanLogo size={88} customImgSrc={customLogoSrc} />
            <div className="text-center">
              <span className="text-amber-300 font-black font-amiri text-base block tracking-wide">تَحْرِيكِ إِيمَان</span>
              <span className="text-xs text-emerald-200 block font-nastaliq font-bold mt-0.5">شعبہ تعلیم و تحقیق</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Feature Pillars Grid - 2026 3D Luxury High-Contrast Depth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Card 1: Reader */}
        <div 
          onClick={() => setActiveTab('reader')}
          className="card-3d-interactive group cursor-pointer rounded-2xl p-5 sm:p-6 card-jewel-emerald flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <BookOpen className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="font-black font-nastaliq text-lg sm:text-xl mb-2 text-amber-200 transition-colors">
              اسمارٹ کتب خانہ و شروحات
            </h3>
            <p className="text-sm font-bold font-nastaliq text-emerald-100 leading-[2.4] mb-4 text-justify">
              متن اور شرح کا دو رخی مطالعہ، لغت کے فوری معانی، اعراب کنٹرول اور شخصی حواشی۔
            </p>
          </div>
          <span className="text-sm font-black font-nastaliq text-amber-300 flex items-center gap-1.5 pt-2 border-t border-emerald-700/60">
            مطالعہ شروع کریں <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-amber-400" />
          </span>
        </div>

        {/* Card 2: Kharji Books Library Dashboard */}
        <div 
          onClick={() => onOpenKharjiBooks()}
          className="card-3d-interactive group cursor-pointer rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#1c2c22] via-[#102018] to-[#091510] border-2 border-amber-400/50 shadow-lg flex flex-col justify-between hover:border-amber-300"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <FolderOpen className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-nastaliq font-black border border-amber-400/40">
                {booksDatabase.filter(b => b.category === 'kharji_kitab').length} کتب (پاپ اپ)
              </span>
            </div>
            <h3 className="font-black font-nastaliq text-lg sm:text-xl mb-2 text-amber-200 transition-colors">
              شعبۂ خارجی کتابیں (۱۰۰۰ کتب)
            </h3>
            <p className="text-sm font-bold font-nastaliq text-emerald-100 leading-[2.4] mb-4 text-justify">
              طلبہ کے فکری و اخلاقی ارتقاء، آدابِ علم، سیرت اور اصلاحِ باطن کے لیے {booksDatabase.filter(b => b.category === 'kharji_kitab').length} منتخب کتب۔ کلک کریں اور بغیر نیچے جائے فوری پاپ اپ میں مطالعہ فرمائیں۔
            </p>
          </div>
          <span className="text-sm font-black font-nastaliq text-amber-300 flex items-center gap-1.5 pt-2 border-t border-amber-700/50">
            ✨ ۱۰۰۰ کتب کا پاپ اپ کھولیں <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-amber-400" />
          </span>
        </div>

        {/* Card 3: Flashcards / Memorization Hub */}
        <div 
          onClick={() => setActiveTab('flashcards')}
          className="card-3d-interactive group cursor-pointer rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#1e1329] via-[#150d1e] to-[#0d0714] border-2 border-purple-400/50 shadow-lg flex flex-col justify-between hover:border-purple-300"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <Brain className="w-6 h-6 text-purple-300 animate-pulse" />
            </div>
            <h3 className="font-black font-nastaliq text-lg sm:text-xl mb-2 text-purple-200 transition-colors">
              حفظِ متون و فلیش کارڈز
            </h3>
            <p className="text-sm font-bold font-nastaliq text-purple-100/90 leading-[2.4] mb-4 text-justify">
              نحو، صرف، اصولِ فقہ، اور اصطلاحاتِ حدیث کی تعریفات کو 3D فلیش کارڈز سے پختہ یاد فرمائیں۔
            </p>
          </div>
          <span className="text-sm font-black font-nastaliq text-purple-300 flex items-center gap-1.5 pt-2 border-t border-purple-700/60">
            کارڈز یاد کریں <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-purple-300" />
          </span>
        </div>

        {/* Card 4: Dar-ul-Ifta & AI Scholar */}
        <div 
          onClick={() => setActiveTab('ai-tutor')}
          className="card-3d-interactive group cursor-pointer rounded-2xl p-5 sm:p-6 card-jewel-amber flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-400/30 text-amber-200 border border-amber-400/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <h3 className="font-black font-nastaliq text-lg sm:text-xl mb-2 text-amber-200 transition-colors">
              مرکزِ افتاء و رفیقِ مفتی (ڈیجیٹل دار الافتاء)
            </h3>
            <p className="text-sm font-bold font-nastaliq text-amber-100/90 leading-[2.4] mb-4 text-justify">
              قرآنِ حکیم، سنتِ نبوی اور فقہِ حنفی کی امہات الکتب سے صریح دلائل کے ساتھ ہر سوال کا مستند شرعی فتویٰ اور رہنمائی۔
            </p>
          </div>
          <span className="text-sm font-black font-nastaliq text-amber-300 flex items-center gap-1.5 pt-2 border-t border-amber-700/60">
            شرعی فتویٰ حاصل کریں <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-amber-400" />
          </span>
        </div>

        {/* Card 5: Exams */}
        <div 
          onClick={() => setActiveTab('exams')}
          className="card-3d-interactive group cursor-pointer rounded-2xl p-5 sm:p-6 card-jewel-sapphire flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-400/20 text-sky-200 border border-sky-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <GraduationCap className="w-6 h-6 text-sky-300" />
            </div>
            <h3 className="font-black font-nastaliq text-lg sm:text-xl mb-2 text-sky-200 transition-colors">
              امتحانی مرکز و موک ٹیسٹ
            </h3>
            <p className="text-sm font-bold font-nastaliq text-sky-100/90 leading-[2.4] mb-4 text-justify">
              9 درجات کے وفاق ماڈل پیپرز اور 3 گھنٹے کے لائیو امتحانی سمیلیٹر سے پرچہ حل کرنے کی مشق۔
            </p>
          </div>
          <span className="text-sm font-black font-nastaliq text-sky-300 flex items-center gap-1.5 pt-2 border-t border-sky-700/60">
            امتحان میں داخل ہوں <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-sky-300" />
          </span>
        </div>

        {/* Card 6: Notes */}
        <div 
          onClick={() => setActiveTab('notes')}
          className="card-3d-interactive group cursor-pointer rounded-2xl p-5 sm:p-6 card-jewel-ruby flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-400/20 text-rose-200 border border-rose-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <Bookmark className="w-6 h-6 text-rose-300" />
            </div>
            <h3 className="font-black font-nastaliq text-lg sm:text-xl mb-2 text-rose-200 transition-colors">
              شخصی حواشی و یادداشتیں
            </h3>
            <p className="text-sm font-bold font-nastaliq text-rose-100/90 leading-[2.4] mb-4 text-justify">
              مطالعہ کے دوران کتب پر اپنے ذاتی نوٹس لکھیں جو آف لائن ڈیوائس میں خودکار محفوظ رہتے ہیں۔
            </p>
          </div>
          <span className="text-sm font-black font-nastaliq text-rose-300 flex items-center gap-1.5 pt-2 border-t border-rose-700/60">
            نوٹس کھولیں <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-rose-300" />
          </span>
        </div>

        {/* Card 7: Prayer Times (اوقاتِ صلوٰۃ و دائمی جنتری) */}
        <div 
          onClick={() => setActiveTab('prayer-times')}
          className="card-3d-interactive group cursor-pointer rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0b241c] via-[#071913] to-[#040f0c] border-2 border-emerald-400/60 shadow-lg flex flex-col justify-between hover:border-amber-300 col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-amber-500/20 text-amber-300 border-2 border-amber-400/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shrink-0">
                <Clock className="w-7 h-7 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-black font-nastaliq text-xl sm:text-2xl text-amber-200 transition-colors">
                    اوقاتِ صلوٰۃ، سحر و افطار و دائمی جنتری
                  </h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-nastaliq font-black border border-emerald-400/40">
                    ۱۴ شرعی اوقات • آڈیو اذان • کسٹم ٹائم • لائیو سیکنڈ کلاک
                  </span>
                </div>
                <p className="text-sm font-bold font-nastaliq text-emerald-100/90 leading-[2.2]">
                  پاکستان کے 15+ بڑے شہروں کے مستند اوقات، حنفی عصر، اشراق، چاشت، زوال، اوابین، تہجد کا سائنسی حساب، نماز کا طریقہ مع عربی ادعیہ و آڈیو تلاوت۔
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-300 font-black font-nastaliq text-base border border-amber-400/60 shadow-md group-hover:border-amber-300 group-hover:scale-105 transition-all">
                مکمل اوقاتِ صلوٰۃ کھولیں <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-amber-400" />
              </span>
            </div>
          </div>
        </div>

        {/* Card 8: Central Admin Portal & Cloudflare D1 */}
        {onOpenAdmin && (
          <div 
            onClick={onOpenAdmin}
            className="card-3d-interactive group cursor-pointer rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#241a08] via-[#171105] to-[#0d0a03] border-2 border-amber-500/70 shadow-lg flex flex-col justify-between hover:border-amber-300 col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600/30 to-amber-900/40 text-amber-300 border-2 border-amber-400/60 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shrink-0">
                  <ShieldCheck className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-black font-nastaliq text-xl sm:text-2xl text-amber-200 transition-colors">
                      مرکزی ایڈمن پورٹل و کلاؤڈ فلیر ڈی ون (Cloudflare D1)
                    </h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-nastaliq font-black border border-emerald-400/40">
                      1,000 کتب D1 ڈیٹا بیس
                    </span>
                  </div>
                  <p className="text-sm font-bold font-nastaliq text-amber-100/80 leading-[2.3]">
                    تمام کتب کا نظم، صفحات بڑھانا، JSON / CSV سے بلک امپورٹ، اور 1-کلک بیک اپ برائے منتظمین۔
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black font-nastaliq text-base shadow-md group-hover:scale-105 transition-all">
                ایڈمن پورٹل کھولیں <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              </span>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* Interactive Grade-wise Dars-e-Nizami Curriculum Section (نصابِ درسِ نظامی درجہ وار) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl board-jewel-emerald p-5 sm:p-8 shadow-2xl space-y-6 text-amber-50 border-2 border-amber-400/40">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-emerald-800/60 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-950 text-amber-300 flex items-center justify-center shadow-lg border-2 border-amber-400/50 shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black font-nastaliq text-amber-300">
                  نصابِ درسِ نظامی درجہ وار (سالِ اول تا سالِ ہشتم و تخصص)
                </h2>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950 text-amber-300 text-xs font-black border border-amber-400/60 shadow-xs">
                  <Award className="w-3.5 h-3.5" /> وفاق المدارس نصاب
                </span>
              </div>
              <p className="text-sm sm:text-base text-emerald-100 font-nastaliq font-bold mt-1">
                وفاق المدارس کے مطابق تمام ۸ درجات کی متفقہ درسی کتب مع متن، اعراب، سلیس ترجمہ، نحوی تراکیب اور امتحانی سوالات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-sm font-black px-4 py-2 rounded-2xl bg-amber-400/20 text-amber-200 border-2 border-amber-400/50 font-nastaliq shadow-xs">
              کل کتبِ نصاب: {booksDatabase.filter(b => b.darjaKey).length} کتب
            </span>
          </div>
        </div>

        {/* Darajaat Horizontal Tab Selector */}
        <div className="space-y-2.5">
          <span className="text-sm font-black text-amber-200 font-nastaliq block">
            مطلوبہ تعلیمی سال / درجہ منتخب فرمائیں:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
            {darjaKeys.map((key) => {
              const meta = DARS_DARAJAAT_CONFIG[key];
              const isSelected = selectedDarja === key;
              const count = booksDatabase.filter(b => b.darjaKey === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDarja(key)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-xl ring-2 ring-amber-400/40 -translate-y-1'
                      : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <span className={`text-[11px] font-nastaliq font-black px-2 py-0.5 rounded-full mb-1 ${
                    isSelected ? 'bg-stone-950 text-amber-300' : 'bg-emerald-950/90 text-amber-300 border border-emerald-700/60'
                  }`}>
                    {meta.number === 9 ? 'تخصص' : `سال ${meta.number}`}
                  </span>
                  <span className="text-sm font-black font-nastaliq leading-tight mb-0.5">
                    {meta.nameUrdu}
                  </span>
                  <span className={`text-xs font-nastaliq font-bold ${isSelected ? 'text-stone-950' : 'text-emerald-200/80'}`}>
                    ({count} کتب)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Darja Info Banner */}
        <div className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-r ${currentDarjaMeta.badgeColor} text-white border-2 border-amber-400/40 shadow-xl space-y-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-base sm:text-lg font-black font-nastaliq text-amber-200">
                {currentDarjaMeta.nameUrdu} — {currentDarjaMeta.academicStage}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/25 font-nastaliq font-bold">
                {currentDarjaMeta.duration}
              </span>
            </div>
            <span className="text-sm font-amiri font-black text-emerald-200">
              {currentDarjaMeta.nameArabic}
            </span>
          </div>

          <p className="text-sm sm:text-base text-emerald-50 leading-[2.5] font-nastaliq font-bold text-justify">
            {currentDarjaMeta.summary}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq ml-1">بنیادی مضامین:</span>
            {currentDarjaMeta.subjectsSummary.map((sub, i) => (
              <span key={i} className="text-xs px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-100 font-nastaliq font-bold shadow-xs">
                ✓ {sub}
              </span>
            ))}
          </div>
        </div>

        {/* Darja Books Grid - 2026 3D Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {darjaBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleOpenBookModal(book)}
              className="card-jewel-dark hover:border-amber-400 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group overflow-hidden shadow-md hover:scale-[1.01]"
            >
              <div>
                <div className={`h-24 bg-gradient-to-r ${book.coverColor} p-4 flex flex-col justify-between text-white relative`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold font-nastaliq">
                      {book.subjectNameUrdu}
                    </span>
                    <span className="text-xs text-amber-200 font-nastaliq font-black">
                      {book.darjaUrdu || book.grade}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-amiri tracking-wide drop-shadow-md group-hover:text-amber-200 transition-colors">
                    {book.title}
                  </h3>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-amber-300 font-black font-nastaliq truncate max-w-[65%]">
                      {book.author}
                    </p>
                    <span className="text-xs px-2.5 py-1 rounded-full card-jewel-dark text-amber-200 font-black font-nastaliq border border-emerald-700/60 flex items-center gap-1 shadow-xs">
                      <List className="w-3.5 h-3.5 text-amber-400" />
                      {book.chapters.length} {book.category === 'sittah' ? 'احادیث' : 'ابواب'}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-100/90 font-bold font-nastaliq line-clamp-2 leading-[2.3] text-justify">
                    {book.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBookModal(book);
                  }}
                  className="btn-3d-emerald flex-1 py-2.5 px-4 rounded-xl text-amber-200 text-sm font-black font-nastaliq flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>کتاب کا فوری مطالعہ (پاپ اپ)</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const sampleSegment = book.chapters[0]?.segments[0];
                    if (sampleSegment) {
                      onSendToAI(sampleSegment.arabicText, book.title);
                      setActiveTab('ai-tutor');
                    }
                  }}
                  title="اے آئی کے ذریعے حل کریں"
                  className="btn-3d-gold p-2.5 rounded-xl text-stone-950 transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-stone-950" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* Dedicated Grand Kharji Books Dashboard Section (شعبۂ کتبِ مطالعہ و عالمی خارجی لائبریری) */}
      {/* ========================================================================= */}
      <div id="kharji-books-dashboard" className="rounded-3xl board-jewel-emerald p-5 sm:p-8 shadow-2xl space-y-6 text-amber-50 border-2 border-amber-400/50">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-emerald-800/60 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-amber-200 flex items-center justify-center shadow-lg border-2 border-amber-400/60 shrink-0">
              <FolderOpen className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black font-nastaliq text-amber-300">
                  ڈیش بورڈ: شعبۂ خارجی کتب و عالمی مطالعۂ اسلامیہ
                </h2>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/25 text-amber-200 text-xs font-black border border-amber-400/60 shadow-xs">
                  ⭐ غیر نصابی و تربیتی ذخیرہ
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950 text-emerald-200 text-xs font-black border border-emerald-500/50 shadow-xs">
                  🌐 بین الاقوامی کتب خانہ
                </span>
              </div>
              <p className="text-sm sm:text-base text-emerald-100 font-nastaliq font-bold mt-1">
                طالب علموں کے فکری ارتقاء، آدابِ علم، اخلاق، سیرتِ طیبہ ﷺ اور باطنی پاکیزگی کے لیے دنیا بھر کی منتخب دینی و فکری کتابیں
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-sm font-black px-4 py-2 rounded-2xl bg-amber-400/20 text-amber-200 border-2 border-amber-400/50 font-nastaliq shadow-xs">
              کل کتبِ مطالعہ: {allKharjiBooks.length} اہم کتب
            </span>
          </div>
        </div>

        {/* Vision & Expansion Notice Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#13241b] to-emerald-950/80 border border-amber-400/40 text-amber-100 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <p className="text-xs sm:text-sm font-nastaliq font-bold text-emerald-100 leading-[2.2] text-justify">
              <strong className="text-amber-300 font-black">وسعتِ کتب خانہ کا عزم:</strong> یہ ڈیش بورڈ طلبہ کی ہمہ جہت علمی پیاس بجھانے کے لیے قائم کیا گیا ہے۔ اس میں اکابرینِ امت (زرنوجی، نووی، ترمذی، ابو غدہ، غزالی، ندوی رحمہم اللہ) کے شہ پاروں سے آغاز کیا گیا ہے اور دنیا بھر سے مزید کتب کا مسلسل اضافہ کیا جا رہا ہے۔
            </p>
          </div>
          <button
            onClick={() => onOpenKharjiBooks()}
            className="btn-3d-gold px-4 py-2.5 rounded-xl text-stone-950 font-nastaliq font-black text-xs sm:text-sm shadow-md shrink-0 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
          >
            <span>✨ تمام ۱۰۰۰ خارجی کتب کا پاپ اپ ایکسپلورر</span>
            <BookOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Subject Filter Bar inside Kharji Dashboard */}
        <div className="space-y-4">
          
          {/* Instant Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/80 pointer-events-none" />
              <input
                type="text"
                value={kharjiSearchQuery}
                onChange={(e) => {
                  setKharjiSearchQuery(e.target.value);
                  setKharjiVisibleCount(24);
                }}
                placeholder="1000 منتخب خارجی کتب میں تلاش فرمائیں (عنوان، مصنف، موضوع، تعارف)..."
                className="w-full pl-12 pr-12 py-3 rounded-2xl bg-black/40 text-amber-100 placeholder-emerald-200/60 border-2 border-emerald-700/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 text-sm font-nastaliq shadow-inner transition-all"
              />
              {kharjiSearchQuery && (
                <button
                  onClick={() => setKharjiSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:text-amber-200 font-nastaliq px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-amber-400/30 cursor-pointer"
                >
                  صاف کریں
                </button>
              )}
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/90 border border-amber-400/40 text-amber-300 font-nastaliq font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-sm">
              <span>دستیاب نتائج:</span>
              <strong className="text-amber-200 font-black text-base">{filteredKharjiBooks.length}</strong>
              <span>کتب</span>
            </div>
          </div>

          {/* Subject Filter Chips */}
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-black text-amber-200 font-nastaliq block">
              موضوع کے اعتبار سے منتخب فرمائیں:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: `تمام کتب (${allKharjiBooks.length})` },
                { id: 'adab', label: 'آدابِ علم و مطالعہ' },
                { id: 'quran_tafseer', label: 'علوم القرآن و التفسیر' },
                { id: 'hadith', label: 'حدیث و علوم الحدیث' },
                { id: 'fiqh_usul', label: 'فقہ، اصول و قواعد' },
                { id: 'seerah', label: 'سیرت النبی ﷺ' },
                { id: 'tarikh', label: 'تاریخِ اسلام و سوانح' },
                { id: 'tazkiyah', label: 'تزکیۂ نفس و اخلاق' },
                { id: 'aqaid', label: 'عقائد و کلام' },
                { id: 'nahw_balaghah', label: 'نحو، لغت و بلاغت' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setKharjiSubjectFilter(tab.id);
                    setKharjiVisibleCount(24);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-nastaliq transition-all cursor-pointer border ${
                    kharjiSubjectFilter === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-md font-black ring-2 ring-amber-400/40'
                      : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Kharji Books Grid - 2026 3D Cards */}
        {displayedKharjiBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedKharjiBooks.map((book) => (
              <div 
                key={book.id}
                onClick={() => onOpenKharjiBooks(book)}
                className="card-jewel-dark hover:border-amber-400 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group overflow-hidden shadow-md hover:scale-[1.01]"
              >
                <div>
                  <div className={`h-24 bg-gradient-to-r ${book.coverColor} p-5 flex flex-col justify-between text-white relative`}>
                    <div className="flex justify-between items-start">
                      <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold font-nastaliq">
                        {book.subjectNameUrdu.split('،')[0]}
                      </span>
                      <span className="text-xs text-amber-200 font-nastaliq font-black">
                        {book.grade}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black font-amiri tracking-wide drop-shadow-md group-hover:text-amber-200 transition-colors truncate">
                      {book.title}
                    </h3>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-amber-300 font-black font-nastaliq truncate max-w-[65%]">
                        {book.author}
                      </p>
                      <span className="text-xs px-2.5 py-1 rounded-full card-jewel-dark text-amber-200 font-black font-nastaliq border border-emerald-700/60 flex items-center gap-1 shadow-xs">
                        <List className="w-3.5 h-3.5 text-amber-400" />
                        {book.chapters.length} ابواب
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold font-nastaliq text-emerald-100/90 leading-[2.3] line-clamp-3 text-justify">
                      {book.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-emerald-800/40 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenKharjiBooks(book);
                    }}
                    className="flex-1 btn-3d-emerald py-2 px-3 rounded-xl text-xs sm:text-sm font-black font-nastaliq text-amber-200 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>کتاب کا فوری مطالعہ (پاپ اپ)</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const sampleSegment = book.chapters[0]?.segments[0];
                      if (sampleSegment) {
                        onSendToAI(sampleSegment.arabicText, book.title);
                        setActiveTab('ai-tutor');
                      }
                    }}
                    title="اے آئی کے ذریعے حل کریں"
                    className="btn-3d-gold p-2.5 rounded-xl text-stone-950 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-stone-950" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl card-jewel-dark border border-emerald-800/60 space-y-3">
            <BookOpen className="w-12 h-12 text-amber-400/60 mx-auto" />
            <h4 className="text-lg font-black font-nastaliq text-amber-200">کوئی کتاب نہیں ملی</h4>
            <p className="text-sm font-bold font-nastaliq text-emerald-100/80">
              برائے مہربانی تلاش کا لفظ بدلیں یا دوسرا موضوع منتخب فرمائیں۔
            </p>
            <button
              onClick={() => {
                setKharjiSearchQuery('');
                setKharjiSubjectFilter('all');
              }}
              className="btn-3d-gold px-4 py-2 rounded-xl text-stone-950 font-black font-nastaliq text-xs shadow-md mt-2 cursor-pointer"
            >
              تمام کتب دوبارہ دیکھیں
            </button>
          </div>
        )}

        {/* Pagination / Load More Controls */}
        {filteredKharjiBooks.length > kharjiVisibleCount && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-emerald-800/60">
            <button
              onClick={() => setKharjiVisibleCount(prev => prev + 24)}
              className="btn-3d-gold px-6 py-2.5 rounded-xl font-nastaliq font-black text-sm text-stone-950 shadow-lg cursor-pointer active:scale-95 transition-all"
            >
              مزید 24 کتب لوڈ کریں (باقی {filteredKharjiBooks.length - kharjiVisibleCount} کتب)
            </button>
            <button
              onClick={() => setKharjiVisibleCount(filteredKharjiBooks.length)}
              className="btn-3d-emerald px-5 py-2.5 rounded-xl font-nastaliq font-bold text-sm text-amber-200 border border-amber-400/40 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              تمام {filteredKharjiBooks.length} کتب یکجا دیکھیں
            </button>
          </div>
        )}

      </div>

      {/* Comprehensive Islamic Library Section - 2026 3D Royal Architecture */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-stone-200 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-md">
              <Flame className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-nastaliq text-stone-950 dark:text-stone-50">
              جامع کتب خانہ و امہات الکتب ({booksDatabase.length} بنیادی کتب)
            </h2>
          </div>
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100 font-nastaliq">
            مع اردو و کثیر لسانی ترجمہ، جامع تشریح اور جدولِ اعراب
          </span>
        </div>

        {/* Dedicated Folder Showcase: خارجی کتابیں (Student Supplementary Library) */}
        <div 
          onClick={() => onOpenKharjiBooks()}
          className="cursor-pointer group relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-950 via-[#182a20] to-emerald-950 text-amber-100 border-2 border-amber-400/60 shadow-xl hover:border-amber-300 hover:shadow-2xl transition-all"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/30 transition-all shadow-md shrink-0">
                <FolderOpen className="w-7 h-7 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black font-nastaliq">
                    📁 مخصوص فولڈر و فوری پاپ اپ
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-nastaliq text-amber-200 group-hover:text-amber-300 transition-colors">
                    فولڈر: خارجی کتب برائے مطالعۂ طلبہ (۱۰۰۰ کتب)
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-nastaliq text-emerald-100/90 leading-[2.3] mt-1 text-justify">
                  طلبۂ علومِ اسلامیہ کے فکری ارتقاء، آدابِ علم، اخلاق، سیرتِ طیبہ ﷺ، اور باطنی پاکیزگی کے لیے {booksDatabase.filter(b => b.category === 'kharji_kitab').length} منتخب دینی خارجی کتب۔ کلک کرنے پر بغیر نیچے اسکرول کیے فوراً پاپ اپ پورٹل کھل جائے گا۔
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <span className="btn-3d-gold px-5 py-2.5 rounded-2xl text-stone-950 font-black font-nastaliq text-sm shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform">
                <span>✨ ۱۰۰۰ کتب پاپ اپ میں کھولیں</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>

        {/* Category Filters Toolbar - 3D Tactile Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => {
              setDashCategory('all');
              document.getElementById('library-books-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-nastaliq transition-all cursor-pointer border-2 ${
              dashCategory === 'all'
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>تمام کتب ({booksDatabase.length})</span>
          </button>

          <button
            onClick={() => onOpenKharjiBooks()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-nastaliq transition-all cursor-pointer border-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-md ring-2 ring-amber-400/40 font-black hover:scale-105 active:scale-95"
            title="۱۰۰۰ خارجی کتب کا خصوصی پاپ اپ بغیر نیچے اسکرول کیے کھولیں"
          >
            <FolderOpen className="w-4 h-4 text-stone-950" />
            <span>📁 خارجی کتبِ مطالعہ ({booksDatabase.filter(b => b.category === 'kharji_kitab').length} کتب - فوری پاپ اپ)</span>
          </button>

          <button
            onClick={() => {
              setDashCategory('sittah');
              document.getElementById('library-books-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-nastaliq transition-all cursor-pointer border-2 ${
              dashCategory === 'sittah'
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
            }`}
          >
            <Scroll className="w-4 h-4 text-amber-400" />
            <span>صحاحِ ستہ و امہات الحدیث (8 کتب)</span>
          </button>

          <button
            onClick={() => {
              setDashCategory('fatawa');
              document.getElementById('library-books-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-nastaliq transition-all cursor-pointer border-2 ${
              dashCategory === 'fatawa'
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>کتبِ فتاویٰ و فقہ (عالمگیری، شامی، قاضی خان)</span>
          </button>

          <button
            onClick={() => {
              setDashCategory('dars_curriculum');
              document.getElementById('library-books-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-nastaliq transition-all cursor-pointer border-2 ${
              dashCategory === 'dars_curriculum'
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
            }`}
          >
            <BookMarked className="w-4 h-4 text-amber-400" />
            <span>درسِ نظامی نصاب (ہدایہ، کنز، کافیہ، قدوری)</span>
          </button>

          <button
            onClick={() => {
              setDashCategory('quran_tafseer');
              document.getElementById('library-books-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-nastaliq transition-all cursor-pointer border-2 ${
              dashCategory === 'quran_tafseer'
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>القرآن والتفاسیر</span>
          </button>
        </div>

        {/* Books Cards Grid - 2026 3D Depth */}
        <div id="library-books-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBooks.map((book) => (
            <div 
              key={book.id}
              onClick={() => {
                if (book.category === 'kharji_kitab') {
                  onOpenKharjiBooks(book);
                } else {
                  handleOpenBookModal(book);
                }
              }}
              className="card-jewel-dark hover:border-amber-400 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group overflow-hidden shadow-md hover:scale-[1.01]"
            >
              <div>
                <div className={`h-24 bg-gradient-to-r ${book.coverColor} p-5 flex flex-col justify-between text-white relative`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold font-nastaliq">
                      {book.subjectNameUrdu}
                    </span>
                    <span className="text-xs text-amber-200 font-nastaliq font-black">
                      {book.grade}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-amiri tracking-wide drop-shadow-md group-hover:text-amber-200 transition-colors">
                    {book.title}
                  </h3>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-amber-300 font-black font-nastaliq truncate max-w-[60%]">
                      {book.author}
                    </p>
                    <span className="text-xs px-2.5 py-1 rounded-full card-jewel-dark text-amber-200 font-black font-nastaliq border border-emerald-700/60 flex items-center gap-1 shadow-xs">
                      <List className="w-3.5 h-3.5 text-amber-400" />
                      {book.chapters.length} {book.category === 'sittah' ? 'احادیث' : 'ابواب'}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-100/90 font-bold font-nastaliq line-clamp-2 leading-[2.3] text-justify">
                    {book.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (book.category === 'kharji_kitab') {
                      onOpenKharjiBooks(book);
                    } else {
                      handleOpenBookModal(book);
                    }
                  }}
                  className="btn-3d-emerald flex-1 py-2.5 px-4 rounded-xl text-amber-200 text-sm font-black font-nastaliq flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>کتاب کا فوری مطالعہ (پاپ اپ)</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const sampleSegment = book.chapters[0]?.segments[0];
                    if (sampleSegment) {
                      onSendToAI(sampleSegment.arabicText, book.title);
                      setActiveTab('ai-tutor');
                    }
                  }}
                  title="اے آئی کے ذریعے حل کریں"
                  className="btn-3d-gold p-2.5 rounded-xl text-stone-950 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-stone-950" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Wisdom / Hadith Highlight - 3D Gold Accent Frame */}
      <div className="card-jewel-amber rounded-3xl p-6 sm:p-7 border-2 border-amber-400 shadow-xl space-y-3">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shrink-0 font-bold text-lg shadow-md">
            ﷺ
          </div>
          <div className="space-y-2.5">
            <h4 className="font-black text-base sm:text-lg text-amber-300 font-nastaliq flex items-center gap-2">
              <span>حدیثِ مبارکہ اور درسی نکتہ:</span>
            </h4>
            <p className="font-amiri font-black text-2xl sm:text-3xl text-amber-200 leading-[2.5]" dir="rtl">
              "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ"
            </p>
            <p className="text-sm sm:text-base text-amber-100 font-nastaliq font-bold leading-[2.6] text-justify">
              (صحیح البخاری: 71) — ترجمہ: اللہ تعالیٰ جس شخص کے ساتھ خیر اور بھلائی کا ارادہ فرماتے ہیں، اسے دین کی گہری سمجھ بوجھ (فقہ) عطا فرما دیتے ہیں۔
            </p>
          </div>
        </div>
      </div>

      {/* Interactive In-Place Book Quick Reader Modal Popup (No scrolling down needed) */}
      {modalBook && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setModalBook(null)}
        >
          <div 
            className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl card-jewel-dark border-2 border-amber-400/90 shadow-2xl overflow-hidden animate-scaleUp text-amber-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 bg-gradient-to-r ${modalBook.coverColor} text-white relative border-b border-amber-400/40 shrink-0`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold font-nastaliq">
                      {modalBook.subjectNameUrdu}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-200 font-nastaliq font-black border border-amber-300/40">
                      {modalBook.darjaUrdu || modalBook.grade}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/30 text-amber-200 font-nastaliq font-bold">
                      {modalBook.chapters.length} {modalBook.category === 'sittah' ? 'احادیث' : 'ابواب'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-amiri tracking-wide drop-shadow-md text-amber-200 pt-1">
                    {modalBook.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-300 font-black font-nastaliq">
                    {modalBook.author}
                  </p>
                </div>

                <button
                  onClick={() => setModalBook(null)}
                  className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/70 text-amber-200 hover:text-white border border-amber-400/50 transition-all cursor-pointer shadow-md shrink-0"
                  title="بند کریں (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
              {/* Book Description Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 shadow-inner space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-nastaliq font-black text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>کتاب کا علمی تعارف و اہمیت:</span>
                </div>
                <p className="text-xs sm:text-sm font-nastaliq font-medium text-emerald-100/95 leading-[2.4] text-justify">
                  {modalBook.description}
                </p>
              </div>

              {/* Chapter Tabs if multiple */}
              {modalBook.chapters.length > 1 && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-amber-300 font-nastaliq block">
                    فہرستِ ابواب منتخب فرمائیں:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {modalBook.chapters.map((ch, idx) => (
                      <button
                        key={ch.id || idx}
                        onClick={() => setModalChapterIdx(idx)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-nastaliq shrink-0 transition-all cursor-pointer border ${
                          modalChapterIdx === idx
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black border-amber-300 shadow-md ring-2 ring-amber-400/40'
                            : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/70 hover:border-amber-400'
                        }`}
                      >
                        {ch.titleUrdu || ch.titleArabic || `باب ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

                            {/* In-Popup Quick Reader View with Continuous Guided Page Navigation */}
              {(() => {
                const currentChapter = modalBook.chapters[modalChapterIdx] || modalBook.chapters[0];
                if (!currentChapter) return null;
                const currentSegment = currentChapter.segments[modalSegmentIdx] || currentChapter.segments[0];

                let totalBookPages = 0;
                let currentGlobalPage = 0;
                for (let i = 0; i < modalBook.chapters.length; i++) {
                  const sCount = modalBook.chapters[i].segments.length || 1;
                  if (i < modalChapterIdx) {
                    currentGlobalPage += sCount;
                  } else if (i === modalChapterIdx) {
                    currentGlobalPage += (modalSegmentIdx + 1);
                  }
                  totalBookPages += sCount;
                }
                const progressPct = totalBookPages > 0 ? Math.min(100, Math.round((currentGlobalPage / totalBookPages) * 100)) : 0;
                const isFirstPage = modalChapterIdx === 0 && modalSegmentIdx === 0;
                const isLastPageOfBook = currentGlobalPage >= totalBookPages;
                const hasNextSeg = modalSegmentIdx < currentChapter.segments.length - 1;
                const hasNextCh = modalChapterIdx < modalBook.chapters.length - 1;

                return (
                  <div className="space-y-4">
                    {/* Mode Toggle & Progress Bar */}
                    <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-700/60 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-nastaliq">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-300 font-black">
                            کتابی صفحہ {currentGlobalPage} از {totalBookPages}
                          </span>
                          <span className="text-emerald-300/70">•</span>
                          <span className="text-emerald-200">
                            {currentChapter.titleUrdu || currentChapter.titleArabic} (صفحہ {modalSegmentIdx + 1} / {currentChapter.segments.length})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="inline-flex rounded-xl p-0.5 bg-black/60 border border-emerald-700/60 text-xs font-nastaliq">
                            <button
                              onClick={() => setModalReadingMode('page')}
                              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                modalReadingMode === 'page'
                                  ? 'bg-amber-400 text-stone-950 font-black'
                                  : 'text-stone-300 hover:text-amber-200'
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              <span>صفحہ بہ صفحہ</span>
                            </button>
                            <button
                              onClick={() => setModalReadingMode('scroll')}
                              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                modalReadingMode === 'scroll'
                                  ? 'bg-amber-400 text-stone-950 font-black'
                                  : 'text-stone-300 hover:text-amber-200'
                              }`}
                            >
                              <AlignJustify className="w-3 h-3" />
                              <span>مکمل باب</span>
                            </button>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                            {progressPct}% مکمل
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-emerald-800/80">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-300 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Reading Mode 1: Page-by-Page */}
                    {modalReadingMode === 'page' && currentSegment ? (
                      <div className="space-y-4">
                        <div className="p-5 sm:p-6 rounded-3xl bg-black/50 border border-emerald-700/80 space-y-4 shadow-inner">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60 text-xs font-nastaliq">
                            <span className="text-amber-300 font-bold">
                              {currentChapter.titleUrdu || currentChapter.titleArabic}
                            </span>
                            <span className="text-emerald-300 font-mono">
                              صفحہ {modalSegmentIdx + 1} از {currentChapter.segments.length}
                            </span>
                          </div>

                          {/* Arabic Text */}
                          <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/20 shadow-inner">
                            <div className="font-amiri text-xl sm:text-2xl text-amber-100 leading-[2.5] text-right font-semibold">
                              {currentSegment.arabicText}
                            </div>
                          </div>

                          {/* Urdu Translation */}
                          {currentSegment.urduTranslation && (
                            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 font-nastaliq text-xs sm:text-sm text-emerald-100 leading-[2.5] text-justify font-medium">
                              <strong className="text-amber-300 font-bold ml-1">ترجمہ:</strong>
                              {currentSegment.urduTranslation}
                            </div>
                          )}

                          {/* Tashreeh */}
                          {currentSegment.tashreeh && (
                            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 font-nastaliq text-xs text-amber-200/90 leading-[2.2] text-justify">
                              <strong className="text-amber-300 font-bold ml-1">تشریح و فوائد:</strong>
                              {currentSegment.tashreeh}
                            </div>
                          )}

                          {/* English */}
                          {currentSegment.translations?.en && (
                            <div className="font-sans text-xs text-stone-300/90 leading-relaxed dir-ltr text-left border-t border-stone-800 pt-2">
                              <span className="font-bold text-amber-400/90 mr-1">English:</span>
                              {currentSegment.translations.en}
                            </div>
                          )}
                        </div>

                        {/* Continuous Next Page Guidance Card */}
                        {hasNextSeg ? (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#12281c] to-stone-950 border-2 border-amber-400/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-3 text-right">
                              <span className="text-xl">👉</span>
                              <div>
                                <div className="text-xs text-amber-300 font-nastaliq font-bold">اگلے صفحے کی رہنمائی:</div>
                                <div className="text-xs sm:text-sm font-nastaliq font-bold text-white">
                                  صفحہ {modalSegmentIdx + 2} از {currentChapter.segments.length} پر جائیں
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={handleModalNextPage}
                              className="btn-3d-gold px-5 py-2 rounded-xl text-stone-950 font-black font-nastaliq text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                            >
                              <span>اگلے صفحے پر جائیں</span>
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          </div>
                        ) : hasNextCh ? (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-stone-900 to-emerald-950 border-2 border-amber-400 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-3 text-right">
                              <BookOpen className="w-5 h-5 text-amber-300" />
                              <div>
                                <div className="text-xs text-amber-300 font-nastaliq font-bold">باب {modalChapterIdx + 1} مکمل ہوا۔ اگلا باب:</div>
                                <div className="text-xs sm:text-sm font-nastaliq font-bold text-white">
                                  {modalBook.chapters[modalChapterIdx + 1]?.titleUrdu || modalBook.chapters[modalChapterIdx + 1]?.titleArabic}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={handleModalNextPage}
                              className="btn-3d-emerald px-5 py-2 rounded-xl text-amber-200 font-black font-nastaliq text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                            >
                              <span>اگلا باب شروع کریں</span>
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#102018] to-amber-950 border-2 border-amber-400 shadow-xl text-center space-y-2">
                            <h4 className="text-base font-black font-nastaliq text-amber-200">
                              🎉 الحمد لله! ختمِ کتاب کی مبارکباد
                            </h4>
                            <p className="text-xs font-nastaliq text-emerald-100">
                              آپ نے اس کتاب کے تمام ابواب اور صفحات کا مطالعہ مکمل فرما لیا ہے۔
                            </p>
                            <button
                              onClick={() => {
                                setModalChapterIdx(0);
                                setModalSegmentIdx(0);
                              }}
                              className="btn-3d-emerald px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-black text-amber-200 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>صفحہ اول سے اعادہ کریں</span>
                            </button>
                          </div>
                        )}

                        {/* Bottom Quick Toolbar */}
                        <div className="p-2.5 bg-black/60 rounded-xl border border-emerald-800/80 flex items-center justify-between text-xs font-nastaliq text-amber-200">
                          <button
                            onClick={handleModalPrevPage}
                            disabled={isFirstPage}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${
                              isFirstPage ? 'opacity-40 cursor-not-allowed border-stone-800 text-stone-500' : 'card-jewel-dark text-amber-200 hover:text-white border-emerald-700/60 cursor-pointer'
                            }`}
                          >
                            <ChevronRight className="w-4 h-4" />
                            <span>پچھلا صفحہ</span>
                          </button>

                          <span className="text-emerald-300 font-mono text-[11px]">
                            صفحہ {modalSegmentIdx + 1} / {currentChapter.segments.length}
                          </span>

                          <button
                            onClick={handleModalNextPage}
                            disabled={isLastPageOfBook}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${
                              isLastPageOfBook ? 'opacity-40 cursor-not-allowed border-stone-800 text-stone-500' : 'btn-3d-emerald text-amber-200 cursor-pointer'
                            }`}
                          >
                            <span>اگلا صفحہ</span>
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Reading Mode 2: Scroll */
                      <div className="space-y-4">
                        {currentChapter.segments.map((seg, sIdx) => (
                          <div 
                            key={seg.id || sIdx}
                            className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-emerald-700/60 space-y-3 shadow-inner"
                          >
                            <div className="font-amiri text-lg sm:text-xl text-amber-100 leading-[2.4] text-right font-semibold">
                              {seg.arabicText}
                            </div>

                            {seg.urduTranslation && (
                              <div className="pt-3 border-t border-emerald-800/60 font-nastaliq text-xs sm:text-sm text-emerald-100 leading-[2.4] text-justify font-medium">
                                <strong className="text-amber-300 font-bold ml-1">ترجمہ:</strong>
                                {seg.urduTranslation}
                              </div>
                            )}

                            {seg.tashreeh && (
                              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 font-nastaliq text-xs text-amber-200/90 leading-[2.2] text-justify">
                                <strong className="text-amber-300 font-bold ml-1">تشریح و فائدہ:</strong>
                                {seg.tashreeh}
                              </div>
                            )}

                            {seg.translations?.en && (
                              <div className="font-sans text-xs text-stone-300/90 leading-relaxed dir-ltr text-left border-t border-stone-800 pt-2">
                                <span className="font-bold text-amber-400/90 mr-1">English:</span>
                                {seg.translations.en}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 sm:p-5 bg-black/60 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const b = modalBook;
                    setModalBook(null);
                    onSelectBook(b);
                    setActiveTab('reader');
                  }}
                  className="btn-3d-emerald py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-black font-nastaliq text-amber-200 flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>مکمل فل اسکرین ریڈر میں کھولیں</span>
                </button>

                <button
                  onClick={() => {
                    const currentChapter = modalBook.chapters[modalChapterIdx] || modalBook.chapters[0];
                    const sample = currentChapter?.segments[0]?.arabicText || modalBook.title;
                    const title = modalBook.title;
                    setModalBook(null);
                    onSendToAI(sample, title);
                    setActiveTab('ai-tutor');
                  }}
                  className="btn-3d-gold py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black font-nastaliq text-stone-950 flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>اے آئی سے حل کریں</span>
                </button>
              </div>

              <button
                onClick={() => setModalBook(null)}
                className="px-4 py-2 rounded-xl card-jewel-dark text-stone-300 hover:text-white border border-emerald-700/60 hover:border-amber-400 text-xs font-nastaliq font-bold transition-all cursor-pointer"
              >
                بند کریں (Close)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
