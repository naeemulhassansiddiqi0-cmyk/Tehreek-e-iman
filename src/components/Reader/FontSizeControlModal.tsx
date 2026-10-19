import React from 'react';
import { X, RotateCcw, Plus, Minus, Sliders, Check } from 'lucide-react';
import { usePortalLanguage } from '../../context/LanguageContext';

export interface FontSizeControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  arabicFontSize: number;
  onArabicFontSizeChange: (size: number) => void;
  urduFontSize: number;
  onUrduFontSizeChange: (size: number) => void;
  lineHeightScale?: number;
  onLineHeightScaleChange?: (scale: number) => void;
  onResetAll?: () => void;
}

export const FontSizeControlModal: React.FC<FontSizeControlModalProps> = ({
  isOpen,
  onClose,
  arabicFontSize,
  onArabicFontSizeChange,
  urduFontSize,
  onUrduFontSizeChange,
  lineHeightScale = 1.0,
  onLineHeightScaleChange,
  onResetAll,
}) => {
  const { t } = usePortalLanguage();

  if (!isOpen) return null;

  const handleArabicStep = (delta: number) => {
    const next = Math.min(44, Math.max(18, arabicFontSize + delta));
    onArabicFontSizeChange(next);
  };

  const handleUrduStep = (delta: number) => {
    const next = Math.min(38, Math.max(15, urduFontSize + delta));
    onUrduFontSizeChange(next);
  };

  const handleApplyPreset = (preset: 'small' | 'standard' | 'large' | 'xlarge') => {
    switch (preset) {
      case 'small':
        onArabicFontSizeChange(22);
        onUrduFontSizeChange(17);
        if (onLineHeightScaleChange) onLineHeightScaleChange(0.9);
        break;
      case 'standard':
        onArabicFontSizeChange(26);
        onUrduFontSizeChange(20);
        if (onLineHeightScaleChange) onLineHeightScaleChange(1.0);
        break;
      case 'large':
        onArabicFontSizeChange(32);
        onUrduFontSizeChange(24);
        if (onLineHeightScaleChange) onLineHeightScaleChange(1.15);
        break;
      case 'xlarge':
        onArabicFontSizeChange(38);
        onUrduFontSizeChange(28);
        if (onLineHeightScaleChange) onLineHeightScaleChange(1.25);
        break;
    }
  };

  const handleReset = () => {
    if (onResetAll) {
      onResetAll();
    } else {
      onArabicFontSizeChange(26);
      onUrduFontSizeChange(20);
      if (onLineHeightScaleChange) onLineHeightScaleChange(1.0);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800/80 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-nastaliq font-bold text-base sm:text-lg leading-tight">
                {t('reader_typography_panel', 'خط و کتابت کا حجم اور زوم کنٹرول')}
              </h3>
              <p className="text-[11px] text-emerald-200/90 font-nastaliq">
                عربی متن و اردو ترجمہ کا حجم اپنی بصارت و پسند کے مطابق ترتیب دیں
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition cursor-pointer"
            aria-label="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Quick Presets Bar */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300 font-nastaliq">
              {t('reader_presets', 'تیار کردہ ترتیبات (Quick Presets):')}
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-nastaliq">
              <button
                type="button"
                onClick={() => handleApplyPreset('small')}
                className={`py-1.5 px-2 rounded-xl border text-center transition cursor-pointer ${
                  arabicFontSize <= 22 && urduFontSize <= 17
                    ? 'bg-emerald-800 text-white border-emerald-700 font-bold shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-emerald-50'
                }`}
              >
                {t('reader_preset_small', 'چھوٹا (85%)')}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('standard')}
                className={`py-1.5 px-2 rounded-xl border text-center transition cursor-pointer ${
                  arabicFontSize === 26 && urduFontSize === 20
                    ? 'bg-emerald-800 text-white border-emerald-700 font-bold shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-emerald-50'
                }`}
              >
                {t('reader_preset_standard', 'معیاری (100%)')}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('large')}
                className={`py-1.5 px-2 rounded-xl border text-center transition cursor-pointer ${
                  arabicFontSize === 32 && urduFontSize === 24
                    ? 'bg-emerald-800 text-white border-emerald-700 font-bold shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-emerald-50'
                }`}
              >
                {t('reader_preset_large', 'بڑا (125%)')}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('xlarge')}
                className={`py-1.5 px-2 rounded-xl border text-center transition cursor-pointer ${
                  arabicFontSize >= 38 && urduFontSize >= 28
                    ? 'bg-emerald-800 text-white border-emerald-700 font-bold shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-emerald-50'
                }`}
              >
                {t('reader_preset_xlarge', 'جلی (150%)')}
              </button>
            </div>
          </div>

          {/* 1. Arabic Matn Controls */}
          <div className="bg-amber-50/40 dark:bg-stone-800/60 p-3.5 sm:p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 font-nastaliq flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <span>{t('reader_arabic_font', 'عربی متن (متنِ حدیث مبارک)')}</span>
              </span>
              <span className="font-mono text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                {arabicFontSize}px ({Math.round((arabicFontSize / 26) * 100)}%)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleArabicStep(-2)}
                disabled={arabicFontSize <= 18}
                className="w-9 h-9 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 text-stone-700 dark:text-stone-200 disabled:opacity-40 transition active:scale-95 cursor-pointer shadow-2xs font-bold"
                title="عربی فونٹ چھوٹا کریں"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="range"
                min={18}
                max={44}
                step={2}
                value={arabicFontSize}
                onChange={(e) => onArabicFontSizeChange(Number(e.target.value))}
                className="flex-1 accent-amber-600 cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
              />

              <button
                type="button"
                onClick={() => handleArabicStep(2)}
                disabled={arabicFontSize >= 44}
                className="w-9 h-9 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 text-stone-700 dark:text-stone-200 disabled:opacity-40 transition active:scale-95 cursor-pointer shadow-2xs font-bold"
                title="عربی فونٹ بڑا کریں"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Urdu Translation Controls */}
          <div className="bg-emerald-50/40 dark:bg-stone-800/60 p-3.5 sm:p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 font-nastaliq flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>{t('reader_urdu_font', 'اردو ترجمہ و تشریح (نستعلیق)')}</span>
              </span>
              <span className="font-mono text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                {urduFontSize}px ({Math.round((urduFontSize / 20) * 100)}%)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleUrduStep(-2)}
                disabled={urduFontSize <= 15}
                className="w-9 h-9 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-emerald-50 text-stone-700 dark:text-stone-200 disabled:opacity-40 transition active:scale-95 cursor-pointer shadow-2xs font-bold"
                title="اردو فونٹ چھوٹا کریں"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="range"
                min={15}
                max={38}
                step={1}
                value={urduFontSize}
                onChange={(e) => onUrduFontSizeChange(Number(e.target.value))}
                className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
              />

              <button
                type="button"
                onClick={() => handleUrduStep(2)}
                disabled={urduFontSize >= 38}
                className="w-9 h-9 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-emerald-50 text-stone-700 dark:text-stone-200 disabled:opacity-40 transition active:scale-95 cursor-pointer shadow-2xs font-bold"
                title="اردو فونٹ بڑا کریں"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Live Interactive Preview Box */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-stone-500 font-nastaliq">
              پیشگی جائزہ (Live Typography Preview):
            </span>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-2 select-none overflow-hidden">
              <p
                className="font-arabic text-stone-900 dark:text-stone-100 text-right transition-all"
                style={{
                  fontSize: `${arabicFontSize}px`,
                  lineHeight: `${arabicFontSize * 1.55 * lineHeightScale}px`,
                  fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
                }}
              >
                إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى
              </p>
              <div className="border-t border-stone-200 dark:border-stone-800 pt-2">
                <p
                  className="urdu-text font-nastaliq text-stone-700 dark:text-stone-300 text-right transition-all"
                  style={{
                    fontSize: `${urduFontSize}px`,
                    lineHeight: `${urduFontSize * 1.85 * lineHeightScale}px`,
                  }}
                >
                  تمام اعمال کا دار و مدار نیتوں پر ہے اور ہر انسان کے لیے وہی ہے جس کی اس نے نیت کی۔
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 dark:bg-stone-950 p-3.5 sm:p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-nastaliq text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('reader_font_reset', 'اصل سائز پر بحال کریں (Reset)')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-nastaliq font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-amber-300" />
            <span>محفوظ اور مکمل</span>
          </button>
        </div>

      </div>
    </div>
  );
};
