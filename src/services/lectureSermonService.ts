// Lecture & Sermon Generator Service (خطبہ و بیان جنریٹر)
// Designed for Islamic scholars, Friday Imams (خطباء کرام), and Dars-e-Nizami educators.
// Generates authenticated, structured outlines for Friday Sermons (Jummah Khutbah),
// Dars circles, and public lectures in pure Jameel Noori Nastaleeq Urdu.

export interface QuranEvidence {
  arabic: string;
  urdu: string;
  surahRef: string;
}

export interface HadithEvidence {
  arabic: string;
  urdu: string;
  ref: string;
  benefit: string;
}

export interface PracticalTakeaway {
  pointTitle: string;
  explanation: string;
  actionItem: string;
}

export interface LectureSermonOutline {
  topicTitle: string;
  subTitle: string;
  khutbahOpening: string;
  intro: {
    hook: string;
    historicalContext: string;
    relevanceToday: string;
  };
  quranEvidences: QuranEvidence[];
  hadithEvidences: HadithEvidence[];
  practicalTakeaways: PracticalTakeaway[];
  speakerGuidance: string[];
  conclusionAndDua: {
    summary: string;
    arabicDua: string;
    urduDuaTranslation: string;
  };
  fullFormattedScript: string;
}

export interface SermonGeneratorParams {
  bookSlug?: string;
  hadithNumber?: number;
  arabicText?: string;
  urduText?: string;
  chapterTitleAr?: string;
  chapterTitleUr?: string;
}

// Universal Masnoon Khutbah Opening
const MASNOON_KHUTBAH_OPENING = 
`إِنَّ الْحَمْدَ لِلَّهِ، نَحْمَدُهُ وَنَسْتَعِينُهُ وَنَسْتَغْفِرُهُ، وَنَعُوذُ بِاللَّهِ مِنْ شُرُورِ أَنْفُسِنَا وَمِنْ سَيِّئَاتِ أَعْمَالِنَا، مَنْ يَهْدِهِ اللَّهُ فَلَا مُضِلَّ لَهُ، وَمَنْ يُضْلِلْ فَلَا هَادِيَ لَهُ، وَأَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ سَيِّدَنَا وَمَوْلَانَا مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، أَرْسَلَهُ بِالْحَقِّ بَشِيرًا وَنَذِيرًا بَيْنَ يَدَيِ السَّاعَةِ، مَنْ يُطِعِ اللَّهَ وَرَسُولَهُ فَقَدْ رَشَدَ، وَمَنْ يَعْصِهِمَا فَإِنَّهُ لَا يَضُرُّ إِلَّا نَفْسَهُ وَلَا يَضُرُّ اللَّهَ شَيْئًا.

أَمَّا بَعْدُ: فَأَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ، بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ.`;

// Intelligent Topic Detection & Content Synthesis
export function generateLectureSermon(params: SermonGeneratorParams): LectureSermonOutline {
  const {
    bookSlug = '',
    hadithNumber = 1,
    arabicText = '',
    urduText = '',
    chapterTitleAr = '',
    chapterTitleUr = ''
  } = params;

  const combinedSearch = `${arabicText} ${urduText} ${chapterTitleAr} ${chapterTitleUr}`.toLowerCase();
  const isBukhari = bookSlug.toLowerCase().includes('bukhari');

  // 1. Specific High-Profile Hadith Outlines (Page 1 Golden Standards)
  if (isBukhari && hadithNumber === 1) {
    return buildBukhari1Sermon(params);
  }

  if (isBukhari && (hadithNumber === 2 || hadithNumber === 3 || hadithNumber === 4 || hadithNumber === 5)) {
    return buildWahySermon(params);
  }

  if (isBukhari && hadithNumber === 6) {
    return buildRamadanGenerositySermon(params);
  }

  if (isBukhari && hadithNumber === 8) {
    return buildPillarsOfIslamSermon(params);
  }

  if (isBukhari && (hadithNumber === 9 || combinedSearch.includes('حياء') || combinedSearch.includes('شعب'))) {
    return buildHayaAndFaithSermon(params);
  }

  if (isBukhari && hadithNumber === 10) {
    return buildTrueMuslimSermon(params);
  }

  // 2. Thematic Heuristics for all Hadith books (Muslim, Abu Dawood, Tirmidhi, Quran, etc.)
  if (combinedSearch.includes('صلاة') || combinedSearch.includes('نماز') || combinedSearch.includes('صلو')) {
    return buildPrayerSermon(params);
  }

  if (combinedSearch.includes('صوم') || combinedSearch.includes('رمضان') || combinedSearch.includes('روز')) {
    return buildRamadanGenerositySermon(params);
  }

  if (combinedSearch.includes('زكاة') || combinedSearch.includes('صدق') || combinedSearch.includes('انفاق') || combinedSearch.includes('خیرات')) {
    return buildZakatSadaqahSermon(params);
  }

  if (combinedSearch.includes('توب') || combinedSearch.includes('استغفار') || combinedSearch.includes('گناہ') || combinedSearch.includes('مغفرت')) {
    return buildTawbahSermon(params);
  }

  if (combinedSearch.includes('والد') || combinedSearch.includes('ماں باپ') || combinedSearch.includes('صلة الرحم') || combinedSearch.includes('رشتہ دار')) {
    return buildParentsAndKinSermon(params);
  }

  if (combinedSearch.includes('علم') || combinedSearch.includes('تعلم') || combinedSearch.includes('فقہ') || combinedSearch.includes('عالم')) {
    return buildKnowledgeSermon(params);
  }

  if (combinedSearch.includes('اخلاق') || combinedSearch.includes('صدق') || combinedSearch.includes('سچ') || combinedSearch.includes('کذب') || combinedSearch.includes('جھوٹ')) {
    return buildCharacterSermon(params);
  }

  if (combinedSearch.includes('موت') || combinedSearch.includes('قبر') || combinedSearch.includes('قیامت') || combinedSearch.includes('جنت') || combinedSearch.includes('جہنم')) {
    return buildAkhirahSermon(params);
  }

  // Fallback: Comprehensive General Reformation & Sunnah Sermon
  return buildGeneralSunnahSermon(params);
}

// -------------------------------------------------------------
// Detailed Outline Implementations
// -------------------------------------------------------------

function buildBukhari1Sermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'اخلاصِ نیت کی اہمیت، ریاکاری کی تباہ کاری اور ہجرتِ الٰہی کا مفہوم';
  const subTitle = 'صحیح البخاری حدیث نمبر ۱ کی روشنی میں جمعہ کا خصوصی فکری و اصلاحی خطبہ';

  const intro = {
    hook: 'معاشرے کے اکثر بگاڑ کی اصل جڑ یہ ہے کہ انسان ظاہر کو سنوارنے میں لگا رہتا ہے جبکہ باطن اور نیتیں ویران ہو چکی ہیں۔ اعمال کا دارومدار صورتوں پر نہیں بلکہ دل کے خلوص پر ہے۔',
    historicalContext: 'امام بخاری رحمہ اللہ نے اپنی عظیم کتاب کا آغاز اسی حدیث سے کر کے امت کو یہ درس دیا کہ ہر دینی و دنیاوی قدم سے پہلے اپنی نیت کو خالص اللہ تعالیٰ کے لیے درست کرنا لازمی ہے۔ یہ حدیث "ام الحدیث" کہلاتی ہے اور دین کے ایک تہائی یا نصف احکام کی بنیاد ہے۔',
    relevanceToday: 'آج سوشل میڈیا کے دور میں نمود و نمائش، شہرت پسندی اور دینی کاموں میں بھی تعریف سننے کی تمنا عام ہے۔ یہ خطبہ بندے کے باطن کا محاسبہ کرواتا ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ وَيُقِيمُوا الصَّلَاةَ وَيُؤْتُوا الزَّكَاةَ ۚ وَذَٰلِكَ دِينُ الْقَيِّمَةِ',
      urdu: 'اور ان کو صرف یہی حکم دیا گیا تھا کہ وہ یکسو ہو کر بالکل خالص بندگی کے ساتھ اللہ کی عبادت کریں اور نماز قائم کریں اور زکوٰۃ ادا کریں، اور یہی سیدھا اور سچا دین ہے۔',
      surahRef: 'سورۃ البینۃ: ۵'
    },
    {
      arabic: 'لَن يَنَالَ اللَّهَ لُحُومُهَا وَلَا دِمَاؤُهَا وَلَٰكِن يَنَالُهُ التَّقْوَىٰ مِنكُمْ',
      urdu: 'اللہ تک نہ ان کا گوشت پہنچتا ہے اور نہ ان کا خون، بلکہ اس تک تمہارا تقویٰ اور خلوص پہنچتا ہے۔',
      surahRef: 'سورۃ الحج: ۳۷'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
      urdu: 'اعمال کا دارومدار فقط نیتوں پر ہے اور ہر انسان کے لیے وہی اجر ہے جس کی اس نے نیت کی۔ پس جس کی ہجرت دنیا حاصل کرنے یا کسی عورت سے نکاح کے لیے ہو تو اس کی ہجرت اسی مقصد کی سمجھی جائے گی جس کے لیے اس نے سفر کیا۔',
      ref: 'صحیح البخاری: حدیث ۱',
      benefit: 'بظاہر نیکی کا ایک عظیم کام (ہجرت) اگر خالص اللہ کے لیے نہ ہو تو اللہ کے ہاں ضائع ہو جاتا ہے۔'
    },
    {
      arabic: 'إِنَّ اللَّهَ لا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ.',
      urdu: 'بے شک اللہ تعالیٰ تمہاری صورتوں اور تمہارے مالوں کو نہیں دیکھتا، بلکہ وہ تمہارے دلوں (نیتوں) اور تمہارے اعمال کو دیکھتا ہے۔',
      ref: 'صحیح مسلم: ۲۵۶۴',
      benefit: 'رب العالمین کا نگاہِ کرم انسان کے باطن اور اخلاص پر ٹھہرتی ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. ہر کام سے پہلے تجدیدِ نیت کی عادت بنائیں',
      explanation: 'صبح بیدار ہونے سے لے کر رات سونے تک، جائز دنیاوی کام (روزی کمانا، بچوں کی پرورش، کھانا پینا) بھی اگر حلال کمانے اور اللہ کے احکام پورا کرنے کی نیت سے کیے جائیں تو عبادت بن جاتے ہیں۔',
      actionItem: 'ہر روز دفتر، دکان یا کام پر نکلتے وقت دل میں یہ نیت کریں: "یا اللہ! میں تیرے حلال رزق اور اہل و عیال کی کفالت کی نیت سے جا رہا ہوں۔"'
    },
    {
      pointTitle: '۲. ریاکاری اور تشہیر پسندی کا خاتمہ',
      explanation: 'صدقہ دے کر تصویریں کھینچنا، نماز یا تلاوت کے دوران لوگوں کو دکھانے کا خیال دل میں لانا نیکیوں کو برباد کر دیتا ہے۔ شرکِ اصغر (ریاکاری) سے خود کو محفوظ رکھیں۔',
      actionItem: 'ہر ہفتے کم از کم ایک ایسا پوشیدہ نیک عمل ضرور کریں جس کا علم آپ کے اہل خانہ کو بھی نہ ہو (مثلاً چپکے سے کسی مستحق کی مدد)۔'
    },
    {
      pointTitle: '۳. گناہوں سے اللہ کی طرف سچی ہجرت',
      explanation: 'ظاہری ہجرت کے علاوہ حقیقی ہجرت یہ ہے کہ انسان برائی، جھوٹ، حسد، بدزبانی اور سودی معاملات کو چھوڑ کر اللہ اور اس کے رسول ﷺ کی اطاعت کی طرف ہجرت کرے۔',
      actionItem: 'اپنی زندگی کی سب سے بڑی کمزوری یا بدعنوانی کو آج ہی اللہ کی رضا کے لیے ترک کرنے کا پکا عہد کریں۔'
    }
  ];

  const speakerGuidance = [
    'خطبے کا آغاز نرمی اور دردِ دل سے فرمائیں تاکہ سامعین اپنے باطن کا جائزہ لیں، کسی پر طعنہ زنی نہ ہو۔',
    'ہجرت کے تاریخی واقعے کو موجودہ دور کے سچے توبہ کے عمل سے جوڑ کر پیش کریں۔',
    'سوشل میڈیا اور نمائش پسندی کے نقصانات کو شائستہ اور اثر انگیز انداز میں بیان کریں۔'
  ];

  const conclusionAndDua = {
    summary: 'محترم سامعین! زندگی کا اصل سرمایہ اخلاص ہے۔ جس کے پاس اخلاص کی دولت ہے اس کا رائی برابر عمل بھی احد پہاڑ سے وزنی ہے، اور جس کی نیت میں کھوٹ ہے اس کی راتوں کی عبادتیں بھی خسارے کا سودا ہیں۔ آئیے ہم اپنے دلوں کو ریاکاری کے زہر سے پاک کریں۔',
    arabicDua: 'اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ أَنْ نُشْرِكَ بِكَ شَيْئًا نَعْلَمُهُ، وَنَسْتَغْفِرُكَ لِمَا لَا نَعْلَمُهُ. اللَّهُمَّ اجْعَلْ عَمَلَنَا كُلَّهُ صَالِحًا، وَاجْعَلْهُ لِوَجْهِكَ خَالِصًا، وَلَا تَجْعَلْ لِأَحَدٍ فِيهِ شَيْئًا.',
    urduDuaTranslation: 'اے اللہ! ہم تیری پناہ مانگتے ہیں کہ ہم جان بوجھ کر تیرے ساتھ کسی کو شریک ٹھہرائیں، اور ان خطاؤں کی بخشش چاہتے ہیں جو نادانستہ ہو گئیں۔ اے باری تعالیٰ! ہمارے تمام اعمال کو نیک بنا، اور انہیں خاص اپنی خوشنودی کے لیے خالص فرما، اور ان میں کسی غیر کا کوئی حصہ نہ رکھ!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildWahySermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'عظمتِ وحیِ الٰہی، نبوت کی صداقت اور کلامِ الٰہی سے تعلق کی برکات';
  const subTitle = 'آغازِ وحی اور قرآنِ مجید کے نزول کی روشنی میں فکری و تربیتی خطبہ';

  const intro = {
    hook: 'جب تک کائنات کے خالق کا کلام انسان کی راہنمائی نہ کرے، انسانی عقل ٹھوکریں کھاتی رہتی ہے۔ وحیِ الٰہی وہ ابدی روشنی ہے جس نے انسانیت کو تاریکیوں سے نکال کر صراطِ مستقیم دکھایا۔',
    historicalContext: 'غارِ حراء میں اقرأ باسم ربک کا نزول اور سیدہ خدیجہ رضی اللہ عنہا کی اخلاقی تسلی اس بات کا ثبوت ہے کہ دینِ اسلام فطرت کی سچائی اور اعلیٰ ترین اخلاق کی حفاظت کے لیے اتارا گیا۔',
    relevanceToday: 'آج جب شکوک و شبہات اور فکری الحاد پھیلایا جا رہا ہے، وحی کی عظمت کو سمجھنا اور قرآن کے ساتھ زندہ تعلق قائم کرنا ہر مسلمان کے لیے فرض ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ * خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ * اقْرَأْ وَرَبُّكَ الْأَكْرَمُ * الَّذِي عَلَّمَ بِالْقَلَمِ',
      urdu: 'پڑھیے اپنے رب کے نام سے جس نے پیدا کیا۔ جس نے انسان کو جمے ہوئے خون کے لوتھڑے سے پیدا کیا۔ پڑھیے اور آپ کا رب بڑا ہی کریم ہے، جس نے قلم کے ذریعے علم سکھایا۔',
      surahRef: 'سورۃ العلق: ۱-۴'
    },
    {
      arabic: 'إِنَّا سَنُلْقِي عَلَيْكَ قَوْلًا ثَقِيلًا',
      urdu: 'بے شک ہم عنقریب آپ پر ایک پرجلال اور باوقار وزنی کلام نازل فرمائیں گے۔',
      surahRef: 'سورۃ المزمل: ۵'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'كَانَ رَسُولُ اللَّهِ ﷺ أَجْوَدَ النَّاسِ، وَكَانَ أَجْوَدُ مَا يَكُونُ فِي رَمَضَانَ حِينَ يَلْقَاهُ جِبْرِيلُ، وَكَانَ يَلْقَاهُ فِي كُلِّ لَيْلَةٍ مِنْ رَمَضَانَ فَيُدَارِسُهُ الْقُرْآنَ.',
      urdu: 'رسول اللہ ﷺ تمام انسانوں سے زیادہ فیاض تھے، اور رمضان میں جب حضرت جبرائیل علیہ السلام سے ملاقات ہوتی تو آپ کی سخاوت عروج پر ہوتی؛ جبرائیل علیہ السلام ہر رات تشریف لاتے اور آپ ﷺ کے ساتھ قرآن کا دور فرماتے۔',
      ref: 'صحیح البخاری: حدیث ۶',
      benefit: 'قرآن سے وابستگی دل میں جود و سخاوت اور نور پیدا کرتی ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. تلاوتِ قرآن کو روزانہ کا اٹل معمول بنائیں',
      explanation: 'قرآن کو محض طاقوں میں سجانے کے بجائے روزانہ فہم اور تدبر کے ساتھ تلاوت کریں تاکہ گھروں میں برکت اور دلوں میں سکون آئے۔',
      actionItem: 'روزانہ کم از کم ایک رکوع تلاوت مع سلیس ترجمہ لازماً پڑھیں۔'
    },
    {
      pointTitle: '۲. سیدہ خدیجہ رضی اللہ عنہا کے اخلاقی نسخے کو اپنائیں',
      explanation: 'صلہ رحمی کرنا، کمزوروں کا بوجھ اٹھانا، ناداروں کو کمانے کے قابل بنانا اور مہمانوں کی عزت کرنا وہ صفات ہیں جو انسان کو دنیا و آخرت میں کبھی رسوا نہیں ہونے دیتیں۔',
      actionItem: 'اپنے خاندان کے کسی نادار رشتہ دار کی کفالت یا خاموش مدد کی ذمہ داری لیں۔'
    }
  ];

  const speakerGuidance = [
    'نزولِ وحی کے وقت رسول اللہ ﷺ کی جسمانی و روحانی مشقت کا ذکر کر کے دلوں میں احسان شناسی پیدا کریں۔',
    'علم اور قلم کی اہمیت کو اجاگر کریں کہ دینِ اسلام علم کی بنیاد پر قائم ہوا۔'
  ];

  const conclusionAndDua = {
    summary: 'قرآنِ پاک اللہ کی وہ رسی ہے جس نے تھام لیا وہ نجات پا گیا۔ اپنی نسلوں کو کلامِ الٰہی سے جوڑیے تاکہ وہ فکری گمراہیوں سے محفوظ رہیں۔',
    arabicDua: 'اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قُلُوبِنَا، وَنُورَ صُدُورِنَا، وَجَلَاءَ أَحْزَانِنَا، وَذَهَابَ هُمُومِنَا وَغُمُومِنَا.',
    urduDuaTranslation: 'اے اللہ! قرآنِ پاک کو ہمارے دلوں کی بہار، ہمارے سینوں کا نور، ہمارے غموں کا علاج اور ہماری پریشانیوں کو دور کرنے کا ذریعہ بنا دے!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildPillarsOfIslamSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'اسلام کے بنیادی ارکان: ایمانی عمارت کا استحکام اور عبادات کی روح';
  const subTitle = 'صحیح البخاری حدیث ۸ کی روشنی میں جامع جمعہ خطبہ';

  const intro = {
    hook: 'جس طرح کوئی عمارت بغیر ستونوں کے کھڑی نہیں رہ سکتی، اسی طرح اسلام کا شجرِ حیات ارکانِ خمسہ کے بغیر بارآور نہیں ہو سکتا۔',
    historicalContext: 'رسول اللہ ﷺ نے ایک مختصر اور دلنشین تمثیل کے ذریعے دین کے بنیادی ستونوں کو امت کے ذہنوں میں راسخ فرمایا۔',
    relevanceToday: 'آج بہت سے لوگ محض کلمہ پڑھ کر نماز اور زکوٰۃ جیسے ارکان سے غافل ہو جاتے ہیں۔ یہ خطبہ اسلام کی عملی بنیادوں کو زندہ کرتا ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ',
      urdu: 'سب نمازوں کی پابندی کرو اور خاص طور پر درمیانی نماز کی، اور اللہ کے حضور باادب خاموشی سے کھڑے رہو۔',
      surahRef: 'سورۃ البقرۃ: ۲۳۸'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'بُنِيَ الإِسْلامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لا إِلَهَ إِلا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ.',
      urdu: 'اسلام کی بنیاد پانچ ستونوں پر رکھی گئی ہے: اس بات کی گواہی دینا کہ اللہ کے سوا کوئی معبود نہیں اور محمد ﷺ اللہ کے رسول ہیں، نماز قائم کرنا، زکوٰۃ ادا کرنا، بیت اللہ کا حج کرنا، اور رمضان کے روزے رکھنا۔',
      ref: 'صحیح البخاری: حدیث ۸',
      benefit: 'ان پانچ ارکان کی حفاظت درحقیقت پورے دین اور ایمان کی حفاظت ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. باجماعت نماز کی استقامت',
      explanation: 'نماز دین کا ستون ہے۔ جو نماز کو ضائع کرتا ہے وہ دیگر اعمال کو بدرجہ اولیٰ ضائع کرے گا۔',
      actionItem: 'پنجوقتہ نمازوں کو مسجد کی تکبیرِ اولیٰ کے ساتھ ادا کرنے کا اہتمام کریں۔'
    },
    {
      pointTitle: '۲. زکوٰۃ کے حساب کی باریک بینی',
      explanation: 'زکوٰۃ غریبوں پر احسان نہیں بلکہ ان کا شرعی حق ہے۔ مال کا پورا حساب لگا کر مستحقین تک پہنچائیں۔',
      actionItem: 'اپنے سونے، چاندی اور نقد سرمائے کی ہر سال زکوٰۃ حساب کر کے وقت پر ادا کریں۔'
    }
  ];

  const speakerGuidance = [
    'ارکانِ اسلام کو محض رسمی عبادات نہیں بلکہ دل کی پاکیزگی اور معاشرتی امن کا ذریعہ ثابت کریں۔',
    'نماز کے تارکین کو خوفِ خدا اور رسول اللہ ﷺ کی آخری وصیت یاد دلائیں۔'
  ];

  const conclusionAndDua = {
    summary: 'ارکانِ اسلام ہماری زندگی کا دستور ہیں۔ ان کی حفاظت ہی قبر اور حشر میں ہماری نجات کا پروانہ بنے گی۔',
    arabicDua: 'اللَّهُمَّ أَعِنَّا عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ، وَتَوَفَّنَا مُسْلِمِينَ وَأَلْحِقْنَا بِالصَّالِحِينَ.',
    urduDuaTranslation: 'اے اللہ! اپنے ذکر، اپنے شکر اور اپنی بہترین عبادت پر ہماری مدد فرما، اور ہمیں اسلام کی حالت پر موت عطا فرما اور نیک بندوں میں شامل فرما!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildHayaAndFaithSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'حیاء اور ایمان کی شاخیں: معاشرتی پاکیزگی اور عفت کا تحفظ';
  const subTitle = 'صحیح البخاری حدیث ۹ کی روشنی میں عفت و پاکدامنی پر اصلاحی خطبہ';

  const intro = {
    hook: 'حیاء انسان کا وہ روحانی زیور ہے جو اسے گناہ کی دلدل میں گرنے سے روکتا ہے۔ جب معاشرے سے حیاء رخصت ہو جاتی ہے تو برائیوں کے تمام دروازے کھل جاتے ہیں۔',
    historicalContext: 'رسول اللہ ﷺ نے ارشاد فرمایا کہ ایمان کی ساٹھ سے زائد شاخیں ہیں اور حیاء ایمان کا خاص ترین شعبہ ہے۔',
    relevanceToday: 'موجودہ دور میں ڈیجیٹل بے راہ روی اور بے حیائی کے سیلاب کے سامنے حیاء کا بند باندھنا نئی نسل کے ایمان کی سب سے بڑی ضرورت ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ ۗ إِنَّ اللَّهَ خَبِيرٌ بِمَا يَصْنَعُونَ',
      urdu: 'مومن مردوں سے کہیے کہ اپنی نگاہیں نیچی رکھیں اور اپنی شرمگاہوں کی حفاظت کریں، یہ ان کے لیے زیادہ پاکیزہ ہے؛ بے شک اللہ ان کے کاموں سے خوب باخبر ہے۔',
      surahRef: 'سورۃ النور: ۳۰'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'الإِيمَانُ بِضْعٌ وَسِتُّونَ شُعْبَةً، وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ.',
      urdu: 'ایمان کی ساٹھ سے زائد شاخیں ہیں، اور حیاء بھی ایمان کا ایک انتہائی اہم شعبہ ہے۔',
      ref: 'صحیح البخاری: حدیث ۹',
      benefit: 'حیاء ایمان کی بقا کی ضامن ہے؛ جب حیاء مٹتی ہے تو ایمان بھی رخصت ہو جاتا ہے۔'
    },
    {
      arabic: 'الْحَيَاءُ لا يَأْتِي إِلا بِخَيْرٍ.',
      urdu: 'حیاء صرف اور صرف خیر اور بھلائی ہی لاتی ہے۔',
      ref: 'صحیح البخاری: ۶۱۱۷',
      benefit: 'حیاء میں دنیا اور آخرت دونوں کی عزت پوشیدہ ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. تنہائی میں اللہ تعالیٰ سے حیاء کا شعور',
      explanation: 'سب سے اعلیٰ حیاء یہ ہے کہ انسان جب اکیلا ہو اور بند کمرے میں ہو تب بھی اللہ کے دیکھنے کا خوف اور شرم اس کے دل پر طاری ہو۔',
      actionItem: 'موبائل اور انٹرنیٹ کا استعمال کرتے وقت نگاہوں کی حفاظت کی دعا پڑھیں: "اللَّهُمَّ طَهِّرْ قَلْبِي وَحَصِّنْ فَرْجِي"۔'
    },
    {
      pointTitle: '۲. گفتگو اور لباس میں وقار و شائستگی',
      explanation: 'فحش گوئی، بیہودہ مذاق اور غیر شرعی لباس انسان کے وقار کو مجروح کرتے ہیں۔ گفتگو میں حیاء اور عاجزی پیدا کریں۔',
      actionItem: 'اپنی زبان سے گالی اور نازیبا کلمات کو کلی طور پر ختم کریں۔'
    }
  ];

  const speakerGuidance = [
    'حیاء کو بزدلی نہ سمجھا جائے بلکہ اس کی جرات مندانہ اور باوقار پہچان پیش کریں۔',
    'والدین کو گھروں میں اسلامی ماحول اور شرم و حیاء کی تربیت کی ترغیب دیں۔'
  ];

  const conclusionAndDua = {
    summary: 'جس دل میں حیاء کا نور ہوگا وہ کبھی بدکاری کا مسکن نہیں بن سکتا۔ آئیے اپنے گھروں اور معاشرے کو حیاء کے نور سے منور کریں۔',
    arabicDua: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.',
    urduDuaTranslation: 'اے اللہ! ہم تجھ سے ہدایت، تقویٰ، پاکدامنی اور استغناء (بے نیازی) کا سوال کرتے ہیں!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildTrueMuslimSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'حقیقی مسلمان کی پہچان: زبان اور ہاتھ کے شر سے معاشرے کا تحفظ';
  const subTitle = 'صحیح البخاری حدیث ۱۰ کی روشنی میں اخوت اور باہمی احترام پر خطبہ';

  const intro = {
    hook: 'دینِ اسلام محض تسبیح گھمانے کا نام نہیں، بلکہ بندگانِ خدا کے حقوق کی حفاظت اور انہیں اپنے شر سے امن دینے کا نام ہے۔',
    historicalContext: 'رسول اللہ ﷺ نے ایک ہی فقرے میں کامل مسلمان اور کامل مہاجر کی آفاقی تعریف بیان فرما دی۔',
    relevanceToday: 'آج الزام تراشی، سوشل میڈیا پر کردار کشی اور ایک دوسرے کو زک پہنچانا عام ہے۔ یہ حدیث انسانیت کے تحفظ کا چارٹر ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'وَالَّذِينَ يُؤْذُونَ الْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ بِغَيْرِ مَا اكْتَسَبُوا فَقَدِ احْتَمَلُوا بُهْتَانًا وَإِثْمًا مُّبِينًا',
      urdu: 'اور جو لوگ مومن مردوں اور مومن عورتوں کو بغیر کسی خطا کے ایذا پہنچاتے ہیں تو انہوں نے کھلا بہتان اور صریح گناہ اپنے سر پر اٹھا لیا۔',
      surahRef: 'سورۃ الاحزاب: ۵۸'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'المُسْلِمُ مَنْ سَلِمَ المُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ.',
      urdu: 'حقیقی مسلمان وہ ہے جس کی زبان اور جس کے ہاتھ کے شر سے دوسرے مسلمان محفوظ رہیں، اور سچا مہاجر وہ ہے جو ان تمام باتوں کو چھوڑ دے جن سے اللہ تعالیٰ نے منع فرمایا ہے۔',
      ref: 'صحیح البخاری: حدیث ۱۰',
      benefit: 'مسلمان کی تعریف میں اخلاقی امن کو مرکزی مقام حاصل ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. زبان کی لگام تھامنا (غیبت اور جھوٹ سے پرہیز)',
      explanation: 'زبان کا زخم تلوار کے زخم سے گہرا ہوتا ہے۔ واٹس ایپ، فیس بک یا محفلوں میں کسی کی غیبت یا تحقیر سے باز رہیں۔',
      actionItem: 'جب بھی کسی کے عیب بیان کرنے کا خیال آئے تو فوراً اپنے عیوب کا تصور کر کے زبان کو قابو میں رکھیں۔'
    },
    {
      pointTitle: '۲. ہاتھ کے ظلم سے اجتناب (مالی و جسمانی زیادتی)',
      explanation: 'کسی کا حق دبانا، کم تولنا، ملاوٹ کرنا یا طاقت کے بل بوتے پر کمزور کو دبانا ہاتھ کے ظلم میں داخل ہے۔',
      actionItem: 'اپنے ماتحت ملازمین یا مزدوروں کو وقت پر پورا حق دیں اور کبھی زیادتی نہ کریں۔'
    }
  ];

  const speakerGuidance = [
    'معاشرتی امن اور باہمی رواداری پر خصوصی زور دیں۔',
    'غیبت اور جھوٹی افواہیں پھیلانے کے عذاب پر تنبیہ فرمائیں۔'
  ];

  const conclusionAndDua = {
    summary: 'مسلمان کی ذات سے دوسرے بندوں کو چین اور سلامتی ملنی چاہیے، نہ کہ خوف اور تنگی۔ اللہ ہمیں سچا مسلمان بنائے۔',
    arabicDua: 'اللَّهُمَّ حَبِّبْ إِلَيْنَا الإِيمَانَ وَزَيِّنْهُ فِي قُلُوبِنَا، وَكَرِّهْ إِلَيْنَا الْكُفْرَ وَالْفُسُوقَ وَالْعِصْيَانَ، وَاجْعَلْنَا مِنَ الرَّاشِدِينَ.',
    urduDuaTranslation: 'اے اللہ! ہمارے دلوں میں ایمان کی محبت ڈال دے اور اسے ہمارے قلوب میں خوشنما بنا دے، اور کفر، گناہ اور نافرمانی سے ہمارے دلوں کو متنفر فرما دے، اور ہمیں ہدایت یافتہ لوگوں میں شامل فرما!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildPrayerSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'نماز کی اہمیت و معراج: خشوع و خضوع اور بے حیائی سے نجات کا ذریعہ';
  const subTitle = 'قرآن و سنت کی روشنی میں پنجوقتہ نماز پر اثر انگیز خطبہ';

  const intro = {
    hook: 'نماز مومن کی معراج اور خالقِ کائنات کے سامنے روزانہ حاضری کا شرف ہے۔ جس کی نماز سنور گئی اس کی دنیا و آخرت سنور گئی۔',
    historicalContext: 'شبِ معراج کا سب سے قیمتی تحفہ نماز ہے جو آسمانوں پر بلا کر امت کو عطا کیا گیا۔',
    relevanceToday: 'آج کا انسان ڈپریشن، بے چینی اور روحانی خلا کا شکار ہے۔ نماز وہ الٰہی شفا ہے جو دل کو ابدی سکون عطا کرتی ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ',
      urdu: 'جو کتاب آپ کی طرف وحی کی گئی ہے اس کی تلاوت کیجیے اور نماز قائم کیجیے؛ بے شک نماز بے حیائی اور برائی سے روکتی ہے، اور اللہ کا ذکر سب سے بڑا ہے۔',
      surahRef: 'سورۃ العنکبوت: ۴۵'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'رَأْسُ الأَمْرِ الإِسْلامُ، وَعَمُودُهُ الصَّلاةُ، وَذِرْوَةُ سَنَامِهِ الْجِهَادُ.',
      urdu: 'تمام امور کی اصل اسلام ہے، اور اس کا مضبوط ستون نماز ہے، اور اس کی بلندی کی چوٹی جہاد فی سبیل اللہ ہے۔',
      ref: 'جامع الترمذی: ۲۶۱۶',
      benefit: 'نماز کے بغیر اسلام کی عمارت کھڑی نہیں رہ سکتی۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. سستی اور تاخیر کو خیرباد کہیں',
      explanation: 'نماز کو آخری وقت پر ٹال کر جلدی جلدی پڑھنے کے بجائے اول وقت میں سکون سے ادا کریں۔',
      actionItem: 'اذان سنتے ہی تمام کام روک کر باوضو مسجد کی طرف تشریف لے جائیں۔'
    },
    {
      pointTitle: '۲. نماز میں فہم اور تدبر لائیں',
      explanation: 'جو سورتیں اور اذکار ہم نماز میں پڑھتے ہیں ان کا ترجمہ سیکھیں تاکہ دل نماز میں لگا رہے۔',
      actionItem: 'سورۃ الفاتحہ اور تشہد کا اردو ترجمہ آج ہی یاد کر کے نماز میں دھیان جمائیں۔'
    }
  ];

  const speakerGuidance = [
    'نماز کے سائنسی اور نفسیاتی فوائد کے ساتھ ساتھ اس کی روحانی عظمت کو واضح کریں۔',
    'نوجوانوں کو محبت اور ترغیب کے ساتھ مسجد سے جوڑنے کی تدابیر بتائیں۔'
  ];

  const conclusionAndDua = {
    summary: 'قبر اور حشر میں سب سے پہلا سوال نماز ہی کے بارے میں ہوگا۔ اپنی اور اپنی اولاد کی نمازوں کی حفاظت کیجیے۔',
    arabicDua: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ.',
    urduDuaTranslation: 'اے میرے پروردگار! مجھے اور میری اولاد کو نماز قائم کرنے والا بنا دے، اے ہمارے رب! اور میری دعا قبول فرما!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildRamadanGenerositySermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'رمضان المبارک، تقویٰ کی مشق اور رسول اللہ ﷺ کی جود و سخاوت';
  const subTitle = 'تزکیۂ نفس، بھوک کی تربیت اور انفاق فی سبیل اللہ پر روح پرور خطبہ';

  const intro = {
    hook: 'روزہ صرف بھوکا اور پیاسا رہنے کا نام نہیں بلکہ یہ نفس کی سرکشی کو توڑ کر دل میں تقویٰ اور ناداروں کا درد پیدا کرنے کا مہینہ ہے۔',
    historicalContext: 'رسول اللہ ﷺ رمضان میں کثرت سے قرآن کا دور فرماتے اور تیز بارش برسانے والی ہوا سے بھی زیادہ سخاوت فرماتے تھے۔',
    relevanceToday: 'مہنگائی اور غربت کے اس دور میں اپنے نادار بھائیوں کی کفالت اور روزہ کشائی کروانا عظیم ترین نیکی ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
      urdu: 'اے ایمان والو! تم پر روزے فرض کیے گئے جس طرح تم سے پہلے لوگوں پر فرض کیے گئے تھے تاکہ تم میں تقویٰ اور پرہیزگاری پیدا ہو۔',
      surahRef: 'سورۃ البقرۃ: ۱۸۳'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ.',
      urdu: 'جس نے ایمان اور اجر کی امید کے ساتھ رمضان کے روزے رکھے اس کے پچھلے تمام گناہ معاف کر دیے جاتے ہیں۔',
      ref: 'صحیح البخاری: ۳۸',
      benefit: 'خلوصِ نیت کے ساتھ رکھا گیا روزہ گناہوں کی معافی کا سب سے بڑا پروانہ ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. اعضاء کا روزہ رکھنا',
      explanation: 'روزے کی حالت میں آنکھ، کان اور زبان کو جھوٹ، غیبت اور بدنگاہی سے باز رکھنا لازمی ہے۔',
      actionItem: 'روزے کے دوران غصے کے وقت کہیں: "إِنِّي صَائِمٌ" (میں روزے دار ہوں)۔'
    },
    {
      pointTitle: '۲. دسترخوان کی وسعت اور سخاوت',
      explanation: 'اپنے افطار میں محلے کے غریبوں اور مسکینوں کو شریک کریں، بلاوجہ اسراف سے بچیں۔',
      actionItem: 'کسی ایک مستحق خاندان کے پورے ماہ کے راشن کا انتظام فرمائیں۔'
    }
  ];

  const speakerGuidance = [
    'روزے کے باطنی مقاصد اور تقویٰ کی اہمیت پر زور دیں۔',
    'فضول خرچی اور اسراف کے رجحان کی اصلاح فرمائیں۔'
  ];

  const conclusionAndDua = {
    summary: 'رمضان کی گھڑیاں بہت قیمتی ہیں۔ نہ جانے اگلا رمضان نصیب ہو یا نہ ہو، اس رحمت کے مہینے کی ایک ایک ساعت کی قدر کریں۔',
    arabicDua: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنَّا.',
    urduDuaTranslation: 'اے اللہ! بے شک تو بہت معاف فرمانے والا، کرم والا ہے اور معافی کو پسند فرماتا ہے، پس ہماری خطائیں معاف فرما دے!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildZakatSadaqahSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'زکوٰۃ و صدقات کی برکات: مال کی پاکیزگی اور معاشرتی انصاف کا نظام';
  const subTitle = 'انفاق فی سبیل اللہ اور بخل کے عبرتناک نقصانات پر جمعہ کا خطبہ';

  const intro = {
    hook: 'مال اللہ کی امانت ہے۔ انسان سمجھتا ہے کہ جو اس نے جمع کر رکھا ہے وہ اس کا مال ہے، حالانکہ اس کا اصل مال وہ ہے جو اس نے اللہ کے راستے میں خرچ کر کے آخرت کے بینک میں جمع کروا دیا۔',
    historicalContext: 'خلیفۂ اول حضرت ابوبکر صدیق رضی اللہ عنہ نے زکوٰۃ کے منکرین کے خلاف جہاد کر کے واضح کیا کہ نماز اور زکوٰۃ میں کوئی تفریق نہیں ہو سکتی۔',
    relevanceToday: 'معاشرے میں معاشی ناہمواری اور غربت کا علاج صرف اور صرف اسلامی نظامِ زکوٰۃ میں پوشیدہ ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا وَصَلِّ عَلَيْهِمْ ۖ إِنَّ صَلَاتَكَ سَكَنٌ لَّهُمْ',
      urdu: 'ان کے مالوں میں سے صدقہ (زکوٰۃ) وصول کیجیے جس کے ذریعے آپ انہیں پاک اور صاف کر دیں، اور ان کے حق میں دعا کیجیے؛ بے شک آپ کی دعا ان کے لیے باعثِ تسکین ہے۔',
      surahRef: 'سورۃ التوبۃ: ۱۰۳'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلا عِزًّا، وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلا رَفَعَهُ اللَّهُ.',
      urdu: 'صدقہ دینے سے مال میں کبھی کمی نہیں آتی، اور معاف کرنے سے اللہ بندے کی عزت میں اضافہ ہی فرماتا ہے، اور جو اللہ کے لیے عاجزی اختیار کرتا ہے اللہ اسے سربلندی عطا فرماتا ہے۔',
      ref: 'صحیح مسلم: ۲۵۸۸',
      benefit: 'صدقہ مال میں برکت، اضافہ اور حفاظت کا ذریعہ ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. باقاعدگی سے زکوٰۃ کا حساب کتاب',
      explanation: 'زکوٰۃ محض اندازے سے نہیں بلکہ نقد رقم، سونا، چاندی اور مالِ تجارت کی اصل مالیت کے مطابق مکمل اڑھائی فیصد ادا کی جائے۔',
      actionItem: 'سالانہ ایک متعین تاریخ پر اپنی زکوٰۃ کا مفصل حساب لگا کر امانت دار مستحقین کو تلاش کریں۔'
    },
    {
      pointTitle: '۲. خفیہ اور باوقار انداز میں مدد',
      explanation: 'غریبوں کی عزتِ نفس کا تحفظ کریں۔ ہاتھ ایسے دیں کہ بائیں ہاتھ کو بھی خبر نہ ہو کہ دائیں ہاتھ نے کیا خرچ کیا۔',
      actionItem: 'قریبی نادار سفید پوش رشتہ داروں کو ترجیح دیں جن کا ہاتھ مانگنے سے رکتا ہے۔'
    }
  ];

  const speakerGuidance = [
    'بخل اور حرص کے قرآنی عذاب کو کھول کر بیان کریں۔',
    'صدقے کے ذریعے مصیبتوں اور بیماریوں کے ٹلنے کا نبوی نسخہ واضح کریں۔'
  ];

  const conclusionAndDua = {
    summary: 'کفن میں جیب نہیں ہوتی اور نہ قبر میں بینک بیلنس کام آتا ہے۔ وقت رہتے اپنے مال کو آخرت کی پونجی بنا لیجیے۔',
    arabicDua: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.',
    urduDuaTranslation: 'اے اللہ! میں پریشانی اور غم سے تیری پناہ مانگتا ہوں، کمزوری اور سستی سے تیری پناہ مانگتا ہوں، بزدلی اور بخل سے تیری پناہ مانگتا ہوں، اور قرض کے غلبے اور لوگوں کے قہر و تسلط سے تیری پناہ مانگتا ہوں!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildTawbahSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'سچی توبہ اور استغفار: گناہوں کی بخشش اور دل کی زندگی کا راستہ';
  const subTitle = 'رحمتِ الٰہی کی وسعت اور رجوع الی اللہ پر اثر انگیز خطبہ';

  const intro = {
    hook: 'کوئی انسان غلطیوں سے پاک نہیں، لیکن بہترین خطاکار وہ ہیں جو غلطی کے بعد تکبر کے بجائے عاجزی کے ساتھ اپنے رب کے سامنے جھک جائیں اور سچے دل سے توبہ کریں۔',
    historicalContext: 'اللہ تعالیٰ نے توبہ کا دروازہ موت کے نزع اور مغرب سے سورج نکلنے تک کھلا رکھا ہے۔',
    relevanceToday: 'مایوسی اور ناامیدی کے شکار دلوں کے لیے توبہ وہ آبِ حیات ہے جو زندگی کو نئے سرے سے نیکی پر استوار کرتا ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ',
      urdu: 'فرما دیجیے: اے میرے وہ بندو جنہوں نے اپنی جانوں پر زیادتیاں کی ہیں! اللہ کی رحمت سے ہرگز ناامید نہ ہونا، بے شک اللہ تمام گناہوں کو معاف فرما دیتا ہے؛ یقیناً وہی بڑا بخشنے والا، نہایت مہربان ہے۔',
      surahRef: 'سورۃ الزمر: ۵۳'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لا ذَنْبَ لَهُ.',
      urdu: 'گناہ سے سچے دل سے توبہ کرنے والا ایسا ہے گویا اس نے گناہ کیا ہی نہیں تھا۔',
      ref: 'سنن ابن ماجہ: ۴۲۵۰',
      benefit: 'سچی توبہ ماضی کے سیاہ نامۂ اعمال کو نیکیوں میں بدل دیتی ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. توبہ کے تین بنیادی شرائط کی تکمیل',
      explanation: 'گناہ کو فوری طور پر ترک کرنا، ماضی پر سچی ندامت کا اظہار کرنا، اور آئندہ نہ کرنے کا پختہ ارادہ کرنا۔ اگر بندے کا حق ہو تو وہ واپس لوٹانا۔',
      actionItem: 'آج ہی اپنے تمام گناہوں پر تنہائی میں رو کر استغفار کریں اور حقوق العباد معاف کروائیں۔'
    },
    {
      pointTitle: '۲. استغفار کا ورد معمول بنائیں',
      explanation: 'سید الاستغفار اور مسنون اذکار سے دل کا زنگ دور ہوتا ہے اور رزق کے بند دروازے کھلتے ہیں۔',
      actionItem: 'روزانہ ۱۰۰ مرتبہ استغفار پڑھنے کا پکا معمول بنائیں۔'
    }
  ];

  const speakerGuidance = [
    'سامعین کے دلوں میں رحمتِ الٰہی کی امید جگائیں، خوف اور امید کا متوازن امتزاج رکھیں۔',
    'حقوق العباد کی اہمیت اور اس کی معافی کے طریقے پر کھل کر بات کریں۔'
  ];

  const conclusionAndDua = {
    summary: 'موت کا وقت کسی کو معلوم نہیں، توبہ کو کل پر مت ٹالیے۔ کیا معلوم کہ کل کا سورج ہماری توبہ سے پہلے طلوع ہو جائے! ابھی توبہ کیجیے۔',
    arabicDua: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلٰهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ.',
    urduDuaTranslation: 'اے اللہ! تو ہی میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں، اور میں اپنی استطاعت کے مطابق تیرے عہد اور وعدے پر قائم ہوں۔ میں اپنے کیے کے شر سے تیری پناہ مانگتا ہوں، اپنے اوپر تیری نعمتوں کا اعتراف کرتا ہوں اور اپنے گناہوں کا اقرار کرتا ہوں، پس مجھے بخش دے، کیونکہ تیرے سوا کوئی گناہوں کو معاف نہیں کر سکتا!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildParentsAndKinSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'والدین کے حقوق اور صلہ رحمی: جنت کی کنجی اور عمر و رزق میں برکت';
  const subTitle = 'قرآن و سنت کی روشنی میں خاندانی اخلاق اور والدین کی خدمت پر خطبہ';

  const intro = {
    hook: 'اللہ کے حقوق کے بعد سب سے مقدم اور عظیم حق والدین اور خونی رشتوں کا ہے۔ والدین دنیا میں جنت کے دروازے ہیں جنہیں راضی کر لیا جائے تو رب راضی ہو جاتا ہے۔',
    historicalContext: 'رسول اللہ ﷺ نے فرمایا کہ والدین کے سامنے "اف" تک نہ کہو اور ان کے سامنے عاجزی کا بازو جھکائے رکھو۔',
    relevanceToday: 'اولڈ ایج ہومز اور والدین سے بدزبانی کے اس دور میں اس خطبے کی اشد ضرورت ہے تاکہ خاندانی شیرازہ بکھرنے سے بچ سکے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا',
      urdu: 'اور آپ کے رب نے فیصلہ فرما دیا کہ تم اس کے سوا کسی کی عبادت نہ کرو اور والدین کے ساتھ حسنِ سلوک کرو؛ اگر ان میں سے کوئی ایک یا دونوں تمہارے سامنے بڑھاپے کو پہنچ جائیں تو انہیں "اف" بھی نہ کہو اور نہ انہیں جھڑکو، اور ان سے ادب سے نرم بات کہو۔',
      surahRef: 'سورۃ الاسراء: ۲۳'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ، وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدِ.',
      urdu: 'رب کی رضا والد کی رضا میں ہے، اور رب کی ناراضگی والد کی ناراضگی میں ہے۔',
      ref: 'جامع الترمذی: ۱۸۹۹',
      benefit: 'والدین کی خوشنودی الٰہی قرب کا سب سے آسان اور یقینی راستہ ہے۔'
    },
    {
      arabic: 'مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ، وَيُنْسَأَ لَهُ فِي أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ.',
      urdu: 'جو شخص یہ پسند کرے کہ اس کے رزق میں فراخی کی جائے اور اس کی عمر دراز کی جائے، تو اسے چاہیے کہ وہ صلہ رحمی کرے۔',
      ref: 'صحیح البخاری: ۲۰۶۷',
      benefit: 'رشتہ داروں کے ساتھ حسنِ سلوک دنیا میں رزق اور عمر دونوں کی برکت بنتا ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. والدین کے سامنے آواز نیچی رکھنا اور خدمت',
      explanation: 'والدین کے بڑھاپے میں ان کی معمولی باتوں پر چڑچڑے ہونے کے بجائے محبت اور مسکراہٹ کے ساتھ ان کے کام سنبھالیں۔',
      actionItem: 'روزانہ والدین کے ہاتھ یا پیشانی چوم کر ان کی دعائیں لیں؛ اگر دنیا سے رخصت ہو چکے ہیں تو ان کے لیے ایصالِ ثواب اور دعائے مغفرت کریں۔'
    },
    {
      pointTitle: '۲. قطع رحمی کا خاتمہ اور رشتہ داری جوڑنا',
      explanation: 'سچا صلہ رحمی کرنے والا وہ نہیں جو بدلے میں سلوک کرے، بلکہ وہ ہے کہ جب اس سے رشتہ توڑا جائے تو وہ آگے بڑھ کر جوڑے۔',
      actionItem: 'جس رشتہ دار سے عرصہ دراز سے ناراضگی چل رہی ہے، آج ہی فون کر کے سلام کیجیے اور رنجش مٹائیے۔'
    }
  ];

  const speakerGuidance = [
    'والدین کی مشقتوں اور راتوں کی بے خوابی کا دل پگھلا دینے والا خاکہ کھینچیں۔',
    'نوجوانوں کو والدین کی نافرمانی کے دنیاوی و اخروی عذاب سے باخبر کریں۔'
  ];

  const conclusionAndDua = {
    summary: 'والدین کے سائے کو غنیمت جانیے۔ ان کے رخصت ہونے کے بعد پچھتاوے کے سوا کچھ ہاتھ نہیں آتا۔',
    arabicDua: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا. رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ.',
    urduDuaTranslation: 'اے میرے رب! ان دونوں پر رحم فرما جیسا کہ انہوں نے بچپن میں مجھے پالا۔ اے ہمارے رب! مجھے، میرے والدین کو اور تمام مومنین کو اس دن بخش دینا جس دن حساب قائم ہوگا!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildKnowledgeSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'طلبِ علم کی فضیلت، علماء کا مقام اور علمِ نافع کا حصول';
  const subTitle = 'شریعت میں علم کی منزلت اور جہالت کے خاتمے پر فکری خطبہ';

  const intro = {
    hook: 'علم وہ چراغ ہے جس سے ظلمتیں دور ہوتی ہیں۔ وہ قومیں کبھی ترقی نہیں کر سکتیں جو علم اور علماء کی ناقدری کرتی ہیں۔',
    historicalContext: 'قرآن کا پہلا حکم "اقرأ" (پڑھیے) علم کی عظمت کا اعلان تھا۔ انبیاء علیہم السلام نے وراثت میں درہم و دینار نہیں بلکہ علم چھوڑا۔',
    relevanceToday: 'دین کے بنیادی احکام (طہارت، حلال و حرام، معاملات) سے بے خبری گناہوں کی بنیادی وجہ ہے۔ علمِ نافع ہر مسلمان کی بنیادی ضرورت ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ ۗ إِنَّمَا يَتَذَكَّرُ أُولُو الْأَلْبَابِ',
      urdu: 'فرما دیجیے: کیا جاننے والے اور نہ جاننے والے برابر ہو سکتے ہیں؟ نصیحت تو صرف وہی قبول کرتے ہیں جو عقل والے ہیں۔',
      surahRef: 'سورۃ الزمر: ۹'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',
      urdu: 'جو شخص علم کی تلاش میں کسی راستے پر چلتا ہے، اللہ تعالیٰ اس کے بدلے اس کے لیے جنت کا راستہ آسان فرما دیتا ہے۔',
      ref: 'صحیح مسلم: ۲۶۹۹',
      benefit: 'دینی علم کا حصول سیدھا جنت کی طرف لے جانے والا عمل ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. روزمرہ دینی مسائل کا فہم حاصل کرنا',
      explanation: 'نماز کے فرائض و واجبات، وضو کے مسائل اور اپنی تجارت کے حلال و حرام احکام سیکھنا ہر ایک پر فرضِ عین ہے۔',
      actionItem: 'کسی مستند عالمِ دین یا درسِ نظامی کے دائرۂ درس میں باقاعدگی سے شرکت کریں۔'
    },
    {
      pointTitle: '۲. باعمل بننا اور تکبر سے بچنا',
      explanation: 'علم وہ ہے جو عمل میں ظاہر ہو اور خشیتِ الٰہی پیدا کرے، محض بحث و تکرار برائے تکرار علم کا زوال ہے۔',
      actionItem: 'جو بھی نئی شرعی بات سیکھیں اس پر پہلے خود عمل کریں اور پھر حکمت سے دوسروں تک پہنچائیں۔'
    }
  ];

  const speakerGuidance = [
    'علماءِ حق کے ادب اور مدارسِ اسلامیہ کی خدمات کو خراجِ تحسین پیش کریں۔',
    'نوجوانوں کو مطالعہ کتب اور دینی لٹریچر پڑھنے کا شوق دلائیں۔'
  ];

  const conclusionAndDua = {
    summary: 'علم کے بغیر عبادت بھی بے روح ہو جاتی ہے۔ اپنے بچوں کو دین کا سچا علم سکھائیے تاکہ وہ معاشرے کے لیے مشعلِ راہ بنیں۔',
    arabicDua: 'اللَّهُمَّ انْفَعْنَا بِمَا عَلَّمْتَنَا، وَعَلِّمْنَا مَا يَنْفَعُنَا، وَزِدْنَا عِلْمًا، وَالْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ.',
    urduDuaTranslation: 'اے اللہ! جو علم تو نے ہمیں عطا فرمایا اس سے ہمیں نفع پہنچا، اور ہمیں وہ علم سکھا جو ہمارے لیے نفع بخش ہو، اور ہمارے علم میں اضافہ فرما، اور ہر حال میں اللہ ہی کا شکر ہے!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildCharacterSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'حسنِ اخلاق اور سچائی: میزان میں سب سے بھاری عمل';
  const subTitle = 'نبی کریم ﷺ کے اسوہ حسنہ اور سچائی پر فکری خطبہ';

  const intro = {
    hook: 'قیامت کے دن میزان میں نماز، روزے کے ساتھ سب سے بھاری پلڑا حسنِ اخلاق کا ہوگا۔ انسان اپنے اخلاق کے ذریعے دن بھر کے روزے دار اور رات بھر کے عابد کا درجہ پا لیتا ہے۔',
    historicalContext: 'رسول اللہ ﷺ کو بعثت سے پہلے بھی مکہ والے "صادق و امین" کہہ کر پکارتے تھے، اور آپ نے فرمایا کہ میں تو مکارمِ اخلاق کی تکمیل کے لیے بھیجا گیا ہوں۔',
    relevanceToday: 'معاشرے میں بدتہذیبی، جھوٹ، فراڈ اور دھوکہ دہی کی بیماریوں کا علاج اخلاقِ نبوی کے احیاء میں ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ',
      urdu: 'اور بے شک آپ اخلاق کے سب سے بلند مرتبے پر فائز ہیں۔',
      surahRef: 'سورۃ القلم: ۴'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'مَا شَيْءٌ أَثْقَلُ فِي مِيزَانِ الْمُؤْمِنِ يَوْمَ الْقِيَامَةِ مِنْ خُلُقٍ حَسَنٍ، وَإِنَّ اللَّهَ لَيُبْغِضُ الْفَاحِشَ الْبَذِيءَ.',
      urdu: 'قیامت کے دن مومن کے پلڑے میں حسنِ اخلاق سے زیادہ وزنی کوئی چیز نہیں ہوگی، اور بے شک اللہ تعالیٰ بے حیا اور بدزبان شخص سے سخت ناراض ہوتا ہے۔',
      ref: 'جامع الترمذی: ۲۰۰۲',
      benefit: 'اچھے اخلاق کا وزن نامۂ اعمال میں تمام نفلی عبادات سے بڑھ جاتا ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. مسکراہٹ اور خندہ پیشانی سے پیش آنا',
      explanation: 'اپنے مسلمان بھائی سے مسکرا کر ملنا بھی صدقہ ہے۔ گھر میں اہل و عیال کے ساتھ اور باہر لوگوں سے شائستگی سے بات کریں۔',
      actionItem: 'آج سے ہر ایک کو سلام میں پہل کریں اور گفتگو میں نرمی اختیار کریں۔'
    },
    {
      pointTitle: '۲. سچائی کو اپنی پہچان بنانا',
      explanation: 'سچائی نیکی کی طرف لے جاتی ہے اور نیکی جنت کی طرف لے جاتی ہے۔ مذاق میں بھی جھوٹ بولنے سے بچیں۔',
      actionItem: 'اپنے کاروبار اور روزمرہ بیانات میں جھوٹ اور مبالغہ آرائی سے مکمل توبہ کریں۔'
    }
  ];

  const speakerGuidance = [
    'نبی کریم ﷺ کے ساتھ بدسلوکی کرنے والوں کو معاف کرنے کے واقعات بیان کریں۔',
    'کاروبار میں سچائی کی برکتوں اور جھوٹی قسموں کی تباہ کاری پر متنبہ فرمائیں۔'
  ];

  const conclusionAndDua = {
    summary: 'اخلاق کے بغیر دین کا تصور ادھورا ہے۔ مسلمان کی خوشبو اس کے عمدہ کردار اور سچائی سے مہکنی چاہیے۔',
    arabicDua: 'اللَّهُمَّ اهْدِنَا لأَحْسَنِ الأَخْلاقِ لا يَهْدِي لأَحْسَنِهَا إِلا أَنْتَ، وَاصْرِفْ عَنَّا سَيِّئَهَا لا يَصْرِفُ عَنَّا سَيِّئَهَا إِلا أَنْتَ.',
    urduDuaTranslation: 'اے اللہ! ہمیں بہترین اخلاق کی طرف رہنمائی فرما، تیرے سوا کوئی بہترین اخلاق کی طرف رہنمائی نہیں کر سکتا، اور ہم سے برے اخلاق کو دور فرما، تیرے سوا کوئی برے اخلاق کو ہم سے دور نہیں کر سکتا!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildAkhirahSermon(_params: SermonGeneratorParams): LectureSermonOutline {
  const topicTitle = 'فکرِ آخرت اور موت کی یاد: غفلت کی نیند سے بیداری کا نسخہ';
  const subTitle = 'قبر، حشر اور حساب و کتاب کی تیاری پر لرزہ خیز و ناصحانہ خطبہ';

  const intro = {
    hook: 'یہ دنیا محض ایک مسافر خانہ ہے اور انسان کا اصل گھر آخرت ہے۔ عقلمند وہ ہے جو چند روزہ عارضی زندگی کے فریب میں آ کر ابدی زندگی کو برباد نہ کرے۔',
    historicalContext: 'رسول اللہ ﷺ نے فرمایا کہ لذتوں کو ختم کرنے والی چیز یعنی موت کو کثرت سے یاد کیا کرو۔',
    relevanceToday: 'مادیت پرستی اور دنیا کی حرص نے انسان کو ایسا اندھا کر دیا ہے کہ وہ موت اور پیشیِ خداوندی کو بھلا بیٹھا ہے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ ۗ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ الْقِيَامَةِ ۖ فَمَن زُحْزِحَ عَنِ النَّارِ وَأُدْخِلَ الْجَنَّةَ فَقَدْ فَازَ ۗ وَمَا الْحَيَاةُ الدُّنْيَا إِلَّا مَتَاعُ الْغُرُورِ',
      urdu: 'ہر جان کو موت کا ذائقہ چکھنا ہے، اور قیامت کے دن ہی تمہیں تمہارے پورے پورے بدلے دیے جائیں گے؛ پس جسے آگ سے بچا لیا گیا اور جنت میں داخل کر دیا گیا تو وہ کامیاب ہو گیا، اور دنیا کی زندگی تو صرف دھوکے کا سامان ہے۔',
      surahRef: 'سورۃ آل عمران: ۱۸۵'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: 'الْكَيِّسُ مَنْ دَانَ نَفْسَهُ وَعَمِلَ لِمَا بَعْدَ الْمَوْتِ، وَالْعَاجِزُ مَنْ أَتْبَعَ نَفْسَهُ هَوَاهَا وَتَمَنَّى عَلَى اللَّهِ.',
      urdu: 'دانا اور عقلمند وہ ہے جس نے اپنے نفس کا محاسبہ کیا اور موت کے بعد والی زندگی کے لیے تیاری کی، اور نادان و بے بس وہ ہے جس نے اپنے نفس کو خواہشات کے پیچھے لگا دیا اور اللہ پر جھوٹی امیدیں باندھے رکھیں۔',
      ref: 'جامع الترمذی: ۲۴۵۹',
      benefit: 'حقیقی دانائی دنیا سمیٹنے میں نہیں بلکہ آخرت سنوارنے میں ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. روزانہ رات سونے سے پہلے اپنا محاسبہ',
      explanation: 'بستر پر لیٹتے ہی سوچیں کہ اگر آج میری آخری رات ہو تو میں رب کے سامنے کیا منہ لے کر جاؤں گا؟ فوراً توبہ کریں۔',
      actionItem: 'روزانہ قبرستان جانے یا کم از کم کسی جنازے میں شرکت کا معمول بنا کر دنیا کی بے ثباتی کا مشاہدہ کریں۔'
    },
    {
      pointTitle: '۲. حقوق العباد اور قرضوں کی صفائی',
      explanation: 'شہید کے بھی تمام گناہ معاف ہو جاتے ہیں سوائے قرض کے۔ کسی کا ادھار یا ناحق حق اپنے ذمے نہ رہنے دیں۔',
      actionItem: 'اپنی شرعی وصیت لکھ کر رکھیں اور مالی معاملات بالکل صاف رکھیں۔'
    }
  ];

  const speakerGuidance = [
    'قبر کی تنہائی اور پہلے سوال و جواب کا نقشہ کھینچیں۔',
    'سامعین کو ڈرانے کے ساتھ ساتھ جنت کی لازوال نعمتوں اور اللہ کی رحمت کی بشارت دیں۔'
  ];

  const conclusionAndDua = {
    summary: 'موت اچانک آئے گی اور توبہ کی مہلت نہیں ملے گی۔ عقلمندی اسی میں ہے کہ بلاوے سے پہلے اپنے پروردگار کو راضی کر لیا جائے۔',
    arabicDua: 'اللَّهُمَّ حَاسِبْنَا حِسَابًا يَسِيرًا. اللَّهُمَّ اجْعَلْ خَيْرَ أَعْمَارِنَا أَوَاخِرَهَا، وَخَيْرَ أَعْمَالِنَا خَوَاتِيمَهَا، وَخَيْرَ أَيَّامِنَا يَوْمَ نَلْقَاكَ فِيهِ.',
    urduDuaTranslation: 'اے اللہ! ہمارا حساب آسان فرما۔ اے اللہ! ہماری بہترین عمر ہمارے آخری لمحات کو بنا، ہمارے بہترین اعمال ہمارے خاتمے کے اعمال کو بنا، اور ہمارے دنوں میں سے بہترین دن وہ دن بنا جس دن ہم تیری بارگاہ میں حاضر ہوں!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

function buildGeneralSunnahSermon(params: SermonGeneratorParams): LectureSermonOutline {
  const chapterName = params.chapterTitleUr || params.chapterTitleAr || 'دینِ اسلام اور اسوہ حسنہ';
  const topicTitle = `${chapterName}: قرآنی تعلیمات اور سنتِ نبوی پر استقامت کا راستہ`;
  const subTitle = 'احادیثِ طیبہ کی روشنی میں فکری، ایمانی و معاشرتی خطبہ برائے جمعۃ المبارک';

  const intro = {
    hook: 'دینِ اسلام صرف عبادات کا مجموعہ نہیں بلکہ زندگی گزارنے کا مکمل اور ہمہ گیر نظام ہے۔ کتاب و سنت کی رہنمائی میں ہی انسانیت کا فلاح و نجات کا راستہ ہے۔',
    historicalContext: 'صحابۂ کرام رضی اللہ عنہم نے رسول اللہ ﷺ کے ارشادات کو حرف بحرف اپنی زندگیوں میں نافذ کیا جس کے نتیجے میں وہ دنیا کے امام اور آخرت کے سرخرو بنے۔',
    relevanceToday: 'موجودہ دور میں فتنے اور فکری الجھنیں عام ہیں۔ جب تک ہم مستند احادیث اور تعلیماتِ نبوی سے جڑے رہیں گے ہم کبھی گمراہ نہیں ہوں گے۔'
  };

  const quranEvidences: QuranEvidence[] = [
    {
      arabic: 'قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ ۗ وَاللَّهُ غَفُورٌ رَّحِيمٌ',
      urdu: 'فرما دیجیے: اگر تم اللہ سے محبت رکھتے ہو تو میری پیروی کرو، اللہ تم سے محبت فرمائے گا اور تمہارے گناہوں کو بخش دے گا، اور اللہ بڑا بخشنے والا، نہایت مہربان ہے۔',
      surahRef: 'سورۃ آل عمران: ۳۱'
    }
  ];

  const hadithEvidences: HadithEvidence[] = [
    {
      arabic: params.arabicText || 'تَرَكْتُ فِيكُمْ أَمْرَيْنِ لَنْ تَضِلُّوا مَا تَمَسَّكْتُمْ بِهِمَا: كِتَابَ اللَّهِ وَسُنَّةَ نَبِيِّهِ.',
      urdu: params.urduText || 'میں تمہارے درمیان دو ایسی چیزیں چھوڑے جا رہا ہوں کہ اگر تم نے انہیں مضبوطی سے تھامے رکھا تو کبھی گمراہ نہ ہو گے: اللہ کی کتاب اور اس کے نبی ﷺ کی سنت۔',
      ref: params.hadithNumber ? `حدیث نمبر: ${params.hadithNumber}` : 'موطأ إمام مالك',
      benefit: 'کتاب و سنت کو مضبوطی سے تھامنا ہر فتنے کے دور میں نجات کی واحد ضمانت ہے۔'
    }
  ];

  const practicalTakeaways: PracticalTakeaway[] = [
    {
      pointTitle: '۱. سنتِ نبوی کو روزمرہ زندگی میں اپنانا',
      explanation: 'کھانے پینے، سونے جاگنے اور بات چیت میں سنت کے طریقوں کو زندہ کریں تاکہ ہر سانس عبادت بن جائے۔',
      actionItem: 'روزانہ کسی ایک مسنون دعا یا سنت پر خود بھی عمل کریں اور بچوں کو بھی سکھائیں۔'
    },
    {
      pointTitle: '۲. باہمی اخوت اور انتشار سے پرہیز',
      explanation: 'فروعی اور جزوی اختلافات کو دشمنی کا ذریعہ نہ بنائیں، باہم جڑ کر رہیں اور مسلمانوں کے درمیان محبت کو فروغ دیں۔',
      actionItem: 'کسی بھی اختلافی موضوع پر غصہ دکھانے کے بجائے شائستگی اور حکمت سے بات کریں۔'
    }
  ];

  const speakerGuidance = [
    'خطبے میں حکمت اور موعظۂ حسنہ (نصیحتِ دلنشین) کا اسلوب اپنائیں۔',
    'احادیث کی روشنی میں عوام کو عملی قدم اٹھانے کی پرزور ترغیب دیں۔'
  ];

  const conclusionAndDua = {
    summary: 'دین پر استقامت ہی انسان کا سب سے بڑا اعزاز ہے۔ آئیے عہد کریں کہ ہم اپنی زندگیوں کو شریعتِ مطہرہ کے مطابق ڈھالیں گے۔',
    arabicDua: 'اللَّهُمَّ يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قُلُوبَنَا عَلَى دِينِكَ، وَيَا مُصَرِّفَ الْقُلُوبِ صَرِّفْ قُلُوبَنَا عَلَى طَاعَتِكَ.',
    urduDuaTranslation: 'اے دلوں کو پھیرنے والے پروردگار! ہمارے دلوں کو اپنے دین پر ثابت قدم فرما، اور اے دلوں کے احوال بدلنے والے مالک! ہمارے دلوں کو اپنی اطاعت کی طرف موڑ دے!'
  };

  const fullFormattedScript = assembleFullScript({
    topicTitle,
    subTitle,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua
  });

  return {
    topicTitle,
    subTitle,
    khutbahOpening: MASNOON_KHUTBAH_OPENING,
    intro,
    quranEvidences,
    hadithEvidences,
    practicalTakeaways,
    speakerGuidance,
    conclusionAndDua,
    fullFormattedScript
  };
}

// Helper to assemble full markdown/text script
function assembleFullScript(data: {
  topicTitle: string;
  subTitle: string;
  intro: { hook: string; historicalContext: string; relevanceToday: string };
  quranEvidences: QuranEvidence[];
  hadithEvidences: HadithEvidence[];
  practicalTakeaways: PracticalTakeaway[];
  speakerGuidance: string[];
  conclusionAndDua: { summary: string; arabicDua: string; urduDuaTranslation: string };
}): string {
  let s = `========================================================================\n`;
  s += `🎙️ خطبۂ جمعۃ المبارک و درسی بیان کے مکمل مسوداتی نکات\n`;
  s += `عنوان: ${data.topicTitle}\n`;
  s += `ذیلی عنوان: ${data.subTitle}\n`;
  s += `تحریکِ ایمان ڈیجیٹل پورٹل • https://tehreek-e-iman.pages.dev\n`;
  s += `========================================================================\n\n`;

  s += `【۱. خطبۂ مسنونہ و کلماتِ افتتاح】\n`;
  s += `${MASNOON_KHUTBAH_OPENING}\n\n`;

  s += `【۲. موضوع کا تعارف و پس منظر】\n`;
  s += `• تمہیدِ خطابت: ${data.intro.hook}\n`;
  s += `• تاریخی و درسی پس منظر: ${data.intro.historicalContext}\n`;
  s += `• دورِ حاضر میں اہمیت: ${data.intro.relevanceToday}\n\n`;

  s += `【۳. قرآنی آیات اور احادیثِ شواہد】\n`;
  s += `❖ قرآنی آیاتِ بینات:\n`;
  data.quranEvidences.forEach((q, i) => {
    s += `${i + 1}. ${q.arabic}\n`;
    s += `   ترجمہ: ${q.urdu}\n`;
    s += `   حوالہ: (${q.surahRef})\n\n`;
  });

  s += `❖ احادیثِ مبارکہ شواہد:\n`;
  data.hadithEvidences.forEach((h, i) => {
    s += `${i + 1}. [عربی]: ${h.arabic}\n`;
    s += `   [ترجمہ]: ${h.urdu}\n`;
    s += `   [حوالہ]: ${h.ref}\n`;
    s += `   [علمی نکتہ]: ${h.benefit}\n\n`;
  });

  s += `【۴. عوام الناس کے لیے اصلاحی اور تربیتی نکات】\n`;
  data.practicalTakeaways.forEach((p) => {
    s += `• ${p.pointTitle}\n`;
    s += `  تشریح: ${p.explanation}\n`;
    s += `  عملی لائحۂ عمل: ${p.actionItem}\n\n`;
  });

  s += `【۵. خطیب و مربی کے لیے اہم ہدایاتِ خطابت】\n`;
  data.speakerGuidance.forEach((g) => {
    s += `✓ ${g}\n`;
  });
  s += `\n`;

  s += `【۶. خلاصۂ کلام و دعائے مسنونہ】\n`;
  s += `خلاصہ: ${data.conclusionAndDua.summary}\n\n`;
  s += `عربی دعا: ${data.conclusionAndDua.arabicDua}\n\n`;
  s += `دعا کا ترجمہ: ${data.conclusionAndDua.urduDuaTranslation}\n\n`;
  s += `========================================================================\n`;
  s += `طبع و نشر بذریعہ تحریکِ ایمان پورٹل برائے ائمہ و خطباء کرام\n`;

  return s;
}
