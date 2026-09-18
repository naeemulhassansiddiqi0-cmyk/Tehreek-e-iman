const fs = require('fs');
const path = require('path');
const p = path.join('C:', 'Users', 'CoreCom', 'OneDrive', 'Desktop', 'Antigravity', 'seed_books.sql');
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/^BEGIN TRANSACTION;\r?\n/, '').replace(/\r?\nCOMMIT;\r?\n?$/, '');
fs.writeFileSync(p, content, 'utf8');
console.log('Stripped explicit BEGIN TRANSACTION/COMMIT for Cloudflare remote compatibility.');
