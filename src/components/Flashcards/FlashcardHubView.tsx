import React, { useState } from 'react';
import { flashcardsData, Flashcard } from '../../data/flashcardsData';
import { 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  Shuffle, 
  Brain, 
  Layers, 
  HelpCircle,
  Award,
  Volume2
} from 'lucide-react';

interface FlashcardHubViewProps {
  theme: string;
  onBackToDashboard?: () => void;
}

export const FlashcardHubView: React.FC<FlashcardHubViewProps> = ({ theme: _theme, onBackToDashboard }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [quizInput, setQuizInput] = useState<string>('');
  
  // Track mastered card IDs in localStorage
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('madrasa_mastered_flashcards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const filteredCards: Flashcard[] = activeCategory === 'all'
    ? flashcardsData
    : flashcardsData.filter(c => c.category === activeCategory);

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredCards.length - 1));
  const currentCard = filteredCards[safeIndex] || flashcardsData[0];

  const handleToggleMastered = (cardId: string) => {
    setMasteredIds(prev => {
      const updated = prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId];
      try {
        localStorage.setItem('madrasa_mastered_flashcards', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleNext = () => {
    setIsFlipped(false);
    setQuizInput('');
    if (safeIndex < filteredCards.length - 1) {
      setCurrentIndex(safeIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setQuizInput('');
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setQuizInput('');
    const randomIdx = Math.floor(Math.random() * filteredCards.length);
    setCurrentIndex(randomIdx);
  };

  const speakArabic = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const isCurrentMastered = currentCard ? masteredIds.includes(currentCard.id) : false;
  const masteredCount = filteredCards.filter(c => masteredIds.includes(c.id)).length;
  const progressPercentage = filteredCards.length > 0 ? Math.round((masteredCount / filteredCards.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-[#10291e] to-teal-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-700/50">
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

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <Brain className="w-4 h-4" />
              <span>حفظِ متون، قواعد و اصطلاحات مرکز (Spaced Repetition)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-nastaliq leading-relaxed text-amber-200">
              فلیش کارڈز برائے حفظِ تعریفات و متونِ درسِ نظامی
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-nastaliq leading-relaxed font-semibold">
              نحو، صرف، اصولِ فقہ، مصطلح الحدیث، قواعدِ فقہیہ، منطق اور عقائد کی اہم تعریفات کو 3D فلیش کارڈز اور خود آزمائی کے ذریعے پختہ یاد فرمائیں۔
            </p>
          </div>

          {/* Mastery Progress Badge */}
          <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/40 text-center shrink-0 shadow-lg">
            <span className="text-xs text-emerald-300 font-nastaliq font-bold block">پختہ یاد شدہ کارڈز:</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 my-1">
              {masteredCount} / {filteredCards.length}
            </div>
            <div className="w-32 h-2 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800 mx-auto">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-amber-200/80 font-nastaliq font-bold mt-1 block">
              {progressPercentage}٪ مکمل
            </span>
          </div>
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `تمام علوم (${flashcardsData.length})` },
            { id: 'nahw', label: 'علم النحو' },
            { id: 'sarf', label: 'علم الصرف' },
            { id: 'usul', label: 'اصول الفقہ' },
            { id: 'hadith', label: 'مصطلح الحدیث' },
            { id: 'qawaid', label: 'القواعد الفقہیہ' },
            { id: 'mantiq', label: 'علم المنطق' },
            { id: 'aqaid', label: 'العقائد و الکلام' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-bold border transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-md font-black ring-2 ring-amber-400/40'
                  : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setIsQuizMode(!isQuizMode);
            setIsFlipped(false);
          }}
          className={`px-4 py-1.5 rounded-xl text-xs font-nastaliq font-black border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
            isQuizMode 
              ? 'bg-amber-500 text-stone-950 border-amber-300 ring-2 ring-amber-400/40' 
              : 'card-jewel-dark text-amber-300 border-amber-400/40 hover:border-amber-300'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isQuizMode ? 'عام موڈ پر واپس' : '📝 خود آزمائی موڈ (Quiz Mode)'}</span>
        </button>
      </div>

      {/* Main Flashcard Arena */}
      {currentCard && (
        <div className="space-y-6">
          
          {/* Card Counter & Shuffle Toolbar */}
          <div className="flex items-center justify-between px-2 text-xs font-nastaliq font-bold text-emerald-200">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>کارڈ نمبر: <strong className="text-amber-300 font-mono text-sm">{safeIndex + 1}</strong> از <strong className="text-amber-300 font-mono text-sm">{filteredCards.length}</strong></span>
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShuffle}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg card-jewel-dark text-amber-300 border border-emerald-700 hover:border-amber-400 cursor-pointer shadow-2xs"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>بے ترتیب (Shuffle)</span>
              </button>

              <button
                onClick={() => speakArabic(currentCard.termArabic)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg card-jewel-dark text-emerald-300 border border-emerald-700 hover:border-amber-400 cursor-pointer shadow-2xs"
                title="عربی تلفظ سنیں"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>تلفظ سنیں</span>
              </button>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer group relative min-h-[380px] sm:min-h-[420px] rounded-3xl p-6 sm:p-10 border-2 border-amber-400/50 shadow-2xl transition-all duration-300 hover:border-amber-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)] flex flex-col justify-between overflow-hidden text-amber-50"
            style={{
              background: isFlipped 
                ? 'linear-gradient(135deg, #021a12 0%, #032c1e 50%, #01140e 100%)' 
                : 'linear-gradient(135deg, #0a241a 0%, #0f3829 50%, #061912 100%)'
            }}
          >
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/40">
                  {currentCard.categoryUrdu}
                </span>
                <span className="text-xs text-emerald-200 font-nastaliq font-bold">
                  {currentCard.grade}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isCurrentMastered && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-700 font-nastaliq font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> پختہ یاد
                  </span>
                )}
                <span className="text-xs text-amber-300 font-nastaliq flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-emerald-700/60 group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors font-bold">
                  <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                  {isFlipped ? 'سامنے کا رخ دیکھیں' : 'تعریف و مثال دیکھیں'}
                </span>
              </div>
            </div>

            {/* Middle Content: Front (Term) vs Back (Definition & Rules) */}
            <div className="py-6 space-y-4 relative z-10">
              {!isFlipped ? (
                // FRONT SIDE: Term and Prompt
                <div className="text-center space-y-4 py-8">
                  <span className="text-xs font-black text-emerald-300 font-nastaliq tracking-wide block">
                    اصطلاح / متنِ اصلی:
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black font-arabic text-amber-200 leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    {currentCard.termArabic}
                  </h2>
                  <p className="text-lg sm:text-2xl font-black font-nastaliq text-emerald-50 drop-shadow-sm">
                    ({currentCard.termUrdu})
                  </p>

                  {isQuizMode && (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="max-w-lg mx-auto pt-4 space-y-2 text-right"
                    >
                      <label className="text-xs font-nastaliq font-bold text-amber-300 block">
                        ذہن پر زور ڈال کر تعریف یا مفہوم یہاں لکھیں اور پھر کارڈ الٹ کر موازنہ کریں:
                      </label>
                      <textarea
                        value={quizInput}
                        onChange={(e) => setQuizInput(e.target.value)}
                        placeholder="اپنی یادداشت سے تعریف تحریر فرمائیں..."
                        rows={3}
                        className="w-full p-3 rounded-xl bg-black/60 text-amber-100 placeholder-emerald-300/40 border border-amber-400/40 text-xs font-nastaliq leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  )}
                </div>
              ) : (
                // BACK SIDE: Detailed scholarly breakdown
                <div className="space-y-4 text-right">
                  {/* Arabic Matn Definition */}
                  <div className="bg-black/40 p-4 rounded-2xl border border-amber-400/40 space-y-1">
                    <span className="text-[11px] font-black text-amber-300 font-nastaliq block">
                      عربی تعریف و ضابطہ:
                    </span>
                    <p className="font-arabic text-lg sm:text-xl text-amber-200 leading-loose">
                      {currentCard.definitionArabic}
                    </p>
                  </div>

                  {/* Urdu Explanation */}
                  <div>
                    <span className="text-xs font-black text-amber-300 font-nastaliq block mb-1">
                      سلیس اردو مفہوم و تشریح:
                    </span>
                    <p className="text-xs sm:text-sm font-nastaliq text-emerald-100 leading-[2.4] font-semibold">
                      {currentCard.definitionUrdu}
                    </p>
                  </div>

                  {/* Example */}
                  <div className="bg-[#021e17] p-3.5 rounded-xl border border-emerald-800/80 space-y-1">
                    <span className="text-[11px] font-black text-emerald-300 font-nastaliq block">
                      مثال و شاہدِ قرآنی/حدیثی:
                    </span>
                    <p className="font-arabic text-base text-amber-200 leading-relaxed">
                      {currentCard.exampleArabic}
                    </p>
                    <p className="text-xs font-nastaliq text-emerald-200 font-semibold">
                      {currentCard.exampleUrdu}
                    </p>
                  </div>

                  {/* Golden Rule */}
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-400/30">
                    <p className="text-xs font-nastaliq text-amber-200 leading-relaxed font-semibold">
                      💡 <strong className="text-amber-300">اہم درسی نکتہ:</strong> {currentCard.keyRule}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Hint */}
            <div className="pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300/80 font-nastaliq font-bold relative z-10">
              <span>{isFlipped ? 'کلک کرنے پر واپس آئے گا' : 'کلک کرنے پر تعریف ظاہر ہوگی'}</span>
              <span className="text-amber-400">تحریکِ ایمان تعلیمی و تدریسی ونگ</span>
            </div>
          </div>

          {/* Action Bar Below Card: Master / Review & Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl card-jewel-dark border border-emerald-800/60">
            
            {/* Prev / Next Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="btn-3d-emerald px-4 py-2 rounded-xl text-xs font-nastaliq font-black text-amber-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
                <span>پچھلا کارڈ</span>
              </button>

              <button
                onClick={handleNext}
                className="btn-3d-gold px-5 py-2 rounded-xl text-xs font-nastaliq font-black text-stone-950 cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md"
              >
                <span>اگلا کارڈ</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Mastered Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleMastered(currentCard.id)}
                className={`px-4 py-2 rounded-xl text-xs font-nastaliq font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  isCurrentMastered
                    ? 'bg-emerald-600 text-white border-2 border-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60'
                }`}
              >
                {isCurrentMastered ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Award className="w-4 h-4 text-amber-400" />}
                <span>{isCurrentMastered ? 'ماشاء اللہ، پختہ یاد ہو گیا!' : 'پختہ یاد ہو گیا (مارک کریں)'}</span>
              </button>

              {isCurrentMastered && (
                <button
                  onClick={() => handleToggleMastered(currentCard.id)}
                  className="px-2.5 py-2 rounded-xl bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-800/40 text-xs font-nastaliq cursor-pointer"
                  title="دوبارہ دہرائی کی فہرست میں ڈالیں"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
