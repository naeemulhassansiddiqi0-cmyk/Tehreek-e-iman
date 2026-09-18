// Darja Higher Books (Complete Canonical Curriculum: Salisa, Rabia, Khamisa, Sadisa, Sabia)
import { Book } from '../types';
import { usulShashiChapters } from './usulShashiData';
import { duroosBalaghahChapters } from './duroosBalaghahData';
import { sharhTahdhibChapters } from './sharhTahdhibData';
import { fawzKabirChapters } from './alFawzKabirData';
import { sharhJamiChapters } from './sharhJamiData';
import { sharhWiqayahChapters } from './sharhWiqayahData';
import { mukhtasarMaaniChapters } from './mukhtasarMaaniData';
import { qutbiChapters } from './qutbiData';
import { sharhAqaidChapters } from './sharhAqaidData';
import { husamiChapters } from './husamiData';
import { riyadhSaliheenChapters } from './riyadhSaliheenData';
import { nukhbatFikarChapters } from './nukhbatFikarData';
import { sirajiChapters } from './sirajiData';
import { maqamatHaririChapters } from './maqamatHaririData';
import { diwanHamasahChapters } from './diwanHamasahData';
import { musallamThubutChapters } from './musallamThubutData';
import { muwattaMuhammadChapters } from './muwattaMuhammadData';
import { shamailTirmidhiChapters } from './shamailTirmidhiData';

export const darjaHigherBooks: Book[] = [
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
  },
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
  },
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
  },
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
