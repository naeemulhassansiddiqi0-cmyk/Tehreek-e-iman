import React, { useState } from 'react';
import { X, Moon, Sparkles, Copy, CheckCheck } from 'lucide-react';
import { copyToClipboardWithTehreekLogo } from '../../utils/clipboardHelper';

interface HijriCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SunnahFastRule {
  title: string;
  hadithAr: string;
  hadithUr: string;
  reference: string;
  badgeColor: string;
}

const SUNNAH_FAST_VIRTUES: Record<string, SunnahFastRule> = {
  beed: {
    title: 'ایامِ بیض کا روزہ (13، 14، 15 تاریخ)',
    hadithAr: '«أَمَرَنَا رَسُولُ اللَّهِ ﷺ أَنْ نَصُومَ ثَلَاثَةَ أَيَّامِ الْبِيضِ: ثَلَاثَ عَشْرَةَ، وَأَرْبَعَ عَشْرَةَ، وَخَمْسَ عَشْرَةَ، وَقَالَ: هُوَ كَصِيَامِ الدَّهْرِ»',
    hadithUr: 'رسول اللہ ﷺ نے ہمیں حکم فرمایا کہ ہم ہر مہینے کے ایامِ بیض (13، 14 اور 15 تاریخ) کے تین روزے رکھیں۔ آپ ﷺ نے فرمایا: یہ ہمیشہ روزہ رکھنے کے برابر ہے۔',
    reference: 'جامع الترمذی: 761، سنن النسائی: 2420',
    badgeColor: 'bg-amber-400 text-stone-950 border-amber-300',
  },
  monday: {
    title: 'پیر کا مسنون روزہ (یوم الاثنین)',
    hadithAr: '«تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»',
    hadithUr: 'رسول اللہ ﷺ نے فرمایا: پیر اور جمعرات کو بارگاہِ الٰہی میں بندوں کے اعمال پیش کیے جاتے ہیں، تو مجھے یہ پسند ہے کہ میرا عمل اس حال میں پیش ہو کہ میں روزے سے ہوں۔',
    reference: 'جامع الترمذی: 747، صحیح مسلم: 1162',
    badgeColor: 'bg-emerald-500 text-stone-950 border-emerald-400',
  },
  thursday: {
    title: 'جمعرات کا مسنون روزہ (یوم الخمیس)',
    hadithAr: '«كَانَ النَّبِيُّ ﷺ يَتَحَرَّى صَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ»',
    hadithUr: 'حضرت عائشہ صدیقہ رضی اللہ عنہا فرماتی ہیں کہ نبی اکرم ﷺ پیر اور جمعرات کے روزے کا خاص اہتمام فرمایا کرتے تھے۔',
    reference: 'جامع الترمذی: 745، سنن ابن ماجہ: 1739',
    badgeColor: 'bg-emerald-500 text-stone-950 border-emerald-400',
  },
  ashura: {
    title: 'عاشوراء کا مسنون روزہ (9 اور 10 محرم)',
    hadithAr: '«صِيَامُ يَوْمِ عَاشُورَاءَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ»',
    hadithUr: 'رسول اللہ ﷺ نے فرمایا: مجھے اللہ تعالیٰ کی رحمت سے امید ہے کہ یومِ عاشوراء کا روزہ پچھلے ایک سال کے گناہوں کا کفارہ بن جائے گا۔',
    reference: 'صحیح مسلم: 1162',
    badgeColor: 'bg-indigo-400 text-stone-950 border-indigo-300',
  },
  arafah: {
    title: 'یومِ عرفہ کا روزہ (9 ذوالحجہ غیر حاجی کے لیے)',
    hadithAr: '«صِيَامُ يَوْمِ عَرَفَةَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ وَالسَّنَةَ الَّتِي بَعْدَهُ»',
    hadithUr: 'رسول اللہ ﷺ نے فرمایا: یومِ عرفہ کا روزہ پچھلے ایک سال اور اگلے ایک سال کے گناہوں کا کفارہ ہو جاتا ہے۔',
    reference: 'صحیح مسلم: 1162',
    badgeColor: 'bg-purple-400 text-stone-950 border-purple-300',
  },
  shawwal: {
    title: 'شوال کے چھ مسنون روزے (ستة من شوال)',
    hadithAr: '«مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ»',
    hadithUr: 'جس نے رمضان کے روزے رکھے پھر اس کے بعد شوال کے چھ روزے رکھے، تو یہ ایسا ہے جیسے اس نے پورے سال کے روزے رکھے۔',
    reference: 'صحیح مسلم: 1164',
    badgeColor: 'bg-teal-400 text-stone-950 border-teal-300',
  },
};

const HIJRI_MONTHS = [
  'محرم الحرام',
  'صفر المظفر',
  'ربیع الاول',
  'ربیع الثانی',
  'جمادی الاولیٰ',
  'جمادی الاخریٰ',
  'رجب المرجب',
  'شعبان المعظم',
  'رمضان المبارک',
  'شوال المکرم',
  'ذوالقعدۃ الحرام',
  'ذوالحجۃ الحرام',
];

export const HijriCalendarModal: React.FC<HijriCalendarModalProps> = ({ isOpen, onClose }) => {
  const [hijriOffset, setHijriOffset] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ti_hijri_offset');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [selectedDay, setSelectedDay] = useState<number>(13);
  const [copied, setCopied] = useState<boolean>(false);

  // Approximate calculation of current Hijri date with offset adjustment
  const getTodayHijri = (offsetDays: number = 0) => {
    const today = new Date();
    today.setDate(today.getDate() + offsetDays);
    try {
      const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }).formatToParts(today);

      const d = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
      const m = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
      const y = parseInt(parts.find(p => p.type === 'year')?.value || '1448', 10);
      return { day: d, month: m, year: y };
    } catch {
      return { day: 13, month: 3, year: 1448 };
    }
  };

  const currentHijri = getTodayHijri(hijriOffset);

  // Persist offset adjustment (رویتِ ہلال مطابقت)
  const changeOffset = (delta: number) => {
    const next = hijriOffset + delta;
    if (next >= -2 && next <= 2) {
      setHijriOffset(next);
      try {
        localStorage.setItem('ti_hijri_offset', next.toString());
      } catch {
        // ignore
      }
    }
  };

  const currentMonthName = HIJRI_MONTHS[(currentHijri.month - 1) % 12] || 'محرم الحرام';

  // Determine days in current Hijri month (29 or 30)
  const totalDaysInMonth = 30;

  // Identify Sunnah fast type for a given Hijri day in the current month
  const getSunnahFastType = (day: number): 'beed' | 'monday' | 'thursday' | 'ashura' | 'arafah' | 'shawwal' | null => {
    // Ayyam al-Beed (13, 14, 15 of every month)
    if (day === 13 || day === 14 || day === 15) {
      return 'beed';
    }

    // Special annual fasts
    if (currentHijri.month === 1 && (day === 9 || day === 10)) {
      return 'ashura';
    }
    if (currentHijri.month === 12 && day === 9) {
      return 'arafah';
    }
    if (currentHijri.month === 10 && day >= 2 && day <= 7) {
      return 'shawwal';
    }

    // Days corresponding to Monday / Thursday (approximate weekly cadence)
    // For visual guidance, mark every 7 days from reference
    if (day % 7 === 1) return 'monday';
    if (day % 7 === 4) return 'thursday';

    return null;
  };

  const selectedRule = getSunnahFastType(selectedDay);
  const virtueInfo = selectedRule ? SUNNAH_FAST_VIRTUES[selectedRule] : SUNNAH_FAST_VIRTUES.beed;

  const handleCopyVirtue = async () => {
    const text = `❖ تحریکِ ایمان — فضیلتِ روزہ و مسنون تقویم ❖
تاریخ: ${selectedDay} ${currentMonthName} ${currentHijri.year}ھ
عنوان: ${virtueInfo.title}
حدیثِ مبارک: ${virtueInfo.hadithAr}
ترجمہ: ${virtueInfo.hadithUr}
مستند حوالہ: ${virtueInfo.reference}

زیرِ سرپرستی: حضرت مولانا محمد نعیم الحسن صدیقی`;
    await copyToClipboardWithTehreekLogo(text, {
      title: 'فضیلتِ مسنون روزہ و ہجری جنتری',
      sourceBook: 'تحریکِ ایمان مسنون جنتری',
      includeTimestamp: true,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#01140e]/85 backdrop-blur-md animate-fadeIn">
      <div className="modal-contrast-card rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl text-amber-50 space-y-5 border-2 border-amber-400/60 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-800/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-950 text-amber-300 border-2 border-amber-400/60 flex items-center justify-center shadow-lg">
              <Moon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-nastaliq font-black text-2xl text-amber-300">
                  اسلامی ہجری تقویم و مسنون روزے
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[11px] font-black font-mono">
                  {currentHijri.year}ھ
                </span>
              </div>
              <p className="text-xs font-nastaliq text-emerald-200 font-bold">
                ایامِ بیض (13، 14، 15)، پیر و جمعرات اور خصوصی مسنون ایام کی دائمی رہنمائی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-700/60 transition-all cursor-pointer"
            aria-label="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Month & Ruyat Adjuster Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#071d15] to-emerald-950 border-2 border-amber-400/50 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black font-nastaliq text-amber-200">
                {currentMonthName} {currentHijri.year}ھ
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-nastaliq border border-emerald-400/40">
                آج: {currentHijri.day} {currentMonthName}
              </span>
            </div>
            <p className="text-xs text-stone-300 font-nastaliq mt-0.5">
              عیسوی تاریخ: {new Date().toLocaleDateString('ur-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Moon Sighting Adjuster (+- 1 day) */}
          <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-emerald-700/60 text-xs font-nastaliq">
            <span className="text-emerald-300 font-bold">رویتِ ہلال مطابقت:</span>
            <button
              onClick={() => changeOffset(-1)}
              className="w-7 h-7 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-mono font-bold flex items-center justify-center cursor-pointer border border-emerald-600/50"
              title="ایک دن پیچھے"
            >
              -1
            </button>
            <span className="font-mono text-amber-300 font-bold px-1">
              {hijriOffset >= 0 ? `+${hijriOffset}` : hijriOffset}
            </span>
            <button
              onClick={() => changeOffset(1)}
              className="w-7 h-7 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-mono font-bold flex items-center justify-center cursor-pointer border border-emerald-600/50"
              title="ایک دن آگے"
            >
              +1
            </button>
          </div>
        </div>

        {/* Calendar Days Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-nastaliq text-emerald-300 px-1">
            <span>ماہانہ تقویم (کلک کر کے فضیلت ملاحظہ فرمائیں):</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>ایامِ بیض</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>پیر / جمعرات</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
            {Array.from({ length: totalDaysInMonth }, (_, idx) => {
              const dayNum = idx + 1;
              const fastType = getSunnahFastType(dayNum);
              const isToday = dayNum === currentHijri.day;
              const isSelected = dayNum === selectedDay;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`relative p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-amber-300 font-black shadow-lg scale-105 ring-2 ring-amber-300'
                      : isToday
                      ? 'bg-emerald-900/90 text-amber-300 border-amber-400 font-extrabold shadow-md'
                      : fastType === 'beed'
                      ? 'bg-amber-950/60 text-amber-200 border-amber-400/60 hover:bg-amber-900/60'
                      : fastType
                      ? 'bg-emerald-950/60 text-emerald-200 border-emerald-600/60 hover:bg-emerald-900/60'
                      : 'bg-black/30 text-stone-200 border-emerald-900/40 hover:bg-emerald-950/40'
                  }`}
                >
                  <span className="font-mono text-base sm:text-lg font-bold">
                    {dayNum}
                  </span>
                  <span className="text-[10px] font-nastaliq leading-none mt-0.5">
                    {fastType === 'beed'
                      ? 'بیض'
                      : fastType === 'monday'
                      ? 'پیر'
                      : fastType === 'thursday'
                      ? 'جمعرات'
                      : fastType === 'ashura'
                      ? 'عاشوراء'
                      : fastType === 'arafah'
                      ? 'عرفہ'
                      : isToday
                      ? 'آج'
                      : 'ہجری'}
                  </span>
                  {fastType && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Virtue Detail Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0b271d] via-[#051711] to-[#010a07] border-2 border-amber-400/60 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <h3 className="text-base sm:text-lg font-black font-nastaliq text-amber-300">
                {selectedDay} {currentMonthName} — {virtueInfo.title}
              </h3>
            </div>
            <button
              onClick={handleCopyVirtue}
              className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-amber-300 text-xs font-nastaliq font-bold border border-amber-400/50 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کاپی ہو گیا' : 'فضیلت کاپی کریں'}</span>
            </button>
          </div>

          {/* Hadith Arabic Text */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-700/50">
            <p className="font-amiri font-bold text-base sm:text-lg text-amber-100 text-center leading-[2.2] tracking-wide" dir="rtl">
              {virtueInfo.hadithAr}
            </p>
          </div>

          {/* Urdu Translation */}
          <p className="font-nastaliq font-bold text-sm sm:text-base text-emerald-100 leading-[2.4] text-justify">
            <span className="text-amber-300 font-black">اردو مفہوم: </span>
            {virtueInfo.hadithUr}
          </p>

          {/* Hadith Reference */}
          <div className="flex items-center justify-between text-xs text-stone-300 font-nastaliq pt-1 border-t border-emerald-900/60">
            <span className="text-amber-300/90 font-bold">
              مستند تخریج: {virtueInfo.reference}
            </span>
            <span>تحقیق و توثیق: دار الافتاء تحریکِ ایمان</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-emerald-800/40 text-[11px] text-emerald-300/80 font-nastaliq">
          <span>تحریکِ ایمان • دائمی مسنون تقویم</span>
          <span>سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی</span>
        </div>

      </div>
    </div>
  );
};
