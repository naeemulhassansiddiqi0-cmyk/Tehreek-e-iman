import { execSync } from 'child_process';
const out = execSync('git log -2 --oneline', { encoding: 'utf-8' });
console.log(out);
