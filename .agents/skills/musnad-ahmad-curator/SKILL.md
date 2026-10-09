---
name: musnad-ahmad-curator
description: >-
  Standardized workflow and zero-repetition engine for compiling, translating, validating,
  and publishing authentic pages of Musnad Ahmad bin Hanbal. Use whenever generating,
  updating, auditing, or adding pages/chunks to Musnad Ahmad in the Tehreek-e-Iman reader.
---

# Musnad Ahmad Curator & Verification Skill (مُسْنَدُ أَحْمَد — نظام التوثيق ونفي التكرار)

This skill establishes a strict, transparent, and auditable methodology for curating pages of *Musnad Ahmad bin Hanbal* for the online reader. It guarantees zero repetition, sacred reverence for the prophetic words, complete Urdu translations, and thorough Dars-e-Nizami commentary.

---

## 1. Fundamental Laws (قوانینِ توثیق و حفظِ احادیث)

1. **قطعی ممانعت برائے تکرار (Zero Tolerance for Repetition)**:
   - کبھی بھی 4 یا 5 احادیث کا پول بنا کر اسے 100 صفحات پر لوپ (`i % pool.length`) نہیں کرنا۔
   - ہر چنک (Chunk) کے ہر ایک صفحے پر مکمل طور پر منفرد (Unique)، مستقل اور مستند حدیث ہونی چاہیے۔

2. **عظمت و تقدسِ نبوی ﷺ (Sacred Reverence & Accuracy)**:
   - رسول اللہ ﷺ کے اصل الفاظ (متنِ عربی) مکمل اعراب و حرکات کے ساتھ درج ہوں۔
   - ترجمہ خالصتاً سلیس، باادب اور باوقار اردو میں ہو جو اصل عربی الفاظ کے عین مطابق ہو۔
   - کسی صورت بھی عربی کلام کو اردو ترجمے کے خانے میں کٹ پیسٹ نہ کیا جائے اور نہ ہی `... مکمل مبارک کلام عربی میں ملاحظہ فرمائیں` جیسا کوئی شارٹ کٹ یا پلیس ہولڈر استعمال ہو۔

3. **درسی و تحقیقی حل (Dars-e-Nizami Scholarly Standard)**:
   - **درسی تشریح و فقہی حل**: حدیث کا فقہی استنباط، اعمال کی حکمتیں اور معاشرتی فوائد۔
   - **محلِ اعراب و نحوی ترکیب**: حدیث کے 3 مخصوص کلیدی کلمات کی صرفی و نحوی ترکیب۔
   - **حواشی و درسی فوائد**: معتبر تخریج (طبعۃ مؤسسۃ الرسالۃ کا جلد، صفحہ اور رقم الحدیث) اور صحاحِ ستہ سے موازنہ۔

---

## 2. Standard Workflow (طریقہ کار برائے تالیف و اشاعت)

### مرحلہ 1: ڈیٹا کی تیاری و نفیِ تکرار (Curation & De-duplication)
- متعلقہ مسندِ صحابی کے لیے مستند روایات جمع کریں۔
- ہر صفحے کے لیے الگ راوی، عنوان، عربی متن، اردو ترجمہ، اعراب اور تخریج تیار کریں۔
- ایک ہی چنک میں کوئی بھی حدیث دوبارہ نہ آئے۔

### مرحلہ 2: اسکرپٹ جنریشن (Execution)
- جنریشن اسکرپٹ کے ذریعے `public/data/musnad-ahmad/chunks/chunk-X.json` اور `dist/data/musnad-ahmad/chunks/chunk-X.json` تیار کریں۔
- `meta.json`، `publicDomainBooks.ts`، `sw.js` اور `page.tsx` کو نئے کل صفحات کے مطابق اپڈیٹ کریں۔

### مرحلہ 3: خودکار آڈٹ و توثیق (Automated Duplicate Check)
- اشاعت سے پہلے لازمی طور پر آڈٹ اسکرپٹ چلائیں:
  ```bash
  node .agents/skills/musnad-ahmad-curator/scripts/audit_chunks.cjs <chunk_id>
  ```
- اسکرپٹ تصدیق کرے گا:
  - کیا تمام 100 صفحات میں احادیث 100% منفرد ہیں؟
  - کیا کوئی تکرار (Modulo Loop) موجود ہے؟
  - کیا اردو ترجمہ مکمل ہے اور اس میں کوئی پلیس ہولڈر تو نہیں؟

### مرحلہ 4: ہم آہنگی و لائیو ڈیپلائمنٹ (Sync & Deploy)
- تمام چنکس کو `dist` میں سنک کریں:
  ```bash
  node scratch/sync_all.cjs
  ```
- کلاؤڈ فلیئر پیجز پر ڈیپلائی کریں:
  ```bash
  npx wrangler pages deploy dist --project-name=tehreek-e-iman --commit-dirty=true
  ```

### مرحلہ 5: شفاف رپورٹ برائے صارف (Transparent User Reporting)
- صارف کو رپورٹ دیتے وقت:
  - آڈٹ کا نتیجہ پیش کریں (Duplication Rate: 0%)۔
  - صفحات کے عنوانات اور احادیث کا جدول شیئر کریں۔
  - لائیو لنک پر تصدیق فراہم کریں۔
