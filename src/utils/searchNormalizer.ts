/**
 * Multilingual Search Normalizer & Concept Expansion
 * 
 * Provides:
 * 1. Diacritic stripping for Arabic & Urdu (Tashkeel, Tanween, Dagger Alif, Sukun, Shaddah, etc.)
 * 2. Letter unification (Alifs, Yehs, Kafs, Teh Marbuta, Heh)
 * 3. Semantic concept mapping across English, Roman Urdu, Arabic, and Urdu
 * 4. High-performance matching helper for chapters, hadiths, and books
 */

/**
 * Strips all Arabic & Urdu diacritics (Harakat, Tashkeel, Pause marks)
 */
export function stripDiacritics(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .trim();
}

/**
 * Comprehensive normalizer for search indexing & comparison:
 * - Strips diacritics
 * - Normalizes letter forms (أ إ آ ٱ -> ا, ة ۃ ه ھ -> ہ, ي ى ئ ئے ی -> ی, ك -> ک, ؤ -> و)
 * - Lowercases Latin characters
 * - Strips non-alphanumeric punctuation
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  
  let norm = stripDiacritics(text);

  // Letter unification
  norm = norm
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/[ةۃهھ]/g, 'ہ')
    .replace(/[يىئئے]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ؤ/g, 'و')
    .toLowerCase();

  // Strip excessive punctuation and collapse whitespace
  norm = norm
    .replace(/[.,:;!?()،؛؟"«»۝#_—\-\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return norm;
}

/**
 * Islamic concept mapping:
 * Translates English, Roman Urdu, and modern terms into canonical Arabic & Urdu keywords.
 */
const CONCEPT_DICTIONARY: Record<string, string[]> = {
  // Prayer / Namaz (English, Roman Urdu, Arabic, Urdu variations)
  'prayer': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'صلوات', 'نمازی', 'اوقات'],
  'prayers': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'صلوات'],
  'namaz': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'صلوات', 'نمازی', 'اوقات', 'مواقیت', 'prayer'],
  'namaaz': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'صلوات', 'prayer'],
  'nimaz': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'nmaz': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'namaze': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'namazen': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'namazain': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'namazon': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'namazi': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'salat': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'salaat': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'salaah': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'salah': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'solat': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'salawat': ['صلاۃ', 'صلوة', 'صلاة', 'نماز', 'prayer'],
  'azan': ['اذان', 'مؤذن'],
  'adhan': ['اذان', 'مؤذن'],
  'witr': ['وتر', 'قنوت'],
  'tahajjud': ['تہجد', 'قیام اللیل'],
  'tarawih': ['تراویح', 'رمضان'],
  'jamaat': ['جماعت', 'امامت'],
  'jummah': ['جمعہ', 'خطبہ'],
  'juma': ['جمعہ', 'خطبہ'],
  'eid': ['عید', 'عیدین'],
  'qibla': ['قبلہ', 'کعبہ'],
  'sajda': ['سجدہ', 'سجود'],
  'sujood': ['سجدہ', 'سجود'],
  'ruku': ['رکوع'],

  // Wudu / Purification (English, Roman Urdu, Arabic, Urdu variations)
  'wudu': ['وضوء', 'وضو', 'طہارت', 'طهارة', 'غسل', 'پاکی'],
  'wudhu': ['وضوء', 'وضو', 'طہارت', 'طهارة'],
  'wuzoo': ['وضوء', 'وضو', 'طہارت', 'غسل'],
  'wuzu': ['وضوء', 'وضو', 'طہارت'],
  'wudoo': ['وضوء', 'وضو', 'طہارت'],
  'wuduh': ['وضوء', 'وضو', 'طہارت'],
  'wazo': ['وضوء', 'وضو', 'طہارت'],
  'vudu': ['وضوء', 'وضو', 'طہارت'],
  'vazu': ['وضوء', 'وضو', 'طہارت'],
  'ablution': ['وضوء', 'وضو', 'طہارت', 'غسل'],
  'purification': ['طہارت', 'طهارة', 'وضوء', 'وضو', 'پاکی'],
  'taharat': ['طہارت', 'طهارة', 'وضوء', 'وضو'],
  'tahara': ['طہارت', 'طهارة', 'وضوء'],
  'taharah': ['طہارت', 'طهارة', 'وضوء'],
  'pak': ['طہارت', 'وضوء', 'وضو', 'پاکی'],
  'paki': ['طہارت', 'وضوء', 'وضو', 'پاکی'],
  'ghusl': ['غسل', 'غسل کا طریقہ', 'طہارت'],
  'ghusal': ['غسل', 'طہارت'],
  'bath': ['غسل', 'طہارت'],
  'tayammum': ['تیمم', 'مٹی'],
  'dry ablution': ['تیمم'],
  'miswak': ['مسواک', 'سواک'],


  // Faith / Iman
  'faith': ['ایمان', 'عقیدہ', 'عقائد', 'توحید'],
  'belief': ['ایمان', 'عقیدہ', 'توحید'],
  'iman': ['ایمان', 'عقیدہ', 'توحید'],
  'imaan': ['ایمان', 'عقیدہ', 'توحید'],
  'aqeedah': ['عقیدہ', 'عقائد', 'توحید'],
  'aqaid': ['عقائد', 'عقیدہ'],
  'creed': ['عقیدہ', 'عقائد'],
  'tawheed': ['توحید', 'ایمان'],
  'shirk': ['شرک', 'کفر'],

  // Knowledge / Ilm
  'knowledge': ['علم', 'تعلیم', 'معرفت', 'عالم'],
  'ilm': ['علم', 'تعلیم', 'علماء'],
  'education': ['تعلیم', 'علم', 'درس'],
  'learning': ['علم', 'تعلم'],
  'scholar': ['عالم', 'علماء', 'محدث'],

  // Revelation / Wahy
  'revelation': ['وحی', 'بدء الوحی', 'جبرائیل'],
  'wahy': ['وحی', 'بدء الوحی'],
  'wahi': ['وحی', 'بدء الوحی'],
  'inspiration': ['وحی', 'الہام'],

  // Fasting / Roza (English, Roman Urdu, Arabic, Urdu variations)
  'fasting': ['صوم', 'صيام', 'روزہ', 'روزے', 'رمضان'],
  'fast': ['صوم', 'روزہ'],
  'roza': ['صوم', 'صيام', 'روزہ', 'رمضان', 'fasting'],
  'roze': ['صوم', 'صيام', 'روزہ', 'رمضان', 'fasting'],
  'rozon': ['صوم', 'صيام', 'روزہ', 'رمضان'],
  'rozah': ['صوم', 'صيام', 'روزہ', 'رمضان'],
  'rozey': ['صوم', 'صيام', 'روزہ', 'رمضان'],
  'sawm': ['صوم', 'صيام', 'روزہ', 'fasting'],
  'saum': ['صوم', 'صيام', 'روزہ', 'fasting'],
  'ramadan': ['رمضان', 'صوم', 'روزہ'],
  'ramzan': ['رمضان', 'صوم', 'روزہ'],
  'ramadhaan': ['رمضان', 'صوم', 'روزہ'],
  'iftar': ['افطار', 'صوم'],
  'iftari': ['افطار', 'صوم'],
  'sehri': ['سحور', 'سحری'],
  'sehr': ['سحور', 'سحری'],
  'itikaaf': ['اعتکاف', 'مسجد'],
  'itikaf': ['اعتکاف'],

  // Charity / Zakat (English, Roman Urdu, Arabic, Urdu variations)
  'charity': ['زکوٰۃ', 'زکوۃ', 'زکاۃ', 'صدقہ', 'خیرات'],
  'zakat': ['زکوٰۃ', 'زکوۃ', 'زکاۃ', 'صدقہ', 'خیرات', 'charity'],
  'zakah': ['زکوٰۃ', 'زکوۃ', 'زکاۃ', 'صدقہ'],
  'zakaat': ['زکوٰۃ', 'زکوۃ', 'زکاۃ', 'صدقہ'],
  'sadqah': ['صدقہ', 'خیرات', 'زکوٰۃ'],
  'sadaqah': ['صدقہ', 'خیرات', 'زکوٰۃ'],
  'sadqa': ['صدقہ', 'خیرات'],
  'sadaqa': ['صدقہ', 'خیرات'],
  'khairat': ['صدقہ', 'خیرات', 'زکوٰۃ'],

  // Hajj / Pilgrimage
  'hajj': ['حج', 'مناسک', 'طواف', 'عرفات'],
  'haj': ['حج', 'مناسک'],
  'pilgrimage': ['حج', 'عمرہ', 'زیارت'],
  'umrah': ['عمرہ', 'احرام'],
  'umra': ['عمرہ', 'احرام'],
  'tawaf': ['طواف', 'کعبہ'],
  'kaaba': ['کعبہ', 'بیت اللہ', 'قبلہ'],
  'qurbani': ['قربانی', 'اضحیہ', 'ذبح'],
  'sacrifice': ['قربانی', 'اضحیہ'],

  // Marriage / Nikah (English, Roman Urdu, Arabic, Urdu variations)
  'marriage': ['نکاح', 'شادی', 'ازدواج', 'مہر'],
  'wedding': ['نکاح', 'شادی'],
  'nikah': ['نکاح', 'ازدواج', 'مہر', 'شادی', 'marriage'],
  'nikaah': ['نکاح', 'ازدواج', 'مہر', 'شادی'],
  'shadi': ['نکاح', 'ازدواج', 'شادی', 'marriage'],
  'shaadi': ['نکاح', 'ازدواج', 'شادی'],
  'biah': ['نکاح', 'شادی'],
  'walima': ['ولیمہ', 'نکاح'],
  'waleema': ['ولیمہ', 'نکاح'],
  'divorce': ['طلاق', 'خلع', 'عدت'],
  'talaq': ['طلاق', 'خلع', 'نکاح'],
  'talaaq': ['طلاق', 'خلع'],
  'khula': ['خلع', 'طلاق'],
  'iddat': ['عدت', 'طلاق'],

  // Sales / Trade (English, Roman Urdu, Arabic, Urdu variations)
  'sales': ['بیوع', 'بیع', 'تجارت', 'خرید', 'فروخت', 'شرکت'],
  'sale': ['بیوع', 'بیع', 'تجارت'],
  'trade': ['تجارت', 'بیوع', 'بیع', 'سودا'],
  'business': ['تجارت', 'بیوع', 'شرکت'],
  'commerce': ['تجارت', 'بیوع'],
  'tijarat': ['تجارت', 'بیوع', 'بیع', 'سودا', 'trade', 'sales'],
  'tijarah': ['تجارت', 'بیوع', 'بیع'],
  'kharid': ['خرید', 'بیع', 'تجارت'],
  'farokht': ['فروخت', 'بیع', 'تجارت'],
  'sooda': ['سودا', 'بیع', 'تجارت'],
  'sauda': ['سودا', 'بیع', 'تجارت'],
  'buyoo': ['بیوع', 'بیع', 'تجارت', 'trade'],
  'buyu': ['بیوع', 'بیع', 'تجارت'],
  'usury': ['ربا', 'سود'],
  'riba': ['ربا', 'سود'],
  'sood': ['ربا', 'سود'],

  // Food & Drinks
  'food': ['اطعمہ', 'کھانا', 'ذبیحہ', 'حلال'],
  'eating': ['کھانا', 'اطعمہ', 'طعام'],
  'drinks': ['اشربہ', 'پینا', 'شربت'],
  'halal': ['حلال', 'طیب'],
  'haram': ['حرام', 'ممنوع'],

  // Jihad / Struggle
  'jihad': ['جہاد', 'قتال', 'غزوہ', 'مجاہد'],
  'jihaad': ['جہاد', 'قتال'],
  'war': ['جہاد', 'غزوہ', 'جنگ'],
  'struggle': ['جہاد'],

  // Funeral / Death (English, Roman Urdu, Arabic, Urdu variations)
  'funeral': ['جنائز', 'جنازہ', 'کفن', 'دفن'],
  'janaza': ['جنازہ', 'جنائز', 'موت', 'funeral'],
  'janaaza': ['جنازہ', 'جنائز'],
  'janazah': ['جنازہ', 'جنائز'],
  'death': ['موت', 'وفات', 'جنائز'],
  'mayyat': ['میت', 'جنازہ'],
  'mait': ['میت', 'جنازہ'],
  'mot': ['موت', 'وفات'],
  'kafan': ['کفن', 'جنازہ'],
  'dafan': ['دفن', 'قبر'],
  'qabr': ['قبر', 'جنائز'],

  // Hadith / Sunnah
  'hadith': ['حدیث', 'احادیث', 'روایت', 'سنت'],
  'hadees': ['حدیث', 'احادیث', 'سنت'],
  'hadeeth': ['حدیث', 'احادیث', 'سنت'],
  'hadis': ['حدیث', 'احادیث', 'سنت'],
  'riwayat': ['روایت', 'حدیث'],
  'sunnah': ['سنت', 'حدیث', 'اتباع'],
  'sunnat': ['سنت', 'حدیث'],


  // Quran & Tafseer
  'quran': ['قرآن', 'تفسیر', 'سورت', 'آیت'],
  'tafseer': ['تفسیر', 'قرآن', 'معانی'],
  'tafsir': ['تفسیر', 'قرآن'],
  'surah': ['سورت', 'سورۃ'],
  'ayah': ['آیت', 'آیات'],

  // Classical Sciences (English, Roman Urdu, Arabic, Urdu variations)
  'nahw': ['نحو', 'ہدایۃ النحو', 'نحومیر', 'اعراب', 'عامل'],
  'nahv': ['نحو', 'ہدایۃ النحو', 'نحومیر', 'اعراب'],
  'naho': ['نحو', 'ہدایۃ النحو', 'نحومیر'],
  'grammar': ['نحو', 'صرف', 'اعراب'],
  'aerab': ['اعراب', 'نحو'],
  'irab': ['اعراب', 'نحو'],
  'tarkeeb': ['ترکیب', 'نحو', 'اعراب'],
  'sarf': ['صرف', 'صیغہ', 'میزان', 'منشعب', 'خاصیات'],
  'mantiq': ['منطق', 'قیاس', 'مرقاۃ', 'ایساغوجی', 'تصور', 'تصدیق'],
  'mantoq': ['منطق', 'قیاس'],
  'logic': ['منطق', 'قیاس'],
  'qiyas': ['قیاس', 'منطق', 'اصول'],
  'usul': ['اصول', 'اصول الشاشی', 'نور الانوار', 'شاشی', 'منار'],
  'faraid': ['فرائض', 'میراث', 'سراجی', 'ترکہ', 'وارث'],
  'faraiz': ['فرائض', 'میراث', 'سراجی'],
  'faraaiz': ['فرائض', 'میراث', 'سراجی'],
  'inheritance': ['فرائض', 'میراث', 'سراجی', 'ترکہ', 'وارث'],
  'miras': ['میراث', 'فرائض', 'ترکہ'],
  'meeras': ['میراث', 'فرائض', 'ترکہ'],
  'tarqa': ['ترکہ', 'میراث', 'فرائض'],
  'waris': ['وارث', 'ورثاء', 'فرائض'],
  'balaghah': ['بلاغت', 'معانی', 'بیان', 'بدیع', 'دروس البلاغہ'],
  'fatawa': ['فتاویٰ', 'فتویٰ', 'مسئلہ', 'قضاء'],
  'fatwa': ['فتاویٰ', 'فتویٰ'],
  'ethics': ['اخلاق', 'آداب', 'تربیت'],
  'adab': ['ادب', 'آداب', 'اخلاق'],


  // Specific Books
  'bukhari': ['بخاری', 'صحیح البخاری'],
  'muslim': ['مسلم', 'صحیح مسلم'],
  'tirmidhi': ['ترمذی', 'جامع الترمذی'],
  'abu dawood': ['ابوداؤد', 'سنن ابی داود'],
  'abudawood': ['ابوداؤد', 'سنن ابی داود'],
  'nasai': ['نسائی', 'سنن النسائی'],
  'ibn majah': ['ابن ماجہ', 'سنن ابن ماجہ'],
  'mishkat': ['مشکوٰۃ', 'مشکوۃ'],
  'quduri': ['قدوری', 'مختصر القدوری'],
  'hidayah': ['ہدایہ', 'الہدایہ'],
  'hidaya': ['ہدایہ', 'الہدایہ'],

  // Bidirectional Urdu & Arabic Canonical Concept Entries
  'نماز': ['صلاۃ', 'صلوة', 'صلاة', 'صلوات', 'نمازی', 'prayer', 'namaz'],
  'نمازیں': ['صلاۃ', 'صلوة', 'صلاة', 'صلوات', 'prayer'],
  'صلاۃ': ['نماز', 'صلوة', 'صلاة', 'prayer', 'namaz'],
  'صلاة': ['نماز', 'صلوة', 'صلاۃ', 'prayer', 'namaz'],
  'صلوة': ['نماز', 'صلاۃ', 'صلاة', 'prayer', 'namaz'],
  'وضو': ['وضوء', 'طہارت', 'طهارة', 'غسل', 'پاکی', 'wudu', 'ablution'],
  'وضوء': ['وضو', 'طہارت', 'طهارة', 'غسل', 'wudu', 'ablution'],
  'طہارت': ['وضوء', 'وضو', 'طهارة', 'غسل', 'پاکی', 'taharat', 'wudu'],
  'طهارة': ['وضوء', 'وضو', 'طہارت', 'غسل', 'taharah'],
  'غسل': ['طہارت', 'وضو', 'نہانا', 'ghusl', 'bath'],
  'روزہ': ['صوم', 'صيام', 'رمضان', 'fasting', 'roza'],
  'روزے': ['صوم', 'صيام', 'رمضان', 'fasting', 'roza'],
  'صوم': ['روزہ', 'صيام', 'رمضان', 'fasting', 'sawm'],
  'صيام': ['روزہ', 'صوم', 'رمضان', 'fasting'],
  'رمضان': ['صوم', 'صيام', 'روزہ', 'تراویح', 'ramadan'],
  'زکوٰۃ': ['زکوۃ', 'زکاۃ', 'صدقہ', 'خیرات', 'zakat', 'charity'],
  'زکوۃ': ['زکوٰۃ', 'زکاۃ', 'صدقہ', 'خیرات', 'zakat'],
  'زکاۃ': ['زکوٰۃ', 'زکوۃ', 'صدقہ', 'خیرات', 'zakat'],
  'صدقہ': ['زکوٰۃ', 'زکوۃ', 'خیرات', 'sadqah', 'charity'],
  'حج': ['عمرہ', 'مناسک', 'طواف', 'عرفات', 'hajj'],
  'عمرہ': ['حج', 'احرام', 'طواف', 'umrah'],
  'نکاح': ['شادی', 'ازدواج', 'مہر', 'طلاق', 'nikah', 'marriage'],
  'شادی': ['نکاح', 'ازدواج', 'wedding', 'marriage'],
  'طلاق': ['خلع', 'عدت', 'نکاح', 'talaq', 'divorce'],
  'بیوع': ['بیع', 'تجارت', 'سودا', 'خرید', 'فروخت', 'sales', 'trade'],
  'بیع': ['بیوع', 'تجارت', 'سودا', 'خرید', 'فروخت', 'sale', 'trade'],
  'تجارت': ['بیوع', 'بیع', 'سودا', 'خرید', 'فروخت', 'trade', 'business'],
  'خرید': ['بیع', 'بیوع', 'تجارت', 'فروخت'],
  'علم': ['تعلیم', 'معرفت', 'عالم', 'علماء', 'ilm', 'knowledge'],
  'تعلیم': ['علم', 'درس', 'تدریس', 'education'],
  'وحی': ['بدء الوحی', 'الہام', 'جبرائیل', 'revelation', 'wahy'],
  'ایمان': ['عقیدہ', 'عقائد', 'توحید', 'faith', 'iman'],
  'عقیدہ': ['ایمان', 'عقائد', 'توحید', 'aqeedah'],
  'عقائد': ['ایمان', 'عقیدہ', 'توحید', 'aqaid'],
  'جہاد': ['قتال', 'غزوہ', 'جنگ', 'مجاہد', 'jihad'],
  'جنازہ': ['جنائز', 'موت', 'وفات', 'کفن', 'دفن', 'funeral', 'janaza'],
  'جنائز': ['جنازہ', 'موت', 'وفات', 'funeral'],
  'فرائض': ['میراث', 'ترکہ', 'وارث', 'سراجی', 'inheritance', 'faraid'],
  'میراث': ['فرائض', 'ترکہ', 'وارث', 'سراجی', 'inheritance', 'miras'],
  'نحو': ['ہدایۃ النحو', 'نحومیر', 'اعراب', 'عامل', 'ترکیب', 'grammar', 'nahw'],
  'صرف': ['صیغہ', 'میزان', 'منشعب', 'خاصیات', 'تعلیلات', 'sarf'],
  'منطق': ['مرقاۃ', 'ایساغوجی', 'تصور', 'تصدیق', 'قیاس', 'logic', 'mantiq'],
  'فتاویٰ': ['فتویٰ', 'مسئلہ', 'قضاء', 'fatawa', 'fatwa'],
  'فتویٰ': ['فتاویٰ', 'مسئلہ', 'fatwa'],
};

/**
 * Returns expanded keywords for a token
 */
export function getExpandedConceptTerms(token: string): string[] {
  const normToken = normalizeSearchText(token);
  const matches: string[] = [normToken];

  // Direct lookup
  const directList = CONCEPT_DICTIONARY[normToken] || CONCEPT_DICTIONARY[token.toLowerCase().trim()];
  if (directList) {
    directList.forEach(s => matches.push(normalizeSearchText(s)));
  }

  // Cross match against normalized dictionary keys
  for (const [conceptKey, synonyms] of Object.entries(CONCEPT_DICTIONARY)) {
    const normKey = normalizeSearchText(conceptKey);
    if (normToken === normKey || (normKey.length >= 3 && normToken.includes(normKey)) || (normToken.length >= 3 && normKey.includes(normToken))) {
      synonyms.forEach(s => matches.push(normalizeSearchText(s)));
    }
  }

  return Array.from(new Set(matches.filter(Boolean)));
}


/**
 * High-performance Multilingual Matcher:
 * Checks if target strings contain either:
 * 1. Direct query normalized text
 * 2. Words within the query
 * 3. Expanded concept terms (e.g. 'prayer' matching 'کتاب الصلاۃ')
 */
export function matchesSearch(targets: (string | undefined | null)[], query: string): boolean {
  if (!query || !query.trim()) return true;

  const rawQuery = query.trim();
  const normQuery = normalizeSearchText(rawQuery);
  if (!normQuery) return true;

  // Filter out null/undefined targets and normalize them
  const normTargets = targets
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .map(t => normalizeSearchText(t));

  if (normTargets.length === 0) return false;

  // 1. Exact full query normalized substring check across any target
  for (const target of normTargets) {
    if (target.includes(normQuery)) {
      return true;
    }
  }

  // 2. Check each token in the query
  const queryTokens = normQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return true;

  // Check if every token in query matches (AND logic across tokens)
  const allTokensMatch = queryTokens.every(token => {
    // Check direct token in any target
    const directHit = normTargets.some(t => t.includes(token));
    if (directHit) return true;

    // Check concept expansion terms
    const conceptTerms = getExpandedConceptTerms(token);
    return conceptTerms.some(term => normTargets.some(t => t.includes(term)));
  });

  if (allTokensMatch) return true;

  // 3. Number search support (e.g. hadith number 1, 5, 20)
  const numericMatch = rawQuery.match(/\d+/);
  if (numericMatch) {
    const num = numericMatch[0];
    const numHit = normTargets.some(t => t.includes(num));
    if (numHit) return true;
  }

  return false;
}

/**
 * Popular Quick-Search Topics for Madrasa Curriculum
 */
export const POPULAR_SEARCH_TOPICS = [
  { labelUrdu: 'طہارت و وضو', labelEn: 'Wudu / Taharat', query: 'wudu' },
  { labelUrdu: 'نماز و اوقات', labelEn: 'Prayer / Namaz', query: 'prayer' },
  { labelUrdu: 'ایمان و عقائد', labelEn: 'Faith / Iman', query: 'faith' },
  { labelUrdu: 'علم و تعلیم', labelEn: 'Knowledge / Ilm', query: 'ilm' },
  { labelUrdu: 'روزہ و رمضان', labelEn: 'Fasting / Roza', query: 'roza' },
  { labelUrdu: 'زکوٰۃ و صدقات', labelEn: 'Zakat / Charity', query: 'zakat' },
  { labelUrdu: 'نکاح و طلاق', labelEn: 'Nikah / Marriage', query: 'nikah' },
  { labelUrdu: 'بیوع و تجارت', labelEn: 'Sales / Trade', query: 'trade' },
  { labelUrdu: 'سیرت و وحی', labelEn: 'Revelation / Wahy', query: 'wahy' },
  { labelUrdu: 'نحو و اعراب', labelEn: 'Nahw / Grammar', query: 'nahw' },
];
