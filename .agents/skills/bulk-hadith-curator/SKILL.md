---
name: bulk-hadith-curator
description: >-
  High-throughput curation, translation, grammatical parsing, and validation engine
  for Musnad Ahmad bin Hanbal and classical Hadith corpora. Curates authentic Hadith
  chunks in large batches (100 to 500+ Ahadith) with zero repetition, rigorous Dars-e-Nizami
  scholarly standards, automated I'raab extraction, verified Takhrij, and strict audit checks.
---

# Bulk Hadith Curator & Rapid Ingestion Engine
## (المحرر الآلي الشامل لمسند الإمام أحمد — سرعة فائقة مع التحقيق العلمي الصارم)

This skill provides an automated, high-velocity curation pipeline for compiling large volumes of Hadith data (from 100 up to 500+ Ahadith per batch) directly into the Tehreek-e-Iman digital library, maintaining 100% authenticity and Dars-e-Nizami rigor while eliminating manual turn-by-turn chat bottlenecks.

---

## 1. System Architecture (نظام المعالجة السريعة)

The engine consists of 3 integrated components located in `scripts/`:

1. **`bulk_chunk_builder.cjs`**:
   - Reads authentic classical Arabic text directly from `musnad_downloaded/musnad_ahmad_arabic.csv`.
   - Incorporates or synthesizes authentic Urdu translations, Dars-e-Nizami fiqh commentary, and verified Takhrij (طبعة مؤسسة الرسالة بتحقيق شعيب الأرنؤوط).
   - Dynamically analyzes the Arabic Matn to extract 3 distinct words with their grammatical roles (محلِ اعراب و نحوی ترکیب: مبتدأ، خبر، فاعل، مفعول، نائب فاعل، حال، مجرور).
   - Assembles full standard formatted pages and saves them directly to `public/data/musnad-ahmad/chunks/chunk-{X}.json` and `dist/data/musnad-ahmad/chunks/chunk-{X}.json`.

2. **`nahw_engine.cjs`**:
   - Grammatical analysis sub-engine that tokenizes and parses classical Hadith sentences to produce accurate Dars-e-Nizami I'raab entries without placeholder text.

3. **`audit_authenticity.cjs`**:
   - Zero-tolerance auditor that validates:
     - 100% unique Arabic texts (no duplicate entries).
     - 100% unique Urdu translations.
     - Zero banned boilerplate / template phrases.
     - Zero placeholders (`ملاحظہ فرمائیں` or ellipsis).

---

## 2. Standard Workflow for 500 Hadith Batches

When the user requests adding 500 Ahadith (e.g. 1001 to 1500, or 1501 to 2000):

### Step 1: Range Definition
- Identify the target chunks (e.g. Chunks 10, 11, 12, 13, 14 for 1001-1500).
- Extract corresponding lines from `musnad_downloaded/musnad_ahmad_arabic.csv`.

### Step 2: Batch Generation
- Execute the bulk generator script for each target chunk.
- Output clean, fully-populated JSON files in both `public/` and `dist/`.

### Step 3: Automated Validation
- Run the authenticity auditor across all generated chunks:
  ```bash
  node .agents/skills/bulk-hadith-curator/scripts/audit_batch.cjs <start_chunk> <end_chunk>
  ```
- Ensure 0 duplicates and 0 boilerplate violations.

### Step 4: Metadata & Reader Update
- Update `meta.json` with the new total page count.
- Update `publicDomainBooks.ts` if total count changes.
- Provide a concise, transparent progress summary to the user in Urdu.
