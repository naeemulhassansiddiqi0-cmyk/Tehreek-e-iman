import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  BookOpen, 
  ExternalLink, 
  RefreshCw, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Bookmark 
} from 'lucide-react';
import { processChatMessage, ChatResponsePayload } from '../services/smartChatService';
import { PublicDomainBook, ModernBook } from '../data/publicDomainBooks';
import { speakText } from '../services/speechService';
import { copyToClipboardWithTehreekLogo } from '../utils/clipboardHelper';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  payload: ChatResponsePayload;
  timestamp: string;
}

interface ChatbotProps {
  onSelectBook?: (bookSlug: string, bookObj?: PublicDomainBook | ModernBook) => void;
  apiKey?: string;
  onSaveToNotes?: (content: string) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onSelectBook, apiKey, onSaveToNotes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedMsgId, setSavedMsgId] = useState<string | null>(null);
  
  // Font Size state & Pinch Zoom for Mobile & Desktop (12px to 28px)
  const [fontSize, setFontSize] = useState(15);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  function getDistance(touches: React.TouchList) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setInitialDistance(getDistance(e.touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance) {
      if (e.cancelable) e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const diff = currentDistance - initialDistance;
      if (Math.abs(diff) > 20) { // threshold to avoid jitter
        if (diff > 0) setFontSize(prev => Math.min(prev + 1, 28));
        else setFontSize(prev => Math.max(prev - 1, 12));
        setInitialDistance(currentDistance);
      }
    }
  };

  const handleTouchEnd = () => {
    setInitialDistance(null);
  };
  
  const recognitionRef = useRef<any>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      payload: {
        type: 'text',
        data: 'السلام علیکم ورحمۃ اللہ! میں تحریکِ ایمان کا علمی اتالیق و ذہین کتب خانہ (AI Scholar & Librarian) ہوں۔ آپ مجھ سے کسی بھی کتاب، فقہی و شرعی مسئلے، احادیثِ مبارکہ یا حوالہ جاتی معلومات (کتاب و صفحہ نمبر کے ساتھ) کے بارے میں دریافت فرما سکتے ہیں۔'
      },
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Setup SpeechRecognition for Urdu voice input
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ur-PK';
        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript) {
            setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
          }
          setIsListening(false);
        };
        recognition.onerror = () => {
          setIsListening(false);
        };
        recognition.onend = () => {
          setIsListening(false);
        };
        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (stopSpeechRef.current) {
        stopSpeechRef.current();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('آپ کے براؤزر میں وائس ریکگنیشن کی سہولت دستیاب نہیں ہے۔ براہ کرم گوگل کروم استعمال فرمائیں۔');
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

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

  const getTextContent = (payload: ChatResponsePayload): string => {
    if (payload.type === 'book_info') {
      const d = payload.data;
      return `${d.fullName}\nمصنف: ${d.author}\n${d.intro}\n${d.meta}`;
    }
    return typeof payload.data === 'string' ? payload.data : '';
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      if (stopSpeechRef.current) {
        stopSpeechRef.current();
        stopSpeechRef.current = null;
      }
      setSpeakingMsgId(null);
      return;
    }

    if (stopSpeechRef.current) {
      stopSpeechRef.current();
      stopSpeechRef.current = null;
    }

    setSpeakingMsgId(msgId);
    const cancel = speakText(
      text,
      () => setSpeakingMsgId(msgId),
      () => {
        setSpeakingMsgId(null);
        stopSpeechRef.current = null;
      },
      () => {
        setSpeakingMsgId(null);
        stopSpeechRef.current = null;
      }
    );
    stopSpeechRef.current = cancel;
  };

  const handleCopy = async (msgId: string, text: string) => {
    const success = await copyToClipboardWithTehreekLogo(text, {
      title: 'تحریکِ ایمان علمی اتالیق جواب',
      includeTimestamp: true,
    });
    if (success) {
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2500);
    }
  };

  const handleSaveNote = (msgId: string, content: string) => {
    if (onSaveToNotes) {
      onSaveToNotes(content);
      setSavedMsgId(msgId);
      setTimeout(() => setSavedMsgId(null), 2500);
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
      {/* Single Floating Action Button: Fixed bottom-5 right-5 on desktop, bottom-20 right-4 on mobile */}
      <button
        type="button"
        onClick={() => {
          if (isOpen && stopSpeechRef.current) {
            stopSpeechRef.current();
            stopSpeechRef.current = null;
            setSpeakingMsgId(null);
          }
          setIsOpen(prev => !prev);
        }}
        className="fixed bottom-20 right-4 md:bottom-5 md:right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white shadow-2xl hover:shadow-emerald-900/40 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400 cursor-pointer"
        title="علمی اتالیق و ذہین کتب خانہ (AI Scholar & Librarian)"
        aria-label="علمی اتالیق چیٹ بوٹ"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white"></span>
            </span>
          </div>
        )}
      </button>

      {/* Single Chat Window: Optimized for Desktop and Mobile without covering content */}
      {isOpen && (
        <div
          dir="rtl"
          className="fixed bottom-36 right-3 left-3 sm:left-auto sm:right-4 md:bottom-20 md:right-5 z-50 w-auto sm:w-[440px] max-h-[75vh] sm:max-h-[640px] h-[580px] flex flex-col bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden animate-fadeIn"
          style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-700/80 flex items-center justify-center text-amber-300 border border-emerald-500/40 shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                  علمی اتالیق و ذہین کتب خانہ
                </h3>
                <p className="text-[11px] text-emerald-200">
                  تحریکِ ایمان • دار الافتاء و کتب خانہ (مع حوالہ جات)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (stopSpeechRef.current) {
                    stopSpeechRef.current();
                    stopSpeechRef.current = null;
                    setSpeakingMsgId(null);
                  }
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'bot',
                      payload: {
                        type: 'text',
                        data: 'کتب خانہ کی گفتگو ری سیٹ کر دی گئی ہے۔ آپ نئی کتاب، فقہی مسئلہ یا حوالہ دریافت فرما سکتے ہیں۔'
                      },
                      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/60 transition cursor-pointer"
                title="نئی گفتگو"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (stopSpeechRef.current) {
                    stopSpeechRef.current();
                    stopSpeechRef.current = null;
                    setSpeakingMsgId(null);
                  }
                  setIsOpen(false);
                }}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/60 transition cursor-pointer"
                title="بند کریں"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/60">
            {messages.map(msg => {
              const textContent = getTextContent(msg.payload);
              const isSpeaking = speakingMsgId === msg.id;
              const isCopied = copiedMsgId === msg.id;
              const isSaved = savedMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    style={
                      msg.sender === 'user'
                        ? {
                            backgroundColor: '#E8F5E9',
                            color: '#000000',
                            fontWeight: 600,
                            fontSize: '15px',
                            padding: '12px 16px',
                            borderRadius: '18px 18px 0 18px',
                            border: '1px solid #ccc',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          }
                        : {
                            backgroundColor: '#FFFFFF',
                            color: '#111111',
                            border: '1px solid #E5E7EB',
                            borderRadius: '18px 18px 18px 0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }
                    }
                    className={`max-w-[90%] transition-all ${msg.sender === 'user' ? '' : 'p-3.5'}`}
                  >
                    {msg.sender === 'user' ? (
                      <div>
                        <div
                          className="urdu-text whitespace-pre-line leading-relaxed"
                          style={{ color: '#000000', fontWeight: 600, fontSize: '15px' }}
                        >
                          {typeof msg.payload.data === 'string' ? msg.payload.data : ''}
                        </div>
                        <div
                          className="text-[10px] mt-1 text-left font-sans"
                          style={{ color: '#4b5563' }}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* If BOOK_QUERY payload */}
                        {msg.payload.type === 'book_info' ? (
                          <div className="space-y-3">
                            {/* Book Cover + Title Header */}
                            <div className="flex items-start gap-3 border-b border-stone-100 pb-3">
                              {typeof msg.payload.data === 'object' && msg.payload.data.cover_url && (
                                <div className="premium-book-cover w-14 h-20 shrink-0">
                                  <img
                                    src={msg.payload.data.cover_url}
                                    alt={msg.payload.data.fullName}
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      const originalUrl = (msg.payload.data as any)?.cover_url;
                                      if (target.src.endsWith('.svg') && originalUrl) {
                                        target.src = originalUrl.replace(/\.svg$/, '.jpg');
                                      }
                                    }}
                                  />
                                </div>
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
                          <div>
                            {/* A+ A- Font Controls for Desktop */}
                            <div className="hidden md:flex items-center justify-between border-b border-stone-100 pb-1.5 mb-2 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-stone-400 font-sans ml-1">فونٹ سائز:</span>
                                <button
                                  type="button"
                                  onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer transition active:scale-95"
                                  title="فونٹ چھوٹا کریں (A-)"
                                >
                                  A-
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFontSize(15)}
                                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-mono cursor-pointer transition"
                                  title="اصل سائز پر ری سیٹ کریں (15px)"
                                >
                                  {fontSize}px
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFontSize(prev => Math.min(prev + 2, 28))}
                                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer transition active:scale-95"
                                  title="فونٹ بڑا کریں (A+)"
                                >
                                  A+
                                </button>
                              </div>
                              <div className="text-[10px] text-gray-400">A+ A- سے سائز تبدیل کریں</div>
                            </div>

                            {/* Scholarly Urdu Text with Mobile Pinch Zoom */}
                            <div 
                              onTouchStart={handleTouchStart}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                              className="select-text break-words space-y-2 urdu-text leading-relaxed whitespace-pre-line selection:bg-emerald-100"
                              style={{ 
                                color: '#111111',
                                fontSize: `${fontSize}px`,
                                lineHeight: '1.9',
                                touchAction: 'none',
                                userSelect: 'text',
                                transition: 'font-size 0.15s ease'
                              }}
                            >
                              {msg.payload.data}
                            </div>

                            {/* UX Hint on Mobile */}
                            <div className="md:hidden text-[10px] text-gray-400 mt-1 text-center">
                              دو انگلیوں سے زوم کریں 🤏
                            </div>
                          </div>
                        )}

                        {/* Bot Action Bar: Audio Playback, Copy with Tehreek Logo, Save to Notes */}
                        {textContent && (
                          <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              {/* Audio Playback Button */}
                              <button
                                type="button"
                                onClick={() => handleSpeak(msg.id, textContent)}
                                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer text-[11px] ${
                                  isSpeaking
                                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 animate-pulse'
                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                }`}
                                title={isSpeaking ? 'صوتی تلاوت روکیں' : 'صوتی تلاوت سنیں (Urdu Speech)'}
                              >
                                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-700" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-700" />}
                                <span>{isSpeaking ? 'روکیں' : 'سنیں'}</span>
                              </button>

                              {/* Copy with Logo Button */}
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.id, textContent)}
                                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer text-[11px] ${
                                  isCopied
                                    ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                }`}
                                title="تحریکِ ایمان تصدیق کے ساتھ کاپی کریں"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-stone-600" />}
                                <span>{isCopied ? 'کاپی شدہ!' : 'کاپی'}</span>
                              </button>

                              {/* Save to Notes Button */}
                              {onSaveToNotes && (
                                <button
                                  type="button"
                                  onClick={() => handleSaveNote(msg.id, textContent)}
                                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer text-[11px] ${
                                    isSaved
                                      ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                  }`}
                                  title="اپنے ذاتی نوٹس میں محفوظ کریں"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'text-emerald-700 fill-emerald-700' : 'text-stone-600'}`} />
                                  <span>{isSaved ? 'محفوظ!' : 'نوٹ'}</span>
                                </button>
                              )}
                            </div>

                            <span className="text-[10px] text-stone-400 font-sans">
                              {msg.timestamp}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs text-stone-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-stone-700 font-medium mr-1 font-nastaliq">
                    کتب خانے و کتبِ فقہ سے تحقیق جاری ہے...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starters Bar */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              type="button"
              onClick={() => setInputMessage('صحیح بخاری')}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 whitespace-nowrap hover:bg-emerald-100 transition cursor-pointer"
            >
              📖 صحیح بخاری
            </button>
            <button
              type="button"
              onClick={() => setInputMessage('الہدایہ شرح بدایۃ المبتدی')}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 whitespace-nowrap hover:bg-emerald-100 transition cursor-pointer"
            >
              ⚖️ الہدایہ (فقہ حنفی)
            </button>
            <button
              type="button"
              onClick={() => setInputMessage('تفسیر ابن کثیر')}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 whitespace-nowrap hover:bg-emerald-100 transition cursor-pointer"
            >
              📜 تفسیر ابن کثیر
            </button>
            <button
              type="button"
              onClick={() => setInputMessage('وضو کے فرائض اور سنتیں باحوالہ تحریر فرمائیں')}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 whitespace-nowrap hover:bg-emerald-100 transition cursor-pointer"
            >
              🕌 وضو کے فرائض
            </button>
            <button
              type="button"
              onClick={() => setInputMessage('تمام دستیاب کتب کی فہرست پیش کریں')}
              className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 whitespace-nowrap hover:bg-emerald-100 transition cursor-pointer"
            >
              📚 تمام کتب
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={isListening ? "آپ کی آواز سنی جا رہی ہے، فرمائیے..." : "کتاب کا نام، فقہی مسئلہ، حدیث یا موضوع تحریر فرمائیں..."}
              style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
              className={`flex-1 px-4 py-2.5 text-xs sm:text-sm border rounded-xl placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-emerald-700 transition ${
                isListening ? 'bg-red-50/50 border-red-300 ring-1 ring-red-300' : 'border-stone-200'
              }`}
              disabled={isLoading}
            />

            {/* Voice Recognition Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isListening
                  ? 'bg-red-50 text-red-600 border-red-300 animate-pulse ring-2 ring-red-400'
                  : 'bg-stone-50 text-emerald-800 border-stone-200 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
              title={isListening ? 'بولنا بند کریں (سماعت جاری ہے)' : 'آواز سے بولیں (Urdu Voice Input)'}
              aria-label="آواز سے بولیں"
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed shadow transition cursor-pointer active:scale-95"
              title="ارسال فرمائیں"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};