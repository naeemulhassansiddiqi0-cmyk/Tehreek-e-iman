/**
 * scripts/sync_urdu_to_d1.mjs
 * 
 * Updates the 'urdu_tarjuma' column in Cloudflare D1 'books_full_text' table
 * for all 1,676 pages across the 10 canonical Fiqh & Fatawa books.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(ROOT_DIR, 'public', 'data', 'books_full_text');

function escapeSql(str) {
  if (!str) return "''";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

async function main() {
  console.log('===============================================================');
  console.log('📡 SYNCING URDU TRANSLATIONS TO CLOUDFLARE D1 (books_full_text)');
  console.log('===============================================================\n');

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f !== 'manifest.json');
  const tempFile = path.resolve(ROOT_DIR, 'scratch_sync_urdu.sql');

  for (let fIdx = 0; fIdx < files.length; fIdx++) {
    const file = files[fIdx];
    const filePath = path.join(DATA_DIR, file);
    const bookData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const slug = bookData.slug;
    const pages = bookData.pages || [];

    console.log(`[${fIdx + 1}/${files.length}] Updating D1 Urdu translations: "${bookData.title}" (${slug}): ${pages.length} pages`);

    // Batch 20 UPDATE statements per wrangler execution
    const chunkSize = 20;

    for (let i = 0; i < pages.length; i += chunkSize) {
      const chunk = pages.slice(i, i + chunkSize);
      const stmts = chunk.map(p => {
        return `UPDATE books_full_text SET urdu_tarjuma = ${escapeSql(p.urduTarjuma)} WHERE book_slug = ${escapeSql(slug)} AND page_number = ${p.pageNumber};`;
      });

      fs.writeFileSync(tempFile, stmts.join('\n\n'), 'utf-8');

      try {
        execSync(`npx wrangler d1 execute tehreek_e_imaan_db --remote --file="${tempFile}"`, {
          cwd: ROOT_DIR,
          stdio: 'ignore'
        });
        const currentCount = Math.min(i + chunkSize, pages.length);
        process.stdout.write(`\r  ↳ ${bookData.title}: ${currentCount}/${pages.length} pages synced to D1...`);
      } catch (err) {
        // retry once
        await new Promise(r => setTimeout(r, 1000));
        try {
          execSync(`npx wrangler d1 execute tehreek_e_imaan_db --remote --file="${tempFile}"`, {
            cwd: ROOT_DIR,
            stdio: 'ignore'
          });
        } catch (e2) {
          console.error(`\n  ❌ Failed batch at page ${i}:`, e2.message.slice(0, 100));
        }
      }

      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`\n  ✓ Completed D1 sync for ${slug}.\n`);
  }

  try { fs.unlinkSync(tempFile); } catch (e) {}

  console.log('===============================================================');
  console.log('🎉 ALL URDU TRANSLATIONS SUCCESSFULLY SYNCED TO CLOUDFLARE D1!');
  console.log('===============================================================');
}

main().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
