// Darja Salisa Books (Complete Canonical Modular Collection)
// Canonical Grade: Thanawiyya Khasa Year 1 (درجہ ثالثہ)
import { Book } from '../types';
import { usulShashiChapters } from './usulShashiData';
import { duroosBalaghahChapters } from './duroosBalaghahData';
import { sharhTahdhibChapters } from './sharhTahdhibData';
import { fawzKabirChapters } from './alFawzKabirData';

export const darjaSalisaBooks: Book[] = [
  {
    id: "usul_shashi",
    title: "أُصُولُ الشَّاشِيِّ (فِي أُصُولِ الفِقْهِ الحَنَفِيِّ)",
    author: "أبو علي نظام الدين أحمد بن محمد بن إسحاق الشاشي الحنفي (ت 344ھ)",
    category: "dars_curriculum",
    subject: "usul",
    subjectNameUrdu: "اصولِ فقہ حنفی (ابتدائی متن)",
    grade: "درجہ ثالثہ (ثانویہ خاصہ سال اول)",
    darjaKey: "salisa",
    darjaUrdu: "درجہ ثالثہ (سال سوم)",
    coverColor: "from-blue-950 via-indigo-900 to-stone-950",
    description: "اصولِ فقہ کی پہلی باقاعدہ درسی کتاب جس میں ادلہ اربعہ (کتاب، سنت، اجماع، قیاس)، خاص و عام، مشترک و مؤول، حقیقت و مجاز اور امر و نہی کے قواعد کو فقہی تفریعات سے سمجھایا گیا ہے۔",
    chapters: usulShashiChapters
  },
  {
    id: "duroos_balaghah",
    title: "دُرُوسُ البَلَاغَةِ (فِي المَعَانِي وَالبَيَانِ وَالبَدِيعِ)",
    author: "حفني ناصف، محمد دياب، مصطفى طموم، ومحمد سلطان (علماء الأزهر)",
    category: "dars_curriculum",
    subject: "balaghah",
    subjectNameUrdu: "علم البلاغۃ (فصاحت و بلاغت)",
    grade: "درجہ ثالثہ (ثانویہ خاصہ سال اول)",
    darjaKey: "salisa",
    darjaUrdu: "درجہ ثالثہ (سال سوم)",
    coverColor: "from-sky-950 via-blue-900 to-stone-950",
    description: "عربی ادب اور قرآن و حدیث کے اعجاز کو سمجھنے کا درسی متن جس میں فصاحت، بلاغت، تشبیہ، استعارہ، کنایہ اور محسناتِ لفظیہ و معنویہ کو نکھار کر پیش کیا گیا ہے۔",
    chapters: duroosBalaghahChapters
  },
  {
    id: "sharh_tahdhib",
    title: "شَرْحُ التَّهْذِيبِ (فِي المَنْطِقِ وَالكَلاَمِ)",
    author: "العلامة سعد الدين مسعود بن عمر التفتازاني (ت 792ھ)",
    category: "dars_curriculum",
    subject: "mantiq",
    subjectNameUrdu: "علم المنطق المتقدم و فلسفہ",
    grade: "درجہ ثالثہ (ثانویہ خاصہ سال اول)",
    darjaKey: "salisa",
    darjaUrdu: "درجہ ثالثہ (سال سوم)",
    coverColor: "from-slate-900 via-indigo-950 to-stone-950",
    description: "علامہ تفتازانی کا وہ دقیق اور فلسفیانہ منطقی متن جس میں منطق اور کلام کے باہمی امتزاج، تصور و تصدیق کی دقیق تعریفات، اور قیاس کے اشارات کو محققانہ اسلوب میں حل کیا گیا ہے۔",
    chapters: sharhTahdhibChapters
  },
  {
    id: "fawz_kabeer",
    title: "الفَوْزُ الكَبِيرُ فِي أُصُولِ التَّفْسِيرِ",
    author: "الإمام المجدد شاه ولي الله أحمد بن عبد الرحيم الدهلوي (ت 1176ھ)",
    category: "dars_curriculum",
    subject: "tafseer",
    subjectNameUrdu: "اصولِ تفسیر و علومِ قرآن",
    grade: "درجہ ثالثہ (ثانویہ خاصہ سال اول)",
    darjaKey: "salisa",
    darjaUrdu: "درجہ ثالثہ (سال سوم)",
    coverColor: "from-emerald-950 via-teal-900 to-stone-950",
    description: "قرآنی علوم، فہمِ نظمِ قرآن، اور اسالیبِ تفسیر پر حضرت شاہ ولی اللہ محدث دہلوی کا لاجواب شہکار جس میں قرآن مجید کے پانچ بنیادی علوم اور اس کے اعجاز کو آشکار کیا گیا ہے۔",
    chapters: fawzKabirChapters
  }
];

export { usulShashiChapters } from './usulShashiData';
export { duroosBalaghahChapters } from './duroosBalaghahData';
export { sharhTahdhibChapters } from './sharhTahdhibData';
export { fawzKabirChapters } from './alFawzKabirData';
export { kafiyaChapters } from './kafiyaData';
export { kanzChapters } from './kanzDaqaiqData';
