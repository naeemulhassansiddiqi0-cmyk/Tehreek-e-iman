/**
 * Global defensive name resolver for Tehreek-e-Iman
 * Prevents any runtime "Cannot read properties of undefined (reading 'name')" crashes.
 */
export function safeName(obj: any, fallback = 'نامعلوم'): string {
  if (!obj) return fallback;
  if (typeof obj === 'string') return obj;
  return (
    obj.name ||
    obj.fullName ||
    obj.nameArabic ||
    obj.nameUrdu ||
    obj.title ||
    obj.title_ur ||
    obj.title_ar ||
    obj.urduName ||
    fallback
  );
}

export function safeRank(obj: any, fallback = 'راوٍ من رواة الإسناد'): string {
  if (!obj) return fallback;
  if (typeof obj === 'string') return obj;
  return obj.rank || obj.tabaqah || fallback;
}

export function safeString(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  return String(val);
}
