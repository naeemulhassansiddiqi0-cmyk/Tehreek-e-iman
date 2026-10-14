/**
 * تحریکِ ایمان — import_book.cjs
 * مستند امپورٹر برائے کتبِ حدیث و قرآن
 * اصول:
 * 1. کوئی متن، ترجمہ، حوالہ یا تخریج اپنی طرف سے نہ بنانا۔
 * 2. ماخذ سے حرف بحرف نقل، چھپے ہوئے کنٹرول حروف کی تطہیر۔
 * 3. ترجمہ نہ ہونے پر translation_status: "pending"۔
 */

const fs = require('fs');
const path = require('path');

// تطہیرِ متن: چھپے حروف اور غیر ضروری کنٹرول بائٹس صاف کرنا
function cleanText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces/BOM
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove control chars
    .trim();
}

/**
 * Hadith JSON Parser
 * Parses raw hadith API format or custom JSON
 */
function parseHadithJson(rawJsonContent, bookSlug) {
  const data = typeof rawJsonContent === 'string' ? JSON.parse(rawJsonContent) : rawJsonContent;
  const rawList = data.hadiths || (Array.isArray(data) ? data : []);

  const parsedHadiths = rawList.map((item, index) => {
    const hadithNum = item.hadithnumber || item.number || (index + 1);
    const arab = cleanText(item.arab || item.text || item.arabic || '');
    const urdu = cleanText(item.urdu || item.translation || '');

    return {
      hadithnumber: Number(hadithNum),
      number: Number(hadithNum),
      arab: arab,
      urdu: urdu || null,
      translation_status: urdu ? 'machine_draft' : 'pending'
    };
  });

  return {
    metadata: {
      name: data.metadata?.name || bookSlug,
      slug: bookSlug,
      total_hadiths: parsedHadiths.length,
      imported_at: new Date().toISOString()
    },
    hadiths: parsedHadiths
  };
}

/**
 * Tanzil / Quran Parser
 * Parses Tanzil text format (pipe-delimited: sura|aya|text) or JSON
 */
function parseQuranText(content, isUrdu = false) {
  const lines = content.split(/\r?\n/);
  const verses = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split('|');
    if (parts.length >= 3) {
      const sura = parseInt(parts[0], 10);
      const aya = parseInt(parts[1], 10);
      const text = cleanText(parts.slice(2).join('|'));
      verses.push({ sura, aya, text });
    }
  }

  return verses;
}

/**
 * Import Function
 */
function importHadithBook(sourceFilePath, outputFilePath, bookSlug) {
  console.log(`[Import] Processing: ${bookSlug} from ${sourceFilePath}`);
  if (!fs.existsSync(sourceFilePath)) {
    throw new Error(`Source file not found: ${sourceFilePath}`);
  }

  const raw = fs.readFileSync(sourceFilePath, 'utf8');
  const parsed = parseHadithJson(raw, bookSlug);

  const outDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`[Import] Successfully imported ${parsed.hadiths.length} hadiths to ${outputFilePath}`);
  return parsed;
}

module.exports = {
  cleanText,
  parseHadithJson,
  parseQuranText,
  importHadithBook
};
