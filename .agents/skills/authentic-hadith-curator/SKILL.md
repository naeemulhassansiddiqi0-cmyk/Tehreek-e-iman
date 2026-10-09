---
name: authentic-hadith-curator
description: >-
  Standardized protocol and strict validation engine for curating authentic pages of
  Musnad Ahmad bin Hanbal. Enforces 100% adherence to original Arabic classical text,
  exact sentence-by-sentence faithful Urdu translation, authentic Sanad/Sahabi attribution,
  precise Dars-e-Nizami fiqhi commentary, grammatical analysis (اعراب و نحو), and zero
  tolerance for boilerplate, templates, or repetition.
---

# Authentic Hadith Curator & Verification Protocol
## (نظام التحقيق والتوثيق للحديث الشريف — معيار المطابقة الصارمة)

This skill governs the addition, translation, annotation, and auditing of pages of *Musnad Ahmad bin Hanbal* (and other classical Hadith collections) in the Tehreek-e-Iman digital library.

---

## 1. Absolute Directives (قواعد التحقيق الصارمة)

### A. المطابقة التامة للأصل (100% Adherence to Classical Original)
1. **الراوي والسند (Sanad & Narrator)**:
   - ہر حدیث کا راوی اور سند اصل کتاب *مسند الإمام أحمد بن حنبل* کے عین مطابق ہونی چاہیے۔
   - صحابی کا نام، حسب و نسب، اور دعائیہ کلمات (رضي الله عنه / رضي الله عنها / رضي الله عنهما) قطعی درست اور غیر مبہم ہوں۔
2. **المتن العربي مع التشكيل (Authentic Arabic Matn with Diacritics)**:
   - عربی متن میں کوئی لفظی تحریف، تبدیلی یا کٹوتی نہ ہو۔
   - مکمل اعراب و حرکات کے ساتھ اصل کتاب کا متن درج ہو۔

### B. الترجمة الأردية المطابقة (Faithful & Exact Urdu Translation)
1. **قطعی ممانعت برائے کاپی پیسٹ و سانچے (Strict Prohibition of Boilerplate/Templates)**:
   - کسی بھی حدیث کے ترجمے میں کوئی عمومی یا خود ساختہ سانچہ (Template Phrase) مثلاً:
     *"رسول اللہ ﷺ نے اس مبارک ارشاد میں امت کی راہنمائی فرماتے ہوئے ارشاد فرمایا کہ بندہ مومن کو اپنے تمام احوال میں شریعتِ مطہرہ کی پاسداری..."*
     قطعی طور پر **حرام اور ممنوع** ہے۔
   - ہر حدیث کا ترجمہ اس کے اپنے مخصوص عربی الفاظ کا **لفظ بہ لفظ اور با محاورہ سلیس اردو ترجمہ** ہوگا۔
2. **ادب و فصاحت (Reverence & Accuracy)**:
   - ترجمہ خالص علمی، باادب اور اردو کے فصیح محاورے میں ہو تاکہ کلامِ نبوی ﷺ کا اصل پیغام بغیر کسی تحریف کے قاری تک پہنچے۔

### C. الحواشی والحل الدراسي (Dars-e-Nizami Fiqhi & Grammatical Commentary)
1. **درسی تشریح و فقہی حل (Fiqhi Solution & Lessons)**:
   - ہر صفحے کی تشریح اسی مخصوص حدیث کے فقہی مسئلے، استنباط اور اخلاقی درس پر مشتمل ہوگی۔ کسی دوسری حدیث کی تشریح یہاں چسپاں نہیں کی جائے گی۔
2. **محلِ اعراب و نحوی ترکیب (Grammatical Analysis)**:
   - اسی حدیث کے 3 حقیقی اور نمایاں کلمات نکال کر ان کا اعرابی و نحوی مقام واضح کیا جائے گا۔
3. **التخريج الدقيق (Precise Classical Takhrij)**:
   - مؤسسۃ الرسالۃ کے مصدقہ مطبوعہ نسخے کے مطابق: جلد نمبر، صفحہ نمبر، اور رقم الحدیث کا درست حوالہ درج ہو۔

---

## 2. Compilation & Curation Workflow (طریقہ کار برائے تالیف)

جب بھی 1000 یا 100 احادیث کا اضافہ کرنا ہو، درج ذیل 4 مراحل پر لازمی عمل ہوگا:

### مرحلہ 1: استخراجِ اصل متن (Extracting Classical Arabic Data)
- اصل محفوظ شدہ ڈیٹا (`musnad_downloaded/musnad_ahmad_arabic.csv`) سے مطلوبہ رینج (مثلاً 16001 تا 17000) کی تمام احادیث کا سند اور متن استخراج کیا جائے۔

### مرحلہ 2: ترجمہ و تحقیقِ مفرد (Individual Translation & Annotation)
- ہر ایک حدیث کا الگ متن پڑھ کر:
  1. راویِ صحابی کی تصدیق کی جائے۔
  2. حدیث کے عنوان (باب) کا تعین کیا جائے۔
  3. حدیث کے اصل الفاظ کا با محاورہ اردو ترجمہ تحریر کیا جائے۔
  4. درسی و فقہی تشریح لکھی جائے۔
  5. 3 کلیدی کلمات کے اعراب کا انتخاب کیا جائے۔

### مرحلہ 3: سخت ترین خودکار آڈٹ (Rigorous Automated Audit)
- جنریشن کے بعد [audit_authenticity.cjs](./scripts/audit_authenticity.cjs) چلائیں:
  ```bash
  node .agents/skills/authentic-hadith-curator/scripts/audit_authenticity.cjs <start_chunk> <end_chunk>
  ```
- آڈٹ درج ذیل 5 شرائط کی تصدیق کرے گا:
  - **100% Unique Arabic Matn**: کوئی دو صفحات پر ایک عربی متن نہ ہو۔
  - **100% Unique & Specific Urdu Translation**: کسی صفحے پر کوئی جنرک جملہ یا سانچہ نہ ہو؛ ہر ترجمہ منفرد ہو۔
  - **Zero Boilerplate Check**: کوئی کاپی پیسٹ شدہ فقرہ موجود نہ ہو۔
  - **No Placeholders**: کوئی خالی خانے یا `ملاحظہ فرمائیں` کا اشارہ نہ ہو۔
  - **Valid References**: تمام تخریج اور جلد و صفحہ کے نمبر درست ہوں۔

### مرحلہ 4: سنک و لائیو اشاعت (Sync & Deployment)
- منظوری کے بعد تمام چنکس `dist/` میں سنک کر کے کلاؤڈ فلیئر پر شائع کیے جائیں گے۔
