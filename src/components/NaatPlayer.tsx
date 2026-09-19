import React, { useState, useRef, useEffect, useMemo } from 'react';
import YouTube from 'react-youtube';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Search, 
  CheckCircle2,
  ListMusic
} from 'lucide-react';
import { naatsData, NaatItem } from '../data/naatsData';
import { TehreekImanLogo } from './TehreekImanLogo';
import { CommentSection } from './CommentSection';

interface NaatPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NaatPlayer: React.FC<NaatPlayerProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'سب' | 'حمد' | 'نعت' | 'نظم'>('سب');
  const [currentId, setCurrentId] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Audio player state for local & archive
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  // Current Naat object derived from currentId
  const currentNaat: NaatItem = useMemo(() => {
    return naatsData.find(n => n.id === currentId) || naatsData[0];
  }, [currentId]);

  const currentTrack = useMemo(() => ({
    url: currentNaat.src || `/naats/track-${String(currentNaat.id).padStart(2, '0')}.mp3`,
    title: currentNaat.title
  }), [currentNaat]);

  // BULLETPROOF AUDIO INITIALIZATION (As requested)
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    audioRef.current.crossOrigin = 'anonymous';
    audioRef.current.volume = 1;

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Draggable / Movable Modal State (EXACT SAME AS QURAN PLAYER)
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
  }, [currentId, isOpen]);

  // BULLETPROOF PLAY TRACK FUNCTION
  const playTrack = async (url: string, index: number) => {
    console.log('CLICKED TRACK', index, url);
    setCurrentTrackUrl(url);
    if (!audioRef.current) audioRef.current = new Audio();
    try {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.load();
      await new Promise(r => setTimeout(r, 200));
      await audioRef.current.play();
      setIsPlaying(true);
      console.log('SUCCESS PLAYING', url);

      // Sync with fallback native audio element as well
      const el = document.getElementById('fallback-audio') as HTMLAudioElement;
      if (el) {
        el.src = url;
        el.style.display = 'block';
        el.load();
      }
    } catch (err: any) {
      console.error('PLAY FAILED', err);
      // Show user exact reason
      alert('آواز کا مسئلہ: ' + (err?.message || 'خرابی') + '\nURL: ' + url + '\n\nاگر 404 ہے تو فائل public/naats میں نہیں ہے۔');
      // Try fallback: show native audio element with controls
      const el = document.getElementById('fallback-audio') as HTMLAudioElement;
      if (el) {
        el.src = url;
        el.style.display = 'block';
        el.load();
        el.play().catch(() => {});
      }
    }
  };

  // Handle track events (timeupdate, loadedmetadata, ended)
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateMeta = () => setDuration(audio.duration);
    const onEnded = () => {
      console.log(`Track finished, playing next track`);
      handleNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateMeta);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentId]);

  // Handle switching naat
  const handleSelectNaat = (id: number) => {
    setCurrentId(id);
    setCurrentTime(0);

    const target = naatsData.find(n => n.id === id);
    if (!target) return;

    setToastMsg(`${target.category}: ${target.title}`);
    setTimeout(() => setToastMsg(null), 2500);

    // Audio handling for local / archive
    if (target.type === 'local' || target.type === 'archive') {
      const url = target.src || target.fallbackUrl || '';
      playTrack(url, id);
    } else if (target.type === 'youtube') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(true);
      setCurrentTrackUrl(`https://youtube.com/watch?v=${target.videoId}`);
    }
  };

  // Continuous Auto-Play Next (current + 1, loops 100 to 1)
  const handleNext = () => {
    if (currentId < naatsData.length) {
      handleSelectNaat(currentId + 1);
    } else {
      handleSelectNaat(1);
    }
  };

  const handlePrev = () => {
    if (currentId > 1) {
      handleSelectNaat(currentId - 1);
    } else {
      handleSelectNaat(naatsData.length);
    }
  };

  // Toggle Play / Pause for HTML5 audio
  const handleTogglePlay = () => {
    if (currentNaat.type === 'youtube') {
      setIsPlaying(prev => !prev);
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentTrackUrl) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => playTrack(currentTrackUrl, currentId));
      } else {
        const url = currentNaat.src || currentNaat.fallbackUrl || '';
        playTrack(url, currentId);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
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

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return naatsData.filter(item => {
      const matchCat = activeCategory === 'سب' || item.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        item.id.toString() === q ||
        item.title.toLowerCase().includes(q) ||
        item.artist.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div 
      dir="rtl"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDragging) onClose();
      }}
    >
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
        {/* Toast Notification */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#FACC15] text-black font-nastaliq font-bold text-xs px-4 py-1.5 rounded-xl shadow-2xl animate-fadeIn border border-amber-300 flex items-center gap-1.5 pointer-events-none">
            <CheckCircle2 className="w-4 h-4 text-emerald-950" />
            <span>{toastMsg}</span>
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
                    حمد و نعت
                  </span>
                  <h2 className="text-base sm:text-xl font-bold text-white font-nastaliq leading-tight flex items-center gap-1.5">
                    <span className="text-amber-400 font-mono text-sm">⠿⠿</span>
                    نعتِ رسول ﷺ
                  </h2>
                </div>
                <span className="text-[10px] bg-yellow-400/20 text-[#FACC15] border border-yellow-400/30 px-2 py-0.5 rounded-full font-nastaliq font-bold self-start mt-0.5">
                  پکڑ کر گھسیٹیں ✥
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-nastaliq mt-0.5">
                100 منتخب نعتیں
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
          
          {/* NOW PLAYING CONTROLS CARD */}
          <div className="bg-gradient-to-r from-emerald-900/90 to-[#022c22]/90 border border-yellow-400/30 rounded-2xl p-4 shadow-xl text-center space-y-3 relative overflow-hidden">
            
            {/* Auto Play Indicator Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-amber-400/40 text-[#FACC15] text-[11px] font-nastaliq font-bold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>🔄 مسلسل ترنم: آن (اگلا کلام خودکار جاری رہے گا)</span>
            </div>

            {/* Current Item Title & Meta */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  {currentNaat.category} #{currentNaat.id}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  currentNaat.type === 'local'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : currentNaat.type === 'youtube'
                    ? 'bg-red-500/20 text-red-300 border-red-400/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                }`}>
                  {currentNaat.type === 'local' && '📥 محفوظ (آف لائن)'}
                  {currentNaat.type === 'youtube' && '▶️ یوٹیوب'}
                  {currentNaat.type === 'archive' && '🌐 آرکائیو ڈائریکٹ'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-nastaliq text-amber-200 tracking-wide">
                {currentNaat.title}
              </h3>
              <p className="text-xs text-emerald-200/80 font-nastaliq mt-1">
                {currentNaat.artist}
              </p>
            </div>

            {/* HYBRID PLAYER RENDERER: YOUTUBE VS HTML5 AUDIO */}
            {currentNaat.type === 'youtube' && currentNaat.videoId ? (
              <div className="mt-2 rounded-xl overflow-hidden shadow-2xl border border-yellow-400/30 bg-black/60 max-w-md mx-auto aspect-video">
                <YouTube
                  videoId={currentNaat.videoId}
                  onEnd={handleNext}
                  onError={(e) => console.log('YouTube Error:', e)}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 1,
                      rel: 0,
                      modestbranding: 1
                    }
                  }}
                  className="w-full h-full"
                />
              </div>
            ) : (
              /* Seek Bar & Audio Controls for Local & Archive */
              <div className="space-y-2 pt-1 max-w-md mx-auto">
                <div className="flex items-center gap-3 text-xs font-mono text-emerald-300">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 accent-amber-400 h-1.5 bg-emerald-950/80 rounded-lg cursor-pointer"
                  />
                  <span>{formatTime(duration)}</span>
                </div>

                {/* Playback Action Buttons */}
                <div className="flex items-center justify-center gap-4 pt-2">
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
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 flex items-center justify-center shadow-lg shadow-amber-500/30 transition cursor-pointer active:scale-95 font-bold"
                    title={isPlaying ? 'روکیں' : 'چلائیں'}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current ml-0.5" />
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

                  {/* Volume Slider */}
                  <div className="hidden sm:flex items-center gap-1.5 mr-2 bg-emerald-950/60 px-2.5 py-1.5 rounded-xl border border-yellow-400/20">
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
                      className="w-16 accent-amber-400 h-1 bg-emerald-900 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* YOUTUBE STYLE COMMENT SECTION PER NAAT */}
          <CommentSection 
            contentId={currentTrack.url} 
            contentTitle={currentTrack.title} 
          />

          {/* FILTER TABS & SEARCH BAR */}
          <div className="space-y-3 bg-emerald-950/60 p-3 sm:p-4 rounded-2xl border border-yellow-400/20">
            {/* Category Tabs: سب | حمد | نعت | نظم */}
            <div className="flex items-center justify-between gap-2 border-b border-emerald-800/60 pb-3">
              <div className="flex items-center gap-1.5">
                {(['سب', 'حمد', 'نعت', 'نظم'] as const).map(tab => {
                  const isSelected = activeCategory === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveCategory(tab)}
                      className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-emerald-950 shadow-md ring-2 ring-amber-300/50'
                          : 'bg-emerald-900/60 text-amber-200 hover:bg-emerald-800/80 border border-yellow-400/20'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] font-nastaliq text-emerald-300">
                دستیاب: {filteredTracks.length} کلام
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="حمد و نعتِ رسول ﷺ یا کلام تلاش کریں..."
                className="w-full pr-9 pl-3 py-2 bg-emerald-900/40 border border-yellow-400/20 rounded-xl text-xs sm:text-sm font-nastaliq text-amber-100 placeholder-emerald-400/60 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40"
              />
            </div>
          </div>

          {/* TRACKS LIST (100 TRACKS) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-nastaliq text-amber-300 flex items-center gap-1.5 px-1">
              <ListMusic className="w-4 h-4 text-amber-400" />
              <span>فہرستِ کلام (100 حمد و نعتِ رسول ﷺ)</span>
            </h4>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {filteredTracks.map(item => {
                const isSelected = item.id === currentId;
                return (
                  <div
                    key={item.id}
                    ref={isSelected ? activeItemRef : null}
                    onClick={() => handleSelectNaat(item.id)}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400/20 via-emerald-800/70 to-emerald-900/70 border-amber-400 shadow-md scale-[1.01]'
                        : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/40 text-amber-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Item Number & Play indicator */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
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

                      {/* Title & Artist */}
                      <div>
                        <h5 className={`font-nastaliq text-sm sm:text-base font-bold leading-tight ${
                          isSelected ? 'text-amber-300' : 'text-stone-100'
                        }`}>
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-emerald-300/70 font-nastaliq mt-0.5">
                          {item.artist}
                        </p>
                      </div>
                    </div>

                    {/* Category & Source Badges */}
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 text-amber-300 text-[10px] font-nastaliq font-bold border border-yellow-400/20">
                        {item.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-nastaliq font-semibold border ${
                        item.type === 'local'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : item.type === 'youtube'
                          ? 'bg-red-500/10 text-red-300 border-red-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}>
                        {item.type === 'local' && '📥 محفوظ'}
                        {item.type === 'youtube' && '▶️ یوٹیوب'}
                        {item.type === 'archive' && '🌐 آرکائیو'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredTracks.length === 0 && (
                <div className="text-center py-8 text-emerald-300/70 font-nastaliq text-sm bg-emerald-950/20 rounded-xl border border-dashed border-emerald-800">
                  کوئی کلام دستیاب نہیں ملا۔ تلاش کا لفظ تبدیل فرمائیں۔
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ALWAYS VISIBLE NATIVE AUDIO FOR DEBUG / DIRECT PLAY (Task 3) */}
        <div className="p-3 bg-black/95 border-t border-yellow-400/20 text-right">
          <p className="text-[10px] text-stone-300 font-nastaliq">
            فی الوقت کلام: <strong className="text-amber-300">{currentTrackUrl || "کوئی نعت منتخب نہیں"}</strong>
          </p>
          <audio 
            id="fallback-audio" 
            controls 
            preload="auto" 
            crossOrigin="anonymous" 
            className="w-full mt-2 h-9" 
            style={{ display: currentTrackUrl ? 'block' : 'none' }} 
            onError={(e) => console.log("Fallback audio error", e)} 
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button 
              type="button" 
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.play();
                  setIsPlaying(true);
                }
              }} 
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg font-bold cursor-pointer"
            >
              Play
            </button>
            <button 
              type="button" 
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  setIsPlaying(false);
                }
              }} 
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg font-bold cursor-pointer"
            >
              Pause
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 bg-[#064e3b] border-t border-yellow-400/20 flex items-center justify-between text-[11px] text-emerald-200/80 font-nastaliq px-4">
          <span>تحریکِ ایمان ڈیجیٹل کتب خانہ • صوتیاتِ نبوی</span>
          <span>۱۰۰ کلامِ حمد و نعتِ رسول ﷺ</span>
        </div>
      </div>
    </div>
  );
};
