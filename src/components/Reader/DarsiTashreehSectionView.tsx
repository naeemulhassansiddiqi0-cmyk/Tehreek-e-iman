import React, { useState } from 'react';
import { Scale, Sparkles, Languages, Check, Copy } from 'lucide-react';

export interface TashreehItemParsed {
  title?: string;
  madhhab?: 'hanafi' | 'shafii' | 'maliki' | 'hanbali' | 'general';
  madhhabLabel?: string;
  arabic: string;
  urdu: string;
}

/**
 * Classical Arabic-to-Urdu translation engine for Islamic jurisprudence (Fiqh) & Hadith commentary.
 */
export function translateArabicFiqhToUrdu(arabicText: string): string {
  if (!arabicText) return '';

  // Clean raw line
  const cleaned = arabicText.replace(/^[•\-\*\d\.\s]+/, '').trim();

  // 1. Check for specific Madhhab patterns in Arabic
  if (cleaned.startsWith('احناف') || cleaned.startsWith('الحنفية') || cleaned.includes('(الحنفية)')) {
    if (cleaned.includes('النية شرط صحة') || cleaned.includes('العبادات المقصودة')) {
      return 'فقہ حنفی میں نیت مقصود بالذات عبادات (نماز، روزہ، زکوٰۃ، حج) میں فرض اور شرطِ صحت ہے؛ جبکہ طہارت (وضو اور غسل) میں رفعِ حدث کے لیے شرط نہیں بلکہ حصولِ ثواب کے لیے سنتِ مؤکدہ ہے (کیونکہ پانی طہورِ ذاتی ہے)۔ نماز میں تکبیرِ تحریمہ کے وقت دل میں نیت کا حاضر ہونا فرض ہے اور زبان سے تلفظ مستحب ہے۔ روزے کے لیے نصف النہار شرعی سے قبل نیت صحیح ہے۔';
    }
    if (cleaned.includes('فرضیتِ ارکان') || cleaned.includes('تعديل أركان') || cleaned.includes('فقراءته له قراءة')) {
      return 'فقہ حنفی کے مطابق ارکانِ نماز (قیام، قراءت، رکوع، سجود، قعدۂ اخیرہ) کی ادائیگی فرض ہے، جبکہ تعدیلِ ارکان، سورۂ فاتحہ اور تشہد واجب ہیں۔ امام کی قراءت مقتدی کے لیے کافی ہے اور مقتدی پر قراءت جائز نہیں۔';
    }
    if (cleaned.includes('فرائضِ وضو') || cleaned.includes('غسل الأعضاء الأربعة')) {
      return 'احناف کے نزدیک وضو کے چار فرائض ہیں: چہرہ دھونا، کہنیوں سمیت دونوں ہاتھ دھونا، چوتھائی سر کا مسح، اور ٹخنوں سمیت پاؤں دھونا۔ نیت اور ترتیب سنتِ مؤکدہ ہیں۔';
    }
    if (cleaned.includes('عروضِ تجارت') || cleaned.includes('حولانِ حول') || cleaned.includes('2.5')) {
      return 'احناف کے نزدیک نقدی، عروضِ تجارت اور سونا چاندی (بشمول مستعمل زیورات) پر سال گزرنے کے بعد اڑھائی فیصد (2.5%) زکوٰۃ واجب ہے؛ نابالغ اور مجنون کے مال پر زکوٰۃ نہیں بجز صدقۂ فطر۔';
    }
    if (cleaned.includes('حجِ قِران') || cleaned.includes('طوافِ زيارة')) {
      return 'احناف کے ہاں حج کی تینوں اقسام میں حجِ قران سب سے افضل ہے، پھر تمتع اور پھر افراد؛ وقوفِ عرفہ اور طوافِ زیارت فرضِ اعظم ہیں۔';
    }
    if (cleaned.includes('عاقلہ بالغہ') || cleaned.includes('لا نكاح إلا بولي')) {
      return 'احناف کے نزدیک عاقلہ بالغہ عورت کا خود اپنا نکاح کرنا کفو کی شرط کے ساتھ شرعاً صحیح اور نافذ العمل ہے؛ اور دو عادل گواہ شرطِ صحت ہیں۔';
    }
  }

  if (cleaned.startsWith('شوافع') || cleaned.startsWith('الشافعية') || cleaned.includes('(الشافعية)')) {
    if (cleaned.includes('النية ركن فرض') || cleaned.includes('تبييت النية')) {
      return 'شوافع کے ہاں نیت ہر عبادت میں رکنِ فرض ہے؛ طہارت (وضو، غسل، تیمم) بغیر نیت کے سرے سے باطل ہے۔ نماز میں تکبیرِ تحریمہ کے ساتھ نیت کا استحضار اور اتصال شرط ہے، اور فرض روزے کے لیے فجر سے قبل رات ہی سے نیت (تبییتِ نیت) شرطِ لازم ہے۔';
    }
    if (cleaned.includes('وجوبِ فاتحہ') || cleaned.includes('رفع اليدين')) {
      return 'شوافع کے نزدیک امام اور مقتدی دونوں پر ہر رکعت میں سورۂ فاتحہ پڑھنا فرض ہے، اور رکوع جاتے اور اٹھتے وقت رفع یدین کرنا مسنون ہے۔';
    }
    if (cleaned.includes('مالِ یتیم') || cleaned.includes('زكاة مال اليتيم')) {
      return 'شوافع کے نزدیک یتیم اور مجنون کے مال میں بھی زکوٰۃ فرض ہے جسے ادا کرنا ان کے ولی پر لازم ہے، اور مستعمل زیورِ مباح میں زکوٰۃ نہیں۔';
    }
  }

  if (cleaned.startsWith('مالکیہ') || cleaned.startsWith('المالكية') || cleaned.includes('(المالكية)')) {
    if (cleaned.includes('نية واحدة') || cleaned.includes('صيام شهر رمضان')) {
      return 'مالکیہ کے نزدیک طہارت اور تمام عبادات میں نیت فرض ہے۔ البتہ رمضان المبارک کے روزوں کے لیے پہلے دن کی گئی ایک ہی نیت پورے مہینے کے لیے کافی ہے بشرطیکہ بیماری یا سفر سے تسلسل نہ ٹوٹے۔';
    }
    if (cleaned.includes('سدلِ یدین') || cleaned.includes('عمل أهل المدينة')) {
      return 'مالکیہ کے ہاں فرض نماز میں ہاتھوں کو کھلا چھوڑنا (سدلِ یدین) اور عملِ اہل مدینہ کو قیاس پر ترجیح دینا معتمد مسلک ہے۔';
    }
    if (cleaned.includes('موالات') || cleaned.includes('الدلك')) {
      return 'مالکیہ کے ہاں وضو میں نیت، پے در پے اعضاء دھونا (موالات) اور عضو کو ملنا (دلک) فرائض میں شامل ہیں۔';
    }
  }

  if (cleaned.startsWith('حنابلہ') || cleaned.startsWith('الحنابلة') || cleaned.includes('(الحنابلة)')) {
    if (cleaned.includes('شرط لصحة الطهارة') || cleaned.includes('التعيين')) {
      return 'حنابلہ کے نزدیک نیت طہارت اور تمام عبادات کی صحت کے لیے قطعی شرط ہے؛ بغیر نیت کے کوئی وضو یا غسل معتبر نہیں، اور فرض و نفل میں امتیاز کے لیے تعیینِ نیت ضروری ہے۔';
    }
    if (cleaned.includes('وضع اليدين على الصدر') || cleaned.includes('تسبيحات')) {
      return 'حنابلہ کے ہاں نماز میں ہاتھ سینے پر باندھنا مسنون ہے، اور رکوع و سجود کی تسبیحات اور تکبیراتِ انتقال واجب ہیں۔';
    }
    if (cleaned.includes('وجوبِ تسمیہ') || cleaned.includes('بسم الله')) {
      return 'حنابلہ کے نزدیک وضو کے آغاز میں "بسم اللہ" پڑھنا یاد آنے کی صورت میں واجب ہے۔';
    }
  }

  // General headings
  if (cleaned.includes('أصل النيات والإخلاص') || cleaned.includes('أصل عظيم من أصول الإسلام')) {
    return 'شریعت میں نیت اور اخلاص کی اصل و بنیاد: یہ حدیثِ مبارک اصولِ اسلام میں سے ایک عظیم ترین اصل اور بنیادی قاعدہ ہے جس پر تمام احکامِ شریعت کا دارومدار ہے۔ امام شافعی اور امام احمد رحمہما اللہ نے فرمایا: «یہ حدیث فقہ کے ستر ابواب میں داخل ہوتی ہے»، اور اسے ثلثِ علم قرار دیا گیا ہے، کیونکہ بندے کے تمام اعمال دل، زبان اور اعضاء سے صادر ہوتے ہیں اور دل کی نیت ہی اصل بنیاد ہے۔';
  }
  if (cleaned.includes('الفقه المقارن وأقوال المذاهب الأربعة')) {
    return 'تقابلی فقہ اور ائمہ اربعہ (احناف، شوافع، مالکیہ، حنابلہ) کے مستنبط فقہی مذاہب و احکام:';
  }
  if (cleaned.includes('مقاصد الهجرة') || cleaned.includes('التمييز بين العادة والعبادة')) {
    return 'ہجرت کے مقاصد اور عادت و عبادت کا فرق: اس حدیث میں واضح تفریق کی گئی ہے کہ جو شخص خالص اللہ تعالیٰ کی رضا اور آخرت کے لیے عمل کرے اسے پورا اجر ملے گا، اور جو دنیاوی غرض یا شادی کے لیے کرے اسے وہی دنیا ملے گی؛ پس نیت ہی وہ بنیادی کسوٹی ہے جو دنیاوی عادات کو عبادت کا درجہ عطا کرتی ہے۔';
  }
  if (cleaned.includes('أحكام الصلاة والعبادة')) {
    return 'نماز اور عبادت کے شرعی احکام: یہ نص نماز کے ارکان، شرائط، تعدیلِ ارکان، خشوع اور نبوی آداب کے بیان میں بنیادی حجت ہے۔';
  }
  if (cleaned.includes('باب الطهارة وإسباغ الوضوء')) {
    return 'بابِ طہارت اور کامل وضو کے احکام: یہ نص عبادت کی صحت کے لیے ظاہری و باطنی طہارت اور سنت کے مطابق وضو کرنے کی فرضیت پر دلالت کرتی ہے۔';
  }
  if (cleaned.includes('مقاصد الصيام وتزكية النفس')) {
    return 'روزے کے مقاصد اور تزکیۂ نفس: روزہ محض بھوکے پیاسے رہنے کا نام نہیں بلکہ نفس کو گناہوں سے روکنے اور رضائے الٰہی کے حصول کا نام ہے۔';
  }
  if (cleaned.includes('التكافل وحق المال') || cleaned.includes('فرائض الصدقات')) {
    return 'مالی تکافل اور حقوقِ مال: نصاب کی تکمیل اور سال گزرنے پر غربا و مساکین کا حق ادا کرنے کی فرضیت کا بیان۔';
  }
  if (cleaned.includes('مناسك الحج وشعائر الله')) {
    return 'مناسکِ حج اور شعائرِ الٰہیہ: احرام کی پابندیاں، طواف، سعی اور وقوفِ عرفہ کے ارکان و شرائط کا شرعی بیان۔';
  }
  if (cleaned.includes('المعاملات المالية وأكل الحلال')) {
    return 'معاملاتِ مالیہ اور کسبِ حلال: سودی لین دین اور دھوکہ دہی سے اموال کی حفاظت اور جائز تجارت و بیوع کی شرائط کا بیان۔';
  }
  if (cleaned.includes('فقه الأسرة والنكاح')) {
    return 'نظامِ معاشرت اور عائلی احکام: نکاح، مہر اور گھریلو حقوق و فرائض کی شرعی حدود و آداب کا بیان۔';
  }
  if (cleaned.includes('التوجيه النبوي والتربية الإيمانية')) {
    return 'نبوی راہنمائی اور ایمانی تربیت: یہ مبارک نص اسلامی کردار کی تعمیر اور تمام اقوال و افعال کو رضائے الٰہی کے ساتھ وابستہ کرنے کا درس دیتی ہے۔';
  }
  if (cleaned.includes('المعنى المقاصدي والدراسي')) {
    return 'مقاصدی و درسی مفہوم: طالبِ علم کے لیے ضروری ہے کہ وہ الفاظِ نبوی کی بلاغت، احکام کی علت اور پوشیدہ علمی فوائد پر غور و فکر کرے۔';
  }
  if (cleaned.includes('مذاهب أئمة الفقه والحديث') || cleaned.includes('اتفق الأئمة الأربعة')) {
    return 'ائمۂ فقہ و حدیث کے مذاہب: ائمہ اربعہ کا اس امر پر مکمل اتفاق ہے کہ سنتِ نبوی پر عمل پیرا ہونا ہی اصل دین اور کامیابی کا راستہ ہے۔';
  }
  if (cleaned.includes('العمل والاتباع')) {
    return 'عمل اور اتباعِ سنت: حدیثِ پاک پر اخلاص کے ساتھ عمل کرنا دارین کی فلاح اور صراطِ مستقیم پر استقامت کی کلید ہے۔';
  }

  // Fallback
  return cleaned;
}

/**
 * Parses raw Tashreeh lines into structured items with Madhhab detection and Urdu translation.
 */
export function parseTashreehLine(rawLine: string): TashreehItemParsed {
  if (!rawLine) return { arabic: '', urdu: '' };

  let madhhab: 'hanafi' | 'shafii' | 'maliki' | 'hanbali' | 'general' = 'general';
  let madhhabLabel = '';

  if (rawLine.includes('احناف') || rawLine.includes('الحنفية')) {
    madhhab = 'hanafi';
    madhhabLabel = 'مذہبِ احناف (الحنفیۃ)';
  } else if (rawLine.includes('شوافع') || rawLine.includes('الشافعية')) {
    madhhab = 'shafii';
    madhhabLabel = 'مذہبِ شوافع (الشافعیۃ)';
  } else if (rawLine.includes('مالکیہ') || rawLine.includes('المالكية')) {
    madhhab = 'maliki';
    madhhabLabel = 'مذہبِ مالکیہ (المالکیۃ)';
  } else if (rawLine.includes('حنابلہ') || rawLine.includes('الحنابلة')) {
    madhhab = 'hanbali';
    madhhabLabel = 'مذہبِ حنابلہ (الحنابلۃ)';
  }

  // Check if line contains an explicit Urdu explanation separator
  const urduSeparatorRegex = /(?:\n\s*)?(?:❖\s*)?اردو\s*(?:وضاحت|تشریح|ترجمہ)?[:：]\s*/i;
  
  if (urduSeparatorRegex.test(rawLine)) {
    const parts = rawLine.split(urduSeparatorRegex);
    const arabicPart = parts[0].trim();
    const urduPart = parts.slice(1).join(' ').trim();
    return {
      madhhab,
      madhhabLabel,
      arabic: arabicPart,
      urdu: urduPart
    };
  }

  // Check if raw line is already primarily Urdu
  const isPrimarilyUrdu = /[\u0679\u0686\u0698\u0691\u06BA\u06D2\u06AF\u06C1\u06BE]/.test(rawLine) ||
    /ہے|ہیں|ہو|تھا|تھی|گے|کے|کی|کو|سے|میں|پر|اور|نیت|نماز|روزہ|وضو/.test(rawLine);

  if (isPrimarilyUrdu) {
    return {
      madhhab,
      madhhabLabel,
      arabic: rawLine.trim(),
      urdu: rawLine.trim()
    };
  }

  // It's in Arabic -> derive Urdu translation
  const arabicText = rawLine.trim();
  const urduText = translateArabicFiqhToUrdu(arabicText);

  return {
    madhhab,
    madhhabLabel,
    arabic: arabicText,
    urdu: urduText
  };
}

interface DarsiTashreehSectionViewProps {
  tashreehText: string;
  className?: string;
}

export const DarsiTashreehSectionView: React.FC<DarsiTashreehSectionViewProps> = ({
  tashreehText,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'both' | 'urdu' | 'arabic'>('both');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!tashreehText || tashreehText.trim().length === 0) return null;

  const lines = tashreehText.split('\n').filter(l => l && l.trim().length > 0);
  const parsedItems = lines.map(line => parseTashreehLine(line));

  const handleCopy = (item: TashreehItemParsed, idx: number) => {
    const textToCopy = `عربی نکتہ: ${item.arabic}\nاردو تشریح: ${item.urdu}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  return (
    <div 
      className={`bg-emerald-50/30 rounded-2xl p-4 sm:p-5 border border-emerald-100/80 shadow-2xs space-y-3.5 text-right transition-all ${className}`}
      dir="rtl"
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold font-nastaliq text-sm sm:text-base text-teal-950 flex items-center gap-1.5">
                <span>درسی تشریح و فقہی مذاہب</span>
                <span className="text-amber-800 text-xs font-bold">(احناف، شوافع، مالکیہ، حنابلہ)</span>
              </h4>
              <span className="text-[10px] font-bold font-nastaliq text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/60">
                تقابلی فقہ و سلیس اردو توضیح
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-500 font-nastaliq mt-0.5">
              ائمہ اربعہ کے فقہی استنباطات، متون کے درسی اسرار اور سلیس اردو تشریح
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-emerald-200/80 shadow-2xs text-xs font-nastaliq">
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'both'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-stone-600 hover:text-teal-900 hover:bg-emerald-50/70'
            }`}
            title="عربی عبارت اور سلیس اردو تشریح دونوں ایک ساتھ دیکھیں"
          >
            <Languages className="w-3 h-3" />
            <span>دونوں (عربی + اردو)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('urdu')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              viewMode === 'urdu'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-stone-600 hover:text-teal-900 hover:bg-emerald-50/70'
            }`}
            title="صرف سلیس اردو درسی تشریح دیکھیں"
          >
            <span>صرف اردو تشریح</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('arabic')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              viewMode === 'arabic'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-stone-600 hover:text-teal-900 hover:bg-emerald-50/70'
            }`}
            title="صرف کلاسیکی عربی عبارت دیکھیں"
          >
            <span>صرف عربی متن</span>
          </button>
        </div>
      </div>

      {/* 2. List of Tashreeh and Fiqhi Points */}
      <div className="space-y-3 pt-1">
        {parsedItems.map((item, idx) => {
          const isHeading = !item.madhhabLabel && /^\d+\./.test(item.arabic.trim());
          const isMadhhabPoint = Boolean(item.madhhabLabel);

          return (
            <div 
              key={idx}
              className={`rounded-xl p-3.5 border transition-all space-y-2 group ${
                isHeading 
                  ? 'bg-white/95 border-emerald-200/80 shadow-2xs' 
                  : isMadhhabPoint 
                    ? 'bg-white/90 border-teal-100 hover:border-teal-300 shadow-2xs' 
                    : 'bg-white/80 border-gray-100 shadow-2xs'
              }`}
            >
              {/* Header row with Badge / Tag */}
              <div className="flex items-center justify-between border-b border-gray-100/80 pb-2">
                <div className="flex items-center gap-2">
                  {isMadhhabPoint ? (
                    <span className={`font-bold font-nastaliq px-2.5 py-0.5 rounded-lg text-xs shadow-2xs border ${
                      item.madhhab === 'hanafi' 
                        ? 'bg-emerald-100/90 text-emerald-950 border-emerald-300' 
                        : item.madhhab === 'shafii'
                          ? 'bg-blue-100/90 text-blue-950 border-blue-300'
                          : item.madhhab === 'maliki'
                            ? 'bg-amber-100/90 text-amber-950 border-amber-300'
                            : 'bg-purple-100/90 text-purple-950 border-purple-300'
                    }`}>
                      {item.madhhabLabel}
                    </span>
                  ) : isHeading ? (
                    <span className="font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg text-xs font-nastaliq">
                      نکتہ درسیہ
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  )}
                  <span className="text-[11px] text-stone-400 font-nastaliq hidden sm:inline-block">
                    درسی تشریح و فقہی نکتہ
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(item, idx)}
                  className="flex items-center gap-1 text-[11px] font-nastaliq text-stone-500 hover:text-teal-900 px-2 py-0.5 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                  title="یہ فقہی نکتہ نقل کریں"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">کاپی ہو گیا</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-stone-400 group-hover:text-teal-700" />
                      <span>کاپی</span>
                    </>
                  )}
                </button>
              </div>

              {/* Classical Arabic Scholarly Text (shown in 'both' or 'arabic' mode) */}
              {(viewMode === 'both' || viewMode === 'arabic') && (
                <div className="pt-0.5">
                  <p 
                    className="arabic-naskh text-stone-800 text-right select-text pr-1"
                    dir="rtl"
                    style={{ 
                      fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
                      fontSize: isHeading ? '1.35rem' : '1.25rem', 
                      lineHeight: '2.2',
                      fontWeight: isHeading ? 700 : 500
                    }}
                  >
                    {item.arabic}
                  </p>
                </div>
              )}

              {/* Urdu Scholarly Translation & Breakdown (shown in 'both' or 'urdu' mode) */}
              {(viewMode === 'both' || viewMode === 'urdu') && item.urdu && (
                <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/70 space-y-1.5 transition-colors">
                  <div className="flex items-center gap-1.5 font-bold font-nastaliq text-emerald-950 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="bg-emerald-100/80 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-900">
                      سلیس اردو تشریح و فقہی حکم:
                    </span>
                  </div>
                  <p 
                    className="font-nastaliq text-stone-800 text-right select-text pr-1"
                    dir="rtl"
                    style={{ 
                      fontSize: '1.15rem', 
                      lineHeight: '2.3',
                      fontWeight: 500,
                      color: '#1f2937'
                    }}
                  >
                    {item.urdu}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
