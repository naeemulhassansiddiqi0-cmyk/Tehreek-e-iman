// Darja Sabia Books (Complete Canonical Modular Collection)
// Canonical Grade: Thanawiyya Aliya Year 2 / Alimiyyah Year 1 (درجہ سابعہ - عالمیہ سال اول / موقوف علیہ)
import { Book } from '../types';
import { musallamThubutChapters } from './musallamThubutData';
import { muwattaMuhammadChapters } from './muwattaMuhammadData';
import { shamailTirmidhiChapters } from './shamailTirmidhiData';

export const darjaSabiaBooks: Book[] = [
  {
    id: "musallam_thubut",
    title: "مُسَلَّمُ الثُّبُوتِ فِي أُصُولِ الفِقْهِ (الأُصُولُ العَالِيَةُ)",
    author: "القاضي محب الله بن عبد الشكور البهاري الحنفي (ت 1119ھ)",
    category: "dars_curriculum",
    subject: "usul",
    subjectNameUrdu: "اصولِ فقہ المتقدم و فلسفۂ تشریع و استنباط",
    grade: "درجہ سابعہ (عالمیہ سال اول / موقوف علیہ)",
    darjaKey: "sabia",
    darjaUrdu: "درجہ سابعہ (سال ہفتم / موقوف علیہ)",
    coverColor: "from-slate-950 via-stone-900 to-stone-950",
    description: "اصولِ فقہ کا سب سے دقیق اور عمیق متن جس میں حنفی اور شافعی دونوں ائمہ کے اصولِ استنباط، ترجیحات، فلسفۂ شریعت، اور احکامِ تکلیفیہ و وضعیہ کو فلسفیانہ برہان کے ساتھ یکجا کیا گیا ہے۔ مع فواتح الرحموت بشرح مسلم الثبوت۔",
    chapters: musallamThubutChapters
  },
  {
    id: "muwatta_muhammad",
    title: "مُوَطَّأُ الإِمَامِ مُحَمَّدِ بْنِ الحَسَنِ الشَّيْبَانِيِّ",
    author: "الإمام محمد بن الحسن الشيباني الحنفي (ت 189ھ) عن الإمام مالك بن أنس (ت 179ھ)",
    category: "dars_curriculum",
    subject: "hadith",
    subjectNameUrdu: "حدیث و فقہِ مقارن و دلائلِ احناف",
    grade: "درجہ سابعہ (عالمیہ سال اول / موقوف علیہ)",
    darjaKey: "sabia",
    darjaUrdu: "درجہ سابعہ (سال ہفتم / موقوف علیہ)",
    coverColor: "from-amber-950 via-yellow-950 to-stone-950",
    description: "حدیثِ رسول ﷺ اور آثارِ صحابہ سے فقہ حنفی کے استنباط و ترجیحات کا قدیم ترین اور معتمد ترین شاہکار، جس میں امام محمد امام مالک سے احادیث روایت کر کے ہر مسئلے پر مذہبِ احناف اور اقوالِ صحابہ و تابعین کو مدلل فرماتے ہیں۔ مع التعلیق الممجد للعلامة عبد الحي اللكنوي۔",
    chapters: muwattaMuhammadChapters
  },
  {
    id: "shamail_tirmidhi",
    title: "الشَّمَائِلُ المُحَمَّدِيَّةُ (خَصَائِصُ النَّبِيِّ ﷺ وَأَخْلَاقُهُ)",
    author: "الإمام أبو عيسى محمد بن عيسى بن سورة الترمذي (ت 279ھ)",
    category: "dars_curriculum",
    subject: "hadith",
    subjectNameUrdu: "شمائلِ نبوی، خصائص، اخلاق و عاداتِ مبارکہ",
    grade: "درجہ سابعہ (عالمیہ سال اول / موقوف علیہ)",
    darjaKey: "sabia",
    darjaUrdu: "درجہ سابعہ (سال ہفتم / موقوف علیہ)",
    coverColor: "from-emerald-950 via-teal-950 to-stone-950",
    description: "سید الاولین والآخرین ﷺ کے محاسنِ جلیلہ، اوصافِ حمیدہ، مبارک خلقت، لباس، خور و نوش، کلام، شب بیداری اور زیارتِ خواب پر مشتمل امت کا سب سے محبوب اور متبرک مجموعۂ شمائل۔ مع جمع الوسائل لملا علي القاري ومواهب لدنية للباجوري۔",
    chapters: shamailTirmidhiChapters
  }
];

export {
  musallamThubutChapters,
  muwattaMuhammadChapters,
  shamailTirmidhiChapters
};
