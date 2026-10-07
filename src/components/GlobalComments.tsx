import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  User, 
  X, 
  Globe2, 
  ThumbsUp 
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface SiteComment {
  id: string;
  name: string;
  text: string;
  timestamp: number;
  dateStr?: string;
  page: string;
  likes?: number;
  isCloud?: boolean;
}

export interface GlobalCommentsProps {
  page?: string;
  title?: string;
  floating?: boolean;
  className?: string;
}

export const GlobalComments: React.FC<GlobalCommentsProps> = ({
  page,
  title,
  floating = false,
  className = ''
}) => {
  // Determine page identifier
  const currentPage = useMemo(() => {
    if (page) return page;
    if (typeof window !== 'undefined') return window.location.pathname || '/';
    return '/';
  }, [page]);

  const storageKey = useMemo(() => {
    const clean = currentPage.replace(/[^a-zA-Z0-9_-]/g, '_') || 'home';
    return `site_comments_${clean}`;
  }, [currentPage]);

  // Form states
  const [authorName, setAuthorName] = useState<string>(() => {
    try {
      return localStorage.getItem('site_comment_author_name') || '';
    } catch {
      return '';
    }
  });
  const [commentText, setCommentText] = useState<string>('');
  const [comments, setComments] = useState<SiteComment[]>([]);
  const [isCloudSync, setIsCloudSync] = useState<boolean>(false);
  const [isOpenFloating, setIsOpenFloating] = useState<boolean>(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Admin status
  const [isAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isAdmin') === 'true' || localStorage.getItem('tehreek_admin_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Local storage fallback
  const loadLocalComments = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: SiteComment[] = JSON.parse(raw);
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        setComments(parsed);
      } else {
        const initialSample: SiteComment[] = [
          {
            id: `site_sample_${Date.now()}`,
            name: 'تحریکِ ایمان قاری',
            text: 'ماشاء اللہ! نہایت شاندار اور جامع علمی ڈیجیٹل پورٹل۔ اللہ تعالیٰ حضرت مولانا محمد نعیم الحسن صدیقی کی اس بابرکت کاوش کو قبول فرمائے۔',
            timestamp: Date.now() - 3600000,
            dateStr: new Date().toLocaleDateString('ur-PK', { year: 'numeric', month: 'short', day: 'numeric' }),
            page: currentPage,
            likes: 3,
            isCloud: false
          }
        ];
        setComments(initialSample);
        localStorage.setItem(storageKey, JSON.stringify(initialSample));
      }
    } catch (err) {
      console.warn('Local storage error:', err);
      setComments([]);
    }
  };

  // Realtime Firestore Listener on "site_comments"
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      const q = query(
        collection(db, 'site_comments'),
        where('page', '==', currentPage),
        orderBy('timestamp', 'desc')
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: SiteComment[] = snapshot.docs.map((d) => {
              const data = d.data();
              const ts = data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now());
              const dateObj = new Date(ts);
              const dateStr = dateObj.toLocaleDateString('ur-PK', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) + ' • ' + dateObj.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' });

              return {
                id: d.id,
                name: data.name || 'نامعلوم',
                text: data.text || '',
                timestamp: ts,
                dateStr: data.dateStr || dateStr,
                page: data.page || currentPage,
                likes: data.likes || 0,
                isCloud: true
              };
            });
            setComments(fetched);
            setIsCloudSync(true);
          } else {
            loadLocalComments();
          }
        },
        (err) => {
          console.warn('Firestore site_comments fallback:', err.message);
          setIsCloudSync(false);
          loadLocalComments();
        }
      );
    } catch (err) {
      console.warn('Firestore init site_comments fallback:', err);
      setIsCloudSync(false);
      loadLocalComments();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentPage, storageKey]);

  // Persist author name
  const handleNameChange = (val: string) => {
    setAuthorName(val);
    try {
      localStorage.setItem('site_comment_author_name', val);
    } catch {
      // ignore
    }
  };

  // Submit comment
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = authorName.trim();
    const trimmedText = commentText.trim();

    if (!trimmedName || !trimmedText) {
      alert('براہ کرم اپنا نام اور تبصرہ دونوں درج فرمائیں۔');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('ur-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' • ' + now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' });

    let savedToCloud = false;

    // 1. Try Firestore
    try {
      await addDoc(collection(db, 'site_comments'), {
        name: trimmedName,
        text: trimmedText,
        timestamp: serverTimestamp(),
        dateStr: formattedDate,
        page: currentPage,
        likes: 0
      });
      savedToCloud = true;
      setIsCloudSync(true);
    } catch (err) {
      console.warn('Firestore addDoc fallback:', err);
    }

    // 2. Always maintain localStorage
    const newComment: SiteComment = {
      id: `site_cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      text: trimmedText,
      timestamp: Date.now(),
      dateStr: formattedDate,
      page: currentPage,
      likes: 0,
      isCloud: savedToCloud
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentText('');

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!window.confirm('کیا آپ واقعی یہ تبصرہ حذف کرنا چاہتے ہیں؟')) return;

    try {
      await deleteDoc(doc(db, 'site_comments', commentId));
    } catch (err) {
      console.warn('Firestore delete fallback:', err);
    }

    const filtered = comments.filter(c => c.id !== commentId);
    setComments(filtered);

    try {
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch (err) {
      // ignore
    }
  };

  // Like comment
  const handleLike = (commentId: string) => {
    const isLiked = likedMap[commentId];
    setLikedMap({ ...likedMap, [commentId]: !isLiked });

    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          likes: Math.max(0, (c.likes || 0) + (isLiked ? -1 : 1))
        };
      }
      return c;
    });
    setComments(updated);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-emerald-700 text-white',
      'bg-amber-600 text-white',
      'bg-teal-700 text-white',
      'bg-blue-700 text-white',
      'bg-rose-700 text-white'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const displayTitle = title || (
    floating 
      ? 'اس ویب سائٹ کے بارے میں تبصرہ کریں' 
      : 'علمی تبصرے و آراء'
  );

  // Content render
  const renderCommentContent = () => (
    <div dir="rtl" className="space-y-4 text-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-900/10 dark:border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-nastaliq font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-200">
                {displayTitle} ({comments.length})
              </h4>
              {isCloudSync && (
                <span className="inline-flex items-center gap-1 text-[10px] font-nastaliq text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <Globe2 className="w-3 h-3" />
                  <span>آن لائن</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 font-mono truncate max-w-xs">
              صفحہ: {currentPage}
            </p>
          </div>
        </div>

        {floating && (
          <button
            type="button"
            onClick={() => setIsOpenFloating(false)}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition cursor-pointer"
            title="بند کریں"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="space-y-3 bg-white dark:bg-stone-800/80 p-3 rounded-xl border border-gray-200 dark:border-stone-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
            authorName.trim() ? getAvatarColor(authorName) : 'bg-emerald-600 text-white'
          }`}>
            {authorName.trim() ? authorName.trim().charAt(0) : <User className="w-3.5 h-3.5" />}
          </div>
          <input
            type="text"
            required
            value={authorName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="آپ کا مبارک نام (لازمی)..."
            className="flex-1 bg-stone-50 dark:bg-stone-900/60 border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-xs font-nastaliq text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <textarea
          required
          rows={2}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="اپنا تاثر یا قیمتی تبصرہ تحریر فرمائیں..."
          className="w-full bg-stone-50 dark:bg-stone-900/60 border border-gray-200 dark:border-stone-700 rounded-lg p-2.5 text-xs sm:text-sm font-nastaliq text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600 resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] text-stone-400 font-nastaliq">
            💡 عالمی تبصرہ جات (فائر بیس ریئل ٹائم)
          </span>

          <button
            type="submit"
            disabled={!authorName.trim() || !commentText.trim()}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-nastaliq font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3 h-3 rotate-180" />
            <span>کمنٹ کریں</span>
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="group bg-white dark:bg-stone-800/50 p-3 rounded-xl border border-gray-100 dark:border-stone-800 hover:border-emerald-600/30 transition-all flex gap-3 items-start shadow-2xs"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${getAvatarColor(comment.name)}`}>
              {comment.name.trim().charAt(0)}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-nastaliq font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    {comment.name}
                  </span>
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-[10px] text-stone-500 font-sans">
                    {comment.dateStr}
                  </span>
                </div>

                {(isAdmin || localStorage.getItem('isAdmin') === 'true') && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    title="حذف کریں"
                    className="text-stone-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <p className="font-nastaliq text-xs text-stone-700 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                {comment.text}
              </p>

              <div className="flex items-center gap-3 pt-0.5 text-[11px] text-stone-400">
                <button
                  type="button"
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1 hover:text-emerald-700 transition cursor-pointer ${
                    likedMap[comment.id] ? 'text-emerald-700 font-bold' : ''
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{(comment.likes || 0) > 0 ? comment.likes : ''}</span>
                </button>

                {!isAdmin && localStorage.getItem('isAdmin') !== 'true' && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-60 hover:opacity-100! text-stone-400 hover:text-red-500 text-[10px] font-nastaliq mr-auto transition cursor-pointer"
                  >
                    حذف
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-4 text-stone-400 font-nastaliq text-xs bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-dashed border-gray-200">
            ابھی تک کوئی تبصرہ درج نہیں ہوا۔ آپ پہلا تبصرہ فرمائیں!
          </div>
        )}
      </div>
    </div>
  );

  // 1. FLOATING MODE (Left bottom corner of main homepage)
  if (floating) {
    return (
      <div className={`fixed bottom-3 left-2 sm:bottom-5 sm:left-5 z-40 animate-fadeIn select-none ${className}`}>
        {/* Floating Card Modal Popup - Centered in screen */}
        {isOpenFloating && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpenFloating(false);
            }}
          >
            <div className="w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar bg-white dark:bg-stone-900 rounded-2xl border-2 border-emerald-600/40 shadow-2xl p-4 sm:p-5 animate-scaleUp">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-200 dark:border-stone-700">
                <span className="font-nastaliq font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  تبصرہ جات و آراء
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpenFloating(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {renderCommentContent()}
            </div>
          </div>
        )}

        {/* Floating Trigger Pill - Compact on Mobile */}
        <button
          type="button"
          onClick={() => setIsOpenFloating(prev => !prev)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white shadow-xl hover:shadow-2xl border-2 border-emerald-400/80 transition-all duration-200 active:scale-95 cursor-pointer"
          title="اس ویب سائٹ کے بارے میں تبصرہ کریں"
          aria-label="اس ویب سائٹ کے بارے میں تبصرہ کریں"
        >
          <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
          <span className="font-nastaliq font-bold text-[11px] sm:text-sm">
            <span className="sm:hidden">تبصرہ</span>
            <span className="hidden sm:inline">اس ویب سائٹ کے بارے میں تبصرہ کریں</span>
          </span>
          <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-amber-400 text-stone-950 text-[9px] sm:text-[10px] font-bold">
            {comments.length}
          </span>
        </button>
      </div>
    );
  }

  // 2. INLINE MODE (Below book reader or inside Quran/Bayan pages)
  return (
    <section className={`w-full bg-[#fbfdfa] dark:bg-stone-900/90 border border-emerald-600/30 rounded-2xl p-4 sm:p-5 shadow-xs ${className}`}>
      {renderCommentContent()}
    </section>
  );
};
