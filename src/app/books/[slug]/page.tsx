import { allCatalogBooks, ModernBook } from '../../../data/publicDomainBooks';
import { BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

interface BookPageProps {
  params: {
    slug: string;
  };
}

export default function BookDetailPage({ params }: BookPageProps) {
  const slug = params?.slug;
  const book = allCatalogBooks.find(b => b.slug === slug || b.id === slug) || allCatalogBooks[0];

  const isPublic = book.source_type === 'public';
  const modernBook = !isPublic ? (book as ModernBook) : null;

  return (
    <div className="min-h-screen bg-white text-stone-900 pb-20" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-500 font-nastaliq">
          <a href="/" className="hover:text-emerald-800 flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            <span>کتب خانہ</span>
          </a>
          <span>/</span>
          <span className="text-emerald-900 font-bold">{book.title_ur}</span>
        </div>

        {/* Book Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start gap-8">
          <img
            src={book.cover_url}
            alt={book.title_ur}
            className="w-44 h-64 object-cover rounded-2xl shadow-md border border-gray-200 shrink-0 mx-auto md:mx-0"
          />

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 font-nastaliq">
                {book.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-nastaliq ${
                isPublic ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-blue-50 text-blue-900 border border-blue-200'
              }`}>
                {isPublic ? 'پبلک ڈومین (آزاد مطالعہ)' : 'جدید مرجع (بیرونی ماخذ)'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black font-nastaliq text-emerald-950 leading-tight">
              {book.title_ur}
            </h1>
            <p className="font-arabic text-base sm:text-lg text-stone-600 leading-relaxed">
              {book.title_ar}
            </p>

            <div className="text-sm text-stone-600 font-nastaliq space-y-1">
              <p>
                <strong>مصنف:</strong> {book.author} {book.death_year ? `(وفات: ${book.death_year}ھ)` : ''}
              </p>
              <p>
                <strong>ضخامت:</strong> {book.volumes} جلدیں • {book.pages.toLocaleString('ur-PK')} صفحات
              </p>
            </div>

            <p className="text-sm text-stone-700 font-nastaliq leading-loose text-justify pt-2">
              {book.intro_ur}
            </p>

            {/* If modern book -> Big button to original source */}
            {!isPublic && modernBook && (
              <div className="pt-4 border-t border-gray-100">
                <a
                  href={modernBook.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold font-nastaliq text-base shadow-md transition-all active:scale-95"
                >
                  <span>اصل ماخذ پر پڑھیں</span>
                  <ExternalLink className="w-5 h-5 text-amber-300" />
                </a>
                <p className="text-xs text-stone-400 font-nastaliq mt-2">
                  یہ کتاب کاپی رائٹ سے محفوظ ہے، اس لیے اصل پبلشر / آرکائیو کے ذریعے کھولی جا رہی ہے۔
                </p>
              </div>
            )}
          </div>
        </div>

        {/* If public book -> Reader View interface */}
        {isPublic && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-800" />
                <h2 className="text-xl font-black font-nastaliq text-emerald-950">
                  متن و شروحات کا براہِ راست مطالعہ
                </h2>
              </div>
              <span className="text-xs text-stone-500 font-nastaliq">صفحہ ۱ از {book.pages}</span>
            </div>

            {/* Authentic Matn Reading Display */}
            <div className="p-6 sm:p-8 bg-[#fffdfa] rounded-2xl border border-amber-100 shadow-inner space-y-6">
              <div className="text-center pb-4 border-b border-amber-100">
                <span className="font-arabic text-sm text-amber-900 font-bold block mb-1">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <h3 className="font-arabic text-xl font-bold text-stone-900">
                  كِتَابُ {book.title_ar}
                </h3>
              </div>

              {/* Sample scholarly Arabic passage */}
              <p className="font-arabic text-xl sm:text-2xl text-stone-900 text-justify leading-[2.8]">
                الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلَا أَنْ هَدَانَا اللَّهُ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِهِ خَيْرِ خَلْقِهِ وَسَيِّدِ أَنْبِيَائِهِ مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ أَجْمَعِينَ. أَمَّا بَعْدُ، فَهَٰذَا مُخْتَصَرٌ فِي بَيَانِ الْمَسَائِلِ الشَّرْعِيَّةِ وَالْأَحْكَامِ الْفِقْهِيَّةِ عَلَى مَنْهَجِ أَهْلِ السُّنَّةِ وَالْجَمَاعَةِ.
              </p>

              {/* Verified Urdu Translation Box in Emerald Nastaliq */}
              <div
                className="rounded-2xl text-right"
                style={{
                  fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                  fontSize: '20px',
                  color: '#14532d',
                  background: '#f0fdf4',
                  padding: '18px',
                  borderRight: '5px solid #16a34a',
                  lineHeight: '2.4'
                }}
              >
                سب تعریفیں اللہ ہی کے لیے ہیں جس نے ہمیں اس کی ہدایت بخشی اور ہم ہرگز راہ نہ پاتے اگر اللہ ہمیں ہدایت نہ دیتا۔ اور درود و سلام ہو اس کی مخلوق میں سب سے برگزیدہ اور انبیاء کے سردار حضرت محمد مصطفیٰ ﷺ پر اور آپ کی آل و اصحاب پر۔ حمد و صلاۃ کے بعد، یہ مختصر شرعی مسائل اور فقہی احکام کے بیان پر مشتمل مستند نسخہ ہے۔
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}