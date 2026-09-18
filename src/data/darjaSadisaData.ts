// Darja Sadisa Books (Complete Canonical Modular Collection)
// Canonical Grade: Thanawiyya Aliya Year 2 (درجہ سادسہ - عالیہ سال دوم)
import { Book } from '../types';
import { nukhbatFikarChapters } from './nukhbatFikarData';
import { sirajiChapters } from './sirajiData';
import { maqamatHaririChapters } from './maqamatHaririData';
import { diwanHamasahChapters } from './diwanHamasahData';

export const darjaSadisaBooks: Book[] = [
  {
    id: "nukhbat_fikar",
    title: "نُخْبَةُ الفِكَرِ فِي مُصْطَلَحِ أَهْلِ الأَثَرِ",
    author: "الإمام الحافظ شهاب الدين أحمد بن علي بن حجر العسقلاني (ت 852ھ)",
    category: "dars_curriculum",
    subject: "hadith",
    subjectNameUrdu: "اصولِ حدیث و مصطلح الحدیث و جرح و تعدیل",
    grade: "درجہ سادسہ (عالیہ سال دوم)",
    darjaKey: "sadisa",
    darjaUrdu: "درجہ سادسہ (سال ششم)",
    coverColor: "from-amber-950 via-stone-900 to-stone-950",
    description: "علمِ مصطلح الحدیث کی تاریخ کا سب سے دقیق اور محققانہ شاہکار متن، جس میں متواتر و آحاد کی تقسیم، مقبول و مردود کے اسباب، عللِ حدیث اور جرح و تعدیل کے ضوابط کو حصرِ عقلی کے ساتھ مدون کیا گیا ہے۔",
    chapters: nukhbatFikarChapters
  },
  {
    id: "siraji_faraid",
    title: "السِّرَاجِيُّ فِي المَوَارِيثِ (عِلْمُ الفَرَائِضِ الحَنَفِيِّ)",
    author: "العلامة سراج الدين محمد بن محمد بن عبد الرشيد السجاوندي الحنفي (ت 600ھ)",
    category: "dars_curriculum",
    subject: "fiqh",
    subjectNameUrdu: "علم المواریث و الفرائض و حسابِ ترکہ",
    grade: "درجہ سادسہ (عالیہ سال دوم)",
    darjaKey: "sadisa",
    darjaUrdu: "درجہ سادسہ (سال ششم)",
    coverColor: "from-emerald-950 via-amber-950 to-stone-950",
    description: "اسلامی قانونِ وراثت و تقسیمِ ترکہ کا سب سے مستند اور جامع درسی متن، جس میں ذوی الفروض کے احوال، عصبات، حجب، اصولِ مسائل، عول و رد، مناسخات اور ذوی الارحام کے ریاضیاتی مسائل کو حل کیا گیا ہے۔",
    chapters: sirajiChapters
  },
  {
    id: "maqamat_hariri",
    title: "مَقَامَاتُ الحَرِيرِيِّ (الأَدَبُ العَرَبِيُّ الرَّفِيعُ)",
    author: "أبو محمد القاسم بن علي بن محمد الحريري البصري (ت 516ھ)",
    category: "dars_curriculum",
    subject: "adab",
    subjectNameUrdu: "عربی ادبِ عالی، انشاء، بلاغت و امثال",
    grade: "درجہ سادسہ (عالیہ سال دوم)",
    darjaKey: "sadisa",
    darjaUrdu: "درجہ سادسہ (سال ششم)",
    coverColor: "from-purple-950 via-red-950 to-stone-950",
    description: "فصاحت و بلاغت اور فصیح عربی انشاء کا لافانی ادبی شاہکار، جس میں ابو زید سروجی کے خطبات، نثری محاسن، سجع، لغوی و نحوی معمہ جات، اور عبرت آمیز توبہ کو ساحرانہ اسلوب میں پرویا گیا ہے۔",
    chapters: maqamatHaririChapters
  },
  {
    id: "diwan_hamasah",
    title: "دِيوَانُ الحَمَاسَةِ (مَعَ شَرْحِ التِّبْرِيزِيِّ)",
    author: "أمير شعراء العرب أبو تمام حبيب بن أوس الطائي (ت 231ھ)",
    category: "dars_curriculum",
    subject: "adab",
    subjectNameUrdu: "عربی شاعری المتقدمہ و نقدِ شعر",
    grade: "درجہ سادسہ (عالیہ سال دوم)",
    darjaKey: "sadisa",
    darjaUrdu: "درجہ سادسہ (سال ششم)",
    coverColor: "from-red-950 via-amber-950 to-stone-950",
    description: "عربوں کی شجاعت، مروت، زہد، مرثیہ نگاری اور اخلاقِ فاضلہ کے منتخب ترین اشعار کا تاریخی دیوان، جس میں علامہ خطیب تبریزی کی عمیق نحوی و لغوی شرح کے ساتھ کلامِ عرب کے اسرار و معانی کو واشگاف کیا گیا ہے۔",
    chapters: diwanHamasahChapters
  }
];

export { nukhbatFikarChapters } from './nukhbatFikarData';
export { sirajiChapters } from './sirajiData';
export { maqamatHaririChapters } from './maqamatHaririData';
export { diwanHamasahChapters } from './diwanHamasahData';
