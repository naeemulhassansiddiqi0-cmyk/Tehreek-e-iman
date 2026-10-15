export interface WifaqDarja {
  id: string;
  title_ur: string;
  stage_ur: string;
  badge_ur: string;
  description_ur: string;
  bookSlugs: string[];
}

export const WIFAQ_DARJAT: WifaqDarja[] = [
  {
    id: 'daura-hadith',
    title_ur: 'دورۂ حدیث شریف',
    stage_ur: 'العالمیۃ (سال دوم)',
    badge_ur: 'دورۂ حدیث',
    description_ur: 'صحاحِ ستہ، موطا امام مالک، مسند احمد اور طحاوی شریف کا تفصیلی و محققانہ درسی مطالعہ۔',
    bookSlugs: [
      'sahih-bukhari',
      'sahih-muslim',
      'jami-tirmidhi',
      'sunan-abu-dawood',
      'sunan-nasai',
      'sunan-ibn-majah',
      'musnad-ahmad',
      'muwatta-imam-malik',
      'sunan-al-darimi',
      'sharh-maani-al-athar',
      'exam-notes-daura-hadith'
    ]
  },
  {
    id: 'darja-sabiah',
    title_ur: 'درجہ سابعہ (موقوف علیہ)',
    stage_ur: 'العالمیۃ (سال اول)',
    badge_ur: 'درجہ سابعہ',
    description_ur: 'مشکوٰۃ المصابیح شریف، تفسیر جلالین، ہدایہ اولین اور اصولِ بلاغت کا درسی نصاب۔',
    bookSlugs: [
      'mishkat-al-masabih',
      'tafseer-jalalayn',
      'al-hidayah',
      'duroos-al-balaghah',
      'exam-notes-mouquf-alaih'
    ]
  },
  {
    id: 'darja-sadisah',
    title_ur: 'درجہ سادسہ',
    stage_ur: 'العالیۃ (سال دوم)',
    badge_ur: 'درجہ سادسہ',
    description_ur: 'تفسیر بیضاوی، شرح الوقایہ، حسامی (اصول فقہ)، شرح عقائد نسفیہ اور مقامات حریری۔',
    bookSlugs: [
      'tafseer-baydawi',
      'sharh-al-wiqayah',
      'al-husami',
      'maqamat-al-hariri',
      'sharh-aqaid-nasafiyyah'
    ]
  },
  {
    id: 'darja-khamisah',
    title_ur: 'درجہ خامسہ',
    stage_ur: 'العالیۃ (سال اول)',
    badge_ur: 'درجہ خامسہ',
    description_ur: 'تفسیر مدارک التنزیل (النسفی)، مختصر المعانی (بلاغت)، نور الانوار اور الفوز الکبیر۔',
    bookSlugs: [
      'tafseer-nasafi',
      'mukhtasar-al-maani',
      'nur-al-anwar',
      'al-fawz-al-kabir',
      'diwan-al-hamasah'
    ]
  },
  {
    id: 'darja-rabiah-salisah',
    title_ur: 'درجہ رابعہ و ثالثہ',
    stage_ur: 'الثانویۃ الخاصۃ',
    badge_ur: 'درجہ رابعہ و ثالثہ',
    description_ur: 'مختصر القدوری، کنز الدقائق، شرح جامی، قطبی، مرقاۃ المنطق، اصول الشاشی اور نخبۃ الفکر۔',
    bookSlugs: [
      'mukhtasar-al-quduri',
      'kanz-al-daqaiq',
      'sharh-jami',
      'al-qutbi',
      'al-mirqat',
      'usul-al-shashi',
      'nukhbat-al-fikar'
    ]
  },
  {
    id: 'darja-ula-saniyah',
    title_ur: 'درجہ اولیٰ و ثانیہ',
    stage_ur: 'الثانویۃ العامۃ',
    badge_ur: 'درجہ اولیٰ و ثانیہ',
    description_ur: 'نور الایضاح، مراقی الفلاح، صرف میر، نحو میر، ہدایۃ النحو، علم الصیغہ، تیسیر المنطق اور ریاض الصالحین۔',
    bookSlugs: [
      'nur-al-idah',
      'maraqi-al-falah',
      'nahw-mir',
      'sarf-mir',
      'hidayat-al-nahw',
      'ilm-seeghah',
      'tayseer-al-mantiq',
      'al-qiraah-al-wadihah',
      'al-aqeedah-al-tahawiyyah',
      'riyad-al-salihin'
    ]
  }
];

export function getDarjaForBookSlug(slug: string): WifaqDarja | undefined {
  return WIFAQ_DARJAT.find(d => d.bookSlugs.includes(slug));
}
