const fs = require('fs');
const path = require('path');
const dataDir = path.join('C:', 'Users', 'CoreCom', 'OneDrive', 'Desktop', 'Antigravity', 'src', 'data');

// Read kharjiBooksData.ts
const kharjiTsContent = fs.readFileSync(path.join(dataDir, 'kharjiBooksData.ts'), 'utf8');
const kharjiTsIds = (kharjiTsContent.match(/id:\s*['"]([^'"]+)['"]/g) || []).map(s => s.replace(/id:\s*['"]([^'"]+)['"]/, '$1'));
console.log('--- KHARJI BOOKS DATA TS ---');
console.log('Matches in kharjiBooksData.ts:', kharjiTsIds.length);
const kharjiBookIds = kharjiTsIds.filter(id => id.startsWith('kharji_'));
console.log('kharji_ prefixed IDs:', kharjiBookIds.length);

// Read booksData.ts
const booksDataContent = fs.readFileSync(path.join(dataDir, 'booksData.ts'), 'utf8');
const importedFiles = (booksDataContent.match(/import\s+.*?from\s+['"]\.\/([^'"]+)['"]/g) || []);
console.log('--- MAIN BOOKS DATA TS ---');
console.log('Imports in booksData.ts:', importedFiles.length);

// Total data files in directory
const allFiles = fs.readdirSync(dataDir);
const dataFiles = allFiles.filter(f => f.endsWith('Data.ts'));
console.log('Total *Data.ts files:', dataFiles.length);

// Count total books registered in booksData.ts
const booksArrayMatch = booksDataContent.match(/export const booksDatabase: Book\[\] = \[([\s\S]*?)\];/);
if (booksArrayMatch) {
  const booksRegistered = (booksArrayMatch[1].match(/\.\.\.([a-zA-Z0-9_]+)/g) || []).concat(
    booksArrayMatch[1].match(/([a-zA-Z0-9_]+)(?=,|\s)/g) || []
  );
  console.log('Total book variables included in booksDatabase array:', booksRegistered.length);
}
