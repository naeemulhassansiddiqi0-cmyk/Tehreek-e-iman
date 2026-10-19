import React, { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Link as LinkIcon, 
  Smartphone
} from 'lucide-react';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  arabicText?: string;
  urduText?: string;
  reference?: string;
  pageUrl?: string;
  scholarlyNotes?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  arabicText = '',
  urduText = '',
  reference = '',
  pageUrl = '',
  scholarlyNotes = ''
}) => {
  const [copiedType, setCopiedType] = useState<'all' | 'link' | 'arabic' | 'urdu' | null>(null);
  const [contentMode, setContentMode] = useState<'full' | 'urdu_only' | 'arabic_only'>('full');

  // Resolved URL with fallback
  const finalUrl = useMemo(() => {
    if (pageUrl) return pageUrl;
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return 'https://tehreek-e-iman.pages.dev';
  }, [pageUrl]);

  // Generate clean formatted text for social sharing
  const formattedShareText = useMemo(() => {
    const parts: string[] = [];

    parts.push(`【${title}】\n`);

    if (contentMode === 'full' || contentMode === 'arabic_only') {
      if (arabicText && arabicText.trim()) {
        parts.push(`📖 عربی متن:\n${arabicText.trim()}\n`);
      }
    }

    if (contentMode === 'full' || contentMode === 'urdu_only') {
      if (urduText && urduText.trim()) {
        parts.push(`🌸 سلیس اردو ترجمہ:\n${urduText.trim()}\n`);
      }
    }

    if (scholarlyNotes && scholarlyNotes.trim() && contentMode === 'full') {
      parts.push(`💡 فقہی / درسی فائدہ:\n${scholarlyNotes.trim()}\n`);
    }

    if (reference && reference.trim()) {
      parts.push(`📚 حوالہ: ${reference.trim()}`);
    }

    parts.push(`🌐 تحریکِ ایمان اسلامی پورٹل: ${finalUrl}`);

    return parts.join('\n');
  }, [title, arabicText, urduText, scholarlyNotes, reference, finalUrl, contentMode]);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'all' | 'link' | 'arabic' | 'urdu') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2400);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(formattedShareText);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTelegramShare = () => {
    const encodedText = encodeURIComponent(formattedShareText);
    const encodedUrl = encodeURIComponent(finalUrl);
    const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    if (typeof window !== 'undefined') {
      window.open(tgUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: formattedShareText,
          url: finalUrl
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy(formattedShareText, 'all');
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-emerald-300 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all text-right"
        onClick={e => e.stopPropagation()}
      >
        {/* 1. Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white border-b border-amber-400/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs shrink-0 font-bold">
              <Share2 className="w-4 h-4 text-stone-950" />
            </div>
            <div>
              <h3 className="font-bold font-nastaliq text-base sm:text-lg leading-tight text-amber-200">
                شیئر و ارسال فرمائیں (Social Sharing)
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-100 font-nastaliq">
                {title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            title="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Format Switcher Tabs */}
        <div className="px-5 pt-3 pb-1 border-b border-gray-100 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold font-nastaliq text-stone-600 dark:text-stone-300">
            ترتیب متن:
          </span>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setContentMode('full')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-nastaliq font-bold transition cursor-pointer ${
                contentMode === 'full'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-800'
              }`}
            >
              عربی + اردو (مکمل)
            </button>
            <button
              type="button"
              onClick={() => setContentMode('urdu_only')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-nastaliq font-bold transition cursor-pointer ${
                contentMode === 'urdu_only'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-800'
              }`}
            >
              صرف اردو
            </button>
            <button
              type="button"
              onClick={() => setContentMode('arabic_only')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-nastaliq font-bold transition cursor-pointer ${
                contentMode === 'arabic_only'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-800'
              }`}
            >
              صرف عربی
            </button>
          </div>
        </div>

        {/* 3. Text Preview Card */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <div className="relative bg-amber-50/40 dark:bg-slate-800/80 rounded-2xl p-4 border border-amber-200/60 dark:border-slate-700 max-h-56 overflow-y-auto select-text font-nastaliq text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed space-y-2.5 shadow-inner">
            <div className="absolute top-2 left-2 flex items-center gap-1">
              {copiedType === 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs animate-pulse">
                  <Check className="w-3 h-3" />
                  <span>کاپی ہو گیا!</span>
                </span>
              )}
            </div>

            <p className="whitespace-pre-line select-text">
              {formattedShareText}
            </p>
          </div>

          {/* Quick Copy Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleCopy(formattedShareText, 'all')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-nastaliq bg-stone-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-slate-600 transition cursor-pointer shadow-2xs"
            >
              {copiedType === 'all' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">کاپی ہو گیا!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>مکمل متن کاپی کریں</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleCopy(finalUrl, 'link')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-nastaliq bg-stone-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-slate-600 transition cursor-pointer shadow-2xs"
            >
              {copiedType === 'link' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">لنک کاپی ہو گیا!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5 text-stone-500" />
                  <span>حدیث کا لنک کاپی کریں</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Action Buttons Footer (WhatsApp, Telegram, Native Share) */}
        <div className="px-5 py-4 bg-stone-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold font-nastaliq text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer"
            >
              {/* WhatsApp Icon */}
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>واٹس ایپ پر بھیجیں</span>
            </button>

            {/* Telegram Share Button */}
            <button
              type="button"
              onClick={handleTelegramShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold font-nastaliq text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer"
            >
              {/* Telegram Icon */}
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              <span>ٹیلی گرام پر بھیجیں</span>
            </button>

            {/* System Native Share or Copy */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold font-nastaliq text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer"
            >
              {hasNativeShare ? (
                <>
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  <span>دیگر ایپس (موبائل شیئر)</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-300" />
                  <span>متن کاپی کریں</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
