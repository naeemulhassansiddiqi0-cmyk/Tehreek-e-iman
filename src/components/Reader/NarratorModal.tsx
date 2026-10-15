import React from 'react';
import { NarratorInfo } from '../../services/rijalService';
import { UserCheck, X, BookOpen, Award, Calendar, FileText } from 'lucide-react';

interface NarratorModalProps {
  narrator: NarratorInfo | null;
  onClose: () => void;
}

export const NarratorModal: React.FC<NarratorModalProps> = ({ narrator, onClose }) => {
  if (!narrator) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-emerald-800 text-stone-900 space-y-4 text-right"
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
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer shadow-xs"
          >
            واپس متن کی طرف
          </button>
        </div>
      </div>
    </div>
  );
};
