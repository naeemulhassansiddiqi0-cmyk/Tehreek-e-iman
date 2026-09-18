export function useParams<T = Record<string, string>>(): T {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const match = path.match(/\/(?:books|book)\/([^/?#]+)/);
    if (match) {
      return { slug: decodeURIComponent(match[1]) } as unknown as T;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const slug = searchParams.get('slug') || searchParams.get('book') || searchParams.get('id');
    if (slug) {
      return { slug } as unknown as T;
    }
  }
  return {} as T;
}

export function useRouter() {
  return {
    push: (url: string) => {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    },
    replace: (url: string) => {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
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
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

export function useSearchParams(): URLSearchParams {
  return typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
}
