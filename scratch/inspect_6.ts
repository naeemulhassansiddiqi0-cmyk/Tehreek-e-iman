
import { generateOfflineScholarlyResponse } from 'C:/Users/CoreCom/OneDrive/Desktop/Antigravity/src/services/aiService';

const queries = [
  'اللہ تعالیٰ کے ننانوے نام سنائیں',
  'sajda sahw kab wajib hota hai',
  'qasr ki namaz',
  'زکوۃ کا نصاب کتنا ہے؟',
  'قربانی کس پر واجب ہے؟',
  'تحریک ایمان پورٹل کا تعارف کیا ہے؟'
];

for (const q of queries) {
  const res = generateOfflineScholarlyResponse(q, 'dalayel_quran_sunnah', 'intermediate');
  console.log('=== Q: ' + q + ' ===');
  console.log(res.answer.slice(0, 200));
}
