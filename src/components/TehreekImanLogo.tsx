import React from 'react';

interface TehreekImanLogoProps {
  className?: string;
  size?: number;
  customImgSrc?: string;
}

export const TehreekImanLogo: React.FC<TehreekImanLogoProps> = ({
  className = '',
  size = 62,
  customImgSrc = '/tehreek-iman-logo.jpg',
}) => {
  const [imgError, setImgError] = React.useState(false);

  // If image is available and didn't error, display the official medallion
  if (customImgSrc && !imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-md ring-2 ring-emerald-800/40 hover:scale-105 transition-transform duration-200 ${className}`}
      >
        <img
          src={customImgSrc}
          alt="تحریکِ ایمان - حضرت مولانا محمد نعیم الحسن صدیقی"
          className="w-full h-full rounded-full object-cover border border-emerald-950/30"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback vector SVG emblem if image fails to load
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center shrink-0 rounded-full bg-gradient-to-tr from-emerald-950 via-emerald-850 to-emerald-700 border-2 border-amber-400 shadow-lg select-none group hover:scale-105 transition-transform duration-200 ${className}`}
      title="تحریکِ ایمان | حضرت مولانا محمد نعیم الحسن صدیقی"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="46" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="3 2" />
        <circle cx="50" cy="50" r="42" stroke="#f59e0b" strokeWidth="1.5" />
        <path
          d="M50 14 C40 26 30 36 30 52 C30 68 40 76 50 76 C60 76 70 68 70 52 C70 36 60 26 50 14 Z"
          fill="#065f46"
          stroke="#fcd34d"
          strokeWidth="1.5"
        />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          fill="#fef08a"
          fontSize="13"
          fontWeight="bold"
          fontFamily="'Amiri', serif"
        >
          تحریک ایمان
        </text>
        <text
          x="50"
          y="70"
          textAnchor="middle"
          fill="#fde68a"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="'Jameel Noori Nastaleeq', 'Jameel Noori Nastaliq', serif"
        >
          نعیم الحسن
        </text>
      </svg>
    </div>
  );
};
