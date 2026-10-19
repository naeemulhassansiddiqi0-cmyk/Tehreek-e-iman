import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  BookOpen, 
  ThumbsUp, 
  Eye, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  UserCheck, 
  Send, 
  X, 
  ArrowLeft,
  BookmarkCheck
} from 'lucide-react';
import { 
  ForumQuestion, 
  ForumAnswer, 
  ForumUser, 
  ForumRole, 
  FORUM_CATEGORIES, 
  FORUM_ROLE_BADGES, 
  INITIAL_FORUM_QUESTIONS 
} from './forumData';
import { speakText } from '../../services/speechService';
import { copyToClipboardWithTehreekLogo } from '../../utils/clipboardHelper';

interface ScholarlyForumViewProps {
  theme?: string;
  onBackToDashboard?: () => void;
  onNavigateToBook?: (bookSlug: string, page?: number) => void;
}

const STORAGE_KEY = 'tehreek_scholarly_forum_v1';
const USER_PROFILE_KEY = 'tehreek_forum_current_user_v1';

export const ScholarlyForumView: React.FC<ScholarlyForumViewProps> = ({
  onBackToDashboard,
  onNavigateToBook
}) => {
  // Questions State
  const [questions, setQuestions] = useState<ForumQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_FORUM_QUESTIONS;
  });

  // Current User Role & Identity
  const [currentUser, setCurrentUser] = useState<ForumUser>(() => {
    try {
      const saved = localStorage.getItem(USER_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      id: 'current_user',
      name: 'مولانا مفتی محمد عبداللہ',
      title: 'فاضل درسِ نظامی و محقق دار الافتاء',
      role: 'scholar',
      madrasaOrCity: 'جامعہ اسلامیہ',
      isVerified: true
    };
  });

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterResolved, setFilterResolved] = useState<'all' | 'resolved' | 'unresolved'>('all');

  // Expanded Questions
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(questions[0]?.id || null);

  // New Question Modal
  const [isNewQuestionOpen, setIsNewQuestionOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'sarf_nahw' | 'fiqh_fatwa' | 'hadith' | 'usul' | 'modern' | 'general'>('fiqh_fatwa');
  const [newArabicText, setNewArabicText] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newBookRef, setNewBookRef] = useState('');
  const [newTags, setNewTags] = useState('');

  // Answering State
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [answerArabicQuote, setAnswerArabicQuote] = useState('');
  const [answerBookTitle, setAnswerBookTitle] = useState('');
  const [answerVolume, setAnswerVolume] = useState('');
  const [answerPage, setAnswerPage] = useState('');

  // Interactive UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch {
      // ignore
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Handle Speech
  const handleToggleSpeech = (id: string, textToRead: string) => {
    if (speakingId === id) {
      speakText('', () => {}, () => setSpeakingId(null), () => setSpeakingId(null));
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    speakText(
      textToRead,
      () => setSpeakingId(id),
      () => setSpeakingId(null),
      () => setSpeakingId(null)
    );
  };

  // Handle Copy
  const handleCopy = (id: string, text: string) => {
    copyToClipboardWithTehreekLogo(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Upvote Question
  const handleUpvoteQuestion = (qId: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === qId ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
  };

  // Upvote Answer
  const handleUpvoteAnswer = (qId: string, aId: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== qId) return q;
        return {
          ...q,
          answers: q.answers.map(a => (a.id === aId ? { ...a, upvotes: a.upvotes + 1 } : a))
        };
      })
    );
  };

  // Submit New Question
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const catObj = FORUM_CATEGORIES.find(c => c.id === newCategory) || FORUM_CATEGORIES[1];

    const newQ: ForumQuestion = {
      id: 'fq_' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: catObj.label,
      author: currentUser,
      arabicText: newArabicText.trim() || undefined,
      content: newContent.trim(),
      bookReference: newBookRef.trim() || undefined,
      tags: newTags
        .split(/[،, ]+/)
        .filter(t => t.trim().length > 1)
        .slice(0, 5),
      upvotes: 1,
      views: 1,
      answersCount: 0,
      isResolved: false,
      createdAt: 'ابھی ابھی',
      answers: []
    };

    setQuestions(prev => [newQ, ...prev]);
    setExpandedQuestionId(newQ.id);

    // Reset Form
    setNewTitle('');
    setNewArabicText('');
    setNewContent('');
    setNewBookRef('');
    setNewTags('');
    setIsNewQuestionOpen(false);
  };

  // Submit New Answer
  const handleCreateAnswer = (qId: string) => {
    if (!answerContent.trim()) return;

    const references = answerBookTitle.trim()
      ? [
          {
            bookTitle: answerBookTitle.trim(),
            volume: answerVolume.trim() || undefined,
            page: answerPage.trim() || undefined,
            readerLink: answerBookTitle.includes('ہدایہ')
              ? `/books/al-hidayah?page=${answerPage || 1}`
              : answerBookTitle.includes('قدوری')
              ? `/books/mukhtasar-al-quduri?page=${answerPage || 1}`
              : answerBookTitle.includes('بخاری')
              ? `/books/sahih-bukhari?page=${answerPage || 1}`
              : undefined
          }
        ]
      : undefined;

    const newAns: ForumAnswer = {
      id: 'fa_' + Date.now(),
      questionId: qId,
      author: currentUser,
      arabicQuote: answerArabicQuote.trim() || undefined,
      content: answerContent.trim(),
      references,
      upvotes: 1,
      isVerifiedScholarly: currentUser.isVerified || currentUser.role === 'mufti' || currentUser.role === 'scholar',
      createdAt: 'ابھی ابھی'
    };

    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== qId) return q;
        return {
          ...q,
          answersCount: q.answersCount + 1,
          isResolved: newAns.isVerifiedScholarly ? true : q.isResolved,
          answers: [...q.answers, newAns]
        };
      })
    );

    // Reset
    setAnswerContent('');
    setAnswerArabicQuote('');
    setAnswerBookTitle('');
    setAnswerVolume('');
    setAnswerPage('');
    setAnsweringQuestionId(null);
  };

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    // Category match
    if (selectedCategory !== 'all' && q.category !== selectedCategory) {
      return false;
    }
    // Resolution match
    if (filterResolved === 'resolved' && !q.isResolved) return false;
    if (filterResolved === 'unresolved' && q.isResolved) return false;

    // Search query match
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase().trim();
      const matchTitle = q.title.toLowerCase().includes(sq);
      const matchContent = q.content.toLowerCase().includes(sq);
      const matchArabic = (q.arabicText || '').toLowerCase().includes(sq);
      const matchAuthor = q.author.name.toLowerCase().includes(sq);
      const matchTag = q.tags.some(t => t.toLowerCase().includes(sq));
      if (!matchTitle && !matchContent && !matchArabic && !matchAuthor && !matchTag) {
        return false;
      }
    }
    return true;
  });

  return (
    <div 
      dir="rtl"
      className="min-h-screen bg-stone-50 dark:bg-slate-950 text-stone-900 dark:text-stone-100 py-6 px-3 sm:px-6 lg:px-8 font-nastaliq selection:bg-emerald-100"
      style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Urdu Nastaleeq', 'Nafees', serif" }}
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. Header & Navigation Banner */}
        <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-amber-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {onBackToDashboard && (
                  <button
                    type="button"
                    onClick={onBackToDashboard}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition cursor-pointer"
                    title="واپس کتب خانہ"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>علمی مجلس و بحثِ تحقیق</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-800/80 text-emerald-200 border border-emerald-700/60">
                  {questions.length} علمی مباحث
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                علمی مباحث اور سوال و جواب (Scholarly Q&A Forum)
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 max-w-2xl leading-relaxed">
                طلبۂ درسِ نظامی، اساتذۂ کرام اور محققین کے لیے عبارت فہمی، صرفی و نحوی اشکالات اور فقہی استفسارات کی تحقیق۔ مصدقہ علماء و مفتیان کے جوابات کو مصدقہ مہر کے ساتھ نمایاں کیا جاتا ہے۔
              </p>
            </div>

            {/* Current User Role Pill & Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-400/30 text-white flex items-center justify-between gap-3 text-xs transition cursor-pointer"
                title="شناخت یا درسی درجہ تبدیل کریں"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-amber-300 font-bold border border-amber-400/50">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-amber-200 truncate max-w-[150px]">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-300">{FORUM_ROLE_BADGES[currentUser.role]?.label}</p>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-amber-300" />
              </button>

              <button
                type="button"
                onClick={() => setIsNewQuestionOpen(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-950" />
                <span>نیا علمی مباحثہ شروع کریں</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Search & Category Filters Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-stone-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="کتاب، عنوان، عربی عبارت، راوی، یا مسئلے میں تلاش فرمائیں..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Resolved Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterResolved('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterResolved === 'all'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                تمام
              </button>
              <button
                type="button"
                onClick={() => setFilterResolved('resolved')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  filterResolved === 'resolved'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>مصدقہ حل شدہ</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterResolved('unresolved')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterResolved === 'unresolved'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                غیر حل شدہ
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
            <span className="text-stone-400 text-[11px] font-bold pl-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>موضوعات:</span>
            </span>
            {FORUM_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs ring-1 ring-emerald-600'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Questions Feed */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-stone-300 dark:border-slate-800 space-y-3">
              <MessageSquare className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">کوئی علمی سوال یا مباحثہ دستیاب نہیں</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                آپ اپنے درسِ نظامی یا فقہی استفسار کا آغاز فرمائیں تاکہ مستند علماء و مفتیان آپ کی رہنمائی فرما سکیں۔
              </p>
              <button
                type="button"
                onClick={() => setIsNewQuestionOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
              >
                پہلا سوال درج فرمائیں
              </button>
            </div>
          ) : (
            filteredQuestions.map(q => {
              const isExpanded = expandedQuestionId === q.id;
              const roleBadge = FORUM_ROLE_BADGES[q.author.role];

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        {/* Badges Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {q.categoryLabel}
                          </span>

                          {q.isResolved && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-amber-600" />
                              <span>مصدقہ حل شدہ</span>
                            </span>
                          )}

                          {q.bookReference && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-700 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-stone-500" />
                              <span>{q.bookReference}</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 
                          onClick={() => setExpandedQuestionId(prev => (prev === q.id ? null : q.id))}
                          className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                        >
                          {q.title}
                        </h2>
                      </div>

                      {/* Expand / Collapse Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedQuestionId(prev => (prev === q.id ? null : q.id))}
                        className="p-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-emerald-50 text-stone-600 dark:text-stone-300 transition cursor-pointer shrink-0"
                        title={isExpanded ? 'سکیڑیں' : 'تفصیلات و جوابات کھولیں'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Arabic Text Callout if present */}
                    {q.arabicText && (
                      <div className="bg-amber-50/60 dark:bg-amber-950/30 border-r-4 border-amber-500 rounded-xl p-3 text-right">
                        <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold block mb-1">
                          متنِ عربی مع اعراب / عبارتِ کتاب:
                        </span>
                        <p 
                          dir="rtl"
                          className="text-base sm:text-lg text-emerald-950 dark:text-emerald-200 leading-loose"
                          style={{ fontFamily: "'Traditional Arabic', 'Amiri', 'Scheherazade New', serif" }}
                        >
                          {q.arabicText}
                        </p>
                      </div>
                    )}

                    {/* Urdu Content */}
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                      {q.content}
                    </p>

                    {/* Tags */}
                    {q.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {q.tags.map(t => (
                          <span
                            key={t}
                            className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Author Meta Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold flex items-center justify-center text-xs">
                          {q.author.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900 dark:text-stone-200">{q.author.name}</span>
                            <span className={`text-[10px] px-2 py-0.2 rounded-full border ${roleBadge.badgeClass}`}>
                              {roleBadge.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400">
                            {q.author.madrasaOrCity || q.author.title} • {q.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpvoteQuestion(q.id)}
                          className="flex items-center gap-1 text-stone-500 hover:text-emerald-700 cursor-pointer transition active:scale-95"
                          title="تائید فرمائیں"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{q.upvotes}</span>
                        </button>

                        <span className="flex items-center gap-1 text-stone-400">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{q.views}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setExpandedQuestionId(prev => (prev === q.id ? null : q.id))}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold cursor-pointer hover:bg-emerald-100 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{q.answersCount} جوابات</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Answers Thread */}
                  {isExpanded && (
                    <div className="bg-stone-50/80 dark:bg-slate-950/60 p-4 sm:p-5 border-t border-stone-200 dark:border-slate-800 space-y-4">
                      
                      {/* Section Title */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm sm:text-base text-stone-800 dark:text-stone-200 flex items-center gap-2">
                          <BookmarkCheck className="w-4 h-4 text-emerald-700" />
                          <span>تحقیقی جوابات و فتاویٰ ({q.answers.length}):</span>
                        </h3>

                        <button
                          type="button"
                          onClick={() => setAnsweringQuestionId(prev => (prev === q.id ? null : q.id))}
                          className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                          <span>جواب تحریر فرمائیں</span>
                        </button>
                      </div>

                      {/* Answer Input Drawer */}
                      {answeringQuestionId === q.id && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 border-emerald-500 shadow-md space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-2">
                            <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                              <UserCheck className="w-4 h-4 text-amber-500" />
                              <span>جواب دہندہ: {currentUser.name} ({FORUM_ROLE_BADGES[currentUser.role]?.label})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setAnsweringQuestionId(null)}
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Arabic text input */}
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                              عربی نص یا حدیث شریف (اختیاری):
                            </label>
                            <input
                              type="text"
                              value={answerArabicQuote}
                              onChange={e => setAnswerArabicQuote(e.target.value)}
                              placeholder="«الماء الراكد إذا وقعت فيه نجاسة...»"
                              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs text-right font-arabic"
                              dir="rtl"
                            />
                          </div>

                          {/* Urdu answer */}
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                              محققانہ جواب و فقہی رہنمائی (اردو): *
                            </label>
                            <textarea
                              rows={4}
                              value={answerContent}
                              onChange={e => setAnswerContent(e.target.value)}
                              placeholder="الجواب وباللہ التوفیق: مسئلہ کا شرعی حل اور دلائل تحریر فرمائیں..."
                              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                              dir="rtl"
                            />
                          </div>

                          {/* References inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div>
                              <input
                                type="text"
                                value={answerBookTitle}
                                onChange={e => setAnswerBookTitle(e.target.value)}
                                placeholder="کتاب کا نام (مثلاً الہدایہ)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={answerVolume}
                                onChange={e => setAnswerVolume(e.target.value)}
                                placeholder="جلد نمبر (مثلاً ۱)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={answerPage}
                                onChange={e => setAnswerPage(e.target.value)}
                                placeholder="صفحہ نمبر (مثلاً ۱۲)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setAnsweringQuestionId(null)}
                              className="px-3 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs"
                            >
                              منسوخ
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCreateAnswer(q.id)}
                              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5 text-amber-300" />
                              <span>جواب شائع فرمائیں</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Answers List */}
                      {q.answers.length === 0 ? (
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl text-center text-xs text-stone-500">
                          ابھی تک اس سوال کا کوئی جواب موصول نہیں ہوا۔ آپ پہلا تحقیقی جواب تحریر فرما کر ثواب کے مستحق بنیں۔
                        </div>
                      ) : (
                        q.answers.map(ans => {
                          const isVerified = ans.isVerifiedScholarly;
                          const ansRoleBadge = FORUM_ROLE_BADGES[ans.author.role];

                          return (
                            <div
                              key={ans.id}
                              className={`rounded-2xl p-4 sm:p-5 transition space-y-3 relative ${
                                isVerified
                                  ? 'bg-gradient-to-br from-amber-50/50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-2 border-amber-400/90 shadow-md'
                                  : 'bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800'
                              }`}
                            >
                              {/* Verified Scholar Ribbon Banner */}
                              {isVerified && (
                                <div className="flex items-center justify-between pb-2 border-b border-amber-200/70 dark:border-amber-900/50">
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-emerald-950 shadow-xs flex items-center gap-1.5">
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-950" />
                                      <span>مصدقہ شرعی توثیق (Verified Scholarly Answer)</span>
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold hidden sm:inline">
                                    امہات الکتب و دار الافتاء سے مصدقہ
                                  </span>
                                </div>
                              )}

                              {/* Author Header */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    isVerified ? 'bg-amber-400 text-emerald-950 shadow-xs' : 'bg-stone-200 text-stone-700'
                                  }`}>
                                    {ans.author.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                                        {ans.author.name}
                                      </span>
                                      <span className={`text-[10px] px-2 py-0.2 rounded-full border ${ansRoleBadge.badgeClass}`}>
                                        {ansRoleBadge.label}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-stone-400">
                                      {ans.author.title} {ans.author.madrasaOrCity ? `• ${ans.author.madrasaOrCity}` : ''} • {ans.createdAt}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSpeech(ans.id, ans.content)}
                                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                                      speakingId === ans.id
                                        ? 'bg-amber-400 text-emerald-950 font-bold'
                                        : 'text-stone-400 hover:text-stone-600'
                                    }`}
                                    title="آواز میں سنیں"
                                  >
                                    {speakingId === ans.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(ans.id, ans.content)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 transition cursor-pointer"
                                    title="کاپی کریں"
                                  >
                                    {copiedId === ans.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {/* Arabic Quote */}
                              {ans.arabicQuote && (
                                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-r-3 border-emerald-600 rounded-xl p-3">
                                  <p
                                    dir="rtl"
                                    className="text-base text-emerald-950 dark:text-emerald-200 leading-loose"
                                    style={{ fontFamily: "'Traditional Arabic', 'Amiri', serif" }}
                                  >
                                    {ans.arabicQuote}
                                  </p>
                                </div>
                              )}

                              {/* Content */}
                              <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                                {ans.content}
                              </div>

                              {/* References Badges & Direct Reader Link */}
                              {ans.references && ans.references.length > 0 && (
                                <div className="bg-stone-100/80 dark:bg-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs">
                                  <span className="text-[10px] text-stone-500 font-bold block">
                                    مصدقہ کتب و مراجع (براہِ راست مطالعہ لنک):
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {ans.references.map((r, ri) => (
                                      <div
                                        key={ri}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 shadow-2xs"
                                      >
                                        <BookOpen className="w-3 h-3 text-emerald-600" />
                                        <span>
                                          {r.bookTitle} {r.volume ? `(جلد ${r.volume})` : ''} {r.page ? `ص ${r.page}` : ''}
                                        </span>
                                        {r.readerLink && (
                                          <a
                                            href={r.readerLink}
                                            onClick={(e) => {
                                              if (onNavigateToBook && r.readerLink) {
                                                e.preventDefault();
                                                const slug = r.readerLink.split('/books/')[1]?.split('?')[0];
                                                if (slug) onNavigateToBook(slug, Number(r.page) || 1);
                                              }
                                            }}
                                            className="text-emerald-700 hover:text-emerald-900 mr-1 flex items-center gap-0.5"
                                            title="کتاب میں کھولیں"
                                          >
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Footer Actions */}
                              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800 text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleUpvoteAnswer(q.id, ans.id)}
                                  className="flex items-center gap-1 text-stone-500 hover:text-emerald-700 font-bold transition active:scale-95 cursor-pointer"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>مفید و مدلل ({ans.upvotes})</span>
                                </button>

                                {isVerified && (
                                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold font-nastaliq">
                                    «وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. New Question Modal */}
      {isNewQuestionOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-emerald-300 shadow-2xl p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-lg text-emerald-950 dark:text-white">
                  نیا درسی و تحقیقی سوال درج فرمائیں
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewQuestionOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3.5 text-xs sm:text-sm">
              {/* Category */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  علمی شعبہ / موضوع: *
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 font-nastaliq text-xs sm:text-sm"
                >
                  {FORUM_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  عنوانِ اشکال یا مسئلہ: *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثلاً: ہدایہ شریف: باب المیاہ میں قلتین والی روایت پر احناف کا استدلال"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              {/* Arabic text quote */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  متنِ عربی یا عبارتِ کتاب (اعراب کے ساتھ، اختیاری):
                </label>
                <textarea
                  rows={2}
                  value={newArabicText}
                  onChange={e => setNewArabicText(e.target.value)}
                  placeholder="«الماء إذا بلغ قلتين لم يحمل خبثاً...»"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 font-arabic text-right text-xs sm:text-sm"
                  dir="rtl"
                />
              </div>

              {/* Detailed Urdu Question */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  اشکال کی تفصیلی وضاحت (اردو): *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="مسئلے یا عبارت کا وہ مقام جہاں اشکال ہے اور جو بات سمجھنا چاہتے ہیں تفصیل سے تحریر فرمائیں..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  dir="rtl"
                />
              </div>

              {/* Book ref & tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    کتاب کا حوالہ (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={newBookRef}
                    onChange={e => setNewBookRef(e.target.value)}
                    placeholder="الہدایہ، جلد ۱، صفحہ ۱۲"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ٹیگز (کوما سے الگ کریں):
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    placeholder="ہدایہ, طہارت, قلتین"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewQuestionOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  سوال شائع فرمائیں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. User Profile Switcher Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-emerald-300 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-base text-emerald-950 dark:text-white">
                  فورم میں صارف کی شناخت و علمی درجہ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  آپ کا اسمِ گرامی:
                </label>
                <input
                  type="text"
                  value={currentUser.name}
                  onChange={e => setCurrentUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 font-nastaliq"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  علمی و درسی درجہ (Role):
                </label>
                <select
                  value={currentUser.role}
                  onChange={e => {
                    const r = e.target.value as ForumRole;
                    const conf = FORUM_ROLE_BADGES[r];
                    setCurrentUser(prev => ({
                      ...prev,
                      role: r,
                      isVerified: conf.isAuthority,
                      title: r === 'mufti' ? 'مفتی و محقق دار الافتاء' : r === 'scholar' ? 'فاضل درسِ نظامی' : r === 'teacher' ? 'مدرسِ جامعہ' : 'طالب علم درسِ نظامی'
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 font-nastaliq"
                >
                  <option value="mufti">مصدقہ مفتی و فقیہ (Verified Mufti)</option>
                  <option value="scholar">مصدقہ عالمِ دین (فاضل درسِ نظامی)</option>
                  <option value="teacher">استاذِ جامعہ / مدرس</option>
                  <option value="student">طالبِ علمِ درسِ نظامی</option>
                  <option value="researcher">علمی محقق و قاری</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  جامعہ، ادارہ یا شہر:
                </label>
                <input
                  type="text"
                  value={currentUser.madrasaOrCity || ''}
                  onChange={e => setCurrentUser(prev => ({ ...prev, madrasaOrCity: e.target.value }))}
                  placeholder="مثلاً جامعہ اسلامیہ، لاہور"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 font-nastaliq"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
                >
                  محفوظ کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
