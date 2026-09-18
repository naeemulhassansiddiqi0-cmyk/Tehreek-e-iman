import { copyToClipboardWithTehreekLogo } from '../../utils/clipboardHelper';
import React, { useState, useEffect } from 'react';
import { examRules, modelSolvedPapers } from '../../data/examData';
import { 
  GraduationCap, 
  Award, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  FileCheck2, 
  HelpCircle,
  Copy,
  CheckCheck,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Timer,
  CheckCircle2,
  Printer,
  Eye,
  Layers,
  FileText
} from 'lucide-react';

interface ExamHubViewProps {
  theme: string;
  onBackToDashboard?: () => void;
}

export const ExamHubView: React.FC<ExamHubViewProps> = ({ theme: _theme, onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'papers' | 'simulator' | 'questions'>('rules');
  const [selectedDarjaFilter, setSelectedDarjaFilter] = useState<string>('all');
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Live 3-Hour Simulator State
  const [simQuestionIndex, setSimQuestionIndex] = useState<number>(0);
  const [simTimerSeconds, setSimTimerSeconds] = useState<number>(180 * 60); // 3 Hours (10800 seconds)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [studentAnswer, setStudentAnswer] = useState<string>(() => {
    try {
      return localStorage.getItem('madrasa_mock_exam_answer') || '';
    } catch {
      return '';
    }
  });
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [answerCopied, setAnswerCopied] = useState<boolean>(false);

  // Filtered papers based on darja
  const filteredPapers = selectedDarjaFilter === 'all'
    ? modelSolvedPapers
    : modelSolvedPapers.filter(p => p.darjaKey === selectedDarjaFilter);

  const currentPaper = filteredPapers[selectedPaperIndex] || modelSolvedPapers[0];
  const simQuestion = modelSolvedPapers[simQuestionIndex] || modelSolvedPapers[0];

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && simTimerSeconds > 0) {
      interval = setInterval(() => {
        setSimTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (simTimerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      alert('امتحانی وقت (3 گھنٹے) اختتام پذیر ہو چکا ہے! ماشاء اللہ، اب اپنے جوابی پرچے کا ماڈل حل کے ساتھ موازنہ فرمائیں۔');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, simTimerSeconds]);

  // Auto-save student answer to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('madrasa_mock_exam_answer', studentAnswer);
    } catch {
      // ignore
    }
  }, [studentAnswer]);

  const copyPaperAnswer = async () => {
    if (currentPaper) {
      const fullText = `[سوال]: ${currentPaper.questionTextUrdu}\n\n[ترجمہ]: ${currentPaper.modelAnswer.tarjama}\n\n[اعراب و حل]: ${currentPaper.modelAnswer.iraab}\n\n[تشریح]: ${currentPaper.modelAnswer.tashreeh}`;
      await copyToClipboardWithTehreekLogo(fullText, {
        title: `تحریکِ ایمان امتحانی پرچہ و حل: ${currentPaper.subject}`,
        includeTimestamp: true,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyStudentAnswer = async () => {
    if (studentAnswer) {
      await copyToClipboardWithTehreekLogo(studentAnswer, {
        title: 'تحریکِ ایمان امتحانی جوابی کاپی (طالب علم)',
        includeTimestamp: true,
      });
      setAnswerCopied(true);
      setTimeout(() => setAnswerCopied(false), 2000);
    }
  };

  const insertHeading = (headingText: string) => {
    setStudentAnswer(prev => prev + (prev.length > 0 && !prev.endsWith('\n') ? '\n' : '') + headingText + '\n');
  };

  // Format time as HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timeElapsed = 180 * 60 - simTimerSeconds;
  const progressPercent = Math.min(100, Math.round((timeElapsed / (180 * 60)) * 100));

  const getExamPhase = () => {
    const elapsedMinutes = Math.floor(timeElapsed / 60);
    if (elapsedMinutes <= 15) {
      return { 
        phase: 'مرحلہ اول (پہلے 15 منٹ)', 
        advice: 'تمام پرچہ غور سے پڑھیں اور بہترین یاد والے سوال کا انتخاب کر کے ذہن میں تفصیلی خاکہ بنائیں', 
        badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/30' 
      };
    } else if (elapsedMinutes <= 165) {
      return { 
        phase: 'مرحلہ دوم (درمیانی 150 منٹ)', 
        advice: 'پوری توجہ سے سوالات کے جوابات، سلیس ترجمہ، اعراب اور فقہی و اصولی دلائل تحریر فرمائیں', 
        badgeBg: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30' 
      };
    } else {
      return { 
        phase: 'مرحلہ سوم (آخری 15 منٹ)', 
        advice: 'مکمل پرچے پر نظر ثانی کریں، چھوٹ جانے والے اعراب، سرخیاں اور حوالہ جات درست کریں', 
        badgeBg: 'bg-rose-400/20 text-rose-300 border-rose-400/30' 
      };
    }
  };

  const phaseInfo = getExamPhase();
  const wordCount = studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-700/50">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-nastaliq font-bold text-xs border border-white/20 transition-colors shadow-2xs mb-4 cursor-pointer"
            title="صفحۂ اول پر واپس جائیں"
          >
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-amber-400" />
            <span>‹ واپس صفحۂ اول (ڈیش بورڈ)</span>
          </button>
        )}

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/30">
            <GraduationCap className="w-4 h-4" />
            <span>وفاق المدارس العربیہ پاکستان — امتحانی مرکز و موک ٹیسٹ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-nastaliq leading-relaxed mb-2 text-amber-200">
            امتحانی رہنمائی، حل شدہ ماڈل پیپرز و لائیو امتحان سمیلیٹر
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-nastaliq leading-relaxed font-semibold">
            دورۂ حدیث (بخاری و مسلم)، سابعہ، سادسہ، خامسہ تا اولیٰ اور تخصص کے ماڈل پیپرز اور 3 گھنٹے کے اصل امتحانی ماحول میں پرچہ حل کرنے کی لائیو مشق۔
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-stone-200 dark:border-stone-800 gap-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-nastaliq font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'border-emerald-700 text-emerald-900 dark:text-amber-300 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>پرچہ حل کرنے کے 5 سنہری اصول</span>
        </button>

        <button
          onClick={() => setActiveTab('papers')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-nastaliq font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'papers'
              ? 'border-emerald-700 text-emerald-900 dark:text-amber-300 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-500" />
          <span>ماڈل حل شدہ پرچہ جات (9 درجات)</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-nastaliq font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'simulator'
              ? 'border-amber-400 text-amber-300 bg-amber-400/10 rounded-t-xl font-black ring-1 ring-amber-400/30'
              : 'border-transparent text-stone-500 hover:text-amber-300 dark:text-stone-400'
          }`}
        >
          <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>⏱️ لائیو 3 گھنٹے کا موک امتحان</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-nastaliq font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'border-emerald-700 text-emerald-900 dark:text-amber-300 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>اہم متوقع سوالات بینک</span>
        </button>
      </div>

      {/* Content for Tab 1: Rules */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {examRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-3xl p-6 border shadow-md card-jewel-dark hover:border-amber-400 space-y-4 text-amber-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
                  {rule.category === 'time_management' && <Clock className="w-5 h-5" />}
                  {rule.category === 'presentation' && <Sparkles className="w-5 h-5" />}
                  {rule.category === 'scoring' && <Award className="w-5 h-5" />}
                  {rule.category === 'mistakes' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                </div>
                <h3 className="font-black text-base font-nastaliq text-amber-300">
                  {rule.title}
                </h3>
              </div>

              <p className="text-xs text-emerald-100/90 font-nastaliq leading-relaxed font-semibold">
                {rule.description}
              </p>

              <div className="bg-emerald-950/70 p-4 rounded-2xl border border-emerald-700/60 space-y-2">
                <span className="text-xs font-black text-amber-300 block font-nastaliq">
                  عملی رہنمائی و نکات:
                </span>
                <ul className="space-y-2">
                  {rule.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="text-xs font-nastaliq text-emerald-100 flex items-start gap-2 font-semibold">
                      <span className="text-amber-400 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content for Tab 2: Solved Papers across 9 Darajaat */}
      {activeTab === 'papers' && currentPaper && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Darja Filter Tabs */}
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq block">
              درجہ منتخب فرمائیں:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: `تمام درجات (${modelSolvedPapers.length})` },
                { id: 'samina', label: 'دورۂ حدیث شریف (بخاری، مسلم)' },
                { id: 'sabia', label: 'درجہ سابعہ (ہدایہ)' },
                { id: 'sadisa', label: 'درجہ سادسہ (مشکوٰۃ)' },
                { id: 'khamisa', label: 'درجہ خامسہ (نور الانوار)' },
                { id: 'rabia', label: 'درجہ رابعہ (شرح الوقایہ)' },
                { id: 'salisa', label: 'درجہ ثالثہ (کافیہ)' },
                { id: 'ula', label: 'درجہ اولیٰ (تیسیر المنطق)' },
                { id: 'takhasus', label: 'تخصص فی الافتاء (رسم المفتی)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedDarjaFilter(tab.id);
                    setSelectedPaperIndex(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-bold border transition-all cursor-pointer ${
                    selectedDarjaFilter === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-md font-black ring-2 ring-amber-400/40'
                      : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {filteredPapers.map((paper, idx) => (
              <button
                key={paper.id}
                onClick={() => setSelectedPaperIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-nastaliq font-bold border transition-all cursor-pointer ${
                  selectedPaperIndex === idx
                    ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-amber-200 border-2 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                    : 'card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-800/60 hover:border-amber-400'
                }`}
              >
                {paper.subject} ({paper.year})
              </button>
            ))}
          </div>

          {/* Paper Details Card */}
          <div className="rounded-3xl border-2 border-amber-400/50 p-6 sm:p-8 shadow-2xl board-jewel-emerald space-y-6 text-amber-50">
            
            {/* Paper Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-800/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
                    {currentPaper.board}
                  </span>
                  <span className="text-xs text-emerald-200/80 font-nastaliq font-bold">{currentPaper.grade}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-nastaliq text-amber-300 mt-1">
                  پرچہ: {currentPaper.subject} — سوال نمبر {currentPaper.questionNumber}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const idx = modelSolvedPapers.findIndex(p => p.id === currentPaper.id);
                    if (idx !== -1) setSimQuestionIndex(idx);
                    setActiveTab('simulator');
                  }}
                  className="btn-3d-gold px-3.5 py-1.5 rounded-xl text-stone-950 text-xs font-nastaliq font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Timer className="w-3.5 h-3.5 text-stone-950" />
                  <span>اس سوال کا موک امتحان دیں</span>
                </button>

                <button
                  onClick={copyPaperAnswer}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-700/60 text-xs hover:bg-emerald-900 text-amber-300 font-nastaliq font-bold transition-colors cursor-pointer"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'حل نقل ہو گیا' : 'مکمل حل کاپی کریں'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-amber-950/60 p-5 rounded-2xl border border-amber-400/40 space-y-2 text-amber-100">
              <span className="text-xs font-black text-amber-300 block font-nastaliq">
                اصل امتحانی سوال مع عبارت:
              </span>
              {currentPaper.questionTextArabic && (
                <p className="font-arabic text-xl sm:text-2xl text-amber-200 leading-loose">
                  {currentPaper.questionTextArabic}
                </p>
              )}
              <p className="text-sm font-nastaliq text-emerald-50 whitespace-pre-line leading-relaxed font-semibold">
                {currentPaper.questionTextUrdu}
              </p>
            </div>

            {/* Model Answer Sections */}
            <div className="space-y-5">
              
              {/* Heading 1: Tarjama */}
              <div>
                <h4 className="text-sm font-black text-amber-300 font-nastaliq mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  1. سلیس بامحاورہ ترجمہ:
                </h4>
                <p className="text-sm font-nastaliq text-emerald-100 leading-loose bg-[#021e17] p-4 rounded-xl border border-emerald-800/60 font-semibold">
                  {currentPaper.modelAnswer.tarjama}
                </p>
              </div>

              {/* Heading 2: I'raab & Hal-e-Ibarat */}
              <div>
                <h4 className="text-sm font-black text-amber-300 font-nastaliq mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  2. اعراب اور نحوی و صرفی ترکیب:
                </h4>
                <p className="text-sm font-nastaliq text-emerald-100 leading-loose bg-[#021e17] p-4 rounded-xl border border-emerald-800/60 font-semibold">
                  {currentPaper.modelAnswer.iraab}
                </p>
              </div>

              {/* Heading 3: Detailed Tashreeh & Dalail */}
              <div>
                <h4 className="text-sm font-black text-amber-300 font-nastaliq mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  3. تشریح اور فقہی و اصولی دلائل:
                </h4>
                <p className="text-sm font-nastaliq text-emerald-100 leading-loose bg-[#021e17] p-4 rounded-xl border border-emerald-800/60 whitespace-pre-line font-semibold">
                  {currentPaper.modelAnswer.tashreeh}
                </p>
              </div>

              {/* Heading 4: Fawaid wa Nukat */}
              <div>
                <h4 className="text-sm font-black text-amber-300 font-nastaliq mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  4. فوائد، درسی نکات اور اختلافِ ائمہ:
                </h4>
                <ul className="space-y-1.5 bg-[#021e17] p-4 rounded-xl border border-emerald-800/60">
                  {currentPaper.modelAnswer.fawaidWaNukat.map((nuktah, nIdx) => (
                    <li key={nIdx} className="text-sm font-nastaliq text-emerald-100 flex items-start gap-2 font-semibold">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{nuktah}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examiner's Secret Tip */}
              <div className="bg-gradient-to-r from-emerald-950 to-teal-950 p-4 rounded-2xl border border-amber-400/40">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs font-nastaliq mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>ممتحن کا خفیہ مشورہ برائے 100٪ نمبرات (20 میں سے 20):</span>
                </div>
                <p className="text-xs font-nastaliq text-emerald-100 leading-relaxed font-semibold">
                  {currentPaper.modelAnswer.examinerTips}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Content for Tab 3: LIVE 3-HOUR MOCK EXAM SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Control Cockpit */}
          <div className="rounded-3xl border-2 border-amber-400/60 p-6 bg-gradient-to-r from-emerald-950 via-black to-emerald-950 text-amber-50 shadow-2xl space-y-6">
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-emerald-800/60">
              
              {/* Timer Block */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
                  isTimerRunning 
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.3)]' 
                    : 'bg-emerald-950 border-emerald-700 text-emerald-400'
                }`}>
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs text-emerald-300 font-nastaliq font-bold block">باقی امتحانی وقت (کل 3 گھنٹے):</span>
                  <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-amber-300 drop-shadow-md">
                    {formatTime(simTimerSeconds)}
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {!isTimerRunning ? (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="btn-3d-gold px-5 py-2.5 rounded-xl font-nastaliq font-black text-sm text-stone-950 shadow-lg cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>امتحان شروع کریں</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTimerRunning(false)}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-nastaliq font-black text-sm shadow-lg cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>وقت روکیں (Pause)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setSimTimerSeconds(180 * 60);
                  }}
                  className="px-4 py-2.5 rounded-xl card-jewel-dark text-stone-200 hover:text-amber-200 border border-emerald-700/60 font-nastaliq font-bold text-xs cursor-pointer flex items-center gap-1.5"
                  title="ٹائمر ری سیٹ کریں"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ری سیٹ (3:00)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl card-jewel-dark text-amber-300 border border-amber-400/40 font-nastaliq font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>پرچہ پرنٹ فرمائیں</span>
                </button>
              </div>

            </div>

            {/* Time Phase Guidance Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-nastaliq font-bold">
                <span className={`px-3 py-1 rounded-full border ${phaseInfo.badgeBg} font-black`}>
                  {phaseInfo.phase}
                </span>
                <span className="text-emerald-300">گزر چکا وقت: {Math.floor(timeElapsed / 60)} منٹ ({progressPercent}٪)</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <p className="text-xs font-nastaliq text-emerald-100 font-semibold pt-1">
                💡 <strong className="text-amber-300">امتحانی حکمتِ عملی:</strong> {phaseInfo.advice}
              </p>
            </div>

          </div>

          {/* Question Selection Row */}
          <div className="p-4 rounded-2xl card-jewel-dark border border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq">پرچہ / سوال منتخب فرمائیں:</span>
              <select
                value={simQuestionIndex}
                onChange={(e) => setSimQuestionIndex(Number(e.target.value))}
                className="bg-[#021e17] text-amber-200 border border-amber-400/40 rounded-xl px-3 py-1.5 text-xs font-nastaliq font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer"
              >
                {modelSolvedPapers.map((paper, idx) => (
                  <option key={paper.id} value={idx}>
                    {paper.grade.split('(')[0]} — {paper.subject}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const randomIdx = Math.floor(Math.random() * modelSolvedPapers.length);
                setSimQuestionIndex(randomIdx);
              }}
              className="btn-3d-emerald px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-black text-amber-200 border border-amber-400/40 cursor-pointer"
            >
              🎲 بے ترتیب نیا سوال چنیں (Surprise)
            </button>
          </div>

          {/* Question Statement Box */}
          <div className="rounded-3xl border-2 border-amber-400/50 p-6 bg-gradient-to-r from-amber-950/70 via-[#13241b] to-emerald-950/70 text-amber-100 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-amber-400/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
                  سوال نمبر {simQuestion.questionNumber}
                </span>
                <span className="text-xs text-amber-200 font-nastaliq font-bold">{simQuestion.subject}</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 font-nastaliq font-black border border-emerald-700/60">
                کل نمبرات: 20
              </span>
            </div>

            {simQuestion.questionTextArabic && (
              <p className="font-arabic text-xl sm:text-2xl text-amber-200 leading-loose py-2">
                {simQuestion.questionTextArabic}
              </p>
            )}

            <p className="text-sm font-nastaliq text-emerald-50 whitespace-pre-line leading-relaxed font-semibold">
              {simQuestion.questionTextUrdu}
            </p>
          </div>

          {/* Interactive Student Answer Sheet */}
          <div className="rounded-3xl border-2 border-emerald-700/60 p-6 board-jewel-emerald text-amber-50 shadow-2xl space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-800/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-black font-nastaliq text-amber-300">
                  طالب علم کی جوابی کاپی (آن لائن پرچہ حل کریں)
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs font-nastaliq font-bold">
                <span className="text-emerald-300">الفاظ: <strong className="text-amber-300">{wordCount}</strong></span>
                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> خودکار محفوظ
                </span>
                <button
                  onClick={copyStudentAnswer}
                  className="card-jewel-dark px-2.5 py-1 rounded-lg text-amber-300 border border-emerald-700 hover:border-amber-400 cursor-pointer"
                >
                  {answerCopied ? 'کاپی ہو گیا' : 'کاپی کریں'}
                </button>
              </div>
            </div>

            {/* Quick Headings Insert Bar */}
            <div className="space-y-1.5">
              <span className="text-xs text-amber-300/80 font-nastaliq font-bold">کلک کر کے معیاری سرخی شامل فرمائیں:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '1. سلیس و بامحاورہ ترجمہ:',
                  '2. اعراب اور نحوی و صرفی ترکیب:',
                  '3. تشریح اور فقہی و اصولی دلائل:',
                  '4. اختلافِ ائمہ اور راجح موقف:',
                  '5. خلاصۂ کلام و حاصلِ بحث:',
                ].map((heading, hIdx) => (
                  <button
                    key={hIdx}
                    onClick={() => insertHeading(heading)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/90 text-amber-200 border border-emerald-700/60 hover:border-amber-400 text-xs font-nastaliq font-bold cursor-pointer transition-all active:scale-95"
                  >
                    + {heading}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Answer Pad */}
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="بسم الله الرحمن الرحيم&#10;&#10;یہاں اپنے سوال کا تفصیلی جواب تحریر فرمائیں۔ پہلے سلیس ترجمہ، پھر اعراب و ترکیب، پھر تشریح اور ائمہ احناف کے دلائل تحریر کریں۔ یہ تحریر کمپیوٹر میں خودکار محفوظ رہتی ہے۔"
              rows={14}
              className="w-full p-4 rounded-2xl bg-[#01140e] text-amber-100 placeholder-emerald-300/40 border-2 border-emerald-800/80 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 text-sm font-nastaliq leading-[2.5] shadow-inner transition-all"
            />

            {/* Bottom Actions: Compare with Model Solution */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setIsComparing(!isComparing)}
                className={`px-5 py-2.5 rounded-xl font-nastaliq font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-2 transition-all ${
                  isComparing 
                    ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300' 
                    : 'btn-3d-gold text-stone-950'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{isComparing ? 'ماڈل حل چھپائیں' : 'ماڈل حل کے ساتھ موازنہ فرمائیں (Split View)'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('کیا آپ واقعی اپنی جوابی کاپی صاف کرنا چاہتے ہیں؟')) {
                    setStudentAnswer('');
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-nastaliq cursor-pointer"
              >
                کاپی صاف کریں
              </button>
            </div>

          </div>

          {/* Split Comparison View (Student vs Model) */}
          {isComparing && (
            <div className="rounded-3xl border-2 border-amber-400 p-6 board-jewel-dark space-y-6 text-amber-50 animate-fadeIn">
              <div className="border-b border-amber-400/40 pb-3 flex items-center justify-between">
                <h4 className="text-lg font-black font-nastaliq text-amber-300 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  موازنہ: آپ کی جوابی تحریر بمقابلہ ممتحن کا مثالی حل (20/20 نمبرات)
                </h4>
                <span className="text-xs text-emerald-200 font-nastaliq">دونوں کا تقابل کر کے اپنی کمزوریوں کو دور فرمائیں</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Column 1: Student's Answer */}
                <div className="p-5 rounded-2xl bg-[#021e17] border border-emerald-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                    <span className="text-xs font-black text-amber-300 font-nastaliq">آپ کا لکھا ہوا جواب:</span>
                    <span className="text-xs text-emerald-400 font-nastaliq">{wordCount} الفاظ</span>
                  </div>
                  {studentAnswer.trim() ? (
                    <p className="text-xs sm:text-sm font-nastaliq text-emerald-50 whitespace-pre-line leading-[2.5]">
                      {studentAnswer}
                    </p>
                  ) : (
                    <p className="text-xs text-stone-400 font-nastaliq py-8 text-center">
                      ابھی تک کوئی جواب نہیں لکھا گیا۔ اوپر جوابی کاپی میں تحریر فرمائیں۔
                    </p>
                  )}
                </div>

                {/* Column 2: Official Model Solution */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-[#041d14] border border-amber-400/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-400/30 pb-2">
                    <span className="text-xs font-black text-amber-300 font-nastaliq">وفاق کا مثالی حل (20/20):</span>
                    <span className="text-xs text-amber-200 font-nastaliq font-bold">100٪ مکمل</span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm font-nastaliq leading-relaxed">
                    <div>
                      <strong className="text-amber-300 block mb-1">1. ترجمہ:</strong>
                      <p className="text-emerald-100 bg-black/40 p-3 rounded-xl border border-emerald-900 leading-loose">
                        {simQuestion.modelAnswer.tarjama}
                      </p>
                    </div>

                    <div>
                      <strong className="text-amber-300 block mb-1">2. اعراب و ترکیب:</strong>
                      <p className="text-emerald-100 bg-black/40 p-3 rounded-xl border border-emerald-900 leading-loose">
                        {simQuestion.modelAnswer.iraab}
                      </p>
                    </div>

                    <div>
                      <strong className="text-amber-300 block mb-1">3. تشریح و دلائل:</strong>
                      <p className="text-emerald-100 bg-black/40 p-3 rounded-xl border border-emerald-900 whitespace-pre-line leading-loose">
                        {simQuestion.modelAnswer.tashreeh}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-400/40">
                      <strong className="text-amber-300 block mb-1">💡 ممتحن کی ٹپ:</strong>
                      <p className="text-emerald-200 leading-relaxed">
                        {simQuestion.modelAnswer.examinerTips}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Self Assessment Checklist */}
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 space-y-2">
                <span className="text-xs font-black text-amber-300 block font-nastaliq">
                  خود تشخیصی چیک لسٹ (Self-Assessment):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-nastaliq text-emerald-100 font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-amber-400 rounded" />
                    <span>سلیس و فصیح ترجمہ درج کیا؟</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-amber-400 rounded" />
                    <span>ضروری اعراب و نحوی ترکیب لکھی؟</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-amber-400 rounded" />
                    <span>فقہی و اصولی دلائل واضح کیے؟</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-amber-400 rounded" />
                    <span>احناف کا راجح موقف ثابت کیا؟</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-amber-400 rounded" />
                    <span>واضح اور جلی سرخیاں لگائی ہیں؟</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-amber-400 rounded" />
                    <span>وقت کی 30 منٹ حد میں مکمل ہوا؟</span>
                  </label>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Content for Tab 4: Expected Questions Bank */}
      {activeTab === 'questions' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Bukhari & Hadith Questions */}
            <div className="card-jewel-amber rounded-3xl p-6 border shadow-md space-y-3">
              <h3 className="font-black text-base text-amber-300 font-nastaliq border-b border-amber-700/60 pb-2">
                دورۂ حدیث شریف (بخاری و مسلم)
              </h3>
              <ul className="space-y-2.5 text-xs font-nastaliq text-amber-100 font-semibold leading-relaxed">
                <li>• حدیث 'إنما الأعمال بالنيات' کے تحت امام بخاری کی غرضِ ترجمہ۔</li>
                <li>• مسئلہ رویتِ باری تعالیٰ پر اہل السنۃ اور معتزلہ کے دلائل۔</li>
                <li>• علاماتِ قیامت اور دجال کے احوال پر احادیثِ صحیحین کا خلاصہ۔</li>
                <li>• کتاب المغازی میں غزوۂ بدر اور بیعتِ رضوان کے احکام۔</li>
              </ul>
            </div>

            {/* Hidayah & Fiqh Questions */}
            <div className="card-jewel-emerald rounded-3xl p-6 border shadow-md space-y-3">
              <h3 className="font-black text-base text-emerald-200 font-nastaliq border-b border-emerald-700/60 pb-2">
                درجہ سابعہ و سادسہ (ہدایہ و مشکوٰۃ)
              </h3>
              <ul className="space-y-2.5 text-xs font-nastaliq text-emerald-100 font-semibold leading-relaxed">
                <li>• بیعِ فاسد اور باطل کا بنیادی فرق اور ملکیت کا انتقال۔</li>
                <li>• خیارِ عیب اور خیارِ رؤیت میں دعویٰ ثابت کرنے کی شرائط۔</li>
                <li>• ربا الفضل اور ربا النسیئہ میں اموالِ ستہ کی علت پر مناظرہ۔</li>
                <li>• کتاب النکاح میں کفاءت اور مہرِ مثل کے لازمی اصول۔</li>
              </ul>
            </div>

            {/* Usul & Nahw Questions */}
            <div className="card-jewel-sapphire rounded-3xl p-6 border shadow-md space-y-3">
              <h3 className="font-black text-base text-sky-200 font-nastaliq border-b border-sky-700/60 pb-2">
                خامسہ تا ثانیہ (نور الانوار و کافیہ)
              </h3>
              <ul className="space-y-2.5 text-xs font-nastaliq text-sky-100 font-semibold leading-relaxed">
                <li>• امر کے وجوب، تکرار، اور فور و تراخی کے اصولی دلائل۔</li>
                <li>• خاص، عام، مشترک اور مؤول کی شرعی تعریف اور احکام۔</li>
                <li>• اسم معرب کی اقسامِ ستہ عشر اور اعرابِ تقدیری کا جدول۔</li>
                <li>• غیر منصرف کے اسبابِ تسعہ اور صفت میں منعِ صرف کی شرائط۔</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
