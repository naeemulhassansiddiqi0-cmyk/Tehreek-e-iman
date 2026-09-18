// Darja Rabia Books (Complete Canonical Modular Collection)
// Canonical Grade: Thanawiyya Khasa Year 2 (درجہ رابعہ - ثانویہ خاصہ سال دوم)
import { Book } from '../types';
import { sharhJamiChapters } from './sharhJamiData';
import { sharhWiqayahChapters } from './sharhWiqayahData';
import { nuranwarChapters } from './nuranwarData';
import { mukhtasarMaaniChapters } from './mukhtasarMaaniData';
import { qutbiChapters } from './qutbiData';

export const darjaRabiaBooks: Book[] = [
  {
    id: "sharh_jami",
    title: "الفَوَائِدُ الضِّيَائِيَّةُ (شَرْحُ جَامِي عَلَى الكَافِيَةِ)",
    author: "خاتمة المحققين نور الدين عبد الرحمن بن أحمد الجامي (ت 898ھ)",
    category: "dars_curriculum",
    subject: "nahw",
    subjectNameUrdu: "علم النحو العالی و فلسفۂ زبان",
    grade: "درجہ رابعہ (ثانویہ خاصہ سال دوم)",
    darjaKey: "rabia",
    darjaUrdu: "درجہ رابعہ (سال چہارم)",
    coverColor: "from-indigo-950 via-purple-900 to-stone-950",
    description: "علم نحو کی تاریخ کا سب سے عظیم اور عمیق ترین درسی شاہکار، جس میں علامہ ابن الحاجب کی 'الکافیہ' کی ایک ایک ترکیب، اعراب اور فلسفۂ کلام کو نکھار کر پیش کیا گیا ہے۔",
    chapters: sharhJamiChapters
  },
  {
    id: "sharh_wiqayah",
    title: "شَرْحُ الوِقَايَةِ (فِي حَلِّ شَرْحِ الوِقَايَةِ)",
    author: "صدر الشريعة الثاني عبيد الله بن مسعود المحبوبي البخاري (ت 747ھ)",
    category: "dars_curriculum",
    subject: "fiqh",
    subjectNameUrdu: "فقہ حنفی مع دلائلِ عقلیہ و نقلیہ",
    grade: "درجہ رابعہ (ثانویہ خاصہ سال دوم)",
    darjaKey: "rabia",
    darjaUrdu: "درجہ رابعہ (سال چہارم)",
    coverColor: "from-emerald-950 via-teal-900 to-stone-950",
    description: "فقہ حنفی کی مستند ترین اور استدلالی کتاب، جس میں مسائلِ فقہیہ کو ائمہ اربعہ کے باہمی تقابل اور قطعی و ظنی دلائل کی روشنی میں پرکھا گیا ہے۔",
    chapters: sharhWiqayahChapters
  },
  {
    id: "nuranwar",
    title: "نُورُ الأَنْوَارِ فِي شَرْحِ المَنَارِ",
    author: "الشيخ ملا جيون اللكهنوي الحنفي (ت 1130ھ)",
    category: "dars_curriculum",
    subject: "usul",
    subjectNameUrdu: "اصولِ فقہ حنفی (منار الانوار کی شرح)",
    grade: "درجہ رابعہ (ثانویہ خاصہ سال دوم)",
    darjaKey: "rabia",
    darjaUrdu: "درجہ رابعہ (سال چہارم)",
    coverColor: "from-teal-950 via-cyan-950 to-stone-950",
    description: "اصولِ فقہ حنفی کا عظیم درسی متن، جس میں امام نسفی کی 'منار الانوار' کے ادلہ اربعہ، نصوص، امر و نہی اور قیاس کے عمیق اصولوں کی جامع و مستند تشریح کی گئی ہے۔",
    chapters: nuranwarChapters
  },
  {
    id: "mukhtasar_maani",
    title: "مُخْتَصَرُ المَعَانِي (فِي عِلْمِ البَلَاغَةِ)",
    author: "العلامة سعد الدين مسعود بن عمر التفتازاني (ت 792ھ)",
    category: "dars_curriculum",
    subject: "balaghah",
    subjectNameUrdu: "علم البلاغۃ العالیہ (تلخیص المفتاح کی شرح)",
    grade: "درجہ رابعہ (ثانویہ خاصہ سال دوم)",
    darjaKey: "rabia",
    darjaUrdu: "درجہ رابعہ (سال چہارم)",
    coverColor: "from-purple-950 via-indigo-950 to-stone-950",
    description: "بلاغتِ قرآنی اور اسرارِ فصاحت و بلاغت کا بے نظیر درسی شاہکار، جس میں خطیب قزوینی کی 'تلخیص المفتاح' کے دقیق کنایات، استعارات، اور فصل و وصل کو حل کیا گیا ہے۔",
    chapters: mukhtasarMaaniChapters
  },
  {
    id: "qutbi",
    title: "القُطْبِيُّ (تَحْرِيرُ القَوَاعِدِ المَنْطِقِيَّةِ فِي شَرْحِ الرِّسَالَةِ الشَّمْسِيَّةِ)",
    author: "العلامة قطب الدين محمود بن محمد الرازي التحتاني (ت 766ھ)",
    category: "dars_curriculum",
    subject: "mantiq",
    subjectNameUrdu: "علم المنطق العالی و فلسفہ",
    grade: "درجہ رابعہ (ثانویہ خاصہ سال دوم)",
    darjaKey: "rabia",
    darjaUrdu: "درجہ رابعہ (سال چہارم)",
    coverColor: "from-slate-950 via-blue-950 to-stone-950",
    description: "درسِ نظامی میں منطق کی فلسفیانہ کتاب، جس میں تصورات، تصدیقات، اشکالِ اربعہ کے عمیق قوانین اور صنائعِ خمس کو بوعلی سینا کے اصولوں پر حل کیا گیا ہے۔",
    chapters: qutbiChapters
  }
];

export { sharhJamiChapters } from './sharhJamiData';
export { sharhWiqayahChapters } from './sharhWiqayahData';
export { nuranwarChapters } from './nuranwarData';
export { mukhtasarMaaniChapters } from './mukhtasarMaaniData';
export { qutbiChapters } from './qutbiData';
