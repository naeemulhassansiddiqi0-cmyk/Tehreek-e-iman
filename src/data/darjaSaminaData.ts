// Darja Samina Books (Complete Canonical Modular Collection)
// Canonical Grade: Dawrah al-Hadith al-Sharif / Alimiyyah Year 2 (درجہ ثامنہ - دورۂ حدیث شریف / عالمیہ سال دوم)
import { Book } from '../types';
import { bukhariChapters } from './bukhariData';
import { muslimChapters } from './muslimData';
import { 
  abudawoodChapters, 
  tirmidhiChapters, 
  nasaiChapters, 
  ibnmajahChapters 
} from './allHadithBooksData';
import { muwattaChapters } from './muwattaData';

export const darjaSaminaBooks: Book[] = [
  {
    id: "bukhari",
    title: "صَحِيحُ البُخَارِيِّ (الجَامِعُ المُسْنَدُ الصَّحِيحُ)",
    author: "الإمام أبو عبد الله محمد بن إسماعيل البخاري الجعفي (ت 256ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث شریف (اصح الکتب بعد کتاب اللہ)",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-amber-950 via-yellow-950 to-stone-950",
    description: "کتاب اللہ کے بعد روئے زمین پر اصح ترین کتاب، جس میں امام المحدثین نے فقہی ابواب کی ترتیب پر صحیح ترین مرفوع متصل احادیث کا انتخاب فرمایا۔ مع فتح الباری، عمدۃ القاری، اور فیض الباری۔",
    chapters: bukhariChapters
  },
  {
    id: "muslim",
    title: "صَحِيحُ مُسْلِمٍ (المُسْنَدُ الصَّحِيحُ)",
    author: "الإمام أبو الحسين مسلم بن الحجاج القشيري النيسابوري (ت 261ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث شریف (اصح ترین مسند بعد البخاری)",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-blue-950 via-slate-900 to-stone-950",
    description: "حسنِ سیاق، جمعِ طرق اور ضبطِ الفاظ کا بے مثال مجموعہ جس میں احادیث کے تمام طرق اور مختلف الفاظ کو ایک ہی جگہ مدون کیا گیا ہے۔ مع شرح النووی، فتح الملہم للشبیری العثمانی۔",
    chapters: muslimChapters
  },
  {
    id: "tirmidhi",
    title: "جَامِعُ التِّرْمِذِيِّ (السُّنَنُ)",
    author: "الإمام الحافظ أبو عيسى محمد بن عيسى بن سورة الترمذي (ت 279ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث، علل، اور فقہائے صحابہ و تابعین کے مذاہب",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-purple-950 via-indigo-950 to-stone-950",
    description: "مذاہبِ فقہاء، عللِ حدیث، تصحیح و تضعیف اور جرح و تعدیل کا سب سے جامع انسائیکلوپیڈیا، جس میں ہر حدیث کے بعد فقہاء کے مسالک اور درجاتِ صحت بیان کیے گئے ہیں۔ مع تحفۃ الاحوذی ومعارف السنن للبنوری۔",
    chapters: tirmidhiChapters
  },
  {
    id: "abudawood",
    title: "سُنَنُ أَبِي دَاوُدَ",
    author: "الإمام الحافظ أبو داود سليمان بن الأشعث السجستاني (ت 275ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "احادیثِ احکام، سنن اور فقہی استنباط",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-blue-900 via-sky-950 to-stone-950",
    description: "فقہائے اسلام اور مجتہدین کی بنیاد، جس میں احکامِ شرعیہ کے دلائل اور سننِ نبویہ کا سب سے مستند اور معتمد ذخیرہ جمع کیا گیا ہے۔ مع عون المعبود وبذل المجہود للسہارنفوری۔",
    chapters: abudawoodChapters
  },
  {
    id: "nasai",
    title: "سُنَنُ النَّسَائِيِّ (المُجْتَبَى)",
    author: "الإمام الحافظ أبو عبد الرحمن أحمد بن شعيب النسائي (ت 303ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "سنن، دقائقِ اسانید، اور عللِ خفية",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-teal-950 via-emerald-950 to-stone-950",
    description: "اسانید کے دقائق، عللِ خفیہ کی نقادی، اور راویوں کے الفاظ کے تفاووت کو پرکھنے میں ائمہ کی معتمد ترین کتاب، جس کی شرائط صحاحِ اربعہ میں سب سے سخت ہیں۔ مع حاشیۃ السندی وزہر الربی للسیوطی۔",
    chapters: nasaiChapters
  },
  {
    id: "ibnmajah",
    title: "سُنَنُ ابْنِ مَاجَهْ",
    author: "الإمام الحافظ أبو عبد الله محمد بن يزيد القزويني ابن ماجه (ت 273ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "سنن، حسنِ ترتیب، اور زوائد",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-stone-950 via-emerald-950 to-stone-950",
    description: "ابواب کی عمدہ ترین ترتیب، فقہی حسنِ انطباق اور پانچوں کتب سے زائد روایات (زوائد) پر مشتمل درسی متن۔ مع حاشیۃ السندی ومصباح الزجاجۃ للسیوطی وانجاح الحاجۃ لعبد الغنی الدہلوی۔",
    chapters: ibnmajahChapters
  },
  {
    id: "muwatta",
    title: "مُوَطَّأُ الإِمَامِ مَالِكٍ",
    author: "إمام دار الهجرة الإمام مالك بن أنس الأصبحي (ت 179ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث و فقہِ اہل مدینہ و آثارِ صحابہ",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-amber-900 via-stone-900 to-stone-950",
    description: "تدوینِ حدیث کا اول ترین اور مبارک ترین شاہکار، جسے امام شافعی نے کتاب اللہ کے بعد زمین پر اصح ترین کتاب قرار دیا۔ مع اوجز المسالک للکاندهلوی والمنتقی للباجی۔",
    chapters: muwattaChapters
  }
];

export {
  bukhariChapters,
  muslimChapters,
  tirmidhiChapters,
  abudawoodChapters,
  nasaiChapters,
  ibnmajahChapters,
  muwattaChapters
};
