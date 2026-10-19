import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sliders
} from 'lucide-react';

export interface PageExportData {
  bookTitle: string;
  bookAuthor?: string;
  bookCategory?: string;
  bookSlug: string;
  pageNumber: number;
  totalSections: number;
  chapterTitleAr?: string;
  chapterTitleUr?: string;
  referenceUrl: string;
  isHadith?: boolean;
  hadiths?: {
    hadithNum: number;
    arabicText: string;
    urduText?: string;
    tashreeh?: string;
  }[];
  arabicMatn?: string;
  urduTranslation?: string;
  tashreeh?: string;
  iraab?: string[] | string;
  hawashi?: string[] | string;
  studentNotes?: string;
}

interface PageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportData: PageExportData;
  userName?: string;
}

export const PageExportModal: React.FC<PageExportModalProps> = ({
  isOpen,
  onClose,
  exportData,
  userName = 'حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ'
}) => {
  const [includeArabic, setIncludeArabic] = useState<boolean>(true);
  const [includeUrdu, setIncludeUrdu] = useState<boolean>(true);
  const [includeTashreeh, setIncludeTashreeh] = useState<boolean>(true);
  const [includeIraab, setIncludeIraab] = useState<boolean>(true);
  const [includeHawashi, setIncludeHawashi] = useState<boolean>(true);
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const {
    bookTitle,
    bookAuthor,
    bookCategory,
    bookSlug,
    pageNumber,
    totalSections,
    chapterTitleAr,
    chapterTitleUr,
    referenceUrl,
    isHadith,
    hadiths,
    arabicMatn,
    urduTranslation,
    tashreeh,
    iraab,
    hawashi,
    studentNotes
  } = exportData;

  const normalizedIraab: string[] = Array.isArray(iraab) 
    ? iraab 
    : (typeof iraab === 'string' && iraab ? [iraab] : []);

  const normalizedHawashi: string[] = Array.isArray(hawashi) 
    ? hawashi 
    : (typeof hawashi === 'string' && hawashi ? [hawashi] : []);

  // Generate formatted plain-text document for .txt download and clipboard
  const generateDocumentText = (): string => {
    let doc = `========================================================================\n`;
    doc += `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n`;
    doc += `تحریکِ ایمان ڈیجیٹل کتب خانہ و پورٹلِ علومِ اسلامیہ\n`;
    doc += `سرپرست: ${userName}\n`;
    doc += `========================================================================\n\n`;

    doc += `📚 کتاب: ${bookTitle}\n`;
    if (bookAuthor) doc += `✍️ مصنف: ${bookAuthor}\n`;
    if (bookCategory) doc += `📂 موضوع: ${bookCategory}\n`;
    doc += `📄 صفحہ نمبر: ${pageNumber.toLocaleString('ur-PK')} از ${totalSections.toLocaleString('ur-PK')}\n`;
    if (chapterTitleAr || chapterTitleUr) {
      doc += `📖 باب: ${chapterTitleAr || ''} ${chapterTitleUr ? `(${chapterTitleUr})` : ''}\n`;
    }
    doc += `🌐 آن لائن ربط: ${referenceUrl}\n`;
    doc += `------------------------------------------------------------------------\n\n`;

    // If Hadith book with multiple Hadiths on page
    if (isHadith && hadiths && hadiths.length > 0) {
      hadiths.forEach((h) => {
        doc += `【حدیث شریف نمبر: ${h.hadithNum.toLocaleString('ur-PK')}】\n`;
        if (includeArabic && h.arabicText) {
          doc += `[عربی متن]:\n${h.arabicText}\n\n`;
        }
        if (includeUrdu && h.urduText) {
          doc += `[سلیس اردو ترجمہ]:\n${h.urduText}\n\n`;
        }
        if (includeTashreeh && h.tashreeh) {
          doc += `[درسی تشریح و فقہی فوائد]:\n${h.tashreeh}\n\n`;
        }
        doc += `------------------------------------------------------------------------\n\n`;
      });
    } else {
      // Single Dars / classical page
      if (includeArabic && arabicMatn) {
        doc += `【متنِ کتاب (عربی)】:\n${arabicMatn}\n\n`;
      }
      if (includeUrdu && urduTranslation) {
        doc += `【سلیس اردو ترجمہ】:\n${urduTranslation}\n\n`;
      }
      if (includeTashreeh && tashreeh) {
        doc += `【جامع درسی تشریح و مفہوم】:\n${tashreeh}\n\n`;
      }
      if (includeIraab && normalizedIraab.length > 0) {
        doc += `【جدولِ اعراب و نحوی ترکیب】:\n`;
        normalizedIraab.forEach((item) => {
          doc += `• ${item}\n`;
        });
        doc += `\n`;
      }
      if (includeHawashi && normalizedHawashi.length > 0) {
        doc += `【حواشی و علمی نکات】:\n`;
        normalizedHawashi.forEach((h) => {
          doc += `• ${h}\n`;
        });
        doc += `\n`;
      }
    }

    if (includeNotes && studentNotes) {
      doc += `【طالبِ علم کے ذاتی علمی نوٹس】:\n${studentNotes}\n\n`;
    }

    doc += `========================================================================\n`;
    doc += `طبع شدہ بذریعہ تحریکِ ایمان اسلامی پورٹل • https://tehreek-e-iman.pages.dev\n`;
    doc += `حقوقِ اشاعت: پبلک ڈومین / عامۃ المسلمین کے دینی و علمی استفادہ کے لیے وقف\n`;
    doc += `تاریخِ برآمدگی: ${new Date().toLocaleDateString('ur-PK')}\n`;
    doc += `========================================================================\n`;

    return doc;
  };

  // Download .txt file with UTF-8 BOM so Urdu Nastaliq displays perfectly in Notepad
  const handleDownloadTxt = () => {
    const text = generateDocumentText();
    const bom = '\uFEFF'; // UTF-8 Byte Order Mark
    const blob = new Blob([bom + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bookSlug}_page_${pageNumber}_dars.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy plain text
  const handleCopyText = async () => {
    const text = generateDocumentText();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Trigger Print / PDF Export
  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border-2 border-emerald-300 dark:border-emerald-700 overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header (Hidden in Print) */}
        <div className="no-print p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-[#0a2f20] to-emerald-950 text-white border-b-2 border-amber-400 flex items-center justify-between">
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
                <span className="text-[11px] font-bold font-nastaliq px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  آف لائن برآمدگی و پی ڈی ایف
                </span>
                <Printer className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-bold font-nastaliq text-base sm:text-lg text-amber-100">
                ڈاؤن لوڈ / پی ڈی ایف ایکسپورٹ مرکز: {bookTitle}
              </h3>
            </div>
          </div>
        </div>

        {/* Action Controls & Checkbox Options (Hidden in Print) */}
        <div className="no-print p-4 sm:p-5 bg-stone-100 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-nastaliq font-bold text-stone-700 dark:text-stone-300">
              <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>ایکسپورٹ اور فائل میں شامل کیے جانے والے اجزاء منتخب کریں:</span>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-nastaliq font-bold text-xs sm:text-sm shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="بروزر پرنٹ کے ذریعے پی ڈی ایف فائل محفوظ کریں"
              >
                <Printer className="w-4 h-4" />
                <span>پرنٹ / PDF محفوظ کریں</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-nastaliq font-bold text-xs sm:text-sm shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="آف لائن مطالعہ کے لیے متنی فائل (.txt) ڈاؤن لوڈ کریں"
              >
                <Download className="w-4 h-4" />
                <span>ڈاؤنلوڈ فائل (.txt)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-stone-700 dark:text-stone-200 font-nastaliq font-bold text-xs hover:border-emerald-600 transition cursor-pointer flex items-center gap-1.5"
                title="پورا درسی متن کلپ بورڈ پر نقل کریں"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'کاپی ہو گیا' : 'متن کاپی کریں'}</span>
              </button>
            </div>
          </div>

          {/* Toggle Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-nastaliq font-bold text-stone-800 dark:text-stone-200">
            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-700/60 p-2 rounded-xl border border-gray-200 dark:border-slate-600">
              <input 
                type="checkbox" 
                checked={includeArabic} 
                onChange={(e) => setIncludeArabic(e.target.checked)} 
                className="accent-emerald-700 w-4 h-4" 
              />
              <span>عربی متن</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-700/60 p-2 rounded-xl border border-gray-200 dark:border-slate-600">
              <input 
                type="checkbox" 
                checked={includeUrdu} 
                onChange={(e) => setIncludeUrdu(e.target.checked)} 
                className="accent-emerald-700 w-4 h-4" 
              />
              <span>اردو ترجمہ</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-700/60 p-2 rounded-xl border border-gray-200 dark:border-slate-600">
              <input 
                type="checkbox" 
                checked={includeTashreeh} 
                onChange={(e) => setIncludeTashreeh(e.target.checked)} 
                className="accent-emerald-700 w-4 h-4" 
              />
              <span>درسی تشریح</span>
            </label>

            {iraab && iraab.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-700/60 p-2 rounded-xl border border-gray-200 dark:border-slate-600">
                <input 
                  type="checkbox" 
                  checked={includeIraab} 
                  onChange={(e) => setIncludeIraab(e.target.checked)} 
                  className="accent-emerald-700 w-4 h-4" 
                />
                <span>اعراب و نحو</span>
              </label>
            )}

            {hawashi && hawashi.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-700/60 p-2 rounded-xl border border-gray-200 dark:border-slate-600">
                <input 
                  type="checkbox" 
                  checked={includeHawashi} 
                  onChange={(e) => setIncludeHawashi(e.target.checked)} 
                  className="accent-emerald-700 w-4 h-4" 
                />
                <span>حواشی و مراجع</span>
              </label>
            )}

            {studentNotes && (
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-700/60 p-2 rounded-xl border border-gray-200 dark:border-slate-600">
                <input 
                  type="checkbox" 
                  checked={includeNotes} 
                  onChange={(e) => setIncludeNotes(e.target.checked)} 
                  className="accent-emerald-700 w-4 h-4" 
                />
                <span>ذاتی نوٹس</span>
              </label>
            )}
          </div>
        </div>

        {/* Live Printable Document Preview (This is styled during window.print()) */}
        <div 
          id="tehreek-printable-document" 
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-stone-900 space-y-6 print-clean-container"
          dir="rtl"
        >
          {/* Printable Letterhead Header */}
          <div className="border-b-2 border-emerald-900/60 pb-6 text-center space-y-2">
            <p className="font-arabic text-emerald-900 text-lg font-bold">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <div className="flex items-center justify-between gap-4">
              <div className="text-right space-y-1">
                <h1 className="text-xl sm:text-2xl font-black font-nastaliq text-emerald-900">
                  تحریکِ ایمان ڈیجیٹل کتب خانہ
                </h1>
                <p className="text-xs font-nastaliq text-stone-600">
                  سرپرستیِ عالیہ: {userName}
                </p>
              </div>

              <div className="text-left space-y-0.5 text-xs font-nastaliq text-stone-500">
                <div>کتاب: <strong className="text-stone-800">{bookTitle}</strong></div>
                <div>صفحہ: <strong className="text-emerald-900">{(pageNumber).toLocaleString('ur-PK')}</strong> از {(totalSections).toLocaleString('ur-PK')}</div>
                <div className="text-[11px] text-stone-400">{new Date().toLocaleDateString('ur-PK')}</div>
              </div>
            </div>

            {/* Chapter Banner */}
            {(chapterTitleAr || chapterTitleUr) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-3 text-center space-y-1">
                {chapterTitleAr && (
                  <h2 className="font-arabic text-lg sm:text-xl font-bold text-emerald-950">
                    {chapterTitleAr}
                  </h2>
                )}
                {chapterTitleUr && (
                  <p className="font-nastaliq text-sm font-bold text-stone-700">
                    {chapterTitleUr}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 1. Hadith Book Page Content */}
          {isHadith && hadiths && hadiths.length > 0 ? (
            <div className="space-y-6">
              {hadiths.map((h) => (
                <div key={h.hadithNum} className="border border-stone-200 rounded-2xl p-5 space-y-3 break-inside-avoid shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-2 text-xs font-nastaliq font-bold text-emerald-900">
                    <span>حدیث شریف نمبر: {h.hadithNum.toLocaleString('ur-PK')}</span>
                    <span className="text-stone-500">صحیح / مستند</span>
                  </div>

                  {includeArabic && h.arabicText && (
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <p className="font-arabic text-xl sm:text-2xl text-stone-900 leading-[2.4] font-bold text-justify">
                        {h.arabicText}
                      </p>
                    </div>
                  )}

                  {includeUrdu && h.urduText && (
                    <div className="space-y-1 pt-1">
                      <span className="text-xs font-bold text-emerald-800 font-nastaliq block">سلیس اردو ترجمہ:</span>
                      <p className="text-sm sm:text-base font-nastaliq text-stone-900 leading-[2.3] font-semibold text-justify">
                        {h.urduText}
                      </p>
                    </div>
                  )}

                  {includeTashreeh && h.tashreeh && (
                    <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl space-y-1 text-xs sm:text-sm font-nastaliq text-stone-800">
                      <span className="font-bold text-amber-900 block">درسی تشریح و فقہی فوائد:</span>
                      <p className="leading-relaxed whitespace-pre-line">{h.tashreeh}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* 2. Classical Dars / Quran Book Page Content */
            <div className="space-y-6">
              {includeArabic && arabicMatn && (
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2 break-inside-avoid">
                  <span className="text-xs font-bold font-nastaliq text-emerald-800 block">متنِ کتاب (عربی):</span>
                  <p className="font-arabic text-xl sm:text-2xl text-stone-900 leading-[2.5] font-bold text-justify">
                    {arabicMatn}
                  </p>
                </div>
              )}

              {includeUrdu && urduTranslation && (
                <div className="p-5 rounded-2xl border border-stone-200 space-y-2 break-inside-avoid">
                  <span className="text-xs font-bold font-nastaliq text-emerald-800 block">سلیس اردو ترجمہ:</span>
                  <p className="font-nastaliq text-base sm:text-lg text-stone-900 leading-[2.4] font-semibold text-justify">
                    {urduTranslation}
                  </p>
                </div>
              )}

              {includeTashreeh && tashreeh && (
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 space-y-2 break-inside-avoid">
                  <span className="text-xs font-bold font-nastaliq text-emerald-900 block">جامع درسی تشریح و مفہوم:</span>
                  <div className="font-nastaliq text-sm sm:text-base text-stone-800 leading-[2.3] whitespace-pre-line text-justify font-semibold">
                    {tashreeh}
                  </div>
                </div>
              )}

              {includeIraab && normalizedIraab.length > 0 && (
                <div className="p-4 rounded-2xl border border-stone-200 space-y-2 break-inside-avoid">
                  <span className="text-xs font-bold font-nastaliq text-indigo-900 block">جدولِ اعراب و نحوی ترکیب:</span>
                  <ul className="space-y-1 font-nastaliq text-xs sm:text-sm text-stone-800">
                    {normalizedIraab.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {includeHawashi && normalizedHawashi.length > 0 && (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-2 break-inside-avoid">
                  <span className="text-xs font-bold font-nastaliq text-amber-900 block">حواشی و علمی نکات:</span>
                  <ul className="space-y-1 font-nastaliq text-xs text-stone-800">
                    {normalizedHawashi.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Student Personal Notes */}
          {includeNotes && studentNotes && (
            <div className="border border-indigo-200 bg-indigo-50/40 p-4 rounded-2xl space-y-1.5 break-inside-avoid">
              <span className="text-xs font-bold font-nastaliq text-indigo-950 block">طالبِ علم کے ذاتی علمی نوٹس:</span>
              <p className="font-nastaliq text-xs sm:text-sm text-stone-800 whitespace-pre-line">
                {studentNotes}
              </p>
            </div>
          )}

          {/* Printable Document Footer */}
          <div className="pt-6 border-t-2 border-stone-200 text-center space-y-1 text-xs font-nastaliq text-stone-500">
            <p>
              طبع شدہ بذریعہ تحریکِ ایمان اسلامی پورٹل • مصدقہ کاپی رائٹ سے آزاد متونِ اسلامیہ
            </p>
            <p className="text-[11px] text-stone-400">
              {referenceUrl}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
