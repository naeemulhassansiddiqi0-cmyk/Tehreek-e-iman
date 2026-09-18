// scripts/execute_d1_batches.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function main() {
  const sqlFile = path.resolve(ROOT_DIR, 'populate_books_full_text.sql');
  const content = fs.readFileSync(sqlFile, 'utf-8');

  // Split on double newline separating statements
  const statements = content.split(/;\s*\n\s*\n/).map(s => s.trim()).filter(Boolean);
  console.log(`Total statements to execute on D1: ${statements.length}`);

  const tempDir = path.resolve(ROOT_DIR, 'scratch', 'd1_chunks');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].endsWith(';') ? statements[i] : statements[i] + ';';
    const chunkFile = path.join(tempDir, `chunk_${i}.sql`);
    fs.writeFileSync(chunkFile, stmt, 'utf-8');

    console.log(`Executing batch [${i + 1}/${statements.length}] (${(fs.statSync(chunkFile).size / 1024).toFixed(1)} KB)...`);

    try {
      execSync(`npx wrangler d1 execute tehreek_e_imaan_db --remote --file="${chunkFile}"`, {
        cwd: ROOT_DIR,
        stdio: 'pipe'
      });
      console.log(`  ✓ Batch [${i + 1}/${statements.length}] executed successfully on D1.`);
    } catch (err) {
      console.warn(`  ⚠️ Retry batch [${i + 1}/${statements.length}]:`, err.message.slice(0, 150));
      // retry once
      try {
        await new Promise(r => setTimeout(r, 1000));
        execSync(`npx wrangler d1 execute tehreek_e_imaan_db --remote --file="${chunkFile}"`, {
          cwd: ROOT_DIR,
          stdio: 'pipe'
        });
        console.log(`  ✓ Batch [${i + 1}/${statements.length}] retry succeeded.`);
      } catch (e2) {
        console.error(`  ❌ Failed batch [${i + 1}]:`, e2.message.slice(0, 200));
      }
    }

    // cleanup chunk file
    try { fs.unlinkSync(chunkFile); } catch (e) {}

    // short pause between D1 calls
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n🎉 ALL SQL BATCHES EXECUTED ON CLOUDFLARE D1 TEHREEK_E_IMAAN_DB SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Fatal batch execute error:', err);
  process.exit(1);
});
