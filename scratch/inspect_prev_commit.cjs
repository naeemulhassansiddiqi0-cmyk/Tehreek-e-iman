const { execSync } = require('child_process');
const fs = require('fs');

try {
  const log = execSync('git log -n 10 --oneline', { encoding: 'utf8' });
  const diffStat = execSync('git show 2a3e5a2 --stat', { encoding: 'utf8' });
  fs.writeFileSync('scratch/git_info.txt', `LOG:\n${log}\n\nSTAT:\n${diffStat}`, 'utf8');
  console.log('Saved git info');
} catch (e) {
  console.error(e);
}
