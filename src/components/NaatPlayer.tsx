import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  CheckCircle2,
  ListMusic,
  Search
} from 'lucide-react';
import { naatsData, NaatItem } from '../data/naatsData';
import { TehreekImanLogo } from './TehreekImanLogo';

interface NaatPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: 'سب کلام', label: 'سب کلام', icon: '✨' },
  { id: 'مدارس و طلباء', label: 'مدارس و طلباء', icon: '🎓' },
  { id: 'صوفیانہ کلام', label: 'صوفیانہ کلام', icon: '📿' },
  { id: 'حمد و مناجات', label: 'حمد و مناجات', icon: '🤲' },
  { id: 'نعتِ رسول ﷺ', label: 'نعتِ رسول ﷺ', icon: '🕌' },
];

export const NaatPlayer: React.FC<NaatPlayerProps> = ({ isOpen, onClose }) => {
  const [currentNaat, setCurrentNaat] = useState<NaatItem>(() => naatsData[0] || { id: 1, title: 'اگر قرآن کے احکام سے دوری نہ ہوتی (طلباء و مدارس)', fileName: 'agar-quran-ke-ahkaam.mp3' });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [redToastMsg, setRedToastMsg] = useState<string | null>(null);

  // Category Filtering & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('سب کلام');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category counts
  const categoryCounts: Record<string, number> = {
    'سب کلام': naatsData.length,
    'مدارس و طلباء': naatsData.filter(n => n.category === 'مدارس و طلباء').length,
    'صوفیانہ کلام': naatsData.filter(n => n.category === 'صوفیانہ کلام').length,
    'حمد و مناجات': naatsData.filter(n => n.category === 'حمد و مناجات').length,
    'نعتِ رسول ﷺ': naatsData.filter(n => n.category === 'نعتِ رسول ﷺ').length,
  };

  // Filtered tracks
  const filteredNaats = naatsData.filter(item => {
    const matchesCat = selectedCategory === 'سب کلام' || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCat;
    const matchesSearch = 
      item.title.toLowerCase().includes(q) ||
      (item.artist && item.artist.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Playhead, Duration, Time & Speed State
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);

  // Audio volume state
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);


  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Draggable / Movable Modal State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset position to dead center whenever opened
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);


  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Auto-scroll active item in list
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentNaat.id, isOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const showRedToast = (msg: string) => {
    setRedToastMsg(msg);
    setTimeout(() => setRedToastMsg(null), 4000);
  };

  // DIRECT PLAY LOGIC - USE EXACT FILENAME - ROBUST PLAYBACK & ERROR RECOVERY
  const handleSelectNaat = (naat: NaatItem) => {
    setCurrentNaat(naat);
    setCurrentTime(0);
    showToast(naat.title);
    setRedToastMsg(null);

    if (!audioRef.current) return;

    const url = `/naats/${naat.fileName}`;
    console.log('PLAYING URL:', url);
    audioRef.current.src = url;
    audioRef.current.load();

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err: any) => {
          if (err.name === 'AbortError') {
            return; // Normal cancellation when rapidly switching tracks
          }
          if (err.name === 'NotAllowedError') {
            console.warn('Autoplay restricted by browser');
            setIsPlaying(false);
            return;
          }
          console.error('Audio play error:', err);
          // Try fallback URL with encoding
          const encoded = `/naats/${encodeURIComponent(naat.fileName)}`;
          if (audioRef.current && audioRef.current.src !== encoded) {
            audioRef.current.src = encoded;
            audioRef.current.load();
            audioRef.current.play()
              .then(() => setIsPlaying(true))
              .catch((err2: any) => {
                if (err2.name !== 'AbortError' && err2.name !== 'NotAllowedError') {
                  console.error('Audio fallback failed:', err2);
                  showRedToast(`چلانے میں دشواری: ${naat.title}`);
                }
              });
          }
        });
    }
  };

  // Next / Previous Track (Auto-loop next upon finished, respecting active filter)
  const handleNext = () => {
    const list = filteredNaats.length > 0 ? filteredNaats : naatsData;
    const currentIndex = list.findIndex(n => n.id === currentNaat.id);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % list.length;
    handleSelectNaat(list[nextIndex]);
  };

  const handlePrev = () => {
    const list = filteredNaats.length > 0 ? filteredNaats : naatsData;
    const currentIndex = list.findIndex(n => n.id === currentNaat.id);
    const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + list.length) % list.length;
    handleSelectNaat(list[prevIndex]);
  };


  // Toggle Play / Pause for HTML5 audio
  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const targetSrc = `/naats/${currentNaat.fileName}`;
      if (!audioRef.current.src || (!audioRef.current.src.includes(currentNaat.fileName) && !audioRef.current.src.includes(encodeURIComponent(currentNaat.fileName)))) {
        audioRef.current.src = targetSrc;
        audioRef.current.load();
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err: any) => {
            if (err.name === 'AbortError') return;
            if (err.name === 'NotAllowedError') {
              console.warn('Autoplay restricted by browser');
              setIsPlaying(false);
              return;
            }
            console.error('Play error:', err);
            showRedToast(`چلانے میں دشواری: ${currentNaat.title}`);
          });
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  // Time Formatter (mm:ss)
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    const padMins = mins < 10 ? `0${mins}` : `${mins}`;
    const padSecs = remainingSecs < 10 ? `0${remainingSecs}` : `${remainingSecs}`;
    return `${padMins}:${padSecs}`;
  };

  // Playback Rate / Speed Controller (0.75x, 1x, 1.25x, 1.5x, 2x)
  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    showToast(`رفتار: ${rate}x`);
  };

  // Seekbar Controls (Drag & Click)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  // Skip Forward / Backward
  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration || 1000);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-hidden select-none animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDragging) onClose();
      }}
    >
      {/* Hidden Native Audio Element with Time & Metadata tracking */}
      <audio
        ref={audioRef}
        src={`/naats/${currentNaat.fileName}`}
        preload="metadata"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleNext}
        onTimeUpdate={() => {
          if (!isSeeking && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
            audioRef.current.playbackRate = playbackRate;
          }
        }}
        onDurationChange={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onError={(e) => {
          const audio = e.currentTarget;
          if (audio.error) {
            console.error('HTML5 audio error:', audio.error.code, audio.error.message);
          }
        }}
        className="hidden"
      />

      {/* Inner Draggable Box */}
      <div 
        ref={modalRef}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'auto',
          fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" 
        }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#064e3b] via-[#043328] to-[#022c22] rounded-[24px] border border-yellow-400/30 shadow-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden text-amber-50 select-none transition-transform duration-75"
      >
        {/* Toast Notification (Success/Info) */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#FACC15] text-black font-nastaliq font-bold text-xs px-4 py-1.5 rounded-xl shadow-2xl animate-fadeIn border border-amber-300 flex items-center gap-1.5 pointer-events-none">
            <CheckCircle2 className="w-4 h-4 text-emerald-950" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Red Toast Notification (Error / 404 File Not Found) */}
        {redToastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-nastaliq font-bold text-xs px-5 py-2 rounded-xl shadow-2xl animate-bounce border-2 border-white/60 flex items-center gap-2 pointer-events-none">
            <span>⚠️</span>
            <span>{redToastMsg}</span>
          </div>
        )}

        {/* STICKY TOP HEADER: DRAG HANDLE + CLOSE BUTTON + RESET TO CENTER */}
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="sticky top-0 z-20 flex justify-between items-center p-3.5 sm:p-4 bg-[#064e3b] rounded-t-[24px] border-b border-yellow-400/20 shrink-0 shadow-md cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-2.5 pointer-events-none">
            <TehreekImanLogo size={36} className="shadow-md shrink-0 ring-1 ring-amber-400/80" />
            <div>
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-[11px] text-emerald-300 font-nastaliq font-bold leading-tight">
                    صوتیاتِ نبوی و صوفیانہ کلام
                  </span>
                  <h2 className="text-base sm:text-xl font-bold text-white font-nastaliq leading-tight flex items-center gap-1.5">
                    <span className="text-amber-400 font-mono text-sm">⠿⠿</span>
                    حمد، نعت و کلامِ مدارس
                  </h2>
                </div>
                <span className="text-[10px] bg-yellow-400/20 text-[#FACC15] border border-yellow-400/30 px-2 py-0.5 rounded-full font-nastaliq font-bold self-start mt-0.5">
                  پکڑ کر گھسیٹیں ✥
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-nastaliq mt-0.5">
                {naatsData.length} منتخب کلام • بغیر شرک و غلو
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reset to Center Button */}
            {(position.x !== 0 || position.y !== 0) && (
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={() => setPosition({ x: 0, y: 0 })}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#FACC15] text-xs font-nastaliq font-bold border border-yellow-400/30 transition cursor-pointer flex items-center gap-1 active:scale-95"
                title="درمیان میں لائیں (Reset to Center)"
              >
                <span>↺</span>
                <span className="hidden sm:inline">درمیان میں لائیں</span>
              </button>
            )}

            <button 
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={() => {
                onClose();
                setPosition({ x: 0, y: 0 });
              }} 
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/80 active:scale-95 flex items-center justify-center text-white text-xl font-bold border border-white/20 transition cursor-pointer shrink-0"
              title="بند کریں (Close)"
              aria-label="بند کریں"
            >
              ✕
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 space-y-4">
          
          {/* 1. NOW PLAYING CONTROLS CARD */}
          <div className="bg-gradient-to-r from-emerald-900/90 to-[#022c22]/90 border border-yellow-400/30 rounded-2xl p-4 shadow-xl text-center space-y-3 relative overflow-hidden">
            
            {/* Auto Play Indicator Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-amber-400/40 text-[#FACC15] text-[11px] font-nastaliq font-bold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>🔄 مسلسل ترنم: آن (اگلا کلام خودکار جاری رہے گا)</span>
            </div>

            {/* Current Item Title & Meta - Directly Matches Clicked Item */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  #{currentNaat.id}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-nastaliq font-bold text-emerald-300 border bg-emerald-500/20 border-emerald-400/30">
                  {currentNaat.category || 'نعت'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-nastaliq text-amber-200/90 border bg-emerald-950/60 border-yellow-400/20">
                  {currentNaat.artist || 'پبلک ڈومین'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-nastaliq text-amber-200 tracking-wide">
                {currentNaat.title}
              </h3>
            </div>

            {/* 2. PLAYHEAD & SEEKBAR LINE (پلے ہیڈ اور پروگریس لائن) */}
            <div className="space-y-1.5 pt-1 px-1">
              <div className="relative flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step="0.5"
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseDown={() => setIsSeeking(true)}
                  onMouseUp={(e) => {
                    setIsSeeking(false);
                    if (audioRef.current) audioRef.current.currentTime = parseFloat((e.target as HTMLInputElement).value);
                  }}
                  onTouchStart={() => setIsSeeking(true)}
                  onTouchEnd={(e) => {
                    setIsSeeking(false);
                    if (audioRef.current) audioRef.current.currentTime = parseFloat((e.target as HTMLInputElement).value);
                  }}
                  aria-label="آڈیو پلے ہیڈ"
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-400 bg-emerald-950 border border-yellow-400/30 transition-all shadow-inner"
                  style={{
                    background: `linear-gradient(to right, #FACC15 ${(currentTime / (duration || 1)) * 100}%, rgba(2, 44, 34, 0.8) ${(currentTime / (duration || 1)) * 100}%)`
                  }}
                />
              </div>

              {/* THREE TIME METRICS: ELAPSED, TOTAL DURATION, REMAINING */}
              <div className="flex items-center justify-between text-xs font-mono text-emerald-200/90 px-1">
                {/* 1. کتنے منٹ تک نعت چل چکی ہے (Elapsed) */}
                <span className="flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-yellow-400/20 text-[#FACC15]" title="کتنے منٹ چل چکی ہے">
                  <span className="text-[10px] font-nastaliq text-emerald-300">جاری:</span>
                  <span className="font-bold">{formatTime(currentTime)}</span>
                </span>

                {/* 2. کتنے منٹ کی نعت ہے (Total Duration) */}
                <span className="flex items-center gap-1 text-[11px] text-amber-200/90 font-nastaliq" title="کل دورانیہ">
                  <span>کل وقت:</span>
                  <span className="font-mono font-bold text-white">{formatTime(duration)}</span>
                </span>

                {/* 3. کتنے منٹ کی باقی ہے (Remaining) */}
                <span className="flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-yellow-400/20 text-amber-300" title="کتنے منٹ باقی ہے">
                  <span className="text-[10px] font-nastaliq text-emerald-300">باقی:</span>
                  <span className="font-bold">-{formatTime(Math.max(0, duration - currentTime))}</span>
                </span>
              </div>
            </div>

            {/* 3. PLAYBACK SPEED SELECTOR (سلو اور فاسٹ کرنے کا آپشن) */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-950/60 px-3 py-2 rounded-xl border border-yellow-400/20">
              <span className="text-xs font-nastaliq text-amber-300 font-bold flex items-center gap-1">
                <span>⚡ رفتار (Speed):</span>
              </span>

              {/* Speed Buttons: 0.75x (سلو), 1x (عام), 1.25x (تیز), 1.5x (فاسٹ), 2x */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {[
                  { rate: 0.75, label: '0.75x سلو' },
                  { rate: 1, label: '1x عام' },
                  { rate: 1.25, label: '1.25x تیز' },
                  { rate: 1.5, label: '1.5x فاسٹ' },
                  { rate: 2, label: '2x' }
                ].map(({ rate, label }) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => changeSpeed(rate)}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                      playbackRate === rate
                        ? 'bg-amber-400 text-emerald-950 shadow-md font-extrabold border border-amber-300'
                        : 'bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-yellow-400/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. DIRECT PLAY CONTROLS: -10s, PREV, PLAY/PAUSE, NEXT, +10s, VOLUME */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 pt-1">
              {/* Skip -10s */}
              <button
                type="button"
                onClick={() => handleSkip(-10)}
                className="px-2 py-1 rounded-xl bg-emerald-950/70 hover:bg-emerald-800 text-amber-300 border border-amber-400/30 transition cursor-pointer active:scale-95 text-xs font-mono font-bold"
                title="10 سیکنڈ پیچھے"
              >
                ⏪ -10s
              </button>

              <button
                type="button"
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-emerald-950/70 hover:bg-emerald-800 text-amber-300 flex items-center justify-center border border-amber-400/30 transition cursor-pointer active:scale-95"
                title="پچھلا کلام"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 flex items-center justify-center shadow-lg shadow-amber-500/30 transition cursor-pointer active:scale-95 font-bold"
                title={isPlaying ? 'روکیں' : 'چلائیں'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                ) : (
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-emerald-950/70 hover:bg-emerald-800 text-amber-300 flex items-center justify-center border border-amber-400/30 transition cursor-pointer active:scale-95"
                title="اگلا کلام"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Skip +10s */}
              <button
                type="button"
                onClick={() => handleSkip(10)}
                className="px-2 py-1 rounded-xl bg-emerald-950/70 hover:bg-emerald-800 text-amber-300 border border-amber-400/30 transition cursor-pointer active:scale-95 text-xs font-mono font-bold"
                title="10 سیکنڈ آگے"
              >
                +10s ⏩
              </button>

              {/* Volume Slider */}
              <div className="hidden sm:flex items-center gap-1.5 mr-1 bg-emerald-950/60 px-2 py-1 rounded-xl border border-yellow-400/20">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="text-amber-300 hover:text-amber-200"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-14 accent-amber-400 h-1 bg-emerald-900 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 2. CATEGORY TABS SELECTOR (مدارس، صوفیانہ، حمد، نعت) */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 pt-1 select-none">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-lg shadow-amber-500/20 border border-amber-300 font-extrabold scale-[1.02]'
                      : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border border-yellow-400/20'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                    isActive ? 'bg-emerald-950 text-amber-300' : 'bg-emerald-900 text-emerald-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. SEARCH BAR (ڈارک ایمرلڈ، کوئی وائٹ باکس نہیں) */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="کلام، شاعر، یا عنوان تلاش کریں (مثلاً: قرآن، اقبال، عاصم، مدینہ)..."
              className="w-full bg-emerald-950/80 border border-yellow-400/30 rounded-xl py-2 pr-9 pl-9 text-xs font-nastaliq text-amber-100 placeholder-emerald-400/50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 shadow-inner"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-emerald-400/70 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2 w-5 h-5 rounded-full bg-emerald-900/80 hover:bg-red-500/80 text-white flex items-center justify-center text-[10px] transition cursor-pointer"
                title="تلاش صاف کریں"
              >
                ✕
              </button>
            )}
          </div>

          {/* 4. TRACKS LIST - FILTERED BY CATEGORY & SEARCH */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold font-nastaliq text-amber-300 flex items-center gap-1.5">
                <ListMusic className="w-4 h-4 text-amber-400" />
                <span>
                  {selectedCategory} ({filteredNaats.length} کلام)
                </span>
              </h4>
              {searchQuery && (
                <span className="text-[11px] font-nastaliq text-emerald-300">
                  تلاش کے نتائج: {filteredNaats.length}
                </span>
              )}
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {filteredNaats.length === 0 ? (
                <div className="p-8 text-center bg-emerald-950/40 rounded-xl border border-dashed border-emerald-700/50 space-y-2">
                  <p className="text-sm font-nastaliq text-amber-200">
                    اس تلاش کے مطابق کوئی کلام نہیں ملا۔
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('سب کلام');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-lg text-xs font-nastaliq border border-amber-400/30 transition"
                  >
                    تمام کلام دکھائیں
                  </button>
                </div>
              ) : (
                filteredNaats.map(item => {
                  const isSelected = item.id === currentNaat.id;
                  return (
                    <div
                      key={item.id}
                      ref={isSelected ? activeItemRef : null}
                      onClick={() => handleSelectNaat(item)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-400/20 via-emerald-800/70 to-emerald-900/70 border-amber-400 shadow-md scale-[1.01]'
                          : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/40 text-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        {/* Item Number & Play indicator */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected 
                            ? 'bg-amber-400 text-emerald-950 shadow-md' 
                            : 'bg-emerald-900/70 text-amber-300'
                        }`}>
                          {isSelected && isPlaying ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-950 animate-ping"></span>
                          ) : (
                            <span>{item.id}</span>
                          )}
                        </div>

                        {/* Title & Category & Artist */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className={`font-nastaliq text-sm sm:text-base font-bold leading-tight truncate ${
                              isSelected ? 'text-amber-300' : 'text-stone-100'
                            }`}>
                              {item.title}
                            </h5>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-nastaliq font-bold shrink-0 ${
                              item.category === 'مدارس و طلباء' 
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                                : item.category === 'صوفیانہ کلام'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                                : item.category === 'حمد و مناجات'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            }`}>
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-emerald-400/70 font-nastaliq">
                            <span>{item.artist || 'پبلک ڈومین'}</span>
                            <span className="text-emerald-600 font-mono">•</span>
                            <span className="font-mono text-[10px] text-emerald-400/50 truncate">
                              {item.fileName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg text-xs font-nastaliq font-bold bg-emerald-900/60 text-amber-300 border border-yellow-400/20 shrink-0 mr-2">
                        سنیں 🎧
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-3 bg-[#064e3b] border-t border-yellow-400/20 flex items-center justify-between text-[11px] text-emerald-200/80 font-nastaliq px-4">
          <span>تحریکِ ایمان ڈیجیٹل کتب خانہ • صوتیاتِ نبوی</span>
          <span>{filteredNaats.length} کلام (کل {naatsData.length})</span>
        </div>
      </div>
    </div>
  );
};
