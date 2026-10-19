import React, { useState } from 'react';
import { Scale, Sparkles, Languages, Check, Copy, Share2 } from 'lucide-react';
import { SocialShareModal } from './SocialShareModal';

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
  if (cleaned.includes('كيفيات نزول الوحي') || cleaned.includes('صلصلة الجرس')) {
    return 'کیفیاتِ نزولِ وحی: وحی کی دو بنیادی صورتیں تھیں؛ صلصلۃ الجرس جو سب سے شدید تھی اور تمثلِ ملک بر صورتِ انسانی۔';
  }
  if (cleaned.includes('بدء النبوة') || cleaned.includes('الرؤيا الصالحة')) {
    return 'آغازِ نبوت اور روءیائے صالحہ: نبوت کی ابتدا سچے خوابوں اور غارِ حراء میں عبادت و تحنث سے ہوئی۔';
  }
  if (cleaned.includes('فترة الوحي') || cleaned.includes('المدثر')) {
    return 'فترتِ وحی اور اعلانِ رسالت: انذار اور اعلانیہ دعوتِ توحید کے آغاز اور طہارتِ باطن کا بیان۔';
  }
  if (cleaned.includes('حفظ القرآن') || cleaned.includes('لا تحرك به لسانك')) {
    return 'حفظ و جمعِ قرآن: اللہ تعالیٰ کی طرف سے سینۂ نبوی میں قرآن کو محفوظ کرنے اور بیان فرمانے کی ضمانت۔';
  }
  if (cleaned.includes('جود النبي') || cleaned.includes('أجود الناس')) {
    return 'جود و سخاوتِ نبوی: رمضان المبارک میں حضرت جبرائیل کے ساتھ دورۂ قرآن اور تیز ہوا سے بھی بڑھ کر صدقہ و خیرات۔';
  }
  if (cleaned.includes('حديث هرقل') || cleaned.includes('أبو سفيان')) {
    return 'قیصرِ روم اور ابو سفیان: نبوت کے دس بنیادی دلائل، سچائی، امانت داری، اور احکامِ توحید و صلہ رحمی کی برتری کا اعتراف۔';
  }

  // Fallback
  return cleaned;
}

/**
 * Parses raw Tashreeh block into structured item with Madhhab detection and Urdu translation.
 */
export function parseTashreehBlock(rawBlock: string): TashreehItemParsed {
  if (!rawBlock) return { arabic: '', urdu: '' };

  let madhhab: 'hanafi' | 'shafii' | 'maliki' | 'hanbali' | 'general' = 'general';
  let madhhabLabel = '';

  if (rawBlock.includes('احناف') || rawBlock.includes('الحنفية')) {
    madhhab = 'hanafi';
    madhhabLabel = 'مذہبِ احناف (الحنفیۃ)';
  } else if (rawBlock.includes('شوافع') || rawBlock.includes('الشافعية')) {
    madhhab = 'shafii';
    madhhabLabel = 'مذہبِ شوافع (الشافعیۃ)';
  } else if (rawBlock.includes('مالکیہ') || rawBlock.includes('المالكية')) {
    madhhab = 'maliki';
    madhhabLabel = 'مذہبِ مالکیہ (المالکیۃ)';
  } else if (rawBlock.includes('حنابلہ') || rawBlock.includes('الحنابلة')) {
    madhhab = 'hanbali';
    madhhabLabel = 'مذہبِ حنابلہ (الحنابلۃ)';
  }

  const urduSeparatorRegex = /(?:\n\s*)?(?:❖\s*)?اردو\s*(?:وضاحت|تشریح|ترجمہ)?[:：]\s*/i;
  
  if (urduSeparatorRegex.test(rawBlock)) {
    const parts = rawBlock.split(urduSeparatorRegex);
    const arabicPart = parts[0].trim();
    const urduPart = parts.slice(1).join(' ').trim();
    return {
      madhhab,
      madhhabLabel,
      arabic: arabicPart,
      urdu: urduPart
    };
  }

  // If block starts with ❖ اردو تشریح without an Arabic part:
  if (/^❖?\s*اردو\s*(?:وضاحت|تشریح|ترجمہ)?[:：]/i.test(rawBlock)) {
    const cleanedUrdu = rawBlock.replace(/^❖?\s*اردو\s*(?:وضاحت|تشریح|ترجمہ)?[:：]\s*/i, '').trim();
    return {
      madhhab,
      madhhabLabel,
      arabic: '',
      urdu: cleanedUrdu
    };
  }

  // Check if primarily Urdu
  const isPrimarilyUrdu = /[\u0679\u0686\u0698\u0691\u06BA\u06D2\u06AF\u06C1\u06BE]/.test(rawBlock) ||
    /ہے|ہیں|ہو|تھا|تھی|گے|کے|کی|کو|سے|میں|پر|اور|نیت|نماز|روزہ|وضو/.test(rawBlock);

  if (isPrimarilyUrdu) {
    return {
      madhhab,
      madhhabLabel,
      arabic: '',
      urdu: rawBlock.trim()
    };
  }

  // It's in Arabic -> derive Urdu translation
  const arabicText = rawBlock.trim();
  const urduText = translateArabicFiqhToUrdu(arabicText);

  return {
    madhhab,
    madhhabLabel,
    arabic: arabicText,
    urdu: urduText !== arabicText ? urduText : ''
  };
}

export const parseTashreehLine = parseTashreehBlock;

/**
 * Group full text into distinct scholarly blocks and deduplicate identical items.
 */
export function parseTashreehText(text: string): TashreehItemParsed[] {
  if (!text || text.trim().length === 0) return [];

  const normalized = text.replace(/\r\n/g, '\n');
  const rawLines = normalized.split('\n');
  const blocks: string[] = [];
  let currentBlock = '';

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = '';
      }
      continue;
    }

    // Check if this line starts a new point (e.g. "1. ", "2. ", "3. ", "4. ", or "• ")
    const isNewPoint = /^(?:[0-9]+[\.\)]|\s*•\s*(?:احناف|شوافع|مالکیہ|حنابلہ|الجمهور|نکتہ))/i.test(trimmed);
    const isUrduContinuation = /^(?:❖\s*)?اردو\s*(?:وضاحت|تشریح|ترجمہ)?[:：]/i.test(trimmed);

    if (isNewPoint && currentBlock && !isUrduContinuation) {
      blocks.push(currentBlock);
      currentBlock = trimmed;
    } else {
      if (currentBlock) {
        currentBlock += '\n' + trimmed;
      } else {
        currentBlock = trimmed;
      }
    }
  }
  if (currentBlock) {
    blocks.push(currentBlock);
  }

  const items: TashreehItemParsed[] = [];
  const seenUrdu = new Set<string>();

  for (const block of blocks) {
    const parsed = parseTashreehBlock(block);
    if (!parsed.arabic && !parsed.urdu) continue;

    // Deduplicate identical points
    const normalizeKey = (s: string) => s.replace(/[\s\.\:\-،؛؟!]+/g, ' ').trim();
    const key = normalizeKey(parsed.urdu || parsed.arabic);
    if (key && seenUrdu.has(key)) {
      continue;
    }
    if (key) seenUrdu.add(key);

    items.push(parsed);
  }

  return items;
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
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareData, setShareData] = useState<{ title: string; arabic?: string; urdu?: string; notes?: string } | null>(null);

  if (!tashreehText || tashreehText.trim().length === 0) return null;

  const parsedItems = parseTashreehText(tashreehText);

  const handleCopy = (item: TashreehItemParsed, idx: number) => {
    const textToCopy = `عربی نکتہ: ${item.arabic}\nاردو تشریح: ${item.urdu}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const handleCopyAll = () => {
    const compiled = parsedItems.map((item, i) => {
      const label = item.madhhabLabel ? `【${item.madhhabLabel}】` : `【نکتہ ${i + 1}】`;
      return `${label}\nعربی عبارت: ${item.arabic}\nاردو تشریح: ${item.urdu}`;
    }).join('\n\n────────────────────\n\n');
    const fullText = `【درسی تشریح و تقابلی فقہی مذاہب (احناف، شوافع، مالکیہ، حنابلہ)】\n\n${compiled}\n\n🌐 تحریکِ ایمان اسلامی پورٹل • https://tehreek-e-iman.pages.dev`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2200);
    }
  };

  const handleShareItem = (item: TashreehItemParsed, idx: number) => {
    setShareData({
      title: item.madhhabLabel ? `فقہی نکتہ: ${item.madhhabLabel}` : `درسی نکتہ نمبر ${idx + 1}`,
      arabic: item.arabic,
      urdu: item.urdu,
      notes: 'تقابلی فقہی مذاہب و درسی تحقیق • تحریکِ ایمان'
    });
    setIsShareModalOpen(true);
  };

  const handleShareAll = () => {
    const summary = parsedItems.slice(0, 4).map(it => `${it.madhhabLabel || 'نکتہ'}: ${it.urdu}`).join('\n\n');
    setShareData({
      title: 'درسی تشریح و تقابلی فقہی مذاہب (ائمۂ اربعہ)',
      urdu: summary,
      notes: 'احناف، شوافع، مالکیہ اور حنابلہ کے معتمد اقوال'
    });
    setIsShareModalOpen(true);
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

        {/* Action Controls: Copy All, Share, and View Mode Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1 text-xs font-bold font-nastaliq bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:text-teal-900 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-slate-700 shadow-2xs transition cursor-pointer"
            title="تمام فقہی نکات اور درسی تشریح نقل کریں"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
            <span>{copiedAll ? 'تمام تشریح کاپی ہو گئی!' : 'تمام تشریح نقل کریں'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareAll}
            className="flex items-center gap-1 text-xs font-bold font-nastaliq bg-teal-700 hover:bg-teal-800 text-white px-2.5 py-1 rounded-xl shadow-2xs transition cursor-pointer"
            title="تمام درسی تشریح واٹس ایپ یا ٹیلی گرام پر شیئر کریں"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-300" />
            <span>شیئر کریں</span>
          </button>

          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-emerald-200/80 dark:border-slate-700 shadow-2xs text-xs font-nastaliq">
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

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(item, idx)}
                    className="flex items-center gap-1 text-[11px] font-nastaliq text-stone-500 hover:text-teal-900 px-2 py-0.5 rounded-md hover:bg-emerald-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="یہ فقہی نکتہ نقل کریں"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">کاپی ہو گیا!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-400 group-hover:text-teal-700" />
                        <span>کاپی کریں</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareItem(item, idx)}
                    className="flex items-center gap-1 text-[11px] font-nastaliq text-teal-700 dark:text-teal-400 hover:text-teal-900 px-2 py-0.5 rounded-md hover:bg-teal-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="یہ فقہی نکتہ سوشل ایپس پر شیئر کریں"
                  >
                    <Share2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span>شیئر</span>
                  </button>
                </div>
              </div>

              {/* Classical Arabic Scholarly Text (shown in 'both' or 'arabic' mode) */}
              {(viewMode === 'both' || viewMode === 'arabic') && item.arabic && item.arabic !== item.urdu && (
                <div className="pt-0.5">
                  <p 
                    className="arabic-naskh text-stone-900 dark:text-amber-200 text-right select-text pr-1 font-semibold"
                    dir="rtl"
                    style={{ 
                      fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
                      fontSize: isHeading ? '1.35rem' : '1.25rem', 
                      lineHeight: '2.2',
                      fontWeight: isHeading ? 700 : 600
                    }}
                  >
                    {item.arabic}
                  </p>
                </div>
              )}

              {/* Urdu Scholarly Translation & Breakdown (shown in 'both' or 'urdu' mode) */}
              {(viewMode === 'both' || viewMode === 'urdu') && item.urdu && (
                <div className="bg-emerald-50/80 dark:bg-emerald-950/60 rounded-xl p-3 border border-emerald-300 dark:border-emerald-700 space-y-1.5 transition-colors">
                  <div className="flex items-center gap-1.5 font-bold font-nastaliq text-emerald-950 dark:text-emerald-300 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="bg-emerald-100/90 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-950 dark:text-emerald-200">
                      سلیس اردو تشریح و فقہی حکم:
                    </span>
                  </div>
                  <p 
                    className="font-nastaliq text-stone-950 dark:text-stone-100 text-right select-text pr-1 font-medium"
                    dir="rtl"
                    style={{ 
                      fontSize: '1.2rem', 
                      lineHeight: '2.3',
                      fontWeight: 600
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

      {/* Social Share Modal for Fiqh Insights */}
      {shareData && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareData(null);
          }}
          title={shareData.title}
          arabicText={shareData.arabic}
          urduText={shareData.urdu}
          scholarlyNotes={shareData.notes}
          reference="درسی تشریح و تقابلی فقہی مذاہب (احناف، شوافع، مالکیہ، حنابلہ)"
          pageUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        />
      )}
    </div>
  );
};
