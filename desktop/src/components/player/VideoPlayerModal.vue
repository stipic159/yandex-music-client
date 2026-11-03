<template>
  <Teleport to="body">
    <Transition name="video-modal">
      <div
        v-if="videoStore.isOpen"
        class="video-modal-overlay"
        @click.self="handleOverlayClick"
      >
        <div
          ref="containerRef"
          class="video-modal-container"
          @mousemove="showControls"
          @mouseleave="scheduleHide"
        >
          <!-- Video element (Direct HLS / MP4 native player) -->
          <video
            ref="videoRef"
            class="video-el"
            playsinline
            :volume="videoStore.volume"
            :muted="videoStore.muted"
            @play="onPlay"
            @pause="onPause"
            @timeupdate="onTimeUpdate"
            @durationchange="onDurationChange"
            @waiting="videoStore.setLoading(true)"
            @canplay="videoStore.setLoading(false)"
            @ended="onEnded"
            @error="onError"
          />

          <!-- Loading spinner -->
          <div v-if="videoStore.isLoading" class="video-spinner">
            <q-spinner size="48px" color="white" />
          </div>

          <!-- Error state fallback -->
          <div v-if="hasError && !videoStore.isLoading" class="video-error-state">
            <Icon name="mingcute:video-line" :size="48" class="text-white/40 mb-3" />
            <div class="text-white text-base font-medium">Не удалось загрузить видеопоток</div>
            <div class="text-white/60 text-xs mt-1 mb-4">Попробуйте открыть видео в отдельном окне или браузере</div>
            <div class="flex gap-2">
              <button
                v-if="videoStore.clip?.embed_url"
                class="ctrl-btn-pill"
                @click="openInWindow"
              >
                <Icon name="mingcute:external-link-line" :size="16" class="mr-1.5" />
                В отдельном окне
              </button>
              <button
                v-if="videoStore.clip?.embed_url"
                class="ctrl-btn-pill"
                @click="openInBrowser"
              >
                <Icon name="mingcute:earth-2-line" :size="16" class="mr-1.5" />
                В браузере
              </button>
            </div>
          </div>

          <!-- Controls overlay -->
          <Transition name="controls-fade">
            <div v-show="controlsVisible" class="controls-overlay">
              <!-- Top bar -->
              <div class="controls-top pointer-events-auto">
                <div class="clip-info">
                  <div class="clip-title">{{ videoStore.clip?.title }}</div>
                  <div class="clip-artists">
                    {{ artistNames }}
                  </div>
                </div>
                <div class="flex items-center gap-[8px]">
                  <button
                    v-if="videoStore.clip?.embed_url"
                    class="ctrl-btn"
                    title="В отдельном окне"
                    @click="openInWindow"
                  >
                    <Icon name="mingcute:external-link-line" :size="18" />
                  </button>
                  <button
                    v-if="videoStore.clip?.embed_url"
                    class="ctrl-btn"
                    title="В браузере"
                    @click="openInBrowser"
                  >
                    <Icon name="mingcute:earth-2-line" :size="18" />
                  </button>
                  <button class="ctrl-btn close-btn" title="Закрыть (Esc)" @click="videoStore.close()">
                    <Icon name="mingcute:close-line" :size="20" />
                  </button>
                </div>
              </div>

              <!-- Bottom bar -->
              <div class="controls-bottom pointer-events-auto">
                <!-- Progress bar -->
                <div class="progress-wrap" @click="seekOnClick" @mousemove="onProgressHover" @mouseleave="hoverTime = null">
                  <div class="progress-bg">
                    <div class="progress-buf" :style="{ width: bufferedPct + '%' }" />
                    <div class="progress-fill" :style="{ width: progressPct + '%' }" />
                    <div class="progress-thumb" :style="{ left: progressPct + '%' }" />
                  </div>
                  <div
                    v-if="hoverTime !== null"
                    class="progress-tooltip"
                    :style="{ left: hoverPct + '%' }"
                  >
                    {{ formatTime(hoverTime) }}
                  </div>
                </div>

                <!-- Controls row -->
                <div class="ctrl-row">
                  <!-- Left: playback controls -->
                  <div class="ctrl-group">
                    <button
                      class="ctrl-btn"
                      :disabled="!videoStore.hasPrev"
                      title="Предыдущий"
                      @click="videoStore.prev()"
                    >
                      <Icon name="mingcute:skip-previous-fill" :size="20" />
                    </button>

                    <button class="ctrl-btn play-btn" @click="togglePlay">
                      <Icon
                        :name="videoStore.isPlaying ? 'mingcute:pause-fill' : 'mingcute:play-fill'"
                        :size="26"
                      />
                    </button>

                    <button
                      class="ctrl-btn"
                      :disabled="!videoStore.hasNext"
                      title="Следующий"
                      @click="videoStore.next()"
                    >
                      <Icon name="mingcute:skip-forward-fill" :size="20" />
                    </button>

                    <!-- Volume -->
                    <div class="volume-group">
                      <button class="ctrl-btn" title="Звук (M)" @click="videoStore.toggleMute()">
                        <Icon :name="volumeIcon" :size="18" />
                      </button>
                      <input
                        type="range"
                        class="volume-slider"
                        min="0"
                        max="1"
                        step="0.02"
                        :value="videoStore.muted ? 0 : videoStore.volume"
                        @input="onVolumeInput"
                      />
                    </div>

                    <!-- Time -->
                    <div class="timecode">
                      {{ formatTime(videoStore.currentTime) }} / {{ formatTime(videoStore.duration) }}
                    </div>
                  </div>

                  <!-- Right: fullscreen -->
                  <div class="ctrl-group">
                    <button class="ctrl-btn" title="Полный экран (F)" @click="toggleFullscreen">
                      <Icon
                        :name="videoStore.isFullscreen ? 'mingcute:fullscreen-exit-line' : 'mingcute:fullscreen-line'"
                        :size="18"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { api } from "@/api/client";
import { useVideoStore } from "@/stores/video";

// hls.js dynamic import
let HlsClass: typeof import("hls.js").default | null = null;
let hlsInstance: import("hls.js").default | null = null;

const videoStore = useVideoStore();
const videoRef = ref<HTMLVideoElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const controlsVisible = ref(true);
const hasError = ref(false);
const hoverTime = ref<number | null>(null);
const hoverPct = ref(0);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

// ── Computed ──────────────────────────────────────────────────────────────────
const artistNames = computed(() =>
  (videoStore.clip?.artists ?? []).map((a) => a.name).join(", ")
);

const progressPct = computed(() => {
  if (!videoStore.duration) return 0;
  return Math.min(100, (videoStore.currentTime / videoStore.duration) * 100);
});

const bufferedPct = computed(() => {
  const el = videoRef.value;
  if (!el || !videoStore.duration) return 0;
  const buf = el.buffered;
  if (!buf.length) return 0;
  return Math.min(100, (buf.end(buf.length - 1) / videoStore.duration) * 100);
});

const volumeIcon = computed(() => {
  if (videoStore.muted || videoStore.volume === 0) return "mingcute:volume-mute-line";
  if (videoStore.volume < 0.5) return "mingcute:volume-line";
  return "mingcute:volume-up-line";
});

// ── Controls visibility ───────────────────────────────────────────────────────
function showControls() {
  controlsVisible.value = true;
  if (hideTimer) clearTimeout(hideTimer);
  scheduleHide();
}

function scheduleHide() {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (videoStore.isPlaying) controlsVisible.value = false;
  }, 2500);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function handleOverlayClick() {
  videoStore.close();
}

function openInWindow() {
  const c = videoStore.clip;
  if (!c?.embed_url) return;
  void api.openVideoWindow(c.embed_url, `${c.title} — ${artistNames.value}`);
}

function openInBrowser() {
  const c = videoStore.clip;
  if (!c?.embed_url) return;
  void api.openExternal(c.embed_url);
}

// ── Video events ──────────────────────────────────────────────────────────────
function onPlay() {
  videoStore.setPlaying(true);
  scheduleHide();
}
function onPause() {
  videoStore.setPlaying(false);
  controlsVisible.value = true;
}
function onTimeUpdate() {
  const el = videoRef.value;
  if (el) videoStore.setCurrentTime(el.currentTime);
}
function onDurationChange() {
  const el = videoRef.value;
  if (el && el.duration && !isNaN(el.duration)) {
    videoStore.setDuration(el.duration);
  }
}
function onEnded() {
  if (videoStore.hasNext) {
    videoStore.next();
  } else {
    videoStore.setPlaying(false);
    controlsVisible.value = true;
  }
}
function onError() {
  videoStore.setLoading(false);
  hasError.value = true;
}

// ── Playback controls ─────────────────────────────────────────────────────────
function togglePlay() {
  const el = videoRef.value;
  if (!el) return;
  if (el.paused) void el.play();
  else el.pause();
}

function onVolumeInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value);
  videoStore.setVolume(val);
  if (videoRef.value) {
    videoRef.value.volume = videoStore.volume;
    videoRef.value.muted = false;
    if (videoStore.muted) videoStore.toggleMute();
  }
}

// ── Progress / Seek ───────────────────────────────────────────────────────────
function seekOnClick(e: MouseEvent) {
  const el = videoRef.value;
  const bar = (e.currentTarget as HTMLElement);
  if (!el || !videoStore.duration) return;
  const rect = bar.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  el.currentTime = ratio * videoStore.duration;
}

function onProgressHover(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement;
  const rect = bar.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  hoverPct.value = ratio * 100;
  hoverTime.value = ratio * (videoStore.duration || 0);
}

// ── Fullscreen ────────────────────────────────────────────────────────────────
function toggleFullscreen() {
  const el = containerRef.value;
  if (!el) return;
  if (!document.fullscreenElement) {
    void el.requestFullscreen();
  } else {
    void document.exitFullscreen();
  }
}

function onFullscreenChange() {
  videoStore.setFullscreen(!!document.fullscreenElement);
}

// ── HLS / MP4 loading ─────────────────────────────────────────────────────────
async function loadClip() {
  const c = videoStore.clip;
  if (!c) return;

  hasError.value = false;
  destroyHls();
  videoStore.setLoading(true);

  const el = videoRef.value;
  if (!el) return;

  let hlsUrl = c.hls_url;
  let mp4Url = c.video_url;

  // Resolve stream via backend if not preloaded
  if (!hlsUrl && !mp4Url) {
    try {
      const stream = await api.clipStream(c.id, c.embed_url);
      if (stream) {
        hlsUrl = stream.hls_url ?? null;
        mp4Url = stream.video_url ?? null;
        if (stream.duration_ms && !c.duration_ms) {
          c.duration_ms = stream.duration_ms;
          videoStore.setDuration(stream.duration_ms / 1000);
        }
        c.hls_url = hlsUrl;
        c.video_url = mp4Url;
      }
    } catch (e) {
      console.warn("Failed to resolve clip stream:", e);
    }
  }

  if (hlsUrl) {
    if (!HlsClass) {
      try {
        const mod = await import("hls.js");
        HlsClass = mod.default;
      } catch (err) {
        console.warn("hls.js import failed:", err);
      }
    }

    if (HlsClass && HlsClass.isSupported()) {
      const hls = new HlsClass({
        enableWorker: false,
        autoStartLoad: true,
      });
      hlsInstance = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(el);
      hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
        videoStore.setLoading(false);
        hasError.value = false;
        void el.play().catch(() => {});
      });
      hls.on(HlsClass.Events.ERROR, (_evt: unknown, data: import("hls.js").ErrorData) => {
        if (data.fatal) {
          switch (data.type) {
            case HlsClass!.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case HlsClass!.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              onError();
              break;
          }
        }
      });
      return;
    }

    // Native HLS fallback (Safari / WebView)
    if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = hlsUrl;
      videoStore.setLoading(false);
      hasError.value = false;
      void el.play().catch(() => {});
      return;
    }
  }

  if (mp4Url) {
    el.src = mp4Url;
    videoStore.setLoading(false);
    hasError.value = false;
    void el.play().catch(() => {});
    return;
  }

  onError();
}

function destroyHls() {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  const el = videoRef.value;
  if (el) {
    el.pause();
    el.removeAttribute("src");
    el.load();
  }
}

// ── Keyboard navigation ───────────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (!videoStore.isOpen) return;
  const el = videoRef.value;
  switch (e.key) {
    case " ":
    case "k":
    case "K":
      e.preventDefault();
      togglePlay();
      showControls();
      break;
    case "f":
    case "F":
      e.preventDefault();
      toggleFullscreen();
      break;
    case "m":
    case "M":
      e.preventDefault();
      videoStore.toggleMute();
      if (el) el.muted = videoStore.muted;
      break;
    case "ArrowLeft":
      e.preventDefault();
      if (el) el.currentTime = Math.max(0, el.currentTime - 5);
      showControls();
      break;
    case "ArrowRight":
      e.preventDefault();
      if (el) el.currentTime = Math.min(videoStore.duration, el.currentTime + 5);
      showControls();
      break;
    case "ArrowUp":
      e.preventDefault();
      videoStore.setVolume(videoStore.volume + 0.1);
      if (el) el.volume = videoStore.volume;
      showControls();
      break;
    case "ArrowDown":
      e.preventDefault();
      videoStore.setVolume(videoStore.volume - 0.1);
      if (el) el.volume = videoStore.volume;
      showControls();
      break;
    case "Escape":
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        videoStore.close();
      }
      break;
  }
}

// ── Watchers ──────────────────────────────────────────────────────────────────
watch(
  () => videoStore.isOpen,
  (open) => {
    if (open) {
      document.addEventListener("keydown", onKeydown);
      document.addEventListener("fullscreenchange", onFullscreenChange);
      setTimeout(() => { void loadClip(); }, 40);
    } else {
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      destroyHls();
      hasError.value = false;
    }
  }
);

watch(
  () => videoStore.clip,
  (clip) => {
    if (clip && videoStore.isOpen) {
      void loadClip();
    }
  }
);

watch(
  () => videoStore.muted,
  (val) => {
    const el = videoRef.value;
    if (el) el.muted = val;
  }
);

watch(
  () => videoStore.volume,
  (val) => {
    const el = videoRef.value;
    if (el && !videoStore.muted) el.volume = val;
  }
);

onUnmounted(() => {
  destroyHls();
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<style scoped>
.video-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
}

.video-modal-container {
  position: relative;
  width: 100%;
  max-width: min(92vw, 1280px);
  max-height: 90vh;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  cursor: default;
}

.video-el {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #000;
}

.video-spinner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.video-error-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0d0d0d;
}

.ctrl-btn-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition: all 0.15s ease;
}
.ctrl-btn-pill:hover {
  background: rgba(255, 255, 255, 0.22);
}

/* ── Controls overlay ─────────────────────────────────────────────── */
.controls-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    transparent 22%,
    transparent 68%,
    rgba(0, 0, 0, 0.78) 100%
  );
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.controls-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 22px;
}

.clip-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 75%;
}

.clip-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
}

.clip-artists {
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
}

.controls-bottom {
  padding: 12px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Progress bar ─────────────────────────────────────────────────── */
.progress-wrap {
  width: 100%;
  height: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.progress-bg {
  position: relative;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 2px;
  transition: height 0.15s ease;
}

.progress-wrap:hover .progress-bg {
  height: 6px;
}

.progress-buf {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #ff3344;
  border-radius: 2px;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s ease;
}

.progress-wrap:hover .progress-thumb {
  transform: translate(-50%, -50%) scale(1);
}

.progress-tooltip {
  position: absolute;
  bottom: 22px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: none;
  white-space: nowrap;
}

/* ── Controls row ─────────────────────────────────────────────────── */
.ctrl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ctrl-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.ctrl-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.ctrl-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.play-btn {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.15);
}

.play-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.close-btn:hover {
  background: rgba(255, 60, 60, 0.45);
}

/* ── Volume ───────────────────────────────────────────────────────── */
.volume-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.volume-slider {
  width: 72px;
  accent-color: #ff3344;
  cursor: pointer;
}

.timecode {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  margin-left: 6px;
}

/* ── Transitions ──────────────────────────────────────────────────── */
.video-modal-enter-active,
.video-modal-leave-active {
  transition: opacity 0.2s ease;
}
.video-modal-enter-from,
.video-modal-leave-to {
  opacity: 0;
}

.controls-fade-enter-active,
.controls-fade-leave-active {
  transition: opacity 0.2s ease;
}
.controls-fade-enter-from,
.controls-fade-leave-to {
  opacity: 0;
}
</style>
