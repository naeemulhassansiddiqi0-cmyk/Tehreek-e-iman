const fs = require('fs');
const readline = require('readline');

function detectSahabiAndTitle(text, num) {
  const clean = text.replace(/‏/g, '').replace(/\s+/g, ' ').trim();

  // Known major ranges from classical Musnad Ahmad (Mu'assasat al-Risalah)
  if (num <= 80) {
    return { sahabi_ar: "أَبِي بَكْرٍ الصِّدِّيقِ", sahabi_ur: "ابوبکر صدیق", musnad_ur: "مسندِ حضرت ابوبکر صدیق رضی اللہ عنہ" };
  } else if (num <= 389) {
    return { sahabi_ar: "عُمَرَ بْنِ الْخَطَّابِ", sahabi_ur: "عمر بن الخطاب", musnad_ur: "مسندِ فاروقِ اعظم حضرت عمر بن الخطاب رضی اللہ عنہ" };
  } else if (num <= 561) {
    return { sahabi_ar: "عُثْمَانَ بْنِ عَفَّانَ", sahabi_ur: "عثمان بن عفان", musnad_ur: "مسندِ ذو النورین حضرت عثمان غنی رضی اللہ عنہ" };
  } else if (num <= 1380) {
    return { sahabi_ar: "عَلِيِّ بْنِ أَبِي طَالِبٍ", sahabi_ur: "علی بن ابی طالب", musnad_ur: "مسندِ امیر المؤمنین حضرت علی المرتضیٰ رضی اللہ عنہ" };
  } else if (num <= 1400) {
    return { sahabi_ar: "طَلْحَةَ بْنِ عُبَيْدِ اللَّهِ", sahabi_ur: "طلحہ بن عبید اللہ", musnad_ur: "مسندِ حضرت طلحہ بن عبید اللہ رضی اللہ عنہ" };
  } else if (num <= 1425) {
    return { sahabi_ar: "الزُّبَيْرِ بْنِ الْعَوَّامِ", sahabi_ur: "زبیر بن عوام", musnad_ur: "مسندِ حضرت زبیر بن عوام رضی اللہ عنہ" };
  } else if (num <= 1650) {
    return { sahabi_ar: "سَعْدِ بْنِ أَبِي وَقَّاصٍ", sahabi_ur: "سعد بن ابی وقاص", musnad_ur: "مسندِ حضرت سعد بن ابی وقاص رضی اللہ عنہ" };
  } else if (num <= 1675) {
    return { sahabi_ar: "سَعِيدِ بْنِ زَيْدٍ", sahabi_ur: "سعید بن زید", musnad_ur: "مسندِ حضرت سعید بن زید رضی اللہ عنہ" };
  } else if (num <= 1700) {
    return { sahabi_ar: "عَبْدِ الرَّحْمَنِ بْنِ عَوْفٍ", sahabi_ur: "عبد الرحمن بن عوف", musnad_ur: "مسندِ حضرت عبد الرحمن بن عوف رضی اللہ عنہ" };
  } else if (num <= 1720) {
    return { sahabi_ar: "أَبِي عُبَيْدَةَ بْنِ الْجَرَّاحِ", sahabi_ur: "ابوعبیدہ بن جراح", musnad_ur: "مسندِ امین الامت حضرت ابو عبیدہ بن جراح رضی اللہ عنہ" };
  }

  // Text-based detection for remaining ranges
  if (clean.includes('عَائِشَةَ') || (num >= 23500 && num <= 25700)) {
    return { sahabi_ar: "عَائِشَةَ أُمِّ الْمُؤْمِنِينَ", sahabi_ur: "ام المؤمنین حضرت عائشہ صدیقہ", musnad_ur: "مسندِ ام المؤمنین سیدہ عائشہ صدیقہ رضی اللہ عنہا" };
  }
  if (clean.includes('أَبِي هُرَيْرَةَ') || (num >= 7100 && num <= 10984)) {
    return { sahabi_ar: "أَبِي هُرَيْرَةَ", sahabi_ur: "ابو ہریرہ", musnad_ur: "مسندِ حافظ الحدیث حضرت ابو ہریرہ رضی اللہ عنہ" };
  }
  if (clean.includes('أَنَسِ بْنِ مَالِكٍ') || (num >= 11931 && num <= 14112)) {
    return { sahabi_ar: "أَنَسِ بْنِ مَالِكٍ", sahabi_ur: "انس بن مالک", musnad_ur: "مسندِ خادمِ رسول حضرت انس بن مالک رضی اللہ عنہ" };
  }
  if (clean.includes('جَابِرِ بْنِ عَبْدِ اللَّهِ') || (num >= 14113 && num <= 15300)) {
    return { sahabi_ar: "جَابِرِ بْنِ عَبْدِ اللَّهِ", sahabi_ur: "جابر بن عبد اللہ", musnad_ur: "مسندِ حضرت جابر بن عبد اللہ رضی اللہ عنہ" };
  }
  if (clean.includes('أَبِي سَعِيدٍ الْخُدْرِيِّ') || (num >= 10985 && num <= 11930)) {
    return { sahabi_ar: "أَبِي سَعِيدٍ الْخُدْرِيِّ", sahabi_ur: "ابو سعید خدری", musnad_ur: "مسندِ حضرت ابو سعید الخدری رضی اللہ عنہ" };
  }
  if (clean.includes('ابْنِ عُمَرَ') || clean.includes('عَبْدِ اللَّهِ بْنِ عُمَرَ')) {
    return { sahabi_ar: "عَبْدِ اللَّهِ بْنِ عُمَرَ", sahabi_ur: "عبد اللہ بن عمر", musnad_ur: "مسندِ حضرت عبد اللہ بن عمر رضی اللہ عنہما" };
  }
  if (clean.includes('ابْنِ عَبَّاسٍ') || clean.includes('عَبْدِ اللَّهِ بْنِ عَبَّاسٍ')) {
    return { sahabi_ar: "عَبْدِ اللَّهِ بْنِ الْعَبَّاسِ", sahabi_ur: "عبد اللہ بن عباس", musnad_ur: "مسندِ ترجمان القرآن حضرت عبد اللہ بن عباس رضی اللہ عنہما" };
  }
  if (clean.includes('ابْنِ مَسْعُودٍ') || clean.includes('عَبْدِ اللَّهِ بْنِ مَسْعُودٍ')) {
    return { sahabi_ar: "عَبْدِ اللَّهِ بْنِ مَسْعُودٍ", sahabi_ur: "عبد اللہ بن مسعود", musnad_ur: "مسندِ فقیہ الامت حضرت عبد اللہ بن مسعود رضی اللہ عنہ" };
  }
  if (clean.includes('عَبْدِ اللَّهِ بْنِ عَمْرٍو')) {
    return { sahabi_ar: "عَبْدِ اللَّهِ بْنِ عَمْرِو بْنِ الْعَاصِ", sahabi_ur: "عبد اللہ بن عمرو بن عاص", musnad_ur: "مسندِ حضرت عبد اللہ بن عمرو بن العاص رضی اللہ عنہما" };
  }
  if (clean.includes('الْبَرَاءِ بْنِ عَازِبٍ')) {
    return { sahabi_ar: "الْبَرَاءِ بْنِ عَازِبٍ", sahabi_ur: "براء بن عازب", musnad_ur: "مسندِ حضرت براء بن عازب رضی اللہ عنہ" };
  }
  if (clean.includes('مُعَاذِ بْنِ جَبَلٍ')) {
    return { sahabi_ar: "مُعَاذِ بْنِ جَبَلٍ", sahabi_ur: "معاذ بن جبل", musnad_ur: "مسندِ حضرت معاذ بن جبل رضی اللہ عنہ" };
  }
  if (clean.includes('أَبِي أَيُّوبَ')) {
    return { sahabi_ar: "أَبِي أَيُّوبَ الْأَنْصَارِيِّ", sahabi_ur: "ابو ایوب انصاری", musnad_ur: "مسندِ میزبانِ رسول حضرت ابو ایوب انصاری رضی اللہ عنہ" };
  }
  if (clean.includes('أَبِي ذَرٍّ')) {
    return { sahabi_ar: "أَبِي ذَرٍّ الْغِفَارِيِّ", sahabi_ur: "ابو ذر غفاری", musnad_ur: "مسندِ زاہدِ صحابہ حضرت ابو ذر الغفاری رضی اللہ عنہ" };
  }
  if (clean.includes('حُذَيْفَةَ')) {
    return { sahabi_ar: "حُذَيْفَةَ بْنِ الْيَمَانِ", sahabi_ur: "حذیفہ بن یمان", musnad_ur: "مسندِ امینِ سرِّ رسول حضرت حذیفہ بن الیمان رضی اللہ عنہ" };
  }
  if (clean.includes('عُقْبَةَ بْنِ عَامِرٍ')) {
    return { sahabi_ar: "عُقْبَةَ بْنِ عَامِرٍ", sahabi_ur: "عقبہ بن عامر", musnad_ur: "مسندِ حضرت عقبہ بن عامر رضی اللہ عنہ" };
  }
  if (clean.includes('سَلَمَةَ بْنِ الْأَكْوَعِ')) {
    return { sahabi_ar: "سَلَمَةَ بْنِ الْأَكْوَعِ", sahabi_ur: "سلمہ بن اکوع", musnad_ur: "مسندِ حضرت سلمہ بن اکوع رضی اللہ عنہ" };
  }
  if (clean.includes('صُهَيْبٍ')) {
    return { sahabi_ar: "صُهَيْبٍ الرُّومِيِّ", sahabi_ur: "صہیب رومی", musnad_ur: "مسندِ حضرت صہیب رومی رضی اللہ عنہ" };
  }
  if (clean.includes('بِلَالٍ')) {
    return { sahabi_ar: "بِلَالِ بْنِ رَبَاحٍ", sahabi_ur: "بلال بن رباح", musnad_ur: "مسندِ مؤذنِ رسول حضرت بلال بن رباح رضی اللہ عنہ" };
  }
  if (clean.includes('أُمِّ سَلَمَةَ')) {
    return { sahabi_ar: "أُمِّ سَلَمَةَ أُمِّ الْمُؤْمِنِينَ", sahabi_ur: "ام سلمہ", musnad_ur: "مسندِ ام المؤمنین سیدہ ام سلمہ رضی اللہ عنہا" };
  }
  if (clean.includes('مَيْمُونَةَ')) {
    return { sahabi_ar: "مَيْمُونَةَ أُمِّ الْمُؤْمِنِينَ", sahabi_ur: "میمونہ", musnad_ur: "مسندِ ام المؤمنین سیدہ میمونہ رضی اللہ عنہا" };
  }
  if (clean.includes('حَفْصَةَ')) {
    return { sahabi_ar: "حَفْصَةَ أُمِّ الْمُؤْمِنِينَ", sahabi_ur: "حفصہ", musnad_ur: "مسندِ ام المؤمنین سیدہ حفصہ رضی اللہ عنہا" };
  }
  if (clean.includes('أَسْمَاءَ بِنْتِ أَبِي بَكْرٍ') || clean.includes('أَسْمَاءَ')) {
    return { sahabi_ar: "أَسْمَاءَ بِنْتِ أَبِي بَكْرٍ", sahabi_ur: "اسماء بنت ابوبکر", musnad_ur: "مسندِ سیدہ اسماء بنت ابی بکر صدیق رضی اللہ عنہما" };
  }
  if (clean.includes('فَاطِمَةَ')) {
    return { sahabi_ar: "فَاطِمَةَ الزَّهْرَاءِ", sahabi_ur: "فاطمۃ الزہراء", musnad_ur: "مسندِ سیدۃ نساء اہل الجنة حضرت فاطمۃ الزہراء رضی اللہ عنہا" };
  }

  // Fallback based on volume/section
  if (num >= 23500) {
    return { sahabi_ar: "النِّسَاءِ وَأُمَّهَاتِ الْمُؤْمِنِينَ", sahabi_ur: "امہات المؤمنین و صحابیات", musnad_ur: "مسندِ امہات المؤمنین و صحابیات رضی اللہ عنہن" };
  }
  if (num >= 15301 && num <= 23499) {
    return { sahabi_ar: "الْأَنْصَارِ وَسَائِرِ الصَّحَابَةِ", sahabi_ur: "انصار و دیگر صحابہ کرام", musnad_ur: "مسندِ انصار و جلیل القدر صحابۂ کرام رضی اللہ عنہم" };
  }

  return { sahabi_ar: "الصَّحَابِيِّ الْجَلِيلِ", sahabi_ur: "جلیل القدر صحابی", musnad_ur: "مسندِ جلیل القدر صحابیِ رسول رضی اللہ عنہ" };
}

console.log('Testing detector on samples...');
console.log(detectSahabiAndTitle('حَدَّثَنَا عَبْدُ اللَّهِ حَدَّثَنَا أَبِي ثَنَا يَحْيَى عَنْ شُعْبَةَ عَنْ أَبِي هُرَيْرَةَ قَالَ', 8500));
console.log(detectSahabiAndTitle('حَدَّثَنَا وَكِيعٌ عَنْ عَائِشَةَ قَالَتْ', 24200));
console.log(detectSahabiAndTitle('حَدَّثَنَا يَزِيدُ عَنْ أَنَسِ بْنِ مَالِكٍ', 12500));
