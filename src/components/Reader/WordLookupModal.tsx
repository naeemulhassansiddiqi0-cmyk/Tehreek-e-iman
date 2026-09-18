import { copyToClipboardWithTehreekLogo } from '../../utils/clipboardHelper';
import React, { useState, useEffect } from 'react';
import { DictionaryEntry, WordLookupContextInfo } from '../../types';
import { lookupWordComprehensive } from '../../services/lexiconService';
import { 
  BookMarked, 
  X, 
  Search, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  ArrowRight, 
  Layers, 
  GitBranch, 
  CheckCircle2,
  Copy,
  Check,
  Quote,
  Feather
} from 'lucide-react';

interface WordLookupModalProps {
  initialWord: string;
  contextInfo?: WordLookupContextInfo;
  onClose: () => void;
  onSendToAI?: (word: string) => void;
  apiKey?: string;
}

export const WordLookupModal: React.FC<WordLookupModalProps> = ({
  initialWord,
  contextInfo,
  onClose,
  onSendToAI,
  apiKey,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialWord);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const fetchWordData = async (w: string) => {
    if (!w.trim()) return;
    setIsLoading(true);
    try {
      const data = await lookupWordComprehensive(w, apiKey, contextInfo);
      setEntry(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialWord) {
      setSearchTerm(initialWord);
      fetchWordData(initialWord);
    }
  }, [initialWord, contextInfo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchWordData(searchTerm.trim());
    }
  };

  const copyToClipboard = async (text: string) => {
    await copyToClipboardWithTehreekLogo(text, {
      title: 'تحریکِ ایمان قاموس اللغات و لغوی تحقیق',
      includeTimestamp: true,
    });
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2500);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#01140e]/75 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="modal-contrast-card rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.85)] border-3 border-[#d4af37] text-white overflow-hidden my-auto ring-2 ring-amber-400/30">
        
        {/* =========================================================================
            TOP HEADER: Colorful 3D Royal Emerald Navigation & "Back to Book" Button
            ========================================================================= */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#063b2c] to-emerald-950 text-amber-300 p-4 sm:p-5 border-b-2 border-amber-400/60 flex items-center justify-between shadow-xl relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/30 to-amber-600/20 border-2 border-amber-300/70 text-amber-300 flex items-center justify-center shadow-lg shadow-black/40 transform hover:scale-105 transition-transform">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-nastaliq text-amber-200 tracking-wide drop-shadow-sm">
                تحقیقِ مفردات، ترجمۂ سیاقی و ترکیبِ نحوی
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200 font-black font-nastaliq -mt-0.5">
                محلِ اعراب، فاعل و مفعول، وجوہِ تراکیب اور کلمات کی درسی تحقیق
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 3D Tactile Back to Book Header Button */}
            <button 
              onClick={onClose}
              className="btn-3d-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-stone-950 font-black font-nastaliq text-sm sm:text-base cursor-pointer group active:scale-95 transition-transform shadow-lg"
              title="واپس کتاب و مطالعہ پر جائیں (Esc)"
            >
              <ArrowRight className="w-4 h-4 text-stone-950 group-hover:-translate-x-1 transition-transform font-bold" />
              <span>‹ واپس کتاب پر جائیں</span>
            </button>

            {/* Close Cross Button */}
            <button 
              onClick={onClose}
              className="text-amber-300 hover:text-white p-2 rounded-xl hover:bg-white/15 transition-all cursor-pointer border border-transparent hover:border-amber-400/40"
              aria-label="بند کریں"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            MODAL SCROLLABLE BODY - Rich Warm Jewel Gradients (No Stark White)
            ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar bg-gradient-to-b from-[#03261c] via-[#053628] to-[#021c15] text-emerald-50">

          {/* Passage Context Header - Colorful Emerald Jewel Panel */}
          {contextInfo && (
            <div className="card-jewel-emerald p-5 sm:p-6 rounded-3xl border-2 border-emerald-400/80 border-r-[8px] border-r-emerald-300 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b-2 border-emerald-500/40 pb-2.5 text-sm font-nastaliq font-black">
                <div className="flex items-center gap-2 text-amber-200">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-emerald-200">مقامِ عبارت:</span>
                  <span className="text-amber-300 font-black text-base">{contextInfo.bookTitle}</span>
                  <span className="text-emerald-400">‹</span>
                  <span className="text-white font-bold">{contextInfo.chapterTitle}</span>
                </div>
                <span className="text-xs font-black text-amber-950 bg-amber-400 px-3.5 py-1 rounded-full border border-amber-300 shadow-md">
                  سیاقِ کلام
                </span>
              </div>

              {/* Exact Arabic sentence with 3D interactive words */}
              <div className="bg-gradient-to-br from-[#063d2e] via-[#0a523e] to-[#042d22] rounded-2xl p-5 border-2 border-amber-400 shadow-lg space-y-2">
                <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq block">
                  اصل عبارت / آیتِ مبارکہ (مع اعراب و حرکات):
                </span>
                <p 
                  dir="rtl"
                  className="font-amiri font-black text-2xl sm:text-3xl lg:text-4xl leading-[2.9] text-right text-amber-200 drop-shadow-md"
                >
                  {contextInfo.sentenceText.split(' ').map((w, idx) => {
                    const cleanW = w.replace(/[.,:;!?()،؛؟"«»۝0-9٠-٩]/g, '').trim();
                    const cleanTarget = searchTerm.replace(/[.,:;!?()،؛؟"«»۝0-9٠-٩]/g, '').trim();
                    const isMatch = cleanW === cleanTarget || cleanW.includes(cleanTarget) || cleanTarget.includes(cleanW);
                    return isMatch ? (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 text-stone-950 font-black px-3.5 py-1 rounded-xl shadow-lg ring-2 ring-amber-600 border border-amber-200 inline-block scale-110 -translate-y-0.5 mx-1.5 animate-pulse"
                      >
                        {w}{' '}
                      </span>
                    ) : (
                      <span 
                        key={idx} 
                        onClick={() => fetchWordData(cleanW)}
                        className="word-chip-3d px-1.5 py-0.5 hover:bg-amber-400 hover:text-stone-950 rounded-md text-emerald-100 font-bold transition-all"
                        title={`تحقیق برائے «${cleanW}»`}
                      >
                        {w}{' '}
                      </span>
                    );
                  })}
                </p>
              </div>

              {/* Complete Passage Urdu Translation - Colorful Amber Jewel */}
              {contextInfo.urduTranslation && (
                <div className="card-jewel-amber p-5 rounded-2xl border-2 border-amber-400/80 border-r-[8px] border-r-amber-400 shadow-md">
                  <span className="text-sm font-black text-amber-300 font-nastaliq block mb-1.5">
                    عبارت کا مکمل اردو ترجمہ:
                  </span>
                  <p className="text-lg sm:text-xl font-black font-nastaliq leading-[2.8] text-amber-100 text-justify">
                    {contextInfo.urduTranslation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Search / Change Word Input with 3D Emerald Border */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="کسی دوسرے لفظ کی تحقیق کے لیے یہاں ٹائپ کریں..."
              className="w-full pr-12 pl-4 py-3.5 rounded-2xl border-2 border-amber-400 bg-[#06382a] text-xl font-arabic font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-lg transition-all text-amber-200 placeholder:text-emerald-300/60"
            />
            <button 
              type="submit" 
              className="absolute right-3.5 top-3.5 text-amber-400 hover:text-amber-200 cursor-pointer transition-colors p-1"
              title="تلاش کریں"
            >
              <Search className="w-6 h-6" />
            </button>
          </form>

          {/* Word Analysis Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-14 space-y-4">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
              <p className="text-lg font-black font-nastaliq text-amber-200">
                کلمے کی نحوی ترکیب، سیاقی ترجمہ اور لغوی تحقیق مرتب کی جا رہی ہے...
              </p>
            </div>
          ) : entry ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* =========================================================================
                  PILLAR 1: اللفظ، الصیغۃ الصرفیۃ، اور مادہ - Colorful Amber Jewel
                  ========================================================================= */}
              <div className="card-jewel-amber p-5 sm:p-6 rounded-3xl border-2 border-amber-400 border-r-[8px] border-r-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq block mb-1">
                    اللفظ المستفسر عنه (مفرد کلمہ مع اعراب):
                  </span>
                  <span className="text-4xl sm:text-5xl font-black font-amiri text-amber-200 tracking-wide drop-shadow-md">
                    {entry.word}
                  </span>
                  <p className="text-base sm:text-lg text-amber-100 font-black font-nastaliq mt-2.5">
                    صرفی نوع و صیغہ: <strong className="text-amber-300 text-lg sm:text-xl font-black">{entry.grammaticalType}</strong>
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 px-6 py-3.5 rounded-2xl border-2 border-amber-300 shadow-md text-right sm:text-left self-stretch sm:self-auto">
                  <span className="text-xs font-black text-stone-900 font-nastaliq block">
                    مَادَّة (الحروف الأصلية / جذر):
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-amiri text-stone-950 tracking-widest block mt-0.5">
                    {entry.root}
                  </span>
                </div>
              </div>

              {/* =========================================================================
                  PILLAR 2: ترجمۂ سیاقی و موقع در عبارت - Colorful Emerald Jewel
                  ========================================================================= */}
              <div className="card-jewel-emerald p-5 sm:p-6 rounded-3xl border-2 border-emerald-400 border-r-[8px] border-r-emerald-300 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5 border-b-2 border-emerald-500/50 pb-2.5">
                  <CheckCircle2 className="w-6 h-6 text-amber-300" />
                  <h4 className="text-xl sm:text-2xl font-black font-nastaliq text-amber-200">
                    کلمے کا سیاقی ترجمہ و مراد (اس آیت و عبارت میں):
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#06382a] to-[#02241b] p-5 rounded-2xl border-2 border-amber-400/80 shadow-md">
                    <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq block">
                      اس کلمے کا مخصوص ترجمہ و مراد:
                    </span>
                    <p className="text-xl sm:text-2xl font-black font-nastaliq text-amber-200 mt-1.5 leading-[2.6]">
                      {entry.tarkeeb?.contextualTranslation || entry.meaningUrdu}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-[#06382a] to-[#02241b] p-5 rounded-2xl border-2 border-emerald-400/80 shadow-md">
                    <span className="text-xs sm:text-sm font-black text-emerald-300 font-nastaliq block">
                      ترجمہ میں نحوی حیثیت:
                    </span>
                    <p className="text-lg sm:text-xl font-black font-nastaliq text-emerald-100 mt-1.5 leading-[2.6]">
                      {entry.tarkeeb?.sentenceRoleUrdu || `یہ لفظ عبارت کے ترجمہ میں بطورِ ${entry.tarkeeb?.role || 'رکنِ کلام'} واقع ہو رہا ہے۔`}
                    </p>
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  PILLAR 3: ترکیبِ نحوی، اعراب، اور وجوہِ تراکیب - Royal Emerald Chamber
                  ========================================================================= */}
              {entry.tarkeeb && (
                <div className="card-jewel-emerald p-5 sm:p-7 rounded-3xl border-2 border-emerald-400 border-r-[8px] border-r-emerald-300 space-y-6 shadow-2xl">
                  <div className="flex items-center gap-2.5 border-b-2 border-emerald-500/50 pb-3">
                    <Layers className="w-6 h-6 text-amber-300" />
                    <h4 className="text-2xl sm:text-3xl font-black font-nastaliq text-amber-200">
                      مکمل ترکیبِ نحوی، اعراب و درسی تحقیق:
                    </h4>
                  </div>

                  {/* Component A: Primary Syntactic Role & Sign with Crystal-Clear Arabic Diacritics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-[#063d2e] to-[#02261c] p-5 rounded-2xl border-2 border-emerald-400 border-r-[8px] border-r-emerald-400 shadow-md">
                      <span className="text-xs sm:text-sm font-black text-emerald-300 font-nastaliq block mb-1">
                        اعرابی محل و نحوی حیثیت (النَّحْوُ وَالتَّرْكِيب):
                      </span>
                      <p 
                        dir="rtl"
                        className="text-2xl sm:text-3xl font-black font-amiri text-emerald-200 mt-2 leading-[2.5] text-right"
                      >
                        {entry.tarkeeb.role}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#3b2407] to-[#241502] p-5 rounded-2xl border-2 border-amber-400 border-r-[8px] border-r-amber-400 shadow-md">
                      <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq block mb-1">
                        علامتِ اعراب (حَرَكَةُ الإِعْرَابِ وَمَحَلُّهَا):
                      </span>
                      <p 
                        dir="rtl"
                        className="text-2xl sm:text-3xl font-black font-amiri text-amber-200 mt-2 leading-[2.5] text-right"
                      >
                        {entry.tarkeeb.sign}
                      </p>
                    </div>
                  </div>

                  {/* Component B: دیوارِ فاعل — فاعلِ لفظی (لغوی) اور فاعلِ معنوی (Dedicated Colorful 3D Panel) */}
                  <div className="bg-gradient-to-br from-[#04281e] to-[#063a2b] p-5 sm:p-6 rounded-2xl border-2 border-emerald-400 border-r-[8px] border-r-emerald-300 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 border-b-2 border-emerald-500/50 pb-2.5">
                      <Feather className="w-5 h-5 text-amber-300" />
                      <h5 className="text-xl sm:text-2xl font-black font-nastaliq text-white">
                        دیوارِ فاعل: فاعلِ لفظی (لغوی) اور فاعلِ معنوی کی تحقیق:
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* فاعلِ لفظی / لغوی */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-[#074535] to-[#032a1f] border-2 border-emerald-400 space-y-2.5 shadow-md">
                        <div className="flex items-center gap-2">
                          <span className="px-3.5 py-1 rounded-lg bg-emerald-950 text-amber-300 text-sm font-black font-amiri shadow-xs border border-amber-400/40">
                            الفَاعِلُ اللَّفْظِيُّ / اللُّغَوِيُّ
                          </span>
                        </div>
                        <p className="text-lg sm:text-xl font-black font-nastaliq leading-[2.8] text-emerald-100 text-justify">
                          {entry.tarkeeb.failLafzi || 'کلام میں مسند الیہ یا مقتضائے اسناد واقع ہو کر ظاہری عامل کے رفع کو قبول کرتا ہے۔'}
                        </p>
                      </div>

                      {/* فاعلِ معنوی */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-[#452807] to-[#241502] border-2 border-amber-400 space-y-2.5 shadow-md">
                        <div className="flex items-center gap-2">
                          <span className="px-3.5 py-1 rounded-lg bg-amber-950 text-amber-200 text-sm font-black font-amiri shadow-xs border border-amber-400/40">
                            الفَاعِلُ المَعْنَوِيُّ
                          </span>
                        </div>
                        <p className="text-lg sm:text-xl font-black font-nastaliq leading-[2.8] text-amber-100 text-justify">
                          {entry.tarkeeb.failManawi || 'معنی اور حقیقت کے اعتبار سے فعل کا صدور جس ذات کی جانب منسوب ہے، وہی اس کا فاعلِ معنوی ہے۔'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Component C: مفعولِ مطلق، مفعول بہ اور مضاف الیہ کی تفصیلی تحقیق - Colorful Sapphire Jewel */}
                  <div className="card-jewel-sapphire p-5 sm:p-6 rounded-2xl border-2 border-sky-400 border-r-[8px] border-r-sky-300 space-y-3 shadow-xl">
                    <div className="flex items-center gap-2 border-b-2 border-sky-500/50 pb-2.5">
                      <Layers className="w-5 h-5 text-amber-300" />
                      <h5 className="text-xl sm:text-2xl font-black font-nastaliq text-white">
                        مفعولِ مطلق اور مضاف الیہ کی نحوی تحقیق و درسی ضابطہ:
                      </h5>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-black font-nastaliq leading-[2.8] text-sky-100 text-justify">
                      {entry.tarkeeb.mafoolDetail || 'یہ کلمہ کلام میں بطورِ مفعول یا مضاف الیہ واقع ہو کر اپنے ماقبل عامل کے تقاضے کو پورا کرتا ہے اور جملے کے مقصود و اختصاص کو قائم فرماتا ہے۔'}
                    </p>
                  </div>

                  {/* Component D: تفصیلی ترکیب و علائقِ کلام */}
                  <div className="bg-gradient-to-br from-[#06382a] to-[#022118] p-5 sm:p-6 rounded-2xl border-2 border-emerald-400 border-r-[8px] border-r-emerald-400 space-y-3 shadow-xl">
                    <span className="text-base sm:text-lg font-black text-amber-300 font-nastaliq block">
                      کلام کے مجموعی علائق اور تفصیلی ربط:
                    </span>
                    <p className="text-lg sm:text-xl font-black font-nastaliq leading-[2.8] text-emerald-100 text-justify">
                      {entry.tarkeeb.detail}
                    </p>
                  </div>

                  {/* Component E: وجوہِ اعراب و متبادل نحوی تراکیب (اقوالِ علماءِ نحو) */}
                  {entry.tarkeeb.syntacticAspects && entry.tarkeeb.syntacticAspects.length > 0 && (
                    <div className="bg-gradient-to-br from-[#053023] to-[#021d15] p-5 sm:p-6 rounded-2xl border-2 border-emerald-400 shadow-xl space-y-4">
                      <div className="flex items-center gap-2 border-b-2 border-emerald-500/50 pb-2.5">
                        <GitBranch className="w-5 h-5 text-amber-300" />
                        <span className="text-lg sm:text-xl font-black text-amber-200 font-nastaliq">
                          وجوہِ اعراب و متبادل نحوی تراکیب (علماءِ نحو کے اقوال):
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {entry.tarkeeb.syntacticAspects.map((aspect, idx) => (
                          <div 
                            key={idx} 
                            className="card-jewel-amber p-5 rounded-2xl border-2 border-amber-400 border-r-[8px] border-r-amber-400 shadow-md space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-md bg-amber-400 text-stone-950 text-xs sm:text-sm font-black font-nastaliq shadow-xs">
                                {idx === 0 ? 'الوجه الأول (راجح)' : idx === 1 ? 'الوجه الثاني (معتمد)' : `الوجه الثالث (قول ${idx + 1})`}
                              </span>
                            </div>
                            <p className="text-lg sm:text-xl font-black font-nastaliq text-amber-100 leading-[2.8] text-justify">
                              {aspect}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  PILLAR 4: لغوی مفہوم و درسی شروحات - Colorful Ruby Jewel
                  ========================================================================= */}
              <div className="card-jewel-ruby p-5 sm:p-6 rounded-3xl border-2 border-rose-400 border-r-[8px] border-r-rose-400 space-y-3 shadow-xl">
                <h4 className="text-base sm:text-lg font-black text-rose-200 font-nastaliq">
                  قاموسی لغوی و درسی مفہوم:
                </h4>
                <p className="text-lg sm:text-xl font-black font-nastaliq leading-[2.8] text-rose-100 text-justify">
                  {entry.meaningUrdu}
                </p>
              </div>

              {/* Classical Example - Grand Illuminated Gold & Bronze Cartouche */}
              {entry.example && (
                <div className="cartouche-mushaf-3d p-6 sm:p-8 rounded-3xl border-3 border-amber-400 text-center space-y-5 shadow-2xl relative overflow-hidden group bg-gradient-to-br from-[#3b2507] via-[#4d310a] to-[#2b1904] text-amber-200">
                  <div className="flex items-center justify-between border-b border-amber-400/50 pb-3">
                    <div className="flex items-center gap-2 text-amber-300 font-nastaliq text-base sm:text-lg font-black">
                      <Quote className="w-5 h-5 text-amber-400 rotate-180" />
                      <span>شاہد و مثال از قرآن و سنت:</span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(entry.example)}
                      className="btn-3d-gold flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-stone-950 text-xs sm:text-sm font-nastaliq font-black transition-all cursor-pointer shadow-md active:scale-95"
                      title="شاہد کاپی کریں"
                    >
                      {copiedExample ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-950" />
                          <span>کاپی ہو گیا!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-stone-950" />
                          <span>کاپی کریں</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* High-Contrast Crystal-Clear Arabic Calligraphy Text */}
                  <div className="py-3">
                    <p 
                      dir="rtl"
                      className="font-amiri font-black text-3xl sm:text-4xl lg:text-5xl text-amber-200 leading-[3] tracking-wide drop-shadow-md"
                    >
                      «{entry.example}»
                    </p>
                  </div>

                  {/* Explicit Urdu Translation of Example - Colorful Emerald Box */}
                  {entry.exampleTranslation && (
                    <div className="p-5 rounded-2xl bg-[#053629] border-2 border-emerald-400 text-right space-y-1.5 shadow-md">
                      <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq block">
                        شاہدِ مبارک کا اردو ترجمہ:
                      </span>
                      <p className="text-lg sm:text-xl font-black font-nastaliq text-emerald-100 leading-[2.8]">
                        {entry.exampleTranslation}
                      </p>
                    </div>
                  )}

                  {/* Grammatical Proof / Wajah-e-Istidlal - Colorful Amber Box */}
                  {entry.exampleProof && (
                    <div className="p-5 rounded-2xl bg-[#3b2407] border-2 border-amber-400 text-right space-y-1.5 shadow-md">
                      <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq block">
                        وجہِ استدلال و درسی ثبوت:
                      </span>
                      <p className="text-base sm:text-lg font-black font-nastaliq text-amber-100 leading-[2.7]">
                        {entry.exampleProof}
                      </p>
                    </div>
                  )}

                  <div className="text-xs sm:text-sm font-nastaliq font-black text-amber-300 pt-2 border-t border-amber-400/50">
                    مستند درسی شاہد برائے ثبوتِ لغت، صرف، نحو اور اعراب
                  </div>
                </div>
              )}

            </div>
          ) : null}

        </div>

        {/* =========================================================================
            BOTTOM FOOTER: 3D Royal Emerald Bar with Tactile Buttons
            ========================================================================= */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#062c22] to-emerald-950 px-5 sm:px-7 py-4 sm:py-5 border-t-3 border-amber-400/60 flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-2xl relative z-10">
          
          {/* Prominent 3D Emerald Return Button */}
          <button
            onClick={onClose}
            className="btn-3d-emerald w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-amber-200 font-black font-nastaliq text-lg sm:text-xl shadow-2xl cursor-pointer group active:scale-95 transition-all"
          >
            <ArrowRight className="w-6 h-6 text-amber-300 group-hover:-translate-x-2 transition-transform duration-200" />
            <span>مکمل تحقیق دیکھ لی — واپس کتاب و مطالعہ پر جائیں</span>
          </button>

          {/* AI Follow-up Button */}
          {onSendToAI && entry && (
            <button
              onClick={() => {
                onSendToAI(`لفظ [${entry.word}] کی تفصیلی لغوی، صرفی اور نحوی ترکیب و وجوہِ اعراب مستند کتب کے ساتھ پیش فرمائیں۔`);
                onClose();
              }}
              className="btn-3d-gold w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-stone-950 font-black font-nastaliq text-base sm:text-lg cursor-pointer transition-all shadow-xl active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-stone-950" />
              <span>اے آئی معاون سے مزید تحقیق کروائیں</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
