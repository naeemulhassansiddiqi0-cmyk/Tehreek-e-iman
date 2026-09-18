// Darja Sania Books (Complete Canonical Modular Collection)
import { Book } from '../types';
import { hidayatNahwChapters } from './hidayatNahwData';
import { mirqatChapters } from './mirqatData';
import { aqeedahTahawiyyahChapters } from './aqeedahTahawiyyahData';
import { fusoolAkbariChapters } from './fusoolAkbariData';
import { qisasNabiyyeenChapters } from './qisasNabiyyeenData';

export const darjaSaniaBooks: Book[] = [
  {
    id: "hidayat_nahw",
    title: "هِدَايَةُ النَّحْوِ (مُعَرَّبٌ مَعَ حَلِّ التَّرَاكِيبِ النَّحْوِيَّةِ)",
    author: "الشيخ سراج الدين عثمان بن عمر چشتی الحنفي (ت 800ھ)",
    category: "dars_curriculum",
    subject: "nahw",
    subjectNameUrdu: "علم النحو و قواعدِ زبان",
    grade: "درجہ ثانیہ (ثانویہ عامہ سال دوم)",
    darjaKey: "sania",
    darjaUrdu: "درجہ ثانیہ (سال دوم)",
    coverColor: "from-teal-950 via-cyan-900 to-stone-950",
    description: "درسِ نظامی کے دوسرے سال کی سب سے مرکزی نحوی درسی کتاب جس میں علامہ ابن الحاجب کی 'الکافیہ' کے مضامین کو نہایت دلنشین و منظم انداز میں مقدمہ، تین اقسام اور خاتمہ پر تقسیم کیا گیا ہے۔",
    chapters: hidayatNahwChapters
  },
  {
    id: "mirqat",
    title: "مِرْقَاةُ المَنْطِقِ (فِي القَوَاعِدِ المَنْطِقِيَّةِ)",
    author: "العلامة فضل إمام بن محمد أرشد الخير آبادي (ت 1243ھ)",
    category: "dars_curriculum",
    subject: "mantiq",
    subjectNameUrdu: "علم المنطق و قوانینِ استدلال",
    grade: "درجہ ثانیہ (ثانویہ عامہ سال دوم)",
    darjaKey: "sania",
    darjaUrdu: "درجہ ثانیہ (سال دوم)",
    coverColor: "from-slate-950 via-cyan-950 to-stone-950",
    description: "درسِ نظامی میں منطقِ صوری و استدلالی کا عظیم شاہکار، جس میں تصورات، تصدیقات، دلالات، کلیاتِ خمس، قضایا، تناقض، عکس اور اشکالِ اربعہ کے عمیق قواعد درج ہیں۔",
    chapters: mirqatChapters
  },
  {
    id: "aqeedah_tahawiyyah",
    title: "العَقِيدَةُ الطَّحَاوِيَّةُ (مَتْنُ عَقِيدَةِ أَهْلِ السُّنَّةِ وَالجَمَاعَةِ)",
    author: "حجة الإسلام الإمام أبو جعفر أحمد بن محمد الطحاوي الحنفي (ت 321ھ)",
    category: "dars_curriculum",
    subject: "aqaid",
    subjectNameUrdu: "عقائدِ اہل السنت والجماعت",
    grade: "درجہ ثانیہ (ثانویہ عامہ سال دوم)",
    darjaKey: "sania",
    darjaUrdu: "درجہ ثانیہ (سال دوم)",
    coverColor: "from-emerald-950 via-teal-900 to-stone-950",
    description: "اہل السنت والجماعت کے اجماعی عقائد کا سب سے متفقہ اور قدیم ترین درسی متن، جو امام اعظم ابو حنیفہ، امام ابو یوسف اور امام محمد شیبانی رحمہم اللہ کے اصولِ عقائد پر مبنی ہے۔",
    chapters: aqeedahTahawiyyahChapters
  },
  {
    id: "fusool_akbari",
    title: "الفُصُولُ الأَكْبَرِيَّةُ (فِي عِلْمِ الصَّرْفِ وَالتَّصْرِيفِ)",
    author: "الشيخ علي أكبر بن علي الإله آبادي الحنفي (من علماء القرن الحادي عشر)",
    category: "dars_curriculum",
    subject: "sarf",
    subjectNameUrdu: "علم الصرف المتقدم و قوانینِ اعلال",
    grade: "درجہ ثانیہ (ثانویہ عامہ سال دوم)",
    darjaKey: "sania",
    darjaUrdu: "درجہ ثانیہ (سال دوم)",
    coverColor: "from-blue-950 via-indigo-900 to-stone-950",
    description: "علمِ صرف کا وہ بلند پایہ متن جس میں ثلاثی مجرد و مزید کے ابواب، ہفت اقسام، معانیِ ابواب، اور قوانینِ اعلال و ابدال و ادغام کو کمال جامعیت و استقصاء سے مدون کیا گیا ہے۔",
    chapters: fusoolAkbariChapters
  },
  {
    id: "qisas_nabiyyeen",
    title: "قَصَصُ النَّبِيِّينَ لِلأَطْفَالِ (الأَدَبُ العَرَبِيُّ النَّبَوِيُّ)",
    author: "المفكر الإسلامي سماحة الشيخ السيد أبو الحسن علي الحسني الندوي (ت 1420ھ)",
    category: "dars_curriculum",
    subject: "adab",
    subjectNameUrdu: "عربی ادب و قصصِ انبیاء علیہم السلام",
    grade: "درجہ ثانیہ (ثانویہ عامہ سال دوم)",
    darjaKey: "sania",
    darjaUrdu: "درجہ ثانیہ (سال دوم)",
    coverColor: "from-amber-950 via-yellow-900 to-stone-950",
    description: "حضرت مولانا سید ابو الحسن علی ندوی رحمہ اللہ کی وہ شہرۂ آفاق ادبی تالیف جس میں انبیاءِ کرام کے واقعات کو نہایت سلیس، شستہ، فصیح اور دلنشین عربی عبارت میں تحریر فرمایا گیا ہے۔",
    chapters: qisasNabiyyeenChapters
  }
];
