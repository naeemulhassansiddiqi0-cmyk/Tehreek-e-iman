import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ReaderView } from './components/Reader/ReaderView';
import { AITutorChat } from './components/AITutor/AITutorChat';
import { ExamHubView } from './components/ExamHub/ExamHubView';
import { NotebookView, NoteItem } from './components/Notes/NotebookView';
import { FlashcardHubView } from './components/Flashcards/FlashcardHubView';
import { SearchModal } from './components/SearchModal';
import { KharjiLibraryModal } from './components/KharjiLibraryModal';
import { AdminPanelModal } from './components/Admin/AdminPanelModal';
import { GlobalAIAssistantDrawer } from './components/AITutor/GlobalAIAssistantDrawer';
import { PrayerTimesView } from './components/PrayerTimes/PrayerTimesView';
import { SacredAudioPlayer } from './components/AudioPlayer/SacredAudioPlayer';
import { Chatbot } from './components/Chatbot';
import { booksDatabase } from './data/booksData';
import { Book, AppTab } from './types';
import { TehreekImanLogo } from './components/TehreekImanLogo';
import { formatTextWithTehreekLogo, formatHtmlWithTehreekLogo } from './utils/clipboardHelper';
import BookDetailPage from './app/books/[slug]/page';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => typeof window !== 'undefined' ? window.location.pathname : '/');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedBook, setSelectedBook] = useState<Book>(booksDatabase[0]);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('tehreek_gemini_api_key') || localStorage.getItem('madrasa_gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [theme, setTheme] = useState<'parchment' | 'dark' | 'light'>('parchment');
  const [userName, setUserName] = useState<string>('حضرت مولانا محمد نعیم الحسن صدیقی');
  const [customLogoSrc, setCustomLogoSrc] = useState<string>('/tehreek-iman-logo.jpg');
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');
  const [aiInitialContext, setAiInitialContext] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isKharjiModalOpen, setIsKharjiModalOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [kharjiModalInitialBook, setKharjiModalInitialBook] = useState<Book | null>(null);
  const [highlightSegmentId, setHighlightSegmentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleChatbotSelectBook = (slug: string) => {
    window.location.href = `/books/${slug}`;
  };

  const handleOpenKharjiBooks = (book?: Book) => {
    setKharjiModalInitialBook(book || null);
    setIsKharjiModalOpen(true);
  };
  
  // Stored notes in LocalStorage
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('madrasa_student_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'sample_note_1',
        title: 'قاعدہ: اعرابِ غسل اور مسح',
        content: 'غسل میں پانی کا عضو پر اس طرح بہنا ضروری ہے کہ دو قطرے ٹپک پڑیں۔ اور مسح میں صرف تری پہنچنا کافی ہے، پانی بہانا جائز یا شرط نہیں۔ (حوالہ: قدوری و جوہرہ نیرہ)',
        date: '12 ستمبر 2026'
      }
    ];
  });

  // Global clipboard interceptor: appends official Tehreek-e-Iman watermark & logo to any text copied on the site
  useEffect(() => {
    const handleGlobalCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString();
      if (selection && selection.trim().length > 15) {
        // Avoid duplicate wrapping if already formatted
        if (selection.includes('TEHREEK-E-IMAN') || selection.includes('تحریکِ ایمان')) {
          return;
        }
        e.preventDefault();
        const plain = formatTextWithTehreekLogo(selection);
        const html = formatHtmlWithTehreekLogo(selection);
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', plain);
          e.clipboardData.setData('text/html', html);
        }
      }
    };

    document.addEventListener('copy', handleGlobalCopy);
    return () => document.removeEventListener('copy', handleGlobalCopy);
  }, []);

  // International Deep-linking: Read URL query params on initial mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AppTab | null;
      const bookParam = params.get('book');
      const modalParam = params.get('modal');

      if (tabParam && ['dashboard', 'reader', 'ai-tutor', 'exams', 'notes', 'flashcards', 'prayer-times'].includes(tabParam)) {
        setActiveTab(tabParam);
      }

      if (bookParam) {
        const found = booksDatabase.find(b => b.id.toLowerCase() === bookParam.toLowerCase());
        if (found) {
          setSelectedBook(found);
          if (!tabParam) setActiveTab('reader');
        }
      }

      if (modalParam === 'kharji') {
        setIsKharjiModalOpen(true);
      } else if (modalParam === 'search') {
        setIsSearchOpen(true);
      } else if (modalParam === 'admin') {
        setIsAdminOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // International Dynamic SEO & Canonical URL State Synchronization
  useEffect(() => {
    try {
      let title = 'تحریکِ ایمان | جامع اسلامی پورٹل، مکتبہ درسِ نظامی و اوقاتِ صلوٰۃ — مولانا محمد نعیم الحسن صدیقی';
      let desc = 'تحریکِ ایمان — جامع اسلامی ڈیجیٹل کتب خانہ، اوقاتِ صلوٰۃ و دائمی جنتری، اور تعلیمی پورٹل۔ قرآنِ حکیم، صحاح ستہ، فقہ حنفی اور وفاق المدارس امتحانی مرکز۔';

      const url = new URL(window.location.href);

      if (activeTab === 'dashboard') {
        url.searchParams.delete('tab');
        url.searchParams.delete('book');
      } else if (activeTab === 'prayer-times') {
        title = 'اوقاتِ صلوٰۃ و دائمی جنتری مع آڈیو اذان | تحریکِ ایمان';
        desc = 'پاکستان کے 15+ بڑے شہروں کے مستند اوقاتِ نماز (حنفی عصر)، سحر و افطار، اشراق و چاشت، لائیو ریورس کاؤنٹ ڈاؤن اور باقاعدہ اذان آڈیو۔';
        url.searchParams.set('tab', 'prayer-times');
        url.searchParams.delete('book');
      } else if (activeTab === 'reader') {
        title = `${selectedBook.title} — ${selectedBook.author} | تحریکِ ایمان`;
        desc = `${selectedBook.title} (${selectedBook.subjectNameUrdu}) مع اعراب، سلیس و تحقیقی اردو ترجمہ، تفسیری نکات اور درسی حل اللغات۔`;
        url.searchParams.set('tab', 'reader');
        url.searchParams.set('book', selectedBook.id);
      } else if (activeTab === 'ai-tutor') {
        title = 'مرکزِ افتاء و رفیقِ مفتی (ڈیجیٹل دار الافتاء مع AI) | تحریکِ ایمان';
        desc = 'قرآنِ حکیم، سنتِ نبوی اور فقہِ حنفی کی امہات الکتب سے صریح دلائل کے ساتھ ہر سوال کا مستند شرعی فتویٰ اور رہنمائی۔';
        url.searchParams.set('tab', 'ai-tutor');
        url.searchParams.delete('book');
      } else if (activeTab === 'exams') {
        title = 'وفاق المدارس امتحانی مرکز و 3 گھنٹے کا لائیو سمیلیٹر | تحریکِ ایمان';
        desc = '9 درجات کے وفاق ماڈل پیپرز اور 3 گھنٹے کے لائیو امتحانی سمیلیٹر سے پرچہ حل کرنے کی تفصیلی مشق۔';
        url.searchParams.set('tab', 'exams');
        url.searchParams.delete('book');
      } else if (activeTab === 'flashcards') {
        title = 'حفظِ متون و 3D فلیش کارڈز | تحریکِ ایمان';
        desc = 'نحو، صرف، اصولِ فقہ، اور اصطلاحاتِ حدیث کی تعریفات کو 3D فلیش کارڈز سے پختہ یاد فرمائیں۔';
        url.searchParams.set('tab', 'flashcards');
        url.searchParams.delete('book');
      } else if (activeTab === 'notes') {
        title = 'شخصی حواشی و علمی یادداشتیں | تحریکِ ایمان';
        desc = 'مطالعہ کے دوران کتب پر اپنے ذاتی نوٹس لکھیں جو آف لائن ڈیوائس میں خودکار محفوظ رہتے ہیں۔';
        url.searchParams.set('tab', 'notes');
        url.searchParams.delete('book');
      }

      // Update document title
      document.title = title;

      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', desc);

      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', desc);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', url.toString());

      // Update Twitter tags
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', title);
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', desc);

      // Synchronize browser URL without reloading
      window.history.replaceState(null, '', url.pathname + url.search);
    } catch {
      // ignore
    }
  }, [activeTab, selectedBook]);

  useEffect(() => {
    try {
      localStorage.setItem('madrasa_student_notes', JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('madrasa_gemini_api_key');
      if (savedKey) setApiKey(savedKey);
      
      const savedTheme = localStorage.getItem('madrasa_theme') as 'parchment' | 'dark' | 'light';
      if (savedTheme) setTheme(savedTheme);

      const savedName = localStorage.getItem('madrasa_user_name');
      if (savedName && savedName.includes('نعیم الحسن')) {
        const fullName = savedName.startsWith('حضرت') ? savedName : `حضرت ${savedName}`;
        setUserName(fullName);
      } else if (savedName) {
        setUserName(savedName);
      } else {
        localStorage.setItem('madrasa_user_name', 'حضرت مولانا محمد نعیم الحسن صدیقی');
      }

      const savedLogo = localStorage.getItem('madrasa_custom_logo');
      if (savedLogo) {
        setCustomLogoSrc(savedLogo);
      } else {
        localStorage.setItem('madrasa_custom_logo', '/tehreek-iman-logo.jpg');
      }
    } catch {
      // ignore
    }

    // Keyboard shortcut: Ctrl+K or / to open Search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSetTheme = (t: 'parchment' | 'dark' | 'light') => {
    setTheme(t);
    try {
      localStorage.setItem('madrasa_theme', t);
    } catch {
      // ignore
    }
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSendToAI = (text: string, bookName: string) => {
    setAiInitialPrompt(text);
    setAiInitialContext(bookName);
    setActiveTab('ai-tutor');
  };

  const handleSelectSearchResult = (book: Book, segmentId: string) => {
    setSelectedBook(book);
    setHighlightSegmentId(segmentId);
    setActiveTab('reader');
  };

  const handleAddNote = (content: string, title?: string) => {
    const newNote: NoteItem = {
      id: 'note_' + Date.now(),
      title: title || 'علمی نکتہ',
      content,
      date: new Date().toLocaleDateString('ur-PK')
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const isBookDetail = (currentPath.startsWith('/books/') && currentPath.length > 7) || 
                       (currentPath.startsWith('/book/') && currentPath.length > 6);
  if (isBookDetail) {
    return (
      <div dir="rtl" className="min-h-screen bg-white">
        <BookDetailPage />
        <Chatbot onSelectBook={handleChatbotSelectBook} apiKey={apiKey} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      theme === 'dark'
        ? 'bg-stone-950 text-stone-100'
        : theme === 'parchment'
        ? 'parchment-pattern text-stone-900'
        : 'bg-stone-50 text-stone-900'
    }`}>
      
      {/* Top Navigation with Tehreek-e-Iman branding & Search */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        apiKey={apiKey}
        setApiKey={setApiKey}
        theme={theme}
        setTheme={handleSetTheme}
        userName={userName}
        setUserName={setUserName}
        customLogoSrc={customLogoSrc}
        setCustomLogoSrc={setCustomLogoSrc}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenKharjiBooks={() => handleOpenKharjiBooks()}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Body Content according to Active Tab */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            searchQuery={searchQuery}
            onSelectBook={(book) => {
              if (book && (book.slug || book.id)) {
                window.location.href = `/books/${book.slug || book.id}`;
                return;
              }
              if (book && book.chapters) {
                setSelectedBook(book);
                setActiveTab('reader');
              }
            }}
            setActiveTab={setActiveTab}
            onSendToAI={handleSendToAI}
            onOpenKharjiBooks={handleOpenKharjiBooks}
            onOpenAdmin={() => setIsAdminOpen(true)}
            userName={userName}
            customLogoSrc={customLogoSrc}
          />
        )}

        {activeTab === 'reader' && (
          <ReaderView
            selectedBook={selectedBook}
            onSelectBook={setSelectedBook}
            onSendToAI={handleSendToAI}
            onAddNote={(_bookId, _segmentId, text) => {
              handleAddNote(text, `${selectedBook.title} کا حاشیہ`);
            }}
            highlightSegmentId={highlightSegmentId}
            theme={theme}
            apiKey={apiKey}
            onBackToDashboard={() => setActiveTab('dashboard')}
            userName={userName}
            onOpenKharjiBooks={handleOpenKharjiBooks}
          />
        )}

        {activeTab === 'ai-tutor' && (
          <AITutorChat
            initialPrompt={aiInitialPrompt}
            initialBookContext={aiInitialContext || selectedBook.title}
            apiKey={apiKey}
            onSaveToNotes={(content) => handleAddNote(content, 'اے آئی استفسار و تجزیہ')}
            theme={theme}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'exams' && (
          <ExamHubView 
            theme={theme} 
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'notes' && (
          <NotebookView
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            theme={theme}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardHubView
            theme={theme}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'prayer-times' && (
          <PrayerTimesView
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* 1000 Kharji Books In-Place Popup Explorer Modal */}
      <KharjiLibraryModal
        isOpen={isKharjiModalOpen}
        onClose={() => {
          setIsKharjiModalOpen(false);
          setKharjiModalInitialBook(null);
        }}
        initialBook={kharjiModalInitialBook}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setIsKharjiModalOpen(false);
          setKharjiModalInitialBook(null);
          setActiveTab('reader');
        }}
        onSendToAI={handleSendToAI}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Central Admin Panel & D1 Control Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setActiveTab('reader');
        }}
      />

      {/* Persistent Global Floating AI Assistant Drawer (Accessible on every page) */}
      <GlobalAIAssistantDrawer
        apiKey={apiKey}
        onSaveToNotes={(content) => handleAddNote(content, 'علمی اتالیق استفسار')}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onSelectBook={(book) => setSelectedBook(book)}
      />

      {/* Smart AI Chatbot - Clean Emerald Circle Bottom-Left */}
      <Chatbot onSelectBook={handleChatbotSelectBook} apiKey={apiKey} />

      {/* Global Sacred Quran & Hadith Audio Recitation Player */}
      <SacredAudioPlayer />

      {/* Footer with Tehreek-e-Iman Branding & Founder attribution */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-8 bg-stone-100/60 dark:bg-stone-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
          
          <div className="flex items-center gap-4">
            <TehreekImanLogo size={48} customImgSrc={customLogoSrc} />
            <div>
              <p className="font-arabic font-bold text-base text-emerald-950 dark:text-emerald-100">
                تَحْرِيكِ إِيمَان — مَنَصَّةُ المَدَارِسِ الإِسْلَامِيَّة
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300 font-nastaliq">
                سرپرستی و پیشکش: <strong className="text-stone-900 dark:text-stone-100 font-bold">{userName}</strong> (Mohammad Naeem ul Hassan Siddiqi)
              </p>
            </div>
          </div>

          <div className="text-xs text-stone-500 space-y-1">
            <p className="font-nastaliq">ایک بابرکت اور باوقار علمی کاوش برائے طلبہ و علماءِ کرام</p>
            <p className="text-[11px] text-stone-400 font-sans">
              © 1448ھ / 2026ء — Tehreek-e-Iman Platform (Phase 1 MVP)
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
export default App;
