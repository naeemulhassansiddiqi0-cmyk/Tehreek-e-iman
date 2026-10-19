import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  X, 
  Headphones, 
  Repeat, 
  ChevronDown, 
  ArrowDownCircle, 
  Mic2
} from 'lucide-react';
import { useAudioSync, QURAN_AYAH_RECITERS } from '../../context/AudioSyncContext';

export const AudioSyncFloatingBar: React.FC = () => {
  const {
    activeItem,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    playbackRate,
    selectedReciter,
    autoPlayNext,
    autoScroll,
    activeSentenceIndex,
    isFloatingBarOpen,
    togglePlay,
    stop,
    seek,
    setPlaybackRate,
    setReciter,
    setAutoPlayNext,
    setAutoScroll,
    playNext,
    playPrevious,
    playlist,
  } = useAudioSync();

  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);

  if (!isFloatingBarOpen || !activeItem) {
    return null;
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentReciterMeta = QURAN_AYAH_RECITERS.find(r => r.id === selectedReciter) || QURAN_AYAH_RECITERS[0];
  const totalSentences = activeItem.sentences.length;
  const currentQueueIndex = playlist.length > 0 ? playlist.findIndex(it => it.id === activeItem.id) : -1;

  return (
    <div 
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950/98 text-amber-100 border-t-2 border-amber-400 shadow-[0_-12px_40px_rgba(0,0,0,0.8)] backdrop-blur-md px-3 sm:px-6 py-2.5 transition-all select-none animate-fadeIn"
      style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Urdu Nastaleeq', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        
        {/* 1. Track Info & Reciter Pill */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Animated Equalizer Icon */}
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-md relative overflow-hidden">
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-stone-950 rounded-full animate-bounce h-full"></span>
                  <span className="w-1 bg-stone-950 rounded-full animate-bounce h-2/3 [animation-delay:0.15s]"></span>
                  <span className="w-1 bg-stone-950 rounded-full animate-bounce h-4/5 [animation-delay:0.3s]"></span>
                </div>
              ) : (
                <Headphones className="w-5 h-5 text-stone-950" />
              )}
            </div>

            <div className="min-w-0 text-right">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-nastaliq font-bold text-xs sm:text-sm text-amber-300 truncate leading-tight">
                  {activeItem.title}
                </p>
                {activeItem.type === 'quran' && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.2 rounded-md font-nastaliq font-bold shrink-0">
                    القرآن الکریم
                  </span>
                )}
                {activeItem.type === 'hadith' && (
                  <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-700/60 px-1.5 py-0.2 rounded-md font-nastaliq font-bold shrink-0">
                    حدیث شریف
                  </span>
                )}
                {playlist.length > 1 && currentQueueIndex !== -1 && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/50 px-1.5 py-0.2 rounded-md font-nastaliq font-bold shrink-0">
                    ٹریک {currentQueueIndex + 1} از {playlist.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-300 font-nastaliq truncate">
                <span>{activeItem.subtitle || activeItem.bookTitle}</span>
                {totalSentences > 1 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">
                      سطر {activeSentenceIndex + 1} از {totalSentences} ✨
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={stop}
            className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-stone-300 hover:text-white transition cursor-pointer shrink-0"
            title="بند کریں"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Center: Seekbar & Progress (Desktop & Mobile) */}
        <div className="w-full md:flex-1 md:max-w-md flex items-center gap-2.5 px-1 sm:px-3">
          <span className="text-[10px] font-mono text-stone-400 w-9 text-left">
            {formatTime(currentTime)}
          </span>
          <div 
            className="flex-1 h-2 bg-stone-800 rounded-full cursor-pointer relative overflow-hidden group shadow-inner"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              if (duration > 0) {
                seek(pct * duration);
              }
            }}
          >
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all group-hover:from-amber-400 group-hover:to-yellow-200"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-stone-400 w-9 text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* 3. Controls & Reciter Selector Toolbar */}
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto shrink-0 flex-wrap">
          
          {/* Reciter Selector for Quran */}
          {activeItem.type === 'quran' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-amber-200 border border-emerald-700/60 text-xs font-nastaliq transition cursor-pointer shadow-xs"
                title="قاری تبدیل کریں"
              >
                <Mic2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate max-w-[120px]">{currentReciterMeta.nameUrdu}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isReciterMenuOpen && (
                <div className="absolute bottom-full mb-2 right-0 w-64 bg-stone-900 border-2 border-amber-400/80 rounded-2xl p-1.5 shadow-2xl z-50 text-right space-y-1 animate-fadeIn">
                  <div className="px-2 py-1 text-[11px] font-nastaliq font-bold text-amber-400 border-b border-white/10 flex items-center justify-between">
                    <span>قاری منتخب کریں:</span>
                    <span className="text-[9px] text-stone-400">کلک کر کے سنیں</span>
                  </div>
                  {QURAN_AYAH_RECITERS.map(rec => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => {
                        setReciter(rec.id);
                        setIsReciterMenuOpen(false);
                      }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-xl text-xs font-nastaliq transition cursor-pointer flex items-center justify-between ${
                        selectedReciter === rec.id
                          ? 'bg-amber-400 text-stone-950 font-bold'
                          : 'text-stone-200 hover:bg-white/10'
                      }`}
                    >
                      <span>{rec.nameUrdu}</span>
                      <span className="text-[10px] opacity-75">{rec.nameArabic}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Speed Selector Pills */}
          <div className="flex items-center bg-stone-900 border border-stone-700 rounded-xl p-0.5">
            {[0.75, 1.0, 1.25, 1.5].map(rate => (
              <button
                key={rate}
                type="button"
                onClick={() => setPlaybackRate(rate)}
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Auto-Scroll Toggle Button */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded-xl text-[11px] font-nastaliq font-bold transition cursor-pointer border flex items-center gap-1 ${
              autoScroll
                ? 'bg-emerald-900/90 text-emerald-200 border-emerald-600 shadow-2xs'
                : 'bg-stone-900 text-stone-400 border-stone-700'
            }`}
            title="متن کے ساتھ خودکار اسکرولنگ (Auto Scroll)"
          >
            <ArrowDownCircle className="w-3 h-3" />
            <span className="hidden sm:inline">آٹو اسکرول</span>
          </button>

          {/* Auto-Next Continuous Recitation Toggle */}
          <button
            type="button"
            onClick={() => setAutoPlayNext(!autoPlayNext)}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              autoPlayNext
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/80 shadow-2xs'
                : 'bg-stone-900 text-stone-500 border-stone-700'
            }`}
            title={autoPlayNext ? 'مسلسل اگلی آیت/حدیث جاری ہے' : 'اگلی آیت پر خودکار توقف'}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          {/* Prev / Play / Next Group */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={playPrevious}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition cursor-pointer active:scale-95"
              title="پچھلی آیت / حدیث"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer font-bold shrink-0"
              title={isPlaying ? 'روکیں (Pause)' : 'چلائیں (Play)'}
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-stone-950 text-stone-950" />
              ) : (
                <Play className="w-4 h-4 fill-stone-950 text-stone-950 translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={playNext}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition cursor-pointer active:scale-95"
              title="اگلی آیت / حدیث"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Close Button */}
          <button
            type="button"
            onClick={stop}
            className="hidden md:flex p-1.5 rounded-xl bg-white/10 hover:bg-red-500/80 text-stone-400 hover:text-white transition cursor-pointer"
            title="آڈیو بند کریں"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
