import React, { useState, useEffect } from 'react';
import { Type, X, RotateCcw, Plus, Minus, Sliders } from 'lucide-react';

interface UrduStylerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export const UrduStyler: React.FC<UrduStylerProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onToggle: controlledOnToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const toggleOpen = () => {
    if (controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const closeStyler = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('urdu_font_size');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 14 && parsed <= 32) return parsed;
      }
    }
    return 21;
  });

  const [lineHeight, setLineHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('urdu_line_height');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 24 && parsed <= 50) return parsed;
      }
    }
    return 34;
  });

  // Apply CSS custom properties to document root whenever fontSize or lineHeight changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--urdu-font-size', `${fontSize}px`);
      document.documentElement.style.setProperty('--urdu-line-height', `${lineHeight}px`);
      try {
        localStorage.setItem('urdu_font_size', fontSize.toString());
        localStorage.setItem('urdu_line_height', lineHeight.toString());
      } catch {
        // ignore
      }
    }
  }, [fontSize, lineHeight]);

  const handleReset = () => {
    setFontSize(21);
    setLineHeight(34);
  };

  return (
    <>
      {/* Floating Launcher Button (Right Edge) */}
      <button
        type="button"
        onClick={toggleOpen}
        className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 border-2 border-emerald-600 cursor-pointer group"
        title="URDU NASTALIQ STYLER (فونٹ سائز و کشادگی)"
        aria-label="اردو نستعلیق اسٹائلر"
      >
        <Sliders className="w-5 h-5 text-amber-300 group-hover:rotate-45 transition-transform" />
      </button>

      {/* Control Modal / Popover */}
      {isOpen && (
        <div
          dir="rtl"
          className="fixed bottom-38 right-6 z-50 w-[90vw] sm:w-[340px] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden animate-fadeIn"
          style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', system-ui, sans-serif" }}
        >
          {/* Header */}
          <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-300">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-wide">URDU NASTALIQ STYLER</h3>
                <p className="text-[10px] text-emerald-200 font-nastaliq">اردو فونٹ سائز و سطر کشادگی</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                title="ری سیٹ ڈیفالٹ (21px / 34px)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={closeStyler}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                title="بند کریں"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sliders Body */}
          <div className="p-4 space-y-4 bg-gray-50/50">
            {/* Slider 1: Font Size */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800 font-nastaliq">
                <span className="flex items-center gap-1 text-emerald-900">
                  <span>فونٹ سائز:</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 font-mono text-xs font-bold">
                  {fontSize}px
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFontSize(prev => Math.max(14, prev - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 transition cursor-pointer border border-gray-200 text-xs font-bold"
                  title="سائز چھوٹا کریں"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min={14}
                  max={32}
                  value={fontSize}
                  onChange={e => setFontSize(parseInt(e.target.value, 10))}
                  className="flex-1 accent-emerald-700 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                />

                <button
                  type="button"
                  onClick={() => setFontSize(prev => Math.min(32, prev + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 transition cursor-pointer border border-gray-200 text-xs font-bold"
                  title="سائز بڑا کریں"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Slider 2: Line Height */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800 font-nastaliq">
                <span className="flex items-center gap-1 text-emerald-900">
                  <span>لائن ہائٹ:</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 font-mono text-xs font-bold">
                  {lineHeight}px
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLineHeight(prev => Math.max(24, prev - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 transition cursor-pointer border border-gray-200 text-xs font-bold"
                  title="سطر کشادگی کم کریں"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min={24}
                  max={50}
                  value={lineHeight}
                  onChange={e => setLineHeight(parseInt(e.target.value, 10))}
                  className="flex-1 accent-emerald-700 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                />

                <button
                  type="button"
                  onClick={() => setLineHeight(prev => Math.min(50, prev + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 transition cursor-pointer border border-gray-200 text-xs font-bold"
                  title="سطر کشادگی زیادہ کریں"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Sample Text Preview */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
              <p className="text-[10px] text-stone-500 font-nastaliq mb-1">پیش نظارہ (Live Preview):</p>
              <p 
                className="urdu-text text-emerald-950 text-right select-text"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}px`
                }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — تمام اعمال کا دارومدار نیتوں پر ہے۔
              </p>
            </div>
          </div>

          {/* Footer Attribution Required by User */}
          <div className="bg-stone-100/90 px-4 py-2.5 text-center border-t border-gray-200 text-[11px] text-stone-600 font-nastaliq">
            <span className="font-bold text-emerald-900">Developed by Sikandar Hayat Baba</span>
          </div>
        </div>
      )}
    </>
  );
};

export default UrduStyler;
