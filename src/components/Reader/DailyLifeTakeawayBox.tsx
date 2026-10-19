import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Check, Copy, HeartHandshake, Compass, Share2 } from 'lucide-react';
import { SocialShareModal } from './SocialShareModal';

interface DailyLifeTakeawayBoxProps {
  lessonPoints?: string[];
  amalNuskha?: string;
  hadithNumber?: number | string;
  className?: string;
  defaultExpanded?: boolean;
}

export const DailyLifeTakeawayBox: React.FC<DailyLifeTakeawayBoxProps> = ({
  lessonPoints = [],
  amalNuskha,
  hadithNumber,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [copied, setCopied] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Fallback defaults if not provided
  const points = lessonPoints && lessonPoints.length > 0 ? lessonPoints : [
    'اخلاصِ نیت اور للہیت: ہر کام، گفتگو اور عبادت کو صرف اور صرف اللہ تعالیٰ کی خوشنودی کے لیے کریں، دنیاوی دکھاوے اور شہرت سے بچیں۔',
    'سنتِ نبوی پر استقامت: روزمرہ کے تمام معاملات، اخلاق اور خاندانی تعلقات کو رسول اللہ ﷺ کے اسوہ حسنہ کے مطابق ڈھالیں۔',
    'خود احتسابی کا معمول: رات سونے سے پہلے اپنے دن بھر کے اعمال کا جائزہ لیں اور کوتاہیوں پر صدقِ دل سے استغفار کریں۔'
  ];

  const practicalHabit = amalNuskha || 'روزانہ صبح بیدار ہوتے ہی اور ہر نیا کام شروع کرتے وقت دل میں نیت کی تجدید فرمائیں اور مسنون دعاؤں کا التزام رکھیں۔';

  const handleCopy = () => {
    const textToCopy = `【روزمرہ زندگی کا سبق (عملی تربیت) — حدیث نمبر ${hadithNumber || ''}】\n` +
      points.map((p, i) => `${i + 1}. ${p}`).join('\n') +
      `\n🌱 روزمرہ عملی نسخہ: ${practicalHabit}\n\n🌐 تحریکِ ایمان اسلامی پورٹل • https://tehreek-e-iman.pages.dev`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/50 shadow-xs p-4 sm:p-5 space-y-3.5 text-right transition-all my-3 ${className}`}
      dir="rtl"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-600 text-amber-100 flex items-center justify-center shadow-xs shrink-0">
            <HeartHandshake className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold font-nastaliq text-base sm:text-lg text-amber-950 flex items-center gap-1.5">
                <span>روزمرہ زندگی کا سبق</span>
                <span className="text-amber-800 font-extrabold text-sm sm:text-base">(عملی تربیت)</span>
              </h3>
              <span className="text-[11px] font-bold font-nastaliq text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-md border border-amber-300/80">
                عامۃ المسلمین کے لیے اخلاقی و عملی راہنمائی
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 font-nastaliq mt-0.5">
              اس حدیثِ پاک سے اخلاق سنوارنے اور روزمرہ زندگی میں عملی انقلاب لانے کے آسان رہنما نکات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 border border-amber-200 text-amber-900 dark:text-amber-300 text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
            title="سبق نقل کریں"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">کاپی ہو گیا!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-700" />
                <span>سبق کاپی کریں</span>
              </>
            )}
          </button>

          {/* Social Share Button */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
            title="یہ عملی سبق واٹس ایپ یا ٹیلی گرام پر شیئر کریں"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-200" />
            <span>شیئر کریں</span>
          </button>

          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 border border-amber-300 text-amber-950 dark:text-amber-200 text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'سبق سمیٹیں' : 'سبق پڑھیں'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Content Body (Collapsible) */}
      {isExpanded && (
        <div className="space-y-3 pt-1 animate-fadeIn">
          {/* Key Lessons List */}
          <div className="space-y-2 bg-white/95 dark:bg-slate-800/95 p-3 sm:p-4 rounded-xl border border-amber-200/80 dark:border-slate-700 shadow-2xs">
            <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 font-nastaliq flex items-center gap-1.5 border-b border-amber-100 dark:border-slate-700 pb-1.5">
              <Compass className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>عملی نکات و کردار سازی (Personal & Moral Reform):</span>
            </h4>

            <ul className="space-y-2 text-stone-950 dark:text-stone-100 pr-1">
              {points.map((point, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm font-nastaliq leading-[2.3] text-stone-950 dark:text-stone-100 font-medium">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 font-mono">
                    {pIdx + 1}
                  </span>
                  <span className="flex-1 select-text">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Practical Daily Habit / Nuskha */}
          <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-emerald-50/80 dark:from-amber-950/50 dark:via-slate-800 dark:to-emerald-950/50 rounded-xl p-3 sm:p-3.5 border border-amber-300 dark:border-amber-700 shadow-2xs flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-100" />
            </div>
            <div className="space-y-0.5 flex-1 select-text">
              <span className="text-[11px] font-bold font-nastaliq text-amber-950 dark:text-amber-200 block">
                🌱 روزمرہ عملی نسخہ (مجرب معمول برائے تزکیۂ نفس):
              </span>
              <p className="font-nastaliq font-bold text-xs sm:text-sm text-stone-950 dark:text-stone-100 leading-[2.3]">
                {practicalHabit}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Social Share Modal for Daily Life Takeaway */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`روزمرہ زندگی کا سبق (عملی تربیت) — حدیث نمبر ${hadithNumber || ''}`}
        urduText={points.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}
        scholarlyNotes={`🌱 روزمرہ عملی نسخہ:\n${practicalHabit}`}
        reference={`تحریکِ ایمان • اخلاقی و عملی تربیت (حدیث شریف نمبر ${hadithNumber || ''})`}
        pageUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
    </div>
  );
};
