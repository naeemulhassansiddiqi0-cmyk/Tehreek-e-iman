import fs from 'fs';

// Load publicDomainBooks metadata
const content = fs.readFileSync('src/data/publicDomainBooks.ts', 'utf-8');
const rawPubMatches = content.match(/const rawPublicDomainBooks: RawPublicDomainBook\[\] = \[([\s\S]*?)\];/);

const books = [];
const itemRegex = /\{[\s\S]*?"id":\s*"([^"]+)"[\s\S]*?"slug":\s*"([^"]+)"[\s\S]*?"title_ur":\s*"([^"]+)"[\s\S]*?"title_ar":\s*"([^"]+)"[\s\S]*?"category":\s*"([^"]+)"[\s\S]*?\}/g;

let match;
while ((match = itemRegex.exec(rawPubMatches[1])) !== null) {
  books.push({
    id: match[1],
    slug: match[2],
    title_ur: match[3],
    title_ar: match[4],
    category: match[5]
  });
}

function simulateGetDarsChapters(slugOrId) {
  const s = slugOrId.toLowerCase();
  if (s.includes('nahw-mir') || s.includes('nahw_mir')) return 'nahwMirChapters';
  if (s.includes('sarf-mir') || s.includes('sarf_mir')) return 'sarfMirChapters';
  if (s.includes('ilm-seeghah') || s.includes('ilm_seeghah')) return 'ilmSeeghahChapters';
  if (s.includes('fusool-akbari') || s.includes('fusool_akbari')) return 'fusoolAkbariChapters';
  if (s.includes('hidayat') && s.includes('nahw')) return 'hidayatNahwChapters';
  if (s.includes('kafiya')) return 'kafiyaChapters';
  if (s.includes('sharh-jami') || s.includes('sharh_jami')) return 'sharhJamiChapters';
  if (s.includes('nur-al-idah') || s.includes('nur_idah')) return 'nurIdahChapters';
  if (s.includes('quduri')) return 'quduriChapters';
  if (s.includes('kanz')) return 'kanzChapters';
  if (s.includes('sharh-al-wiqayah') || s.includes('sharh_wiqayah') || s.includes('wiqayah')) return 'sharhWiqayahChapters';
  if (s.includes('hidayah')) return 'hidayahChapters';
  if (s.includes('mala-budda') || s.includes('mala_budda')) return 'malaBuddaChapters';
  if (s.includes('shashi')) return 'usulShashiChapters';
  if (s.includes('nuranwar') || s.includes('nur-al-anwar')) return 'nuranwarChapters';
  if (s.includes('husami')) return 'husamiChapters';
  if (s.includes('musallam')) return 'musallamThubutChapters';
  if (s.includes('tayseer-al-mantiq') || s.includes('tayseer_mantiq')) return 'tayseerMantiqChapters';
  if (s.includes('mirqat')) return 'mirqatChapters';
  if (s.includes('tahdhib') || s.includes('sharh-al-tahdhib')) return 'sharhTahdhibChapters';
  if (s.includes('qutbi')) return 'qutbiChapters';
  if (s.includes('duroos-al-balaghah') || s.includes('duroos_balaghah')) return 'duroosBalaghahChapters';
  if (s.includes('mukhtasar-al-maani') || s.includes('mukhtasar_maani') || s.includes('maani')) return 'mukhtasarMaaniChapters';
  if (s.includes('diwan-al-hamasah') || s.includes('hamasah')) return 'diwanHamasahChapters';
  if (s.includes('maqamat')) return 'maqamatHaririChapters';
  if (s.includes('qiraah-al-wadihah') || s.includes('qiraah_wadihah') || s.includes('wadihah')) return 'qiraahWadihahChapters';
  if (s.includes('tahawiyyah') || s.includes('aqeedah-al-tahawiyyah')) return 'aqeedahTahawiyyahChapters';
  if (s.includes('sharh-al-aqaid') || s.includes('aqaid-al-nasafiyyah')) return 'sharhAqaidChapters';
  if (s.includes('siraji')) return 'sirajiChapters';
  if (s.includes('fawz-al-kabir') || s.includes('fawz_kabir')) return 'fawzKabirChapters';
  if (s.includes('jalalayn')) return 'jalalaynChapters';
  if (s.includes('nukhbat')) return 'nukhbatFikarChapters';
  if (s.includes('mishkat')) return 'mishkatChapters';
  if (s.includes('muwatta-imam-muhammad') || s.includes('muwatta_muhammad')) return 'muwattaMuhammadChapters';
  if (s.includes('shamail')) return 'shamailTirmidhiChapters';
  if (s.includes('riyadh')) return 'riyadhSaliheenChapters';
  if (s.includes('musnad-ahmad') || s.includes('musnad_ahmad') || (s.includes('musnad') && s.includes('ahmad'))) return 'musnadAhmad';
  if (s.includes('darimi') || s.includes('al-darimi') || s.includes('sunan-al-darimi')) return 'sunanDarimiChapters';
  if (s.includes('abi-yaala') || s.includes('abi_yaala') || s.includes('yaala')) return 'musnadAbiYaalaChapters';
  if (s.includes('tabarani') || s.includes('al-mujam-al-kabir') || s.includes('mujam-al-kabir')) return 'tabaraniKabirChapters';
  if (s.includes('bulugh') || s.includes('maram')) return 'bulughAlMaramChapters';
  if (s.includes('bazzar') || s.includes('al-bazzar') || s.includes('bahr-al-zakhkhar')) return 'bazzarChapters';
  if (s.includes('adab-al-mufrad') || s.includes('adab_mufrad') || s.includes('al-adab-al-mufrad') || s.includes('adab-mufrad')) return 'adabMufradChapters';
  if (s.includes('abd-al-razzaq') || s.includes('musannaf-abd-al-razzaq') || s.includes('abdur-razzaq') || s.includes('abdurrazzaq')) return 'musannafAbdAlRazzaqChapters';
  if (s.includes('ibn-abi-shaybah') || s.includes('ibn_abi_shaybah') || s.includes('abi-shaybah') || s.includes('musannaf-ibn-abi-shaybah')) return 'musannafIbnAbiShaybahChapters';
  if (s.includes('ibn-hibban') || s.includes('ibn_hibban') || s.includes('sahih-ibn-hibban')) return 'sahihIbnHibbanChapters';
  if (s.includes('mustadrak') || s.includes('hakim') || s.includes('al-mustadrak') || s.includes('mustadrak-hakim')) return 'mustadrakHakimChapters';
  if (s.includes('bayhaqi') || s.includes('al-bayhaqi') || s.includes('sunan-al-kubra') || s.includes('sunan-kubra') || s.includes('kubra-bayhaqi')) return 'sunanKubraBeyhaqiChapters';
  if (s.includes('baghawi') || s.includes('al-baghawi') || s.includes('sharh-al-sunnah') || s.includes('sharh-sunnah') || s.includes('sharh-al-sunna')) return 'sharhSunnahBaghawiChapters';
  if (s.includes('haythami') || s.includes('al-haythami') || s.includes('majma') || s.includes('majma-al-zawaid') || s.includes('zawaid')) return 'majmaZawaidHaythamiChapters';
  if (s.includes('kanz') || s.includes('kanz-al-ummal') || s.includes('kanz-ul-ammal') || s.includes('muttaqi') || s.includes('al-muttaqi')) return 'kanzUlAmmalChapters';
  if (s.includes('tuhfa') || s.includes('tuhfat') || s.includes('ahwazi') || s.includes('al-ahwazi') || s.includes('mubarakpuri') || s.includes('mubarkpuri')) return 'tuhfatAlAhwaziChapters';
  if (s.includes('nayl') || s.includes('awtar') || s.includes('nayl-al-awtar') || s.includes('shaukani') || s.includes('shawkani') || s.includes('al-shawkani')) return 'naylAlAwtarChapters';
  if (s.includes('daraqutni') || s.includes('al-daraqutni') || s.includes('sunan-daraqutni')) return 'sunanDaraqutniChapters';
  if (s.includes('ibn-majah') || s.includes('ibn-maja') || s.includes('sunan-ibn-majah')) return 'sunanIbnMajahChapters';
  if (s.includes('muwatta') || s.includes('malik') || s.includes('imam-malik')) return 'muwattaMalikChapters';
  if (s.includes('abi-dawud') || s.includes('abu-dawud') || s.includes('abu-dawood') || s.includes('sunan-abi-dawud')) return 'sunanAbiDawudChapters';
  if (s.includes('ibn-khuzaymah') || s.includes('ibn-khuzaima') || s.includes('sahih-ibn-khuzaymah')) return 'sahihIbnKhuzaymahChapters';
  if (s.includes('shuab') || s.includes('shoab') || s.includes('shuab-al-iman') || s.includes('bayhaqi-shuab')) return 'shuabAlImanChapters';
  if (s.includes('tahawi') || s.includes('maani') || s.includes('athar') || s.includes('sharh-maani-al-athar')) return 'sharhMaaniAlAtharChapters';
  if (s.includes('jami') || s.includes('ulum') || s.includes('hikam') || s.includes('ibn-rajab') || s.includes('jami-al-ulum')) return 'jamiAlUlumChapters';
  if (s.includes('tabari') || s.includes('jami-al-bayan') || s.includes('tafsir-tabari')) return 'tafsirTabariChapters';
  if (s.includes('ibn-kathir') || s.includes('tafsir-ibn-kathir') || s.includes('quran-al-azim')) return 'tafsirIbnKathirChapters';
  if (s.includes('qurtubi') || s.includes('jami-li-ahkam') || s.includes('tafsir-qurtubi')) return 'tafsirQurtubiChapters';
  if (s.includes('baghawi') || s.includes('maalim-al-tanzil') || s.includes('tafsir-baghawi')) return 'tafsirBaghawiChapters';
  if (s.includes('razi') || s.includes('mafatih') || s.includes('tafsir-kabir') || s.includes('tafsir-razi')) return 'tafsirRaziChapters';
  if (s.includes('maturidi') || s.includes('taawilat') || s.includes('ahl-al-sunnah') || s.includes('tafsir-maturidi')) return 'tafsirMaturidiChapters';
  if (s.includes('baydawi') || s.includes('anwar') || s.includes('tanzil') || s.includes('tafsir-baydawi')) return 'tafsirBaydawiChapters';
  if (s.includes('fiqh-al-akbar') || s.includes('fiqh_akbar') || s.includes('al-fiqh-al-akbar')) return 'alFiqhAlAkbarChapters';
  if (s.includes('tahawiyyah') || s.includes('aqeedah-al-tahawiyyah') || s.includes('aqidah_tahawiyyah')) {
    if (s.includes('sharah') || s.includes('sharh')) return 'sharhTahawiyyahChapters';
    return 'aqidahTahawiyyahChapters';
  }
  if (s.includes('lumah-itiqad') || s.includes('lumah_itiqad') || s.includes('lumat-al-itiqad')) return 'lumatAlItiqadChapters';
  if (s.includes('wasitiyyah') || s.includes('aqeedah-wasitiyyah')) return 'aqeedahWasitiyyahChapters';
  if (s.includes('ibn-khuzaymah') || s.includes('ibn_khuzaymah') || s.includes('kitab-tawheed')) return 'tawheedIbnKhuzaymahChapters';
  if (s.includes('ibana') || s.includes('al-ibanah')) return 'ibanaAshariChapters';
  if (s.includes('sawaiq') || s.includes('al-sawaiq') || s.includes('jawziyyah')) return 'sawaiqMursalahChapters';
  if (s.includes('minhaj') || s.includes('sunnah') || s.includes('taymiyyah')) return 'minhajSunnahChapters';
  if (s.includes('darr') || s.includes('taarud') || s.includes('taaruz')) return 'darrTaarudChapters';
  if (s.includes('haqiqat') || s.includes('iman_salafi') || s.includes('ghuluw')) return 'haqiqatImanChapters';
  if (s.includes('fiqh_akbar') || s.includes('fiqhakbar') || s.includes('abu_hanifah') || s.includes('abu-hanifah')) return 'fiqhAkbarKharjiChapters';
  return null;
}

let withDedicatedChapters = 0;
let withCurriculum = 0;

for (const b of books) {
  const ch = simulateGetDarsChapters(b.slug) || simulateGetDarsChapters(b.id);
  if (ch) {
    withDedicatedChapters++;
  } else {
    withCurriculum++;
  }
}

console.log(`Books with dedicated Dars chapters: ${withDedicatedChapters}`);
console.log(`Books with standard Islamic discipline curriculum (50 pages): ${withCurriculum}`);
console.log(`Total: ${withDedicatedChapters + withCurriculum}`);
