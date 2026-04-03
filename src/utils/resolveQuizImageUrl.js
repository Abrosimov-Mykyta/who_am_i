/**
 * Build a browser-loadable image URL for quiz PNGs.
 * - API may return a path only: `/quiz-images/...` → prefix REACT_APP_API_URL
 * - Legacy: full URL with localhost → same prefix
 * - http API host on https page → upgrade to https when host matches API
 */
export function resolveQuizImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const apiBase = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');

  if (url.startsWith('/')) {
    if (!apiBase) return url;
    return `${apiBase}${url}`;
  }

  if (!apiBase) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      const path = `${parsed.pathname}${parsed.search}`;
      return `${apiBase}${path}`;
    }
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && parsed.protocol === 'http:') {
      const apiHost = new URL(apiBase).hostname;
      if (parsed.hostname === apiHost) {
        return `https://${parsed.hostname}${parsed.pathname}${parsed.search}`;
      }
    }
  } catch {
    return url;
  }
  return url;
}
