'use client';

import Link from 'next/link';
import { ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Scale } from 'lucide-react';

export default function SourcesAndLicensesPage() {
  const sources = [
    {
      id: 'quran',
      title: 'القرآن الکریم (مصحف عثمانی مدنی)',
      sourceName: 'Tanzil Project (tanzil.net) / Quran.com',
      sourceLink: 'https://tanzil.net',
      license: 'Creative Commons Attribution 3.0 (CC BY 3.0)',
      translator: 'مولانا فتح محمد جالندھری رحمہ اللہ (پبلک ڈومین)',
      category: 'Quran & Tafseer',
      status: 'اجازت ہے (منظور شدہ)',
      statusColor: 'emerald',
      description: 'کلام اللہ جل جلالہ کا مصحفِ عثمانی مدنی کا مصدقہ اور معیاری ترین متن جو تنزیل پروجیکٹ کی جانب سے شائقینِ قرآن کے لیے جاری کیا گیا ہے۔ اردو ترجمہ مولانا فتح محمد جالندھری کا تاریخی و پبلک ڈومین ترجمہ ہے۔',
      terms: 'متنِ قرآن میں کسی بھی قسم کی تحریف کی قطعی اجازت نہیں، اور ماخذ کا ربط اور نسبت واضح رکھنا ضروری ہے۔'
    },
    {
      id: 'sittah',
      title: 'صحاحِ ستہ و امہات الحدیث (بخاری، مسلم، ابوداود، ترمذی، نسائی، ابن ماجہ)',
      sourceName: 'Fawaz Ahmed Hadith API (GitHub: fawazahmed0/hadith-api)',
      sourceLink: 'https://github.com/fawazahmed0/hadith-api',
      license: 'The Unlicense (Public Domain Dedication) / MIT',
      translator: 'علماء و ائمہ سلف (مولانا داود راز، علامہ وحید الزماں، مولانا بدیع الزماں، مولانا عطاء اللہ ساجد)',
      category: 'Hadith',
      status: 'اجازت ہے (مشینی مسودہ برائے اسکالر نظرثانی)',
      statusColor: 'emerald',
      description: 'صحاحِ ستہ کے مکمل عربی متون (۳۰ ہزار سے زائد احادیث) اور اردو تراجم کا اوپن سورس ریپوزیٹری۔ عربی متن پبلک ڈومین ہے جبکہ اردو تراجم کو "مشینی مسودہ — زیرِ نظرثانی" رکھا گیا ہے۔',
      terms: 'ریپوزیٹری کا کوڈ اور ڈیٹا بیس مکمل پبلک ڈومین کے تحت وقف ہے اور غیر تجارتی و تجارتی استعمال کے لیے آزاد ہے۔'
    },
    {
      id: 'musnad',
      title: 'مسند الامام احمد بن حنبل الشیبانی',
      sourceName: 'Open Islamicate Texts Initiative (OpenITI)',
      sourceLink: 'https://github.com/OpenITI',
      license: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0)',
      translator: 'اردو ترجمہ زیرِ تدوین (Pending)',
      category: 'Hadith',
      status: 'اجازت ہے (عربی پبلک ڈومین)',
      statusColor: 'emerald',
      description: 'دنیائے اسلام کا عظیم ترین حدیثی انسائیکلوپیڈیا۔ تاریخی عربی نسخے کاپی رائٹ سے آزاد ہیں اور اوپن آئی ٹی آئی کی ڈیجیٹل تطہیر شدہ فائل سے تصدیق کیے گئے ہیں۔',
      terms: 'عربی کلاسیکی متون پبلک ڈومین ہیں، غیر تجارتی علمی اشاعت اور حوالہ دینا لازم ہے۔'
    },
    {
      id: 'dars',
      title: 'کتبِ نصابِ درسِ نظامی (ہدایہ، قدوری، کافیہ، نور الانوار، تلخیص، عقائد وغیرہ)',
      sourceName: 'Classical Islamic Heritage / Public Domain Manuscripts',
      sourceLink: 'https://archive.org/details/islamic-manuscripts-public-domain',
      license: 'Public Domain (تاریخی متونِ سلف)',
      translator: 'شعبۂ درسی تدوین و تسہیل، تحریکِ ایمان',
      category: 'Dars-e-Nizami',
      status: 'اجازت ہے (پبلک ڈومین)',
      statusColor: 'emerald',
      description: 'ائمہ سلف و متقدمین کی صدیوں پرانی کتبِ درسیہ جن کے مصنفین کی وفات کو صدیاں گزر چکی ہیں اور ان کے متون تمام تر قانونی کاپی رائٹس سے آزاد اور وقفِ عام ہیں۔',
      terms: 'تاریخی کتب کا اصل متن کاپی رائٹ سے مکمل آزاد ہے۔'
    },
    {
      id: 'modern',
      title: 'معاصر کتب و جدید فتاویٰ (معارف القرآن، فتاویٰ عثمانی، درسِ ترمذی، کفایت المفتی وغیرہ)',
      sourceName: 'معاصر مصنفین و ناشرین (ادارہ المعارف، دار العلوم کراچی، مکتبہ رحیمیہ)',
      sourceLink: 'https://archive.org',
      license: 'حقوقِ اشاعت محفوظ (Copyrighted by Respective Publishers)',
      translator: 'مصنفینِ کرام',
      category: 'Fiqh / Tafseer',
      status: 'اجازت درکار (Coming Soon)',
      statusColor: 'amber',
      description: 'جدید کتب کے حقوق متعلقہ اداروں اور ناشرین کے پاس محفوظ ہیں؛ تحریکِ ایمان کے کتب خانہ میں ان کا کوئی غیر مجاز متن شامل نہیں کیا گیا بلکہ کارڈ پر "جلد آ رہی ہے (اجازت درکار)" رکھا گیا ہے۔',
      terms: 'بغیر ناشر کی تحریری اجازت کے دوبارہ اشاعت کی ممانعت ہے۔'
    }
  ];

  return (
    <div className="bg-white min-h-screen text-stone-900 pb-24">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-800/80 border border-emerald-700 text-amber-300 text-xs font-semibold">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>شفافیت و حقوقِ اشاعت (Copyright & Open License Audit)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-nastaliq leading-relaxed">
            ماخذات، مراجع اور قانونی لائسنسز کی دستاویز
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base font-nastaliq max-w-3xl leading-loose">
            تحریکِ ایمان ڈیجیٹل کتب خانہ کا اصولی منشور: کوئی متن، ترجمہ، حوالہ یا تخریج بنا لائسنس شامل نہیں کی جاتی۔ صرف وہ ماخذ شامل ہیں جن کا لائسنس واضح طور پر کھلا (Public Domain / CC / MIT) ہو۔
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold font-nastaliq text-emerald-800 hover:text-emerald-950 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>کتب خانہ پر واپس جائیں</span>
          </Link>
          <span className="text-xs font-nastaliq text-stone-400">
            آخری باضابطہ آڈٹ: اکتوبر ۲۰۲۶ء
          </span>
        </div>

        {/* Source Cards */}
        <div className="space-y-6">
          {sources.map(src => (
            <div
              key={src.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs hover:border-emerald-700/30 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-700"></span>
                  <h2 className="text-xl sm:text-2xl font-black font-nastaliq text-emerald-950">
                    {src.title}
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-nastaliq self-start sm:self-auto ${
                    src.statusColor === 'emerald'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {src.statusColor === 'emerald' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>{src.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-nastaliq">
                <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/60 space-y-1">
                  <span className="font-bold text-stone-500">سرکاری ماخذ (Source):</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900">{src.sourceName}</span>
                    <a
                      href={src.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline inline-flex items-center gap-0.5 shrink-0"
                    >
                      <span>ماخذ لنک</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/60 space-y-1">
                  <span className="font-bold text-stone-500">قانونی لائسنس (License):</span>
                  <p className="font-bold text-emerald-900">{src.license}</p>
                </div>

                <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/60 space-y-1">
                  <span className="font-bold text-stone-500">مترجم / مصنف (Author / Translator):</span>
                  <p className="font-bold text-stone-900">{src.translator}</p>
                </div>

                <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/60 space-y-1">
                  <span className="font-bold text-stone-500">کٹیگری (Category):</span>
                  <p className="font-bold text-stone-900">{src.category}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs sm:text-sm font-nastaliq text-stone-700 leading-relaxed text-justify">
                  {src.description}
                </p>
                <p className="text-[11px] font-nastaliq text-stone-500 bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-xl">
                  <strong className="text-amber-900">شرائط و قانونی پابندی:</strong> {src.terms}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Audit Protocols Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h3 className="text-lg font-black font-nastaliq text-emerald-950">
              تحریکِ ایمان کے ۵ سخت تصدیقی معیارات
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm font-nastaliq text-stone-700 list-disc list-inside leading-loose">
            <li><strong>عدمِ تحریف:</strong> کسی بھی کتاب کے متن، اعراب یا ترجمہ میں AI سے خود ساختہ ترمیم نہیں کی جاتی۔</li>
            <li><strong>لفظ بہ لفظ موازنہ:</strong> تمام احادیث کا حدیث نمبر کے مطابق کھلے ماخذ کی فائلوں سے آڈٹ کیا جاتا ہے۔</li>
            <li><strong>تکرار و خالی متن کی چھانٹی:</strong> ہر کتاب پر مکرر نمبروں اور خالی متون کا تکنیکی آڈٹ اسکرپٹ چلایا جاتا ہے۔</li>
            <li><strong>اسکالر منظوری کی شرط:</strong> کسی بھی روایت پر "تصدیق شدہ" کا نشان صرف اور صرف مجاز اسکالر کے review صفحے پر جانچنے کے بعد لگتا ہے، مشینی مسودہ خود بخود ویریفائیڈ نہیں ہو سکتا۔</li>
            <li><strong>کاپی رائٹ کی حفاظت:</strong> غیر مصدقہ یا حقوق محفوظ جدید کتب کو مکمل متن کے ساتھ شائع نہیں کیا جاتا بلکہ ان کے لیے پیشگی اجازت لازمی ہے۔</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
