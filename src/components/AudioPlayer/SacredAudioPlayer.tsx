import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  X, 
  Headphones,
  Search,
  CheckCircle2,
  Mic2,
  BookOpen,
  Maximize2,
  Minimize2,
  Sparkles,
  Repeat
} from 'lucide-react';
import { TehreekImanLogo } from '../TehreekImanLogo';
import { QURAN_SURAHS_CANONICAL } from '../../data/quranData';
import { GlobalComments } from '../GlobalComments';

export interface QuranSurah {
  id: number;
  name: string;
  arabic: string;
  numberOfAyahs?: number;
  type?: string;
}

export interface QariItem {
  id: string;
  name: string;
  nameEn: string;
  style: string;
}

// 12 Renowned International Qaris (with Abdul Basit, Mishary Alafasy, Minshawi featured prominently)
export const qaris: QariItem[] = [
  { id: "ar.alafasy", name: "مشاری راشد العفاسی", nameEn: "Mishary Alafasy", style: "مشہور و مقبول" },
  { id: "ar.abdulbasitmurattal", name: "عبدالباسط عبدالصمد", nameEn: "Abdul Basit", style: "مرتل کلاسیکی" },
  { id: "ar.minshawi", name: "محمد صدیق المنشاوی", nameEn: "Minshawi", style: "خشوع و تجوید" },
  { id: "ar.abdurrahmaansudais", name: "عبدالرحمن السدیس", nameEn: "Al-Sudais", style: "امام حرم مکی" },
  { id: "ar.shaatree", name: "ابوبکر الشاطری", nameEn: "Al-Shatri", style: "دلکش تلاوت" },
  { id: "ar.mahermuaiqly", name: "ماہر المعيقلی", nameEn: "Maher Al-Muaiqly", style: "امام حرم مکی" },
  { id: "ar.ahmedajamy", name: "احمد العجمی", nameEn: "Al-Ajamy", style: "سوز و گداز" },
  { id: "ar.saoodshuraym", name: "سعود الشریم", nameEn: "Al-Shuraim", style: "امام حرم مکی" },
  { id: "ar.husary", name: "محمود خلیل الحصری", nameEn: "Husary", style: "شیخ المقارئ" },
  { id: "ar.hudhaify", name: "علی الحذیفی", nameEn: "Al-Hudhaify", style: "امام مسجد نبوی" },
  { id: "ar.muhammadayyoub", name: "محمد ایوب", nameEn: "Muhammad Ayyub", style: "مسجد نبوی" },
  { id: "ar.yasser", name: "یاسر الدوسری", nameEn: "Yasser Al-Dosari", style: "امام حرم مکی" }
];

// Quick Access Surahs for Madaris students & daily recitation
export const QUICK_SURAHS = [
  { id: 1, name: "الفاتحہ", arabic: "الفاتحة" },
  { id: 36, name: "یٰسین", arabic: "يس" },
  { id: 67, name: "الملک", arabic: "الملك" },
  { id: 18, name: "الکہف", arabic: "الكهف" },
  { id: 55, name: "الرحمٰن", arabic: "الرحمن" },
  { id: 56, name: "الواقعہ", arabic: "الواقعة" },
];

const canonicalLookup = new Map(QURAN_SURAHS_CANONICAL.map(s => [s.number, s]));

// Generate full 114 surahs array automatically with loop (from 3 to 113)
export const quranSurahs: QuranSurah[] = [
  { 
    id: 1, 
    name: "الفاتحہ", 
    arabic: "الفاتحة", 
    numberOfAyahs: 7, 
    type: "مکی" 
  },
  { 
    id: 2, 
    name: "البقرہ", 
    arabic: "البقرة", 
    numberOfAyahs: 286, 
    type: "مدنی" 
  },
  ...Array.from({ length: 111 }, (_, idx) => {
    const id = idx + 3;
    const canonical = canonicalLookup.get(id);
    return {
      id,
      name: canonical ? canonical.nameUrdu.replace(/^سورۃ\s*/, '') : `سورت ${id}`,
      arabic: canonical ? canonical.nameArabic : `سورة ${id}`,
      numberOfAyahs: canonical?.ayahCount || 0,
      type: canonical?.revelationType === 'مکية' ? 'مکی' : 'مدنی',
    };
  }),
  { 
    id: 114, 
    name: "الناس", 
    arabic: "الناس", 
    numberOfAyahs: 6, 
    type: "مکی" 
  }
];

export const SURAH_LIST = quranSurahs;

// Dynamic Full Surah Audio URL Generator with Urdu translation toggle support
export function getSurahAudioUrl(qariId: string, surahNumber: number, isUrdu = false): string {
  const pad3 = surahNumber.toString().padStart(3, '0');
  if (isUrdu) {
    return `https://server11.mp3quran.net/urdu/${pad3}.mp3`;
  }
  switch (qariId) {
    case 'ar.alafasy':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;
    case 'ar.abdulbasitmurattal':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${surahNumber}.mp3`;
    case 'ar.minshawi':
      return `https://server10.mp3quran.net/minsh/${pad3}.mp3`;
    case 'ar.abdurrahmaansudais':
      return `https://server11.mp3quran.net/sds/${pad3}.mp3`;
    case 'ar.saoodshuraym':
      return `https://server7.mp3quran.net/shur/${pad3}.mp3`;
    case 'ar.yasser':
      return `https://server11.mp3quran.net/yasser/${pad3}.mp3`;
    case 'ar.shaatree':
      return `https://server11.mp3quran.net/shatri/${pad3}.mp3`;
    case 'ar.mahermuaiqly':
      return `https://server12.mp3quran.net/maher/${pad3}.mp3`;
    case 'ar.ahmedajamy':
      return `https://server10.mp3quran.net/ajm/${pad3}.mp3`;
    case 'ar.husary':
      return `https://server13.mp3quran.net/husr/${pad3}.mp3`;
    case 'ar.hudhaify':
      return `https://server9.mp3quran.net/hthfi/${pad3}.mp3`;
    case 'ar.muhammadayyoub':
      return `https://server8.mp3quran.net/ayyub/${pad3}.mp3`;
    default:
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;
  }
}

export interface SacredAudioPlayerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const SacredAudioPlayer: React.FC<SacredAudioPlayerProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onOpen: externalOnOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    setInternalIsOpen(val);
    if (val) {
      externalOnOpen?.();
    } else {
      externalOnClose?.();
    }
  };
  const [activeTab, setActiveTab] = useState<'surahs' | 'qaris'>('surahs');
  const [currentSurah, setCurrentSurah] = useState(1);
  const [selectedQari, setSelectedQari] = useState<QariItem>(qaris[0]);
  const [isUrduAudio, setIsUrduAudio] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Hifz Repeat Mode: 0 (No repeat), 1 (1x), 3 (3x), 5 (5x), -1 (infinite)
  const [repeatMode, setRepeatMode] = useState<number>(0);
  const [repeatPlayedCount, setRepeatPlayedCount] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  // Derive current Surah Meta
  const currentSurahMeta = useMemo(() => {
    return quranSurahs.find(s => s.id === currentSurah) || quranSurahs[0];
  }, [currentSurah]);

  const audioSrc = getSurahAudioUrl(selectedQari.id, currentSurah, isUrduAudio);

  // Filtered surahs for the list
  const filteredSurahs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return quranSurahs;
    return quranSurahs.filter(s => 
      s.id.toString() === q ||
      s.name.toLowerCase().includes(q) ||
      s.arabic.includes(q) ||
      `سورۃ ${s.name}`.includes(q)
    );
  }, [searchQuery]);

  // Handle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoadingAudio(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoadingAudio(false);
        })
        .catch(err => {
          console.warn('Audio play error:', err);
          setIsLoadingAudio(false);
        });
    }
  };

  // Immediate switch upon selecting any Surah
  const handleSelectSurah = (surahNumber: number) => {
    setCurrentSurah(surahNumber);
    setRepeatPlayedCount(0);
    setIsPlaying(true);
    setIsLoadingAudio(true);

    if (audioRef.current) {
      audioRef.current.pause();
      const newUrl = getSurahAudioUrl(selectedQari.id, surahNumber, isUrduAudio);
      audioRef.current.src = newUrl;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoadingAudio(false);
        })
        .catch(e => {
          console.warn("Play error:", e);
          setIsLoadingAudio(false);
        });
    }
  };

  // Toggle Urdu Translation Audio
  const toggleUrduAudio = () => {
    const nextUrdu = !isUrduAudio;
    setIsUrduAudio(nextUrdu);
    setToastMsg(nextUrdu ? 'اردو ترجمہ آڈیو فعال ہو گئی' : 'عربی قاری تلاوت فعال ہو گئی');
    setTimeout(() => setToastMsg(null), 2500);

    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = getSurahAudioUrl(selectedQari.id, currentSurah, nextUrdu);
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Switch Reciter
  const handleSelectQari = (qari: QariItem) => {
    setSelectedQari(qari);
    setIsUrduAudio(false); // Switch back to selected Qari arabic recitation
    setToastMsg(`قاری تبدیل: ${qari.name}`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Hifz Repeat mode cycler
  const cycleRepeatMode = () => {
    const modes = [0, 1, 3, 5, -1];
    const currentIdx = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setRepeatMode(nextMode);
    setRepeatPlayedCount(0);

    const labels: Record<number, string> = {
      0: 'تکرار بند (مسلسل اگلی سورت)',
      1: 'تکرار: ۱ بار',
      3: 'تکرار برائے حفظ: ۳ بار',
      5: 'تکرار برائے حفظ: ۵ بار',
      [-1]: 'تکرار دائم (مسلسل لوپ)'
    };
    setToastMsg(labels[nextMode]);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // Change playback speed directly
  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setToastMsg(`رفتار: ${rate}x`);
    setTimeout(() => setToastMsg(null), 1500);
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-quran-player', handleOpen);
    return () => window.removeEventListener('open-quran-player', handleOpen);
  }, []);

  // Draggable Modal State
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  // Next / Previous Surah
  const handleNext = () => {
    handleSelectSurah(currentSurah < 114 ? currentSurah + 1 : 1);
  };

  const handlePrev = () => {
    handleSelectSurah(currentSurah > 1 ? currentSurah - 1 : 114);
  };

  // Continuous Auto-Play or Hifz Repeat upon completion
  const handleEnded = () => {
    // If Hifz Repeat mode is active
    if (repeatMode === -1) {
      // Infinite repeat
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (repeatMode > 0) {
      const nextCount = repeatPlayedCount + 1;
      if (nextCount < repeatMode) {
        setRepeatPlayedCount(nextCount);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        return;
      }
      // Finished all repeats for this surah, reset count
      setRepeatPlayedCount(0);
    }

    // Auto-advance to next Surah
    const nextSurah = currentSurah < 114 ? currentSurah + 1 : 1;
    handleSelectSurah(nextSurah);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Audio source synchronization
  useEffect(() => {
    if (!audioRef.current) return;
    const targetUrl = getSurahAudioUrl(selectedQari.id, currentSurah, isUrduAudio);
    if (audioRef.current.src !== targetUrl && !audioRef.current.src.endsWith(targetUrl)) {
      const wasPlaying = isPlaying;
      setIsLoadingAudio(true);
      audioRef.current.src = targetUrl;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoadingAudio(false);
          })
          .catch(() => {
            setIsLoadingAudio(false);
          });
      } else {
        setIsLoadingAudio(false);
      }
    }
  }, [currentSurah, selectedQari, isUrduAudio]);

  // Audio error fallback
  const handleAudioError = () => {
    setIsLoadingAudio(false);
    if (audioRef.current && isUrduAudio) {
      // Fallback to secondary CDN for Urdu audio
      const fallbackUrl = `https://cdn.islamic.network/quran/audio-surah/128/ur.khan/${currentSurah}.mp3`;
      if (audioRef.current.src !== fallbackUrl) {
        audioRef.current.src = fallbackUrl;
        audioRef.current.load();
        if (isPlaying) audioRef.current.play().catch(() => {});
      }
    }
  };

  // Scroll active playing surah into view
  useEffect(() => {
    if (isOpen && activeTab === 'surahs' && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isOpen, activeTab, currentSurah]);

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FACC15; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #EAB308; }
      `}</style>

      {/* Hidden Persistent Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onWaiting={() => setIsLoadingAudio(true)}
        onLoadStart={() => setIsLoadingAudio(true)}
        onCanPlay={() => setIsLoadingAudio(false)}
        onPlaying={() => {
          setIsLoadingAudio(false);
          setIsPlaying(true);
        }}
        onPause={() => {
          if (audioRef.current && !audioRef.current.ended) {
            setIsPlaying(false);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
          setIsLoadingAudio(false);
        }}
        onError={handleAudioError}
        onEnded={handleEnded}
      />

      {/* Sleek Sticky Bottom Audio Bar (When playing and modal is minimized) */}
      {!isOpen && isPlaying && (
        <div 
          dir="rtl"
          className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 text-amber-200 border-t-2 border-amber-400 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md px-3 sm:px-6 py-2.5 animate-fadeIn select-none"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
                title="مکمل پلیئر کھولیں"
              >
                <Headphones className="w-5 h-5 text-stone-950" />
              </button>
              <div className="min-w-0 text-right">
                <p className="font-nastaliq font-bold text-xs sm:text-sm text-amber-300 truncate leading-tight">
                  سُورَةُ {currentSurahMeta?.arabic || ''} ({currentSurahMeta?.name || 'سورت'})
                </p>
                <p className="text-[10px] text-emerald-300 font-nastaliq truncate">
                  {isUrduAudio ? '🎙️ اردو ترجمہ آڈیو' : `قاری ${selectedQari?.name || 'قاری'}`} • {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>

            {/* Seek bar preview (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-xs items-center gap-2 mx-4">
              <span className="text-[10px] font-mono text-stone-400">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1.5 bg-stone-800 rounded-full cursor-pointer relative overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  if (audioRef.current && duration > 0) {
                    audioRef.current.currentTime = pct * duration;
                  }
                }}
              >
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-stone-400">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 transition cursor-pointer"
                title="پچھلی سورت"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center shadow transition active:scale-95 cursor-pointer font-bold"
                title={isPlaying ? 'روکیں' : 'چلائیں'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-stone-950 text-stone-950" /> : <Play className="w-4 h-4 fill-stone-950 text-stone-950 translate-x-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 transition cursor-pointer"
                title="اگلی سورت"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition cursor-pointer"
                title="بڑا کریں (Maximize)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                  setIsPlaying(false);
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-stone-300 hover:text-white transition cursor-pointer"
                title="آڈیو بند کریں"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Audio Pill Removed - Moved to Top Header Navigation */}

      {/* Full Quran Player Modal */}
      {isOpen && (
        <div 
          dir="rtl"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDragging) setIsOpen(false);
          }}
        >
          <div 
            ref={modalRef}
            style={{ 
              transform: `translate(${position.x}px, ${position.y}px)`,
              cursor: isDragging ? 'grabbing' : 'auto',
              fontFamily: "'Jameel Noori Nastaleeq', 'Urdu Nastaleeq', 'Nafees', serif" 
            }}
            className="relative w-full max-w-2xl bg-gradient-to-b from-[#064e3b] to-[#022c22] rounded-[24px] border-2 border-yellow-400/50 shadow-2xl max-h-[94vh] flex flex-col my-auto overflow-hidden text-amber-50 select-none transition-transform duration-75"
          >
            {/* Toast Notification */}
            {toastMsg && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#FACC15] text-black font-nastaliq font-bold text-xs px-4 py-1.5 rounded-xl shadow-2xl animate-fadeIn border border-amber-300 flex items-center gap-1.5 pointer-events-none">
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                <span>{toastMsg}</span>
              </div>
            )}

            {/* STICKY TOP HEADER: DRAG HANDLE + CLOSE BUTTON */}
            <div 
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="sticky top-0 z-20 flex justify-between items-center p-3 sm:p-4 bg-[#064e3b] rounded-t-[22px] border-b border-yellow-400/20 shrink-0 shadow-md cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-2.5 pointer-events-none">
                <TehreekImanLogo size={36} className="shadow-md shrink-0 ring-1 ring-amber-400/80" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white font-nastaliq leading-tight flex items-center gap-1.5">
                      <span className="text-amber-400 font-mono text-sm">⠿⠿</span>
                      القرآن الكريم — تحریکِ ایمان
                    </h2>
                    <span className="text-[10px] bg-yellow-400/20 text-[#FACC15] border border-yellow-400/30 px-2 py-0.5 rounded-full font-nastaliq font-bold">
                      ✥ گھسیٹیں
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300 font-nastaliq">
                    مکمل ۱۱۴ سورتیں با آواز ۱۲ قراءِ کرام مع اردو ترجمہ آڈیو
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-nastaliq flex items-center gap-1 transition cursor-pointer"
                  title="چھوٹا کریں (Minimize)"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">منی پلیئر</span>
                </button>

                <button 
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={() => {
                    setIsOpen(false);
                    setPosition({ x: 0, y: 0 });
                  }} 
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/80 active:scale-95 flex items-center justify-center text-white text-lg font-bold border border-white/20 transition cursor-pointer shrink-0"
                  title="بند کریں"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* SCROLLABLE INNER BODY */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3.5 min-h-0">

              {/* 1. Quick-Access Surahs Toolbar (Yasin, Al-Mulk, Al-Kahf, Ar-Rahman, Al-Waqiah) */}
              <div className="bg-black/40 border border-yellow-400/30 rounded-2xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-nastaliq font-bold text-amber-300 px-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>منتخب مبارک سورتیں (فوری رسائی):</span>
                  </span>
                  <span className="text-[10px] text-emerald-300">کلک کر کے فوراً سنیں</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {QUICK_SURAHS.map(qs => {
                    const isCurrent = currentSurah === qs.id;
                    return (
                      <button
                        key={qs.id}
                        type="button"
                        onClick={() => handleSelectSurah(qs.id)}
                        className={`py-1.5 px-2 rounded-xl text-center font-nastaliq text-xs font-bold transition cursor-pointer border ${
                          isCurrent
                            ? 'bg-[#FACC15] text-black border-[#FACC15] shadow-md ring-1 ring-amber-300'
                            : 'bg-emerald-950/70 hover:bg-emerald-900 text-white border-emerald-700/50'
                        }`}
                      >
                        <span className="block truncate">{qs.name}</span>
                        <span className={`text-[9px] font-amiri block ${isCurrent ? 'text-stone-900' : 'text-amber-300'}`}>
                          {qs.arabic}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Top Player Controls Card */}
              <div className="p-3.5 sm:p-4 bg-black/60 rounded-2xl border border-emerald-700/60 space-y-3 shrink-0 shadow-lg">
                
                {/* Arabic Surah Title + Qari Attribution */}
                <div className="text-center space-y-1">
                  <span className="text-2xl sm:text-3xl font-black font-amiri text-[#FACC15] tracking-wide block">
                    سُورَةُ {currentSurahMeta?.arabic || ''}
                  </span>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-nastaliq text-emerald-200 font-bold flex-wrap">
                    <span>سورۃ {currentSurahMeta?.name || 'سورت'}</span>
                    <span>•</span>
                    <span className="text-[#FACC15]">
                      {isUrduAudio ? '🎙️ اردو ترجمہ آڈیو (مع شمشاد علی خان)' : `قاری ${selectedQari?.name || 'قاری'}`}
                    </span>
                    <span>•</span>
                    <span>سورۃ {currentSurah} از 114</span>
                    {currentSurahMeta?.numberOfAyahs ? (
                      <>
                        <span>•</span>
                        <span>{currentSurahMeta.numberOfAyahs} آیات</span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Progress Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#FACC15]"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Feature Controls Toolbar: Urdu Audio Toggle + Hifz Repeat + Speed Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
                  
                  {/* Urdu Translation Audio Toggle */}
                  <button
                    type="button"
                    onClick={toggleUrduAudio}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-nastaliq font-bold transition cursor-pointer border ${
                      isUrduAudio
                        ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md font-black'
                        : 'bg-emerald-950/80 hover:bg-emerald-900 text-amber-200 border-emerald-700/60'
                    }`}
                    title="اردو ترجمہ آڈیو سنیں / عربی قاری پر واپس جائیں"
                  >
                    <span>🎙️ اردو ترجمہ آڈیو</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isUrduAudio ? 'bg-black text-amber-300' : 'bg-white/10 text-emerald-300'}`}>
                      {isUrduAudio ? 'آن' : 'آف'}
                    </span>
                  </button>

                  {/* Hifz Repeat Mode (تکرار برائے حفظ) */}
                  <button
                    type="button"
                    onClick={cycleRepeatMode}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-nastaliq font-bold transition cursor-pointer border ${
                      repeatMode !== 0
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-300'
                        : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-700/60'
                    }`}
                    title="طلبۂ حفظ کے لیے سورت دہرانے کا موڈ (Repeat for Hifz)"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>تکرار برائے حفظ:</span>
                    <span className="font-mono text-[11px] font-bold">
                      {repeatMode === 0 ? 'بند' : repeatMode === -1 ? 'دائم (∞)' : `${repeatMode} بار`}
                    </span>
                  </button>

                  {/* Speed Selector Pills (1x, 1.25x, 1.5x) */}
                  <div className="flex items-center bg-emerald-950/90 border border-emerald-700/60 rounded-xl p-0.5">
                    {[1.0, 1.25, 1.5].map(rate => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setSpeed(rate)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                          playbackRate === rate
                            ? 'bg-[#FACC15] text-black shadow-xs'
                            : 'text-emerald-300 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                </div>

                {/* Primary Playback Bar (Prev, Play/Pause, Next, Volume) */}
                <div className="flex items-center justify-between pt-1">
                  
                  {/* Left: Volume control */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-2 rounded-xl bg-emerald-950/80 text-[#FACC15] border border-emerald-700/60 hover:bg-emerald-900 cursor-pointer transition"
                      title={isMuted || volume === 0 ? 'آواز کھولیں' : 'آواز بند کریں'}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-16 h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#FACC15] hidden sm:block"
                      title="آواز کی مقدار"
                    />
                  </div>

                  {/* Center: Prev, Play, Next */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-2.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 text-[#FACC15] border border-emerald-700/60 cursor-pointer active:scale-95 transition"
                      title="پچھلی سورت"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-2xl bg-[#FACC15] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer font-bold"
                      title={isLoadingAudio ? 'لوڈ ہو رہا ہے...' : isPlaying ? 'روکیں' : 'تلاوت شروع کریں'}
                    >
                      {isLoadingAudio ? (
                        <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      ) : isPlaying ? (
                        <Pause className="w-6 h-6 fill-black text-black" />
                      ) : (
                        <Play className="w-6 h-6 fill-black text-black translate-x-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-2.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 text-[#FACC15] border border-emerald-700/60 cursor-pointer active:scale-95 transition"
                      title="اگلی سورت"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right: Reset Playhead Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = 0;
                    }}
                    className="p-2 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 cursor-pointer transition"
                    title="شروع سے سنیں"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                </div>

              </div>

              {/* 3. Featured 3 Classical Qaris Quick Bar (Abdul Basit, Alafasy, Minshawi) */}
              <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-2.5 space-y-1.5">
                <span className="text-[11px] font-nastaliq font-bold text-amber-300 flex items-center gap-1">
                  <Mic2 className="w-3 h-3 text-amber-400" />
                  <span>معروف ترین ائمہ و قراء (ایک کلک پر منتخب کریں):</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[qaris[0], qaris[1], qaris[2]].map(q => {
                    const isSelected = selectedQari?.id === q?.id && !isUrduAudio;
                    return (
                      <button
                        key={q?.id || Math.random()}
                        type="button"
                        onClick={() => handleSelectQari(q)}
                        className={`p-2 rounded-xl text-center font-nastaliq transition cursor-pointer border ${
                          isSelected
                            ? 'bg-[#FACC15] text-black font-bold border-[#FACC15] shadow-md'
                            : 'bg-black/40 hover:bg-black/60 text-white border-white/10'
                        }`}
                      >
                        <span className="text-xs font-bold block truncate">{q?.name || 'قاری'}</span>
                        <span className={`text-[10px] block ${isSelected ? 'text-stone-800' : 'text-emerald-300'}`}>{q?.style || ''}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Tab Navigation: Surahs (114) vs All Qaris (12) */}
              <div className="flex items-center gap-2 p-1.5 bg-emerald-950/90 rounded-2xl border border-emerald-800/70 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('surahs')}
                  className={`flex-1 py-2 px-3 rounded-xl font-nastaliq font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    activeTab === 'surahs'
                      ? 'bg-[#FACC15] text-black font-bold shadow-md'
                      : 'bg-[#064e3b] border border-yellow-400/20 text-white hover:bg-[#064e3b]/80'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>تمام سورتیں (114)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qaris')}
                  className={`flex-1 py-2 px-3 rounded-xl font-nastaliq font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    activeTab === 'qaris'
                      ? 'bg-[#FACC15] text-black font-bold shadow-md'
                      : 'bg-[#064e3b] border border-yellow-400/20 text-white hover:bg-[#064e3b]/80'
                  }`}
                >
                  <Mic2 className="w-4 h-4" />
                  <span>تمام قراء کرام (12)</span>
                </button>
              </div>

              {/* Tab Content: Surahs List */}
              {activeTab === 'surahs' && (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="سورت کا نام یا نمبر تلاش کریں... مثلاً البقرہ، یٰسین"
                      className="w-full bg-white/10 border border-yellow-400/30 rounded-xl p-3 pr-10 text-white placeholder:text-white/50 text-xs sm:text-sm font-nastaliq focus:outline-none focus:border-[#FACC15] transition"
                    />
                    <Search className="w-4 h-4 text-yellow-400/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto custom-scrollbar pr-1 space-y-2 max-h-[300px]">
                    {filteredSurahs.map(s => {
                      const isCurrent = s.id === currentSurah;
                      return (
                        <div
                          key={s.id}
                          ref={isCurrent ? activeItemRef : null}
                          onClick={() => {
                            if (isCurrent) {
                              togglePlay();
                            } else {
                              handleSelectSurah(s.id);
                            }
                          }}
                          className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition ${
                            isCurrent
                              ? 'bg-[#FACC15] text-black font-bold border-[#FACC15] shadow-md ring-2 ring-amber-400'
                              : 'bg-white/5 hover:bg-yellow-400/20 text-white border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                              isCurrent ? 'bg-black text-[#FACC15]' : 'bg-white/10 text-yellow-300'
                            }`}>
                              {s.id}
                            </span>
                            <span className={`font-nastaliq font-bold text-sm ${isCurrent ? 'text-black' : 'text-white'}`}>
                              سورۃ {s?.name || ''}
                            </span>
                            {isCurrent && (
                              isLoadingAudio ? (
                                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin mr-1"></span>
                              ) : isPlaying ? (
                                <span className="flex gap-0.5 items-end h-3 mr-1">
                                  <span className="w-1 bg-black h-full animate-bounce"></span>
                                  <span className="w-1 bg-black h-2/3 animate-bounce [animation-delay:0.15s]"></span>
                                  <span className="w-1 bg-black h-4/5 animate-bounce [animation-delay:0.3s]"></span>
                                </span>
                              ) : null
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`font-amiri text-base font-bold ${isCurrent ? 'text-black' : 'text-yellow-300'}`}>
                              سُورَةُ {s.arabic}
                            </span>
                            <button
                              type="button"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isCurrent ? 'bg-black text-[#FACC15]' : 'bg-white/10 text-yellow-300'
                              }`}
                            >
                              {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab Content: All 12 Qaris List */}
              {activeTab === 'qaris' && (
                <div className="overflow-y-auto custom-scrollbar pr-1 space-y-2.5 max-h-[300px]">
                  {qaris.map(qari => {
                    const isQariSelected = qari?.id === selectedQari?.id && !isUrduAudio;
                    return (
                      <div
                        key={qari?.id || Math.random()}
                        onClick={() => handleSelectQari(qari)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isQariSelected
                            ? 'bg-[#FACC15] text-black border-[#FACC15] shadow-lg font-bold'
                            : 'bg-white/5 hover:bg-emerald-500/20 text-white border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                            isQariSelected ? 'bg-black text-[#FACC15]' : 'bg-white/10 text-yellow-300'
                          }`}>
                            <Mic2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`font-nastaliq font-bold text-sm leading-snug ${isQariSelected ? 'text-black' : 'text-white'}`}>
                              {qari?.name || 'قاری'}
                            </h4>
                            <p className={`text-xs font-sans mt-0.5 ${isQariSelected ? 'text-stone-800' : 'text-white/60'}`}>
                              {qari?.nameEn || ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-nastaliq font-bold ${
                            isQariSelected
                              ? 'bg-black text-[#FACC15]'
                              : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700/60'
                          }`}>
                            {qari.style}
                          </span>
                          {isQariSelected ? (
                            <span className="text-xs font-nastaliq font-bold text-black flex items-center gap-1 bg-white/40 px-2 py-1 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>✓ فعال</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-yellow-300 flex items-center justify-center transition"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Realtime Global Comments for Current Quran Surah */}
              <div className="pt-3">
                <GlobalComments 
                  page={`/quran/surah-${currentSurah}`} 
                  title={`سورۃ ${currentSurahMeta?.name || 'سورت'} پر تاثرات و علمی تبصرے`} 
                  bookTitle={`القرآن الکریم • سورۃ ${currentSurahMeta?.name || 'سورت'}`}
                  pageNumber={currentSurah}
                  bookUrl={`/quran/surah-${currentSurah}`}
                />
              </div>

            </div>

            {/* Footer Attribution */}
            <div className="px-4 py-2.5 bg-black/60 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300/80 font-nastaliq shrink-0 rounded-b-[22px]">
              <span>سرپرستی: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ</span>
              <span>کل ۱۱۴ سورتیں • ۱۲ قراءِ کرام مع اردو ترجمہ آڈیو</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default SacredAudioPlayer;
