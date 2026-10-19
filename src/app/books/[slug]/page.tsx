"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { publicDomainBooks, modernBooks, PublicDomainBook, BookCategoryTitle } from "@/data/publicDomainBooks";
import { booksDatabase } from "@/data/booksData";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  BookMarked,
  Share2,
  Check,
  Loader2,
  Sliders,
  Bookmark,
  BookmarkCheck,
  Copy,
  FileEdit,
  Eye,
  EyeOff,
  UserCheck,
  Layers,
  Maximize2,
  Minimize2,
  BookOpenCheck,
  Trash2
} from "lucide-react";
import { UrduStyler } from "@/components/UrduStyler";
import { FontSizeControlModal } from "@/components/Reader/FontSizeControlModal";
import { ReaderZoomToolbar } from "@/components/Reader/ReaderZoomToolbar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePortalLanguage } from "@/context/LanguageContext";
import { GlobalComments } from "@/components/GlobalComments";
import { WordLookupModal } from "@/components/Reader/WordLookupModal";
import { NarratorModal } from "@/components/Reader/NarratorModal";
import { TafseerModal } from "@/components/Reader/TafseerModal";
import { BukhariTarajimBox } from "@/components/Reader/BukhariTarajimBox";
import { IraabSectionView } from "@/components/Reader/IraabSectionView";
import { DarsiTashreehSectionView } from "@/components/Reader/DarsiTashreehSectionView";
import { ComparativeFiqhBox } from "@/components/Reader/ComparativeFiqhBox";
import { DailyLifeTakeawayBox } from "@/components/Reader/DailyLifeTakeawayBox";
import { AdvancedTakhreejBox } from "@/components/Reader/AdvancedTakhreejBox";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { parseSanadNarratorSegments, NarratorInfo } from "@/services/rijalService";
import { getBukhariTarjamahInfo } from "@/services/bukhariTarajimService";
import { safeName, safeRank } from "@/utils/safeName";
import { WordLookupContextInfo } from "@/types";
import { getDarsiAnalysisSync, segmentSanadAndMatn, stripTashkeel, normalizeArabic } from "@/services/darsiPipelineService";
import { getTafseerForAyah, extractAyahNumbers, TafseerEntry } from "@/services/tafseerService";
import { quranChapters, QURAN_SURAHS_CANONICAL } from "@/data/quranData";
import { bukhariChapters } from "@/data/bukhariData";
import { muslimChapters } from "@/data/muslimData";
import { abudawoodChapters, tirmidhiChapters, nasaiChapters, ibnmajahChapters } from "@/data/allHadithBooksData";

interface HadithItem {
  hadithnumber?: number;
  number?: number;
  arab?: string;
  text?: string;
  urdu?: string;
}

interface SearchResult {
  pageIndex: number;       // 0-based page index (for non-hadith) or hadith page index
  hadithNum?: number;      // for hadith books
  matchType: 'arabic' | 'urdu' | 'number' | 'roman';
  preview: string;         // short snippet of matched content
}

// 1. Slugs mapped to local files in public/hadith-data/[slug].json
const HADITH_FILE_MAP: Record<string, string> = {
  "sahih-bukhari": "sahih-bukhari",
  "bukhari": "sahih-bukhari",
  "sahih-muslim": "sahih-muslim",
  "muslim": "sahih-muslim",
  "sunan-abu-daud": "sunan-abu-daud",
  "sunan-abu-dawood": "sunan-abu-daud",
  "jami-tirmizi": "jami-tirmizi",
  "jami-tirmidhi": "jami-tirmizi",
  "sunan-nasai": "sunan-nasai",
  "nasai": "sunan-nasai",
  "sunan-ibn-majah": "sunan-ibn-majah",
  "ibn-majah": "sunan-ibn-majah",
};

// Expected counts for canonical hadith books
const HADITH_TOTALS: Record<string, { total: number; urduName: string }> = {
  "sahih-bukhari": { total: 7589, urduName: "صحیح البخاری" },
  "sahih-muslim": { total: 7563, urduName: "صحیح مسلم" },
  "sunan-abu-daud": { total: 5274, urduName: "سنن ابی داود" },
  "jami-tirmizi": { total: 3998, urduName: "جامع الترمذی" },
  "sunan-nasai": { total: 5765, urduName: "سنن النسائی" },
  "sunan-ibn-majah": { total: 4343, urduName: "سنن ابن ماجہ" },
};

// Global in-memory cache to ensure instant subsequent page loads
const hadithGlobalCache: Record<string, HadithItem[]> = {};

export interface MusnadVolume {
  id: number;
  volNum: string;
  title: string;
  subtitle: string;
  startPage: number;
  endPage: number;
  hadithRange: string;
}

export const MUSNAD_VOLUMES: MusnadVolume[] = [
  { id: 1, volNum: "جلد اول", title: "مسند الخلفاء الراشدین", subtitle: "حضرت ابوبکر، عمر، عثمان و علی رضی اللہ عنہم", startPage: 1, endPage: 1400, hadithRange: "احادیث 1 تا 1400" },
  { id: 2, volNum: "جلد دوم", title: "بقیة العشرة المبشرة و اہل البیت", subtitle: "طلحہ، زبیر، سعد، سعید، عبدالرحمن، حسن، حسین و اہل بیت رضی اللہ عنہم", startPage: 1401, endPage: 3000, hadithRange: "احادیث 1401 تا 3000" },
  { id: 3, volNum: "جلد سوم", title: "مسند العبادلة و کبار المکثرین", subtitle: "عبد اللہ بن مسعود، عبد اللہ بن عمر و عبد اللہ بن عباس رضی اللہ عنہم", startPage: 3001, endPage: 6500, hadithRange: "احادیث 3001 تا 6500" },
  { id: 4, volNum: "جلد چہارم", title: "مسند المکثرین من الصحابة", subtitle: "عبد اللہ بن عمرو بن العاص و سیدنا ابو ہریرہ رضی اللہ عنہم", startPage: 6501, endPage: 11000, hadithRange: "احادیث 6501 تا 11000" },
  { id: 5, volNum: "جلد پنجم", title: "مسند الانصار", subtitle: "ابو سعید الخدری، انس بن مالک، جابر بن عبد اللہ و معاذ بن جبل رضی اللہ عنہم", startPage: 11001, endPage: 16500, hadithRange: "احادیث 11001 تا 16500" },
  { id: 6, volNum: "جلد ششم", title: "مسند الشامیین والکوفیین ومسند النساء", subtitle: "مسند عائشہ صدیقہ و امہات المؤمنین و صحابیات رضی اللہ عنہن", startPage: 16501, endPage: 26363, hadithRange: "احادیث 16501 تا 26363" }
];

export interface ChunkV2Item {
  number: number;
  arabic: string;
  urdu: string | null;
  translation_status: string;
  needs_review: boolean;
}

interface HadithCardDarsiViewProps {
  hadith: HadithItem;
  hadithNum: number;
  arabText: string;
  slug: string;
  bookTitle: string;
  currentPage: number;
  bookFontSize: number;
  arabicFontSize?: number;
  urduFontSize?: number;
  lineHeightScale?: number;
  isVerified: boolean;
  globalTashkeel: boolean;
  renderClickableArabic: (text: string, fullSentence?: string, translation?: string) => React.ReactNode;
  onOpenNarrator: (narrator: NarratorInfo) => void;
  onWordClick: (word: string, sentenceText?: string, translation?: string) => void;
}

function HadithCardDarsiView({
  hadith,
  hadithNum,
  arabText,
  slug,
  bookTitle,
  currentPage,
  bookFontSize: _bookFontSize,
  arabicFontSize = 26,
  urduFontSize = 20,
  lineHeightScale = 1.0,
  isVerified,
  globalTashkeel,
  renderClickableArabic,
  onOpenNarrator,
  onWordClick
}: HadithCardDarsiViewProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showWordByWord, setShowWordByWord] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [localTashkeel, setLocalTashkeel] = useState<boolean>(globalTashkeel);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [wordLimit, setWordLimit] = useState<number>(24);
  // Instant synchronous Darsi Analysis (zero network delay or loading hangs)
  const analysis = useMemo(() => {
    return getDarsiAnalysisSync(slug, hadithNum, arabText, hadith.urdu);
  }, [slug, hadithNum, arabText, hadith.urdu]);
  const loading = false;
  
  // Student Notes & Bookmarking in LocalStorage
  const noteKey = `tehreek_notes_${slug}_${hadithNum}`;
  const bmKey = `tehreek_bm_${slug}_${hadithNum}`;
  const [localNotes, setLocalNotes] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);

  useEffect(() => {
    setLocalTashkeel(globalTashkeel);
  }, [globalTashkeel]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedNote = localStorage.getItem(noteKey);
        if (savedNote) setLocalNotes(savedNote);
        const savedBm = localStorage.getItem(bmKey);
        if (savedBm === 'true') setIsBookmarked(true);
      }
    } catch {}
  }, [noteKey, bmKey]);

  const toggleBookmark = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(bmKey, next ? 'true' : 'false');
      }
    } catch {}
  };

  const handleSaveNote = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(noteKey, localNotes);
        setNoteSavedFeedback(true);
        setTimeout(() => setNoteSavedFeedback(false), 2500);
      }
    } catch {}
  };

  const handleClearNote = () => {
    if (typeof window !== 'undefined' && window.confirm('کیا آپ واقعی یہ ذاتی نوٹ حذف کرنا چاہتے ہیں؟')) {
      setLocalNotes('');
      try {
        localStorage.removeItem(noteKey);
      } catch {}
    }
  };

  const handleCopyWithRef = () => {
    const textToCopy = `【حدیث شریف】
${localTashkeel ? arabText : stripTashkeel(arabText)}

【سلیس اردو ترجمہ】
${hadith.urdu || analysis?.urduTranslation || ''}

📚 حوالہ: ${bookTitle} • حدیث شریف نمبر: ${hadithNum} (صفحہ ${(currentPage + 1).toLocaleString('ur-PK')})
🌐 ماخذ: تحریکِ ایمان اسلامی پورٹل • https://tehreek-e-iman.pages.dev/books/${slug}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2200);
    }
  };

  // Sanad vs Matn separation
  const { sanad, matn } = useMemo(() => {
    return segmentSanadAndMatn(arabText);
  }, [arabText]);

  // Display text respecting Tashkeel toggle
  const displaySanad = localTashkeel ? sanad : stripTashkeel(sanad);
  const displayMatn = localTashkeel ? (matn || arabText) : stripTashkeel(matn || arabText);

  // Render Sanad with compound clickable Narrator chips and interactive words
  const renderSanadText = () => {
    if (!sanad) return null;
    const segments = parseSanadNarratorSegments(displaySanad);
    return segments.map((seg, segIdx) => {
      if (seg?.type === 'narrator' && seg?.narrator) {
        const narrator = seg.narrator;
        const narratorName = safeName(narrator, seg?.text || 'راوی');
        const narratorRank = safeRank(narrator, 'راوٍ من رواة الإسناد');
        return (
          <span
            key={`narrator-${segIdx}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenNarrator) onOpenNarrator(narrator);
            }}
            className="inline-flex items-center gap-1.5 mx-1 rounded-lg bg-emerald-100/90 text-emerald-950 font-semibold hover:bg-emerald-200 border border-emerald-300 transition-colors cursor-pointer select-text shadow-2xs font-arabic"
            style={{ 
              fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
              fontSize: '1.25rem', 
              fontWeight: 600,
              padding: '3px 10px' 
            }}
            title={`راوی: ${narratorName} (${narratorRank}) — سوانح و توثیق کے لیے کلک کریں`}
          >
            <UserCheck className="w-4 h-4 text-emerald-800" />
            <span>{seg?.text || narratorName}</span>
          </span>
        );
      }

      const segText = seg?.text || '';
      const tokens = segText.split(/(\s+)/);
      return tokens.map((tok, tokIdx) => {
        if (/^\s+$/.test(tok)) return tok;
        return (
          <span
            key={`word-${segIdx}-${tokIdx}`}
            onClick={() => onWordClick && onWordClick(tok, arabText, hadith?.urdu || '')}
            className="cursor-pointer hover:bg-amber-100/60 rounded px-0.5 transition-colors select-text inline-block"
          >
            {tok}
          </span>
        );
      });
    });
  };

  return (
    <div 
      className="border border-gray-100/90 rounded-2xl p-4 sm:p-6 space-y-4 hover:border-emerald-200 transition-all bg-white shadow-2xs"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '280px' }}
    >
      {/* 1. Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-nastaliq">
            حدیث شریف نمبر: {hadithNum.toLocaleString('ur-PK')}
          </span>
          {isVerified ? (
            <span className="font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full font-nastaliq text-[11px]">
              ✓ تصدیق شدہ متن
            </span>
          ) : (
            <span className="font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-nastaliq text-[11px]">
              نسخۂ معتمد
            </span>
          )}
          {/* Note Presence Badge */}
          {localNotes && localNotes.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="inline-flex items-center gap-1 font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full font-nastaliq text-[11px] transition cursor-pointer shadow-2xs"
              title="ذاتی درسی نوٹ دیکھنے اور ترمیم کے لیے کلک کریں"
            >
              <FileEdit className="w-3 h-3 text-indigo-600" />
              <span>📝 ذاتی درسی نوٹ موجود ہے</span>
            </button>
          )}
          {isBookmarked && (
            <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-nastaliq text-[11px] shadow-2xs">
              <BookmarkCheck className="w-3 h-3 text-amber-600" />
              <span>محفوظ شدہ (بک مارک)</span>
            </span>
          )}
        </div>

        {/* Action Buttons Toolbar for Madaris Students */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Tashkeel Toggle Button */}
          <button
            type="button"
            onClick={() => setLocalTashkeel(!localTashkeel)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold font-nastaliq transition cursor-pointer border ${
              localTashkeel
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-100 text-amber-900 border-amber-300 font-black'
            }`}
            title="اعراب ہٹائیں / دکھائیں (طلبۂ درسِ نظامی کے لیے عبارت خوانی کی مشق)"
          >
            {localTashkeel ? <Eye className="w-3 h-3 text-emerald-700" /> : <EyeOff className="w-3 h-3 text-amber-800" />}
            <span>{localTashkeel ? 'مع اعراب' : 'بغیر اعراب (مشق)'}</span>
          </button>

          {/* Copy with Reference Button */}
          <button
            type="button"
            onClick={handleCopyWithRef}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold font-nastaliq bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-gray-200 transition cursor-pointer"
            title="عربی متن، اردو ترجمہ اور مکمل حوالہ کاپی کریں"
          >
            {copiedRef ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-stone-500" />}
            <span>{copiedRef ? 'کاپی ہو گیا' : 'حوالے کے ساتھ نقل کریں'}</span>
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={toggleBookmark}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold font-nastaliq border transition cursor-pointer shadow-2xs ${
              isBookmarked
                ? 'bg-amber-100 text-amber-950 border-amber-300 font-black'
                : 'bg-stone-50 hover:bg-amber-50 text-stone-600 hover:text-amber-900 border-gray-200'
            }`}
            title={isBookmarked ? 'محفوظ شدہ حدیث (بک مارک ہٹائیں)' : 'حدیث کو بک مارک میں محفوظ کریں'}
          >
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> : <Bookmark className="w-3.5 h-3.5 text-stone-500" />}
            <span>{isBookmarked ? 'محفوظ ہے' : 'بک مارک'}</span>
          </button>

          {/* Student Darsi Notes Button */}
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold font-nastaliq transition cursor-pointer border shadow-2xs ${
              showNotes
                ? 'bg-indigo-600 text-white border-indigo-700 font-black'
                : localNotes
                  ? 'bg-indigo-50 text-indigo-950 border-indigo-300 font-black'
                  : 'bg-stone-50 hover:bg-indigo-50 text-stone-600 hover:text-indigo-900 border-gray-200'
            }`}
            title="اس حدیث شریف پر اپنے درسی یا تحقیقی نوٹس لکھیں"
          >
            <FileEdit className={`w-3 h-3 ${showNotes ? 'text-white' : 'text-indigo-600'}`} />
            <span>{showNotes ? 'نوٹس بند کریں' : (localNotes ? 'ذاتی نوٹ (محفوظ)' : '+ درسی نوٹ')}</span>
          </button>
        </div>
      </div>

      {/* 2. Sanad Section (سندِ حدیث شریف) */}
      {sanad && (
        <div className="bg-stone-50/70 border border-stone-200/70 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-700 bg-stone-200/80 px-2.5 py-0.5 rounded-md font-nastaliq">
              <span>سندِ حدیث شریف (سلسلۂ اسناد)</span>
            </span>
            <span className="text-[10px] text-stone-400 font-nastaliq">
              💡 راوی کے نام پر کلک کر کے جرح و تعدیل دیکھیں
            </span>
          </div>
          <p
            className="font-arabic text-stone-800 text-right select-text leading-relaxed"
            dir="rtl"
            style={{ 
              fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
              fontSize: `${Math.round(arabicFontSize * 0.85)}px`, 
              fontWeight: 600,
              lineHeight: `${Math.round(arabicFontSize * 1.55 * (lineHeightScale || 1))}px` 
            }}
          >
            {renderSanadText()}
          </p>
        </div>
      )}

      {/* 3. المتن الأصلي (متنِ حدیث شریف) */}
      <div className="bg-amber-50/20 border border-amber-200/40 rounded-xl p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-300/70 px-2.5 py-0.5 rounded-md font-nastaliq">
            <BookOpen className="w-3.5 h-3.5 text-amber-800" />
            <span>متنِ حدیث مبارک (کلامِ نبوی ﷺ)</span>
          </span>
          <span className="text-[11px] text-stone-400 font-nastaliq">
            💡 ہر عربی لفظ پر کلک کر کے صرف و نحو دیکھیں
          </span>
        </div>
        <p
          className="font-arabic arabic-text text-right select-text px-1"
          dir="rtl"
          style={{ 
            fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
            fontSize: `${arabicFontSize}px`, 
            lineHeight: `${Math.round(arabicFontSize * 1.55 * (lineHeightScale || 1))}px`, 
            fontWeight: 500,
            color: '#111827' 
          }}
        >
          {renderClickableArabic(displayMatn, arabText, hadith.urdu)}
        </p>
      </div>

      {/* 4. سلیس اور با محاورہ اردو ترجمہ */}
      <div className="pt-2 border-t border-dashed border-gray-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-950 font-nastaliq flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
            <span>سلیس و با محاورہ اردو ترجمہ:</span>
          </span>
          {/* Word by word Toggle */}
          <button
            type="button"
            onClick={() => setShowWordByWord(!showWordByWord)}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold font-nastaliq bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition cursor-pointer"
          >
            <Layers className="w-3 h-3 text-emerald-800" />
            <span>{showWordByWord ? 'لفظی ترجمہ گرڈ چھپائیں' : 'لفظ بہ لفظ انٹرلینیئر ترجمہ'}</span>
          </button>
        </div>
        {(() => {
          let urduText = hadith.urdu || analysis?.urduTranslation || '';
          if (hadithNum === 1 && (slug || '').toLowerCase().includes('bukhari')) {
            if (urduText.startsWith('ہم سے حمیدی') || urduText.startsWith('کو حمیدی')) {
              urduText = urduText.replace(/^(?:ہم سے حمیدی نے بیان کیا، کہا ہم سے سفیان نے|کو حمیدی نے یہ حدیث بیان کی|ہم سے حمیدی عبد اللہ بن زبیر نے بیان کیا)/, 'ہم کو حمیدی نے یہ حدیث بیان کی');
            } else if (!urduText.startsWith('ہم کو حمیدی نے')) {
              urduText = 'ہم کو حمیدی نے یہ حدیث بیان کی، ' + urduText;
            }
          }
          return (
            <p
              className="urdu-text text-right select-text pr-1 font-nastaliq"
              dir="rtl"
              style={{ 
                fontSize: `${urduFontSize}px`, 
                lineHeight: `${Math.round(urduFontSize * 1.85 * (lineHeightScale || 1))}px`, 
                fontWeight: 500, 
                color: '#1f2937' 
              }}
            >
              {urduText || (loading ? 'ترجمہ کا تجزیہ جاری ہے...' : 'متنِ مبارک کے مطابق سلیس ترجمہ')}
            </p>
          );
        })()}
      </div>

      {/* 5. لفظ بہ لفظ انٹرلینیئر ترجمہ گرڈ (Word-by-Word Interlinear Grid) */}
      {showWordByWord && (
        <div className="pt-2 border-t border-emerald-100/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 font-nastaliq flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>لفظ بہ لفظ لغوی و صرفی تحقیق (انٹرلینیئر گرڈ):</span>
            </span>
            <span className="text-[10px] text-stone-400 font-nastaliq">
              💡 کسی بھی لفظ پر کلک کر کے مکمل باب و مادہ دیکھیں
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4 gap-2 text-stone-400 text-xs font-nastaliq">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              <span>لفظی تحقیق تیار ہو رہی ہے...</span>
            </div>
          ) : analysis?.wordByWord ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1" dir="rtl">
                {analysis.wordByWord.slice(0, wordLimit).map((wItem, wIdx) => (
                  <div
                    key={wIdx}
                    onClick={() => onWordClick(wItem.arabic, arabText, hadith.urdu)}
                    className="bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/80 rounded-xl p-2 text-center transition cursor-pointer flex flex-col justify-between shadow-2xs group"
                  >
                    <span className="font-arabic text-stone-900 font-bold text-base leading-relaxed group-hover:text-amber-950">
                      {localTashkeel ? wItem.arabic : stripTashkeel(wItem.arabic)}
                    </span>
                    <span className="urdu-text text-emerald-950 font-bold text-xs mt-1 border-t border-amber-200/50 pt-1 leading-snug">
                      {wItem.urdu}
                    </span>
                    <span className="text-[9px] text-stone-500 font-arabic mt-0.5 truncate block" title={wItem.sarf}>
                      {wItem.sarf.split('،')[0]}
                    </span>
                  </div>
                ))}
              </div>
              {analysis.wordByWord.length > 24 && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setWordLimit(prev => prev >= analysis.wordByWord.length ? 24 : analysis.wordByWord.length)}
                    className="px-3.5 py-1 rounded-xl text-xs font-bold font-nastaliq bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300/80 transition cursor-pointer shadow-2xs"
                  >
                    {wordLimit >= analysis.wordByWord.length
                      ? 'کم الفاظ دکھائیں (پہلے 24 الفاظ)'
                      : `مزید الفاظ دیکھیں (+${analysis.wordByWord.length - wordLimit} الفاظ)`}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* 6. ذاتی علمی نوٹس (Personal Study Notes & Marginalia) */}
      {showNotes && (
        <div className="bg-gradient-to-b from-indigo-50/80 to-indigo-50/30 border-2 border-indigo-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs" dir="rtl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h4 className="font-bold font-nastaliq text-xs sm:text-sm text-indigo-950 flex items-center gap-1.5">
                <FileEdit className="w-4 h-4 text-indigo-700" />
                <span>ذاتی علمی و درسی نوٹس (برائے طلبۂ درسِ نظامی، اساتذہ و محققین)</span>
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-nastaliq">
              {noteSavedFeedback && (
                <span className="text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md font-bold animate-pulse">
                  ✓ نوٹ کامیابی سے محفوظ ہو گیا!
                </span>
              )}
              <span className="text-stone-400 bg-white/80 px-2 py-0.5 rounded-md border border-indigo-100 text-[10px]">
                خودکار محفوظ (LocalStorage)
              </span>
            </div>
          </div>

          {/* Quick Annotation Helper Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-nastaliq">
            <span className="text-indigo-900 font-bold ml-1">فوری ٹیگز شامل کریں:</span>
            {[
              '【امتحانی نکتہ】',
              '【فقہی مسئلہ】',
              '【تحقیق سند و رجال】',
              '【استاد محترم کا نکتہ】',
              '【لغوی بحث】'
            ].map((tag, tagIdx) => (
              <button
                key={tagIdx}
                type="button"
                onClick={() => {
                  const updated = localNotes ? `${localNotes}\n${tag} ` : `${tag} `;
                  setLocalNotes(updated);
                  try {
                    localStorage.setItem(noteKey, updated);
                  } catch {}
                }}
                className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200 text-[10px] font-bold transition cursor-pointer shadow-2xs"
              >
                + {tag}
              </button>
            ))}
          </div>

          <textarea
            value={localNotes}
            onChange={(e) => {
              setLocalNotes(e.target.value);
              try {
                localStorage.setItem(noteKey, e.target.value);
              } catch {}
            }}
            placeholder="اس حدیث مبارک پر اپنے درسی نوٹس، اساتذہ کے اہم نکات، فقہی جزئیات، اشکال و جواب یا امتحانی فوائد درج فرمائیں..."
            className="w-full p-3 sm:p-4 bg-white border border-indigo-200/90 rounded-xl text-xs sm:text-sm font-nastaliq text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition resize-y min-h-[90px] leading-relaxed shadow-inner"
            rows={4}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-100 text-xs font-nastaliq">
            <div className="flex items-center gap-2 text-stone-400 text-[11px]">
              <span>الفاظ: {localNotes.trim() ? localNotes.trim().split(/\s+/).length : 0}</span>
              <span>•</span>
              <span>حروف: {localNotes.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {localNotes && (
                <button
                  type="button"
                  onClick={handleClearNote}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-red-700 hover:bg-red-50 border border-red-200 transition cursor-pointer flex items-center gap-1"
                  title="نوٹ حذف کریں"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                  <span>حذف کریں</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 text-amber-300" />
                <span>نوٹ محفوظ کریں (Save Note)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. روزمرہ زندگی کا سبق (عملی تربیت) — Dedicated Takeaway Box for Awam-un-Naas */}
      {analysis?.islahAamal && (
        <DailyLifeTakeawayBox
          lessonPoints={analysis.islahAamal.lessonPoints}
          amalNuskha={analysis.islahAamal.amalNuskha}
          hadithNumber={hadithNum}
        />
      )}

      {/* 8. درسی تجزیہ، اعراب، تشریح اور تخریج (Interactive Toggle) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer border ${
            isOpen 
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs' 
              : 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950 border-emerald-200/80'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5" />
            <span>{isOpen ? 'درسی حل، اعراب و تخریج بند کریں' : 'درسی حل و تحقیقی تجزیہ (تشریح، اعراب و تخریج)'}</span>
          </span>
          <span className="text-[11px] font-mono">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="mt-3 space-y-3 pt-1">
            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-stone-400 text-xs font-nastaliq">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span>درسی حل تیار ہو رہا ہے...</span>
              </div>
            ) : analysis ? (
              <div className="space-y-3">
                {/* Tashreeh & Fiqhi Schools */}
                <DarsiTashreehSectionView tashreehText={analysis.tashreeh} />

                {/* Mahal-e-I'rab & Nahwi Tarkeeb */}
                <IraabSectionView iraabLines={analysis.iraab} />

                {/* Comparative Fiqh across the 4 Madhahib (مقارنہ بین المذاہب) */}
                {analysis.comparativeFiqh && (
                  <ComparativeFiqhBox data={analysis.comparativeFiqh} />
                )}

                {/* تخریج و حوالہ جات (Cross-References & Takhreej) */}
                {analysis.takhreejData && (
                  <AdvancedTakhreejBox data={analysis.takhreejData} />
                )}

                {/* Hawashi & Takhrij */}
                <div className="bg-amber-50/40 rounded-xl p-3.5 border border-amber-200/60 shadow-2xs space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-950 font-nastaliq flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span>حواشی، تخریج و درسی فوائد:</span>
                  </h4>
                  <div className="arabic-naskh text-sm sm:text-base leading-[2.3] text-stone-700 space-y-1.5 pr-1 select-text" dir="rtl">
                    {analysis.hawashi.map((hw, hwidx) => (
                      <p key={hwidx}>{hw}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// Global in-memory cache for dynamically chunked books (e.g. musnad-ahmad)
const chunkGlobalCache: Record<string, Record<number, string[]>> = {};

export default function BookDetailPage({ slugProp }: { slugProp?: string } = {}) {
  const params = useParams();
  const getSlugFromLocation = () => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/(?:books|book)\/([^/?#]+)/i);
      if (match && match[1]) return decodeURIComponent(match[1]);
      const search = new URLSearchParams(window.location.search);
      const b = search.get('book') || search.get('slug') || search.get('id');
      if (b) return decodeURIComponent(b);
    }
    return '';
  };
  const rawSlug = slugProp || (params?.slug as string) || getSlugFromLocation();
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // Find book in publicDomainBooks catalog with robust fallback across catalogs
  const book = useMemo((): PublicDomainBook => {
    const cleanSlug = slug.toLowerCase().trim();

    // 1. Check publicDomainBooks
    const foundPublic = (
      publicDomainBooks.find(b => b.slug.toLowerCase() === cleanSlug || b.id.toLowerCase() === cleanSlug) ||
      publicDomainBooks.find(b => cleanSlug.includes(b.slug.toLowerCase()) || b.slug.toLowerCase().includes(cleanSlug))
    );
    if (foundPublic) return foundPublic;

    // 2. Check modernBooks
    const foundModern = modernBooks.find(b => b.slug.toLowerCase() === cleanSlug || b.id.toLowerCase() === cleanSlug);
    if (foundModern) {
      return {
        ...foundModern,
        pages: [],
        source_type: 'public' as const,
      } as PublicDomainBook;
    }

    // 3. Check booksDatabase
    const foundDb = booksDatabase.find(b => b.id.toLowerCase() === cleanSlug || b.id.toLowerCase().replace(/_/g, '-') === cleanSlug);
    if (foundDb) {
      return {
        id: foundDb.id,
        slug: foundDb.id,
        title_ur: foundDb.subjectNameUrdu || foundDb.title,
        title_ar: foundDb.title,
        title: foundDb.title,
        author: foundDb.author,
        death_year: '',
        category: (foundDb.category === 'sittah' ? 'Hadith' : 'Dars-e-Nizami') as BookCategoryTitle,
        pages: foundDb.chapters ? foundDb.chapters.map(c => {
          const segs = c.segments || [];
          const ar = segs.map(s => s.arabicText).join('\n\n');
          const ur = segs.map(s => s.urduTranslation).join('\n\n');
          return `【${c.titleArabic || c.titleUrdu}】\n${ar}\n\n【اردو ترجمہ】\n${ur}`;
        }) : [],
        volumes: 1,
        intro_ur: foundDb.description,
        cover_url: '/covers/default.svg',
        source_type: 'public' as const,
      } as PublicDomainBook;
    }

    // 4. Canonical Hadith fallback if known
    const canonical = HADITH_TOTALS[cleanSlug] || (HADITH_FILE_MAP[cleanSlug] ? HADITH_TOTALS[HADITH_FILE_MAP[cleanSlug]] : null);
    const urduTitle = canonical ? canonical.urduName : cleanSlug.replace(/[-_]/g, ' ');
    return {
      id: cleanSlug || 'book',
      slug: cleanSlug || 'book',
      title_ur: urduTitle,
      title_ar: urduTitle,
      title: urduTitle,
      author: 'امام و محدث',
      death_year: '',
      category: 'Hadith' as BookCategoryTitle,
      pages: [],
      volumes: 1,
      intro_ur: `مجموعہ کتبِ اسلامی — ${urduTitle}`,
      cover_url: '/covers/default.svg',
      source_type: 'public' as const,
    } as PublicDomainBook;
  }, [slug]);

  // Check if book matches local hadith collection file
  const hadithFileKey = useMemo(() => {
    if (HADITH_FILE_MAP[slug]) return HADITH_FILE_MAP[slug];
    if (book) {
      if (HADITH_FILE_MAP[book.slug]) return HADITH_FILE_MAP[book.slug];
      if (HADITH_FILE_MAP[book.id]) return HADITH_FILE_MAP[book.id];
      const s = (book.slug + ' ' + book.id).toLowerCase();
      if (s.includes("bukhari")) return "sahih-bukhari";
      if (s.includes("muslim")) return "sahih-muslim";
      if (s.includes("abu-dawood") || s.includes("abu-daud")) return "sunan-abu-daud";
      if (s.includes("tirmidhi") || s.includes("tirmizi")) return "jami-tirmizi";
      if (s.includes("nasai")) return "sunan-nasai";
      if (s.includes("ibn-majah")) return "sunan-ibn-majah";
    }
    return null;
  }, [slug, book]);

  // Check if book uses dynamic chunking (Musnad Ahmad: 524 pages divided into 100-page chunks)
  const isChunkedBook = useMemo(() => {
    const s = slug.toLowerCase();
    const bSlug = (book?.slug || '').toLowerCase();
    const bId = (book?.id || '').toLowerCase();
    return s === 'musnad-ahmad' || s === 'musnad_ahmad' || bSlug === 'musnad-ahmad' || bId === 'musnad-ahmad';
  }, [slug, book]);

  // Check if current book is the Noble Quran (114 Surahs)
  const isQuran = useMemo(() => {
    const s = slug.toLowerCase();
    const bSlug = (book?.slug || '').toLowerCase();
    const bId = (book?.id || '').toLowerCase();
    return s === 'quran' || s === 'al-quran' || bSlug === 'quran' || bId === 'quran';
  }, [slug, book]);

  const [chunkCache, setChunkCache] = useState<Record<number, string[]>>(() => {
    return chunkGlobalCache['musnad-ahmad'] || {};
  });
  const [chunkLoading, setChunkLoading] = useState<boolean>(false);
  const [chunkMetaTotalPages, setChunkMetaTotalPages] = useState<number | null>(null);

  useEffect(() => {
    if (!isChunkedBook) return;
    fetch(`/data/musnad-ahmad/chunks/meta.json?v=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(meta => {
        if (meta?.totalPages && typeof meta.totalPages === 'number') {
          setChunkMetaTotalPages(meta.totalPages);
        }
      })
      .catch(() => {});
  }, [isChunkedBook]);

  // Pagination state: 0-indexed (initializes from ?page= or ?p= query param if present)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const search = new URLSearchParams(window.location.search);
        const p = search.get('page') || search.get('p');
        if (p) {
          const num = parseInt(p, 10);
          if (!isNaN(num) && num > 0) return num - 1;
        }
      } catch {
        // ignore
      }
    }
    return 0;
  });

  // Sync currentPage from URL when slug changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const search = new URLSearchParams(window.location.search);
        const p = search.get('page') || search.get('p');
        if (p) {
          const num = parseInt(p, 10);
          if (!isNaN(num) && num > 0) {
            setCurrentPage(num - 1);
            return;
          }
        }
        setCurrentPage(0);
      } catch {}
    }
  }, [slug]);

  // Sync currentPage to URL query parameter (?page=N)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const pageNum = currentPage + 1;
        if (url.searchParams.get('page') !== pageNum.toString()) {
          url.searchParams.set('page', pageNum.toString());
          window.history.replaceState(null, '', url.toString());
        }
      } catch {
        // ignore
      }
    }
  }, [currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      try {
        const search = new URLSearchParams(window.location.search);
        const p = search.get('page') || search.get('p');
        if (p) {
          const num = parseInt(p, 10);
          if (!isNaN(num) && num > 0) {
            setCurrentPage(num - 1);
            return;
          }
        }
        setCurrentPage(0);
      } catch {}
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('tehreek:navigate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('tehreek:navigate', handlePopState);
    };
  }, []);

  const currentVolume = useMemo(() => {
    if (!isChunkedBook) return null;
    const p = currentPage + 1;
    return MUSNAD_VOLUMES.find(v => p >= v.startPage && p <= v.endPage) || MUSNAD_VOLUMES[0];
  }, [isChunkedBook, currentPage]);

  const quranSurah = useMemo(() => {
    if (!isQuran) return null;
    return quranChapters[currentPage] || quranChapters[0] || null;
  }, [isQuran, currentPage]);

  const quranMeta = useMemo(() => {
    if (!isQuran) return null;
    return QURAN_SURAHS_CANONICAL[currentPage] || QURAN_SURAHS_CANONICAL[0] || null;
  }, [isQuran, currentPage]);

  const handleSelectVolume = (vol: MusnadVolume) => {
    setCurrentPage(vol.startPage - 1);
    jumpToTopOfPage();
  };

  const [allHadiths, setAllHadiths] = useState<HadithItem[]>(() => {
    return (hadithFileKey && hadithGlobalCache[hadithFileKey]) || [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return Boolean(hadithFileKey && (!hadithGlobalCache[hadithFileKey] || hadithGlobalCache[hadithFileKey].length === 0));
  });
  const [searchPageQuery, setSearchPageQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isStylerOpen, setIsStylerOpen] = useState<boolean>(false);
  // In-book content search
  const [contentSearch, setContentSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showScholarlySections, setShowScholarlySections] = useState<boolean>(true);
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [lookupContext, setLookupContext] = useState<WordLookupContextInfo | null>(null);
  
  // Madaris Student & Ulama Specialized Tools State
  const [globalTashkeel, setGlobalTashkeel] = useState<boolean>(true);
  const [activeNarrator, setActiveNarrator] = useState<NarratorInfo | null>(null);
  const [showPageWordByWord, setShowPageWordByWord] = useState<boolean>(false);
  const [pageWordLimit, setPageWordLimit] = useState<number>(24);
  const [showPageNotes, setShowPageNotes] = useState<boolean>(false);
  const [pageNotes, setPageNotes] = useState<string>('');
  const [isPageBookmarked, setIsPageBookmarked] = useState<boolean>(false);
  const [copiedPageRef, setCopiedPageRef] = useState<boolean>(false);
  const [activeTafseer, setActiveTafseer] = useState<TafseerEntry | null>(null);
  const [isTafseerOpen, setIsTafseerOpen] = useState<boolean>(false);
  const [quranViewMode, setQuranViewMode] = useState<'mushaf' | 'interlinear'>('mushaf');
  const [sidebarTab, setSidebarTab] = useState<'pages' | 'chapters'>('pages');

  // Focus / Dars Mode (پر سکون مطالعہ موڈ برائے طلبۂ درسِ نظامی و اساتذہ)
  const [isDarsMode, setIsDarsMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('tehreek_dars_mode') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const toggleDarsMode = () => {
    setIsDarsMode(prev => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('tehreek_dars_mode', next ? 'true' : 'false');
        }
      } catch {}
      return next;
    });
  };

  const { t: _t } = usePortalLanguage();

  // Interactive Typography & Zoom Controls (Phase 6)
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tehreek_reader_arabic_font_size');
        if (saved) {
          const num = parseInt(saved, 10);
          if (!isNaN(num) && num >= 18 && num <= 44) return num;
        }
      } catch {}
    }
    return 26;
  });

  const [urduFontSize, setUrduFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tehreek_reader_urdu_font_size');
        if (saved) {
          const num = parseInt(saved, 10);
          if (!isNaN(num) && num >= 15 && num <= 38) return num;
        }
      } catch {}
    }
    return 20;
  });

  const [lineHeightScale, setLineHeightScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tehreek_reader_line_scale');
        if (saved) {
          const num = parseFloat(saved);
          if (!isNaN(num) && num >= 0.8 && num <= 1.5) return num;
        }
      } catch {}
    }
    return 1.0;
  });

  const [isFontSizeModalOpen, setIsFontSizeModalOpen] = useState<boolean>(false);

  const handleUpdateArabicFontSize = (size: number) => {
    setArabicFontSize(size);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tehreek_reader_arabic_font_size', size.toString());
        document.documentElement.style.setProperty('--arabic-font-size', `${size}px`);
      }
    } catch {}
  };

  const handleUpdateUrduFontSize = (size: number) => {
    setUrduFontSize(size);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tehreek_reader_urdu_font_size', size.toString());
        document.documentElement.style.setProperty('--urdu-font-size', `${size}px`);
      }
    } catch {}
  };

  const handleUpdateLineHeightScale = (scale: number) => {
    setLineHeightScale(scale);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tehreek_reader_line_scale', scale.toString());
      }
    } catch {}
  };

  const handleResetTypography = () => {
    handleUpdateArabicFontSize(26);
    handleUpdateUrduFontSize(20);
    handleUpdateLineHeightScale(1.0);
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const pNum = currentPage + 1;
        const savedNote = localStorage.getItem(`tehreek_notes_${slug || 'book'}_p${pNum}`);
        setPageNotes(savedNote || '');
        const savedBm = localStorage.getItem(`tehreek_bm_${slug || 'book'}_p${pNum}`);
        setIsPageBookmarked(savedBm === 'true');
      }
    } catch {}
  }, [slug, currentPage]);

  const togglePageBookmark = () => {
    const next = !isPageBookmarked;
    setIsPageBookmarked(next);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`tehreek_bm_${slug || 'book'}_p${currentPage + 1}`, next ? 'true' : 'false');
      }
    } catch {}
  };

  const handleCopyPageWithRef = () => {
    if (!parsedDarsPage) return;
    const arabicToCopy = globalTashkeel ? parsedDarsPage.matn : stripTashkeel(parsedDarsPage.matn);
    const urduToCopy = parsedDarsPage.urduTranslation || pipelineAnalysis?.urduTranslation || '';
    const textToCopy = `【متنِ کتاب (عربی)】
${arabicToCopy}

【سلیس اردو ترجمہ】
${urduToCopy}

📚 حوالہ: ${book?.title_ur || 'کتاب'} • صفحہ ${(currentPage + 1).toLocaleString('ur-PK')}
🌐 ماخذ: تحریکِ ایمان اسلامی پورٹل • https://tehreek-e-iman.pages.dev/books/${slug}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedPageRef(true);
      setTimeout(() => setCopiedPageRef(false), 2200);
    }
  };

  const handleWordClick = (word: string, sentenceText?: string, translation?: string) => {
    const cleaned = word.replace(/[.,:;!?()،؛؟"«»۝0-9٠-٩]/g, '').trim();
    if (!cleaned) return;
    setLookupWord(cleaned);
    setLookupContext({
      bookTitle: book?.title_ur || book?.title_ar || 'مسند احمد بن حنبل',
      chapterTitle: `صفحہ ${currentPage + 1}`,
      sentenceText: sentenceText || '',
      urduTranslation: translation || '',
      rawWord: word,
    });
  };

  const renderClickableArabic = (text: string, fullSentence?: string, translation?: string) => {
    if (!text) return null;
    const displayText = globalTashkeel ? text : stripTashkeel(text);
    return displayText.split(/(\s+)/).map((token, i) => {
      if (/^\s+$/.test(token)) return token;
      return (
        <span
          key={i}
          onClick={() => handleWordClick(token, fullSentence || text, translation)}
          className="cursor-pointer hover:bg-amber-200/70 hover:text-amber-950 rounded px-0.5 transition-colors select-text inline-block"
          title="لغوی، صرفی و نحوی تحقیق کے لیے کلک کریں"
        >
          {token}
        </span>
      );
    });
  };
  const [userReviewStatus, setUserReviewStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const local = localStorage.getItem('tehreek_review_status');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed?.verified_by_user) {
          setUserReviewStatus(parsed.verified_by_user);
          return;
        }
      }
    } catch {}

    fetch('/review_status.json')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.verified_by_user) {
          setUserReviewStatus(data.verified_by_user);
        }
      })
      .catch(() => {});
  }, []);
  const readerTopRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  // Instant top-of-page scroll handler: ensures the reader starts directly at the beginning of the page
  const jumpToTopOfPage = () => {
    if (typeof window === 'undefined') return;
    const target = mainContentRef.current || readerTopRef.current;
    if (target) {
      const navBarHeight = 65;
      const rect = target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const targetY = Math.max(0, rect.top + scrollTop - navBarHeight);

      const prevScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';

      try {
        window.scrollTo({
          top: targetY,
          behavior: 'instant' as ScrollBehavior,
        });
      } catch {
        window.scrollTo(0, targetY);
      }
      document.documentElement.scrollTop = targetY;
      document.body.scrollTop = targetY;

      if (prevScrollBehavior) {
        document.documentElement.style.scrollBehavior = prevScrollBehavior;
      } else {
        document.documentElement.style.removeProperty('scroll-behavior');
      }
    } else {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Instant top-of-page navigation whenever page changes (اگلا صفحہ، پچھلا صفحہ، یا فہرست سے انتخاب)
  useEffect(() => {
    jumpToTopOfPage();
    const rafId = requestAnimationFrame(() => {
      jumpToTopOfPage();
    });
    return () => cancelAnimationFrame(rafId);
  }, [currentPage]);

  // When opening any book, immediately bring the top of the reading page into view
  useEffect(() => {
    jumpToTopOfPage();
    const t1 = setTimeout(jumpToTopOfPage, 40);
    const t2 = setTimeout(jumpToTopOfPage, 120);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [slug]);

  // Isolated Book Font Size (16px to 28px in 2px steps, default 20px) & Line Height (24px to 50px)
  const [bookFontSize, setBookFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bookFontSize');
        localStorage.removeItem('urduFontSize');
        localStorage.removeItem('urdu_font_size');
        const saved = localStorage.getItem('bookFontSize_v2');
        if (saved !== null && saved !== undefined) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 16 && parsed <= 28) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return 20;
  });

  const [bookLineHeight, setBookLineHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bookLineHeight') || localStorage.getItem('urdu_line_height');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 24 && parsed <= 50) return parsed;
      }
    }
    return 34;
  });

  // Apply CSS variable on mount and on bookFontSize change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--book-font-size', `${bookFontSize}px`);
    }
    try {
      localStorage.setItem('bookFontSize_v2', bookFontSize.toString());
      localStorage.removeItem('bookFontSize');
      localStorage.removeItem('urduFontSize');
      localStorage.removeItem('urdu_font_size');
    } catch {
      // ignore
    }
  }, [bookFontSize]);

  // Mobile pinch-to-zoom & toast state
  const bookContentRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const bookFontSizeRef = useRef(bookFontSize);

  useEffect(() => {
    bookFontSizeRef.current = bookFontSize;
  }, [bookFontSize]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 1200);
  };

  const changeBookFontSize = (delta: number) => {
    setBookFontSize(prev => {
      const next = Math.min(28, Math.max(16, prev + delta));
      try {
        localStorage.setItem('bookFontSize_v2', next.toString());
        localStorage.removeItem('bookFontSize');
        localStorage.removeItem('urduFontSize');
        localStorage.removeItem('urdu_font_size');
      } catch {
        // ignore
      }
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--book-font-size', `${next}px`);
      }
      showToast(`فونٹ سائز: ${next}px`);
      return next;
    });
  };

  const resetBookFontSize = () => {
    setBookFontSize(20);
    setBookLineHeight(34);
    try {
      localStorage.setItem('bookFontSize_v2', '20');
      localStorage.removeItem('bookFontSize');
      localStorage.removeItem('urduFontSize');
      localStorage.removeItem('urdu_font_size');
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--book-font-size', '20px');
    }
    showToast(`فونٹ سائز: 20px`);
  };

  useEffect(() => {
    const el = bookContentRef.current || mainContentRef.current;
    if (!el) return;

    let initialDist = 0;
    let initialSize = bookFontSizeRef.current;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialSize = bookFontSizeRef.current;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDist > 0) {
        if (e.cancelable) e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = currentDist - initialDist;
        const stepChange = Math.round(diff / 22) * 2;
        const newSize = Math.min(28, Math.max(16, initialSize + stepChange));
        if (newSize !== bookFontSizeRef.current) {
          bookFontSizeRef.current = newSize;
          setBookFontSize(newSize);
          if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--book-font-size', `${newSize}px`);
          }
          try {
            localStorage.setItem('bookFontSize_v2', newSize.toString());
          } catch {
            // ignore
          }
          showToast(`فونٹ سائز: ${newSize}px`);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDist = 0;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Load 100% full dataset from local JSON files (public/hadith-data/[slug].json)
  useEffect(() => {
    if (!hadithFileKey) {
      setLoading(false);
      return;
    }

    if (hadithGlobalCache[hadithFileKey] && hadithGlobalCache[hadithFileKey].length > 0) {
      setAllHadiths(hadithGlobalCache[hadithFileKey]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch directly from local JSON in public/hadith-data/
    fetch(`/hadith-data/${hadithFileKey}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        const rawList: any[] = data?.hadiths || (Array.isArray(data) ? data : []);
        if (rawList.length > 0) {
          const formatted: HadithItem[] = rawList.map((h, idx) => ({
            hadithnumber: h.hadithnumber || h.number || (idx + 1),
            number: h.hadithnumber || h.number || (idx + 1),
            arab: h.arab || h.text || '',
            urdu: h.urdu || ''
          }));
          hadithGlobalCache[hadithFileKey] = formatted;
          setAllHadiths(formatted);
        } else {
          setAllHadiths([]);
        }
      })
      .catch(err => {
        console.warn('Local hadith-data fetch error, using fallback:', err);
        // Fallback to jsdelivr CDN if local file is unreachable
        const editionName = hadithFileKey.replace('sahih-', '').replace('sunan-', '').replace('jami-', '');
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${editionName}.min.json`)
          .then(r => r.json())
          .then(cdnData => {
            const list = cdnData?.hadiths || [];
            const formatted = list.map((h: any, idx: number) => ({
              hadithnumber: h.hadithnumber || (idx + 1),
              number: h.hadithnumber || (idx + 1),
              arab: h.text || '',
              urdu: ''
            }));
            hadithGlobalCache[hadithFileKey] = formatted;
            setAllHadiths(formatted);
          })
          .catch(() => setAllHadiths([]));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hadithFileKey]);

  if (!book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <BookMarked className="w-12 h-12 text-emerald-800 mx-auto mb-3" />
          <h1 className="text-2xl font-black mb-2 text-emerald-950 font-nastaliq">کتاب نہیں ملی</h1>
          <p className="text-sm text-stone-500 mb-6 font-nastaliq">مطلوبہ کتاب کا ریکارڈ کتب خانہ میں دستیاب نہیں۔</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white font-bold text-sm bg-emerald-800 hover:bg-emerald-900 transition shadow font-nastaliq"
          >
            <span>کتب خانہ پر واپس جائیں</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic Chunking Index Calculation (Musnad Ahmad: 1500 verified pages, 100 pages per chunk)
  const currentChunkIndex = Math.floor(currentPage / 100);
  const pageIndexInChunk = currentPage % 100;

  useEffect(() => {
    if (!isChunkedBook) return;
    const bookKey = 'musnad-ahmad';

    if (chunkGlobalCache[bookKey]?.[currentChunkIndex]) {
      setChunkCache(prev => ({
        ...prev,
        [currentChunkIndex]: chunkGlobalCache[bookKey][currentChunkIndex]
      }));
      setChunkLoading(false);
      return;
    }

    setChunkLoading(true);
    fetch(`/data/musnad-ahmad/chunks/chunk-${currentChunkIndex}.json?v=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: string[]) => {
        if (!chunkGlobalCache[bookKey]) {
          chunkGlobalCache[bookKey] = {};
        }
        chunkGlobalCache[bookKey][currentChunkIndex] = data;
        setChunkCache(prev => ({
          ...prev,
          [currentChunkIndex]: data
        }));
      })
      .catch(err => {
        console.warn('Error fetching book chunk:', err);
      })
      .finally(() => {
        setChunkLoading(false);
      });
  }, [isChunkedBook, currentChunkIndex]);

  // Slicing & Pagination:
  // For Hadith collections: 20 Ahadith per page (No 500 limit! Covers all 7589, 7563, etc.)
  // Note: Chunked books like Musnad Ahmad (26,363 entries across 264 chunks) use Darsi chunked reader, NOT 20-hadith local array.
  const isHadith = Boolean((hadithFileKey || (book?.category === 'Hadith' && !isChunkedBook)) && !isChunkedBook);
  const PER_PAGE = 20;

  const totalHadithsCount = allHadiths.length > 0
    ? allHadiths.length
    : (hadithFileKey && HADITH_TOTALS[hadithFileKey]?.total) || (book?.category === 'Hadith' ? 7500 : 0);

  const bookPageCount = typeof book?.pages === 'number' ? book.pages : (Array.isArray(book?.pages) ? book.pages.length : (book?.totalPages || 0));

  const totalPages: number = isHadith
    ? Math.max(1, Math.ceil(totalHadithsCount / PER_PAGE))
    : isChunkedBook
      ? (chunkMetaTotalPages || bookPageCount || 26363)
      : isQuran
        ? 114
        : Math.max(1, bookPageCount || 50);

  const bookChaptersList = useMemo(() => {
    if (isQuran) {
      return QURAN_SURAHS_CANONICAL.map((s) => ({
        id: `quran_${s.number}`,
        titleAr: s.nameArabic,
        titleUr: s.nameUrdu,
        startPage: s.number,
        detail: `پارہ ${s.juz} • آیات ${s.ayahCount} • ${s.revelationType}`
      }));
    }
    if (isChunkedBook) {
      return MUSNAD_VOLUMES.map((v) => ({
        id: `musnad_${v.id}`,
        titleAr: v.title,
        titleUr: `${v.volNum} — ${v.title}`,
        startPage: v.startPage,
        detail: `${v.subtitle} • ${v.hadithRange}`
      }));
    }
    // Check specific Hadith collections
    const slugLower = (slug || '').toLowerCase();
    let rawChapters: any[] = [];
    if (slugLower.includes('bukhari')) {
      rawChapters = bukhariChapters;
    } else if (slugLower.includes('muslim')) {
      rawChapters = muslimChapters;
    } else if (slugLower.includes('abu-dawood') || slugLower.includes('abu-daud')) {
      rawChapters = abudawoodChapters;
    } else if (slugLower.includes('tirmidhi') || slugLower.includes('tirmizi')) {
      rawChapters = tirmidhiChapters;
    } else if (slugLower.includes('nasai')) {
      rawChapters = nasaiChapters;
    } else if (slugLower.includes('ibn-majah')) {
      rawChapters = ibnmajahChapters;
    } else if (book?.pages && book.pages.length > 0) {
      return book.pages.map((p, idx) => {
        const firstLine = p.split('\n')[0].replace(/【|】/g, '').trim() || `باب ${idx + 1}`;
        return {
          id: `page_${idx + 1}`,
          titleAr: firstLine,
          titleUr: `صفحہ ${(idx + 1).toLocaleString('ur-PK')}`,
          startPage: idx + 1,
          detail: `صفحہ ${idx + 1}`
        };
      });
    }

    if (rawChapters && rawChapters.length > 0) {
      return rawChapters.map((ch, idx) => {
        const match = ch.titleArabic?.match(/رقم:\s*(\d+)/) || ch.titleArabic?.match(/حَدِيث:\s*(\d+)/);
        const hadithNum = match ? parseInt(match[1], 10) : (idx * 20 + 1);
        const startPage = Math.max(1, Math.min(totalPages, Math.floor((hadithNum - 1) / PER_PAGE) + 1));
        return {
          id: ch.id || `ch_${idx}`,
          titleAr: ch.titleArabic || `باب ${idx + 1}`,
          titleUr: ch.titleUrdu || `باب ${idx + 1}`,
          startPage,
          hadithNum,
          detail: `حدیث ${hadithNum} (ص ${startPage})`
        };
      });
    }

    const count = Math.ceil(totalPages / 25);
    return Array.from({ length: Math.max(1, count) }, (_, idx) => {
      const p = idx * 25 + 1;
      return {
        id: `section_${idx + 1}`,
        titleAr: `${book?.title_ar || book?.title || 'باب'} — الجزء ${idx + 1}`,
        titleUr: `حصہ ${idx + 1} (صفحات ${p} تا ${Math.min(totalPages, (idx + 1) * 25)})`,
        startPage: p,
        detail: `صفحہ ${p}`
      };
    });
  }, [isQuran, isChunkedBook, slug, book, totalPages]);

  const currentChapter = useMemo(() => {
    if (!bookChaptersList || bookChaptersList.length === 0) return null;
    const currentP = currentPage + 1;
    const firstHadithOnPage = (currentP - 1) * PER_PAGE + 1;

    // For Page 1, always return the very first chapter
    if (currentPage === 0) {
      return bookChaptersList[0];
    }

    // For Hadith collections that have hadithNum on chapters
    if (isHadith) {
      let found = bookChaptersList[0];
      for (const ch of bookChaptersList) {
        const hNum = (ch as any).hadithNum ?? ((ch.startPage - 1) * PER_PAGE + 1);
        if (hNum <= firstHadithOnPage) {
          found = ch;
        } else {
          break;
        }
      }
      return found;
    }

    let found = bookChaptersList[0];
    for (const ch of bookChaptersList) {
      if (ch.startPage <= currentP) {
        found = ch;
      } else {
        break;
      }
    }
    return found;
  }, [bookChaptersList, currentPage, isHadith]);

  const isBukhari = (slug || '').toLowerCase().includes('bukhari') || 
                    (book?.id || '').toLowerCase().includes('bukhari') || 
                    (book?.slug || '').toLowerCase().includes('bukhari');
  const isBukhariP1 = isBukhari && currentPage === 0;
  const bannerAr = isBukhariP1
    ? 'كِتَابُ بَدْءِ الْوَحْيِ - بَابُ كَيْفَ كَانَ بَدْءُ الْوَحْيِ إِلَى رَسُولِ اللَّهِ ﷺ'
    : (currentChapter?.titleAr || book?.title_ar || book?.title || 'كتاب الحديث الشريف');
  const bannerUr = isBukhariP1
    ? 'کتاب بدء الوحی - وحی کی ابتدا کا بیان'
    : (currentChapter?.titleUr || book?.title_ur || book?.title || 'کتاب');

  const bukhariTarjamah = useMemo(() => {
    if (!isBukhari) return null;
    const startHadith = currentPage * PER_PAGE + 1;
    return getBukhariTarjamahInfo(bannerAr, bannerUr, startHadith, currentPage);
  }, [isBukhari, bannerAr, bannerUr, currentPage, PER_PAGE]);

  const currentHadiths = useMemo(() => {
    if (!isHadith) return [];
    return allHadiths.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);
  }, [isHadith, allHadiths, currentPage]);

  const currentChunkPage = useMemo(() => {
    if (!isChunkedBook) return '';
    const cachedPages = chunkCache[currentChunkIndex] || chunkGlobalCache['musnad-ahmad']?.[currentChunkIndex];
    const item = cachedPages?.[pageIndexInChunk];
    if (typeof item === 'string') return item;
    return '';
  }, [isChunkedBook, chunkCache, currentChunkIndex, pageIndexInChunk]);

  const currentNonHadithPage = useMemo(() => {
    if (isHadith) return '';
    if (isChunkedBook) return currentChunkPage;
    if (book.pages && book.pages.length > 0) {
      return book.pages[currentPage] || '';
    }
    return `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n«${book.title_ar}»\n[صَفْحَة ${currentPage + 1} از ${totalPages}]\n\n${book.intro_ur || book.description}`;
  }, [isHadith, isChunkedBook, currentChunkPage, book, currentPage, totalPages]);

  const parsedDarsPage = useMemo(() => {
    if (isHadith || !currentNonHadithPage) return null;
    const raw = currentNonHadithPage;
    
    const hasMatn = raw.includes('【متنِ کتاب') || raw.includes('【متنِ کتاب (عربی)】') || raw.includes('【متن الحديث الإسنادي】') || raw.includes('【متن الحديث') || raw.includes('【متنِ سورت');
    const hasUrdu = raw.includes('【سلیس') || raw.includes('【سلیس اردو ترجمہ') || raw.includes('【اردو ترجمہ و مفہوم】') || raw.includes('【اردو ترجمہ');
    
    if (!hasMatn && !hasUrdu) return null;

    const parts = raw.split(/【([^】]+)】:?/);
    const header = parts[0]?.trim() || '';
    let matn = '';
    let urdu = '';
    let ref = '';

    for (let i = 1; i < parts.length; i += 2) {
      const key = parts[i]?.trim() || '';
      const val = parts[i + 1]?.trim() || '';
      if (key.includes('متنِ کتاب') || key.includes('متن الحديث') || key.includes('متن')) {
        matn = val;
      } else if (key.includes('سلیس') || key.includes('ترجمہ') || key.includes('اردو')) {
        urdu = val;
      } else if (key.includes('حوالہ') || key.includes('تخریج')) {
        ref = val;
      }
    }

    let urduTranslation = '';
    let tashreeh = '';
    let iraab = '';
    let hawashi = '';

    if (urdu) {
      const subSections = urdu.split(/\n\n(?=درسی تشریح|دراسی تشریح|محلِ اعراب|محل الإعراب|حواشی|تخریج|سلیس اردو|اردو ترجمہ)/);
      for (const sub of subSections) {
        const sTrim = sub.trim();
        if (sTrim.startsWith('درسی تشریح') || sTrim.startsWith('دراسی تشریح')) {
          tashreeh = sTrim.replace(/^(درسی تشریح و حل|دراسی تشریح و فقہی فوائد)[:：]?\s*/, '');
        } else if (sTrim.startsWith('محلِ اعراب') || sTrim.startsWith('محل الإعراب')) {
          iraab = sTrim.replace(/^(محلِ اعراب و نحوی ترکیب|محل الإعراب و البلاغة النبوية)[:：]?\s*/, '');
        } else if (sTrim.startsWith('حواشی') || sTrim.startsWith('تخریج')) {
          hawashi = sTrim.replace(/^(حواشی و درسی فوائد|تخریج و شواہد الحدیث)[:：]?\s*/, '');
        } else if (sTrim.startsWith('سلیس اردو') || sTrim.startsWith('اردو ترجمہ')) {
          urduTranslation = sTrim.replace(/^(سلیس اردو ترجمہ|اردو ترجمہ و مفہوم)[:：]?\s*/, '');
        } else {
          if (!urduTranslation) urduTranslation = sTrim;
          else tashreeh = (tashreeh ? tashreeh + '\n\n' : '') + sTrim;
        }
      }
    }

    return {
      header,
      matn,
      urduTranslation,
      tashreeh,
      iraab,
      hawashi,
      ref
    };
  }, [isHadith, currentNonHadithPage]);

  // Sanad vs Matn separation for Chunked Dars Books (e.g. Musnad Ahmad)
  const parsedDarsSplit = useMemo(() => {
    if (!parsedDarsPage?.matn) return { sanad: '', matn: '' };
    return segmentSanadAndMatn(parsedDarsPage.matn);
  }, [parsedDarsPage?.matn]);

  const displayDarsSanad = globalTashkeel ? parsedDarsSplit.sanad : stripTashkeel(parsedDarsSplit.sanad);
  const displayDarsMatn = globalTashkeel ? (parsedDarsSplit.matn || parsedDarsPage?.matn || '') : stripTashkeel(parsedDarsSplit.matn || parsedDarsPage?.matn || '');

  const renderDarsSanadText = () => {
    if (!parsedDarsSplit.sanad) return null;
    const segments = parseSanadNarratorSegments(displayDarsSanad);
    return segments.map((seg, segIdx) => {
      if (seg?.type === 'narrator' && seg?.narrator) {
        const narrator = seg.narrator;
        const narratorName = safeName(narrator, seg?.text || 'راوی');
        const narratorRank = safeRank(narrator, 'راوٍ من رواة الإسناد');
        return (
          <span
            key={`dars-narrator-${segIdx}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveNarrator(narrator);
            }}
            className="inline-flex items-center gap-1.5 mx-1 rounded-lg bg-emerald-100/90 text-emerald-950 font-semibold hover:bg-emerald-200 border border-emerald-300 transition-colors cursor-pointer select-text shadow-2xs font-arabic"
            style={{ 
              fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
              fontSize: '1.25rem', 
              fontWeight: 600,
              padding: '3px 10px' 
            }}
            title={`راوی: ${narratorName} (${narratorRank}) — سوانح و توثیق کے لیے کلک کریں`}
          >
            <UserCheck className="w-4 h-4 text-emerald-800" />
            <span>{seg?.text || narratorName}</span>
          </span>
        );
      }

      const segText = seg?.text || '';
      const tokens = segText.split(/(\s+)/);
      return tokens.map((tok, tokIdx) => {
        if (/^\s+$/.test(tok)) return tok;
        return (
          <span
            key={`dars-sanad-word-${segIdx}-${tokIdx}`}
            onClick={() => handleWordClick(tok, displayDarsSanad, parsedDarsPage?.urduTranslation || pipelineAnalysis?.urduTranslation)}
            className="cursor-pointer hover:bg-amber-100/60 rounded px-0.5 transition-colors select-text inline-block"
          >
            {tok}
          </span>
        );
      });
    });
  };


  // Synchronous instant Darsi Analysis Pipeline for pages missing Tashreeh/I'rab/Hawashi (zero loading delay)
  const pipelineAnalysis = useMemo(() => {
    if (!parsedDarsPage || isQuran) return null;
    if (parsedDarsPage.tashreeh && parsedDarsPage.iraab && parsedDarsPage.hawashi) {
      return null;
    }
    return getDarsiAnalysisSync(
      slug || 'book',
      currentPage + 1,
      parsedDarsPage.matn || '',
      parsedDarsPage.urduTranslation || ''
    );
  }, [slug, currentPage, parsedDarsPage, isQuran]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Roman Urdu ↔ Arabic/Urdu Dictionary ─────────────────────────────────
  const ROMAN_URDU_MAP: Record<string, string[]> = {
    // عقائد و کلمات
    'allah': ['اللہ', 'الله'], 'rasool': ['رسول'], 'nabi': ['نبی'], 'prophet': ['نبی'],
    'muhammad': ['محمد'], 'mohammed': ['محمد'], 'isa': ['عیسی'], 'musa': ['موسی'],
    'ibrahim': ['ابراہیم'], 'iman': ['ایمان'], 'islam': ['اسلام'], 'quran': ['قرآن'],
    'kuran': ['قرآن'], 'hadees': ['حدیث'], 'hadith': ['حدیث'], 'sunnat': ['سنت'],
    'sunnah': ['سنت'], 'farz': ['فرض'], 'wajib': ['واجب'], 'sunnat_moak': ['سنت مؤکدہ'],
    'nafl': ['نفل'], 'haram': ['حرام'], 'halal': ['حلال'], 'makrooh': ['مکروہ'],
    'mubah': ['مباح'], 'shirk': ['شرک'], 'kufr': ['کفر'], 'nifaq': ['نفاق'],
    'taqwa': ['تقوی'], 'ikhlas': ['اخلاص'], 'sabr': ['صبر'], 'shukr': ['شکر'],
    // عبادات
    'namaz': ['نماز', 'صلاة', 'صلوة'], 'salat': ['نماز', 'صلاة'], 'prayer': ['نماز'],
    'roza': ['روزہ', 'صوم'], 'saum': ['صوم', 'روزہ'], 'fast': ['روزہ'],
    'zakat': ['زکاة', 'زکات'], 'hajj': ['حج'], 'umrah': ['عمرہ'], 'umra': ['عمرہ'],
    'wuzu': ['وضو'], 'wudu': ['وضو', 'وضوء'], 'ghusal': ['غسل'], 'ghusl': ['غسل'],
    'tayammum': ['تیمم'], 'tahaarat': ['طہارت'], 'taharat': ['طہارت'],
    'azan': ['اذان'], 'adhan': ['اذان'], 'iqamat': ['اقامت'],
    'rakat': ['رکعت'], 'rakaat': ['رکعت'], 'sajda': ['سجدہ'], 'sujood': ['سجود'],
    'ruku': ['رکوع'], 'qayam': ['قیام'], 'qiyam': ['قیام'],
    'fajr': ['فجر'], 'zuhr': ['ظہر', 'زہر'], 'asr': ['عصر'], 'maghrib': ['مغرب'], 'isha': ['عشاء'],
    'juma': ['جمعہ'], 'jumma': ['جمعہ'], 'eid': ['عید'], 'tarawih': ['تراویح'],
    'witr': ['وتر'], 'tahajjud': ['تہجد'],
    // احادیث و کتب
    'bukhari': ['بخاری'], 'muslim': ['مسلم'], 'tirmizi': ['ترمذی'], 'tirmidhi': ['ترمذی'],
    'nasai': ['نسائی'], 'ibn majah': ['ابن ماجہ'], 'abu dawood': ['ابو داود'],
    'mishkat': ['مشکاۃ'], 'muwatta': ['موطا'], 'musnad': ['مسند'],
    'saheeh': ['صحیح'], 'sahih': ['صحیح'], 'sunan': ['سنن'], 'jami': ['جامع'],
    // فقہ
    'hanafi': ['حنفی'], 'shafi': ['شافعی'], 'maliki': ['مالکی'], 'hanbali': ['حنبلی'],
    'fiqh': ['فقہ'], 'fatwa': ['فتوی'], 'qiyas': ['قیاس'], 'ijma': ['اجماع'],
    'ijtihad': ['اجتہاد'], 'nikah': ['نکاح'], 'talaq': ['طلاق'], 'mehr': ['مہر'],
    'wirasat': ['وراثت'], 'wasiyyat': ['وصیت'],
    // نیت و حدیث مشہور
    'niyat': ['نیت', 'نيت'], 'niyyat': ['نیت'], 'innamal': ['إنما'], 'amaal': ['اعمال'],
    'shafaat': ['شفاعت'], 'dua': ['دعا'], 'zikr': ['ذکر'], 'dhikr': ['ذکر'],
    'istighfar': ['استغفار'], 'tawbah': ['توبہ'], 'tauba': ['توبہ'],
    // عربی الفاظ
    'qal': ['قال'], 'rasoolullah': ['رسول اللہ'], 'sallallahu': ['صلی اللہ'],
    'alayhi': ['علیہ'], 'wasallam': ['وسلم'], 'radiallahu': ['رضی اللہ'],
    'anhu': ['عنہ'], 'anha': ['عنہا'],
    // علوم
    'tafseer': ['تفسیر'], 'tafsir': ['تفسیر'], 'tajweed': ['تجوید'],
    'sarf': ['صرف'], 'nahw': ['نحو'], 'balaaghat': ['بلاغت'],
    'aqeedah': ['عقیدہ'], 'aqaid': ['عقائد'], 'kalam': ['کلام'],
    'mantiq': ['منطق'], 'falsafa': ['فلسفہ'], 'usool': ['اصول'],
    // اشخاص
    'abu bakar': ['ابوبکر'], 'umar': ['عمر'], 'usman': ['عثمان'], 'ali': ['علی'],
    'aisha': ['عائشہ'], 'fatima': ['فاطمہ'], 'hasan': ['حسن'], 'husain': ['حسین'],
    'imam abu hanifa': ['امام ابو حنیفہ'], 'imam shafi': ['امام شافعی'],
    // مقامات
    'makkah': ['مکہ'], 'mecca': ['مکہ'], 'madinah': ['مدینہ'], 'medina': ['مدینہ'],
    'kaaba': ['کعبہ'], 'masjid': ['مسجد'], 'mosque': ['مسجد'],
    // عام الفاظ
    'kitab': ['کتاب'], 'ilm': ['علم'], 'taleem': ['تعلیم'], 'talim': ['تعلیم'],
    'madrasah': ['مدرسہ'], 'madrasa': ['مدرسہ'], 'alim': ['عالم'], 'ulama': ['علماء'],
    'mufti': ['مفتی'], 'maulana': ['مولانا'], 'sheikh': ['شیخ'], 'pir': ['پیر'],
    'deen': ['دین'], 'duniya': ['دنیا'], 'akhirat': ['آخرت'], 'jannat': ['جنت'],
    'jahannam': ['جہنم'], 'maut': ['موت'], 'qayamat': ['قیامت'],
    'sawab': ['ثواب'], 'gunah': ['گناہ'], 'tawba': ['توبہ'], 'maghfirat': ['مغفرت'],
    'rahmat': ['رحمت'], 'azab': ['عذاب'], 'hidayat': ['ہدایت'],
  };

  // Roman Urdu detect کریں (زیادہ تر Latin حروف ہوں)
  const isRomanUrdu = (text: string): boolean => {
    const latinChars = text.match(/[a-zA-Z]/g)?.length || 0;
    return latinChars > text.length * 0.5;
  };

  // Roman Urdu کو Arabic/Urdu میں تبدیل کریں
  const romanToUrduTerms = (q: string): string[] => {
    const qLower = q.toLowerCase().trim();
    const terms: string[] = [];
    // exact match
    if (ROMAN_URDU_MAP[qLower]) {
      terms.push(...ROMAN_URDU_MAP[qLower]);
    }
    // partial match: query is substring of a key
    for (const [key, values] of Object.entries(ROMAN_URDU_MAP)) {
      if (key.includes(qLower) || qLower.includes(key)) {
        terms.push(...values);
      }
    }
    return [...new Set(terms)];
  };
  // ──────────────────────────────────────────────────────────────────────────

  // ─── In-Book Content Search ────────────────────────────────────────────────
  const performContentSearch = (query: string) => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setIsSearching(true);
    setShowSearchResults(true);

    const results: SearchResult[] = [];
    const qLower = q.toLowerCase();
    const MAX_RESULTS = 50;

    // Roman Urdu: اصل query کے ساتھ converted terms بھی تیار کریں
    const romanMode = isRomanUrdu(q);
    const convertedTerms = romanMode ? romanToUrduTerms(q) : [];

    // کسی بھی term (original یا converted) سے match چیک کریں (مع اعراب، بغیر اعراب اور تطبیق شدہ)
    const qStripped = stripTashkeel(q).toLowerCase();
    const qNormalized = normalizeArabic(q);
    const matchesText = (text: string): boolean => {
      const tLower = text.toLowerCase();
      if (tLower.includes(qLower)) return true;
      if (qStripped) {
        const tStripped = stripTashkeel(text).toLowerCase();
        if (tStripped.includes(qStripped)) return true;
      }
      if (qNormalized) {
        const tNormalized = normalizeArabic(text);
        if (tNormalized.includes(qNormalized)) return true;
      }
      for (const term of convertedTerms) {
        if (tLower.includes(term.toLowerCase())) return true;
        const termNorm = normalizeArabic(term);
        if (termNorm && normalizeArabic(text).includes(termNorm)) return true;
      }
      return false;
    };

    const getMatchType = (q: string): 'arabic' | 'urdu' | 'roman' => {
      if (romanMode) return 'roman';
      if (/[\u0621-\u064A]/.test(q)) return 'arabic';
      return 'urdu';
    };

    if (isHadith && allHadiths.length > 0) {
      // ── حدیث کتب: عربی متن، اردو ترجمہ، اور حدیث نمبر سے تلاش ──
      const numQuery = parseInt(q, 10);

      for (let i = 0; i < allHadiths.length && results.length < MAX_RESULTS; i++) {
        const h = allHadiths[i];
        const hNum = h.hadithnumber || h.number || (i + 1);
        const arabText = h.arab || h.text || '';
        const urduText = h.urdu || '';
        const pageIdx = Math.floor(i / PER_PAGE);

        // حدیث نمبر سے تلاش
        if (!romanMode && !isNaN(numQuery) && hNum === numQuery) {
          results.unshift({
            pageIndex: pageIdx,
            hadithNum: hNum,
            matchType: 'number',
            preview: `حدیث نمبر ${hNum}: ${arabText.slice(0, 80)}…`,
          });
          continue;
        }
        // عربی متن میں تلاش
        if (matchesText(arabText)) {
          let idx = arabText.toLowerCase().indexOf(qLower);
          if (idx < 0 && qStripped) {
            idx = stripTashkeel(arabText).toLowerCase().indexOf(qStripped);
          }
          if (idx < 0 && qNormalized) {
            idx = normalizeArabic(arabText).indexOf(qNormalized);
          }
          if (idx < 0) {
            for (const t of convertedTerms) {
              const found = arabText.toLowerCase().indexOf(t.toLowerCase());
              if (found >= 0) { idx = found; break; }
            }
          }
          if (idx < 0) idx = 0;
          const snippet = arabText.slice(Math.max(0, idx - 10), idx + 60);
          results.push({
            pageIndex: pageIdx,
            hadithNum: hNum,
            matchType: romanMode ? 'roman' : 'arabic',
            preview: `ح ${hNum}: …${snippet}…`,
          });
          continue;
        }
        // اردو ترجمہ میں تلاش
        if (urduText && matchesText(urduText)) {
          let idx = urduText.toLowerCase().indexOf(qLower);
          if (idx < 0 && qNormalized) {
            idx = normalizeArabic(urduText).indexOf(qNormalized);
          }
          if (idx < 0) {
            for (const t of convertedTerms) {
              const found = urduText.toLowerCase().indexOf(t.toLowerCase());
              if (found >= 0) { idx = found; break; }
            }
          }
          if (idx < 0) idx = 0;
          const snippet = urduText.slice(Math.max(0, idx - 10), idx + 60);
          results.push({
            pageIndex: pageIdx,
            hadithNum: hNum,
            matchType: romanMode ? 'roman' : 'urdu',
            preview: `ح ${hNum}: …${snippet}…`,
          });
        }
      }
    } else if (isChunkedBook) {
      // ── چنکڈ کتب (مسند احمد وغیرہ): تمام چنکس میں تلاش ──
      const bookKey = 'musnad-ahmad';
      const chunkCount = Math.ceil(totalPages / 100);
      const fetchPromises = [];

      for (let c = 0; c < chunkCount; c++) {
        if (!chunkGlobalCache[bookKey]?.[c]) {
          fetchPromises.push(
            fetch(`/data/musnad-ahmad/chunks/chunk-${c}.json`)
              .then(res => res.json())
              .then((data: string[]) => {
                if (!chunkGlobalCache[bookKey]) chunkGlobalCache[bookKey] = {};
                chunkGlobalCache[bookKey][c] = data;
              })
              .catch(() => {})
          );
        }
      }

      Promise.all(fetchPromises).then(() => {
        setChunkCache({ ...(chunkGlobalCache[bookKey] || {}) });
        const allCached = chunkGlobalCache[bookKey] || {};
        for (let c = 0; c < chunkCount; c++) {
          const chunkPages = allCached[c] || [];
          for (let pInC = 0; pInC < chunkPages.length && results.length < MAX_RESULTS; pInC++) {
            const rawPage = chunkPages[pInC];
            if (!rawPage) continue;
            const absPageIndex = c * 100 + pInC;
            const hNum = absPageIndex + 1;

            let arabText = '';
            let urduText = '';
            if (typeof rawPage === 'string') {
              const parts = rawPage.split(/【([^】]+)】:?/);
              for (let pi = 1; pi < parts.length; pi += 2) {
                const k = parts[pi];
                const v = parts[pi + 1] || '';
                if (k.includes('متن')) arabText = v;
                else if (k.includes('ترجمہ') || k.includes('اردو')) urduText = v;
              }
              if (!arabText) arabText = rawPage;
            } else {
              arabText = (rawPage as any).arabic || '';
              urduText = (rawPage as any).urdu || '';
            }

            // حدیث نمبر سے تلاش
            if (!romanMode && !isNaN(parseInt(q, 10)) && hNum === parseInt(q, 10)) {
              results.push({
                pageIndex: absPageIndex,
                hadithNum: hNum,
                matchType: 'number',
                preview: `حدیث شریف نمبر ${hNum}: ${arabText.slice(0, 80)}…`,
              });
              continue;
            }
            if (matchesText(arabText)) {
              let idx = arabText.toLowerCase().indexOf(qLower);
              if (idx < 0) {
                for (const t of convertedTerms) {
                  idx = arabText.toLowerCase().indexOf(t.toLowerCase());
                  if (idx >= 0) break;
                }
              }
              const snippet = arabText.slice(Math.max(0, idx - 15), idx + 70);
              results.push({
                pageIndex: absPageIndex,
                hadithNum: hNum,
                matchType: romanMode ? 'roman' : 'arabic',
                preview: `حدیث شریف ${hNum}: …${snippet}…`,
              });
              continue;
            }
            if (urduText && matchesText(urduText)) {
              let idx = urduText.toLowerCase().indexOf(qLower);
              if (idx < 0) {
                for (const t of convertedTerms) {
                  idx = urduText.toLowerCase().indexOf(t.toLowerCase());
                  if (idx >= 0) break;
                }
              }
              const snippet = urduText.slice(Math.max(0, idx - 15), idx + 70);
              results.push({
                pageIndex: absPageIndex,
                hadithNum: hNum,
                matchType: romanMode ? 'roman' : 'urdu',
                preview: `حدیث شریف ${hNum}: …${snippet}…`,
              });
            }
          }
        }
        setSearchResults(results);
        setIsSearching(false);
      });
      return;
    } else if (!isHadith && book.pages && book.pages.length > 0) {
      // ── دیگر کتب: صفحات کے متن میں تلاش ──
      for (let i = 0; i < book.pages.length && results.length < MAX_RESULTS; i++) {
        const raw = book.pages[i] || '';
        if (matchesText(raw)) {
          const rawLower = raw.toLowerCase();
          let idx = rawLower.indexOf(qLower);
          if (idx < 0) {
            for (const t of convertedTerms) {
              idx = rawLower.indexOf(t.toLowerCase());
              if (idx >= 0) break;
            }
          }
          const snippet = raw.slice(Math.max(0, idx - 15), idx + 70);
          results.push({
            pageIndex: i,
            matchType: getMatchType(q),
            preview: `ص ${i + 1}: …${snippet}…`,
          });
        }
      }
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setCurrentPage(result.pageIndex);
    setShowSearchResults(false);
    setContentSearch('');
    jumpToTopOfPage();
  };

  const clearContentSearch = () => {
    setContentSearch('');
    setSearchResults([]);
    setShowSearchResults(false);
  };
  // ──────────────────────────────────────────────────────────────────────────

  // Unified 1-based page navigation: Instant state update (0ms), URL query sync, top-of-page scroll
  const goToPage = (target1Based: number) => {
    const valid1Based = Math.max(1, Math.min(totalPages, target1Based));
    const new0Index = valid1Based - 1;

    // 1. Direct synchronous React state change (0ms)
    setCurrentPage(new0Index);
    setSearchPageQuery('');

    // 2. Sync URL query without page reload
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('page', valid1Based.toString());
        window.history.pushState(null, '', url.pathname + url.search);
        window.dispatchEvent(new CustomEvent('tehreek:navigate', { detail: { url: url.pathname + url.search } }));
      } catch {}
    }

    // 3. Instant scroll to top
    jumpToTopOfPage();
  };
  const handleJumpToPage = goToPage;

  // Filtered page list for quick jump Fehrist
  const filteredPageNumbers = useMemo(() => {
    const list: number[] = [];
    if (totalPages <= 100) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else {
      // For large books (like Bukhari 759 pages), generate strategic jump anchors
      const current = currentPage + 1;
      const range = 15;
      const start = Math.max(1, current - range);
      const end = Math.min(totalPages, current + range);

      if (start > 1) {
        list.push(1);
        if (start > 2) list.push(-1); // ellipsis marker
      }
      for (let i = start; i <= end; i++) {
        list.push(i);
      }
      if (end < totalPages) {
        if (end < totalPages - 1) list.push(-2); // ellipsis marker
        list.push(totalPages);
      }
    }

    if (!searchPageQuery.trim()) return list;
    const q = parseInt(searchPageQuery.trim(), 10);
    if (!isNaN(q) && q >= 1 && q <= totalPages) {
      return [q];
    }
    return list;
  }, [totalPages, currentPage, searchPageQuery]);

  return (
    <ErrorBoundary fallbackTitle={`کتاب «${book?.title_ur || book?.title || slug || 'مطالعہ'}» لوڈ کرنے میں دشواری`}>
      <div dir="rtl" className="min-h-screen bg-stone-50 dark:bg-slate-900 text-stone-900 dark:text-stone-100 flex flex-col selection:bg-emerald-100 dark:selection:bg-emerald-900/40 selection:text-emerald-900 dark:selection:text-emerald-200 overflow-x-hidden w-full relative">
        
        {/* Subtle Toast for Mobile Pinch-to-Zoom and Desktop Font Zoom */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-bold font-mono shadow-2xl backdrop-blur-md pointer-events-none transition-all animate-fadeIn">
            {toastMessage}
          </div>
        )}

        {/* 1. Header (Clean White / Dark Slate, same branding as homepage) */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-nastaliq font-bold text-xs sm:text-base transition hover:-translate-x-0.5"
              title="ہوم پیج پر واپس جائیں — تحریکِ ایمان"
            >
              <ArrowRight className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <img
                src="/tehreek-iman-logo.jpg"
                alt="تحریکِ ایمان"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-500 shadow-xs hidden sm:inline-block"
              />
              <span className="hidden sm:inline">تحریکِ ایمان</span>
              <span className="sm:hidden">واپس</span>
            </Link>
            <span className="text-gray-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <h1 className="font-bold font-nastaliq text-stone-900 dark:text-stone-100 text-xs sm:text-lg truncate max-w-[140px] sm:max-w-md">
                {book?.title_ur || book?.title || slug}
              </h1>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 font-nastaliq">
                {book?.category === 'Hadith' || isHadith ? 'حدیث شریف' : (book?.category || 'کتاب')}
              </span>
            </div>
          </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Interactive Font Zoom Controls (Phase 6 - Mobile & Desktop) */}
          <ReaderZoomToolbar
            arabicFontSize={arabicFontSize}
            onArabicFontSizeChange={handleUpdateArabicFontSize}
            urduFontSize={urduFontSize}
            onUrduFontSizeChange={handleUpdateUrduFontSize}
            onOpenSettings={() => setIsFontSizeModalOpen(true)}
            onResetAll={handleResetTypography}
            showLanguageSwitcher={true}
          />

          {/* Dark / Light Theme Toggle */}
          <ThemeToggle />

          {/* Tashkeel Toggle Button (Global for Madaris Students) */}
          <button
            type="button"
            onClick={() => setGlobalTashkeel(prev => !prev)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border transition cursor-pointer text-xs flex items-center gap-1 sm:gap-1.5 font-nastaliq font-bold ${
              globalTashkeel
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-100 text-amber-950 border-amber-300 font-black shadow-xs'
            }`}
            title="پورے صفحے پر اعراب ہٹائیں / دکھائیں (طلبۂ درسِ نظامی کے لیے عبارت خوانی کی مشق)"
          >
            {globalTashkeel ? <Eye className="w-3.5 h-3.5 text-emerald-700" /> : <EyeOff className="w-3.5 h-3.5 text-amber-800" />}
            <span>{globalTashkeel ? 'مع اعراب' : 'بغیر اعراب'}</span>
          </button>

          {/* Focus / Dars Mode Toggle Button (پر سکون مطالعہ موڈ) */}
          <button
            type="button"
            onClick={toggleDarsMode}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border transition cursor-pointer text-xs flex items-center gap-1 sm:gap-1.5 font-nastaliq font-bold shadow-xs ${
              isDarsMode
                ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-sm ring-2 ring-amber-400/50'
                : 'bg-emerald-900/90 text-amber-200 border-emerald-700 hover:bg-emerald-800'
            }`}
            title={isDarsMode ? 'عام موڈ پر واپس جائیں (سائڈبار دکھائیں)' : 'درس موڈ فعال کریں (پر سکون مطالعہ برائے اساتذہ و طلبہ)'}
          >
            {isDarsMode ? <Minimize2 className="w-3.5 h-3.5 text-stone-950" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-300" />}
            <span>{isDarsMode ? 'عام موڈ' : 'درس موڈ (پر سکون)'}</span>
          </button>

          {/* Urdu Styler Button (Desktop Only, Hidden on Mobile < 768px) */}
          <button
            type="button"
            onClick={() => setIsStylerOpen(prev => !prev)}
            className={`hidden md:flex p-2 rounded-xl border transition cursor-pointer text-xs items-center gap-1.5 ${
              isStylerOpen
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                : 'border-gray-200 hover:border-emerald-700 text-stone-600 hover:text-emerald-800 bg-white'
            }`}
            title="اردو فونٹ سائز و سطر کشادگی تبدیل کریں"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline font-nastaliq font-bold">فونٹ سائز</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 sm:p-2 rounded-xl border border-gray-200 hover:border-emerald-700 text-stone-600 hover:text-emerald-800 transition cursor-pointer text-xs flex items-center gap-1"
            title="صفحہ کا لنک کاپی کریں"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-nastaliq">{copied ? 'کاپی ہو گیا' : 'شیئر'}</span>
          </button>

          {/* Current Page Badge */}
          <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold font-nastaliq shadow-xs flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>
              <span className="hidden sm:inline">
                {isHadith
                  ? `کل احادیث شریف: ${totalHadithsCount.toLocaleString('ur-PK')} — صفحہ ${(currentPage + 1).toLocaleString('ur-PK')} از ${totalPages.toLocaleString('ur-PK')}`
                  : `صفحہ ${(currentPage + 1).toLocaleString('ur-PK')} از ${totalPages.toLocaleString('ur-PK')} — کل ${totalPages.toLocaleString('ur-PK')} مستند صفحات`}
              </span>
              <span className="sm:hidden">
                {`صفحہ ${(currentPage + 1).toLocaleString('ur-PK')} / ${totalPages.toLocaleString('ur-PK')}`}
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Full Reader Layout: Left 75% Reader, Right 25% Sticky Fehrist */}
      <div 
        ref={readerTopRef} 
        className={`flex-1 w-full ${isDarsMode ? 'max-w-5xl' : 'max-w-[1600px]'} mx-auto px-3 sm:px-6 lg:px-8 py-6 flex flex-col ${isDarsMode ? '' : 'lg:flex-row'} gap-6 overflow-x-hidden`}
      >
        
        {/* Right 25%: Sticky Fehrist (Index of Pages & Chapters) - Hidden in Dars Mode */}
        {!isDarsMode && (
          <aside
            ref={asideRef}
            style={{ position: 'sticky', top: '1.5rem', maxHeight: 'calc(100vh - 3rem)' }}
            className="w-full lg:w-1/4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] flex flex-col bg-stone-50/80 border border-gray-200 rounded-2xl p-4 shadow-sm order-2 lg:order-1 overflow-hidden"
          >
          {/* 3D Premium Book Cover Display with Spotlight */}
          <div className="book-spotlight-container mb-2 py-1 hidden lg:flex">
            <div className="premium-book-cover w-32 h-44 mx-auto">
              <img
                src={book.cover_url || `/images/books/${book.slug}.svg`}
                alt={book.title_ur || book.title}
                loading="eager"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('.svg')) {
                    target.src = target.src.replace(/\.svg$/, '.jpg');
                  }
                }}
              />
            </div>
          </div>

          {/* Sidebar Tab Switcher: Pages vs Chapters */}
          <div className="flex items-center gap-1 bg-stone-200/90 p-1 rounded-xl mb-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarTab('pages')}
              className={`flex-1 py-1.5 text-xs font-bold font-nastaliq rounded-lg transition-all cursor-pointer text-center ${
                sidebarTab === 'pages'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:text-emerald-900'
              }`}
            >
              📄 صفحات ({totalPages})
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('chapters')}
              className={`flex-1 py-1.5 text-xs font-bold font-nastaliq rounded-lg transition-all cursor-pointer text-center ${
                sidebarTab === 'chapters'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:text-emerald-900'
              }`}
            >
              📑 فہرستِ ابواب ({bookChaptersList.length})
            </button>
          </div>

          {sidebarTab === 'chapters' ? (
            /* Chapters Tab */
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              <div className="text-[11px] font-nastaliq font-bold text-stone-500 pb-1 border-b border-gray-200 flex items-center justify-between">
                <span>انتخابِ باب / عنوان:</span>
                <span className="text-emerald-800 font-mono">کل: {bookChaptersList.length}</span>
              </div>
              {bookChaptersList.map((ch, idx) => {
                const isActive = currentChapter?.id === ch.id;
                return (
                  <button
                    key={ch.id || idx}
                    type="button"
                    onClick={() => {
                      handleJumpToPage(ch.startPage);
                      jumpToTopOfPage();
                    }}
                    className={`w-full text-right p-2.5 rounded-xl transition-all cursor-pointer border flex flex-col gap-1 ${
                      isActive
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600/30'
                        : 'bg-white hover:bg-emerald-50/70 text-stone-800 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-bold font-nastaliq px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-white/20 text-amber-200' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        ص {ch.startPage}
                      </span>
                      <span className={`text-[10px] font-mono ${isActive ? 'text-emerald-200' : 'text-stone-400'}`}>
                        #{idx + 1}
                      </span>
                    </div>
                    <h4 className={`text-xs sm:text-sm font-bold font-arabic leading-snug line-clamp-2 ${
                      isActive ? 'text-amber-200' : 'text-emerald-950'
                    }`} dir="rtl">
                      {ch.titleAr}
                    </h4>
                    {ch.titleUr && (
                      <p className={`text-[11px] font-nastaliq leading-tight line-clamp-1 ${
                        isActive ? 'text-stone-200' : 'text-stone-600'
                      }`} dir="rtl">
                        {ch.titleUr}
                      </p>
                    )}
                    {ch.detail && (
                      <span className={`text-[9px] font-nastaliq ${isActive ? 'text-emerald-300' : 'text-stone-400'}`}>
                        {ch.detail}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Pages Tab */
            <>
              <div className="space-y-2.5 pb-2.5 border-b border-gray-200 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-emerald-800" />
                    <h2 className="font-bold font-nastaliq text-sm sm:text-base text-stone-900">فہرستِ صفحات</h2>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 font-nastaliq">
                    کل: {totalPages} صفحات
                  </span>
                </div>

                {/* Musnad Ahmad Volume Selector in Aside */}
                {isChunkedBook && (
                  <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] font-bold font-nastaliq text-emerald-950">
                      <span>انتخابِ جلد (6 مجلدات):</span>
                      <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded-md font-mono">
                        {currentVolume?.volNum}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {MUSNAD_VOLUMES.map(v => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVolume(v)}
                          className={`px-1.5 py-1 rounded-lg text-[10px] font-bold font-nastaliq transition cursor-pointer border text-center ${
                            currentVolume?.id === v.id
                              ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                              : 'bg-white hover:bg-emerald-100 text-stone-700 border-gray-200'
                          }`}
                          title={`${v.title} (${v.hadithRange})`}
                        >
                          {v.volNum}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Page Jump Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={searchPageQuery}
                      onChange={e => setSearchPageQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleJumpToPage(parseInt(searchPageQuery, 10));
                        }
                      }}
                      placeholder={`صفحہ (1 تا ${totalPages})...`}
                      className="w-full pr-8 pl-2 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-nastaliq focus:outline-none focus:ring-2 focus:ring-emerald-700/20 text-stone-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJumpToPage(parseInt(searchPageQuery, 10))}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer"
                  >
                    جائیں
                  </button>
                </div>

                {/* Urdu Styler Trigger in Sidebar (Desktop Only, Hidden on Mobile < 768px) */}
                <button
                  type="button"
                  onClick={() => setIsStylerOpen(true)}
                  className="w-full hidden md:flex items-center justify-between px-3 py-2 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 font-nastaliq transition cursor-pointer shadow-2xs"
                  title="فونٹ سائز و سطر کشادگی تبدیل کریں"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-800" />
                    <span>اردو فونٹ سائز و کشادگی</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-white text-emerald-800 rounded-md border border-emerald-200 font-mono font-bold">
                    اسٹائلر
                  </span>
                </button>
              </div>

              {/* Fehrist Page Grid / List */}
              <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-1 custom-scrollbar">
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-1.5">
                  {filteredPageNumbers.map((p, idx) => {
                    if (p < 0) {
                      return (
                        <div key={`ellipsis_${idx}`} className="flex items-center justify-center text-xs text-stone-400 font-bold">
                          •••
                        </div>
                      );
                    }
                    const isActive = p === currentPage + 1;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleJumpToPage(p)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer text-center font-nastaliq ${
                          isActive
                            ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-700/30'
                            : 'bg-white text-stone-700 border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/50'
                        }`}
                        title={isQuran ? `${QURAN_SURAHS_CANONICAL[p - 1]?.nameUrdu || ''} (${QURAN_SURAHS_CANONICAL[p - 1]?.nameArabic || ''})` : `صفحہ ${p}`}
                      >
                        {isQuran ? (QURAN_SURAHS_CANONICAL[p - 1]?.nameArabic || `سورة ${p}`) : `ص ${p}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Jump Bar (Start, Mid, End) */}
              <div className="pt-2.5 mt-2 border-t border-gray-200 flex items-center justify-between text-xs font-nastaliq shrink-0">
                <button
                  type="button"
                  disabled={currentPage <= 0}
                  onClick={() => handleJumpToPage(1)}
                  className="text-stone-500 hover:text-emerald-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  شروع (ص ۱)
                </button>
                <button
                  type="button"
                  onClick={() => handleJumpToPage(Math.max(1, Math.floor(totalPages / 2)))}
                  className="text-stone-500 hover:text-emerald-800 cursor-pointer"
                >
                  درمیان (ص {Math.max(1, Math.floor(totalPages / 2))})
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handleJumpToPage(totalPages)}
                  className="text-stone-500 hover:text-emerald-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  آخر (ص {totalPages})
                </button>
              </div>
            </>
          )}
        </aside>
        )}

        {/* Main Reader Display */}
        <main
          ref={mainContentRef}
          className={`w-full ${isDarsMode ? 'max-w-5xl mx-auto shadow-md ring-1 ring-emerald-900/10' : 'lg:w-3/4'} flex flex-col bg-white border border-gray-100 rounded-2xl p-4 sm:p-8 shadow-xs space-y-6 overflow-x-hidden order-1 lg:order-2`}
          style={{ touchAction: 'pan-y' }}
        >
          
          {/* Reader Top Bar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="premium-book-cover w-11 h-16 shrink-0 hidden sm:block">
                <img
                  src={book?.cover_url || `/images/books/${book?.slug || slug}.svg`}
                  alt={book?.title_ur || book?.title || slug}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.endsWith('.svg')) {
                      target.src = (book?.cover_url || `/images/books/${book?.slug || slug}.svg`).replace(/\.svg$/, '.jpg');
                    }
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 rounded-full bg-emerald-800"></span>
                  <h2 className="text-xl sm:text-2xl font-black font-nastaliq text-emerald-950">
                    {book?.title_ur || book?.title || slug}
                  </h2>
                </div>
                <p className="text-xs text-stone-500 font-nastaliq mt-1">
                  مصنف: {book?.author || 'امام و محدث'} {book?.death_year ? `(${book.death_year}ھ)` : ''} • {book?.category === 'Hadith' || isHadith ? 'حدیث شریف' : (book?.category || 'کتاب')}
                  {isHadith && ` • کل احادیث: ${totalHadithsCount.toLocaleString('ur-PK')}`}
                </p>
                {/* باقاعدہ ریکارڈ: ماخذ، لنک، لائسنس اور مترجم */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-nastaliq bg-stone-50 border border-gray-200/80 rounded-xl px-3 py-1.5 text-stone-600">
                  <span className="font-bold text-emerald-900">
                    {isHadith ? 'ماخذ: مستند عالمی ذخیرۂ حدیث (تصدیق شدہ نسخہ)' : `ماخذ: ${book?.source_name || "اوپن پبلک کارپس"}`}
                  </span>
                  {book?.source_link && (
                    <a
                      href={book.source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline flex items-center gap-0.5"
                    >
                      <span dir="ltr">(ماخذ لنک ↗)</span>
                    </a>
                  )}
                  <span>• لائسنس: <span dir="ltr">{book?.source_license || "Public Domain"}</span></span>
                  {book?.translator && <span>• مترجم: {book.translator}</span>}
                </div>
              </div>
            </div>

            {/* Pagination Controls Top & Zoom Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Mobile / Tablet Fehrist Jump Button */}
              <button
                type="button"
                onClick={() => {
                  if (asideRef.current) {
                    asideRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="lg:hidden flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-50 hover:bg-emerald-50 text-xs font-bold font-nastaliq text-stone-700 border border-gray-200 transition cursor-pointer"
                title="صفحات کی فہرست پر جائیں"
              >
                <BookMarked className="w-3.5 h-3.5 text-emerald-800" />
                <span>فہرستِ صفحات</span>
              </button>

              {/* Zoom Buttons (Desktop Only, Hidden on Mobile < 768px) */}
              <div className="hidden md:flex items-center bg-stone-50 border border-gray-200 rounded-xl p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => changeBookFontSize(-2)}
                  disabled={bookFontSize <= 16}
                  className="px-2 py-1 text-xs font-bold text-stone-700 hover:text-emerald-800 hover:bg-white rounded-lg transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="اردو فونٹ چھوٹا کریں (A-)"
                  aria-label="Font Zoom Out"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={resetBookFontSize}
                  className="px-1.5 py-0.5 text-[11px] font-bold font-mono text-emerald-900 hover:bg-white rounded-md transition cursor-pointer"
                  title="ڈیفالٹ سائز (20px)"
                >
                  {bookFontSize}px
                </button>
                <button
                  type="button"
                  onClick={() => changeBookFontSize(2)}
                  disabled={bookFontSize >= 28}
                  className="px-2 py-1 text-xs font-bold text-stone-700 hover:text-emerald-800 hover:bg-white rounded-lg transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="اردو فونٹ بڑا کریں (A+)"
                  aria-label="Font Zoom In"
                >
                  A+
                </button>
              </div>
              <button
                type="button"
                disabled={currentPage <= 0}
                onClick={() => goToPage(currentPage)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50/50 text-xs font-bold font-nastaliq text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>پچھلا صفحہ</span>
              </button>

              <span className="text-xs font-bold font-nastaliq px-3.5 py-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 shadow-2xs">
                صفحہ {(currentPage + 1).toLocaleString('ur-PK')} از {totalPages.toLocaleString('ur-PK')}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages - 1}
                onClick={() => goToPage(currentPage + 2)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs font-bold font-nastaliq text-white shadow-xs disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span>اگلا صفحہ</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dars Mode Toggle Button inside Reader Top Bar */}
              <button
                type="button"
                onClick={toggleDarsMode}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold font-nastaliq transition cursor-pointer shadow-2xs ${
                  isDarsMode
                    ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-sm'
                    : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border-emerald-200'
                }`}
                title={isDarsMode ? 'عام موڈ پر واپس جائیں' : 'پر سکون درس موڈ فعال کریں (سائڈبارز مخفی)'}
              >
                {isDarsMode ? <Minimize2 className="w-3.5 h-3.5 text-stone-950" /> : <Maximize2 className="w-3.5 h-3.5 text-emerald-800" />}
                <span>{isDarsMode ? 'عام موڈ' : 'درس موڈ'}</span>
              </button>

              {/* Reader Inline Typography Zoom Controls */}
              <ReaderZoomToolbar
                arabicFontSize={arabicFontSize}
                onArabicFontSizeChange={handleUpdateArabicFontSize}
                urduFontSize={urduFontSize}
                onUrduFontSizeChange={handleUpdateUrduFontSize}
                onOpenSettings={() => setIsFontSizeModalOpen(true)}
                onResetAll={handleResetTypography}
                showLanguageSwitcher={false}
              />
            </div>
          </div>

          {/* Active Dars Mode Classroom Banner */}
          {isDarsMode && (
            <div className="bg-gradient-to-r from-emerald-950 via-[#0a2f20] to-emerald-950 text-white rounded-2xl p-4 border-2 border-amber-400/90 shadow-md flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <BookOpenCheck className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <h3 className="font-nastaliq font-bold text-sm sm:text-base text-amber-300">
                      حالتِ تدریس و پر سکون مطالعہ (Dars / Focus Mode فعال ہے)
                    </h3>
                  </div>
                  <p className="font-nastaliq text-xs text-emerald-200 mt-0.5">
                    طلبۂ درسِ نظامی، اساتذہ اور محققین کے لیے پر سکون و عریض مطالعہ۔ تمام خلفشار و سائڈبارز مخفی ہیں تاکہ کلامِ نبوی ﷺ اور فقہی فوائد پر کامل یکسوئی حاصل ہو۔
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDarsMode(false)}
                className="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-nastaliq font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="عام موڈ پر واپس جائیں"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>عام موڈ پر جائیں</span>
              </button>
            </div>
          )}

          {/* Musnad Ahmad: 5 Volumes Interactive Switcher Banner */}
          {isChunkedBook && !isDarsMode && (
            <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse"></span>
                  <h3 className="text-xs sm:text-sm font-black font-nastaliq text-emerald-950">
                    مسند الإمام أحمد بن حنبل — انتخابِ مسانید و مجلدات (طبعة مؤسسة الرسالة المعتمدة)
                  </h3>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-bold font-nastaliq text-emerald-900 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                    موجودہ مطالعہ: {currentVolume?.volNum} — {currentVolume?.title}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {MUSNAD_VOLUMES.map(vol => (
                  <button
                    key={vol.id}
                    type="button"
                    onClick={() => handleSelectVolume(vol)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition cursor-pointer border ${
                      currentVolume?.id === vol.id
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-600/30'
                        : 'bg-white hover:bg-emerald-100/60 text-stone-700 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="font-bold text-xs font-nastaliq">{vol.volNum}</span>
                    <span className={`text-[10px] mt-0.5 font-nastaliq truncate max-w-full ${currentVolume?.id === vol.id ? 'text-amber-200' : 'text-stone-500'}`}>
                      {vol.title}
                    </span>
                    <span className={`text-[9px] mt-0.5 font-mono ${currentVolume?.id === vol.id ? 'text-emerald-100' : 'text-emerald-700'}`}>
                      {vol.hadithRange}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── In-Book Content Search Bar (Hidden in Dars Mode) ── */}
          {!isDarsMode && (
          <div className="relative">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 pointer-events-none" />
                <input
                  type="text"
                  dir="rtl"
                  value={contentSearch}
                  onChange={e => setContentSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') performContentSearch(contentSearch);
                    if (e.key === 'Escape') clearContentSearch();
                  }}
                  placeholder={
                    isHadith
                      ? 'عربی، اردو، رومن اردو (مثلاً نیت، نماز) یا حدیث نمبر...'
                      : 'عربی، اردو یا رومن اردو (مثلاً فقہ، صلوۃ) سے تلاش کریں...'
                  }
                  className="w-full pr-9 pl-3 py-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-sm font-nastaliq text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-500 transition"
                />
                {contentSearch && (
                  <button
                    type="button"
                    onClick={clearContentSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-lg leading-none cursor-pointer"
                    title="تلاش صاف کریں"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => performContentSearch(contentSearch)}
                disabled={!contentSearch.trim() || isSearching}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold font-nastaliq disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>تلاش</span>
              </button>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute z-40 top-full mt-1.5 left-0 right-0 bg-white border border-emerald-200 rounded-2xl shadow-xl max-h-80 overflow-y-auto">
                {/* Results header */}
                <div className="sticky top-0 bg-emerald-800 text-white px-4 py-2 flex items-center justify-between rounded-t-2xl">
                  <span className="text-xs font-bold font-nastaliq">
                    {isSearching
                      ? 'تلاش جاری ہے...'
                      : searchResults.length === 0
                      ? 'کوئی نتیجہ نہیں ملا'
                      : `${searchResults.length} نتائج ملے`}
                  </span>
                  <button
                    type="button"
                    onClick={clearContentSearch}
                    className="text-emerald-200 hover:text-white text-lg leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                {searchResults.length === 0 && !isSearching && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm font-nastaliq text-stone-400">
                      «{contentSearch}» سے متعلق کوئی نتیجہ نہیں ملا۔
                    </p>
                    <p className="text-xs font-nastaliq text-stone-300 mt-1">
                      عربی، اردو یا حدیث نمبر دوبارہ لکھیں۔
                    </p>
                  </div>
                )}

                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full text-right px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-emerald-50 transition cursor-pointer flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-nastaliq ${
                          result.matchType === 'number'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : result.matchType === 'arabic'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : result.matchType === 'roman'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {result.matchType === 'number'
                          ? '🔢 حدیث نمبر'
                          : result.matchType === 'arabic'
                          ? '📖 عربی متن'
                          : result.matchType === 'roman'
                          ? '🔤 رومن اردو'
                          : '🌙 اردو ترجمہ'}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 font-nastaliq">
                        {result.hadithNum
                          ? `حدیث: ${result.hadithNum} • صفحہ ${result.pageIndex + 1}`
                          : `صفحہ ${result.pageIndex + 1}`}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 font-nastaliq text-right leading-relaxed line-clamp-2">
                      {result.preview}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          )}
          {/* ─────────────────────────────────────────────────────────────────── */}

          {/* Reader Body Content: Direct Page Render without limits */}
          <div
            ref={bookContentRef}
            className="book-content min-h-[550px] space-y-4 py-2 overflow-x-hidden max-w-[100vw]"
            style={{
              fontSize: bookFontSize + 'px',
              lineHeight: '2',
              '--book-font-size': bookFontSize + 'px',
              '--arabic-font-size': (bookFontSize + 4) + 'px',
              '--book-line-height': '2',
              touchAction: 'pan-y'
            } as React.CSSProperties}
          >
            {isChunkedBook && chunkLoading ? (
              <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-800 animate-spin" />
                <p className="text-base font-nastaliq font-bold text-emerald-900">
                  صفحہ کا متن لوڈ ہو رہا ہے، براہِ کرم چند لمحے انتظار فرمائیں...
                </p>
              </div>
            ) : isChunkedBook && !currentChunkPage ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-stone-50 border border-dashed border-stone-300 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold font-nastaliq text-stone-800">
                  یہ حصہ زیرِ تعمیر ہے
                </h3>
                <p className="text-xs font-nastaliq text-stone-500 max-w-md">
                  مسند احمد بن حنبل کے اس حصے پر تدوین، مراجعہ اور تصدیق کا کام جاری ہے۔ تصدیق مکمل ہوتے ہی اصل متن پیش کیا جائے گا۔
                </p>
                <span className="text-[11px] font-mono text-stone-400">
                  (جلد {currentVolume?.volNum || ''} — چنک {currentChunkIndex}، صفحہ {currentPage + 1})
                </span>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-800 animate-spin" />
                <p className="text-base font-nastaliq font-bold text-emerald-900">
                  «{book?.title_ur || slug || 'کتاب'}» کا مکمل ذخیرہ ({totalHadithsCount.toLocaleString('ur-PK')} احادیث) لوڈ کیا جا رہا ہے...
                </p>
                <p className="text-xs text-stone-400 font-nastaliq">برائے مہربانی چند لمحے انتظار فرمائیں۔</p>
              </div>
            ) : isHadith ? (
              /* Hadith Reader: 20 Ahadith per page covering all 7589 / 7563 */
              <div className="space-y-6">
                {/* Prominent Book & Chapter Title Banner (ترجمۃ الباب) */}
                <div className="bg-gradient-to-r from-emerald-950 via-[#0a2f20] to-emerald-950 text-white rounded-2xl p-4 sm:p-5 border-2 border-amber-400/80 shadow-md space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <span className="font-nastaliq font-bold text-xs sm:text-sm text-amber-300">
                        {book?.title_ur || book?.title || 'کتاب شریف'} • صفحہ {(currentPage + 1).toLocaleString('ur-PK')} از {totalPages.toLocaleString('ur-PK')}
                      </span>
                    </div>
                    <span className="text-[11px] font-nastaliq text-emerald-200 bg-emerald-900/90 px-2.5 py-0.5 rounded-lg border border-emerald-700/60">
                      احادیث {currentPage * PER_PAGE + 1} تا {Math.min((currentPage + 1) * PER_PAGE, totalHadithsCount)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="arabic-naskh text-xl sm:text-2xl font-bold text-amber-200 leading-relaxed" dir="rtl">
                      {bannerAr}
                    </h2>
                    <p className="font-nastaliq text-sm sm:text-base text-stone-100 font-bold" dir="rtl">
                      {bannerUr}
                    </p>
                  </div>
                </div>

                {/* Dedicated Box: ترجمۃ الباب کا فقہی خلاصہ (فقه البخاری) */}
                {isBukhari && bukhariTarjamah && (
                  <BukhariTarajimBox tarjamah={bukhariTarjamah} />
                )}

                {currentHadiths.map((h, hIdx) => {
                  if (!h) return null;
                  const hadithNum = h.hadithnumber || h.number || (currentPage * PER_PAGE + hIdx + 1);
                  const arabText = h.arab || h.text || '';
                  const isVerified = Boolean(
                    userReviewStatus[`${slug}:${hadithNum}`] === 'verified' || 
                    userReviewStatus[`${hadithFileKey}:${hadithNum}`] === 'verified'
                  );
                  return (
                    <ErrorBoundary key={hadithNum || hIdx} fallbackTitle={`حدیث شریف نمبر ${hadithNum} لوڈ کرنے میں خرابی`}>
                      <HadithCardDarsiView
                        hadith={h}
                        hadithNum={hadithNum}
                        arabText={arabText}
                        slug={slug || hadithFileKey || 'hadith'}
                        bookTitle={book?.title_ur || 'حدیث شریف'}
                        currentPage={currentPage}
                        bookFontSize={bookFontSize}
                        arabicFontSize={arabicFontSize}
                        urduFontSize={urduFontSize}
                        lineHeightScale={lineHeightScale}
                        isVerified={isVerified}
                        globalTashkeel={globalTashkeel}
                        renderClickableArabic={renderClickableArabic}
                        onOpenNarrator={setActiveNarrator}
                        onWordClick={handleWordClick}
                      />
                    </ErrorBoundary>
                  );
                })}

                {currentHadiths.length === 0 && (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="urdu-text text-stone-600">اس صفحہ پر احادیث دستیاب نہیں۔</p>
                  </div>
                )}
              </div>
            ) : isQuran ? (
              /* Dedicated Noble Quran Surah View with Guaranteed High-Contrast Tafseer Pop-up Buttons */
              <div className="space-y-6" dir="rtl">
                {/* 1. Surah Royal Header Banner */}
                <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 sm:p-7 rounded-3xl border-2 border-amber-400 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black font-nastaliq bg-amber-400 text-stone-950 shadow-xs">
                          القرآن الکریم
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold font-nastaliq bg-emerald-800 text-emerald-200 border border-emerald-700">
                          {quranMeta?.revelationType || 'مکية'} • سورة رقم {currentPage + 1}
                        </span>
                        <span className="text-xs font-nastaliq text-emerald-200">
                          پارہ {quranMeta?.juz || 1} • کل آیات: {quranMeta?.ayahCount || 7} • کل رکوعات: {quranMeta?.rukus || 1}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black font-amiri text-amber-200 drop-shadow-md">
                        {quranSurah?.titleArabic || `سُورَةُ ${currentPage + 1}`}
                      </h2>
                      <p className="text-xs sm:text-sm text-emerald-100 font-nastaliq">
                        {quranSurah?.titleUrdu || `سورۃ نمبر ${currentPage + 1}`}
                      </p>
                    </div>

                    {/* Master Tafseer Button for Entire Surah */}
                    <button
                      type="button"
                      onClick={() => {
                        const tEntry = getTafseerForAyah(currentPage + 1);
                        setActiveTafseer(tEntry);
                        setIsTafseerOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black font-nastaliq text-sm sm:text-base transition-all cursor-pointer shadow-lg hover:shadow-xl active:scale-95 border-2 border-amber-500 ring-2 ring-amber-400/40"
                      title="اس سورت کی تمام تفاسیر (ابن کثیر، جلالین، بیضاوی، عثمانی) دیکھیں"
                    >
                      <BookOpen className="w-5 h-5 text-stone-950" />
                      <span>📖 پوری سورت کی تفاسیر دیکھیں</span>
                    </button>
                  </div>

                  {/* Quran View Switcher Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-950/60 p-2.5 rounded-2xl border border-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-nastaliq text-emerald-200 font-bold px-1">اندازِ مطالعہ (View Mode):</span>
                      <button
                        type="button"
                        onClick={() => setQuranViewMode('mushaf')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold transition cursor-pointer border ${
                          quranViewMode === 'mushaf'
                            ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-sm'
                            : 'bg-emerald-900/80 text-emerald-100 hover:bg-emerald-800 border-emerald-700'
                        }`}
                      >
                        📖 مصحف ویو (رکوع وار)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuranViewMode('interlinear')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold transition cursor-pointer border ${
                          quranViewMode === 'interlinear'
                            ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-sm'
                            : 'bg-emerald-900/80 text-emerald-100 hover:bg-emerald-800 border-emerald-700'
                        }`}
                      >
                        🔍 درسی و لفظی ویو (آیت بہ آیت)
                      </button>
                    </div>

                    <span className="text-[11px] font-nastaliq text-amber-200 bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-700/80">
                      {quranViewMode === 'mushaf' ? 'پیوستہ عربی متن مع ترجمہ' : 'ہر آیت کا انفرادی بریک ڈاؤن و ترجمہ'}
                    </span>
                  </div>

                  {currentPage !== 8 /* Surah At-Tawbah (index 8) does not have Bismillah */ && (
                    <p className="font-arabic text-center text-xl sm:text-2xl text-amber-100 font-bold pt-1 tracking-wide">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  )}
                </div>

                {/* 2. Quran Content: Mode Switcher Rendering */}
                {quranViewMode === 'mushaf' ? (
                  /* ─── Mode A: مصحف ویو (رکوع وار پیوستہ تلاوت) ─── */
                  (quranSurah?.segments && quranSurah.segments.length > 0 ? quranSurah.segments : [{
                    id: `quran_fallback_${currentPage}`,
                    arabicText: currentNonHadithPage,
                    urduTranslation: ''
                  }]).map((seg, sIdx) => {
                    const ayahs = extractAyahNumbers(seg.arabicText);
                    const rukuNum = sIdx + 1;
                    const totalRukus = quranSurah?.segments?.length || 1;
                    const ayahRangeLabel = ayahs.length >= 2 
                      ? `آیات ${ayahs[0]} تا ${ayahs[ayahs.length - 1]}`
                      : ayahs.length === 1 
                      ? `آیت ${ayahs[0]}`
                      : `حصہ ${rukuNum}`;

                    return (
                      <div 
                        key={seg.id || sIdx}
                        className="bg-white rounded-3xl border-2 border-emerald-100/90 shadow-md p-5 sm:p-7 space-y-4 hover:border-emerald-300/80 transition-colors"
                      >
                        {/* Ruku Top Bar with Badges and Tafseer Action */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black font-nastaliq bg-emerald-100 text-emerald-950 border border-emerald-200">
                              <span>رکوع {rukuNum} از {totalRukus}</span>
                            </span>
                            <span className="text-xs font-nastaliq text-stone-500">
                              • {ayahRangeLabel}
                            </span>
                          </div>

                          {/* High-Contrast Tafseer Action Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const tEntry = getTafseerForAyah(currentPage + 1, ayahs[0] || undefined, rukuNum);
                              setActiveTafseer(tEntry);
                              setIsTafseerOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold font-nastaliq text-xs sm:text-sm transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95 border border-amber-500"
                            title="اس رکوع و آیات کی 4 معتمد تفاسیر (ابن کثیر، جلالین، بیضاوی، عثمانی) دیکھیں"
                          >
                            <BookOpen className="w-4 h-4 text-stone-950" />
                            <span>📖 تفاسیر دیکھیں (ابن کثیر، جلالین، بیضاوی، عثمانی)</span>
                          </button>
                        </div>

                        {/* Arabic Matn Box */}
                        <div className="bg-amber-50/40 rounded-2xl p-4 sm:p-6 border border-amber-200/60 space-y-2">
                          <div className="flex items-center justify-between text-xs font-nastaliq text-amber-900 border-b border-amber-200/50 pb-2">
                            <span className="font-bold">المتن الشريف (مصحف عثمانی مدنی):</span>
                            <span className="text-[10px] text-stone-400">💡 ہر عربی لفظ پر کلک کر کے صرفی و نحوی لغت دیکھیں</span>
                          </div>
                          <p
                            className="font-arabic arabic-text text-right select-text"
                            dir="rtl"
                            style={{ 
                              fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
                              fontSize: `${Math.round(arabicFontSize * 1.08)}px`, 
                              lineHeight: `${Math.round(arabicFontSize * 1.55 * lineHeightScale)}px`, 
                              fontWeight: 500,
                              color: '#111827' 
                            }}
                          >
                            {renderClickableArabic(seg.arabicText, seg.arabicText, seg.urduTranslation)}
                          </p>
                        </div>

                        {/* Urdu Translation Box */}
                        {seg.urduTranslation && (
                          <div className="bg-emerald-50/30 rounded-2xl p-4 sm:p-5 border border-emerald-100 space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 font-nastaliq border-b border-emerald-100 pb-1.5">
                              <span>سلیس اردو ترجمہ (مولانا فتح محمد جالندھری):</span>
                            </div>
                            <p
                              className="urdu-text text-right select-text leading-loose font-nastaliq"
                              dir="rtl"
                              style={{ 
                                fontSize: `${urduFontSize}px`, 
                                lineHeight: `${Math.round(urduFontSize * 1.85 * lineHeightScale)}px`, 
                                fontWeight: 500, 
                                color: '#1f2937' 
                              }}
                            >
                              {seg.urduTranslation}
                            </p>
                          </div>
                        )}

                        {/* Individual Ayah Tafseer Badges (If multiple ayahs present) */}
                        {ayahs.length > 0 && (
                          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-amber-950 font-nastaliq pl-1">
                              انفرادی آیات کی تفسیر:
                            </span>
                            {ayahs.map(ayahNum => (
                              <button
                                key={ayahNum}
                                type="button"
                                onClick={() => {
                                  const tEntry = getTafseerForAyah(currentPage + 1, ayahNum, rukuNum);
                                  setActiveTafseer(tEntry);
                                  setIsTafseerOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-950 font-bold font-nastaliq text-xs transition cursor-pointer border border-gray-200 hover:border-amber-300 active:scale-95 shadow-2xs"
                                title={`آیت نمبر ${ayahNum} کی 4 معتمد تفاسیر دیکھیں`}
                              >
                                <BookOpen className="w-3 h-3 text-amber-700" />
                                <span>آیت {ayahNum} 📖</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  /* ─── Mode B: درسی و لفظی ویو (آیت بہ آیت سطر وار مع لفظی لغت و تفاسیر) ─── */
                  <div className="space-y-4">
                    {(quranSurah?.segments && quranSurah.segments.length > 0 ? quranSurah.segments : [{
                      id: `quran_fallback_${currentPage}`,
                      arabicText: currentNonHadithPage,
                      urduTranslation: ''
                    }]).map((seg, sIdx) => {
                      const ayahs = extractAyahNumbers(seg.arabicText);
                      const rukuNum = sIdx + 1;
                      // Split verses by ayah markers e.g. ﴿۱﴾ or numbers
                      const verseParts = seg.arabicText.split(/(?=[(（\uFD3F]?\d+[\uFD3E)）]?)/g).filter(v => v.trim().length > 0);
                      const verseTranslations = seg.urduTranslation ? seg.urduTranslation.split(/(?:\r?\n|۔)/).filter(t => t.trim().length > 0) : [];

                      return (
                        <div key={seg.id || sIdx} className="space-y-4">
                          <div className="bg-emerald-900 text-amber-200 px-4 py-2 rounded-2xl flex items-center justify-between text-xs font-nastaliq font-bold">
                            <span>رکوع نمبر {rukuNum} • آیات کا درسی و لفظی تفصیلی جائزہ</span>
                            <button
                              type="button"
                              onClick={() => {
                                const tEntry = getTafseerForAyah(currentPage + 1, ayahs[0] || undefined, rukuNum);
                                setActiveTafseer(tEntry);
                                setIsTafseerOpen(true);
                              }}
                              className="px-3 py-1 rounded-xl bg-amber-400 text-stone-950 hover:bg-amber-300 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>اس رکوع کی تفاسیر</span>
                            </button>
                          </div>

                          {(verseParts.length > 0 ? verseParts : [seg.arabicText]).map((verseText, vIdx) => {
                            const matchedAyahNum = ayahs[vIdx] || (vIdx + 1);
                            const verseUrdu = verseTranslations[vIdx] || seg.urduTranslation;
                            const wordTokens = verseText.trim().split(/\s+/).filter(w => w.length > 0 && !/^[،۔؛:؟!]+$/.test(w));

                            return (
                              <div
                                key={vIdx}
                                className="bg-white rounded-2xl border-2 border-emerald-100 p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-emerald-300 transition"
                              >
                                {/* Verse Header */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-emerald-800 text-amber-300 font-bold font-mono text-xs flex items-center justify-center border border-amber-400">
                                      {matchedAyahNum}
                                    </span>
                                    <span className="font-nastaliq font-bold text-xs text-emerald-950">
                                      {quranSurah?.titleUrdu || 'سورۃ'} • آیت نمبر {matchedAyahNum}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const tEntry = getTafseerForAyah(currentPage + 1, matchedAyahNum, rukuNum);
                                      setActiveTafseer(tEntry);
                                      setIsTafseerOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold font-nastaliq text-xs transition cursor-pointer border border-amber-500 shadow-2xs active:scale-95"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>📖 آیت {matchedAyahNum} کی تفاسیر</span>
                                  </button>
                                </div>

                                {/* Arabic Verse */}
                                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/70">
                                  <p
                                    className="font-arabic arabic-text text-right select-text"
                                    dir="rtl"
                                    style={{ 
                                      fontFamily: "'Amiri Quran', 'Amiri', 'Scheherazade New', 'Traditional Arabic', serif",
                                      fontSize: `${Math.round(arabicFontSize * 1.05)}px`, 
                                      lineHeight: `${Math.round(arabicFontSize * 1.55 * lineHeightScale)}px`, 
                                      color: '#111827' 
                                    }}
                                  >
                                    {renderClickableArabic(verseText, verseText, verseUrdu)}
                                  </p>
                                </div>

                                {/* Urdu Translation */}
                                {verseUrdu && (
                                  <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 font-nastaliq text-emerald-950">
                                    <span className="font-bold text-emerald-800 block mb-0.5 text-xs">ترجمہ:</span>
                                    <p 
                                      className="leading-loose"
                                      style={{ 
                                        fontFamily: "'Jameel Noori Nastaleeq', 'Urdu Nastaleeq', 'Nafees', serif",
                                        fontSize: `${urduFontSize}px`, 
                                        lineHeight: `${Math.round(urduFontSize * 1.85 * lineHeightScale)}px`, 
                                        fontWeight: 500, 
                                        color: '#1f2937' 
                                      }}
                                    >
                                      {verseUrdu}
                                    </p>
                                  </div>
                                )}

                                {/* Word-by-Word Interlinear Chips */}
                                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px] font-nastaliq text-stone-500">
                                    <span className="font-bold text-emerald-900">لفظی تجزیہ (کلک کرنے پر مفصل لغت):</span>
                                    <span>کل کلمات: {wordTokens.length}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5" dir="rtl">
                                    {wordTokens.map((w, wIdx) => (
                                      <button
                                        key={wIdx}
                                        type="button"
                                        onClick={() => handleWordClick(w, verseText, verseUrdu)}
                                        className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-amber-100 text-stone-800 hover:text-amber-950 border border-stone-200 hover:border-amber-300 text-xs font-arabic transition cursor-pointer shadow-2xs"
                                        title={`${w} کا درسی حل و اعراب دیکھیں`}
                                      >
                                        {w}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : parsedDarsPage ? (
              /* Dars-e-Nizami & Structured Classical Reader (Page 1 Golden Standard) */
              <div className="space-y-6">
                {/* 1. Standardized Unified Header for Card: Hadith/Page Number & Grade on Right, Action Toolbar on Left */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950 font-nastaliq text-xs sm:text-sm bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                      {isChunkedBook ? `حدیث شریف نمبر: ${(currentPage + 1).toLocaleString('ur-PK')}` : `صفحہ نمبر: ${(currentPage + 1).toLocaleString('ur-PK')}`}
                    </span>
                    <span className="font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-nastaliq text-[11px]">
                      {isChunkedBook ? 'إسناده صحيح / حسن' : 'نسخۂ معتمد'}
                    </span>
                  </div>

                  {/* Unified Action Toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Tashkeel Toggle */}
                    <button
                      type="button"
                      onClick={() => setGlobalTashkeel(!globalTashkeel)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold font-nastaliq transition cursor-pointer border ${
                        globalTashkeel
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                      }`}
                      title="اعراب ہٹائیں / دکھائیں (طلبۂ درسِ نظامی کے لیے عبارت خوانی کی مشق)"
                    >
                      {globalTashkeel ? <Eye className="w-3 h-3 text-emerald-700" /> : <EyeOff className="w-3 h-3 text-amber-800" />}
                      <span>{globalTashkeel ? 'مع اعراب' : 'بغیر اعراب (مشق)'}</span>
                    </button>

                    {/* Copy with Reference */}
                    <button
                      type="button"
                      onClick={handleCopyPageWithRef}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold font-nastaliq bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-gray-200 transition cursor-pointer"
                      title="عربی متن، اردو ترجمہ اور مکمل حوالہ کاپی کریں"
                    >
                      {copiedPageRef ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-stone-500" />}
                      <span>{copiedPageRef ? 'کاپی ہو گیا' : 'حوالے کے ساتھ نقل کریں'}</span>
                    </button>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={togglePageBookmark}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isPageBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-300'
                          : 'bg-white hover:bg-stone-100 text-stone-400 hover:text-stone-700 border-gray-200'
                      }`}
                      title={isPageBookmarked ? 'محفوظ شدہ صفحہ (بک مارک ہٹائیں)' : 'صفحہ کو محفوظ کریں (بک مارک)'}
                    >
                      {isPageBookmarked ? <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>

                    {/* Student Notes Button */}
                    <button
                      type="button"
                      onClick={() => setShowPageNotes(!showPageNotes)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold font-nastaliq transition cursor-pointer border ${
                        showPageNotes || pageNotes
                          ? 'bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs'
                          : 'bg-white hover:bg-stone-100 text-stone-600 border-gray-200'
                      }`}
                      title="اس صفحہ پر اپنے علمی نوٹس لکھیں"
                    >
                      <FileEdit className="w-3 h-3 text-indigo-700" />
                      <span>{pageNotes ? 'علمی نوٹس (1)' : 'نوٹ شامل کریں'}</span>
                    </button>
                  </div>
                </div>

                {/* 1b. Header Banner (Bismillah, Page & Topic) */}
                {parsedDarsPage.header && (
                  <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 text-center shadow-2xs space-y-2">
                    <p className="font-arabic text-emerald-900 text-lg font-bold">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                    <h3 className="font-nastaliq text-stone-800 font-bold text-base sm:text-lg">
                      {parsedDarsPage.header.split('\n').filter(l => !l.includes('بِسْمِ اللَّهِ')).join(' • ')}
                    </h3>
                  </div>
                )}

                {/* 2a. Sanad Section (سندِ حدیث شریف) with Dynamic Narrator Badges */}
                {parsedDarsSplit.sanad && (
                  <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-stone-200 text-stone-800 border border-stone-300/70 font-nastaliq">
                        <span>سندِ حدیث شریف (سلسلۂ اسناد)</span>
                      </span>
                      <span className="text-[11px] text-stone-500 font-nastaliq">
                        💡 راوی کے نام پر کلک کر کے جرح و تعدیل و سوانح دیکھیں
                      </span>
                    </div>
                    <p
                      className="font-arabic text-stone-800 text-right select-text px-1 leading-relaxed"
                      dir="rtl"
                      style={{ 
                        fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
                        fontSize: '1.25rem', 
                        fontWeight: 600,
                        lineHeight: '2.2' 
                      }}
                    >
                      {renderDarsSanadText()}
                    </p>
                  </div>
                )}

                {/* 2b. Matn Section: Original Arabic Matn with Clickable Words */}
                {parsedDarsPage.matn && (
                  <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-5 sm:p-7 shadow-xs space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between border-b border-amber-200/50 pb-2.5 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300/60 font-nastaliq">
                          <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                          <span>{isChunkedBook ? 'متنِ حدیث مبارک (کلامِ نبوی ﷺ)' : 'المتن الأصلي المعتمد (عربی متن)'}</span>
                        </span>
                        <span className="text-[11px] font-bold text-amber-850 font-nastaliq">
                          {isChunkedBook ? `حدیث شریف نمبر: ${(currentPage + 1).toLocaleString('ur-PK')}` : 'متنِ کتاب (مستند عربی متن)'}
                        </span>
                      </div>
                    </div>

                    {isQuran ? (
                      <div className="space-y-4" dir="rtl">
                        {/* Quran Tafseer Quick Access Header Banner */}
                        <div className="bg-emerald-800 text-white p-3 sm:p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            <span className="font-bold font-nastaliq text-xs sm:text-sm text-amber-100">
                              تفسیر القرآن الکریم (ابن کثیر، جلالین، بیضاوی، عثمانی/معارف القرآن)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const tEntry = getTafseerForAyah(currentPage + 1);
                              setActiveTafseer(tEntry);
                              setIsTafseerOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold font-nastaliq text-xs transition cursor-pointer shadow-xs active:scale-95"
                            title="اس سورت و آیات کی تمام مستند تفاسیر دیکھیں"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-stone-950" />
                            <span>📖 تفاسیر دیکھیں (ابن کثیر، جلالین، بیضاوی، عثمانی)</span>
                          </button>
                        </div>

                        <div
                          className="font-arabic arabic-text text-right leading-loose text-stone-900 select-text px-1 space-y-4"
                          style={{ fontSize: (bookFontSize + 4) + 'px', lineHeight: '2.5' }}
                        >
                          {displayDarsMatn.split('\n\n').map((para, pIdx) => (
                            <div key={pIdx} className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/50 space-y-2">
                              <p className="leading-loose">
                                {renderClickableArabic(para, para, parsedDarsPage.urduTranslation || pipelineAnalysis?.urduTranslation)}
                              </p>
                              <div className="flex justify-end pt-1 border-t border-amber-200/40">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const tEntry = getTafseerForAyah(currentPage + 1, undefined, pIdx + 1);
                                    setActiveTafseer(tEntry);
                                    setIsTafseerOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 font-bold font-nastaliq text-xs transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                                  title="اس رکوع / آیات کی 4 معتمد تفاسیر دیکھیں"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>📖 تفاسیر دیکھیں</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p
                        className="font-arabic arabic-text text-right select-text px-1"
                        dir="rtl"
                        style={{ 
                          fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
                          fontSize: `${arabicFontSize}px`, 
                          lineHeight: `${Math.round(arabicFontSize * 1.55 * lineHeightScale)}px`, 
                          fontWeight: 500, 
                          color: '#111827' 
                        }}
                      >
                        {renderClickableArabic(displayDarsMatn, parsedDarsPage.matn, parsedDarsPage.urduTranslation || pipelineAnalysis?.urduTranslation)}
                      </p>
                    )}
                    <div className="pt-2 border-t border-amber-200/40 flex items-center justify-between text-[11px] font-nastaliq text-amber-900/80">
                      <span>{isChunkedBook ? `مسند أحمد: رقم الحديث ${(currentPage + 1).toLocaleString('ur-PK')}، إسناده صحيح/حسن` : (parsedDarsPage.ref || '')}</span>
                      <span className="text-[10px] text-stone-400">💡 ہر عربی لفظ پر کلک کر کے صرفی و نحوی لغت دیکھیں</span>
                    </div>
                  </div>
                )}

                {/* 3. Middle Section: Urdu Translation & Hall */}
                <div className="bg-emerald-50/25 border border-emerald-100 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 font-nastaliq">
                      <BookMarked className="w-3.5 h-3.5 text-emerald-800" />
                      <span>سلیس اردو ترجمہ و درسی حل</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPageWordByWord(!showPageWordByWord)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold font-nastaliq bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition cursor-pointer"
                    >
                      <Layers className="w-3 h-3 text-emerald-800" />
                      <span>{showPageWordByWord ? 'لفظی ترجمہ گرڈ چھپائیں' : 'لفظ بہ لفظ انٹرلینیئر ترجمہ'}</span>
                    </button>
                  </div>

                  {/* Urdu Translation */}
                  {(parsedDarsPage.urduTranslation || pipelineAnalysis?.urduTranslation) && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-800 font-nastaliq flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                          <span>سلیس اردو ترجمہ:</span>
                        </h4>
                      </div>
                      <p
                        className="urdu-text text-right select-text leading-loose pr-3.5 font-nastaliq"
                        dir="rtl"
                        style={{ 
                          fontFamily: "'Jameel Noori Nastaleeq', 'Urdu Nastaleeq', 'Nafees', serif",
                          fontSize: `${urduFontSize}px`, 
                          lineHeight: `${Math.round(urduFontSize * 1.85 * lineHeightScale)}px`, 
                          fontWeight: 500, 
                          color: '#1f2937' 
                        }}
                      >
                        {parsedDarsPage.urduTranslation || pipelineAnalysis?.urduTranslation}
                      </p>
                    </div>
                  )}

                  {/* Interlinear Grid for Page */}
                  {showPageWordByWord && pipelineAnalysis?.wordByWord && (
                    <div className="pt-2 border-t border-emerald-100/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 font-nastaliq flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                          <span>لفظ بہ لفظ لغوی و صرفی تحقیق (انٹرلینیئر گرڈ):</span>
                        </span>
                        <span className="text-[10px] text-stone-400 font-nastaliq">
                          💡 ہر لفظ پر کلک کر کے مکمل باب و مادہ دیکھیں
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1" dir="rtl">
                          {pipelineAnalysis.wordByWord.slice(0, pageWordLimit).map((wItem, wIdx) => (
                            <div
                              key={wIdx}
                              onClick={() => handleWordClick(wItem.arabic, parsedDarsPage.matn, parsedDarsPage.urduTranslation)}
                              className="bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/80 rounded-xl p-2 text-center transition cursor-pointer flex flex-col justify-between shadow-2xs group"
                            >
                              <span className="font-arabic text-stone-900 font-bold text-base leading-relaxed group-hover:text-amber-950">
                                {globalTashkeel ? wItem.arabic : stripTashkeel(wItem.arabic)}
                              </span>
                              <span className="urdu-text text-emerald-950 font-bold text-xs mt-1 border-t border-amber-200/50 pt-1 leading-snug">
                                {wItem.urdu}
                              </span>
                              <span className="text-[9px] text-stone-500 font-arabic mt-0.5 truncate block" title={wItem.sarf}>
                                {wItem.sarf.split('،')[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                        {pipelineAnalysis.wordByWord.length > 24 && (
                          <div className="flex justify-center pt-1">
                            <button
                              type="button"
                              onClick={() => setPageWordLimit(prev => prev >= (pipelineAnalysis?.wordByWord?.length || 0) ? 24 : (pipelineAnalysis?.wordByWord?.length || 0))}
                              className="px-3.5 py-1 rounded-xl text-xs font-bold font-nastaliq bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300/80 transition cursor-pointer shadow-2xs"
                            >
                              {pageWordLimit >= (pipelineAnalysis?.wordByWord?.length || 0)
                                ? 'کم الفاظ دکھائیں (پہلے 24 الفاظ)'
                                : `مزید الفاظ دیکھیں (+${(pipelineAnalysis?.wordByWord?.length || 0) - pageWordLimit} الفاظ)`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Student Notes Drawer for Page */}
                  {showPageNotes && (
                    <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-3.5 space-y-2" dir="rtl">
                      <div className="flex items-center justify-between text-xs font-nastaliq text-indigo-950">
                        <span className="font-bold flex items-center gap-1.5">
                          <FileEdit className="w-3.5 h-3.5 text-indigo-700" />
                          <span>ذاتی علمی و درسی نوٹس (برائے طلبۂ درسِ نظامی و اساتذہ):</span>
                        </span>
                        <span className="text-[10px] text-stone-400">خودکار محفوظ (LocalStorage)</span>
                      </div>
                      <textarea
                        value={pageNotes}
                        onChange={(e) => {
                          setPageNotes(e.target.value);
                          try {
                            localStorage.setItem(`tehreek_notes_${slug || 'book'}_p${currentPage + 1}`, e.target.value);
                          } catch {}
                        }}
                        placeholder="اس صفحہ کے متن پر اپنے درسی نوٹس، اساتذہ کے اہم نکات، فقہی جزئیات یا امتحانی فوائد درج فرمائیں..."
                        className="w-full p-3 bg-white border border-indigo-200 rounded-xl text-xs font-nastaliq text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition resize-y min-h-[75px]"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* تشریح، اعراب اور حواشی دیکھنے کا اختیاری بٹن */}
                  {(parsedDarsPage.tashreeh || pipelineAnalysis?.tashreeh || parsedDarsPage.iraab || pipelineAnalysis?.iraab || parsedDarsPage.hawashi || pipelineAnalysis?.hawashi) && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setShowScholarlySections(prev => !prev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-stone-600 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-gray-200 transition cursor-pointer font-nastaliq shadow-2xs"
                      >
                        <span>{showScholarlySections ? 'علمی درسی حواشی و اعراب چھپائیں' : 'علمی درسی حواشی و اعراب دیکھیں (اختیاری)'}</span>
                      </button>
                    </div>
                  )}

                  {/* Tashreeh / Darsi Fawaid */}
                  {showScholarlySections && (parsedDarsPage.tashreeh || pipelineAnalysis?.tashreeh) && (
                    <div className="pt-3 border-t border-emerald-100/70">
                      <DarsiTashreehSectionView tashreehText={parsedDarsPage.tashreeh || pipelineAnalysis?.tashreeh || ''} />
                    </div>
                  )}

                  {/* Grammatical Breakdown (Mahal-e-I'rab) */}
                  {showScholarlySections && (parsedDarsPage.iraab || pipelineAnalysis?.iraab) && (
                    <div className="pt-3 border-t border-emerald-100/70">
                      <IraabSectionView iraabLines={parsedDarsPage.iraab || pipelineAnalysis?.iraab || []} />
                    </div>
                  )}

                  {/* Comparative Fiqh across the 4 Madhahib (مقارنہ بین المذاہب) */}
                  {showScholarlySections && pipelineAnalysis?.comparativeFiqh && (
                    <div className="pt-3 border-t border-emerald-100/70">
                      <ComparativeFiqhBox data={pipelineAnalysis.comparativeFiqh} />
                    </div>
                  )}

                  {/* تخریج و حوالہ جات (Cross-References & Takhreej) */}
                  {showScholarlySections && pipelineAnalysis?.takhreejData && (
                    <div className="pt-3 border-t border-emerald-100/70">
                      <AdvancedTakhreejBox data={pipelineAnalysis.takhreejData} />
                    </div>
                  )}

                  {/* Hawashi / Footnotes & Takhreej */}
                  {showScholarlySections && (parsedDarsPage.hawashi || pipelineAnalysis?.hawashi) && (
                    <div className="pt-3 border-t border-emerald-100/70 space-y-2 bg-amber-50/40 rounded-xl p-4 border border-amber-200/50 shadow-2xs">
                      <h4 className="text-xs font-bold text-amber-950 font-nastaliq flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        <span>حواشی و درسی فوائد (تخریج و شواہد):</span>
                      </h4>
                      <div className="arabic-naskh text-sm sm:text-base leading-[2.3] text-stone-700 space-y-1.5 pr-2 select-text" dir="rtl">
                        {(parsedDarsPage.hawashi || (pipelineAnalysis?.hawashi ? pipelineAnalysis.hawashi.join('\n') : '')).split('\n').map((hline, hidx) => (
                          <p key={hidx}>{hline}</p>
                        ))}
                      </div>
                    </div>
                  )}


                  {/* روزمرہ زندگی کا سبق (عملی تربیت) */}
                  {showScholarlySections && pipelineAnalysis?.islahAamal && (
                    <div className="pt-3 border-t border-emerald-100/70">
                      <DailyLifeTakeawayBox
                        lessonPoints={pipelineAnalysis.islahAamal.lessonPoints}
                        amalNuskha={pipelineAnalysis.islahAamal.amalNuskha}
                        hadithNumber={currentPage + 1}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Non-Hadith Public Domain Books: 1 Chapter/Page per Safha */
              <div className="space-y-4">
                {currentNonHadithPage.split('\n\n').filter(b => b.trim().length > 0).map((block, idx) => {
                  const trimmed = block.trim();
                  
                  if (trimmed.includes('بِسْمِ اللَّهِ') || trimmed.includes('«') || trimmed.startsWith('[صَفْحَة') || trimmed.startsWith('[الباب')) {
                    return null;
                  }

                  if (trimmed.startsWith('【متنِ کتاب') || trimmed.startsWith('【سلیس') || trimmed.startsWith('【حوالہ') || trimmed.startsWith('【کتاب')) {
                    return (
                      <div key={idx} className="pt-2">
                        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 urdu-text shadow-2xs">
                          {trimmed.replace(/【|】/g, '')}
                        </span>
                      </div>
                    );
                  }

                  const hasUrduMarkers = trimmed.includes('ہے') || trimmed.includes('ہیں') || trimmed.includes('تھا') || trimmed.includes('تھی') || trimmed.includes('کے') || trimmed.includes('کی') || trimmed.includes('کا') || trimmed.includes('نے') || trimmed.includes('سے') || trimmed.includes('کو') || trimmed.includes('اور') || trimmed.includes('میں') || trimmed.includes('پر') || trimmed.includes('کر') || trimmed.includes('ترجمہ') || trimmed.includes('تشریح');
                  const isArabic = !hasUrduMarkers && /[\u0600-\u06FF]/.test(trimmed) && (trimmed.includes('عَنْ') || trimmed.includes('قَالَ') || trimmed.includes('حَدَّثَنَا') || trimmed.includes('أَخْبَرَنَا') || trimmed.includes('رَضِيَ اللَّهُ'));
                  if (isArabic) {
                    return (
                      <p
                        key={idx}
                        className="font-arabic arabic-text text-right leading-loose text-stone-900 px-1 select-text"
                        dir="rtl"
                        style={{ fontSize: (bookFontSize + 4) + 'px', lineHeight: '2.5' }}
                      >
                        {trimmed}
                      </p>
                    );
                  }

                  return (
                    <p
                      key={idx}
                      className="urdu-text text-emerald-950 text-right px-1 select-text"
                      dir="rtl"
                      style={{ fontSize: bookFontSize + 'px', lineHeight: '2' }}
                    >
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reader Bottom Pagination Buttons */}
          <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentPage <= 0}
              onClick={() => handleJumpToPage(currentPage)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 text-sm font-bold font-nastaliq text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>پچھلا صفحہ</span>
            </button>

            {/* Pagination Button Status Required */}
            <div className="text-center font-nastaliq text-sm text-stone-700 font-bold">
              <span>
                {isHadith
                  ? `کل احادیث شریف: ${totalHadithsCount.toLocaleString('ur-PK')} — صفحہ ${(currentPage + 1).toLocaleString('ur-PK')} از ${totalPages.toLocaleString('ur-PK')}`
                  : `صفحہ ${(currentPage + 1).toLocaleString('ur-PK')} از ${totalPages.toLocaleString('ur-PK')} — کل ${totalPages.toLocaleString('ur-PK')} مستند صفحات`}
              </span>
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => handleJumpToPage(currentPage + 2)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold font-nastaliq shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95 cursor-pointer"
            >
              <span>اگلا صفحہ</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Realtime Global Comments for this Book (Hidden in Dars Mode) */}
          {!isDarsMode && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <GlobalComments
                page={`/books/${slug}?page=${currentPage + 1}`}
                title={`${book?.title_ur || slug} — صفحہ ${(currentPage + 1).toLocaleString('ur-PK')} پر علمی تبصرے و آراء`}
                bookTitle={book?.title_ur || book?.title || slug}
                pageNumber={currentPage + 1}
                bookUrl={`/books/${slug}?page=${currentPage + 1}`}
              />
            </div>
          )}
        </main>
      </div>

      {/* 3. Footer (Same clean branding as homepage) */}
      <footer className="border-t border-gray-100 bg-stone-50 py-8 px-4 text-center mt-12">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="font-bold font-nastaliq text-emerald-900 text-sm sm:text-base">
            تحریکِ ایمان — تصدیق شدہ اسلامی کتب و مراجع
          </p>
          <p className="text-xs text-stone-500 font-nastaliq">
            کلاسیکی کتبِ اسلامیہ کا مصدقہ اور کاپی رائٹ سے آزاد مکمل متنی ذخیرہ (شروع سے آخر تک)۔
          </p>
        </div>
      </footer>

      {/* Urdu Nastaliq Styler Floating Controller (Desktop & Mobile, isolated to .book-content) */}
      <UrduStyler
        isOpen={isStylerOpen}
        onClose={() => setIsStylerOpen(false)}
        onToggle={() => setIsStylerOpen(prev => !prev)}
        bookFontSize={bookFontSize}
        onFontSizeChange={setBookFontSize}
        bookLineHeight={bookLineHeight}
        onLineHeightChange={setBookLineHeight}
      />

      {/* Interactive Typography & Zoom Control Panel (Phase 6) */}
      <FontSizeControlModal
        isOpen={isFontSizeModalOpen}
        onClose={() => setIsFontSizeModalOpen(false)}
        arabicFontSize={arabicFontSize}
        onArabicFontSizeChange={handleUpdateArabicFontSize}
        urduFontSize={urduFontSize}
        onUrduFontSizeChange={handleUpdateUrduFontSize}
        lineHeightScale={lineHeightScale}
        onLineHeightScaleChange={handleUpdateLineHeightScale}
        onResetAll={handleResetTypography}
      />

      {/* Word Lookup Modal for Sarfi, Nahwi, and Lexicon Analysis */}
      {lookupWord && (
        <WordLookupModal
          initialWord={lookupWord}
          contextInfo={lookupContext || undefined}
          onClose={() => {
            setLookupWord(null);
            setLookupContext(null);
          }}
        />
      )}

      {/* Narrator Rijal Info Modal */}
      {activeNarrator && (
        <NarratorModal
          narrator={activeNarrator}
          onClose={() => setActiveNarrator(null)}
          onSearchNarrator={(name) => {
            setActiveNarrator(null);
            setContentSearch(name);
            performContentSearch(name);
          }}
        />
      )}

      {/* Tafseer Classical Modal */}
      {isTafseerOpen && (
        <TafseerModal
          isOpen={isTafseerOpen}
          onClose={() => setIsTafseerOpen(false)}
          entry={activeTafseer}
        />
      )}

      </div>
    </ErrorBoundary>
  );
}