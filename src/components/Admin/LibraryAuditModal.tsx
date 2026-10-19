import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  X, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Scale, 
  GraduationCap, 
  Scroll, 
  UserCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck
} from 'lucide-react';
import { booksDatabase } from '../../data/booksData';
import { 
  auditFullLibrary, 
  enhanceBook, 
  enhanceLibraryBatch, 
  EnhancedBookResult,
  EnhancedBookSegment
} from '../../services/bookEnhancementPipeline';
import { copyToClipboardWithTehreekLogo } from '../../utils/clipboardHelper';

interface LibraryAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookInReader?: (bookId: string) => void;
}

export const LibraryAuditModal: React.FC<LibraryAuditModalProps> = ({
  isOpen,
  onClose,
  onOpenBookInReader
}) => {
  // All books audit reports
  const allReports = useMemo(() => auditFullLibrary(booksDatabase), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'perfected' | 'needs_enhancement'>('all');

  // Active enhanced book inspection
  const [selectedBookId, setSelectedBookId] = useState<string>(booksDatabase[0]?.id || 'bukhari');
  const [activeEnhancedResult, setActiveEnhancedResult] = useState<EnhancedBookResult | null>(() => {
    return enhanceBook(booksDatabase[0]?.id || 'bukhari');
  });

  const [activePillarTab, setActivePillarTab] = useState<'sanad' | 'iraab' | 'fiqh' | 'sermon' | 'quiz'>('sanad');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchResultNotice, setBatchResultNotice] = useState<string | null>(null);
  const [copiedPillar, setCopiedPillar] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filtered reports
  const filteredReports = allReports.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (filterStatus === 'perfected' && r.enhancementReadiness !== 'perfected') return false;
    if (filterStatus === 'needs_enhancement' && r.enhancementReadiness === 'perfected') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.bookId.toLowerCase().includes(q);
    }
    return true;
  });

  // Handle enhance single book
  const handleEnhanceBook = (bookId: string) => {
    setSelectedBookId(bookId);
    const res = enhanceBook(bookId);
    setActiveEnhancedResult(res);
  };

  // Handle Batch Enhancement
  const handleRunBatchEnhance = () => {
    setIsProcessingBatch(true);
    setTimeout(() => {
      const res = enhanceLibraryBatch('all', 15);
      setIsProcessingBatch(false);
      setBatchResultNotice(`کامیابی! مکتبہ کی ${res.totalAudited} کتب کو بخاری ٹیمپلیٹ کے تمام ۵ ارکان پر کامیابی سے انہانس کر دیا گیا۔ اوسط کوالٹی: ${res.averageQualityAfter}%`);
      setTimeout(() => setBatchResultNotice(null), 6000);
    }, 1200);
  };

  // Copy helper
  const handleCopyText = (name: string, text: string) => {
    copyToClipboardWithTehreekLogo(text);
    setCopiedPillar(name);
    setTimeout(() => setCopiedPillar(null), 2500);
  };

  const sampleSegment: EnhancedBookSegment | undefined = activeEnhancedResult?.enhancedChapters[0]?.segments[0];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      dir="rtl"
      style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Urdu Nastaleeq', 'Nafees', serif" }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border-2 border-emerald-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white px-5 py-4 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  خودکار مکتبہ آڈٹ و انہانسمنٹ پائپ لائن (Automated Library Enhancement Skill)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  صحیح بخاری ٹیمپلیٹ برائے 147 کتب
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                مکتبہ کی تمام کتب کو بخاری ماڈیول کے ۵ بنیادی ارکان (سند و متن، اعراب و نحو، مقارنة المذاہب، خطبہ و بیان، کوئز) پر خودکار استوار کرنے کا فریم ورک
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunBatchEnhance}
              disabled={isProcessingBatch}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95 disabled:opacity-50"
              title="تمام کتب پر خودکار آڈٹ و انہانسمنٹ چلائیں"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessingBatch ? 'animate-spin' : ''}`} />
              <span>{isProcessingBatch ? 'انہانسمنٹ جاری ہے...' : 'بیچ انہانسمنٹ (Batch Run)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {batchResultNotice && (
          <div className="bg-emerald-100 dark:bg-emerald-950/80 border-b border-emerald-300 dark:border-emerald-800 px-4 py-2 text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{batchResultNotice}</span>
          </div>
        )}

        {/* Main Body: Two Column Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* Left Column: Books Directory & Quality Scorecard (5 Cols) */}
          <div className="lg:col-span-5 border-l border-stone-200 dark:border-slate-800 flex flex-col min-h-0 bg-stone-50/70 dark:bg-slate-950/50">
            
            {/* Search & Status Bar */}
            <div className="p-3 border-b border-stone-200 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="کتاب یا مصنف کا نام تلاش کریں..."
                  className="w-full pr-8 pl-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 text-xs bg-stone-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className={`px-2 py-0.5 rounded-lg transition ${filterStatus === 'all' ? 'bg-emerald-800 text-white' : 'text-stone-600'}`}
                  >
                    تمام ({allReports.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('perfected')}
                    className={`px-2 py-0.5 rounded-lg transition ${filterStatus === 'perfected' ? 'bg-emerald-800 text-white' : 'text-stone-600'}`}
                  >
                    مصدقہ
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('needs_enhancement')}
                    className={`px-2 py-0.5 rounded-lg transition ${filterStatus === 'needs_enhancement' ? 'bg-emerald-800 text-white' : 'text-stone-600'}`}
                  >
                    قابلِ تجدید
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="px-1.5 py-0.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] text-stone-700 dark:text-stone-300 focus:outline-none"
                  >
                    <option value="all">تمام زمرہ جات</option>
                    <option value="sittah">صحاح ستہ</option>
                    <option value="quran_tafseer">القرآن والتفاسیر</option>
                    <option value="fatawa">فقہ و فتاویٰ</option>
                    <option value="dars_curriculum">درسِ نظامی</option>
                    <option value="kharji_kitab">خارجی کتب</option>
                  </select>
                  <span className="text-stone-400 shrink-0">{filteredReports.length} کتب</span>
                </div>
              </div>
            </div>

            {/* Books List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
              {filteredReports.map(rep => {
                const isSelected = selectedBookId === rep.bookId;
                const score = rep.scores.overallQualityIndex;
                const isPerfect = rep.enhancementReadiness === 'perfected';

                return (
                  <div
                    key={rep.bookId}
                    onClick={() => handleEnhanceBook(rep.bookId)}
                    className={`p-3 rounded-2xl border transition cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300">
                            {rep.category}
                          </span>
                          {isPerfect ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>بخاری معیار</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              <span>قابلِ اپگریڈ</span>
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-stone-900 dark:text-white mt-1 leading-snug truncate">
                          {rep.title}
                        </h4>
                        <p className="text-[10px] text-stone-400 truncate">{rep.author}</p>
                      </div>

                      {/* Score Badge */}
                      <div className="text-center shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold font-mono text-xs ${
                          score >= 85
                            ? 'bg-emerald-800 text-amber-300 border border-amber-400'
                            : score >= 50
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-stone-200 text-stone-700'
                        }`}>
                          <span>{score}%</span>
                        </div>
                        <span className="text-[9px] text-stone-400 block mt-0.5">کوالٹی</span>
                      </div>
                    </div>

                    {/* 5-Pillar Score Bar */}
                    <div className="grid grid-cols-5 gap-1 mt-2.5 pt-2 border-t border-stone-100 dark:border-slate-800 text-[10px] text-center text-stone-500">
                      <div title="سند و متن علیحدگی">سند {rep.scores.sanadMatanSeparation}%</div>
                      <div title="اعراب و نحو">اعراب {rep.scores.grammaticalBreakdown}%</div>
                      <div title="مقارنة المذاہب">فقہ {rep.scores.comparativeFiqh}%</div>
                      <div title="خطبہ و بیان">بیان {rep.scores.sermonNotes}%</div>
                      <div title="کوئز">کوئز {rep.scores.interactiveQuizzes}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: 5-Pillar Enhancement Inspection Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-white dark:bg-slate-900">
            {activeEnhancedResult && sampleSegment ? (
              <>
                {/* Active Book Header */}
                <div className="p-4 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                      بخاری ٹیمپلیٹ پر ماڈل شدہ کتاب:
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug">
                      {activeEnhancedResult.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenBookInReader && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenBookInReader(activeEnhancedResult.bookId);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="ریڈر میں مکمل کتاب کھولیں"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>مطالعہ ریڈر</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 5-Pillar Tabs */}
                <div className="flex items-center gap-1 border-b border-stone-200 dark:border-slate-800 px-4 pt-2 overflow-x-auto custom-scrollbar text-xs">
                  {[
                    { id: 'sanad', label: '۱. سند و متن (اسماء الرجال)', icon: UserCheck },
                    { id: 'iraab', label: '۲. اعراب و نحو (۳D ترکیب)', icon: GraduationCap },
                    { id: 'fiqh', label: '۳. مقارنة المذاہب (ائمہ اربعہ)', icon: Scale },
                    { id: 'sermon', label: '۴. خطبہ و بیان کے نکات', icon: Scroll },
                    { id: 'quiz', label: '۵. انٹرایکٹو کوئز (MCQs)', icon: ShieldCheck },
                  ].map(tab => {
                    const isActive = activePillarTab === tab.id;
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActivePillarTab(tab.id as any)}
                        className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap border-b-2 ${
                          isActive
                            ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30'
                            : 'border-transparent text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Pillar Content Viewer */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar space-y-4 text-xs sm:text-sm">
                  
                  {/* PILLAR 1: Sanad & Matan Separation */}
                  {activePillarTab === 'sanad' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-emerald-950 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-emerald-700" />
                          <span>سند اور متن کی علیحدگی مع اسماء الرجال:</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleCopyText('sanad', sampleSegment.arabicText)}
                          className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
                        >
                          {copiedPillar === 'sanad' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>کاپی</span>
                        </button>
                      </div>

                      {/* Sanad Box */}
                      {sampleSegment.sanadText && (
                        <div className="bg-stone-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-stone-250 dark:border-slate-700 space-y-2">
                          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block font-nastaliq">
                            سندِ حدیث (سلسلۂ روات):
                          </span>
                          <p 
                            className="text-base text-stone-800 dark:text-stone-200 leading-loose text-right font-arabic"
                            style={{ fontFamily: "'Traditional Arabic', 'Amiri', serif" }}
                          >
                            {sampleSegment.sanadText}
                          </p>
                        </div>
                      )}

                      {/* Matan Box */}
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border-2 border-emerald-600/60 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block font-nastaliq">
                          متنِ مبارک (نصِ شرعی):
                        </span>
                        <p 
                          className="text-lg sm:text-xl text-emerald-950 dark:text-emerald-100 font-bold leading-loose text-right font-arabic"
                          style={{ fontFamily: "'Traditional Arabic', 'Amiri', serif" }}
                        >
                          {sampleSegment.matanText}
                        </p>
                      </div>

                      {/* Narrators Identified in this Segment */}
                      {sampleSegment.sanadNarrators && sampleSegment.sanadNarrators.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                            سند میں شناخت شدہ رجال ({sampleSegment.sanadNarrators.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sampleSegment.sanadNarrators.map((n, ni) => (
                              <div
                                key={ni}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <p className="font-bold text-stone-900 dark:text-stone-100 font-arabic">{n.name}</p>
                                  <p className="text-[10px] text-stone-400">{n.info?.tabaqah || 'راویِ معتمد'}</p>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                  {n.info?.rank || 'ثقہ'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PILLAR 2: Grammatical Breakdown */}
                  {activePillarTab === 'iraab' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-emerald-950 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-emerald-700" />
                          <span>جدولِ محلِ اعراب و نحوی ترکیب:</span>
                        </h4>
                        <span className="text-xs text-stone-400">
                          {sampleSegment.mahalIraab?.length || 0} کلمات
                        </span>
                      </div>

                      {sampleSegment.mahalIraab && sampleSegment.mahalIraab.length > 0 ? (
                        <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-slate-800 shadow-xs">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-emerald-800 text-white font-bold">
                              <tr>
                                <th className="p-2.5 font-arabic">الکلمۃ</th>
                                <th className="p-2.5 font-nastaliq">نحوی حیثیت</th>
                                <th className="p-2.5 font-nastaliq">علامتِ اعراب</th>
                                <th className="p-2.5 font-nastaliq">تفصیلی محل و وجہ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                              {sampleSegment.mahalIraab.map((item, idx) => (
                                <tr key={idx} className="hover:bg-emerald-50/50 dark:hover:bg-slate-800/50">
                                  <td className="p-2.5 font-arabic font-bold text-emerald-800 dark:text-emerald-400 text-sm">{item.word}</td>
                                  <td className="p-2.5 font-nastaliq font-medium">{item.role}</td>
                                  <td className="p-2.5 font-sans text-[11px] text-stone-500">{item.sign}</td>
                                  <td className="p-2.5 font-nastaliq text-stone-600 dark:text-stone-300 leading-relaxed">{item.detail}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400">اعرابی تجزیہ دستیاب نہیں</p>
                      )}
                    </div>
                  )}

                  {/* PILLAR 3: Comparative Fiqh */}
                  {activePillarTab === 'fiqh' && sampleSegment.comparativeFiqh && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-300">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">
                          موضوعاتی تقابلِ ائمہ اربعہ:
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                          {sampleSegment.comparativeFiqh.masalaTitle}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Hanafi */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-300 space-y-1.5">
                          <span className="font-bold text-emerald-950 dark:text-emerald-200 font-nastaliq block">
                            ۱. مسلکِ احناف (امام ابو حنیفہ رحمہ اللہ):
                          </span>
                          <p className="text-stone-800 dark:text-stone-200 leading-relaxed">
                            {sampleSegment.comparativeFiqh.hanafi.ruling}
                          </p>
                          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                            دلیل: {sampleSegment.comparativeFiqh.hanafi.dalil}
                          </p>
                        </div>

                        {/* Shafi'i */}
                        <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/50 border border-teal-300 space-y-1.5">
                          <span className="font-bold text-teal-950 dark:text-teal-200 font-nastaliq block">
                            ۲. مسلکِ شوافع (امام شافعی رحمہ اللہ):
                          </span>
                          <p className="text-stone-800 dark:text-stone-200 leading-relaxed">
                            {sampleSegment.comparativeFiqh.shafii.ruling}
                          </p>
                          <p className="text-[11px] text-teal-800 dark:text-teal-300 font-bold">
                            دلیل: {sampleSegment.comparativeFiqh.shafii.dalil}
                          </p>
                        </div>

                        {/* Maliki */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-300 space-y-1.5">
                          <span className="font-bold text-amber-950 dark:text-amber-200 font-nastaliq block">
                            ۳. مسلکِ مالکیہ (امام مالک رحمہ اللہ):
                          </span>
                          <p className="text-stone-800 dark:text-stone-200 leading-relaxed">
                            {sampleSegment.comparativeFiqh.maliki.ruling}
                          </p>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                            دلیل: {sampleSegment.comparativeFiqh.maliki.dalil}
                          </p>
                        </div>

                        {/* Hanbali */}
                        <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 space-y-1.5">
                          <span className="font-bold text-stone-900 dark:text-stone-200 font-nastaliq block">
                            ۴. مسلکِ حنابلہ (امام احمد بن حنبل رحمہ اللہ):
                          </span>
                          <p className="text-stone-800 dark:text-stone-200 leading-relaxed">
                            {sampleSegment.comparativeFiqh.hanbali.ruling}
                          </p>
                          <p className="text-[11px] text-stone-700 dark:text-stone-300 font-bold">
                            دلیل: {sampleSegment.comparativeFiqh.hanbali.dalil}
                          </p>
                        </div>
                      </div>

                      {/* Tarjeeh */}
                      <div className="p-3 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200 text-xs">
                        <strong className="text-emerald-900 dark:text-emerald-300 font-bold ml-1">
                          خلاصۂ تطبیق و وجۂ ترجیح:
                        </strong>
                        {sampleSegment.comparativeFiqh.tarjeehWaFasla}
                      </div>
                    </div>
                  )}

                  {/* PILLAR 4: Sermon & Daily Takeaways */}
                  {activePillarTab === 'sermon' && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Daily Life Takeaways */}
                      {sampleSegment.dailyLifeTakeaways && (
                        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 space-y-2">
                          <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm">
                            عوام الناس کے لیے روزمرہ اصلاحی فوائد (Practical Lessons):
                          </h4>
                          <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 pr-2">
                            {sampleSegment.dailyLifeTakeaways.map((point, pi) => (
                              <li key={pi} className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                  {pi + 1}
                                </span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sermon Outline */}
                      {sampleSegment.sermonNotesOutline && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-2">
                            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                              {sampleSegment.sermonNotesOutline.topicTitle}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleCopyText('sermon', JSON.stringify(sampleSegment.sermonNotesOutline, null, 2))}
                              className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
                            >
                              {copiedPillar === 'sermon' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>خاکہ کاپی کریں</span>
                            </button>
                          </div>

                          <div className="space-y-2 text-xs">
                            <p className="text-stone-600 dark:text-stone-300">
                              <strong className="text-emerald-950 dark:text-emerald-300">مقدمہ:</strong> {sampleSegment.sermonNotesOutline.muqaddamah}
                            </p>
                            <div>
                              <strong className="text-emerald-950 dark:text-emerald-300 block mb-1">قرآنی آیات و شواہد:</strong>
                              {sampleSegment.sermonNotesOutline.quranSunnahEvidences.map((e, ei) => (
                                <p key={ei} className="text-stone-700 dark:text-stone-300 pr-2">• {e}</p>
                              ))}
                            </div>
                            <p className="text-stone-600 dark:text-stone-300">
                              <strong className="text-emerald-950 dark:text-emerald-300">خلاصہ و دعا:</strong> {sampleSegment.sermonNotesOutline.conclusionWaDua}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PILLAR 5: Contextual Quiz */}
                  {activePillarTab === 'quiz' && sampleSegment.contextualQuiz && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 border-2 border-amber-400/80 space-y-3">
                        <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">
                          خود تشخیصی کوئز (Contextual MCQ):
                        </span>

                        <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug">
                          {sampleSegment.contextualQuiz.questionUrdu}
                        </h4>

                        <div className="space-y-2">
                          {sampleSegment.contextualQuiz.options.map((opt, oi) => {
                            const isCorrect = oi === sampleSegment.contextualQuiz?.correctIndex;
                            return (
                              <div
                                key={oi}
                                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-emerald-100/80 dark:bg-emerald-950/70 border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200'
                                    : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 text-stone-700 dark:text-stone-300'
                                }`}
                              >
                                <span>{oi + 1}. {opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-white shrink-0">
                                    صحیح جواب
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-stone-200 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                          <strong className="text-emerald-950 dark:text-emerald-300 block mb-0.5">علمی وضاحت:</strong>
                          {sampleSegment.contextualQuiz.scholarlyExplanation}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-10 text-center text-stone-400 text-xs">
                کتاب کا انتخاب فرمائیں تاکہ اس کے ۵ بنیادی ارکان کا پیش منظر ظاہر ہو سکے۔
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 dark:bg-slate-950 px-5 py-3 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-nastaliq">
            تحریکِ ایمان ڈیجیٹل کتب خانہ • بانی و سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-slate-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-bold transition cursor-pointer"
          >
            بند کریں
          </button>
        </div>

      </div>
    </div>
  );
};
