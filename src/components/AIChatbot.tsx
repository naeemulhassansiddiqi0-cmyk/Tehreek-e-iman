import React, { useState, useRef, useEffect } from 'react';
import { 
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
  Bookmark,
  GraduationCap,
  Scale,
  Users
} from 'lucide-react';
import { 
  processChatMessage, 
  ChatResponsePayload, 
  ChatAcademicMode 
} from '../services/smartChatService';
import { PublicDomainBook, ModernBook } from '../data/publicDomainBooks';
import { speakText } from '../services/speechService';
import { copyToClipboardWithTehreekLogo } from '../utils/clipboardHelper';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  payload: ChatResponsePayload;
  timestamp: string;
  mode?: ChatAcademicMode;
}

export interface AIChatbotProps {
  onSelectBook?: (bookSlug: string, bookObj?: PublicDomainBook | ModernBook) => void;
  apiKey?: string;
  onSaveToNotes?: (content: string) => void;
  initialMode?: ChatAcademicMode;
}

const STORAGE_KEY = 'tehreek_ai_chat_history_v2';
const MODE_STORAGE_KEY = 'tehreek_ai_chat_mode_v2';

const MODE_CONFIG: Record<ChatAcademicMode, {
  label: string;
  shortLabel: string;
  icon: typeof BookOpen;
  description: string;
  welcome: string;
  starters: string[];
}> = {
  student: {
    label: 'طلبۂ درسِ نظامی',
    shortLabel: 'طلبہ موڈ',
    icon: GraduationCap,
    description: 'حلِ عبارت، صرفی صیغہ جات، نحوی تراکیب اور نصابِ درسِ نظامی کی کتب کے مراجع',
    welcome: 'السلام علیکم ورحمۃ اللہ! میں تحریکِ ایمان کا درسی اتالیق برائے طلبۂ درسِ نظامی ہوں۔ آپ مجھ سے کسی بھی درسی عبارت کا حل، صرفی صیغہ، نحوی ترکیب (فاعل، مفعول، مبتدا، خبر) یا ہدایہ، قدوری، کافیہ و اصول الشاشی کے مباحث دریافت فرما سکتے ہیں۔',
    starters: [
      '📖 ہدایہ شرح بدایۃ المبتدی',
      '⚖️ مختصر القدوری کتاب الطہارۃ',
      '🔍 کافیہ: فاعل اور مفعول کی تعریف',
      '📜 نور الانوار: عام اور خاص کا حکم',
      '📚 علم الصیغہ کے اہم ابواب'
    ]
  },
  ulama: {
    label: 'علماء و مفتیان',
    shortLabel: 'افتاء موڈ',
    icon: Scale,
    description: 'تقابلِ مذاہبِ اربعہ، نصوص، اصولِ فقہ اور کتبِ فتاویٰ (شامی، عالمگیری، بدائع) کے صریح مراجع',
    welcome: 'السلام علیکم ورحمۃ اللہ و برکاتہ! تحریکِ ایمان دار الافتاء و مجلسِ تحقیقِ علماء میں خوش آمدید۔ آپ فقہی و اصولی تحقیقات، تقابلِ مذاہبِ اربعہ (احناف، شوافع، مالکیہ، حنابلہ)، فتاویٰ شامی و عالمگیری کے صریح مراجع مع جلد و صفحہ نمبر دریافت فرما سکتے ہیں۔',
    starters: [
      '⚖️ تقابلِ مذاہبِ اربعہ: اوقاتِ نماز',
      '📜 فتاویٰ شامی: احکامِ بیوع و سود',
      '🕌 بدائع الصنائع: شرائطِ امامت',
      '📖 مسند احمد بن حنبل کی اسناد',
      '📑 المبسوط للسرخسی کے حوالے'
    ]
  },
  public: {
    label: 'عوام الناس',
    shortLabel: 'عوامی موڈ',
    icon: Users,
    description: 'روزمرہ کے شرعی مسائل، عبادات و اخلاقیات کا آسان فہم و سلیس حل بغیر پیچیدہ اصطلاحات کے',
    welcome: 'السلام علیکم ورحمۃ اللہ و برکاتہ! تحریکِ ایمان اسلامی رہنمائی سینٹر میں خوش آمدید۔ آپ نماز، روزہ، وضو، غسل، زکوٰۃ اور روزمرہ زندگی کے شرعی مسائل نہایت آسان، سلیس اور سادہ زبان میں معلوم فرما سکتے ہیں۔',
    starters: [
      '🕌 نماز کا آسان اور مسنون طریقہ',
      '💧 وضو کے چار بنیادی فرائض',
      '🌙 کن چیزوں سے روزہ ٹوٹتا ہے؟',
      '💰 زکوٰۃ کا نصاب اور حساب',
      '❤️ اخلاقِ نبوی ﷺ اور حقوق العباد'
    ]
  }
};

export const AIChatbot: React.FC<AIChatbotProps> = ({ 
  onSelectBook, 
  apiKey, 
  onSaveToNotes,
  initialMode = 'student'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [copiedCitationMsgId, setCopiedCitationMsgId] = useState<string | null>(null);
  const [savedMsgId, setSavedMsgId] = useState<string | null>(null);

  // Active academic mode
  const [activeMode, setActiveMode] = useState<ChatAcademicMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MODE_STORAGE_KEY) as ChatAcademicMode;
      if (saved && MODE_CONFIG[saved]) return saved;
    }
    return initialMode;
  });
  
  // Font Size state & Pinch Zoom for Mobile & Desktop (12px to 32px)
  const [fontSize, setFontSize] = useState(15);
  const initialDistanceRef = useRef<number>(0);
  const currentFontSizeRef = useRef<number>(15);

  const getDistance = (touches: React.TouchList) => {
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches);
      currentFontSizeRef.current = fontSize;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialDistanceRef.current > 0) {
      if (e.cancelable) e.preventDefault();
      const newDistance = getDistance(e.touches);
      const scale = newDistance / initialDistanceRef.current;
      let newSize = Math.round(currentFontSizeRef.current * scale);
      newSize = Math.max(12, Math.min(newSize, 32));
      setFontSize(newSize);
      e.currentTarget.style.fontSize = `${newSize}px`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      initialDistanceRef.current = 0;
      const computed = parseFloat(e.currentTarget.style.fontSize) || fontSize;
      currentFontSizeRef.current = computed;
    }
  };
  
  const recognitionRef = useRef<any>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from LocalStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'welcome_' + Date.now(),
        sender: 'bot',
        payload: {
          type: 'text',
          data: MODE_CONFIG[initialMode].welcome,
          mode: initialMode
        },
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        mode: initialMode
      }
    ];
  });

  // Save chat history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages]);

  // Mode switcher handler
  const handleModeChange = (newMode: ChatAcademicMode) => {
    setActiveMode(newMode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MODE_STORAGE_KEY, newMode);
      } catch {}
    }

    const modeNotice: ChatMessage = {
      id: 'mode_' + Date.now(),
      sender: 'bot',
      payload: {
        type: 'text',
        data: `«${MODE_CONFIG[newMode].label}» فعال کر دیا گیا۔\n${MODE_CONFIG[newMode].description}۔\nاب آپ اس موڈ کے مطابق کوئی بھی سوال دریافت فرما سکتے ہیں۔`,
        mode: newMode
      },
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
      mode: newMode
    };

    setMessages(prev => [...prev, modeNotice]);
  };

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
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
      mode: activeMode
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const resultPayload = await processChatMessage(query, apiKey, activeMode);
      const botMsg: ChatMessage = {
        id: 'b_' + Date.now(),
        sender: 'bot',
        payload: resultPayload,
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode
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
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode
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

  const handleCopySimple = async (msgId: string, text: string) => {
    const success = await copyToClipboardWithTehreekLogo(text, {
      title: 'تحریکِ ایمان علمی اتالیق جواب',
      includeTimestamp: true,
    });
    if (success) {
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  // Requirement 4: One-Click Academic Citation Copy Button
  const handleCopyAcademicCitation = async (msg: ChatMessage) => {
    const text = getTextContent(msg.payload);
    const citations = msg.payload.citations || [];
    const modeName = MODE_CONFIG[msg.mode || activeMode]?.label || 'علمی اتالیق';

    let citationBlock = '';
    if (citations.length > 0) {
      citationBlock = '\n\n📚 مستند درسی و فقہی مراجع (تحقیق شدہ نصوص):\n' +
        citations.map((c, i) => `${i + 1}. کتاب: ${c.bookTitle} (${c.bookTitleAr || ''})\n   مصنف: ${c.author} | زمرہ: ${c.category}\n   حوالہ لنک: https://tehreek-e-iman.pages.dev${c.readerLink}`).join('\n');
    }

    const fullCitationText = `═════════════════════════════════════════════
تحریکِ ایمان ڈیجیٹل دار الافتاء و علمی اتالیق
سرپرستی: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ
علمی موڈ: ${modeName}
═════════════════════════════════════════════

${text}
${citationBlock}

🌐 ماخذ: تحریکِ ایمان پورٹل • https://tehreek-e-iman.pages.dev
«وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»
═════════════════════════════════════════════`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fullCitationText);
        setCopiedCitationMsgId(msg.id);
        setTimeout(() => setCopiedCitationMsgId(null), 2500);
      } catch {
        handleCopySimple(msg.id, fullCitationText);
      }
    }
  };

  const handleSaveNote = (msgId: string, text: string) => {
    if (onSaveToNotes) {
      onSaveToNotes(text);
      setSavedMsgId(msgId);
      setTimeout(() => setSavedMsgId(null), 2000);
    }
  };

  // Direct Reader Link Navigation with instant SPA pushState
  const handleOpenCitationLink = (readerLink: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', readerLink);
      window.dispatchEvent(new PopStateEvent('popstate'));
      // Keep chatbot ready or minimize gently
    }
  };

  const handleBookAction = (book: PublicDomainBook | ModernBook) => {
    if (onSelectBook) {
      onSelectBook(book.slug, book);
    } else {
      const link = book.source_type === 'public' ? `/books/${book.slug}` : (book as ModernBook).external_link;
      if (book.source_type === 'public') {
        window.history.pushState({}, '', link);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        window.open(link, '_blank');
      }
    }
  };

  const handleResetChat = () => {
    if (stopSpeechRef.current) {
      stopSpeechRef.current();
      stopSpeechRef.current = null;
      setSpeakingMsgId(null);
    }
    const freshWelcome: ChatMessage = {
      id: 'welcome_' + Date.now(),
      sender: 'bot',
      payload: {
        type: 'text',
        data: MODE_CONFIG[activeMode].welcome,
        mode: activeMode
      },
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
      mode: activeMode
    };
    setMessages([freshWelcome]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  return (
    <>
      {/* Floating Trigger Button: Fixed Bottom-Right */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-5 right-5 z-40 p-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-amber-400 cursor-pointer flex items-center gap-2 group"
        aria-label="علمی اتالیق و دار الافتاء چیٹ بوٹ"
        title="علمی اتالیق و دار الافتاء (AI Ustadh)"
      >
        <div className="relative">
          <img
            src="/tehreek-iman-logo.jpg"
            alt="تحریکِ ایمان"
            className="w-8 h-8 rounded-full object-cover border border-amber-300"
          />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        </div>
        <span className="font-bold text-xs sm:text-sm font-nastaliq text-amber-200 group-hover:text-white transition-colors pr-1">
          علمی اتالیق
        </span>
      </button>

      {/* Main Chatbot Window */}
      {isOpen && (
        <div
          dir="rtl"
          className="fixed inset-x-2 bottom-16 sm:inset-x-auto sm:bottom-20 sm:right-5 z-50 w-auto sm:w-[460px] max-h-[85vh] sm:max-h-[680px] h-[620px] flex flex-col bg-white rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden animate-fadeIn"
          style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Urdu Nastaleeq', 'Nafees', serif" }}
        >
          {/* 1. Header with Official Branding & Founder's Name */}
          <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white px-4 py-3 flex items-center justify-between shadow-md border-b border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <img
                  src="/tehreek-iman-logo.jpg"
                  alt="تحریکِ ایمان لوگو"
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-md"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-emerald-950 rounded-full"></span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-sm sm:text-base text-white leading-tight font-nastaliq">
                    علمی اتالیق و دار الافتاء
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
                    147 کتب
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-200 font-nastaliq truncate max-w-[210px] sm:max-w-xs">
                  بانی و سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی دامت برکاتہم العالیہ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition cursor-pointer"
                title="نئی گفتگو شروع کریں"
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
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition cursor-pointer"
                title="بند کریں"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Multi-Mode Academic Selector (طلبۂ درسِ نظامی | علماء و مفتیان | عوام الناس) */}
          <div className="bg-emerald-900/95 border-b border-emerald-800 px-3 py-2 flex items-center justify-between gap-1 text-xs font-nastaliq">
            <span className="text-[11px] text-amber-300 font-bold hidden sm:inline shrink-0">
              علمی موڈ:
            </span>
            <div className="grid grid-cols-3 gap-1 w-full sm:w-auto">
              {(['student', 'ulama', 'public'] as ChatAcademicMode[]).map(m => {
                const conf = MODE_CONFIG[m];
                const IconComponent = conf.icon;
                const isActive = activeMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleModeChange(m)}
                    className={`px-2 py-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-emerald-950 font-black shadow-xs ring-1 ring-amber-300'
                        : 'text-stone-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-800/60'
                    }`}
                    title={conf.description}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-950' : 'text-amber-300'}`} />
                    <span className="truncate">{conf.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Messages Area */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar px-3 sm:px-4 py-4 space-y-4 bg-stone-50/70 min-h-0"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {messages.map(msg => {
              const textContent = getTextContent(msg.payload);
              const isSpeaking = speakingMsgId === msg.id;
              const isCopied = copiedMsgId === msg.id;
              const isCitationCopied = copiedCitationMsgId === msg.id;
              const isSaved = savedMsgId === msg.id;
              const citations = msg.payload.citations || [];

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
                            border: '1px solid #C8E6C9',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          }
                        : {
                            backgroundColor: '#FFFFFF',
                            color: '#111111',
                            border: '1px solid #E5E7EB',
                            borderRadius: '18px 18px 18px 0',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                          }
                    }
                    className={`max-w-[94%] sm:max-w-[90%] transition-all ${msg.sender === 'user' ? '' : 'p-3.5'}`}
                  >
                    {msg.sender === 'user' ? (
                      <div>
                        <div
                          className="urdu-text whitespace-pre-line leading-relaxed"
                          style={{ color: '#000000', fontWeight: 600, fontSize: '15px' }}
                        >
                          {typeof msg.payload.data === 'string' ? msg.payload.data : ''}
                        </div>
                        <div className="text-[10px] mt-1 text-left font-sans text-stone-500">
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
                              <div className="space-y-1 min-w-0">
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
                                  onClick={() => setFontSize(prev => Math.min(prev + 2, 32))}
                                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer transition active:scale-95"
                                  title="فونٹ بڑا کریں (A+)"
                                >
                                  A+
                                </button>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-nastaliq">
                                {MODE_CONFIG[msg.mode || activeMode]?.label}
                              </span>
                            </div>

                            {/* Scholarly Urdu Text with Mobile Pinch Zoom */}
                            <div 
                              onTouchStart={handleTouchStart}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                              className="select-text break-words whitespace-pre-line overflow-visible space-y-2 urdu-text leading-relaxed selection:bg-emerald-100 transition-[font-size] duration-100"
                              style={{ 
                                color: '#111111',
                                fontSize: `${fontSize}px`,
                                lineHeight: '1.9',
                                touchAction: 'pan-y pinch-zoom',
                                userSelect: 'text'
                              }}
                            >
                              {msg.payload.data}
                            </div>

                            {/* Requirement 3: Exact Citations with Clickable Direct Links to 147 Books */}
                            {citations.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-emerald-100/80 bg-emerald-50/50 rounded-xl p-3 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-emerald-950 font-nastaliq">
                                  <span className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>مستند درسی و فقہی مراجع (تحقیق شدہ نصوص):</span>
                                  </span>
                                  <span className="text-[10px] text-emerald-800 font-mono">
                                    {citations.length} حوالہ جات
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  {citations.map((c, cidx) => (
                                    <div
                                      key={`cite_${cidx}`}
                                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-emerald-100 hover:border-emerald-300 transition shadow-2xs"
                                    >
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-stone-900 font-nastaliq truncate">
                                          {c.bookTitle} {c.bookTitleAr ? `(${c.bookTitleAr})` : ''}
                                        </p>
                                        <p className="text-[10px] text-stone-500 font-nastaliq">
                                          {c.author} • {c.badgeText}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenCitationLink(c.readerLink)}
                                        className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold font-nastaliq transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                                        title={`کتاب میں صفحہ ${c.page} پر جائیں`}
                                      >
                                        <span>کتاب میں کھولیں</span>
                                        <ExternalLink className="w-3 h-3 text-amber-300" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Mobile pinch zoom hint */}
                            <div className="md:hidden text-[10px] text-gray-400 mt-1 text-center">
                              دو انگلیوں سے زوم کریں 🤏
                            </div>
                          </div>
                        )}

                        {/* Bot Action Bar: One-Click Citation Copy, Audio, Save to Notes */}
                        {textContent && (
                          <div className="mt-3 pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Requirement 4: One-Click Copy Citation Button */}
                              <button
                                type="button"
                                onClick={() => handleCopyAcademicCitation(msg)}
                                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer text-[11px] font-bold font-nastaliq ${
                                  isCitationCopied
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                                }`}
                                title="مکمل جواب اور تصدیق شدہ کتابی حوالے کاپی فرمائیں"
                              >
                                {isCitationCopied ? <Check className="w-3.5 h-3.5 text-amber-700" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
                                <span>{isCitationCopied ? 'حوالہ جات کاپی ہو گئے!' : 'حوالے کے ساتھ کاپی کریں'}</span>
                              </button>

                              {/* Simple Text Copy Button */}
                              <button
                                type="button"
                                onClick={() => handleCopySimple(msg.id, textContent)}
                                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer text-[11px] ${
                                  isCopied
                                    ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                }`}
                                title="صرف متن کاپی کریں"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-stone-600" />}
                                <span>{isCopied ? 'کاپی شدہ!' : 'صرف متن'}</span>
                              </button>

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
                    147 کتب و کتبِ فقہ و حدیث سے مراجع کی تحقیق جاری ہے...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 4. Quick Starters Bar Tailored to Active Academic Mode */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {MODE_CONFIG[activeMode].starters.map((starter, sidx) => (
              <button
                key={`starter_${sidx}`}
                type="button"
                onClick={() => setInputMessage(starter.replace(/^[^\s]+\s+/, ''))}
                className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 whitespace-nowrap hover:bg-emerald-100 transition cursor-pointer font-nastaliq"
              >
                {starter}
              </button>
            ))}
          </div>

          {/* 5. Input Bar with Voice Input (Web Speech API) */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={
                isListening
                  ? "آپ کی آواز سنی جا رہی ہے، فرمائیے..."
                  : activeMode === 'student'
                  ? "درسی عبارت، صرفی صیغہ، نحوی ترکیب یا کتاب کا نام..."
                  : activeMode === 'ulama'
                  ? "فقہی مسئلہ، تقابلِ مذاہب، یا کتاب و فتویٰ کا حوالہ..."
                  : "نماز، روزہ یا روزمرہ زندگی کا شرعی سوال تحریر فرمائیں..."
              }
              style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
              className={`flex-1 px-4 py-2.5 text-xs sm:text-sm border rounded-xl placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-emerald-700 transition font-nastaliq ${
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

export default AIChatbot;
