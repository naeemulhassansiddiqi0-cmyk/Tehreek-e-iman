import React from 'react';
import './globals.css';

export const metadata = {
  title: 'تحریکِ ایمان | جامع اسلامی ڈیجیٹل کتب خانہ',
  description: 'کلاسیکی پبلک ڈومین کتب، قرآن و تفاسیر، صحاح ستہ اور جدید اسلامی مراجع کا صاف ستھرا کتب خانہ۔'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ur" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq"
        />
      </head>
      <body className="bg-white text-stone-900 font-nastaliq antialiased">
        {/* Simple white header with Logo text "تحریک ایمان" on right, centered Search Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2 sm:py-2.5 min-h-[5.5rem] sm:min-h-[6rem] gap-3 sm:gap-6">
              
              {/* Right: Logo text "تحریک ایمان" مع بانی و سرپرست */}
              <div className="flex items-center gap-3 sm:gap-4 select-none shrink-0 py-1">
                <a href="/" className="flex items-center gap-3 sm:gap-4">
                  <img
                    src="/tehreek-iman-logo.jpg"
                    alt="تحریکِ ایمان - بانی و سرپرست حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ"
                    className="w-14 h-14 sm:w-[74px] sm:h-[74px] rounded-full object-cover border-2 border-amber-500 shadow-md ring-2 ring-emerald-800/30"
                  />
                  <div className="flex flex-col justify-center">
                    <span className="font-nastaliq text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight leading-tight">
                      تحریکِ ایمان
                    </span>
                    <span className="font-nastaliq text-xs sm:text-sm font-bold text-amber-900 leading-tight mt-1 flex flex-wrap items-center gap-1">
                      <span className="text-emerald-800 font-bold">بانی و سرپرست:</span>
                      <span className="text-stone-800">حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ</span>
                    </span>
                  </div>
                </a>
              </div>

              {/* Center: Search Bar with Urdu placeholder */}
              <div className="flex-1 max-w-xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="کتاب، مصنف یا موضوع تلاش کریں..."
                    className="w-full pr-11 pl-4 py-2.5 bg-gray-50 text-stone-900 placeholder:text-gray-400 text-sm rounded-2xl border border-gray-200 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition font-nastaliq"
                  />
                </div>
              </div>

              {/* Left: Clean links without clutter */}
              <nav className="hidden md:flex items-center gap-3 shrink-0 text-sm font-nastaliq font-bold">
                <a href="/" className="px-4 py-2 rounded-2xl bg-emerald-800 text-white shadow-xs">
                  کتب خانہ
                </a>
                <a href="/admin/books" className="px-4 py-2 rounded-2xl text-stone-700 hover:bg-gray-100">
                  انتظامیہ
                </a>
              </nav>

            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-80px)]">{children}</main>
      </body>
    </html>
  );
}