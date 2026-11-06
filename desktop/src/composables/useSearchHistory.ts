import { ref } from "vue";

export interface SearchHistoryItem {
  query: string;
  pinned?: boolean;
  timestamp?: number;
}

const STORAGE_KEY = "mashiro:search_history";
const MAX_ITEMS = 20;

function sortHistory(items: SearchHistoryItem[]): SearchHistoryItem[] {
  return [...items].sort((a, b) => {
    const aPin = Boolean(a.pinned);
    const bPin = Boolean(b.pinned);
    if (aPin !== bPin) return aPin ? -1 : 1;
    return (b.timestamp || 0) - (a.timestamp || 0);
  });
}

function loadHistory(): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const items: SearchHistoryItem[] = [];
      for (const item of parsed) {
        if (typeof item === "string") {
          const q = item.trim();
          if (q) items.push({ query: q, pinned: false, timestamp: Date.now() });
        } else if (item && typeof item === "object" && typeof item.query === "string") {
          const q = item.query.trim();
          if (q) {
            items.push({
              query: q,
              pinned: Boolean(item.pinned),
              timestamp: typeof item.timestamp === "number" ? item.timestamp : Date.now(),
            });
          }
        }
      }
      return sortHistory(items).slice(0, MAX_ITEMS);
    }
  } catch {}
  return [];
}

function persistHistory(items: SearchHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

const historyState = ref<SearchHistoryItem[]>(loadHistory());

export function useSearchHistory() {
  function add(query: string) {
    const q = query.trim();
    if (!q || q.length < 2) return;

    const lower = q.toLowerCase();
    const existing = historyState.value.find((i) => i.query.toLowerCase() === lower);
    const filtered = historyState.value.filter((i) => i.query.toLowerCase() !== lower);

    const newItem: SearchHistoryItem = {
      query: q,
      pinned: existing ? Boolean(existing.pinned) : false,
      timestamp: Date.now(),
    };

    const updated = sortHistory([newItem, ...filtered]).slice(0, MAX_ITEMS);
    historyState.value = updated;
    persistHistory(updated);
  }

  function togglePin(query: string) {
    const lower = query.toLowerCase();
    const target = historyState.value.find((i) => i.query.toLowerCase() === lower);
    if (!target) return;

    target.pinned = !target.pinned;
    target.timestamp = Date.now();
    const updated = sortHistory(historyState.value);
    historyState.value = updated;
    persistHistory(updated);
  }

  function rename(oldQuery: string, newQuery: string) {
    const next = newQuery.trim();
    if (!next) return;

    const lower = oldQuery.toLowerCase();
    const target = historyState.value.find((i) => i.query.toLowerCase() === lower);
    if (!target) return;

    target.query = next;
    target.timestamp = Date.now();
    persistHistory(historyState.value);
  }

  function remove(query: string) {
    const lower = query.toLowerCase();
    const updated = historyState.value.filter((i) => i.query.toLowerCase() !== lower);
    historyState.value = updated;
    persistHistory(updated);
  }

  function clear(onlyUnpinned = true) {
    const updated = onlyUnpinned
      ? historyState.value.filter((i) => Boolean(i.pinned))
      : [];
    historyState.value = updated;
    persistHistory(updated);
  }

  return {
    history: historyState,
    add,
    togglePin,
    rename,
    remove,
    clear,
  };
}
