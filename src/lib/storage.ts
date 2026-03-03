// API key persistence — localStorage only, never leaves the browser

const API_KEY_KEY = 'chess_mentor_api_key';

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_KEY) ?? '';
}

export function setApiKey(key: string): void {
  if (key) {
    localStorage.setItem(API_KEY_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_KEY);
  }
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_KEY);
}

export function hasApiKey(): boolean {
  return !!localStorage.getItem(API_KEY_KEY);
}
