import { publicDomainBooks } from '../../../data/publicDomainBooks';
import { ArrowRight, BookOpen, Clock, AlertCircle } from 'lucide-react';

interface BookPageProps {
  params: {
    slug: string;
  };
}

export default function BookDetailPage({ params }: BookPageProps) {
  const rawSlug = params?.slug || '';
  const slug = decodeURIComponent(rawSlug).toLowerCase();
  const book = publicDomainBooks.find(
    b => b.slug.toLowerCase() === slug || b.id.toLowerCase() === slug
  );

  return (
    <div className="min-h-screen bg-white text-[#065f46]" dir="rtl">
      {/* Clean White Header like Homepage */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Right: Logo text "تحریک ایمان" */}
            <div className="flex items-center gap-3 select-none shrink-0">
              <a href="/" className="flex items-center gap-3">
                <img
                  src="/tehreek-iman-logo.jpg"
                  alt="تحریک ایمان"
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-700 shadow-xs"
                />
                <div className="flex flex-col">
                  <span className="font-nastaliq text-2xl font-black text-[#065f46] tracking-tight leading-none">
                    تحریک ایمان
                  </span>
                  <span className="text-[11px] font-medium text-stone-500 font-nastaliq mt-0.5">
                    جامع ڈیجیٹل کتب خانہ
                  </span>
                </div>
              </a>
            </div>

            {/* Left: Back Link */}
            <nav className="flex items-center gap-2 text-sm font-nastaliq font-bold">
              <a
                href="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gray-50 hover:bg-emerald-50 text-[#065f46] border border-gray-200 transition"
              >
                <ArrowRight className="w-4 h-4" />
                <span>واپس کتب خانہ</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {!book ? (
          /* Not Found State */
          <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-nastaliq text-[#065f46]">
              کتاب نہیں ملی
            </h1>
            <p className="text-stone-500 font-nastaliq text-sm sm:text-base max-w-md mx-auto">
              معذرت، مطلوبہ کتاب پبلک ڈومین کتب خانہ کے ریکارڈ میں موجود نہیں ہے۔ آپ فہرست میں جا کر دیگر کتب کا مطالعہ فرما سکتے ہیں۔
            </p>
            <div className="pt-2">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#065f46] hover:bg-[#054e39] text-white text-sm font-bold font-nastaliq shadow-sm transition active:scale-95"
              >
                <span>واپس کتب خانہ پر جائیں</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* Book Found State: Simple White Card with Shadow in Center */
          <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm text-center space-y-8">
            {/* 3. Category Chip (Green) */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-[#065f46] border border-emerald-200 font-nastaliq">
                <BookOpen className="w-3.5 h-3.5 text-[#065f46]" />
                <span>موضوع: {book.category}</span>
              </span>
            </div>

            {/* 1. Book Title (Urdu) */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black font-nastaliq text-[#065f46] leading-relaxed">
                {book.title_ur}
              </h1>
              {book.title_ar && (
                <p className="font-arabic text-lg sm:text-xl text-stone-500 leading-relaxed">
                  {book.title_ar}
                </p>
              )}
            </div>

            {/* 2. Author Name */}
            <div className="text-sm sm:text-base text-stone-600 font-nastaliq">
              <span>مصنف: </span>
              <strong className="text-[#065f46] font-black">{book.author}</strong>
              {book.death_year && (
                <span className="text-stone-400 font-sans mr-2">
                  (وفات: {book.death_year}ھ)
                </span>
              )}
            </div>

            {/* 4. Description */}
            <div className="max-w-2xl mx-auto">
              <p className="text-stone-700 text-sm sm:text-base font-nastaliq leading-[2.6] text-justify sm:text-center">
                {book.intro_ur}
              </p>
            </div>

            {/* Book Meta Details */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-500 font-nastaliq pt-2">
              <span className="px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
                ضخامت: {book.volumes} جلدیں
              </span>
              <span className="px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
                صفحات: {book.pages.toLocaleString('ur-PK')} ص
              </span>
              <span className="px-3 py-1 bg-emerald-50/50 text-[#065f46] rounded-xl border border-emerald-100">
                پبلک ڈومین (آزاد مطالعہ)
              </span>
            </div>

            {/* 5. 2 Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-100">
              {/* Button 1: آن لائن پڑھیں - جلد آ رہا ہے */}
              <button
                type="button"
                disabled
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-50 text-[#065f46] border-2 border-emerald-200 text-sm font-black font-nastaliq cursor-not-allowed opacity-90 shadow-xs"
                title="آن لائن مطالعہ کا فیچر جلد فعال کیا جا رہا ہے"
              >
                <Clock className="w-4 h-4 text-[#065f46]" />
                <span>آن لائن پڑھیں — جلد آ رہا ہے</span>
              </button>

              {/* Button 2: واپس کتب خانہ پر جائیں */}
              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#065f46] hover:bg-[#054e39] text-white text-sm font-bold font-nastaliq shadow-md transition active:scale-95"
              >
                <span>واپس کتب خانہ پر جائیں</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}