export type ForumRole = 'mufti' | 'scholar' | 'teacher' | 'student' | 'researcher';

export interface ForumUser {
  id: string;
  name: string;
  title: string;
  role: ForumRole;
  madrasaOrCity?: string;
  isVerified: boolean;
  avatar?: string;
}

export interface ForumReference {
  bookTitle: string;
  volume?: string | number;
  page?: string | number;
  readerLink?: string;
}

export interface ForumAnswer {
  id: string;
  questionId: string;
  author: ForumUser;
  arabicQuote?: string;
  content: string;
  references?: ForumReference[];
  upvotes: number;
  isVerifiedScholarly: boolean;
  createdAt: string;
}

export interface ForumQuestion {
  id: string;
  title: string;
  category: 'sarf_nahw' | 'fiqh_fatwa' | 'hadith' | 'usul' | 'modern' | 'general';
  categoryLabel: string;
  author: ForumUser;
  arabicText?: string;
  content: string;
  bookReference?: string;
  tags: string[];
  upvotes: number;
  views: number;
  answersCount: number;
  isResolved: boolean;
  createdAt: string;
  answers: ForumAnswer[];
}

export const FORUM_CATEGORIES = [
  { id: 'all', label: 'تمام مباحث' },
  { id: 'sarf_nahw', label: 'صرف و نحو / حلِ عبارت' },
  { id: 'fiqh_fatwa', label: 'فقہ و فتاویٰ' },
  { id: 'hadith', label: 'حدیث و درایت' },
  { id: 'usul', label: 'اصولِ فقہ و تفسیر' },
  { id: 'modern', label: 'جدید فقہی مسائل' },
] as const;

export const FORUM_ROLE_BADGES: Record<ForumRole, {
  label: string;
  badgeClass: string;
  iconName: 'award' | 'shield' | 'book' | 'graduation';
  isAuthority: boolean;
}> = {
  mufti: {
    label: 'مصدقہ مفتی و فقیہ',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-400/80 shadow-xs ring-1 ring-amber-300',
    iconName: 'award',
    isAuthority: true
  },
  scholar: {
    label: 'مصدقہ عالمِ دین (فاضل درسِ نظامی)',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-400/80 shadow-xs ring-1 ring-emerald-300',
    iconName: 'shield',
    isAuthority: true
  },
  teacher: {
    label: 'استاذِ جامعہ / مدرس',
    badgeClass: 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border-blue-400/80 shadow-xs',
    iconName: 'book',
    isAuthority: true
  },
  student: {
    label: 'طالبِ علمِ درسِ نظامی',
    badgeClass: 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border-teal-300',
    iconName: 'graduation',
    isAuthority: false
  },
  researcher: {
    label: 'علمی محقق و قاری',
    badgeClass: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300',
    iconName: 'graduation',
    isAuthority: false
  }
};

export const INITIAL_FORUM_QUESTIONS: ForumQuestion[] = [
  {
    id: 'fq_1',
    title: 'ہدایہ شریف (کتاب الطہارات): حدیثِ قلتین اور احناف کے نزدیک پانی کے دہ دردہ ہونے کا استدلال',
    category: 'fiqh_fatwa',
    categoryLabel: 'فقہ و فتاویٰ',
    author: {
      id: 'u_student_1',
      name: 'محمد عاصم رضوی',
      title: 'متعلم موقوف علیہ (دورۂ حدیث سالِ اول)',
      role: 'student',
      madrasaOrCity: 'جامعہ دار الہدایہ، لاہور',
      isVerified: false
    },
    arabicText: '«إِذَا بَلَغَ الْمَاءُ قُلَّتَيْنِ لَمْ يَحْمِلِ الْخَبَثَ» وقول الإمام المرغيناني: «والماء الراكد إذا وقعت فيه نجاسة لم يجز الوضوء به إلا أن يكون عشراً في عشر»',
    content: 'حضرات مفتیانِ کرام و اساتذۂ عظام! ہدایہ کے باب المیاہ میں احناف نے قلتین والی روایت کے مقابلے میں کثیر پانی کا ضابطہ "دہ دردہ" (دس ضرب دس گز) کیوں متعین فرمایا ہے؟ جبکہ ظاہرِ حدیث قلتین کی تحدید کرتی ہے۔ اس اشکال کا تحقیقی اور درسی جواب مرحمت فرمائیں۔',
    bookReference: 'الہدایہ فی شرح بدایۃ المبتدی، جلد ۱، صفحہ ۱۲',
    tags: ['ہدایہ', 'طہارت', 'قلتین', 'دہ دردہ', 'فقہ حنفی'],
    upvotes: 24,
    views: 310,
    answersCount: 1,
    isResolved: true,
    createdAt: '۲ گھنٹے قبل',
    answers: [
      {
        id: 'fa_1',
        questionId: 'fq_1',
        author: {
          id: 'u_naeem_siddiqi',
          name: 'حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ',
          title: 'بانی و سرپرستِ اعلیٰ تحریکِ ایمان و شیخ الحدیث',
          role: 'mufti',
          madrasaOrCity: 'دار الافتاء و مجلسِ تحقیقِ اسلامی، لاہور',
          isVerified: true
        },
        arabicQuote: 'قال في الهداية: «وحديث القلتين مضطرب الرواية، فقد روي أربع خلال: قلتين، وثلاث قلال، وأربعين قلة، ولا حجة مع الاضطراب. والمعتمد في الباب ما أجمع عليه السلف من تحري تحريك أحد الطرفين أو التقدير بعشر في عشر».',
        content: `الْجَوَابُ وَبِاللَّهِ التَّوْفِيقُ:
عزیز طالب علم! آپ کا استفسار درسِ نظامی کے امتحانی اور علمی لحاظ سے نہایت اہم ہے۔

امام صاحبِ ہدایہ رحمہ اللہ نے حدیثِ قلتین پر تین بنیادی اصولی اور درسی جوابات تحریر فرمائے ہیں:
۱. **اضطراب فی الروایۃ:** یہ روایت محدثین کے نزدیک مضطرب ہے۔ کسی سند میں "قلتین" (دو مٹکے)، کسی میں "ثلاث قلال" (تین مٹکے) اور کسی میں "أربعين قلة" کے الفاظ مروی ہیں۔ اور اصولِ حدیث کا مسلمہ قاعدہ ہے: «إِذَا وَقَعَ الِاضْطِرَابُ سَقَطَ الِاحْتِجَاجُ»۔
۲. **قلتین کی تحدید غیر منضبط ہونا:** ہجر کے مٹکے مختلف سائز کے ہوتے تھے، لہٰذا عامۃ الناس کے لیے اس سے پیمائش کرنا حرجِ عظیم کا باعث تھا۔
۳. **دہ در دہ (عشر فی عشر) کا ماخذ:** امام ابو حنیفہ رحمہ اللہ نے مطلق نصوصِ طہارت اور جمہور صحابہ کے فہم پر نظر رکھتے ہوئے یہ احتیاطی پیمانہ قائم فرمایا کہ جس حوض میں ایک طرف حرکت دینے سے دوسری طرف حرکت نہ پہنچے (جو کہ تقریباً ۱۰ ضرب ۱۰ شرعی گز بنتا ہے)، وہ ماءِ کثیر شمار ہو گا۔

«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»`,
        references: [
          {
            bookTitle: 'الہدایہ فی شرح بدایۃ المبتدی',
            volume: 1,
            page: 12,
            readerLink: '/books/al-hidayah?page=12'
          },
          {
            bookTitle: 'رد المحتار علی الدر المختار (فتاویٰ شامی)',
            volume: 1,
            page: 185,
            readerLink: '/books/radd-al-muhtar?page=185'
          }
        ],
        upvotes: 38,
        isVerifiedScholarly: true,
        createdAt: '۱ گھنٹہ قبل'
      }
    ]
  },
  {
    id: 'fq_2',
    title: 'کافیہ ابنِ حاجب: "ضربتُ ضرباً زيداً" میں مفعولِ مطلق اور مفعول بہ کی نحوی ترتیب و اعراب',
    category: 'sarf_nahw',
    categoryLabel: 'صرف و نحو / حلِ عبارت',
    author: {
      id: 'u_student_2',
      name: 'عبد الرحمٰن صدیقی',
      title: 'متعلم سالِ سوم (ہدایۃ النحو و کافیہ)',
      role: 'student',
      madrasaOrCity: 'جامعہ دار العلوم، فیصل آباد',
      isVerified: false
    },
    arabicText: '«ضَرَبْتُ ضَرْباً زَيْداً» — هل يجوز تقديم المفعول به على المصدر المؤكّد كقولك: «ضربت زيداً ضرباً» فقط، أم في التركيب وجه آخر للإعراب؟',
    content: 'کافیہ میں ابنِ حاجب فرماتے ہیں کہ جب مصدر موکّد ہو تو وہ اپنے مفعول بہ میں عمل نہیں کر سکتا یا اس پر مقدم نہیں ہو سکتا۔ اگر عبارت یوں آئے تو "زیداً" کا ناصب فعل "ضربتُ" ہے یا مصدر "ضرباً"؟ برائے کرم ترکیبی جدول کے ساتھ رہنمائی فرمائیں۔',
    bookReference: 'شرح ملا جامی علی الکافیہ، باب المفعول المطلق',
    tags: ['کافیہ', 'نحو', 'مفعول مطلق', 'ترکیب', 'اعراب'],
    upvotes: 18,
    views: 195,
    answersCount: 1,
    isResolved: true,
    createdAt: '۵ گھنٹے قبل',
    answers: [
      {
        id: 'fa_2',
        questionId: 'fq_2',
        author: {
          id: 'u_scholar_1',
          name: 'مولانا مفتی عبد الرشید حقانی',
          title: 'استاذِ ادب و نحو و نائب مفتی',
          role: 'scholar',
          madrasaOrCity: 'جامعہ نعمانیہ، گوجرانوالہ',
          isVerified: true
        },
        arabicQuote: '«المصدر المؤكد لا يعمل في المفعول به عند جمهور البصريين، لأن تأكيده للفعل يمنعه من مشابهة اسم الفاعل، وإنما الناصب لـ "زيداً" هو الفعل المتقدم المقدر أو الظاهر المفسر».',
        content: `نحوی ترکیب و حلِ اشکال:
۱. **ناصب کی تحقیق:** بصریین کے راجح قول کے مطابق مصدر جب "موکّد" ہو تو وہ مفعول بہ کو نصب نہیں دیتا، کیونکہ مفعول بہ میں عمل کے لیے فعل سے شباہت درکار ہے اور تاکید فعل کا خاصہ ہے۔ لہٰذا "زیداً" کا ناصب خود فعل "ضربتُ" ہے۔
۲. **ترکیب:**
   - **ضَرَبْتُ:** فعل با فاعل (ضمیرِ تاء مرفوع متصل فاعل)
   - **ضَرْباً:** مفعول مطلق موکّد للفعل، منصوب
   - **زَيْداً:** مفعول بہ للفعل "ضربت"، منصوب
۳. **فائدہ:** جب مصدر موکّد کے بجائے نوعی یا عددی ہو (جیسے: ضربتُ ضربَ الأمیرِ زیداً) تو بالاتفاق مصدر مفعول بہ میں عمل کر کے اسے نصب دے سکتا ہے۔

«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»`,
        references: [
          {
            bookTitle: 'شرح الرضی علی الکافیہ',
            volume: 1,
            page: 114,
            readerLink: '/books/sharh-al-radi?page=114'
          }
        ],
        upvotes: 21,
        isVerifiedScholarly: true,
        createdAt: '۳ گھنٹے قبل'
      }
    ]
  },
  {
    id: 'fq_3',
    title: 'جدید مسئلہ: ڈیجیٹل شیئرز، میوچل فنڈز اور کرپٹو ٹریڈنگ پر زکوٰۃ کا شرعی طریقہ',
    category: 'modern',
    categoryLabel: 'جدید فقہی مسائل',
    author: {
      id: 'u_researcher_1',
      name: 'ڈاکٹر ثاقب محمود خان',
      title: 'ریسرچ اسکالر اسلامی معاشیات',
      role: 'researcher',
      madrasaOrCity: 'اسلام آباد',
      isVerified: false
    },
    arabicText: '«وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ وَلاَ يُنفِقُونَهَا فِي سَبِيلِ اللَّهِ فَبَشِّرْهُم بِعَذَابٍ أَلِيمٍ»',
    content: 'السلام علیکم! ایک تاجر نے اسٹاک ایکسچینج میں منافع (Capital Gain) اور ڈیویڈنڈ کے لیے شیئرز خرید رکھے ہیں، اور کچھ رقم ڈیجیٹل فنڈز میں رکھی ہے۔ سال گزرنے پر زکوٰۃ شیئرز کی فیس ویلیو پر دی جائے گی یا موجودہ مارکیٹ ویلیو پر؟ اور کیا کمپنی کے فکسڈ اثاثے منہا ہوں گے؟',
    bookReference: 'فقہی مقالات، مفتی محمد تقی عثمانی و فتاویٰ عالمگیری',
    tags: ['زکوٰۃ', 'شیئرز', 'جدید مسائل', 'اسٹاک', 'مارکیٹ ویلیو'],
    upvotes: 31,
    views: 450,
    answersCount: 1,
    isResolved: true,
    createdAt: '۱ دن قبل',
    answers: [
      {
        id: 'fa_3',
        questionId: 'fq_3',
        author: {
          id: 'u_naeem_siddiqi',
          name: 'حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ',
          title: 'بانی و سرپرستِ اعلیٰ تحریکِ ایمان و شیخ الحدیث',
          role: 'mufti',
          madrasaOrCity: 'دار الافتاء و مجلسِ تحقیقِ اسلامی، لاہور',
          isVerified: true
        },
        arabicQuote: '«الأسهم إن اشتريت بقصد التجارة والاسترباح من فروق الأسعار (Capital Gain) فإنها تعامل معاملة عروض التجارة، فتجب الزكاة في قيمتها السوقية الحالية بكاملها».',
        content: `الْجَوَابُ وَبِاللَّهِ التَّوْفِيقُ:
شیئرز پر زکوٰۃ کے حساب میں خریدار کی نیت اور مقصد کو بنیادی حیثیت حاصل ہے:

۱. **اگر نیت ٹریڈنگ (خرید و فروخت سے نفع کمانا) ہو:**
   اس صورت میں یہ شیئرز مکمل طور پر مالِ تجارت (عروضِ تجارت) کے حکم میں ہیں۔ سال پورا ہونے والے دن ان کی **موجودہ مارکیٹ ویلیو (Market Price)** کا حساب لگا کر پورے سرمائے پر ڈھائی فیصد (۲.۵٪) زکوٰۃ ادا کرنا فرض ہے۔

۲. **اگر نیت صرف سالانہ منافع (Dividend) حاصل کرنا ہو اور شیئرز کو مستقل رکھنے کا ارادہ ہو:**
   اس صورت میں کمپنی کے فکسڈ اثاثوں (مشینری، بلڈنگ وغیرہ) پر زکوٰۃ نہیں ہے۔ بلکہ کمپنی کی بیلنس شیٹ کے مطابق جو حصہ لیکویڈ کیش، قابلِ وصول رقوم اور مالِ تجارت (سیل ہونے والا سامان) پر مشتمل ہو، اپنے شیئرز کے تناسب سے صرف اس پر زکوٰۃ ادا کرنا واجب ہے۔ سہولت کے لیے اسلامی فنانس اکیڈمیز نے اوسطاً ۳۰ سے ۳۵ فیصد کی کٹوتی کا حساب بھی وضع کیا ہے۔

«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»`,
        references: [
          {
            bookTitle: 'الفتاویٰ الہندیہ (عالمگیری)',
            volume: 1,
            page: 179,
            readerLink: '/books/fatawa-alamgiri?page=179'
          },
          {
            bookTitle: 'بحوث فی قضایا فقہیۃ معاصرۃ',
            volume: 1,
            page: 145
          }
        ],
        upvotes: 45,
        isVerifiedScholarly: true,
        createdAt: '۲۰ گھنٹے قبل'
      }
    ]
  },
  {
    id: 'fq_4',
    title: 'نور الانوار فی شرح المنار: خاص اور عام کے تقابل میں حنفی و شافعی موقف کا محاکمہ',
    category: 'usul',
    categoryLabel: 'اصولِ فقہ و تفسیر',
    author: {
      id: 'u_student_3',
      name: 'حافظ بلال حیدر',
      title: 'متعلم سالِ چہارم (اصول الشاشی و نور الانوار)',
      role: 'student',
      madrasaOrCity: 'جامعہ عثمانیہ، پشاور',
      isVerified: false
    },
    arabicText: '«الخاص قطعي الدلالة عند علمائنا الحنفية، وعند الشافعي رحمه الله ظني الدلالة كالظاهر المؤول»',
    content: 'اصولِ فقہ کے امتحانات میں خاص کی دلالت کا قطعی ہونا اکثر پوچھا جاتا ہے۔ احناف کے نزدیک خاص کا دلالت میں قطعی ہونا کن فقہی فروعی احکام پر اثر انداز ہوتا ہے؟ مثلاً آمین بالجہر اور رفع الیدین میں اس اصول کی کیا تطبیق ہے؟',
    bookReference: 'نور الانوار، ملا جیون رحمہ اللہ، بحث الخاص والعام',
    tags: ['نور الانوار', 'اصول فقہ', 'خاص', 'عام', 'قطعی الدلالہ'],
    upvotes: 14,
    views: 180,
    answersCount: 0,
    isResolved: false,
    createdAt: '۳ گھنٹے قبل',
    answers: []
  }
];
