import React, { useState, useEffect, useRef } from 'react';
import { askIslamicAI, ChatMessage } from '../../services/aiService';
import { speakText } from '../../services/speechService';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Copy, 
  CheckCheck, 
  Bookmark, 
  BookOpen, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  User,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Book, AppTab } from '../../types';
import { booksDatabase } from '../../data/booksData';
import { TehreekImanLogo } from '../TehreekImanLogo';
import { copyToClipboardWithTehreekLogo } from '../../utils/clipboardHelper';

interface GlobalAIAssistantDrawerProps {
  apiKey: string;
  onSaveToNotes: (content: string) => void;
  onNavigateTab: (tab: AppTab) => void;
  onSelectBook?: (book: Book) => void;
}

export const GlobalAIAssistantDrawer: React.FC<GlobalAIAssistantDrawerProps> = ({
  apiKey,
  onSaveToNotes,
  onNavigateTab,
  onSelectBook,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);

  // Gemini API Key State
  const [localApiKey, setLocalApiKey] = useState<string>(() => {
    return apiKey || (typeof window !== 'undefined' ? localStorage.getItem('tehreek_gemini_api_key') || localStorage.getItem('madrasa_gemini_api_key') || '' : '');
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  // Multi-Turn Chat Messages History
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome_1',
        role: 'assistant',
        content: 'وَعَلَيْكُمُ السَّلَامُ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ! 🌹\n\nمرحبًا بكم في منصة تحريكِ إيمان۔ میں آپ کا باوقار علمی اتالیق ہوں۔\n\nآپ مجھ سے **اردو، رومن اردو (Roman Urdu)، عربی، یا انگریزی** میں کوئی بھی شرعی، فقہی، یا درسی سوال پوچھ سکتے ہیں۔ یا مائیکروفون کے ذریعے **بول کر گفتگو** فرما سکتے ہیں۔ تمام جوابات قرآن، حدیث اور معتمد کتب کے صریح حوالوں سے مدلل ہوں گے۔',
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        references: ["تحریکِ ایمان علمی معاون"]
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Voice Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<'ur-PK' | 'en-US' | 'ar-SA'>('ur-PK');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Setup Speech Recognition
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
        console.warn('Voice notice:', event.error);
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
      } catch (err) {
        console.warn('Recognition start err:', err);
      }
    }
  };

  // Text to Speech Voice Audio Playback
  const handleToggleSpeech = (msgId: string, textToRead: string) => {
    // If currently speaking this message, stop it
    if (speakingMsgId === msgId) {
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        stopSpeakingRef.current = null;
      }
      setSpeakingMsgId(null);
      return;
    }

    // If speaking something else, cancel it
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

  // Stop speech when closing drawer
  useEffect(() => {
    if (!isOpen && stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
      setSpeakingMsgId(null);
    }
  }, [isOpen]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || prompt;
    if (!textToSend.trim() || isLoading) return;

    // Stop active audio playback
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
      setSpeakingMsgId(null);
    }

    const userMessageId = 'msg_' + Date.now();
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
    };

    // Append user message immediately to the chat thread!
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await askIslamicAI(
        textToSend.trim(),
        'dalayel_quran_sunnah',
        'intermediate',
        localApiKey || apiKey,
        undefined,
        messages // pass conversation history
      );

      const assistantMessage: ChatMessage = {
        id: 'asst_' + Date.now(),
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        references: res.references,
        iraabBreakdown: res.iraabBreakdown,
        tipsForExam: res.tipsForExam,
        suggestedAction: res.suggestedAction
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: 'معذرت، سوال کے تجزیہ میں عارضی رکاوٹ پیش آئی۔ براہ کرم دوبارہ کوشش فرمائیں۔',
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = async (id: string, text: string) => {
    await copyToClipboardWithTehreekLogo(text, {
      title: 'تحریکِ ایمان ڈیجیٹل دار الافتاء — شرعی فتویٰ و تصدیق شدہ جواب',
      includeTimestamp: true,
    });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveMessageToNotes = (id: string, text: string) => {
    onSaveToNotes(`[علمی اتالیق چیٹ نوٹ]:\n\n${text}`);
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

  const handleExecuteSuggestedAction = (action?: { label: string; tab?: any; bookId?: string }) => {
    if (!action) return;
    if (action.tab) {
      onNavigateTab(action.tab);
    }
    if (action.bookId && onSelectBook) {
      const b = booksDatabase.find(x => x.id === action.bookId);
      if (b) {
        onSelectBook(b);
        onNavigateTab('reader');
      }
    }
    setIsOpen(false);
  };

  const quickPromptChips = [
    { label: "✨ ایمان کی حقیقت و ارکان", text: "ایمان کی حقیقت کیا ہے اور قرآن و سنت سے اس کے ارکان اور دلائل کیا ہیں؟" },
    { label: "🌟 اللہ کے ۹۹ نام مع معانی", text: "اللہ کے 99 نام اور ان کے معانی بتائیں" },
    { label: "نماز کے فرائض (Namaz ke faraiz)", text: "namaz ke faraiz bata dein" },
    { label: "تقویٰ و اخلاص کی حقیقت", text: "تقویٰ کی حقیقت کیا ہے اور متقی کی کیا صفات ہیں؟" },
    { label: "توبہ کی شرائط و سید الاستغفار", text: "توبہ کی شرائط کیا ہیں اور سید الاستغفار کیا ہے؟" },
    { label: "والدین کے حقوق و اطاعت", text: "اسلام میں والدین کی خدمت اور حقوق کیا ہیں؟" },
    { label: "وضو کے ۴ فرائض مع دلیل", text: "وضو کے فرائض کیا ہیں اور قرآن و سنت سے کیا دلیل ہے؟" },
    { label: "سجدۂ سہو کا حکم", text: "sajda sahw kab wajib hota hai aur is ka tariqa kya hai?" },
    { label: "قبر کا عذاب و منکر نکیر", text: "قبر میں کیا سوالات ہوتے ہیں اور عذابِ قبر کا کیا ثبوت ہے؟" },
    { label: "📁 ۱۰۷ خارجی کتابیں کہاں ہیں؟", text: "خارجی کتابیں کہاں ہیں اور انہیں کیسے پڑھیں؟" },
    { label: "سودی بینکنگ کی شرعی حرمت", text: "bank interest aur sood ki hurmat par quran o hadees ke dalayel" },
  ];

  return (
    <>
      {/* Persistent Floating Trigger Button (Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-40 no-print">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black font-nastaliq shadow-[0_10px_30px_rgba(212,175,55,0.45)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.6)] border-2 border-amber-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="پورٹل و شرعی معاون سے پوچھیں (Voice & AI)"
        >
          {/* Animated Glow Ring */}
          <span className="absolute -inset-1 rounded-2xl bg-amber-400/40 blur-md group-hover:opacity-100 transition-opacity animate-pulse"></span>
          
          <div className="relative flex items-center gap-2">
            <span className="p-1 rounded-xl bg-stone-950 text-amber-300">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            </span>
            <div className="text-right leading-tight">
              <span className="block text-xs sm:text-sm font-black">علمی اتالیق AI</span>
              <span className="block text-[10px] text-stone-900 font-bold">صوتی و متنی چیٹ 🎙️</span>
            </div>
          </div>
        </button>
      </div>

      {/* Slide-over Drawer Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn no-print">
          <div 
            className={`w-full ${isExpanded ? 'max-w-3xl' : 'max-w-xl'} h-full bg-[#021c15] text-amber-50 shadow-2xl border-r-2 border-amber-400/50 flex flex-col transition-all duration-300 transform translate-x-0`}
            style={{ direction: 'rtl' }}
          >
            
            {/* Drawer Top Bar */}
            <div className="p-4 sm:p-5 board-jewel-emerald border-b-2 border-emerald-700/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md font-bold shrink-0">
                  <Sparkles className="w-5 h-5 text-stone-950" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black font-nastaliq text-amber-300 flex items-center gap-2">
                    <span>مرکزِ افتاء و رفیقِ مفتی AI</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-amber-300 border border-amber-400/50 font-nastaliq">
                      ڈیجیٹل دار الافتاء • Live
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200/90 font-nastaliq">
                    قرآنِ حکیم، سنتِ نبوی اور فقہِ حنفی کی روشنی میں مستند شرعی فتاویٰ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Gemini Live API Key Button */}
                <button
                  onClick={() => {
                    setTempApiKey(localApiKey);
                    setIsKeyModalOpen(!isKeyModalOpen);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-nastaliq font-bold border transition-all cursor-pointer ${
                    localApiKey
                      ? 'bg-emerald-900 text-emerald-300 border-emerald-500 hover:bg-emerald-800'
                      : 'bg-amber-950/90 text-amber-300 border-amber-500/70 hover:bg-amber-900'
                  }`}
                  title="گوگل جیمنائی API Key سیٹنگز"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{localApiKey ? 'Gemini لائیو' : 'Gemini Key'}</span>
                </button>

                {/* Reset Chat Button */}
                <button
                  onClick={resetChat}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-nastaliq font-bold bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-emerald-700/70 transition-colors cursor-pointer"
                  title="نئی گفتگو شروع کریں"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نئی چیٹ</span>
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-xl text-amber-300 hover:text-white hover:bg-emerald-800/60 transition-colors hidden sm:block cursor-pointer"
                  title={isExpanded ? 'چھوٹا کریں' : 'بڑا کریں'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-amber-300 hover:text-white hover:bg-emerald-800/60 transition-colors cursor-pointer"
                  title="بند کریں"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gemini API Key Configuration Banner */}
            {isKeyModalOpen && (
              <div className="p-3 sm:p-4 bg-[#01140e] border-b-2 border-amber-400/60 space-y-2 text-xs font-nastaliq text-amber-100 animate-fadeIn shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-300 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>گوگل جیمنائی (Gemini 1.5 Flash) کنکشن:</span>
                  </span>
                  <button
                    onClick={() => setIsKeyModalOpen(false)}
                    className="text-stone-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  اگر آپ جیمنائی لائیو کلاؤڈ ماڈل سے ہر سوال کا جواب حاصل کرنا چاہتے ہیں تو aistudio.google.com سے اپنی مفت Gemini API Key یہاں درج فرما کر محفوظ کریں۔ بغیر کی کے بھی تحریکِ ایمان کا ۵۰+ موضوعات پر مشتمل تفصیلی اسلامی انسائیکلوپیڈیا خودکار طور پر مکمل فعال ہے۔
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="AIzaSy... (Gemini API Key)"
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-950 border border-emerald-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                  <button
                    onClick={() => {
                      const trimmed = tempApiKey.trim();
                      setLocalApiKey(trimmed);
                      localStorage.setItem('tehreek_gemini_api_key', trimmed);
                      localStorage.setItem('madrasa_gemini_api_key', trimmed);
                      setIsKeyModalOpen(false);
                    }}
                    className="btn-3d-gold px-3.5 py-2 rounded-xl text-stone-950 font-black text-xs cursor-pointer shrink-0"
                  >
                    محفوظ کریں
                  </button>
                  {localApiKey && (
                    <button
                      onClick={() => {
                        setLocalApiKey('');
                        setTempApiKey('');
                        localStorage.removeItem('tehreek_gemini_api_key');
                        localStorage.removeItem('madrasa_gemini_api_key');
                        setIsKeyModalOpen(false);
                      }}
                      className="px-2.5 py-2 rounded-xl bg-red-900/80 hover:bg-red-800 text-red-200 text-xs cursor-pointer shrink-0"
                    >
                      کی ہٹائیں
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Voice Recording Notification Banner */}
            {isListening && (
              <div className="p-3 bg-red-950/90 border-b border-red-500 text-red-200 text-xs font-nastaliq flex items-center justify-between shrink-0 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                  <span>مائیکروفون فعال ہے... فرمائیے، آپ کی آواز سنی جا رہی ہے!</span>
                </div>
                <button
                  onClick={toggleVoiceInput}
                  className="px-2.5 py-1 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-xs cursor-pointer"
                >
                  روکیں اور بھیجیں
                </button>
              </div>
            )}

            {voiceNotice && (
              <div className="p-2 bg-amber-950 text-amber-200 text-xs font-nastaliq border-b border-amber-600 text-center shrink-0">
                {voiceNotice}
              </div>
            )}

            {/* Quick Suggestion Chips Bar */}
            <div className="p-2.5 bg-[#01140e] border-b border-emerald-850/80 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              <span className="text-[11px] font-bold text-amber-400 font-nastaliq shrink-0 pl-1">
                فوری سوال:
              </span>
              {quickPromptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.text)}
                  className="text-[11px] px-3 py-1 rounded-full card-jewel-dark text-amber-200 hover:border-amber-400 hover:text-white font-nastaliq font-bold border border-emerald-700/60 transition-all shrink-0 cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Scrollable Conversational Messages Timeline */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const isSpeakingThis = speakingMsgId === msg.id;

                return (
                  <div 
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
                  >
                    
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                      isUser 
                        ? 'bg-amber-400 text-stone-950 font-bold border-2 border-amber-300' 
                        : 'bg-emerald-900 text-amber-300 border-2 border-amber-400/60'
                    }`}>
                      {isUser ? <User className="w-5 h-5" /> : <TehreekImanLogo size={36} className="rounded-xl shadow-md" />}
                    </div>

                    {/* Message Bubble Container */}
                    <div className={`max-w-[85%] sm:max-w-[80%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      
                      <div className={`p-4 sm:p-5 rounded-3xl shadow-xl transition-all ${
                        isUser
                          ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-black rounded-tr-none border-2 border-amber-300'
                          : 'card-jewel-dark text-amber-50 rounded-tl-none border-2 border-emerald-700/70'
                      }`}>
                        
                        {/* Top bar for Assistant message with Tehreek-e-Iman Logo */}
                        {!isUser && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b-2 border-amber-400/40 bg-gradient-to-r from-emerald-950/80 via-stone-900/90 to-emerald-950/80 p-2.5 rounded-2xl shadow-md">
                            <div className="flex items-center gap-2">
                              <TehreekImanLogo size={36} className="shadow-md ring-1 ring-amber-400/60 shrink-0" />
                              <div className="text-right">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-amber-300 font-nastaliq">
                                    تحریکِ ایمان • دار الافتاء
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 font-nastaliq font-bold">
                                    فتویٰ
                                  </span>
                                </div>
                                <p className="text-[9px] text-emerald-200 font-nastaliq">
                                  حضرت مولانا محمد نعیم الحسن صدیقی
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
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

                              {/* Copy */}
                              <button
                                onClick={() => copyMessage(msg.id, msg.content)}
                                className="p-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 text-xs border border-emerald-700 cursor-pointer"
                                title="کاپی کریں"
                              >
                                {copiedId === msg.id ? <CheckCheck className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              {/* Save to Notes */}
                              <button
                                onClick={() => saveMessageToNotes(msg.id, msg.content)}
                                className="p-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 text-xs border border-emerald-700 cursor-pointer"
                                title="نوٹس میں محفوظ کریں"
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${savedNoteId === msg.id ? 'text-amber-400 fill-amber-400' : ''}`} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Content text */}
                        <div className={`font-nastaliq whitespace-pre-line text-justify leading-[2.5] text-xs sm:text-sm ${
                          isUser ? 'text-stone-950 font-black' : 'text-emerald-50 font-semibold'
                        }`}>
                          {msg.content}
                        </div>

                        {/* References pills if present */}
                        {msg.references && msg.references.length > 0 && (
                          <div className="pt-2.5 mt-2.5 border-t border-emerald-800/60 space-y-1">
                            <span className="text-[10px] font-bold text-amber-300 font-nastaliq block">
                              مستند حوالہ جات:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {msg.references.map((ref, rIdx) => (
                                <span 
                                  key={rIdx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-amber-200 border border-emerald-700 font-nastaliq"
                                >
                                  📖 {ref}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested action button if present */}
                        {msg.suggestedAction && (
                          <div className="pt-2.5 mt-2.5 border-t border-emerald-800/60">
                            <button
                              onClick={() => handleExecuteSuggestedAction(msg.suggestedAction)}
                              className="btn-3d-gold w-full py-1.5 px-3 rounded-xl text-xs font-black text-stone-950 font-nastaliq flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-stone-950" />
                              <span>{msg.suggestedAction.label}</span>
                            </button>
                          </div>
                        )}

                        {/* Official Dar-ul-Ifta Stamp & Verification Seal */}
                        {!isUser && msg.id !== 'welcome_1' && (
                          <div className="pt-3 mt-3 border-t-2 border-emerald-700/60 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              {/* Official Stamp Badge with Tehreek-e-Iman Logo */}
                              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border border-amber-400 text-amber-300 shadow-sm">
                                <TehreekImanLogo size={36} className="shadow-md shrink-0 ring-1 ring-amber-400/60" />
                                <div className="text-right">
                                  <div className="text-[11px] font-nastaliq font-bold text-amber-300">
                                    تحریکِ ایمان ڈیجیٹل دار الافتاء • باضابطہ تصدیق کی مہر
                                  </div>
                                  <div className="text-[9px] text-emerald-300 font-nastaliq">
                                    زیرِ سرپرستی: حضرت مولانا محمد نعیم الحسن صدیقی
                                  </div>
                                </div>
                              </div>

                              {/* Allahu Subhanahu Wa Ta'ala A'lam bi-as-Sawab */}
                              <div className="px-2.5 py-0.5 rounded-lg bg-black/50 border border-amber-400/50 text-amber-200 font-amiri font-bold text-xs shadow-inner">
                                «وَاللَّهُ سُبْحَانَهُ وَتَعَالَىٰ أَعْلَمُ بِالصَّوَابِ»
                              </div>
                            </div>

                            {/* Required Scholarly Verification Final Advisory Line */}
                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200/95 shadow-inner">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <p className="text-[11px] font-nastaliq leading-[2] text-justify font-medium">
                                یہ اے آئی مسئلے کی وضاحت میں معاون ہے، اس کی تصدیق کے لیے اپنے علاقے کے معتبر عالم دین اور مفتیان کرام سے رجوع فرمائیں۔
                              </p>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Timestamp */}
                      <span className={`text-[10px] text-emerald-300/70 font-mono block px-2 ${isUser ? 'text-left' : 'text-right'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                  </div>
                );
              })}

              {/* Typing / Thinking Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3 animate-fadeIn">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-900 text-amber-300 border-2 border-amber-400/60 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl card-jewel-dark border-2 border-emerald-700/60 flex items-center gap-2">
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

            {/* Input Composer Bar */}
            <div className="p-3 sm:p-4 board-jewel-emerald border-t-2 border-emerald-700/80 space-y-2 shrink-0">
              
              {/* Active Voice Recording Notification Banner */}
              {isListening && (
                <div className="p-2.5 bg-gradient-to-r from-red-950 via-emerald-950 to-red-950 border-2 border-red-500/80 text-white rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-nastaliq font-bold text-amber-200">
                      مائیکروفون فعال ہے... بولیں!
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
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
                      className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-bold text-xs font-nastaliq shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مکمل، ارسال کریں</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className="px-2.5 py-1 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-nastaliq cursor-pointer"
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

              <div className="flex items-center gap-2">
                
                {/* Voice Mic Toggle Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer shrink-0 shadow-md ${
                    isListening
                      ? 'bg-red-600 text-white border-red-400 animate-pulse ring-2 ring-red-400'
                      : 'bg-emerald-950 text-amber-300 hover:text-white border-amber-400/60 hover:bg-emerald-900'
                  }`}
                  title={isListening ? 'بولنا مکمل کریں' : 'مائیکروفون دبائیں اور بول کر سوال پوچھیں'}
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
                  placeholder="اردو، رومن اردو یا عربی میں لکھیے (مثلاً: namaz ke faraiz)..."
                  className="flex-1 px-4 py-3 rounded-2xl input-jewel text-xs sm:text-sm font-nastaliq text-amber-100 placeholder:text-emerald-300/50 focus:outline-none shadow-inner resize-none min-h-[46px] max-h-[120px] leading-relaxed"
                />

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !prompt.trim()}
                  className="btn-3d-gold px-4 sm:px-5 py-3 rounded-2xl text-stone-950 font-black font-nastaliq text-xs sm:text-sm shadow-md disabled:opacity-50 transition-all cursor-pointer shrink-0"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Send className="w-4 h-4 rotate-180 text-stone-950" />
                  )}
                </button>
              </div>

              {/* Voice Language Selector & Info footer */}
              <div className="flex items-center justify-between text-[11px] text-emerald-350 font-nastaliq px-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300/80">مائیکروفون زبان:</span>
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
                <span className="text-amber-300/80">Gemini کی طرح مسلسل چیٹ فعال ہے</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
