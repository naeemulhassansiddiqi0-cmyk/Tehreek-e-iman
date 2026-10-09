const fs = require('fs');
const readline = require('readline');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'musnad_downloaded', 'musnad_ahmad_arabic.csv');

async function test() {
  const fileStream = fs.createReadStream(csvPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let count = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    count++;
    if (count <= 5 || count === 100 || count === 1000 || count === 5000 || count === 16000) {
      // Parse CSV line: "number","text"
      const commaIdx = line.indexOf('","');
      if (commaIdx !== -1) {
        const id = line.substring(1, commaIdx);
        let text = line.substring(commaIdx + 3);
        if (text.endsWith('"')) text = text.slice(0, -1);
        // Replace double double-quotes if any
        text = text.replace(/""/g, '"').replace(/\u200f/g, '').trim();
        console.log(`[Hadith #${id}] (len: ${text.length}): ${text.substring(0, 120)}...`);
      }
    }
  }
  console.log(`Total Hadiths read: ${count}`);
}

test();
