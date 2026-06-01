import type { Platform, Tone } from "./mimo";

export interface HistoryItem {
  id: string;
  topic: string;
  platform: Platform;
  tone: Tone | "custom";
  caption: string;
  charCount: number;
  favorite: boolean;
  createdAt: number;
}

const STORAGE_KEY = "aicaption_history";
const MAX_ITEMS = 50;

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(item: Omit<HistoryItem, "id" | "favorite" | "createdAt">): HistoryItem {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    favorite: false,
    createdAt: Date.now(),
  };

  history.unshift(newItem);

  // Remove excess non-favorite items
  if (history.length > MAX_ITEMS) {
    const favorites = history.filter((h) => h.favorite);
    const nonFavorites = history.filter((h) => !h.favorite).slice(0, MAX_ITEMS - favorites.length);
    const trimmed = [...favorites, ...nonFavorites].sort((a, b) => b.createdAt - a.createdAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  return newItem;
}

export function toggleFavorite(id: string): HistoryItem | null {
  const history = getHistory();
  const item = history.find((h) => h.id === id);
  if (item) {
    item.favorite = !item.favorite;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
  return item || null;
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(keepFavorites = true): void {
  if (keepFavorites) {
    const favorites = getHistory().filter((h) => h.favorite);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
