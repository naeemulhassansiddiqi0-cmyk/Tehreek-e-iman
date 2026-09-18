/**
 * Tehreek-e-Iman Official Clipboard & Export Helper
 * Ensures every copied fatwa, text, note, or export prominently features
 * the Tehreek-e-Iman logo, official watermark, and scholarly attribution.
 */

export interface CopyOptions {
  title?: string;
  sourceBook?: string;
  includeTimestamp?: boolean;
}

export const TEHREEK_BANNER_HEADER = `╔══════════════════════════════════════════════════════════════════╗
║               ❖ تَحْرِيكِ إِيمَان — TEHREEK-E-IMAN ❖                ║
║           سرپرستِ اعلیٰ: حضرت مولانا محمد نعیم الحسن صدیقی          ║
║             مرکزِ افتاء، تحقیق و درسِ نظامی اسمارٹ پورٹل             ║
╚══════════════════════════════════════════════════════════════════╝`;

export const TEHREEK_BANNER_FOOTER = `══════════════════════════════════════════════════════════════════════
❖ منقول از: تحریکِ ایمان — دار الافتاء و مجلسِ تحقیق
❖ سرپرستیِ عالیہ: حضرت مولانا محمد نعیم الحسن صدیقی مدظلہ العالی
❖ جملہ حقوق بحق تحریکِ ایمان محفوظ ہیں | https://tehreekeiman.com
══════════════════════════════════════════════════════════════════════`;

/**
 * Format plain text with Tehreek-e-Iman logo banner and footer
 */
export function formatTextWithTehreekLogo(rawText: string, options?: CopyOptions): string {
  const parts: string[] = [TEHREEK_BANNER_HEADER];

  if (options?.title) {
    parts.push(`【 ${options.title} 】`);
  }
  if (options?.sourceBook) {
    parts.push(`📖 ماخذ و کتاب: ${options.sourceBook}`);
  }
  if (options?.includeTimestamp) {
    parts.push(`📅 تاریخ و وقت: ${new Date().toLocaleString('ur-PK')}`);
  }

  parts.push('\n' + rawText.trim() + '\n');
  parts.push(TEHREEK_BANNER_FOOTER);

  return parts.join('\n');
}

/**
 * Format HTML with inline Tehreek-e-Iman logo image, gold border, and watermark
 */
export function formatHtmlWithTehreekLogo(rawText: string, options?: CopyOptions): string {
  const escapedText = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const titleHtml = options?.title 
    ? `<div style="font-size: 16px; font-weight: bold; color: #b45309; margin-bottom: 8px;">【 ${options.title} 】</div>` 
    : '';
  const bookHtml = options?.sourceBook 
    ? `<div style="font-size: 13px; color: #047857; margin-bottom: 8px;">📖 ماخذ: ${options.sourceBook}</div>` 
    : '';

  return `
    <div dir="rtl" style="font-family: 'Amiri', 'Traditional Arabic', 'Jameel Noori Nastaleeq', Tahoma, sans-serif; background-color: #fdfbf7; border: 2px solid #d97706; border-radius: 16px; padding: 20px; color: #1c1917; max-width: 750px; line-height: 2;">
      <!-- Header Banner with Logo -->
      <div style="display: flex; align-items: center; border-bottom: 2px solid #d97706; padding-bottom: 12px; margin-bottom: 16px;">
        <img 
          src="https://tehreekeiman.com/tehreek-iman-logo.jpg" 
          alt="تحریکِ ایمان لوگو" 
          width="68" 
          height="68" 
          style="border-radius: 50%; border: 2px solid #f59e0b; margin-left: 14px; object-fit: cover; display: inline-block;"
        />
        <div>
          <h2 style="margin: 0; color: #065f46; font-size: 20px; font-weight: 800;">
            تَحْرِيكِ إِيمَان — دار الافتاء و مجلسِ تحقیق
          </h2>
          <p style="margin: 4px 0 0 0; color: #b45309; font-size: 13px; font-weight: bold;">
            سرپرستِ اعلیٰ: حضرت مولانا محمد نعیم الحسن صدیقی مدظلہ العالی
          </p>
          <p style="margin: 2px 0 0 0; color: #047857; font-size: 11px;">
            جامع نظامیہ و ڈیجیٹل دار الافتاء اسمارٹ پورٹل
          </p>
        </div>
      </div>

      <!-- Optional Title / Source -->
      ${titleHtml}
      ${bookHtml}

      <!-- Main Body Content -->
      <div style="font-size: 14px; color: #1c1917; white-space: pre-wrap; line-height: 2.2; text-align: justify; margin: 12px 0;">
        ${escapedText}
      </div>

      <!-- Footer Stamp & Attribution -->
      <div style="border-top: 1px solid #d1fae5; padding-top: 12px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #047857;">
        <div>
          <span>❖ باضابطہ تصدیق: تحریکِ ایمان ڈیجیٹل دار الافتاء</span>
          <br/>
          <span>❖ ویب سائٹ: https://tehreekeiman.com</span>
        </div>
        <div style="font-size: 13px; font-weight: bold; color: #b45309;">
          «وَاللَّهُ أَعْلَمُ بِالصَّوَابِ»
        </div>
      </div>
    </div>
  `;
}

/**
 * Copy text with Tehreek-e-Iman logo to clipboard as both plain text and rich HTML
 */
export async function copyToClipboardWithTehreekLogo(
  rawText: string,
  options?: CopyOptions
): Promise<boolean> {
  const plainText = formatTextWithTehreekLogo(rawText, options);
  const htmlText = formatHtmlWithTehreekLogo(rawText, options);

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const htmlBlob = new Blob([htmlText], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob,
        }),
      ]);
      return true;
    }
  } catch (err) {
    console.warn('Rich clipboard write failed, falling back to writeText:', err);
  }

  // Fallback to plain text writeText
  try {
    await navigator.clipboard.writeText(plainText);
    return true;
  } catch (err) {
    console.error('Clipboard writeText failed:', err);
    return false;
  }
}
