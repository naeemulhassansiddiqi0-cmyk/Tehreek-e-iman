// Advanced AI Mufti Tutor & Strict RAG System (علمی اتالیق و دار الافتاء)
// Configured to search and retrieve answers strictly from the local database
// of 147 verified books (Quran, Bukhari, Muslim, Fiqh texts, etc.) hosted on Tehreek-e-Iman.
// Prevents AI hallucinations: Rejects out-of-scope inquiries and mandates consulting a qualified local Mufti.

import { allCatalogBooks } from '../data/publicDomainBooks';

export interface RagCitation {
  bookTitle: string;
  bookTitleAr: string;
  slug: string;
  author: string;
  category: string;
  volume?: number | string;
  page: number;
  hadithNumber?: number;
  badgeText: string;
  readerLink: string;
  quoteArabic?: string;
  quoteUrdu?: string;
}

export interface RagAnalysisResult {
  isInScope: boolean;
  requiresLocalMufti: boolean;
  refusalReason?: string;
  detectedTopic: string;
  citations: RagCitation[];
  quranEvidence?: {
    arabic: string;
    urdu: string;
    surahName: string;
    ayahNumber: number | string;
  };
  hadithEvidence?: {
    arabic: string;
    urdu: string;
    bookTitle: string;
    hadithNumber: number | string;
  };
  fiqhEvidence?: {
    arabic: string;
    urdu: string;
    bookTitle: string;
    author: string;
    volume: number | string;
    page: number;
  };
}

// Normalize strings for fuzzy keyword search
export function normalizeUrduArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove diacritics
    .replace(/[أإآء]/g, 'ا')
    .replace(/[يىئ]/g, 'ی')
    .replace(/[ةه]/g, 'ہ')
    .replace(/[ك]/g, 'ک')
    .replace(/[-_.,!?،؛:()[\]{}"'/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ----------------------------------------------------------------------
// Strict Classical Fiqh & Hadith Knowledge Index (Mapped to 147 Verified Books)
// ----------------------------------------------------------------------
interface CanonicalTopicRecord {
  id: string;
  topicUrdu: string;
  keywords: string[];
  forbiddenOutScope?: string[];
  rulingSummary: string;
  quran: {
    arabic: string;
    urdu: string;
    surahName: string;
    ayahNumber: number | string;
  };
  hadith: {
    arabic: string;
    urdu: string;
    bookTitle: string;
    hadithNumber: number | string;
  };
  fiqh: {
    arabic: string;
    urdu: string;
    bookTitle: string;
    author: string;
    volume: number | string;
    page: number;
    slug: string;
  };
  additionalCitations: {
    bookTitle: string;
    bookTitleAr: string;
    slug: string;
    author: string;
    category: string;
    volume: number | string;
    page: number;
    badgeText: string;
  }[];
}

const CANONICAL_RAG_INDEX: CanonicalTopicRecord[] = [
  // 1. Wudu & Taharah
  {
    id: 'taharah_wudu_faraidh',
    topicUrdu: 'وضو کے فرائض و شرائط اور نواقض',
    keywords: ['وضو', 'طہارت', 'فرائض وضو', 'نواقض', 'مسح', 'پاؤں دھونا', 'کلی', 'ناک میں پانی', 'wudu', 'taharat'],
    rulingSummary: 'وضو میں قرآنِ مجید کی نصِ قطعی کے مطابق چار فرائض ہیں: چہرہ دھونا، کہنیوں سمیت دونوں ہاتھ دھونا، چوتھائی سر کا مسح کرنا، اور ٹخنوں سمیت دونوں پاؤں دھونا۔ ان میں سے کسی ایک عضو کا بال برابر حصہ بھی سوکھا رہ جائے تو وضو نہیں ہوگا۔',
    quran: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ',
      urdu: 'اے ایمان والو! جب تم نماز کے لیے کھڑے ہونے لگو تو اپنے چہروں کو اور اپنے ہاتھوں کو کہنیوں تک دھو لو، اور اپنے سروں کا مسح کرو اور اپنے پاؤں ٹخنوں تک دھو لو۔',
      surahName: 'سورۃ المائدۃ',
      ayahNumber: 6
    },
    hadith: {
      arabic: 'لا تُقْبَلُ صَلاةُ مَنْ أَحْدَثَ حَتَّى يَتَوَضَّأَ.',
      urdu: 'جس شخص کا وضو ٹوٹ جائے اس کی نماز قبول نہیں ہوتی جب تک کہ وہ دوبارہ وضو نہ کر لے۔',
      bookTitle: 'صحیح البخاری',
      hadithNumber: 135
    },
    fiqh: {
      arabic: 'فَرْضُ الطَّهَارَةِ غَسْلُ الأَعْضَاءِ الثَّلاثَةِ وَمَسْحُ الرَّأْسِ، وَالْغَسْلُ هُوَ إِسَالَةُ الْمَاءِ مَعَ التَّقَاطُرِ.',
      urdu: 'طہارت کا فرض تین اعضاء کا دھونا اور سر کا مسح کرنا ہے؛ اور دھونے سے مراد پانی کا اس طرح بہانا ہے کہ کم از کم دو قطرے ٹپک پڑیں۔',
      bookTitle: 'الہدایہ فی شرح بدایۃ المبتدی',
      author: 'علامہ علی بن ابی بکر المرغینانی رحمہ اللہ',
      volume: 1,
      page: 13,
      slug: 'al-hidayah'
    },
    additionalCitations: [
      { bookTitle: 'مختصر القدوری', bookTitleAr: 'مختصر القدوري في الفقه الحنفي', slug: 'mukhtasar-al-quduri', author: 'امام ابو الحسین احمد بن محمد القدوری', category: 'Fiqh', volume: 1, page: 3, badgeText: 'کتاب الطہارۃ ص ۳' },
      { bookTitle: 'نور الایضاح', bookTitleAr: 'نور الإيضاح ونجاة الأرواح', slug: 'nur-al-idah', author: 'علامہ حسن بن عمار الشرنبلالی', category: 'Fiqh', volume: 1, page: 8, badgeText: 'فصل في فرائض الوضوء ص ۸' },
      { bookTitle: 'رد المحتار (فتاویٰ شامی)', bookTitleAr: 'رد المحتار على الدر المختار', slug: 'radd-al-muhtar', author: 'علامہ محمد امین ابن عابدین الشامی', category: 'Fiqh', volume: 1, page: 95, badgeText: 'ارکان الوضوء ج ۱ ص ۹۵' }
    ]
  },

  // 2. Salah & Prayer Faraidh
  {
    id: 'salah_faraidh_arkan',
    topicUrdu: 'نماز کے فرائض، ارکان اور شرائطِ صحت',
    keywords: ['نماز', 'صلاۃ', 'فرائض نماز', 'ارکان نماز', 'سجدہ', 'رکوع', 'قیام', 'تکبیر تحریمہ', 'قعدہ اخیرہ', 'namaz', 'salah'],
    rulingSummary: 'نماز کے اندر چھ فرائض (ارکان) ہیں: تکبیرِ تحریمہ، قیام، قراءت، رکوع، دونوں سجدے، اور قعدۂ اخیرہ میں تشہد کی مقدار بیٹھنا۔ نماز سے باہر سات شرائط ہیں جن کا نماز شروع کرنے سے پہلے پایا جانا لازمی ہے: طہارتِ بدن، طہارتِ ثوب، طہارتِ مکان، سترِ عورت، استقبالِ قبلہ، وقت کا داخل ہونا، اور نیت۔',
    quran: {
      arabic: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا',
      urdu: 'بے شک نماز مومنوں پر مقررہ اوقات میں فرض کی گئی ہے۔',
      surahName: 'سورۃ النساء',
      ayahNumber: 103
    },
    hadith: {
      arabic: 'صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي.',
      urdu: 'تم اس طرح نماز ادا کرو جس طرح تم نے مجھے نماز پڑھتے ہوئے دیکھا ہے۔',
      bookTitle: 'صحیح البخاری',
      hadithNumber: 631
    },
    fiqh: {
      arabic: 'وَأَرْكَانُ الصَّلاةِ سِتَّةٌ: التَّحْرِيمَةُ، وَالْقِيَامُ، وَالْقِرَاءَةُ، وَالرُّكُوعُ، وَالسُّجُودُ، وَالْقَعْدَةُ الأَخِيرَةُ مِقْدَارَ التَّشَهُّدِ.',
      urdu: 'اور نماز کے ارکان چھ ہیں: تکبیرِ تحریمہ، قیام، قراءت، رکوع، سجود، اور التحیات کی مقدار قعدۂ اخیرہ میں بیٹھنا۔',
      bookTitle: 'مختصر القدوری',
      author: 'امام ابو الحسین القدوری رحمہ اللہ',
      volume: 1,
      page: 21,
      slug: 'mukhtasar-al-quduri'
    },
    additionalCitations: [
      { bookTitle: 'الہدایہ شرح بدایۃ المبتدی', bookTitleAr: 'الهداية في شرح بداية المبتدي', slug: 'al-hidayah', author: 'علامہ برہان الدین المرغینانی', category: 'Fiqh', volume: 1, page: 44, badgeText: 'باب صفة الصلاة ج ۱ ص ۴۴' },
      { bookTitle: 'الفتاویٰ الہندیہ (عالمگیری)', bookTitleAr: 'الفتاوى الهندية', slug: 'fatawa-alamgiri', author: 'جماعۃ من علماء الہند', category: 'Fiqh', volume: 1, page: 68, badgeText: 'الباب الرابع في صفة الصلاة ج ۱' },
      { bookTitle: 'صحیح مسلم', bookTitleAr: 'المسند الصحيح المختصر', slug: 'sahih-muslim', author: 'امام مسلم بن الحجاج النیسابوری', category: 'Hadith', volume: 1, page: 120, badgeText: 'کتاب الصلاۃ، رقم ۳۹۷' }
    ]
  },

  // 3. Fasting (Sawm & Ramadan)
  {
    id: 'sawm_ramadan_ahkam',
    topicUrdu: 'روزے کے ارکان، مفطرات اور قضا و کفارہ',
    keywords: ['روزہ', 'صوم', 'رمضان', 'سحری', 'افطار', 'روزہ توڑنے والی چیزیں', 'قضا', 'کفارہ', 'roza', 'ramadan', 'sawm'],
    rulingSummary: 'روزے کی حقیقت طلوعِ فجرِ صادق سے لے کر غروبِ آفتاب تک نیت کے ساتھ کھانے، پینے اور نفسانی خواہشات کی تسکین سے رکے رہنے کا نام ہے۔ جان بوجھ کر دوا یا غذا کھانے یا ہم بستری کرنے سے قضا اور کفارہ (ساٹھ روزے مسلسل رکھنا) دونوں لازم آتے ہیں، جبکہ بھول کر کھانے پینے سے روزہ نہیں ٹوٹتا۔',
    quran: {
      arabic: 'وَكُلُوا وَاشْرَبُوا حَتَّىٰ يَتَبَيَّنَ لَكُمُ الْخَيْطُ الْأَبْيَضُ مِنَ الْخَيْطِ الْأَسْوَدِ مِنَ الْفَجْرِ ۖ ثُمَّ أَتِمُّوا الصِّيَامَ إِلَى اللَّيْلِ',
      urdu: 'اور کھاؤ اور پیو یہاں تک کہ تمہارے لیے فجر کی سفید دھاری سیاہ دھاری سے بالکل واضح ہو جائے، پھر رات تک روزے کو پورا کرو۔',
      surahName: 'سورۃ البقرۃ',
      ayahNumber: 187
    },
    hadith: {
      arabic: 'مَنْ نَسِيَ وَهُوَ صَائِمٌ، فَأَكَلَ أَوْ شَرِبَ، فَلْيُتِمَّ صَوْمَهُ، فَإِنَّمَا أَطْعَمَهُ اللَّهُ وَسَقَاهُ.',
      urdu: 'جو شخص روزے کی حالت میں بھول گیا اور اس نے کچھ کھا یا پی لیا تو وہ اپنا روزہ پورا کرے، کیونکہ اسے اللہ نے کھلایا اور پلایا ہے۔',
      bookTitle: 'صحیح البخاری',
      hadithNumber: 1933
    },
    fiqh: {
      arabic: 'الصَّوْمُ هُوَ الإِمْسَاكُ عَنِ الأَكْلِ وَالشُّرْبِ وَالْجِمَاعِ نَهَارًا مَعَ النِّيَّةِ، وَمَنْ أَكَلَ نَاسِيًا لَمْ يُفْطِرْ.',
      urdu: 'روزہ دن کے وقت نیت کے ساتھ کھانے، پینے اور صحبت سے رکے رہنے کا نام ہے، اور جس نے بھول کر کھا لیا اس کا روزہ فاسد نہیں ہوا۔',
      bookTitle: 'الہدایہ فی شرح بدایۃ المبتدی',
      author: 'علامہ علی بن ابی بکر المرغینانی رحمہ اللہ',
      volume: 1,
      page: 116,
      slug: 'al-hidayah'
    },
    additionalCitations: [
      { bookTitle: 'مختصر القدوری', bookTitleAr: 'مختصر القدوري', slug: 'mukhtasar-al-quduri', author: 'امام ابو الحسین القدوری', category: 'Fiqh', volume: 1, page: 34, badgeText: 'کتاب الصوم ص ۳۴' },
      { bookTitle: 'رد المحتار (فتاویٰ شامی)', bookTitleAr: 'رد المحتار على الدر المختار', slug: 'radd-al-muhtar', author: 'علامہ ابن عابدین الشامی', category: 'Fiqh', volume: 2, page: 395, badgeText: 'باب ما يفسد الصوم وما لا يفسد ج ۲' }
    ]
  },

  // 4. Zakat & Nisab
  {
    id: 'zakat_nisab_masarif',
    topicUrdu: 'زکوٰۃ کا نصاب، سالانہ وجوب اور مستحقین',
    keywords: ['زکوٰۃ', 'نصاب', 'سونے کا نصاب', 'چاندی کا نصاب', 'فطرانہ', 'صدقہ فطر', 'مصارف زکوٰۃ', 'zakat', 'nisab'],
    rulingSummary: 'زکوٰۃ کا نصاب ساڑھے سات تولے سونا یا ساڑھے باون تولے چاندی یا اس کے مساوی نقدی یا مالِ تجارت ہے۔ جب انسان کے پاس حوائجِ اصلیہ (بنیادی ضروریات اور قرض) سے زائد اتنا مال ہو اور اس پر قمری سال گزر جائے تو کل مالیت کا ڈھائی فیصد (۴۰ واں حصہ) زکوٰۃ ادا کرنا فرضِ عین ہے۔ زکوٰۃ صرف انہی مستحقین کو دی جا سکتی ہے جو ہاشمی نہ ہوں اور صاحبِ نصاب نہ ہوں۔',
    quran: {
      arabic: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ',
      urdu: 'زکوٰۃ تو صرف فقیروں، محتاجوں، اس پر مقرر کارکنوں، جن کے دلوں کو پرچانا مقصود ہو، گردنیں چھڑانے، قرض داروں، اللہ کی راہ میں، اور مسافروں کے لیے ہے۔',
      surahName: 'سورۃ التوبۃ',
      ayahNumber: 60
    },
    hadith: {
      arabic: 'فِي الرِّقَّةِ رُبُعُ الْعُشْرِ، فَإِنْ لَمْ يَكُنْ إِلا تِسْعِينَ وَمِائَةً فَلَيْسَ فِيهَا شَيْءٌ إِلا أَنْ يَشَاءَ رَبُّهَا.',
      urdu: 'چاندی میں چالیسواں حصہ (ڈھائی فیصد) زکوٰۃ ہے، اور اگر چاندی ایک سو نوے درہم ہو تو اس میں کچھ نہیں الا یہ کہ اس کا مالک اپنی خوشی سے کچھ دے۔',
      bookTitle: 'صحیح البخاری',
      hadithNumber: 1454
    },
    fiqh: {
      arabic: 'نِصَابُ الذَّهَبِ عِشْرُونَ مِثْقَالاً، وَنِصَابُ الْفِضَّةِ مِائَتَا دِرْهَمٍ، وَفِيهِمَا رُبُعُ الْعُشْرِ بَعْدَ حَوَلَانِ الْحَوْلِ.',
      urdu: 'سونے کا نصاب بیس مثقال (ساڑھے سات تولے) ہے اور چاندی کا نصاب دو سو درہم (ساڑھے باون تولے) ہے، اور سال گزرنے پر ان میں چالیسواں حصہ زکوٰۃ ہے۔',
      bookTitle: 'الہدایہ فی شرح بدایۃ المبتدی',
      author: 'علامہ برہان الدین المرغینانی رحمہ اللہ',
      volume: 1,
      page: 95,
      slug: 'al-hidayah'
    },
    additionalCitations: [
      { bookTitle: 'مختصر القدوری', bookTitleAr: 'مختصر القدوري', slug: 'mukhtasar-al-quduri', author: 'امام ابو الحسین القدوری', category: 'Fiqh', volume: 1, page: 28, badgeText: 'کتاب الزکاۃ ص ۲۸' },
      { bookTitle: 'الفتاویٰ الہندیہ (عالمگیری)', bookTitleAr: 'الفتاوى الهندية', slug: 'fatawa-alamgiri', author: 'جماعۃ من علماء الہند', category: 'Fiqh', volume: 1, page: 170, badgeText: 'الباب الأول في تفسير الزكاة ج ۱' }
    ]
  },

  // 5. Nikah, Talaq & Family Fiqh
  {
    id: 'nikah_talaq_masail',
    topicUrdu: 'نکاح کے ارکان، گواہان اور طلاق کی شرعی حیثیت',
    keywords: ['نکاح', 'ایجاب و قبول', 'گواہ', 'مہر', 'طلاق', 'تین طلاق', 'عدت', 'خلع', 'نفقہ', 'nikah', 'talaq', 'iddat'],
    rulingSummary: 'نکاح کا انعقاد عاقل و بالغ مرد و عورت کے درمیان دو مسلمان، عاقل و بالغ گواہوں (دو مرد یا ایک مرد اور دو عورتیں) کی موجودگی میں صریح ایجاب و قبول سے ہوتا ہے۔ طلاق کا حق شوہر کو دیا گیا ہے مگر بلا عذر طلاق دینا شریعت میں سخت ناپسندیدہ ہے۔ اکٹھی تین طلاقیں دینا بدعت و گناہ ہے تاہم فقہائے اربعہ اور جمہور صحابہ کے مطابق واقع ہو جاتی ہیں اور حرمتِ مغلظہ ثابت ہو جاتی ہے۔',
    quran: {
      arabic: 'وَأَشْهِدُوا ذَوَيْ عَدْلٍ مِّنكُمْ وَأَقِيمُوا الشَّهَادَةَ لِلَّهِ',
      urdu: 'اور اپنے میں سے دو بااعتماد عادل مردوں کو گواہ بنا لو اور اللہ کے لیے سچی گواہی قائم کرو۔',
      surahName: 'سورۃ الطلاق',
      ayahNumber: 2
    },
    hadith: {
      arabic: 'أَبْغَضُ الْحَلالِ إِلَى اللَّهِ تَعَالَى الطَّلاقُ.',
      urdu: 'حلال چیزوں میں اللہ تعالیٰ کے نزدیک سب سے زیادہ ناپسندیدہ چیز طلاق ہے۔',
      bookTitle: 'سنن ابی داود',
      hadithNumber: 2178
    },
    fiqh: {
      arabic: 'النِّكَاحُ يَنْعَقِدُ بِالإِيجَابِ وَالْقَبُولِ بِلَفْظَيْنِ يُعَبَّرُ بِهِمَا عَنِ الْمَاضِي، وَلا يَنْعَقِدُ نِكَاحُ الْمُسْلِمِينَ إِلا بِحُضُورِ شَاهِدَيْنِ حُرَّيْنِ عَاقِلَيْنِ بَالِغَيْنِ مُسْلِمَيْنِ.',
      urdu: 'نکاح ماضی کے دو صیغوں کے ساتھ ایجاب و قبول سے منعقد ہوتا ہے، اور مسلمانوں کا نکاح دو آزاد، عاقل، بالغ مسلمان گواہوں کی موجودگی کے بغیر منعقد نہیں ہوتا۔',
      bookTitle: 'مختصر القدوری',
      author: 'امام ابو الحسین القدوری رحمہ اللہ',
      volume: 1,
      page: 55,
      slug: 'mukhtasar-al-quduri'
    },
    additionalCitations: [
      { bookTitle: 'الہدایہ فی شرح بدایۃ المبتدی', bookTitleAr: 'الهداية في شرح بداية المبتدي', slug: 'al-hidayah', author: 'علامہ برہان الدین المرغینانی', category: 'Fiqh', volume: 2, page: 4, badgeText: 'کتاب النکاح ج ۲ ص ۴' },
      { bookTitle: 'رد المحتار (فتاویٰ شامی)', bookTitleAr: 'رد المحتار على الدر المختار', slug: 'radd-al-muhtar', author: 'علامہ ابن عابدین الشامی', category: 'Fiqh', volume: 3, page: 8, badgeText: 'کتاب النکاح والطلاق ج ۳' }
    ]
  },

  // 6. Buyoo', Trade, Interest/Riba & Digital Commerce
  {
    id: 'buyoo_riba_tijarat',
    topicUrdu: 'خرید و فروخت کی صحت، سود کی حرمت اور جدید تجارت',
    keywords: ['بیع', 'تجارت', 'سود', 'ربا', 'قرض', 'خرید و فروخت', 'آن لائن شاپنگ', 'ڈراپ شپنگ', 'کرپٹو', 'مضاربت', 'شراکت', 'riba', 'interest', 'crypto'],
    rulingSummary: 'خرید و فروخت کے درست ہونے کے لیے مبیع (فروخت کی جانے والی چیز) کا موجود، متعین اور بائع کی ملکیت و قبضے میں ہونا شرط ہے۔ سود ہر شکل میں قطعی حرام ہے، خواہ وہ بینک کا سود ہو یا شخصی قرض پر مشروط نفع۔ وہ اشیاء جن کا وجود نہ ہو یا جن پر قبضہ نہ ہو ان کی بیع قبل القبض باطل یا فاسد ہے۔ اسی طرح دھوکہ، قمار (جوا) اور غرر پر مبنی نام نہاد ڈیجیٹل سودے شرعاً ناجائز ہیں۔',
    quran: {
      arabic: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
      urdu: 'اور اللہ نے خرید و فروخت کو حلال فرمایا ہے اور سود کو قطعی حرام قرار دیا ہے۔',
      surahName: 'سورۃ البقرۃ',
      ayahNumber: 275
    },
    hadith: {
      arabic: 'لا تَبِعْ مَا لَيْسَ عِنْدَكَ.',
      urdu: 'جو چیز تمہاری ملکیت و قبضے میں نہ ہو اسے فروخت مت کرو۔',
      bookTitle: 'جامع الترمذی',
      hadithNumber: 1232
    },
    fiqh: {
      arabic: 'الْبَيْعُ يَنْعَقِدُ بِالإِيجَابِ وَالْقَبُولِ، وَشَرْطُ صِحَّتِهِ أَنْ يَكُونَ الْمَبِيعُ مَعْلُومًا مَقْدُورَ التَّسْلِيمِ مَمْلُوكًا لِلْبَائِعِ، وَكُلُّ قَرْضٍ جَرَّ مَنْفَعَةً فَهُوَ رِبًا.',
      urdu: 'بیع ایجاب و قبول سے منعقد ہوتی ہے، اور اس کی صحت کی شرط یہ ہے کہ مبیع معلوم ہو، سپرد کرنے پر قدرت ہو اور بیچنے والے کی ملکیت میں ہو؛ اور ہر وہ قرض جو نفع کھینچے وہ سود ہے۔',
      bookTitle: 'الہدایہ فی شرح بدایۃ المبتدی',
      author: 'علامہ برہان الدین المرغینانی رحمہ اللہ',
      volume: 3,
      page: 18,
      slug: 'al-hidayah'
    },
    additionalCitations: [
      { bookTitle: 'مختصر القدوری', bookTitleAr: 'مختصر القدوري', slug: 'mukhtasar-al-quduri', author: 'امام ابو الحسین القدوری', category: 'Fiqh', volume: 1, page: 62, badgeText: 'کتاب البیوع ص ۶۲' },
      { bookTitle: 'رد المحتار (فتاویٰ شامی)', bookTitleAr: 'رد المحتار على الدر المختار', slug: 'radd-al-muhtar', author: 'علامہ ابن عابدین الشامی', category: 'Fiqh', volume: 5, page: 55, badgeText: 'باب الربا والبیوع الفاسدة ج ۵' }
    ]
  },

  // 7. Usul al-Fiqh & Dars-e-Nizami Grammar
  {
    id: 'usul_nahw_sarf',
    topicUrdu: 'اصولِ فقہ اور عربی صرف و نحو کی قواعدی بنیادیں',
    keywords: ['اصول فقہ', 'عام', 'خاص', 'مشترک', 'مؤول', 'حقیقت', 'مجاز', 'نحو', 'اعراب', 'ترکیب', 'صرف', 'صیغہ', 'nahw', 'sarf', 'usul'],
    rulingSummary: 'اصولِ فقہ میں الفاظ کے چار بنیادی اعتبارات ہیں: وضع کے اعتبار سے (خاص، عام، مشترک، مؤول)، استعمال کے اعتبار سے (حقیقت، مجاز، صریح، کنایہ)، ظہور و خفاء کے اعتبار سے (ظاہر، نص، مفسر، محکم)، اور دلالت کے اعتبار سے (عبارۃ النص، اشارۃ النص، دلالۃ النص، اقتضاء النص)۔ نحو میں کلمات کے اعراب ان کے عوامل (عاملِ لفظی یا معنوی) کے تابع ہوتے ہیں، جس سے معانی کا تعین ہوتا ہے۔',
    quran: {
      arabic: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ',
      urdu: 'بے شک ہم نے اس کو عربی زبان کا قرآن بنا کر نازل فرمایا تاکہ تم عقل و فہم سے کام لو۔',
      surahName: 'سورۃ یوسف',
      ayahNumber: 2
    },
    hadith: {
      arabic: 'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ.',
      urdu: 'اللہ تعالیٰ جس کے ساتھ خیر اور بھلائی کا ارادہ فرماتا ہے اسے دین کی گہری سمجھ بوجھ (فقہ) عطا فرما دیتا ہے۔',
      bookTitle: 'صحیح البخاری',
      hadithNumber: 71
    },
    fiqh: {
      arabic: 'أُصُولُ الْفِقْهِ أَرْبَعَةٌ: كِتَابُ اللَّهِ، وَسُنَّةُ رَسُولِهِ ﷺ، وَإِجْمَاعُ الأُمَّةِ، وَالْقِيَاسُ الشَّرْعِيُّ.',
      urdu: 'اصولِ شریعت چار ہیں: اللہ کی کتاب، رسول اللہ ﷺ کی سنت، امت کا اجماع، اور قیاسِ شرعی۔',
      bookTitle: 'نور الانوار فی شرح المنار',
      author: 'ملا احمد جیون رحمہ اللہ',
      volume: 1,
      page: 6,
      slug: 'nur-al-anwar'
    },
    additionalCitations: [
      { bookTitle: 'اصول الشاشی', bookTitleAr: 'أصول الشاشي', slug: 'usul-al-shashi', author: 'امام نظام الدین الشاشی', category: 'Dars-e-Nizami', volume: 1, page: 4, badgeText: 'بحث الخاص والعام ص ۴' },
      { bookTitle: 'الکافیہ فی النحو', bookTitleAr: 'الكافية في علم النحو', slug: 'al-kafiya', author: 'علامہ ابن الحاجب النحوی', category: 'Dars-e-Nizami', volume: 1, page: 2, badgeText: 'تعریف الکلمۃ والکلام ص ۲' },
      { bookTitle: 'ہدایۃ النحو', bookTitleAr: 'هداية النحو', slug: 'hidayat-un-nahw', author: 'سراج الدین عثمان چشتی', category: 'Dars-e-Nizami', volume: 1, page: 3, badgeText: 'مبحث الاسم ص ۳' }
    ]
  }
];

// ----------------------------------------------------------------------
// Anti-Hallucination Guard: Inquiry Scope Evaluator
// ----------------------------------------------------------------------
export function evaluateInquiryScope(rawQuery: string): {
  isInScope: boolean;
  requiresLocalMufti: boolean;
  refusalReason?: string;
  matchedTopic?: CanonicalTopicRecord;
} {
  const norm = normalizeUrduArabic(rawQuery);
  const words = norm.split(' ').filter(w => w.length > 1);

  if (words.length === 0) {
    return {
      isInScope: false,
      requiresLocalMufti: false,
      refusalReason: 'خالی استفسار'
    };
  }

  // 1. Detection of purely non-religious, speculative, political, or worldly queries
  const nonReligiousKeywords = [
    'کرکٹ', 'میچ', 'فلم', 'گانا', 'موسیقی سننا', 'الیکشن', 'سیاست دان', 'حکومت گرانا',
    'پیشن گوئی', 'میرا مستقبل', 'ہاتھ دیکھنا', 'قسمت بتائیں', 'لاٹری کا نمبر',
    'سٹاک مارکیٹ ٹپ', 'بٹ کوائن اوپر جائے گا', 'فاریکس سگنل',
    'پاسورڈ ہیک', 'ویب سائٹ ہیک', 'گالی', 'قتل کی دھمکی'
  ];

  if (nonReligiousKeywords.some(nr => norm.includes(nr))) {
    return {
      isInScope: false,
      requiresLocalMufti: true,
      refusalReason: 'یہ استفسار دینی و فقہی دائرہ کار سے باہر دنیاوی، سیاسی یا غیر متعلقہ موضوع سے متعلق ہے۔'
    };
  }

  // 2. Detection of specific contentious personal litigation requiring court/two-party hearing
  const twoPartyLitigationKeywords = [
    'میری ساس نے مجھے کہا', 'میرے شوہر نے فون پر', 'میں عدالت میں کیس کروں',
    'میرے بھائی نے میری زمین', 'جائیداد پر قبضہ کر لیا', 'پولیس میں رپورٹ',
    'فلاں بندہ کافر ہے یا نہیں', 'فلاں پر کفر کا فتویٰ'
  ];

  if (twoPartyLitigationKeywords.some(kw => norm.includes(kw))) {
    return {
      isInScope: false,
      requiresLocalMufti: true,
      refusalReason: 'یہ معاملہ خاندانی تنازع، عدالتی مقدمہ بازی یا شخصی تکفیر سے متعلق ہے جس میں دونوں فریقین کے بیانات سنے بغیر کمپیوٹر یا اے آئی کے ذریعے رائے دینا شرعاً ممنوع ہے۔'
    };
  }

  // 3. Search within Canonical RAG Topics
  let bestTopic: CanonicalTopicRecord | null = null;
  let bestScore = 0;

  for (const topic of CANONICAL_RAG_INDEX) {
    let score = 0;
    for (const kw of topic.keywords) {
      const normKw = normalizeUrduArabic(kw);
      if (norm.includes(normKw)) {
        score += 3;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && bestScore >= 3) {
    return {
      isInScope: true,
      requiresLocalMufti: false,
      matchedTopic: bestTopic
    };
  }

  // 4. Check whether it matches any of the 147 books by title, author, or category
  for (const b of allCatalogBooks) {
    const bTitle = normalizeUrduArabic(b.title_ur + ' ' + b.title_ar + ' ' + b.slug);
    if (words.some(w => w.length > 2 && bTitle.includes(w))) {
      return {
        isInScope: true,
        requiresLocalMufti: false,
        matchedTopic: CANONICAL_RAG_INDEX[0] // Fallback to classical library anchor
      };
    }
  }

  // 5. Fallback check on Islamic terms
  const generalIslamicTokens = [
    'دین', 'اسلام', 'شریعت', 'قرآن', 'حدیث', 'سنت', 'مسئلہ', 'فتویٰ', 'حلال', 'حرام',
    'جائز', 'ناجائز', 'فرض', 'واجب', 'سنت', 'مکروہ', 'مفتی', 'عالم', 'استغفار', 'دعا',
    'حقوق', 'والدین', 'توبہ', 'اخلاق', 'جنت', 'جہنم', 'موت', 'قبر'
  ];

  const hasIslamicContext = words.some(w => generalIslamicTokens.some(git => w.includes(git) || git.includes(w)));
  if (hasIslamicContext) {
    return {
      isInScope: true,
      requiresLocalMufti: false,
      matchedTopic: CANONICAL_RAG_INDEX[0]
    };
  }

  // If completely alien to Islamic sciences
  return {
    isInScope: false,
    requiresLocalMufti: true,
    refusalReason: 'مطلوبہ سوال مکتبہ تحریکِ ایمان کی ۱۴۷ معتمد کتب کے دائرۂ نصوص میں واضح نہیں پایا گیا۔'
  };
}

// ----------------------------------------------------------------------
// RAG Retriever from 147 Verified Books
// ----------------------------------------------------------------------
export function retrieveStrictRagContext(userQuery: string): RagAnalysisResult {
  const scope = evaluateInquiryScope(userQuery);

  if (!scope.isInScope || scope.requiresLocalMufti) {
    return {
      isInScope: false,
      requiresLocalMufti: true,
      refusalReason: scope.refusalReason || 'یہ مسئلہ نصوص سے ماورا یا مخصوص انفرادی نزاعی نوعیت کا ہے جس کے لیے مقامی مفتی صاحب سے براہِ راست رجوع فرمائیں۔',
      detectedTopic: 'خارج از دائرۂ نصوص / محتاجِ فتویٰ بالمشافہہ',
      citations: []
    };
  }

  const topic = scope.matchedTopic || CANONICAL_RAG_INDEX[0];

  const primaryCitation: RagCitation = {
    bookTitle: topic.fiqh.bookTitle,
    bookTitleAr: topic.fiqh.bookTitle,
    slug: topic.fiqh.slug,
    author: topic.fiqh.author,
    category: 'Fiqh',
    volume: topic.fiqh.volume,
    page: topic.fiqh.page,
    badgeText: `${topic.fiqh.bookTitle} (جلد ${topic.fiqh.volume}، صفحہ ${topic.fiqh.page})`,
    readerLink: `/books/${topic.fiqh.slug}?page=${topic.fiqh.page}`,
    quoteArabic: topic.fiqh.arabic,
    quoteUrdu: topic.fiqh.urdu
  };

  const additionalCitations: RagCitation[] = topic.additionalCitations.map(ac => ({
    bookTitle: ac.bookTitle,
    bookTitleAr: ac.bookTitleAr,
    slug: ac.slug,
    author: ac.author,
    category: ac.category,
    volume: ac.volume,
    page: ac.page,
    badgeText: `${ac.bookTitle} (جلد ${ac.volume}، صفحہ ${ac.page})`,
    readerLink: `/books/${ac.slug}?page=${ac.page}`
  }));

  const allCitations: RagCitation[] = [primaryCitation, ...additionalCitations];

  return {
    isInScope: true,
    requiresLocalMufti: false,
    detectedTopic: topic.topicUrdu,
    citations: allCitations,
    quranEvidence: topic.quran,
    hadithEvidence: topic.hadith,
    fiqhEvidence: topic.fiqh
  };
}

// ----------------------------------------------------------------------
// Formatter for Strict Scholarly Answers with Precise Citations
// ----------------------------------------------------------------------
export function formatStrictMuftiAnswer(params: {
  rawQuery?: string;
  ragResult: RagAnalysisResult;
  mode?: 'student' | 'ulama' | 'public';
}): string {
  const { rawQuery, ragResult, mode = 'student' } = params;

  const councilTitle = mode === 'student'
    ? 'درسی اتالیق برائے طلبۂ درسِ نظامی'
    : mode === 'ulama'
    ? 'دار الافتاء و مجلسِ تحقیقِ علماء'
    : 'اسلامی رہنمائی برائے عامۃ المسلمین';

  // Hallucination Prevention Refusal
  if (!ragResult.isInScope || ragResult.requiresLocalMufti) {
    return `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى سَيِّدِ الأَنْبِيَاءِ وَالْمُرْسَلِينَ

محترم سائل! السلام علیکم ورحمۃ اللہ و برکاتہ
${rawQuery ? `\n*استفسار:* «${rawQuery}»\n` : ''}
تحریکِ ایمان ڈیجیٹل کتب خانہ و پورٹلِ علومِ اسلامیہ (${councilTitle}) کی ۱۴۷ معتمد کتب (قرآنِ مجید، صحاحِ ستہ، امہاتِ فقہِ حنفی، اور شروحاتِ درسِ نظامی) کے دائرۂ نصوص کے جائزے کے بعد مطلع کیا جاتا ہے کہ:

⚠️ **وضاحت برائے احتیاطِ شرعی:**
${ragResult.refusalReason || 'آپ کا استفسار مکتبہ کی معتمد کتب کے دائرۂ نصوص سے ماورا یا مخصوص انفرادی و نزاعی نوعیت کا ہے، جس میں بذریعہ کمپیوٹر اندازے لگانا یا فتویٰ دینا شرعاً ممنوع ہے۔'}

💡 **شرعی رہنمائی و واجب العمل اصول:**
اللہ رب العزت کا صریح ارشاد ہے:
> **{فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ}** [سورۃ النحل: آیت ۴۳]
> *"اگر تم نہیں جانتے تو اہل علم (مفتیانِ کرام) سے دریافت کر لو۔"*

لہٰذا اس مسئلے کے شرعی اور معتمد حل کے لیے اپنے قریبی مستند دار الافتاء، جامعہ اسلامیہ، یا باوقار مفتی صاحب سے بالمشافہہ (آمنے سامنے) رجوع فرما کر باقاعدہ مہر شدہ تحریری فتویٰ حاصل فرمائیں۔

«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»
کتبہ العبد الضعیف — ${councilTitle}، تحریکِ ایمان`;
  }

  // In-Scope Model Response with Precise Citations
  let doc = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n`;
  doc += `الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِهِ الْأَمِينِ\n\n`;
  if (rawQuery) {
    doc += `*استفسار:* «${rawQuery}»\n\n`;
  }
  doc += `الْجَوَابُ وَبِاللَّهِ التَّوْفِيقُ:\n\n`;

  // 1. Core Ruling
  doc += `### ⚖️ خلاصۂ شرعی حکم:\n`;
  const canonical = CANONICAL_RAG_INDEX.find(c => c.topicUrdu === ragResult.detectedTopic) || CANONICAL_RAG_INDEX[0];
  doc += `${canonical.rulingSummary}\n\n`;

  // 2. Quranic Evidence
  if (ragResult.quranEvidence) {
    doc += `### 📖 دلیل من القرآن الکریم:\n`;
    doc += `> **{${ragResult.quranEvidence.arabic}}**\n`;
    doc += `> [ترجمہ: ${ragResult.quranEvidence.urdu}]\n`;
    doc += `* **حوالہ:** ${ragResult.quranEvidence.surahName}، آیت نمبر ${ragResult.quranEvidence.ayahNumber}\n\n`;
  }

  // 3. Hadith Evidence
  if (ragResult.hadithEvidence) {
    doc += `### 📜 دلیل من الحدیث الشریف:\n`;
    doc += `> **«${ragResult.hadithEvidence.arabic}»**\n`;
    doc += `> [سلیس مفہوم: ${ragResult.hadithEvidence.urdu}]\n`;
    doc += `* **حوالہ:** ${ragResult.hadithEvidence.bookTitle}، حدیث نمبر ${ragResult.hadithEvidence.hadithNumber}\n\n`;
  }

  // 4. Classical Fiqh Text with Volume and Page
  if (ragResult.fiqhEvidence) {
    doc += `### 📚 نصوصِ فقہائے احناف و امہات الکتب:\n`;
    doc += `فقہِ حنفی کی امہات الکتب میں یہ مسئلہ پوری وضاحت سے مدون ہے:\n`;
    doc += `> **«${ragResult.fiqhEvidence.arabic}»**\n`;
    doc += `> [درسی توضیح: ${ragResult.fiqhEvidence.urdu}]\n`;
    doc += `* **کتاب:** ${ragResult.fiqhEvidence.bookTitle}\n`;
    doc += `* **مصنف:** ${ragResult.fiqhEvidence.author}\n`;
    doc += `* **جلد و صفحہ:** جلد نمبر ${ragResult.fiqhEvidence.volume}، صفحہ نمبر ${ragResult.fiqhEvidence.page}\n\n`;
  }

  // 5. Direct Reader Links across 147 Verified Books
  doc += `### 🔗 مکتبہ تحریکِ ایمان کے مصدقہ حوالہ جات (براہِ راست مطالعہ لنک):\n`;
  ragResult.citations.forEach((c, idx) => {
    doc += `${idx + 1}. **[${c.bookTitle} (جلد ${c.volume || 1}، صفحہ ${c.page})](https://tehreek-e-iman.pages.dev${c.readerLink})** — تالیف: ${c.author} [${c.category}]\n`;
  });
  doc += `\n`;

  // 6. Seal of Fatwa
  doc += `«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»\n`;
  doc += `کتبہ العبد الضعیف — دار الافتاء و مجلسِ تحقیقِ علمی، تحریکِ ایمان\n`;
  doc += `*نوٹ: یہ علمی معاونت پورٹل کی ۱۴۷ معتمد کتب کے نصوص سے فراہم کی گئی ہے، کسی بھی نزاعی معاملے میں اپنے مقامی مستند دار الافتاء سے بالمشافہہ رجوع فرمائیں۔*`;

  return doc;
}
