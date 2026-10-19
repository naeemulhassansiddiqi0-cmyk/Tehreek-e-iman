import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles, 
  Scroll, 
  Scale 
} from 'lucide-react';
import { TafseerEntry, formatTafseerCitation } from '../../services/tafseerService';

interface TafseerModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TafseerEntry | null;
}

type TafseerTab = 'ibnkathir' | 'jalalayn' | 'baydawi' | 'usmani';

export const TafseerModal: React.FC<TafseerModalProps> = ({
  isOpen,
  onClose,
  entry
}) => {
  const [activeTab, setActiveTab] = useState<TafseerTab>('ibnkathir');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !entry) return null;

  const handleCopyCitation = () => {
    const citation = formatTafseerCitation(entry, activeTab);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs: { id: TafseerTab; labelUrdu: string; labelArabic: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'ibnkathir',
      labelUrdu: 'تفسیر ابن کثیر',
      labelArabic: 'تَفْسِيرُ ابْنِ كَثِيرٍ',
      icon: <Scroll className="w-4 h-4 text-amber-600" />,
      desc: 'تفسیر بالماثور و احادیث'
    },
    {
      id: 'jalalayn',
      labelUrdu: 'تفسیر جلالین',
      labelArabic: 'تَفْسِيرُ الجَلَالَيْنِ',
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      desc: 'لغوی، نحوی و حلِ الفاظ'
    },
    {
      id: 'baydawi',
      labelUrdu: 'تفسیر بیضاوی',
      labelArabic: 'أَنْوَارُ التَّنْزِيلِ',
      icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
      desc: 'بلاغت، اعجاز و فلسفہ'
    },
    {
      id: 'usmani',
      labelUrdu: 'تفسیر عثمانی / معارف القرآن',
      labelArabic: 'مَعَارِفُ القُرْآنِ',
      icon: <Scale className="w-4 h-4 text-rose-600" />,
      desc: 'فقہی احکام و عصری تطبیق'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-6 flex items-center justify-between border-b border-emerald-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold font-nastaliq bg-amber-400 text-stone-950 shadow-xs">
                مستند تفاسیرِ قرآنیہ
              </span>
              <span className="text-xs font-nastaliq text-emerald-200">
                برائے علماء و طلبۂ درسِ نظامی
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold font-nastaliq text-amber-100 flex items-center gap-2">
              <span>{entry.surahNameUrdu} ({entry.surahNameArabic})</span>
              <span className="text-sm sm:text-base font-normal text-emerald-200 font-mono">
                • {entry.ayahRange} (رکوع {entry.rukuNumber})
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCitation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-bold font-nastaliq transition cursor-pointer border border-emerald-600/60 shadow-xs"
              title="تمام تفسیری متن مع مکمل حوالہ کاپی کریں"
            >
              {copied ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4 text-amber-300" />}
              <span>{copied ? 'حوالہ نقل ہو گیا' : 'حوالے کے ساتھ کاپی کریں'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="بند کریں"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ayah Matn Banner */}
        <div className="bg-amber-50/70 border-b border-amber-200/80 p-4 space-y-2 max-h-36 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-bold font-nastaliq text-amber-950">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>متنِ قرآنِ کریم (کلامِ الٰہی):</span>
            </span>
            <span className="text-[11px] text-stone-500 font-mono">
              سورة {entry.surahNumber} • {entry.ayahRange}
            </span>
          </div>
          <p className="font-arabic text-stone-900 text-right leading-loose text-base sm:text-lg select-text">
            {entry.arabicMatn}
          </p>
          <p className="font-nastaliq text-emerald-950 text-right text-xs sm:text-sm leading-relaxed border-t border-amber-200/60 pt-1.5 select-text">
            <span className="font-bold text-emerald-900">ترجمہ: </span>
            {entry.urduTranslation}
          </p>
        </div>

        {/* Tafseer Nav Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-stone-100 border-b border-stone-200 p-1.5 gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl text-center transition cursor-pointer border ${
                  isActive
                    ? 'bg-white text-stone-900 border-emerald-600 shadow-sm ring-2 ring-emerald-600/20'
                    : 'bg-stone-50 hover:bg-white text-stone-600 border-transparent hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {tab.icon}
                  <span className="font-bold font-nastaliq text-xs sm:text-sm">
                    {tab.labelUrdu}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-nastaliq mt-0.5">
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-right select-text custom-scrollbar">
          {activeTab === 'ibnkathir' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-amber-50/50 rounded-2xl p-4 sm:p-5 border border-amber-200/70 space-y-2">
                <div className="flex items-center gap-2 text-amber-950 border-b border-amber-200 pb-2">
                  <Scroll className="w-4 h-4 text-amber-700" />
                  <h3 className="font-bold font-nastaliq text-sm sm:text-base">
                    {entry.ibnKathir.title}
                  </h3>
                </div>
                <div className="text-stone-800 font-nastaliq text-xs sm:text-sm leading-loose whitespace-pre-line pr-1">
                  {entry.ibnKathir.commentary}
                </div>
              </div>

              <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200/60 space-y-2">
                <h4 className="font-bold font-nastaliq text-xs sm:text-sm text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>درسی تشریح و فہمِ سلف:</span>
                </h4>
                <p className="text-stone-700 font-nastaliq text-xs sm:text-sm leading-loose pr-2">
                  {entry.ibnKathir.tashreeh}
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-xs font-nastaliq text-stone-600 space-y-1">
                <span className="font-bold text-stone-800">مستند تخریج و ماخذ: </span>
                <span>{entry.ibnKathir.hadithTakhrij}</span>
              </div>
            </div>
          )}

          {activeTab === 'jalalayn' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2 text-emerald-950">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-bold font-nastaliq text-sm sm:text-base">
                      {entry.jalalayn.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 font-nastaliq bg-emerald-100 px-2 py-0.5 rounded-lg">
                    متنِ عربی مع حاشیہ
                  </span>
                </div>
                <p className="font-arabic text-stone-900 text-base sm:text-lg leading-loose pr-1 text-right">
                  {entry.jalalayn.arabicTafseer}
                </p>
              </div>

              <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200/60 space-y-1.5">
                <h4 className="font-bold font-nastaliq text-xs sm:text-sm text-amber-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  <span>اردو ترجمہ و درسی تشریح (وفاق المدارس نصاب):</span>
                </h4>
                <p className="text-stone-800 font-nastaliq text-xs sm:text-sm leading-loose pr-2">
                  {entry.jalalayn.urduTafseer}
                </p>
              </div>

              <div className="bg-indigo-50/40 rounded-2xl p-4 border border-indigo-200/60 space-y-1.5">
                <h4 className="font-bold font-nastaliq text-xs sm:text-sm text-indigo-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>نحوی ترکیب، محذوفات اور بلاغی دقائق:</span>
                </h4>
                <p className="text-stone-700 font-nastaliq text-xs sm:text-sm leading-loose pr-2">
                  {entry.jalalayn.nahwBalaghah}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'baydawi' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-indigo-50/40 rounded-2xl p-4 sm:p-5 border border-indigo-200/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 border-b border-indigo-200 pb-2">
                  <Sparkles className="w-4 h-4 text-indigo-700" />
                  <h3 className="font-bold font-nastaliq text-sm sm:text-base">
                    {entry.baydawi.title}
                  </h3>
                </div>
                <div className="text-stone-800 font-nastaliq text-xs sm:text-sm leading-loose whitespace-pre-line pr-1">
                  {entry.baydawi.commentary}
                </div>
              </div>

              <div className="bg-purple-50/40 rounded-2xl p-4 border border-purple-200/60 space-y-1.5">
                <h4 className="font-bold font-nastaliq text-xs sm:text-sm text-purple-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>اسرارِ بلاغت، مجاز و استعارہ (علم المعانی و البیان):</span>
                </h4>
                <p className="text-stone-800 font-nastaliq text-xs sm:text-sm leading-loose pr-2">
                  {entry.baydawi.balaghah}
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-1.5">
                <h4 className="font-bold font-nastaliq text-xs sm:text-sm text-stone-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stone-600"></span>
                  <span>اعجازِ لسانی و دقائقِ اعراب:</span>
                </h4>
                <p className="text-stone-700 font-nastaliq text-xs sm:text-sm leading-loose pr-2">
                  {entry.baydawi.linguisticMiracle}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'usmani' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-rose-50/40 rounded-2xl p-4 sm:p-5 border border-rose-200/80 space-y-2">
                <div className="flex items-center gap-2 text-rose-950 border-b border-rose-200 pb-2">
                  <Scale className="w-4 h-4 text-rose-700" />
                  <h3 className="font-bold font-nastaliq text-sm sm:text-base">
                    {entry.usmani.title}
                  </h3>
                </div>
                <div className="text-stone-800 font-nastaliq text-xs sm:text-sm leading-loose whitespace-pre-line pr-1">
                  {entry.usmani.commentary}
                </div>
              </div>

              <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200/60 space-y-1.5">
                <h4 className="font-bold font-nastaliq text-xs sm:text-sm text-amber-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  <span>فقہی و کلامی استنباط (مذاہبِ اربعہ):</span>
                </h4>
                <div className="text-stone-800 font-nastaliq text-xs sm:text-sm leading-loose whitespace-pre-line pr-2">
                  {entry.usmani.fiqhiPoints}
                </div>
              </div>

              <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200/60 space-y-1.5">
                <h4 className="font-bold font-nastaliq text-xs sm:text-sm text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>عصری معنویت و اجتماعی اسباق:</span>
                </h4>
                <p className="text-stone-700 font-nastaliq text-xs sm:text-sm leading-loose pr-2">
                  {entry.usmani.modernContext}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100 p-3 sm:p-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-nastaliq text-stone-500">
            <span>تحریکِ ایمان اسلامی پورٹل • مصدقہ درسی ذخیرہ تفاسیر</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCitation}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'کاپی ہو گیا' : 'حوالے کے ساتھ کاپی کریں'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer border border-gray-300"
            >
              بند کریں
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
