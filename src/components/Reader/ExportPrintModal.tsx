import React, { useState } from 'react';
import { Book, BookChapter } from '../../types';
import { TehreekImanLogo } from '../TehreekImanLogo';
import { QRCodeBadge } from '../QRCodeBadge';
import { copyToClipboardWithTehreekLogo, TEHREEK_BANNER_HEADER, TEHREEK_BANNER_FOOTER } from '../../utils/clipboardHelper';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  CheckCheck, 
  Sliders
} from 'lucide-react';

interface ExportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  chapter: BookChapter;
  userName?: string;
}

export const ExportPrintModal: React.FC<ExportPrintModalProps> = ({
  isOpen,
  onClose,
  book,
  chapter,
  userName = 'حضرت مولانا محمد نعیم الحسن صدیقی',
}) => {
  const [includeArabic, setIncludeArabic] = useState(true);
  const [includeUrdu, setIncludeUrdu] = useState(true);
  const [includeEn, setIncludeEn] = useState(false);
  const [includeIraab, setIncludeIraab] = useState(true);
  const [includeTashreeh, setIncludeTashreeh] = useState(true);
  const [includeHawashi, setIncludeHawashi] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate plain text document for copying or downloading
  const generateDocumentText = () => {
    let doc = TEHREEK_BANNER_HEADER + '\n\n';
    doc += `تَحْرِيكِ إِيمَان — مَنَصَّةُ المَدَارِسِ الإِسْلَامِيَّة\n`;
    doc += `کتاب: ${book.title}\n`;
    doc += `مصنف: ${book.author}\n`;
    doc += `موضوع: ${book.subjectNameUrdu} | درجہ: ${book.grade}\n`;
    doc += `باب / سورت: ${chapter.titleArabic} (${chapter.titleUrdu})\n`;
    doc += `سرپرست: ${userName}\n`;
    doc += `====================================================\n\n`;

    chapter.segments.forEach((seg, idx) => {
      doc += `------------------ [ حصہ نمبر ${idx + 1} ] ------------------\n\n`;
      
      if (includeArabic && seg.arabicText) {
        doc += `[العربیۃ / المتن]:\n${seg.arabicText}\n\n`;
      }
      
      if (includeUrdu && seg.urduTranslation) {
        doc += `[سلیس اردو ترجمہ]:\n${seg.urduTranslation}\n\n`;
      }

      if (includeEn && seg.translations?.en) {
        doc += `[English Translation]:\n${seg.translations.en}\n\n`;
      }

      if (includeIraab && seg.mahalIraab && seg.mahalIraab.length > 0) {
        doc += `[جدولِ اعراب و ترکیب]:\n`;
        seg.mahalIraab.forEach(item => {
          doc += `• کلمہ: ${item.word} | محل: ${item.role} | علامت: ${item.sign} | تفصیل: ${item.detail}\n`;
        });
        doc += `\n`;
      }

      if (includeTashreeh && seg.tashreeh) {
        doc += `[جامع درسی تشریح و مفہوم]:\n${seg.tashreeh}\n\n`;
      }

      if (includeHawashi && seg.hawashi && seg.hawashi.length > 0) {
        doc += `[حواشی و مراجع]:\n`;
        seg.hawashi.forEach(h => {
          doc += `• ${h}\n`;
        });
        doc += `\n`;
      }

      if (includeQuestions && seg.potentialQuestions && seg.potentialQuestions.length > 0) {
        doc += `[امتحانی و فکری سوالات]:\n`;
        seg.potentialQuestions.forEach(q => {
          doc += `• ${q}\n`;
        });
        doc += `\n`;
      }
    });

    doc += `\n` + TEHREEK_BANNER_FOOTER + `\n`;
    return doc;
  };

  const handleCopyText = async () => {
    const text = generateDocumentText();
    await copyToClipboardWithTehreekLogo(text, {
      title: `${book.title} — ${chapter.titleUrdu}`,
      sourceBook: book.title,
      includeTimestamp: true,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const text = generateDocumentText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.id}_${chapter.id}_dars_sheet.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#01140e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="modal-contrast-card rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-amber-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <Printer className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-nastaliq text-amber-200">
                پرنٹ و پی ڈی ایف / ورڈ ایکسپورٹ مرکز
              </h3>
              <p className="text-xs text-emerald-200 font-nastaliq font-bold mt-0.5">
                {book.title} — {chapter.titleArabic}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-amber-200 hover:text-white transition-colors cursor-pointer"
            title="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Checkbox Options */}
        <div className="p-4 sm:p-5 bg-black/40 border-b border-emerald-800/60 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-nastaliq font-black text-amber-300">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>پرنٹ اور فائل میں شامل کیے جانے والے حصے منتخب کریں:</span>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrint}
                className="btn-3d-gold px-4 py-2 rounded-xl text-stone-950 font-nastaliq font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>پرنٹ / PDF محفوظ کریں</span>
              </button>

              <button
                onClick={handleDownloadFile}
                className="btn-3d-emerald px-3.5 py-2 rounded-xl text-amber-200 font-nastaliq font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="ٹیکسٹ فائل ڈاؤنلوڈ کریں"
              >
                <Download className="w-4 h-4" />
                <span>ڈاؤنلوڈ فائل (.txt)</span>
              </button>

              <button
                onClick={handleCopyText}
                className="card-jewel-dark px-3 py-2 rounded-xl text-amber-300 font-nastaliq font-bold text-xs border border-emerald-700/60 hover:border-amber-400 cursor-pointer flex items-center gap-1.5"
                title="مکمل متن کاپی کریں"
              >
                {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'کاپی ہو گیا' : 'کاپی کریں'}</span>
              </button>
            </div>
          </div>

          {/* Toggle Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 text-xs font-nastaliq font-bold text-emerald-100">
            <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-800">
              <input 
                type="checkbox" 
                checked={includeArabic} 
                onChange={(e) => setIncludeArabic(e.target.checked)} 
                className="accent-amber-400" 
              />
              <span>عربی متن</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-800">
              <input 
                type="checkbox" 
                checked={includeUrdu} 
                onChange={(e) => setIncludeUrdu(e.target.checked)} 
                className="accent-amber-400" 
              />
              <span>اردو ترجمہ</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-800">
              <input 
                type="checkbox" 
                checked={includeEn} 
                onChange={(e) => setIncludeEn(e.target.checked)} 
                className="accent-amber-400" 
              />
              <span>English</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-800">
              <input 
                type="checkbox" 
                checked={includeIraab} 
                onChange={(e) => setIncludeIraab(e.target.checked)} 
                className="accent-amber-400" 
              />
              <span>جدولِ اعراب</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-800">
              <input 
                type="checkbox" 
                checked={includeTashreeh} 
                onChange={(e) => setIncludeTashreeh(e.target.checked)} 
                className="accent-amber-400" 
              />
              <span>درسی تشریح</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-800">
              <input 
                type="checkbox" 
                checked={includeHawashi} 
                onChange={(e) => setIncludeHawashi(e.target.checked)} 
                className="accent-amber-400" 
              />
              <span>حواشی و مراجع</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-800">
              <input 
                type="checkbox" 
                checked={includeQuestions} 
                onChange={(e) => setIncludeQuestions(e.target.checked)} 
                className="accent-amber-400" 
              />
              <span>امتحانی سوالات</span>
            </label>
          </div>

        </div>

        {/* Live Printable Document Preview (This also styles during window.print()) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#0a1f18] text-amber-50 space-y-6 printable-document">
          
          {/* Printable Page Letterhead with Official Tehreek-e-Iman Logo & Verification QR Code */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b-2 border-amber-400/40 text-center sm:text-right">
            <div className="flex items-center gap-3.5">
              <TehreekImanLogo size={76} className="shadow-2xl ring-4 ring-amber-400/80 shrink-0" />
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black font-amiri text-amber-300">
                  تَحْرِيكِ إِيمَان — مَنَصَّةُ المَدَارِسِ الإِسْلَامِيَّة
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs font-nastaliq text-emerald-200">
                  <span>کتاب: <strong className="text-amber-200">{book.title}</strong></span>
                  <span>•</span>
                  <span>درجہ: <strong>{book.grade}</strong></span>
                </div>
                <p className="text-xs text-amber-200/80 font-nastaliq">
                  سرپرستیِ عالیہ: {userName}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <QRCodeBadge
                value={`https://tehreek-iman.org/?book=${encodeURIComponent(book.id)}`}
                size={82}
                label="تحریکِ ایمان تصدیق"
                subLabel="مستند مطبوعہ نسخہ"
              />
            </div>
          </div>

          {/* Chapter Header */}
          <div className="bg-black/30 p-4 rounded-2xl border border-emerald-800 text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-black font-arabic text-amber-200">
              {chapter.titleArabic}
            </h3>
            <p className="text-sm font-nastaliq text-emerald-100 font-bold">
              {chapter.titleUrdu}
            </p>
          </div>

          {/* Segments Display */}
          <div className="space-y-8">
            {chapter.segments.map((seg, sIdx) => (
              <div 
                key={seg.id || sIdx}
                className="p-5 rounded-2xl bg-[#021a12] border border-emerald-800/80 space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60 text-xs font-nastaliq font-bold text-amber-300">
                  <span>حصہ نمبر: {sIdx + 1}</span>
                  <span className="text-emerald-400">تحریکِ ایمان پلیٹ فارم</span>
                </div>

                {/* Matn */}
                {includeArabic && seg.arabicText && (
                  <div className="p-4 rounded-xl bg-black/40 border border-amber-400/30">
                    <p className="font-arabic text-2xl sm:text-3xl text-amber-200 leading-[2.6] font-bold text-justify">
                      {seg.arabicText}
                    </p>
                  </div>
                )}

                {/* Urdu Translation */}
                {includeUrdu && seg.urduTranslation && (
                  <div className="space-y-1">
                    <span className="text-xs font-black text-amber-300 font-nastaliq block">سلیس اردو ترجمہ:</span>
                    <p className="text-sm sm:text-base font-nastaliq text-emerald-50 leading-[2.4] font-semibold text-justify">
                      {seg.urduTranslation}
                    </p>
                  </div>
                )}

                {/* English Translation */}
                {includeEn && seg.translations?.en && (
                  <div className="space-y-1 pt-1">
                    <span className="text-xs font-bold text-amber-400 font-sans block">English Translation:</span>
                    <p className="text-xs sm:text-sm font-serif text-emerald-100/90 leading-relaxed text-left" dir="ltr">
                      {seg.translations.en}
                    </p>
                  </div>
                )}

                {/* Grammatical Analysis Table */}
                {includeIraab && seg.mahalIraab && seg.mahalIraab.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-black text-amber-300 font-nastaliq block">جدولِ اعراب و نحو:</span>
                    <div className="overflow-x-auto rounded-xl border border-emerald-800">
                      <table className="w-full text-right text-xs font-nastaliq">
                        <thead className="bg-emerald-950 text-amber-300 font-black border-b border-emerald-800">
                          <tr>
                            <th className="p-2.5">الکلمۃ</th>
                            <th className="p-2.5">محلِ اعراب</th>
                            <th className="p-2.5">علامت</th>
                            <th className="p-2.5">نحوی تفصیل</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-900/60 bg-black/30 font-semibold text-emerald-100">
                          {seg.mahalIraab.map((item, iIdx) => (
                            <tr key={iIdx} className="hover:bg-white/5">
                              <td className="p-2.5 font-arabic font-bold text-amber-200 text-sm">{item.word}</td>
                              <td className="p-2.5 text-amber-300">{item.role}</td>
                              <td className="p-2.5">{item.sign}</td>
                              <td className="p-2.5 text-emerald-200">{item.detail}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tashreeh */}
                {includeTashreeh && seg.tashreeh && (
                  <div className="space-y-1 pt-2">
                    <span className="text-xs font-black text-amber-300 font-nastaliq block">جامع درسی تشریح و مفہوم:</span>
                    <p className="text-xs sm:text-sm font-nastaliq text-emerald-100 leading-[2.3] whitespace-pre-line text-justify font-semibold">
                      {seg.tashreeh}
                    </p>
                  </div>
                )}

                {/* Hawashi */}
                {includeHawashi && seg.hawashi && seg.hawashi.length > 0 && (
                  <div className="p-3 rounded-xl bg-black/30 border border-emerald-900 space-y-1 text-xs font-nastaliq">
                    <span className="font-black text-amber-400 block">حواشی و مراجع:</span>
                    <ul className="space-y-1 text-emerald-200 font-semibold">
                      {seg.hawashi.map((h, hIdx) => (
                        <li key={hIdx}>• {h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Potential Questions */}
                {includeQuestions && seg.potentialQuestions && seg.potentialQuestions.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-400/30 space-y-1 text-xs font-nastaliq">
                    <span className="font-black text-amber-300 block">امتحانی و فکری سوالات:</span>
                    <ul className="space-y-1 text-amber-100 font-semibold">
                      {seg.potentialQuestions.map((q, qIdx) => (
                        <li key={qIdx}>؟ {q}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Footer note in printed document */}
          <div className="text-center pt-6 border-t border-emerald-800 text-xs font-nastaliq text-emerald-300/80">
            طبع شدہ بذریعہ تحریکِ ایمان درسِ نظامی اسمارٹ پلیٹ فارم — 1448ھ / 2026ء
          </div>

        </div>

      </div>
    </div>
  );
};
