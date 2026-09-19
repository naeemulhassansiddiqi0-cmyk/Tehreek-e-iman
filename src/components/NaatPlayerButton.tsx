import React from 'react';

interface NaatPlayerButtonProps {
  onClick: () => void;
  className?: string;
}

export const NaatPlayerButton: React.FC<NaatPlayerButtonProps> = ({ onClick, className = '' }) => {
  return (
    <div className={`fixed top-24 left-4 sm:left-6 z-40 animate-fadeIn select-none ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label="حمد و نعتِ رسول ﷺ پلیئر"
        title="حمد و نعتِ رسول ﷺ سنیں"
        className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-950 border-2 border-emerald-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-emerald-200 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center shadow-lg font-bold text-sm shrink-0">
          🎙️
        </div>
        <div className="text-right">
          <span className="block text-[11px] font-nastaliq font-bold text-emerald-300 leading-tight">
            حمد و نعت
          </span>
          <span className="block text-xs font-nastaliq font-black text-white leading-tight">
            نعتِ رسول ﷺ
          </span>
        </div>
      </button>
    </div>
  );
};
