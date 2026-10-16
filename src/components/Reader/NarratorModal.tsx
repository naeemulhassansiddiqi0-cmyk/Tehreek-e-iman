import React from 'react';
import { NarratorInfo } from '../../services/rijalService';
import { UserCheck, X, BookOpen, Award, Calendar, FileText, Search, ExternalLink } from 'lucide-react';

interface NarratorModalProps {
  narrator: NarratorInfo | null;
  onClose: () => void;
  onSearchNarrator?: (name: string) => void;
}

export const NarratorModal: React.FC<NarratorModalProps> = ({ narrator, onClose, onSearchNarrator }) => {
  if (!narrator) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-emerald-800 text-stone-900 space-y-4 text-right max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-nastaliq text-emerald-950">
                {narrator.name}
              </h3>
              <p className="text-xs text-stone-400 font-arabic">
                {narrator.fullName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            title="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges: Tabaqah & Rank */}
        <div className="space-y-2.5 text-xs font-nastaliq">
          {/* Rank / Jarh wa Ta'deel */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 flex items-start gap-2.5">
            <Award className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block">مرتبۂ جرح و تعدیل:</span>
              <span className="text-emerald-900 leading-relaxed font-arabic text-sm">{narrator.rank}</span>
            </div>
          </div>

          {/* Tabaqah */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950 block">طبقۂ رواة:</span>
              <span className="text-amber-900 leading-relaxed font-arabic text-sm">{narrator.tabaqah}</span>
            </div>
          </div>

          {/* Death Year */}
          {narrator.deathYear && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-800 block">سنِ وفات:</span>
                <span className="text-stone-700 font-mono text-sm">{narrator.deathYear}</span>
              </div>
            </div>
          )}

          {/* Scholarly Notes */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-indigo-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-950 block">علمی و درسی تعارف:</span>
              <p className="text-stone-700 leading-relaxed mt-1 text-xs">{narrator.notes}</p>
            </div>
          </div>

          {/* Cross References & Global Narrations Search across 147 books */}
          <div className="bg-teal-50/60 border border-teal-200/90 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-950 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-teal-800" />
                <span>تخریج و مرویات (Cross-References):</span>
              </span>
              <span className="text-[10px] text-teal-700">مجموع کتب: 147 • 60,895 احادیث</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-normal">
              اس راوی کی روایات صحاحِ ستہ، مسند احمد اور دیگر کتبِ حدیث میں بکثرت مروی ہیں۔
            </p>
            {onSearchNarrator && (
              <button
                type="button"
                onClick={() => onSearchNarrator(narrator.name)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>اس کتاب میں «{narrator.name}» کی تمام روایات تلاش کریں</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end gap-2">
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
