import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Clip } from "@/api/types";
import { usePlayerStore } from "@/stores/player/index";

export const useVideoStore = defineStore("video", () => {
  const isOpen = ref(false);
  const clip = ref<Clip | null>(null);
  const playlist = ref<Clip[]>([]);
  const currentIndex = ref(0);

  const isPlaying = ref(false);
  const volume = ref(1);
  const muted = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const isFullscreen = ref(false);
  const isLoading = ref(false);

  /** Была ли запущена аудиодорожка до открытия видео (для возобновления при закрытии) */
  let _wasAudioPlaying = false;

  const hasPrev = computed(() => currentIndex.value > 0);
  const hasNext = computed(() => currentIndex.value < playlist.value.length - 1);

  function open(targetClip: Clip, clips: Clip[] = [], index = 0) {
    const player = usePlayerStore();
    _wasAudioPlaying = player.isPlaying;
    if (player.isPlaying) {
      player.pause();
    }

    playlist.value = clips.length ? clips : [targetClip];
    currentIndex.value = index;
    clip.value = playlist.value[currentIndex.value] ?? targetClip;
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    isLoading.value = true;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    isPlaying.value = false;
    isFullscreen.value = false;
    clip.value = null;

    if (_wasAudioPlaying) {
      const player = usePlayerStore();
      void player.toggle();
      _wasAudioPlaying = false;
    }
  }

  function prev() {
    if (!hasPrev.value) return;
    currentIndex.value--;
    clip.value = playlist.value[currentIndex.value] ?? null;
    currentTime.value = 0;
    duration.value = 0;
    isLoading.value = true;
  }

  function next() {
    if (!hasNext.value) return;
    currentIndex.value++;
    clip.value = playlist.value[currentIndex.value] ?? null;
    currentTime.value = 0;
    duration.value = 0;
    isLoading.value = true;
  }

  function setPlaying(val: boolean) {
    isPlaying.value = val;
  }

  function setVolume(val: number) {
    volume.value = Math.max(0, Math.min(1, val));
  }

  function toggleMute() {
    muted.value = !muted.value;
  }

  function setCurrentTime(val: number) {
    currentTime.value = val;
  }

  function setDuration(val: number) {
    duration.value = val;
  }

  function setFullscreen(val: boolean) {
    isFullscreen.value = val;
  }

  function setLoading(val: boolean) {
    isLoading.value = val;
  }

  return {
    isOpen,
    clip,
    playlist,
    currentIndex,
    isPlaying,
    volume,
    muted,
    currentTime,
    duration,
    isFullscreen,
    isLoading,
    hasPrev,
    hasNext,
    open,
    close,
    prev,
    next,
    setPlaying,
    setVolume,
    toggleMute,
    setCurrentTime,
    setDuration,
    setFullscreen,
    setLoading,
  };
});
