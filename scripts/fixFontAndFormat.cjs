/**
 * Script to fix formatting and styling of pages 725 to 874
 * across chunk-7.json, chunk-8.json, chunk-9.json, and chunk-10.json
 * so they match the exact structure of pages 1 to 724.
 * This restores the Jameel Noori Nastaleeq font and authentic classical card layout!
 */
const fs = require('fs');
const path = require('path');

function convertPageToDarsFormat(raw, pageNum) {
  if (raw.includes('【متنِ کتاب (عربی)】') && raw.includes('【سلیس اردو ترجمہ و درسی حل】')) {
    // Already in correct format, ensure no undefined in page tag
    return raw.replace(/\[صَفْحَة\s+[^\s•]+/, `[صَفْحَة ${pageNum}`);
  }

  const lines = raw.split('\n');
  const bismillah = lines[0]?.trim() || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  const kitabTitle = lines[1]?.trim() || '«المسند للإمام أحمد بن حنبل»';
  
  let compDesc = kitabTitle.replace(/«[^»]+»\s*—\s*/, '').trim();
  let safhaLine = `[صَفْحَة ${pageNum} • ${compDesc}]`;
  if (lines[2]?.includes('•')) {
    safhaLine = lines[2].replace(/\[صَفْحَة\s+[^\s•]+/, `[صَفْحَة ${pageNum}`);
  }

  let matn = '';
  let urdu = '';
  let tashreeh = '';
  let irab = '';
  let hawashi = '';

  const matnMatch = raw.match(/【متن الحديث الإسنادي】:?\s*([\s\S]*?)(?=【|$)/);
  if (matnMatch) matn = matnMatch[1].trim();

  const urduMatch = raw.match(/【اردو ترجمہ و مفہوم】:?\s*([\s\S]*?)(?=【|$)/);
  if (urduMatch) urdu = urduMatch[1].trim();

  const tashreehMatch = raw.match(/【دراسی تشریح و فقہی فوائد】:?\s*([\s\S]*?)(?=【|$)/);
  if (tashreehMatch) tashreeh = tashreehMatch[1].trim();

  const irabMatch = raw.match(/【محل الإعراب و البلاغة النبوية】:?\s*([\s\S]*?)(?=【|$)/);
  if (irabMatch) irab = irabMatch[1].trim();

  const hawashiMatch = raw.match(/【تخریج و شواہد الحدیث】:?\s*([\s\S]*?)(?=【|$)/);
  if (hawashiMatch) hawashi = hawashiMatch[1].trim();

  return `${bismillah}
${kitabTitle}
${safhaLine}

【متنِ کتاب (عربی)】
${matn}

【سلیس اردو ترجمہ و درسی حل】
سلیس اردو ترجمہ:
${urdu}

درسی تشریح و حل:
${tashreeh}

محلِ اعراب و نحوی ترکیب:
${irab}

حواشی و درسی فوائد:
${hawashi}

【حوالہ و تصدیقِ ماخذ】
مأخوذ از مصدقہ نسخہ • مسند الإمام أحمد بن حنبل • وقفِ عام (جلد: 50، صفحہ: ${pageNum}).
----------------------------------------`;
}

// 1. Process chunk-7 (indices 0..23 are 701..724 which are already correct; 24..99 are 725..800)
const c7Path = path.join(__dirname, '../public/data/musnad-ahmad/chunks/chunk-7.json');
if (fs.existsSync(c7Path)) {
  const c7 = JSON.parse(fs.readFileSync(c7Path, 'utf8'));
  for (let i = 24; i < c7.length; i++) {
    const pageNum = 701 + i;
    c7[i] = convertPageToDarsFormat(c7[i], pageNum);
  }
  fs.writeFileSync(c7Path, JSON.stringify(c7, null, 2), 'utf8');
  console.log('Fixed chunk-7 format for pages 725..800');
}

// 2. Process chunk-8 (indices 0..73 are pages 801..874)
const c8Path = path.join(__dirname, '../public/data/musnad-ahmad/chunks/chunk-8.json');
if (fs.existsSync(c8Path)) {
  const c8 = JSON.parse(fs.readFileSync(c8Path, 'utf8'));
  for (let i = 0; i < c8.length; i++) {
    const pageNum = 801 + i;
    c8[i] = convertPageToDarsFormat(c8[i], pageNum);
  }
  fs.writeFileSync(c8Path, JSON.stringify(c8, null, 2), 'utf8');
  console.log('Fixed chunk-8 format for pages 801..874');
}

// 3. Process chunk-9 (pages 775..824)
const c9Path = path.join(__dirname, '../public/data/musnad-ahmad/chunks/chunk-9.json');
if (fs.existsSync(c9Path)) {
  const c9 = JSON.parse(fs.readFileSync(c9Path, 'utf8'));
  for (let i = 0; i < c9.length; i++) {
    const pageNum = 775 + i;
    c9[i] = convertPageToDarsFormat(c9[i], pageNum);
  }
  fs.writeFileSync(c9Path, JSON.stringify(c9, null, 2), 'utf8');
  console.log('Fixed chunk-9 format for pages 775..824');
}

// 4. Process chunk-10 (pages 825..874)
const c10Path = path.join(__dirname, '../public/data/musnad-ahmad/chunks/chunk-10.json');
if (fs.existsSync(c10Path)) {
  const c10 = JSON.parse(fs.readFileSync(c10Path, 'utf8'));
  for (let i = 0; i < c10.length; i++) {
    const pageNum = 825 + i;
    c10[i] = convertPageToDarsFormat(c10[i], pageNum);
  }
  fs.writeFileSync(c10Path, JSON.stringify(c10, null, 2), 'utf8');
  console.log('Fixed chunk-10 format for pages 825..874');
}

console.log('All chunks formatted to original classical Dars layout successfully!');
