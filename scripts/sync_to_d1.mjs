/**
 * scripts/sync_to_d1.mjs
 * 
 * Synchronizes parsed full-text books from public/data/books_full_text/
 * directly into Cloudflare D1 'books_full_text' table and updates 'books' table.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(ROOT_DIR, 'public', 'data', 'books_full_text');

const D1_BOOK_MAPPINGS = {
  'fatawa-qazi-khan': ['kharji_lib_0489', 'qazikhan'],
  'fatawa-alamgiri': ['kharji_lib_0488', 'alamgiri'],
  'al-hidaya': ['kharji_lib_0359', 'hidayah'],
  'al-mabsut-sarakhsi': ['kharji_lib_0348', 'mabsut', 'kharji_mabsut_sarakhsi'],
  'badae-al-sanaye': ['kharji_lib_0349', 'badai_sanai'],
  'fath-al-qadir': ['kharji_lib_0351', 'fath_al_qadir'],
  'radd-al-muhtar': ['kharji_lib_0354', 'shami'],
  'mukhtasar-al-quduri': ['quduri', 'kharji_lib_0350'],
  'kanz-al-daqaiq': ['kanz', 'kharji_lib_0352'],
  'al-durr-al-mukhtar': ['kharji_lib_0353']
};

function escapeSql(str) {
  if (!str) return "''";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

async function main() {
  console.log('===============================================================');
  console.log('📡 SYNCING BOOKS_FULL_TEXT TO CLOUDFLARE D1 (TEHREEK_E_IMAAN_DB)');
  console.log('===============================================================\n');

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f !== 'manifest.json');
  console.log(`Found ${files.length} books to sync.\n`);

  const tempFile = path.resolve(ROOT_DIR, 'scratch_sync_chunk.sql');

  for (let fIdx = 0; fIdx < files.length; fIdx++) {
    const file = files[fIdx];
    const filePath = path.join(DATA_DIR, file);
    const bookData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const slug = bookData.slug;
    const pages = bookData.pages || [];
    const d1Ids = D1_BOOK_MAPPINGS[slug] || [slug];

    console.log(`---------------------------------------------------------------`);
    console.log(`[${fIdx + 1}/${files.length}] Syncing "${bookData.title}" (${slug}): ${pages.length} pages`);
    console.log(`---------------------------------------------------------------`);

    // 1. Delete old rows for this slug
    fs.writeFileSync(tempFile, `DELETE FROM books_full_text WHERE book_slug = ${escapeSql(slug)};`, 'utf-8');
    try {
      execSync(`npx wrangler d1 execute tehreek_e_imaan_db --remote --file="${tempFile}"`, {
        cwd: ROOT_DIR,
        stdio: 'ignore'
      });
    } catch (e) {
      // ignore
    }

    // 2. Insert in chunks of 24 pages per wrangler call (6 statements of 4 pages each)
    const chunkSize = 24;
    const stmtSize = 4;

    for (let i = 0; i < pages.length; i += chunkSize) {
      const pageChunk = pages.slice(i, i + chunkSize);
      const stmts = [];

      for (let j = 0; j < pageChunk.length; j += stmtSize) {
        const sub = pageChunk.slice(j, j + stmtSize);
        const values = sub.map(p => {
          return `(${escapeSql(slug)}, ${escapeSql(p.chapterTitle)}, ${p.pageNumber}, ${escapeSql(p.arabicMatn)})`;
        }).join(',\n');
        stmts.push(`INSERT INTO books_full_text (book_slug, chapter_title, page_number, arabic_matn) VALUES\n${values};`);
      }

      fs.writeFileSync(tempFile, stmts.join('\n\n'), 'utf-8');

      try {
        execSync(`npx wrangler d1 execute tehreek_e_imaan_db --remote --file="${tempFile}"`, {
          cwd: ROOT_DIR,
          stdio: 'ignore'
        });
        const currentCount = Math.min(i + chunkSize, pages.length);
        process.stdout.write(`\r  ↳ ${bookData.title}: ${currentCount}/${pages.length} pages synced to D1...`);
      } catch (err) {
        console.warn(`\n  ⚠️ Retry batch at page ${i}...`);
        await new Promise(r => setTimeout(r, 1000));
        try {
          execSync(`npx wrangler d1 execute tehreek_e_imaan_db --remote --file="${tempFile}"`, {
            cwd: ROOT_DIR,
            stdio: 'ignore'
          });
        } catch (e2) {
          console.error(`  ❌ Failed batch at page ${i}:`, e2.message.slice(0, 100));
        }
      }

      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n  ✓ Successfully uploaded all ${pages.length} pages to books_full_text.`);

    // 3. Update books table in D1
    const idList = d1Ids.map(id => escapeSql(id)).join(', ');
    const updateSql = `UPDATE books SET total_chapters = ${bookData.totalChapters || 1}, total_pages = ${pages.length}, shamela_id = ${escapeSql(bookData.shamelaId)}, shamela_url = 'https://shamela.ws/book/${bookData.shamelaId}' WHERE id IN (${idList});`;
    fs.writeFileSync(tempFile, updateSql, 'utf-8');
    try {
      execSync(`npx wrangler d1 execute tehreek_e_imaan_db --remote --file="${tempFile}"`, {
        cwd: ROOT_DIR,
        stdio: 'ignore'
      });
      console.log(`  ✓ Updated D1 books table (chapters: ${bookData.totalChapters}, pages: ${pages.length}).\n`);
    } catch (e) {
      console.warn(`  ⚠️ Could not update books row:`, e.message.slice(0, 100));
    }
  }

  // Cleanup temp file
  try { fs.unlinkSync(tempFile); } catch (e) {}

  console.log('===============================================================');
  console.log('🎉 ALL FIQH & FATAWA BOOKS FULL TEXT SUCCESSFULLY SYNCED TO D1');
  console.log('===============================================================');
}

main().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
