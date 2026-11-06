<template>
  <q-page class="flex flex-col h-[calc(100vh_-_52px_-_var(--player-height,_78px))] !min-h-0 !overflow-hidden">
    <q-scroll-area class="flex-auto min-h-0">
      <div class="mx-auto w-full max-w-[1280px] pt-[var(--page-top-gap,28px)] px-[var(--page-padding,32px)] pb-[56px]">
        <!-- Заголовок страницы -->
        <div class="flex flex-wrap items-baseline justify-between gap-[16px] mb-[20px]">
          <div>
            <div class="text-[clamp(26px,2.8vw,34px)] font-bold tracking-[-0.03em] leading-[1.1]">
              Поиск
            </div>
            <p class="mt-[4px] mx-0 mb-0 text-[calc(13px*var(--text-scale,1))] text-[color:var(--fg-dim)]">
              Треки, артисты, альбомы, плейлисты и персональная «Моя волна»
            </p>
          </div>
        </div>

        <!-- 1. Строка поиска и навигация -->
        <div class="relative w-full max-w-[580px] mb-[24px]">
          <div
            class="flex items-center gap-[10px] h-[46px] px-[14px] rounded-[14px] bg-[var(--surface)] border border-[var(--line)] shadow-sm transition-[border-color,background,box-shadow] duration-[140ms] ease-[ease] focus-within:border-[color-mix(in_srgb,var(--fg)_20%,transparent)] focus-within:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent)] focus-within:bg-[var(--surface-2)]"
          >
            <Icon name="mingcute:search-2-line" :size="18" class="text-[color:var(--fg-faint)] flex-none" />
            <input
              ref="searchInputRef"
              v-model="text"
              type="text"
              spellcheck="false"
              placeholder="Что хотите послушать?"
              class="flex-1 min-w-0 bg-transparent border-0 outline-none text-[color:var(--fg)] text-[calc(13.5px*var(--text-scale,1))] font-[inherit] placeholder:text-[color:var(--fg-faint)]"
              @keyup.enter="submit"
              @keydown.up.prevent="onInputArrow('up')"
              @keydown.down.prevent="onInputArrow('down')"
              @keydown.esc="onInputEsc"
              @focus="onInputFocus"
              @blur="closeSuggestSoon"
            />
            <kbd
              v-if="!text"
              class="hidden sm:inline-flex items-center px-[6px] py-[2px] rounded-[5px] bg-[var(--surface-2)] text-[10.5px] font-mono text-[color:var(--fg-faint)] border border-[color:var(--line)] select-none pointer-events-none"
            >Ctrl+F</kbd>
            <button
              v-if="text"
              class="flex w-[24px] h-[24px] flex-none items-center justify-center rounded-[6px] text-[color:var(--fg-faint)] cursor-pointer select-none transition-[background,color] duration-[120ms] ease-[ease] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] p-0 border-0 appearance-none bg-transparent"
              type="button"
              title="Очистить"
              @click="clearQuery"
            >
              <Icon name="mingcute:close-line" :size="14" />
            </button>
          </div>

          <!-- Выпадающий список саджестов с поддержкой навигации стрелками ↑ / ↓ -->
          <div
            v-if="suggestOpen && suggestions.length"
            class="absolute z-[50] top-[calc(100%_+_6px)] right-0 left-0 overflow-hidden p-[6px] border border-[color:var(--line)] rounded-[var(--radius,12px)] bg-[color-mix(in_srgb,var(--surface-2)_96%,transparent)] shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-[16px]"
          >
            <button
              v-for="(hint, hIdx) in suggestions"
              :key="hint"
              class="flex w-full items-center px-[10px] py-[8px] border-0 rounded-[8px] cursor-pointer text-[13px] gap-[10px] text-left font-[inherit] transition-[background,color] duration-[120ms] ease-[ease]"
              :class="[
                hIdx === highlightedSuggestIndex
                  ? 'bg-[var(--hover)] text-[color:var(--fg)] font-medium'
                  : 'bg-transparent text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]',
              ]"
              type="button"
              @mousedown.prevent="pick(hint)"
            >
              <Icon name="mingcute:search-2-line" :size="14" class="text-[color:var(--fg-faint)] flex-none" />
              <span class="truncate flex-1">{{ hint }}</span>
            </button>
          </div>
        </div>

        <!-- Состояние загрузки результатов -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-[64px] gap-[14px]">
          <q-spinner size="32px" color="primary" />
          <span class="text-[calc(13px*var(--text-scale,1))] text-[color:var(--fg-faint)]">
            Ищем по каталогу...
          </span>
        </div>

        <!-- 5. Выдача результатов поиска -->
        <template v-else-if="result && hasResults">
          <!-- Баннер перехваченного и исправленного запроса -->
          <div
            v-if="correctedFrom && correctedTo"
            class="flex flex-wrap items-center gap-[6px] mb-[16px] px-[14px] py-[8px] rounded-[10px] bg-[var(--surface)] border border-[color:var(--line)] text-[13px] text-[color:var(--fg-dim)] shadow-sm"
          >
            <Icon name="mingcute:magic-line" :size="16" class="text-[var(--accent)] flex-none" />
            <span>Запрос перехвачен и исправлен:</span>
            <span class="font-semibold text-[color:var(--fg)]">«{{ correctedTo }}»</span>
            <span class="text-[color:var(--fg-faint)]">·</span>
            <button
              type="button"
              class="text-[12px] text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] hover:underline border-0 p-0 bg-transparent cursor-pointer ml-[2px]"
              @click="searchOriginal(correctedFrom)"
            >
              Искать вместо этого «{{ correctedFrom }}»
            </button>
          </div>

          <!-- Табы разделов выдачи -->
          <div class="flex items-center gap-[8px] overflow-x-auto pb-[16px] mb-[12px] no-scrollbar">
            <button
              v-for="tab in availableTabs"
              :key="tab.id"
              type="button"
              class="flex items-center gap-[6px] h-[32px] px-[14px] rounded-full text-[calc(12.5px*var(--text-scale,1))] font-medium cursor-pointer transition-all duration-[140ms] whitespace-nowrap select-none border-0"
              :class="
                activeTab === tab.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)] border border-[var(--line)]'
              "
              @click="activeTab = tab.id"
            >
              <span>{{ tab.label }}</span>
              <span
                v-if="tab.count !== undefined"
                class="text-[11px] px-[5px] py-[1px] rounded-full"
                :class="activeTab === tab.id ? 'bg-black/20 text-white' : 'bg-[var(--surface-2)] text-[color:var(--fg-faint)]'"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>

          <!-- Раздел "Все результаты" -->
          <template v-if="activeTab === 'all'">
            <div
              v-if="bestMatch || (result.tracks && result.tracks.length)"
              class="grid grid-cols-1 min-[960px]:grid-cols-[minmax(280px,360px)_1fr] gap-[24px] mb-[36px]"
            >
              <!-- Лучший результат -->
              <div v-if="bestMatch" class="flex flex-col">
                <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em] mb-[12px]">
                  Лучший результат
                </div>
                <div
                  class="group relative flex flex-col justify-between p-[20px] rounded-[18px] bg-[var(--surface)] border border-[var(--line)] cursor-pointer transition-[background,border-color,transform] duration-200 hover:bg-[var(--surface-2)] hover:border-[color:color-mix(in_srgb,var(--fg)_20%,transparent)] h-full min-h-[220px]"
                  @click="bestMatch.action"
                >
                  <div>
                    <div
                      class="cover relative overflow-hidden bg-[var(--surface-2)] shadow-[0_8px_24px_rgba(0,0,0,0.3)] mb-[16px] flex items-center justify-center"
                      :class="bestMatch.type === 'artist' ? 'rounded-full w-[96px] h-[96px]' : 'rounded-[14px] w-[96px] h-[96px]'"
                    >
                      <img
                        v-if="bestMatch.image"
                        :src="bestMatch.image"
                        class="w-full h-full object-cover block"
                        loading="lazy"
                        decoding="async"
                      />
                      <Icon
                        v-else
                        :name="bestMatch.type === 'artist' ? 'mingcute:user-2-line' : 'mingcute:music-2-line'"
                        :size="36"
                        class="text-[color:var(--fg-faint)]"
                      />
                    </div>
                    <div class="text-[calc(22px*var(--text-scale,1))] font-bold tracking-tight text-[color:var(--fg)] leading-[1.2] line-clamp-2">
                      {{ bestMatch.title }}
                    </div>
                    <div class="flex items-center gap-[8px] mt-[8px]">
                      <span class="inline-block text-[11px] font-semibold uppercase tracking-wider px-[8px] py-[3px] rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[color:var(--accent)]">
                        {{ bestMatch.typeLabel }}
                      </span>
                      <span
                        v-if="bestMatch.subtitle && bestMatch.subtitle.toLowerCase() !== bestMatch.typeLabel.toLowerCase()"
                        class="text-[calc(13px*var(--text-scale,1))] text-[color:var(--fg-dim)] truncate"
                      >
                        {{ bestMatch.subtitle }}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="absolute bottom-[20px] right-[20px] flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(0,0,0,0.4)] opacity-0 translate-y-[6px] transition-[opacity,transform,scale] duration-200 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 border-0 cursor-pointer"
                    title="Воспроизвести"
                    @click.stop="bestMatch.play"
                  >
                    <Icon name="mingcute:play-fill" :size="20" class="ml-[2px]" />
                  </button>
                </div>
              </div>

              <!-- Топ-4 трека -->
              <div v-if="result.tracks.length" class="flex flex-col min-w-0">
                <div class="flex items-center justify-between mb-[12px]">
                  <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">
                    Треки
                  </div>
                  <button
                    v-if="result.tracks.length > 4"
                    type="button"
                    class="text-[calc(12.5px*var(--text-scale,1))] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] transition-colors p-0 border-0 bg-transparent cursor-pointer font-medium inline-flex items-center gap-[4px]"
                    @click="activeTab = 'tracks'"
                  >
                    <span>Смотреть все</span>
                    <Icon name="mingcute:arrow-right-line" :size="13" />
                  </button>
                </div>
                <div class="flex flex-col gap-[2px]">
                  <TrackRow
                    v-for="(item, idx) in result.tracks.slice(0, 4)"
                    :key="item.id"
                    :track="item"
                    :index="idx"
                    :show-album="false"
                    @play="playFrom(idx)"
                  />
                </div>
              </div>
            </div>

            <!-- Исполнители -->
            <template v-if="result.artists.length">
              <div class="flex items-baseline justify-between mt-[32px] mb-[14px]">
                <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">
                  Исполнители
                </div>
                <button
                  v-if="result.artists.length > 6"
                  type="button"
                  class="text-[calc(12.5px*var(--text-scale,1))] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] transition-colors p-0 border-0 bg-transparent cursor-pointer font-medium inline-flex items-center gap-[4px]"
                  @click="activeTab = 'artists'"
                >
                  <span>Смотреть все</span>
                  <Icon name="mingcute:arrow-right-line" :size="13" />
                </button>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[14px]">
                <div
                  v-for="a in result.artists.slice(0, 6)"
                  :key="a.id"
                  class="group relative rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)] text-center"
                  @click="router.push(`/artist/${a.id}`)"
                >
                  <div class="cover cover-round relative aspect-square w-full rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none mb-[10px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                    <img
                      v-if="avatarOf(a)"
                      loading="lazy"
                      decoding="async"
                      :src="avatarOf(a) ?? undefined"
                    />
                    <Icon v-else name="mingcute:user-2-line" :size="28" class="text-[color:var(--fg-faint)]" />
                    <button
                      class="absolute bottom-[8px] right-[8px] flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] p-0 text-white opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-100 group-hover:translate-y-0 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      type="button"
                      title="Волна по артисту"
                      @click.stop="playArtistWave(a)"
                    >
                      <Icon name="mingcute:play-fill" :size="15" />
                    </button>
                  </div>
                  <div class="text-[calc(13.5px*var(--text-scale,1))] font-medium truncate">{{ a.name }}</div>
                  <div class="text-[calc(12px*var(--text-scale,1))] text-[color:var(--fg-faint)] mt-[2px]">Исполнитель</div>
                </div>
              </div>
            </template>

            <!-- Альбомы -->
            <template v-if="result.albums.length">
              <div class="flex items-baseline justify-between mt-[36px] mb-[14px]">
                <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">
                  Альбомы
                </div>
                <button
                  v-if="result.albums.length > 6"
                  type="button"
                  class="text-[calc(12.5px*var(--text-scale,1))] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] transition-colors p-0 border-0 bg-transparent cursor-pointer font-medium inline-flex items-center gap-[4px]"
                  @click="activeTab = 'albums'"
                >
                  <span>Смотреть все</span>
                  <Icon name="mingcute:arrow-right-line" :size="13" />
                </button>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[14px]">
                <div
                  v-for="al in result.albums.slice(0, 6)"
                  :key="al.id"
                  class="group relative rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                  @click="router.push(`/album/${al.id}`)"
                >
                  <div class="cover relative aspect-square w-full rounded-[12px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none mb-[10px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                    <img
                      v-if="al.cover_url"
                      loading="lazy"
                      decoding="async"
                      :src="al.cover_url"
                    />
                    <Icon v-else name="mingcute:album-line" :size="26" class="text-[color:var(--fg-faint)]" />
                    <button
                      class="absolute bottom-[8px] right-[8px] flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] p-0 text-white opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-100 group-hover:translate-y-0 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      type="button"
                      title="Слушать альбом"
                      @click.stop="playAlbum(al.id)"
                    >
                      <Icon name="mingcute:play-fill" :size="15" />
                    </button>
                  </div>
                  <div class="text-[calc(13.5px*var(--text-scale,1))] font-medium truncate">{{ al.title }}</div>
                  <div class="text-[calc(12px*var(--text-scale,1))] text-[color:var(--fg-faint)] truncate mt-[2px]">
                    {{ al.year ? `${al.year} · ` : '' }}{{ al.artist || 'Альбом' }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Плейлисты с сортировкой и интерактивными карточками -->
            <template v-if="result.playlists && result.playlists.length">
              <div class="flex flex-wrap items-center justify-between gap-[12px] mt-[36px] mb-[14px]">
                <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">
                  Плейлисты
                </div>

                <!-- Пилюли-фильтры сортировки -->
                <div class="flex items-center gap-[6px] overflow-x-auto [scrollbar-width:none]">
                  <button
                    v-for="opt in playlistSortOptions"
                    :key="opt.id"
                    type="button"
                    class="px-[10px] py-[4px] rounded-full text-[11px] font-medium border border-solid transition-colors cursor-pointer select-none"
                    :class="[
                      playlistSort === opt.id
                        ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)] font-semibold'
                        : 'border-[color:var(--line)] bg-[var(--surface)] text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]',
                    ]"
                    @click="playlistSort = opt.id"
                  >
                    {{ opt.label }}
                  </button>
                  <button
                    v-if="result.playlists.length > 6"
                    type="button"
                    class="text-[calc(12.5px*var(--text-scale,1))] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] transition-colors p-0 border-0 bg-transparent cursor-pointer font-medium inline-flex items-center gap-[4px] ml-[4px]"
                    @click="activeTab = 'playlists'"
                  >
                    <span>Все</span>
                    <Icon name="mingcute:arrow-right-line" :size="13" />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[14px]">
                <div
                  v-for="pl in sortedPlaylists.slice(0, 6)"
                  :key="pl.kind"
                  class="group relative rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                  @click="router.push(`/playlists/${pl.kind}`)"
                  @mouseenter="playlistPreview.scheduleHoverPreview(pl, 350)"
                  @mouseleave="playlistPreview.cancelHoverPreview()"
                >
                  <div class="cover relative aspect-square w-full rounded-[12px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none mb-[10px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                    <img
                      v-if="pl.cover_url"
                      loading="lazy"
                      decoding="async"
                      :src="pl.cover_url"
                    />
                    <Icon v-else name="mingcute:playlist-2-line" :size="26" class="text-[color:var(--fg-faint)]" />

                    <!-- Кнопка лайка плейлиста -->
                    <button
                      type="button"
                      class="absolute top-[8px] right-[8px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-0 bg-black/50 backdrop-blur-sm p-0 transition-all duration-[140ms]"
                      :class="[
                        library.isPlaylistLiked(pl)
                          ? 'text-[var(--accent)] opacity-100 scale-100'
                          : 'text-white opacity-0 group-hover:opacity-100 hover:scale-110',
                      ]"
                      :title="library.isPlaylistLiked(pl) ? 'Удалить из коллекции' : 'Добавить в коллекцию'"
                      @click.stop="library.togglePlaylistLike(pl)"
                    >
                      <Icon
                        :name="library.isPlaylistLiked(pl) ? 'mingcute:heart-fill' : 'mingcute:heart-line'"
                        :size="15"
                      />
                    </button>

                    <!-- Кнопки управления на обложке: Play и Добавить в очередь -->
                    <div class="absolute bottom-[8px] right-[8px] flex items-center gap-[6px] opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-100 group-hover:translate-y-0">
                      <button
                        class="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full border-0 bg-black/60 backdrop-blur-sm p-0 text-white hover:bg-black/80 hover:scale-105 active:scale-95 shadow-md"
                        type="button"
                        title="Добавить в очередь"
                        @click.stop="enqueuePlaylist(pl)"
                      >
                        <Icon name="mingcute:list-plus-line" :size="15" />
                      </button>

                      <button
                        class="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] p-0 text-white hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                        type="button"
                        title="Слушать плейлист"
                        @click.stop="playPlaylist(pl)"
                      >
                        <Icon name="mingcute:play-fill" :size="15" class="ml-[1px]" />
                      </button>
                    </div>
                  </div>

                  <div class="text-[calc(13.5px*var(--text-scale,1))] font-medium truncate">{{ pl.title }}</div>
                  <div class="text-[calc(12px*var(--text-scale,1))] text-[color:var(--fg-faint)] truncate mt-[2px]">
                    Плейлист · {{ pl.track_count }} треков
                  </div>

                  <!-- Превью первых 3 треков по ховеру через q-tooltip -->
                  <q-tooltip
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[0, 8]"
                    class="bg-[var(--surface-2)] text-[color:var(--fg)] border border-[color:var(--line)] shadow-xl p-[10px] rounded-[12px] max-w-[280px] w-[260px]"
                  >
                    <div v-if="playlistPreview.isPreviewLoading(pl)" class="flex items-center gap-[8px] text-[11px] text-[color:var(--fg-faint)]">
                      <Icon name="mingcute:loading-line" :size="14" class="animate-spin text-[var(--accent)]" />
                      <span>Загрузка превью треков...</span>
                    </div>
                    <div v-else-if="playlistPreview.getPreview(pl)?.length" class="flex flex-col gap-[6px]">
                      <div class="text-[10px] uppercase font-semibold tracking-wider text-[color:var(--fg-faint)]">
                        Первые треки:
                      </div>
                      <div
                        v-for="(tr, tIdx) in playlistPreview.getPreview(pl)!.slice(0, 3)"
                        :key="tr.id || tIdx"
                        class="flex items-center justify-between text-[11px] gap-[8px]"
                      >
                        <div class="min-w-0 truncate">
                          <span class="font-medium text-[color:var(--fg)]">{{ tr.title }}</span>
                          <span class="text-[color:var(--fg-faint)] ml-[4px]">· {{ tr.artists.map((a) => a.name).join(', ') }}</span>
                        </div>
                        <span class="text-[10px] font-mono text-[color:var(--fg-faint)] flex-none">
                          {{ formatDuration(tr.duration_ms || 0) }}
                        </span>
                      </div>
                    </div>
                    <div v-else class="text-[11px] text-[color:var(--fg-faint)]">
                      Плейлист: {{ pl.title }}
                    </div>
                  </q-tooltip>

                  <!-- Контекстное меню плейлиста (ПКМ) -->
                  <q-menu context-menu>
                    <q-list dense class="min-w-[190px] py-[4px] bg-[var(--surface)] text-[color:var(--fg)] border border-[color:var(--line)] rounded-[var(--radius,10px)]">
                      <q-item clickable v-close-popup @click="playPlaylist(pl)">
                        <q-item-section avatar class="min-w-0 pr-[8px]">
                          <Icon name="mingcute:play-fill" :size="15" class="text-[var(--accent)]" />
                        </q-item-section>
                        <q-item-section class="text-[12.5px]">Слушать плейлист</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="playPlaylistNext(pl)">
                        <q-item-section avatar class="min-w-0 pr-[8px]">
                          <Icon name="mingcute:skip-forward-line" :size="15" />
                        </q-item-section>
                        <q-item-section class="text-[12.5px]">Включить следующим</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="enqueuePlaylist(pl)">
                        <q-item-section avatar class="min-w-0 pr-[8px]">
                          <Icon name="mingcute:list-plus-line" :size="15" />
                        </q-item-section>
                        <q-item-section class="text-[12.5px]">Добавить в очередь</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="player.waveByPlaylist(pl)">
                        <q-item-section avatar class="min-w-0 pr-[8px]">
                          <Icon name="mingcute:wave-line" :size="15" />
                        </q-item-section>
                        <q-item-section class="text-[12.5px]">Волна по плейлисту</q-item-section>
                      </q-item>
                      <q-separator class="my-[4px] bg-[var(--line)]" />
                      <q-item clickable v-close-popup @click="library.togglePlaylistLike(pl)">
                        <q-item-section avatar class="min-w-0 pr-[8px]">
                          <Icon
                            :name="library.isPlaylistLiked(pl) ? 'mingcute:heart-fill' : 'mingcute:heart-line'"
                            :size="15"
                            :class="library.isPlaylistLiked(pl) ? 'text-[var(--accent)]' : ''"
                          />
                        </q-item-section>
                        <q-item-section class="text-[12.5px]">
                          {{ library.isPlaylistLiked(pl) ? 'Удалить из коллекции' : 'Добавить в коллекцию' }}
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="router.push(`/playlists/${pl.kind}`)">
                        <q-item-section avatar class="min-w-0 pr-[8px]">
                          <Icon name="mingcute:external-link-line" :size="15" />
                        </q-item-section>
                        <q-item-section class="text-[12.5px]">Открыть страницу</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </div>
              </div>
            </template>

            <!-- Все найденные треки -->
            <template v-if="result.tracks.length > 4">
              <div class="flex items-center justify-between mt-[40px] mb-[12px]">
                <div class="flex items-center gap-[12px]">
                  <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">
                    Все найденные треки ({{ result.tracks.length }})
                  </div>
                  <button
                    type="button"
                    class="inline-flex items-center gap-[6px] h-[30px] px-[12px] rounded-full bg-[var(--surface-2)] text-[color:var(--fg)] text-[calc(12px*var(--text-scale,1))] font-medium border border-[var(--line)] cursor-pointer hover:bg-[var(--hover)] transition-colors"
                    @click="playAll(0)"
                  >
                    <Icon name="mingcute:play-fill" :size="13" class="text-[color:var(--accent)]" />
                    <span>Слушать всё</span>
                  </button>
                </div>
              </div>
              <LazyTracks v-slot="{ item, index }" :items="result.tracks">
                <TrackRow :track="item" :index="index" @play="playFrom(index)" />
              </LazyTracks>
            </template>

            <!-- Авторы Genius -->
            <template v-if="genius.ready && genius.people.length">
              <div class="text-[calc(17px*var(--text-scale,1))] font-semibold tracking-[-0.02em] mt-[36px] mb-[14px]">
                Авторы и продюсеры Genius
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[14px]">
                <div
                  v-for="p in genius.people.slice(0, 6)"
                  :key="p.id"
                  class="rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)] text-center"
                  @click="openPerson(p.id)"
                >
                  <div class="cover cover-round relative aspect-square w-full rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none mb-[10px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                    <img
                      v-if="p.image"
                      loading="lazy"
                      decoding="async"
                      :src="p.image"
                    />
                    <Icon v-else name="mingcute:user-2-line" :size="28" class="text-[color:var(--fg-faint)]" />
                  </div>
                  <div class="text-[calc(13.5px*var(--text-scale,1))] font-medium truncate">{{ p.name }}</div>
                  <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] mt-[2px]">
                    {{ p.verified ? "genius · ✓" : "genius" }}
                  </div>
                </div>
              </div>
            </template>
          </template>

          <!-- Таб: Треки -->
          <template v-else-if="activeTab === 'tracks'">
            <div class="flex items-center justify-between mb-[16px]">
              <div class="text-[calc(18px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">
                Найденные треки ({{ result.tracks.length }})
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-[7px] h-[34px] px-[16px] rounded-full bg-[var(--accent)] text-white text-[calc(12.5px*var(--text-scale,1))] font-medium border-0 cursor-pointer shadow-sm hover:opacity-90 active:scale-95 transition-all"
                @click="playAll(0)"
              >
                <Icon name="mingcute:play-fill" :size="14" />
                <span>Слушать всё</span>
              </button>
            </div>
            <LazyTracks v-slot="{ item, index }" :items="result.tracks">
              <TrackRow :track="item" :index="index" @play="playFrom(index)" />
            </LazyTracks>
          </template>

          <!-- Таб: Исполнители -->
          <template v-else-if="activeTab === 'artists'">
            <div class="text-[calc(18px*var(--text-scale,1))] font-semibold tracking-[-0.02em] mb-[16px]">
              Исполнители ({{ result.artists.length }})
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[14px]">
              <div
                v-for="a in result.artists"
                :key="a.id"
                class="group relative rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)] text-center"
                @click="router.push(`/artist/${a.id}`)"
              >
                <div class="cover cover-round relative aspect-square w-full rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none mb-[10px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                  <img
                    v-if="avatarOf(a)"
                    loading="lazy"
                    decoding="async"
                    :src="avatarOf(a) ?? undefined"
                  />
                  <Icon v-else name="mingcute:user-2-line" :size="28" class="text-[color:var(--fg-faint)]" />
                  <button
                    class="absolute bottom-[8px] right-[8px] flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] p-0 text-white opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-100 group-hover:translate-y-0 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                    type="button"
                    title="Волна по артисту"
                    @click.stop="playArtistWave(a)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>
                </div>
                <div class="text-[calc(13.5px*var(--text-scale,1))] font-medium truncate">{{ a.name }}</div>
                <div class="text-[calc(12px*var(--text-scale,1))] text-[color:var(--fg-faint)] mt-[2px]">Исполнитель</div>
              </div>
            </div>
          </template>

          <!-- Таб: Альбомы -->
          <template v-else-if="activeTab === 'albums'">
            <div class="text-[calc(18px*var(--text-scale,1))] font-semibold tracking-[-0.02em] mb-[16px]">
              Альбомы ({{ result.albums.length }})
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[14px]">
              <div
                v-for="al in result.albums"
                :key="al.id"
                class="group relative rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                @click="router.push(`/album/${al.id}`)"
              >
                <div class="cover relative aspect-square w-full rounded-[12px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none mb-[10px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                  <img
                    v-if="al.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="al.cover_url"
                  />
                  <Icon v-else name="mingcute:album-line" :size="26" class="text-[color:var(--fg-faint)]" />
                  <button
                    class="absolute bottom-[8px] right-[8px] flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] p-0 text-white opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-100 group-hover:translate-y-0 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                    type="button"
                    title="Слушать альбом"
                    @click.stop="playAlbum(al.id)"
                  >
                    <Icon name="mingcute:play-fill" :size="15" />
                  </button>
                </div>
                <div class="text-[calc(13.5px*var(--text-scale,1))] font-medium truncate">{{ al.title }}</div>
                <div class="text-[calc(12px*var(--text-scale,1))] text-[color:var(--fg-faint)] truncate mt-[2px]">
                  {{ al.year ? `${al.year} · ` : '' }}{{ al.artist || 'Альбом' }}
                </div>
              </div>
            </div>
          </template>

          <!-- Таб: Плейлисты -->
          <template v-else-if="activeTab === 'playlists'">
            <div class="flex flex-wrap items-center justify-between gap-[12px] mb-[16px]">
              <div class="text-[calc(18px*var(--text-scale,1))] font-semibold tracking-[-0.02em]">
                Плейлисты ({{ result.playlists?.length || 0 }})
              </div>

              <!-- Пилюли-фильтры сортировки -->
              <div class="flex items-center gap-[6px] overflow-x-auto [scrollbar-width:none]">
                <button
                  v-for="opt in playlistSortOptions"
                  :key="opt.id"
                  type="button"
                  class="px-[10px] py-[4px] rounded-full text-[11px] font-medium border border-solid transition-colors cursor-pointer select-none"
                  :class="[
                    playlistSort === opt.id
                      ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)] font-semibold'
                      : 'border-[color:var(--line)] bg-[var(--surface)] text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]',
                  ]"
                  @click="playlistSort = opt.id"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[14px]">
              <div
                v-for="pl in sortedPlaylists"
                :key="pl.kind"
                class="group relative rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)]"
                @click="router.push(`/playlists/${pl.kind}`)"
                @mouseenter="playlistPreview.scheduleHoverPreview(pl, 350)"
                @mouseleave="playlistPreview.cancelHoverPreview()"
              >
                <div class="cover relative aspect-square w-full rounded-[12px] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none mb-[10px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                  <img
                    v-if="pl.cover_url"
                    loading="lazy"
                    decoding="async"
                    :src="pl.cover_url"
                  />
                  <Icon v-else name="mingcute:playlist-2-line" :size="26" class="text-[color:var(--fg-faint)]" />

                  <!-- Кнопка лайка -->
                  <button
                    type="button"
                    class="absolute top-[8px] right-[8px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-0 bg-black/50 backdrop-blur-sm p-0 transition-all duration-[140ms]"
                    :class="[
                      library.isPlaylistLiked(pl)
                        ? 'text-[var(--accent)] opacity-100 scale-100'
                        : 'text-white opacity-0 group-hover:opacity-100 hover:scale-110',
                    ]"
                    :title="library.isPlaylistLiked(pl) ? 'Удалить из коллекции' : 'Добавить в коллекцию'"
                    @click.stop="library.togglePlaylistLike(pl)"
                  >
                    <Icon
                      :name="library.isPlaylistLiked(pl) ? 'mingcute:heart-fill' : 'mingcute:heart-line'"
                      :size="15"
                    />
                  </button>

                  <!-- Кнопки управления на обложке: Play и Добавить в очередь -->
                  <div class="absolute bottom-[8px] right-[8px] flex items-center gap-[6px] opacity-0 translate-y-[6px] transition-[opacity,transform] duration-[140ms] ease-[ease] group-hover:opacity-100 group-hover:translate-y-0">
                    <button
                      class="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full border-0 bg-black/60 backdrop-blur-sm p-0 text-white hover:bg-black/80 hover:scale-105 active:scale-95 shadow-md"
                      type="button"
                      title="Добавить в очередь"
                      @click.stop="enqueuePlaylist(pl)"
                    >
                      <Icon name="mingcute:list-plus-line" :size="15" />
                    </button>

                    <button
                      class="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] p-0 text-white hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      type="button"
                      title="Слушать плейлист"
                      @click.stop="playPlaylist(pl)"
                    >
                      <Icon name="mingcute:play-fill" :size="15" class="ml-[1px]" />
                    </button>
                  </div>
                </div>

                <div class="text-[calc(13.5px*var(--text-scale,1))] font-medium truncate">{{ pl.title }}</div>
                <div class="text-[calc(12px*var(--text-scale,1))] text-[color:var(--fg-faint)] truncate mt-[2px]">
                  Плейлист · {{ pl.track_count }} треков
                </div>

                <!-- Превью первых треков плейлиста -->
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[0, 8]"
                  class="bg-[var(--surface-2)] text-[color:var(--fg)] border border-[color:var(--line)] shadow-xl p-[10px] rounded-[12px] max-w-[280px] w-[260px]"
                >
                  <div v-if="playlistPreview.isPreviewLoading(pl)" class="flex items-center gap-[8px] text-[11px] text-[color:var(--fg-faint)]">
                    <Icon name="mingcute:loading-line" :size="14" class="animate-spin text-[var(--accent)]" />
                    <span>Загрузка превью треков...</span>
                  </div>
                  <div v-else-if="playlistPreview.getPreview(pl)?.length" class="flex flex-col gap-[6px]">
                    <div class="text-[10px] uppercase font-semibold tracking-wider text-[color:var(--fg-faint)]">
                      Первые треки:
                    </div>
                    <div
                      v-for="(tr, tIdx) in playlistPreview.getPreview(pl)!.slice(0, 3)"
                      :key="tr.id || tIdx"
                      class="flex items-center justify-between text-[11px] gap-[8px]"
                    >
                      <div class="min-w-0 truncate">
                        <span class="font-medium text-[color:var(--fg)]">{{ tr.title }}</span>
                        <span class="text-[color:var(--fg-faint)] ml-[4px]">· {{ tr.artists.map((a) => a.name).join(', ') }}</span>
                      </div>
                      <span class="text-[10px] font-mono text-[color:var(--fg-faint)] flex-none">
                        {{ formatDuration(tr.duration_ms || 0) }}
                      </span>
                    </div>
                  </div>
                  <div v-else class="text-[11px] text-[color:var(--fg-faint)]">
                    Плейлист: {{ pl.title }}
                  </div>
                </q-tooltip>

                <!-- Контекстное меню (ПКМ) -->
                <q-menu context-menu>
                  <q-list dense class="min-w-[190px] py-[4px] bg-[var(--surface)] text-[color:var(--fg)] border border-[color:var(--line)] rounded-[var(--radius,10px)]">
                    <q-item clickable v-close-popup @click="playPlaylist(pl)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon name="mingcute:play-fill" :size="15" class="text-[var(--accent)]" />
                      </q-item-section>
                      <q-item-section class="text-[12.5px]">Слушать плейлист</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="playPlaylistNext(pl)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon name="mingcute:skip-forward-line" :size="15" />
                      </q-item-section>
                      <q-item-section class="text-[12.5px]">Включить следующим</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="enqueuePlaylist(pl)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon name="mingcute:list-plus-line" :size="15" />
                      </q-item-section>
                      <q-item-section class="text-[12.5px]">Добавить в очередь</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="player.waveByPlaylist(pl)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon name="mingcute:wave-line" :size="15" />
                      </q-item-section>
                      <q-item-section class="text-[12.5px]">Волна по плейлисту</q-item-section>
                    </q-item>
                    <q-separator class="my-[4px] bg-[var(--line)]" />
                    <q-item clickable v-close-popup @click="library.togglePlaylistLike(pl)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon
                          :name="library.isPlaylistLiked(pl) ? 'mingcute:heart-fill' : 'mingcute:heart-line'"
                          :size="15"
                          :class="library.isPlaylistLiked(pl) ? 'text-[var(--accent)]' : ''"
                        />
                      </q-item-section>
                      <q-item-section class="text-[12.5px]">
                        {{ library.isPlaylistLiked(pl) ? 'Удалить из коллекции' : 'Добавить в коллекцию' }}
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="router.push(`/playlists/${pl.kind}`)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon name="mingcute:external-link-line" :size="15" />
                      </q-item-section>
                      <q-item-section class="text-[12.5px]">Открыть страницу</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </div>
            </div>
          </template>

          <!-- Таб: Genius -->
          <template v-else-if="activeTab === 'genius'">
            <div class="text-[calc(18px*var(--text-scale,1))] font-semibold tracking-[-0.02em] mb-[16px]">
              Авторы и продюсеры Genius ({{ genius.people.length }})
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[14px]">
              <div
                v-for="p in genius.people"
                :key="p.id"
                class="rounded-[14px] p-[10px] cursor-pointer transition-[background] duration-[160ms] ease-[ease] hover:bg-[var(--surface)] text-center"
                @click="openPerson(p.id)"
              >
                <div class="cover cover-round relative aspect-square w-full rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center flex-none mb-[10px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
                  <img
                    v-if="p.image"
                    loading="lazy"
                    decoding="async"
                    :src="p.image"
                  />
                  <Icon v-else name="mingcute:user-2-line" :size="28" class="text-[color:var(--fg-faint)]" />
                </div>
                <div class="text-[calc(13.5px*var(--text-scale,1))] font-medium truncate">{{ p.name }}</div>
                <div class="text-[color:var(--fg-faint)] text-[calc(11px*var(--text-scale,1))] mt-[2px]">
                  {{ p.verified ? "genius · ✓" : "genius" }}
                </div>
              </div>
            </div>
          </template>
        </template>

        <!-- Пустой результат поиска -->
        <div
          v-else-if="result && !hasResults"
          class="flex flex-col items-center justify-center text-center py-[72px] px-[20px]"
        >
          <div class="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-[var(--surface-2)] text-[color:var(--fg-faint)] mb-[18px]">
            <Icon name="mingcute:search-line" :size="28" />
          </div>
          <div class="text-[calc(20px*var(--text-scale,1))] font-semibold text-[color:var(--fg)] mb-[8px]">
            Ничего не нашлось по запросу «{{ text }}»
          </div>
          <p class="max-w-[440px] text-[calc(13.5px*var(--text-scale,1))] text-[color:var(--fg-dim)] leading-[1.5] mb-[20px]">
            Проверьте правильность написания, попробуйте сформулировать запрос иначе или поищите среди сохранённого.
          </p>
          <div class="flex items-center gap-[10px]">
            <button
              type="button"
              class="h-[34px] px-[16px] rounded-[10px] bg-[var(--surface)] border border-[var(--line)] text-[color:var(--fg)] text-[calc(12.5px*var(--text-scale,1))] font-medium cursor-pointer hover:bg-[var(--hover)] transition-colors"
              @click="clearQuery"
            >
              Очистить поиск
            </button>
            <button
              type="button"
              class="h-[34px] px-[16px] rounded-[10px] bg-[var(--surface-2)] border border-[var(--line)] text-[color:var(--fg)] text-[calc(12.5px*var(--text-scale,1))] font-medium cursor-pointer hover:bg-[var(--hover)] transition-colors inline-flex items-center gap-[6px]"
              @click="router.push('/library')"
            >
              <Icon name="mingcute:filter-line" :size="14" />
              <span>Поиск по библиотеке</span>
            </button>
          </div>
        </div>

        <!-- Стартовый экран поиска (когда строка поиска пуста) -->
        <div v-else class="flex flex-col gap-[36px]">
          <!-- 2. Чипы истории запросов -->
          <div v-if="searchHistory.history.value.length" class="flex flex-col gap-[12px]">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[8px] text-[calc(16px*var(--text-scale,1))] font-semibold text-[color:var(--fg)]">
                <Icon name="mingcute:history-line" :size="17" class="text-[color:var(--fg-faint)]" />
                <span>История поиска</span>
              </div>
              <div class="flex items-center gap-[12px]">
                <button
                  type="button"
                  class="text-[calc(12px*var(--text-scale,1))] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] transition-colors p-0 border-0 bg-transparent cursor-pointer font-medium"
                  title="Очистить незакрепленные запросы"
                  @click="searchHistory.clear(true)"
                >
                  Очистить историю
                </button>
                <button
                  v-if="hasPinnedHistory"
                  type="button"
                  class="text-[calc(11.5px*var(--text-scale,1))] text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] transition-colors p-0 border-0 bg-transparent cursor-pointer"
                  title="Очистить вообще всё, включая закрепленные"
                  @click="searchHistory.clear(false)"
                >
                  (полностью)
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-[8px]">
              <div
                v-for="item in searchHistory.history.value"
                :key="item.query"
                class="group inline-flex items-center gap-[7px] h-[32px] pl-[12px] pr-[8px] rounded-full text-[calc(13px*var(--text-scale,1))] cursor-pointer transition-[background,border-color,color] duration-[120ms] border border-solid select-none"
                :class="[
                  item.pinned
                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))] text-[color:var(--fg)] font-medium'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--surface-2)]',
                ]"
                @click="pickHistory(item.query)"
              >
                <!-- Иконка булавки или лупы -->
                <Icon
                  :name="item.pinned ? 'mingcute:pin-2-fill' : 'mingcute:search-2-line'"
                  :size="13"
                  :class="item.pinned ? 'text-[var(--accent)]' : 'text-[color:var(--fg-faint)] group-hover:text-[color:var(--fg)]'"
                />
                <span class="max-w-[200px] truncate">{{ item.query }}</span>

                <!-- Кнопка переключения Pin при наведении -->
                <button
                  type="button"
                  class="flex items-center justify-center w-[18px] h-[18px] rounded-full border-0 p-0 bg-transparent cursor-pointer transition-colors opacity-0 group-hover:opacity-100 hover:text-[var(--accent)]"
                  :class="item.pinned ? 'opacity-100 text-[var(--accent)]' : 'text-[color:var(--fg-faint)]'"
                  :title="item.pinned ? 'Открепить' : 'Закрепить'"
                  @click.stop="searchHistory.togglePin(item.query)"
                >
                  <Icon :name="item.pinned ? 'mingcute:pin-2-fill' : 'mingcute:pin-2-line'" :size="12" />
                </button>

                <!-- Кнопка удаления из истории -->
                <button
                  type="button"
                  class="flex items-center justify-center w-[18px] h-[18px] rounded-full text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] border-0 p-0 bg-transparent cursor-pointer transition-colors"
                  title="Удалить из истории"
                  @click.stop="searchHistory.remove(item.query)"
                >
                  <Icon name="mingcute:close-line" :size="12" />
                </button>

                <!-- Контекстное меню чипа истории (ПКМ) -->
                <q-menu context-menu>
                  <q-list dense class="min-w-[170px] py-[4px] bg-[var(--surface)] text-[color:var(--fg)] border border-[color:var(--line)] rounded-[var(--radius,10px)]">
                    <q-item clickable v-close-popup @click="pickHistory(item.query)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon name="mingcute:search-2-line" :size="15" />
                      </q-item-section>
                      <q-item-section class="text-[12.5px]">Искать</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="searchHistory.togglePin(item.query)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon name="mingcute:pin-2-line" :size="15" />
                      </q-item-section>
                      <q-item-section class="text-[12.5px]">
                        {{ item.pinned ? 'Открепить' : 'Закрепить' }}
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="copyQuery(item.query)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon name="mingcute:copy-2-line" :size="15" />
                      </q-item-section>
                      <q-item-section class="text-[12.5px]">Скопировать запрос</q-item-section>
                    </q-item>
                    <q-separator class="my-[4px] bg-[var(--line)]" />
                    <q-item clickable v-close-popup @click="searchHistory.remove(item.query)">
                      <q-item-section avatar class="min-w-0 pr-[8px]">
                        <Icon name="mingcute:delete-2-line" :size="15" class="text-red-400" />
                      </q-item-section>
                      <q-item-section class="text-[12.5px] text-red-400">Удалить из истории</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </div>
            </div>
          </div>

          <!-- 3. Быстрый бар «Недавние станции» -->
          <div
            v-if="!isGridEditing && recentStations.recentStations.value.length"
            class="flex flex-col gap-[10px]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[8px] text-[calc(14.5px*var(--text-scale,1))] font-semibold text-[color:var(--fg)]">
                <Icon name="mingcute:wave-line" :size="16" class="text-[var(--accent)]" />
                <span>Недавние станции</span>
              </div>
              <button
                type="button"
                class="text-[11.5px] text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] transition-colors p-0 border-0 bg-transparent cursor-pointer"
                @click="recentStations.clearRecent"
              >
                Очистить
              </button>
            </div>

            <div class="flex items-center gap-[8px] overflow-x-auto pb-[4px] [scrollbar-width:thin]">
              <button
                v-for="st in recentStations.recentStations.value"
                :key="st.station"
                type="button"
                class="group flex items-center gap-[8px] h-[34px] px-[12px] rounded-full border border-solid border-[color:var(--line)] bg-[var(--surface)] text-[calc(12.5px*var(--text-scale,1))] text-[color:var(--fg)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] transition-all cursor-pointer whitespace-nowrap select-none"
                @click="playStation(st.station, st.title, st.icon, st.gradient)"
              >
                <div
                  class="flex items-center justify-center w-[20px] h-[20px] rounded-full text-white text-[10px] flex-none shadow-sm"
                  :style="{ background: st.gradient || 'var(--accent)' }"
                >
                  <Icon :name="st.icon || 'mingcute:wave-line'" :size="11" />
                </div>
                <span class="font-medium">{{ st.title }}</span>
                <Icon name="mingcute:play-fill" :size="12" class="opacity-0 group-hover:opacity-100 text-[var(--accent)] transition-opacity ml-[2px]" />
              </button>
            </div>
          </div>

          <!-- 4. Сетка карточек быстрого выбора («Моя волна») -->
          <div class="flex flex-col gap-[16px]">
            <div class="flex flex-wrap items-center justify-between gap-[12px]">
              <div>
                <div class="text-[calc(18px*var(--text-scale,1))] font-semibold tracking-[-0.02em] text-[color:var(--fg)]">
                  «Моя волна» по настроению и жанрам
                </div>
                <p class="mt-[3px] mx-0 mb-0 text-[calc(13px*var(--text-scale,1))] text-[color:var(--fg-dim)]">
                  Кликните на карточку для мгновенного запуска радиопотока
                </p>
              </div>

              <!-- Переключатель режима настройки сетки -->
              <div class="flex items-center gap-[8px]">
                <button
                  type="button"
                  class="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[10px] border border-solid text-[12px] font-medium cursor-pointer transition-colors select-none"
                  :class="[
                    isGridEditing
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm'
                      : 'border-[color:var(--line)] bg-[var(--surface)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--surface-2)]',
                  ]"
                  @click="isGridEditing = !isGridEditing"
                >
                  <Icon :name="isGridEditing ? 'mingcute:check-line' : 'mingcute:settings-3-line'" :size="14" />
                  <span>{{ isGridEditing ? 'Готово' : 'Настроить сетку' }}</span>
                </button>
              </div>
            </div>

            <!-- Табы категорий карточек -->
            <div class="flex items-center gap-[8px] overflow-x-auto [scrollbar-width:none]">
              <button
                v-for="gTab in gridTabs"
                :key="gTab.id"
                type="button"
                class="flex items-center gap-[6px] h-[30px] px-[12px] rounded-full text-[12px] font-medium cursor-pointer transition-[background,border-color,color] duration-[180ms] ease-out border border-solid select-none whitespace-nowrap"
                :class="[
                  activeGridTab === gTab.id
                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--accent)] font-semibold'
                    : 'border-[color:var(--line)] bg-[var(--surface)] text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]',
                ]"
                @click="activeGridTab = gTab.id"
              >
                <span>{{ gTab.label }}</span>
                <span
                  class="text-[10px] px-[5px] py-[1px] rounded-full"
                  :class="activeGridTab === gTab.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] text-[color:var(--fg-faint)]'"
                >
                  {{ gridCategoryCounts[gTab.id] }}
                </span>
              </button>
            </div>

            <!-- Тулбар режима редактирования сетки -->
            <div
              v-if="isGridEditing"
              class="flex flex-wrap items-center justify-between gap-[12px] p-[12px] rounded-[14px] bg-[var(--surface-2)] border border-solid border-[color:var(--line)]"
            >
              <div class="flex flex-wrap items-center gap-[8px]">
                <button
                  type="button"
                  class="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-[var(--accent)] text-white text-[12px] font-semibold cursor-pointer shadow-sm hover:opacity-90 transition-opacity border-0"
                  @click="openAddCardDialog"
                >
                  <Icon name="mingcute:add-line" :size="14" />
                  <span>Добавить карточку</span>
                </button>

                <!-- Плотность сетки -->
                <div class="flex items-center gap-[3px] p-[2px] rounded-[8px] bg-[var(--surface)] border border-[color:var(--line)]">
                  <button
                    v-for="d in densityOptions"
                    :key="d.id"
                    type="button"
                    :title="d.label"
                    class="px-[8px] py-[4px] rounded-[6px] text-[11px] font-medium border-0 cursor-pointer transition-colors"
                    :class="[
                      searchGrid.density.value === d.id
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-transparent text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]',
                    ]"
                    @click="searchGrid.setDensity(d.id)"
                  >
                    {{ d.label }}
                  </button>
                </div>

                <!-- Высота карточек -->
                <div class="flex items-center gap-[3px] p-[2px] rounded-[8px] bg-[var(--surface)] border border-[color:var(--line)]">
                  <button
                    v-for="h in heightOptions"
                    :key="h.id"
                    :title="h.label"
                    class="px-[8px] py-[4px] rounded-[6px] text-[11px] font-medium border-0 cursor-pointer transition-colors"
                    :class="[
                      searchGrid.cardHeight.value === h.id
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-transparent text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]',
                    ]"
                    @click="searchGrid.setCardHeight(h.id)"
                  >
                    {{ h.label }}
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-[8px]">
                <!-- Экспорт в JSON -->
                <button
                  type="button"
                  class="inline-flex items-center gap-[5px] h-[30px] px-[10px] rounded-[8px] border border-solid border-[color:var(--line)] bg-[var(--surface)] text-[11.5px] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] cursor-pointer"
                  title="Экспортировать настройки в JSON"
                  @click="downloadGridConfig"
                >
                  <Icon name="mingcute:download-2-line" :size="13" />
                  <span>Экспорт</span>
                </button>

                <!-- Импорт из JSON -->
                <button
                  type="button"
                  class="inline-flex items-center gap-[5px] h-[30px] px-[10px] rounded-[8px] border border-solid border-[color:var(--line)] bg-[var(--surface)] text-[11.5px] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] cursor-pointer"
                  title="Импортировать настройки из JSON файла"
                  @click="triggerImportFile"
                >
                  <Icon name="mingcute:upload-2-line" :size="13" />
                  <span>Импорт</span>
                </button>
                <input
                  ref="importFileInputRef"
                  type="file"
                  accept=".json,application/json"
                  class="hidden"
                  @change="onImportConfigFile"
                />

                <!-- Сброс к дефолтным -->
                <button
                  type="button"
                  class="inline-flex items-center gap-[5px] h-[30px] px-[10px] rounded-[8px] border border-solid border-[color:var(--line)] bg-[var(--surface)] text-[11.5px] text-[color:var(--fg-faint)] hover:text-red-400 hover:border-red-400/40 cursor-pointer"
                  title="Сбросить карточки к начальным настройкам"
                  @click="resetGridWithConfirm"
                >
                  <Icon name="mingcute:refresh-3-line" :size="13" />
                  <span>Сброс</span>
                </button>
              </div>
            </div>

            <!-- Сама сетка карточек с анимацией смены вкладок и FLIP-анимацией DnD -->
            <Transition name="tab-fade" mode="out-in">
              <div :key="activeGridTab">
                <TransitionGroup
                  v-if="currentCategoryCards.length"
                  name="card-grid"
                  tag="div"
                  class="grid"
                  :class="gridColumnsClass"
                >
                  <div
                    v-for="(card, cIdx) in currentCategoryCards"
                    :key="card.id"
                    tabindex="0"
                    :ref="(el) => setCardRef(el, cIdx)"
                    :draggable="isGridEditing"
                    class="group relative flex flex-col justify-between rounded-[16px] overflow-hidden select-none outline-none focus-visible:ring-2 ring-[var(--accent)] transition-[height,padding,font-size,transform,box-shadow,ring] duration-250 ease-out"
                    :class="[
                      card.colSpan === 2 ? 'col-span-2' : 'col-span-1',
                      cardHeightClass,
                      cardDensityClass,
                      isGridEditing ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-pointer hover:scale-[1.025] shadow-sm',
                      draggingCardId === card.id ? 'opacity-35 scale-[0.98]' : '',
                    ]"
                    :style="{ background: card.gradient }"
                    @click="onCardClick(card)"
                    @keydown="onCardKeydown($event, cIdx, card)"
                    @dragstart="onCardDragStart($event, card)"
                    @dragover="onCardDragOver($event, card)"
                    @dragleave="onCardDragLeave($event, card)"
                    @drop="onCardDrop($event, card)"
                    @dragend="onCardDragEnd"
                  >
                    <!-- Линия подсветки точки вставки DnD -->
                    <div
                      v-if="dropTargetCardId === card.id && dropPosition === 'before'"
                      class="absolute left-0 top-0 bottom-0 w-[4px] bg-white rounded-l shadow-[0_0_10px_white] z-30 pointer-events-none"
                    />
                    <div
                      v-if="dropTargetCardId === card.id && dropPosition === 'after'"
                      class="absolute right-0 top-0 bottom-0 w-[4px] bg-white rounded-r shadow-[0_0_10px_white] z-30 pointer-events-none"
                    />

                    <!-- Кнопка скрыть карточку (в верхнем правом углу в режиме редактирования) -->
                    <button
                      v-if="isGridEditing"
                      type="button"
                      class="absolute top-[8px] right-[8px] z-20 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/60 text-white/90 hover:bg-red-500 hover:text-white transition-all border-0 cursor-pointer shadow-md"
                      title="Скрыть карточку"
                      @click.stop="searchGrid.removeCard(card.id)"
                    >
                      <Icon name="mingcute:close-line" :size="13" />
                    </button>

                    <!-- Фоновая иконка карточки -->
                    <Icon
                      :name="card.icon"
                      :size="card.colSpan === 2 ? 80 : 64"
                      class="absolute -bottom-2 -right-2 text-white/15 pointer-events-none rotate-[-12deg] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
                    />

                    <!-- Название карточки -->
                    <div class="relative z-10 flex items-start justify-between gap-[6px] pr-[20px]">
                      <span class="text-[inherit] font-bold text-white tracking-tight leading-[1.15] truncate">
                        {{ card.title }}
                      </span>
                    </div>

                    <!-- Нижняя панель карточки -->
                    <div class="relative z-10 flex items-end justify-between gap-[6px] w-full">
                      <!-- Обычный режим: бейдж "Моя волна" -->
                      <span
                        v-if="!isGridEditing"
                        class="inline-flex items-center gap-[4px] text-[11px] font-medium text-white/90 bg-black/25 px-[7px] py-[2px] rounded-full backdrop-blur-sm"
                      >
                        <Icon name="mingcute:wave-line" :size="12" />
                        <span>Моя волна</span>
                      </span>

                      <!-- Режим правки: плашка с иконкой перемещения -->
                      <div
                        v-else
                        class="inline-flex items-center gap-[4px] text-[10.5px] font-medium text-white/75 bg-black/35 px-[6px] py-[2px] rounded-full backdrop-blur-sm pointer-events-none"
                      >
                        <Icon name="mingcute:drag-move-line" :size="12" />
                        <span>Переместить</span>
                      </div>

                      <!-- Кнопки в обычном режиме (Play и Shuffle) -->
                      <div
                        v-if="!isGridEditing"
                        class="flex items-center gap-[6px] opacity-0 translate-y-[4px] transition-[opacity,transform] duration-150 group-hover:opacity-100 group-hover:translate-y-0"
                      >
                        <button
                          type="button"
                          class="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white shadow-md hover:scale-105 active:scale-95 border-0 cursor-pointer"
                          title="Случайный порядок треков"
                          @click.stop="playWaveShuffle(card)"
                        >
                          <Icon name="mingcute:shuffle-line" :size="14" />
                        </button>

                        <button
                          type="button"
                          class="flex h-[32px] w-[32px] flex-none items-center justify-center rounded-full bg-white text-black shadow-md hover:scale-105 active:scale-95 border-0 cursor-pointer"
                          title="Слушать Мою волну"
                          @click.stop="playWave(card)"
                        >
                          <Icon name="mingcute:play-fill" :size="15" class="ml-[1px] text-black" />
                        </button>
                      </div>

                      <!-- Кнопки в режиме редактирования сетки -->
                      <div
                        v-else
                        class="flex items-center gap-[4px] bg-black/60 p-[3px] rounded-full backdrop-blur-sm"
                      >
                        <button
                          type="button"
                          class="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 border-0 cursor-pointer"
                          :title="card.colSpan === 2 ? 'Сделать 1x1' : 'Сделать 2x1'"
                          @click.stop="searchGrid.toggleCardSpan(card.id)"
                        >
                          <Icon :name="card.colSpan === 2 ? 'mingcute:aspect-ratio-line' : 'mingcute:fullscreen-line'" :size="12" />
                        </button>
                        <button
                          type="button"
                          class="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 border-0 cursor-pointer"
                          title="Редактировать"
                          @click.stop="openEditCardDialog(card)"
                        >
                          <Icon name="mingcute:edit-2-line" :size="12" />
                        </button>
                      </div>
                    </div>

                    <!-- Контекстное меню карточки (ПКМ) -->
                    <q-menu context-menu>
                      <q-list dense class="min-w-[190px] py-[4px] bg-[var(--surface)] text-[color:var(--fg)] border border-[color:var(--line)] rounded-[var(--radius,10px)]">
                        <q-item clickable v-close-popup @click="playWave(card)">
                          <q-item-section avatar class="min-w-0 pr-[8px]">
                            <Icon name="mingcute:play-fill" :size="15" class="text-[var(--accent)]" />
                          </q-item-section>
                          <q-item-section class="text-[12.5px]">Запустить «Мою волну»</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="playWaveShuffle(card)">
                          <q-item-section avatar class="min-w-0 pr-[8px]">
                            <Icon name="mingcute:shuffle-line" :size="15" />
                          </q-item-section>
                          <q-item-section class="text-[12.5px]">Случайный микс</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="searchGrid.toggleCardSpan(card.id)">
                          <q-item-section avatar class="min-w-0 pr-[8px]">
                            <Icon :name="card.colSpan === 2 ? 'mingcute:aspect-ratio-line' : 'mingcute:fullscreen-line'" :size="15" />
                          </q-item-section>
                          <q-item-section class="text-[12.5px]">
                            {{ card.colSpan === 2 ? 'Уменьшить (1x1)' : 'Расширить (2x1)' }}
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="openEditCardDialog(card)">
                          <q-item-section avatar class="min-w-0 pr-[8px]">
                            <Icon name="mingcute:edit-2-line" :size="15" />
                          </q-item-section>
                          <q-item-section class="text-[12.5px]">Редактировать</q-item-section>
                        </q-item>
                        <q-separator class="my-[4px] bg-[var(--line)]" />
                        <q-item clickable v-close-popup @click="searchGrid.removeCard(card.id)">
                          <q-item-section avatar class="min-w-0 pr-[8px]">
                            <Icon name="mingcute:eye-close-line" :size="15" class="text-red-400" />
                          </q-item-section>
                          <q-item-section class="text-[12.5px] text-red-400">Скрыть карточку</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </div>
                </TransitionGroup>

                <!-- Сообщение, если в табе нет карточек -->
                <div
                  v-else
                  class="py-[32px] text-center text-[13px] text-[color:var(--fg-faint)] flex flex-col items-center gap-[8px]"
                >
                  <Icon name="mingcute:inbox-line" :size="28" />
                  <span>В этом разделе пока нет карточек</span>
                  <button
                    type="button"
                    class="mt-[4px] px-[12px] py-[5px] rounded-[8px] bg-[var(--surface-2)] text-[12px] text-[color:var(--fg)] border border-[color:var(--line)] hover:bg-[var(--hover)] cursor-pointer"
                    @click="openAddCardDialog"
                  >
                    + Добавить карточку
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- 4.1 Полка «Скрытые карточки» (drop-zone и быстрое восстановление) -->
          <div
            v-if="searchGrid.hasHiddenCards.value || isGridEditing"
            class="flex flex-col gap-[12px] p-[16px] rounded-[16px] border border-dashed transition-all duration-200"
            :class="[
              isDragOverHiddenShelf
                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface-2))] shadow-lg scale-[1.005]'
                : searchGrid.hasHiddenCards.value
                  ? 'border-[color:var(--line)] bg-[var(--surface)]'
                  : 'border-[color:var(--line)]/60 bg-[var(--surface-2)]/40',
            ]"
            @dragover="onHiddenShelfDragOver"
            @dragleave="onHiddenShelfDragLeave"
            @drop="onHiddenShelfDrop"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[8px]">
                <Icon
                  name="mingcute:eye-close-line"
                  :size="16"
                  :class="searchGrid.hasHiddenCards.value ? 'text-[var(--accent)]' : 'text-[color:var(--fg-faint)]'"
                />
                <span class="text-[calc(14px*var(--text-scale,1))] font-semibold text-[color:var(--fg)]">
                  Скрытые карточки
                  <span v-if="searchGrid.hasHiddenCards.value" class="text-[12px] font-normal text-[color:var(--fg-dim)] ml-[4px]">
                    ({{ searchGrid.hiddenCards.value.length }})
                  </span>
                </span>
                <span v-if="isGridEditing" class="text-[11.5px] text-[color:var(--fg-faint)] ml-[6px] hidden sm:inline">
                  — перетащите карточку из сетки сюда, чтобы скрыть
                </span>
              </div>

              <button
                v-if="searchGrid.hasHiddenCards.value"
                type="button"
                class="text-[calc(12px*var(--text-scale,1))] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] transition-colors p-0 border-0 bg-transparent cursor-pointer font-medium"
                @click="searchGrid.restoreAllHidden"
              >
                Восстановить все
              </button>
            </div>

            <!-- Список скрытых карточек-миниатюр -->
            <div
              v-if="searchGrid.hiddenCards.value.length"
              class="flex flex-wrap items-center gap-[8px]"
            >
              <div
                v-for="hCard in searchGrid.hiddenCards.value"
                :key="hCard.id"
                :draggable="isGridEditing"
                class="group flex items-center gap-[8px] h-[36px] pl-[10px] pr-[6px] rounded-[10px] text-white shadow-sm select-none transition-all duration-150"
                :class="[
                  isGridEditing ? 'cursor-grab active:cursor-grabbing hover:scale-105' : '',
                  draggingCardId === hCard.id ? 'opacity-40' : '',
                ]"
                :style="{ background: hCard.gradient }"
                title="Перетащите в сетку или нажмите +, чтобы вернуть"
                @dragstart="onCardDragStart($event, hCard)"
                @dragend="onCardDragEnd"
              >
                <Icon :name="hCard.icon" :size="15" class="opacity-90 flex-none" />
                <span class="text-[12px] font-semibold truncate max-w-[150px]">{{ hCard.title }}</span>

                <!-- Кнопка вернуть (+) -->
                <button
                  type="button"
                  class="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-black/40 hover:bg-white hover:text-black text-white border-0 p-0 cursor-pointer transition-colors shadow-sm"
                  title="Вернуть на экран"
                  @click.stop="searchGrid.restoreCard(hCard.id)"
                >
                  <Icon name="mingcute:add-line" :size="13" />
                </button>
              </div>
            </div>

            <!-- Пустое состояние трея в режиме редактирования -->
            <div
              v-else
              class="py-[12px] text-center text-[12px] text-[color:var(--fg-faint)] flex items-center justify-center gap-[6px]"
            >
              <Icon name="mingcute:inbox-line" :size="16" />
              <span>Здесь появятся карточки, которые вы скроете. Перетащите сюда любую карточку для скрытия.</span>
            </div>
          </div>

          <!-- Блок перехода в библиотеку -->
          <div
            class="flex items-center justify-between gap-[16px] p-[18px] rounded-[16px] bg-[var(--surface)] border border-[var(--line)] cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
            @click="router.push('/library')"
          >
            <div class="flex items-center gap-[14px] min-w-0">
              <div class="flex items-center justify-center w-[40px] h-[40px] rounded-[12px] bg-[var(--surface-2)] text-[color:var(--accent)] flex-none">
                <Icon name="mingcute:filter-line" :size="20" />
              </div>
              <div class="min-w-0">
                <div class="text-[calc(14.5px*var(--text-scale,1))] font-semibold text-[color:var(--fg)]">
                  Ищете в своей коллекции?
                </div>
                <div class="text-[calc(12.5px*var(--text-scale,1))] text-[color:var(--fg-dim)] truncate mt-[2px]">
                  Используйте поиск по библиотеке с фильтрами по длительности, артистам и статусу лайка
                </div>
              </div>
            </div>
            <div class="flex items-center gap-[4px] text-[calc(13px*var(--text-scale,1))] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] flex-none font-medium">
              <span>В библиотеку</span>
              <Icon name="mingcute:arrow-right-line" :size="14" />
            </div>
          </div>
        </div>
      </div>
    </q-scroll-area>

    <!-- Диалог добавления / редактирования карточки Моей волны -->
    <SearchCardDialog
      v-model="cardDialogOpen"
      :card="cardToEdit"
      :existing-stations="existingStations"
      @save="onSaveCard"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import LazyTracks from "@/components/common/LazyTracks.vue";
import TrackRow from "@/components/common/TrackRow.vue";
import SearchCardDialog from "@/components/search/SearchCardDialog.vue";
import { api } from "@/api/client";
import type { Artist, Playlist, SearchResult, Track } from "@/api/types";
import type { SearchCard, GridDensity, CardHeight } from "@/types/searchGrid";
import { cachedAvatar, fetchAvatars } from "@/lib/artistAvatar";
import { formatDuration } from "@/lib/format";
import { usePlayerStore } from "@/stores/player/index";
import { useLibraryStore } from "@/stores/library";
import { useGeniusStore } from "@/stores/genius";
import { useSearchHistory } from "@/composables/useSearchHistory";
import { useSearchGrid } from "@/composables/useSearchGrid";
import { useRecentStations } from "@/composables/useRecentStations";
import { usePlaylistPreview } from "@/composables/usePlaylistPreview";
import { switchKeyboardLayout, isDifferentLayout } from "@/lib/keyboardLayout";

const route = useRoute();
const router = useRouter();
const player = usePlayerStore();
const library = useLibraryStore();
const genius = useGeniusStore();
const searchHistory = useSearchHistory();
const searchGrid = useSearchGrid();
const recentStations = useRecentStations();
const playlistPreview = usePlaylistPreview();

// Ссылка на инпут поиска для фокуса
const searchInputRef = ref<HTMLInputElement | null>(null);

const text = ref("");
const draftQuery = ref("");
const result = ref<SearchResult | null>(null);
const loading = ref(false);
const avatars = ref<Record<string, string | null>>({});

// Навигация по саджестам
const suggestions = ref<string[]>([]);
const suggestOpen = ref(false);
const highlightedSuggestIndex = ref(-1);
let suggestTimer: ReturnType<typeof setTimeout> | undefined;
let blurTimer: ReturnType<typeof setTimeout> | undefined;

// Табы результатов
type TabKey = "all" | "tracks" | "artists" | "albums" | "playlists" | "genius";
const activeTab = ref<TabKey>("all");

// Сортировка плейлистов
type PlaylistSortKey = "relevance" | "tracks_desc" | "tracks_asc" | "editorial";
const playlistSort = ref<PlaylistSortKey>("relevance");
const playlistSortOptions: { id: PlaylistSortKey; label: string }[] = [
  { id: "relevance", label: "По релевантности" },
  { id: "tracks_desc", label: "Больше треков" },
  { id: "tracks_asc", label: "Меньше треков" },
  { id: "editorial", label: "Сначала редакторские" },
];

const sortedPlaylists = computed(() => {
  const original = result.value?.playlists || [];
  if (!original.length) return [];
  const list = [...original];
  switch (playlistSort.value) {
    case "tracks_desc":
      return list.sort((a, b) => (b.track_count || 0) - (a.track_count || 0));
    case "tracks_asc":
      return list.sort((a, b) => (a.track_count || 0) - (b.track_count || 0));
    case "editorial":
      return list.sort((a, b) => {
        const aEd = a.owner_uid === null || a.owner_uid === 0 ? 1 : 0;
        const bEd = b.owner_uid === null || b.owner_uid === 0 ? 1 : 0;
        return bEd - aEd;
      });
    case "relevance":
    default:
      return list;
  }
});

// Настройка сетки карточек
const isGridEditing = ref(false);
const cardDialogOpen = ref(false);
const cardToEdit = ref<SearchCard | null>(null);
const importFileInputRef = ref<HTMLInputElement | null>(null);

type GridTabKey = "all" | "genres" | "moods" | "custom";
const activeGridTab = ref<GridTabKey>("all");

const gridTabs: { id: GridTabKey; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "genres", label: "Жанры" },
  { id: "moods", label: "Настроения" },
  { id: "custom", label: "Мои карточки" },
];

const densityOptions: { id: GridDensity; label: string }[] = [
  { id: "compact", label: "Компактно" },
  { id: "normal", label: "Стандарт" },
  { id: "spacious", label: "Просторно" },
];

const heightOptions: { id: CardHeight; label: string }[] = [
  { id: "compact", label: "Низкие" },
  { id: "normal", label: "Средние" },
  { id: "spacious", label: "Высокие" },
];

function isCustomCard(c: SearchCard): boolean {
  return !c.isDefault || c.id.startsWith("custom_");
}

function isMoodCard(c: SearchCard): boolean {
  const ws = c.waveStation.toLowerCase();
  return ws.startsWith("mood:") || ws.startsWith("activity:");
}

function isGenreCard(c: SearchCard): boolean {
  const ws = c.waveStation.toLowerCase();
  return ws.startsWith("genre:") || ws.startsWith("artist:");
}

const currentCategoryCards = computed(() => {
  const list = searchGrid.visibleCards.value;
  if (activeGridTab.value === "all") return list;
  if (activeGridTab.value === "genres") return list.filter(isGenreCard);
  if (activeGridTab.value === "moods") return list.filter(isMoodCard);
  if (activeGridTab.value === "custom") return list.filter(isCustomCard);
  return list;
});

const gridCategoryCounts = computed(() => {
  const list = searchGrid.visibleCards.value;
  return {
    all: list.length,
    genres: list.filter(isGenreCard).length,
    moods: list.filter(isMoodCard).length,
    custom: list.filter(isCustomCard).length,
  };
});

const gridColumnsClass = computed(() => {
  switch (searchGrid.density.value) {
    case "compact":
      return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-[8px]";
    case "spacious":
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]";
    case "normal":
    default:
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[12px]";
  }
});

const cardHeightClass = computed(() => {
  switch (searchGrid.cardHeight.value) {
    case "compact":
      return "h-[88px]";
    case "spacious":
      return "h-[126px]";
    case "normal":
    default:
      return "h-[106px]";
  }
});

const cardDensityClass = computed(() => {
  switch (searchGrid.density.value) {
    case "compact":
      return "p-[10px] text-[13px]";
    case "spacious":
      return "p-[18px] text-[17px]";
    case "normal":
    default:
      return "p-[14px] text-[15px]";
  }
});

// Drag and Drop логика перестановки карточек и взаимодействия с полкой скрытых
const draggingCardId = ref<string | null>(null);
const dropTargetCardId = ref<string | null>(null);
const dropPosition = ref<"before" | "after" | null>(null);
const isDragOverHiddenShelf = ref(false);

function onCardDragStart(e: DragEvent, card: SearchCard) {
  if (!isGridEditing.value) return;
  draggingCardId.value = card.id;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
  }
}

function onCardDragOver(e: DragEvent, card: SearchCard) {
  if (!draggingCardId.value || draggingCardId.value === card.id) return;
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const midX = rect.left + rect.width / 2;
  const pos = e.clientX < midX ? "before" : "after";
  dropTargetCardId.value = card.id;
  dropPosition.value = pos;
}

function onCardDragLeave(e: DragEvent, card: SearchCard) {
  if (dropTargetCardId.value === card.id) {
    const related = e.relatedTarget as Node | null;
    if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
      dropTargetCardId.value = null;
      dropPosition.value = null;
    }
  }
}

function onCardDrop(e: DragEvent, targetCard: SearchCard) {
  e.preventDefault();
  const sourceId = draggingCardId.value || e.dataTransfer?.getData("text/plain");
  if (!sourceId || sourceId === targetCard.id) {
    onCardDragEnd();
    return;
  }
  const pos = dropPosition.value || "before";
  const sourceCard = searchGrid.cards.value.find((c) => c.id === sourceId);
  if (sourceCard?.hidden) {
    searchGrid.restoreCard(sourceId);
  }
  searchGrid.insertCardRelative(sourceId, targetCard.id, pos);
  onCardDragEnd();
}

function onCardDragEnd() {
  draggingCardId.value = null;
  dropTargetCardId.value = null;
  dropPosition.value = null;
  isDragOverHiddenShelf.value = false;
}

function onHiddenShelfDragOver(e: DragEvent) {
  if (!draggingCardId.value) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  isDragOverHiddenShelf.value = true;
}

function onHiddenShelfDragLeave() {
  isDragOverHiddenShelf.value = false;
}

function onHiddenShelfDrop(e: DragEvent) {
  e.preventDefault();
  const sourceId = draggingCardId.value || e.dataTransfer?.getData("text/plain");
  if (sourceId) {
    searchGrid.removeCard(sourceId);
    Notify.create({ message: "Карточка скрыта", type: "info" });
  }
  onCardDragEnd();
}

const existingStations = computed(() =>
  searchGrid.cards.value.map((c) => c.waveStation),
);

const hasPinnedHistory = computed(() =>
  searchHistory.history.value.some((i) => i.pinned),
);

// Доступность карточек и навигация стрелками
const cardElements: (HTMLElement | null)[] = [];
function setCardRef(el: unknown, idx: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dom = (el as any)?.$el ?? el;
  cardElements[idx] = dom instanceof HTMLElement ? dom : null;
}

function onCardKeydown(event: KeyboardEvent, idx: number, card: SearchCard) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onCardClick(card);
    return;
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    const next = cardElements[idx + 1];
    if (next) next.focus();
    return;
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    const prev = cardElements[idx - 1];
    if (prev) prev.focus();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    searchInputRef.value?.focus();
    return;
  }
}

function onCardClick(card: SearchCard) {
  if (isGridEditing.value) {
    openEditCardDialog(card);
  } else {
    playWave(card);
  }
}

function playWave(card: SearchCard) {
  recentStations.recordStation(card.waveStation, card.title, card.icon, card.gradient);
  void player.startWave(card.waveStation, card.title);
  void router.push("/wave");
}

function playWaveShuffle(card: SearchCard) {
  recentStations.recordStation(card.waveStation, card.title, card.icon, card.gradient);
  void player.startWave(card.waveStation, card.title).then(() => {
    if (!player.shuffle) player.toggleShuffle();
  });
  void router.push("/wave");
}

function playStation(station: string, title: string, icon?: string, gradient?: string) {
  recentStations.recordStation(station, title, icon, gradient);
  void player.startWave(station, title);
  void router.push("/wave");
}

function openAddCardDialog() {
  cardToEdit.value = null;
  cardDialogOpen.value = true;
}

function openEditCardDialog(card: SearchCard) {
  cardToEdit.value = card;
  cardDialogOpen.value = true;
}

function onSaveCard(payload: Omit<SearchCard, "id"> | SearchCard) {
  if ("id" in payload && payload.id) {
    searchGrid.updateCard(payload.id, payload);
    Notify.create({ message: "Карточка обновлена", type: "positive" });
  } else {
    searchGrid.addCard(payload);
    Notify.create({ message: "Карточка добавлена на экран", type: "positive" });
  }
}

function downloadGridConfig() {
  const jsonStr = searchGrid.exportConfig();
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "yandex-music-grid.json";
  a.click();
  URL.revokeObjectURL(url);
  Notify.create({ message: "Конфигурация экспортирована в JSON", type: "positive" });
}

function triggerImportFile() {
  importFileInputRef.value?.click();
}

function onImportConfigFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result;
    if (typeof content === "string") {
      const res = searchGrid.importConfig(content);
      if (res.success) {
        Notify.create({ message: "Сетка успешно импортирована!", type: "positive" });
      } else {
        Notify.create({ message: res.error || "Ошибка импорта файла", type: "negative" });
      }
    }
  };
  reader.readAsText(file);
  (e.target as HTMLInputElement).value = "";
}

function resetGridWithConfirm() {
  if (window.confirm("Сбросить сетку карточек к исходным настройкам?")) {
    searchGrid.resetToDefaults();
    Notify.create({ message: "Сетка сброшена к дефолтным значениям", type: "info" });
  }
}

// 1. Механики поиска и стрелок
function onInputArrow(dir: "up" | "down") {
  if (suggestOpen.value && suggestions.value.length) {
    if (highlightedSuggestIndex.value === -1) {
      draftQuery.value = text.value;
    }
    const max = suggestions.value.length;
    if (dir === "down") {
      highlightedSuggestIndex.value = (highlightedSuggestIndex.value + 1) % max;
    } else {
      highlightedSuggestIndex.value =
        highlightedSuggestIndex.value <= 0
          ? max - 1
          : highlightedSuggestIndex.value - 1;
    }
    text.value = suggestions.value[highlightedSuggestIndex.value];
    return;
  }

  // Если саджесты закрыты, листаем историю
  const hist = searchHistory.history.value;
  if (!text.value.trim() && hist.length) {
    if (dir === "down" && hist.length) {
      text.value = hist[0].query;
    }
  }
}

function onInputEsc() {
  if (suggestOpen.value) {
    closeSuggest();
    if (draftQuery.value) {
      text.value = draftQuery.value;
      draftQuery.value = "";
    }
  } else {
    // Передаем фокус на первую карточку сетки
    if (cardElements[0]) {
      cardElements[0].focus();
    }
  }
}

function onInputFocus() {
  suggestOpen.value = true;
  highlightedSuggestIndex.value = -1;
}

function copyQuery(query: string) {
  void navigator.clipboard.writeText(query);
  Notify.create({ message: "Запрос скопирован в буфер", type: "info" });
}

// Поиск и результаты
const hasResults = computed(() => {
  if (!result.value) return false;
  return Boolean(
    result.value.tracks.length ||
    result.value.artists.length ||
    result.value.albums.length ||
    (result.value.playlists && result.value.playlists.length) ||
    (genius.ready && genius.people.length)
  );
});

const availableTabs = computed(() => {
  if (!result.value) return [];
  const tabs: { id: TabKey; label: string; count?: number }[] = [
    { id: "all", label: "Все" },
  ];
  if (result.value.tracks.length) {
    tabs.push({ id: "tracks", label: "Треки", count: result.value.tracks.length });
  }
  if (result.value.artists.length) {
    tabs.push({ id: "artists", label: "Исполнители", count: result.value.artists.length });
  }
  if (result.value.albums.length) {
    tabs.push({ id: "albums", label: "Альбомы", count: result.value.albums.length });
  }
  if (result.value.playlists && result.value.playlists.length) {
    tabs.push({ id: "playlists", label: "Плейлисты", count: result.value.playlists.length });
  }
  if (genius.ready && genius.people.length) {
    tabs.push({ id: "genius", label: "Genius", count: genius.people.length });
  }
  return tabs;
});

function avatarOf(artist: Artist): string | null {
  return artist.cover_url || avatars.value[artist.id] || null;
}

async function loadAvatars(artists: Artist[]) {
  const missing = artists.filter((a) => !a.cover_url);
  if (!missing.length) return;
  const next: Record<string, string | null> = { ...avatars.value };
  for (const artist of missing) {
    const cached = cachedAvatar(artist.id);
    if (cached) next[artist.id] = cached;
  }
  avatars.value = next;
  const loaded = await fetchAvatars(missing.map((a) => a.id));
  avatars.value = { ...avatars.value, ...loaded };
}

function playFrom(i: number) {
  const tracks = result.value?.tracks || [];
  if (tracks.length) void player.playQueue(tracks, i);
}

function playAll(startIndex = 0) {
  const tracks = result.value?.tracks || [];
  if (tracks.length) void player.playQueue(tracks, startIndex);
}

async function playAlbum(id: string) {
  try {
    const al = await api.album(id);
    if (al.tracks?.length) {
      void player.playQueue(al.tracks, 0);
    }
  } catch {
    void router.push(`/album/${id}`);
  }
}

async function playPlaylist(pl: Playlist) {
  try {
    const tracks = await api.playlistTracks(pl.kind, pl.owner_uid);
    if (tracks?.length) {
      void player.playQueue(tracks, 0);
    }
  } catch {
    void router.push(`/playlists/${pl.kind}`);
  }
}

async function playPlaylistNext(pl: Playlist) {
  try {
    const tracks = await api.playlistTracks(pl.kind, pl.owner_uid);
    if (tracks && tracks.length) {
      player.playNextMany(tracks);
      Notify.create({ message: `Будет воспроизведено следующим: ${tracks.length} треков` });
    }
  } catch {}
}

async function enqueuePlaylist(pl: Playlist) {
  try {
    const tracks = await api.playlistTracks(pl.kind, pl.owner_uid);
    if (tracks && tracks.length) {
      player.enqueueMany(tracks);
      Notify.create({ message: `Добавлено в очередь: ${tracks.length} треков`, type: "positive" });
    }
  } catch {
    Notify.create({ message: "Не удалось загрузить треки плейлиста", type: "negative" });
  }
}

function playArtistWave(artist: Artist) {
  void player.startWave(`artist:${artist.id}`, artist.name);
  void router.push("/wave");
}

const bestMatch = computed(() => {
  if (!result.value) return null;
  const q = text.value.trim().toLowerCase();
  const artists = result.value.artists || [];
  const tracks = result.value.tracks || [];
  const albums = result.value.albums || [];
  const playlists = result.value.playlists || [];

  const exactArtist = artists.find(
    (a) => a.name.toLowerCase() === q || a.name.toLowerCase().startsWith(q)
  );
  if (exactArtist) {
    return {
      type: "artist" as const,
      typeLabel: "Исполнитель",
      id: exactArtist.id,
      title: exactArtist.name,
      subtitle: "",
      image: avatarOf(exactArtist),
      action: () => router.push(`/artist/${exactArtist.id}`),
      play: (): void => playArtistWave(exactArtist),
    };
  }

  const exactTrack = tracks.find(
    (t) => t.title.toLowerCase() === q || t.title.toLowerCase().startsWith(q)
  );
  if (exactTrack) {
    const idx = tracks.indexOf(exactTrack);
    return {
      type: "track" as const,
      typeLabel: "Трек",
      id: exactTrack.id,
      title: exactTrack.title,
      subtitle: exactTrack.artists.map((a) => a.name).join(", "),
      image: exactTrack.cover_url,
      action: () => playFrom(idx),
      play: () => playFrom(idx),
    };
  }

  if (artists.length) {
    const a = artists[0];
    return {
      type: "artist" as const,
      typeLabel: "Исполнитель",
      id: a.id,
      title: a.name,
      subtitle: "",
      image: avatarOf(a),
      action: () => router.push(`/artist/${a.id}`),
      play: (): void => playArtistWave(a),
    };
  }
  if (tracks.length) {
    const t = tracks[0];
    return {
      type: "track" as const,
      typeLabel: "Трек",
      id: t.id,
      title: t.title,
      subtitle: t.artists.map((a) => a.name).join(", "),
      image: t.cover_url,
      action: () => playFrom(0),
      play: () => playFrom(0),
    };
  }
  if (albums.length) {
    const al = albums[0];
    return {
      type: "album" as const,
      typeLabel: "Альбом",
      id: al.id,
      title: al.title,
      subtitle: al.artist || "Альбом",
      image: al.cover_url,
      action: () => router.push(`/album/${al.id}`),
      play: (): void => { void playAlbum(al.id); },
    };
  }
  if (playlists.length) {
    const pl = playlists[0];
    return {
      type: "playlist" as const,
      typeLabel: "Плейлист",
      id: String(pl.kind),
      title: pl.title,
      subtitle: `Плейлист · ${pl.track_count} треков`,
      image: pl.cover_url,
      action: () => router.push(`/playlists/${pl.kind}`),
      play: (): void => { void playPlaylist(pl); },
    };
  }
  return null;
});

function closeSuggest() {
  suggestOpen.value = false;
  highlightedSuggestIndex.value = -1;
}

function closeSuggestSoon() {
  blurTimer = setTimeout(closeSuggest, 140);
}

function clearQuery() {
  text.value = "";
  draftQuery.value = "";
  suggestions.value = [];
  highlightedSuggestIndex.value = -1;
  result.value = null;
  activeTab.value = "all";
  void router.replace({ query: {} });
  nextTick(() => {
    searchInputRef.value?.focus();
  });
}

function pick(hint: string) {
  clearTimeout(blurTimer);
  text.value = hint;
  suggestions.value = [];
  highlightedSuggestIndex.value = -1;
  suggestOpen.value = false;
  void run();
}

function pickHistory(hint: string) {
  text.value = hint;
  void run();
}

function submit() {
  suggestions.value = [];
  highlightedSuggestIndex.value = -1;
  suggestOpen.value = false;
  void run();
}

const correctedFrom = ref<string | null>(null);
const correctedTo = ref<string | null>(null);

watch(text, (value) => {
  clearTimeout(suggestTimer);
  const q = value.trim();
  if (q.length < 2) {
    suggestions.value = [];
    highlightedSuggestIndex.value = -1;
    return;
  }
  suggestTimer = setTimeout(async () => {
    try {
      const list = await api.searchSuggest(q);
      const filtered = list.filter(
        (hint) => hint.toLowerCase() !== q.toLowerCase(),
      );

      // Если саджестов мало или нет, проверяем инвертированную раскладку
      if (filtered.length < 4 && isDifferentLayout(q)) {
        const switched = switchKeyboardLayout(q);
        const switchedList = await api.searchSuggest(switched).catch(() => []);
        for (const hint of switchedList) {
          if (!filtered.includes(hint) && hint.toLowerCase() !== q.toLowerCase()) {
            filtered.push(hint);
          }
        }
        if (!filtered.includes(switched) && switched.toLowerCase() !== q.toLowerCase()) {
          filtered.unshift(switched);
        }
      }

      suggestions.value = filtered;
      highlightedSuggestIndex.value = -1;
    } catch {
      suggestions.value = [];
    }
  }, 220);
});

async function run(forceExact = false) {
  const q = text.value.trim();
  if (!q) {
    result.value = null;
    correctedFrom.value = null;
    correctedTo.value = null;
    return;
  }
  searchHistory.add(q);
  if (route.query.q !== q) {
    void router.replace({ query: { q } });
  }
  loading.value = true;
  activeTab.value = "all";
  correctedFrom.value = null;
  correctedTo.value = null;

  if (genius.ready) void genius.searchPeople(q);
  let res = await api
    .search(q)
    .catch(() => ({ tracks: [], artists: [], albums: [], playlists: [] }));

  // Автоматический перехват запроса, если введен в ошибочной раскладке (например, 'rjhjkm' -> 'король')
  const isEmpty =
    !res.tracks.length &&
    !res.artists.length &&
    !res.albums.length &&
    !(res.playlists && res.playlists.length);

  if (!forceExact && isEmpty && isDifferentLayout(q)) {
    const switched = switchKeyboardLayout(q);
    try {
      const switchedRes = await api.search(switched);
      const hasSwitchedResults =
        switchedRes.tracks.length > 0 ||
        switchedRes.artists.length > 0 ||
        switchedRes.albums.length > 0 ||
        Boolean(switchedRes.playlists && switchedRes.playlists.length);

      if (hasSwitchedResults) {
        res = switchedRes;
        correctedFrom.value = q;
        correctedTo.value = switched;
        text.value = switched;
        if (genius.ready) void genius.searchPeople(switched);
      }
    } catch {}
  }

  result.value = res;
  loading.value = false;
  void loadAvatars(result.value?.artists ?? []);
}

function searchOriginal(orig: string) {
  text.value = orig;
  void run(true);
}

function openPerson(id: number) {
  void router.push({ name: "genius-artist", params: { id: String(id) } });
}

watch(
  () => route.query.q,
  (q) => {
    if (typeof q === "string" && q && q !== text.value) {
      text.value = q;
      void run();
    }
  },
);

function handleOpenSearchEvent(e: Event) {
  const customEvent = e as CustomEvent<{ selectedText?: string }>;
  const sel = customEvent.detail?.selectedText;
  if (sel) {
    text.value = sel;
    void run();
  }
  nextTick(() => {
    searchInputRef.value?.focus();
    searchInputRef.value?.select();
  });
}

function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
    e.preventDefault();
    e.stopPropagation();
    const sel = window.getSelection()?.toString().trim();
    if (sel) {
      text.value = sel;
      void run();
    }
    searchInputRef.value?.focus();
    searchInputRef.value?.select();
  } else if (
    e.key === "/" &&
    document.activeElement !== searchInputRef.value &&
    !["INPUT", "TEXTAREA"].includes((document.activeElement as HTMLElement)?.tagName)
  ) {
    e.preventDefault();
    e.stopPropagation();
    searchInputRef.value?.focus();
    searchInputRef.value?.select();
  }
}

onMounted(() => {
  const q = route.query.q;
  if (typeof q === "string" && q) {
    text.value = q;
    void run();
  }

  // Горячие клавиши Ctrl+F и / для быстрого перехода к строке поиска
  window.addEventListener("keydown", onGlobalKeydown, true);
  window.addEventListener("app:open-search", handleOpenSearchEvent);

  // Автоматический фокус и select() в инпут поиска при открытии страницы
  nextTick(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus();
      searchInputRef.value.select();
    }
  });
});

onBeforeUnmount(() => {
  clearTimeout(suggestTimer);
  clearTimeout(blurTimer);
  window.removeEventListener("keydown", onGlobalKeydown, true);
  window.removeEventListener("app:open-search", handleOpenSearchEvent);
});
</script>

<style scoped>
.card-grid-move {
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
