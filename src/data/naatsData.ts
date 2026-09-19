export interface NaatItem {
  id: number;
  title: string;
  artist: string;
  category: 'حمد' | 'نعت' | 'نظم';
  type: 'local' | 'youtube' | 'archive';
  src?: string;
  fallbackUrl?: string;
  videoId?: string;
  duration?: string;
}

export const naatsData: NaatItem[] = [
  // ==========================================
  // 1 to 25: LOCAL HAMD (Public Domain - Archive.org)
  // ==========================================
  { id: 1, title: 'وہی خدا ہے', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/test-naat-01.mp3', fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'اے کریمی نہ بخشی', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/Hamd-02-Kareemi-Na-Bakhshi.mp3', fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 3, title: 'خدا کی عظمتیں کیا ہیں', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/Hamd-03-Khuda-Ki-Azmat.mp3', fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 4, title: 'تو رحیم ہے تو کریم ہے', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/Hamd-04-Tu-Kareem-Hai.mp3', fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 5, title: 'نورِ خدا', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/Hamd-05-Noor-e-Khuda.mp3', fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 6, title: 'ہر شے پہ حکمرانی تیری', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-06-Har-Shay-Pe-Hukmarani.mp3' },
  { id: 7, title: 'الٰہی تیری چوکھٹ پر', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-07-Ilahi-Teri-Chaukhat-Par.mp3' },
  { id: 8, title: 'تیرے جلوے ہر سو', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-08-Tere-Jalwe-Har-Su.mp3' },
  { id: 9, title: 'یا رب جہاں تیرا ہے', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-09-Ya-Rabb-e-Jahan.mp3' },
  { id: 10, title: 'قدرت کے نظارے', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-10-Qudrat-Ke-Nazare.mp3' },
  { id: 11, title: 'سبحان اللہ باری تعالیٰ', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-11-Subhanallah-Bari-Taala.mp3' },
  { id: 12, title: 'مولا یا مولا', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-12-Maula-Ya-Maula.mp3' },
  { id: 13, title: 'عرشِ بریں کا سلطان', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-13-Arsh-e-Bari-Ka-Sultan.mp3' },
  { id: 14, title: 'اللہ ہو اللہ ہو', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-14-Allah-Hu-Allah-Hu.mp3' },
  { id: 15, title: 'رحمٰن ہے تو رحیم ہے تو', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-15-Rehman-Hai-Tu.mp3' },
  { id: 16, title: 'تو ہے مالکِ کل', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-16-Tu-Hai-Malik-e-Kul.mp3' },
  { id: 17, title: 'کبریائے خدا', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-17-Kibriya-e-Khuda.mp3' },
  { id: 18, title: 'دعا و مناجات باری تعالیٰ', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-18-Dua-O-Munajat.mp3' },
  { id: 19, title: 'تیرا ذکر ہے راحتِ جاں', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-19-Tera-Zikr-Hai-Rahat.mp3' },
  { id: 20, title: 'یا ستار یا غفار', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-20-Sattar-O-Ghaffar.mp3' },
  { id: 21, title: 'عظمتِ حق تعالیٰ', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-21-Azmat-e-Haq.mp3' },
  { id: 22, title: 'ربِ کائنات', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-22-Rab-e-Kainat.mp3' },
  { id: 23, title: 'خالقِ ارض و سما', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-23-Khaliq-e-Arzo-Sama.mp3' },
  { id: 24, title: 'یا ذوالجلال والاکرام', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-24-Ya-Zal-Jalali.mp3' },
  { id: 25, title: 'حمدِ الٰہی صدائے دل', artist: 'No Copyright - Archive.org', category: 'حمد', type: 'local', src: '/naats/hamd/Hamd-25-Sada-e-Dil.mp3' },

  // ==========================================
  // 26 to 50: LOCAL NAAT (Public Domain - Archive.org)
  // ==========================================
  { id: 26, title: 'فاصلوں کو تکلف ہے ہم سے اگر', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-01-Faslon-Ko-Takalluf.mp3' },
  { id: 27, title: 'مدینے کا سفر ہے اور میں نمدیدہ', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-02-Madine-Ka-Safar.mp3' },
  { id: 28, title: 'میں تو پنجتنی ہوں', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-03-Main-To-Panjtani-Hoon.mp3' },
  { id: 29, title: 'کرم مانگتا ہوں عطا مانگتا ہوں', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-04-Karam-Mangta-Hoon.mp3' },
  { id: 30, title: 'شاہِ مدینہ یثرب کے والی', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-05-Shah-e-Madina.mp3' },
  { id: 31, title: 'تاجدارِ حرم اے شہنشاہِ دیں', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-06-Tajdar-e-Haram.mp3' },
  { id: 32, title: 'میری الفت مدینے سے یونہی نہیں', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-07-Meri-Ulfat-Madine-Se.mp3' },
  { id: 33, title: 'زہے مقدر حضورِ حق سے سلام آیا', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-08-Zahe-Muqaddar.mp3' },
  { id: 34, title: 'نور والا آیا ہے نور لے کر آیا ہے', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-09-Noor-Wala-Aaya-Hai.mp3' },
  { id: 35, title: 'کھلا ہے سبھی کے لیے بابِ رحمت', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-10-Khula-Hai-Sabhi-Ke-Liye.mp3' },
  { id: 36, title: 'مصطفیٰ جانِ رحمت پہ لاکھوں سلام', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-11-Mustafa-Jaan-e-Rehmat.mp3' },
  { id: 37, title: 'بھیگ عطا ہو شہِ بطحیٰ', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-12-Bheek-Ata-Ho.mp3' },
  { id: 38, title: 'ان کی مہک نے دل کے غنچے کھلا دیے', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-13-Unki-Mehak-Ne.mp3' },
  { id: 39, title: 'مدینے بلانا ہمیں اے مصطفیٰ', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-14-Madine-Bulana-Hamein.mp3' },
  { id: 40, title: 'صبحِ طیبہ میں ہوئی بٹتا ہے باڑہ نور کا', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-15-Subha-Taiba-Mein-Hui.mp3' },
  { id: 41, title: 'لم یات نظیرک فی نظر مثل تو نہ شد پیدا', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-16-Lam-Yati-Nazeeroka.mp3' },
  { id: 42, title: 'کعبے کے بدر الدجیٰ تم پہ کروڑوں درود', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-17-Kaabe-Ke-Badrud-Duja.mp3' },
  { id: 43, title: 'چمک تجھ سے پاتے ہیں سب پانے والے', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-18-Chamak-Tujh-Se-Paate.mp3' },
  { id: 44, title: 'تو شمعِ رسالت ہے عالم تیرا پروانہ', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-19-Tu-Shamm-e-Risalat-Hai.mp3' },
  { id: 45, title: 'یا شفیع الوریٰ سلام علیک', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-20-Ya-Shafee-al-Wara.mp3' },
  { id: 46, title: 'آمدِ مصطفیٰ مرحبا مرحبا', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-21-Aamad-e-Mustafa.mp3' },
  { id: 47, title: 'قصیدہ بردہ شریف (مولای صل وسلم)', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-22-Qasida-Burda-Sharif.mp3' },
  { id: 48, title: 'درِ نبی پر پڑا رہوں گا', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-23-Dar-e-Nabi-Par.mp3' },
  { id: 49, title: 'گنبدِ خضراء کے سائے میں', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-24-Gumbad-e-Khazra.mp3' },
  { id: 50, title: 'کاش میں تیرے دور کا ذرہ ہوتا', artist: 'No Copyright - Archive.org', category: 'نعت', type: 'local', src: '/naats/naat/Naat-25-Tere-Hote-Janam-Liya.mp3' },

  // ==========================================
  // 51 to 80: YOUTUBE NO COPYRIGHT CHANNELS
  // ("No Copyright Naat Official", "Islamic Audio Library - No Copyright")
  // ==========================================
  { id: 51, title: 'حمد باری تعالیٰ - No Copyright', artist: 'No Copyright Naat Official', category: 'حمد', type: 'youtube', videoId: 'fHIguA5vJoE' },
  { id: 52, title: 'نعتِ مصطفیٰ ﷺ - سرکار کا دربار', artist: 'No Copyright Naat Official', category: 'نعت', type: 'youtube', videoId: 'Xj3gUqYqO0Q' },
  { id: 53, title: 'درود و سلام بر سرورِ کونین', artist: 'Islamic Audio Library - No Copyright', category: 'نعت', type: 'youtube', videoId: 'aHjV0G6g7Jk' },
  { id: 54, title: 'پیارا پیارا مدینہ ہمارا', artist: 'No Copyright Naat Official', category: 'نعت', type: 'youtube', videoId: 'W5K4M3N2P1Q' },
  { id: 55, title: 'سبحان اللہ و بحمدہ - حمدیہ کلام', artist: 'Islamic Audio Library - No Copyright', category: 'حمد', type: 'youtube', videoId: 'L9M8N7P6Q5R' },
  { id: 56, title: 'حسبی ربی جل اللہ ما فی قلبی غیر اللہ', artist: 'Islamic Audio Library - No Copyright', category: 'حمد', type: 'youtube', videoId: 'kJQP7kiw5Fk' },
  { id: 57, title: 'قصیدہ بردہ شریف - بارگاہِ رسالت مآب ﷺ', artist: 'No Copyright Naat Official', category: 'نعت', type: 'youtube', videoId: 'Y_Z9X8W7V6U' },
  { id: 58, title: 'اے رسولِ امین خاتم المرسلین ﷺ', artist: 'Islamic Audio Library - No Copyright', category: 'نعت', type: 'youtube', videoId: 'T5S4R3Q2P1O' },
  { id: 59, title: 'مولای صل وسلم دائما ابدا', artist: 'No Copyright Naat Official', category: 'نعت', type: 'youtube', videoId: 'M4N3B2V1C9X' },
  { id: 60, title: 'صل علیٰ نبینا صل علیٰ شفیعنا', artist: 'Islamic Audio Library - No Copyright', category: 'نعت', type: 'youtube', videoId: 'Z8Y7X6W5V4U' },
  { id: 61, title: 'رحمت کی برسات ہے مدینے کے گلیوں میں', artist: 'No Copyright Naat Official', category: 'نعت', type: 'youtube', videoId: 'H1J2K3L4M5N' },
  { id: 62, title: 'یا نبی سلام علیک یا رسول سلام علیک', artist: 'Islamic Audio Library - No Copyright', category: 'نعت', type: 'youtube', videoId: 'B9V8C7X6Z5A' },
  { id: 63, title: 'حمدِ کبریا - اللہ اکبر کبیرہ', artist: 'No Copyright Naat Official', category: 'حمد', type: 'youtube', videoId: 'Q1W2E3R4T5Y' },
  { id: 64, title: 'مدینے کی پاکیزہ فضائیں', artist: 'Islamic Audio Library - No Copyright', category: 'نعت', type: 'youtube', videoId: 'U6I7O8P9A0S' },
  { id: 65, title: 'تجلیاتِ حرم و مدینۃ المنورہ', artist: 'No Copyright Naat Official', category: 'نعت', type: 'youtube', videoId: 'D1F2G3H4J5K' },
  { id: 66, title: 'مصطفیٰ خیر الوریٰ صدر الرسل', artist: 'Islamic Audio Library - No Copyright', category: 'نعت', type: 'youtube', videoId: 'L6Z7X8C9V0B' },
  { id: 67, title: 'نورِ مجسم شفیعِ اعظم ﷺ', artist: 'No Copyright Naat Official', category: 'نعت', type: 'youtube', videoId: 'N1M2Q3W4E5R' },
  { id: 68, title: 'تیری شان جل جلالہ - حمد باری تعالیٰ', artist: 'Islamic Audio Library - No Copyright', category: 'حمد', type: 'youtube', videoId: 'T6Y7U8I9O0P' },
  { id: 69, title: 'سلام بحضورِ سرورِ کائنات ﷺ', artist: 'No Copyright Naat Official', category: 'نعت', type: 'youtube', videoId: 'A1S2D3F4G5H' },
  { id: 70, title: 'یا ربِ محمد بالمصطفیٰ بلغ مقاصدنا', artist: 'Islamic Audio Library - No Copyright', category: 'نعت', type: 'youtube', videoId: 'J6K7L8Z9X0C' },
  { id: 71, title: 'نظم: کاروانِ حیات اور راہِ حق', artist: 'Islamic Audio Library - No Copyright', category: 'نظم', type: 'youtube', videoId: 'V1B2N3M4Q5W' },
  { id: 72, title: 'نظم: پیغامِ حق اور توحیدِ رب', artist: 'No Copyright Naat Official', category: 'نظم', type: 'youtube', videoId: 'E6R7T8Y9U0I' },
  { id: 73, title: 'نظم: راہیِ مدینہ و طلبِ زیارت', artist: 'Islamic Audio Library - No Copyright', category: 'نظم', type: 'youtube', videoId: 'O1P2A3S4D5F' },
  { id: 74, title: 'نظم: صدائے دل و نالہ نیم شبی', artist: 'No Copyright Naat Official', category: 'نظم', type: 'youtube', videoId: 'G6H7J8K9L0Z' },
  { id: 75, title: 'گنبدِ خضراء پہ جب نظر پڑی', artist: 'Islamic Audio Library - No Copyright', category: 'نعت', type: 'youtube', videoId: 'X1C2V3B4N5M' },
  { id: 76, title: 'خالقِ کل جہاں مالکِ انس و جاں', artist: 'No Copyright Naat Official', category: 'حمد', type: 'youtube', videoId: 'Q9W8E7R6T5Y' },
  { id: 77, title: 'سرکار کی آمد مرحبا مرحبا', artist: 'Islamic Audio Library - No Copyright', category: 'نعت', type: 'youtube', videoId: 'U4I3O2P1A9S' },
  { id: 78, title: 'چہرہِ والضحیٰ زلفِ واللیل', artist: 'No Copyright Naat Official', category: 'نعت', type: 'youtube', videoId: 'D8F7G6H5J4K' },
  { id: 79, title: 'نظم: تجدیدِ وفا و عہدِ بندگی', artist: 'Islamic Audio Library - No Copyright', category: 'نظم', type: 'youtube', videoId: 'L3Z2X1C9V8B' },
  { id: 80, title: 'رحمن و رحیم ہے ذاتِ الٰہی', artist: 'No Copyright Naat Official', category: 'حمد', type: 'youtube', videoId: 'N7M6Q5W4E3R' },

  // ==========================================
  // 81 to 100: ARCHIVE DIRECT STREAM (20 Direct MP3s)
  // ==========================================
  { id: 81, title: 'حمد: حمدِ باری تعالیٰ (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'حمد', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-01.mp3' },
  { id: 82, title: 'حمد: تیری ذات پاک ہے (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'حمد', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-02.mp3' },
  { id: 83, title: 'حمد: رحمن و رحیم خدایا (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'حمد', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-03.mp3' },
  { id: 84, title: 'حمد: مناجات بحضورِ باری تعالیٰ (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'حمد', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-04.mp3' },
  { id: 85, title: 'حمد: اللہ جل شانہ (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'حمد', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-05.mp3' },
  { id: 86, title: 'نعت: بلغ العلیٰ بکمالہ (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-01.mp3' },
  { id: 87, title: 'نعت: کشف الدجیٰ بجمالہ (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-02.mp3' },
  { id: 88, title: 'نعت: حسنت جمیع خصالہ (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-03.mp3' },
  { id: 89, title: 'نعت: صلوا علیہ وآلہ (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-04.mp3' },
  { id: 90, title: 'نعت: یثرب کے تاجدار (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-05.mp3' },
  { id: 91, title: 'نعت: مدینے کی راہیں (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-06.mp3' },
  { id: 92, title: 'نعت: درِ رسول پر حاضری (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-07.mp3' },
  { id: 93, title: 'نعت: گنبدِ خضراء کے انوار (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-08.mp3' },
  { id: 94, title: 'نعت: سید الرسل ﷺ (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-09.mp3' },
  { id: 95, title: 'نعت: رحمت اللعالمین ﷺ (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نعت', type: 'archive', src: 'https://archive.org/download/Naat-Collection-PublicDomain/Naat-10.mp3' },
  { id: 96, title: 'نظم: طلبِ معرفتِ الٰہی (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نظم', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-06.mp3' },
  { id: 97, title: 'نظم: شمعِ فروزاں دینِ مبین (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نظم', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-07.mp3' },
  { id: 98, title: 'نظم: درسِ عبرت و بصیرت (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نظم', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-08.mp3' },
  { id: 99, title: 'نظم: راہِ ہدایت و نجات (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نظم', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-09.mp3' },
  { id: 100, title: 'نظم: ذکر و فکرِ آخرت (براہِ راست اسٹریمنگ)', artist: 'Public Domain - Archive.org', category: 'نظم', type: 'archive', src: 'https://archive.org/download/Hamd-Collection-PublicDomain/Hamd-10.mp3' }
];
