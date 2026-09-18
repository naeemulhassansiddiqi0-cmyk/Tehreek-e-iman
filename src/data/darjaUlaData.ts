import { Book } from '../types';
import { nahwMirChapters } from './nahwMirData';
import { sarfMirChapters } from './sarfMirData';
import { ilmSeeghahChapters } from './ilmSeeghahData';
import { malaBuddaChapters } from './malaBuddaData';
import { nurIdahChapters } from './nurIdahData';
import { tayseerMantiqChapters } from './tayseerMantiqData';
import { qiraahWadihahChapters } from './qiraahWadihahData';
import { seeratKhatamChapters } from './seeratKhatamData';

export const darjaUlaBooks: Book[] = [
  {
    id: "nahw_mir",
    title: "نَحْوُ مِير (مَعَ حَلِّ التَّرَاكِيبِ النَّحْوِيَّةِ)",
    author: "السيد الشريف مير علي بن محمد الجرجاني (ت 816ھ)",
    category: "dars_curriculum",
    subject: "nahw",
    subjectNameUrdu: "علم النحو (مبادیات و قواعد)",
    grade: "درجہ اولیٰ (ثانویہ عامہ سال اول)",
    darjaKey: "ula",
    darjaUrdu: "درجہ اولیٰ (سال اول)",
    coverColor: "from-emerald-950 via-teal-900 to-stone-950",
    description: "درسِ نظامی کا سب سے پہلا اور بنیادی ترین متن جس میں کلمہ، کلام، اسم، فعل اور حرف کی شناخت اور بنیادی نحوی تراکیب کو کمال سلاست سے مدون کیا گیا ہے۔",
    chapters: nahwMirChapters
  },
  {
    id: "sarf_mir",
    title: "صَرْفُ مِير (مَعَ أَوْزَانِ الأَبْوَابِ وَالتَّصْرِيفِ)",
    author: "السيد الشريف مير علي بن محمد الجرجاني (ت 816ھ)",
    category: "dars_curriculum",
    subject: "sarf",
    subjectNameUrdu: "علم الصرف (اوزان و گردانیں)",
    grade: "درجہ اولیٰ (ثانویہ عامہ سال اول)",
    darjaKey: "ula",
    darjaUrdu: "درجہ اولیٰ (سال اول)",
    coverColor: "from-teal-950 via-emerald-900 to-stone-950",
    description: "علم الصرف کی ابتدائی ترین کتاب جس میں حروف کے اوزان، شش اقسام، ہفت اقسام، اور افعال و ضمائر کی گردانوں کا نقشہ نہایت جامعیت سے پیش کیا گیا ہے۔",
    chapters: sarfMirChapters
  },
  {
    id: "ilm_seeghah",
    title: "عِلْمُ الصِّيغَةِ (مَعَ تَعْلِيلَاتِ الصَّرْفِ)",
    author: "المفتي عنايت أحمد الكاكوروي (ت 1279ھ)",
    category: "dars_curriculum",
    subject: "sarf",
    subjectNameUrdu: "علم الصرف (تعلیلات و قوانینِ صرفیہ)",
    grade: "درجہ اولیٰ (ثانویہ عامہ سال اول)",
    darjaKey: "ula",
    darjaUrdu: "درجہ اولیٰ (سال اول)",
    coverColor: "from-teal-950 to-emerald-950",
    description: "صرفی تعلیلات، ابدال اور ادغام کے قوانین کا معتبر ترین متن جس کے بغیر عربی افعال کی گتھیاں اور گردانیں حل نہیں ہو سکتیں۔",
    chapters: ilmSeeghahChapters
  },
  {
    id: "mala_budda",
    title: "مَالَا بُدَّ مِنْهُ (فِقْهُ الفَرَائِضِ وَالأَحْكَامِ)",
    author: "القاضي ثناء الله الباني بتي الحنفي (ت 1225ھ)",
    category: "dars_curriculum",
    subject: "fiqh",
    subjectNameUrdu: "فقہ حنفی (ضروری احکام و عقائد)",
    grade: "درجہ اولیٰ (ثانویہ عامہ سال اول)",
    darjaKey: "ula",
    darjaUrdu: "درجہ اولیٰ (سال اول)",
    coverColor: "from-stone-900 to-amber-950",
    description: "حضرت قاضی ثناء اللہ پانی پتی رحمہ اللہ کا وہ مشہور رسالہ جس میں ہر مسلمان کے لیے روزمرہ کے لازمی عقائد، طہارت، نماز اور معاملات کے احکام جمع کیے گئے ہیں۔",
    chapters: malaBuddaChapters
  },
  {
    id: "nur_idah",
    title: "نُورُ الإِيضَاحِ وَنَجَاةُ الأَرْوَاحِ",
    author: "الشيخ حسن بن عمار الشرنبلالي الحنفي (ت 1069ھ)",
    category: "dars_curriculum",
    subject: "fiqh",
    subjectNameUrdu: "فقہ حنفی (عبادات و طہارت)",
    grade: "درجہ اولیٰ (ثانویہ عامہ سال اول)",
    darjaKey: "ula",
    darjaUrdu: "درجہ اولیٰ (سال اول)",
    coverColor: "from-emerald-900 to-teal-950",
    description: "فقہِ حنفی میں عبادات (طہارت، نماز، جنازہ، روزہ اور اعتکاف) کا سب سے مقبول، سلیس اور مستند متن جس پر عالمِ اسلام کے مدارس کا اتفاق ہے۔",
    chapters: nurIdahChapters
  },
  {
    id: "tayseer_mantiq",
    title: "تَيْسِيرُ المَنْطِقِ (مَبَادِئُ التَّفْكِيرِ الصَّحِيحِ)",
    author: "مولانا عبد الله الدامني (رحمه الله)",
    category: "dars_curriculum",
    subject: "mantiq",
    subjectNameUrdu: "علم المنطق (مبادیات و اصطلاحات)",
    grade: "درجہ اولیٰ (ثانویہ عامہ سال اول)",
    darjaKey: "ula",
    darjaUrdu: "درجہ اولیٰ (سال اول)",
    coverColor: "from-indigo-950 via-slate-900 to-stone-950",
    description: "منطق کی سب سے آسان اور عام فہم درسی کتاب جس میں تصور، تصدیق، کلیاتِ خمسہ، تعریفات اور قیاس کے قواعد اردو زبان و عربی اصطلاحات میں سکھائے گئے ہیں۔",
    chapters: tayseerMantiqChapters
  },
  {
    id: "qiraah_wadihah",
    title: "القِرَاءَةُ الوَاضِحَةُ (الجُزْءُ الأَوَّلُ وَالثَّانِي)",
    author: "الشيخ وحيد الزمان الكيرانوي (ت 1415ھ)",
    category: "dars_curriculum",
    subject: "adab",
    subjectNameUrdu: "عربی ادب و انشاء (ابتدائی اسباق)",
    grade: "درجہ اولیٰ (ثانویہ عامہ سال اول)",
    darjaKey: "ula",
    darjaUrdu: "درجہ اولیٰ (سال اول)",
    coverColor: "from-sky-950 via-blue-900 to-stone-950",
    description: "عربی زبان کے روزمرہ مکالمات، لطیف حکایات، اور ادبی جملوں پر مشتمل وہ دلنشین کتاب جس سے طلبہ کو عربی عبارت فہمی اور بول چال کی مہارت حاصل ہوتی ہے۔",
    chapters: qiraahWadihahChapters
  },
  {
    id: "seerat_khatam",
    title: "سِيرَةُ خَاتَمِ الأَنْبِيَاءِ ﷺ",
    author: "مفتي الأعظم الشيخ محمد شفيع العثماني (ت 1396ھ)",
    category: "dars_curriculum",
    subject: "seerah",
    subjectNameUrdu: "سیرتِ نبویہ ﷺ (تاریخ و شمائل)",
    grade: "درجہ اولیٰ (ثانویہ عامہ سال اول)",
    darjaKey: "ula",
    darjaUrdu: "درجہ اولیٰ (سال اول)",
    coverColor: "from-amber-950 via-yellow-900 to-stone-950",
    description: "مفتیِ اعظم پاکستان حضرت مولانا مفتی محمد شفیع عثمانی رحمہ اللہ کی وہ بے نظیر تالیف جس میں رسول اللہ ﷺ کی ولادت، نبوت، ہجرت، غزوات اور وفات کو مستند روایات سے لکھا گیا ہے۔",
    chapters: seeratKhatamChapters
  }
];
