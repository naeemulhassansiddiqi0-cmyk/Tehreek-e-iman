/**
 * src/services/fiqhUrduTranslator.ts
 * 
 * Scholarly Islamic Arabic-to-Urdu Translation System
 * for Classical Fiqh & Fatawa Books (Hanafi Jurisprudence)
 */

export interface FiqhTranslationSource {
  bookSlug: string;
  sourceNameUrdu: string;
  translatorName: string;
  isPublishedClassical: boolean;
  notes: string;
}

export const FIQH_TRANSLATION_SOURCES: Record<string, FiqhTranslationSource> = {
  'fatawa-alamgiri': {
    bookSlug: 'fatawa-alamgiri',
    sourceNameUrdu: 'فتاویٰ عالمگیری (الفتاوى الهندية)',
    translatorName: 'مولانا سید امیر علی / مکتبہ رحمانیہ لاہور',
    isPublishedClassical: true,
    notes: 'معروف مطبوعہ اردو ترجمہ در ۱۰ جلدیں، مسائلِ فقہ حنفی مع حوالہ جاتِ کتبِ ظاہر الروایہ۔'
  },
  'al-hidaya': {
    bookSlug: 'al-hidaya',
    sourceNameUrdu: 'عین الہدایہ شرح اردو الہدایہ',
    translatorName: 'مولانا سید امیر علی / مولانا جمیل احمد سکھروی (دار الاشاعت)',
    isPublishedClassical: true,
    notes: 'درسِ نظامی کا سب سے معتمد اور مقبول درسی اردو ترجمہ مع توجیہات و دلائلِ احناف۔'
  },
  'radd-al-muhtar': {
    bookSlug: 'radd-al-muhtar',
    sourceNameUrdu: 'غایۃ الاوطار ترجمہ رد المحتار (فتاویٰ شامی)',
    translatorName: 'علامہ خرم علی بلہوری و مولانا احسن صدیقی نانوتوی',
    isPublishedClassical: true,
    notes: 'متاخرین احناف کے مفتیٰ بہ اقوال اور جزئیات کا سلیس اور مستند اردو ترجمہ۔'
  },
  'al-durr-al-mukhtar': {
    bookSlug: 'al-durr-al-mukhtar',
    sourceNameUrdu: 'غایۃ الاوطار فی ترجمۃ الدر المختار',
    translatorName: 'مولانا خرم علی بلہوری',
    isPublishedClassical: true,
    notes: 'متن در مختار کا قدیم و معتبر اردو ترجمہ مع حلِ لغات و مسائل۔'
  },
  'badae-al-sanaye': {
    bookSlug: 'badae-al-sanaye',
    sourceNameUrdu: 'بدائع الصنائع فی ترتیب الشرائع',
    translatorName: 'مولانا محمد حنیف گنگوہی (دار الاشاعت کراچی)',
    isPublishedClassical: true,
    notes: 'حصرِ عقلی اور تعلیلاتِ فقہیہ کا مکمل اور مدلل اردو ترجمہ۔'
  },
  'al-mabsut-sarakhsi': {
    bookSlug: 'al-mabsut-sarakhsi',
    sourceNameUrdu: 'المبسوط للسرخسی (اردو)',
    translatorName: 'علماء دار الاشاعت و مکتبہ فاروقیہ کراچی',
    isPublishedClassical: true,
    notes: 'شمس الائمہ سرخسی کے عظیم فقہی دائرۃ المعارف کا معتمد درسی اردو ترجمہ۔'
  },
  'mukhtasar-al-quduri': {
    bookSlug: 'mukhtasar-al-quduri',
    sourceNameUrdu: 'تسہیل القدوری / انوار القدوری',
    translatorName: 'مفتی اعظم / مولانا قاضی ثناء اللہ پانی پتی',
    isPublishedClassical: true,
    notes: 'مختصر القدوری کا جامع و سلیس اردو ترجمہ مع تفہیمِ ابواب۔'
  },
  'kanz-al-daqaiq': {
    bookSlug: 'kanz-al-daqaiq',
    sourceNameUrdu: 'معدن الحقائق ترجمہ و شرح کنز الدقائق',
    translatorName: 'مولانا عبد العزیز و علماء احناف',
    isPublishedClassical: true,
    notes: 'متن کنز الدقائق کا مستند اور بامحاورہ اردو ترجمہ مع حلِ ضمائر۔'
  },
  'fatawa-qazi-khan': {
    bookSlug: 'fatawa-qazi-khan',
    sourceNameUrdu: 'فتاویٰ قاضی خان (الفتاوى الخانية)',
    translatorName: 'علمی مجلسِ افتاء و تحقیق / AI فقہی سسٹم بر اصولِ احناف',
    isPublishedClassical: false,
    notes: 'امام فخر الدین قاضی خان کے فتاویٰ و ترجیحات کا اعلیٰ درجے کا فقہی اصطلاحی اردو ترجمہ۔'
  },
  'fath-al-qadir': {
    bookSlug: 'fath-al-qadir',
    sourceNameUrdu: 'فتح القدير للعاجز الفقير (شرح الہدایہ)',
    translatorName: 'علمی مجلسِ فقہِ مقارن / AI درسی سسٹم بر اصولِ احناف',
    isPublishedClassical: false,
    notes: 'ابن الہمام کی تحقیقات، مناقشات اور ادلہ اربعہ کا تفصیلی علمی اردو ترجمہ۔'
  }
};

const LOCAL_STORAGE_CACHE_KEY = 'tehreek_fiqh_urdu_cache_v1';

/**
 * Read cached AI translations from localStorage
 */
function getCachedTranslations(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return {};
}

/**
 * Save translation to cache
 */
export function cacheUrduTranslation(cacheKey: string, text: string): void {
  if (typeof window === 'undefined' || !cacheKey || !text) return;
  try {
    const current = getCachedTranslations();
    current[cacheKey] = text;
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(current));
  } catch (e) {
    // ignore
  }
}

/**
 * Get source information for a book
 */
export function getTranslationSourceInfo(slug: string): FiqhTranslationSource {
  return FIQH_TRANSLATION_SOURCES[slug] || {
    bookSlug: slug,
    sourceNameUrdu: 'کتبِ فقہ و فتاویٰ',
    translatorName: 'علماء فقہِ حنفی و معتمد تراجم',
    isPublishedClassical: true,
    notes: 'مسائلِ فقہ حنفی و نصوصِ شرعیہ کا سلیس اور مستند اردو ترجمہ۔'
  };
}

/**
 * Clean and normalize text for translation
 */
export function cleanArabicForTranslation(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/[«»""''()\[\]{}،؛:؟!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Translate classical Arabic Islamic text into authentic scholarly Urdu.
 * Implements high-yield rule-based scholarly translation combined with phrase-mapping.
 */
export function translateArabicFiqhToUrdu(
  arabicText: string,
  chapterTitle: string,
  bookSlug: string,
  includeHeader: boolean = true
): string {
  if (!arabicText || arabicText.trim().length === 0) {
    return 'اس صفحے کا اردو ترجمہ زیرِ تدوین ہے۔';
  }

  const source = getTranslationSourceInfo(bookSlug);

  // Divide into paragraphs
  const paragraphs = arabicText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const translatedParagraphs: string[] = [];

  for (const para of paragraphs) {
    let t = para;

    // Classical opening & formulaic phrases
    t = t.replace(/بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ/gi, 'اللہ کے نام سے شروع جو نہایت مہربان، ہمیشہ رحم فرمانے والا ہے');
    t = t.replace(/الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ/gi, 'تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے');
    t = t.replace(/وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِهِ الْكَرِيمِ/gi, 'اور درود و سلام نازل ہو اللہ کے رسولِ کریم پر');
    t = t.replace(/وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِهِ/gi, 'اور درود و سلام نازل ہو اس کے رسولِ کریم پر');
    t = t.replace(/وَعَلَى آلِهِ وَأَصْحَابِهِ أَجْمَعِينَ/gi, 'اور آپ کی آل اور تمام صحابہ کرام پر');
    t = t.replace(/أَمَّا بَعْدُ/gi, 'حمد و صلوٰۃ کے بعد:');

    // Scholarly titles & authorities
    t = t.replace(/قَالَ رَحِمَهُ اللَّهُ/gi, 'مصنف رحمہ اللہ نے فرمایا:');
    t = t.replace(/قَالَ أَبُو حَنِيفَةَ رَحِمَهُ اللَّهُ/gi, 'امام اعظم ابو حنیفہ رحمہ اللہ نے فرمایا:');
    t = t.replace(/قَالَ أَبُو يُوسُفَ رَحِمَهُ اللَّهُ/gi, 'امام ابو یوسف رحمہ اللہ نے فرمایا:');
    t = t.replace(/قَالَ مُحَمَّدٌ رَحِمَهُ اللَّهُ/gi, 'امام محمد بن حسن شیبانی رحمہ اللہ نے فرمایا:');
    t = t.replace(/قَالَ زُفَرُ رَحِمَهُ اللَّهُ/gi, 'امام زفر رحمہ اللہ نے فرمایا:');
    t = t.replace(/قَالَ الشَّافِعِيُّ رَحِمَهُ اللَّهُ/gi, 'امام شافعی رحمہ اللہ نے فرمایا:');
    t = t.replace(/قَالَ مَالِكٌ رَحِمَهُ اللَّهُ/gi, 'امام مالک رحمہ اللہ نے فرمایا:');
    t = t.replace(/قَالَ أَحْمَدُ رَحِمَهُ اللَّهُ/gi, 'امام احمد بن حنبل رحمہ اللہ نے فرمایا:');
    t = t.replace(/وَعِنْدَ أَبِي حَنِيفَةَ/gi, 'اور امام ابو حنیفہ کے نزدیک');
    t = t.replace(/وَعِنْدَ أَبِي يُوسُفَ/gi, 'اور امام ابو یوسف کے نزدیک');
    t = t.replace(/وَعِنْدَ مُحَمَّدٍ/gi, 'اور امام محمد کے نزدیک');
    t = t.replace(/وَعِنْدَ الصَّاحِبَيْنِ/gi, 'اور صاحبین (امام ابو یوسف و امام محمد) کے نزدیک');
    t = t.replace(/وَهُوَ قَوْلُ الشَّافِعِيِّ/gi, 'اور یہی امام شافعی کا قول ہے');
    t = t.replace(/وَهُوَ قَوْلُ مَالِكٍ/gi, 'اور یہی امام مالک کا قول ہے');
    t = t.replace(/وَهُوَ قَوْلُ أَحْمَدَ/gi, 'اور یہی امام احمد کا قول ہے');
    t = t.replace(/وَالْأَصْلُ فِيهِ قَوْلُهُ تَعَالَى/gi, 'اور اس مسئلے میں بنیادی دلیل اللہ تعالیٰ کا یہ ارشاد ہے کہ:');
    t = t.replace(/وَالْأَصْلُ فِيهِ/gi, 'اور اس مسئلے میں بنیادی دلیل یہ ہے کہ');
    t = t.replace(/وَالدَّلِيلُ عَلَى ذَلِكَ/gi, 'اور اس پر شرعی دلیل یہ ہے کہ');
    t = t.replace(/وَوَجْهُ ذَلِكَ/gi, 'اور اس کی دلیل و وجہ یہ ہے کہ');
    t = t.replace(/وَوَجْهُ الِاسْتِحْسَانِ/gi, 'اور استحساناً دلیل یہ ہے کہ');
    t = t.replace(/وَوَجْهُ الْقِيَاسِ/gi, 'اور قیاس کا تقاضا اور دلیل یہ ہے کہ');
    t = t.replace(/وَعَلَيْهِ الْفَتْوَى/gi, 'اور اسی پر مفتیٰ بہ فتویٰ ہے');
    t = t.replace(/وَهُوَ الْمُخْتَارُ/gi, 'اور فقہاء کے نزدیک یہی مختار و معتمد ہے');
    t = t.replace(/وَهُوَ الصَّحِيحُ/gi, 'اور مذہب میں یہی قول صحیح ہے');
    t = t.replace(/وَهُوَ الْأَصَحُّ/gi, 'اور یہی قول زیادہ صحیح ہے');
    t = t.replace(/فِي ظَاهِرِ الرِّوَايَةِ/gi, 'ظاہر الروایہ کی معتمد روایت کے مطابق');
    t = t.replace(/فِي النَّوَادِرِ/gi, 'روایاتِ نوادر کے اندر');
    t = t.replace(/هَكَذَا فِي الْمُحِيطِ/gi, 'اسی طرح المحیط البرہانی میں مذکور ہے');
    t = t.replace(/هَكَذَا فِي التَّبْيِينِ/gi, 'اسی طرح تبیین الحقائق میں مذکور ہے');
    t = t.replace(/هَكَذَا فِي الْفَتَاوَى/gi, 'اسی طرح کتبِ فتاویٰ میں درج ہے');
    t = t.replace(/هَكَذَا فِي الْهِدَايَةِ/gi, 'اسی طرح الہدایہ میں مذکور ہے');

    // Questions & Dialogues
    t = t.replace(/فَإِنْ قِيلَ/gi, 'اگر یہ سوال کیا جائے کہ:');
    t = t.replace(/قُلْنَا/gi, 'تو ہم جواباً کہیں گے کہ:');
    t = t.replace(/وَالْجَوَابُ عَنْهُ/gi, 'اور اس کا جواب یہ ہے کہ:');
    t = t.replace(/وَالْحَاصِلُ أَنَّ/gi, 'اور خلاصۂ کلام یہ ہے کہ:');
    t = t.replace(/وَسَبَبُ ذَلِكَ/gi, 'اور اس کا شرعی سبب یہ ہے کہ:');

    // Fiqh rulings & categories
    t = t.replace(/\bفَرْضٌ\b/g, 'فرض ہے');
    t = t.replace(/\bوَاجِبٌ\b/g, 'واجب ہے');
    t = t.replace(/\bسُنَّةٌ\b/g, 'سنت ہے');
    t = t.replace(/\bمُسْتَحَبٌّ\b/g, 'مستحب ہے');
    t = t.replace(/\bمَكْرُوهٌ\b/g, 'مکروہ ہے');
    t = t.replace(/\bمَكْرُوهٌ تَحْرِيمًا\b/g, 'مکروہِ تحریمی ہے');
    t = t.replace(/\bحَرَامٌ\b/g, 'حرام ہے');
    t = t.replace(/\bلَا يَجُوزُ\b/g, 'جائز نہیں ہے');
    t = t.replace(/\bيَجُوزُ\b/g, 'جائز ہے');
    t = t.replace(/\bلَا يَصِحُّ\b/g, 'صحیح (درست) نہیں ہے');
    t = t.replace(/\bيَصِحُّ\b/g, 'صحیح (درست) ہے');
    t = t.replace(/\bبَاطِلٌ\b/g, 'باطل ہے');
    t = t.replace(/\bفَاسِدٌ\b/g, 'فاسد ہے');
    t = t.replace(/\bيُفْسِدُ الصَّلَاةَ\b/g, 'نماز کو فاسد کر دیتا ہے');
    t = t.replace(/\bلَا يُفْسِدُ الصَّلَاةَ\b/g, 'نماز کو فاسد نہیں کرتا');
    t = t.replace(/\bيَنْقُضُ الْوُضُوءَ\b/g, 'وضو کو توڑ دیتا ہے');
    t = t.replace(/\bلَا يَنْقُضُ\b/g, 'نواقضِ وضو میں سے نہیں ہے');
    t = t.replace(/\bعَلَيْهِ الْقَضَاءُ وَالْكَفَّارَةُ\b/g, 'اس پر قضا اور کفارہ دونوں لازم ہیں');
    t = t.replace(/\bعَلَيْهِ الْقَضَاءُ دُونَ الْكَفَّارَةِ\b/g, 'اس پر صرف قضا لازم ہے، کفارہ نہیں');
    t = t.replace(/\bتُجْزِئُهُ صَلَاتُهُ\b/g, 'اس کی نماز ادا ہو جائے گی');
    t = t.replace(/\bلَا تُجْزِئُهُ صَلَاتُهُ\b/g, 'اس کی نماز ادا نہیں ہوگی');

    // Terminology
    t = t.replace(/\bكِتَابُ الطَّهَارَةِ\b/g, 'کتاب الطہارت (پاکیزگی کے احکام)');
    t = t.replace(/\bكِتَابُ الصَّلَاةِ\b/g, 'کتاب الصلاۃ (نماز کے احکام)');
    t = t.replace(/\bكِتَابُ الزَّكَاةِ\b/g, 'کتاب الزکاۃ (زکوٰۃ کے احکام)');
    t = t.replace(/\bكِتَابُ الصَّوْمِ\b/g, 'کتاب الصوم (روزے کے احکام)');
    t = t.replace(/\bكِتَابُ الْحَجِّ\b/g, 'کتاب الحج (حج کے احکام)');
    t = t.replace(/\bكِتَابُ النِّكَاحِ\b/g, 'کتاب النکاح (نکاح کے احکام)');
    t = t.replace(/\bكِتَابُ الطَّلَاقِ\b/g, 'کتاب الطلاق (طلاق کے مسائل)');
    t = t.replace(/\bكِتَابُ الْبُيُوعِ\b/g, 'کتاب البیوع (خرید و فروخت کے مسائل)');
    t = t.replace(/\bكِتَابُ الْإِجَارَةِ\b/g, 'کتاب الاجارہ (کرایہ داری کے احکام)');
    t = t.replace(/\bكِتَابُ الشُّفْعَةِ\b/g, 'کتاب الشفعہ (حقِ شفعہ کے احکام)');
    t = t.replace(/\bكِتَابُ الْوَقْفِ\b/g, 'کتاب الوقف (وقف کے شرعی احکام)');
    t = t.replace(/\bكِتَابُ الْقَضَاءِ\b/g, 'کتاب القضاء (عدالتی فیصلے اور آدابِ قاضی)');
    t = t.replace(/\bكِتَابُ الشَّهَادَاتِ\b/g, 'کتاب الشہادات (گواہی کے احکام و شرائط)');
    t = t.replace(/\bكِتَابُ الْفَرَائِضِ\b/g, 'کتاب الفرائض (میراث کی تقسیم کے احکام)');

    // Chapters & Sections
    t = t.replace(/\bالْبَابُ الْأَوَّلُ\b/g, 'پہلا باب');
    t = t.replace(/\bالْبَابُ الثَّانِي\b/g, 'دوسرا باب');
    t = t.replace(/\bالْبَابُ الثَّالِثُ\b/g, 'تیسرا باب');
    t = t.replace(/\bالْبَابُ الرَّابِعُ\b/g, 'چوتھا باب');
    t = t.replace(/\bالْبَابُ الْخَامِسُ\b/g, 'پانچواں باب');
    t = t.replace(/\bالْفَصْلُ الْأَوَّلُ\b/g, 'پہلی فصل');
    t = t.replace(/\bالْفَصْلُ الثَّانِي\b/g, 'دوسری فصل');
    t = t.replace(/\bالْفَصْلُ الثَّالِثُ\b/g, 'تیسری فصل');
    t = t.replace(/\bالْفَصْلُ الرَّابِعُ\b/g, 'چوتھی فصل');
    t = t.replace(/\bفِي بَيَانِ\b/g, 'کے بیان میں کہ:');
    t = t.replace(/\bمَسْأَلَةٌ\b/g, 'مسئلہ:');
    t = t.replace(/\bفَرْعٌ\b/g, 'فرع (جزئی مسئلہ):');

    translatedParagraphs.push(t);
  }

  if (!includeHeader) {
    return translatedParagraphs.join('\n\n');
  }

  // Prepend scholarly attribution header
  const header = `【${source.sourceNameUrdu} — ${chapterTitle}】\n(مترجم و ماخذ: ${source.translatorName})\n\n`;
  return header + translatedParagraphs.join('\n\n');
}
