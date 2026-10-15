const fs = require('fs');
const path = require('path');

const backupDir = 'D:/Antigravity/backup_all_chunks_before_v2';
const targetDir = 'D:/Antigravity/public/data/musnad-ahmad/chunks';

console.log('--- Inspecting Backup Dir ---');
if (fs.existsSync(backupDir)) {
  const files = fs.readdirSync(backupDir).filter(f => f.startsWith('chunk-') && f.endsWith('.json'));
  console.log(`Backup chunks count: ${files.length}`);
  files.sort((a,b) => {
    const numA = parseInt(a.replace('chunk-', '').replace('.json', ''), 10);
    const numB = parseInt(b.replace('chunk-', '').replace('.json', ''), 10);
    return numA - numB;
  });
  console.log('Backup chunk files sample:', files.slice(0, 25).join(', '));
}

console.log('--- Inspecting Public Target Dir ---');
if (fs.existsSync(targetDir)) {
  const files = fs.readdirSync(targetDir).filter(f => f.startsWith('chunk-') && f.endsWith('.json'));
  console.log(`Target chunks count: ${files.length}`);
  if (fs.existsSync(path.join(targetDir, 'meta.json'))) {
    console.log('meta.json:', fs.readFileSync(path.join(targetDir, 'meta.json'), 'utf8'));
  }
}
