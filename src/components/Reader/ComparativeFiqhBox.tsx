import React, { useState } from 'react';
import { Scale, ChevronDown, ChevronUp, Sparkles, Check, Copy, Award, ShieldCheck, Share2 } from 'lucide-react';
import { SocialShareModal } from './SocialShareModal';

export interface SchoolRuling {
  madhhab: 'hanafi' | 'shafii' | 'maliki' | 'hanbali';
  schoolNameUrdu: string;
  imams: string;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  ruling: string;
  dalailAndUsul: string;
  quranSunnahQuote?: string;
}

export interface ComparativeFiqhData {
  issueTitle: string;
  coreConflict: string;
  schools: SchoolRuling[];
  synthesisNote: string;
}

interface ComparativeFiqhBoxProps {
  data?: ComparativeFiqhData | null;
  className?: string;
  defaultExpanded?: boolean;
}

export const ComparativeFiqhBox: React.FC<ComparativeFiqhBoxProps> = ({
  data,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [copiedSchool, setCopiedSchool] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareData, setShareData] = useState<{ title: string; urdu: string; notes?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'hanafi' | 'shafii' | 'maliki' | 'hanbali'>('all');

  if (!data) return null;

  const handleCopy = (school: SchoolRuling) => {
    const textToCopy = `【${school.schoolNameUrdu}】\nحکم: ${school.ruling}\nدلیل و اصولی بنیاد: ${school.dalailAndUsul}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedSchool(school.madhhab);
      setTimeout(() => setCopiedSchool(null), 2000);
    }
  };

  const handleCopyAll = () => {
    const rulings = data.schools.map(s => `【${s.schoolNameUrdu} (${s.imams})】\nشرعی حکم: ${s.ruling}\nاصولی ادلہ: ${s.dalailAndUsul}`).join('\n\n────────────────────\n\n');
    const fullText = `【مقارنہ بین المذاہب (Comparative Fiqh)】\nمسئلہ: ${data.issueTitle}\n\n${rulings}\n\nباہمی تطبیق: ${data.synthesisNote}\n\n🌐 تحریکِ ایمان اسلامی پورٹل • https://tehreek-e-iman.pages.dev`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2200);
    }
  };

  const handleShareSchool = (school: SchoolRuling) => {
    setShareData({
      title: `فقہی موقف: ${school.schoolNameUrdu}`,
      urdu: `مسئلہ: ${data.issueTitle}\n\nمعتمد شرعی حکم: ${school.ruling}`,
      notes: `دلائل و اصولی بنیاد: ${school.dalailAndUsul} (${school.imams})`
    });
    setIsShareModalOpen(true);
  };

  const handleShareAll = () => {
    const summary = data.schools.map(s => `${s.schoolNameUrdu}: ${s.ruling}`).join('\n\n');
    setShareData({
      title: `مقارنہ بین المذاہب: ${data.issueTitle}`,
      urdu: summary,
      notes: `خلاصۂ تطبیق: ${data.synthesisNote}`
    });
    setIsShareModalOpen(true);
  };

  const filteredSchools = activeTab === 'all'
    ? data.schools
    : data.schools.filter(s => s.madhhab === activeTab);

  return (
    <div 
      className={`rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/40 shadow-xs p-4 sm:p-5 space-y-4 text-right transition-all my-3 ${className}`}
      dir="rtl"
    >
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-700 text-amber-300 flex items-center justify-center shadow-xs shrink-0">
            <Scale className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold font-nastaliq text-base sm:text-lg text-emerald-950 flex items-center gap-1.5">
                <span>مقارنہ بین المذاہب</span>
                <span className="text-amber-800 font-extrabold text-sm sm:text-base">(Comparative Fiqh)</span>
              </h3>
              <span className="text-[11px] font-bold font-nastaliq text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded-md border border-emerald-300/80">
                المذاهب الأربعة و دلائلِ استدلال
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 font-nastaliq mt-0.5">
              چاروں ائمۂ فقہ کے مستنبط احکام، اصولی ادلہ، قیاس اور باہمی تطبیق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 text-stone-700 dark:text-stone-300 border border-emerald-300 text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
            title="تمام چاروں مذاہب کے فتاویٰ اور دلائل نقل کریں"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
            <span>{copiedAll ? 'تمام تقابل کاپی ہو گیا!' : 'تمام تقابل نقل کریں'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
            title="تقابلی فقہ کو واٹس ایپ یا ٹیلی گرام پر شیئر کریں"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-300" />
            <span>شیئر کریں</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 border border-emerald-300 text-emerald-900 dark:text-emerald-300 text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'تقابل سمیٹیں' : 'تقابلی فقہ کھولیں'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Main Content (Collapsible) */}
      {isExpanded && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Issue Header Card: مسئلہ و خلاصۂ نزاع */}
          <div className="bg-white/95 dark:bg-slate-800/90 rounded-xl p-3.5 border border-emerald-200/80 dark:border-emerald-700/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-950 dark:text-emerald-200 font-nastaliq bg-emerald-100/90 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>محلِ نزاع و بنیادی فقہی نکتہ:</span>
              </span>
              <span className="text-[11px] font-nastaliq text-stone-600 dark:text-stone-300 font-medium">
                اصولِ فقہ و قواعدِ کلیہ کی روشنی میں
              </span>
            </div>
            <h4 className="font-nastaliq font-bold text-sm sm:text-base text-stone-950 dark:text-stone-100 pr-1 leading-relaxed">
              {data.issueTitle}
            </h4>
            <p className="font-nastaliq text-xs sm:text-sm text-stone-900 dark:text-stone-200 pr-1 leading-[2.3] bg-stone-100/90 dark:bg-slate-700/50 p-2.5 rounded-lg border border-stone-200 dark:border-slate-600 font-medium">
              {data.coreConflict}
            </p>
          </div>

          {/* Quick Madhhab Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-200/70 text-xs font-nastaliq">
            <span className="text-[11px] font-bold text-emerald-950 px-2">مذہب منتخب کریں:</span>
            
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-emerald-100/70 border border-emerald-200'
              }`}
            >
              چاروں مذاہب (اکٹھے)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hanafi')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'hanafi'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white text-emerald-900 hover:bg-emerald-100/70 border border-emerald-300'
              }`}
            >
              ۱. احناف (الحنفیۃ)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shafii')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'shafii'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-white text-blue-900 hover:bg-blue-100/70 border border-blue-300'
              }`}
            >
              ۲. شوافع (الشافعیۃ)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('maliki')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'maliki'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-white text-amber-900 hover:bg-amber-100/70 border border-amber-300'
              }`}
            >
              ۳. مالکیہ (المالکیۃ)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hanbali')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'hanbali'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'bg-white text-purple-900 hover:bg-purple-100/70 border border-purple-300'
              }`}
            >
              ۴. حنابلہ (الحنابلۃ)
            </button>
          </div>

          {/* 3. Comparative School Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSchools.map((school, sIdx) => {
              return (
                <div
                  key={sIdx}
                  className={`rounded-2xl p-4 border-2 shadow-2xs transition-all space-y-3 flex flex-col justify-between ${school.bgColor} ${school.borderColor}`}
                >
                  <div className="space-y-2.5">
                    {/* Card Top Banner */}
                    <div className="flex items-center justify-between border-b border-black/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-nastaliq shadow-2xs text-white ${
                          school.madhhab === 'hanafi'
                            ? 'bg-emerald-800'
                            : school.madhhab === 'shafii'
                              ? 'bg-blue-800'
                              : school.madhhab === 'maliki'
                                ? 'bg-amber-800'
                                : 'bg-purple-800'
                        }`}>
                          {school.schoolNameUrdu}
                        </span>
                        <span className="text-[10px] font-nastaliq text-stone-500 hidden sm:inline-block">
                          {school.imams}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(school)}
                          className="flex items-center gap-1 text-[11px] font-nastaliq text-stone-500 hover:text-stone-900 px-2 py-0.5 rounded-md hover:bg-white/60 transition cursor-pointer"
                          title="یہ فقہی موقف نقل کریں"
                        >
                          {copiedSchool === school.madhhab ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">کاپی ہو گیا!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-stone-400" />
                              <span>کاپی کریں</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareSchool(school)}
                          className="flex items-center gap-1 text-[11px] font-nastaliq text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 px-2 py-0.5 rounded-md hover:bg-white/60 transition cursor-pointer"
                          title="یہ فقہی موقف سوشل ایپس پر شیئر کریں"
                        >
                          <Share2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                          <span>شیئر</span>
                        </button>
                      </div>
                    </div>

                    {/* Section 1: شرعی حکم و فتویٰ */}
                    <div className="bg-white/95 dark:bg-slate-800/95 p-3 rounded-xl border border-stone-200 dark:border-slate-700 space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1 text-[11px] font-bold font-nastaliq text-stone-900 dark:text-stone-100">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>مذہب کے مطابق معتمد شرعی حکم:</span>
                      </div>
                      <p className="font-nastaliq text-xs sm:text-sm text-stone-950 dark:text-stone-100 leading-[2.3] pr-1 font-medium">
                        {school.ruling}
                      </p>
                    </div>

                    {/* Section 2: دلائل و اصولی استدلال */}
                    <div className="bg-white/95 dark:bg-slate-800/95 p-3 rounded-xl border border-stone-200 dark:border-slate-700 space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1 text-[11px] font-bold font-nastaliq text-stone-900 dark:text-stone-100">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>اصولی دلیل، قیاس و وجہِ استدلال:</span>
                      </div>
                      <p className="font-nastaliq text-xs sm:text-sm text-stone-950 dark:text-stone-100 leading-[2.3] pr-1 font-medium">
                        {school.dalailAndUsul}
                      </p>
                      {school.quranSunnahQuote && (
                        <div 
                          className="mt-2 p-2 bg-stone-100 dark:bg-slate-900/80 rounded-lg border border-stone-200 dark:border-slate-700 text-right select-text font-arabic text-stone-950 dark:text-amber-200 text-xs sm:text-sm leading-relaxed font-semibold"
                          style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
                        >
                          {school.quranSunnahQuote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Synthesis & Reconciliatory Summary (خلاصۂ تطبیق و ترجیح) */}
          {data.synthesisNote && (
            <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/50 rounded-2xl p-4 border-2 border-amber-400/80 dark:border-amber-600 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-amber-200/70 dark:border-amber-700 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    ⚖️
                  </div>
                  <h4 className="font-bold font-nastaliq text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                    باہمی تطبیق، اصولِ جمع اور درسی ترجیح (Synthesis & Scholarly Harmony):
                  </h4>
                </div>
                <span className="text-[10px] font-bold font-nastaliq text-amber-950 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
                  خلاصۂ فقہاء
                </span>
              </div>
              <p className="font-nastaliq text-xs sm:text-sm text-stone-950 dark:text-stone-100 leading-[2.3] pr-1 select-text font-medium">
                {data.synthesisNote}
              </p>
            </div>
          )}

        </div>
      )}

      {/* Social Share Modal for Comparative Fiqh */}
      {shareData && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareData(null);
          }}
          title={shareData.title}
          urduText={shareData.urdu}
          scholarlyNotes={shareData.notes}
          reference="مقارنہ بین المذاہب (المذاہب الأربعة: احناف، شوافع، مالکیہ، حنابلہ)"
          pageUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        />
      )}
    </div>
  );
};
