import { Book } from '../types';
import { bukhariChapters } from './bukhariData';
import { muslimChapters } from './muslimData';
import { 
  abudawoodChapters, 
  tirmidhiChapters, 
  nasaiChapters, 
  ibnmajahChapters, 
  muwattaChapters, 
  mishkatChapters, 
  tahawiChapters 
} from './allHadithBooksData';
import { darjaUlaBooks } from './darjaUlaData';
import { darjaSaniaBooks } from './darjaSaniaData';
import { darjaHigherBooks } from './darjaHigherData';
import { kharjiBooks } from './kharjiBooksData';
import { quranChapters } from './quranData';
import { jalalaynChapters } from './jalalaynData';
import { darjaTakhasusBooks } from './darjaTakhasusData';
import { 
  hidayahChapters, 
  kanzChapters, 
  kafiyaChapters, 
  nuranwarChapters, 
  quduriChapters 
} from './fiqhUsulBooksData';

export const booksDatabase: Book[] = [
  // ==========================================
  // 1. القرآن والتفاسیر (QURAN & TAFSEER)
  // ==========================================
  {
    id: "quran",
    title: "القُرْآنُ الكَرِيمُ (مَعَ إِعْرَابِ القُرْآنِ)",
    author: "كَلَامُ اللهِ تَعَالَى المُنَزَّلُ عَلَى نَبِيِّهِ مُحَمَّدٍ ﷺ",
    category: "quran_tafseer",
    subject: "quran",
    subjectNameUrdu: "القرآن الکریم و اعراب القرآن (114 سورتیں و 30 پارے)",
    grade: "جملہ درجاتِ وفاق المدارس (عامہ، خاصہ، عالیہ، عالمیہ)",
    coverColor: "from-emerald-900 to-teal-950",
    pdfUrl: "https://archive.org/download/quran_pdf_arabic/quran.pdf",
    shamelaUrl: "https://shamela.ws/category/11",
    islam360Url: "https://theislam360.com/quran",
    description: "کلام اللہ مع ۱۱۴ سورتوں کی مکمل فہرست، اعراب، کثیر اللسانی ترجمہ، تفسیری نکات، اور آیات کا مفصل محلِ اعراب۔",
    chapters: quranChapters
  },

  {
    id: "jalalayn",
    title: "تَفْسِيرُ الجَلَالَيْنِ",
    author: "الإمام جلال الدين المحلي (ت 864ھ) والإمام جلال الدين السيوطي (ت 911ھ)",
    category: "quran_tafseer",
    subject: "tafseer",
    subjectNameUrdu: "تفسیرِ قرآن مع حلِ الفاظ",
    grade: "درجہ رابعہ و خامسہ (عالیہ)",
    darjaKey: "rabia",
    darjaUrdu: "درجہ رابعہ (خاصہ سال دوم)",
    coverColor: "from-teal-900 to-emerald-950",
    pdfUrl: "https://archive.org/download/tafseer-al-jalalayn/tafseer-al-jalalayn.pdf",
    shamelaUrl: "https://shamela.ws/book/8389",
    islam360Url: "https://theislam360.com/quran",
    description: "درسِ نظامی کی بنیادی ترین تفسیر جس میں قرآنی الفاظ کے حل، محذوفات کی تقدیر، اور نحوی تراکیب کو نہایت اختصار اور جامعیت سے حل کیا گیا ہے۔ مع حواشی کمالین، حاشیہ جمل و حاشیہ صاوی۔",
    chapters: jalalaynChapters
  },

  // ==========================================
  // 2. صحاحِ ستہ و امہات الحدیث (SIHAH SITTAH)
  // ==========================================
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
    coverColor: "from-amber-950 via-yellow-900 to-stone-950",
    pdfUrl: "https://archive.org/download/sa1234g/Bukhari-Arabic-Vol1.pdf",
    shamelaUrl: "https://shamela.ws/book/1376",
    islam360Url: "https://theislam360.com/hadith",
    description: "اصح الکتب بعد کتاب اللہ، جس میں صحیح ترین احادیث کو فقہی ابواب اور تراجم الابواب کے ساتھ نہایت کمال سے مرتب کیا گیا ہے۔ مع شروحات: فتح الباری و عمدۃ القاری۔",
    chapters: bukhariChapters,
  },

  {
    id: "muslim",
    title: "صَحِيحُ مُسْلِمٍ (المُسْنَدُ الصَّحِيحُ)",
    author: "الإمام أبو الحسين مسلم بن الحجاج النيسابوري القشيري (ت 261ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث شریف (حسنِ سیاق و اتقان)",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-blue-950 via-slate-900 to-indigo-950",
    pdfUrl: "https://archive.org/download/SahihMuslimArabic/Sahih_Muslim.pdf",
    shamelaUrl: "https://shamela.ws/book/1727",
    islam360Url: "https://theislam360.com/hadith",
    description: "صحاحِ ستہ کا دوسرا معتمد ترین پایہ، جو حسنِ ترتیب، جمعِ طرق، اور اسانید کی سلاست میں بے مثال ہے۔ مع شرح الإمام النووي۔",
    chapters: muslimChapters,
  },

  {
    id: "tirmidhi",
    title: "جَامِعُ التِّرْمِذِيِّ (السُّنَنُ)",
    author: "الإمام أبو عيسى محمد بن عيسى بن سورة الترمذي (ت 279ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث شریف مع فقہ الحدیث و مذاہبِ فقہاء",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-purple-950 via-indigo-900 to-stone-950",
    pdfUrl: "https://archive.org/download/JamiAtTirmidhiArabic/Jami_Tirmidhi.pdf",
    shamelaUrl: "https://shamela.ws/book/1381",
    islam360Url: "https://theislam360.com/hadith",
    description: "صحاحِ ستہ کی وہ شاہکار کتاب جس میں ہر حدیث کی فقہی حیثیت، صحیح و حسن ہونے کا حکم، اور ائمہ اربعہ و صحابہ و تابعین کے مذاہب بیان کیے گئے ہیں۔ مع معارف السنن۔",
    chapters: tirmidhiChapters,
  },

  {
    id: "abudawood",
    title: "سُنَنُ أَبِي دَاوُدَ",
    author: "الإمام أبو داود سليمان بن الأشعث السجستاني (ت 275ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث شریف (احادیثِ احکام کا اصل منبع)",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-blue-900 via-sky-950 to-stone-950",
    pdfUrl: "https://archive.org/download/SunanAbiDawudArabic/Sunan_Abu_Dawud.pdf",
    shamelaUrl: "https://shamela.ws/book/1726",
    islam360Url: "https://theislam360.com/hadith",
    description: "احکام و فقہی مسائل کے استنباط کا سب سے بڑا ذخیرہ، جس کی احادیث پر فقہاء کے فتاویٰ کا دارومدار ہے۔ مع بذل المجہود فی حل سنن ابی داود للعلامہ خلیل احمد سہارنپوری۔",
    chapters: abudawoodChapters,
  },

  {
    id: "nasai",
    title: "سُنَنُ النَّسَائِيِّ (المُجْتَبَى)",
    author: "الإمام أبو عبد الرحمن أحمد بن شعيب النسائي (ت 303ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث شریف (علم العلل و دقتِ اسانید)",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-teal-950 via-emerald-900 to-stone-950",
    pdfUrl: "https://archive.org/download/SunanAnNasaiArabic/Sunan_Nasai.pdf",
    shamelaUrl: "https://shamela.ws/book/1382",
    islam360Url: "https://theislam360.com/hadith",
    description: "صحاحِ ستہ میں اسانید کی چھان بین اور راویوں کی جرح و تعدیل کے لحاظ سے امام بخاری کے بعد سب سے بلند مقام سنن نسائی کا ہے۔ مع حاشیۃ السندی۔",
    chapters: nasaiChapters,
  },

  {
    id: "ibnmajah",
    title: "سُنَنُ ابْنِ مَاجَهْ",
    author: "الإمام أبو عبد الله محمد بن يزيد بن ماجه القزويني (ت 273ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث شریف (حسنِ ترتیب و زوائد)",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-stone-950 via-emerald-950 to-neutral-950",
    pdfUrl: "https://archive.org/download/SunanIbnMajahArabic/Sunan_Ibn_Majah.pdf",
    shamelaUrl: "https://shamela.ws/book/1728",
    islam360Url: "https://theislam360.com/hadith",
    description: "صحاحِ ستہ کی چھٹی معتمد کتاب، جس کی سب سے بڑی خوبی ابواب کی نفاست اور وہ زوائد احادیث ہیں جو باقی پانچ کتابوں میں نہیں ملتیں۔",
    chapters: ibnmajahChapters,
  },

  {
    id: "muwatta",
    title: "مُوَطَّأُ الإِمَامِ مَالِكٍ",
    author: "الإمام مالك بن أنس الأصبحي إمام دار الهجرة (ت 179ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث شریف و فقہ اہلِ مدینہ",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "samina",
    darjaUrdu: "درجہ ثامنہ (دورۂ حدیث شریف)",
    coverColor: "from-amber-900 via-stone-900 to-amber-950",
    pdfUrl: "https://archive.org/download/MuwattaMalikArabic/Muwatta_Malik.pdf",
    shamelaUrl: "https://shamela.ws/book/1402",
    islam360Url: "https://theislam360.com/hadith",
    description: "اسلام کی سب سے پہلی مدون اور معتبر ترین کتاب، جس کے متعلق امام شافعی نے فرمایا: 'ما بعد کتاب اللہ أصح من مؤطا مالک'۔ مع أوجز المسالک للشیخ الکاندھلوی۔",
    chapters: muwattaChapters,
  },

  {
    id: "tahawi",
    title: "شَرْحُ مَعَانِي الآثَارِ",
    author: "الإمام الحافظ أبو جعفر أحمد بن محمد بن سلامة الطحاوي الحنفي (ت 321ھ)",
    category: "sittah",
    subject: "hadith",
    subjectNameUrdu: "حدیث شریف و فقہِ مقارن و دلائل احناف",
    grade: "درجہ عالمیہ (دورۂ حدیث شریف)",
    darjaKey: "sabia",
    darjaUrdu: "درجہ سابعہ (سال ہفتم / موقوف علیہ)",
    coverColor: "from-yellow-950 via-amber-950 to-stone-950",
    pdfUrl: "https://archive.org/download/SharhMaaniAlAtharTahawi/Sharh_Maani_Al_Athar.pdf",
    shamelaUrl: "https://shamela.ws/book/1409",
    islam360Url: "https://theislam360.com/hadith",
    description: "حدیث کے تعارض اور ظاہری تضاد کو دور کرنے اور ائمہ احناف کے فقہی مسالک کو احادیثِ مرفوعہ اور آثارِ صحابہ سے ثابت کرنے کا سب سے عظیم علمی شاہکار۔ مع نخب الافکار للعینی۔",
    chapters: tahawiChapters,
  },

  // ==========================================
  // 3. کتبِ فتاویٰ و تخصص فی الفقہ والافتاء (TAKhasus & FATAWA BOOKS)
  // ==========================================
  ...darjaTakhasusBooks,

  // 4. درسِ نظامی کا مکمل نصاب (DARS-E-NIZAMI SYLLABI)
  // ==========================================
  {
    id: "mishkat",
    title: "مِشْكَاةُ المَصَابِيحِ",
    author: "الإمام محمد بن عبد الله الخطيب التبريزي (ت 741ھ)",
    category: "dars_curriculum",
    subject: "hadith",
    subjectNameUrdu: "حدیثِ رسول ﷺ مع شروحات",
    grade: "درجہ خامسہ و سادسہ (عالیہ)",
    darjaKey: "sadisa",
    darjaUrdu: "درجہ سادسہ (عالیہ سال دوم)",
    coverColor: "from-amber-900 to-stone-950",
    pdfUrl: "https://archive.org/download/kutubpdf.net_20191219/%D9%85%D8%B4%D9%83%D8%A7%D8%A9-%D8%A7%D9%84%D9%85%D8%B5%D8%A7%D8%A8%D9%8A%D8%AD-kutub-pdf.net.pdf",
    shamelaUrl: "https://shamela.ws/book/1253",
    islam360Url: "https://theislam360.com/hadith",
    description: "احادیثِ نبویہ کا معتمد درسی مجموعہ مع شروحات: مرقاۃ المفاتیح (ملا علی قاری) و مظاہرِ حق، مع اعراب، ترجمہ، تشریح، اور محل اعراب۔",
    chapters: mishkatChapters,
  },

  {
    id: "hidayah",
    title: "الهِدَايَةُ شَرْحُ بِدَايَةِ المُبْتَدِي",
    author: "الإمام برهان الدين علي بن أبي بكر المرغيناني الحنفي (ت 593ھ)",
    category: "dars_curriculum",
    subject: "fiqh",
    subjectNameUrdu: "فقہ حنفی مع دلائلِ ائمہ اربعہ",
    grade: "درجہ رابعہ، خامسہ و سادسہ (عالیہ)",
    darjaKey: "khamisa",
    darjaUrdu: "درجہ خامسہ (عالیہ سال اول)",
    coverColor: "from-emerald-950 to-amber-950",
    pdfUrl: "https://archive.org/download/HidayahSharhBidayatAlMubtadi/Hidayah_Complete.pdf",
    shamelaUrl: "https://shamela.ws/book/124338",
    islam360Url: "https://theislam360.com/?s=%D8%A7%D9%84%D9%87%D8%AF%D8%A7%D9%8A%D8%A9",
    description: "فقہ حنفی کا سب سے معتبر اور جامع درسی شاہکار، جس میں فروعی مسائل کو اصولی قواعد اور ائمہ اربعہ کے دلائل کے ساتھ پرکھا گیا ہے۔",
    chapters: hidayahChapters
  },

  {
    id: "kanz",
    title: "كَنْزُ الدَّقَائِقِ فِي الفِقْهِ",
    author: "الإمام حافظ الدين عبد الله بن أحمد النسفي الحنفي (ت 710ھ)",
    category: "dars_curriculum",
    subject: "fiqh",
    subjectNameUrdu: "فقہ حنفی (متنِ متین)",
    grade: "درجہ ثالثہ (خاصہ سال اول)",
    darjaKey: "salisa",
    darjaUrdu: "درجہ ثالثہ (خاصہ سال اول)",
    coverColor: "from-amber-900 to-emerald-950",
    pdfUrl: "https://archive.org/download/KanzAlDaqaiqNasafi/Kanz_Al_Daqaiq.pdf",
    shamelaUrl: "https://shamela.ws/book/21603",
    islam360Url: "https://theislam360.com/?s=%D9%83%D9%86%D8%B2+%D8%A7%D9%84%D8%AF%D9%82%D8%A7%D8%A6%D9%82",
    description: "متونِ اربعہ میں سب سے کثیر المسائل اور جامع ترین متن، جس پر بحر الرائق، تبیین الحقائق، اور کشف الحقائق لکھی گئیں۔",
    chapters: kanzChapters
  },

  {
    id: "kafiya",
    title: "الكَافِيَةُ فِي عِلْمِ النَّحْوِ",
    author: "الإمام جمال الدين أبو عمرو عثمان بن عمر المعروف بـ 'ابن الحاجب' (ت 646ھ)",
    category: "dars_curriculum",
    subject: "nahw",
    subjectNameUrdu: "علم النحو (متنِ جلیل)",
    grade: "درجہ ثالثہ (خاصہ سال اول)",
    darjaKey: "salisa",
    darjaUrdu: "درجہ ثالثہ (خاصہ سال اول)",
    coverColor: "from-blue-950 via-indigo-950 to-stone-950",
    pdfUrl: "https://archive.org/download/KafiyahIbnAlHajib/Kafiyah.pdf",
    shamelaUrl: "https://shamela.ws/book/26917",
    islam360Url: "https://theislam360.com/?s=%D8%A7%D9%84%D9%83%D8%A7%D9%81%D9%8A%D8%A9",
    description: "علم نحو کی بے مثل اور دقیق ترین کتاب، جس پر علامہ عبد الرحمن جامی نے 'الفوائد الضيائية' (شرح جامی) تحریر فرمائی۔",
    chapters: kafiyaChapters
  },

  {
    id: "nuranwar",
    title: "نُورُ الأَنْوَارِ فِي شَرْحِ المَنَارِ",
    author: "الشيخ ملا جيون اللكهنوي الحنفي (ت 1130ھ)",
    category: "dars_curriculum",
    subject: "usul",
    subjectNameUrdu: "اصولِ فقہ حنفی",
    grade: "درجہ ثالثہ و رابعہ (خاصہ و عالیہ)",
    darjaKey: "rabia",
    darjaUrdu: "درجہ رابعہ (خاصہ سال دوم)",
    coverColor: "from-indigo-950 to-purple-950",
    pdfUrl: "https://archive.org/download/NurAlAnwarMullaJeewan/Nur_Al_Anwar.pdf",
    shamelaUrl: "https://shamela.ws/book/1199",
    islam360Url: "https://theislam360.com/?s=%D9%86%D9%88%D8%B1+%D8%A7%D9%84%D8%A3%D9%86%D9%88%D8%A7%D8%B1",
    description: "اصولِ فقہ کی انتہائی معتمد اور باریک بین درسی کتاب، جس میں امام نسفی رحمہ اللہ کی 'منار الانوار' کے دقیق اصولی، لغوی اور فقہی اصولوں کو واضح کیا گیا ہے۔",
    chapters: nuranwarChapters
  },

  {
    id: "quduri",
    title: "مُخْتَصَرُ القُدُورِيّ",
    author: "أبو الحسين أحمد بن محمد القدوري البغدادي الحنفي (ت 428ھ)",
    category: "dars_curriculum",
    subject: "fiqh",
    subjectNameUrdu: "فقہ حنفی (متنِ معتمد)",
    grade: "درجہ ثانیہ (عامہ سال دوم)",
    darjaKey: "sania",
    darjaUrdu: "درجہ ثانیہ (عامہ سال دوم)",
    coverColor: "from-emerald-800 to-emerald-950",
    pdfUrl: "https://archive.org/download/hanafi_1_201512/Mukhtasar_al-Quduri.pdf",
    shamelaUrl: "https://shamela.ws/book/124336",
    islam360Url: "https://theislam360.com/?s=%D9%85%D8%AE%D8%AA%D8%B5%D8%B1+%D8%A7%D9%84%D9%82%D8%AF%D9%88%D8%B1%D9%8A",
    description: "فقہ حنفی کا سب سے معتمد اور بنیادی درسی متن، جس پر ائمہ احناف کے فتاویٰ کا مدار ہے۔",
    chapters: quduriChapters
  },


  ...darjaUlaBooks,
  ...darjaSaniaBooks,
  ...darjaHigherBooks,
  ...kharjiBooks
];
