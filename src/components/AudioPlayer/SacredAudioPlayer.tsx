import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  X, 
  Headphones
} from 'lucide-react';
import { TehreekImanLogo } from '../TehreekImanLogo';

export interface SurahAudioItem {
  number: number;
  nameArabic: string;
  nameUrdu: string;
  englishName: string;
  numberOfAyahs: number;
  type: 'مکی' | 'مدنی';
}

export const SURAH_LIST: SurahAudioItem[] = [
  { number: 1, nameArabic: "الفَاتِحَة", nameUrdu: "سورۃ الفاتحہ", englishName: "Al-Fatihah", numberOfAyahs: 7, type: "مکی" },
  { number: 2, nameArabic: "البَقَرَة", nameUrdu: "سورۃ البقرہ", englishName: "Al-Baqarah", numberOfAyahs: 286, type: "مدنی" },
  { number: 3, nameArabic: "آل عِمْرَان", nameUrdu: "سورۃ آل عمران", englishName: "Ali 'Imran", numberOfAyahs: 200, type: "مدنی" },
  { number: 4, nameArabic: "النِّسَاء", nameUrdu: "سورۃ النساء", englishName: "An-Nisa", numberOfAyahs: 176, type: "مدنی" },
  { number: 5, nameArabic: "المَائِدَة", nameUrdu: "سورۃ المائدہ", englishName: "Al-Ma'idah", numberOfAyahs: 120, type: "مدنی" },
  { number: 6, nameArabic: "الأَنْعَام", nameUrdu: "سورۃ الانعام", englishName: "Al-An'am", numberOfAyahs: 165, type: "مکی" },
  { number: 7, nameArabic: "الأَعْرَاف", nameUrdu: "سورۃ الاعراف", englishName: "Al-A'raf", numberOfAyahs: 206, type: "مکی" },
  { number: 8, nameArabic: "الأَنْفَال", nameUrdu: "سورۃ الانفال", englishName: "Al-Anfal", numberOfAyahs: 75, type: "مدنی" },
  { number: 9, nameArabic: "التَّوْبَة", nameUrdu: "سورۃ التوبہ", englishName: "At-Tawbah", numberOfAyahs: 129, type: "مدنی" },
  { number: 10, nameArabic: "يُونُس", nameUrdu: "سورۃ یونس", englishName: "Yunus", numberOfAyahs: 109, type: "مکی" },
  { number: 11, nameArabic: "هُود", nameUrdu: "سورۃ ہود", englishName: "Hud", numberOfAyahs: 123, type: "مکی" },
  { number: 12, nameArabic: "يُوسُف", nameUrdu: "سورۃ یوسف", englishName: "Yusuf", numberOfAyahs: 111, type: "مکی" },
  { number: 13, nameArabic: "الرَّعْد", nameUrdu: "سورۃ الرعد", englishName: "Ar-Ra'd", numberOfAyahs: 43, type: "مدنی" },
  { number: 14, nameArabic: "إِبْرَاهِيم", nameUrdu: "سورۃ ابراہیم", englishName: "Ibrahim", numberOfAyahs: 52, type: "مکی" },
  { number: 15, nameArabic: "الحِجْر", nameUrdu: "سورۃ الحجر", englishName: "Al-Hijr", numberOfAyahs: 99, type: "مکی" },
  { number: 16, nameArabic: "النَّحْل", nameUrdu: "سورۃ النحل", englishName: "An-Nahl", numberOfAyahs: 128, type: "مکی" },
  { number: 17, nameArabic: "الإِسْرَاء", nameUrdu: "سورۃ الاسراء", englishName: "Al-Isra", numberOfAyahs: 111, type: "مکی" },
  { number: 18, nameArabic: "الكَهْف", nameUrdu: "سورۃ الکہف", englishName: "Al-Kahf", numberOfAyahs: 110, type: "مکی" },
  { number: 19, nameArabic: "مَرْيَم", nameUrdu: "سورۃ مریم", englishName: "Maryam", numberOfAyahs: 98, type: "مکی" },
  { number: 20, nameArabic: "طه", nameUrdu: "سورۃ طہ", englishName: "Taha", numberOfAyahs: 135, type: "مکی" },
  { number: 36, nameArabic: "يس", nameUrdu: "سورۃ یس", englishName: "Ya-Sin", numberOfAyahs: 83, type: "مکی" },
  { number: 55, nameArabic: "الرَّحْمَن", nameUrdu: "سورۃ الرحمن", englishName: "Ar-Rahman", numberOfAyahs: 78, type: "مدنی" },
  { number: 56, nameArabic: "وَاقِعَة", nameUrdu: "سورۃ الواقعہ", englishName: "Al-Waqi'ah", numberOfAyahs: 96, type: "مکی" },
  { number: 67, nameArabic: "المُلْك", nameUrdu: "سورۃ الملک", englishName: "Al-Mulk", numberOfAyahs: 30, type: "مکی" },
  { number: 112, nameArabic: "الإِخْلَاص", nameUrdu: "سورۃ الاخلاص", englishName: "Al-Ikhlas", numberOfAyahs: 4, type: "مکی" },
  { number: 113, nameArabic: "الفَلَق", nameUrdu: "سورۃ الفلق", englishName: "Al-Falaq", numberOfAyahs: 5, type: "مکی" },
  { number: 114, nameArabic: "النَّاس", nameUrdu: "سورۃ الناس", englishName: "An-Nas", numberOfAyahs: 6, type: "مکی" },
];

export interface ReciterOption {
  id: string;
  nameUrdu: string;
  serverUrl: string; // url prefix
}

export const RECITERS: ReciterOption[] = [
  {
    id: 'mishary',
    nameUrdu: 'مشاری راشد العفاسی',
    serverUrl: 'https://server8.mp3quran.net/afs/',
  },
  {
    id: 'abdulbasit',
    nameUrdu: 'عبد الباسط عبد الصمد (مرتل)',
    serverUrl: 'https://server7.mp3quran.net/basit/',
  },
  {
    id: 'sudais',
    nameUrdu: 'عبد الرحمن السدیس',
    serverUrl: 'https://server11.mp3quran.net/sds/',
  },
];

export const SacredAudioPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0);
  const [selectedReciterId, setSelectedReciterId] = useState('mishary');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSurah = SURAH_LIST[currentSurahIndex] || SURAH_LIST[0];
  const currentReciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];

  // Formatted 3-digit surah number, e.g. 001.mp3, 036.mp3
  const surahPadded = currentSurah.number.toString().padStart(3, '0');
  const audioSrc = `${currentReciter.serverUrl}${surahPadded}.mp3`;

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

  const handleNext = () => {
    setCurrentSurahIndex(prev => (prev + 1) % SURAH_LIST.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentSurahIndex(prev => (prev - 1 + SURAH_LIST.length) % SURAH_LIST.length);
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

  // Autoplay when surah changes if was already playing
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
  }, [currentSurahIndex, selectedReciterId]);

  return (
    <>
      {/* Hidden Audio Element */}
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
          if (!isLooping) handleNext();
        }}
      />

      {/* Persistent Floating Audio Pill (Always accessible on screen bottom-left in RTL) */}
      {!isOpen && (
        <div className="fixed bottom-20 left-4 z-40 animate-fadeIn">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-950 border-2 border-amber-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-amber-200 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="تلاوتِ قرآنِ حکیم و صوتی پلیئر کھولیں"
          >
            <div className={`w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md ${isPlaying ? 'animate-bounce' : ''}`}>
              <Headphones className="w-4 h-4 text-stone-950" />
            </div>
            <div className="text-right">
              <span className="block text-xs font-nastaliq font-black text-amber-300 leading-tight">
                {currentSurah.nameUrdu}
              </span>
              <span className="block text-[10px] text-emerald-300 font-nastaliq">
                {isPlaying ? '▶ تلاوت جاری ہے' : '🎧 صوتی پلیئر'}
              </span>
            </div>
            {isPlaying && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
            )}
          </button>
        </div>
      )}

      {/* Expanded Luxury Islamic Player Drawer / Card */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[420px] z-50 animate-fadeIn">
          <div className="modal-contrast-card rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-amber-50 space-y-4 border-2 border-amber-400/80 relative overflow-hidden backdrop-blur-xl">
            
            {/* Player Header */}
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2.5">
              <div className="flex items-center gap-2.5">
                <TehreekImanLogo size={36} className="shadow-md shrink-0 ring-1 ring-amber-400/60" />
                <div>
                  <h3 className="font-nastaliq font-black text-base text-amber-300">
                    صوتی تلاوتِ قرآنِ حکیم
                  </h3>
                  <span className="text-[10px] text-emerald-300 font-nastaliq">
                    تحریکِ ایمان • شعبہ صوتیات و قراءت
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 cursor-pointer"
                  title="چھوٹا کریں"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reciter & Surah Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-nastaliq font-bold text-emerald-300 block mb-1">
                  قاری صاحب:
                </label>
                <select
                  value={selectedReciterId}
                  onChange={e => setSelectedReciterId(e.target.value)}
                  className="w-full bg-emerald-950/80 text-amber-200 text-xs font-nastaliq font-bold rounded-xl px-2.5 py-1.5 border border-emerald-700/70 focus:outline-none focus:border-amber-400"
                >
                  {RECITERS.map(r => (
                    <option key={r.id} value={r.id} className="bg-stone-900 text-white">
                      {r.nameUrdu}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-nastaliq font-bold text-emerald-300 block mb-1">
                  سورتِ مبارکہ:
                </label>
                <select
                  value={currentSurahIndex}
                  onChange={e => setCurrentSurahIndex(parseInt(e.target.value, 10))}
                  className="w-full bg-emerald-950/80 text-amber-200 text-xs font-nastaliq font-bold rounded-xl px-2.5 py-1.5 border border-emerald-700/70 focus:outline-none focus:border-amber-400"
                >
                  {SURAH_LIST.map((s, idx) => (
                    <option key={s.number} value={idx} className="bg-stone-900 text-white">
                      {s.number}. {s.nameUrdu} ({s.nameArabic})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Track Info Display */}
            <div className="p-3 rounded-2xl bg-black/50 border border-emerald-800/70 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black font-amiri text-amber-300 tracking-wide block" dir="rtl">
                سُورَةُ {currentSurah.nameArabic}
              </span>
              <div className="flex items-center justify-center gap-2 text-xs font-nastaliq text-emerald-200 font-bold">
                <span>{currentSurah.nameUrdu}</span>
                <span>•</span>
                <span>{currentSurah.numberOfAyahs} آیات</span>
                <span>•</span>
                <span>{currentSurah.type}</span>
              </div>
            </div>

            {/* Progress Bar & Timers */}
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

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-1">
              {/* Speed Button */}
              <button
                onClick={changeSpeed}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-amber-300 text-[11px] font-mono font-bold cursor-pointer hover:bg-emerald-900"
                title="تلاوت کی رفتار"
              >
                {playbackRate}x
              </button>

              {/* Main Playback Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-emerald-700/60 cursor-pointer active:scale-95"
                  title="پچھلی سورت"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
                  title={isPlaying ? 'روکیں' : 'چلائیں'}
                >
                  {isPlaying ? <Pause className="w-6 h-6 text-stone-950" /> : <Play className="w-6 h-6 text-stone-950 translate-x-0.5" />}
                </button>

                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-emerald-700/60 cursor-pointer active:scale-95"
                  title="اگلی سورت"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              </div>

              {/* Repeat & Mute */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-1.5 rounded-lg border cursor-pointer ${
                    isLooping
                      ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-sm'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
                  }`}
                  title="تکرار برائے حفظ"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-emerald-950/80 text-amber-300 border border-emerald-700/60 hover:bg-emerald-900 cursor-pointer"
                  title={isMuted ? 'آواز کھولیں' : 'آواز بند کریں'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-emerald-800/40 text-[10px] text-emerald-300/80 font-nastaliq">
              <span>سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی</span>
              <span>تلاوتِ پاک مع ترتیل</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
