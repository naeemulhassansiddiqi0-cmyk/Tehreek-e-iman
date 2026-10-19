import React, { useState } from 'react';
import { BookOpen, Clock, GraduationCap, Scale, Heart, Headphones, Mic2, Menu, X, ChevronDown } from 'lucide-react';
import { TehreekImanLogo } from './TehreekImanLogo';
import { AppTab } from '../types';
import { GlobalSearchInput } from './Search/GlobalSearchInput';
import { GlobalSearchResult, SearchCategoryFilter } from '../services/globalSearchService';
import { usePortalLanguage } from '../context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  customLogoSrc?: string;
  apiKey?: string;
  setApiKey?: (key: string) => void;
  theme?: 'parchment' | 'dark' | 'light';
  setTheme?: (theme: 'parchment' | 'dark' | 'light') => void;
  userName?: string;
  setUserName?: (name: string) => void;
  setCustomLogoSrc?: (src: string) => void;
  onOpenSearch?: (query?: string, category?: SearchCategoryFilter) => void;
  onOpenKharjiBooks?: () => void;
  onOpenAdmin?: () => void;
  onOpenQuranAudio?: () => void;
  onOpenNaatPlayer?: () => void;
  onSelectSearchResult?: (result: GlobalSearchResult) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSearchChange,
  searchQuery = '',
  customLogoSrc = '/tehreek-iman-logo.jpg',
  onOpenSearch,
  onOpenQuranAudio,
  onOpenNaatPlayer,
  onSelectSearchResult
}) => {
  const { language, setLanguage, t, isRTL } = usePortalLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleSelectResult = (result: GlobalSearchResult) => {
    if (onSelectSearchResult) {
      onSelectSearchResult(result);
    } else if (typeof window !== 'undefined') {
      if (result.sourceType === 'external' && result.externalLink) {
        window.open(result.externalLink, '_blank', 'noopener,noreferrer');
      } else {
        const targetUrl = `/books/${result.bookSlug}${result.pageNumber ? `?page=${result.pageNumber}` : ''}`;
        window.history.pushState({}, '', targetUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.dispatchEvent(new CustomEvent('tehreek:navigate', { detail: { url: targetUrl } }));
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200/90 dark:border-slate-800 shadow-xs" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        
        {/* Main Desktop & Tablet Row */}
        <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2 sm:gap-4">
          
          {/* 1. Right: Brand Logo & Title */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none shrink-0 py-0.5"
            title="تحریکِ ایمان — بانی و سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ"
          >
            <div className="shrink-0 flex items-center justify-center">
              <div className="hidden sm:block">
                <TehreekImanLogo size={68} customImgSrc={customLogoSrc} />
              </div>
              <div className="sm:hidden">
                <TehreekImanLogo size={46} customImgSrc={customLogoSrc} />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className={`text-xl sm:text-2xl lg:text-3xl text-emerald-900 dark:text-emerald-400 tracking-tight leading-tight ${
                language === 'en' ? 'font-sans font-black' : language === 'ar' ? 'font-arabic font-bold' : 'font-nastaliq font-black'
              }`}>
                {t('brand_title', 'تحریکِ ایمان')}
              </span>
              <span className={`text-[10px] sm:text-xs text-amber-900 dark:text-amber-400 leading-tight mt-0.5 flex flex-wrap items-center gap-1 ${
                language === 'en' ? 'font-sans' : language === 'ar' ? 'font-arabic' : 'font-nastaliq'
              }`}>
                <span className="text-emerald-800 dark:text-emerald-400 font-bold">{t('brand_patron_label', 'بانی و سرپرست:')}</span>
                <span className="text-stone-800 dark:text-stone-300 hidden xs:inline">{t('brand_patron_short', 'حضرت مولانا محمد نعیم الحسن صدیقی')}</span>
                <span className="text-stone-800 dark:text-stone-300 xs:hidden">مولانا نعیم الحسن صدیقی</span>
              </span>
            </div>
          </div>

          {/* 2. Center: Prominent, Spacious Global Search Input (Desktop & Tablet) */}
          <div className="hidden lg:flex flex-1 max-w-xl xl:max-w-2xl min-w-[260px] mx-2 xl:mx-6">
            <GlobalSearchInput
              initialQuery={searchQuery}
              onQueryChange={onSearchChange}
              onSelectResult={handleSelectResult}
              onOpenFullModal={(q, cat) => {
                if (onOpenSearch) onOpenSearch(q, cat);
              }}
              placeholder={t('search_placeholder', '147 کتب، احادیث، تفاسیر، فقہ و حواشی میں تلاش فرمائیں...')}
            />
          </div>

          {/* 3. Left: Audio Pills, Language Switcher & Consolidated Nav Items */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Global Multi-Language Switcher (Urdu / Arabic / English) */}
            <div className="hidden sm:flex items-center bg-stone-100 rounded-full p-0.5 border border-stone-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setLanguage('ur')}
                className={`px-2 py-0.5 rounded-full text-xs font-nastaliq font-bold transition cursor-pointer ${
                  language === 'ur'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-700 hover:text-emerald-900'
                }`}
                title="اردو (Urdu)"
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-2 py-0.5 rounded-full text-xs font-arabic font-bold transition cursor-pointer ${
                  language === 'ar'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-700 hover:text-emerald-900'
                }`}
                title="العربية (Arabic)"
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full text-xs font-sans font-semibold transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-700 hover:text-emerald-900'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Audio Quick Triggers */}
            {(onOpenQuranAudio || onOpenNaatPlayer) && (
              <div className="flex items-center gap-1 shrink-0">
                {onOpenQuranAudio && (
                  <button
                    type="button"
                    onClick={onOpenQuranAudio}
                    className="px-2 sm:px-2.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-950 text-amber-300 border border-amber-400/80 hover:border-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer font-nastaliq font-bold shadow-xs flex items-center gap-1 text-[11px] sm:text-xs"
                    title="القرآن الکریم - 114 سورتیں مع تلاوتِ قراء"
                  >
                    <Headphones className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline">{t('audio_quran', 'تلاوتِ قرآن')}</span>
                    <span className="sm:hidden">قرآن</span>
                  </button>
                )}
                {onOpenNaatPlayer && (
                  <button
                    type="button"
                    onClick={onOpenNaatPlayer}
                    className="px-2 sm:px-2.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-950 text-emerald-200 border border-emerald-400/80 hover:border-emerald-300 hover:scale-105 active:scale-95 transition-all cursor-pointer font-nastaliq font-bold shadow-xs flex items-center gap-1 text-[11px] sm:text-xs"
                    title="حمد و نعت و کلامِ اکابر"
                  >
                    <Mic2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="hidden sm:inline">{t('audio_naat', 'حمد و نعت')}</span>
                    <span className="sm:hidden">نعت</span>
                  </button>
                )}
              </div>
            )}

            {/* Desktop Navigation (Adaptive: Full on XL, Grouped on LG) */}
            <nav className="hidden lg:flex items-center gap-1 shrink-0 whitespace-nowrap">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-2.5 py-1.5 rounded-xl font-nastaliq font-bold transition-all text-xs cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-gray-100'
                }`}
              >
                {t('nav_dashboard', 'کتب خانہ')}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reader')}
                className={`px-2.5 py-1.5 rounded-xl font-nastaliq font-bold transition-all flex items-center gap-1 text-xs cursor-pointer ${
                  activeTab === 'reader'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>{t('nav_reader', 'مطالعہ')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ahkam-shariat')}
                className={`px-2.5 py-1.5 rounded-xl font-nastaliq font-bold transition-all flex items-center gap-1 text-xs cursor-pointer ${
                  activeTab === 'ahkam-shariat'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-gray-100'
                }`}
                title="احکامِ شریعت و فقہی رہنمائی"
              >
                <Scale className="w-3 h-3 text-amber-500" />
                <span>{t('nav_ahkam_shariat', 'احکامِ شریعت')}</span>
              </button>

              {/* XL-Only Direct Tabs */}
              <button
                type="button"
                onClick={() => setActiveTab('islah-aamal')}
                className={`hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-nastaliq font-bold transition-all text-xs cursor-pointer ${
                  activeTab === 'islah-aamal'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-gray-100'
                }`}
                title="اصلاحِ اعمال و روزمرہ محاسبۂ نفس"
              >
                <Heart className="w-3 h-3 text-rose-500" />
                <span>{t('nav_islah_aamal', 'اصلاحِ اعمال')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prayer-times')}
                className={`hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-nastaliq font-bold transition-all text-xs cursor-pointer ${
                  activeTab === 'prayer-times'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{t('nav_prayer_times', 'اوقاتِ نماز')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('exams')}
                className={`hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-nastaliq font-bold transition-all text-xs cursor-pointer ${
                  activeTab === 'exams'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-gray-100'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>{t('nav_exams', 'امتحانی مرکز')}</span>
              </button>

              {/* LG-Only "More" Dropdown to prevent squishing search bar */}
              <div className="xl:hidden relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(prev => !prev)}
                  className={`px-2 py-1.5 rounded-xl font-nastaliq font-bold transition-all flex items-center gap-1 text-xs cursor-pointer ${
                    activeTab === 'islah-aamal' || activeTab === 'prayer-times' || activeTab === 'exams'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{t('nav_more', 'مزید ▾')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {moreMenuOpen && (
                  <div 
                    onClick={() => setMoreMenuOpen(false)}
                    className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 animate-fadeIn"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('islah-aamal')}
                      className={`w-full px-3 py-2 text-right font-nastaliq text-xs flex items-center gap-2 hover:bg-emerald-50 ${
                        activeTab === 'islah-aamal' ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-stone-700'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>اصلاحِ اعمال</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('prayer-times')}
                      className={`w-full px-3 py-2 text-right font-nastaliq text-xs flex items-center gap-2 hover:bg-emerald-50 ${
                        activeTab === 'prayer-times' ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-stone-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>اوقاتِ نماز</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('exams')}
                      className={`w-full px-3 py-2 text-right font-nastaliq text-xs flex items-center gap-2 hover:bg-emerald-50 ${
                        activeTab === 'exams' ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-stone-700'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      <span>امتحانی مرکز</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Hamburger Button (< lg) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl text-stone-700 hover:text-emerald-900 hover:bg-stone-100 transition cursor-pointer"
              title="مینو"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Dedicated Mobile & Tablet Full-Width Search Row (< lg) */}
        <div className="lg:hidden pb-2.5 pt-0.5">
          <GlobalSearchInput
            initialQuery={searchQuery}
            onQueryChange={onSearchChange}
            onSelectResult={handleSelectResult}
            onOpenFullModal={(q, cat) => {
              if (onOpenSearch) onOpenSearch(q, cat);
            }}
            placeholder="147 کتب، احادیث، تفاسیر و فقہ میں تلاش کریں..."
          />
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-slate-800 py-3 bg-stone-50/95 dark:bg-slate-900/95 rounded-2xl mb-2 px-2 shadow-inner animate-fadeIn">
            {/* Mobile Language Switcher Row */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl border border-stone-200 dark:border-slate-700 mb-2.5">
              <span className="text-xs font-bold font-nastaliq text-stone-700 dark:text-stone-300">زبان (Language):</span>
              <div className="flex items-center bg-stone-100 rounded-full p-0.5 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setLanguage('ur')}
                  className={`px-3 py-0.5 rounded-full text-xs font-nastaliq font-bold transition ${
                    language === 'ur' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-stone-700'
                  }`}
                >
                  اردو
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`px-3 py-0.5 rounded-full text-xs font-arabic font-bold transition ${
                    language === 'ar' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-stone-700'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-0.5 rounded-full text-xs font-sans font-semibold transition ${
                    language === 'en' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-stone-700'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Mobile Theme Switcher Row */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl border border-stone-200 dark:border-slate-700 mb-2.5">
              <span className="text-xs font-bold font-nastaliq text-stone-700 dark:text-stone-300">طرزِ بصارت (Theme):</span>
              <ThemeToggle showLabel={true} />
            </div>

            <div className="grid grid-cols-2 gap-1.5 font-nastaliq text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                  activeTab === 'dashboard' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-stone-800 hover:bg-emerald-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('nav_dashboard', 'کتب خانہ')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('reader');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                  activeTab === 'reader' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-stone-800 hover:bg-emerald-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav_reader', 'مطالعہ')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('ahkam-shariat');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                  activeTab === 'ahkam-shariat' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-stone-800 hover:bg-emerald-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('nav_ahkam_shariat', 'احکامِ شریعت')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('islah-aamal');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                  activeTab === 'islah-aamal' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-stone-800 hover:bg-emerald-50'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>{t('nav_islah_aamal', 'اصلاحِ اعمال')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('prayer-times');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                  activeTab === 'prayer-times' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-stone-800 hover:bg-emerald-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('nav_prayer_times', 'اوقاتِ نماز')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('exams');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                  activeTab === 'exams' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-stone-800 hover:bg-emerald-50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav_exams', 'امتحانی مرکز')}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};