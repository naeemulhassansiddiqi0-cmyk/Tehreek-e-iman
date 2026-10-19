// Tehreek-e-Iman Internationalization Service (Phase 6)
// Provides complete translations in Urdu, Arabic, and English.
// Preserves Jameel Noori Nastaleeq for Urdu, Amiri/Naskh for Arabic, and Clean Sans for English.

export type PortalLanguage = 'ur' | 'ar' | 'en';

export interface LanguageInfo {
  code: PortalLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'rtl' | 'ltr';
  fontFamilyClass: string;
}

export const PORTAL_LANGUAGES: LanguageInfo[] = [
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    direction: 'rtl',
    fontFamilyClass: 'font-nastaliq',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    fontFamilyClass: 'font-arabic',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    direction: 'ltr',
    fontFamilyClass: 'font-sans',
  },
];

export const TRANSLATIONS: Record<PortalLanguage, Record<string, string>> = {
  ur: {
    // Brand
    brand_title: 'تحریکِ ایمان',
    brand_subtitle: 'جامع اسلامی پورٹل، مکتبہ درسِ نظامی و امتحانی مرکز',
    brand_patron_label: 'بانی و سرپرست:',
    brand_patron_name: 'حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ',
    brand_patron_short: 'حضرت مولانا محمد نعیم الحسن صدیقی',

    // Nav Tabs
    nav_dashboard: 'کتب خانہ (147 کتب)',
    nav_reader: 'مطالعۂ کتب',
    nav_ai_tutor: 'مرکزِ افتاء و مفتی AI',
    nav_exams: 'امتحانی مرکز',
    nav_ahkam_shariat: 'احکامِ شریعت',
    nav_islah_aamal: 'اصلاحِ اعمال',
    nav_prayer_times: 'اوقاتِ نماز',
    nav_flashcards: 'حفظِ متون',
    nav_notes: 'شخصی حواشی',
    nav_more: 'مزید ▾',

    // Audio
    audio_quran: 'تلاوتِ قرآن',
    audio_naat: 'حمد و نعت',

    // Search
    search_placeholder: '147 کتب، احادیث، تفاسیر، فقہ و حواشی میں تلاش فرمائیں...',
    search_category_all: 'تمام کتب (147)',
    search_category_hadith: 'حدیث شریف',
    search_category_tafseer: 'القرآن والتفاسیر',
    search_category_fiqh: 'فقہ و فتاویٰ',
    search_category_aqeedah: 'عقائد و کلام',

    // Reader UI
    reader_focus_mode: 'پر سکون مطالعہ موڈ',
    reader_focus_exit: 'عام منظر پر واپس',
    reader_font_size: 'خط کا سائز',
    reader_font_zoom_in: 'بڑا کریں (A+)',
    reader_font_zoom_out: 'چھوٹا کریں (A-)',
    reader_font_reset: 'اصل سائز (100%)',
    reader_typography_panel: 'خط و کتابت کا کنٹرول پینل',
    reader_arabic_font: 'عربی متن (متنِ حدیث)',
    reader_urdu_font: 'اردو ترجمہ و تشریح',
    reader_line_spacing: 'سطور میں کشادگی',
    reader_presets: 'تیار کردہ سائز',
    reader_preset_small: 'چھوٹا خط',
    reader_preset_standard: 'معیاری (اصل)',
    reader_preset_large: 'بڑا خط',
    reader_preset_xlarge: 'جلی خط',
    reader_tashkeel_on: 'مع اعراب',
    reader_tashkeel_off: 'بغیر اعراب (مشق)',
    reader_copy_ref: 'حوالے کے ساتھ نقل کریں',
    reader_copied: 'کاپی ہو گیا!',
    reader_bookmark: 'بک مارک',
    reader_bookmarked: 'محفوظ ہے',
    reader_notes: 'درسی نوٹ',
    reader_notes_close: 'نوٹ بند کریں',
    reader_save_note: 'نوٹ محفوظ کریں',
    reader_word_by_word: 'لفظ بہ لفظ ترجمہ',
    reader_word_by_word_hide: 'لفظی گرڈ چھپائیں',
    reader_next_page: 'اگلا صفحہ',
    reader_prev_page: 'پچھلا صفحہ',
    reader_page_label: 'صفحہ',
    reader_hadith_label: 'حدیث شریف نمبر',
    reader_sanad_label: 'سندِ حدیث شریف (سلسلۂ اسناد)',
    reader_matn_label: 'متنِ حدیث مبارک (کلامِ نبوی ﷺ)',
    reader_translation_label: 'سلیس و با محاورہ اردو ترجمہ:',
    reader_tashreeh_label: 'درسی تشریح و فقہی مذاہب',
    reader_fiqh_label: 'مقارنہ بین المذاہب (فقہی مذاہبِ اربعہ)',
    reader_takeaway_label: 'روزمرہ زندگی کا سبق (عملی تربیت)',
    reader_takhreej_label: 'تخریج و حوالہ جات (Cross-References)',
    reader_click_narrator_tip: '💡 راوی کے نام پر کلک کر کے جرح و تعدیل دیکھیں',
    reader_click_word_tip: '💡 ہر عربی لفظ پر کلک کر کے صرف و نحو دیکھیں',
    reader_toc: 'فہرستِ ابواب و کتب',

    // Footer
    footer_text: 'ایک بابرکت اور باوقار علمی کاوش برائے طلبہ، اساتذہ و محققینِ عظام',
    footer_rights: '© 1448ھ / 2026ء — تحریکِ ایمان پورٹل (Tehreek-e-Iman)',
    footer_arabic_title: 'تَحْرِيكِ إِيمَان — مَنَصَّةُ المَدَارِسِ الإِسْلَامِيَّة',
  },

  ar: {
    // Brand
    brand_title: 'تحريك إيمان',
    brand_subtitle: 'البوابة الإسلامية الشاملة والمكتبة العلمية الرقمية',
    brand_patron_label: 'المشرف العام:',
    brand_patron_name: 'فضيلة الشيخ مولانا محمد نعيم الحسن الصديقي دامت بركاته',
    brand_patron_short: 'الشيخ محمد نعيم الحسن الصديقي',

    // Nav Tabs
    nav_dashboard: 'المكتبة (147 كتاباً)',
    nav_reader: 'قراءة الكتب',
    nav_ai_tutor: 'دار الإفتاء الذكي',
    nav_exams: 'مركز الامتحانات',
    nav_ahkam_shariat: 'أحكام الشريعة',
    nav_islah_aamal: 'إصلاح الأعمال',
    nav_prayer_times: 'مواقيت الصلاة',
    nav_flashcards: 'حفظ المتون',
    nav_notes: 'الملاحظات الشخصية',
    nav_more: 'المزيد ▾',

    // Audio
    audio_quran: 'تلاوة القرآن',
    audio_naat: 'المدائح النبوية',

    // Search
    search_placeholder: 'ابحث في 147 كتاباً، الحديث، التفسير، الفقه والحواشي...',
    search_category_all: 'جميع الكتب (147)',
    search_category_hadith: 'الحديث الشريف',
    search_category_tafseer: 'القرآن والتفاسير',
    search_category_fiqh: 'الفقه والفتاوى',
    search_category_aqeedah: 'العقيدة والكلام',

    // Reader UI
    reader_focus_mode: 'وضع القراءة الهادئ',
    reader_focus_exit: 'الرجوع للوضع العادي',
    reader_font_size: 'حجم الخط',
    reader_font_zoom_in: 'تكبير (A+)',
    reader_font_zoom_out: 'تصغير (A-)',
    reader_font_reset: 'الوضع الأصلي (100%)',
    reader_typography_panel: 'لوحة التحكم في الخطوط والطباعة',
    reader_arabic_font: 'النص العربي (المتن)',
    reader_urdu_font: 'الترجمة والشرح',
    reader_line_spacing: 'تباعد الأسطر',
    reader_presets: 'أحجام جاهزة',
    reader_preset_small: 'خط صغير',
    reader_preset_standard: 'خط قياسي',
    reader_preset_large: 'خط كبير',
    reader_preset_xlarge: 'خط جلي',
    reader_tashkeel_on: 'بالتشكيل الكامل',
    reader_tashkeel_off: 'بدون تشكيل (للتدريب)',
    reader_copy_ref: 'نسخ مع التخريج والإحالة',
    reader_copied: 'تم النسخ بنجاح!',
    reader_bookmark: 'إشارة مرجعية',
    reader_bookmarked: 'محفوظ',
    reader_notes: 'ملاحظة دراسية',
    reader_notes_close: 'إغلاق الملاحظة',
    reader_save_note: 'حفظ الملاحظة',
    reader_word_by_word: 'ترجمة كلمة بكلمة',
    reader_word_by_word_hide: 'إخفاء الشبكة اللفظية',
    reader_next_page: 'الصفحة التالية',
    reader_prev_page: 'الصفحة السابقة',
    reader_page_label: 'صفحة',
    reader_hadith_label: 'حديث رقم',
    reader_sanad_label: 'سند الحديث الشريف (سلسلة الرواة)',
    reader_matn_label: 'متن الحديث الشريف (كلام النبوة ﷺ)',
    reader_translation_label: 'الترجمة الأردية السلسة:',
    reader_tashreeh_label: 'الشرح الدراسي والمذاهب الفقهية',
    reader_fiqh_label: 'المقارنة بين المذاهب الأربعة',
    reader_takeaway_label: 'دروس عملية للحياة اليومية (تزكية النفس)',
    reader_takhreej_label: 'التخريج والشواهد والمراجع',
    reader_click_narrator_tip: '💡 اضغط على اسم الراوي لعرض الجرح والتعديل',
    reader_click_word_tip: '💡 اضغط على أي كلمة عربية لعرض الصرف والنحو',
    reader_toc: 'فهرس الأبواب والكتب',

    // Footer
    footer_text: 'جهد علمي مبارك ومتقن لخدمة طلبة العلم والعلماء والباحثين',
    footer_rights: '© 1448هـ / 2026م — منصة تحريك إيمان الرقمية',
    footer_arabic_title: 'تَحْرِيكِ إِيمَان — مَنَصَّةُ المَدَارِسِ الإِسْلَامِيَّة',
  },

  en: {
    // Brand
    brand_title: 'Tehreek-e-Iman',
    brand_subtitle: 'Comprehensive Islamic Digital Portal & Dars-e-Nizami Library',
    brand_patron_label: 'Patron & Founder:',
    brand_patron_name: 'Hazrat Maulana Muhammad Naeem ul Hassan Siddiqi (May Allah preserve him)',
    brand_patron_short: 'Maulana Naeem ul Hassan Siddiqi',

    // Nav Tabs
    nav_dashboard: 'Library (147 Books)',
    nav_reader: 'Book Reader',
    nav_ai_tutor: 'AI Darul Ifta',
    nav_exams: 'Exam Simulator',
    nav_ahkam_shariat: 'Islamic Rulings',
    nav_islah_aamal: 'Daily Muhasabah',
    nav_prayer_times: 'Prayer Times',
    nav_flashcards: 'Flashcards',
    nav_notes: 'Study Notes',
    nav_more: 'More ▾',

    // Audio
    audio_quran: 'Quran Audio',
    audio_naat: 'Hamd & Naat',

    // Search
    search_placeholder: 'Search across 147 books, Hadith, Tafseer, Fiqh & Footnotes...',
    search_category_all: 'All Books (147)',
    search_category_hadith: 'Hadith',
    search_category_tafseer: 'Quran & Tafseer',
    search_category_fiqh: 'Fiqh & Fatwa',
    search_category_aqeedah: 'Aqeedah & Kalam',

    // Reader UI
    reader_focus_mode: 'Focus / Dars Mode',
    reader_focus_exit: 'Exit Focus Mode',
    reader_font_size: 'Font Size',
    reader_font_zoom_in: 'Zoom In (A+)',
    reader_font_zoom_out: 'Zoom Out (A-)',
    reader_font_reset: 'Reset (100%)',
    reader_typography_panel: 'Typography & Size Controls',
    reader_arabic_font: 'Arabic Text (Matn)',
    reader_urdu_font: 'Urdu Translation & Tashreeh',
    reader_line_spacing: 'Line Spacing',
    reader_presets: 'Quick Presets',
    reader_preset_small: 'Small',
    reader_preset_standard: 'Standard',
    reader_preset_large: 'Large',
    reader_preset_xlarge: 'Extra Large',
    reader_tashkeel_on: 'Diacritics On',
    reader_tashkeel_off: 'No Diacritics (Practice)',
    reader_copy_ref: 'Copy with Citation',
    reader_copied: 'Copied!',
    reader_bookmark: 'Bookmark',
    reader_bookmarked: 'Bookmarked',
    reader_notes: 'Study Note',
    reader_notes_close: 'Close Note',
    reader_save_note: 'Save Note',
    reader_word_by_word: 'Word-by-Word',
    reader_word_by_word_hide: 'Hide Grid',
    reader_next_page: 'Next Page',
    reader_prev_page: 'Previous Page',
    reader_page_label: 'Page',
    reader_hadith_label: 'Hadith No.',
    reader_sanad_label: 'Sanad (Chain of Narration)',
    reader_matn_label: 'Matn (Prophetic Text ﷺ)',
    reader_translation_label: 'Fluent Urdu Translation:',
    reader_tashreeh_label: 'Scholarly Darsi Commentary & Madhahib',
    reader_fiqh_label: 'Comparative Jurisprudence (Four Schools)',
    reader_takeaway_label: 'Daily Life Lessons & Spiritual Takeaway',
    reader_takhreej_label: 'Cross-References & Takhreej',
    reader_click_narrator_tip: '💡 Click narrator badges to view biographical evaluation (Jarh-o-Tadeel)',
    reader_click_word_tip: '💡 Click any Arabic word for morphological and syntactic breakdown',
    reader_toc: 'Table of Contents',

    // Footer
    footer_text: 'A sacred digital repository and academic initiative for students, teachers, and scholars.',
    footer_rights: '© 1448 AH / 2026 CE — Tehreek-e-Iman Digital Portal',
    footer_arabic_title: 'تَحْرِيكِ إِيمَان — مَنَصَّةُ المَدَارِسِ الإِسْلَامِيَّة',
  },
};

export function getTranslation(lang: PortalLanguage, key: string, fallback?: string): string {
  const table = TRANSLATIONS[lang] || TRANSLATIONS.ur;
  if (table[key]) return table[key];
  if (TRANSLATIONS.ur[key]) return TRANSLATIONS.ur[key];
  return fallback || key;
}
