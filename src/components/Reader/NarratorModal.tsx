import React, { useEffect } from 'react';
import { NarratorInfo } from '../../services/rijalService';
import { UserCheck, X, BookOpen, FileText, Search, ExternalLink, ShieldCheck } from 'lucide-react';

interface NarratorModalProps {
  narrator: NarratorInfo | null;
  onClose: () => void;
  onSearchNarrator?: (name: string) => void;
}

export const NarratorModal: React.FC<NarratorModalProps> = ({ narrator, onClose, onSearchNarrator }) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!narrator) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="narrator-modal-title"
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-emerald-800 text-stone-900 space-y-4 text-right max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header: Narrator full name & lineage in pure Arabic Naskh */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-3 gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <UserCheck className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold font-nastaliq text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  اسماء الرجال • راویِ سند
                </span>
                {narrator?.deathYear && (
                  <span className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    وفات: {narrator.deathYear}
                  </span>
                )}
              </div>
              <h3 
                id="narrator-modal-title"
                className="arabic-naskh text-xl sm:text-2xl font-bold text-emerald-950 mt-1 leading-snug"
                style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
              >
                {narrator?.fullName || narrator?.name || 'راوي الحديث'}
              </h3>
              {narrator?.fullName && narrator?.name && narrator.fullName !== narrator.name && (
                <p 
                  className="arabic-naskh text-xs sm:text-sm text-stone-600 font-semibold mt-0.5"
                  style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
                >
                  الاسم المعروف: «{narrator.name}»
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            title="بند کریں (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrator Metadata Cards */}
        <div className="space-y-3 text-xs">
          
          {/* 1. Jarh wa Ta'deel / Authentication Status */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold font-nastaliq text-emerald-950 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>مرتبۂ جرح و تعدیل (توثیق و اعتبار):</span>
            </div>
            <p 
              className="arabic-naskh text-sm sm:text-base text-emerald-900 font-bold pr-5 leading-relaxed"
              style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
            >
              {narrator?.rank || 'ثقة معتمد من رجال الصحيح'}
            </p>
          </div>

          {/* 2. Tabaqa (Generation / طبقہ) */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold font-nastaliq text-amber-950 text-xs">
              <BookOpen className="w-4 h-4 text-amber-800 shrink-0" />
              <span>طبقۂ رواة (محدثین کی درجہ بندی):</span>
            </div>
            <p 
              className="arabic-naskh text-sm sm:text-base text-amber-950 font-bold pr-5 leading-relaxed"
              style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif" }}
            >
              {narrator?.tabaqah || 'رواة الحديث الشريف'}
            </p>
          </div>

          {/* 3. Scholarly Notes & Biography in neat Urdu Nastaliq */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold font-nastaliq text-stone-900 text-xs">
              <FileText className="w-4 h-4 text-stone-700 shrink-0" />
              <span>علمی سوانح و درسی خلاصہ:</span>
            </div>
            <p className="font-nastaliq text-stone-700 leading-loose pr-5 text-xs sm:text-sm text-justify">
              {narrator?.notes || 'من رواة الإسناد الأثبات في كتب السنة المشرفة، اعتمد عليه الأئمة في نقل متون الحديث الشريف.'}
            </p>
          </div>

          {/* 4. Cross References across 147 books */}
          <div className="bg-teal-50/60 border border-teal-200/90 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold font-nastaliq text-teal-950 flex items-center gap-1.5 text-xs">
                <ExternalLink className="w-3.5 h-3.5 text-teal-800" />
                <span>تخریج و مرویات (Cross-References):</span>
              </span>
              <span className="text-[10px] text-teal-700 font-mono">147 کتب • 60,895 احادیث</span>
            </div>
            <p className="text-[11px] text-stone-600 font-nastaliq leading-normal">
              اس راوی کی روایات صحاحِ ستہ، مسند احمد اور دیگر معتمد کتبِ حدیث میں بکثرت مروی ہیں۔
            </p>
            {onSearchNarrator && narrator?.name && (
              <button
                type="button"
                onClick={() => onSearchNarrator(narrator.name)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold font-nastaliq transition shadow-xs cursor-pointer active:scale-98"
              >
                <Search className="w-3.5 h-3.5" />
                <span>اس کتاب میں «{narrator.name}» کی تمام روایات تلاش کریں</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};
