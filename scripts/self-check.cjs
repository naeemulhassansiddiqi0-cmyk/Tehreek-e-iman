const fs = require('fs');
const json = JSON.parse(fs.readFileSync('public/naats/naats.json', 'utf8'));
const distPath = 'dist/naats';
if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true });
let distFiles = fs.readdirSync(distPath).filter(f => f.toLowerCase().endsWith('.mp3'));
console.log('CHECK: json count =', json.length, ' dist count =', distFiles.length);
let missing = json.filter(j => !fs.existsSync(distPath + '/' + j.fileName));
if (missing.length > 0) {
  console.log('MISSING FILES COUNT:', missing.length, missing.map(m => m.fileName).slice(0, 20));
  console.log('FORCING COPY...');
  fs.cpSync('public/naats', distPath, { recursive: true, force: true });
  distFiles = fs.readdirSync(distPath).filter(f => f.toLowerCase().endsWith('.mp3'));
  missing = json.filter(j => !fs.existsSync(distPath + '/' + j.fileName));
  console.log('AFTER COPY - dist count =', distFiles.length, ' still missing =', missing.length);
}
if (missing.length === 0 && distFiles.length === json.length) {
  console.log('>>> SELF-CHECK PASSED: ALL ' + json.length + ' FILES EXISTS OK - READY TO DEPLOY');
} else {
  console.log('>>> SELF-CHECK FAILED - DO NOT DEPLOY - FIX AGAIN');
  process.exit(1);
}
