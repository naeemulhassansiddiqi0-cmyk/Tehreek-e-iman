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

// 12 Renowned International Qaris
export const qaris: QariItem[] = [
  { id: "ar.alafasy", name: "مشاری راشد العفاسی", nameEn: "Mishary Alafasy", style: "مشہور" },
  { id: "ar.abdurrahmaansudais", name: "عبدالرحمن السدیس", nameEn: "Al-Sudais", style: "امام حرم" },
  { id: "ar.abdulbasitmurattal", name: "عبدالباسط عبدالصمد", nameEn: "Abdul Basit", style: "مرتل" },
  { id: "ar.shaatree", name: "ابوبکر الشاطری", nameEn: "Al-Shatri", style: "خوبصورت" },
  { id: "ar.mahermuaiqly", name: "ماہر المعيقلی", nameEn: "Maher Al-Muaiqly", style: "امام حرم" },
  { id: "ar.ahmedajamy", name: "احمد العجمی", nameEn: "Al-Ajamy", style: "دلکش" },
  { id: "ar.saoodshuraym", name: "سعود الشریم", nameEn: "Al-Shuraim", style: "امام حرم" },
  { id: "ar.minshawi", name: "محمد صدیق المنشاوی", nameEn: "Minshawi", style: "کلاسک" },
  { id: "ar.husary", name: "محمود خلیل الحصری", nameEn: "Husary", style: "کلاسک" },
  { id: "ar.hudhaify", name: "علی الحذیفی", nameEn: "Al-Hudhaify", style: "امام حرم" },
  { id: "ar.muhammadayyoub", name: "محمد ایوب", nameEn: "Muhammad Ayyub", style: "مدینہ" },
  { id: "ar.yasser", name: "یاسر الدوسری", nameEn: "Yasser Al-Dosari", style: "امام حرم" }
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

// Dynamic Full Surah Audio URL Generator
export function getSurahAudioUrl(qariId: string, surahNumber: number): string {
  if (qariId === 'ar.abdulbasitmurattal') {
    return `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${surahNumber}.mp3`;
  }
  if (qariId === 'ar.abdurrahmaansudais') {
    return `https://server11.mp3quran.net/sds/${surahNumber.toString().padStart(3, '0')}.mp3`;
  }
  if (qariId === 'ar.saoodshuraym') {
    return `https://server7.mp3quran.net/shur/${surahNumber.toString().padStart(3, '0')}.mp3`;
  }
  if (qariId === 'ar.yasser') {
    return `https://server11.mp3quran.net/yasser/${surahNumber.toString().padStart(3, '0')}.mp3`;
  }
  return `https://cdn.islamic.network/quran/audio/128/${qariId}/${surahNumber}.mp3`;
}

export const SacredAudioPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'surahs' | 'qaris'>('surahs');
  const [currentSurah, setCurrentSurah] = useState(1);
  const [selectedQari, setSelectedQari] = useState<QariItem>(qaris[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  const currentSurahMeta = quranSurahs.find(s => s.id === currentSurah) || quranSurahs[0];
  const audioSrc = getSurahAudioUrl(selectedQari.id, currentSurah);

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

  // Next / Previous Surah
  const handleNext = () => {
    const next = currentSurah + 1;
    if (next <= 114) {
      setCurrentSurah(next);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setCurrentSurah(1);
    }
  };

  const handlePrev = () => {
    const prev = currentSurah - 1;
    if (prev >= 1) {
      setCurrentSurah(prev);
      setIsPlaying(true);
    } else {
      setCurrentSurah(114);
      setIsPlaying(true);
    }
  };

  // Auto next logic upon completion of full Surah
  const handleEnded = () => {
    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }
    handleNext();
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
  }, [currentSurah, selectedQari.id]);

  // Scroll active playing surah into view when tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'surahs' && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isOpen, activeTab, currentSurah]);

  return (
    <>
      {/* Custom Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FACC15; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #EAB308; }
      `}</style>

      {/* Hidden Persistent Audio Element (Full Surah Playback) */}
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
        onEnded={handleEnded}
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
                سورۃ {currentSurahMeta.name} • {selectedQari.name}
              </span>
              <span className="block text-[10px] text-emerald-300 font-nastaliq">
                {isPlaying ? '▶ تلاوت جاری ہے' : '🎧 114 سورتیں • 12 قراء کرام'}
              </span>
            </div>
            {isPlaying && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1" />
            )}
          </button>
        </div>
      )}

      {/* Full Quran Player Modal: Big Height min-h-[650px] max-h-[90vh] */}
      {isOpen && (
        <div 
          dir="rtl"
          className="fixed bottom-24 left-3 right-3 sm:left-6 sm:right-auto sm:w-[480px] min-h-[650px] max-h-[90vh] z-50 flex flex-col modal-contrast-card rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-amber-50 border-2 border-amber-400/80 backdrop-blur-xl overflow-hidden animate-fadeIn"
          style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}
        >
          {/* Toast Notification */}
          {toastMsg && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#FACC15] text-black font-nastaliq font-bold text-xs px-4 py-1.5 rounded-xl shadow-2xl animate-fadeIn border border-amber-300 flex items-center gap-1.5 pointer-events-none">
              <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Top Header */}
          <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-800/80 shadow-md">
            <div className="flex items-center gap-2.5">
              <TehreekImanLogo size={36} className="shadow-md shrink-0 ring-1 ring-amber-400/80" />
              <div>
                <h3 className="font-nastaliq font-black text-base text-[#FACC15] leading-tight">
                  القرآن الکریم - 114 سورتیں
                </h3>
                <span className="text-[11px] text-emerald-300 font-nastaliq block">
                  تحریکِ ایمان • مکمل ۱۱۴ سورتیں با آواز ۱۲ قراءِ کرام
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

          {/* Top Player Controls Card */}
          <div className="p-3.5 bg-black/50 border-b border-emerald-800/70 space-y-2.5 shrink-0">
            {/* Arabic Surah Title + Qari Attribution */}
            <div className="text-center space-y-0.5">
              <span className="text-2xl sm:text-3xl font-black font-amiri text-[#FACC15] tracking-wide block">
                سُورَةُ {currentSurahMeta.arabic}
              </span>
              <div className="flex items-center justify-center gap-1.5 text-xs font-nastaliq text-emerald-200 font-bold">
                <span>سورۃ {currentSurahMeta.name}</span>
                <span>•</span>
                <span className="text-[#FACC15]">قاری {selectedQari.name}</span>
                <span>•</span>
                <span>سورت نمبر {currentSurah}</span>
                {currentSurahMeta.numberOfAyahs ? (
                  <>
                    <span>•</span>
                    <span>{currentSurahMeta.numberOfAyahs} آیات</span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Progress Slider (Full Surah Progress) */}
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

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-1">
              {/* Speed Button */}
              <button
                type="button"
                onClick={changeSpeed}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-700/70 text-[#FACC15] text-xs font-mono font-bold cursor-pointer hover:bg-emerald-900 transition"
                title="رفتار تبدیل کریں"
              >
                {playbackRate}x
              </button>

              {/* Main Play / Next / Prev */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-[#FACC15] border border-emerald-700/60 cursor-pointer active:scale-95 transition"
                  title="پچھلی سورت"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-2xl bg-[#FACC15] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer font-bold"
                  title={isPlaying ? 'روکیں' : 'تلاوت شروع کریں'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black translate-x-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-[#FACC15] border border-emerald-700/60 cursor-pointer active:scale-95 transition"
                  title="اگلی سورت (ترتیب وار آٹو پلے)"
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
                      ? 'bg-[#FACC15] text-black border-[#FACC15] shadow-sm'
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
                    className="p-1.5 rounded-lg bg-emerald-950/80 text-[#FACC15] border border-emerald-700/60 hover:bg-emerald-900 cursor-pointer transition"
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
                    className="w-12 h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#FACC15] hidden sm:block"
                    title="آواز کی مقدار (Volume)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2 Tabs Below Controls */}
          <div className="flex items-center gap-2 p-2.5 bg-emerald-950/90 border-b border-emerald-800/70 shrink-0">
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
              <span>سورتیں (114)</span>
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
              <span>قراء کرام (12)</span>
            </button>
          </div>

          {/* MAIN CONTENT AREA - BIG ON TOP */}
          <div className="flex-1 mt-2 bg-black/20 rounded-2xl p-3 flex flex-col overflow-hidden">
            {/* WHEN activeTab === 'surahs' */}
            {activeTab === 'surahs' && (
              <>
                {/* Full Width Search Input */}
                <div className="relative shrink-0">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="سورت تلاش کریں... مثلاً البقرہ"
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

                {/* Big Scrollable Surahs List: h-[400px] visible 7-8 rows */}
                <div className="mt-3 flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 h-[400px]">
                  {filteredSurahs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-white/70 font-nastaliq">
                      کوئی سورت نہیں ملی۔ برائے کرم درست نام یا نمبر درج فرمائیں۔
                    </div>
                  ) : (
                    filteredSurahs.map(s => {
                      const isCurrent = s.id === currentSurah;

                      return (
                        <div
                          key={s.id}
                          ref={isCurrent ? activeItemRef : null}
                          onClick={() => {
                            if (isCurrent) {
                              togglePlay();
                            } else {
                              setCurrentSurah(s.id);
                              setIsPlaying(true);
                            }
                          }}
                          className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition ${
                            isCurrent
                              ? 'bg-[#FACC15] text-black font-bold border-[#FACC15] shadow-md'
                              : 'bg-white/5 hover:bg-yellow-400/20 text-white border-white/10'
                          }`}
                        >
                          {/* Left: Number + Urdu name bold white (or black if active) */}
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                              isCurrent ? 'bg-black text-[#FACC15]' : 'bg-white/10 text-yellow-300'
                            }`}>
                              {s.id}
                            </span>
                            <span className={`font-nastaliq font-bold text-sm ${isCurrent ? 'text-black' : 'text-white'}`}>
                              سورۃ {s.name}
                            </span>
                            {isCurrent && isPlaying && (
                              <span className="flex gap-0.5 items-end h-3 mr-1">
                                <span className="w-1 bg-black h-full animate-bounce"></span>
                                <span className="w-1 bg-black h-2/3 animate-bounce [animation-delay:0.15s]"></span>
                                <span className="w-1 bg-black h-4/5 animate-bounce [animation-delay:0.3s]"></span>
                              </span>
                            )}
                          </div>

                          {/* Right: Arabic name yellow-300 (or black if active) */}
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
                              {isCurrent && isPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
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

            {/* WHEN activeTab === 'qaris' */}
            {activeTab === 'qaris' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3 h-[400px]">
                {qaris.map(qari => {
                  const isQariSelected = qari.id === selectedQari.id;

                  return (
                    <div
                      key={qari.id}
                      onClick={() => {
                        setSelectedQari(qari);
                        setToastMsg(`قاری تبدیل: ${qari.name}`);
                        setTimeout(() => setToastMsg(null), 3000);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isQariSelected
                          ? 'bg-[#FACC15] text-black border-[#FACC15] shadow-lg'
                          : 'bg-white/5 hover:bg-emerald-500/20 text-white border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                          isQariSelected ? 'bg-black text-[#FACC15]' : 'bg-white/10 text-yellow-300'
                        }`}>
                          <Mic2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`font-nastaliq font-bold text-base leading-snug ${isQariSelected ? 'text-black' : 'text-white'}`}>
                            {qari.name}
                          </h4>
                          <p className={`text-xs font-sans mt-0.5 ${isQariSelected ? 'text-stone-800' : 'text-white/60'}`}>
                            {qari.nameEn}
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
                            <span>✓ جاری ہے</span>
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
          </div>

          {/* Footer Attribution */}
          <div className="px-4 py-2 bg-black/60 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300/80 font-nastaliq shrink-0">
            <span>سرپرستی: حضرت مولانا محمد نعیم الحسن صدیقی</span>
            <span>کل ۱۱۴ سورتیں • ۱۲ قراءِ کرام</span>
          </div>
        </div>
      )}
    </>
  );
};
