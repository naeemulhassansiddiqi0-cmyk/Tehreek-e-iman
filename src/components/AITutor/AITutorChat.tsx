import React, { useState, useEffect, useRef } from 'react';
import { AIMode, StudentLevel } from '../../types';
import { askIslamicAI, ChatMessage } from '../../services/aiService';
import { speakText } from '../../services/speechService';
import { booksDatabase } from '../../data/booksData';
import { TehreekImanLogo } from '../TehreekImanLogo';
import { copyToClipboardWithTehreekLogo } from '../../utils/clipboardHelper';
import { QRCodeBadge } from '../QRCodeBadge';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  CheckCheck, 
  Copy, 
  Bookmark, 
  RotateCcw,
  Zap,
  HelpCircle,
  Scale,
  ArrowLeft,
  ShieldCheck,
  Printer,
  Scroll,
  SearchCheck,
  FileCheck,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  Award,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AITutorChatProps {
  initialPrompt?: string;
  initialBookContext?: string;
  apiKey: string;
  onSaveToNotes: (content: string) => void;
  theme: string;
  onBackToDashboard?: () => void;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({
  initialPrompt = '',
  initialBookContext = 'مختصر القدوري',
  apiKey,
  onSaveToNotes,
  theme: _theme,
  onBackToDashboard,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedMode, setSelectedMode] = useState<AIMode>('darulifta_fatwa');
  const [selectedLevel, setSelectedLevel] = useState<StudentLevel>('intermediate');
  const [bookContext, setBookContext] = useState(initialBookContext);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);

  // Gemini API Key State
  const [localApiKey, setLocalApiKey] = useState<string>(() => {
    return apiKey || (typeof window !== 'undefined' ? localStorage.getItem('madrasa_gemini_api_key') || '' : '');
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  // Multi-Turn Conversational Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome_init',
      role: 'assistant',
      content: 'وَعَلَيْكُمُ السَّلَامُ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ! 🌹\n\nمرحبًا بكم في منصة تحريكِ إيمان۔ میں آپ کا مستند علمی اتالیق ہوں۔\n\nآپ مجھ سے **اردو، رومن اردو (Roman Urdu)، عربی، یا انگریزی** میں کوئی بھی شرعی، فقہی، یا درسی استفسار پوچھ سکتے ہیں، یا مائیکروفون پر کلک کر کے **بول کر گفتگو** فرما سکتے ہیں۔ تمام جوابات قرآنِ مجید اور سنتِ رسول ﷺ کے صریح دلائل اور کتبِ فقہ کے حوالوں سے مدلل ہوں گے۔\n\nنیچے دیے گئے منتخب سوالات پر کلک کر کے بھی فوری رہنمائی حاصل کی جا سکتی ہے۔',
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
      references: ["تحریکِ ایمان علمی معاون"]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<'ur-PK' | 'en-US' | 'ar-SA'>('ur-PK');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        if (fullTranscript.trim()) {
          setPrompt(fullTranscript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.warn('Voice recognition notice:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceNotice('مائیکروفون کی اجازت عنایت فرمائیں۔');
          setTimeout(() => setVoiceNotice(null), 4000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [voiceLang]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setVoiceNotice('آپ کے براؤزر میں مائیکروفون کی سہولت میسر نہیں۔');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setVoiceNotice(null);
        recognitionRef.current.lang = voiceLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        // ignore
      }
    }
  };

  // Text to Speech Voice Output using speechService
  const handleToggleSpeech = (msgId: string, textToRead: string) => {
    if (speakingMsgId === msgId) {
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        stopSpeakingRef.current = null;
      }
      setSpeakingMsgId(null);
      return;
    }

    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
    }

    const cancelFn = speakText(
      textToRead,
      () => setSpeakingMsgId(msgId),
      () => {
        setSpeakingMsgId(null);
        stopSpeakingRef.current = null;
      },
      () => {
        setSpeakingMsgId(null);
        stopSpeakingRef.current = null;
      }
    );
    stopSpeakingRef.current = cancelFn;
  };

  useEffect(() => {
    return () => {
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        stopSpeakingRef.current = null;
      }
    };
  }, []);

  // Handle initial prompt from parent
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (initialBookContext) {
      setBookContext(initialBookContext);
    }
  }, [initialBookContext]);

  const handleSendMessage = async (customText?: string, customMode?: AIMode, customBook?: string) => {
    const textToSend = customText || prompt;
    const modeToSend = customMode || selectedMode;
    const bookToSend = customBook || bookContext;

    if (!textToSend.trim() || isLoading) return;

    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
      setSpeakingMsgId(null);
    }

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await askIslamicAI(
        textToSend.trim(),
        modeToSend,
        selectedLevel,
        localApiKey || apiKey,
        bookToSend,
        messages
      );

      const assistantMessage: ChatMessage = {
        id: 'asst_' + Date.now(),
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        references: res.references,
        iraabBreakdown: res.iraabBreakdown,
        tipsForExam: res.tipsForExam,
        suggestedAction: res.suggestedAction,
        isLiveGemini: res.isLiveGemini
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: 'معذرت، سوال کے تجزیہ میں عارضی تاخیر ہوئی۔ براہ کرم دوبارہ کوشش فرمائیں۔',
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = async (id: string, text: string) => {
    await copyToClipboardWithTehreekLogo(text, {
      title: 'تحریکِ ایمان ڈیجیٹل دار الافتاء — شرعی فتویٰ و تصدیق شدہ جواب',
      sourceBook: bookContext,
      includeTimestamp: true,
    });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveMessage = (id: string, text: string) => {
    onSaveToNotes(`[علمی اتالیق چیٹ نوٹ (${getModeTitle(selectedMode)})]:\n\n${text}`);
    setSavedNoteId(id);
    setTimeout(() => setSavedNoteId(null), 2000);
  };

  const resetChat = () => {
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
    }
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: 'نئی گفتگو کا آغاز ہوا ہے۔ آپ مجھ سے قرآن، سنت، فقہ، نحو یا تحریکِ ایمان پورٹل کے بارے میں کوئی بھی سوال اردو یا رومن اردو میں پوچھ سکتے ہیں۔ فرمائیے کیا استفسار ہے؟',
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const getModeTitle = (m: AIMode) => {
    switch (m) {
      case 'dalayel_quran_sunnah': return 'قرآن و سنت سے مدلل جواب';
      case 'madhahib_comparative': return 'تقابلِ ائمہ و مذاہبِ اربعہ';
      case 'takhrij_hadith': return 'تخریجِ حدیث و اسناد';
      case 'hal_ibarat': return 'حلِ عبارت، اعراب و نحو';
      case 'tashreeh': return 'سلیس درسی تشریح';
      case 'exam_prep': return 'امتحانی سوال و جواب';
      case 'objections': return 'اعتراضات و جوابات';
    }
  };

  const presetExamples = [
    {
      title: "✨ ایمان کی حقیقت و ارکان (حدیثِ جبریل)",
      text: "ایمان کی حقیقت کیا ہے، اس کے ارکان اور دلائل قرآن و سنت کی روشنی میں بیان فرمائیں",
      book: "العقیدۃ الطحاویۃ",
      mode: 'dalayel_quran_sunnah' as AIMode
    },
    {
      title: "اللہ تعالیٰ کے ۹۹ نام مع معانی (Asma ul Husna)",
      text: "اللہ کے 99 نام بتائیں اور ان کے اردو معانی و حدیث شریف کا حوالہ عنایت فرمائیں",
      book: "صحیح البخاری",
      mode: 'dalayel_quran_sunnah' as AIMode
    },
    {
      title: "شرعی فتویٰ: سجدۂ سہو کا حکم و طریقہ",
      text: "نماز میں سجدۂ سہو کب واجب ہوتا ہے؟ اور اگر کوئی بھولے سے چھوڑ دے تو کیا نماز ہو جائے گی؟",
      book: "رد المحتار (فتاویٰ شامی)",
      mode: 'darulifta_fatwa' as AIMode
    },
    {
      title: "شرعی فتویٰ: زکوٰۃ کا نصاب اور حساب",
      text: "سونے اور چاندی کے نصاب کی تفصیل اور موجودہ نقد رقم پر زکوٰۃ کا شرعی طریقہ کیا ہے؟",
      book: "الفتاویٰ الہندیہ (عالمگیری)",
      mode: 'darulifta_fatwa' as AIMode
    },
    {
      title: "شرعی فتویٰ: آن لائن ٹریڈنگ و سود",
      text: "روایتی بینکوں اور آن لائن کرپٹو/فاریکس ٹریڈنگ کے نفع کے بارے میں قرآن و سنت کا کیا حکم ہے؟",
      book: "الہدایۃ للمرغینانی",
      mode: 'darulifta_fatwa' as AIMode
    },
    {
      title: "شرعی فتویٰ: نکاح کے ارکان و شرائط",
      text: "نکاح کے لیے کن چیزوں کا ہونا ضروری ہے اور کم از کم مہر کی مقدار شرعاً کتنی ہے؟",
      book: "مختصر القدوری",
      mode: 'darulifta_fatwa' as AIMode
    },
    {
      title: "تقابلِ ائمہ: امام کے پیچھے قراءت",
      text: "کیا مقتدی کے لیے امام کے پیچھے سورۂ فاتحہ پڑھنا جائز ہے؟ احناف اور شوافع کا تقابلی جائزہ پیش کریں۔",
      book: "الہدایۃ للمرغینانی",
      mode: 'madhahib_comparative' as AIMode
    },
    {
      title: "تخریجِ حدیث: فضائل میں ضعیف حدیث",
      text: "کیا فضائلِ اعمال میں ضعیف حدیث پر عمل کیا جا سکتا ہے؟ محدثین کی کیا شرائط ہیں؟",
      book: "مشکوٰۃ المصابیح",
      mode: 'takhrij_hadith' as AIMode
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner - 2026 3D Royal Islamic Sanctuary */}
      <div className="hero-3d-royal rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-3 border-amber-400/70 space-y-4">
        <div className="flex items-center justify-between">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="btn-3d-gold inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-stone-950 font-nastaliq font-bold text-xs shadow-md cursor-pointer transition-all"
              title="صفحۂ اول پر واپس جائیں"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-stone-950" />
              <span>‹ واپس صفحۂ اول (ڈیش بورڈ)</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempApiKey(localApiKey);
                setIsKeyModalOpen(!isKeyModalOpen);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-bold border transition-all cursor-pointer shadow-sm ${
                localApiKey
                  ? 'bg-emerald-900 text-emerald-300 border-emerald-400'
                  : 'bg-amber-950/90 text-amber-300 border-amber-400/80 hover:bg-amber-900'
              }`}
              title="Gemini API Key سیٹنگز"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{localApiKey ? 'دار الافتاء جیمنی سے لائیو منسلک' : '🔑 جیمنی API کی (دار الافتاء لائیو)'}</span>
            </button>

            <button
              onClick={resetChat}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-nastaliq font-bold bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-amber-400/50 transition-all cursor-pointer shadow-sm"
              title="گفتگو کو شروع سے صاف کریں"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>نیا استفتاء / سوال</span>
            </button>
          </div>
        </div>

        {/* Inline Gemini Key Configuration */}
        {isKeyModalOpen && (
          <div className="p-4 rounded-2xl bg-stone-950/90 border-2 border-amber-400/70 space-y-2 text-xs font-nastaliq text-amber-100 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>گوگل جیمنائی (Gemini 1.5 Flash AI) دار الافتاء کنکشن سیٹنگز:</span>
              </span>
              <button onClick={() => setIsKeyModalOpen(false)} className="text-stone-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              اگر آپ کے پاس گوگل جیمنائی کی مفت API Key ہے تو یہاں درج فرما کر محفوظ کریں۔ یہ کی فعال کرنے سے اے آئی اسسٹنٹ ایک مکمل "ڈیجیٹل دار الافتاء" کی شکل اختیار کر لیتا ہے جو دنیا بھر کے کسی بھی استفسار کا چند لمحوں میں براہِ راست قرآن، صحاحِ ستہ اور فقہِ حنفی کی اصل عبارات کی روشنی میں مدلل فتویٰ پیش کرے گا۔ مفت کی حاصل کرنے کے لیے aistudio.google.com پر وزٹ فرمائیں۔ (کی نہ ہونے کی صورت میں بھی ہمارا ۱۲ شعبوں پر مشتمل آف لائن فقہی انجن فعال ہے)۔
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy... (Gemini API Key)"
                className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-emerald-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400 shadow-inner"
              />
              <button
                onClick={() => {
                  const trimmed = tempApiKey.trim();
                  setLocalApiKey(trimmed);
                  localStorage.setItem('madrasa_gemini_api_key', trimmed);
                  setIsKeyModalOpen(false);
                }}
                className="btn-3d-gold px-4 py-2 rounded-xl text-stone-950 font-black text-xs cursor-pointer shrink-0"
              >
                محفوظ کریں
              </button>
              {localApiKey && (
                <button
                  onClick={() => {
                    setLocalApiKey('');
                    setTempApiKey('');
                    localStorage.removeItem('madrasa_gemini_api_key');
                    setIsKeyModalOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-900/80 hover:bg-red-800 text-red-200 text-xs cursor-pointer shrink-0"
                >
                  کی ہٹائیں
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-amber-400 text-stone-950 shadow-md">
                <Sparkles className="w-6 h-6 text-stone-950" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-nastaliq text-amber-200">
                مرکزِ افتاء و رفیقِ مفتی — تحریکِ ایمان (Digital Dar-ul-Ifta)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 font-nastaliq max-w-3xl leading-[2.4] text-justify">
              قرآنِ حکیم، سنتِ رسول ﷺ اور فقہِ حنفی کی امہات الکتب کی روشنی میں تمام دینی، فقہی و جدید مسائل کا مدلل حل۔ آواز 🎙️ یا تحریر ✍️ کے ذریعے سوال درج فرمائیں۔
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-400/40 text-xs shrink-0 shadow-inner">
            <span className={`w-2.5 h-2.5 rounded-full ${localApiKey || apiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className="text-amber-200 font-nastaliq font-bold">
              {localApiKey || apiKey ? 'دار الافتاء جیمنی سے لائیو منسلک' : 'آف لائن فقہی و علمی ذخیرہ فعال'}
            </span>
          </div>
        </div>

        {/* Anti-Fabrication & Strict Grounding Badge */}
        <div className="card-jewel-dark p-3.5 sm:p-4 rounded-2xl border-2 border-amber-400/60 shadow-md flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div className="space-y-0.5 text-right">
            <h3 className="text-xs sm:text-sm font-black font-nastaliq text-amber-300 flex items-center gap-1.5">
              <span>ضمانتِ استناد، عدمِ تحریف و مسلکِ احناف (Strictly Grounded Fatwas)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700">شریعت کا پابند</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-emerald-100/90 font-nastaliq leading-relaxed">
              تمام جوابات قرآن و سنت، صحاحِ ستہ اور فقہِ حنفی کی امہات الکتب (الہدایہ، فتاویٰ شامی، عالمگیری، قدوری) کی اصل عبارات سے مدلل ہوں گے۔
            </p>
          </div>
        </div>
      </div>

      {/* 6 Specialized Scholarly & Fatwa Mode Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => setSelectedMode('darulifta_fatwa')}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer border-2 ${
            selectedMode === 'darulifta_fatwa'
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-xl font-black ring-2 ring-amber-400/40 -translate-y-0.5'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <Award className={`w-5 h-5 ${selectedMode === 'darulifta_fatwa' ? 'text-stone-950' : 'text-amber-400'}`} />
          <span className="text-center leading-tight">دار الافتاء و شرعی فتویٰ</span>
        </button>

        <button
          onClick={() => setSelectedMode('dalayel_quran_sunnah')}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer border-2 ${
            selectedMode === 'dalayel_quran_sunnah'
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-xl font-black ring-2 ring-amber-400/40 -translate-y-0.5'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${selectedMode === 'dalayel_quran_sunnah' ? 'text-stone-950' : 'text-amber-400'}`} />
          <span className="text-center leading-tight">قرآن و سنت سے دلائل</span>
        </button>

        <button
          onClick={() => setSelectedMode('madhahib_comparative')}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer border-2 ${
            selectedMode === 'madhahib_comparative'
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-xl font-black ring-2 ring-amber-400/40 -translate-y-0.5'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <Scale className={`w-5 h-5 ${selectedMode === 'madhahib_comparative' ? 'text-stone-950' : 'text-amber-400'}`} />
          <span className="text-center leading-tight">تقابلِ ائمہ و مذاہب</span>
        </button>

        <button
          onClick={() => setSelectedMode('takhrij_hadith')}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer border-2 ${
            selectedMode === 'takhrij_hadith'
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-xl font-black ring-2 ring-amber-400/40 -translate-y-0.5'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <SearchCheck className={`w-5 h-5 ${selectedMode === 'takhrij_hadith' ? 'text-stone-950' : 'text-amber-400'}`} />
          <span className="text-center leading-tight">تخریجِ حدیث و اسناد</span>
        </button>

        <button
          onClick={() => setSelectedMode('hal_ibarat')}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer border-2 ${
            selectedMode === 'hal_ibarat'
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-xl font-black ring-2 ring-amber-400/40 -translate-y-0.5'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <Zap className={`w-5 h-5 ${selectedMode === 'hal_ibarat' ? 'text-stone-950' : 'text-amber-400'}`} />
          <span className="text-center leading-tight">حلِ عبارت و اعراب</span>
        </button>

        <button
          onClick={() => setSelectedMode('exam_prep')}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs sm:text-sm font-nastaliq font-bold transition-all cursor-pointer border-2 ${
            selectedMode === 'exam_prep'
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-xl font-black ring-2 ring-amber-400/40 -translate-y-0.5'
              : 'card-jewel-dark text-stone-200 hover:text-amber-200 border-emerald-800/60 hover:border-amber-400'
          }`}
        >
          <HelpCircle className={`w-5 h-5 ${selectedMode === 'exam_prep' ? 'text-stone-950' : 'text-amber-400'}`} />
          <span className="text-center leading-tight">امتحانی سوال و جواب</span>
        </button>
      </div>

      {/* Preset Quick Chips */}
      <div className="rounded-2xl board-jewel-emerald p-3.5 border border-emerald-700/60 space-y-2">
        <span className="text-xs font-bold text-amber-300 font-nastaliq block">
          منتخب علمی سوالات (ایک کلک پر گفتگو میں شامل کریں):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {presetExamples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => {
                setBookContext(ex.book);
                setSelectedMode(ex.mode);
                handleSendMessage(ex.text, ex.mode, ex.book);
              }}
              className="text-xs p-2.5 rounded-xl card-jewel-dark text-amber-200 hover:border-amber-400 font-nastaliq font-bold transition-all cursor-pointer flex items-center justify-between gap-2 shadow-xs text-right border border-emerald-800/70 hover:-translate-y-0.5"
            >
              <span className="truncate">⚡ {ex.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-amber-300 border border-emerald-700 shrink-0">
                {ex.book.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversational Chat Messages Area */}
      <div className="rounded-3xl board-jewel-emerald border-2 border-emerald-700/70 p-4 sm:p-6 space-y-5 shadow-2xl min-h-[400px]">
        
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeakingThis = speakingMsgId === msg.id;

          return (
            <div 
              key={msg.id}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
            >
              
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isUser 
                  ? 'bg-amber-400 text-stone-950 font-bold border-2 border-amber-300' 
                  : 'bg-emerald-900 text-amber-300 border-2 border-amber-400/70'
              }`}>
                {isUser ? <User className="w-5 h-5" /> : <TehreekImanLogo size={38} className="rounded-xl shadow-md" />}
              </div>

              {/* Bubble Body */}
              <div className={`max-w-[90%] sm:max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                
                <div className={`p-4 sm:p-6 rounded-3xl shadow-xl transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-black rounded-tr-none border-2 border-amber-300'
                    : 'card-jewel-dark text-amber-50 rounded-tl-none border-2 border-emerald-700/70'
                }`}>
                  
                  {/* Actions Header for Assistant Message with Tehreek-e-Iman Logo */}
                  {!isUser && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b-2 border-amber-400/40 bg-gradient-to-r from-emerald-950/80 via-stone-900/90 to-emerald-950/80 p-2.5 rounded-2xl shadow-md">
                      <div className="flex items-center gap-2.5">
                        <TehreekImanLogo size={44} className="shadow-lg ring-2 ring-amber-400/60 shrink-0" />
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-amber-300 font-nastaliq tracking-wide">
                              تحریکِ ایمان • دار الافتاء و مجلسِ تحقیق
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-nastaliq font-black shadow-xs">
                              باضابطہ فتویٰ
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-200/90 font-nastaliq">
                            سرپرستی: حضرت مولانا محمد نعیم الحسن صدیقی مدظلہ العالی
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Audio Read Aloud (TTS) */}
                        <button
                          onClick={() => handleToggleSpeech(msg.id, msg.content)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-nastaliq font-bold transition-all cursor-pointer ${
                            isSpeakingThis
                              ? 'bg-amber-400 text-stone-950 font-black animate-pulse shadow-md'
                              : 'bg-emerald-900 text-amber-200 hover:bg-emerald-800 border border-emerald-700'
                          }`}
                          title="جواب با آواز سنیں"
                        >
                          {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeakingThis ? 'روکیں' : 'سنیں 🔊'}</span>
                        </button>

                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 text-xs border border-emerald-700 cursor-pointer"
                          title="کاپی کریں"
                        >
                          {copiedId === msg.id ? <CheckCheck className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => saveMessage(msg.id, msg.content)}
                          className="p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 text-xs border border-emerald-700 cursor-pointer"
                          title="نوٹس میں محفوظ کریں"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${savedNoteId === msg.id ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 text-xs border border-emerald-700 cursor-pointer"
                          title="پرنٹ کریں"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`font-nastaliq whitespace-pre-line text-justify leading-[2.6] text-sm sm:text-base ${
                    isUser ? 'text-stone-950 font-black' : 'text-emerald-50 font-semibold'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Iraab table if present */}
                  {msg.iraabBreakdown && msg.iraabBreakdown.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-emerald-800/60 space-y-2">
                      <h4 className="text-xs font-bold text-amber-300 font-nastaliq flex items-center gap-1.5">
                        <Scroll className="w-4 h-4 text-amber-400" />
                        <span>تفصیلی جدولِ اعراب:</span>
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right border border-emerald-800 rounded-xl overflow-hidden shadow-inner">
                          <thead className="bg-emerald-950 text-amber-200 font-nastaliq font-bold">
                            <tr>
                              <th className="p-2">الکلمۃ</th>
                              <th className="p-2">الموقع الإعرابي</th>
                              <th className="p-2">العلامۃ</th>
                              <th className="p-2">التعلیل</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-900 font-arabic text-amber-100">
                            {msg.iraabBreakdown.map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td className="p-2 font-bold text-amber-300 font-amiri">{row.word}</td>
                                <td className="p-2 font-nastaliq">{row.role}</td>
                                <td className="p-2 font-nastaliq">{row.sign}</td>
                                <td className="p-2 font-nastaliq text-emerald-200/90">{row.explanation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* References if present */}
                  {msg.references && msg.references.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-emerald-800/60 flex flex-wrap items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-bold text-amber-300 font-nastaliq">مستند مآخذ:</span>
                      {msg.references.map((ref, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-0.5 rounded-lg bg-emerald-950 text-amber-200 border border-amber-400/40 text-xs font-nastaliq font-bold shadow-xs"
                        >
                          📖 {ref}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Official Dar-ul-Ifta Stamp & Verification Seal */}
                  {!isUser && msg.id !== 'welcome_init' && (
                    <div className="mt-4 pt-3.5 border-t-2 border-emerald-700/60 space-y-3">
                      {/* Top Bar: Official Stamp & Allahu A'lam */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Official Stamp Badge with Tehreek-e-Iman Logo */}
                        <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border-2 border-amber-400 text-amber-300 shadow-lg">
                          <TehreekImanLogo size={42} className="shadow-md shrink-0 ring-1 ring-amber-400/60" />
                          <div className="text-right">
                            <div className="text-xs font-nastaliq font-black tracking-wide text-amber-300">
                              تحریکِ ایمان ڈیجیٹل دار الافتاء • باضابطہ تصدیق کی مہر
                            </div>
                            <div className="text-[10px] text-emerald-300 font-nastaliq">
                              تحتِ سرپرستی: حضرت مولانا محمد نعیم الحسن صدیقی | جامع نظامیہ
                            </div>
                          </div>
                          {msg.isLiveGemini ? (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-900 text-emerald-300 border border-emerald-500/60 text-[10px] font-sans font-bold mr-1">
                              ⚡ لائیو AI
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-stone-900 text-amber-200/90 border border-emerald-800 text-[10px] font-sans font-bold mr-1">
                              📖 دائرۃ المعارف
                            </span>
                          )}
                        </div>

                        {/* Allahu Subhanahu Wa Ta'ala A'lam bi-as-Sawab */}
                        <div className="flex items-center gap-3">
                          <div className="px-3.5 py-1.5 rounded-xl bg-black/50 border border-amber-400/60 text-amber-200 font-amiri font-bold text-sm sm:text-base tracking-wider shadow-inner">
                            «وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»
                          </div>
                          <QRCodeBadge
                            value={`https://tehreek-iman.org/?verify_fatwa=${encodeURIComponent(msg.id || 'fatwa')}&date=${encodeURIComponent(msg.timestamp)}`}
                            size={72}
                            label="تصدیق شدہ فتویٰ"
                            subLabel="دار الافتاء تحریکِ ایمان"
                            className="shrink-0 hidden sm:inline-flex"
                          />
                        </div>
                      </div>

                      {/* Required Scholarly Verification Final Advisory Line */}
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200/95 shadow-inner">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs font-nastaliq leading-[2.2] text-justify font-medium">
                          یہ اے آئی مسئلے کی وضاحت میں معاون ہے، اس کی تصدیق کے لیے اپنے علاقے کے معتبر عالم دین اور مفتیان کرام سے رجوع فرمائیں۔
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                <span className={`text-[10px] text-emerald-300/70 font-mono block px-2 ${isUser ? 'text-left' : 'text-right'}`}>
                  {msg.timestamp}
                </span>

              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3.5 animate-fadeIn">
            <div className="w-10 h-10 rounded-2xl bg-emerald-900 text-amber-300 border-2 border-amber-400/70 flex items-center justify-center shrink-0 shadow-lg">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-4 rounded-3xl card-jewel-dark border-2 border-emerald-700/60 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              <span className="text-xs font-nastaliq text-amber-200 font-bold mr-2">
                تحقیق و مدلل جواب تیار کیا جا رہا ہے...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating / Bottom Input Composer */}
      <div className="rounded-3xl board-jewel-emerald border-2 border-emerald-700/70 p-4 sm:p-5 space-y-3 shadow-xl text-amber-50">
        
        {/* Context & Level Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-emerald-800/60 text-xs font-nastaliq">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <label className="text-amber-200 font-bold">مخصوص کتاب کا سیاق:</label>
            <select
              value={bookContext}
              onChange={(e) => setBookContext(e.target.value)}
              className="px-2.5 py-1 rounded-xl input-jewel text-xs font-arabic text-amber-200 focus:outline-none max-w-[220px] truncate"
            >
              <option value="عمومی قرآن و سنت و فقہ اسلامی">عمومی قرآن و سنت و فقہ اسلامی</option>
              {booksDatabase.map(b => (
                <option key={b.id} value={b.title}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-amber-200 font-bold">علمی سطح:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as StudentLevel)}
              className="px-2.5 py-1 rounded-xl input-jewel text-xs text-amber-200 font-nastaliq font-bold focus:outline-none"
            >
              <option value="beginner">مبتدی (سلیس)</option>
              <option value="intermediate">متوسط (درسی)</option>
              <option value="advanced">فاضل / عالم (تفصیلی)</option>
            </select>
          </div>
        </div>

        {/* Voice Recording Notification */}
        {isListening && (
          <div className="p-3 bg-gradient-to-r from-red-950 via-emerald-950 to-red-950 border-2 border-red-500/80 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
              <div>
                <p className="text-xs font-nastaliq font-bold text-amber-200">
                  مائیکروفون فعال ہے... اطمینان سے پورا سوال بولیں!
                </p>
                <p className="text-[11px] font-nastaliq text-emerald-200/80">
                  بولنا مکمل ہو جائے تو "مکمل و ارسال کریں" دبائیں یا مائیک بند کر کے اپنا متن چیک کریں۔
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (recognitionRef.current) {
                    try { recognitionRef.current.stop(); } catch {}
                  }
                  setIsListening(false);
                  if (prompt.trim()) {
                    handleSendMessage(prompt.trim());
                  }
                }}
                disabled={!prompt.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-black text-xs font-nastaliq shadow-md transition-all flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>مکمل و ارسال کریں</span>
              </button>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs font-nastaliq cursor-pointer"
              >
                روکیں
              </button>
            </div>
          </div>
        )}

        {voiceNotice && (
          <div className="p-2 bg-amber-950 border border-amber-600 text-amber-200 text-xs font-nastaliq rounded-xl text-center">
            {voiceNotice}
          </div>
        )}

        {/* Text Input Row with Mic and Send */}
        <div className="flex items-center gap-2">
          
          {/* Voice Mic Toggle Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer shrink-0 shadow-md ${
              isListening
                ? 'bg-red-600 text-white border-red-400 animate-pulse ring-2 ring-red-400'
                : 'bg-emerald-950 text-amber-300 hover:text-white border-amber-400/60 hover:bg-emerald-900'
            }`}
            title={isListening ? 'بولنا بند کریں' : 'مائیکروفون دبائیں اور بول کر سوال درج کریں'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Text Input */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if ((e.nativeEvent as any)?.isComposing) return;
                e.preventDefault();
                if (!isLoading && prompt.trim()) {
                  handleSendMessage();
                }
              }
            }}
            rows={1}
            placeholder="اردو، رومن اردو یا عربی میں اگلا سوال لکھیے (مثال: namaz ke faraiz, wuzu k farz)..."
            className="flex-1 px-4 py-3 rounded-2xl input-jewel text-xs sm:text-sm font-nastaliq text-amber-100 placeholder:text-emerald-300/40 focus:outline-none shadow-inner resize-none min-h-[46px] max-h-[120px] leading-relaxed"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !prompt.trim()}
            className="btn-3d-gold px-5 sm:px-6 py-3.5 rounded-2xl text-stone-950 font-black font-nastaliq text-xs sm:text-sm shadow-md disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Send className="w-4 h-4 rotate-180 text-stone-950" />
            )}
          </button>
        </div>

        {/* Footer info & voice language selector */}
        <div className="flex items-center justify-between text-[11px] text-emerald-300/70 font-nastaliq px-1">
          <div className="flex items-center gap-2">
            <span>مائیکروفون زبان:</span>
            <select
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value as any)}
              className="bg-emerald-950 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-emerald-700/60 focus:outline-none"
            >
              <option value="ur-PK">اردو / Roman Urdu (ur-PK)</option>
              <option value="en-US">English (en-US)</option>
              <option value="ar-SA">العربية (ar-SA)</option>
            </select>
          </div>
          <span>پچھلی گفتگو کا تسلسل خودکار محفوظ ہے</span>
        </div>

      </div>

    </div>
  );
};
