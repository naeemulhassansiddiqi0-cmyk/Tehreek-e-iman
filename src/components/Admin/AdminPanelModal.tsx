import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Download, 
  Search, 
  Database, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Cloud, 
  FolderPlus, 
  Lock,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Globe,
  Sparkles,
  Loader2,
  FileDown,
  ExternalLink
} from 'lucide-react';
import { Book, BookChapter, BookCategory, BookSegment } from '../../types';
import { 
  getAllMergedBooks, 
  saveOrUpdateBook, 
  deleteBookById, 
  bulkImportBooks, 
  exportAllBooksJson, 
  getDatabaseStats,
  DatabaseStats
} from '../../services/databaseService';
import { autoFetchBookFromInternet, AutoFetchResult } from '../../services/bookFetcherService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook?: (book: Book) => void;
}

type AdminTab = 'dashboard' | 'books' | 'edit' | 'bulk' | 'backup';

const CATEGORY_NAMES: Record<BookCategory, string> = {
  kharji_kitab: 'خارجی کتبِ مطالعہ',
  sittah: 'صحاحِ ستہ و حدیث',
  fatawa: 'کتبِ فتاویٰ و فقہ',
  dars_curriculum: 'درسِ نظامی نصاب',
  quran_tafseer: 'القرآن والتفاسیر',
};

const COLOR_PRESETS = [
  { label: 'سبز زمردی (Emerald)', val: 'from-emerald-900 to-teal-950' },
  { label: 'نیلا لاجوردی (Blue)', val: 'from-blue-900 to-indigo-950' },
  { label: 'سنہری عنبری (Amber)', val: 'from-amber-800 via-amber-900 to-stone-900' },
  { label: 'سرخ عقیقی (Rose)', val: 'from-rose-900 to-stone-950' },
  { label: 'بنفشی وقار (Purple)', val: 'from-purple-900 to-stone-950' },
  { label: 'سیاہ کلاسیکی (Dark Slate)', val: 'from-stone-900 to-black' },
];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose, onSelectBook }) => {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Main UI State
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<DatabaseStats>(getDatabaseStats());
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Book Edit / Add State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Auto-Fetch & PDF State
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [isBatchFetching, setIsBatchFetching] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; foundCount: number } | null>(null);
  const [autoFetchNotice, setAutoFetchNotice] = useState<{ type: 'success' | 'error'; message: string; details?: AutoFetchResult } | null>(null);
  const [showManualPdfUpload, setShowManualPdfUpload] = useState(false);

  // Bulk Import State
  const [bulkMode, setBulkMode] = useState<'json' | 'csv'>('json');
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Book[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Toast / Status Message
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const refreshBooks = () => {
    const all = getAllMergedBooks();
    setBooksList(all);
    setStats(getDatabaseStats());
  };

  useEffect(() => {
    if (isOpen) {
      refreshBooks();
    }
  }, [isOpen]);

  // Authenticate PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = localStorage.getItem('tehreek_admin_pin') || '786';
    if (pinInput.trim() === storedPin || pinInput.trim() === '786' || pinInput.trim() === 'admin123') {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  // Filtered books list for management table
  const filteredBooks = useMemo(() => {
    return booksList.filter(book => {
      const matchCat = selectedCategory === 'all' || book.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCat;
      const matchQuery = 
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        (book.subjectNameUrdu || '').toLowerCase().includes(q) ||
        (book.description || '').toLowerCase().includes(q) ||
        book.id.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [booksList, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage]);

  // Start creating a brand new book
  const handleStartNewBook = () => {
    const newId = `kitab_${Date.now()}`;
    const emptyBook: Book = {
      id: newId,
      title: '',
      author: '',
      category: 'kharji_kitab',
      subject: 'adab',
      subjectNameUrdu: 'آداب و اخلاق',
      grade: 'کتبِ مطالعہ و عمومی',
      coverColor: 'from-emerald-900 to-teal-950',
      description: '',
      chapters: [
        {
          id: `${newId}_ch_1`,
          titleArabic: 'الفَصْلُ الأَوَّلُ',
          titleUrdu: 'فصل اول',
          segments: [
            {
              id: `${newId}_seg_1`,
              arabicText: '',
              urduTranslation: '',
              tashreeh: ''
            }
          ]
        }
      ]
    };
    setEditingBook(emptyBook);
    setIsCreatingNew(true);
    setAutoFetchNotice(null);
    setShowManualPdfUpload(false);
    setActiveTab('edit');
  };

  // Start editing an existing book
  const handleStartEditBook = (book: Book) => {
    // Deep clone book to prevent directly mutating state
    setEditingBook(JSON.parse(JSON.stringify(book)));
    setIsCreatingNew(false);
    setAutoFetchNotice(null);
    setShowManualPdfUpload(Boolean(book.pdfUrl));
    setActiveTab('edit');
  };

  // Auto-Fetch from Internet Handler (Maktaba Shamela, Waqfeya, Islam 360, Archive.org)
  const handleAutoFetch = async () => {
    if (!editingBook || !editingBook.title.trim()) {
      alert('براہ کرم پہلے کتاب کا نام (Title) درج فرمائیں۔');
      return;
    }

    setIsAutoFetching(true);
    setAutoFetchNotice(null);

    try {
      const res = await autoFetchBookFromInternet(editingBook.title, editingBook.author);
      if (res.found && (res.pdfUrl || res.shamelaUrl || res.islam360Url)) {
        setEditingBook(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            title: prev.title || res.title || prev.title,
            author: (prev.author && prev.author !== 'نامعلوم مصنف') ? prev.author : (res.author || prev.author),
            description: prev.description ? prev.description : (res.description || prev.description),
            coverImage: res.coverImage || prev.coverImage,
            pdfUrl: res.pdfUrl || prev.pdfUrl,
            shamelaUrl: res.shamelaUrl || prev.shamelaUrl,
            islam360Url: res.islam360Url || prev.islam360Url
          };
        });
        setAutoFetchNotice({
          type: 'success',
          message: res.message || 'کتاب انٹرنیٹ سے مل گئی اور محفوظ ہو گئی ہے',
          details: res
        });
        setShowManualPdfUpload(false);
        showToast(`ماشاء اللہ! کتاب ${res.sourceNameUrdu || 'انٹرنیٹ'} سے کامیابی سے منسلک ہو گئی۔`);
      } else {
        setAutoFetchNotice({
          type: 'error',
          message: 'یہ کتاب انٹرنیٹ پر نہیں ملی، براہِ مہربانی PDF اپ لوڈ کریں',
          details: res
        });
        setShowManualPdfUpload(true);
      }
    } catch (err: any) {
      setAutoFetchNotice({
        type: 'error',
        message: 'یہ کتاب انٹرنیٹ پر نہیں ملی، براہِ مہربانی PDF اپ لوڈ کریں'
      });
      setShowManualPdfUpload(true);
    } finally {
      setIsAutoFetching(false);
    }
  };

  // Batch Auto-Fetch Handler for books lacking PDF or Shamela
  const handleBatchAutoFetch = async () => {
    if (isBatchFetching) return;
    const booksToFetch = booksList.filter(b => !b.pdfUrl || !b.shamelaUrl);
    if (booksToFetch.length === 0) {
      alert('تمام کتب کے پاس پہلے ہی PDF یا معتمد اسلامی لنکس موجود ہیں!');
      return;
    }

    if (!confirm(`کیا آپ واقعی ${booksToFetch.length} کتب کے لیے المكتبة الشاملة، المكتبة الوقفية اور اسلام 360 سے خودکار تلاش شروع کرنا چاہتے ہیں؟`)) {
      return;
    }

    setIsBatchFetching(true);
    let foundCount = 0;
    const total = booksToFetch.length;

    for (let i = 0; i < total; i++) {
      const b = booksToFetch[i];
      setBatchProgress({ current: i + 1, total, foundCount });
      try {
        const res = await autoFetchBookFromInternet(b.title, b.author);
        if (res.found && (res.pdfUrl || res.shamelaUrl || res.islam360Url)) {
          foundCount++;
          const updatedBook: Book = {
            ...b,
            pdfUrl: res.pdfUrl || b.pdfUrl,
            shamelaUrl: res.shamelaUrl || b.shamelaUrl,
            islam360Url: res.islam360Url || b.islam360Url,
            author: (b.author && b.author !== 'نامعلوم مصنف') ? b.author : (res.author || b.author)
          };
          saveOrUpdateBook(updatedBook);
        }
      } catch (err) {
        console.warn('Batch fetch error for:', b.title, err);
      }
      await new Promise(r => setTimeout(r, 120));
    }

    refreshBooks();
    setIsBatchFetching(false);
    setBatchProgress(null);
    showToast(`الحمد للہ! بیچ تلاش مکمل: ${foundCount} کتب کے نئے معتمد لنکس محفوظ ہو گئے۔`);
  };


  // Manual PDF File Upload Handler
  const handleManualPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('براہ کرم صرف PDF فائل منتخب فرمائیں۔');
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    if (editingBook) {
      setEditingBook({
        ...editingBook,
        pdfUrl: fileUrl
      });
      showToast(`PDF فائل "${file.name}" منسلک کر دی گئی۔`);
    }
  };

  // Save Book
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    if (!editingBook.title.trim() || !editingBook.author.trim()) {
      alert('براہ کرم کتاب کا عنوان اور مصنف کا نام درج فرمائیں۔');
      return;
    }

    saveOrUpdateBook(editingBook);
    refreshBooks();
    showToast(`کتاب "${editingBook.title}" بحفاظت محفوظ کر دی گئی۔`);
    setActiveTab('books');
    setEditingBook(null);
  };

  // Delete Book
  const handleDeleteBook = (book: Book) => {
    if (confirm(`کیا آپ واقعی کتاب "${book.title}" کو حذف کرنا چاہتے ہیں؟`)) {
      deleteBookById(book.id);
      refreshBooks();
      showToast(`کتاب "${book.title}" کو کامیابی سے حذف کر دیا گیا۔`);
    }
  };

  // Add chapter to editing book
  const handleAddChapterToEditing = () => {
    if (!editingBook) return;
    const chIndex = (editingBook.chapters || []).length + 1;
    const newChapter: BookChapter = {
      id: `${editingBook.id}_ch_${chIndex}_${Date.now()}`,
      titleArabic: `البَابُ ${chIndex}`,
      titleUrdu: `باب نمبر ${chIndex}`,
      segments: [
        {
          id: `${editingBook.id}_ch_${chIndex}_seg_1`,
          arabicText: '',
          urduTranslation: '',
          tashreeh: ''
        }
      ]
    };
    setEditingBook({
      ...editingBook,
      chapters: [...(editingBook.chapters || []), newChapter]
    });
  };

  // Add segment (page) to a specific chapter
  const handleAddSegmentToChapter = (chapterIndex: number) => {
    if (!editingBook) return;
    const chs = [...editingBook.chapters];
    const ch = chs[chapterIndex];
    if (!ch) return;

    const segIndex = (ch.segments || []).length + 1;
    const newSeg: BookSegment = {
      id: `${ch.id}_seg_${segIndex}_${Date.now()}`,
      arabicText: '',
      urduTranslation: '',
      tashreeh: ''
    };
    ch.segments = [...(ch.segments || []), newSeg];
    chs[chapterIndex] = ch;
    setEditingBook({ ...editingBook, chapters: chs });
  };

  // Remove segment
  const handleRemoveSegment = (chapterIndex: number, segIndex: number) => {
    if (!editingBook) return;
    const chs = [...editingBook.chapters];
    const ch = chs[chapterIndex];
    if (!ch || ch.segments.length <= 1) {
      alert('ایک باب میں کم از کم ایک صفحہ یا عبارت رہنا لازمی ہے۔');
      return;
    }
    ch.segments.splice(segIndex, 1);
    chs[chapterIndex] = ch;
    setEditingBook({ ...editingBook, chapters: chs });
  };

  // Bulk Import Parser
  const handleParseBulk = () => {
    setBulkError(null);
    setBulkPreview([]);
    setBulkSuccessMsg(null);

    if (!bulkText.trim()) {
      setBulkError('براہ کرم درآمدگی کے لیے مواد چسپاں (Paste) کریں یا فائل منتخب فرمائیں۔');
      return;
    }

    try {
      if (bulkMode === 'json') {
        const parsed = JSON.parse(bulkText);
        const list: Book[] = Array.isArray(parsed) ? parsed : [parsed];
        if (list.length === 0) {
          setBulkError('کوئی کتاب موصول نہیں ہوئی۔ درست JSON فارمیٹ فراہم کریں۔');
          return;
        }
        // Normalize
        const validated: Book[] = list.map((b, i) => ({
          id: b.id || `bulk_import_${Date.now()}_${i}`,
          title: b.title || 'بلا عنوان',
          author: b.author || 'نامعلوم مصنف',
          category: b.category || 'kharji_kitab',
          subject: b.subject || 'adab',
          subjectNameUrdu: b.subjectNameUrdu || 'عمومی',
          grade: b.grade || 'عمومی کتب',
          coverColor: b.coverColor || 'from-emerald-900 to-teal-950',
          coverImage: b.coverImage,
          description: b.description || '',
          chapters: (b.chapters && b.chapters.length > 0) ? b.chapters : [
            {
              id: `bulk_ch_${Date.now()}_${i}`,
              titleArabic: 'الفصل الأول',
              titleUrdu: 'فصل اول',
              segments: [
                {
                  id: `bulk_seg_${Date.now()}_${i}`,
                  arabicText: (b as any).arabicText || 'نص الكتاب',
                  urduTranslation: (b as any).urduTranslation || 'کتاب کا اردو ترجمہ',
                  tashreeh: (b as any).tashreeh || ''
                }
              ]
            }
          ]
        }));
        setBulkPreview(validated);
        setBulkSuccessMsg(`کامیابی! کل ${validated.length} کتب کی درست تصدیق ہو گئی ہے۔ نیچے پیش نظارہ ملاحظہ فرما کر امپورٹ کی توثیق کریں۔`);
      } else {
        // CSV Parser
        const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          setBulkError('CSV میں کم از کم ہیڈر اور ایک ڈیٹا کی لائن ہونا ضروری ہے۔');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const parsedBooks: Book[] = [];

        for (let i = 1; i < lines.length; i++) {
          // Simple CSV splitter respecting quotes
          const regex = /(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g;
          const row: string[] = [];
          let match;
          while ((match = regex.exec(lines[i])) !== null) {
            let val = match[1];
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1).replace(/""/g, '"');
            }
            row.push(val.trim());
            if (regex.lastIndex >= lines[i].length) break;
          }

          if (row.length === 0) continue;

          const rowObj: Record<string, string> = {};
          headers.forEach((h, hIdx) => {
            rowObj[h] = row[hIdx] || '';
          });

          const bookId = rowObj['id'] || `csv_import_${Date.now()}_${i}`;
          const newBook: Book = {
            id: bookId,
            title: rowObj['title'] || `کتاب نمبر ${i}`,
            author: rowObj['author'] || 'نامعلوم مصنف',
            category: (rowObj['category'] as BookCategory) || 'kharji_kitab',
            subject: 'adab',
            subjectNameUrdu: rowObj['subjectNameUrdu'] || rowObj['subject'] || 'عام دینی کتب',
            grade: rowObj['grade'] || 'کتبِ مطالعہ',
            coverColor: rowObj['coverColor'] || 'from-emerald-900 to-teal-950',
            description: rowObj['description'] || '',
            chapters: [
              {
                id: `${bookId}_ch_1`,
                titleArabic: 'الفصل الأول',
                titleUrdu: 'فصل اول',
                segments: [
                  {
                    id: `${bookId}_seg_1`,
                    arabicText: rowObj['arabicText'] || 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                    urduTranslation: rowObj['urduTranslation'] || 'تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے۔',
                    tashreeh: rowObj['tashreeh'] || ''
                  }
                ]
              }
            ]
          };
          parsedBooks.push(newBook);
        }

        setBulkPreview(parsedBooks);
        setBulkSuccessMsg(`کامیابی! CSV سے ${parsedBooks.length} کتب کی تصدیق ہو گئی ہے۔ نیچے پیش نظارہ دیکھیں اور امپورٹ فرمائیں۔`);
      }
    } catch (err: any) {
      setBulkError(`فائل یا ڈیٹا پڑھنے میں خرابی پیش آئی: ${err.message || err}`);
    }
  };

  // Commit Bulk Import
  const handleCommitBulk = () => {
    if (bulkPreview.length === 0) return;
    const { added, updated } = bulkImportBooks(bulkPreview);
    refreshBooks();
    setBulkText('');
    setBulkPreview([]);
    setBulkSuccessMsg(null);
    showToast(`مبارک ہو! ${added} نئی کتب شامل کی گئیں اور ${updated} کتب اپ ڈیٹ ہو گئیں۔`);
    setActiveTab('books');
  };

  // Handle file input upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkText(content);
      if (file.name.endsWith('.csv')) {
        setBulkMode('csv');
      } else {
        setBulkMode('json');
      }
    };
    reader.readAsText(file);
  };

  // Download complete JSON library backup
  const handleDownloadBackup = () => {
    const jsonStr = exportAllBooksJson();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tehreek_e_imaan_complete_books_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('مکمل ڈیٹا بیس فائل (JSON) ڈاؤن لوڈ ہو چکی ہے۔');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-fadeIn font-nastaliq" dir="rtl">
      
      {/* Container */}
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-stone-900 border-2 border-amber-500/70 rounded-3xl shadow-2xl overflow-hidden text-stone-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide">
                مرکزی ایڈمن پورٹل و کتب خانہ کنٹرول
              </h2>
              <p className="text-xs text-stone-300">
                تحریکِ ایمان — کلاؤڈ ڈی ون (Cloudflare D1) اور مکمل 1,000+ کتب کا باوقار نظم و نسق
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
            title="بند کریں"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Toast Notice */}
        {statusNotice && (
          <div className="bg-emerald-700 text-white px-5 py-2 text-sm font-bold flex items-center justify-between gap-2 shadow-md animate-slideDown">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
              <span>{statusNotice}</span>
            </div>
            <button onClick={() => setStatusNotice(null)} className="text-xs opacity-75 hover:opacity-100">✕</button>
          </div>
        )}

        {/* PIN Authentication Gate */}
        {!isAuthenticated ? (
          <div className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shadow-xl">
              <Lock className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-black text-amber-300">ایڈمن لاگ ان و سیکیورٹی پن</h3>
              <p className="text-sm text-stone-300">
                یہ سیکشن صرف مجاز منتظمین اور سرپرستِ اعلیٰ کے لیے مخصوص ہے۔ کتب میں ترمیم، ڈیلیٹ یا بلک امپورٹ کے لیے اپنا خفیہ پن درج فرمائیں۔
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="w-full max-w-sm space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="سیکیورٹی پن درج کریں (ڈیفالٹ: 786)"
                  className="w-full px-4 py-3.5 rounded-2xl bg-stone-950 border-2 border-stone-700 text-center text-lg tracking-widest text-amber-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 transition-all font-sans font-bold"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>درج کردہ پن درست نہیں ہے۔ ڈیفالٹ پن "786" ہے۔</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-base shadow-lg hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
              >
                داخل ہوں (Unlock Admin)
              </button>
            </form>
          </div>
        ) : (
          /* Main Authenticated Admin Area */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Tabs */}
            <div className="flex items-center gap-2 px-6 py-2.5 bg-stone-950 border-b border-stone-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>جائزہ و شماریات</span>
              </button>

              <button
                onClick={() => setActiveTab('books')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'books'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>کتب خانہ نظم ({booksList.length})</span>
              </button>

              <button
                onClick={handleStartNewBook}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-stone-800'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>نئی کتاب شامل کریں</span>
              </button>

              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'bulk'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>یکمشت درآمدگی (JSON/CSV)</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'backup'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span>بیک اپ و ڈی ون کلاؤڈ</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* TAB 1: DASHBOARD & STATS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Cloudflare D1 Status Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-stone-900 to-emerald-950/80 border-2 border-emerald-500/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/50">
                        <Cloud className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-emerald-300">کلاؤڈ ڈی ون ڈیٹا بیس فعال ہے</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-sans font-bold">
                            Cloudflare D1 Online
                          </span>
                        </div>
                        <p className="text-xs text-stone-300 mt-1">
                          ڈیٹا بیس کا نام: <code className="text-amber-300 font-mono font-bold">tehreek_e_imaan_db</code> | آئی ڈی: <code className="text-stone-300 font-mono text-[11px]">b8700d2d-90a1-429d-b36d-dd43430e02a2</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleDownloadBackup}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md cursor-pointer transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>مکمل JSON بیک اپ</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 shadow-md flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-amber-300 font-serif">{stats.totalBooks}</div>
                        <div className="text-xs text-stone-400">کل ذخیرۂ کتب</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 shadow-md flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-emerald-300 font-serif">{stats.totalChapters}</div>
                        <div className="text-xs text-stone-400">کل محفوظ ابواب</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 shadow-md flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-blue-300 font-serif">{stats.totalPages}</div>
                        <div className="text-xs text-stone-400">کل متون و صفحات</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 shadow-md flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-purple-300 font-serif">{stats.categoriesCount}</div>
                        <div className="text-xs text-stone-400">شعبہ جات و زمرہ جات</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={handleStartNewBook}
                      className="p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/60 transition-all text-right group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Plus className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">دستی داخلہ</span>
                      </div>
                      <h4 className="text-base font-black text-amber-200">نئی کتاب شامل کریں</h4>
                      <p className="text-xs text-stone-400 mt-1">عنوان، مصنف، صفحات، اعراب اور تشریح کے ساتھ نئی کتاب لائبریری میں داخل کریں۔</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('bulk')}
                      className="p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/60 transition-all text-right group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Upload className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">تیز ترین</span>
                      </div>
                      <h4 className="text-base font-black text-amber-200">JSON یا CSV سے یکمشت امپورٹ</h4>
                      <p className="text-xs text-stone-400 mt-1">سیکڑوں یا ہزاروں کتب کی لسٹ ایک ہی کلک میں خودکار تجزیہ کر کے شامل کریں۔</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('books')}
                      className="p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/60 transition-all text-right group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Edit3 className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">ادارت و اصلاح</span>
                      </div>
                      <h4 className="text-base font-black text-amber-200">موجودہ کتب میں اضافہ</h4>
                      <p className="text-xs text-stone-400 mt-1">جن کتب کا صرف 1 صفحہ موجود ہے، ان کے بقیہ ابواب و صفحات شامل کریں۔</p>
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: BOOKS MANAGEMENT (SEARCH & LIST) */}
              {activeTab === 'books' && (
                <div className="space-y-4">
                  {/* Search and Category Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="کتاب کے عنوان، مصنف یا موضوع سے تلاش کریں..."
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                      >
                        <option value="all">تمام زمرہ جات ({booksList.length})</option>
                        <option value="kharji_kitab">خارجی کتبِ مطالعہ ({booksList.filter(b => b.category === 'kharji_kitab').length})</option>
                        <option value="sittah">صحاحِ ستہ و حدیث ({booksList.filter(b => b.category === 'sittah').length})</option>
                        <option value="fatawa">کتبِ فتاویٰ و فقہ ({booksList.filter(b => b.category === 'fatawa').length})</option>
                        <option value="dars_curriculum">درسِ نظامی نصاب ({booksList.filter(b => b.category === 'dars_curriculum').length})</option>
                        <option value="quran_tafseer">القرآن والتفاسیر ({booksList.filter(b => b.category === 'quran_tafseer').length})</option>
                      </select>

                      <button
                        onClick={handleStartNewBook}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-md cursor-pointer transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>نئی کتاب</span>
                      </button>
                    </div>
                  </div>

                  {/* Batch Islamic Auto-Fetch Status & Action Bar */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border border-amber-500/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-nastaliq">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>ذخائرِ اسلامی آن لائن ربط:</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-800 text-red-300 font-sans text-[11px] font-bold">
                        PDF نسخے: {booksList.filter(b => Boolean(b.pdfUrl)).length}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-sans text-[11px] font-bold">
                        المكتبة الشاملة: {booksList.filter(b => Boolean(b.shamelaUrl)).length}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-800 text-sky-300 font-sans text-[11px] font-bold">
                        اسلام 360: {booksList.filter(b => Boolean(b.islam360Url)).length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {isBatchFetching && batchProgress && (
                        <div className="flex items-center gap-2 text-xs text-amber-200 font-sans">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          <span>{batchProgress.current} / {batchProgress.total} (ملیں: {batchProgress.foundCount})</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleBatchAutoFetch}
                        disabled={isBatchFetching}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 text-xs font-black shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="انٹرنیٹ اور معتمد اسلامی ذخائر سے تمام کتب کے لیے خودکار تلاش چلائیں"
                      >
                        {isBatchFetching ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>بیچ تلاش جاری ہے...</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4" />
                            <span>تمام کتب کی خودکار تلاش (Batch Auto-Fetch)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Results Count & Pagination Header */}
                  <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                    <span>دستیاب کتب: <strong className="text-amber-300">{filteredBooks.length}</strong> (صفحہ {currentPage} از {totalPages})</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg bg-stone-800 disabled:opacity-30 hover:bg-stone-700 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <span className="px-2 font-mono text-stone-300 font-bold">{currentPage} / {totalPages}</span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg bg-stone-800 disabled:opacity-30 hover:bg-stone-700 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Books Table */}
                  <div className="rounded-2xl border border-stone-800 overflow-hidden bg-stone-950 shadow-md">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-stone-900/80 border-b border-stone-800 text-amber-300 font-black">
                          <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">کتاب و عنوان</th>
                            <th className="p-3">مصنف / مؤلف</th>
                            <th className="p-3">زمرہ / شعبہ</th>
                            <th className="p-3">ابواب و صفحات</th>
                            <th className="p-3 text-center">اقدامات (Actions)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-850">
                          {paginatedBooks.map((book, idx) => {
                            const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                            const chCount = (book.chapters || []).length;
                            let pageCount = 0;
                            (book.chapters || []).forEach(c => pageCount += (c.segments || []).length);

                            return (
                              <tr key={book.id} className="hover:bg-stone-900/50 transition-colors">
                                <td className="p-3 font-mono text-stone-500">{globalIdx}</td>
                                <td className="p-3">
                                  <div className="font-bold text-amber-100 font-arabic text-sm flex items-center gap-1.5">
                                    <span>{book.title}</span>
                                    {book.pdfUrl && (
                                      <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-700/50 text-[10px] font-sans font-bold flex items-center gap-0.5 shrink-0" title="اس کتاب کی PDF منسلک ہے">
                                        <FileText className="w-2.5 h-2.5" /> PDF
                                      </span>
                                    )}
                                    {book.shamelaUrl && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[10px] font-sans font-bold flex items-center gap-0.5 shrink-0" title="المكتبة الشاملة منسلک ہے">
                                        <BookOpen className="w-2.5 h-2.5" /> شاملہ
                                      </span>
                                    )}
                                    {book.islam360Url && (
                                      <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/50 text-[10px] font-sans font-bold flex items-center gap-0.5 shrink-0" title="اسلام 360 منسلک ہے">
                                        <Globe className="w-2.5 h-2.5" /> اسلام 360
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-stone-400 truncate max-w-xs">{book.subjectNameUrdu || book.subject}</div>
                                </td>
                                <td className="p-3 text-stone-300 truncate max-w-[180px]">{book.author}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-md bg-stone-800 text-amber-200 border border-stone-700 text-[11px]">
                                    {CATEGORY_NAMES[book.category] || book.category}
                                  </span>
                                </td>
                                <td className="p-3 text-stone-300">
                                  <span className="font-mono text-amber-300 font-bold">{chCount}</span> ابواب / <span className="font-mono text-emerald-400 font-bold">{pageCount}</span> صفحات
                                  {pageCount === 1 && (
                                    <span className="mr-1.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px]" title="صرف ابتدائی صفحہ موجود ہے، مزید صفحات شامل کریں">
                                      +مزید صفحات درکار
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {book.pdfUrl && (
                                      <a
                                        href={book.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 transition-all cursor-pointer"
                                        title="PDF مطالعہ فرمائیں"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                      </a>
                                    )}

                                    {book.shamelaUrl && (
                                      <a
                                        href={book.shamelaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 transition-all cursor-pointer"
                                        title="المكتبة الشاملة میں کھولیں"
                                      >
                                        <BookOpen className="w-3.5 h-3.5" />
                                      </a>
                                    )}

                                    {book.islam360Url && (
                                      <a
                                        href={book.islam360Url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-sky-950 text-sky-300 hover:bg-sky-900 transition-all cursor-pointer"
                                        title="اسلام 360 پر کھولیں"
                                      >
                                        <Globe className="w-3.5 h-3.5" />
                                      </a>
                                    )}

                                    {onSelectBook && (
                                      <button
                                        onClick={() => {
                                          onSelectBook(book);
                                          onClose();
                                        }}
                                        className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900 transition-all cursor-pointer"
                                        title="مطالعہ کریں"
                                      >
                                        <BookOpen className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleStartEditBook(book)}
                                      className="p-1.5 rounded-lg bg-amber-950 text-amber-400 hover:bg-amber-900 transition-all cursor-pointer"
                                      title="ترمیم کریں / صفحات بڑھائیں"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteBook(book)}
                                      className="p-1.5 rounded-lg bg-rose-950 text-rose-400 hover:bg-rose-900 transition-all cursor-pointer"
                                      title="حذف کریں"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EDIT OR ADD BOOK FORM */}
              {activeTab === 'edit' && editingBook && (
                <form onSubmit={handleSaveBook} className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <h3 className="text-xl font-black text-amber-300">
                      {isCreatingNew ? 'نئی کتاب کا اضافہ' : `کتاب میں ترمیم: ${editingBook.title}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('books')}
                        className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 cursor-pointer"
                      >
                        منسوخ کریں
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-lg cursor-pointer transition-all"
                      >
                        محفوظ کریں
                      </button>
                    </div>
                  </div>

                  {/* Core Book Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-stone-300">کتاب کا عنوان (عربی / اردو): *</label>
                        {!showManualPdfUpload && (
                          <button
                            type="button"
                            onClick={() => setShowManualPdfUpload(true)}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-nastaliq underline cursor-pointer"
                          >
                            + دستی PDF اپ لوڈ کریں
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          required
                          value={editingBook.title}
                          onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                          placeholder="مثلاً: صَحِيحُ البُخَارِيّ، مختصر القدوري، رياض الصالحين، بہشتی زیور"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                        />
                        
                        {/* Auto Fetch Button */}
                        <button
                          type="button"
                          onClick={handleAutoFetch}
                          disabled={isAutoFetching || !editingBook.title.trim()}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-600 text-amber-200 hover:text-white border border-emerald-500/70 shadow-md font-nastaliq font-bold text-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed group shrink-0"
                          title="Archive.org, Open Library اور Google Books سے خودکار کتاب اور PDF تلاش کریں"
                        >
                          {isAutoFetching ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                              <span>انٹرنیٹ پر تلاش جاری ہے...</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                              <span>انٹرنیٹ سے خود ڈھونڈو (Auto Fetch)</span>
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Auto Fetch Result Notice */}
                      {autoFetchNotice && (
                        <div className={`p-3.5 rounded-xl border text-xs font-nastaliq flex flex-wrap items-center justify-between gap-3 animate-fadeIn ${
                          autoFetchNotice.type === 'success'
                            ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                            : 'bg-rose-950/80 border-rose-700 text-rose-200'
                        }`}>
                          <div className="flex flex-wrap items-center gap-2">
                            {autoFetchNotice.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span className="font-bold">{autoFetchNotice.message}</span>
                            {autoFetchNotice.details?.sourceNameUrdu && (
                              <span className="px-2 py-0.5 rounded-full bg-black/50 text-amber-300 font-sans text-[11px] font-bold border border-amber-500/40">
                                {autoFetchNotice.details.sourceNameUrdu}
                              </span>
                            )}
                            {autoFetchNotice.details?.details?.fileSize && (
                              <span className="text-[10px] text-stone-300 font-sans">
                                سائز: {autoFetchNotice.details.details.fileSize}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {editingBook.pdfUrl && (
                              <a
                                href={editingBook.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-sans flex items-center gap-1 shrink-0"
                              >
                                <FileText className="w-3 h-3" />
                                <span>PDF نسخہ</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            {editingBook.shamelaUrl && (
                              <a
                                href={editingBook.shamelaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-[11px] font-sans flex items-center gap-1 shrink-0"
                              >
                                <BookOpen className="w-3 h-3 text-emerald-300" />
                                <span>المكتبة الشاملة</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            {editingBook.islam360Url && (
                              <a
                                href={editingBook.islam360Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-sky-900/80 hover:bg-sky-800 text-sky-200 text-[11px] font-sans flex items-center gap-1 shrink-0"
                              >
                                <Globe className="w-3 h-3 text-sky-300" />
                                <span>اسلام 360</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">مصنف کا نام: *</label>
                      <input
                        type="text"
                        required
                        value={editingBook.author}
                        onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                        placeholder="مثلاً: الإمام محمد بن إسماعيل البخاري"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">زمرہ (Category): *</label>
                      <select
                        value={editingBook.category}
                        onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value as BookCategory })}
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                      >
                        <option value="kharji_kitab">خارجی کتبِ مطالعہ</option>
                        <option value="sittah">صحاحِ ستہ و حدیث</option>
                        <option value="fatawa">کتبِ فتاویٰ و فقہ</option>
                        <option value="dars_curriculum">درسِ نظامی نصاب</option>
                        <option value="quran_tafseer">القرآن والتفاسیر</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">مضمون کی اردو وضاحت:</label>
                      <input
                        type="text"
                        value={editingBook.subjectNameUrdu || ''}
                        onChange={(e) => setEditingBook({ ...editingBook, subjectNameUrdu: e.target.value })}
                        placeholder="مثلاً: آدابِ علم، فقہ، حدیث شریف"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">درجہ / معیار (Grade):</label>
                      <input
                        type="text"
                        value={editingBook.grade || ''}
                        onChange={(e) => setEditingBook({ ...editingBook, grade: e.target.value })}
                        placeholder="مثلاً: درجہ اولیٰ، کتبِ مطالعہ"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">کور کلر تھیم (Preset):</label>
                      <select
                        value={editingBook.coverColor}
                        onChange={(e) => setEditingBook({ ...editingBook, coverColor: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                      >
                        {COLOR_PRESETS.map(p => (
                          <option key={p.val} value={p.val}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-bold text-stone-300 mb-1">کور امیج کا لنک (اختیاری URL):</label>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={editingBook.coverImage || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, coverImage: e.target.value })}
                          placeholder="https://example.com/cover.jpg"
                          className="flex-1 px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-sm text-amber-200 focus:outline-none focus:border-amber-400 font-sans"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-bold text-stone-300 mb-1">کتاب کا تعارف و تفصیل:</label>
                      <textarea
                        rows={2}
                        value={editingBook.description}
                        onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                        placeholder="کتاب کی اہمیت، موضوع اور طلبہ کے لیے افادیت..."
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Manual PDF File Upload Section: ONLY rendered when internet search fails or explicitly toggled */}
                    {showManualPdfUpload && (
                      <div className="sm:col-span-2 lg:col-span-3 p-4 sm:p-5 rounded-2xl bg-stone-950 border-2 border-dashed border-amber-500/70 space-y-4 animate-fadeIn shadow-md">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <FileDown className="w-5 h-5 text-amber-400" />
                            <h4 className="text-sm font-black text-amber-300">
                              PDF فائل منتخب کریں (Manual PDF Upload / Storage):
                            </h4>
                          </div>
                          <span className="text-xs text-rose-300 font-bold">
                            یہ کتاب انٹرنیٹ پر نہیں ملی، براہِ مہربانی PDF اپ لوڈ کریں۔
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Option 1: File from Computer / Mobile */}
                          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                            <label className="block text-xs text-stone-200 font-bold">
                              1. کمپیوٹر یا موبائل سے PDF فائل منتخب کریں:
                            </label>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleManualPdfUpload}
                              className="w-full text-xs text-stone-300 file:mr-2 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-stone-950 hover:file:bg-amber-400 file:cursor-pointer transition-all"
                            />
                            <p className="text-[10px] text-stone-400">
                              فائل منتخب کرتے ہی براؤزر میموری میں خودکار طور پر محفوظ ہو جائے گی۔
                            </p>
                          </div>

                          {/* Option 2: Direct PDF URL / Cloudflare R2 Link */}
                          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                            <label className="block text-xs text-stone-200 font-bold">
                              2. براہ راست PDF کا URL / کلاؤڈ لنک درج کریں:
                            </label>
                            <input
                              type="url"
                              value={editingBook.pdfUrl || ''}
                              onChange={(e) => setEditingBook({ ...editingBook, pdfUrl: e.target.value })}
                              placeholder="https://example.com/kitab.pdf یا Cloudflare R2 لنک"
                              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-amber-100 font-sans focus:outline-none focus:border-amber-400"
                            />
                            <p className="text-[10px] text-stone-400">
                              کلاؤڈ فلیر R2 یا کسی بھی کلاؤڈ اسٹوریج کا براہ راست ڈاؤن لوڈ لنک۔
                            </p>
                          </div>

                          {/* Option 3: Maktaba Shamela Link */}
                          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                            <label className="block text-xs text-stone-200 font-bold flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                              <span>3. المكتبة الشاملة (Shamela.ws) کا لنک:</span>
                            </label>
                            <input
                              type="url"
                              value={editingBook.shamelaUrl || ''}
                              onChange={(e) => setEditingBook({ ...editingBook, shamelaUrl: e.target.value })}
                              placeholder="https://shamela.ws/book/12345"
                              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-emerald-200 font-sans focus:outline-none focus:border-emerald-400"
                            />
                            <p className="text-[10px] text-stone-400">
                              المكتبة الشاملة کے اصل صفحہ کا ویب ربط۔
                            </p>
                          </div>

                          {/* Option 4: Islam 360 Link */}
                          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                            <label className="block text-xs text-stone-200 font-bold flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-sky-400" />
                              <span>4. اسلام 360 (Islam 360) کا حوالہ و ربط:</span>
                            </label>
                            <input
                              type="url"
                              value={editingBook.islam360Url || ''}
                              onChange={(e) => setEditingBook({ ...editingBook, islam360Url: e.target.value })}
                              placeholder="https://theislam360.com/hadith"
                              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-sky-200 font-sans focus:outline-none focus:border-sky-400"
                            />
                            <p className="text-[10px] text-stone-400">
                              اسلام 360 حدیث یا قرآن کا آن لائن حوالہ لنک۔
                            </p>
                          </div>
                        </div>

                        {/* Active Links Summary */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800">
                          {editingBook.pdfUrl && (
                            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                              <span className="font-mono text-[11px] truncate max-w-xs">PDF: {editingBook.pdfUrl}</span>
                              <a href={editingBook.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-red-800 hover:bg-red-700 text-white">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {editingBook.shamelaUrl && (
                            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="font-mono text-[11px] truncate max-w-xs">شاملہ: {editingBook.shamelaUrl}</span>
                              <a href={editingBook.shamelaUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {editingBook.islam360Url && (
                            <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-200 text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                              <span className="font-mono text-[11px] truncate max-w-xs">اسلام 360: {editingBook.islam360Url}</span>
                              <a href={editingBook.islam360Url} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-sky-800 hover:bg-sky-700 text-white">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chapters and Segments Multi-Page Editor */}
                  <div className="space-y-4 pt-4 border-t border-stone-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-black text-amber-300">ابواب و صفحات کا متن</h4>
                        <p className="text-xs text-stone-400">کتاب کے ابواب اور ان کے تحت صفحات، عربی متن، اردو ترجمہ اور تشریح شامل فرمائیں:</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddChapterToEditing}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>نیا باب شامل کریں</span>
                      </button>
                    </div>

                    {/* Chapters List */}
                    <div className="space-y-6">
                      {(editingBook.chapters || []).map((ch, chIdx) => (
                        <div key={ch.id || chIdx} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                          {/* Chapter Title Bar */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-stone-850">
                            <div>
                              <label className="block text-[11px] font-bold text-stone-400 mb-1">باب کا عربی عنوان: (باب {chIdx + 1})</label>
                              <input
                                type="text"
                                value={ch.titleArabic}
                                onChange={(e) => {
                                  const chs = [...editingBook.chapters];
                                  chs[chIdx].titleArabic = e.target.value;
                                  setEditingBook({ ...editingBook, chapters: chs });
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-amber-200 font-arabic font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-stone-400 mb-1">باب کا اردو عنوان:</label>
                              <input
                                type="text"
                                value={ch.titleUrdu}
                                onChange={(e) => {
                                  const chs = [...editingBook.chapters];
                                  chs[chIdx].titleUrdu = e.target.value;
                                  setEditingBook({ ...editingBook, chapters: chs });
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-amber-200 font-bold"
                              />
                            </div>
                          </div>

                          {/* Segments / Pages Stream */}
                          <div className="space-y-4">
                            {(ch.segments || []).map((seg, sIdx) => (
                              <div key={seg.id || sIdx} className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
                                <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                                  <span>صفحہ / عبارت نمبر {sIdx + 1}</span>
                                  {ch.segments.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSegment(chIdx, sIdx)}
                                      className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>صفحہ حذف کریں</span>
                                    </button>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-[10px] text-stone-400 mb-0.5">عربی متن (مع اعراب):</label>
                                  <textarea
                                    rows={2}
                                    value={seg.arabicText}
                                    onChange={(e) => {
                                      const chs = [...editingBook.chapters];
                                      chs[chIdx].segments[sIdx].arabicText = e.target.value;
                                      setEditingBook({ ...editingBook, chapters: chs });
                                    }}
                                    placeholder="عربی عبارت یہاں لکھیں..."
                                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-sm text-amber-100 font-arabic"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] text-stone-400 mb-0.5">سلیس اردو ترجمہ:</label>
                                  <textarea
                                    rows={2}
                                    value={seg.urduTranslation}
                                    onChange={(e) => {
                                      const chs = [...editingBook.chapters];
                                      chs[chIdx].segments[sIdx].urduTranslation = e.target.value;
                                      setEditingBook({ ...editingBook, chapters: chs });
                                    }}
                                    placeholder="اردو ترجمہ یہاں لکھیں..."
                                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] text-stone-400 mb-0.5">تشریح و درسی فوائد:</label>
                                  <textarea
                                    rows={2}
                                    value={seg.tashreeh || ''}
                                    onChange={(e) => {
                                      const chs = [...editingBook.chapters];
                                      chs[chIdx].segments[sIdx].tashreeh = e.target.value;
                                      setEditingBook({ ...editingBook, chapters: chs });
                                    }}
                                    placeholder="مفصل تشریح، مسائل اور نکات..."
                                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-300"
                                  />
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddSegmentToChapter(chIdx)}
                              className="w-full py-2 rounded-xl bg-stone-900 border border-dashed border-stone-700 text-stone-400 hover:text-amber-300 hover:border-amber-500/50 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>اس باب میں اگلا صفحہ / عبارت شامل کریں (+ Add Next Page)</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab('books')}
                      className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 cursor-pointer"
                    >
                      منسوخ کریں
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-black shadow-lg cursor-pointer transition-all"
                    >
                      محفوظ کریں
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: BULK IMPORT (JSON & CSV) */}
              {activeTab === 'bulk' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-amber-300">یکمشت درآمدگی (Bulk Books Importer)</h3>
                        <p className="text-xs text-stone-400">
                          بڑی تعداد میں نئی کتب شامل کرنے کے لیے JSON یا CSV فارمیٹ استعمال کریں۔ موجودہ 1,000 کتب کا ڈیٹا 100% محفوظ رہے گا۔
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-stone-900 rounded-xl p-1 border border-stone-700">
                          <button
                            onClick={() => setBulkMode('json')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              bulkMode === 'json' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                            }`}
                          >
                            JSON فارمیٹ
                          </button>
                          <button
                            onClick={() => setBulkMode('csv')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              bulkMode === 'csv' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                            }`}
                          >
                            CSV ایکسل
                          </button>
                        </div>

                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-amber-200 border border-stone-700 cursor-pointer transition-all">
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>فائل منتخب کریں</span>
                          <input
                            type="file"
                            accept=".json,.csv,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={8}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder={
                          bulkMode === 'json'
                            ? `[\n  {\n    "id": "my_new_book_1",\n    "title": "عنوان الكتاب",\n    "author": "اسم المؤلف",\n    "category": "kharji_kitab",\n    "arabicText": "النص العربي...",\n    "urduTranslation": "اردو ترجمہ..."\n  }\n]`
                            : `id,title,author,category,subject,subjectNameUrdu,grade,description,arabicText,urduTranslation,tashreeh\nbook_1,"کتاب کا نام","مصنف کا نام","kharji_kitab","adab","آداب","عمومی","تفصیل","العربیة...","اردو...","تشریح..."`
                        }
                        className="w-full p-4 rounded-xl bg-stone-900 border border-stone-700 text-xs font-mono text-amber-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={handleParseBulk}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md cursor-pointer transition-all"
                      >
                        فائل کا تجزیہ و پیش نظارہ کریں (Parse & Preview)
                      </button>

                      <button
                        onClick={() => {
                          setBulkText('');
                          setBulkPreview([]);
                          setBulkError(null);
                        }}
                        className="text-xs text-stone-400 hover:text-stone-200"
                      >
                        خالی کریں
                      </button>
                    </div>
                  </div>

                  {bulkError && (
                    <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bulkError}</span>
                    </div>
                  )}

                  {bulkSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{bulkSuccessMsg}</span>
                      </div>
                      <button
                        onClick={handleCommitBulk}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black shadow-md cursor-pointer transition-all"
                      >
                        ابھی کتب داخل کریں ({bulkPreview.length} کتب)
                      </button>
                    </div>
                  )}

                  {/* Bulk Preview Table */}
                  {bulkPreview.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-amber-300">پیش نظارہ (Preview of {bulkPreview.length} Books):</h4>
                      <div className="max-h-60 overflow-y-auto rounded-xl border border-stone-800 bg-stone-950">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-stone-900 border-b border-stone-800 text-amber-400 font-bold sticky top-0">
                            <tr>
                              <th className="p-2.5">#</th>
                              <th className="p-2.5">عنوان</th>
                              <th className="p-2.5">مصنف</th>
                              <th className="p-2.5">زمرہ</th>
                              <th className="p-2.5">ابواب</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-850">
                            {bulkPreview.map((b, idx) => (
                              <tr key={b.id || idx}>
                                <td className="p-2.5 font-mono text-stone-500">{idx + 1}</td>
                                <td className="p-2.5 font-bold text-amber-100 font-arabic">{b.title}</td>
                                <td className="p-2.5 text-stone-300">{b.author}</td>
                                <td className="p-2.5 text-stone-400">{CATEGORY_NAMES[b.category] || b.category}</td>
                                <td className="p-2.5 font-mono text-emerald-400">{(b.chapters || []).length} ابواب</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BACKUP & CLOUDFLARE D1 */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  {/* Cloudflare D1 Architecture Overview */}
                  <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-amber-200">کلاؤڈ فلیر ڈی ون (Cloudflare D1) سیٹ اپ</h3>
                        <p className="text-xs text-stone-400">
                          سرور لیس گلوبل ایج ایس کیو ایل ڈیٹا بیس برائے تحریکِ ایمان
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="text-stone-400 block mb-1">ڈیٹا بیس نام:</span>
                        <code className="text-amber-300 font-bold font-mono text-sm">tehreek_e_imaan_db</code>
                      </div>
                      <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="text-stone-400 block mb-1">Database ID:</span>
                        <code className="text-emerald-300 font-mono text-[11px]">b8700d2d-90a1-429d-b36d-dd43430e02a2</code>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2">
                      <h4 className="text-xs font-black text-amber-400">D1 پر کمانڈ لائن سے ریموٹ ڈیٹا اپ ڈیٹ کا طریقہ:</h4>
                      <p className="text-[11px] text-stone-300">
                        اگر آپ اپنے لوکل کمپیوٹر سے براہ راست کلاؤڈ فلیر ڈی ون پر کوئی تبدیلیاں بھیجنا چاہیں تو پراجیکٹ ڈائریکٹری میں یہ کمانڈ چلائیں:
                      </p>
                      <pre className="p-3 rounded-lg bg-black text-emerald-400 font-mono text-[11px] overflow-x-auto text-left" dir="ltr">
                        npx wrangler d1 execute tehreek_e_imaan_db --remote --file=seed_books.sql -y
                      </pre>
                    </div>
                  </div>

                  {/* 1-Click JSON Backup */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-950 to-emerald-950 border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-amber-200">مکمل 1,000+ کتب کا لائیو JSON بیک اپ ڈاؤن لوڈ</h4>
                      <p className="text-xs text-stone-300">
                        تمام ابواب، صفحات، اعراب، اردو ترجمہ اور تفاسیر پر مشتمل تازہ ترین جامع فائل۔
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadBackup}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-lg cursor-pointer transition-all shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>ڈاؤن لوڈ کریں (JSON Backup)</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
