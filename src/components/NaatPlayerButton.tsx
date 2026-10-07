import React from 'react';

interface NaatPlayerButtonProps {
  onClick: () => void;
  className?: string;
}

export const NaatPlayerButton: React.FC<NaatPlayerButtonProps> = ({ onClick, className = '' }) => {
  return (
    <div className={`fixed bottom-16 left-3 md:top-24 md:left-6 md:bottom-auto z-40 animate-fadeIn select-none ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label="حمد و نعت و کلامِ مدارس"
        title="حمد و نعت و کلامِ مدارس سنیں (کھولیں)"
        className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-950 border border-emerald-400/80 shadow-lg sm:shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-emerald-200 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center shadow-md font-bold text-xs sm:text-sm shrink-0">
          🎙️
        </div>
        <div className="text-right">
          <span className="block text-[11px] sm:text-sm font-nastaliq font-bold text-white leading-tight">
            حمد و نعت
          </span>
          <span className="hidden md:block text-[10px] font-nastaliq text-emerald-300">
            68 منتخب کلام • مدارس و صوفیاء
          </span>
        </div>
      </button>
    </div>
  );
};

