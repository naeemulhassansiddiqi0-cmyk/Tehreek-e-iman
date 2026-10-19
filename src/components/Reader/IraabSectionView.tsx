import React, { useState } from 'react';
import { BookMarked, Sparkles, Languages, Check, Copy } from 'lucide-react';

export interface IraabItemParsed {
  token: string;
  arabic: string;
  urdu: string;
}

/**
 * Intelligent classical Arabic-to-Urdu grammar translation engine.
 * Automatically translates classical Nahwi & Sarfi expressions into clear Dars-e-Nizami Urdu.
 */
export function translateArabicNahwToUrdu(token: string, arabicText: string): string {
  const t = token ? `'${token}'` : 'یہ کلمہ';
  
  if (arabicText.includes('أداة حصر') || arabicText.includes('كافة ومكفوفة') || arabicText.includes('كافّة ومكفوفة')) {
    return `${t} کلمۂ حصر و قصر ہے، یعنی اس کے معانی صرف اور فقط کے آتے ہیں۔ 'إنّ' مشبہ بالفعل کو 'ما' کافہ نے عمل سے روک دیا ہے، لہٰذا اس کے بعد مبتدا اور خبر آتے ہیں۔`;
  }
  if (arabicText.includes('حرف توكيد ونصب مشبه بالفعل')) {
    return `${t} حرفِ مشبہ بالفعل ہے جو تاکید کا فائدہ دیتا ہے؛ یہ جملۂ اسمیہ پر داخل ہو کر اپنے اسم کو نصب اور خبر کو رفع دیتا ہے۔`;
  }
  if (arabicText.includes('أداة نفي') || arabicText.includes('أداة نهي') || arabicText.includes('حرف نفي')) {
    return `${t} حرفِ نفی یا نہی ہے جو سکون پر مبنی ہے اور اس کا کوئی اعرابی محل نہیں؛ یہ جملے میں مذکورہ شرعی حکم کی نفی یا ممانعت کا فائدہ دیتا ہے۔`;
  }
  if (arabicText.includes('مبنى الجملة ومطلع الإسناد')) {
    return `${t} جملے کا مطلع اور کلام کی بنیادی اسنادی بنیاد ہے (فعل و فاعل یا مبتدا و خبر)؛ اس کا اعرابی محل جملے کے اصل عوامل کے مطابق ہوتا ہے۔`;
  }
  if (arabicText.includes('موقع الإعراب مفعول به أو جار ومجرور')) {
    return `${t} اعرابی اعتبار سے مفعول بہ یا فعل کے متعلق جار و مجرور ہے جس سے نبوی بیان اور شرعی حکم کی تفصیل و متعلقات واضح ہوتے ہیں۔`;
  }
  if (arabicText.includes('ختام الجملة النبوية ومحل الشاهد البلاغي')) {
    return `${t} کلامِ نبوی ﷺ کا اختتام اور بلاغی شاہد کا مقام ہے، جو شرعی حکم کے عام یا خاص ہونے کو پورا کرتا ہے۔`;
  }
  if (arabicText.includes('مبتدأ مرفوع')) {
    return `${t} جملۂ اسمیہ میں مبتدا ہے اور ضمہ (پیش) کے ساتھ مرفوع ہے۔`;
  }
  if (arabicText.includes('خبر المبتدأ') || arabicText.includes('خبر مقدم')) {
    return `${t} جملۂ اسمیہ میں خبر ہے جو مبتدا کے مفہوم کو مکمل کرتی ہے اور مرفوع ہے۔`;
  }
  if (arabicText.includes('مفعول به منصوب')) {
    return `${t} جملۂ فعلیہ میں مفعول بہ ہے اور فتحہ (زبر) کے ساتھ منصوب ہے جس پر فاعل کا فعل واقع ہوا ہے۔`;
  }
  if (arabicText.includes('فاعل مرفوع')) {
    return `${t} جملۂ فعلیہ میں فاعل ہے اور ضمہ (پیش) کے ساتھ مرفوع ہے جس نے فعل کو انجام دیا۔`;
  }
  if (arabicText.includes('فعل ماض')) {
    return `${t} فعلِ ماضی ہے جو ماضی کے زمانے میں واقع ہونے پر دلالت کرتا ہے اور مبنی ہے۔`;
  }
  if (arabicText.includes('فعل مضارع')) {
    return `${t} فعلِ مضارع ہے جو حال یا استقبال پر دلالت کرتا ہے اور ناصب و جازم سے خالی ہونے کی بنا پر مرفوع ہے۔`;
  }
  if (arabicText.includes('جار ومجرور') || arabicText.includes('حرف جر')) {
    return `${t} حرفِ جر اور اسمِ مجرور کا مرکب ہے جو شبہ جملہ بن کر فعل یا متعلق کے ساتھ جڑتا ہے۔`;
  }
  if (arabicText.includes('اسم شرط')) {
    return `${t} اسمِ شرط جازم ہے جو شرط اور جزا (جوابِ شرط) کے مفہوم کو جوڑتا ہے۔`;
  }
  if (arabicText.includes('صلة الموصول')) {
    return `${t} اسمِ موصول کا صلہ ہے جو اس کے مبہم معنی کو واضح کرتا ہے اور اس کا کوئی مستقل اعرابی محل نہیں۔`;
  }
  if (arabicText.includes('بدل')) {
    return `${t} اپنے ما قبل اسم کا بدل ہے جو اعراب میں متبوع کے تابع ہے۔`;
  }
  if (arabicText.includes('حال منصوب')) {
    return `${t} حال ہے جو فتحہ سے منصوب ہے اور فاعل یا مفعول کی حالت بیان کرتا ہے۔`;
  }

  // Fallback clean explanation
  return `${t} کی نحوی حیثیت: یہ کلمہ کلام میں اپنے سیاقی عوامل کے مطابق ترکیب پاتا ہے اور جملے کے ربط و اعراب کو متعین کرتا ہے۔`;
}

/**
 * Parses a raw grammatical analysis line into token, Arabic syntax, and Urdu explanation.
 */
export function parseIraabLine(rawLine: string): IraabItemParsed {
  if (!rawLine) return { token: '', arabic: '', urdu: '' };

  let token = '';
  // Check for [token]
  const tokenMatch = rawLine.match(/\[([^\]]+)\]/);
  if (tokenMatch) {
    token = tokenMatch[1].trim();
  } else {
    // Check for "word:"
    const colonMatch = rawLine.match(/^•?\s*([^:：]{1,30})[:：]/);
    if (colonMatch) {
      token = colonMatch[1].replace(/^[•\s\-\*]+/, '').trim();
    }
  }

  // Check if line contains an explicit Urdu explanation separator
  // e.g. "❖ اردو وضاحت:", "اردو وضاحت:", "اردو تشریح:", "اردو:", "\nاردو:"
  const urduSeparatorRegex = /(?:\n\s*)?(?:❖\s*)?اردو\s*(?:وضاحت|تشریح|ترجمہ)?[:：]\s*/i;
  
  if (urduSeparatorRegex.test(rawLine)) {
    const parts = rawLine.split(urduSeparatorRegex);
    const arabicPart = parts[0].replace(/^•\s*/, '').trim();
    const urduPart = parts.slice(1).join(' ').trim();
    return {
      token,
      arabic: arabicPart,
      urdu: urduPart
    };
  }

  // Check if raw line is already primarily Urdu (e.g. from examData or Urdu commentary)
  const isPrimarilyUrdu = /[\u0679\u0686\u0698\u0691\u06BA\u06D2\u06AF\u06C1\u06BE]/.test(rawLine) ||
    /ہے|ہیں|ہو|تھا|تھی|گے|کے|کی|کو|سے|میں|پر|اور|مبتدا|فاعل|مفعول/.test(rawLine);

  if (isPrimarilyUrdu) {
    // If it's already Urdu, use it as Urdu and provide a concise Arabic syntax equivalent
    const cleaned = rawLine.replace(/^•\s*/, '').trim();
    return {
      token,
      arabic: `الموقع الإعرابي: ${token ? `[${token}] ` : ''}بيان نحوي وإعرابي سياقي بحسب قواعد الإعراب.`,
      urdu: cleaned
    };
  }

  // It's pure Arabic without explicit Urdu -> Translate via grammar engine
  const cleanedArabic = rawLine.replace(/^•\s*/, '').trim();
  const generatedUrdu = translateArabicNahwToUrdu(token, cleanedArabic);

  return {
    token,
    arabic: cleanedArabic,
    urdu: generatedUrdu
  };
}

interface IraabSectionViewProps {
  iraabLines: string[] | string;
  className?: string;
}

export const IraabSectionView: React.FC<IraabSectionViewProps> = ({
  iraabLines,
  className = ''
}) => {
  // Mode switcher: 'both' = Arabic + Urdu, 'urdu' = Urdu Only, 'arabic' = Arabic Only
  const [viewMode, setViewMode] = useState<'both' | 'urdu' | 'arabic'>('both');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Normalize lines to array
  const linesArray: string[] = Array.isArray(iraabLines)
    ? iraabLines.filter(l => l && l.trim().length > 0)
    : (iraabLines || '').split('\n').filter(l => l && l.trim().length > 0);

  if (linesArray.length === 0) return null;

  const parsedItems: IraabItemParsed[] = linesArray.map(line => parseIraabLine(line));

  const handleCopyItem = (item: IraabItemParsed, idx: number) => {
    const textToCopy = `[${item.token}]\nعربی ترکیب: ${item.arabic}\nاردو تشریح: ${item.urdu}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const handleCopyAll = () => {
    const text = parsedItems.map(p => `[${p.token}]\nعربی ترکیب: ${p.arabic}\nاردو تشریح: ${p.urdu}`).join('\n\n────────────────────\n\n');
    const fullText = `【حلِ اعراب و نحوی ترکیب】\n\n${text}\n\n🌐 تحریکِ ایمان اسلامی پورٹل • https://tehreek-e-iman.pages.dev`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2200);
    }
  };

  return (
    <div 
      className={`bg-indigo-50/30 rounded-2xl p-4 sm:p-5 border border-indigo-100/70 shadow-2xs space-y-3.5 text-right transition-all ${className}`}
      dir="rtl"
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <BookMarked className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold font-nastaliq text-sm sm:text-base text-indigo-950 flex items-center gap-1.5">
                <span>حلِ اعراب و نحوی ترکیب</span>
                <span className="text-emerald-800 text-xs font-bold">(عربی و سلیس اردو تشریح)</span>
              </h4>
              <span className="text-[10px] font-bold font-nastaliq text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200">
                برائے طلبۂ درسِ نظامی
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-500 font-nastaliq mt-0.5">
              جملوں کا نحوی ڈھانچہ، اعرابی علامات اور سلیس اردو توضیح
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Copy All Iraab Button */}
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1 text-xs font-bold font-nastaliq bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:text-indigo-900 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-slate-700 shadow-2xs transition cursor-pointer"
            title="پورے صفحے کے تمام نحوی و اعرابی نکات نقل کریں"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
            <span>{copiedAll ? 'تمام اعراب کاپی ہو گیا!' : 'تمام اعراب نقل کریں'}</span>
          </button>

          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-indigo-200/80 dark:border-slate-700 shadow-2xs text-xs font-nastaliq">
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'both'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-indigo-900 hover:bg-indigo-50/70'
            }`}
            title="عربی ترکیب اور اردو تشریح دونوں ایک ساتھ دیکھیں"
          >
            <Languages className="w-3 h-3" />
            <span>دونوں (عربی + اردو)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('urdu')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              viewMode === 'urdu'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-indigo-900 hover:bg-indigo-50/70'
            }`}
            title="صرف سلیس اردو نحوی تشریح دیکھیں"
          >
            <span>صرف اردو تشریح</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('arabic')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              viewMode === 'arabic'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-indigo-900 hover:bg-indigo-50/70'
            }`}
            title="صرف کلاسیکی عربی نحوی ترکیب دیکھیں"
          >
            <span>صرف عربی ترکیب</span>
          </button>
        </div>
      </div>
    </div>

      {/* 2. List of Grammatical Points */}
      <div className="space-y-3 pt-1">
        {parsedItems.map((item, idx) => (
          <div 
            key={idx}
            className="bg-white/95 rounded-xl p-3.5 border border-indigo-100/90 hover:border-indigo-300 shadow-2xs transition-all space-y-2 group"
          >
            {/* Top row: Analyzed token pill + copy button */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                {item.token ? (
                  <span 
                    className="font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-300/80 font-arabic text-base sm:text-lg tracking-wide inline-block shadow-2xs"
                    style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
                  >
                    [{item.token}]
                  </span>
                ) : (
                  <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md text-xs font-nastaliq">
                    نکتہ نمبر {idx + 1}
                  </span>
                )}
                <span className="text-[11px] text-stone-400 font-nastaliq hidden sm:inline-block">
                  محلِ اعراب و نحوی ترکیب
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyItem(item, idx)}
                className="flex items-center gap-1 text-[11px] font-nastaliq text-stone-500 hover:text-indigo-900 px-2 py-0.5 rounded-md hover:bg-indigo-50 transition cursor-pointer"
                title="یہ نحوی ترکیب کاپی کریں"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">کاپی ہو گیا!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-stone-400 group-hover:text-indigo-600" />
                    <span>کاپی کریں</span>
                  </>
                )}
              </button>
            </div>

            {/* Arabic Classical Grammar (shown in 'both' or 'arabic' mode) */}
            {(viewMode === 'both' || viewMode === 'arabic') && (
              <div className="pt-1">
                <p 
                  className="arabic-naskh text-stone-900 dark:text-amber-200 text-right select-text pr-1 font-semibold"
                  dir="rtl"
                  style={{ 
                    fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
                    fontSize: '1.35rem', 
                    lineHeight: '2.2',
                    fontWeight: 600,
                    color: '#0f172a'
                  }}
                >
                  {item.arabic}
                </p>
              </div>
            )}

            {/* Urdu Grammatical Explanation & Breakdown (shown in 'both' or 'urdu' mode) */}
            {(viewMode === 'both' || viewMode === 'urdu') && item.urdu && (
              <div className="bg-emerald-50/80 dark:bg-emerald-950/60 rounded-xl p-3 border border-emerald-300 dark:border-emerald-700 space-y-1.5 transition-colors">
                <div className="flex items-center gap-1.5 font-bold font-nastaliq text-emerald-950 dark:text-emerald-300 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="bg-emerald-100/90 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-950 dark:text-emerald-200">
                    سلیس اردو تشریح و مفہوم:
                  </span>
                </div>
                <p 
                  className="font-nastaliq text-stone-950 dark:text-stone-100 text-right select-text pr-1 font-medium"
                  dir="rtl"
                  style={{ 
                    fontSize: '1.2rem', 
                    lineHeight: '2.3',
                    fontWeight: 600,
                    color: '#111827'
                  }}
                >
                  {item.urdu}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
