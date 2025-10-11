export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000/api';

export function apiUrl(path: string): string {
  // Ensure single slash joining
  if (!path.startsWith('/')) path = `/${path}`;
  return `${API_BASE_URL}${path}`;
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), init);
}
