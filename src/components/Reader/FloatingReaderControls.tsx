import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Sun, Moon, BookOpen } from 'lucide-react';

interface FloatingReaderControlsProps {
  theme?: string;
  onToggleTheme?: () => void;
  onZoomChange?: (scale: number) => void;
  currentZoom?: number;
  urduFontSize?: number;
  onUrduZoomChange?: (delta: number) => void;
  onResetUrduZoom?: () => void;
  viewportRef?: React.RefObject<HTMLDivElement | null>;
  onNextPage?: () => void;
  hasNextPage?: boolean;
  bookTitle?: string;
  pageLabel?: string;
}

export const FloatingReaderControls: React.FC<FloatingReaderControlsProps> = ({
  theme,
  onToggleTheme,
  onZoomChange,
  currentZoom = 1.0,
  urduFontSize: controlledUrduFontSize,
  onUrduZoomChange,
  onResetUrduZoom,
  viewportRef,
  onNextPage,
  hasNextPage = true,
  pageLabel
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [internalUrduFontSize, setInternalUrduFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('urduFontSize') || localStorage.getItem('urdu_font_size');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 16 && parsed <= 48) return parsed;
      }
    }
    return Math.round(22 * (currentZoom || 1.0));
  });

  const activeUrduFontSize = controlledUrduFontSize !== undefined ? controlledUrduFontSize : internalUrduFontSize;

  const handleUrduZoom = (delta: number) => {
    if (onUrduZoomChange) {
      onUrduZoomChange(delta);
    } else {
      setInternalUrduFontSize(prev => {
        const next = Math.min(48, Math.max(16, prev + delta));
        localStorage.setItem('urduFontSize', next.toString());
        localStorage.setItem('urdu_font_size', next.toString());
        document.documentElement.style.setProperty('--urdu-font-size', `${next}px`);
        return next;
      });
    }
    if (onZoomChange) onZoomChange(delta);
  };

  const handleResetUrduZoom = () => {
    if (onResetUrduZoom) {
      onResetUrduZoom();
    } else {
      setInternalUrduFontSize(22);
      localStorage.setItem('urduFontSize', '22');
      localStorage.setItem('urdu_font_size', '22');
      document.documentElement.style.setProperty('--urdu-font-size', '22px');
    }
  };

  const [pageTransitionNotice, setPageTransitionNotice] = useState<string | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const subPixelRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const speedRef = useRef<number>(1.0);
  const isAdvancingRef = useRef<boolean>(false);
  const onNextPageRef = useRef(onNextPage);
  const hasNextPageRef = useRef(hasNextPage);
  const staticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    onNextPageRef.current = onNextPage;
  }, [onNextPage]);

  useEffect(() => {
    hasNextPageRef.current = hasNextPage;
  }, [hasNextPage]);

  // Stop auto scroll
  const stopAutoScroll = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (animFrameRef.current) {
      window.cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (staticTimerRef.current) {
      clearTimeout(staticTimerRef.current);
      staticTimerRef.current = null;
    }
    isAdvancingRef.current = false;
  };

  // Advance to next page and continue auto scrolling
  const triggerNextPage = (viewport: HTMLDivElement) => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    if (!hasNextPageRef.current) {
      setPageTransitionNotice('کتاب کا اختتام');
      stopAutoScroll();
      setTimeout(() => setPageTransitionNotice(null), 3000);
      return;
    }

    setPageTransitionNotice('اگلا صفحہ لوڈ ہو رہا ہے...');
    
    setTimeout(() => {
      if (onNextPageRef.current) {
        onNextPageRef.current();
      }

      // Reset scroll position of the book viewport to top
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      }
      subPixelRef.current = 0;

      // Brief pause to allow reader to see new page title, then resume
      setTimeout(() => {
        setPageTransitionNotice(null);
        isAdvancingRef.current = false;
        if (isPlayingRef.current) {
          animFrameRef.current = window.requestAnimationFrame(scrollLoop);
        }
      }, 750);
    }, 600);
  };

  // Dedicated Book Page Auto-Scroll Loop (ONLY scrolls viewport, NOT entire site)
  const scrollLoop = () => {
    if (!isPlayingRef.current || isAdvancingRef.current) return;

    const viewport = viewportRef?.current;
    if (!viewport) return;

    const maxScroll = viewport.scrollHeight - viewport.clientHeight;

    if (maxScroll > 6) {
      // Viewport has scrollable content
      if (viewport.scrollTop < maxScroll - 3) {
        const baseSpeed = 0.75;
        subPixelRef.current += baseSpeed * speedRef.current;

        if (subPixelRef.current >= 1.0) {
          const pixelsToMove = Math.floor(subPixelRef.current);
          viewport.scrollTop += pixelsToMove;
          subPixelRef.current -= pixelsToMove;
        }

        animFrameRef.current = window.requestAnimationFrame(scrollLoop);
      } else {
        // Reached the bottom of current page/ayah/hadith!
        triggerNextPage(viewport);
      }
    } else {
      // Short page that fits on screen without overflow
      if (!staticTimerRef.current) {
        const delay = Math.max(3000, 6500 / speedRef.current);
        staticTimerRef.current = setTimeout(() => {
          staticTimerRef.current = null;
          if (isPlayingRef.current) {
            triggerNextPage(viewport);
          }
        }, delay);
      }
      animFrameRef.current = window.requestAnimationFrame(scrollLoop);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAutoScroll();
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      isAdvancingRef.current = false;

      // Ensure reading viewport is visible on screen
      if (viewportRef?.current) {
        viewportRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      animFrameRef.current = window.requestAnimationFrame(scrollLoop);
    }
  };

  // Smooth interrupt when user touches or wheels inside the book viewport
  useEffect(() => {
    const viewport = viewportRef?.current;
    if (!viewport) return;

    const handleUserInterrupt = () => {
      if (isPlayingRef.current && !isAdvancingRef.current) {
        stopAutoScroll();
      }
    };

    viewport.addEventListener('wheel', handleUserInterrupt, { passive: true });
    viewport.addEventListener('touchmove', handleUserInterrupt, { passive: true });

    return () => {
      viewport.removeEventListener('wheel', handleUserInterrupt);
      viewport.removeEventListener('touchmove', handleUserInterrupt);
      if (animFrameRef.current) {
        window.cancelAnimationFrame(animFrameRef.current);
      }
      if (staticTimerRef.current) {
        clearTimeout(staticTimerRef.current);
      }
    };
  }, [viewportRef]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] select-none">
      <div className="flex flex-col items-center gap-1.5">
        
        {/* Page auto-transition notice pill */}
        {pageTransitionNotice && (
          <div className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black font-nastaliq shadow-lg border border-amber-300 animate-bounce">
            {pageTransitionNotice}
          </div>
        )}

        {/* Main Floating Glassmorphism Dock */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-2 border-amber-500/35 dark:border-amber-400/25 shadow-2xl shadow-emerald-950/20 dark:shadow-black/70 transition-all duration-300">
          
          {/* Active Book & Page Indicator Badge */}
          {pageLabel && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-700/60 text-emerald-950 dark:text-amber-200 text-[11px] font-nastaliq font-bold">
              <BookOpen size={13} className="text-amber-600 dark:text-amber-400" />
              <span>{pageLabel}</span>
            </div>
          )}

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-300 animate-pulse'
                : 'bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-amber-200 border border-amber-400/50'
            }`}
            title={isPlaying ? 'آٹو اسکرول روکیں' : 'کتاب کا آٹو اسکرول شروع کریں (صفحہ بہ صفحہ)'}
          >
            {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-amber-300 ml-0.5 text-amber-300" />}
            <span className="font-nastaliq text-[11px] hidden sm:inline">
              {isPlaying ? 'روکیں' : 'آٹو اسکرول'}
            </span>
          </button>

          <div className="h-5 w-[1px] bg-stone-200 dark:bg-stone-700 mx-0.5" />

          {/* Speed Pills (0.5x, 1x, 1.5x, 2x) */}
          <div className="flex items-center gap-1" title="اسکرول کی رفتار">
            {[0.5, 1.0, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold tracking-tight transition-all duration-150 cursor-pointer ${
                  speed === s
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs ring-1 ring-amber-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/40'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="h-5 w-[1px] bg-stone-200 dark:bg-stone-700 mx-0.5" />

          {/* Font Zoom Controls (A- / {activeUrduFontSize}px / A+) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleUrduZoom(-2)}
              disabled={activeUrduFontSize <= 16}
              className="px-2 py-1 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="اردو فونٹ چھوٹا کریں (A-)"
              aria-label="A minus"
            >
              A-
            </button>
            <button
              type="button"
              onClick={handleResetUrduZoom}
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-emerald-800 dark:text-emerald-300 font-mono hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              title="اصل سائز (22px)"
            >
              {activeUrduFontSize}px
            </button>
            <button
              type="button"
              onClick={() => handleUrduZoom(2)}
              disabled={activeUrduFontSize >= 48}
              className="px-2 py-1 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="اردو فونٹ بڑا کریں (A+)"
              aria-label="A plus"
            >
              A+
            </button>
          </div>

          {/* Night Mode Toggle */}
          {onToggleTheme && (
            <>
              <div className="h-5 w-[1px] bg-stone-200 dark:bg-stone-700 mx-0.5" />
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-full text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                title="نائٹ موڈ تبدیل کریں"
              >
                {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-stone-600" />}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
