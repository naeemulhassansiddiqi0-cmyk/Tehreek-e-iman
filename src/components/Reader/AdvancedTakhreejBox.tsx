import React, { useState } from 'react';
import { GitFork, ChevronDown, ChevronUp, Check, Copy, ExternalLink, BookmarkCheck, Layers, Share2 } from 'lucide-react';
import { TakhreejData } from '@/services/takhreejService';
import { SocialShareModal } from './SocialShareModal';
import Link from 'next/link';

interface AdvancedTakhreejBoxProps {
  data?: TakhreejData | null;
  className?: string;
  defaultExpanded?: boolean;
}

export const AdvancedTakhreejBox: React.FC<AdvancedTakhreejBoxProps> = ({
  data,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [copied, setCopied] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (!data) return null;

  const handleCopyAll = () => {
    let text = `【تخریج و حوالہ جات — صحیح بخاری حدیث نمبر ${data.bukhariHadithNumber}】\n`;
    text += `خلاصۂ تخریج: ${data.takhreejSummary}\n`;
    if (data.chainPivotUrdu) {
      text += `مدارِ اسناد: ${data.chainPivotUrdu}\n\n`;
    }
    text += `• حوالہ جات الکتب الستۃ و مسند احمد:\n`;
    data.primaryReferences.forEach(ref => {
      text += `- ${ref.bookNameUrdu}: رقم الحدیث ${ref.hadithNumber} (${ref.chapterUrdu}) [${ref.wordingRelation}]\n`;
    });
    if (data.bukhariRepetitions && data.bukhariRepetitions.length > 0) {
      text += `\n• مواضع الحدیث فی صحیح البخاری (تکرار ابواب):\n`;
      data.bukhariRepetitions.forEach(rep => {
        text += `- حدیث نمبر ${rep.hadithNumber}: ${rep.chapterTitleUrdu}\n`;
      });
    }
    text += `\n🌐 تحریکِ ایمان اسلامی پورٹل • https://tehreek-e-iman.pages.dev`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredReferences = activeFilter === 'all'
    ? data.primaryReferences
    : data.primaryReferences.filter(r => r.bookId === activeFilter);

  return (
    <div
      className={`rounded-2xl border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-50/40 via-white to-stone-50 shadow-xs p-4 sm:p-5 space-y-4 text-right transition-all my-3 ${className}`}
      dir="rtl"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-800 to-indigo-600 text-indigo-100 flex items-center justify-center shadow-xs shrink-0">
            <GitFork className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold font-nastaliq text-base sm:text-lg text-indigo-950 flex items-center gap-1.5">
                <span>تخریج و حوالہ جات</span>
                <span className="text-indigo-800 font-extrabold text-sm sm:text-base">(Cross-References & Takhreej)</span>
              </h3>
              <span className="text-[11px] font-bold font-nastaliq text-indigo-900 bg-indigo-100/90 px-2.5 py-0.5 rounded-md border border-indigo-300/80">
                الکتب الستۃ و مسند احمد کے شواہد
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 font-nastaliq mt-0.5">
              دیگر بنیادی کتبِ حدیث میں مماثل مرویات، مواضعِ تکرار، اور مدارِ اسناد کی مکمل تحقیق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Full Takhrij */}
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 border border-indigo-200 text-indigo-900 dark:text-indigo-300 text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
            title="مکمل تخریج نقل کریں"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">کاپی ہو گیا!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-700" />
                <span>تخریج کاپی کریں</span>
              </>
            )}
          </button>

          {/* Share Takhrij Button */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
            title="تخریج و شواہد کو واٹس ایپ یا ٹیلی گرام پر شیئر کریں"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-300" />
            <span>شیئر کریں</span>
          </button>

          {/* Expand/Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 border border-indigo-300 text-indigo-950 dark:text-indigo-200 text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'تخریج سمیٹیں' : 'تخریج دیکھیں'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Content Body (Collapsible) */}
      {isExpanded && (
        <div className="space-y-4 pt-1 animate-fadeIn">

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-nastaliq">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg border font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-indigo-700 text-white border-indigo-800 shadow-2xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              تمام کتبِ حدیث ({data.primaryReferences.length})
            </button>
            {data.primaryReferences.map(ref => (
              <button
                key={ref.bookId}
                type="button"
                onClick={() => setActiveFilter(ref.bookId)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  activeFilter === ref.bookId
                    ? 'bg-indigo-700 text-white border-indigo-800 shadow-2xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {ref.bookNameUrdu}
              </button>
            ))}
          </div>

          {/* Primary Canonical Books Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredReferences.map((ref, idx) => (
              <div
                key={idx}
                className="bg-white/95 rounded-xl p-3.5 border border-stone-200/90 shadow-2xs flex flex-col justify-between hover:shadow-xs transition space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-1.5 mb-2">
                    <span className={`text-[11px] font-bold font-nastaliq px-2 py-0.5 rounded-md border ${ref.badgeColor}`}>
                      {ref.bookNameUrdu}
                    </span>
                    <span className="text-[10px] font-bold text-stone-600 font-nastaliq bg-stone-100 px-2 py-0.5 rounded-md">
                      {ref.wordingRelation}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-indigo-950 font-nastaliq">
                        رقم الحديث: <span className="font-mono text-sm text-indigo-900">{ref.hadithNumber}</span>
                      </span>
                    </div>

                    <p className="font-arabic text-stone-800 text-xs sm:text-sm leading-relaxed" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                      {ref.chapterArabic}
                    </p>
                    <p className="font-nastaliq text-[11px] text-stone-600 leading-snug">
                      {ref.chapterUrdu}
                    </p>
                  </div>
                </div>

                {ref.linkSlug && (
                  <div className="pt-2 border-t border-stone-100 flex justify-end">
                    <Link
                      href={`/books/${ref.linkSlug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold font-nastaliq text-indigo-700 hover:text-indigo-900 hover:underline"
                    >
                      <span>یہ کتاب کھولیں</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Repetitions in Sahih Bukhari (مواضع الحدیث فی صحیح البخاری) */}
          {data.bukhariRepetitions && data.bukhariRepetitions.length > 0 && (
            <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                <span className="text-xs font-bold text-amber-950 font-nastaliq flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-800" />
                  <span>مواضع الحدیث فی صحیح البخاری (دیگر ابواب میں تکرارِ حدیث):</span>
                </span>
                <span className="text-[10px] font-bold font-nastaliq text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                  {data.bukhariRepetitions.length} مقامات پر مروی
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                {data.bukhariRepetitions.map((rep, rIdx) => (
                  <div
                    key={rIdx}
                    className="bg-white/90 p-2.5 rounded-lg border border-amber-200/70 text-right space-y-0.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-amber-900 font-mono">حدیث #{rep.hadithNumber}</span>
                      <span className="text-[9px] text-stone-500 font-arabic truncate max-w-[130px]">{rep.chapterTitleArabic.split('—')[0]}</span>
                    </div>
                    <p className="text-[11px] font-nastaliq text-stone-700 leading-snug line-clamp-2">
                      {rep.chapterTitleUrdu}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chain Pivot & Sanad Summary (مدار الإسناد) */}
          <div className="bg-white/95 rounded-xl p-3.5 border border-stone-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-700 pb-1.5">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 font-nastaliq flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>مدارِ اسناد اور شواہد کی حیثیت (Chain Pivot):</span>
              </span>
              <span className="text-[10px] font-bold font-nastaliq text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                تحقیقِ اسناد
              </span>
            </div>

            <div className="space-y-1.5 select-text">
              <div 
                className="p-2 bg-stone-100 dark:bg-slate-900 rounded-lg border border-stone-200/90 dark:border-slate-700 text-right font-arabic text-stone-950 dark:text-amber-200 text-xs sm:text-sm leading-relaxed font-semibold"
                style={{ fontFamily: "'Amiri', serif", color: '#0f172a' }}
              >
                <strong>مدار الرواية:</strong> {data.chainPivotArabic}
              </div>
              <p className="font-nastaliq text-xs sm:text-sm text-stone-950 dark:text-stone-100 leading-[2.3] pr-1 font-medium" style={{ color: '#111827' }}>
                {data.chainPivotUrdu}
              </p>
              <p className="font-nastaliq text-xs font-bold text-emerald-950 dark:text-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/70 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 leading-relaxed">
                💡 <strong>خلاصۂ حکم و تخریج:</strong> {data.takhreejSummary}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Social Share Modal for Takhreej & Cross-References */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`تخریج و حوالہ جات — صحیح بخاری حدیث نمبر ${data.bukhariHadithNumber}`}
        urduText={`خلاصۂ تخریج: ${data.takhreejSummary}\n\nمدارِ اسناد: ${data.chainPivotUrdu || ''}\n\nشواہد: ${data.primaryReferences.map(r => `${r.bookNameUrdu} (حدیث ${r.hadithNumber})`).join('، ')}`}
        scholarlyNotes={`کتبِ ستہ و مسند احمد کی تقابلی تخریج`}
        reference={`صحیح بخاری • حدیث شریف نمبر ${data.bukhariHadithNumber}`}
        pageUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
    </div>
  );
};
