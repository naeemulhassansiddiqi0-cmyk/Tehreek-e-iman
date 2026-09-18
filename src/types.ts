export type AppTab = 'dashboard' | 'reader' | 'ai-tutor' | 'exams' | 'notes' | 'flashcards' | 'prayer-times';

export type AIMode = 
  | 'darulifta_fatwa'      // ڈیجیٹل دار الافتاء و باقاعدہ شرعی فتویٰ مع نصوص و مراجع
  | 'dalayel_quran_sunnah' // قرآن و سنت سے مدلل رہنمائی مع مستند حوالہ جات
  | 'madhahib_comparative' // تقابلِ مذاہبِ اربعہ مع دلائلِ ائمہ
  | 'takhrij_hadith'       // تخریجِ حدیث و تحقیقِ کتب و اسناد
  | 'hal_ibarat'           // حلِ عبارت، اعراب و ترکیب
  | 'tashreeh'             // سلیس درسی تشریح و مفہوم
  | 'exam_prep'            // امتحانی سوالات و رہنمائی (وفاق المدارس)
  | 'objections';          // واردات و اعتراضات اور ان کے جوابات

export type StudentLevel = 'beginner' | 'intermediate' | 'advanced';

export type SupportedLanguage = 
  | 'ur' // اردو
  | 'en' // English
  | 'ar' // العربية المبسطة
  | 'ps' // پښتو
  | 'fa' // فارسی
  | 'bn' // বাংলা
  | 'tr' // Türkçe
  | 'fr' // Français
  | 'de' // Deutsch
  | 'es' // Español
  | 'id' // Bahasa Indonesia
  | 'ru' // Русский
  | 'hi' // हिन्दी
  | 'zh' // 中文
  | 'ms' // Bahasa Melayu
  | 'sw' // Kiswahili
  | 'custom';

export interface LanguageOption {
  code: SupportedLanguage;
  nameUrdu: string;
  nameNative: string;
  direction: 'rtl' | 'ltr';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ur', nameUrdu: 'اردو', nameNative: 'اردو', direction: 'rtl' },
  { code: 'en', nameUrdu: 'انگریزی', nameNative: 'English', direction: 'ltr' },
  { code: 'ar', nameUrdu: 'عربی تسہیل', nameNative: 'العربية المبسطة', direction: 'rtl' },
  { code: 'ps', nameUrdu: 'پشتو', nameNative: 'پښتو', direction: 'rtl' },
  { code: 'fa', nameUrdu: 'فارسی / دری', nameNative: 'فارسی', direction: 'rtl' },
  { code: 'bn', nameUrdu: 'بنگالی', nameNative: 'বাংলা', direction: 'ltr' },
  { code: 'tr', nameUrdu: 'ترکی', nameNative: 'Türkçe', direction: 'ltr' },
  { code: 'fr', nameUrdu: 'فرانسیسی', nameNative: 'Français', direction: 'ltr' },
  { code: 'de', nameUrdu: 'جرمن', nameNative: 'Deutsch', direction: 'ltr' },
  { code: 'es', nameUrdu: 'ہسپانوی', nameNative: 'Español', direction: 'ltr' },
  { code: 'id', nameUrdu: 'انڈونیشین', nameNative: 'Bahasa Indonesia', direction: 'ltr' },
  { code: 'ru', nameUrdu: 'روسی', nameNative: 'Русский', direction: 'ltr' },
  { code: 'hi', nameUrdu: 'ہندی', nameNative: 'हिन्दी', direction: 'ltr' },
  { code: 'zh', nameUrdu: 'چینی', nameNative: '中文', direction: 'ltr' },
  { code: 'ms', nameUrdu: 'ملائی', nameNative: 'Bahasa Melayu', direction: 'ltr' },
  { code: 'sw', nameUrdu: 'سواحیلی', nameNative: 'Kiswahili', direction: 'ltr' },
];


export interface IraabItem {
  word: string;
  role: string;
  sign: string;
  detail: string;
}

export interface BookSegment {
  id: string;
  arabicText: string;
  urduTranslation: string;
  translations?: Record<string, string>; // Multi-language translations (en, bn, ps, fa, tr, etc.)
  tashreeh: string;
  mahalIraab?: IraabItem[];
  hawashi?: string[];
  potentialQuestions?: string[];
  objectionsAndAnswers?: {
    objection: string;
    answer: string;
  }[];
}

export interface BookChapter {
  id: string;
  titleArabic: string;
  titleUrdu: string;
  segments: BookSegment[];
}

export type BookCategory = 
  | 'sittah'           // صحاحِ ستہ و امہات الحدیث
  | 'fatawa'           // کتبِ فتاویٰ
  | 'dars_curriculum'  // درسِ نظامی نصاب
  | 'quran_tafseer'    // القرآن والتفاسیر
  | 'kharji_kitab';    // خارجی دینی کتب و مطالعۂ طلبہ

export type DarsDarja = 
  | 'ula'      // درجہ اولیٰ (ثانویہ عامہ سال اول)
  | 'sania'    // درجہ ثانیہ (ثانویہ عامہ سال دوم)
  | 'salisa'   // درجہ ثالثہ (ثانویہ خاصہ سال اول)
  | 'rabia'    // درجہ رابعہ (ثانویہ خاصہ سال دوم)
  | 'khamisa'  // درجہ خامسہ (عالیہ سال اول)
  | 'sadisa'   // درجہ سادسہ (عالیہ سال دوم)
  | 'sabia'    // درجہ سابعہ (عالمیہ سال اول / موقوف علیہ)
  | 'samina'   // درجہ ثامنہ (دورۂ حدیث شریف / عالمیہ سال دوم)
  | 'takhasus'; // تخصص فی الفقہ والافتاء

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  subject: 'quran' | 'tafseer' | 'hadith' | 'fiqh' | 'usul' | 'nahw' | 'sarf' | 'fatawa' | 'mantiq' | 'balaghah' | 'adab' | 'aqaid' | 'faraid' | 'seerah' | 'tazkiyah' | 'tarikh';
  subjectNameUrdu: string;
  grade: string; // وفاق المدارس کے درجات و شعبہ
  darjaKey?: DarsDarja;
  darjaUrdu?: string;
  coverColor: string;
  coverImage?: string;
  pdfUrl?: string;
  shamelaUrl?: string;
  islam360Url?: string;
  description: string;
  chapters: BookChapter[];
}

export interface SearchResult {
  bookId: string;
  bookTitle: string;
  category: BookCategory;
  subjectNameUrdu: string;
  chapterTitle: string;
  segmentId: string;
  arabicText: string;
  translation: string;
  matchType: 'arabic' | 'translation' | 'tashreeh' | 'iraab';
  snippet: string;
}

export interface ExamQuestion {
  id: string;
  year: string;
  board: string;
  grade: string;
  darjaKey?: DarsDarja;
  subject: string;
  questionNumber: number;
  questionTextArabic?: string;
  questionTextUrdu: string;
  modelAnswer: {
    tarjama: string;
    iraab: string;
    tashreeh: string;
    fawaidWaNukat: string[];
    examinerTips: string;
  };
}

export interface ExamGuideRule {
  id: string;
  title: string;
  category: 'presentation' | 'time_management' | 'scoring' | 'mistakes';
  description: string;
  keyTakeaways: string[];
}

export interface PersonalNote {
  id: string;
  bookId: string;
  segmentId: string;
  content: string;
  createdAt: string;
}

export interface DictionaryEntry {
  word: string;
  root: string;
  meaningUrdu: string;
  grammaticalType: string;
  example: string;
  exampleTranslation?: string; // شاہد و مثال کا اردو ترجمہ
  exampleProof?: string;       // شاہد و مثال کا نحوی استدلال
  tarkeeb?: {
    role: string;
    sign: string;
    detail: string;
    contextualTranslation?: string;
    sentenceRoleUrdu?: string;
    syntacticAspects?: string[];
    // Hazrat Maulana's explicit 3D scholarly breakdown:
    failLafzi?: string;        // فاعلِ لفظی / لغوی (اسم ظاہر یا ضمیر)
    failManawi?: string;       // فاعلِ معنوی (حقیقی فاعل در معنی)
    mafoolDetail?: string;     // مفعولِ مطلق، مفعول بہ و مضاف الیہ کی مکمل درسی تحقیق
    irabDetail?: string;       // اعرابی علامت و محل مع اعراب
  };
}

export interface WordLookupContextInfo {
  bookTitle: string;
  chapterTitle: string;
  sentenceText: string;
  urduTranslation?: string;
  mahalIraab?: IraabItem[];
  tashreeh?: string;
  hawashi?: string[];
  rawWord?: string;
}

