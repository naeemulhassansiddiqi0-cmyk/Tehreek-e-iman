import { copyToClipboardWithTehreekLogo } from '../../utils/clipboardHelper';
import React, { useState } from 'react';
import { Bookmark, Trash2, Copy, Plus, CheckCheck, Search, ArrowLeft } from 'lucide-react';

export interface NoteItem {
  id: string;
  title?: string;
  content: string;
  date: string;
}

interface NotebookViewProps {
  notes: NoteItem[];
  onAddNote: (content: string, title?: string) => void;
  onDeleteNote: (id: string) => void;
  theme: string;
  onBackToDashboard?: () => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  theme: _theme,
  onBackToDashboard,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContent.trim()) {
      onAddNote(newContent.trim(), newTitle.trim() || undefined);
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
    }
  };

  const copyNote = async (id: string, text: string) => {
    await copyToClipboardWithTehreekLogo(text, {
      title: 'تحریکِ ایمان علمی نوٹ بک',
      includeTimestamp: true,
    });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNotes = notes.filter(n => 
    n.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (n.title && n.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-nastaliq font-bold text-xs border border-stone-300 dark:border-stone-700 transition-colors shadow-2xs mb-3"
              title="صفحۂ اول پر واپس جائیں"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-emerald-700 dark:text-emerald-400" />
              <span>‹ واپس صفحۂ اول (ڈیش بورڈ)</span>
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold font-nastaliq text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500" />
            <span>میری علمی یادداشتیں و حواشی</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-nastaliq mt-1">
            کتب کے مطالعہ اور اے آئی کے ساتھ مباحثہ کے دوران محفوظ کردہ آپ کے ذاتی نوٹس
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>نیا نوٹ درج کریں</span>
        </button>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <form 
          onSubmit={handleSubmit}
          className="rounded-3xl board-jewel-emerald border-2 border-emerald-700/60 p-6 shadow-xl space-y-4 animate-fadeIn text-amber-50"
        >
          <h3 className="text-sm font-black font-nastaliq text-amber-300">
            نئی یادداشت تحریر فرمائیں:
          </h3>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="عنوان (اختیاری، مثلاً: نکتہ برائے اعرابِ فاعل)"
            className="w-full px-3.5 py-2.5 rounded-xl input-jewel text-sm font-nastaliq focus:outline-none placeholder:text-emerald-300/60"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="تفصیلی نوٹ یا عبارت..."
            rows={4}
            className="w-full p-3.5 rounded-xl input-jewel text-sm font-nastaliq focus:outline-none placeholder:text-emerald-300/60 leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 text-xs text-amber-300 hover:text-white font-nastaliq font-bold"
            >
              منسوخ
            </button>
            <button
              type="submit"
              className="btn-3d-gold px-5 py-1.5 rounded-xl text-stone-950 text-xs font-bold font-nastaliq shadow-md"
            >
              محفوظ کریں
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="اپنی یادداشتوں میں تلاش کریں..."
          className="w-full pr-10 pl-4 py-2.5 rounded-xl input-jewel text-xs sm:text-sm font-nastaliq focus:outline-none placeholder:text-emerald-300/60 shadow-inner"
        />
        <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-amber-400" />
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-stone-400 font-nastaliq space-y-2 card-jewel-dark rounded-2xl p-6 border border-emerald-800/50">
            <Bookmark className="w-12 h-12 mx-auto text-amber-400/60" />
            <p className="text-base text-amber-200 font-bold">ابھی تک کوئی یادداشت محفوظ نہیں کی گئی</p>
            <p className="text-xs text-emerald-200/80">کتب خانے یا اے آئی اسسٹنٹ سے کوئی بھی نکتہ یہاں ایک کلک سے محفوظ کر سکتے ہیں</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="card-jewel-dark hover:border-amber-400 rounded-2xl border p-5 shadow-md space-y-3 transition-all text-amber-50"
            >
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                <span className="text-xs font-black text-amber-300 font-nastaliq">
                  {note.title || 'علمی نکتہ'}
                </span>
                <span className="text-[11px] text-emerald-200/80 font-sans">
                  {note.date}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-nastaliq text-emerald-50 whitespace-pre-line leading-loose font-semibold">
                {note.content}
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-emerald-900/60">
                <button
                  onClick={() => copyNote(note.id, note.content)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-amber-300 hover:text-amber-200 hover:bg-emerald-950 font-nastaliq font-bold transition-colors"
                >
                  {copiedId === note.id ? <CheckCheck className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === note.id ? 'کاپی ہو گیا' : 'کاپی'}</span>
                </button>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 font-nastaliq font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
