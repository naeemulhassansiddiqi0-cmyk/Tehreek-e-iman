import React, { useState, useEffect, useRef } from 'react';
import { 
  PAKISTAN_CITIES, 
  CityOption, 
  to12, 
  addMins, 
  timeToMin, 
  computeTahajjud, 
  namazData, 
  namazKeyMap 
} from '../../data/prayerTimesData';
import { TehreekImanLogo } from '../TehreekImanLogo';
import { copyToClipboardWithTehreekLogo } from '../../utils/clipboardHelper';
import { speakText } from '../../services/speechService';
import { 
  Clock, 
  Compass, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellRing, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCheck, 
  MapPin, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  X, 
  Share2,
  Moon
} from 'lucide-react';
import { QiblaCompassModal } from './QiblaCompassModal';
import { HijriCalendarModal } from './HijriCalendarModal';

interface PrayerTimesViewProps {
  onBackToDashboard?: () => void;
}

interface TimingItem {
  name: string;
  time: string;
  custom?: boolean;
}

export const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({ onBackToDashboard }) => {
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    const saved = localStorage.getItem('ti_selected_city');
    if (saved) {
      const found = PAKISTAN_CITIES.find(c => c.id === saved);
      if (found) return found;
    }
    return PAKISTAN_CITIES[0]; // Karachi
  });

  const [timings, setTimings] = useState<Record<string, string>>(() => selectedCity.defaultTimings);
  const [customList, setCustomList] = useState<TimingItem[]>(() => {
    try {
      const saved = localStorage.getItem('ti_custom_times');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customName, setCustomName] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [copiedSchedule, setCopiedSchedule] = useState(false);

  // Live Clock & Next Prayer Countdown
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [nextPrayerLabel, setNextPrayerLabel] = useState('اگلی نماز');
  const [countdownStr, setCountdownStr] = useState('--:--:--');

  // Azan Audio Player
  const [isAzanPlaying, setIsAzanPlaying] = useState(false);
  const azanAudioRef = useRef<HTMLAudioElement | null>(null);

  // Alarms
  const [alarms, setAlarms] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ti_prayer_alarms');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal State for Namaz/Amal
  const [modalKey, setModalKey] = useState<string | null>(null);
  const [isSpeakingModal, setIsSpeakingModal] = useState(false);
  const stopModalSpeakingRef = useRef<(() => void) | null>(null);

  // 3D Qibla Compass & Hijri Calendar Modals State
  const [isQiblaOpen, setIsQiblaOpen] = useState(false);
  const [isHijriCalendarOpen, setIsHijriCalendarOpen] = useState(false);

  // Save selected city
  useEffect(() => {
    localStorage.setItem('ti_selected_city', selectedCity.id);
  }, [selectedCity]);

  // Save custom list
  useEffect(() => {
    localStorage.setItem('ti_custom_times', JSON.stringify(customList));
  }, [customList]);

  // Save alarms
  useEffect(() => {
    localStorage.setItem('ti_prayer_alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Fetch Live Timings from Aladhan API
  useEffect(() => {
    let isCancelled = false;

    async function fetchTimings() {
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(selectedCity.id)}&country=Pakistan&method=1`
        );
        if (!res.ok) throw new Error('API fetch failed');
        const json = await res.json();
        if (json.data && json.data.timings && !isCancelled) {
          setTimings(json.data.timings);
        }
      } catch (err) {
        console.warn('Aladhan API unavailable, using verified local timings:', err);
        if (!isCancelled) {
          setTimings(selectedCity.defaultTimings);
        }
      }
    }

    fetchTimings();
    return () => {
      isCancelled = true;
    };
  }, [selectedCity]);

  // Request Notification Permission for Alarms
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Compute full 14 prayer timings list
  const getCompiledPrayerList = (): TimingItem[] => {
    const f = timings.Fajr || selectedCity.defaultTimings.Fajr;
    const sr = timings.Sunrise || selectedCity.defaultTimings.Sunrise;
    const dh = timings.Dhuhr || selectedCity.defaultTimings.Dhuhr;
    const as = timings.Asr || selectedCity.defaultTimings.Asr;
    const ss = timings.Sunset || selectedCity.defaultTimings.Sunset;
    const mg = timings.Maghrib || selectedCity.defaultTimings.Maghrib;
    const is = timings.Isha || selectedCity.defaultTimings.Isha;

    const sehri = addMins(f, -10);
    const ishraq = addMins(sr, 20);
    const chasht = addMins(sr, 45);
    const zawal = addMins(dh, -10);
    const iftar = mg;
    const awabeen = addMins(mg, 20);
    const tahajjud = computeTahajjud(is, f);

    const standard: TimingItem[] = [
      { name: 'فجر', time: f },
      { name: 'سحری', time: sehri },
      { name: 'طلوع آفتاب', time: sr },
      { name: 'اشراق', time: ishraq },
      { name: 'چاشت', time: chasht },
      { name: 'زوال', time: zawal },
      { name: 'ظہر', time: dh },
      { name: 'عصر', time: as },
      { name: 'غروب آفتاب', time: ss },
      { name: 'افطاری', time: iftar },
      { name: 'مغرب', time: mg },
      { name: 'اوابین', time: awabeen },
      { name: 'عشاء', time: is },
      { name: 'تہجد', time: tahajjud },
    ];

    return [...standard, ...customList];
  };

  const compiledList = getCompiledPrayerList();

  // Clock & Countdown & Alarm Timer Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Pakistan Standard Time Clock
      const clockString = now.toLocaleTimeString('ur-PK', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTimeStr(clockString);

      // Check Alarms
      const nowHours = String(now.getHours()).padStart(2, '0');
      const nowMins = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${nowHours}:${nowMins}`;

      if (now.getSeconds() === 0) {
        compiledList.forEach(item => {
          if (alarms[item.name] && item.time === currentHHMM) {
            triggerAlarm(item.name);
          }
        });
      }

      // Compute Next Prayer Countdown
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const nowSeconds = now.getSeconds();
      const nowTotalSec = nowMinutes * 60 + nowSeconds;

      // Filter the 5 main prayers + Tahajjud for countdown
      const mainPrayers = compiledList.filter(p =>
        ['فجر', 'ظہر', 'عصر', 'مغرب', 'عشاء', 'تہجد'].includes(p.name)
      );

      let nextPrayer: TimingItem | null = null;
      let minDiffSec = Infinity;

      mainPrayers.forEach(p => {
        const pMinutes = timeToMin(p.time);
        let pSec = pMinutes * 60;
        if (pSec <= nowTotalSec) {
          pSec += 24 * 3600; // tomorrow
        }
        const diff = pSec - nowTotalSec;
        if (diff < minDiffSec) {
          minDiffSec = diff;
          nextPrayer = p;
        }
      });

      if (nextPrayer) {
        setNextPrayerLabel(`اگلی نماز (${(nextPrayer as TimingItem).name})`);
        const hours = Math.floor(minDiffSec / 3600);
        const mins = Math.floor((minDiffSec % 3600) / 60);
        const secs = minDiffSec % 60;
        setCountdownStr(
          `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [compiledList, alarms]);

  const triggerAlarm = (prayerName: string) => {
    // Show system notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`تحریکِ ایمان — وقتِ صلوٰۃ`, {
        body: `${prayerName} کا وقت ہو چکا ہے۔ نماز کی تیاری فرمائیے۔`,
        icon: '/tehreek-iman-logo.jpg',
      });
    }
    // Play Azan
    playAzanAudio();
  };

  const toggleAlarm = (prayerName: string) => {
    setAlarms(prev => {
      const newState = { ...prev, [prayerName]: !prev[prayerName] };
      return newState;
    });
  };

  const playAzanAudio = () => {
    if (azanAudioRef.current) {
      if (isAzanPlaying) {
        azanAudioRef.current.pause();
        azanAudioRef.current.currentTime = 0;
        setIsAzanPlaying(false);
      } else {
        azanAudioRef.current
          .play()
          .then(() => setIsAzanPlaying(true))
          .catch(e => {
            console.warn('Audio playback error:', e);
            setIsAzanPlaying(false);
          });
      }
    }
  };

  const addCustomTime = () => {
    if (!customName.trim() || !customTime.trim()) return;
    const newItem: TimingItem = {
      name: customName.trim(),
      time: customTime.trim(),
      custom: true,
    };
    setCustomList(prev => [...prev, newItem]);
    setCustomName('');
    setCustomTime('');
  };

  const removeCustomTime = (index: number) => {
    setCustomList(prev => prev.filter((_, i) => i !== index));
  };

  // Copy Full Schedule with Tehreek-e-Iman Branding
  const handleCopySchedule = async () => {
    let text = `مقام: ${selectedCity.nameUrdu} (${selectedCity.provinceUrdu})
`;
    text += `تاریخ: ${new Date().toLocaleDateString('ur-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

`;
    compiledList.forEach(p => {
      text += `• ${p.name}: ${to12(p.time)}
`;
    });

    await copyToClipboardWithTehreekLogo(text, {
      title: `اوقاتِ صلوٰۃ و سحر و افطار — ${selectedCity.nameUrdu}`,
      sourceBook: 'تحریکِ ایمان لائیو اوقاتِ صلوٰۃ و شرعی کیلنڈر',
      includeTimestamp: true,
    });

    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 2500);
  };

  // Share Schedule via Web Share API
  const handleShareSchedule = () => {
    let text = `❖ تحریکِ ایمان — اوقاتِ صلوٰۃ (${selectedCity.nameUrdu}) ❖

`;
    compiledList.forEach(p => {
      text += `${p.name}: ${to12(p.time)}
`;
    });
    text += `
سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی
https://tehreekeiman.com`;

    if (navigator.share) {
      navigator.share({
        title: `تحریکِ ایمان اوقاتِ صلوٰۃ — ${selectedCity.nameUrdu}`,
        text: text,
      }).catch(() => {});
    } else {
      handleCopySchedule();
    }
  };

  // Geolocation detector
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('آپ کے براؤزر میں جی پی ایس سپورٹ موجود نہیں۔');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        // Find closest city in PAKISTAN_CITIES
        let closest = PAKISTAN_CITIES[0];
        let minDist = Infinity;
        PAKISTAN_CITIES.forEach(c => {
          const d = Math.hypot(c.lat - latitude, c.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closest = c;
          }
        });
        setSelectedCity(closest);
      },
      err => {
        console.warn('Geolocation error:', err);
        alert('مقام حاصل کرنے کی اجازت عنایت فرمائیں۔');
      }
    );
  };

  // Modal Open & Speech
  const openModal = (key: string) => {
    setModalKey(key);
    if (stopModalSpeakingRef.current) {
      stopModalSpeakingRef.current();
      stopModalSpeakingRef.current = null;
      setIsSpeakingModal(false);
    }
  };

  const closeModal = () => {
    setModalKey(null);
    if (stopModalSpeakingRef.current) {
      stopModalSpeakingRef.current();
      stopModalSpeakingRef.current = null;
      setIsSpeakingModal(false);
    }
  };

  const handleToggleModalSpeech = (textToSpeak: string) => {
    if (isSpeakingModal) {
      if (stopModalSpeakingRef.current) {
        stopModalSpeakingRef.current();
        stopModalSpeakingRef.current = null;
      }
      setIsSpeakingModal(false);
      return;
    }

    const cancelFn = speakText(
      textToSpeak,
      () => setIsSpeakingModal(true),
      () => {
        setIsSpeakingModal(false);
        stopModalSpeakingRef.current = null;
      },
      () => {
        setIsSpeakingModal(false);
        stopModalSpeakingRef.current = null;
      }
    );
    stopModalSpeakingRef.current = cancelFn;
  };

  // Active modal data
  const currentModalData = modalKey ? (namazData as any)[modalKey] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn text-stone-900 dark:text-amber-50">
      
      {/* Audio element for Azan */}
      <audio
        ref={azanAudioRef}
        src="/azan.mp3"
        preload="auto"
        onEnded={() => setIsAzanPlaying(false)}
      />

      {/* Hero Header Banner */}
      <div className="hero-3d-royal rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-3 border-amber-400/80 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="btn-3d-gold inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-stone-950 font-nastaliq font-bold text-xs shadow-md cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4 rotate-180 text-stone-950" />
              <span>‹ واپس صفحۂ اول (ڈیش بورڈ)</span>
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {/* 3D Qibla Compass Trigger Button */}
            <button
              onClick={() => setIsQiblaOpen(true)}
              className="btn-3d-gold px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-black text-stone-950 flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
              title="3D قبلہ رخ کمپاس کھولیں"
            >
              <Compass className="w-4 h-4 text-stone-950 animate-pulse" />
              <span>🧭 قبلہ رخ کمپاس</span>
            </button>

            {/* Hijri Calendar & Sunnah Fasts Trigger Button */}
            <button
              onClick={() => setIsHijriCalendarOpen(true)}
              className="card-jewel-dark px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-bold text-amber-200 border border-amber-400/60 hover:border-amber-300 cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
              title="اسلامی ہجری تقویم و مسنون روزوں کی جنتری"
            >
              <Moon className="w-4 h-4 text-amber-400" />
              <span>📅 مسنون روزے و ہجری جنتری</span>
            </button>

            <button
              onClick={handleCopySchedule}
              className="card-jewel-dark px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold text-amber-200 border border-emerald-700/60 hover:border-amber-400 cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="آج کے اوقات کاپی کریں"
            >
              {copiedSchedule ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchedule ? 'کاپی ہو گیا' : 'مکمل نقشہ کاپی کریں'}</span>
            </button>

            <button
              onClick={handleShareSchedule}
              className="btn-3d-gold px-3 py-1.5 rounded-xl text-xs font-nastaliq font-black text-stone-950 flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="واٹس ایپ پر شیئر کریں"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>شیئر کریں</span>
            </button>

            <button
              onClick={playAzanAudio}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                isAzanPlaying
                  ? 'bg-amber-400 text-stone-950 animate-pulse ring-2 ring-amber-300'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-amber-400/60'
              }`}
              title="اذانِ پاک سنیں"
            >
              {isAzanPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span>{isAzanPlaying ? 'اذان روکیں' : '🔈 اذانِ پاک سنیں'}</span>
            </button>
          </div>
        </div>

        {/* Brand & Live Digital Clock Display */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pt-2 border-t border-emerald-800/60">
          <div className="flex items-center gap-4">
            <TehreekImanLogo size={68} className="shadow-2xl ring-4 ring-amber-400/80 shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-nastaliq text-amber-200 tracking-wide">
                تحریکِ ایمان — روزانہ نماز کے اوقات
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 font-nastaliq font-semibold mt-1">
                بانی و سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی مدظلہ العالی
              </p>
            </div>
          </div>

          {/* Live PST Clock & Countdown Box */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none p-3 rounded-2xl bg-black/50 border border-amber-400/50 text-center shadow-inner">
              <div className="text-[10px] text-emerald-300 font-nastaliq font-bold flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>پاکستان معیاری وقت (PST):</span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-black text-amber-300 tracking-wider mt-0.5">
                {currentTimeStr || '--:--:--'}
              </div>
            </div>

            <div className="flex-1 md:flex-none p-3 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border-2 border-amber-400 text-center shadow-lg">
              <div className="text-[10px] text-amber-300 font-nastaliq font-black flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                <span>{nextPrayerLabel}:</span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-black text-amber-400 tracking-wider mt-0.5">
                {countdownStr}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* City Selector & Controls Card */}
      <div className="board-jewel-emerald rounded-3xl p-5 border-2 border-emerald-700/70 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-sm font-black font-nastaliq text-amber-300">
              اپنا شہر منتخب فرمائیں (پاکستان کے تمام بڑے شہر):
            </span>
          </div>

          <button
            onClick={handleUseGPS}
            className="btn-3d-emerald px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-bold text-amber-200 flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="خودکار طور پر قریب ترین شہر منتخب کریں"
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>📍 خودکار مقام (GPS لوکیشن)</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
          {PAKISTAN_CITIES.map(c => {
            const isSelected = selectedCity.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c)}
                className={`p-2.5 rounded-xl text-xs font-nastaliq font-bold transition-all cursor-pointer text-center border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black border-amber-300 shadow-md scale-105 ring-2 ring-amber-400/40'
                    : 'card-jewel-dark text-amber-100 hover:border-amber-400/70 border-emerald-800/80'
                }`}
              >
                <div className="text-xs sm:text-sm font-black">{c.nameUrdu}</div>
                <div className="text-[9px] opacity-80">{c.provinceUrdu}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Time Adder ("اپنا ٹائم شامل کریں") */}
      <div className="card-jewel-dark rounded-3xl p-4 sm:p-5 border-2 border-emerald-700/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-nastaliq font-bold text-amber-300">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>اپنا ذاتی یا مدرسے کا ٹائم شامل کریں (مثلاً: درسِ قرآن، تہجد جماعت):</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="نام (مثلاً: درسِ حدیث)"
            className="px-3 py-1.5 rounded-xl bg-stone-950 border border-emerald-700 text-amber-100 text-xs font-nastaliq focus:outline-none focus:border-amber-400"
          />
          <input
            type="time"
            value={customTime}
            onChange={e => setCustomTime(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-950 border border-emerald-700 text-amber-100 text-xs focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={addCustomTime}
            className="btn-3d-gold px-4 py-1.5 rounded-xl text-stone-950 font-black font-nastaliq text-xs shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            <span>شامل کریں</span>
          </button>
        </div>
      </div>

      {/* Main 14 Prayers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {compiledList.map((p, idx) => {
          const namazKey = (namazKeyMap as any)[p.name];
          const isAlarmActive = alarms[p.name];
          const isSunnahAmal = ['سحری', 'افطاری', 'اشراق', 'چاشت', 'اوابین', 'تہجد'].includes(p.name);
          const isAstronomical = ['طلوع آفتاب', 'غروب آفتاب', 'زوال'].includes(p.name);

          return (
            <div
              key={idx}
              className={`p-4 rounded-3xl border-2 transition-all shadow-md flex flex-col justify-between gap-3 ${
                p.custom
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-100'
                  : isAstronomical
                  ? 'bg-[#031e17] border-emerald-700/60'
                  : isSunnahAmal
                  ? 'card-jewel-dark border-teal-600/70 hover:border-amber-400'
                  : 'board-jewel-emerald border-emerald-600/80 hover:border-amber-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button
                    onClick={() => namazKey && openModal(namazKey)}
                    className={`font-black font-nastaliq text-right transition-colors ${
                      namazKey
                        ? 'text-amber-300 hover:text-amber-200 cursor-pointer underline decoration-amber-400/50 hover:decoration-amber-300 text-base sm:text-lg'
                        : 'text-emerald-100 text-base'
                    }`}
                    title={namazKey ? 'نماز کا مکمل طریقہ و رکعات دیکھنے کے لیے کلک کریں' : ''}
                  >
                    {p.name}
                  </button>

                  <div className="text-[10px] text-emerald-300/80 font-nastaliq">
                    {p.custom
                      ? 'ذاتی وقت'
                      : isSunnahAmal
                      ? 'سنت و نوافل'
                      : isAstronomical
                      ? 'اوقاتِ فلکیات'
                      : 'فرض نماز'}
                  </div>
                </div>

                {p.custom ? (
                  <button
                    onClick={() => removeCustomTime(idx - 14)}
                    className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                    title="حذف کریں"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  namazKey && (
                    <button
                      onClick={() => openModal(namazKey)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-950/80 text-amber-300 border border-emerald-700 hover:border-amber-400 font-nastaliq cursor-pointer"
                    >
                      طریقہ 👁️
                    </button>
                  )
                )}
              </div>

              {/* Time Display */}
              <div className="flex items-baseline justify-between border-t border-emerald-800/60 pt-2">
                <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 tracking-wide">
                  {to12(p.time)}
                </div>

                {/* Alarm & Azan buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleAlarm(p.name)}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                      isAlarmActive
                        ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-sm'
                        : 'bg-emerald-950/80 text-stone-300 hover:text-amber-200 border-emerald-800'
                    }`}
                    title={isAlarmActive ? 'الارم فعال ہے' : 'الارم لگائیں'}
                  >
                    {isAlarmActive ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  </button>

                  {['فجر', 'ظہر', 'عصر', 'مغرب', 'عشاء'].includes(p.name) && (
                    <button
                      onClick={playAzanAudio}
                      className="px-2 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 border border-emerald-700 text-[10px] font-nastaliq font-bold cursor-pointer"
                      title="اذان سنیں"
                    >
                      اذان 🔈
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dedicated Janaza Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border-3 border-amber-400 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
            🕌
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black font-nastaliq text-amber-300">
              نمازِ جنازہ کا مکمل طریقہ مع دعائیں و فرائض
            </h3>
            <p className="text-xs text-emerald-200 font-nastaliq font-medium">
              چاروں تکبیرات، ثناء، درود شریف، اور بالغ و نابالغ (لڑکے اور لڑکی) کی مسنون دعائیں
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal('janaza')}
          className="btn-3d-gold px-5 py-2.5 rounded-2xl text-stone-950 font-black font-nastaliq text-xs sm:text-sm shadow-md cursor-pointer shrink-0"
        >
          <span>🕌 نمازِ جنازہ کا طریقہ کھولیں</span>
        </button>
      </div>

      {/* Interactive Namaz / Amal Method Modal */}
      {modalKey && currentModalData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn no-print">
          <div
            className="modal-contrast-card rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-amber-50"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border-b-2 border-amber-400/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <TehreekImanLogo size={46} className="shadow-md ring-2 ring-amber-400/60 shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black font-nastaliq text-amber-200">
                    {currentModalData.title}
                  </h3>
                  <p className="text-xs text-emerald-200 font-nastaliq">
                    تحریکِ ایمان مسنون طریقہ و تفصیلی رہنمائی
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio TTS Speech Button */}
                <button
                  onClick={() => {
                    const chunks: string[] = [`${currentModalData.title}۔`];
                    if (currentModalData.fazeelat?.urdu) {
                      chunks.push(`فضیلت: ${currentModalData.fazeelat.urdu}`);
                    }
                    if (currentModalData.rakats) {
                      currentModalData.rakats.forEach((r: any) => {
                        chunks.push(`${r.label}، ${r.count}۔`);
                      });
                    }
                    if (currentModalData.steps) {
                      currentModalData.steps.forEach((s: string, i: number) => {
                        chunks.push(`مرحلہ ${i + 1}: ${s}۔`);
                      });
                    }
                    handleToggleModalSpeech(chunks.join(' '));
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold transition-all cursor-pointer ${
                    isSpeakingModal
                      ? 'bg-amber-400 text-stone-950 font-black animate-pulse shadow-md'
                      : 'bg-emerald-900 text-amber-200 hover:bg-emerald-800 border border-emerald-700'
                  }`}
                  title="طریقہ با آواز سنیں"
                >
                  {isSpeakingModal ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  <span>{isSpeakingModal ? 'روکیں' : 'سنیں 🔊'}</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-amber-200 hover:text-white cursor-pointer"
                  title="بند کریں"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#041a13]">
              
              {/* If Namaz has Rak'ats */}
              {currentModalData.rakats && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black font-nastaliq text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>رکعات کی تفصیل و احکام:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentModalData.rakats.map((r: any, rIdx: number) => (
                      <div
                        key={rIdx}
                        className="p-3.5 rounded-2xl bg-[#01140e] border border-emerald-800/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black font-nastaliq text-amber-200">
                            {r.label}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 text-amber-300 border border-amber-400/50 text-xs font-mono font-bold">
                            {r.count}
                          </span>
                        </div>
                        <p className="text-xs font-nastaliq text-emerald-200/90 leading-relaxed">
                          {r.note}
                        </p>

                        {/* Hadith reference if present */}
                        {r.hadith && (
                          <div className="pt-2 border-t border-emerald-900/60 text-[11px] font-nastaliq text-emerald-300">
                            {r.hadith.arabic && (
                              <p className="font-amiri text-xs text-amber-300/90 leading-relaxed pb-1">
                                «{r.hadith.arabic}»
                              </p>
                            )}
                            {r.hadith.urdu && (
                              <p className="text-emerald-100/90 pb-1">ترجمہ: {r.hadith.urdu}</p>
                            )}
                            {r.hadith.ref && (
                              <p className="text-amber-400/80 text-[10px]">📖 حوالہ: {r.hadith.ref}</p>
                            )}
                            {r.hadith.fiqhNote && (
                              <p className="text-emerald-200/80 text-[10px]">{r.hadith.fiqhNote}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps / Method */}
              {currentModalData.steps && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black font-nastaliq text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>مکمل طریقہ کار:</span>
                  </h4>

                  <ol className="space-y-2.5">
                    {currentModalData.steps.map((step: string, sIdx: number) => (
                      <li
                        key={sIdx}
                        className="p-3.5 rounded-2xl bg-[#021f16] border border-emerald-800 text-xs sm:text-sm font-nastaliq text-emerald-50 leading-[2.3] flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <div className="text-justify flex-1 whitespace-pre-line">{step}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Virtues / Fazeelat */}
              {currentModalData.fazeelat && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-400/40 space-y-2">
                  <h4 className="text-xs font-black font-nastaliq text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>فضیلت و احادیثِ مبارکہ:</span>
                  </h4>
                  {currentModalData.fazeelat.arabic && (
                    <p className="font-amiri text-sm sm:text-base text-amber-200 leading-loose">
                      «{currentModalData.fazeelat.arabic}»
                    </p>
                  )}
                  {currentModalData.fazeelat.urdu && (
                    <p className="text-xs font-nastaliq text-emerald-100 leading-relaxed">
                      ترجمہ: {currentModalData.fazeelat.urdu}
                    </p>
                  )}
                  {currentModalData.fazeelat.ref && (
                    <p className="text-[10px] text-amber-400 font-nastaliq">
                      📖 حوالہ: {currentModalData.fazeelat.ref}
                    </p>
                  )}
                </div>
              )}

              {/* Dua if present */}
              {currentModalData.dua && (
                <div className="p-4 rounded-2xl bg-[#011710] border border-emerald-700 space-y-2">
                  <h4 className="text-xs font-black font-nastaliq text-amber-300">
                    مسنون دعا:
                  </h4>
                  {currentModalData.dua.arabic && (
                    <p className="font-amiri text-base text-amber-300 leading-loose">
                      «{currentModalData.dua.arabic}»
                    </p>
                  )}
                  {currentModalData.dua.urdu && (
                    <p className="text-xs font-nastaliq text-emerald-100 leading-relaxed">
                      ترجمہ: {currentModalData.dua.urdu}
                    </p>
                  )}
                </div>
              )}

              {/* Verified Attribution Line */}
              <div className="p-3 rounded-xl bg-black/40 border border-emerald-800/80 flex items-center justify-between text-[11px] font-nastaliq text-emerald-300/90">
                <span>✓ تمام احادیث و فقہی مسائل کتبِ صحاح و فقہِ حنفی سے مصدقہ ہیں۔</span>
                <span className="text-amber-300 font-bold">تحریکِ ایمان</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3D Qibla Compass Modal */}
      <QiblaCompassModal
        isOpen={isQiblaOpen}
        onClose={() => setIsQiblaOpen(false)}
        initialCity={selectedCity.id}
      />

      {/* Hijri Calendar & Sunnah Fasting Days Modal */}
      <HijriCalendarModal
        isOpen={isHijriCalendarOpen}
        onClose={() => setIsHijriCalendarOpen(false)}
      />

    </div>
  );
};
