import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface AudioSentence {
  arabic: string;
  urdu?: string;
  startRatio: number;
  endRatio: number;
}

export interface AudioSyncItem {
  id: string; // e.g. "quran-1-1" or "hadith-bukhari-1"
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
}

export interface ReciterInfo {
  id: string;
  nameUrdu: string;
  nameArabic: string;
  nameEn: string;
}

export const QURAN_AYAH_RECITERS: ReciterInfo[] = [
  { id: 'Alafasy_128kbps', nameUrdu: 'مشاری راشد العفاسی', nameArabic: 'مشاري راشد العفاسي', nameEn: 'Mishary Alafasy' },
  { id: 'Abdul_Basit_Murattal_192kbps', nameUrdu: 'عبد الباسط عبد الصمد (مرتل)', nameArabic: 'عبد الباسط عبد الصمد', nameEn: 'Abdul Basit' },
  { id: 'Minshawy_Murattal_128kbps', nameUrdu: 'محمد صدیق المنشاوی', nameArabic: 'محمد صديق المنشاوي', nameEn: 'Minshawi' },
  { id: 'Husary_128kbps', nameUrdu: 'محمود خلیل الحصری', nameArabic: 'محمود خليل الحصري', nameEn: 'Husary' },
  { id: 'Hudhaify_128kbps', nameUrdu: 'علی الحذیفی', nameArabic: 'علي الحذيفي', nameEn: 'Al-Hudhaify' },
  { id: 'urdu_shamshad_ali_khan_46kbps', nameUrdu: 'اردو ترجمہ (مولانا شمشاد علی خان)', nameArabic: 'الترجمة الأردية', nameEn: 'Urdu Audio (Shamshad Ali)' },
];

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
  isFloatingBarOpen: boolean;
  playlist: AudioSyncItem[];
  
  // Actions
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
  const [isFloatingBarOpen, setFloatingBarOpen] = useState(false);
  const [playlist, setPlaylist] = useState<AudioSyncItem[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<(() => void) | null>(null);
  const isTransitioningRef = useRef(false);

  // Initialize Audio Element once
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

        // Update active sentence based on ratio
        if (dur > 0 && activeItem && activeItem.sentences.length > 0) {
          const ratio = Math.max(0, Math.min(1, cur / dur));
          const idx = activeItem.sentences.findIndex(s => ratio >= s.startRatio && ratio <= s.endRatio);
          if (idx !== -1) {
            setActiveSentenceIndex(idx);
          }
        }
      };
      const handleDurationChange = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration || 0);
        }
      };
      const handleError = (e: Event) => {
        console.warn('Audio playback error, fallback to speech synthesis:', e);
        setIsLoading(false);
      };

      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = '';
      };
    }
  }, [activeItem]);

  // Smooth Auto-scroll to active item
  useEffect(() => {
    if (!autoScroll || !activeItem) return;
    try {
      const el = document.getElementById(activeItem.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch {
      // ignore
    }
  }, [activeItem?.id, autoScroll]);

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (speechRef.current) {
      speechRef.current();
      speechRef.current = null;
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
    }
    stopCurrentAudio();
    setActiveItem(item);
    setFloatingBarOpen(true);
    setIsLoading(true);
    isTransitioningRef.current = true;

    // Determine Audio Source
    let audioUrl = item.audioUrl;
    if (item.type === 'quran' && item.surahNumber && item.itemNumber) {
      audioUrl = buildQuranAyahAudioUrl(selectedReciter, item.surahNumber, item.itemNumber);
    } else if (item.type === 'hadith' && !audioUrl) {
      // Use clean Arabic speech stream for Hadith text
      const cleanArabic = item.arabicText.replace(/[\[\](){}<>«»""''‘’“”/\\#]/g, ' ').slice(0, 300);
      audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanArabic)}&tl=ar&client=tw-ob`;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.load();

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isTransitioningRef.current = false;
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.warn('Audio play error, falling back to Web Speech Synthesis:', err);
            isTransitioningRef.current = false;
            setIsLoading(false);
            fallbackSpeak(item);
          });
      }
    } else {
      fallbackSpeak(item);
    }
  }, [selectedReciter, playbackRate, stopCurrentAudio]);

  // Fallback / Hadith Web Speech Synthesis
  const fallbackSpeak = (item: AudioSyncItem) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();

    const textToSpeak = audioMode === 'urdu' && item.urduText 
      ? item.urduText 
      : item.arabicText;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = audioMode === 'urdu' ? 'ur-PK' : 'ar-SA';
    utterance.rate = playbackRate;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      if (autoPlayNext) {
        playNext();
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    // Speech sentence boundary tracking
    utterance.onboundary = (e) => {
      if (item.sentences.length > 0 && e.charIndex !== undefined) {
        const textLen = textToSpeak.length || 1;
        const ratio = e.charIndex / textLen;
        const idx = item.sentences.findIndex(s => ratio >= s.startRatio && ratio <= s.endRatio);
        if (idx !== -1) {
          setActiveSentenceIndex(idx);
        }
      }
    };

    window.speechSynthesis.speak(utterance);
    speechRef.current = () => window.speechSynthesis.cancel();
  };

  const playNext = useCallback(() => {
    if (!activeItem || playlist.length === 0) return;
    const curIdx = playlist.findIndex(it => it.id === activeItem.id);
    if (curIdx !== -1 && curIdx < playlist.length - 1) {
      playItem(playlist[curIdx + 1]);
    } else if (activeItem.type === 'quran' && activeItem.surahNumber) {
      // Auto-advance to next Ayah even if not in explicit playlist
      const nextAyah = activeItem.itemNumber + 1;
      const nextItem: AudioSyncItem = {
        ...activeItem,
        id: `quran-${activeItem.surahNumber}-${nextAyah}`,
        itemNumber: nextAyah,
        title: `${activeItem.bookTitle || 'القرآن الکریم'} — آیت ${nextAyah}`,
        audioUrl: buildQuranAyahAudioUrl(selectedReciter, activeItem.surahNumber, nextAyah),
      };
      playItem(nextItem);
    }
  }, [activeItem, playlist, selectedReciter, playItem]);

  const playPrevious = useCallback(() => {
    if (!activeItem || playlist.length === 0) return;
    const curIdx = playlist.findIndex(it => it.id === activeItem.id);
    if (curIdx > 0) {
      playItem(playlist[curIdx - 1]);
    } else if (activeItem.type === 'quran' && activeItem.surahNumber && activeItem.itemNumber > 1) {
      const prevAyah = activeItem.itemNumber - 1;
      const prevItem: AudioSyncItem = {
        ...activeItem,
        id: `quran-${activeItem.surahNumber}-${prevAyah}`,
        itemNumber: prevAyah,
        title: `${activeItem.bookTitle || 'القرآن الکریم'} — آیت ${prevAyah}`,
        audioUrl: buildQuranAyahAudioUrl(selectedReciter, activeItem.surahNumber, prevAyah),
      };
      playItem(prevItem);
    }
  }, [activeItem, playlist, selectedReciter, playItem]);

  // Audio OnEnded Listener: Continuous recitation
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      if (autoPlayNext) {
        playNext();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [autoPlayNext, playNext]);

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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
  };

  const resume = () => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else if (activeItem) {
      playItem(activeItem);
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
    if (activeItem && activeItem.type === 'quran' && activeItem.surahNumber) {
      const wasPlaying = isPlaying;
      const newUrl = buildQuranAyahAudioUrl(reciterId, activeItem.surahNumber, activeItem.itemNumber);
      if (audioRef.current) {
        audioRef.current.src = newUrl;
        audioRef.current.load();
        if (wasPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    }
  };

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
        isFloatingBarOpen,
        playlist,
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
