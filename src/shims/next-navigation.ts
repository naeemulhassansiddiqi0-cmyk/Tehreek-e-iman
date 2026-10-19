import { useState, useEffect } from 'react';

export function getParams<T = Record<string, string>>(): T {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const match = path.match(/\/(?:books|book)\/([^/?#]+)/i);
    if (match && match[1]) {
      return { slug: decodeURIComponent(match[1]).trim() } as unknown as T;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const slug = searchParams.get('slug') || searchParams.get('book') || searchParams.get('id');
    if (slug) {
      return { slug: decodeURIComponent(slug).trim() } as unknown as T;
    }
  }
  return {} as T;
}

export function useParams<T = Record<string, string>>(): T {
  const [params, setParams] = useState<T>(getParams);

  useEffect(() => {
    const sync = () => setParams(getParams<T>());
    window.addEventListener('popstate', sync);
    window.addEventListener('tehreek:navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('tehreek:navigate', sync);
    };
  }, []);

  return params;
}

export function useRouter() {
  return {
    push: (url: string) => {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.dispatchEvent(new CustomEvent('tehreek:navigate', { detail: { url } }));
      }
    },
    replace: (url: string) => {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.dispatchEvent(new CustomEvent('tehreek:navigate', { detail: { url } }));
      }
    },
    back: () => {
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    }
  };
}

export function usePathname(): string {
  const [pathname, setPathname] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  useEffect(() => {
    const sync = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('tehreek:navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('tehreek:navigate', sync);
    };
  }, []);

  return pathname;
}

export function useSearchParams(): URLSearchParams {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    return typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  });

  useEffect(() => {
    const sync = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('tehreek:navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('tehreek:navigate', sync);
    };
  }, []);

  return searchParams;
}
