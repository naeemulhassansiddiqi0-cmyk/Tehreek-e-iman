import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[350px] p-6 sm:p-10 my-4 flex flex-col items-center justify-center text-center bg-stone-50 border-2 border-emerald-800/30 rounded-3xl shadow-lg space-y-4 text-stone-900" dir="rtl">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shadow-md">
            <AlertTriangle className="w-7 h-7 text-amber-700" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-xl sm:text-2xl font-bold font-nastaliq text-emerald-950">
              {this.props.fallbackTitle || 'صفحہ کی ترتیب میں عارضی رکاوٹ پیش آئی'}
            </h3>
            <p className="text-xs sm:text-sm font-nastaliq text-stone-600 leading-relaxed">
              تحریکِ ایمان ڈیجیٹل پورٹل پر متن کی حفاظت کے پیشِ نظر ایرر باؤنڈری فعال ہو گئی ہے۔ آپ صفحہ کو دوبارہ لوڈ کر سکتے ہیں یا اگلے صفحہ پر جا سکتے ہیں۔
            </p>
          </div>

          {this.state.error?.message && (
            <div className="bg-stone-200/80 px-3 py-1.5 rounded-lg text-[11px] font-mono text-stone-700 max-w-lg overflow-x-auto" dir="ltr">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer shadow-md active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>دوبارہ کوشش فرمائیں</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-gray-300 rounded-xl text-xs font-bold font-nastaliq transition cursor-pointer shadow-xs active:scale-95"
            >
              <Home className="w-3.5 h-3.5 text-stone-600" />
              <span>مرکزی صفحہ پر جائیں</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
