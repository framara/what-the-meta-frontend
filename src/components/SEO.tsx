import { useEffect } from 'react';

type SEOProps = {
  title: string;
  description: string;
};

// Lightweight SEO helper for SPA routes: updates title, description, and social tags.
export default function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Description
    const ensureMeta = (selector: string, create: () => HTMLElement) => {
      let el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el as HTMLElement;
    };

    const desc = ensureMeta('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    desc.setAttribute('content', description);

    // OpenGraph/Twitter
    const setMeta = (prop: string, content: string) => {
      const sel = `meta[property="${prop}"]`;
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    // Canonical safety: keep in sync with current URL
    try {
      const href = window.location.origin + window.location.pathname + window.location.search;
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', href);
    } catch (_) {
      // noop
    }
  }, [title, description]);

  return null;
}
