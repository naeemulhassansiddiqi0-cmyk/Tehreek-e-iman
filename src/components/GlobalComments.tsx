import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  User, 
  X, 
  Globe2, 
  ThumbsUp,
  Share2,
  Check,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Award,
  BookMarked
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

export type UserRole = 'طالبِ علم' | 'عالمِ دین / فاضل' | 'عام قاری';
export type CommentType = 'علمی فائدہ / حاشیہ' | 'درسی سوال / اشکال' | 'تاثرات';

export interface SiteComment {
  id: string;
  name: string;
  role?: UserRole;
  commentType?: CommentType;
  text: string;
  timestamp: number;
  dateStr?: string;
  page: string;
  bookTitle?: string;
  pageNumber?: number;
  bookUrl?: string;
  likes?: number;
  isCloud?: boolean;
  isVerified?: boolean;
  status?: 'verified' | 'pending' | 'rejected';
}

export interface GlobalCommentsProps {
  page?: string;
  title?: string;
  bookTitle?: string;
  pageNumber?: number;
  bookUrl?: string;
  floating?: boolean;
  className?: string;
}

const ROLES: { id: UserRole; label: string; icon: any; color: string }[] = [
  { id: 'طالبِ علم', label: 'طالبِ علم', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 'عالمِ دین / فاضل', label: 'عالمِ دین / فاضل', icon: Award, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'عام قاری', label: 'عام قاری', icon: User, color: 'bg-stone-50 text-stone-700 border-stone-200' },
];

const COMMENT_TYPES: { id: CommentType; label: string; icon: any; color: string }[] = [
  { id: 'علمی فائدہ / حاشیہ', label: 'علمی فائدہ / حاشیہ', icon: BookMarked, color: 'bg-amber-50 text-amber-900 border-amber-300' },
  { id: 'درسی سوال / اشکال', label: 'درسی سوال / اشکال', icon: MessageSquare, color: 'bg-rose-50 text-rose-900 border-rose-300' },
  { id: 'تاثرات', label: 'تاثرات', icon: BookOpen, color: 'bg-teal-50 text-teal-900 border-teal-300' },
];

export const GlobalComments: React.FC<GlobalCommentsProps> = ({
  page,
  title,
  bookTitle,
  pageNumber,
  bookUrl,
  floating = false,
  className = ''
}) => {
  // Determine page identifier
  const currentPage = useMemo(() => {
    if (page) return page;
    if (typeof window !== 'undefined') return window.location.pathname + window.location.search || '/';
    return '/';
  }, [page]);

  // Derive contextual book title & page number from URL if not explicitly provided
  const contextBook = useMemo(() => {
    if (bookTitle) {
      return {
        title: bookTitle,
        page: pageNumber || 1,
        url: bookUrl || currentPage
      };
    }
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const match = path.match(/\/(?:books|book)\/([^/?#]+)/i);
      if (match && match[1]) {
        const rawSlug = decodeURIComponent(match[1]);
        const sParams = new URLSearchParams(window.location.search);
        const p = parseInt(sParams.get('page') || sParams.get('p') || '1', 10) || 1;
        const prettyTitle = rawSlug.replace(/[-_]/g, ' ');
        return {
          title: prettyTitle,
          page: p,
          url: `/books/${rawSlug}?page=${p}`
        };
      }
    }
    return null;
  }, [bookTitle, pageNumber, bookUrl, currentPage]);

  const storageKey = useMemo(() => {
    const clean = currentPage.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50) || 'home';
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

  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem('site_comment_role') as UserRole) || 'طالبِ علم';
    } catch {
      return 'طالبِ علم';
    }
  });

  const [selectedType, setSelectedType] = useState<CommentType>('علمی فائدہ / حاشیہ');
  const [commentText, setCommentText] = useState<string>('');
  const [comments, setComments] = useState<SiteComment[]>([]);
  const [isCloudSync, setIsCloudSync] = useState<boolean>(false);
  const [isOpenFloating, setIsOpenFloating] = useState<boolean>(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('site_comment_likes_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        const sampleDate = new Date().toLocaleDateString('ur-PK', { year: 'numeric', month: 'short', day: 'numeric' });
        const initialSample: SiteComment[] = [
          {
            id: `site_sample_${Date.now()}`,
            name: 'حضرت مولانا محمد نعیم الحسن صدیقی',
            role: 'عالمِ دین / فاضل',
            commentType: 'علمی فائدہ / حاشیہ',
            text: 'ماشاء اللہ! تمام کتب کاپی رائٹ سے آزاد اور مستند مراجع پر مبنی ہیں۔ طلبہ و اساتذہ کے لیے درس و تدریس کا بہترین اور بابرکت پلیٹ فارم ہے۔',
            timestamp: Date.now() - 3600000,
            dateStr: sampleDate,
            page: currentPage,
            bookTitle: contextBook?.title || 'تحریکِ ایمان',
            pageNumber: contextBook?.page || 1,
            bookUrl: contextBook?.url || currentPage,
            likes: 12,
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
                role: data.role || 'طالبِ علم',
                commentType: data.commentType || 'تاثرات',
                text: data.text || '',
                timestamp: ts,
                dateStr: data.dateStr || dateStr,
                page: data.page || currentPage,
                bookTitle: data.bookTitle,
                pageNumber: data.pageNumber,
                bookUrl: data.bookUrl,
                likes: data.likes || 0,
                isCloud: true,
                isVerified: Boolean(data.isVerified || data.status === 'verified'),
                status: data.status || (data.isVerified ? 'verified' : 'pending')
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

  // Persist author name and role
  const handleNameChange = (val: string) => {
    setAuthorName(val);
    try {
      localStorage.setItem('site_comment_author_name', val);
    } catch {}
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    try {
      localStorage.setItem('site_comment_role', role);
    } catch {}
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
        role: selectedRole,
        commentType: selectedType,
        text: trimmedText,
        timestamp: serverTimestamp(),
        dateStr: formattedDate,
        page: currentPage,
        bookTitle: contextBook?.title || null,
        pageNumber: contextBook?.page || null,
        bookUrl: contextBook?.url || currentPage,
        likes: 0
      });
      savedToCloud = true;
      setIsCloudSync(true);
    } catch (err) {
      console.warn('Firestore addDoc fallback:', err);
    }

    // 2. Always maintain instant localStorage
    const newComment: SiteComment = {
      id: `site_cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      role: selectedRole,
      commentType: selectedType,
      text: trimmedText,
      timestamp: Date.now(),
      dateStr: formattedDate,
      page: currentPage,
      bookTitle: contextBook?.title,
      pageNumber: contextBook?.page,
      bookUrl: contextBook?.url || currentPage,
      likes: 0,
      isCloud: savedToCloud,
      isVerified: false,
      status: 'pending'
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
    } catch {}
  };

  // Like comment
  const handleLike = (commentId: string) => {
    const isLiked = likedMap[commentId];
    const newMap = { ...likedMap, [commentId]: !isLiked };
    setLikedMap(newMap);
    try {
      localStorage.setItem('site_comment_likes_map', JSON.stringify(newMap));
    } catch {}

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
    } catch {}
  };

  // Share comment link
  const handleShare = (comment: SiteComment) => {
    const shareUrl = comment.bookUrl ? `${window.location.origin}${comment.bookUrl}` : window.location.href;
    const shareText = `【${comment.commentType || 'علمی تبصرہ'}】\n${comment.name} (${comment.role || 'قاری'}):\n"${comment.text}"\n\n📚 حوالہ: ${comment.bookTitle || 'تحریکِ ایمان'} (صفحہ ${comment.pageNumber || 1})\n🌐 لنک: ${shareUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedId(comment.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const navigateToBookPage = (targetUrl?: string) => {
    if (!targetUrl || typeof window === 'undefined') return;
    window.history.pushState({}, '', targetUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.dispatchEvent(new CustomEvent('tehreek:navigate', { detail: { url: targetUrl } }));
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-emerald-700 text-white',
      'bg-amber-600 text-white',
      'bg-teal-700 text-white',
      'bg-indigo-700 text-white',
      'bg-rose-700 text-white'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const displayTitle = title || (
    floating 
      ? 'اس ویب سائٹ کے بارے میں تبصرہ کریں' 
      : 'علمی تبصرے، درسی سوالات و اشکالات'
  );

  // Content render
  const renderCommentContent = () => (
    <div dir="rtl" className="space-y-4 text-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-900/10 dark:border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-nastaliq font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-200">
                {displayTitle} ({comments.length})
              </h4>
              {isCloudSync && (
                <span className="inline-flex items-center gap-1 text-[10px] font-nastaliq text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Globe2 className="w-3 h-3" />
                  <span>آن لائن ریئل ٹائم</span>
                </span>
              )}
            </div>
            {contextBook && (
              <p className="text-[11px] text-emerald-900/80 font-nastaliq flex items-center gap-1 mt-0.5">
                <span>📚 کتاب: <strong>{contextBook.title}</strong></span>
                <span>•</span>
                <span>صفحہ نمبر: <strong>{contextBook.page.toLocaleString('ur-PK')}</strong></span>
              </p>
            )}
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
      <form onSubmit={handleSubmit} className="space-y-3 bg-white dark:bg-stone-800/80 p-3.5 sm:p-4 rounded-2xl border border-gray-200 dark:border-stone-700 shadow-sm">
        
        {/* Row 1: Author Name Input */}
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
            className="flex-1 bg-stone-50 dark:bg-stone-900/60 border border-gray-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-nastaliq text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </div>

        {/* Row 2: Role Selection Pills (طالبِ علم / عالمِ دین / عام قاری) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-nastaliq text-stone-600 dark:text-stone-300 font-bold">
            <span>آپ کا علمی منصب (Role):</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ROLES.map(r => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-600/30'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Comment Type Pills (علمی فائدہ / درسی سوال / تاثرات) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-nastaliq text-stone-600 dark:text-stone-300 font-bold">
            <span>تبصرے کی نوعیت (Category):</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {COMMENT_TYPES.map(t => {
              const Icon = t.icon;
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-nastaliq font-bold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm ring-2 ring-amber-500/30'
                      : 'bg-stone-50 hover:bg-amber-50 text-stone-700 border-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Comment Textarea */}
        <textarea
          required
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="اپنا علمی نکتہ، حاشیہ، درسی اشکال یا تاثر تحریر فرمائیں..."
          className="w-full bg-stone-50 dark:bg-stone-900/60 border border-gray-200 dark:border-stone-700 rounded-xl p-3 text-xs sm:text-sm font-nastaliq text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 resize-y min-h-[75px] leading-relaxed"
        />

        {/* Row 5: Submit Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-stone-700/60">
          <span className="text-[10px] text-stone-400 font-nastaliq text-right self-start sm:self-auto">
            💡 تبصرہ خودکار محفوظ ہو کر تمام طلباء و علماء کو نظر آئے گا
          </span>

          <button
            type="submit"
            disabled={!authorName.trim() || !commentText.trim()}
            className="w-full sm:w-auto px-6 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white disabled:text-stone-500 rounded-xl text-xs font-nastaliq font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer disabled:cursor-not-allowed border border-emerald-700 disabled:border-transparent"
          >
            <Send className="w-3.5 h-3.5 rotate-180" />
            <span>تبصرہ ارسال کریں</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
        {comments.map((comment) => {
          const cName = comment?.name || 'قاری';
          return (
          <div
            key={comment.id}
            className="group bg-white dark:bg-stone-800/60 p-4 rounded-2xl border border-gray-100 dark:border-stone-800 hover:border-emerald-600/40 transition-all flex gap-3.5 items-start shadow-2xs"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${getAvatarColor(cName)}`}>
              {cName.trim().charAt(0) || 'ق'}
            </div>

            <div className="flex-1 space-y-2">
              {/* Header with Name, Role, Type Badge, and Date */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-gray-100 dark:border-stone-700/40 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-nastaliq font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    {cName}
                  </span>

                  {/* Role Pill Badge */}
                  {comment.role && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-nastaliq font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200">
                      <GraduationCap className="w-3 h-3 text-indigo-700" />
                      <span>{comment.role}</span>
                    </span>
                  )}

                  {/* Comment Type Badge */}
                  {comment.commentType && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-nastaliq font-bold px-2 py-0.5 rounded-md border ${
                      comment.commentType.includes('سوال')
                        ? 'bg-rose-50 text-rose-900 border-rose-200'
                        : comment.commentType.includes('فائدہ')
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-teal-50 text-teal-900 border-teal-200'
                    }`}>
                      <span>{comment.commentType}</span>
                    </span>
                  )}

                  {/* Verification Status Badge */}
                  {comment.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-nastaliq font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>مصدقہ علمی رائے</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-nastaliq font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                      <span>زیرِ تصدیق (Pending Review)</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-sans">
                    {comment.dateStr}
                  </span>

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
              </div>

              {/* Auto-attached Book Title & Page badge with Clickable Link */}
              {(comment.bookTitle || comment.pageNumber) && (
                <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700/60 rounded-xl px-2.5 py-1 text-[11px] font-nastaliq">
                  <span className="text-stone-700 dark:text-stone-300 font-bold flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-600" />
                    <span>📚 {comment.bookTitle || 'کتاب'}</span>
                    <span>•</span>
                    <span>صفحہ {comment.pageNumber ? Number(comment.pageNumber).toLocaleString('ur-PK') : '۱'}</span>
                  </span>

                  {comment.bookUrl && (
                    <button
                      type="button"
                      onClick={() => navigateToBookPage(comment.bookUrl)}
                      className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      <span>[اس صفحے پر جائیں]</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Comment Text */}
              <p className="font-nastaliq text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed select-text pr-1">
                {comment.text}
              </p>

              {/* Action Buttons: Like, Share, Delete */}
              <div className="flex items-center justify-between pt-1 text-xs text-stone-500 border-t border-gray-50 dark:border-stone-700/30">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition cursor-pointer ${
                      likedMap[comment.id]
                        ? 'text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold'
                        : 'hover:text-emerald-800 hover:bg-stone-50'
                    }`}
                    title="پسند فرمائیں"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedMap[comment.id] ? 'fill-emerald-700 text-emerald-700' : ''}`} />
                    <span className="font-nastaliq text-[11px]">
                      {(comment.likes || 0) > 0 ? `${comment.likes} پسند` : 'پسند'}
                    </span>
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={() => handleShare(comment)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-stone-600 hover:text-emerald-800 hover:bg-stone-50 transition cursor-pointer"
                    title="تبصرہ مع حوالہ کاپی کریں"
                  >
                    {copiedId === comment.id ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span className="font-nastaliq text-[11px]">
                      {copiedId === comment.id ? 'کاپی ہو گیا' : 'شیئر'}
                    </span>
                  </button>
                </div>

                {!isAdmin && localStorage.getItem('isAdmin') !== 'true' && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-60 hover:opacity-100! text-stone-400 hover:text-red-500 text-[10px] font-nastaliq transition cursor-pointer"
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
          <div className="text-center py-8 text-stone-400 font-nastaliq text-xs sm:text-sm bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-dashed border-gray-200 space-y-1">
            <p>ابھی تک کوئی تبصرہ یا علمی سوال درج نہیں ہوا۔</p>
            <p className="text-stone-500 font-bold">آپ پہلا مبارک تبصرہ یا اشکال درج فرمائیں!</p>
          </div>
        )}
      </div>
    </div>
  );

  if (floating) {
    if (!isOpenFloating) return null;
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-[4px] z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpenFloating(false);
        }}
      >
        <div className="relative w-full max-w-lg max-h-[92vh] bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-stone-800 rounded-3xl shadow-2xl p-4 sm:p-6 overflow-y-auto">
          <div className="flex justify-end pb-2">
            <button
              type="button"
              onClick={() => setIsOpenFloating(false)}
              className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 transition"
              title="بند کریں"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {renderCommentContent()}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-stone-50/70 dark:bg-stone-900/70 border border-gray-200/80 dark:border-stone-800 rounded-3xl p-4 sm:p-7 shadow-xs ${className}`}>
      {renderCommentContent()}
    </div>
  );
};
export default GlobalComments;
