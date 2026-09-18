import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Sparkles, GraduationCap, Bookmark, Key, Moon, Sun, Scroll, User, Camera, Search, ArrowLeft, Brain, Smartphone, FolderOpen, Clock, ShieldCheck } from 'lucide-react';
import { TehreekImanLogo } from './TehreekImanLogo';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  theme: 'parchment' | 'dark' | 'light';
  setTheme: (theme: 'parchment' | 'dark' | 'light') => void;
  userName: string;
  setUserName: (name: string) => void;
  customLogoSrc: string;
  setCustomLogoSrc: (src: string) => void;
  onOpenSearch: () => void;
  onOpenKharjiBooks?: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  apiKey,
  setApiKey,
  theme,
  setTheme,
  userName,
  setUserName,
  customLogoSrc,
  setCustomLogoSrc,
  onOpenSearch,
  onOpenKharjiBooks,
  onOpenAdmin,
}) => {
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempName, setTempName] = useState(userName);

  // PWA Install prompt state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('ایپ انسٹال کرنے کے لیے: اپنے موبائل یا براؤزر کے اوپر تین نقطوں (Options / 3 Dots) پر کلک کریں اور "Install app" یا "Add to Home screen" منتخب فرمائیں۔');
    }
  };

  const saveApiKey = () => {
    setApiKey(tempKey);
    localStorage.setItem('madrasa_gemini_api_key', tempKey);
    setIsKeyModalOpen(false);
  };

  const saveProfile = () => {
    setUserName(tempName);
    localStorage.setItem('madrasa_user_name', tempName);
    setIsProfileModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setCustomLogoSrc(result);
          localStorage.setItem('madrasa_custom_logo', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors border-b-2 shadow-sm ${
      theme === 'dark' 
        ? 'bg-[#0e1715] border-stone-800 text-stone-100 border-t-2 border-t-emerald-600' 
        : theme === 'parchment' 
        ? 'bg-[#faf6ee] border-[#dfd2be] text-stone-900 border-t-2 border-t-amber-500' 
        : 'bg-white border-stone-200 text-stone-900 border-t-2 border-t-emerald-600'
    }`}>
      {/* Full-width container utilizing the entire header line */}
      <div className="w-full px-3 sm:px-5 lg:px-7">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Right Section (RTL Start): Grand Logo & Brand & Patron Badge */}
          <div className="flex items-center gap-3 shrink-0 select-none">
            {/* Clickable Logo and Brand Identity */}
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
              title="صفحۂ اول (ڈیش بورڈ) پر جائیں"
            >
              {/* Grand Logo Size */}
              <TehreekImanLogo size={62} customImgSrc={customLogoSrc} />

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-amiri font-black text-xl sm:text-2xl text-emerald-950 dark:text-amber-300 tracking-wide leading-none">
                    تَحْرِيكِ إِيمَان
                  </span>
                  <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-900 text-amber-300 font-amiri font-black border border-amber-400/60 shadow-xs leading-none">
                    مَنَصَّةُ المَدَارِس
                  </span>
                </div>
                <div className="text-[13px] sm:text-[14px] text-emerald-900 dark:text-emerald-300 font-nastaliq font-black mt-0.5 leading-normal">
                  <span>درسِ نظامی اسمارٹ پلیٹ فارم</span>
                </div>
              </div>
            </div>

            {/* Hazrat Maulana Mohammad Naeem ul Hassan Siddiqi Prominent Title Badge */}
            {userName && (
              <div className="hidden 2xl:flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white border-2 border-amber-400 shadow-md transition-transform hover:scale-102 shrink-0">
                <span className="text-xs text-amber-300 font-black font-nastaliq">سرپرستِ اعلیٰ:</span>
                <span className="text-sm sm:text-base font-black font-nastaliq text-amber-100 tracking-wide">
                  {userName}
                </span>
              </div>
            )}

            {/* Universal Back Button visible on all screens when not on Dashboard */}
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-nastaliq font-bold shadow-sm border border-amber-400/70 transition-all shrink-0 cursor-pointer"
                title="صفحۂ اول (ڈیش بورڈ) پر واپس جائیں"
              >
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-amber-200" />
                <span>‹ ڈیش بورڈ</span>
              </button>
            )}
          </div>

          {/* Middle Section: Clear, High-Contrast Professional Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {/* 1. صفحۂ اول */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] font-nastaliq font-extrabold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-200 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white dark:bg-stone-800/90 text-stone-950 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700 hover:bg-emerald-900 hover:text-white hover:border-emerald-700 shadow-xs'
              }`}
            >
              <Home className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-amber-300' : 'text-emerald-700 dark:text-emerald-400'}`} />
              <span className="leading-tight">صفحۂ اول</span>
            </button>

            {/* 2. کتب خانہ و شروحات */}
            <button
              onClick={() => setActiveTab('reader')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] font-nastaliq font-extrabold transition-all cursor-pointer ${
                activeTab === 'reader'
                  ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-200 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white dark:bg-stone-800/90 text-stone-950 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700 hover:bg-emerald-900 hover:text-white hover:border-emerald-700 shadow-xs'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'reader' ? 'text-amber-300' : 'text-amber-600 dark:text-amber-400'}`} />
              <span className="leading-tight">کتب خانہ و شروحات</span>
            </button>

            {/* 3. معاونِ طالبِ علم (اے آئی) */}
            <button
              onClick={() => setActiveTab('ai-tutor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] font-nastaliq font-extrabold transition-all cursor-pointer ${
                activeTab === 'ai-tutor'
                  ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-200 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white dark:bg-stone-800/90 text-stone-950 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700 hover:bg-emerald-900 hover:text-white hover:border-emerald-700 shadow-xs'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeTab === 'ai-tutor' ? 'text-amber-300 animate-pulse' : 'text-teal-600 dark:text-teal-400'}`} />
              <span className="leading-tight">دار الافتاء (مدلل AI)</span>
            </button>

            {/* 4. امتحانی مرکز (وفاق) */}
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] font-nastaliq font-extrabold transition-all cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-200 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white dark:bg-stone-800/90 text-stone-950 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700 hover:bg-emerald-900 hover:text-white hover:border-emerald-700 shadow-xs'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeTab === 'exams' ? 'text-amber-300' : 'text-blue-600 dark:text-blue-400'}`} />
              <span className="leading-tight">امتحانی مرکز (وفاق)</span>
            </button>

            {/* 5. یادداشتیں و نوٹس */}
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] font-nastaliq font-extrabold transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-200 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white dark:bg-stone-800/90 text-stone-950 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700 hover:bg-emerald-900 hover:text-white hover:border-emerald-700 shadow-xs'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${activeTab === 'notes' ? 'text-amber-300' : 'text-rose-600 dark:text-rose-400'}`} />
              <span className="leading-tight">یادداشتیں و نوٹس</span>
            </button>

            {/* 6. حفظِ متون (فلیش کارڈز) */}
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] font-nastaliq font-extrabold transition-all cursor-pointer ${
                activeTab === 'flashcards'
                  ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-200 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white dark:bg-stone-800/90 text-stone-950 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700 hover:bg-emerald-900 hover:text-white hover:border-emerald-700 shadow-xs'
              }`}
            >
              <Brain className={`w-4 h-4 ${activeTab === 'flashcards' ? 'text-amber-300' : 'text-purple-600 dark:text-purple-400'}`} />
              <span className="leading-tight">حفظِ متون (فلیش کارڈز)</span>
            </button>

            {/* 7. اوقاتِ صلوٰۃ */}
            <button
              onClick={() => setActiveTab('prayer-times')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] font-nastaliq font-extrabold transition-all cursor-pointer ${
                activeTab === 'prayer-times'
                  ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-200 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white dark:bg-stone-800/90 text-stone-950 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700 hover:bg-emerald-900 hover:text-white hover:border-emerald-700 shadow-xs'
              }`}
              title="اوقاتِ صلوٰۃ و دائمی جنتری"
            >
              <Clock className={`w-4 h-4 ${activeTab === 'prayer-times' ? 'text-amber-300 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span className="leading-tight">اوقاتِ صلوٰۃ</span>
            </button>

            {/* 8. خارجی کتب (1000 کتب) پاپ اپ بٹن */}
            {onOpenKharjiBooks && (
              <button
                onClick={onOpenKharjiBooks}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] font-nastaliq font-extrabold transition-all cursor-pointer bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 hover:bg-amber-500/40 text-amber-300 dark:text-amber-200 border-2 border-amber-400 shadow-md hover:scale-[1.02] active:scale-95 ring-1 ring-amber-400/40"
                title="۱۰۰۰ خارجی کتب کا خصوصی پاپ اپ پورٹل کھولیں"
              >
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <span className="leading-tight">خارجی کتب (۱۰۰۰)</span>
              </button>
            )}
          </nav>

          {/* Left Section (RTL End): Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* PWA App Install Button */}
            {!isAppInstalled && (
              <button
                onClick={handleInstallClick}
                title="تحریکِ ایمان ایپ کو موبائل یا کمپیوٹر پر انسٹال کریں (آف لائن دستیاب)"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 text-amber-300 hover:text-amber-100 border-2 border-amber-400/60 text-[13px] font-nastaliq font-black shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
              >
                <Smartphone className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">ایپ انسٹال کریں</span>
              </button>
            )}

            {/* Quick Kharji Books Button (Mobile & Tablet) */}
            {onOpenKharjiBooks && (
              <button
                onClick={onOpenKharjiBooks}
                title="۱۰۰۰ خارجی کتب کا پاپ اپ پورٹل"
                className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:text-white border border-amber-400/60 text-xs font-nastaliq font-bold shadow-xs cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>خارجی کتب</span>
              </button>
            )}

            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              title="تمام کتب و ابواب میں تلاش کریں (Ctrl+K)"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-amber-500/60 bg-amber-500/15 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 text-[14px] font-nastaliq font-bold hover:bg-amber-500 hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">تلاش کتب</span>
              <kbd className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 font-mono border border-amber-400/40 mr-1">
                Ctrl+K
              </kbd>
            </button>

            {/* User Profile / Settings Button */}
            <button
              onClick={() => {
                setTempName(userName);
                setIsProfileModalOpen(true);
              }}
              title="نام و لوگو کی ترتیبات"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-[14px] font-nastaliq font-bold hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-stone-700 transition-all shadow-xs cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden xl:inline">ترتیبات</span>
            </button>

            {/* Theme Switcher */}
            <div className="flex items-center bg-stone-200/80 dark:bg-stone-800 rounded-xl p-1 border-2 border-stone-300 dark:border-stone-700">
              <button
                onClick={() => setTheme('parchment')}
                title="قرطاس (کلاسک پیپر تھیم)"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  theme === 'parchment' ? 'bg-amber-100 text-amber-950 font-bold shadow-sm border border-amber-300' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Scroll className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('light')}
                title="روشن سفید تھیم"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  theme === 'light' ? 'bg-white text-stone-950 font-bold shadow-sm border border-stone-300' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="رات / ڈارک تھیم"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-stone-700 text-emerald-300 font-bold shadow-sm border border-stone-600' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* API Key Modal Button */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              title="اے آئی سیٹنگز و API Key"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 text-[13px] font-nastaliq font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer"
            >
              <Key className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden xl:inline">
                {apiKey ? 'API فعال' : 'API کلید'}
              </span>
            </button>

            {/* Admin Portal Button */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                title="مرکزی ایڈمن پورٹل و کتب خانہ کنٹرول (Protected with PIN)"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-amber-500/70 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-100 text-[13px] font-nastaliq font-bold shadow-xs transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">ایڈمن پینل</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar at bottom */}
      <div className="lg:hidden border-t-2 border-stone-300 dark:border-stone-800 flex justify-around py-2.5 bg-inherit px-2 shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[13px] font-nastaliq ${
            activeTab === 'dashboard' ? 'text-emerald-800 dark:text-emerald-300 font-extrabold scale-105' : 'text-stone-700 dark:text-stone-300 font-bold'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>صفحۂ اول</span>
        </button>
        <button
          onClick={() => setActiveTab('reader')}
          className={`flex flex-col items-center gap-0.5 text-[13px] font-nastaliq ${
            activeTab === 'reader' ? 'text-emerald-800 dark:text-emerald-300 font-extrabold scale-105' : 'text-stone-700 dark:text-stone-300 font-bold'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>کتب خانہ</span>
        </button>
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-0.5 text-[13px] font-nastaliq text-amber-700 dark:text-amber-400 font-extrabold"
        >
          <Search className="w-4 h-4" />
          <span>تلاش</span>
        </button>
        <button
          onClick={() => setActiveTab('ai-tutor')}
          className={`flex flex-col items-center gap-0.5 text-[13px] font-nastaliq ${
            activeTab === 'ai-tutor' ? 'text-emerald-800 dark:text-emerald-300 font-extrabold scale-105' : 'text-stone-700 dark:text-stone-300 font-bold'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>دار الافتاء</span>
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex flex-col items-center gap-0.5 text-[13px] font-nastaliq ${
            activeTab === 'exams' ? 'text-emerald-800 dark:text-emerald-300 font-extrabold scale-105' : 'text-stone-700 dark:text-stone-300 font-bold'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>امتحانی مرکز</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center gap-0.5 text-[13px] font-nastaliq ${
            activeTab === 'notes' ? 'text-emerald-800 dark:text-emerald-300 font-extrabold scale-105' : 'text-stone-700 dark:text-stone-300 font-bold'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>یادداشتیں</span>
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex flex-col items-center gap-0.5 text-[13px] font-nastaliq ${
            activeTab === 'flashcards' ? 'text-amber-600 dark:text-amber-300 font-extrabold scale-105' : 'text-stone-700 dark:text-stone-300 font-bold'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>فلیش کارڈز</span>
        </button>
        <button
          onClick={() => setActiveTab('prayer-times')}
          className={`flex flex-col items-center gap-0.5 text-[13px] font-nastaliq ${
            activeTab === 'prayer-times' ? 'text-emerald-800 dark:text-emerald-300 font-extrabold scale-105' : 'text-stone-700 dark:text-stone-300 font-bold'
          }`}
          title="اوقاتِ صلوٰۃ"
        >
          <Clock className="w-4 h-4" />
          <span>اوقاتِ صلوٰۃ</span>
        </button>
        {onOpenKharjiBooks && (
          <button
            onClick={onOpenKharjiBooks}
            className="flex flex-col items-center gap-0.5 text-[13px] font-nastaliq text-amber-600 dark:text-amber-400 font-extrabold"
            title="خارجی کتب (۱۰۰۰)"
          >
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span>خارجی کتب</span>
          </button>
        )}
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="flex flex-col items-center gap-0.5 text-[13px] font-nastaliq text-amber-600 dark:text-amber-400 font-extrabold"
            title="ایڈمن پورٹل"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>ایڈمن</span>
          </button>
        )}
      </div>

      {/* Profile & Logo Customization Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01140e]/80 backdrop-blur-md animate-fadeIn">
          <div className="modal-contrast-card rounded-3xl max-w-md w-full p-6 shadow-2xl text-amber-50 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <h3 className="text-lg font-black font-nastaliq flex items-center gap-2 text-amber-300">
                <User className="w-5 h-5 text-amber-400" />
                تحریکِ ایمان و منتظم سیٹنگز
              </h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-amber-300 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Logo Preview & Custom Upload */}
            <div className="flex items-center gap-4 card-jewel-dark p-4 rounded-2xl border border-emerald-700/60 shadow-inner">
              <TehreekImanLogo size={56} customImgSrc={customLogoSrc} />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-300 font-nastaliq">
                  لوگو: تحریکِ ایمان
                </h4>
                <p className="text-[11px] text-emerald-200/90 font-nastaliq">
                  لوگو تبدیل کرنے کے لیے نئی تصویر منتخب کریں:
                </p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-amber-400/50 text-xs font-bold text-amber-200 cursor-pointer shadow-xs transition-all">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>امیج لوگو منتخب کریں</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold font-nastaliq text-amber-200 mb-1.5">
                آپ کا اسمِ گرامی (بانی / منتظم / سرپرست کا نام):
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="مولانا محمد نعیم الحسن صدیقی"
                className="w-full px-3.5 py-2.5 rounded-xl input-jewel text-sm font-nastaliq focus:outline-none placeholder:text-emerald-300/60"
              />
            </div>

            {/* PWA Offline Installation Info */}
            <div className="card-jewel-dark p-3 rounded-2xl border border-amber-400/30 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold font-nastaliq text-amber-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>آف لائن موبائل ایپ سپورٹ (PWA)</span>
                </div>
                <p className="text-[11px] text-emerald-200/80 font-nastaliq">
                  {isAppInstalled ? 'ایپ کامیابی سے آپ کے سسٹم پر انسٹال شدہ ہے' : 'بغیر انٹرنیٹ کے بھی کتب و متون کا مطالعہ کریں'}
                </p>
              </div>
              {!isAppInstalled && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="btn-3d-emerald px-3 py-1.5 rounded-xl text-xs font-bold text-amber-200 font-nastaliq shadow-sm shrink-0"
                >
                  انسٹال کریں
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-nastaliq font-bold text-emerald-300 hover:text-white"
              >
                منسوخ
              </button>
              <button
                onClick={saveProfile}
                className="btn-3d-gold px-5 py-2 rounded-xl text-xs font-bold text-stone-950 font-nastaliq shadow-md"
              >
                محفوظ کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01140e]/80 backdrop-blur-md">
          <div className="modal-contrast-card rounded-3xl max-w-md w-full p-6 shadow-2xl text-amber-50 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <h3 className="text-lg font-black font-nastaliq flex items-center gap-2 text-amber-300">
                <Key className="w-5 h-5 text-amber-400" />
                Gemini API Key سیٹنگ
              </h3>
              <button 
                onClick={() => setIsKeyModalOpen(false)}
                className="text-amber-300 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-emerald-100/90 font-nastaliq leading-relaxed">
              اگر آپ کے پاس گوگل Gemini API کی کلید ہے تو یہاں درج فرمائیں۔ اگر درج نہ کریں تب بھی ایپ کا خودکار آف لائن سمارٹ انجن متونِ درسِ نظامی کے تفصیلی تجزیے فراہم کرے گا۔
            </p>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-amber-200 font-nastaliq">
                گوگل AI اسٹوڈیو API Key:
              </label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl input-jewel text-sm font-mono focus:outline-none placeholder:text-emerald-300/60"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-nastaliq font-bold text-emerald-300 hover:text-white"
              >
                منسوخ
              </button>
              <button
                onClick={saveApiKey}
                className="btn-3d-gold px-5 py-2 rounded-xl text-xs font-bold text-stone-950 font-nastaliq shadow-md"
              >
                محفوظ کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
