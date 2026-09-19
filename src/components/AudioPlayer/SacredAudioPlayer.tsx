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
  BookOpen
} from 'lucide-react';
import { TehreekImanLogo } from '../TehreekImanLogo';
import { QURAN_SURAHS_CANONICAL } from '../../data/quranData';

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

// 8 Famous International Qaris
export const qaris: QariItem[] = [
  { id: "ar.alafasy", name: "مشاری راشد العفاسی", nameEn: "Mishary Alafasy", style: "مشہور" },
  { id: "ar.abdurrahmaansudais", name: "عبدالرحمن السدیس", nameEn: "Abdul Rahman Al-Sudais", style: "امام حرم" },
  { id: "ar.abdulbasitmurattal", name: "عبدالباسط عبدالصمد", nameEn: "Abdul Basit", style: "مرتل" },
  { id: "ar.shaatree", name: "ابوبکر الشاطری", nameEn: "Abu Bakr Al-Shatri", style: "خوبصورت" },
  { id: "ar.mahermuaiqly", name: "ماہر المعيقلی", nameEn: "Maher Al-Muaiqly", style: "امام حرم" },
  { id: "ar.ahmedajamy", name: "احمد العجمی", nameEn: "Ahmed Al-Ajamy", style: "دلکش" },
  { id: "ar.saoodshuraym", name: "سعود الشریم", nameEn: "Saood Al-Shuraim", style: "امام حرم" },
  { id: "ar.minshawi", name: "محمد صدیق المنشاوی", nameEn: "Minshawi", style: "کلاسک" }
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
    const id = idx + 3; // 3 to 113 generated automatically
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

// Alias for backwards compatibility
export const SURAH_LIST = quranSurahs;

// Dynamic Audio URL generator for all Qaris
export function getQariAudioUrl(qariId: string, surahNumber: number): string {
  if (qariId === 'ar.abdulbasitmurattal') {
    return `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${surahNumber}.mp3`;
  }
  if (qariId === 'ar.abdurrahmaansudais') {
    return `https://server11.mp3quran.net/sds/${surahNumber.toString().padStart(3, '0')}.mp3`;
  }
  if (qariId === 'ar.saoodshuraym') {
    return `https://server7.mp3quran.net/shur/${surahNumber.toString().padStart(3, '0')}.mp3`;
  }
  return `https://cdn.islamic.network/quran/audio/128/${qariId}/${surahNumber}.mp3`;
}

export const SacredAudioPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'surahs' | 'qaris'>('surahs');
  const [selectedQari, setSelectedQari] = useState<QariItem>(qaris[0]);
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLooping, setIsLooping] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  const currentSurah = quranSurahs[currentSurahIndex] || quranSurahs[0];
  const audioSrc = getQariAudioUrl(selectedQari.id, currentSurah.id);

  // Filtered surahs for the 114 surahs list
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
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Audio play error:', err));
    }
  };

  const playSurah = (surahId: number) => {
    const idx = quranSurahs.findIndex(s => s.id === surahId);
    if (idx !== -1) {
      if (idx === currentSurahIndex) {
        togglePlay();
      } else {
        setCurrentSurahIndex(idx);
        setIsPlaying(true);
      }
    }
  };

  // Change Qari instantly, keeping current Surah playing
  const handleSelectQari = (qari: QariItem) => {
    setSelectedQari(qari);
    setToastMsg(`قاری تبدیل: ${qari.name}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleNext = () => {
    setCurrentSurahIndex(prev => (prev + 1) % quranSurahs.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentSurahIndex(prev => (prev - 1 + quranSurahs.length) % quranSurahs.length);
    setIsPlaying(true);
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

  const changeSpeed = () => {
    const rates = [0.75, 1.0, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Autoplay when surah or qari changes if was already playing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [currentSurahIndex, selectedQari.id]);

  // Scroll active playing surah into view when surahs tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'surahs' && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isOpen, activeTab, currentSurahIndex]);

  return (
    <>
      {/* Hidden Persistent Audio Element (continues on page change) */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        loop={isLooping}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => {
          if (!isLooping) {
            handleNext();
          }
        }}
      />

      {/* Persistent Floating Audio Pill (Yellow / Dark Green Button at Left Bottom) */}
      {!isOpen && (
        <div className="fixed bottom-20 left-4 md:bottom-5 md:left-5 z-40 animate-fadeIn">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-950 border-2 border-amber-400 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-amber-200 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="القرآن الکریم - 114 سورتیں و قراء کرام (کھولیں)"
          >
            <div className={`w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg font-bold ${isPlaying ? 'animate-bounce' : ''}`}>
              <Headphones className="w-5 h-5 text-stone-950" />
            </div>
            <div className="text-right">
              <span className="block text-xs font-nastaliq font-black text-amber-300 leading-tight">
                سورۃ {currentSurah.name} • {selectedQari.name}
              </span>
              <span className="block text-[10px] text-emerald-300 font-nastaliq">
                {isPlaying ? '▶ تلاوت جاری ہے' : '🎧 114 سورتیں • 8 قراء کرام'}
              </span>
            </div>
            {isPlaying && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1" />
            )}
          </button>
        </div>
      )}

      {/* Full Quran 114 Surahs & Multiple Qaris Modal / Drawer */}
      {isOpen && (
        <div 
          dir="rtl"
          className="fixed bottom-36 left-3 right-3 sm:left-6 sm:right-auto sm:w-[460px] max-h-[82vh] h-[640px] z-50 flex flex-col modal-contrast-card rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-amber-50 border-2 border-amber-400/80 backdrop-blur-xl overflow-hidden animate-fadeIn"
          style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}
        >
          {/* Toast Notification for Qari Switch */}
          {toastMsg && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-stone-950 font-nastaliq font-bold text-xs px-4 py-1.5 rounded-xl shadow-2xl animate-fadeIn border border-amber-300 flex items-center gap-1.5 pointer-events-none">
              <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Drawer Header */}
          <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-800/80 shadow-md">
            <div className="flex items-center gap-2.5">
              <TehreekImanLogo size={36} className="shadow-md shrink-0 ring-1 ring-amber-400/80" />
              <div>
                <h3 className="font-nastaliq font-black text-base text-amber-300 leading-tight">
                  القرآن الکریم - 114 سورتیں
                </h3>
                <span className="text-[11px] text-emerald-300 font-nastaliq block">
                  تحریکِ ایمان • دار التلاوۃ و صوتیات (۸ قراءِ کرام)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 cursor-pointer transition"
              title="بند کریں"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dual Tabs Navigation Bar (YouTube Style) */}
          <div className="flex items-center gap-2 p-2 bg-emerald-950/95 border-b border-emerald-800/70">
            <button
              type="button"
              onClick={() => setActiveTab('surahs')}
              className={`flex-1 py-2 px-3 rounded-xl font-nastaliq font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'surahs'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 shadow-md ring-1 ring-amber-200'
                  : 'bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800/60 border border-emerald-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>سورتیں (114)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qaris')}
              className={`flex-1 py-2 px-3 rounded-xl font-nastaliq font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'qaris'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 shadow-md ring-1 ring-amber-200'
                  : 'bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800/60 border border-emerald-700/50'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              <span>قراء کرام (8)</span>
            </button>
          </div>

          {/* Current Playing Track Info Display (Sticky) */}
          <div className="p-3.5 bg-black/60 border-b border-emerald-800/70 space-y-2.5">
            {/* Arabic Title + Qari Attribution */}
            <div className="text-center space-y-0.5">
              <span className="text-2xl sm:text-3xl font-black font-amiri text-amber-300 tracking-wide block">
                سُورَةُ {currentSurah.arabic}
              </span>
              <div className="flex items-center justify-center gap-1.5 text-xs font-nastaliq text-emerald-200 font-bold">
                <span>سورۃ {currentSurah.name}</span>
                <span>•</span>
                <span className="text-amber-300">قاری {selectedQari.name}</span>
                {currentSurah.numberOfAyahs ? (
                  <>
                    <span>•</span>
                    <span>{currentSurah.numberOfAyahs} آیات</span>
                  </>
                ) : null}
                {currentSurah.type ? (
                  <>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/50 text-[10px]">
                      {currentSurah.type}
                    </span>
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
                className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-1">
              {/* Speed Button */}
              <button
                type="button"
                onClick={changeSpeed}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-700/70 text-amber-300 text-xs font-mono font-bold cursor-pointer hover:bg-emerald-900 transition"
                title="رفتار تبدیل کریں"
              >
                {playbackRate}x
              </button>

              {/* Main Play / Next / Prev */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-emerald-700/60 cursor-pointer active:scale-95 transition"
                  title="پچھلی سورت"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer font-bold"
                  title={isPlaying ? 'روکیں' : 'تلاوت شروع کریں'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 text-stone-950" /> : <Play className="w-5 h-5 text-stone-950 translate-x-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-emerald-700/60 cursor-pointer active:scale-95 transition"
                  title="اگلی سورت (آٹو پلے)"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              </div>

              {/* Repeat & Mute & Volume */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-1.5 rounded-lg border cursor-pointer transition ${
                    isLooping
                      ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-sm'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
                  }`}
                  title={isLooping ? 'تکرار فعال ہے' : 'سورت دہرائیں (Repeat)'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg bg-emerald-950/80 text-amber-300 border border-emerald-700/60 hover:bg-emerald-900 cursor-pointer transition"
                    title={isMuted || volume === 0 ? 'آواز کھولیں' : 'آواز بند کریں'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-12 h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400 hidden sm:block"
                    title="آواز کی مقدار (Volume)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: SURAHS LIST (114) */}
          {activeTab === 'surahs' && (
            <>
              {/* Search Box: "سورت تلاش کریں" */}
              <div className="p-2.5 bg-emerald-950/90 border-b border-emerald-800/60">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="سورت تلاش کریں (نام یا نمبر)..."
                    className="w-full bg-black/40 text-amber-200 placeholder-emerald-400/60 text-xs sm:text-sm font-nastaliq rounded-xl pr-9 pl-8 py-2 border border-emerald-700/70 focus:outline-none focus:border-amber-400 transition"
                  />
                  <Search className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable List of All 114 Surahs */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar bg-emerald-950/40">
                {filteredSurahs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-emerald-300/80 font-nastaliq">
                    کوئی سورت نہیں ملی۔ برائے کرم درست نام یا نمبر درج فرمائیں۔
                  </div>
                ) : (
                  filteredSurahs.map(s => {
                    const isSelected = s.id === currentSurah.id;
                    const isItemPlaying = isSelected && isPlaying;

                    return (
                      <div
                        key={s.id}
                        ref={isSelected ? activeItemRef : null}
                        onClick={() => playSurah(s.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-900 border-2 border-emerald-400 text-amber-300 shadow-md shadow-emerald-950/60'
                            : 'bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-100'
                        }`}
                      >
                        {/* Right: Number badge + Urdu & Arabic names */}
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                            isSelected 
                              ? 'bg-amber-400 text-stone-950 shadow' 
                              : 'bg-emerald-900/80 text-amber-300 border border-emerald-700/60'
                          }`}>
                            {s.id}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-nastaliq font-bold text-sm ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                                سورۃ {s.name}
                              </span>
                              <span className="font-amiri text-xs text-emerald-300">
                                ({s.arabic})
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-400 font-nastaliq">
                              {s.numberOfAyahs ? `${s.numberOfAyahs} آیات` : ''} {s.type ? `• ${s.type}` : ''}
                            </div>
                          </div>
                        </div>

                        {/* Left: Play button / Equalizer indicator */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isItemPlaying && (
                            <span className="flex gap-0.5 items-end h-3">
                              <span className="w-1 bg-amber-400 h-full animate-bounce"></span>
                              <span className="w-1 bg-amber-400 h-2/3 animate-bounce [animation-delay:0.15s]"></span>
                              <span className="w-1 bg-amber-400 h-4/5 animate-bounce [animation-delay:0.3s]"></span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playSurah(s.id);
                            }}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400 text-stone-950 shadow'
                                : 'bg-emerald-900/70 hover:bg-emerald-800 text-amber-300'
                            }`}
                            title={isItemPlaying ? 'روکیں' : 'سنیں'}
                          >
                            {isItemPlaying ? (
                              <Pause className="w-3.5 h-3.5 text-stone-950" />
                            ) : (
                              <Play className="w-3.5 h-3.5 translate-x-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* TAB 2: QARIS SELECTION (8 FAMOUS QARIS) */}
          {activeTab === 'qaris' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar bg-emerald-950/40">
              <div className="flex items-center justify-between pb-1 px-1">
                <span className="text-xs font-nastaliq font-bold text-amber-300">
                  قاری منتخب کریں (آواز فوری تبدیل ہو گی)
                </span>
                <span className="text-[10px] text-emerald-300 font-sans">
                  {qaris.length} معروف قراء
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {qaris.map(qari => {
                  const isQariSelected = qari.id === selectedQari.id;

                  return (
                    <div
                      key={qari.id}
                      onClick={() => handleSelectQari(qari)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                        isQariSelected
                          ? 'bg-emerald-900/90 border-2 border-emerald-400 shadow-lg shadow-emerald-950/70 ring-1 ring-amber-400/50'
                          : 'bg-emerald-950/70 hover:bg-emerald-900/60 border-emerald-800/60 hover:border-emerald-700/80 text-emerald-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={`font-nastaliq font-bold text-sm leading-snug ${isQariSelected ? 'text-amber-300' : 'text-white'}`}>
                            {qari.name}
                          </h4>
                          <p className="text-[11px] text-emerald-300/80 font-sans leading-tight mt-0.5">
                            {qari.nameEn}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-nastaliq font-bold shrink-0 ${
                          isQariSelected
                            ? 'bg-amber-400 text-stone-950 shadow-sm'
                            : 'bg-emerald-900 text-emerald-200 border border-emerald-700/60'
                        }`}>
                          {qari.style}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-emerald-800/40 text-[11px]">
                        {isQariSelected ? (
                          <span className="text-emerald-300 font-nastaliq font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                            <span>✓ منتخب شدہ (جاری ہے)</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400/80 font-nastaliq">
                            منتخب کرنے کیلئے کلک کریں
                          </span>
                        )}

                        <span className={`p-1 rounded-lg ${isQariSelected ? 'bg-amber-400 text-stone-950' : 'bg-emerald-900 text-amber-300'}`}>
                          <Play className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Attribution */}
          <div className="px-4 py-2 bg-black/60 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300/80 font-nastaliq">
            <span>سرپرستی: حضرت مولانا محمد نعیم الحسن صدیقی</span>
            <span>کل ۱۱۴ سورتیں • ۸ قراءِ کرام</span>
          </div>

        </div>
      )}
    </>
  );
};
