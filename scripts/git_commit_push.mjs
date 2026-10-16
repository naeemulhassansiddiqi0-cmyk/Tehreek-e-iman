import { execSync } from 'child_process';

try {
  console.log('--- Staging Specific Folders ---');
  execSync('git add src/ scripts/ AUDIT_REPORT_146_BOOKS.md', { stdio: 'inherit' });

  console.log('--- Committing ---');
  try {
    execSync('git commit -m "fix: dynamic book slug routing, reactive navigation shims, and robust instant pagination sync"', { stdio: 'inherit' });
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
