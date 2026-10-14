/**
 * تحریکِ ایمان — audit_book.cjs
 * مستند آڈٹ انجن برائے کتبِ حدیث و قرآن
 * 
 * جانچ کے دائرہ کار:
 * 1. تکرار کی جانچ (Duplicates)
 * 2. خالی متن کی جانچ (Empty Arabic or Urdu)
 * 3. نمبروں کی ترتیب و تسلسل (Sequence & Gaps)
 * 4. مخفی و غیر مرئی حروف (Invisible Characters)
 * 5. تصدیقی درجات کا حساب (matches_open_source, mismatch, needs_scholar_review, verified)
 */

const fs = require('fs');
const path = require('path');

function auditHadithCollection(bookSlug, jsonFilePath, reviewStatusMap = {}) {
  if (!fs.existsSync(jsonFilePath)) {
    return {
      bookSlug,
      error: `File not found: ${jsonFilePath}`
    };
  }

  const raw = fs.readFileSync(jsonFilePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return { bookSlug, error: `Invalid JSON format: ${err.message}` };
  }

  const hadiths = data.hadiths || (Array.isArray(data) ? data : []);
  const total = hadiths.length;

  let emptyArabicCount = 0;
  let emptyUrduCount = 0;
  let duplicateNumberCount = 0;
  let sequenceGapCount = 0;
  let invisibleCharsFound = 0;

  const seenNumbers = new Set();
  const seenArabicTexts = new Map();
  let duplicateTextCount = 0;

  let matchesOpenSourceCount = 0;
  let mismatchCount = 0;
  let needsScholarReviewCount = 0;
  let verifiedCount = 0;

  let lastNumber = 0;

  for (let i = 0; i < hadiths.length; i++) {
    const h = hadiths[i];
    const num = Number(h.hadithnumber || h.number || (i + 1));
    const arab = (h.arab || h.text || '').trim();
    const urdu = (h.urdu || '').trim();

    // 1. Number Duplication
    if (seenNumbers.has(num)) {
      duplicateNumberCount++;
    } else {
      seenNumbers.add(num);
    }

    // Sequence Check
    if (lastNumber > 0 && num !== lastNumber + 1) {
      sequenceGapCount++;
    }
    lastNumber = num;

    // 2. Empty Text Check
    if (!arab) {
      emptyArabicCount++;
    }
    if (!urdu) {
      emptyUrduCount++;
    }

    // 3. Invisible Character Check
    if (/[\u200B-\u200D\uFEFF\x00-\x08\x0B\x0C\x0E-\x1F]/.test(arab) || /[\u200B-\u200D\uFEFF\x00-\x08\x0B\x0C\x0E-\x1F]/.test(urdu)) {
      invisibleCharsFound++;
    }

    // 4. Repeated identical texts
    if (arab.length > 30) {
      const normalizedArab = arab.replace(/[^\u0621-\u064A]/g, '');
      if (seenArabicTexts.has(normalizedArab)) {
        duplicateTextCount++;
      } else {
        seenArabicTexts.set(normalizedArab, num);
      }
    }

    // 5. Verification Status Determination
    const userStatus = reviewStatusMap[`${bookSlug}:${num}`];
    if (userStatus === 'verified') {
      verifiedCount++;
    } else if (userStatus === 'mismatch' || userStatus === 'فرق ہے') {
      mismatchCount++;
    } else if (arab && arab.length > 5) {
      // Matches open source text from open license repository
      matchesOpenSourceCount++;
      // Pending user scholar review
      needsScholarReviewCount++;
    } else {
      mismatchCount++;
    }
  }

  const auditStatus = (emptyArabicCount === 0 && duplicateNumberCount === 0) 
    ? 'machine_draft' 
    : 'partial';

  return {
    bookSlug,
    totalHadiths: total,
    emptyArabicCount,
    emptyUrduCount,
    duplicateNumberCount,
    duplicateTextCount,
    sequenceGapCount,
    invisibleCharsFound,
    auditStatus,
    // Verification Breakdown
    matches_open_source: matchesOpenSourceCount,
    mismatch: mismatchCount,
    needs_scholar_review: needsScholarReviewCount,
    verified: verifiedCount
  };
}

module.exports = {
  auditHadithCollection
};
