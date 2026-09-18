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
                    <span className="font-nastaliq text-2xl font-black text-emerald-800 tracking-tight leading-none">
                      تحریک ایمان
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 font-nastaliq mt-0.5">
                      جامع ڈیجیٹل کتب خانہ
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