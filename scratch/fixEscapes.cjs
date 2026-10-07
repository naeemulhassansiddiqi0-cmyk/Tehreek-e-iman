const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'data', 'musnadAhmadData.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace all literal \n\n with real newlines
content = content.split('\\n\\n').join('\n\n');
content = content.split('\\n').join('\n');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixed literal newlines successfully!');
