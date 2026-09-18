import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';
import { processChatMessage, ChatResponsePayload } from '../services/smartChatService';
import { PublicDomainBook, ModernBook } from '../data/publicDomainBooks';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  payload: ChatResponsePayload;
  timestamp: string;
}

interface ChatbotProps {
  onSelectBook?: (bookSlug: string, bookObj?: PublicDomainBook | ModernBook) => void;
  apiKey?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onSelectBook, apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      payload: {
        type: 'text',
        data: 'السلام علیکم ورحمۃ اللہ! میں تحریکِ ایمان کا ذہین کتب خانہ (AI Librarian) ہوں۔ آپ مجھ سے کسی بھی کتاب، مصنف، موضوع، یا فقہی و حدیثی رہنمائی کے بارے میں دریافت فرما سکتے ہیں۔'
      },
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputMessage.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      payload: {
        type: 'text',
        data: query
      },
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const resultPayload = await processChatMessage(query, apiKey);
      const botMsg: ChatMessage = {
        id: 'b_' + Date.now(),
        sender: 'bot',
        payload: resultPayload,
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'b_err_' + Date.now(),
        sender: 'bot',
        payload: {
          type: 'text',
          data: 'معذرت، جواب حاصل کرنے میں کچھ دشواری ہوئی۔ براہ کرم دوبارہ کوشش فرمائیں۔'
        },
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAction = (book: PublicDomainBook | ModernBook) => {
    if (book.source_type === 'external') {
      window.open((book as ModernBook).external_link, '_blank', 'noopener,noreferrer');
    } else {
      if (onSelectBook) {
        onSelectBook(book.slug, book);
      } else {
        window.location.href = '/books/' + book.slug;
      }
    }
  };

  return (
    <>
      {/* Floating Action Button: Clean Emerald Circle Bottom-Left */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        title="ذہین کتب خانہ (AI Librarian)"
        aria-label="ذہین کتب خانہ چیٹ بوٹ"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Sparkles className="w-7 h-7 text-amber-300" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window: White, Rounded-2xl, Fast */}
      {isOpen && (
        <div
          dir="rtl"
          className="fixed bottom-24 left-6 z-50 w-[92vw] sm:w-[420px] max-h-[640px] h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn"
          style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', system-ui, sans-serif" }}
        >
          {/* Header */}
          <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-amber-300 border border-emerald-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white leading-tight">ذہین کتب خانہ</h3>
                <p className="text-xs text-emerald-200">تحریکِ ایمان اے آئی لائبریرین</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'bot',
                      payload: {
                        type: 'text',
                        data: 'کتب خانہ کی گفتگو ری سیٹ کر دی گئی ہے۔ آپ نئی کتاب یا علمی مسئلہ دریافت فرما سکتے ہیں۔'
                      },
                      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
                    }
                  ])
                }
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700 transition"
                title="نئی گفتگو"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700 transition"
                title="بند کریں"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-sm transition-all ${
                    msg.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-tr-none'
                      : 'bg-white border border-gray-100 text-stone-800 shadow-sm rounded-tl-none'
                  }`}
                >
                  {/* If BOOK_QUERY payload */}
                  {msg.payload.type === 'book_info' ? (
                    <div className="space-y-3">
                      {/* Book Cover + Title Header */}
                      <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
                        {msg.payload.data.cover_url && (
                          <img
                            src={msg.payload.data.cover_url}
                            alt={msg.payload.data.fullName}
                            className="w-16 h-22 object-cover rounded-lg shadow-sm border border-gray-100 shrink-0"
                          />
                        )}
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            کتاب کارڈ
                          </span>
                          <h4 className="font-bold text-base text-emerald-900 leading-snug">
                            {msg.payload.data.fullName}
                          </h4>
                          <p className="text-xs text-stone-500">{msg.payload.data.author}</p>
                        </div>
                      </div>

                      {/* 2-Line Intro */}
                      <p className="text-xs text-stone-700 leading-relaxed font-normal">
                        {msg.payload.data.intro}
                      </p>

                      {/* Meta Badges */}
                      <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                        {msg.payload.data.meta}
                      </div>

                      {/* Action Green Button */}
                      <button
                        type="button"
                        onClick={() => handleBookAction((msg.payload as any).data.book)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
                      >
                        {msg.payload.data.book.source_type === 'public' ? (
                          <>
                            <BookOpen className="w-4 h-4 text-amber-300" />
                            <span>{msg.payload.data.action.label}</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 text-amber-300" />
                            <span>{msg.payload.data.action.label}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Normal Markdown-Style Urdu Text */
                    <div className="space-y-2 text-stone-800 leading-relaxed text-sm whitespace-pre-line">
                      {msg.payload.data}
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1.5 text-left ${
                      msg.sender === 'user' ? 'text-emerald-200' : 'text-stone-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs text-stone-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-stone-600 font-medium mr-1">کتب خانے سے تلاش جاری ہے...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setInputMessage('صحیح بخاری');
              }}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 whitespace-nowrap hover:bg-emerald-100 transition"
            >
              📖 صحیح بخاری
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMessage('تفسیر ابن کثیر');
              }}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 whitespace-nowrap hover:bg-emerald-100 transition"
            >
              📜 تفسیر ابن کثیر
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMessage('الہدایہ شرح بدایۃ المبتدی');
              }}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 whitespace-nowrap hover:bg-emerald-100 transition"
            >
              ⚖️ الہدایہ
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMessage('سیرت ابن ہشام');
              }}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 whitespace-nowrap hover:bg-emerald-100 transition"
            >
              ✨ سیرت ابن ہشام
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="کتاب کا نام، مصنف یا موضوع تحریر فرمائیں..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed shadow transition cursor-pointer"
              title="ارسال کریں"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};