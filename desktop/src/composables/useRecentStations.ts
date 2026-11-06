import { ref } from "vue";

export interface RecentStationItem {
  station: string;
  title: string;
  icon?: string;
  gradient?: string;
  timestamp: number;
}

const STORAGE_KEY = "mashiro:recent_stations";
const MAX_RECENT = 8;

function loadRecent(): RecentStationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((i): i is RecentStationItem => Boolean(i && i.station && i.title));
    }
  } catch {}
  return [];
}

function persistRecent(items: RecentStationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

const recentStationsState = ref<RecentStationItem[]>(loadRecent());

export function useRecentStations() {
  function recordStation(station: string, title: string, icon?: string, gradient?: string) {
    if (!station) return;
    const filtered = recentStationsState.value.filter((i) => i.station !== station);
    const updated = [
      {
        station,
        title,
        icon: icon || "mingcute:wave-line",
        gradient: gradient || "linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)",
        timestamp: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_RECENT);
    recentStationsState.value = updated;
    persistRecent(updated);
  }

  function clearRecent() {
    recentStationsState.value = [];
    persistRecent([]);
  }

  return {
    recentStations: recentStationsState,
    recordStation,
    clearRecent,
  };
}
