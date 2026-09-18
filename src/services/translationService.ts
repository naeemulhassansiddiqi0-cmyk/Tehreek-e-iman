/**
 * src/services/translationService.ts
 *
 * Professional Islamic Scholarly Translation Service
 * Powered by Google Gemini with offline and multi-engine fallbacks.
 */

import { SupportedLanguage } from '../types';
import { translateParagraph } from './fiqhUrduTranslator';

export const GEMINI_PROMPT = `Tum ek mahir Islami muhaqqiq ho. Neeche diya gaya Arabi Fiqhi mutan ka tarjuma saaf, sahi aur aam fehem Urdu mein karo.
Qawaid:
1. Koi bracket (رض) (رح) mat lagao.
2. Toote hue alfaz jaise "ننجوم" hargiz na banao.
3. Mukammal jumla tarjuma karo, lafzi nahi.
4. Urdu Jameel Noori Nastaleeq style mein ho.

Arabi matan: {ARABIC_TEXT}`;

// Cache in localStorage
const TRANSLATION_CACHE_KEY = 'madrasa_translations_gemini_v3';

function getCachedTranslations(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCachedTranslation(key: string, text: string) {
  if (typeof window === 'undefined' || !key || !text) return;
  try {
    const current = getCachedTranslations();
    current[key] = text;
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Gemini Generative AI Model Adapter
 */
export const geminiModel = {
  async generateContent(fullPrompt: string, customApiKey?: string) {
    const effectiveKey =
      (customApiKey && customApiKey.trim()) ||
      (typeof window !== 'undefined' && localStorage.getItem('madrasa_gemini_api_key')?.trim()) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY?.trim()) ||
      '';

    if (effectiveKey) {
      const models = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-3.6-flash'];
      for (const model of models) {
        try {
          const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + effectiveKey;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2500,
              },
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              let clean = text.trim();
              clean = clean.replace(/^[\x60]{3}(?:urdu|text)?\n?/, '').replace(/\n?[\x60]{3}$/, '').trim();
              return {
                response: {
                  text: () => clean,
                },
              };
            }
          }
        } catch (err) {
          console.warn('Model ' + model + ' request error, trying next:', err);
        }
      }
    }

    // Extract Arabic text from prompt for fallback
    const arabicMatch = fullPrompt.match(/Arabi matan:[\s]*([\s\S]+)$/i);
    const arabicText = arabicMatch ? arabicMatch[1].trim() : fullPrompt;

    // Fast Google Translate Live API fallback
    try {
      const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=ur&dt=t&q=' + encodeURIComponent(arabicText);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const gtxText = data[0]
            .map((chunk: unknown) => (Array.isArray(chunk) && chunk[0] ? String(chunk[0]) : ''))
            .join('')
            .trim();
          if (gtxText && gtxText.length > 0) {
            return {
              response: {
                text: () => gtxText,
              },
            };
          }
        }
      }
    } catch {
      // ignore
    }

    // Offline Scholarly Fiqh Translation fallback
    const fallbackText = translateParagraph(arabicText);
    return {
      response: {
        text: () => fallbackText,
      },
    };
  },
};

/**
 * Get accurate, scholarly, fluent Urdu translation for Arabic text using Gemini AI
 */
export async function getCorrectUrduTranslation(arabic: string, customApiKey?: string): Promise<string> {
  if (!arabic || !arabic.trim()) return '';

  const cleanArabic = arabic.trim();
  const cacheKey = 'gemini_urdu_trans_' + cleanArabic.slice(0, 100);
  const cached = getCachedTranslations()[cacheKey];
  if (cached && cached.length > 0) {
    return cached;
  }

  const fullPrompt = GEMINI_PROMPT.replace('{ARABIC_TEXT}', cleanArabic);
  const result = await geminiModel.generateContent(fullPrompt, customApiKey);
  const text = result.response.text().trim();

  if (text && text.length > 0) {
    setCachedTranslation(cacheKey, text);
  }
  return text;
}

/**
 * Get translation for an Islamic text segment in any requested target language.
 */
export async function getTranslationInLanguage(
  arabicText: string,
  urduText?: string,
  targetLang: SupportedLanguage = 'ur',
  preloadedTranslations?: Record<string, string>,
  apiKey?: string
): Promise<string> {
  // If Urdu is requested, call getCorrectUrduTranslation directly!
  if (targetLang === 'ur') {
    if (preloadedTranslations?.['ur'] && preloadedTranslations['ur'].trim()) {
      return preloadedTranslations['ur'].trim();
    }
    if (urduText && urduText.trim() && !urduText.includes('(اس کا)') && !urduText.includes('اس فقہی عبارت میں')) {
      return urduText.trim();
    }
    return await getCorrectUrduTranslation(arabicText, apiKey);
  }

  // Check preloaded translations first
  if (preloadedTranslations && preloadedTranslations[targetLang]) {
    return preloadedTranslations[targetLang];
  }

  const baseForCache = (urduText || arabicText).trim().slice(0, 120);
  const cacheKey = targetLang + '___' + baseForCache;
  const cached = getCachedTranslations()[cacheKey];
  if (cached) {
    return cached;
  }

  // Live Multilingual translation
  try {
    const useUrdu = Boolean(urduText && urduText.trim().length > 0 && targetLang !== 'ar');
    const sourceText = useUrdu ? urduText!.trim() : arabicText.trim();
    const sourceLang = useUrdu ? 'ur' : 'ar';

    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + sourceLang + '&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(sourceText);
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const fullTranslation = data[0]
          .map((chunk: unknown) => (Array.isArray(chunk) && chunk[0] ? String(chunk[0]) : ''))
          .join('')
          .trim();

        if (fullTranslation && fullTranslation.length > 0) {
          setCachedTranslation(cacheKey, fullTranslation);
          return fullTranslation;
        }
      }
    }
  } catch (err) {
    console.warn('Multilingual live translation error:', err);
  }

  return '[' + targetLang.toUpperCase() + ']: ' + (urduText || arabicText);
}
