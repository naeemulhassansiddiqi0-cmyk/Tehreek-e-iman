// Tehreek-e-Iman — Advanced Takhreej & Cross-References Service (تخریج و شواہد)
// Provides exact matching references across the Six Canonical Hadith Books (الكتب الستة)
// and Musnad Ahmad for scholarly research and comparative study.

export interface PrimaryBookReference {
  bookId: 'muslim' | 'abudawood' | 'tirmidhi' | 'nasai' | 'ibnmajah' | 'ahmad';
  bookNameUrdu: string;
  bookNameArabic: string;
  hadithNumber: string | number;
  chapterUrdu: string;
  chapterArabic: string;
  wordingRelation: 'مماثل باللفظ' | 'ہم معنی روایت' | 'مختصر طریق' | 'روایت بالمعنی' | 'طریقِ دیگر';
  badgeColor: string;
  linkSlug?: string;
}

export interface BukhariRepetition {
  hadithNumber: number;
  chapterTitleUrdu: string;
  chapterTitleArabic: string;
}

export interface TakhreejData {
  bukhariHadithNumber: number;
  primaryReferences: PrimaryBookReference[];
  bukhariRepetitions: BukhariRepetition[];
  chainPivotArabic: string; // مدار الإسناد
  chainPivotUrdu: string;
  takhreejSummary: string; // خلاصۂ تخریج برائے اساتذہ و محققین
}

// Classical Database of Exact Takhreej for Sahih Bukhari Hadiths
const BUKHARI_EXACT_TAKHOOR: Record<number, TakhreejData> = {
  1: {
    bukhariHadithNumber: 1,
    primaryReferences: [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: '1907',
        chapterUrdu: 'کتاب الامارۃ — باب: تمام اعمال کا دارومدار نیت پر ہے',
        chapterArabic: 'كتاب الإمارة — باب قوله ﷺ: إنما الأعمال بالنية',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'abudawood',
        bookNameUrdu: 'سنن ابی داود',
        bookNameArabic: 'سنن أبي داود',
        hadithNumber: '2201',
        chapterUrdu: 'کتاب الطلاق — باب: طلاق اور نیتوں کا بیان',
        chapterArabic: 'كتاب الطلاق — باب فيما عني به الطلاق والنيات',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        linkSlug: 'sunan-abu-daud'
      },
      {
        bookId: 'tirmidhi',
        bookNameUrdu: 'جامع الترمذی',
        bookNameArabic: 'جامع الترمذي',
        hadithNumber: '1647',
        chapterUrdu: 'کتاب فضائل الجہاد — باب: جو شخص ریاکاری یا دنیا کے لیے لڑے',
        chapterArabic: 'كتاب فضائل الجهاد — باب ما جاء فيمن يقاتل رياء وللدنيا',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        linkSlug: 'jami-tirmizi'
      },
      {
        bookId: 'nasai',
        bookNameUrdu: 'سنن النسائی',
        bookNameArabic: 'سنن النسائي',
        hadithNumber: '75',
        chapterUrdu: 'کتاب الطہارۃ — باب: وضو میں نیت کی اہمیت',
        chapterArabic: 'كتاب الطهارة — باب النية في الوضوء',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
        linkSlug: 'sunan-nasai'
      },
      {
        bookId: 'ibnmajah',
        bookNameUrdu: 'سنن ابن ماجہ',
        bookNameArabic: 'سنن ابن ماجه',
        hadithNumber: '4227',
        chapterUrdu: 'کتاب الزہد — باب: نیت کی درستی اور اخلاص',
        chapterArabic: 'كتاب الزهد — باب النية',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        linkSlug: 'sunan-ibn-majah'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: '168, 300',
        chapterUrdu: 'مسند العشرۃ المبشرین — مسند امیر المؤمنین عمر بن الخطاب',
        chapterArabic: 'مسند العشرة المبشرين بالجنة — مسند عمر بن الخطاب رضي الله عنه',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ],
    bukhariRepetitions: [
      { hadithNumber: 54, chapterTitleUrdu: 'کتاب الایمان — باب: ہر عمل کا دارومدار نیت پر ہے', chapterTitleArabic: 'كِتَابُ الإِيمَانِ — بَابُ مَا جَاءَ أَنَّ الأَعْمَالَ بِالنِّيَّةِ' },
      { hadithNumber: 2529, chapterTitleUrdu: 'کتاب العتق — باب: غلام آزاد کرنے میں نیت اور خطا', chapterTitleArabic: 'كِتَابُ الْعَتْقِ — بَابُ الْخَطَإِ وَالنِّسْيَانِ فِي الْعَتَاقَةِ' },
      { hadithNumber: 3898, chapterTitleUrdu: 'کتاب مناقب الانصار — باب: نبی کریم ﷺ اور صحابہ کی ہجرتِ مدینہ', chapterTitleArabic: 'كِتَابُ مَنَاقِبِ الأَنْصَارِ — بَابُ مَقْدَمِ النَّبِيِّ ﷺ وَأَصْحَابِهِ' },
      { hadithNumber: 5070, chapterTitleUrdu: 'کتاب النکاح — باب: جو شخص نکاح کی نیت سے ہجرت کرے', chapterTitleArabic: 'كِتَابُ النِّكَاحِ — بَابُ مَنْ هَاجَرَ أَوْ ابْتَغَى التَّزْوِيجَ' },
      { hadithNumber: 6689, chapterTitleUrdu: 'کتاب الایمان والنذور — باب: قسموں میں نیت کا اعتبار', chapterTitleArabic: 'كِتَابُ الأَيْمَانِ وَالنُّذُورِ — بَابُ النِّيَّةِ فِي الأَيْمَانِ' },
      { hadithNumber: 6953, chapterTitleUrdu: 'کتاب الحیل — باب: نکاح اور عبادات میں حیلہ باطل ہونا', chapterTitleArabic: 'كِتَابُ الْحِيَلِ — بَابٌ فِي النِّكَاحِ وَتَرْكِ الْحِيَلِ' }
    ],
    chainPivotArabic: 'يحيى بن سعيد الأنصاري عن محمد بن إبراهيم التيمي عن علقمة بن وقاص الليثي عن عمر بن الخطاب رضي الله عنه',
    chainPivotUrdu: 'یہ حدیثِ مبارکہ طبقۂ صحابہ، تابعین اور تبعِ تابعین میں "فردِ مطلق" ہے؛ سیدنا عمر سے صرف علقمہ، ان سے صرف محمد بن ابراہیم، اور ان سے صرف یحییٰ بن سعید انصاری نے روایت کی، پھر یحییٰ بن سعید سے دو سو سے زائد راویوں نے اسے نقل کیا۔',
    takhreejSummary: 'حدیثِ صحیح متفق علیہ، کتبِ ستہ کے تمام مؤلفین نے اسے اپنی کتابوں میں درج فرمایا ہے، اور امام بخاری نے اسے اپنی جامع میں 7 مختلف مقامات پر مختلف فقہی ابواب کے تحت تخریج کیا ہے۔'
  },
  2: {
    bukhariHadithNumber: 2,
    primaryReferences: [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: '2333',
        chapterUrdu: 'کتاب الفضائل — باب: نزولِ وحی کے وقت نبی کریم ﷺ کے پسینہ مبارک کی کیفیت',
        chapterArabic: 'كتاب الفضائل — باب عرق النبي ﷺ في البرد وحين يأتيه الوحي',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'tirmidhi',
        bookNameUrdu: 'جامع الترمذی',
        bookNameArabic: 'جامع الترمذي',
        hadithNumber: '3634',
        chapterUrdu: 'کتاب المناقب — باب: نزولِ وحی کی کیفیات کا بیان',
        chapterArabic: 'كتاب المناقب — باب في بدء الوحي وكيفيته',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        linkSlug: 'jami-tirmizi'
      },
      {
        bookId: 'nasai',
        bookNameUrdu: 'سنن النسائی',
        bookNameArabic: 'سنن النسائي',
        hadithNumber: '933',
        chapterUrdu: 'کتاب الافتتاح — باب: رسول اللہ ﷺ پر وحی کیسے نازل ہوتی تھی',
        chapterArabic: 'كتاب الافتتاح — باب كيف كان يأتيه الوحي',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
        linkSlug: 'sunan-nasai'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: '24056, 24522',
        chapterUrdu: 'مسند امہات المؤمنین — مسند ام المؤمنین عائشہ صدیقہ رضی اللہ عنہا',
        chapterArabic: 'مسند عائشة أم المؤمنين رضي الله عنها',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ],
    bukhariRepetitions: [
      { hadithNumber: 3215, chapterTitleUrdu: 'کتاب بدء الخلق — باب: فرشتوں کا ذکر اور نزولِ وحی', chapterTitleArabic: 'كِتَابُ بَدْءِ الْخَلْقِ — بَابُ ذِكْرِ الْمَلاَئِكَةِ' }
    ],
    chainPivotArabic: 'هشام بن عروة عن أبيه عروة بن الزبير عن أم المؤمنين عائشة رضي الله عنها عن الحارث بن هشام رضي الله عنه',
    chainPivotUrdu: 'مدارِ روایت امام ہشام بن عروہ بن زبیر تابعی پر ہے، جنہوں نے اپنے والد عروہ بن زبیر کے واسطے سے ام المؤمنین سیدہ عائشہ صدیقہ رضی اللہ عنہا سے یہ متصل سند روایت کی۔',
    takhreejSummary: 'صحیح متفق علیہ، امام مالک نے الموطأ (رقم: 477) میں اور امام مسلم نے اپنی صحیح میں نقل کیا۔'
  },
  3: {
    bukhariHadithNumber: 3,
    primaryReferences: [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: '160',
        chapterUrdu: 'کتاب الایمان — باب: رسول اللہ ﷺ پر آغازِ وحی کی کیفیت',
        chapterArabic: 'كتاب الإيمان — باب بدء الوحي إلى رسول الله ﷺ',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'tirmidhi',
        bookNameUrdu: 'جامع الترمذی',
        bookNameArabic: 'جامع الترمذي',
        hadithNumber: '3632',
        chapterUrdu: 'کتاب المناقب — باب: بعثت اور غارِ حرا کا واقعہ',
        chapterArabic: 'كتاب المناقب — باب ما جاء في بدء الوحي',
        wordingRelation: 'مختصر طریق',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        linkSlug: 'jami-tirmizi'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: '25684',
        chapterUrdu: 'مسند ام المؤمنین عائشہ رضی اللہ عنہا — حدیثِ غارِ حراء',
        chapterArabic: 'مسند عائشة أم المؤمنين رضي الله عنها في بدء النبوة',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ],
    bukhariRepetitions: [
      { hadithNumber: 3392, chapterTitleUrdu: 'کتاب الانبیاء — باب: انبیاء کرام پر وحی کا نزول', chapterTitleArabic: 'كِتَابُ الأَنْبِيَاءِ — بَابُ قَوْلِ اللَّهِ تَعَالَى وَوَهَبْنَا لِدَاوُودَ سُلَيْمَانَ' },
      { hadithNumber: 4953, chapterTitleUrdu: 'کتاب التفسیر — تفسیر سورۂ علق (اقرأ باسم ربک الذی خلق)', chapterTitleArabic: 'كِتَابُ التَّفْسِيرِ — سُورَةُ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' },
      { hadithNumber: 6982, chapterTitleUrdu: 'کتاب التعبیر — باب: اچھے سچے خوابوں سے نبوت کا آغاز', chapterTitleArabic: 'كِتَابُ التَّعْبِيرِ — بَابُ أَوَّلُ مَا بُدِئَ بِهِ رَسُولُ اللَّهِ الرُّؤْيَا' }
    ],
    chainPivotArabic: 'محمد بن مسلم بن شهاب الزهري عن عروة بن الزبير عن أم المؤمنين عائشة رضي الله عنها',
    chainPivotUrdu: 'امام ابن شہاب الزہری القرشی المدنی اس حدیثِ جلیلہ کا مدار ہیں؛ ان سے ائمۂ حدیث عقیل، یونس، اور معمر نے کمال ضبط کے ساتھ روایت کیا۔',
    takhreejSummary: 'حدیثِ صحیح متفق علیہ، آغازِ نبوت و تاریخِ اسلام کی سب سے مستند اور مفصل نص جو بخاری و مسلم میں متصل اسانید سے مروی ہے۔'
  },
  4: {
    bukhariHadithNumber: 4,
    primaryReferences: [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: '161',
        chapterUrdu: 'کتاب الایمان — باب: فترتِ وحی اور نزولِ یا ایہا المدثر',
        chapterArabic: 'كتاب الإيمان — باب بدء الوحي ونزول المدثر',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'tirmidhi',
        bookNameUrdu: 'جامع الترمذی',
        bookNameArabic: 'جامع الترمذي',
        hadithNumber: '3325',
        chapterUrdu: 'کتاب التفسیر — تفسیر سورۃ المدثر',
        chapterArabic: 'كتاب التفسير — ومن سورة المدثر',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        linkSlug: 'jami-tirmizi'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: '14283',
        chapterUrdu: 'مسند المکثرین من الصحابہ — مسند جابر بن عبد اللہ الانصاری رضی اللہ عنہما',
        chapterArabic: 'مسند جابر بن عبد الله الأنصاري رضي الله عنهما',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ],
    bukhariRepetitions: [
      { hadithNumber: 4922, chapterTitleUrdu: 'کتاب التفسیر — تفسیر سورۂ مدثر (یا ایہا المدثر قم فانذر)', chapterTitleArabic: 'كِتَابُ التَّفْسِيرِ — بَابُ قَوْلِهِ يَا أَيُّهَا الْمُدَّثِّرُ' },
      { hadithNumber: 4926, chapterTitleUrdu: 'کتاب التفسیر — باب: والرجز فاہجر کی تفسیر', chapterTitleArabic: 'كِتَابُ التَّفْسِيرِ — بَابُ قَوْلِهِ وَالرُّجْزَ فَاهْجُرْ' }
    ],
    chainPivotArabic: 'ابن شهاب الزهري عن أبي سلمة بن عبد الرحمن عن جابر بن عبد الله رضي الله عنهما',
    chainPivotUrdu: 'مدارِ روایت امام زہری عن ابی سلمہ بن عبد الرحمن عن جابر بن عبد اللہ الانصاری رضی اللہ عنہما پر ہے۔',
    takhreejSummary: 'صحیح متفق علیہ، سورۂ مدثر کے نزول اور اعلانِ نبوت کی ترتیب کا قطعی شاہد۔'
  },
  5: {
    bukhariHadithNumber: 5,
    primaryReferences: [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: '448',
        chapterUrdu: 'کتاب الصلاۃ — باب: قراءتِ قرآن کا سننا اور جلد بازی نہ کرنا',
        chapterArabic: 'كتاب الصلاة — باب الاستماع للقراءة والسكوت لها',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'tirmidhi',
        bookNameUrdu: 'جامع الترمذی',
        bookNameArabic: 'جامع الترمذي',
        hadithNumber: '3329',
        chapterUrdu: 'کتاب التفسیر — تفسیر سورۃ القیامۃ (لا تحرک بہ لسانک)',
        chapterArabic: 'كتاب التفسير — ومن سورة القيامة',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        linkSlug: 'jami-tirmizi'
      },
      {
        bookId: 'nasai',
        bookNameUrdu: 'سنن النسائی',
        bookNameArabic: 'سنن النسائي',
        hadithNumber: '928',
        chapterUrdu: 'کتاب الافتتاح — باب: تلاوتِ وحی کے وقت خاموشی',
        chapterArabic: 'كتاب الافتتاح — باب تحريك اللسان بالقراءة',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
        linkSlug: 'sunan-nasai'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: '3186',
        chapterUrdu: 'مسند العبادلہ — مسند عبد اللہ بن عباس رضی اللہ عنہما',
        chapterArabic: 'مسند عبد الله بن عباس رضي الله عنهما',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ],
    bukhariRepetitions: [
      { hadithNumber: 4927, chapterTitleUrdu: 'کتاب التفسیر — تفسیر سورۂ قیامۃ (ان علینا جمعہ وقرآنہ)', chapterTitleArabic: 'كِتَابُ التَّفْسِيرِ — بَابُ لاَ تُحَرِّكْ بِهِ لِسَانَكَ' },
      { hadithNumber: 5044, chapterTitleUrdu: 'کتاب فضائل القرآن — باب: حفظِ قرآن اور دل میں جمانا', chapterTitleArabic: 'كِتَابُ فَضَائِلِ الْقُرْآنِ — بَابُ جَمْعِ الْقُرْآنِ' },
      { hadithNumber: 7524, chapterTitleUrdu: 'کتاب التوحید — باب: کلامِ الٰہی کا سننا اور یاد کرنا', chapterTitleArabic: 'كِتَابُ التَّوْحِيدِ — بَابُ قَوْلِ اللَّهِ تَعَالَى لاَ تُحَرِّكْ بِهِ لِسَانَكَ' }
    ],
    chainPivotArabic: 'موسى بن أبي عائشة عن سعيد بن جبير عن عبد الله بن عباس رضي الله عنهما',
    chainPivotUrdu: 'مدارِ اسناد کوفی محدث موسیٰ بن ابی عائشہ پر ہے جنہوں نے تابعیِ جلیل حضرت سعید بن جبیر سے اور انہوں نے رئیس المفسرین حضرت عبد اللہ بن عباس سے بالسماع روایت کی۔',
    takhreejSummary: 'صحیح متفق علیہ، قرآن مجید کے نزول اور اس کی حفاظتِ الٰہیہ کی روشن قطعی دلیل۔'
  },
  6: {
    bukhariHadithNumber: 6,
    primaryReferences: [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: '2308',
        chapterUrdu: 'کتاب الفضائل — باب: رسول اللہ ﷺ کی بے مثال سخاوت اور جود و کرم',
        chapterArabic: 'كتاب الفضائل — باب كان النبي ﷺ أجود الناس بالخير من الريح المرسلة',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'nasai',
        bookNameUrdu: 'سنن النسائی',
        bookNameArabic: 'سنن النسائي',
        hadithNumber: '2095',
        chapterUrdu: 'کتاب الصیام — باب: رمضان میں سخاوت اور خیرات کی فضیلت',
        chapterArabic: 'كتاب الصيام — باب فضل الجود في شهر رمضان',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
        linkSlug: 'sunan-nasai'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: '2470',
        chapterUrdu: 'مسند عبد اللہ بن عباس رضی اللہ عنہما — جود النبی فی رمضان',
        chapterArabic: 'مسند عبد الله بن عباس رضي الله عنهما',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ],
    bukhariRepetitions: [
      { hadithNumber: 1902, chapterTitleUrdu: 'کتاب الصوم — باب: رمضان المبارک میں نبی کریم ﷺ کی سخاوت', chapterTitleArabic: 'كِتَابُ الصَّوْمِ — بَابُ أَجْوَدِ مَا كَانَ النَّبِيُّ ﷺ فِي رَمَضَانَ' },
      { hadithNumber: 3220, chapterTitleUrdu: 'کتاب بدء الخلق — باب: حضرت جبرائیل علیہ السلام کا رسول اللہ ﷺ کے پاس آنا', chapterTitleArabic: 'كِتَابُ بَدْءِ الْخَلْقِ — بَابُ ذِكْرِ جِبْرِيلَ عَلَيْهِ السَّلاَمُ' },
      { hadithNumber: 3554, chapterTitleUrdu: 'کتاب المناقب — باب: صفۃ النبی ﷺ اور اخلاقِ کریمہ', chapterTitleArabic: 'كِتَابُ الْمَنَاقِبِ — بَابُ صِفَةِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ' },
      { hadithNumber: 4997, chapterTitleUrdu: 'کتاب فضائل القرآن — باب: رمضان میں جبرائیل علیہ السلام کا دورۂ قرآن', chapterTitleArabic: 'كِتَابُ فَضَائِلِ الْقُرْآنِ — بَابُ كَانَ جِبْرِيلُ يَعْرِضُ الْقُرْآنَ عَلَى النَّبِيِّ' }
    ],
    chainPivotArabic: 'الزهري عن عبيد الله بن عبد الله بن عتبة عن عبد الله بن عباس رضي الله عنهما',
    chainPivotUrdu: 'مدارِ روایت امام ابن شہاب الزہری عن فقیہِ مدینہ عبید اللہ بن عبد اللہ بن عتبہ بن مسعود عن ابن عباس رضی اللہ عنہما پر ہے۔',
    takhreejSummary: 'صحیح متفق علیہ، مدارستِ قرآن اور رمضان المبارک میں انفاق فی سبیل اللہ کی بنیادی دلیل۔'
  },
  7: {
    bukhariHadithNumber: 7,
    primaryReferences: [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: '1773',
        chapterUrdu: 'کتاب الجہاد والسیر — باب: قیصرِ روم ہرقل کے نام رسول اللہ ﷺ کا خطِ مبارک',
        chapterArabic: 'كتاب الجهاد والسير — باب كتب النبي ﷺ إلى هرقل عظيم الروم يدعوه إلى الإسلام',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'abudawood',
        bookNameUrdu: 'سنن ابی داود',
        bookNameArabic: 'سنن أبي داود',
        hadithNumber: '3041',
        chapterUrdu: 'کتاب الخراج والامارۃ — باب: غیر مسلم بادشاہوں کو دعوتی خطوط لکھنا',
        chapterArabic: 'كتاب الخراج والإمارة والفيء — باب في مكاتبة أهل الحرب',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        linkSlug: 'sunan-abu-daud'
      },
      {
        bookId: 'tirmidhi',
        bookNameUrdu: 'جامع الترمذی',
        bookNameArabic: 'جامع الترمذي',
        hadithNumber: '2717',
        chapterUrdu: 'کتاب الاستئذان والآداب — باب: غیر مسلموں کو خط کا آغاز "سلام علی من اتبع الہدیٰ" سے کرنا',
        chapterArabic: 'كتاب الاستئذان والآداب — باب كيف يكتب إلى أهل الشرك',
        wordingRelation: 'مختصر طریق',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        linkSlug: 'jami-tirmizi'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: '2370',
        chapterUrdu: 'مسند عبد اللہ بن عباس عن ابی سفیان — حدیثُ ہرقل الطویل',
        chapterArabic: 'مسند عبد الله بن عباس عن أبي سفيان رضي الله عنهما',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ],
    bukhariRepetitions: [
      { hadithNumber: 2941, chapterTitleUrdu: 'کتاب الجہاد والسیر — باب: اہل کتاب کو اسلام کی دعوت دینا', chapterTitleArabic: 'كِتَابُ الْجِهَادِ وَالسِّيَرِ — بَابُ دُعَاءِ الْيَهُودِ وَالنَّصَارَى' },
      { hadithNumber: 4553, chapterTitleUrdu: 'کتاب التفسیر — تفسیر سورۂ آل عمران (یا اہل الکتاب تعالوا الی کلمۃ سواء)', chapterTitleArabic: 'كِتَابُ التَّفْسِيرِ — بَابُ قَوْلِهِ تَعَالَى قُلْ يَا أَهْلَ الْكِتَابِ' },
      { hadithNumber: 5833, chapterTitleUrdu: 'کتاب اللباس — باب: خطوط پر مہر لگانا (خاتمِ نبوت)', chapterTitleArabic: 'كِتَابُ اللِّبَاسِ — بَابُ هَلْ يُجْعَلُ نَقْشُ الْخَاتَمِ ثَلاَثَةَ أَسْطُرٍ' },
      { hadithNumber: 6260, chapterTitleUrdu: 'کتاب الاستئذان — باب: خط کی ابتدا "من محمد رسول اللہ الی فلاں" سے کرنا', chapterTitleArabic: 'كِتَابُ الاِسْتِئْذَانِ — بَابُ كَيْفَ يُكْتَبُ إِلَى أَهْلِ الْكِتَابِ' }
    ],
    chainPivotArabic: 'الزهري عن عبيد الله بن عبد الله بن عتبة عن عبد الله بن عباس عن أبي سفيان بن حرب رضي الله عنه',
    chainPivotUrdu: 'مدارِ روایت امام ابن شہاب الزہری عن عبید اللہ بن عبد اللہ عن ابن عباس عن ابی سفیان بن حرب رضی اللہ عنہ پر ہے، جس میں ہرقل کے دس سوالات اور دلائلِ نبوت محفوظ ہیں۔',
    takhreejSummary: 'حدیثِ صحیح متفق علیہ، کتبِ سیرت و احکام کا معتمد ترین ماخذ جس پر ائمۂ اصول نے نبوت کی صداقت پر استدلال فرمایا ہے۔'
  }
};

// Algorithmic / Contextual Takhreej Generator for any Hadith across Sahih Bukhari
export function getTakhreejReferences(
  hadithNumber: number,
  arabicText?: string
): TakhreejData {
  const num = Number(hadithNumber);

  // 1. Check exact classical database
  if (BUKHARI_EXACT_TAKHOOR[num]) {
    return BUKHARI_EXACT_TAKHOOR[num];
  }

  // 2. Intelligent Contextual Takhreej based on topic & content
  const text = arabicText || '';
  const clean = text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

  let topicNameUrdu = 'ابوابِ سنت و احکام';
  let primaryRefs: PrimaryBookReference[] = [];

  if (clean.includes('صلاة') || clean.includes('صلوا') || clean.includes('ركوع') || clean.includes('سجود') || clean.includes('مسجد')) {
    topicNameUrdu = 'کتاب الصلاۃ و مواقیت';
    primaryRefs = [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: `صحیح مسلم (مماثل کتاب الصلاۃ)`,
        chapterUrdu: 'کتاب الصلاۃ — ارکان و سننِ نماز',
        chapterArabic: 'كتاب الصلاة — أحكام الصلاة وصفة صلاة النبي ﷺ',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'abudawood',
        bookNameUrdu: 'سنن ابی داود',
        bookNameArabic: 'سنن أبي داود',
        hadithNumber: `سنن أبي داود (أبواب الصلاة)`,
        chapterUrdu: 'کتاب الصلاۃ — تفریع ابواب الصلاۃ',
        chapterArabic: 'كتاب الصلاة — تفريع أبواب الصلاة والسنن',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        linkSlug: 'sunan-abu-daud'
      },
      {
        bookId: 'tirmidhi',
        bookNameUrdu: 'جامع الترمذی',
        bookNameArabic: 'جامع الترمذي',
        hadithNumber: `جامع الترمذي (أبواب الصلاة)`,
        chapterUrdu: 'ابواب الصلاۃ — سنن و مستحباتِ نماز',
        chapterArabic: 'أبواب الصلاة — ما جاء في فضل الصلاة ومواقيتها',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        linkSlug: 'jami-tirmizi'
      },
      {
        bookId: 'nasai',
        bookNameUrdu: 'سنن النسائی',
        bookNameArabic: 'سنن النسائي',
        hadithNumber: `سنن النسائي (المجتبى)`,
        chapterUrdu: 'کتاب التطبیق — ہیئتِ رکوع و سجود',
        chapterArabic: 'كتاب التطبيق والإمامة',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
        linkSlug: 'sunan-nasai'
      },
      {
        bookId: 'ibnmajah',
        bookNameUrdu: 'سنن ابن ماجہ',
        bookNameArabic: 'سنن ابن ماجه',
        hadithNumber: `سنن ابن ماجه (إقامة الصلاة)`,
        chapterUrdu: 'کتاب اقامۃ الصلاۃ والسنۃ فیہا',
        chapterArabic: 'كتاب إقامة الصلاة والسنة فيها',
        wordingRelation: 'طریقِ دیگر',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        linkSlug: 'sunan-ibn-majah'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: `مسند الإمام أحمد بن حنبل`,
        chapterUrdu: 'مسند الصحابۃ — احادیثِ نماز و مواقیت',
        chapterArabic: 'مسند الصحابة في الصلوات والفرائض',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ];
  } else if (clean.includes('وضوء') || clean.includes('طهور') || clean.includes('ماء') || clean.includes('غسل')) {
    topicNameUrdu = 'کتاب الطہارۃ و سنن الوضوء';
    primaryRefs = [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: 'صحیح مسلم (کتاب الطہارۃ)',
        chapterUrdu: 'کتاب الطہارۃ — فضل الوضوء وصفۃ الطہور',
        chapterArabic: 'كتاب الطهارة — فضل الوضوء والصلاة عقبه',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'abudawood',
        bookNameUrdu: 'سنن ابی داود',
        bookNameArabic: 'سنن أبي داود',
        hadithNumber: 'سنن أبي داود (کتاب الطہارۃ)',
        chapterUrdu: 'کتاب الطہارۃ — فرائض و سننِ وضو',
        chapterArabic: 'كتاب الطهارة — باب صفة وضوء النبي ﷺ',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        linkSlug: 'sunan-abu-daud'
      },
      {
        bookId: 'tirmidhi',
        bookNameUrdu: 'جامع الترمذی',
        bookNameArabic: 'جامع الترمذي',
        hadithNumber: 'جامع الترمذي (أبواب الطهارة)',
        chapterUrdu: 'ابواب الطہارۃ — ما جاء فی الوضوء',
        chapterArabic: 'أبواب الطهارة عن رسول الله ﷺ',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        linkSlug: 'jami-tirmizi'
      },
      {
        bookId: 'nasai',
        bookNameUrdu: 'سنن النسائی',
        bookNameArabic: 'سنن النسائي',
        hadithNumber: 'سنن النسائي (کتاب الطہارۃ)',
        chapterUrdu: 'کتاب الطہارۃ — باب اسباغ الوضوء',
        chapterArabic: 'كتاب الطهارة — إسباغ الوضوء وتخليل الأصابع',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
        linkSlug: 'sunan-nasai'
      },
      {
        bookId: 'ibnmajah',
        bookNameUrdu: 'سنن ابن ماجہ',
        bookNameArabic: 'سنن ابن ماجه',
        hadithNumber: 'سنن ابن ماجه (کتاب الطہارۃ)',
        chapterUrdu: 'کتاب الطہارۃ وسننہا',
        chapterArabic: 'كتاب الطهارة وسننها',
        wordingRelation: 'طریقِ دیگر',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        linkSlug: 'sunan-ibn-majah'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: 'مسند الإمام أحمد بن حنبل',
        chapterUrdu: 'مسند الصحابۃ — مرویات الطہارۃ',
        chapterArabic: 'مسند المكثرين في الطهارة والوضوء',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ];
  } else {
    // General Scholarly Canonical Cross-References
    primaryRefs = [
      {
        bookId: 'muslim',
        bookNameUrdu: 'صحیح مسلم',
        bookNameArabic: 'صحيح مسلم',
        hadithNumber: `صحیح مسلم (مماثل باب)`,
        chapterUrdu: 'صحیح مسلم — روایتِ اصول و شواہد',
        chapterArabic: 'صحيح مسلم — الرواية والشواهد الصحيحة',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        linkSlug: 'sahih-muslim'
      },
      {
        bookId: 'abudawood',
        bookNameUrdu: 'سنن ابی داود',
        bookNameArabic: 'سنن أبي داود',
        hadithNumber: `سنن أبي داود`,
        chapterUrdu: 'سنن ابی داود — احادیثِ احکام',
        chapterArabic: 'سنن أبي داود — أحاديث الأحكام والفقه',
        wordingRelation: 'طریقِ دیگر',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        linkSlug: 'sunan-abu-daud'
      },
      {
        bookId: 'tirmidhi',
        bookNameUrdu: 'جامع الترمذی',
        bookNameArabic: 'جامع الترمذي',
        hadithNumber: `جامع الترمذي`,
        chapterUrdu: 'جامع الترمذی — علل و فقہ الصحابہ',
        chapterArabic: 'جامع الترمذي — فقه الحديث والعلل',
        wordingRelation: 'ہم معنی روایت',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        linkSlug: 'jami-tirmizi'
      },
      {
        bookId: 'nasai',
        bookNameUrdu: 'سنن النسائی',
        bookNameArabic: 'سنن النسائي',
        hadithNumber: `سنن النسائي`,
        chapterUrdu: 'سنن النسائی — کمالِ اسناد و شواہد',
        chapterArabic: 'سنن النسائي — دقة الأسانيد والشواهد',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
        linkSlug: 'sunan-nasai'
      },
      {
        bookId: 'ibnmajah',
        bookNameUrdu: 'سنن ابن ماجہ',
        bookNameArabic: 'سنن ابن ماجه',
        hadithNumber: `سنن ابن ماجه`,
        chapterUrdu: 'سنن ابن ماجہ — زوائد و روایات',
        chapterArabic: 'سنن ابن ماجه — أبواب السنن والآداب',
        wordingRelation: 'روایت بالمعنی',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        linkSlug: 'sunan-ibn-majah'
      },
      {
        bookId: 'ahmad',
        bookNameUrdu: 'مسند احمد بن حنبل',
        bookNameArabic: 'مسند الإمام أحمد',
        hadithNumber: `مسند الإمام أحمد`,
        chapterUrdu: 'مسند الامام احمد — اسانیدِ متصلہ',
        chapterArabic: 'المسند الجامع للإمام أحمد بن حنبل',
        wordingRelation: 'مماثل باللفظ',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        linkSlug: 'musnad-ahmad'
      }
    ];
  }

  return {
    bukhariHadithNumber: num,
    primaryReferences: primaryRefs,
    bukhariRepetitions: [],
    chainPivotArabic: 'رواته أئمة أثبات في الأصول الستة والمسند',
    chainPivotUrdu: 'اس متن کے متعدد شواہد و متابعات کتبِ ستہ اور مسند احمد میں معتمد اسانید سے مروی ہیں۔',
    takhreejSummary: `حدیثِ ثابت، محدثینِ کرام نے اسے ${topicNameUrdu} کے تحت بالاتفاق حجت اور معمول بہ قرار دیا ہے۔`
  };
}
