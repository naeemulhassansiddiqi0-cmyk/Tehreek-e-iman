import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface AudioSentence {
  arabic: string;
  urdu?: string;
  startRatio: number;
  endRatio: number;
}

export interface SurahAyahMarker {
  ayahNumber: number;
  startRatio: number;
  endRatio: number;
}

export interface AudioSyncItem {
  id: string; // e.g. "quran-1-1" or "quran-surah-1" or "hadith-bukhari-1"
  type: 'quran' | 'hadith' | 'general';
  title: string;
  subtitle?: string;
  bookTitle?: string;
  bookSlug?: string;
  itemNumber: number; // ayah or hadith number
  surahNumber?: number;
  totalItems?: number;
  arabicText: string;
  urduText?: string;
  audioUrl?: string; // pre-computed MP3 URL
  sentences: AudioSentence[];
  isFullSurah?: boolean;
  surahAyahMarkers?: SurahAyahMarker[];
}

export interface ReciterInfo {
  id: string;
  nameUrdu: string;
  nameArabic: string;
  nameEn: string;
  surahAudioServer?: string;
}

export const QURAN_AYAH_RECITERS: ReciterInfo[] = [
  { id: 'Alafasy_128kbps', nameUrdu: 'مشاری راشد العفاسی', nameArabic: 'مشاري راشد العفاسي', nameEn: 'Mishary Alafasy', surahAudioServer: 'https://server8.mp3quran.net/afs' },
  { id: 'Abdul_Basit_Murattal_192kbps', nameUrdu: 'عبد الباسط عبد الصمد (مرتل)', nameArabic: 'عبد الباسط عبد الصمد', nameEn: 'Abdul Basit', surahAudioServer: 'https://server7.mp3quran.net/basit' },
  { id: 'Minshawy_Murattal_128kbps', nameUrdu: 'محمد صدیق المنشاوی', nameArabic: 'محمد صديق المنشاوي', nameEn: 'Minshawi', surahAudioServer: 'https://server10.mp3quran.net/minsh' },
  { id: 'Husary_128kbps', nameUrdu: 'محمود خلیل الحصری', nameArabic: 'محمود خليل الحصري', nameEn: 'Husary', surahAudioServer: 'https://server13.mp3quran.net/husr' },
  { id: 'Hudhaify_128kbps', nameUrdu: 'علی الحذیفی', nameArabic: 'علي الحذيفي', nameEn: 'Al-Hudhaify', surahAudioServer: 'https://server9.mp3quran.net/hthfi' },
  { id: 'urdu_shamshad_ali_khan_46kbps', nameUrdu: 'اردو ترجمہ (مولانا شمشاد علی خان)', nameArabic: 'الترجمة الأردية', nameEn: 'Urdu Audio (Shamshad Ali)' },
];

export function buildQuranSurahFullAudioUrl(reciterId: string, surahNumber: number): string {
  const sPad = String(surahNumber).padStart(3, '0');
  const reciter = QURAN_AYAH_RECITERS.find(r => r.id === reciterId);
  if (reciter?.surahAudioServer) {
    return `${reciter.surahAudioServer}/${sPad}.mp3`;
  }
  // Default to reliable high-speed Mishary Alafasy full-Surah MP3 server
  return `https://server8.mp3quran.net/afs/${sPad}.mp3`;
}

export function buildQuranAyahAudioUrl(reciterId: string, surahNumber: number, ayahNumber: number): string {
  const sPad = String(surahNumber).padStart(3, '0');
  const aPad = String(ayahNumber).padStart(3, '0');
  if (reciterId === 'urdu_shamshad_ali_khan_46kbps') {
    return `https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/${sPad}${aPad}.mp3`;
  }
  return `https://everyayah.com/data/${reciterId}/${sPad}${aPad}.mp3`;
}

export function splitTextIntoSentences(text: string, isUrdu = false): string[] {
  if (!text) return [];
  const clean = isUrdu 
    ? text.replace(/^\s*\(\s*\d+\s*\)\s*/, '').trim()
    : text.replace(/۝\s*\d+/g, '').replace(/[()]/g, '').trim();

  // Split on punctuation marks or waqf signs
  const regex = isUrdu ? /([۔!؟\n])/ : /([.،۔!؟؛\n]|[\u06D6-\u06DC])/;
  const parts = clean.split(regex).filter(Boolean);
  const list: string[] = [];

  for (let i = 0; i < parts.length; i += 2) {
    const chunk = (parts[i] || '') + (parts[i + 1] || '');
    if (chunk.trim().length > 0) {
      list.push(chunk.trim());
    }
  }

  return list.length > 0 ? list : [clean];
}

export function buildAudioSentences(arabicText: string, urduText?: string): AudioSentence[] {
  const arSentences = splitTextIntoSentences(arabicText, false);
  const urSentences = urduText ? splitTextIntoSentences(urduText, true) : [];

  const totalLength = arSentences.reduce((acc, s) => acc + Math.max(s.length, 1), 0);
  let accumulatedRatio = 0;

  return arSentences.map((ar, idx) => {
    const len = Math.max(ar.length, 1);
    const startRatio = accumulatedRatio;
    const endRatio = Math.min(1, accumulatedRatio + len / totalLength);
    accumulatedRatio = endRatio;

    return {
      arabic: ar,
      urdu: urSentences[idx] || (idx === arSentences.length - 1 ? urSentences.slice(idx).join(' ') : undefined),
      startRatio,
      endRatio: idx === arSentences.length - 1 ? 1.0 : endRatio
    };
  });
}

export function buildSurahAyahPlaylist(opts: {
  surahNumber: number;
  ayahCount: number;
  surahNameUrdu?: string;
  surahNameArabic?: string;
  reciterId?: string;
  segments?: Array<{ arabicText: string; urduTranslation?: string }>;
}): AudioSyncItem[] {
  const list: AudioSyncItem[] = [];
  const reciter = opts.reciterId || 'Alafasy_128kbps';
  const total = opts.ayahCount || 7;

  for (let a = 1; a <= total; a++) {
    // Attempt to match verse text from segments if available
    let arText = '';
    let urText = '';
    if (opts.segments && opts.segments.length > 0) {
      for (const seg of opts.segments) {
        if (seg.arabicText.includes(String(a)) || seg.arabicText.includes(`(${a})`) || seg.arabicText.includes(`﴿${a}﴾`)) {
          arText = seg.arabicText;
          urText = seg.urduTranslation || '';
          break;
        }
      }
      if (!arText && opts.segments[a - 1]) {
        arText = opts.segments[a - 1].arabicText;
        urText = opts.segments[a - 1].urduTranslation || '';
      }
    }

    list.push({
      id: `quran-${opts.surahNumber}-${a}`,
      type: 'quran',
      title: `${opts.surahNameArabic || `سورة ${opts.surahNumber}`} — آیت ${a}`,
      subtitle: `${opts.surahNameUrdu || 'القرآن الکریم'} • آیت ${a} از ${total}`,
      bookTitle: opts.surahNameUrdu || 'القرآن الکریم',
      surahNumber: opts.surahNumber,
      itemNumber: a,
      totalItems: total,
      arabicText: arText || `آیت کریمہ نمبر ${a}`,
      urduText: urText,
      audioUrl: buildQuranAyahAudioUrl(reciter, opts.surahNumber, a),
      sentences: buildAudioSentences(arText || `آیت کریمہ نمبر ${a}`, urText)
    });
  }

  return list;
}

export type AudioMode = 'arabic' | 'urdu' | 'both';

interface AudioSyncContextType {
  activeItem: AudioSyncItem | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  selectedReciter: string;
  audioMode: AudioMode;
  autoPlayNext: boolean;
  autoScroll: boolean;
  activeSentenceIndex: number;
  activeAyahNumber: number;
  isFloatingBarOpen: boolean;
  playlist: AudioSyncItem[];
  
  // Actions
  playSurahFull: (opts: {
    surahNumber: number;
    surahNameUrdu?: string;
    surahNameArabic?: string;
    totalAyahs?: number;
    segments?: Array<{ arabicText: string; urduTranslation?: string }>;
  }) => void;
  playQuranAyah: (opts: {
    surahNumber: number;
    ayahNumber: number;
    arabicText: string;
    urduText?: string;
    surahNameUrdu?: string;
    surahNameArabic?: string;
    totalAyahs?: number;
    playlist?: AudioSyncItem[];
  }) => void;
  playHadith: (opts: {
    bookSlug: string;
    bookTitle: string;
    hadithNumber: number;
    arabicText: string;
    urduText?: string;
    totalHadiths?: number;
    playlist?: AudioSyncItem[];
    mode?: AudioMode;
  }) => void;
  playItem: (item: AudioSyncItem, newPlaylist?: AudioSyncItem[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setReciter: (reciterId: string) => void;
  setAudioMode: (mode: AudioMode) => void;
  setAutoPlayNext: (val: boolean) => void;
  setAutoScroll: (val: boolean) => void;
  setFloatingBarOpen: (val: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
  registerPlaylist: (items: AudioSyncItem[]) => void;
}

const AudioSyncContext = createContext<AudioSyncContextType | null>(null);

export const AudioSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeItem, setActiveItem] = useState<AudioSyncItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState<string>('Alafasy_128kbps');
  const [audioMode, setAudioMode] = useState<AudioMode>('arabic');
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(1);
  const [isFloatingBarOpen, setFloatingBarOpen] = useState(false);
  const [playlist, setPlaylist] = useState<AudioSyncItem[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isTransitioningRef = useRef(false);
  const activeItemRef = useRef<AudioSyncItem | null>(null);
  const playlistRef = useRef<AudioSyncItem[]>([]);
  const autoPlayNextRef = useRef<boolean>(true);
  const selectedReciterRef = useRef<string>('Alafasy_128kbps');
  const playbackRateRef = useRef<number>(1);
  const activeAyahNumberRef = useRef<number>(1);
  const playNextRef = useRef<() => void>(() => {});

  // Keep refs synchronized with state to prevent stale closures
  useEffect(() => { activeItemRef.current = activeItem; }, [activeItem]);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { autoPlayNextRef.current = autoPlayNext; }, [autoPlayNext]);
  useEffect(() => { selectedReciterRef.current = selectedReciter; }, [selectedReciter]);
  useEffect(() => { playbackRateRef.current = playbackRate; }, [playbackRate]);
  useEffect(() => { activeAyahNumberRef.current = activeAyahNumber; }, [activeAyahNumber]);

  // Initialize persistent Audio Element once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;

      const handleWaiting = () => setIsLoading(true);
      const handleCanPlay = () => setIsLoading(false);
      const handlePlaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      const handlePause = () => {
        if (!isTransitioningRef.current) {
          setIsPlaying(false);
        }
      };
      const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const cur = audioRef.current.currentTime;
        const dur = audioRef.current.duration || 0;
        setCurrentTime(cur);
        setDuration(dur);

        const currentItem = activeItemRef.current;
        if (dur > 0 && currentItem) {
          const ratio = Math.max(0, Math.min(1, cur / dur));

          // 1. If full Surah mode, track active Ayah based on duration ratio
          if (currentItem.isFullSurah && currentItem.surahAyahMarkers && currentItem.surahAyahMarkers.length > 0) {
            const marker = currentItem.surahAyahMarkers.find(m => ratio >= m.startRatio && ratio <= m.endRatio);
            if (marker && marker.ayahNumber !== activeAyahNumberRef.current) {
              setActiveAyahNumber(marker.ayahNumber);
              activeAyahNumberRef.current = marker.ayahNumber;
            }
          }

          // 2. Sentence boundary tracking
          if (currentItem.sentences && currentItem.sentences.length > 0) {
            const idx = currentItem.sentences.findIndex(s => ratio >= s.startRatio && ratio <= s.endRatio);
            if (idx !== -1) {
              setActiveSentenceIndex(idx);
            }
          }
        }
      };
      const handleDurationChange = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration || 0);
        }
      };
      const handleError = (e: Event) => {
        console.warn('Audio playback error:', e);
        setIsLoading(false);
        setIsPlaying(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        if (autoPlayNextRef.current) {
          playNextRef.current();
        }
      };

      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);
      audio.onended = handleEnded;

      return () => {
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('ended', handleEnded);
        audio.onended = null;
        audio.pause();
        audio.src = '';
      };
    }
  }, []);

  // Smooth Auto-scroll to active item or active verse
  useEffect(() => {
    if (!autoScroll || !activeItem) return;
    try {
      const targetId = activeItem.isFullSurah && activeItem.surahNumber
        ? `quran-${activeItem.surahNumber}-${activeAyahNumber}`
        : activeItem.id;
      const el = document.getElementById(targetId) || document.getElementById(activeItem.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch {
      // ignore
    }
  }, [activeItem?.id, activeAyahNumber, autoScroll, activeItem?.isFullSurah, activeItem?.surahNumber]);

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setActiveSentenceIndex(0);
  }, []);

  const playItem = useCallback((item: AudioSyncItem, newPlaylist?: AudioSyncItem[]) => {
    if (newPlaylist && newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
      playlistRef.current = newPlaylist;
    }
    stopCurrentAudio();
    setActiveItem(item);
    activeItemRef.current = item;
    const ayahNum = item.itemNumber || 1;
    setActiveAyahNumber(ayahNum);
    activeAyahNumberRef.current = ayahNum;
    setFloatingBarOpen(true);
    setIsLoading(true);
    isTransitioningRef.current = true;

    // Determine Audio Source
    let audioUrl = item.audioUrl;
    if (item.isFullSurah && item.surahNumber) {
      audioUrl = buildQuranSurahFullAudioUrl(selectedReciterRef.current, item.surahNumber);
    } else if (item.type === 'quran' && item.surahNumber && item.itemNumber) {
      audioUrl = buildQuranAyahAudioUrl(selectedReciterRef.current, item.surahNumber, item.itemNumber);
    } else if (item.type === 'hadith' && !audioUrl) {
      const cleanArabic = item.arabicText.replace(/[\[\](){}<>«»""''‘’“”/\\#]/g, ' ').slice(0, 300);
      audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanArabic)}&tl=ar&client=tw-ob`;
    }

    const audio = audioRef.current;
    if (audioUrl && audio) {
      // Explicit onended handler assigned on every track to guarantee automatic advancement
      audio.onended = () => {
        setIsPlaying(false);
        if (autoPlayNextRef.current) {
          playNextRef.current();
        }
      };

      audio.src = audioUrl;
      audio.playbackRate = playbackRateRef.current;
      audio.load();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isTransitioningRef.current = false;
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.warn('Audio play error:', err);
            isTransitioningRef.current = false;
            setIsLoading(false);
            setIsPlaying(false);
          });
      }
    } else {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [stopCurrentAudio]);

  const playNext = useCallback(() => {
    const currentItem = activeItemRef.current;
    if (!currentItem) return;

    const currentPlaylist = playlistRef.current;

    // 1. Advance in current playlist queue
    if (currentPlaylist && currentPlaylist.length > 0) {
      const curIdx = currentPlaylist.findIndex(it => it.id === currentItem.id);
      if (curIdx !== -1 && curIdx < currentPlaylist.length - 1) {
        const nextItem = currentPlaylist[curIdx + 1];
        playItem(nextItem);
        return;
      }
    }

    // 2. Fallback for Quran Ayahs: Auto-advance to next Ayah in Surah
    if (currentItem.type === 'quran' && currentItem.surahNumber) {
      const totalAyahs = currentItem.totalItems || 999;
      const nextAyah = (currentItem.itemNumber || 1) + 1;
      if (nextAyah <= totalAyahs) {
        const reciter = selectedReciterRef.current;
        const nextItem: AudioSyncItem = {
          ...currentItem,
          id: `quran-${currentItem.surahNumber}-${nextAyah}`,
          itemNumber: nextAyah,
          title: `${currentItem.bookTitle || 'القرآن الکریم'} — آیت ${nextAyah}`,
          subtitle: `${currentItem.bookTitle || 'القرآن الکریم'} • آیت ${nextAyah} از ${totalAyahs}`,
          audioUrl: buildQuranAyahAudioUrl(reciter, currentItem.surahNumber, nextAyah),
          sentences: []
        };
        playItem(nextItem);
        return;
      }
    }

    // 3. Fallback for Hadith: advance to next hadith if numbered
    if (currentItem.type === 'hadith' && currentItem.itemNumber && currentItem.bookSlug) {
      const totalHadiths = currentItem.totalItems || 9999;
      const nextNum = (currentItem.itemNumber || 1) + 1;
      if (nextNum <= totalHadiths) {
        const nextItem: AudioSyncItem = {
          ...currentItem,
          id: `hadith-${currentItem.bookSlug}-${nextNum}`,
          itemNumber: nextNum,
          title: `${currentItem.bookTitle || 'حدیث شریف'} — حدیث ${nextNum}`,
          subtitle: `حدیث شریف نمبر: ${nextNum}${currentItem.totalItems ? ` از ${currentItem.totalItems}` : ''}`,
          audioUrl: undefined,
        };
        playItem(nextItem);
        return;
      }
    }
  }, [playItem]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const playPrevious = useCallback(() => {
    const currentItem = activeItemRef.current;
    if (!currentItem) return;

    const currentPlaylist = playlistRef.current;

    // 1. If we have a playlist, move backwards
    if (currentPlaylist && currentPlaylist.length > 0) {
      const curIdx = currentPlaylist.findIndex(it => it.id === currentItem.id);
      if (curIdx > 0) {
        playItem(currentPlaylist[curIdx - 1]);
        return;
      }
    }

    // 2. Quran Fallback
    if (currentItem.type === 'quran' && currentItem.surahNumber && currentItem.itemNumber > 1) {
      const prevAyah = currentItem.itemNumber - 1;
      const reciter = selectedReciterRef.current;
      const prevItem: AudioSyncItem = {
        ...currentItem,
        id: `quran-${currentItem.surahNumber}-${prevAyah}`,
        itemNumber: prevAyah,
        title: `${currentItem.bookTitle || 'القرآن الکریم'} — آیت ${prevAyah}`,
        audioUrl: buildQuranAyahAudioUrl(reciter, currentItem.surahNumber, prevAyah),
      };
      playItem(prevItem);
      return;
    }

    // 3. Hadith Fallback
    if (currentItem.type === 'hadith' && currentItem.itemNumber > 1 && currentItem.bookSlug) {
      const prevNum = currentItem.itemNumber - 1;
      const prevItem: AudioSyncItem = {
        ...currentItem,
        id: `hadith-${currentItem.bookSlug}-${prevNum}`,
        itemNumber: prevNum,
        title: `${currentItem.bookTitle || 'حدیث شریف'} — حدیث ${prevNum}`,
        subtitle: `حدیث شریف نمبر: ${prevNum}${currentItem.totalItems ? ` از ${currentItem.totalItems}` : ''}`,
        audioUrl: undefined,
      };
      playItem(prevItem);
      return;
    }
  }, [playItem]);

  const togglePlay = () => {
    if (!activeItem) return;
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const pause = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const resume = () => {
    if (audioRef.current && audioRef.current.src) {
      if (audioRef.current.duration > 0 && audioRef.current.currentTime >= audioRef.current.duration) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else if (activeItemRef.current) {
      playItem(activeItemRef.current);
    }
  };

  const stop = () => {
    stopCurrentAudio();
    setActiveItem(null);
    setFloatingBarOpen(false);
  };

  const seek = (seconds: number) => {
    if (audioRef.current && duration > 0) {
      const target = Math.max(0, Math.min(duration, seconds));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const setReciter = (reciterId: string) => {
    setSelectedReciter(reciterId);
    // Update active playlist items with new reciter URLs
    setPlaylist(prev => prev.map(it => {
      if (it.type === 'quran' && it.surahNumber) {
        return {
          ...it,
          audioUrl: it.isFullSurah
            ? buildQuranSurahFullAudioUrl(reciterId, it.surahNumber)
            : buildQuranAyahAudioUrl(reciterId, it.surahNumber, it.itemNumber),
        };
      }
      return it;
    }));

    if (activeItem && activeItem.type === 'quran' && activeItem.surahNumber) {
      const wasPlaying = isPlaying;
      const newUrl = activeItem.isFullSurah
        ? buildQuranSurahFullAudioUrl(reciterId, activeItem.surahNumber)
        : buildQuranAyahAudioUrl(reciterId, activeItem.surahNumber, activeItem.itemNumber);
      setActiveItem(prev => prev ? { ...prev, audioUrl: newUrl } : null);
      if (audioRef.current) {
        audioRef.current.src = newUrl;
        audioRef.current.load();
        if (wasPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    }
  };

  const playSurahFull = useCallback((opts: {
    surahNumber: number;
    surahNameUrdu?: string;
    surahNameArabic?: string;
    totalAyahs?: number;
    segments?: Array<{ arabicText: string; urduTranslation?: string }>;
  }) => {
    const totalAyahs = opts.totalAyahs || (opts.segments?.length) || 7;

    // Build ayah markers: compute proportional start/end ratios based on verse lengths
    const markers: SurahAyahMarker[] = [];
    if (opts.segments && opts.segments.length > 0) {
      const lengths = opts.segments.map(s => Math.max(s.arabicText.length, 10));
      const totalLen = lengths.reduce((a, b) => a + b, 0);
      let acc = 0;
      opts.segments.forEach((_, idx) => {
        const start = acc;
        const end = idx === opts.segments!.length - 1 ? 1.0 : Math.min(1.0, acc + (lengths[idx] / totalLen));
        acc = end;
        markers.push({
          ayahNumber: idx + 1,
          startRatio: start,
          endRatio: end
        });
      });
    } else {
      // Equal distribution if segments not provided
      for (let a = 1; a <= totalAyahs; a++) {
        markers.push({
          ayahNumber: a,
          startRatio: (a - 1) / totalAyahs,
          endRatio: a === totalAyahs ? 1.0 : a / totalAyahs
        });
      }
    }

    const fullUrl = buildQuranSurahFullAudioUrl(selectedReciter, opts.surahNumber);
    const item: AudioSyncItem = {
      id: `quran-surah-${opts.surahNumber}`,
      type: 'quran',
      title: opts.surahNameArabic || `سورة ${opts.surahNumber}`,
      subtitle: `${opts.surahNameUrdu || 'القرآن الکریم'} • تلاوت مکمل سورۃ (${totalAyahs} آیات)`,
      bookTitle: opts.surahNameUrdu || 'القرآن الکریم',
      surahNumber: opts.surahNumber,
      itemNumber: 1,
      totalItems: totalAyahs,
      arabicText: opts.surahNameArabic || `سورة ${opts.surahNumber}`,
      urduText: opts.surahNameUrdu || `سورۃ نمبر ${opts.surahNumber}`,
      audioUrl: fullUrl,
      isFullSurah: true,
      surahAyahMarkers: markers,
      sentences: []
    };

    playItem(item, [item]);
  }, [selectedReciter, playItem]);

  const playQuranAyah = useCallback((opts: {
    surahNumber: number;
    ayahNumber: number;
    arabicText: string;
    urduText?: string;
    surahNameUrdu?: string;
    surahNameArabic?: string;
    totalAyahs?: number;
    playlist?: AudioSyncItem[];
  }) => {
    const sentences = buildAudioSentences(opts.arabicText, opts.urduText);
    const item: AudioSyncItem = {
      id: `quran-${opts.surahNumber}-${opts.ayahNumber}`,
      type: 'quran',
      title: `${opts.surahNameArabic || `سورة ${opts.surahNumber}`} — آیت ${opts.ayahNumber}`,
      subtitle: `${opts.surahNameUrdu || 'القرآن الکریم'} • آیت ${opts.ayahNumber}${opts.totalAyahs ? ` از ${opts.totalAyahs}` : ''}`,
      bookTitle: opts.surahNameUrdu || 'القرآن الکریم',
      surahNumber: opts.surahNumber,
      itemNumber: opts.ayahNumber,
      totalItems: opts.totalAyahs,
      arabicText: opts.arabicText,
      urduText: opts.urduText,
      audioUrl: buildQuranAyahAudioUrl(selectedReciter, opts.surahNumber, opts.ayahNumber),
      sentences
    };
    playItem(item, opts.playlist);
  }, [selectedReciter, playItem]);

  const playHadith = useCallback((opts: {
    bookSlug: string;
    bookTitle: string;
    hadithNumber: number;
    arabicText: string;
    urduText?: string;
    totalHadiths?: number;
    playlist?: AudioSyncItem[];
    mode?: AudioMode;
  }) => {
    const sentences = buildAudioSentences(opts.arabicText, opts.urduText);
    const item: AudioSyncItem = {
      id: `hadith-${opts.bookSlug}-${opts.hadithNumber}`,
      type: 'hadith',
      title: `${opts.bookTitle} — حدیث ${opts.hadithNumber}`,
      subtitle: `حدیث شریف نمبر: ${opts.hadithNumber}${opts.totalHadiths ? ` از ${opts.totalHadiths}` : ''}`,
      bookTitle: opts.bookTitle,
      bookSlug: opts.bookSlug,
      itemNumber: opts.hadithNumber,
      totalItems: opts.totalHadiths,
      arabicText: opts.arabicText,
      urduText: opts.urduText,
      sentences
    };
    if (opts.mode) {
      setAudioMode(opts.mode);
    }
    playItem(item, opts.playlist);
  }, [playItem]);

  const registerPlaylist = useCallback((items: AudioSyncItem[]) => {
    setPlaylist(items);
  }, []);

  return (
    <AudioSyncContext.Provider
      value={{
        activeItem,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        playbackRate,
        selectedReciter,
        audioMode,
        autoPlayNext,
        autoScroll,
        activeSentenceIndex,
        activeAyahNumber,
        isFloatingBarOpen,
        playlist,
        playSurahFull,
        playQuranAyah,
        playHadith,
        playItem,
        togglePlay,
        pause,
        resume,
        stop,
        seek,
        setPlaybackRate,
        setReciter,
        setAudioMode,
        setAutoPlayNext,
        setAutoScroll,
        setFloatingBarOpen,
        playNext,
        playPrevious,
        registerPlaylist,
      }}
    >
      {children}
    </AudioSyncContext.Provider>
  );
};

export const useAudioSync = (): AudioSyncContextType => {
  const ctx = useContext(AudioSyncContext);
  if (!ctx) {
    throw new Error('useAudioSync must be used within an AudioSyncProvider');
  }
  return ctx;
};
