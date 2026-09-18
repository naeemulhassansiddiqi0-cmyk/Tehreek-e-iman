import React, { useState, useEffect } from 'react';
import { Compass, MapPin, X, Navigation, CheckCircle2, RotateCw } from 'lucide-react';
import { PAKISTAN_CITIES } from '../../data/prayerTimesData';

interface QiblaCompassModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCity?: string;
}

// Coordinates for Holy Kaaba in Makkah al-Mukarramah
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

// Great-circle bearing calculation
function calculateQiblaBearing(lat: number, lng: number): number {
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (KAABA_LAT * Math.PI) / 180;
  const deltaLambda = ((KAABA_LNG - lng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
  let qibla = Math.atan2(y, x) * (180 / Math.PI);
  qibla = (qibla + 360) % 360;
  return qibla;
}

// Great-circle distance calculation (Haversine Formula in KM)
function calculateDistanceToMakkah(lat: number, lng: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const QiblaCompassModal: React.FC<QiblaCompassModalProps> = ({
  isOpen,
  onClose,
  initialCity = 'Karachi',
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>(initialCity);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 24.8607,
    lng: 67.0011,
  });
  const [heading, setHeading] = useState<number>(0);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [isAligned, setIsAligned] = useState<boolean>(false);

  // Sync selected city coordinates
  useEffect(() => {
    const city = PAKISTAN_CITIES.find(c => c.id === selectedCityId || c.nameEn === selectedCityId);
    if (city) {
      setCurrentCoords({ lat: city.lat, lng: city.lng });
    }
  }, [selectedCityId]);

  // Qibla bearing from current coordinates
  const qiblaBearing = calculateQiblaBearing(currentCoords.lat, currentCoords.lng);
  const distanceToMakkah = calculateDistanceToMakkah(currentCoords.lat, currentCoords.lng);

  // Difference between current phone heading and Qibla bearing
  // The needle should point towards (qiblaBearing - heading)
  const relativeAngle = (qiblaBearing - heading + 360) % 360;

  // Check alignment (+- 4 degrees)
  useEffect(() => {
    const diff = Math.abs((relativeAngle > 180 ? 360 - relativeAngle : relativeAngle));
    const aligned = diff <= 4;
    setIsAligned(aligned);
    if (aligned && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch {
        // ignore
      }
    }
  }, [relativeAngle]);

  // Request & attach device orientation
  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOrientation = (e: any) => {
      let compHeading: number | null = null;
      if (typeof e.webkitCompassHeading !== 'undefined') {
        // iOS Safari
        compHeading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android / standard (alpha is 0-360 deg relative to magnetic north when absolute is true)
        compHeading = 360 - e.alpha;
      }

      if (compHeading !== null && !isNaN(compHeading)) {
        setHeading(Math.round(compHeading));
        setHasCompassSensor(true);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [isOpen]);

  // Manual GPS location trigger
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('آپ کے براؤزر میں جی پی ایس سپورٹ دستیاب نہیں ہے۔');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setSelectedCityId('gps');
      },
      () => {
        setGpsLoading(false);
        alert('جی پی ایس لوکیشن حاصل نہ ہو سکی۔ براہِ کرم لوکیشن کی اجازت دیں۔');
      },
      { timeout: 10000 }
    );
  };

  // Request iOS permission if needed
  const requestIosSensor = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doe = (window as any).DeviceOrientationEvent;
    if (doe && typeof doe.requestPermission === 'function') {
      doe.requestPermission()
        .then((resp: string) => {
          if (resp === 'granted') {
            setHasCompassSensor(true);
          }
        })
        .catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#01140e]/85 backdrop-blur-md animate-fadeIn">
      <div className="modal-contrast-card rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl text-amber-50 space-y-5 border-2 border-amber-400/60 relative overflow-hidden">
        
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-800/60 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-950 text-amber-300 border-2 border-amber-400/60 flex items-center justify-center shadow-lg">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-nastaliq font-black text-2xl text-amber-300">
                3D قبلہ رخ کمپاس
              </h2>
              <p className="text-xs font-nastaliq text-emerald-200 font-bold">
                عین سمتِ قبلہ (کعبہ شریف) مع لائیو اینیمیشن و ڈگری
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-700/60 transition-all cursor-pointer"
            aria-label="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City and GPS Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-black/40 p-3 rounded-2xl border border-emerald-800/60 relative z-10">
          <div className="flex-1 w-full flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedCityId}
              onChange={e => setSelectedCityId(e.target.value)}
              className="w-full bg-emerald-950/80 text-amber-100 text-sm font-nastaliq font-bold rounded-xl px-3 py-2 border border-emerald-700/70 focus:outline-none focus:border-amber-400"
            >
              {PAKISTAN_CITIES.map(c => (
                <option key={c.id} value={c.id} className="bg-stone-900 text-white">
                  {c.nameUrdu} ({c.nameEn})
                </option>
              ))}
              {selectedCityId === 'gps' && (
                <option value="gps" className="bg-stone-900 text-amber-300">
                  📍 موجودہ لوکیشن (GPS)
                </option>
              )}
            </select>
          </div>

          <button
            onClick={handleDetectGps}
            disabled={gpsLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-amber-200 text-xs font-nastaliq font-bold border border-amber-400/40 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsLoading ? 'تلاش جاری...' : 'میرا GPS'}</span>
          </button>
        </div>

        {/* Compass Visual Display */}
        <div className="relative flex flex-col items-center justify-center py-4 relative z-10">
          
          {/* Outer Bezel (Rotates with heading if sensor available) */}
          <div 
            className="w-64 h-64 sm:w-72 sm:h-72 rounded-full relative flex items-center justify-center p-2 shadow-[0_15px_45px_rgba(0,0,0,0.8)] border-4 border-amber-400/70 bg-gradient-to-br from-[#06241a] via-[#03130d] to-[#010805] transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            {/* Degree Ticks Ring */}
            <div className="absolute inset-2 rounded-full border border-emerald-500/20 pointer-events-none" />
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-amber-400/20 pointer-events-none" />

            {/* Cardinal Points */}
            <span className="absolute top-2 font-black font-amiri text-sm sm:text-base text-rose-400">
              N (شمال)
            </span>
            <span className="absolute bottom-2 font-black font-amiri text-xs sm:text-sm text-emerald-300">
              S (جنوب)
            </span>
            <span className="absolute right-3 font-black font-amiri text-xs sm:text-sm text-emerald-300">
              E (مشرق)
            </span>
            <span className="absolute left-3 font-black font-amiri text-xs sm:text-sm text-emerald-300">
              W (مغرب)
            </span>

            {/* Qibla Direction Marker on Outer Ring */}
            <div
              className="absolute inset-0 flex items-start justify-center pointer-events-none transition-transform duration-300"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              <div className="flex flex-col items-center -translate-y-3">
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 text-[10px] font-black font-nastaliq shadow-md">
                  🕋 کعبہ
                </span>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400" />
              </div>
            </div>

            {/* Center Dial Needle (Qibla Pointer) */}
            <div
              className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              {/* Golden Kaaba Needle Arrow */}
              <div className="w-2.5 sm:w-3 h-28 sm:h-32 bg-gradient-to-t from-transparent via-amber-400 to-amber-200 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] -translate-y-14 flex items-start justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 -translate-y-2 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg border-2 border-stone-950">
                  <span className="text-[10px]">🕋</span>
                </div>
              </div>
            </div>

            {/* Pivot Center Emblem */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-950 via-black to-emerald-950 border-2 border-amber-400 flex flex-col items-center justify-center shadow-xl z-20">
              <span className="text-amber-300 font-black font-mono text-xs sm:text-sm">
                {Math.round(qiblaBearing)}°
              </span>
              <span className="text-[9px] text-emerald-300 font-nastaliq">قبلہ</span>
            </div>
          </div>

          {/* Alignment Status Banner */}
          <div className="mt-5 w-full">
            {isAligned ? (
              <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-emerald-800 to-emerald-900/90 text-amber-200 border-2 border-amber-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-nastaliq font-black">
                  ماشاء اللہ! آپ کا رخ عین قبلہ شریف کی طرف ہے!
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-emerald-800/60 text-emerald-100 text-xs font-nastaliq font-bold">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-4 h-4 text-amber-400 animate-spin" />
                  موبائل کو گھمائیں تاکہ سوئی 🕋 کعبہ پر سیدھی ہو جائے۔
                </span>
                <span className="text-amber-300 font-mono font-bold text-sm">
                  {Math.round(relativeAngle)}°
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Informational Cards (Distance, Degrees, Coordinates) */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="p-3 rounded-2xl bg-black/40 border border-emerald-800/60 text-center">
            <span className="text-[11px] text-emerald-300 font-nastaliq block">
              زاویۂ قبلہ (Qibla Angle)
            </span>
            <span className="text-xl font-mono font-black text-amber-300">
              {qiblaBearing.toFixed(1)}°
            </span>
            <span className="text-[10px] text-stone-300 block font-nastaliq">
              شمال سے گھڑی کی سمت
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-emerald-800/60 text-center">
            <span className="text-[11px] text-emerald-300 font-nastaliq block">
              مکہ مکرمہ سے فاصلہ
            </span>
            <span className="text-xl font-mono font-black text-amber-300">
              {distanceToMakkah.toLocaleString('ur-PK')} کلومیٹر
            </span>
            <span className="text-[10px] text-stone-300 block font-nastaliq">
              براہِ راست فاصلہ (ہوائی)
            </span>
          </div>
        </div>

        {/* Compass Sensor Support Prompt for iOS */}
        {!hasCompassSensor && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs font-nastaliq text-center relative z-10">
            <span>اگر آپ اسمارٹ فون پر ہیں تو قبلہ رخ لائیو جاننے کے لیے سینسر فعال فرمائیں: </span>
            <button
              onClick={requestIosSensor}
              className="inline-block mt-1 underline font-black text-amber-300 cursor-pointer"
            >
              [سینسر فعال کرنے کی اجازت دیں]
            </button>
          </div>
        )}

        {/* Footer attribution */}
        <div className="flex items-center justify-between pt-2 border-t border-emerald-800/40 text-[11px] text-emerald-300/80 font-nastaliq">
          <span>تحریکِ ایمان • شعبہ فلکیات و مواقیت</span>
          <span>سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی</span>
        </div>

      </div>
    </div>
  );
};
