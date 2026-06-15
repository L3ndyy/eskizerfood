const TOKEN_KEY = 'groupOrderToken';
const EXPIRES_KEY = 'groupOrderTokenExpires';

export function setStoredGroupOrderToken(token: string, expiresAt?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  if (expiresAt) {
    localStorage.setItem(EXPIRES_KEY, expiresAt);
  }
}

export function getStoredGroupOrderToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const expires = localStorage.getItem(EXPIRES_KEY);
  if (expires && new Date(expires) < new Date()) {
    clearStoredGroupOrderToken();
    return null;
  }

  return token;
}

export function clearStoredGroupOrderToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function groupOrderHref(path: string, token: string | null | undefined) {
  if (!token) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}groupToken=${encodeURIComponent(token)}`;
}
