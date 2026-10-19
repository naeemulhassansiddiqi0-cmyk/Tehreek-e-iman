import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { usePortalTheme } from '../context/ThemeContext';
import { usePortalLanguage } from '../context/LanguageContext';

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  compact = false,
}) => {
  const { isDark, toggleTheme } = usePortalTheme();
  const { language } = usePortalLanguage();

  const titleUrdu = isDark ? 'دن کا مطالعہ (لائٹ موڈ)' : 'رات کا مطالعہ (ڈارک موڈ)';
  const titleArabic = isDark ? 'الوضع النهاري (فاتح)' : 'الوضع الليلي (داكن)';
  const titleEnglish = isDark ? 'Light Mode' : 'Dark Mode';

  const title = language === 'en' ? titleEnglish : language === 'ar' ? titleArabic : titleUrdu;

  const labelUrdu = isDark ? 'لائٹ' : 'ڈارک';
  const labelArabic = isDark ? 'فاتح' : 'داكن';
  const labelEnglish = isDark ? 'Light' : 'Dark';

  const label = language === 'en' ? labelEnglish : language === 'ar' ? labelArabic : labelUrdu;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex items-center gap-1.5 transition-all duration-300 cursor-pointer select-none active:scale-95 ${
        compact 
          ? 'p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-amber-300 hover:border-amber-400' 
          : 'px-2.5 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/90 hover:bg-stone-200/70 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-2xs hover:shadow-xs'
      } ${className}`}
      title={title}
      aria-label={title}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow transition-transform group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-emerald-800 transition-transform group-hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className={`text-xs font-bold leading-none ${
          language === 'en' ? 'font-sans' : language === 'ar' ? 'font-arabic' : 'font-nastaliq'
        } ${isDark ? 'text-amber-300' : 'text-stone-800'}`}>
          {label}
        </span>
      )}
    </button>
  );
};
