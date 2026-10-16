import fs from 'fs';

const rijalContent = fs.readFileSync('src/services/rijalService.ts', 'utf-8');

const authorsToCheck = [
  'مالك',
  'الشافعي',
  'أحمد بن حنبل',
  'أبو حنيفة',
  'محمد بن الحسن',
  'أبو يوسف',
  'الطحاوي',
  'الدارمي',
  'البيهقي',
  'الدارقطني',
  'ابن حبان',
  'الحاكم',
  'الطبراني',
  'أبو يعلى',
  'البزار',
  'عبد الرزاق',
  'ابن أبي شيبة',
  'ابن خزيمة',
  'ابن رجب',
  'النووي',
  'ابن حجر',
  'البغوي',
  'الهيثمي',
  'المتقي الهندي',
  'المباركفوري',
  'الشوكاني'
];

console.log('Checking authors & primary narrators in rijalService.ts:');
for (const name of authorsToCheck) {
  if (rijalContent.includes(`'${name}'`) || rijalContent.includes(`"${name}"`)) {
    console.log(`✓ ${name} exists in rijalService`);
  } else {
    console.log(`✗ Missing: ${name}`);
  }
}
