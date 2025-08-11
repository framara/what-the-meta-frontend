import { useEffect } from 'react';

type SEOProps = {
  title: string;
  description: string;
  keywords?: string[] | string;
  image?: string; // absolute or root-relative
  canonicalUrl?: string; // override canonical (absolute or root-relative)
  ogType?: string; // e.g. 'website' | 'article'
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  structuredData?: Record<string, any> | Array<Record<string, any>>; // JSON-LD object(s)
};

// SEO helper for SPA routes: updates title, description, social tags, canonical, and JSON-LD.
export default function SEO({
  title,
  description,
  keywords,
  image,
  canonicalUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Utilities
    const ensureMeta = (selector: string, create: () => HTMLElement) => {
      let el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el as HTMLElement;
    };

    // Meta description
    const desc = ensureMeta('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    desc.setAttribute('content', description);

    // Keywords
    const kw = ensureMeta('meta[name="keywords"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'keywords');
      return m;
    });
    if (keywords && (Array.isArray(keywords) ? keywords.length : String(keywords).trim().length)) {
      kw.setAttribute('content', Array.isArray(keywords) ? keywords.join(', ') : String(keywords));
    }

    // Robots
    const robots = ensureMeta('meta[name="robots"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'robots');
      return m;
    });
    robots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph / Twitter helpers
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
    setMeta('og:type', ogType);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:card', twitterCard);

    // Canonical + URL + images
    try {
      const toAbs = (src?: string) => {
        if (!src) return undefined;
        if (/^https?:\/\//i.test(src)) return src;
        if (src.startsWith('/')) return window.location.origin + src;
        return window.location.origin + '/' + src.replace(/^\.+\//, '');
      };

      const currentHref = window.location.origin + window.location.pathname + window.location.search;
      const href = toAbs(canonicalUrl) || currentHref;

      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', href);

      setMeta('og:url', href);
      setMeta('twitter:url', href);

      const absImage = toAbs(image) || toAbs('/og-image.jpg');
      if (absImage) {
        setMeta('og:image', absImage);
        setMeta('twitter:image', absImage);
      }
    } catch (_) {
      // noop
    }

    // JSON-LD structured data: remove previous ones we injected, then add new
    document.querySelectorAll('script[data-seo-ld]')?.forEach((n) => n.parentElement?.removeChild(n));
    const addLd = (obj: Record<string, any>) => {
      try {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-ld', 'true');
        script.text = JSON.stringify(obj);
        document.head.appendChild(script);
      } catch {}
    };
    if (structuredData) {
      const list = Array.isArray(structuredData) ? structuredData : [structuredData];
      list.filter(Boolean).forEach(addLd);
    }

    return () => {
      document.querySelectorAll('script[data-seo-ld]')?.forEach((n) => n.parentElement?.removeChild(n));
    };
  }, [title, description, keywords, image, canonicalUrl, ogType, twitterCard, noindex, structuredData]);

  return null;
}
