import React, { useState } from 'react';
import { X, Award, CheckCircle2, XCircle, RotateCcw, BookOpen } from 'lucide-react';
import { QuizModule, QuizQuestion, saveQuizScore } from '../../data/quizData';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizModule;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  quiz
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  if (!isOpen || !quiz) return null;

  const currentQ: QuizQuestion | undefined = quiz.questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optIndex }));
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsSubmitted(selectedAnswers[currentIndex + 1] !== undefined);
    } else {
      // Calculate score & finish
      setIsFinished(true);
      let correct = 0;
      quiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) correct++;
      });
      const percentage = Math.round((correct / quiz.questions.length) * 100);
      saveQuizScore({
        quizId: quiz.id,
        quizTitle: quiz.titleUrdu,
        score: correct,
        totalQuestions: quiz.questions.length,
        percentage,
        passed: percentage >= quiz.passingScore,
        timestamp: Date.now()
      });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsFinished(false);
  };

  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) correctCount++;
  });
  const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
  const isPassed = scorePercent >= quiz.passingScore;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-emerald-300 dark:border-emerald-700 overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a2f20] to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[11px] font-bold font-nastaliq px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                خود امتحانی جائزہ
              </span>
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h3 className="font-bold font-nastaliq text-base sm:text-lg text-amber-100">
              {quiz.titleUrdu}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* If Finished */}
          {isFinished ? (
            <div className="space-y-6 text-center py-4">
              <div className={`p-6 rounded-2xl border-2 ${
                isPassed ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500'
              }`}>
                <div className="text-3xl font-black font-nastaliq text-emerald-800 dark:text-emerald-300 mb-2">
                  {scorePercent}٪
                </div>
                <h4 className="text-xl font-bold font-nastaliq text-stone-900 dark:text-stone-100">
                  {isPassed ? 'ماشاء اللہ! بہترین کارکردگی' : 'مزید مطالعہ کی ضرورت ہے'}
                </h4>
                <p className="text-xs font-nastaliq text-stone-600 dark:text-stone-300 mt-1">
                  آپ نے {quiz.questions.length.toLocaleString('ur-PK')} میں سے {correctCount.toLocaleString('ur-PK')} سوالات کے درست جواب دیے۔
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-nastaliq font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>دوبارہ حل کریں</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-nastaliq font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  مطالعہ جاری رکھیں
                </button>
              </div>
            </div>
          ) : currentQ && (
            <div className="space-y-4">
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs font-nastaliq text-stone-500 border-b pb-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">
                  سوال {(currentIndex + 1).toLocaleString('ur-PK')} از {quiz.questions.length.toLocaleString('ur-PK')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-800">
                  {currentQ.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <h4 className="text-base sm:text-lg font-bold font-nastaliq text-stone-900 dark:text-stone-100 leading-relaxed">
                {currentQ.questionUrdu}
              </h4>
              {currentQ.questionArabic && (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 font-arabic text-emerald-900 dark:text-emerald-200 text-base font-bold text-center">
                  {currentQ.questionArabic}
                </div>
              )}

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === oIdx;
                  const isCorrect = oIdx === currentQ.correctIndex;

                  let optClass = 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 hover:bg-emerald-50 text-stone-800 dark:text-stone-200';
                  if (isSubmitted) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-950 dark:text-rose-100 font-bold';
                    } else {
                      optClass = 'opacity-50 border-stone-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-right cursor-pointer ${optClass}`}
                    >
                      <span className="font-nastaliq text-sm sm:text-base">{opt}</span>
                      {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {isSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Explanation */}
              {isSubmitted && (
                <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl p-3.5 space-y-1 animate-fadeIn">
                  <div className="text-xs font-bold font-nastaliq text-amber-900 dark:text-amber-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>علمی وضاحت:</span>
                  </div>
                  <p className="font-nastaliq text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  <div className="text-[11px] font-nastaliq text-emerald-800 dark:text-emerald-300 font-bold pt-0.5">
                    📖 مرجع: {currentQ.reference}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isFinished && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/60 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex(prev => prev - 1);
                setIsSubmitted(selectedAnswers[currentIndex - 1] !== undefined);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-bold bg-white dark:bg-slate-800 border text-stone-700 dark:text-stone-300 disabled:opacity-40 cursor-pointer"
            >
              پچھلا سوال
            </button>

            <button
              type="button"
              disabled={selectedAnswers[currentIndex] === undefined}
              onClick={handleNext}
              className="px-5 py-2 rounded-xl text-xs font-nastaliq font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {currentIndex === quiz.questions.length - 1 ? 'امتحان مکمل کریں' : 'اگلا سوال'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
