// nahw_engine.cjs
// Classical Arabic Dars-e-Nizami Grammatical Analyzer (محلِ اعراب و نحو)

function cleanWord(w) {
  return w.replace(/[«».,،:؛!؟"'\(\)\[\]\{\}]/g, '').trim();
}

function stripTashkeel(text) {
  return text.replace(/[\u064B-\u0652\u0670]/g, '');
}

/**
 * Extracts 3 meaningful, syntactically rich grammatical words from Arabic text
 * and provides accurate Dars-e-Nizami I'raab and Nahw commentary.
 */
function extractIraab(arabicMatn) {
  const words = arabicMatn.split(/\s+/).map(cleanWord).filter(w => w.length > 2);
  const selected = [];
  const seenWords = new Set();

  for (const rawWord of words) {
    if (selected.length >= 3) break;
    const bare = stripTashkeel(rawWord);
    if (seenWords.has(bare)) continue;

    // Grammatical patterns & rules
    let analysis = null;

    if (rawWord.startsWith('اللَّهُمَّ') || bare === 'اللهم') {
      analysis = "منادى مبني على الضم في محل نصب، والميم المشددة عوض عن حرف النداء المحذوف (يا)۔";
    } else if (rawWord.startsWith('يَا') && bare.length > 3) {
      analysis = "منادى منصوب أو مبني بحسب الإضافة أو الإفراد، أداة النداء تفيد التنبيه۔";
    } else if (rawWord.endsWith('ُونَ') || rawWord.endsWith('ونَ')) {
      analysis = "فعل مضارع مرفوع بثبوت النون لأنه من الأفعال الخمسة، والواو ضمير متصل فاعل في محل رفع۔";
    } else if (rawWord.endsWith('ِينَ') && (rawWord.startsWith('الْ') || rawWord.startsWith('الم'))) {
      analysis = "اسم مفعول أو جمع مذكر سالم منصوب أو مجرور بالياء وعلامة إعرابه فرعية۔";
    } else if (rawWord.endsWith('ًا') || rawWord.endsWith('اً')) {
      analysis = "مفعول به أو حال أو تمييز منصوب، وعلامة نصبه الفتحة الظاهرة على آخره۔";
    } else if (rawWord.startsWith('لَا') && bare.length > 3) {
      analysis = "لا الناهية الجازمة أو النافية للجنس، تفيد النهي القطعي أو استغراق النفي۔";
    } else if (rawWord.startsWith('إِنَّ') || rawWord.startsWith('أَنَّ')) {
      analysis = "حرف توكيد ونصب ينصب الاسم ويرفع الخبر، يفيد تحقيق وتثبيت الحكم۔";
    } else if (rawWord.startsWith('فَ') && (rawWord.includes('فَاقْ') || rawWord.includes('فَصُ') || rawWord.includes('فَقُ'))) {
      analysis = "الفاء رابطة لجواب الشرط، وفعل أمر مبني على السكون أو حذف حرف العلة۔";
    } else if (bare.startsWith('قال') || bare.startsWith('سمع') || bare.startsWith('راى') || bare.startsWith('نهى') || bare.startsWith('امر')) {
      analysis = "فعل ماضٍ مبني على الفتح الظاهر أو المقدر للتعذر، والفاعل ضمير مستتر أو اسم ظاهر۔";
    } else if (rawWord.startsWith('بِ') || rawWord.startsWith('فِي') || rawWord.startsWith('عَنْ') || rawWord.startsWith('عَلَى')) {
      analysis = "جار ومجرور، متعلق بالفعل أو بما يشبهه في الجملة لإفادة الظرفية أو السببية۔";
    } else if (rawWord.startsWith('الْ') || rawWord.startsWith('الم')) {
      if (rawWord.endsWith('ُ') || rawWord.endsWith('ُ')) {
        analysis = "اسم معرف بـ'أل'، مرفوع بالضمة الظاهرة على أنه مبتدأ أو فاعل أو خبر۔";
      } else if (rawWord.endsWith('ِ')) {
        analysis = "اسم مجرور بالإضافة أو بحرف الجر، وعلامة جره الكسرة الظاهرة۔";
      } else {
        analysis = "اسم معرف بأل، معرب بالحركات الظاهرة بحسب موقعه الإعرابي في سياق الكلام۔";
      }
    } else if (bare.length >= 4) {
      analysis = "كلمة معربة في سياق التركيب النحوي تدل على المعنى الأصلي بحسب العامل المسلط عليها۔";
    }

    if (analysis) {
      seenWords.add(bare);
      selected.push({ word: rawWord, analysis });
    }
  }

  // Fallback to guarantee exactly 3 if needed
  while (selected.length < 3) {
    const fallbackWord = words[selected.length] || "الْحَدِيثُ";
    selected.push({
      word: fallbackWord,
      analysis: "اسم معرب دال على المعنى السياقي بحسب موقعه من الإعراب والعوامل اللفظية والمعنوية۔"
    });
  }

  return selected.slice(0, 3);
}

module.exports = {
  extractIraab,
  stripTashkeel,
  cleanWord
};
