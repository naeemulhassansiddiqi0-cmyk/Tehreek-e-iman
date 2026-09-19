import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  ThumbsUp, 
  ShieldCheck, 
  User,
  Globe2
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

export interface CommentItem {
  id: string;
  name: string;
  text: string;
  date: string;
  timestamp: number;
  likes?: number;
  isCloud?: boolean;
}

export interface CommentSectionProps {
  contentId: string;     // Naat file name, URL or Bayan ID (e.g. "naat-Hamd-09" or "bayan-01")
  contentTitle: string;  // Title of the Naat or Bayan
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  contentId,
  contentTitle
}) => {
  // Normalize key to guarantee safe localStorage access
  const storageKey = useMemo(() => {
    const cleanId = (contentId || 'general').replace(/[^a-zA-Z0-9_-]/g, '_');
    return `comments_${cleanId}`;
  }, [contentId]);

  // Form states
  const [authorName, setAuthorName] = useState<string>(() => {
    try {
      return localStorage.getItem('comment_author_name') || '';
    } catch {
      return '';
    }
  });
  const [commentText, setCommentText] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [isCloudSync, setIsCloudSync] = useState<boolean>(false);

  // Admin status: check localStorage.getItem('isAdmin') === 'true'
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isAdmin') === 'true' || localStorage.getItem('tehreek_admin_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Helper to load localStorage comments
  const loadLocalStorageComments = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: CommentItem[] = JSON.parse(raw);
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        setComments(parsed);
      } else {
        const defaultSample: CommentItem[] = [
          {
            id: `sample_${Date.now()}`,
            name: 'تحریکِ ایمان ٹیم',
            text: `ماشاء اللہ! نہایت بابرکت اور ایمان افروز کلام۔ اللہ تعالیٰ شرفِ قبولیت عطا فرمائے اور حضرت مولانا محمد نعیم الحسن صدیقی کو جزائے خیر دے۔ آمین!`,
            date: new Date().toLocaleDateString('ur-PK', { year: 'numeric', month: 'short', day: 'numeric' }),
            timestamp: Date.now() - 3600000,
            likes: 5,
            isCloud: false
          }
        ];
        setComments(defaultSample);
        localStorage.setItem(storageKey, JSON.stringify(defaultSample));
      }
    } catch (err) {
      console.error('LocalStorage load error:', err);
      setComments([]);
    }
  };

  // Realtime Firestore listener with automatic fallback to localStorage
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      const q = query(
        collection(db, 'comments'),
        where('contentId', '==', contentId),
        orderBy('timestamp', 'desc')
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreComments: CommentItem[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              const ts = data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now());
              return {
                id: docSnap.id,
                name: data.name || 'نامعلوم',
                text: data.text || '',
                date: data.date || 'ابھی',
                timestamp: ts,
                likes: data.likes || 0,
                isCloud: true
              };
            });
            setComments(firestoreComments);
            setIsCloudSync(true);
          } else {
            // If cloud collection for this contentId is empty, fallback to local cache
            loadLocalStorageComments();
          }
        },
        (err) => {
          // Firebase dummy key or network offline - fallback gracefully to localStorage
          console.warn('Firestore fallback to localStorage:', err.message);
          setIsCloudSync(false);
          loadLocalStorageComments();
        }
      );
    } catch (err) {
      console.warn('Firestore initialization fallback:', err);
      setIsCloudSync(false);
      loadLocalStorageComments();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [contentId, storageKey]);

  // Persist author name
  const handleNameChange = (val: string) => {
    setAuthorName(val);
    try {
      localStorage.setItem('comment_author_name', val);
    } catch {
      // ignore
    }
  };

  // Submit comment: Try Firestore first, fallback to localStorage
  const handleSubmitComment = async (e?: React.FormEvent) => {
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

    // 1. Try Firebase Firestore
    try {
      await addDoc(collection(db, 'comments'), {
        contentId,
        contentTitle,
        name: trimmedName,
        text: trimmedText,
        date: formattedDate,
        timestamp: serverTimestamp(),
        likes: 0
      });
      savedToCloud = true;
      setIsCloudSync(true);
    } catch (err) {
      console.warn('Could not save comment to Firestore, using localStorage fallback:', err);
    }

    // 2. Always maintain localStorage copy & local state
    const newComment: CommentItem = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      text: trimmedText,
      date: formattedDate,
      timestamp: Date.now(),
      likes: 0,
      isCloud: savedToCloud
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentText('');
    setIsFocused(false);

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving comment to localStorage:', err);
    }
  };

  // Delete comment: Try Firestore first, then localStorage
  const handleDeleteComment = async (commentId: string) => {
    const isConfirmed = window.confirm('کیا آپ واقعی یہ تبصرہ حذف کرنا چاہتے ہیں؟');
    if (!isConfirmed) return;

    // 1. Try Firestore deleteDoc
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (err) {
      console.warn('Firestore delete fallback:', err);
    }

    // 2. Update local state & localStorage
    const filtered = comments.filter(c => c.id !== commentId);
    setComments(filtered);

    try {
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch (err) {
      console.error('Error updating comments in localStorage:', err);
    }
  };

  // Like comment
  const handleToggleLike = (commentId: string) => {
    const isLiked = likedMap[commentId];
    const updatedLiked = { ...likedMap, [commentId]: !isLiked };
    setLikedMap(updatedLiked);

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
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Toggle admin mode for testing convenience
  const handleToggleAdminMode = () => {
    const next = !isAdmin;
    setIsAdmin(next);
    try {
      localStorage.setItem('isAdmin', next ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  // Generate consistent pleasant background colors for user avatars
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-emerald-700 text-white',
      'bg-amber-600 text-white',
      'bg-teal-700 text-white',
      'bg-blue-700 text-white',
      'bg-rose-700 text-white',
      'bg-purple-700 text-white'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <section 
      dir="rtl" 
      className="w-full bg-[#fbfdfa] dark:bg-stone-900/90 border border-emerald-600/30 dark:border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-sm text-stone-800 dark:text-stone-100 transition-all font-sans text-right space-y-5"
    >
      {/* 1. Header: Total Count & Title */}
      <div className="flex items-center justify-between border-b border-emerald-900/10 dark:border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-nastaliq font-bold text-lg sm:text-xl text-emerald-950 dark:text-emerald-200 leading-tight">
                {comments.length} تبصرے
              </h3>
              {isCloudSync && (
                <span className="inline-flex items-center gap-1 text-[10px] font-nastaliq text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                  <Globe2 className="w-3 h-3" />
                  <span>کلاؤڈ آن لائن</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-nastaliq truncate max-w-xs sm:max-w-md">
              کلام / عنوان: <strong className="text-emerald-800 dark:text-amber-300">{contentTitle}</strong>
            </p>
          </div>
        </div>

        {/* Admin Mode Toggle / Status */}
        <button
          type="button"
          onClick={handleToggleAdminMode}
          title="ایڈمن ٹیسٹنگ موڈ سوئچ کریں"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-nastaliq transition cursor-pointer border ${
            isAdmin 
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-400/40 shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-600' : 'text-stone-400'}`} />
          <span>{isAdmin ? 'حالتِ ایڈمن: فعال (حذف ممکن)' : 'ایڈمن موڈ'}</span>
        </button>
      </div>

      {/* 2. YouTube-style Comment Input Box */}
      <form onSubmit={handleSubmitComment} className="space-y-3 bg-white dark:bg-stone-800/80 p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-stone-700/60 shadow-xs focus-within:border-emerald-600 dark:focus-within:border-emerald-500 transition-all">
        {/* Author Name Row */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
            authorName.trim() ? getAvatarColor(authorName) : 'bg-emerald-600 text-white'
          }`}>
            {authorName.trim() ? authorName.trim().charAt(0) : <User className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="آپ کا مبارک نام (لازمی ہے)..."
              className="w-full bg-stone-50 dark:bg-stone-900/60 border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-nastaliq text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Comment Text Area */}
        <div>
          <textarea
            required
            rows={isFocused || commentText.length > 0 ? 3 : 2}
            value={commentText}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="ایک شائستہ اور بابرکت تبصرہ تحریر فرمائیں..."
            className="w-full bg-stone-50 dark:bg-stone-900/60 border border-gray-200 dark:border-stone-700 rounded-lg p-3 text-xs sm:text-sm font-nastaliq text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Action Bar (YouTube Style: Cancel + Submit) */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-stone-500 font-nastaliq">
            💡 ہر تبصرہ فوری طور پر شائع ہو جاتا ہے
          </span>

          <div className="flex items-center gap-2">
            {(isFocused || commentText.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setCommentText('');
                  setIsFocused(false);
                }}
                className="px-3 py-1.5 text-xs font-nastaliq text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg transition cursor-pointer"
              >
                منسوخ
              </button>
            )}

            <button
              type="submit"
              disabled={!authorName.trim() || !commentText.trim()}
              className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:text-stone-500 text-white rounded-xl text-xs sm:text-sm font-nastaliq font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span>کمنٹ کریں</span>
            </button>
          </div>
        </div>
      </form>

      {/* 3. Comments List (Newest First) */}
      <div className="space-y-3 pt-1">
        {comments.map((comment) => {
          const isUserLiked = likedMap[comment.id];
          return (
            <div
              key={comment.id}
              className="group bg-white dark:bg-stone-800/50 p-3.5 sm:p-4 rounded-xl border border-gray-100 dark:border-stone-800/80 hover:border-emerald-600/30 transition-all flex gap-3 sm:gap-4 items-start shadow-2xs"
            >
              {/* User Avatar */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${getAvatarColor(comment.name)}`}>
                {comment.name.trim().charAt(0)}
              </div>

              {/* Comment Content */}
              <div className="flex-1 space-y-1.5">
                {/* Name + Date Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-nastaliq font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      {comment.name}
                    </span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-[11px] font-sans text-stone-600 dark:text-stone-400">
                      {comment.date}
                    </span>
                  </div>

                  {/* Delete Button (Visible if admin OR always for testing with confirm) */}
                  {(isAdmin || localStorage.getItem('isAdmin') === 'true') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="ایڈمن: یہ تبصرہ حذف کریں"
                      className="text-stone-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Comment Text */}
                <p className="font-nastaliq text-xs sm:text-sm text-stone-700 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                  {comment.text}
                </p>

                {/* YouTube Action Buttons: Like, Dislike, Reply */}
                <div className="flex items-center gap-3 pt-1 text-xs text-stone-500 dark:text-stone-400">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(comment.id)}
                    className={`flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer ${
                      isUserLiked ? 'text-emerald-700 dark:text-emerald-400 font-bold' : ''
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUserLiked ? 'fill-current' : ''}`} />
                    <span>{(comment.likes || 0) > 0 ? comment.likes : ''}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCommentText(`@${comment.name} `);
                      setIsFocused(true);
                    }}
                    className="hover:text-emerald-700 dark:hover:text-emerald-400 font-nastaliq transition cursor-pointer text-[11px]"
                  >
                    جواب دیں
                  </button>

                  {/* Delete button fallback for easy testing if admin is not explicitly enabled */}
                  {!isAdmin && localStorage.getItem('isAdmin') !== 'true' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="تبصرہ حذف کریں (تصدیق کے ساتھ)"
                      className="opacity-0 group-hover:opacity-60 hover:opacity-100! text-stone-400 hover:text-red-500 text-[10px] font-nastaliq transition cursor-pointer mr-auto"
                    >
                      حذف
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
          <div className="text-center py-6 text-stone-400 font-nastaliq text-xs bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-dashed border-gray-200 dark:border-stone-800">
            ابھی تک کوئی تبصرہ نہیں ہے۔ آپ سب سے پہلا تبصرہ تحریر فرمائیں!
          </div>
        )}
      </div>
    </section>
  );
};
