// Darja Takhasus fil-Fiqh wal-Ifta Books (Complete Canonical Modular Collection)
// Canonical Stage: Takhasus fil-Fiqh wal-Ifta (تخصص فی الفقہ والافتاء / شعبۂ افتاء بعد الفراغ)
import { Book } from '../types';
import { rasmAlMuftiChapters } from './rasmAlMuftiData';
import { ashbahNazairChapters } from './ashbahNazairData';
import { badaiSanaiChapters } from './badaiSanaiData';
import { fathAlQadirChapters } from './fathAlQadirData';
import { 
  alamgiriChapters, 
  shamiChapters, 
  qazikhanChapters,
  tatarkhaniyaChapters,
  bazzaziyyaChapters,
  fatawaRizviaChapters
} from './fatawaBooksData';

export const darjaTakhasusBooks: Book[] = [
  {
    id: "rasm_al_mufti",
    title: "شَرْحُ عُقُودِ رَسْمِ المُفْتِي",
    author: "خاتمة المحققين الإمام محمد أمين بن عمر عابدين الدمشقي الحنفي (ت 1252ھ)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "اصولِ افتاء، مراتبِ فقہاء، اور ضوابطِ ترجیح",
    grade: "تخصص فی الفقہ والافتاء (شعبہ افتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء (سال اول)",
    coverColor: "from-stone-950 via-slate-900 to-stone-900",
    description: "شعبۂ افتاء کی بنیادی ترین نصابی کتاب جس میں مفتی کے شرائط، آداب، کتبِ ظاہر الروایہ و نوادر، ائمہ احناف کے مابین ترجیح، اور عرف و ضرورت کی بنا پر فتوے کے اصول مدون ہیں۔",
    chapters: rasmAlMuftiChapters
  },
  {
    id: "ashbah_nazair",
    title: "الأَشْبَاهُ وَالنَّظَائِرُ فِي قَوَاعِدِ وَفُرُوعِ فِقْهِ الحَنَفِيَّةِ",
    author: "الإمام زين الدين بن إبراهيم الشهير بابن نجيم المصري الحنفي (ت 970ھ)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "قواعدِ فقہیہ، فروق، اور اشباہ و نظائر",
    grade: "تخصص فی الفقہ والافتاء (شعبہ افتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء (سال اول)",
    coverColor: "from-emerald-950 via-stone-950 to-stone-900",
    description: "اسلامی قانونِ فقہ کے کلی قواعد (الأمور بمقاصدها، اليقين لا يزول بالشك، المشقة تجلب التيسير، الضرر يزال، العادة محكمة) اور باریک فقہی فروق کا سب سے عظیم درسی شاہکار۔",
    chapters: ashbahNazairChapters
  },
  {
    id: "badai_sanai",
    title: "بَدَائِعُ الصَّنَائِعِ فِي تَرْتِيبِ الشَّرَائِعِ",
    author: "ملك العلماء الإمام علاء الدين أبو بكر بن مسعود الكاساني الحنفي (ت 587ھ)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "تعلیلِ فقہی، فلسفۂ شریعت، اور حصرِ عقلی",
    grade: "تخصص فی الفقہ والافتاء (شعبہ افتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء (سال دوم)",
    coverColor: "from-blue-950 via-stone-900 to-stone-950",
    description: "فقہ حنفی کے تمام ابواب کے ارکان، شرائطِ وجوب و صحت، اور اسباب و علل کو حصرِ عقلی کے ساتھ مرتب کرنے والا عالمِ اسلام کا سب سے معتمد اور منطقی فقہی انسائیکلوپیڈیا۔",
    chapters: badaiSanaiChapters
  },
  {
    id: "fath_al_qadir",
    title: "فَتْحُ القَدِيرِ لِلْعَاجِزِ الفَقِيرِ (شَرْحُ الهِدَايَةِ)",
    author: "الإمام المحقق كمال الدين محمد بن عبد الواحد السيواسي السكندري ابن الهمام (ت 861ھ)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "تحقیقِ احادیث، فقہِ مقارن، اور ردِ اعتراضات",
    grade: "تخصص فی الفقہ والافتاء (شعبہ افتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء (سال دوم)",
    coverColor: "from-amber-950 via-red-950 to-stone-950",
    description: "فقہ حنفی کے دلائل کی سب سے بلند پایہ اسنادی و حدیثی تحقیق جس میں ابن الہمام نے ائمہ اربعہ کے دلائل کی گہری چھان بین کر کے مذہبِ احناف کی اصولی برتری ثابت فرمائی۔",
    chapters: fathAlQadirChapters
  },
  {
    id: "alamgiri",
    title: "الفَتَاوَى الهِنْدِيَّةُ (عَالَمْگِيرِي)",
    author: "لَجْنَةٌ مِنْ كِبَارِ عُلَمَاءِ الهِنْدِ بِرِئَاسَةِ الشَّيْخِ نِظَامِ الدِّينِ البَلْخِيِّ (بِأَمْرِ السُّلْطَانِ أَوْرَنكْزِيب عَالَمْگِير)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "فتاویٰ و جزئیاتِ فقہ حنفی",
    grade: "تخصص فی الفقہ والافتاء (شعبہ افتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء",
    coverColor: "from-stone-900 via-amber-950 to-stone-950",
    description: "عالمِ اسلام کا عظیم ترین فقہی و عدالتی انسائیکلوپیڈیا، جس میں فقہ حنفی کے تمام فتاویٰ، نظائر، اور فروعی مسائل کو معتبر ترین کتب کے حوالہ جات کے ساتھ مدون کیا گیا ہے۔",
    chapters: alamgiriChapters
  },
  {
    id: "shami",
    title: "رَدُّ المُحْتَارِ عَلَى الدُّرِّ المُخْتَارِ (فَتَاوَى شَامِي)",
    author: "خاتمة المحققين الإمام محمد أمين بن عمر عابدين الدمشقي الحنفي (ت 1252ھ)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "فتاویٰ و تنقیحِ روایاتِ مفتیٰ بہا",
    grade: "تخصص فی الفقہ والافتاء (دار الافتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء",
    coverColor: "from-amber-950 via-red-950 to-stone-950",
    description: "متاخرین احناف کے مفتیٰ بہ اقوال کی تنقیح کا سب سے معتمد اور مستند ترین مرجع، جس کے بغیر افتاء کا کام مکمل نہیں ہو سکتا۔ مع حواشی علامہ ابن عابدین و تقریراتِ رافعی۔",
    chapters: shamiChapters
  },
  {
    id: "qazikhan",
    title: "فَتَاوَى قَاضِي خَانْ (خَانِيَّة)",
    author: "فخر الدين الإمام الحسن بن منصور بن محمود الأوزجندي الفرغاني الحنفي (ت 592ھ)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "فتاویٰ و ترجیحاتِ ائمہ متقدمین",
    grade: "تخصص فی الفقہ والافتاء (شعبہ افتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء",
    coverColor: "from-stone-950 via-amber-900 to-stone-950",
    description: "فقہ حنفی کے فتاویٰ میں وہ مستند ترین متن جس کے بارے میں علامہ ابن عابدین نے فرمایا کہ اس میں وہی مسائل درج کیے گئے ہیں جو متون و روایاتِ ظاہر میں کثرت سے وقوع پذیر ہوں۔",
    chapters: qazikhanChapters
  },
  {
    id: "tatarkhaniya",
    title: "الفَتَاوَى التَّاتَارْخَانِيَّةُ",
    author: "العلامة المحقق عالم بن علاء الدين الحنفي الإندرپتي الدهلوي (ت 786ھ)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "جامع فتاویٰ و فقہِ ائمہ احناف",
    grade: "تخصص فی الفقہ والافتاء (شعبہ افتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء",
    coverColor: "from-emerald-950 via-stone-950 to-amber-950",
    description: "عہدِ فیروز شاہ تغلق کا عظیم الشان ۲۰ جلدوں پر مشتمل فقہی انسائیکلوپیڈیا جس میں المحیط البرہانی، الہدایہ اور الذخیرہ کے نایاب فتاویٰ کو جمع کیا گیا ہے۔",
    chapters: tatarkhaniyaChapters
  },
  {
    id: "bazzaziyya",
    title: "الفَتَاوَى البَزَّازِيَّةُ (الجَامِعُ الوَجِيزُ)",
    author: "الإمام حافظ الدين محمد بن محمد بن شهاب البزازي الكردري الحنفي (ت 827ھ)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "فتاویٰ و مسائلِ فتاویٰ حنفیہ",
    grade: "تخصص فی الفقہ والافتاء (شعبہ افتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء",
    coverColor: "from-slate-950 via-blue-950 to-stone-950",
    description: "فقہ حنفی کے معتمد فتاویٰ میں ابن البزاز کا شہرۂ آفاق مجموعہ جو فتاویٰ شامی اور فتاویٰ ہندیہ کا سب سے بڑا مرجع و مصدر ہے۔",
    chapters: bazzaziyyaChapters
  },
  {
    id: "fatawa_rizvia",
    title: "الفَتَاوَى الرَّضَوِيَّةُ (العَطَايَا النَّبَوِيَّةُ)",
    author: "مجدد المائة الحاضرة الإمام أحمد رضا خان القادري البريلوي الحنفي (ت 1340ھ)",
    category: "fatawa",
    subject: "fatawa",
    subjectNameUrdu: "جدید فقہی تحقیقات و استنباط",
    grade: "تخصص فی الفقہ والافتاء (دار الافتاء)",
    darjaKey: "takhasus",
    darjaUrdu: "تخصص فی الفقہ والافتاء",
    coverColor: "from-amber-950 via-emerald-950 to-stone-950",
    description: "برصغیر پاک و ہند کا ۳۰ جلدوں پر محیط عظیم ترین فقہی انسائیکلوپیڈیا جس میں کتبِ سابقہ کی نایاب تحقیقات اور جدید عصری مسائل کا فقہِ حنفی کی روشنی میں حل مدون ہے۔",
    chapters: fatawaRizviaChapters
  }
];

export {
  rasmAlMuftiChapters,
  ashbahNazairChapters,
  badaiSanaiChapters,
  fathAlQadirChapters,
  alamgiriChapters,
  shamiChapters,
  qazikhanChapters,
  tatarkhaniyaChapters,
  bazzaziyyaChapters,
  fatawaRizviaChapters
};
