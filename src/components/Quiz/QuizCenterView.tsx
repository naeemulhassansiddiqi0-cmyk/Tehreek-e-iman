import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Share2, 
  Check, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Timer,
  Layers
} from 'lucide-react';
import { 
  ALL_QUIZZES, 
  QUIZ_CATEGORIES, 
  QuizModule, 
  QuizQuestion, 
  saveQuizScore, 
  getQuizScores, 
  getBestScoreForQuiz,
  QuizScoreRecord 
} from '../../data/quizData';

interface QuizCenterViewProps {
  theme?: string;
  onBackToDashboard?: () => void;
  initialQuizId?: string;
}

export const QuizCenterView: React.FC<QuizCenterViewProps> = ({
  theme: _theme,
  onBackToDashboard,
  initialQuizId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeQuiz, setActiveQuiz] = useState<QuizModule | null>(() => {
    if (initialQuizId) {
      return ALL_QUIZZES.find(q => q.id === initialQuizId) || null;
    }
    return null;
  });

  // Quiz Player State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [recentScores, setRecentScores] = useState<QuizScoreRecord[]>([]);

  // Load scores
  useEffect(() => {
    setRecentScores(getQuizScores());
    const handleScoreUpdate = () => setRecentScores(getQuizScores());
    window.addEventListener('tehreek_quiz_score_saved', handleScoreUpdate);
    return () => window.removeEventListener('tehreek_quiz_score_saved', handleScoreUpdate);
  }, []);

  // Timer effect during active quiz
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (activeQuiz && !quizFinished && isTimerActive) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeQuiz, quizFinished, isTimerActive]);

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    if (selectedCategory === 'all') return ALL_QUIZZES;
    return ALL_QUIZZES.filter(q => q.categoryKey === selectedCategory);
  }, [selectedCategory]);

  const handleStartQuiz = (quiz: QuizModule) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
    setTimerSeconds(0);
    setIsTimerActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentQuestion: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswerSubmitted) return; // cannot change after reveal
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // If next question was already answered, keep state, else reset reveal
      setIsAnswerSubmitted(selectedAnswers[currentQuestionIndex + 1] !== undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Finish Quiz
      finishQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsAnswerSubmitted(selectedAnswers[currentQuestionIndex - 1] !== undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const finishQuiz = () => {
    if (!activeQuiz) return;
    setQuizFinished(true);
    setIsTimerActive(false);

    // Calculate score
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / activeQuiz.questions.length) * 100);
    const passed = percentage >= activeQuiz.passingScore;

    // Save score
    saveQuizScore({
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.titleUrdu,
      score: correctCount,
      totalQuestions: activeQuiz.questions.length,
      percentage,
      passed,
      timestamp: Date.now()
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Score summary calculation
  const calculatedScore = useMemo(() => {
    if (!activeQuiz) return { correct: 0, total: 0, percentage: 0, passed: false };
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    const total = activeQuiz.questions.length;
    const percentage = Math.round((correct / total) * 100);
    return {
      correct,
      total,
      percentage,
      passed: percentage >= activeQuiz.passingScore
    };
  }, [activeQuiz, selectedAnswers]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShareResults = () => {
    if (!activeQuiz) return;
    const gradeText = calculatedScore.percentage >= 90 ? 'ممتاز (A+)' 
      : calculatedScore.percentage >= 80 ? 'جید جداً (A)' 
      : calculatedScore.percentage >= 70 ? 'جید (B)' 
      : calculatedScore.percentage >= 60 ? 'مقبول (C)' : 'اعادہ درکار';

    const textToShare = `【نتیجۂ خود امتحانی جائزہ — تحریکِ ایمان】
📚 امتحان: ${activeQuiz.titleUrdu}
🎯 حاصل کردہ نمبر: ${calculatedScore.correct} از ${calculatedScore.total}
📊 شرح کامیابی: ${calculatedScore.percentage}٪ (${gradeText})
⏱️ وقت: ${formatTimer(timerSeconds)}

🌐 آپ بھی اپنا علمی امتحان لیں: https://tehreek-e-iman.pages.dev`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToShare);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-stone-900 dark:text-stone-100 pb-24 transition-colors">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0a2f20] to-emerald-950 text-white border-b-4 border-amber-400/90 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold font-nastaliq">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>تعلیمی و تشخیصی مرکز • برائے طلبۂ درسِ نظامی و شائقینِ حدیث</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-nastaliq text-amber-200 tracking-tight leading-relaxed">
                خود تشخیصی مرکز و امتحانی کوئز (Quiz & Assessment)
              </h1>
              <p className="text-emerald-100/90 text-xs sm:text-sm max-w-3xl font-nastaliq leading-loose">
                صحیح البخاری کے کبار ابواب، فقہ حنفی کے مسائلِ طہارت و نماز، اور اصولِ حدیث کے مستند سوالات کے ذریعے اپنی علمی استعداد کا خود جائزہ لیں۔ فوری اسکورنگ اور مدلل شروحات۔
              </p>
            </div>

            {/* Back Button / Quick Stats */}
            <div className="flex items-center gap-3 shrink-0">
              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-nastaliq font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>کتب خانہ پر واپس</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-800/60 text-center">
            <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-700/50">
              <div className="text-amber-300 font-bold text-lg sm:text-xl font-nastaliq">
                {ALL_QUIZZES.length.toLocaleString('ur-PK')}
              </div>
              <div className="text-emerald-200 text-xs font-nastaliq">دستیاب امتحانی کوئز</div>
            </div>
            <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-700/50">
              <div className="text-amber-300 font-bold text-lg sm:text-xl font-nastaliq">
                {ALL_QUIZZES.reduce((acc, q) => acc + q.questions.length, 0).toLocaleString('ur-PK')}
              </div>
              <div className="text-emerald-200 text-xs font-nastaliq">کل علمی سوالات مع مراجع</div>
            </div>
            <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-700/50">
              <div className="text-amber-300 font-bold text-lg sm:text-xl font-nastaliq">
                {recentScores.length.toLocaleString('ur-PK')}
              </div>
              <div className="text-emerald-200 text-xs font-nastaliq">آپ کے دیے گئے امتحانات</div>
            </div>
            <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-700/50">
              <div className="text-amber-300 font-bold text-lg sm:text-xl font-nastaliq">
                {recentScores.length > 0 
                  ? `${Math.round(recentScores.reduce((acc, s) => acc + s.percentage, 0) / recentScores.length).toLocaleString('ur-PK')}٪`
                  : '—'}
              </div>
              <div className="text-emerald-200 text-xs font-nastaliq">اوسط کامیابی</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ─────────────────────────────────────────────────────────────────────────────
            VIEW 1: QUIZ FINISHED / SUMMARY RESULTS
        ───────────────────────────────────────────────────────────────────────────── */}
        {activeQuiz && quizFinished && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl space-y-8 animate-fadeIn">
            {/* 1. Score Badge Banner */}
            <div className={`rounded-2xl p-6 sm:p-8 text-center border-2 ${
              calculatedScore.passed 
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-950 dark:text-amber-100'
            }`}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-md border-4 border-amber-400 mb-4">
                <span className="text-2xl font-black font-nastaliq text-emerald-800 dark:text-emerald-300">
                  {calculatedScore.percentage}٪
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-nastaliq">
                {calculatedScore.passed ? 'ماشاء اللہ! مبارک ہو، آپ کامیاب رہے' : 'کوشش اچھی رہی! مزید مطالعہ درکار ہے'}
              </h2>
              <p className="text-sm font-nastaliq mt-2 text-stone-600 dark:text-stone-300">
                آپ نے {activeQuiz.titleUrdu} میں {calculatedScore.total.toLocaleString('ur-PK')} میں سے {calculatedScore.correct.toLocaleString('ur-PK')} درست جوابات دیے۔
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => handleStartQuiz(activeQuiz)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-nastaliq font-bold text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>دوبارہ امتحان دیں</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareResults}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-nastaliq font-bold text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-950" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedShare ? 'نتیجہ کاپی ہو گیا!' : 'نتیجہ شیئر کریں'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuiz(null);
                    setQuizFinished(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-nastaliq font-bold text-sm flex items-center gap-2 transition cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>دوسرا کوئز منتخب کریں</span>
                </button>
              </div>
            </div>

            {/* 2. Detailed Review of All Questions */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-nastaliq border-b pb-2 border-stone-200 dark:border-slate-800 flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>تفصیلی امتحانی جائزہ و مدلل شروحات:</span>
              </h3>

              {activeQuiz.questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div 
                    key={q.id}
                    className={`rounded-2xl p-5 border-2 transition-all ${
                      isCorrect 
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-nastaliq ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </span>
                        <span className="font-bold font-nastaliq text-sm text-stone-500 dark:text-stone-400">
                          سوال {(idx + 1).toLocaleString('ur-PK')} از {activeQuiz.questions.length.toLocaleString('ur-PK')}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-nastaliq bg-stone-200 dark:bg-slate-800 text-stone-700 dark:text-stone-300">
                        {q.difficulty}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold font-nastaliq text-stone-900 dark:text-stone-100 mb-2 leading-relaxed">
                      {q.questionUrdu}
                    </h4>
                    {q.questionArabic && (
                      <p className="font-arabic text-emerald-800 dark:text-emerald-300 text-base font-bold mb-4" dir="rtl">
                        {q.questionArabic}
                      </p>
                    )}

                    {/* Options Breakdown */}
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, optIdx) => {
                        const isThisCorrect = optIdx === q.correctIndex;
                        const isThisUserSelected = optIdx === userAns;

                        let optClass = 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-stone-700 dark:text-stone-300';
                        if (isThisCorrect) {
                          optClass = 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold';
                        } else if (isThisUserSelected && !isThisCorrect) {
                          optClass = 'bg-rose-100 dark:bg-rose-900/60 border-rose-500 text-rose-950 dark:text-rose-100 font-bold';
                        }

                        return (
                          <div 
                            key={optIdx}
                            className={`p-3 rounded-xl border text-sm font-nastaliq flex items-center justify-between gap-3 ${optClass}`}
                          >
                            <span>{opt}</span>
                            {isThisCorrect && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold shrink-0">
                                درست جواب ✓
                              </span>
                            )}
                            {isThisUserSelected && !isThisCorrect && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold shrink-0">
                                آپ کا انتخاب ✗
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Scholarly Explanation */}
                    <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 rounded-xl p-3.5 space-y-1.5 text-right">
                      <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold font-nastaliq text-xs">
                        <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>علمی و فقہی وضاحت:</span>
                      </div>
                      <p className="text-xs sm:text-sm font-nastaliq text-stone-800 dark:text-stone-200 leading-relaxed">
                        {q.explanation}
                      </p>
                      <div className="text-[11px] font-nastaliq text-emerald-800 dark:text-emerald-400 pt-1 font-bold">
                        📖 مرجع: {q.reference}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            VIEW 2: ACTIVE QUIZ RUNNER
        ───────────────────────────────────────────────────────────────────────────── */}
        {activeQuiz && !quizFinished && currentQuestion && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl space-y-6 animate-fadeIn">
            {/* Top Bar: Progress & Timer */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-nastaliq text-emerald-800 dark:text-emerald-400 font-bold">
                  {activeQuiz.titleUrdu}
                </span>
                <div className="text-sm sm:text-base font-bold font-nastaliq text-stone-800 dark:text-stone-200">
                  سوال {(currentQuestionIndex + 1).toLocaleString('ur-PK')} از {activeQuiz.questions.length.toLocaleString('ur-PK')}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
                  <Timer className="w-3.5 h-3.5 text-amber-500" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('کیا آپ واقعی اس امتحان کو منسوخ کر کے واپس جانا چاہتے ہیں؟')) {
                      setActiveQuiz(null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-nastaliq text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition cursor-pointer"
                >
                  منسوخ کریں
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full transition-all duration-300"
                style={{ width: `${Math.round(((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100)}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-nastaliq bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black font-nastaliq text-stone-900 dark:text-stone-100 leading-relaxed text-right">
                {currentQuestion.questionUrdu}
              </h3>

              {currentQuestion.questionArabic && (
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200/80 dark:border-emerald-800 text-center">
                  <p className="font-arabic text-emerald-950 dark:text-emerald-200 text-lg sm:text-xl font-bold leading-loose" dir="rtl">
                    {currentQuestion.questionArabic}
                  </p>
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="space-y-3 pt-3">
                {currentQuestion.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === oIdx;
                  const isCorrect = oIdx === currentQuestion.correctIndex;

                  let optStyles = 'bg-stone-50 dark:bg-slate-800/80 border-stone-200 dark:border-slate-700 hover:bg-emerald-50/60 dark:hover:bg-slate-700 hover:border-emerald-400 text-stone-900 dark:text-stone-100';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optStyles = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-black ring-2 ring-emerald-400/50';
                    } else if (isSelected && !isCorrect) {
                      optStyles = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-950 dark:text-rose-100 font-black ring-2 ring-rose-400/50';
                    } else {
                      optStyles = 'bg-stone-50 dark:bg-slate-800/40 border-stone-200 dark:border-slate-700 text-stone-400 dark:text-stone-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-right cursor-pointer ${optStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected 
                            ? 'bg-emerald-800 text-white' 
                            : 'bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-stone-300'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="font-nastaliq text-base sm:text-lg">
                          {opt}
                        </span>
                      </div>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Feedback Card after selection */}
              {isAnswerSubmitted && (
                <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl p-4 sm:p-5 space-y-2 text-right animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800 pb-2">
                    <span className="font-nastaliq font-bold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>علمی و فقہی تخریج:</span>
                    </span>
                    <span className={`text-xs font-nastaliq font-bold px-2 py-0.5 rounded-full ${
                      selectedAnswers[currentQuestionIndex] === currentQuestion.correctIndex
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedAnswers[currentQuestionIndex] === currentQuestion.correctIndex ? 'درست جواب ✓' : 'غلط جواب ✗'}
                    </span>
                  </div>
                  <p className="font-nastaliq text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-loose">
                    {currentQuestion.explanation}
                  </p>
                  <p className="font-nastaliq text-xs text-emerald-800 dark:text-emerald-300 font-bold pt-1">
                    📖 مراجع: {currentQuestion.reference}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-800 pt-5 gap-3">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={handlePrevQuestion}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 font-nastaliq font-bold text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>پچھلا سوال</span>
              </button>

              <button
                type="button"
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-nastaliq font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>
                  {currentQuestionIndex === activeQuiz.questions.length - 1 ? 'امتحان مکمل کریں' : 'اگلا سوال'}
                </span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            VIEW 3: QUIZ CATALOG / BROWSER
        ───────────────────────────────────────────────────────────────────────────── */}
        {!activeQuiz && (
          <div className="space-y-8">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 sm:px-6 py-2 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-700/30 -translate-y-0.5'
                    : 'bg-white dark:bg-slate-900 text-stone-700 dark:text-stone-300 border border-gray-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
              >
                تمام کتب و ابواب ({ALL_QUIZZES.length})
              </button>
              {QUIZ_CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 sm:px-6 py-2 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-700/30 -translate-y-0.5'
                        : 'bg-white dark:bg-slate-900 text-stone-700 dark:text-stone-300 border border-gray-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.titleUrdu}
                  </button>
                );
              })}
            </div>

            {/* Quizzes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredQuizzes.map(quiz => {
                const bestScore = getBestScoreForQuiz(quiz.id);

                return (
                  <div
                    key={quiz.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold font-nastaliq bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {quiz.badge}
                        </span>

                        {bestScore && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-nastaliq border ${
                            bestScore.passed 
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            بہترین اسکور: {bestScore.percentage}٪
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold font-nastaliq text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors text-right">
                        {quiz.titleUrdu}
                      </h3>

                      {quiz.titleArabic && (
                        <p className="font-arabic text-xs sm:text-sm text-stone-500 dark:text-stone-400 text-right leading-relaxed" dir="rtl">
                          {quiz.titleArabic}
                        </p>
                      )}

                      <p className="font-nastaliq text-xs sm:text-sm text-stone-600 dark:text-stone-300 text-right leading-loose line-clamp-3">
                        {quiz.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-xs text-stone-500 font-nastaliq">
                        {quiz.questions.length.toLocaleString('ur-PK')} کثیر الانتخابی سوالات (MCQs)
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartQuiz(quiz)}
                        className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-nastaliq font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                      >
                        <span>امتحان شروع کریں</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
