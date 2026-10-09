const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'musnad_downloaded', 'musnad_ahmad_arabic.csv');
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n');

const samples = [];
const sampleIds = [1, 50, 100, 500, 1000, 3000, 5000, 8000, 12000, 16000];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const commaIdx = line.indexOf('","');
  if (commaIdx !== -1) {
    const id = parseInt(line.substring(1, commaIdx), 10);
    if (sampleIds.includes(id)) {
      let text = line.substring(commaIdx + 3);
      if (text.endsWith('"')) text = text.slice(0, -1);
      text = text.replace(/""/g, '"').replace(/\u200f/g, '').trim();
      samples.push({ id, textLength: text.length, snippet: text.substring(0, 200), fullText: text });
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'sample_hadiths.json'), JSON.stringify(samples, null, 2), 'utf8');
console.log('Saved samples count:', samples.length);
