const AUTH_COOKIE = 'auth_state';

export function getAuthCookie<T = unknown>(): T | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${AUTH_COOKIE}=([^;]+)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return null;
  }
}

export function setAuthCookie(value: unknown) {
  const encoded = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${AUTH_COOKIE}=${encoded}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function removeAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
}
