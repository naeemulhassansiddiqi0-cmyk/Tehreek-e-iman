const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'public', 'data', 'musnad-ahmad', 'chunks');
const dstDir = path.join(__dirname, '..', 'dist', 'data', 'musnad-ahmad', 'chunks');

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

const files = ["meta.json","chunk-11.json","chunk-12.json","chunk-13.json","chunk-14.json","chunk-15.json","chunk-16.json","chunk-17.json","chunk-18.json","chunk-19.json","chunk-20.json","chunk-21.json","chunk-22.json","chunk-23.json","chunk-24.json","chunk-25.json","chunk-26.json","chunk-27.json","chunk-28.json","chunk-29.json","chunk-30.json","chunk-31.json","chunk-32.json","chunk-33.json","chunk-34.json","chunk-35.json","chunk-36.json","chunk-37.json","chunk-38.json","chunk-39.json","chunk-40.json","chunk-41.json","chunk-42.json","chunk-43.json","chunk-44.json","chunk-45.json","chunk-46.json","chunk-47.json","chunk-48.json","chunk-49.json","chunk-50.json","chunk-51.json","chunk-52.json","chunk-53.json","chunk-54.json","chunk-55.json","chunk-56.json","chunk-57.json","chunk-58.json","chunk-59.json","chunk-60.json","chunk-61.json","chunk-62.json","chunk-63.json","chunk-64.json","chunk-65.json","chunk-66.json","chunk-67.json","chunk-68.json","chunk-69.json","chunk-70.json","chunk-71.json","chunk-72.json","chunk-73.json","chunk-74.json","chunk-75.json","chunk-76.json","chunk-77.json","chunk-78.json","chunk-79.json","chunk-80.json","chunk-81.json","chunk-82.json","chunk-83.json","chunk-84.json","chunk-85.json","chunk-86.json","chunk-87.json","chunk-88.json","chunk-89.json","chunk-90.json","chunk-91.json","chunk-92.json","chunk-93.json","chunk-94.json","chunk-95.json","chunk-96.json","chunk-97.json","chunk-98.json","chunk-99.json","chunk-100.json","chunk-101.json","chunk-102.json","chunk-103.json","chunk-104.json","chunk-105.json","chunk-106.json","chunk-107.json","chunk-108.json","chunk-109.json","chunk-110.json","chunk-111.json","chunk-112.json","chunk-113.json","chunk-114.json","chunk-115.json","chunk-116.json","chunk-117.json","chunk-118.json","chunk-119.json"];

files.forEach(file => {
  const src = path.join(srcDir, file);
  const dst = path.join(dstDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    const stat = fs.statSync(dst);
    console.log(`Copied ${file} -> size: ${stat.size} bytes`);
  } else {
    console.warn(`Source not found: ${src}`);
  }
});

console.log('SYNC_COMPLETE');
