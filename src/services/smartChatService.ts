import { allCatalogBooks, PublicDomainBook, ModernBook } from '../data/publicDomainBooks';

export type ChatResponsePayload =
  | {
      type: 'book_info';
      data: {
        fullName: string;
        author: string;
        intro: string;
        meta: string;
        cover_url?: string;
        action: {
          label: string;
          link: string;
        };
        book: PublicDomainBook | ModernBook;
      };
    }
  | {
      type: 'text';
      data: string;
    };

export interface IntentDetectionResult {
  intent: 'BOOK_QUERY' | 'NORMAL_QUERY';
  book?: PublicDomainBook | ModernBook;
}

/**
 * Normalize Arabic / Urdu / Latin strings for robust fuzzy keyword matching
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // strip Arabic diacritics / tashkeel
    .replace(/[أإآء]/g, 'ا')
    .replace(/[يىئ]/g, 'ی')
    .replace(/[ةه]/g, 'ہ')
    .replace(/[ك]/g, 'ک')
    .replace(/[-_.,!?،؛:()[\]{}"'/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * STEP A - BOOK_QUERY DETECTION
 * If message length < 40 chars and fuzzy matches any book title/slug, returns { intent: 'BOOK_QUERY', book }
 */
export function detectBookIntent(userMessage: string): IntentDetectionResult {
  const cleanRaw = userMessage.trim();
  if (!cleanRaw) {
    return { intent: 'NORMAL_QUERY' };
  }

  // Remove common polite filler words in Urdu / English
  const queryWithoutFiller = cleanRaw
    .replace(/^(کتاب|کتاب کے بارے میں بتائیں|کیا آپ کے پاس|کیا|بارے میں|کتاب پڑھائیں|کتاب دکھائیں|book|show me|tell me about)\s+/i, '')
    .trim();

  const normQuery = normalizeText(queryWithoutFiller || cleanRaw);

  if (normQuery.length > 0 && normQuery.length <= 40) {
    // 1. Direct slug or title match
    for (const b of allCatalogBooks) {
      const normTitleUr = normalizeText(b.title_ur);
      const normTitleAr = normalizeText(b.title_ar);
      const normSlug = normalizeText(b.slug);
      const normAuthor = normalizeText(b.author);

      if (
        normQuery === normSlug ||
        normQuery === normTitleUr ||
        normQuery === normTitleAr ||
        normTitleUr.includes(normQuery) ||
        normQuery.includes(normTitleUr) ||
        normTitleAr.includes(normQuery) ||
        normQuery.includes(normSlug.replace(/-/g, ' '))
      ) {
        return { intent: 'BOOK_QUERY', book: b };
      }

      if (normAuthor.length > 4 && normQuery.includes(normAuthor)) {
        return { intent: 'BOOK_QUERY', book: b };
      }
    }

    // 2. Word token match
    const queryTokens = normQuery.split(' ').filter(t => t.length > 2);
    if (queryTokens.length > 0) {
      for (const b of allCatalogBooks) {
        const normTitleUr = normalizeText(b.title_ur);
        const normTitleAr = normalizeText(b.title_ar);
        const matchCount = queryTokens.filter(t => normTitleUr.includes(t) || normTitleAr.includes(t)).length;
        if (matchCount >= Math.min(2, queryTokens.length)) {
          return { intent: 'BOOK_QUERY', book: b };
        }
      }
    }
  }

  return { intent: 'NORMAL_QUERY' };
}

/**
 * Light RAG helper: Find top 3 books matching user keywords to feed context to AI
 */
function findTopRelevantBooks(query: string): (PublicDomainBook | ModernBook)[] {
  const normQuery = normalizeText(query);
  const tokens = normQuery.split(' ').filter(t => t.length > 2);
  if (tokens.length === 0) return allCatalogBooks.slice(0, 3);

  const scored = allCatalogBooks.map(book => {
    const text = normalizeText(`${book.title_ur} ${book.title_ar} ${book.author} ${book.category} ${book.intro_ur}`);
    let score = 0;
    for (const t of tokens) {
      if (text.includes(t)) score++;
    }
    return { book, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter(s => s.score > 0).slice(0, 3).map(s => s.book);
  return matched.length > 0 ? matched : allCatalogBooks.slice(0, 3);
}

import { askIslamicAI } from './aiService';

const SYSTEM_PROMPT = `آپ "تحریکِ ایمان ڈیجیٹل دار الافتاء و ذہین کتب خانہ" (Tehreek-e-Iman Digital Dar-ul-Ifta & AI Librarian) کے جید، باوقار اور معتمد مفتی و محقق ہیں۔

تحریکِ ایمان کے کتب خانے میں ۱۰۰+ امہات الکتب موجود ہیں جن میں صحاحِ ستہ (صحیح البخاری ۷۵۶۳ احادیث، صحیح مسلم، سنن ابی داود، جامع ترمذی، سنن نسائی، سنن ابن ماجہ)، تفاسیر (طبری، ابن کثیر، قرطبی، جلالین)، اور فقہِ حنفی کی بنیادی امہات الکتب (الہدایہ، رد المحتار فتاویٰ شامی، فتاویٰ عالمگیری، بدائع الصنائع، المبسوط) شامل ہیں۔

### بنیادی شرائط و اسلوبِ جواب:
1. جواب صرف خوبصورت، سلیس اور باوقار علمی اردو (نستعلیق انداز) میں تحریر فرمائیں۔
2. سائل خواہ اردو، رومن اردو (Roman Urdu مثلاً "namaz k faraiz kya hain"), عربی یا انگریزی میں پوچھے، اسے پوری گہرائی سے سمجھ کر شستہ اردو میں مدلل جواب دیں۔
3. تمام کتب سے جواب اور مدلل حوالہ جات (Citations with Book Name & Page / Hadith No):
   - قرآنِ کریم کی متعلقہ آیات مع سورۃ کا نام اور آیت نمبر
   - احادیثِ نبویہ مبارکہ مع کتاب، باب اور حدیث نمبر (مثلاً: صحیح البخاری، کتاب الایمان، رقم الحدیث: ۵۰)
   - فقہِ حنفی کی امہات الکتب کے صریح حوالے مع کتاب کا نام، جلد اور صفحہ نمبر (مثلاً: رد المحتار علی الدر المختار، جلد ۱، صفحہ ۸۵)
4. اگر صارف کسی کتاب کے بارے میں پوچھے تو اس کے مصنف، سنِ وفات، جلدیں، صفحات اور موضوع کی تفصیل بیان کریں۔
5. اختتام پر باوقار مہرِ توثیق درج فرمائیں:
   «وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»
   اور یہ نوٹ شامل فرمائیں: "نوٹ: یہ علمی معاونت کے لیے ہے، فتویٰ کی حتمی توثیق کے لیے اپنے مقامی معتمد دار الافتاء سے رجوع فرمائیں۔"`;

/**
 * Call Generative AI (Gemini with multi-engine fallback and offline scholarly engine)
 */
async function callGenerativeAI(prompt: string, context: string, customApiKey?: string): Promise<string> {
  const effectiveKey =
    (customApiKey && customApiKey.trim()) ||
    (typeof window !== 'undefined' && (localStorage.getItem('tehreek_gemini_api_key') || localStorage.getItem('madrasa_gemini_api_key'))) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    '';

  const fullPrompt = `${SYSTEM_PROMPT}

سیاق و سباق (Library Context & Top Matched Books):
${context}

صارف کا سوال:
${prompt}

جواب صرف سلیس اور باوقار علمی اردو (نستعلیق اسلوب) میں کتاب کے نام اور صفحہ/حدیث نمبر کے حوالہ جات کے ساتھ تحریر فرمائیں۔`;

  if (effectiveKey) {
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
    for (const model of models) {
      try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + effectiveKey;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) return text;
        }
      } catch {
        // try next model
      }
    }
  }

  // Comprehensive Scholarly Offline Engine Fallback via askIslamicAI
  try {
    const offlineRes = await askIslamicAI(prompt, 'darulifta_fatwa', 'intermediate', undefined, context);
    if (offlineRes && offlineRes.answer) {
      let combined = offlineRes.answer;
      if (offlineRes.references && offlineRes.references.length > 0) {
        combined += '\n\n**کتب و مراجع کے صریح حوالے:**\n' + offlineRes.references.map(r => `* 📖 ${r}`).join('\n');
      }
      return combined;
    }
  } catch {
    // continue to book fallback
  }

  // Intelligent Contextual Scholar Fallback (Never canned, derived from catalog books)
  const topBooks = findTopRelevantBooks(prompt);
  if (topBooks.length > 0) {
    const b = topBooks[0];
    return `تحریکِ ایمان کے کتب خانے میں آپ کے سوال کی مناسبت سے بنیادی ماخذ **${b.title_ur}** (${b.title_ar}) ہے۔

* **مصنف:** ${b.author} ${b.death_year ? '(وفات: ' + b.death_year + 'ھ)' : ''}
* **موضوع:** ${b.category}
* **ضخامت:** ${b.volumes} جلدیں، ${(Array.isArray(b.pages) ? b.pages.length : b.pages).toLocaleString('ur-PK')} صفحات

**خلاصہ و علمی تعارف:**
${b.intro_ur}

**حوالہ برائے مطالعہ:**
کتاب: ${b.title_ur}، مکتبہ تحریکِ ایمان، صفحہ ۱ تا ${Array.isArray(b.pages) ? b.pages.length : b.pages}۔

«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»`;
  }

  return 'وعلیکم السلام و رحمۃ اللہ و برکاتہ! تحریکِ ایمان کے ذہین کتب خانے میں خوش آمدید۔ آپ کا مطلوبہ سوال کتب خانہ کے علوم (قرآن و تفسیر، حدیث، فقہ، سیرت، تاریخ و عقائد) سے متعلق ہے۔ آپ مخصوص کتاب، حدیث کا متن، فقہی حکم یا موضوع لکھ کر رہنمائی حاصل کر سکتے ہیں۔';
}

/**
 * Full Smart Intent Processor
 */
export async function processChatMessage(
  userMessage: string,
  customApiKey?: string
): Promise<ChatResponsePayload> {
  const trimmed = userMessage.trim();
  if (!trimmed) {
    return {
      type: 'text',
      data: 'برائے مہربانی اپنا سوال یا مطلوبہ کتاب کا نام تحریر فرمائیں۔'
    };
  }

  // STEP A: Detect Book Intent
  const intentResult = detectBookIntent(trimmed);

  // STEP B: If BOOK_QUERY -> return structured book_info card
  if (intentResult.intent === 'BOOK_QUERY' && intentResult.book) {
    const book = intentResult.book;
    const isPublic = book.source_type === 'public';
    const link = isPublic ? '/books/' + book.slug : (book as ModernBook).external_link;
    const actionLabel = isPublic ? 'کتاب پڑھیں' : 'اصل ماخذ پر پڑھیں';

    return {
      type: 'book_info',
      data: {
        fullName: book.title_ur + ' / ' + book.title_ar,
        author: book.author + ' (وفات: ' + book.death_year + 'ھ)',
        intro: book.intro_ur,
        meta: book.volumes + ' جلدیں، ' + (Array.isArray(book.pages) ? book.pages.length : book.pages).toLocaleString('ur-PK') + ' صفحات | موضوع: ' + book.category,
        cover_url: book.cover_url,
        action: {
          label: actionLabel,
          link: link
        },
        book: book
      }
    };
  }

  // STEP C: NORMAL_QUERY -> Light RAG context + Generative AI
  const relevantBooks = findTopRelevantBooks(trimmed);
  const contextSnippet = relevantBooks
    .map(
      (b, idx) =>
        '[' + (idx + 1) + '] کتاب: ' + b.title_ur + ' (' + b.title_ar + ')\nمصنف: ' + b.author + ' (وفات: ' + b.death_year + 'ھ)\nموضوع: ' + b.category + '\nتعارف: ' + b.intro_ur
    )
    .join('\n\n');

  const answer = await callGenerativeAI(trimmed, contextSnippet, customApiKey);

  return {
    type: 'text',
    data: answer
  };
}