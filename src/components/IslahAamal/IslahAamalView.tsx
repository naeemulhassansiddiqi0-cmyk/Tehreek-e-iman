import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle2, Circle, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface AmalTask {
  id: string;
  category: 'prayer' | 'sunnah' | 'azkar' | 'quran' | 'akhlaq';
  categoryUrdu: string;
  title: string;
  desc: string;
  points: number;
}

const AMAL_TASKS: AmalTask[] = [
  // 5 فرض نمازیں
  { id: 'fajr', category: 'prayer', categoryUrdu: 'نماز باجماعت', title: 'نمازِ فجر باجماعت مع تکبیرِ اولیٰ', desc: 'مسجد میں باجماعت ادائیگی اور سنتِ فجر کی حفاظت۔', points: 15 },
  { id: 'zuhr', category: 'prayer', categoryUrdu: 'نماز باجماعت', title: 'نمازِ ظہر باجماعت مع 4 سنتِ قبل', desc: 'ظہر کے چار رکعت سنتِ مؤکدہ اور باجماعت نماز۔', points: 15 },
  { id: 'asr', category: 'prayer', categoryUrdu: 'نماز باجماعت', title: 'نمازِ عصر باجماعت', desc: 'عصر کی بروقت باجماعت ادائیگی اور غفلت سے حفاظت۔', points: 15 },
  { id: 'maghrib', category: 'prayer', categoryUrdu: 'نماز باجماعت', title: 'نمازِ مغرب باجماعت مع اوابین', desc: 'مغرب کے فوراً بعد 6 رکعت صلاۃ الاوابین کی نفل۔', points: 15 },
  { id: 'isha', category: 'prayer', categoryUrdu: 'نماز باجماعت', title: 'نمازِ عشاء باجماعت مع صلاۃ الوتر', desc: 'عشاء کی باجماعت نماز اور حضورِ قلب سے وتر واجب۔', points: 15 },

  // سنن و نوافل
  { id: 'tahajjud', category: 'sunnah', categoryUrdu: 'سنن و نوافل', title: 'صلاۃ التہجد (کم از کم ۲ تا ۸ رکعت)', desc: 'آخری تہائی رات میں اللہ کے حضور گریہ و زاری۔', points: 20 },
  { id: 'ishraq', category: 'sunnah', categoryUrdu: 'سنن و نوافل', title: 'صلاۃ الاشراق و چاشت (ضحیٰ)', desc: 'طلوعِ آفتاب کے 15 منٹ بعد 2 یا 4 رکعت نفل۔', points: 10 },
  { id: 'miswak', category: 'sunnah', categoryUrdu: 'سنن و نوافل', title: 'ہر وضو کے ساتھ مسواک کا اہتمام', desc: 'منہ کی پاکیزگی اور رب کی خوشنودی کا مجرب ذریعہ۔', points: 10 },

  // قرآن و تلاوت
  { id: 'quran_tilawat', category: 'quran', categoryUrdu: 'تلاوتِ قرآن', title: 'روزانہ کم از کم ۱ پاؤ / ۱ پارہ تلاوت', desc: 'تدبر اور تجوید کے ساتھ کلامِ الٰہی کا باقاعدہ ورد۔', points: 15 },
  { id: 'surah_mulk', category: 'quran', categoryUrdu: 'تلاوتِ قرآن', title: 'سونے سے قبل سورۂ ملک و سورۂ سجدہ', desc: 'عذابِ قبر سے حفاظت کی نبوی ضمانت۔', points: 10 },

  // صبح و شام کے مسنون اذکار
  { id: 'subh_azkar', category: 'azkar', categoryUrdu: 'مسنون اذکار', title: 'صبح کے مسنون اذکار و آیۃ الکرسی', desc: 'صبح کے بعد حرز و امان اور حفاظت کی مسنون دعائیں۔', points: 10 },
  { id: 'sham_azkar', category: 'azkar', categoryUrdu: 'مسنون اذکار', title: 'شام کے مسنون اذکار و 3 قل شریف', desc: 'غروب سے قبل شیاطین اور بلاؤں سے پناہ کی مسنون دعائیں۔', points: 10 },
  { id: 'darood_sharif', category: 'azkar', categoryUrdu: 'مسنون اذکار', title: 'کم از کم ۱۰۰ مرتبہ درودِ پاک', desc: '«اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ» کی کثرت۔', points: 15 },
  { id: 'istighfar_100', category: 'azkar', categoryUrdu: 'مسنون اذکار', title: 'کم از کم ۱۰۰ مرتبہ استغفار', desc: '«أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ»۔', points: 10 },

  // اصلاحِ اخلاق و باطن
  { id: 'no_gheebat', category: 'akhlaq', categoryUrdu: 'حفاظتِ جوارح', title: 'غیبت، جھوٹ اور لایعنی گفتگو سے مکمل پرہیز', desc: 'زبان کی حفاظت اور ہر مومن کی عزت کا احترام۔', points: 15 },
  { id: 'nazr_hifazat', category: 'akhlaq', categoryUrdu: 'حفاظتِ جوارح', title: 'بدنظری اور ناجائز سوشل میڈیا مواد سے بچاؤ', desc: 'آنکھوں کی حفاظت اور قلب کی طہارت۔', points: 15 },
  { id: 'sadqah_daily', category: 'akhlaq', categoryUrdu: 'حفاظتِ جوارح', title: 'روزانہ کچھ نہ کچھ صدقہ و خیرات', desc: 'بلاؤں کو ٹالنے اور غرباء کے تعاون کی نیت سے۔', points: 10 }
];

export const IslahAamalView: React.FC<{ onBackToDashboard?: () => void }> = ({ onBackToDashboard }) => {
  const todayKey = new Date().toISOString().split('T')[0];
  const storageKey = `tehreek_amal_tracker_${todayKey}`;

  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedMap));
    } catch {}
  }, [completedMap, storageKey]);

  const toggleTask = (id: string) => {
    setCompletedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleReset = () => {
    if (window.confirm('کیا آپ آج کے تمام نشان زد اعمال دوبارہ صفر کرنا چاہتے ہیں؟')) {
      setCompletedMap({});
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    }
  };

  const totalPoints = AMAL_TASKS.reduce((acc, t) => acc + t.points, 0);
  const earnedPoints = AMAL_TASKS.reduce((acc, t) => acc + (completedMap[t.id] ? t.points : 0), 0);
  const percentage = Math.round((earnedPoints / totalPoints) * 100);

  const filteredTasks = AMAL_TASKS.filter(t => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  const getScoreFeedback = () => {
    if (percentage >= 85) return { label: 'ممتاز و مبارک (مقامِ احسان)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (percentage >= 60) return { label: 'جید جداً (قابلِ ستائش پیش رفت)', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    if (percentage >= 40) return { label: 'متوسط (مزید محنت و استقامت درکار ہے)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'ابتدائی مرحلہ (آج ہی عزمِ مصمم فرمائیں)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const feedback = getScoreFeedback();

  return (
    <div className="bg-stone-50 min-h-screen pb-20" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0a2f1e] to-emerald-950 text-white border-b-2 border-amber-400/80 py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-6xl mx-auto space-y-4 text-center sm:text-right">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                <Heart className="w-5 h-5" />
              </span>
              <div>
                <h1 className="font-nastaliq font-bold text-2xl sm:text-3xl text-amber-200">
                  اصلاحِ اعمال و روزمرہ محاسبۂ نفس
                </h1>
                <p className="text-xs sm:text-sm text-emerald-200 font-nastaliq">
                  طریقۂ سلف صالحین و اکابرینِ امت — روزانہ سونے سے قبل اپنا محاسبہ فرمائیں اور باطن کی اصلاح کو دائمی بنائیں۔
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 font-nastaliq font-bold text-xs transition border border-rose-700 cursor-pointer"
                title="آج کا چارٹ دوبارہ صفر کریں"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ری سیٹ</span>
              </button>

              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-nastaliq font-bold text-xs transition border border-white/20 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>کتب خانہ</span>
                </button>
              )}
            </div>
          </div>

          {/* Daily Muhasabah Score Card */}
          <div className="bg-emerald-900/70 border border-emerald-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-xs font-nastaliq text-emerald-200 font-bold block">
                آج کا حاصل کردہ روحانی سکور (تاریخ: {new Date().toLocaleDateString('ur-PK')})
              </span>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-mono text-3xl font-black text-amber-300">
                  {earnedPoints} / {totalPoints}
                </span>
                <span className="text-xs font-nastaliq text-stone-300">پوائنٹس ({percentage}%)</span>
              </div>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-nastaliq font-bold border mt-1 ${feedback.color}`}>
                {feedback.label}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-72 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-nastaliq text-emerald-200">
                <span>تکمیل کی شرح</span>
                <span className="font-mono font-bold text-amber-300">{percentage}%</span>
              </div>
              <div className="w-full h-3 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar justify-start sm:justify-center">
          {[
            { id: 'all', label: 'تمام اعمالِ روزمرہ' },
            { id: 'prayer', label: 'نماز باجماعت' },
            { id: 'sunnah', label: 'سنن و نوافل' },
            { id: 'quran', label: 'تلاوتِ قرآن' },
            { id: 'azkar', label: 'مسنون اذکار' },
            { id: 'akhlaq', label: 'حفاظتِ جوارح و اخلاق' }
          ].map(c => {
            const isSel = activeCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold shrink-0 transition cursor-pointer border ${
                  isSel
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-700/30'
                    : 'bg-white hover:bg-emerald-50 text-stone-700 border-gray-200'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
            const isDone = Boolean(completedMap[task.id]);
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer select-none flex items-start justify-between gap-3.5 shadow-2xs ${
                  isDone
                    ? 'bg-emerald-50/90 border-emerald-400 shadow-xs'
                    : 'bg-white hover:bg-stone-50 border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-nastaliq font-bold border ${
                      isDone ? 'bg-emerald-200 text-emerald-900 border-emerald-300' : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      {task.categoryUrdu}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      +{task.points} پوائنٹس
                    </span>
                  </div>

                  <h3 className={`font-nastaliq font-bold text-base leading-snug transition ${
                    isDone ? 'text-emerald-950 line-through decoration-emerald-600/60' : 'text-stone-900'
                  }`}>
                    {task.title}
                  </h3>

                  <p className="font-nastaliq text-xs text-stone-500 leading-relaxed">
                    {task.desc}
                  </p>
                </div>

                {/* Checkbox Icon */}
                <div className="shrink-0 pt-1">
                  {isDone ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-5 h-5 fill-white text-emerald-700" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-stone-300 hover:border-emerald-600 flex items-center justify-center text-stone-300 transition">
                      <Circle className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Spiritual Advice Banner from Akabir */}
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2 text-right">
          <div className="flex items-center gap-2 text-amber-950 font-nastaliq font-bold text-sm border-b border-amber-200 pb-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>نصیحتِ اکابرین و مرشدین:</span>
          </div>
          <p className="font-nastaliq text-xs sm:text-sm text-stone-800 leading-loose text-justify">
            حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ فرماتے ہیں: «طالبِ علم کا سب سے بڑا سرمایہ اس کا وقت اور باطنی پاکیزگی ہے۔ جس طالب علم کی نمازیں باجماعت اور معمولاتِ ذکر و تلاوت پابندی سے ادا ہوں، اللہ تعالیٰ اس کے ذہن کو علم کے حقائق کے لیے کھول دیتا ہے۔ روزانہ سونے سے قبل کم از کم دو منٹ محاسبہ کیجیے کہ آج کے دن میں اللہ کا کتنا شکر ادا کیا اور کہاں لغزش ہوئی۔»
          </p>
        </div>
      </div>
    </div>
  );
};
