import { ref } from "vue";
import { api } from "@/api/client";
import type { Playlist, Track } from "@/api/types";

export interface PlaylistPreviewState {
  loading: boolean;
  tracks: Track[];
  error?: string | null;
}

const previewCache = new Map<string, Track[]>();
const previews = ref<Record<string, PlaylistPreviewState>>({});
let hoverTimer: ReturnType<typeof setTimeout> | undefined;

function playlistKey(pl: Playlist): string {
  return `${pl.owner_uid ?? 0}:${pl.kind}`;
}

export function usePlaylistPreview() {
  function getPreview(pl: Playlist): Track[] | undefined {
    const key = playlistKey(pl);
    return previews.value[key]?.tracks || previewCache.get(key);
  }

  function isPreviewLoading(pl: Playlist): boolean {
    const key = playlistKey(pl);
    return Boolean(previews.value[key]?.loading);
  }

  async function fetchPreview(pl: Playlist): Promise<Track[]> {
    const key = playlistKey(pl);
    if (previewCache.has(key)) {
      const cached = previewCache.get(key)!;
      previews.value[key] = { loading: false, tracks: cached, error: null };
      return cached;
    }

    previews.value[key] = {
      loading: true,
      tracks: previews.value[key]?.tracks || [],
      error: null,
    };

    try {
      const trailer = await api.trailer("playlist", String(pl.kind), pl.owner_uid);
      const tracks = trailer?.tracks || [];
      previewCache.set(key, tracks);
      previews.value[key] = { loading: false, tracks, error: null };
      return tracks;
    } catch (err: unknown) {
      previews.value[key] = {
        loading: false,
        tracks: [],
        error: err instanceof Error ? err.message : "Failed to load preview",
      };
      return [];
    }
  }

  function scheduleHoverPreview(pl: Playlist, delay = 350) {
    cancelHoverPreview();
    const key = playlistKey(pl);
    if (previewCache.has(key)) {
      void fetchPreview(pl);
      return;
    }
    hoverTimer = setTimeout(() => {
      void fetchPreview(pl);
    }, delay);
  }

  function cancelHoverPreview() {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = undefined;
    }
  }

  return {
    previews,
    getPreview,
    isPreviewLoading,
    fetchPreview,
    scheduleHoverPreview,
    cancelHoverPreview,
  };
}
