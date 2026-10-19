import React from 'react';
import { Sliders } from 'lucide-react';
import { usePortalLanguage } from '../../context/LanguageContext';

export interface ReaderZoomToolbarProps {
  arabicFontSize: number;
  onArabicFontSizeChange: (size: number) => void;
  urduFontSize: number;
  onUrduFontSizeChange: (size: number) => void;
  onOpenSettings: () => void;
  onResetAll?: () => void;
  showLanguageSwitcher?: boolean;
  className?: string;
}

export const ReaderZoomToolbar: React.FC<ReaderZoomToolbarProps> = ({
  arabicFontSize,
  onArabicFontSizeChange,
  urduFontSize,
  onUrduFontSizeChange,
  onOpenSettings,
  onResetAll,
  showLanguageSwitcher = true,
  className = '',
}) => {
  const { language, setLanguage, t } = usePortalLanguage();

  const handleZoomOut = () => {
    onArabicFontSizeChange(Math.max(18, arabicFontSize - 2));
    onUrduFontSizeChange(Math.max(15, urduFontSize - 1));
  };

  const handleZoomIn = () => {
    onArabicFontSizeChange(Math.min(44, arabicFontSize + 2));
    onUrduFontSizeChange(Math.min(38, urduFontSize + 1));
  };

  const handleReset = () => {
    if (onResetAll) {
      onResetAll();
    } else {
      onArabicFontSizeChange(26);
      onUrduFontSizeChange(20);
    }
  };

  const currentPercent = Math.round(((arabicFontSize / 26) + (urduFontSize / 20)) / 2 * 100);

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`} dir="rtl">
      
      {/* Zoom In / Out Group */}
      <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-0.5 border border-stone-200 dark:border-stone-700 shadow-2xs">
        
        {/* A- Button */}
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={arabicFontSize <= 18 && urduFontSize <= 15}
          className="px-2 py-1 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:text-emerald-900 transition disabled:opacity-40 cursor-pointer flex items-center gap-0.5"
          title={t('reader_font_zoom_out', 'فونٹ سائز چھوٹا کریں (A-)')}
          aria-label="Font Zoom Out"
        >
          <span className="text-[11px] font-sans font-black">A-</span>
        </button>

        {/* Current Size Indicator / Reset */}
        <button
          type="button"
          onClick={handleReset}
          className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold text-stone-600 dark:text-stone-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-900 transition cursor-pointer"
          title={t('reader_font_reset', 'اصل سائز پر ری سیٹ کریں')}
        >
          {currentPercent}%
        </button>

        {/* A+ Button */}
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={arabicFontSize >= 44 && urduFontSize >= 38}
          className="px-2 py-1 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:text-emerald-900 transition disabled:opacity-40 cursor-pointer flex items-center gap-0.5"
          title={t('reader_font_zoom_in', 'فونٹ سائز بڑا کریں (A+)')}
          aria-label="Font Zoom In"
        >
          <span className="text-xs font-sans font-black">A+</span>
        </button>

      </div>

      {/* Detailed Typography Settings Modal Trigger */}
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold font-nastaliq bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition cursor-pointer shadow-2xs"
        title={t('reader_typography_panel', 'عربی و اردو فونٹ سائز پینل کھولیں')}
      >
        <Sliders className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">{t('reader_font_size', 'خط کا سائز')}</span>
      </button>

      {/* Multi-language Selector Pill (Urdu | Arabic | English) */}
      {showLanguageSwitcher && (
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-0.5 border border-stone-200 dark:border-stone-700 shadow-2xs">
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-nastaliq font-bold transition cursor-pointer ${
              language === 'ur'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-white/80'
            }`}
            title="اردو (Urdu - Jameel Noori Nastaleeq)"
          >
            اردو
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-arabic font-bold transition cursor-pointer ${
              language === 'ar'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-white/80'
            }`}
            title="العربية (Arabic - Naskh)"
          >
            العربية
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-sans font-semibold transition cursor-pointer ${
              language === 'en'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-white/80'
            }`}
            title="English"
          >
            EN
          </button>
        </div>
      )}

    </div>
  );
};
