import { execSync } from 'child_process';

try {
  console.log('--- Staging Specific Folders ---');
  execSync('git add src/ scripts/ AUDIT_REPORT_146_BOOKS.md', { stdio: 'inherit' });

  console.log('--- Committing ---');
  try {
    execSync('git commit -m "feat: upgrade AI Chatbot (AI Ustadh) with official branding, 3 academic modes, 147-book RAG citations & one-click citation copy"', { stdio: 'inherit' });
  } catch (e) {
    console.log('Commit note:', e.message);
  }

  console.log('--- Pushing to Main ---');
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('--- Git Push Succeeded ---');
} catch (err) {
  console.error('Error during git operations:', err);
  process.exit(1);
}
