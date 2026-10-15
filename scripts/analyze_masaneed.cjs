const fs = require('fs');
const readline = require('readline');

async function analyzeMasaneed() {
  const fileStream = fs.createReadStream('D:/Antigravity/musnad_downloaded/musnad_ahmad_arabic.csv');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  const milestones = [1, 300, 600, 1000, 1400, 1500, 2000, 3000, 5000, 6500, 8000, 11000, 13000, 16500, 20000, 24000, 26363];
  
  for await (const line of rl) {
    if (!line.trim()) continue;
    const match = line.match(/^"(\d+)",\s*"(.*)"$/);
    if (!match) continue;
    const num = parseInt(match[1], 10);
    const text = match[2];

    if (milestones.includes(num)) {
      // Find prominent narrator mentions
      let sahabi = 'نامعلوم';
      if (text.includes('أَبِي بَكْرٍ') || text.includes('أَبُو بَكْرٍ')) sahabi = 'أبو بكر الصديق';
      else if (text.includes('عُمَرَ بْنِ الْخَطَّابِ') || text.includes('عُمَرُ')) sahabi = 'عمر بن الخطاب';
      else if (text.includes('عُثْمَانَ بْنِ عَفَّانَ') || text.includes('عُثْمَانُ')) sahabi = 'عثمان بن عفان';
      else if (text.includes('عَلِيِّ بْنِ أَبِي طَالِبٍ') || text.includes('عَلِيٍّ') || text.includes('عَلِيٌّ')) sahabi = 'علي بن أبي طالب';
      else if (text.includes('ابْنِ مَسْعُودٍ')) sahabi = 'عبد الله بن مسعود';
      else if (text.includes('ابْنِ عُمَرَ')) sahabi = 'عبد الله بن عمر';
      else if (text.includes('ابْنِ عَبَّاسٍ')) sahabi = 'عبد الله بن عباس';
      else if (text.includes('أَبِي هُرَيْرَةَ')) sahabi = 'أبو هريرة';
      else if (text.includes('أَنَسِ بْنِ مَالِكٍ') || text.includes('أَنَسٍ')) sahabi = 'أنس بن مالك';
      else if (text.includes('جَابِرِ بْنِ عَبْدِ اللَّهِ') || text.includes('جَابِرٍ')) sahabi = 'جابر بن عبد الله';
      else if (text.includes('أَبِي سَعِيدٍ الْخُدْرِيِّ') || text.includes('أَبِي سَعِيدٍ')) sahabi = 'أبو سعيد الخدري';
      else if (text.includes('عَائِشَةَ')) sahabi = 'عائشة أم المؤمنين';

      console.log(`Hadith #${num} -> Detected: ${sahabi}`);
    }
    count++;
  }
  console.log(`Total analyzed: ${count}`);
}

analyzeMasaneed();
