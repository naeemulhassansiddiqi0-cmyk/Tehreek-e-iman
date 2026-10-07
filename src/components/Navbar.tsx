import React, { useState } from 'react';
import { Search, BookOpen, Clock, GraduationCap, X } from 'lucide-react';
import { TehreekImanLogo } from './TehreekImanLogo';
import { AppTab } from '../types';

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
  onOpenSearch?: () => void;
  onOpenKharjiBooks?: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSearchChange,
  searchQuery = '',
  customLogoSrc = '/tehreek-iman-logo.jpg',
}) => {
  const [internalQuery, setInternalQuery] = useState(searchQuery);

  const handleSearch = (val: string) => {
    setInternalQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-2.5 min-h-[5.5rem] sm:min-h-[6rem] gap-3 sm:gap-6">
          
          {/* Right: Logo & Name "تحریک ایمان" مع بانی و سرپرست */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 sm:gap-4 cursor-pointer select-none shrink-0 py-1"
            title="تحریکِ ایمان — بانی و سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ"
          >
            <div className="shrink-0 flex items-center justify-center">
              <div className="hidden sm:block">
                <TehreekImanLogo size={74} customImgSrc={customLogoSrc} />
              </div>
              <div className="sm:hidden">
                <TehreekImanLogo size={58} customImgSrc={customLogoSrc} />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-nastaliq text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight leading-tight">
                تحریکِ ایمان
              </span>
              <span className="font-nastaliq text-xs sm:text-sm font-bold text-amber-900 leading-tight mt-1 flex flex-wrap items-center gap-1">
                <span className="text-emerald-800 font-bold">بانی و سرپرست:</span>
                <span className="text-stone-800">حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ</span>
              </span>
            </div>
          </div>

          {/* Center: Search Bar with Urdu placeholder */}
          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={internalQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="کتاب، مصنف یا موضوع تلاش کریں..."
                className="w-full pr-11 pl-10 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-stone-900 placeholder:text-gray-400 text-sm rounded-2xl border border-gray-200 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-all font-nastaliq"
              />
              {internalQuery && (
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-stone-700 p-1 rounded-full transition"
                  title="تلاش صاف کریں"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Left: Clean Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-2xl text-sm font-nastaliq font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-gray-100'
              }`}
            >
              کتب خانہ
            </button>

            <button
              onClick={() => setActiveTab('reader')}
              className={`px-4 py-2 rounded-2xl text-sm font-nastaliq font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reader'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>مطالعہ</span>
            </button>

            <button
              onClick={() => setActiveTab('prayer-times')}
              className={`px-4 py-2 rounded-2xl text-sm font-nastaliq font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'prayer-times'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>اوقاتِ نماز</span>
            </button>

            <button
              onClick={() => setActiveTab('exams')}
              className={`px-4 py-2 rounded-2xl text-sm font-nastaliq font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'exams'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>امتحانی مرکز</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};