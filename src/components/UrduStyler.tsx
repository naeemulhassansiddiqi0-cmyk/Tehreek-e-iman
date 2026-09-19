import React, { useState, useEffect } from 'react';
import { Type, X, RotateCcw, Plus, Minus, Sliders } from 'lucide-react';

interface UrduStylerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  bookFontSize?: number;
  onFontSizeChange?: (size: number) => void;
  bookLineHeight?: number;
  onLineHeightChange?: (lh: number) => void;
}

function getValidBookFontSize(): number {
  if (typeof window === 'undefined') return 20;
  try {
    localStorage.removeItem('bookFontSize');
    localStorage.removeItem('urduFontSize');
    localStorage.removeItem('urdu_font_size');

    const saved = localStorage.getItem('bookFontSize_v2');
    if (saved !== null && saved !== undefined) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 16 && parsed <= 28) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return 20;
}

export const UrduStyler: React.FC<UrduStylerProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onToggle: controlledOnToggle,
  bookFontSize,
  onFontSizeChange,
  bookLineHeight,
  onLineHeightChange,
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

  const [localFontSize, setLocalFontSize] = useState<number>(getValidBookFontSize);

  // On mount: read from localStorage, force reset to 20 if invalid, cleanup old keys, apply CSS variable
  useEffect(() => {
    const size = getValidBookFontSize();
    setLocalFontSize(size);
    try {
      localStorage.setItem('bookFontSize_v2', size.toString());
      localStorage.removeItem('bookFontSize');
      localStorage.removeItem('urduFontSize');
      localStorage.removeItem('urdu_font_size');
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--book-font-size', `${size}px`);
    }
    if (onFontSizeChange) {
      onFontSizeChange(size);
    }
  }, []);

  const [localLineHeight, setLocalLineHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bookLineHeight') || localStorage.getItem('urdu_line_height');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 24 && parsed <= 50) return parsed;
      }
    }
    return 34;
  });

  const currentFontSize = bookFontSize !== undefined ? bookFontSize : localFontSize;
  const currentLineHeight = bookLineHeight !== undefined ? bookLineHeight : localLineHeight;

  const handleUpdateFontSize = (newSize: number) => {
    let size = typeof newSize === 'number' ? newSize : 20;
    if (isNaN(size) || size < 16 || size > 28) {
      size = Math.min(28, Math.max(16, isNaN(size) ? 20 : size));
    }
    const clamped = Math.min(28, Math.max(16, size));
    setLocalFontSize(clamped);
    if (onFontSizeChange) {
      onFontSizeChange(clamped);
    }
    try {
      localStorage.setItem('bookFontSize_v2', clamped.toString());
      localStorage.removeItem('bookFontSize');
      localStorage.removeItem('urduFontSize');
      localStorage.removeItem('urdu_font_size');
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--book-font-size', `${clamped}px`);
    }
  };

  const handleUpdateLineHeight = (newLh: number) => {
    const clamped = Math.min(50, Math.max(24, newLh));
    setLocalLineHeight(clamped);
    if (onLineHeightChange) {
      onLineHeightChange(clamped);
    }
    try {
      localStorage.setItem('bookLineHeight', clamped.toString());
      localStorage.setItem('urdu_line_height', clamped.toString());
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    handleUpdateFontSize(20);
    handleUpdateLineHeight(34);
  };

  return (
    <>
      {/* Floating Launcher Button (Desktop Only, Hidden on Mobile < 768px) */}
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          width: '48px',
          height: '48px',
          boxSizing: 'border-box'
        }}
        className="hidden md:flex fixed bottom-24 right-6 z-40 items-center justify-center rounded-full bg-emerald-800 hover:bg-emerald-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 border-2 border-emerald-600 cursor-pointer group"
        title="URDU NASTALIQ STYLER (اردو فونٹ سائز و کشادگی)"
        aria-label="اردو فونٹ سائز و کشادگی"
      >
        <Sliders style={{ width: '20px', height: '20px' }} className="text-amber-300 group-hover:rotate-45 transition-transform" />
      </button>

      {/* Fixed Size Styler Box (Desktop Only, Hidden on Mobile < 768px) */}
      {isOpen && (
        <div
          className="hidden md:block fixed top-20 right-6 z-50 pointer-events-none"
          style={{ width: '320px', maxWidth: '100%' }}
        >
          <div
            dir="rtl"
            data-styler-box="true"
            className="urdu-styler-box bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden pointer-events-auto"
            style={{
              fontSize: '14px',
              lineHeight: '20px',
              width: '320px',
              maxWidth: '100%',
              boxSizing: 'border-box',
              position: 'sticky',
              top: '80px',
              fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', system-ui, sans-serif"
            }}
          >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#065f46',
              color: '#ffffff',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fcd34d',
                  boxSizing: 'border-box'
                }}
              >
                <Type style={{ width: '16px', height: '16px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, color: '#ffffff', lineHeight: '18px' }}>
                  URDU NASTALIQ STYLER
                </h3>
                <p style={{ fontSize: '11px', color: '#a7f3d0', margin: 0, lineHeight: '16px' }}>
                  اردو فونٹ سائز و کشادگی
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '6px',
                  color: '#a7f3d0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
                title="ری سیٹ ڈیفالٹ (20px / 34px)"
              >
                <RotateCcw style={{ width: '14px', height: '14px' }} />
              </button>
              <button
                type="button"
                onClick={closeStyler}
                style={{
                  padding: '6px',
                  color: '#a7f3d0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
                title="بند کریں"
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>

          {/* Sliders Body */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fafaf9',
              boxSizing: 'border-box'
            }}
          >
            {/* Slider 1: Font Size with A- and A+ Buttons */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '8px',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ color: '#064e3b' }}>فونٹ سائز:</span>
                <span
                  style={{
                    padding: '2px 8px',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    borderRadius: '6px',
                    border: '1px solid #a7f3d0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {currentFontSize}px
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleUpdateFontSize(currentFontSize - 2)}
                  disabled={currentFontSize <= 16}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    cursor: currentFontSize <= 16 ? 'not-allowed' : 'pointer',
                    opacity: currentFontSize <= 16 ? 0.3 : 1,
                    boxSizing: 'border-box'
                  }}
                  title="اردو فونٹ چھوٹا کریں (A-)"
                  aria-label="A-"
                >
                  A-
                </button>

                <input
                  type="range"
                  min={16}
                  max={28}
                  step={2}
                  value={currentFontSize}
                  onChange={e => handleUpdateFontSize(parseInt(e.target.value, 10))}
                  style={{
                    flex: 1,
                    accentColor: '#047857',
                    cursor: 'pointer',
                    height: '6px',
                    borderRadius: '4px'
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleUpdateFontSize(currentFontSize + 2)}
                  disabled={currentFontSize >= 28}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    cursor: currentFontSize >= 28 ? 'not-allowed' : 'pointer',
                    opacity: currentFontSize >= 28 ? 0.3 : 1,
                    boxSizing: 'border-box'
                  }}
                  title="اردو فونٹ بڑا کریں (A+)"
                  aria-label="A+"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Slider 2: Line Height with - and + Buttons */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '8px',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ color: '#064e3b' }}>سطر کشادگی (لائن ہائٹ):</span>
                <span
                  style={{
                    padding: '2px 8px',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    borderRadius: '6px',
                    border: '1px solid #a7f3d0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {currentLineHeight}px
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleUpdateLineHeight(currentLineHeight - 1)}
                  disabled={currentLineHeight <= 24}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: currentLineHeight <= 24 ? 'not-allowed' : 'pointer',
                    opacity: currentLineHeight <= 24 ? 0.3 : 1,
                    boxSizing: 'border-box'
                  }}
                  title="سطر کشادگی کم کریں"
                >
                  <Minus style={{ width: '14px', height: '14px' }} />
                </button>

                <input
                  type="range"
                  min={24}
                  max={50}
                  value={currentLineHeight}
                  onChange={e => handleUpdateLineHeight(parseInt(e.target.value, 10))}
                  style={{
                    flex: 1,
                    accentColor: '#047857',
                    cursor: 'pointer',
                    height: '6px',
                    borderRadius: '4px'
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleUpdateLineHeight(currentLineHeight + 1)}
                  disabled={currentLineHeight >= 50}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: currentLineHeight >= 50 ? 'not-allowed' : 'pointer',
                    opacity: currentLineHeight >= 50 ? 0.3 : 1,
                    boxSizing: 'border-box'
                  }}
                  title="سطر کشادگی زیادہ کریں"
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>

            {/* Fixed Status Note (No scaling text inside styler) */}
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: '#ecfdf5',
                borderRadius: '12px',
                border: '1px solid #a7f3d0',
                boxSizing: 'border-box'
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  color: '#065f46',
                  textAlign: 'right',
                  margin: 0,
                  lineHeight: '18px',
                  fontWeight: '500'
                }}
              >
                متن کا سائز خودکار طور پر صرف کتابی متن پر لاگو ہوتا ہے۔
              </p>
            </div>
          </div>

          {/* Footer Attribution Required by User */}
          <div
            style={{
              backgroundColor: '#f3f4f6',
              padding: '10px 16px',
              textAlign: 'center',
              borderTop: '1px solid #e5e7eb',
              fontSize: '11px',
              color: '#4b5563',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#064e3b' }}>Developed by Sikandar Hayat Baba</span>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default UrduStyler;
