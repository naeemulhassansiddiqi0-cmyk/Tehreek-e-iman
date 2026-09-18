const fs = require('fs');
const path = require('path');
const p = path.join('C:', 'Users', 'CoreCom', 'OneDrive', 'Desktop', 'Antigravity', 'seed_books.sql');
let content = fs.readFileSync(p, 'utf8');
if (!content.startsWith('BEGIN TRANSACTION;')) {
  content = 'BEGIN TRANSACTION;\n' + content + '\nCOMMIT;\n';
  fs.writeFileSync(p, content, 'utf8');
  console.log('Wrapped seed_books.sql in a single TRANSACTION.');
}
