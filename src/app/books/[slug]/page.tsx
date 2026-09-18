"use client";
import { publicDomainBooks } from "@/data/publicDomainBooks";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BookDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const book = publicDomainBooks.find(b => b.slug === slug);

  if (!book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{backgroundColor: '#FFFFFF'}}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{color: '#065f46', fontFamily: 'Noto Nastaliq Urdu'}}>کتاب نہیں ملی</h1>
          <Link href="/" className="text-white px-6 py-2 rounded" style={{backgroundColor: '#065f46'}}>واپس جائیں</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FFFFFF'}}>
      <header className="border-b p-4" style={{borderColor: '#065f46'}}>
        <Link href="/" className="font-bold" style={{color: '#065f46'}}>← تحریک ایمان ڈیجیٹل کتب خانہ</Link>
      </header>
      <main className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border">
          <h1 className="text-4xl font-bold mb-2" style={{color: '#065f46', fontFamily: 'Noto Nastaliq Urdu'}}>{book.titleUrdu || book.title}</h1>
          <p className="text-lg mb-2 opacity-80">مصنف: {book.authorUrdu || book.author}</p>
          <span className="inline-block px-3 py-1 rounded-full text-white text-sm mb-6" style={{backgroundColor: '#065f46'}}>{book.category}</span>
          <p className="leading-8 text-gray-700 mb-8" style={{fontFamily: 'Noto Nastaliq Urdu'}}>{book.description}</p>
          <div className="flex gap-4">
            <button className="flex-1 py-3 rounded-xl text-white font-bold" style={{backgroundColor: '#065f46'}}>آن لائن پڑھیں - جلد آ رہا ہے</button>
            <Link href="/" className="flex-1 py-3 rounded-xl text-center border-2 font-bold" style={{borderColor: '#065f46', color: '#065f46'}}>واپس کتب خانہ</Link>
          </div>
        </div>
      </main>
    </div>
  );
}