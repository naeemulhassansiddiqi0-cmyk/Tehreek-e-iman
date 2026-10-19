import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  Mic, 
  BookOpen, 
  Sparkles, 
  HeartHandshake, 
  Compass, 
  ChevronRight, 
  FileText
} from 'lucide-react';
import { 
  generateLectureSermon, 
  SermonGeneratorParams, 
  LectureSermonOutline 
} from '@/services/lectureSermonService';

interface LectureSermonModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: SermonGeneratorParams;
  bookTitle?: string;
}

type TabType = 'overview' | 'evidence' | 'takeaways' | 'conclusion' | 'full';

export const LectureSermonModal: React.FC<LectureSermonModalProps> = ({
  isOpen,
  onClose,
  params,
  bookTitle = 'کتب خانہ علومِ اسلامیہ'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState<boolean>(false);

  const outline: LectureSermonOutline = useMemo(() => {
    return generateLectureSermon(params);
  }, [params]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(outline.fullFormattedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🎙️ *${outline.topicTitle}*\n${outline.subTitle}\n\n` +
      `📖 *قرآنی آیت:*\n${outline.quranEvidences[0]?.arabic || ''}\n_${outline.quranEvidences[0]?.urdu || ''}_\n\n` +
      `💡 *اصلاحی نکات برائے عوام:*\n` +
      outline.practicalTakeaways.map(p => `• ${p.pointTitle}: ${p.actionItem}`).join('\n') +
      `\n\n🤲 *دعائے مسنونہ:*\n${outline.conclusionAndDua.arabicDua}\n\n🌐 تحریکِ ایمان اسلامی پورٹل • https://tehreek-e-iman.pages.dev`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl border-2 border-amber-400 dark:border-amber-600 overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header (Hidden in Print) */}
        <div className="no-print p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-[#0a3524] to-emerald-950 text-white border-b-2 border-amber-400 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            title="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="space-y-0.5 text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[11px] font-bold font-nastaliq px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  علمی معاون برائے ائمہ و خطباء کرام
                </span>
                <Mic className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-bold font-nastaliq text-base sm:text-xl text-amber-100 flex items-center gap-1.5 justify-end">
                <span>بیان و خطبہ کے نکات (Lecture & Sermon Generator)</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Action Toolbar & Navigation Tabs (Hidden in Print) */}
        <div className="no-print p-3 sm:p-4 bg-stone-100 dark:bg-slate-800/90 border-b border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-50'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>۱. تعارف و خطبۂ مسنونہ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'evidence'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>۲. قرآنی آیات و شواہد</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('takeaways')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'takeaways'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-50'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              <span>۳. اصلاحی و تربیتی نکات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('conclusion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'conclusion'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>۴. خلاصہ و دعائے مسنونہ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('full')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'full'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>📜 مکمل مسودہ</span>
            </button>
          </div>

          {/* Action Buttons: Copy, Print, WhatsApp */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-nastaliq font-bold text-xs shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="تمام نوٹس اور خطبے کا مسودہ کلپ بورڈ پر کاپی کریں"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کاپی ہو گیا!' : 'خطبہ کے نکات کاپی کریں'}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-nastaliq font-bold text-xs shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="واٹس ایپ پر شیئر کریں"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">واٹس ایپ شیئر</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-stone-50 text-stone-800 dark:text-stone-100 font-nastaliq font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
              title="منبر پر ہمراہ رکھنے کے لیے پرنٹ / PDF محفوظ کریں"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              <span className="hidden sm:inline">پرنٹ / PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div 
          id="tehreek-printable-sermon"
          className="print-clean-container flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-stone-900 dark:text-stone-100 bg-gradient-to-b from-stone-50/50 to-white dark:from-slate-900 dark:to-slate-950"
          dir="rtl"
        >
          {/* Printable Letterhead Banner */}
          <div className="border-b-2 border-emerald-700 dark:border-emerald-600 pb-4 text-center space-y-2">
            <p className="font-arabic text-lg sm:text-xl text-emerald-900 dark:text-emerald-300 font-bold">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h1 className="font-nastaliq text-xl sm:text-3xl font-extrabold text-emerald-950 dark:text-amber-200">
              {outline.topicTitle}
            </h1>
            <p className="font-nastaliq text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-semibold">
              {outline.subTitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-nastaliq text-stone-500 dark:text-stone-400">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-900 dark:text-emerald-300 font-bold">
                مرکزِ خطابت و دعوت • تحریکِ ایمان
              </span>
              <span>•</span>
              <span>ماخذ: {bookTitle}</span>
              {params.hadithNumber && (
                <>
                  <span>•</span>
                  <span>حدیث نمبر: {params.hadithNumber.toLocaleString('ur-PK')}</span>
                </>
              )}
            </div>
          </div>

          {/* TAB 1: OVERVIEW & MASNOON OPENING */}
          {(activeTab === 'overview' || activeTab === 'full') && (
            <div className="space-y-5">
              {/* 1. خطبۂ مسنونہ */}
              <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 sm:p-6 space-y-3 break-inside-avoid shadow-2xs">
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/50 pb-2">
                  <span className="text-xs font-bold font-nastaliq text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>خطبۂ مسنونہ (عربی کلماتِ افتتاح برائے منبر):</span>
                  </span>
                  <span className="text-[11px] font-nastaliq text-stone-500">منبر پر پڑھنے کے لیے</span>
                </div>
                <p 
                  className="font-arabic text-right leading-[2.5] text-stone-900 dark:text-stone-100 select-text font-semibold text-base sm:text-lg"
                  dir="rtl"
                  style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
                >
                  {outline.khutbahOpening}
                </p>
              </div>

              {/* 2. تمہید و پس منظر */}
              <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 break-inside-avoid shadow-xs">
                <h4 className="font-nastaliq text-base font-bold text-emerald-950 dark:text-emerald-300 border-b border-emerald-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>موضوع کا تعارف و درسی پس منظر (Introduction of the Topic):</span>
                </h4>

                <div className="space-y-3 font-nastaliq text-sm sm:text-base leading-[2.3]">
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200/80 dark:border-slate-700/80">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 block mb-1">
                      ❖ تمہیدِ خطابت (Hook & Attention Grabber):
                    </span>
                    <p className="text-stone-850 dark:text-stone-200 font-medium">
                      {outline.intro.hook}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200/80 dark:border-slate-700/80">
                    <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400 block mb-1">
                      ❖ تاریخی و روایتی پس منظر (Context & Sunnah Origin):
                    </span>
                    <p className="text-stone-850 dark:text-stone-200 font-medium">
                      {outline.intro.historicalContext}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200/80 dark:border-slate-700/80">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block mb-1">
                      ❖ دورِ حاضر میں معنویت (Modern Relevance):
                    </span>
                    <p className="text-stone-850 dark:text-stone-200 font-medium">
                      {outline.intro.relevanceToday}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE (QURAN & HADITH) */}
          {(activeTab === 'evidence' || activeTab === 'full') && (
            <div className="space-y-5">
              {/* Quranic Verses */}
              <div className="space-y-3.5">
                <h4 className="font-nastaliq text-base font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>قرآنی آیاتِ بینات (Core Quranic Evidences):</span>
                </h4>

                {outline.quranEvidences.map((q, idx) => (
                  <div 
                    key={idx}
                    className="bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 space-y-3 break-inside-avoid shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/50 pb-2">
                      <span className="text-xs font-bold font-nastaliq text-emerald-900 dark:text-emerald-300">
                        آیتِ مبارکہ {idx + 1}
                      </span>
                      <span className="text-xs font-bold font-nastaliq px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                        {q.surahRef}
                      </span>
                    </div>

                    <p 
                      className="font-arabic text-xl sm:text-2xl text-stone-900 dark:text-stone-100 text-right leading-[2.5] font-bold select-text"
                      dir="rtl"
                      style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
                    >
                      {q.arabic}
                    </p>

                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800/40 space-y-1">
                      <span className="text-xs font-bold font-nastaliq text-emerald-800 dark:text-emerald-400 block">
                        سلیس با محاورہ اردو ترجمہ:
                      </span>
                      <p className="font-nastaliq text-sm sm:text-base text-stone-850 dark:text-stone-200 leading-[2.3] font-semibold text-justify">
                        {q.urdu}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hadith Evidences */}
              <div className="space-y-3.5 pt-3">
                <h4 className="font-nastaliq text-base font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>احادیثِ طیبہ اور شواہدِ نبوی ﷺ (Hadith Evidences):</span>
                </h4>

                {outline.hadithEvidences.map((h, idx) => (
                  <div 
                    key={idx}
                    className="bg-amber-50/30 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 space-y-3 break-inside-avoid shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/50 pb-2">
                      <span className="text-xs font-bold font-nastaliq text-amber-900 dark:text-amber-300">
                        حدیثِ مبارک {idx + 1}
                      </span>
                      <span className="text-xs font-bold font-nastaliq px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        {h.ref}
                      </span>
                    </div>

                    <p 
                      className="font-arabic text-lg sm:text-xl text-stone-900 dark:text-stone-100 text-right leading-[2.4] font-bold select-text"
                      dir="rtl"
                      style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
                    >
                      {h.arabic}
                    </p>

                    <div className="pt-2 border-t border-amber-100 dark:border-amber-800/40 space-y-1">
                      <span className="text-xs font-bold font-nastaliq text-amber-800 dark:text-amber-400 block">
                        سلیس اردو ترجمہ:
                      </span>
                      <p className="font-nastaliq text-sm sm:text-base text-stone-850 dark:text-stone-200 leading-[2.3] font-semibold text-justify">
                        {h.urdu}
                      </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-xs sm:text-sm font-nastaliq text-stone-700 dark:text-stone-300">
                      <span className="font-bold text-amber-900 dark:text-amber-400">💡 نکتۂ خطابت و علمی استدلال: </span>
                      <span>{h.benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRACTICAL TAKEAWAYS FOR THE PUBLIC */}
          {(activeTab === 'takeaways' || activeTab === 'full') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-700 pb-2">
                <h4 className="font-nastaliq text-base font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>عوام الناس کے لیے اصلاحی اور تربیتی نکات (Practical Takeaways for the Public):</span>
                </h4>
                <span className="text-xs font-nastaliq text-stone-500">عملی نفاذ کے رہنما اصول</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {outline.practicalTakeaways.map((p, idx) => (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-slate-800 border-2 border-emerald-100 dark:border-slate-700 hover:border-emerald-300 rounded-2xl p-5 space-y-3 break-inside-avoid shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-emerald-800 text-amber-300 font-bold font-nastaliq text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h5 className="font-nastaliq font-bold text-base text-emerald-950 dark:text-amber-200">
                        {p.pointTitle}
                      </h5>
                    </div>

                    <p className="font-nastaliq text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-[2.3] pr-9 font-medium text-justify">
                      {p.explanation}
                    </p>

                    <div className="mr-9 p-3 rounded-xl bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-xs sm:text-sm font-nastaliq text-amber-950 dark:text-amber-300 flex items-start gap-2">
                      <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">🌱 عملی نسخہ (Action Item):</span>
                      <span className="font-semibold">{p.actionItem}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Speaker Advice Card */}
              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 sm:p-5 space-y-2 break-inside-avoid shadow-2xs">
                <span className="text-xs font-bold font-nastaliq text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
                  <span>خطیب و مربی کے لیے اہم ہدایاتِ خطابت:</span>
                </span>
                <ul className="space-y-1.5 font-nastaliq text-xs sm:text-sm text-stone-700 dark:text-stone-300 pr-2">
                  {outline.speakerGuidance.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: CONCLUSION & DUA */}
          {(activeTab === 'conclusion' || activeTab === 'full') && (
            <div className="space-y-5">
              {/* Summary */}
              <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl p-5 space-y-2 break-inside-avoid shadow-xs">
                <h4 className="font-nastaliq text-base font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-2 border-b border-stone-200 dark:border-slate-700 pb-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>خلاصۂ کلام و اختتامی نصیحت (Conclusion of Sermon):</span>
                </h4>
                <p className="font-nastaliq text-sm sm:text-base text-stone-850 dark:text-stone-200 leading-[2.4] font-medium text-justify">
                  {outline.conclusionAndDua.summary}
                </p>
              </div>

              {/* Masnoon Closing Dua */}
              <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-7 space-y-4 break-inside-avoid shadow-lg border-2 border-amber-400">
                <div className="flex items-center justify-between border-b border-emerald-700/80 pb-2">
                  <span className="font-nastaliq font-bold text-sm text-amber-200 flex items-center gap-1.5">
                    <span>🤲 دعائے مسنونہ (منبر و بیان کا دعائیہ اختتام)</span>
                  </span>
                  <span className="text-xs font-nastaliq text-emerald-200">کلماتِ دعا</span>
                </div>

                <p 
                  className="font-arabic text-xl sm:text-2xl text-amber-100 text-right leading-[2.6] font-bold select-text"
                  dir="rtl"
                  style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
                >
                  {outline.conclusionAndDua.arabicDua}
                </p>

                <div className="pt-2 border-t border-emerald-700/80 space-y-1">
                  <span className="text-xs font-bold font-nastaliq text-amber-300 block">
                    دعا کا سلیس اردو مفہوم:
                  </span>
                  <p className="font-nastaliq text-sm sm:text-base text-emerald-100 leading-[2.3] font-medium text-justify">
                    {outline.conclusionAndDua.urduDuaTranslation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Printable Document Footer */}
          <div className="pt-6 border-t-2 border-stone-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs font-nastaliq text-stone-500 dark:text-stone-400">
            <span>تحریکِ ایمان ڈیجیٹل پورٹل برائے علومِ اسلامیہ • https://tehreek-e-iman.pages.dev</span>
            <span>طبع شدہ تاریخ: {new Date().toLocaleDateString('ur-PK')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
