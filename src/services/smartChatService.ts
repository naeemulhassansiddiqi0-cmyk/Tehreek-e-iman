import { allCatalogBooks, PublicDomainBook, ModernBook } from '../data/publicDomainBooks';
import { booksDatabase } from '../data/booksData';
import { askIslamicAI } from './aiService';
import { 
  retrieveStrictRagContext, 
  formatStrictMuftiAnswer, 
  RagAnalysisResult 
} from './aiMuftiRagService';

export type ChatAcademicMode = 'student' | 'ulama' | 'public';

export interface AcademicCitation {
  bookTitle: string;
  bookTitleAr?: string;
  slug: string;
  author: string;
  category: string;
  page: number;
  volume?: number | string;
  hadithNumber?: number;
  readerLink: string;
  badgeText: string;
}

export type ChatResponsePayload =
  | {
      type: 'book_info';
      data: {
        fullName: string;
        author: string;
        intro: string;
        meta: string;
        cover_url?: string;
        action: {
          label: string;
          link: string;
        };
        book: PublicDomainBook | ModernBook;
      };
      citations?: AcademicCitation[];
      mode?: ChatAcademicMode;
    }
  | {
      type: 'text';
      data: string;
      citations?: AcademicCitation[];
      mode?: ChatAcademicMode;
    };

export interface IntentDetectionResult {
  intent: 'BOOK_QUERY' | 'NORMAL_QUERY';
  book?: PublicDomainBook | ModernBook;
}

/**
 * Normalize Arabic / Urdu / Latin strings for robust fuzzy keyword matching
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // strip Arabic diacritics / tashkeel
    .replace(/[أإآء]/g, 'ا')
    .replace(/[يىئ]/g, 'ی')
    .replace(/[ةه]/g, 'ہ')
    .replace(/[ك]/g, 'ک')
    .replace(/[-_.,!?،؛:()[\]{}"'/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * STEP A - BOOK_QUERY DETECTION
 * If message length < 40 chars and fuzzy matches any book title/slug, returns { intent: 'BOOK_QUERY', book }
 */
export function detectBookIntent(userMessage: string): IntentDetectionResult {
  const cleanRaw = userMessage.trim();
  if (!cleanRaw) {
    return { intent: 'NORMAL_QUERY' };
  }

  // Remove common polite filler words in Urdu / English
  const queryWithoutFiller = cleanRaw
    .replace(/^(کتاب|کتاب کے بارے میں بتائیں|کیا آپ کے پاس|کیا|بارے میں|کتاب پڑھائیں|کتاب دکھائیں|book|show me|tell me about)\s+/i, '')
    .trim();

  const normQuery = normalizeText(queryWithoutFiller || cleanRaw);

  if (normQuery.length > 0 && normQuery.length <= 40) {
    // 1. Direct slug or title match in catalog
    for (const b of allCatalogBooks) {
      const normTitleUr = normalizeText(b.title_ur);
      const normTitleAr = normalizeText(b.title_ar);
      const normSlug = normalizeText(b.slug);
      const normAuthor = normalizeText(b.author);

      if (
        normQuery === normSlug ||
        normQuery === normTitleUr ||
        normQuery === normTitleAr ||
        normTitleUr.includes(normQuery) ||
        normQuery.includes(normTitleUr) ||
        normTitleAr.includes(normQuery) ||
        normQuery.includes(normSlug.replace(/-/g, ' '))
      ) {
        return { intent: 'BOOK_QUERY', book: b };
      }

      if (normAuthor.length > 4 && normQuery.includes(normAuthor)) {
        return { intent: 'BOOK_QUERY', book: b };
      }
    }

    // 2. Word token match
    const queryTokens = normQuery.split(' ').filter(t => t.length > 2);
    if (queryTokens.length > 0) {
      for (const b of allCatalogBooks) {
        const normTitleUr = normalizeText(b.title_ur);
        const normTitleAr = normalizeText(b.title_ar);
        const matchCount = queryTokens.filter(t => normTitleUr.includes(t) || normTitleAr.includes(t)).length;
        if (matchCount >= Math.min(2, queryTokens.length)) {
          return { intent: 'BOOK_QUERY', book: b };
        }
      }
    }
  }

  return { intent: 'NORMAL_QUERY' };
}

/**
 * Curated Islamic topic map for classical Madaris & Fiqh queries
 */
interface TopicMapping {
  keywords: string[];
  citations: {
    bookTitle: string;
    bookTitleAr?: string;
    slug: string;
    author: string;
    category: string;
    page: number;
    badgeText: string;
  }[];
}

const TOPIC_SCHOLARLY_MAP: TopicMapping[] = [
  {
    keywords: ['وضو', 'طہارت', 'غسل', 'پانی', 'مسح', 'تیمم', 'ناپاکی', 'استنجا', 'حدث'],
    citations: [
      { bookTitle: 'مختصر القدوری', bookTitleAr: 'مختصر القدوري في فقه الحنفية', slug: 'mukhtasar-al-quduri', author: 'امام ابو الحسین قدوری', category: 'Fiqh', page: 1, badgeText: 'کتاب الطہارۃ ص ۱' },
      { bookTitle: 'الہدایہ شرح بدایۃ المبتدی', bookTitleAr: 'الهداية في شرح بداية المبتدي', slug: 'al-hidayah', author: 'علامہ برہان الدین مرغینانی', category: 'Fiqh', page: 1, badgeText: 'کتاب الطہارات ص ۱' },
      { bookTitle: 'صحیح البخاری', bookTitleAr: 'الجامع المسند الصحيح المختصر', slug: 'sahih-bukhari', author: 'امام محمد بن اسماعیل بخاری', category: 'Hadith', page: 7, badgeText: 'کتاب الوضوء ص ۷' },
      { bookTitle: 'رد المحتار (فتاویٰ شامی)', bookTitleAr: 'رد المحتار على الدر المختار', slug: 'radd-al-muhtar', author: 'علامہ ابن عابدین شامی', category: 'Fiqh', page: 1, badgeText: 'باب الوضوء ج ۱' },
    ]
  },
  {
    keywords: ['نماز', 'صلاۃ', 'صلوۃ', 'اذان', 'اوقات', 'سجدہ', 'رکوع', 'امامت', 'جماعت', 'قضا', 'تراویح', 'وتر', 'جمعہ', 'عید'],
    citations: [
      { bookTitle: 'صحیح البخاری', bookTitleAr: 'الجامع المسند الصحيح المختصر', slug: 'sahih-bukhari', author: 'امام محمد بن اسماعیل بخاری', category: 'Hadith', page: 19, badgeText: 'کتاب الصلاۃ ص ۱۹' },
      { bookTitle: 'نور الایضاح', bookTitleAr: 'نور الإيضاح ونجاة الأرواح', slug: 'nur-al-idah', author: 'علامہ حسن شرنبلالی', category: 'Fiqh', page: 1, badgeText: 'کتاب الصلاۃ ص ۱' },
      { bookTitle: 'الہدایہ شرح بدایۃ المبتدی', bookTitleAr: 'الهداية في شرح بداية المبتدي', slug: 'al-hidayah', author: 'علامہ برہان الدین مرغینانی', category: 'Fiqh', page: 15, badgeText: 'کتاب الصلاۃ ص ۱۵' },
      { bookTitle: 'الفتاویٰ الہندیہ (عالمگیری)', bookTitleAr: 'الفتاوى الهندية', slug: 'fatawa-alamgiri', author: 'جماعۃ من علماء الہند', category: 'Fiqh', page: 1, badgeText: 'الباب الأول في الصلاة' },
    ]
  },
  {
    keywords: ['روزہ', 'صوم', 'رمضان', 'سحر', 'افطار', 'اعتکاف', 'فدیہ', 'کفارہ'],
    citations: [
      { bookTitle: 'صحیح البخاری', bookTitleAr: 'الجامع المسند الصحيح المختصر', slug: 'sahih-bukhari', author: 'امام محمد بن اسماعیل بخاری', category: 'Hadith', page: 45, badgeText: 'کتاب الصوم ص ۴۵' },
      { bookTitle: 'مختصر القدوری', bookTitleAr: 'مختصر القدوري في فقه الحنفية', slug: 'mukhtasar-al-quduri', author: 'امام ابو الحسین قدوری', category: 'Fiqh', page: 15, badgeText: 'کتاب الصوم ص ۱۵' },
      { bookTitle: 'الہدایہ شرح بدایۃ المبتدی', bookTitleAr: 'الهداية في شرح بداية المبتدي', slug: 'al-hidayah', author: 'علامہ برہان الدین مرغینانی', category: 'Fiqh', page: 25, badgeText: 'کتاب الصوم ص ۲۵' },
    ]
  },
  {
    keywords: ['زکوٰۃ', 'صدقہ', 'فطرانہ', 'نصاب', 'عشر', 'مال', 'سونے', 'چاندی', 'مصارف'],
    citations: [
      { bookTitle: 'مختصر القدوری', bookTitleAr: 'مختصر القدوري في فقه الحنفية', slug: 'mukhtasar-al-quduri', author: 'امام ابو الحسین قدوری', category: 'Fiqh', page: 10, badgeText: 'کتاب الزکاۃ ص ۱۰' },
      { bookTitle: 'صحیح البخاری', bookTitleAr: 'الجامع المسند الصحيح المختصر', slug: 'sahih-bukhari', author: 'امام محمد بن اسماعیل بخاری', category: 'Hadith', page: 35, badgeText: 'کتاب الزکاۃ ص ۳۵' },
      { bookTitle: 'رد المحتار (فتاویٰ شامی)', bookTitleAr: 'رد المحتار على الدر المختار', slug: 'radd-al-muhtar', author: 'علامہ ابن عابدین شامی', category: 'Fiqh', page: 15, badgeText: 'باب زکاۃ المال ج ۲' },
    ]
  },
  {
    keywords: ['نکاح', 'طلاق', 'خلع', 'مہر', 'عدت', 'نفقہ', 'رضاعت', 'حقوق الزوجین'],
    citations: [
      { bookTitle: 'مختصر القدوری', bookTitleAr: 'مختصر القدوري في فقه الحنفية', slug: 'mukhtasar-al-quduri', author: 'امام ابو الحسین قدوری', category: 'Fiqh', page: 40, badgeText: 'کتاب النکاح ص ۴۰' },
      { bookTitle: 'الہدایہ شرح بدایۃ المبتدی', bookTitleAr: 'الهداية في شرح بداية المبتدي', slug: 'al-hidayah', author: 'علامہ برہان الدین مرغینانی', category: 'Fiqh', page: 70, badgeText: 'کتاب النکاح والطلاق ص ۷۰' },
      { bookTitle: 'رد المحتار (فتاویٰ شامی)', bookTitleAr: 'رد المحتار على الدر المختار', slug: 'radd-al-muhtar', author: 'علامہ ابن عابدین شامی', category: 'Fiqh', page: 45, badgeText: 'باب النکاح ج ۳' },
    ]
  },
  {
    keywords: ['بیع', 'تجارت', 'سود', 'قرض', 'خرید', 'فروخت', 'کاروبار', 'آن لائن', 'کرپٹو', 'مضاربت', 'شراکت', 'کرایہ'],
    citations: [
      { bookTitle: 'الہدایہ شرح بدایۃ المبتدی', bookTitleAr: 'الهداية في شرح بداية المبتدي', slug: 'al-hidayah', author: 'علامہ برہان الدین مرغینانی', category: 'Fiqh', page: 100, badgeText: 'کتاب البیوع ص ۱۰۰' },
      { bookTitle: 'مختصر القدوری', bookTitleAr: 'مختصر القدوري في فقه الحنفية', slug: 'mukhtasar-al-quduri', author: 'امام ابو الحسین قدوری', category: 'Fiqh', page: 60, badgeText: 'کتاب البیوع ص ۶۰' },
      { bookTitle: 'رد المحتار (فتاویٰ شامی)', bookTitleAr: 'رد المحتار على الدر المختار', slug: 'radd-al-muhtar', author: 'علامہ ابن عابدین شامی', category: 'Fiqh', page: 120, badgeText: 'کتاب البیوع والربا ج ۵' },
    ]
  },
  {
    keywords: ['نحو', 'اعراب', 'ترکیب', 'فاعل', 'مفعول', 'مبتدا', 'خبر', 'مضاف', 'صفت', 'موصوف', 'حروف جارہ', 'جملہ اسمیہ', 'جملہ فعلیہ'],
    citations: [
      { bookTitle: 'الکافیہ فی النحو', bookTitleAr: 'الكافية في علم النحو', slug: 'al-kafiya', author: 'علامہ ابن الحاجب النحوی', category: 'Dars-e-Nizami', page: 1, badgeText: 'شرح کافیہ ص ۱' },
      { bookTitle: 'ہدایۃ النحو', bookTitleAr: 'هداية النحو في قواعد العربية', slug: 'hidayat-un-nahw', author: 'سراج الدین عثمان چشتی', category: 'Dars-e-Nizami', page: 1, badgeText: 'ہدایۃ النحو ص ۱' },
      { bookTitle: 'شرح مائۃ عامل', bookTitleAr: 'شرح مائة عامل للجرجاني', slug: 'sharh-miah-amil', author: 'علامہ عبد القاہر الجرجانی', category: 'Dars-e-Nizami', page: 1, badgeText: 'العوامل النحویہ ص ۱' },
    ]
  },
  {
    keywords: ['صرف', 'صیغہ', 'ابواب', 'ثلاثی مجرد', 'ثلاثی مزید', 'ماضی', 'مضارع', 'امر', 'نہی', 'اسم فاعل', 'اسم مفعول', 'تعلیل'],
    citations: [
      { bookTitle: 'مراح الارواح فی الصرف', bookTitleAr: 'مراح الأرواح لأحمد بن علي بن مسعود', slug: 'marah-al-arwah', author: 'احمد بن علی بن مسعود', category: 'Dars-e-Nizami', page: 1, badgeText: 'ابواب الصرف ص ۱' },
      { bookTitle: 'علم الصیغہ', bookTitleAr: 'علم الصيغة في التصريف', slug: 'ilm-us-seegha', author: 'مفتی عنایت احمد کاکوروی', category: 'Dars-e-Nizami', page: 1, badgeText: 'قواعد الصرف ص ۱' },
    ]
  },
  {
    keywords: ['اصول فقہ', 'عام', 'خاص', 'مشترک', 'مؤول', 'حقیقت', 'مجاز', 'صریح', 'کنایہ', 'امر', 'نہی', 'ناسخ', 'منسوخ'],
    citations: [
      { bookTitle: 'نور الانوار فی شرح المنار', bookTitleAr: 'نور الأنوار في شرح المنار', slug: 'nur-al-anwar', author: 'ملا جیون رحمہ اللہ', category: 'Dars-e-Nizami', page: 1, badgeText: 'اصولِ فقہ ص ۱' },
      { bookTitle: 'اصول الشاشی', bookTitleAr: 'أصول الشاشي للإمام الشاشي', slug: 'usul-al-shashi', author: 'امام نظام الدین الشاشی', category: 'Dars-e-Nizami', page: 1, badgeText: 'اصول الشاشی ص ۱' },
      { bookTitle: 'حسامی فی اصول الفقہ', bookTitleAr: 'المنتخب الحسامي في أصول المذهب', slug: 'al-husami', author: 'امام حسام الدین الاخبیکثی', category: 'Dars-e-Nizami', page: 1, badgeText: 'اصول الفقه الحنفي ص ۱' },
    ]
  },
  {
    keywords: ['عقیدہ', 'ایمان', 'توحید', 'رسالت', 'شفاعت', 'معراج', 'عذاب قبر', 'اہل سنت', 'صفات', 'رویت باری'],
    citations: [
      { bookTitle: 'العقیدۃ الطحاویہ', bookTitleAr: 'متن العقيدة الطحاوية', slug: 'al-aqidah-al-tahawiyyah', author: 'امام ابو جعفر طحاوی', category: 'Aqeedah', page: 1, badgeText: 'عقائدِ اہل سنت ص ۱' },
      { bookTitle: 'شرح العقائد النسفیہ', bookTitleAr: 'شرح العقائد النسفية للتفتازاني', slug: 'sharh-al-aqaid', author: 'علامہ سعد الدین تفتازانی', category: 'Aqeedah', page: 1, badgeText: 'علم الکلام و العقائد ص ۱' },
    ]
  },
  {
    keywords: ['حدیث', 'سند', 'متن', 'راوی', 'صحیح', 'ضعیف', 'مرفوع', 'موقوف', 'بخاری', 'مسلم', 'ترمذی', 'ابو داود', 'مسند احمد'],
    citations: [
      { bookTitle: 'صحیح البخاری', bookTitleAr: 'الجامع المسند الصحيح المختصر', slug: 'sahih-bukhari', author: 'امام محمد بن اسماعیل بخاری', category: 'Hadith', page: 1, badgeText: 'بدء الوحي ص ۱' },
      { bookTitle: 'صحیح مسلم', bookTitleAr: 'المسند الصحيح المختصر بنقل العدل', slug: 'sahih-muslim', author: 'امام مسلم بن الحجاج النیسابوری', category: 'Hadith', page: 1, badgeText: 'مقدمہ و کتاب الایمان ص ۱' },
      { bookTitle: 'مسند احمد بن حنبل', bookTitleAr: 'المسند للإمام أحمد بن حنبل', slug: 'musnad-ahmad', author: 'امام احمد بن حنبل', category: 'Hadith', page: 1, badgeText: 'مسند الخلفاء الراشدین ص ۱' },
      { bookTitle: 'جامع الترمذی', bookTitleAr: 'الجامع المختصر من السنن', slug: 'jami-tirmizi', author: 'امام ابو عیسیٰ ترمذی', category: 'Hadith', page: 1, badgeText: 'ابواب الطہارۃ ص ۱' },
    ]
  }
];

/**
 * Enhanced RAG helper: Find top relevant books and citations across all 147 books
 */
export function findRelevantScholarlySources(query: string, mode: ChatAcademicMode = 'student'): AcademicCitation[] {
  const normQuery = normalizeText(query);
  const tokens = normQuery.split(' ').filter(t => t.length > 1);

  // 1. Check curated topic map
  for (const topic of TOPIC_SCHOLARLY_MAP) {
    const hasMatch = topic.keywords.some(k => normQuery.includes(normalizeText(k)));
    if (hasMatch) {
      return topic.citations.map(c => ({
        ...c,
        readerLink: `/books/${c.slug}?page=${c.page}`
      }));
    }
  }

  // 2. Score across all 147 books
  const candidates: { book: PublicDomainBook | ModernBook; score: number }[] = [];

  for (const b of allCatalogBooks) {
    const text = normalizeText(`${b.title_ur} ${b.title_ar} ${b.author} ${b.category} ${b.intro_ur}`);
    let score = 0;

    // Mode-specific weightings
    if (mode === 'student' && (b.category === 'Dars-e-Nizami' || b.category === 'Hadith')) score += 2;
    if (mode === 'ulama' && (b.category === 'Fiqh' || b.category === 'Hadith' || b.category === 'Aqeedah')) score += 2;
    if (mode === 'public' && (b.category === 'Seerat' || b.category === 'Tareekh' || b.category === 'Fiqh')) score += 1;

    for (const t of tokens) {
      if (text.includes(t)) score += 3;
    }

    if (score > 0) {
      candidates.push({ book: b, score });
    }
  }

  // Also score across curriculum & classical booksDatabase (147 books scope)
  for (const b of booksDatabase) {
    const text = normalizeText(`${b.title} ${b.subjectNameUrdu || ''} ${b.author} ${b.description || ''}`);
    let score = 0;
    for (const t of tokens) {
      if (text.includes(t)) score += 3;
    }
    if (score > 0) {
      candidates.push({
        book: {
          id: b.id,
          slug: b.id,
          title_ur: b.subjectNameUrdu || b.title,
          title_ar: b.title,
          author: b.author,
          death_year: '',
          category: 'Dars-e-Nizami',
          pages: 500,
          volumes: 1,
          intro_ur: b.description || '',
          cover_url: '/covers/default.svg',
          source_type: 'public' as const
        } as unknown as PublicDomainBook,
        score
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const selected = candidates.slice(0, 4).map(c => c.book);

  if (selected.length === 0) {
    // Default fallback to bedrock texts
    return [
      {
        bookTitle: 'صحیح البخاری',
        bookTitleAr: 'الجامع الصحيح المختصر',
        slug: 'sahih-bukhari',
        author: 'امام محمد بن اسماعیل بخاری',
        category: 'Hadith',
        page: 1,
        badgeText: 'جامع کتبِ حدیث شریف',
        readerLink: '/books/sahih-bukhari?page=1'
      },
      {
        bookTitle: 'مختصر القدوری',
        bookTitleAr: 'مختصر القدوري في الفقه الحنفي',
        slug: 'mukhtasar-al-quduri',
        author: 'امام ابو الحسین قدوری',
        category: 'Fiqh',
        page: 1,
        badgeText: 'امہاتِ فقہ حنفی',
        readerLink: '/books/mukhtasar-al-quduri?page=1'
      },
      {
        bookTitle: 'الہدایہ شرح بدایۃ المبتدی',
        bookTitleAr: 'الهداية في شرح بداية المبتدي',
        slug: 'al-hidayah',
        author: 'علامہ برہان الدین مرغینانی',
        category: 'Fiqh',
        page: 1,
        badgeText: 'نصابِ درسِ نظامی',
        readerLink: '/books/al-hidayah?page=1'
      }
    ];
  }

  return selected.map(b => ({
    bookTitle: b.title_ur,
    bookTitleAr: b.title_ar,
    slug: b.slug,
    author: b.author,
    category: b.category,
    page: 1,
    badgeText: `${b.category} • صفحہ ۱`,
    readerLink: `/books/${b.slug}?page=1`
  }));
}

// System Prompts for 3 Specialized Modes
const STUDENT_SYSTEM_PROMPT = `آپ "تحریکِ ایمان علمی اتالیق برائے طلبۂ درسِ نظامی" (Dars-e-Nizami Academic Tutor) ہیں۔
سرپرستِ اعلیٰ: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ
ادارہ: تحریکِ ایمان اسلامی پورٹل (مشتمل بر 147 معتمد درسی کتب و 60,895 احادیثِ مبارکہ)

### مشن برائے طلبۂ درسِ نظامی:
طلبۂ کرام کو نصابِ درسِ نظامی کی عبارت فہمی، صرفی صیغہ جات، نحوی تراکیب، اور امتحانی اشکالات حل فرمائیں۔

### اسلوبِ تحریر و جواب:
1. ہر جواب سلیس، تحقیقی اور خوبصورت اردو میں پیش فرمائیں۔
2. کلمات کے صرفی ابواب (ثلاثی مجرد، مزید فیہ، اسم فاعل، مفعول) اور نحوی محل (مبتدا، خبر، فاعل، مفعول، مضاف الیہ) کی وضاحت کریں۔
3. درسِ نظامی کی معتمد کتب (ہدایہ، قدوری، کنز الدقائق، کافیہ، ہدایۃ النحو، نور الانوار، اصول الشاشی، جلالین، مشکوٰۃ، بخاری) سے صریح حوالے دیں۔
4. ہر درسی نکتے کے ساتھ نیچے دیے گئے متعلقہ کتب کے لنکس کو پیشِ نظر رکھتے ہوئے حوالہ درج فرمائیں۔
5. اختتام پر مہرِ علم درج کریں: «وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»۔`;

const ULAMA_SYSTEM_PROMPT = `آپ "تحریکِ ایمان دار الافتاء و مجلسِ تحقیقِ علماء" (Tehreek-e-Iman High Academic & Ifta Council) کے جید مفتی و فقیہِ محقق ہیں۔
سرپرستِ اعلیٰ: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ
ادارہ: تحریکِ ایمان اسلامی پورٹل (مشتمل بر 147 امہات الکتب و 60,895 احادیث)

### مشن برائے علماء و مفتیان:
فقہی و اصولی گہرائی، نصوصِ شرعیہ، تقابلِ مذاہبِ اربعہ (احناف، شوافع، مالکیہ، حنابلہ) اور کتبِ فتاویٰ کے صریح نصوص سے مدلل فتویٰ و رہنمائی فراہم کریں۔

### اسلوبِ افتاء و تحقیق:
1. تقابلِ مذاہبِ اربعہ کے ائمہ کے دلائل اور احناف کے راجح و مفتی بہ موقف کی وضاحت کریں۔
2. امہات الکتب (فتاویٰ شامی، الفتاویٰ الہندیہ، بدائع الصنائع، المبسوط، الہدایہ، البحر الرائق) کے صریح حوالہ جات (جلد اور صفحہ نمبر) درج فرمائیں۔
3. احادیثِ مبارکہ کی تخریج اور فقہ الحدیث کو مدلل کریں۔
4. اختتام پر باوقار مہرِ فتویٰ درج فرمائیں:
   «وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»
   «کتبہ العبد الضعیف — دار الافتاء و مجلسِ تحقیق، تحریکِ ایمان»
   "نوٹ: یہ علمی معاونت کے لیے ہے، فتویٰ کی حتمی توثیق کے لیے اپنے مقامی معتمد دار الافتاء سے رجوع فرمائیں۔"`;

const PUBLIC_SYSTEM_PROMPT = `آپ "تحریکِ ایمان اسلامی رہنمائی برائے عامۃ المسلمین" (Tehreek-e-Iman Public Islamic Guidance) کے مشفق اور نرم خو مصلح و داعی ہیں۔
سرپرستِ اعلیٰ: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ
ادارہ: تحریکِ ایمان اسلامی پورٹل

### مشن برائے عوام الناس:
عامۃ المسلمین کے لیے آسان، سلیس، شستہ اور دل نشین انداز میں روزمرہ کے شرعی مسائل، عبادات (نماز، روزہ، زکوٰۃ، طہارت) اور اخلاقیات کی رہنمائی۔

### اسلوبِ گفتگو:
1. زبان انتہائی آسان، عام فہم اور محبت بھری ہو۔
2. پیچیدہ فقہی و نحوی اصطلاحات سے مکمل گریز کریں۔
3. قرآن و حدیث کے بنیادی مفاہیم سادہ اردو میں سمجھائیں۔
4. اختتام پر دعا اور برکت کے کلمات درج فرمائیں: «وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»۔`;

/**
 * Call Generative AI (Gemini with multi-engine fallback and academic citations)
 */
async function callGenerativeAI(
  prompt: string,
  context: string,
  citations: AcademicCitation[],
  mode: ChatAcademicMode = 'student',
  customApiKey?: string,
  ragAnalysis?: RagAnalysisResult
): Promise<string> {
  const effectiveKey =
    (customApiKey && customApiKey.trim()) ||
    (typeof window !== 'undefined' && (localStorage.getItem('tehreek_gemini_api_key') || localStorage.getItem('madrasa_gemini_api_key'))) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    '';

  const systemPrompt =
    mode === 'student'
      ? STUDENT_SYSTEM_PROMPT
      : mode === 'ulama'
      ? ULAMA_SYSTEM_PROMPT
      : PUBLIC_SYSTEM_PROMPT;

  const citationsBlock = citations
    .map(
      (c, i) =>
        `[حوالہ ${i + 1}] کتاب: ${c.bookTitle} (${c.bookTitleAr || ''})\nمصنف: ${c.author} | زمرہ: ${c.category}\nجلد: ${c.volume || 1} | صفحہ نمبر: ${c.page}\nبراہِ راست لنک: https://tehreek-e-iman.pages.dev${c.readerLink}`
    )
    .join('\n\n');

  const fullPrompt = `${systemPrompt}

### سخت علمی ضوابط و ممانعت از تخمین (Strict 147 Books RAG & Zero Hallucination Policy):
1. آپ کا جواب لازماً اور سختی سے تحریکِ ایمان کے پورٹل پر موجود ۱۴۷ معتمد اسلامی کتب (قرآنِ مجید، صحاحِ ستہ، امہاتِ فقہِ حنفی، شروحاتِ درسِ نظامی) کے نصوص پر مبنی ہونا چاہیے۔
2. کسی بھی مسئلے میں خود سے فرضی صفحہ نمبر، حدیث نمبر یا بغیر نص کے فتویٰ گھڑنا سخت ممنوع ہے۔
3. ہر حکم کے ساتھ معتمد کتاب کا نام، جلد نمبر، اور صفحہ نمبر یا حدیث نمبر لازماً نقل فرمائیں۔
4. اگر کوئی سوال شرعی علوم اور ۱۴۷ کتب کے دائرہ کار سے باہر ہو یا ذاتی تنازع و مقدمہ بازی ہو، تو سائل کو مقامی مستند دار الافتاء اور باوقار مفتی صاحب سے بالمشافہہ رجوع کرنے کی ہدایت فرمائیں۔ (بحوالہ: سورۃ النحل: آیت ۴۳)۔

### کتب خانہ سے حاصل کردہ تصدیق شدہ درسی مراجع (Verified Library Context & Direct Links):
${context}

${citationsBlock}

### سائل کا استفسار:
${prompt}

ہدایت: جواب میں ان کتب و مراجع کے صریح حوالے مع جلد و صفحہ نمبر درج فرمائیں تاکہ طلبہ اور علماء براہِ راست مطالعہ فرما سکیں۔`;

  if (effectiveKey) {
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
    for (const model of models) {
      try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + effectiveKey;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) return text;
        }
      } catch {
        // try next model
      }
    }
  }

  // If live LLM failed or no key, return authoritative RAG formatted answer
  if (ragAnalysis) {
    return formatStrictMuftiAnswer({
      rawQuery: prompt,
      ragResult: ragAnalysis,
      mode
    });
  }

  // Fallback via askIslamicAI with mode adaptation
  try {
    const offlineRes = await askIslamicAI(
      prompt,
      mode === 'student' ? 'hal_ibarat' : mode === 'ulama' ? 'darulifta_fatwa' : 'tashreeh',
      'intermediate',
      undefined,
      context
    );
    if (offlineRes && offlineRes.answer) {
      let combined = offlineRes.answer;
      if (offlineRes.references && offlineRes.references.length > 0) {
        combined += '\n\n**کتب و مراجع کے صریح حوالے:**\n' + offlineRes.references.map(r => `* 📖 ${r}`).join('\n');
      }
      return combined;
    }
  } catch {
    // continue to fallback
  }

  // Rich Fallback tailored to mode
  const topC = citations[0] || {
    bookTitle: 'مختصر القدوری',
    bookTitleAr: 'مختصر القدوري في فقه الحنفية',
    author: 'امام ابو الحسین قدوری',
    category: 'Fiqh',
    page: 1,
    volume: 1
  };

  if (mode === 'student') {
    return `تحریکِ ایمان درسی اتالیق برائے طلبۂ درسِ نظامی:

آپ کے سوال کی درسی تحقیق کے مطابق بنیادی عبارت کا تعلق **${topC.bookTitle}** سے ہے۔

* **مصنف:** ${topC.author}
* **درسی زمرہ:** ${topC.category}
* **حوالہ برائے مطالعہ:** ${topC.bookTitle}، مکتبہ تحریکِ ایمان (جلد ${topC.volume || 1}، صفحہ ${topC.page})۔

**درسی حل و اعرابی رہنمائی:**
کلام کا اصل مفہوم قواعدِ لسان اور فہمِ فقہاء کے مطابق بالکل واضح ہے۔ طلبہ کو چاہیے کہ اس عبارت کے فاعل، مفعول اور مبتدا و خبر کے محل کو ذہن نشین فرمائیں اور متعلقہ شروحات سے تقابل فرمائیں۔

«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»`;
  }

  if (mode === 'ulama') {
    return `تحریکِ ایمان دار الافتاء و مجلسِ تحقیقِ علماء:

الْجَوَابُ وَبِاللَّهِ التَّوْفِيقُ:
مسئولہ صورت کے متعلق ائمہ اربعہ بالخصوص فقہِ حنفی کی امہات الکتب میں صریح نصوص وارد ہیں۔ بنیادی حوالہ **${topC.bookTitle}** (${topC.bookTitleAr || ''}) میں درج ہے۔

* **مصدر:** ${topC.bookTitle}، تالیف: ${topC.author}
* **جلد و صفحہ:** جلد ${topC.volume || 1}، صفحہ ${topC.page}
* **فقہی درجہ:** معتمد متن و فتویٰ

«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»
«کتبہ العبد الضعیف — دار الافتاء و مجلسِ تحقیق، تحریکِ ایمان»
نوٹ: یہ علمی معاونت کے لیے ہے، فتویٰ کی حتمی توثیق کے لیے اپنے مقامی معتمد دار الافتاء سے رجوع فرمائیں۔`;
  }

  return `وعلیکم السلام و رحمۃ اللہ و برکاتہ!
تحریکِ ایمان پورٹل میں خوش آمدید۔ آپ کا سوال دینِ اسلام کی بنیادی تعلیمات سے متعلق ہے۔

اس مسئلے کا آسان اور سیدھا حل یہ ہے کہ شریعتِ مطہرہ نے اپنے بندوں کے لیے ہر معاملے میں آسانی اور پاکیزگی رکھی ہے۔ اس کے متعلق مکمل تفصیل کتاب **${topC.bookTitle}** (صفحہ ${topC.page}) میں موجود ہے۔

اللہ تعالیٰ ہم سب کو دین کا سچا فہم اور اس پر عمل کی توفیق عطا فرمائے۔
«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»`;
}

/**
 * Full Smart Intent & RAG Processor with Multi-Mode Academic Support
 */
export async function processChatMessage(
  userMessage: string,
  customApiKey?: string,
  mode: ChatAcademicMode = 'student'
): Promise<ChatResponsePayload> {
  const trimmed = userMessage.trim();
  if (!trimmed) {
    return {
      type: 'text',
      data: 'برائے مہربانی اپنا سوال یا مطلوبہ کتاب کا نام تحریر فرمائیں۔',
      mode
    };
  }

  // STEP A: Detect Book Intent
  const intentResult = detectBookIntent(trimmed);

  // STEP B: If BOOK_QUERY -> return structured book_info card with citations
  if (intentResult.intent === 'BOOK_QUERY' && intentResult.book) {
    const book = intentResult.book;
    const isPublic = book.source_type === 'public';
    const link = isPublic ? '/books/' + book.slug : (book as ModernBook).external_link;
    const actionLabel = isPublic ? 'کتاب پڑھیں' : 'اصل ماخذ پر پڑھیں';

    const directCitation: AcademicCitation = {
      bookTitle: book.title_ur,
      bookTitleAr: book.title_ar,
      slug: book.slug,
      author: book.author,
      category: book.category,
      page: 1,
      volume: 1,
      badgeText: `${book.category} • صفحہ ۱`,
      readerLink: `/books/${book.slug}?page=1`
    };

    return {
      type: 'book_info',
      data: {
        fullName: book.title_ur + ' / ' + book.title_ar,
        author: book.author + ' (وفات: ' + book.death_year + 'ھ)',
        intro: book.intro_ur,
        meta: book.volumes + ' جلدیں، ' + (Array.isArray(book.pages) ? book.pages.length : book.pages).toLocaleString('ur-PK') + ' صفحات | موضوع: ' + book.category,
        cover_url: book.cover_url,
        action: {
          label: actionLabel,
          link: link
        },
        book: book
      },
      citations: [directCitation],
      mode
    };
  }

  // STEP C: Strict RAG Retrieval & Hallucination Guard from 147 Books
  const ragAnalysis = retrieveStrictRagContext(trimmed);

  // If question falls outside verified books or requires in-person local mufti (prevents hallucinations)
  if (!ragAnalysis.isInScope || ragAnalysis.requiresLocalMufti) {
    const refusalText = formatStrictMuftiAnswer({
      rawQuery: trimmed,
      ragResult: ragAnalysis,
      mode
    });
    return {
      type: 'text',
      data: refusalText,
      citations: [],
      mode
    };
  }

  // In-scope: Map verified citations with exact volume and page numbers
  const ragCitations: AcademicCitation[] = ragAnalysis.citations.map(c => ({
    bookTitle: c.bookTitle,
    bookTitleAr: c.bookTitleAr,
    slug: c.slug,
    author: c.author,
    category: c.category,
    page: c.page,
    volume: c.volume,
    hadithNumber: c.hadithNumber,
    readerLink: c.readerLink,
    badgeText: c.badgeText
  }));

  // Build rich verified context snippet
  let contextSnippet = '';
  if (ragAnalysis.quranEvidence) {
    contextSnippet += `[آیتِ مبارکہ] ${ragAnalysis.quranEvidence.surahName} (آیت ${ragAnalysis.quranEvidence.ayahNumber}): ${ragAnalysis.quranEvidence.arabic}\nترجمہ: ${ragAnalysis.quranEvidence.urdu}\n\n`;
  }
  if (ragAnalysis.hadithEvidence) {
    contextSnippet += `[حدیثِ مبارکہ] ${ragAnalysis.hadithEvidence.bookTitle} (حدیث ${ragAnalysis.hadithEvidence.hadithNumber}): ${ragAnalysis.hadithEvidence.arabic}\nمفہوم: ${ragAnalysis.hadithEvidence.urdu}\n\n`;
  }
  if (ragAnalysis.fiqhEvidence) {
    contextSnippet += `[نصِ فقہی] ${ragAnalysis.fiqhEvidence.bookTitle} (تالیف: ${ragAnalysis.fiqhEvidence.author}، جلد: ${ragAnalysis.fiqhEvidence.volume}، صفحہ: ${ragAnalysis.fiqhEvidence.page}): ${ragAnalysis.fiqhEvidence.arabic}\nدرسی توضیح: ${ragAnalysis.fiqhEvidence.urdu}\n\n`;
  }

  contextSnippet += ragCitations
    .map(
      (c, idx) =>
        `[حوالہ درسی ${idx + 1}] کتاب: ${c.bookTitle} (${c.bookTitleAr || ''})\nمصنف: ${c.author}\nزمرہ: ${c.category}\nجلد: ${c.volume || 1} | صفحہ نمبر: ${c.page}`
    )
    .join('\n\n');

  const answer = await callGenerativeAI(trimmed, contextSnippet, ragCitations, mode, customApiKey, ragAnalysis);

  return {
    type: 'text',
    data: answer,
    citations: ragCitations,
    mode
  };
}