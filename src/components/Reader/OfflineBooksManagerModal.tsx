import React, { useState, useEffect } from 'react';
import { HardDrive, X, BookOpen, Trash2, DownloadCloud } from 'lucide-react';
import { Book } from '../../types';
import { getAllOfflineBooks, removeBookOffline, getOfflineStorageUsage } from '../../utils/offlineStorage';

interface OfflineBooksManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
}

export const OfflineBooksManagerModal: React.FC<OfflineBooksManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectBook,
}) => {
  const [offlineBooks, setOfflineBooks] = useState<Book[]>([]);
  const [storageUsage, setStorageUsage] = useState<{ count: number; approxBytes: number }>({
    count: 0,
    approxBytes: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const books = await getAllOfflineBooks();
      const usage = await getOfflineStorageUsage();
      setOfflineBooks(books);
      setStorageUsage(usage);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleDeleteBook = async (bookId: string) => {
    if (confirm('کیا آپ اس کتاب کو آف لائن میموری سے خارج کرنا چاہتے ہیں؟')) {
      await removeBookOffline(bookId);
      await loadData();
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#01140e]/85 backdrop-blur-md animate-fadeIn">
      <div className="modal-contrast-card rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl text-amber-50 space-y-5 border-2 border-amber-400/60 relative overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-800/60 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-950 text-amber-300 border-2 border-amber-400/60 flex items-center justify-center shadow-lg">
              <HardDrive className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-nastaliq font-black text-2xl text-amber-300">
                  آف لائن کتب مینیجر
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-400/40">
                  {storageUsage.count} کتب محفوظ
                </span>
              </div>
              <p className="text-xs font-nastaliq text-emerald-200 font-bold">
                بغیر انٹرنیٹ کے مکمل درسی مطالعہ کے لیے آپ کی ڈیوائس پر محفوظ شدہ کتب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-700/60 transition-all cursor-pointer"
            aria-label="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Bar */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-nastaliq text-emerald-200">
              کل استعمال شدہ میموری (IndexedDB):
            </span>
          </div>
          <span className="font-mono text-sm font-black text-amber-300">
            {formatSize(storageUsage.approxBytes)}
          </span>
        </div>

        {/* Books List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-emerald-300 font-nastaliq">
              لوڈ ہو رہا ہے...
            </div>
          ) : offlineBooks.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-stone-300">
              <BookOpen className="w-12 h-12 text-emerald-500/40 mx-auto" />
              <p className="font-nastaliq text-base font-bold text-emerald-200">
                فی الحال کوئی کتاب آف لائن محفوظ نہیں ہے۔
              </p>
              <p className="font-nastaliq text-xs text-stone-400">
                کسی بھی کتاب کے مطالعہ کے دوران اوپر موجود «آف لائن محفوظ کریں» کا بٹن دبائیں تاکہ وہ یہاں ظاہر ہو۔
              </p>
            </div>
          ) : (
            offlineBooks.map(book => (
              <div
                key={book.id}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-black/50 to-emerald-950/80 border border-emerald-700/60 hover:border-amber-400/80 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-amiri font-bold text-base text-amber-200 truncate">
                      {book.title}
                    </h4>
                    <p className="text-xs font-nastaliq text-emerald-200/90 truncate">
                      {book.author} • {book.subjectNameUrdu}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectBook(book);
                      onClose();
                    }}
                    className="btn-3d-gold px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold text-stone-950 flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>مطالعہ کریں</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-all cursor-pointer"
                    title="آف لائن میموری سے حذف کریں"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-emerald-800/40 text-[11px] text-emerald-300/80 font-nastaliq shrink-0">
          <span>تحریکِ ایمان • خودکار آف لائن لائبریری</span>
          <span>سرپرست: حضرت مولانا محمد نعیم الحسن صدیقی</span>
        </div>

      </div>
    </div>
  );
};
