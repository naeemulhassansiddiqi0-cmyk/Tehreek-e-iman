// Darja Khamisa Books (Complete Canonical Modular Collection)
// Canonical Grade: Thanawiyya Aliya Year 1 (درجہ خامسہ - عالیہ سال اول)
import { Book } from '../types';
import { hidayahChapters } from './hidayahData';
import { sharhAqaidChapters } from './sharhAqaidData';
import { husamiChapters } from './husamiData';
import { riyadhSaliheenChapters } from './riyadhSaliheenData';

export const darjaKhamisaBooks: Book[] = [
  {
    id: "hidayah",
    title: "الهِدَايَةُ شَرْحُ بِدَايَةِ المُبْتَدِي (المُجَلَّدُ الأَوَّلُ وَالثَّانِي)",
    author: "الإمام برهان الدين علي بن أبي بكر المرغيناني الحنفي (ت 593ھ)",
    category: "dars_curriculum",
    subject: "fiqh",
    subjectNameUrdu: "فقہِ مقارن و استدلالی مع دلائلِ ائمہ اربعہ",
    grade: "درجہ خامسہ (عالیہ سال اول)",
    darjaKey: "khamisa",
    darjaUrdu: "درجہ خامسہ (سال پنجم)",
    coverColor: "from-emerald-950 via-teal-950 to-stone-950",
    description: "فقہ حنفی کا سب سے معتبر اور استدلالی شاہکار متن، جس میں عبادات، مناکحات، معاملات اور حدود کے دقیق فروعی مسائل کو ائمہ اربعہ کے مابین تقابلی دلائل اور اصولِ فقہ کی کسوٹی پر پرکھا گیا ہے۔",
    chapters: hidayahChapters
  },
  {
    id: "sharh_aqaid",
    title: "شَرْحُ العَقَائِدِ النَّسَفِيَّةِ (فِي عِلْمِ الكَلَامِ وَأُصُولِ الدِّينِ)",
    author: "العلامة سعد الدين مسعود بن عمر التفتازاني (ت 792ھ)",
    category: "dars_curriculum",
    subject: "aqaid",
    subjectNameUrdu: "علم الکلام و عقائدِ اہل سنت و جماعت ماتریدیہ",
    grade: "درجہ خامسہ (عالیہ سال اول)",
    darjaKey: "khamisa",
    darjaUrdu: "درجہ خامسہ (سال پنجم)",
    coverColor: "from-indigo-950 via-purple-950 to-stone-950",
    description: "امام نجم الدین عمر النسفی کے عقائدِ ماتریدیہ کے متن پر علامہ تفتازانی کی شہرۂ آفاق کلامی شرح جس میں فلاسفہ، معتزلہ، جہمیہ اور مجسمہ کے اعتراضات کا قاطع عقلی و نقلی جواب دیا گیا ہے۔",
    chapters: sharhAqaidChapters
  },
  {
    id: "husami",
    title: "مُنْتَخَبُ الحُسَامِيِّ فِي أُصُولِ الشَّرِيعَةِ",
    author: "الإمام حسام الدين محمد بن محمد بن عمر الأخسيكثي الحنفي (ت 644ھ)",
    category: "dars_curriculum",
    subject: "usul",
    subjectNameUrdu: "اصولِ فقہ حنفی المتقدم (ادلہ اربعہ و استنباط)",
    grade: "درجہ خامسہ (عالیہ سال اول)",
    darjaKey: "khamisa",
    darjaUrdu: "درجہ خامسہ (سال پنجم)",
    coverColor: "from-blue-950 via-slate-900 to-stone-950",
    description: "اصولِ فقہ کا عمیق درسی متن جس میں کتاب، سنت، اجماع اور قیاس کے قوانین، دلالاتِ الفاظ (عبارۃ، اشارۃ، دلالۃ، اقتضاء) اور مسالکِ علت کو حنفی مجتہدین کے اسلوب پر حل کیا گیا ہے۔",
    chapters: husamiChapters
  },
  {
    id: "riyadh_saliheen",
    title: "رِيَاضُ الصَّالِحِينَ مِنْ كَلَامِ سَيِّدِ المُرْسَلِينَ",
    author: "الإمام الحافظ محيي الدين يحيى بن شرف النووي (ت 676ھ)",
    category: "dars_curriculum",
    subject: "hadith",
    subjectNameUrdu: "حدیثِ نبوی المعتمد، اخلاق و تصوف",
    grade: "درجہ خامسہ (عالیہ سال اول)",
    darjaKey: "khamisa",
    darjaUrdu: "درجہ خامسہ (سال پنجم)",
    coverColor: "from-emerald-900 via-green-950 to-stone-950",
    description: "امام نووی کا منتخب ترین احادیثِ صحیحہ کا گراں قدر مجموعہ جس میں اخلاص، توبہ، صبر، صدق، تقویٰ، مراقبہ اور حقوق العباد کے نبوی فرامین کو تشریح اور اعراب کے ساتھ مدون کیا گیا ہے۔",
    chapters: riyadhSaliheenChapters
  }
];

export { hidayahChapters } from './hidayahData';
export { sharhAqaidChapters } from './sharhAqaidData';
export { husamiChapters } from './husamiData';
export { riyadhSaliheenChapters } from './riyadhSaliheenData';
