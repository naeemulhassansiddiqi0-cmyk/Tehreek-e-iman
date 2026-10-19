import React, { useState } from 'react';
import { TarjamahBabInfo } from '../../services/bukhariTarajimService';
import { BookOpen, Scale, Sparkles, ChevronDown, ChevronUp, GraduationCap, Quote } from 'lucide-react';

interface BukhariTarajimBoxProps {
  tarjamah: TarjamahBabInfo;
}

export const BukhariTarajimBox: React.FC<BukhariTarajimBoxProps> = ({ tarjamah }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!tarjamah) return null;

  return (
    <div 
      className="bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/60 rounded-2xl border-2 border-amber-500/40 shadow-sm p-4 sm:p-5 space-y-3.5 text-right transition-all my-3"
      dir="rtl"
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-stone-950 flex items-center justify-center shadow-xs shrink-0">
            <Scale className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold font-nastaliq text-base sm:text-lg text-emerald-950 flex items-center gap-1.5">
                <span>ترجمۃ الباب کا فقہی خلاصہ</span>
                <span className="text-amber-800 font-extrabold">(فقه البخاری)</span>
              </h3>
              <span className="text-[11px] font-bold font-nastaliq text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300/60">
                خاص برائے طلبۂ درسِ نظامی
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 font-nastaliq mt-0.5">
              تحلیلِ مقصدِ ترجمہ، استنباطاتِ ائمہ و توجیہاتِ شارحین
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-amber-50 border border-amber-300/80 text-amber-900 text-xs font-bold font-nastaliq shadow-2xs transition-all cursor-pointer"
        >
          <span>{isExpanded ? 'خلاصہ چھپائیں' : 'تفصیلی خلاصہ دیکھیں'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Content (Collapsible) */}
      {isExpanded && (
        <div className="space-y-3 text-xs sm:text-sm animate-fadeIn">
          
          {/* 1. مقصدِ ترجمۃ الباب */}
          <div className="bg-white/90 rounded-xl p-3.5 border border-amber-200/60 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold font-nastaliq text-emerald-900 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>امام بخاری رحمہ اللہ کا مقصدِ ترجمہ و ربطِ باب:</span>
            </div>
            <p className="font-nastaliq text-stone-700 leading-loose text-justify text-xs sm:text-sm pr-1">
              {tarjamah.maqsadTarjamah}
            </p>
          </div>

          {/* 2. فقہی استنباط و درسی نکتہ */}
          <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold font-nastaliq text-emerald-950 text-xs sm:text-sm">
              <BookOpen className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>فقہی استنباط و درسی نکتہ (طلبۂ دورۂ حدیث کے لیے):</span>
            </div>
            <p className="font-nastaliq text-emerald-950 leading-loose text-justify text-xs sm:text-sm pr-1">
              {tarjamah.fiqhiIstinbat}
            </p>
          </div>

          {/* 3. شارحینِ بخاری کے ارشادات */}
          {tarjamah.muhadditheenAqwal && (
            <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 space-y-1">
              <div className="flex items-center gap-1.5 font-bold font-nastaliq text-amber-950 text-xs">
                <Quote className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>شارحینِ صحیح بخاری کے ارشادات (فتح الباری / فیض الباری / عمدۃ القاری):</span>
              </div>
              <p className="font-nastaliq text-stone-700 leading-relaxed text-xs pr-1">
                {tarjamah.muhadditheenAqwal}
              </p>
            </div>
          )}

          {/* 4. امتحانی فائدہ */}
          {tarjamah.darsiFaida && (
            <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70 flex items-start gap-2 text-xs">
              <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="font-nastaliq text-stone-600 leading-relaxed">
                <strong className="text-emerald-950 font-bold ml-1">امتحانی اشارہ:</strong>
                {tarjamah.darsiFaida}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
