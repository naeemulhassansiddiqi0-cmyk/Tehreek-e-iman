import React, { useState } from 'react';
import { Scale, CheckCircle2, BookOpen, Search, ArrowRight, ShieldCheck } from 'lucide-react';

interface RulingItem {
  id: string;
  topic: string;
  topicUrdu: string;
  question: string;
  awamRuling: string;
  studentAnalysis: {
    dalilText: string;
    dalilRef: string;
    usulQaidah: string;
  };
  ulamaTahqeeq: {
    comparativeFiqh: string;
    marajea: string[];
    takhrijTahqiq: string;
  };
}

const RULINGS_DATA: RulingItem[] = [
  {
    id: 'taharah-wudu',
    topic: 'Taharah',
    topicUrdu: 'طہارت و وضو',
    question: 'وضو میں اعضاء دھونے کی مسنون ترتیب اور موزوں پر مسح کی مدت کا کیا حکم ہے؟',
    awamRuling: 'عوام الناس کے لیے: وضو میں پہلے ہاتھ، پھر کلی، ناک میں پانی، چہرہ، کہنیوں سمیت ہاتھ، سر کا مسح اور پاؤں دھوئیں۔ چمڑے کے موزوں پر مسح مقیم کے لیے ایک دن رات (24 گھنٹے) اور مسافر کے لیے تین دن رات (72 گھنٹے) جائز ہے۔',
    studentAnalysis: {
      dalilText: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ﴾ [المائدة: 6]',
      dalilRef: 'الہدایہ شرح بدایۃ المبتدی — کتاب الطہارۃ، باب المسح علی الخفین',
      usulQaidah: 'قاعدہ اصولیہ: الواو لمطلق الجمع لا للترتیب عند الحنفیة؛ لہٰذا ترتیب فرضِ قطعی نہیں بلکہ سنتِ مؤکدہ ہے۔'
    },
    ulamaTahqeeq: {
      comparativeFiqh: 'عند الحنفية ترتیب اور موالات سنتِ مؤکدہ ہیں، جبکہ عند الشافعية والحنابلة نیت اور ترتیب دونوں فرائض میں داخل ہیں۔ مالکیہ کے نزدیک دلک اور موالات فرض ہیں۔',
      marajea: ['رد المحتار علی الدر المختار (ابن عابدین) 1/98', 'المبسوط للسرخسی 1/62', 'بدائع الصنائع للکاسانی 1/15'],
      takhrijTahqiq: 'روایتِ مسح: «يَجْعَلُ النَّبِيُّ ﷺ ثَلَاثَةَ أَيَّامٍ وَلَيَالِيهِنَّ لِلْمُسَافِرِ، وَيَوْمًا وَلَيْلَةً لِلْمُقِيمِ» (صحیح مسلم: 276، سنن الترمذی: 95).'
    }
  },
  {
    id: 'salah-qiraat',
    topic: 'Salah',
    topicUrdu: 'نماز و امامت',
    question: 'باجماعت نماز میں مقتدی کے لیے سورۂ فاتحہ پڑھنے کا شرعی حکم کیا ہے؟',
    awamRuling: 'عوام الناس کے لیے: حنفی مسلک کے مطابق مقتدی امام کے پیچھے خاموش رہے گا، امام کی قراءت مقتدی کی قراءت کے قائم مقام ہے؛ سری اور جہری دونوں نمازوں میں مقتدی فاتحہ نہیں پڑھے گا۔',
    studentAnalysis: {
      dalilText: '«مَنْ كَانَ لَهُ إِمَامٌ، فَقِرَاءَةُ الإِمَامِ لَهُ قِرَاءَةٌ» (مسند أحمد، موطا إمام محمد)',
      dalilRef: 'مختصر القدوری — کتاب الصلاۃ، باب صفۃ الصلاۃ',
      usulQaidah: 'قاعدہ: عمومِ قرآنی ﴿وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنْصِتُوا﴾ مقتدی پر خاموشی اور انصات کو لازم کرتا ہے۔'
    },
    ulamaTahqeeq: {
      comparativeFiqh: 'عند الحنفية: قراءت خلف الامام مکروہ تحریمی ہے۔ عند الشافعية: ہر رکعت میں مقتدی پر فاتحہ فرض ہے لقوله ﷺ «لا صلاة لمن لم يقرأ بفاتحة الكتاب». عند المالكية والحنابلة: جہری میں مقتدی خاموش رہے گا، سری میں پڑھنا مستحب ہے۔',
      marajea: ['الہدایہ للمرغینانی 1/54', 'فتح القدیر لابن الہمام 1/338', 'اعلاء السنن للمحدث العثمانی 4/68'],
      takhrijTahqiq: 'حدیثِ جابر «من صلى ركعة لم يقرأ فيها بأم القرآن فلم يصل إلا وراء الإمام» (سنن الترمذی: 313 وقال: حسن صحیح).'
    }
  },
  {
    id: 'zakah-gold',
    topic: 'Zakah',
    topicUrdu: 'زکوٰۃ و صدقات',
    question: 'عورتوں کے مستعمل سونے چاندی کے زیورات پر زکوٰۃ کا وجوب اور نصاب کیا ہے؟',
    awamRuling: 'عوام الناس کے لیے: اگر سونے کا وزن ساڑھے سات تولے یا چاندی کا وزن ساڑھے باون تولے یا اس کی مالیت کے برابر نقدی و سونا مل کر نصاب کو پہنچ جائے اور سال گزر جائے تو 2.5 فیصد (چالیسواں حصہ) زکوٰۃ ادا کرنا واجب ہے۔ مستعمل زیورات پر بھی زکوٰۃ لازم ہے۔',
    studentAnalysis: {
      dalilText: '«فِي الرِّقَةِ رُبُعُ الْعُشْرِ» وقوله ﷺ للمرأة: «أَيَسُرُّكِ أَنْ يُسَوِّرَكِ اللَّهُ بِهِمَا سِوَارَيْنِ مِنْ نَارٍ؟»',
      dalilRef: 'کنز الدقائق — کتاب الزکاۃ، باب زکاۃ الذہب والفضۃ',
      usulQaidah: 'قاعدہ: النماء خلقي في النقدين؛ سونا اور چاندی بالذات نامی ہیں خواہ وہ سکے کی صورت میں ہوں یا زیور کی صورت میں۔'
    },
    ulamaTahqeeq: {
      comparativeFiqh: 'عند الحنفية: سونے چاندی کے تمام زیورات پر عموماً زکوٰۃ واجب ہے خواہ استعمال میں ہوں۔ عند الجمھور (مالک، شافعی، احمد): عورت کے مباح و معتاد زیورات پر زکوٰۃ واجب نہیں کیونکہ وہ قنیہ (ذاتی استعمال) کے قبیل سے ہیں۔',
      marajea: ['المحیط البرہانی 2/385', 'تبیین الحقائق للزیلعی 1/278', 'فتاویٰ ہندیہ 1/178'],
      takhrijTahqiq: 'حدیث عمرو بن شعیب عن ابیہ عن جدہ فی المسکتین: رواہ ابو داود (1563) والنسائی (2479) بسند حسن.'
    }
  },
  {
    id: 'sawm-injections',
    topic: 'Sawm',
    topicUrdu: 'روزہ و اعتکاف',
    question: 'حالتِ روزہ میں ڈرپ، انجکشن یا انہیلر کے استعمال سے روزہ ٹوٹتا ہے یا نہیں؟',
    awamRuling: 'عوام الناس کے لیے: عام عضلاتی یا وریدی انجکشن جو براہِ راست معدے میں غذا کا کام نہ دے اس سے روزہ نہیں ٹوٹتا، البتہ ایسی گلوکوز ڈرپ جو طاقت و تسکینِ بھوک کے لیے ہو وہ مکروہ ہے۔ انہیلر جس میں دوا کے اجزاء حلق میں اترتے ہیں اس سے روزہ فاسد ہو جاتا ہے اور بعد میں قضا لازم ہے۔',
    studentAnalysis: {
      dalilText: '«الفِطْرُ مِمَّا دَخَلَ وَلَيْسَ مِمَّا خَرَجَ» (مصنف ابن أبی شیبہ)',
      dalilRef: 'نور الایضاح — کتاب الصوم، باب ما یفسد الصوم وما لا یفسد',
      usulQaidah: 'مناطِ فساد عند الفقہاء: وصول المفطر إلى الجوف أو الدماغ من منفذ أصلي مفتوح كالحلق والأنف والقبل والدبر.'
    },
    ulamaTahqeeq: {
      comparativeFiqh: 'معاصر فقہی اکیڈمیز (مجمع الفقه الإسلامي الدولي، مجلسِ افتاء پاکستان): انجکشن عضلاتی یا رگی منفذِ مفتوح سے معدے میں نہیں پہنچتا لہٰذا مفسد نہیں۔ بخاخ الربو (انہیلر) میں مادہ دوائیہ کا جوف میں داخل ہونا یقینی ہے لہٰذا مفسد ہے۔ شدید ضرورت میں استعمال کر کے بعد میں قضا کرے۔',
      marajea: ['فتاویٰ عثمانی (مفتی محمد تقی عثمانی) 2/180', 'احسن الفتاویٰ 4/432', 'قرارات مجمع الفقه الإسلامي بجدة رقم 93'],
      takhrijTahqiq: 'اثر ابن عباس رضی اللہ عنہما: «إِنَّمَا الْفِطْرُ مِمَّا دَخَلَ، وَالْوُضُوءُ مِمَّا خَرَجَ» أخرجه البيهقي (4/261) بإسناد صحيح.'
    }
  },
  {
    id: 'buyoo-digital',
    topic: 'Buyoo',
    topicUrdu: 'معاملات و بیوع',
    question: 'آن لائن خرید و فروخت، ڈیجیٹل پیمنٹ اور بیع قبل القبض کا کیا شرعی حکم ہے؟',
    awamRuling: 'عوام الناس کے لیے: آن لائن سامان خریدنا جائز ہے بشرطیکہ سامان کی تمام صفات، قیمت، اور واپسی کی شرائط واضح ہوں۔ مبیع کا مالکانہ قبضہ ملنے سے پہلے آگے نفع پر فروخت کرنا جائز نہیں۔ کیش آن ڈیلیوری اور مصدقہ ڈیجیٹل اکاؤنٹ ٹرانسفر جائز ہے۔',
    studentAnalysis: {
      dalilText: '«نَهَى رَسُولُ اللَّهِ ﷺ عَنْ بَيْعِ مَا لَيْسَ عِنْدَكَ» و«نَهَى عَنْ بَيْعِ الطَّعَامِ حَتَّى يَسْتَوْفِيَهُ»',
      dalilRef: 'شرح الوقایہ — کتاب البیوع، فصل فی شروط البیع',
      usulQaidah: 'قاعدہ: القبض الحکمي (التخلیۃ والتمکین) یقوم مقام القبض الحقیقي فیما لا یشترط فیہ الکیل والوزن.'
    },
    ulamaTahqeeq: {
      comparativeFiqh: 'عند الحنفية: منقولی اشیاء میں قبل القبض بیع باطل/فاسد ہے، اور عقار (غیر منقولی جائیداد) میں ابوحنیفہ و ابویوسف کے ہاں قبل القبض بیع جائز ہے۔ معاصر بیوع میں قبضِ عرفی اور اکاؤنٹ میں کریڈٹ کا آنا قبضِ معتبر مانا گیا ہے۔',
      marajea: ['بحوث فی قضایا فقھیۃ معاصرۃ (مفتی تقی عثمانی) 1/120', 'الہدایہ شرح بدایۃ المبتدی 3/58', 'تکملہ فتح الملہم 1/320'],
      takhrijTahqiq: 'حدیث حکیم بن حزام: «قُلْتُ: يَا رَسُولَ اللَّهِ، يَأْتِينِي الرَّجُلُ فَيُرِيدُ مِنِّي الْبَيْعَ لَيْسَ عِنْدِي... قَالَ: لَا تَبِعْ مَا لَيْسَ عِنْدَكَ» رواہ الترمذی (1232) وصححہ.'
    }
  },
  {
    id: 'nikah-rights',
    topic: 'Nikah',
    topicUrdu: 'نکاح و حقوق الزوجین',
    question: 'عاقلہ بالغہ لڑکی کا بغیر ولی کے نکاح اور مہرِ مثل کے مطالبات کا شرعی حکم کیا ہے؟',
    awamRuling: 'عوام الناس کے لیے: حنفی مذہب میں عاقلہ بالغہ لڑکی کا اپنی مرضی سے کفو (برابر کے خاندان) میں اور مہرِ مثل پر نکاح منعقد ہو جاتا ہے، تاہم اولیاء (والدین) کی رضامندی اور سرپرستی کے بغیر نکاح کرنا اخلاقی و سماجی طور پر سخت ناپسندیدہ ہے۔',
    studentAnalysis: {
      dalilText: '«الأَيِّمُ أَحَقُّ بِنَفْسِهَا مِنْ وَلِيِّهَا» (صحیح مسلم)',
      dalilRef: 'الہدایہ — کتاب النکاح، باب الأولیاء والأکفاء',
      usulQaidah: 'قاعدہ: نفاذ التصرف یعتمد الأهلیة والولایة على النفس؛ البالغة العاقلة حرة التصرف فی مالھا فکذا فی نفسھا.'
    },
    ulamaTahqeeq: {
      comparativeFiqh: 'عند الحنفية: نكاح البالغة العاقلة ینعقد بنفسھا ولو بغیر اذن الولی إذا تروجت بکفء وبمہر المثل. فإن تزوجت بغیر کفو فللأولیاء حق الفسخ عند القاضی. وعند الجمھور (مالک والشافعی وأحمد): النکاح باطل لقوله ﷺ «لا نكاح إلا بولي وشاهدي عدل».',
      marajea: ['فتاویٰ قاضی خان 1/152', 'رد المحتار 3/55', 'المبسوط للسرخسی 5/10'],
      takhrijTahqiq: 'روایتِ ابن عباس: «الأيم أحق بنفسها من وليها، والبكر تستأذن في نفسها وإذنها صماتها» رواه مسلم (1421).'
    }
  }
];

export const AhkamShariatView: React.FC<{ onBackToDashboard?: () => void }> = ({ onBackToDashboard }) => {
  const [activeTier, setActiveTier] = useState<'awam' | 'students' | 'ulama'>('awam');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRulings = RULINGS_DATA.filter(r => {
    const matchTopic = selectedTopic === 'all' || r.id.includes(selectedTopic);
    if (!matchTopic) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.question.toLowerCase().includes(q) ||
      r.awamRuling.toLowerCase().includes(q) ||
      r.topicUrdu.toLowerCase().includes(q) ||
      r.studentAnalysis.usulQaidah.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-stone-50 min-h-screen pb-20" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0d3322] to-emerald-950 text-white border-b-2 border-amber-400/80 py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-6xl mx-auto space-y-4 text-center sm:text-right">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <h1 className="font-nastaliq font-bold text-2xl sm:text-3xl text-amber-200">
                  احکامِ شریعت و فقہی رہنمائی
                </h1>
                <p className="text-xs sm:text-sm text-emerald-200 font-nastaliq">
                  شریعتِ مطہرہ کے مستند فتاویٰ و مسائل — سہ سطحی تقسیم: عوام، طلبۂ درسِ نظامی اور علماء و مفتیانِ کرام
                </p>
              </div>
            </div>

            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-nastaliq font-bold text-xs transition border border-white/20 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>کتب خانہ کی طرف واپسی</span>
              </button>
            )}
          </div>

          {/* Tier Selector Pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTier('awam')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition cursor-pointer border ${
                activeTier === 'awam'
                  ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800'
              }`}
            >
              🌱 عوام الناس کے لیے (سادہ احکام و ہدایات)
            </button>

            <button
              type="button"
              onClick={() => setActiveTier('students')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition cursor-pointer border ${
                activeTier === 'students'
                  ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800'
              }`}
            >
              📚 طلبۂ درسِ نظامی کے لیے (قرآنی و اصولی دلائل)
            </button>

            <button
              type="button"
              onClick={() => setActiveTier('ulama')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition cursor-pointer border ${
                activeTier === 'ulama'
                  ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800'
              }`}
            >
              ⚖️ علماء و مفتیان کے لیے (تقابلی مذاہب و اصل مراجع)
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Filter Bar & Search */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 custom-scrollbar">
            {['all', 'taharah', 'salah', 'zakah', 'sawm', 'buyoo', 'nikah'].map(top => {
              const labels: Record<string, string> = {
                all: 'تمام ابواب',
                taharah: 'طہارت',
                salah: 'نماز',
                zakah: 'زکوٰۃ',
                sawm: 'روزہ',
                buyoo: 'بیوع',
                nikah: 'نکاح'
              };
              const isSel = selectedTopic === top;
              return (
                <button
                  key={top}
                  type="button"
                  onClick={() => setSelectedTopic(top)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold shrink-0 transition cursor-pointer border ${
                    isSel
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {labels[top]}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="مسئلہ یا موضوع تلاش کریں..."
              className="w-full pr-9 pl-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-nastaliq text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>
        </div>

        {/* Rulings Grid */}
        <div className="space-y-5">
          {filteredRulings.map(ruling => (
            <div
              key={ruling.id}
              className="bg-white rounded-3xl border-2 border-emerald-100 p-5 sm:p-6 space-y-4 shadow-sm hover:border-emerald-300 transition"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 font-nastaliq font-bold text-xs border border-emerald-200">
                    {ruling.topicUrdu}
                  </span>
                  <h3 className="font-nastaliq font-bold text-base sm:text-lg text-emerald-950">
                    {ruling.question}
                  </h3>
                </div>
                <span className="text-[11px] font-nastaliq text-stone-400">
                  مذہبِ حنفی معتمد
                </span>
              </div>

              {/* Tier 1: Awam View */}
              {activeTier === 'awam' && (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-nastaliq font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>خلاصۂ حکم برائے عامۃ المسلمین:</span>
                  </div>
                  <p className="font-nastaliq text-stone-800 text-sm leading-loose text-justify">
                    {ruling.awamRuling}
                  </p>
                </div>
              )}

              {/* Tier 2: Dars-e-Nizami Student View */}
              {activeTier === 'students' && (
                <div className="space-y-3 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-200/80">
                  <div className="flex items-center gap-2 text-indigo-950 font-nastaliq font-bold text-xs border-b border-indigo-100 pb-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-700" />
                    <span>تحقیقی جائزہ برائے طلبۂ درسِ نظامی (نص، مرجع و قاعدہ):</span>
                  </div>

                  <div className="space-y-2 text-xs font-nastaliq text-stone-800 leading-relaxed">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <span className="text-indigo-900 font-bold block mb-1">📖 صریح نص / دلیلِ شرعی:</span>
                      <p className="font-arabic text-stone-900 text-sm leading-loose" dir="rtl">
                        {ruling.studentAnalysis.dalilText}
                      </p>
                      <span className="text-[11px] text-stone-500 font-nastaliq mt-1 block">
                        مراجعہ: {ruling.studentAnalysis.dalilRef}
                      </span>
                    </div>

                    <div className="bg-indigo-100/60 p-3 rounded-xl border border-indigo-200">
                      <span className="text-indigo-950 font-bold block mb-0.5">⚖️ قاعدۂ اصولیہ و توجیہ:</span>
                      <p className="text-indigo-950 font-nastaliq">{ruling.studentAnalysis.usulQaidah}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tier 3: Ulama & Muftis View */}
              {activeTier === 'ulama' && (
                <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
                  <div className="flex items-center gap-2 text-amber-950 font-nastaliq font-bold text-xs border-b border-amber-200 pb-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-800" />
                    <span>تخریج، تقابلِ مذاہبِ اربعہ اور فتاویٰ کے امہات المراجع:</span>
                  </div>

                  <div className="space-y-2 text-xs font-nastaliq text-stone-800 leading-relaxed">
                    <div className="bg-white p-3 rounded-xl border border-amber-100">
                      <span className="text-amber-950 font-bold block mb-1">🏛️ فقہِ مقارن (اقوالِ مذاہبِ اربعہ):</span>
                      <p className="text-stone-800 leading-loose">{ruling.ulamaTahqeeq.comparativeFiqh}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-amber-100">
                      <span className="text-amber-950 font-bold block mb-1">📜 تخریج و نقدِ حدیث:</span>
                      <p className="font-arabic text-stone-800 text-xs sm:text-sm leading-loose">{ruling.ulamaTahqeeq.takhrijTahqiq}</p>
                    </div>

                    <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-200">
                      <span className="text-amber-950 font-bold block mb-1">📚 اصل معتمد مراجع و جلد/صفحہ:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-stone-800">
                        {ruling.ulamaTahqeeq.marajea.map((m, mIdx) => (
                          <li key={mIdx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
