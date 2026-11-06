<template>
  <q-dialog :model-value="modelValue" @update:model-value="onDialogUpdate">
    <div
      class="flex w-[580px] max-w-[95vw] max-h-[92vh] flex-col p-[22px] border border-solid border-[color:var(--line)] rounded-[var(--radius,14px)] bg-[var(--surface)] text-[color:var(--fg)] gap-[16px] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
      @keydown.esc.stop="close"
    >
      <div class="flex items-center justify-between flex-none">
        <div class="flex items-center gap-[8px]">
          <div class="text-[16px] font-semibold tracking-[-0.01em]">
            {{ isEditing ? "Редактировать карточку" : "Новая карточка Моей волны" }}
          </div>
        </div>
        <button
          type="button"
          class="flex items-center justify-center w-[28px] h-[28px] rounded-[calc(var(--radius,12px)*0.5833)] border-0 bg-transparent text-[color:var(--fg-dim)] cursor-pointer hover:bg-[var(--hover)] hover:text-[color:var(--fg)] transition-colors"
          @click="close"
        >
          <Icon name="mingcute:close-line" :size="16" />
        </button>
      </div>

      <div class="flex flex-col gap-[16px] overflow-y-auto pr-[2px] [scrollbar-width:thin]">
        <div class="flex flex-col gap-[6px]">
          <div class="text-[11.5px] font-medium text-[color:var(--fg-dim)]">
            Предпросмотр карточки
          </div>
          <div
            class="relative flex flex-col justify-between p-[14px] rounded-[16px] overflow-hidden select-none transition-all duration-300 shadow-md"
            :class="[
              formColSpan === 2 ? 'w-full' : 'w-[220px] max-w-full',
              'h-[106px]',
            ]"
            :style="{ background: formGradient }"
          >
            <Icon
              :name="formIcon"
              :size="64"
              class="absolute -bottom-2 -right-2 text-white/20 pointer-events-none rotate-[-12deg]"
            />

            <div class="relative z-10 flex items-start justify-between gap-[6px]">
              <span class="text-[calc(15.5px*var(--text-scale,1))] font-bold text-white tracking-tight leading-[1.15] truncate">
                {{ formTitle || "Название карточки" }}
              </span>
            </div>

            <div class="relative z-10 flex items-end justify-between gap-[6px]">
              <span class="inline-flex items-center gap-[4px] text-[11px] font-medium text-white/90 bg-black/25 px-[7px] py-[2px] rounded-full backdrop-blur-sm">
                <Icon name="mingcute:wave-line" :size="12" />
                <span>Моя волна</span>
              </span>
              <div
                class="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-white text-black shadow-md"
              >
                <Icon name="mingcute:play-fill" :size="14" class="ml-[1px] text-black" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-[8px]">
          <label class="text-[11.5px] font-medium text-[color:var(--fg-dim)]">
            Что должна запускать карточка? <span class="text-[var(--accent)]">*</span>
          </label>

          <div class="grid grid-cols-3 gap-[6px] p-[3px] rounded-[calc(var(--radius,12px)*0.6667)] bg-[var(--surface-2)] border border-[color:var(--line)]">
            <button
              type="button"
              class="flex items-center justify-center gap-[6px] py-[6px] rounded-[calc(var(--radius,12px)*0.5)] border-0 text-[12px] font-medium cursor-pointer transition-colors"
              :class="[
                sourceTab === 'artist'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-transparent text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]',
              ]"
              @click="sourceTab = 'artist'"
            >
              <Icon name="mingcute:user-2-line" :size="14" />
              <span>По артисту</span>
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-[6px] py-[6px] rounded-[calc(var(--radius,12px)*0.5)] border-0 text-[12px] font-medium cursor-pointer transition-colors"
              :class="[
                sourceTab === 'genre'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-transparent text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]',
              ]"
              @click="sourceTab = 'genre'"
            >
              <Icon name="mingcute:guitar-line" :size="14" />
              <span>Жанры & Поджанры</span>
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-[6px] py-[6px] rounded-[calc(var(--radius,12px)*0.5)] border-0 text-[12px] font-medium cursor-pointer transition-colors"
              :class="[
                sourceTab === 'mood'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-transparent text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]',
              ]"
              @click="sourceTab = 'mood'"
            >
              <Icon name="mingcute:teacup-line" :size="14" />
              <span>Настроения</span>
            </button>
          </div>

          <div v-if="sourceTab === 'artist'" class="flex flex-col gap-[8px]">
            <div
              class="flex items-center gap-[8px] h-[36px] px-[10px] rounded-[calc(var(--radius,12px)*0.6667)] bg-[var(--surface-2)] border border-solid border-[color:var(--line)] transition-colors focus-within:border-[var(--accent)]"
            >
              <Icon name="mingcute:search-2-line" :size="14" class="text-[color:var(--fg-faint)] flex-none" />
              <input
                v-model="artistQuery"
                type="text"
                placeholder="Начните вводить имя исполнителя (например, Король и Шут, Queen, Nirvana)..."
                spellcheck="false"
                class="flex-1 min-w-0 bg-transparent border-0 outline-none text-[12.5px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-faint)]"
                @input="onArtistSearchInput"
              />
              <button
                v-if="artistQuery"
                type="button"
                class="p-0 border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer"
                @click="clearArtistSearch"
              >
                <Icon name="mingcute:close-circle-fill" :size="14" />
              </button>
            </div>

            <div
              v-if="isSearchingArtists"
              class="py-[12px] text-center text-[12px] text-[color:var(--fg-faint)] flex items-center justify-center gap-[6px]"
            >
              <Icon name="mingcute:loading-line" :size="16" class="animate-spin text-[var(--accent)]" />
              <span>Ищем исполнителей...</span>
            </div>

            <div
              v-else-if="artistResults.length"
              class="flex flex-col gap-[4px] max-h-[170px] overflow-y-auto p-[4px] rounded-[calc(var(--radius,12px)*0.6667)] border border-solid border-[color:var(--line)] bg-[var(--surface-2)] [scrollbar-width:thin]"
            >
              <button
                v-for="a in artistResults"
                :key="a.id"
                type="button"
                class="flex items-center justify-between gap-[10px] p-[8px] rounded-[calc(var(--radius,12px)*0.5)] border border-solid transition-colors text-left cursor-pointer"
                :class="[
                  formWaveStation === `artist:${a.id}`
                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[color:var(--fg)]'
                    : 'border-transparent bg-transparent text-[color:var(--fg)] hover:bg-[var(--hover)]',
                ]"
                @click="selectArtist(a)"
              >
                <div class="flex items-center gap-[10px] min-w-0">
                  <div class="w-[32px] h-[32px] rounded-full overflow-hidden bg-[var(--surface)] flex items-center justify-center flex-none border border-[color:var(--line)]">
                    <img
                      v-if="a.cover_url"
                      :src="a.cover_url"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <Icon v-else name="mingcute:user-2-line" :size="16" class="text-[color:var(--fg-faint)]" />
                  </div>
                  <div class="min-w-0 truncate">
                    <div class="text-[13px] font-medium truncate">{{ a.name }}</div>
                    <div class="text-[10.5px] text-[color:var(--fg-faint)]">Волна по исполнителю</div>
                  </div>
                </div>

                <span
                  class="flex-none px-[8px] py-[3px] rounded-full text-[11px] font-medium"
                  :class="[
                    formWaveStation === `artist:${a.id}`
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface)] text-[color:var(--fg-dim)] border border-[color:var(--line)]',
                  ]"
                >
                  {{ formWaveStation === `artist:${a.id}` ? "Выбрано" : "Выбрать" }}
                </span>
              </button>
            </div>

            <div
              v-else-if="artistQuery.trim().length >= 2 && !isSearchingArtists"
              class="py-[10px] text-center text-[12px] text-[color:var(--fg-faint)]"
            >
              Исполнитель не найден. Проверьте правильность написания.
            </div>
          </div>

          <div v-else-if="sourceTab === 'genre'" class="flex flex-col gap-[8px]">
            <!-- Полноширинный поиск по поджанрам -->
            <div
              class="flex items-center gap-[8px] h-[34px] px-[10px] rounded-[calc(var(--radius,12px)*0.6667)] bg-[var(--surface-2)] border border-solid border-[color:var(--line)] transition-colors focus-within:border-[var(--accent)] w-full"
            >
              <Icon name="mingcute:filter-line" :size="13" class="text-[color:var(--fg-faint)] flex-none" />
              <input
                v-model="genreFilter"
                type="text"
                placeholder="Поиск по 50+ поджанрам (пост-панк, dnb, гранж, синтвейв, чиптюн)..."
                class="flex-1 min-w-0 bg-transparent border-0 outline-none text-[12px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-faint)]"
              />
              <button
                v-if="genreFilter"
                type="button"
                class="p-0 border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer"
                @click="genreFilter = ''"
              >
                <Icon name="mingcute:close-circle-fill" :size="13" />
              </button>
            </div>

            <!-- Горизонтальная лента групп жанров со стрелками и масками -->
            <div class="relative flex items-center gap-[4px] w-full">
              <button
                v-if="genreCanScrollLeft"
                type="button"
                class="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[var(--surface-2)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] border border-[color:var(--line)] shadow-sm cursor-pointer flex-none z-10"
                title="Листать влево"
                @click="scrollGenreStrip('left')"
              >
                <Icon name="mingcute:left-line" :size="12" />
              </button>

              <div class="relative flex-1 min-w-0 overflow-hidden">
                <div
                  v-if="genreCanScrollLeft"
                  class="pointer-events-none absolute left-0 top-0 bottom-0 w-[20px] bg-gradient-to-r from-[var(--surface)] to-transparent z-10"
                />

                <div
                  ref="genreStripRef"
                  class="flex items-center gap-[5px] overflow-x-auto [scrollbar-width:none] scroll-smooth py-[2px] px-[1px]"
                  @wheel.prevent="onGenreWheel"
                  @scroll="updateGenreScrollState"
                >
                  <button
                    v-for="grp in genreGroupOptions"
                    :key="grp.id"
                    type="button"
                    class="px-[9px] py-[4px] rounded-[6px] border border-solid text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors flex-none select-none"
                    :class="[
                      selectedGenreCategory === grp.id
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm font-semibold'
                        : 'border-[color:var(--line)] bg-[var(--surface-2)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)]',
                    ]"
                    @click="selectedGenreCategory = grp.id"
                  >
                    {{ grp.name }}
                  </button>
                </div>

                <div
                  v-if="genreCanScrollRight"
                  class="pointer-events-none absolute right-0 top-0 bottom-0 w-[20px] bg-gradient-to-l from-[var(--surface)] to-transparent z-10"
                />
              </div>

              <button
                v-if="genreCanScrollRight"
                type="button"
                class="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[var(--surface-2)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] border border-[color:var(--line)] shadow-sm cursor-pointer flex-none z-10"
                title="Листать вправо"
                @click="scrollGenreStrip('right')"
              >
                <Icon name="mingcute:right-line" :size="12" />
              </button>
            </div>

            <div class="flex flex-col gap-[12px] max-h-[190px] overflow-y-auto pr-[2px] [scrollbar-width:thin]">
              <div
                v-for="group in filteredGenreGroups"
                :key="group.name"
                class="flex flex-col gap-[5px]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[10.5px] uppercase font-semibold tracking-wider text-[color:var(--fg-faint)]">
                    {{ group.name }}
                  </span>
                  <span class="text-[10px] text-[color:var(--fg-faint)]">
                    {{ group.items.length }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-[6px]">
                  <button
                    v-for="g in group.items"
                    :key="g.station"
                    type="button"
                    :title="g.subgenre || g.label"
                    class="group/btn flex items-center gap-[5px] px-[9px] py-[5px] rounded-[calc(var(--radius,12px)*0.5)] border border-solid transition-colors text-[11.5px] cursor-pointer"
                    :class="[
                      formWaveStation === g.station
                        ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)] font-semibold'
                        : isAlreadyAdded(g.station)
                          ? 'border-[color:var(--line)] bg-[var(--surface)] text-[color:var(--fg-faint)] opacity-80 hover:opacity-100'
                          : 'border-[color:var(--line)] bg-[var(--surface-2)] text-[color:var(--fg)] hover:bg-[var(--hover)]',
                    ]"
                    @click="selectGenre(g)"
                  >
                    <Icon :name="g.defaultIcon" :size="13" class="opacity-80 flex-none" />
                    <span>{{ g.label }}</span>
                    <span
                      v-if="isAlreadyAdded(g.station)"
                      class="text-[9.5px] text-[color:var(--fg-faint)] font-normal"
                      title="Уже добавлено на экран"
                    >
                      (добавлено)
                    </span>
                  </button>
                </div>
              </div>

              <div
                v-if="!filteredGenreGroups.length"
                class="py-[14px] text-center text-[12px] text-[color:var(--fg-faint)]"
              >
                Ничего не найдено по фильтру «{{ genreFilter }}»
              </div>
            </div>
          </div>

          <div v-else-if="sourceTab === 'mood'" class="flex flex-col gap-[8px]">
            <div class="flex flex-col gap-[12px] max-h-[190px] overflow-y-auto pr-[2px] [scrollbar-width:thin]">
              <div
                v-for="mGroup in moodCatalogGroups"
                :key="mGroup.name"
                class="flex flex-col gap-[5px]"
              >
                <span class="text-[10.5px] uppercase font-semibold tracking-wider text-[color:var(--fg-faint)]">
                  {{ mGroup.name }}
                </span>
                <div class="grid grid-cols-2 gap-[6px]">
                  <button
                    v-for="m in mGroup.items"
                    :key="m.station"
                    type="button"
                    class="flex items-center gap-[9px] p-[8px] rounded-[calc(var(--radius,12px)*0.6667)] border border-solid text-left transition-colors cursor-pointer"
                    :class="[
                      formWaveStation === m.station
                        ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]'
                        : isAlreadyAdded(m.station)
                          ? 'border-[color:var(--line)] bg-[var(--surface)] opacity-75 hover:opacity-100'
                          : 'border-[color:var(--line)] bg-[var(--surface-2)] hover:bg-[var(--hover)]',
                    ]"
                    @click="selectMood(m)"
                  >
                    <div class="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-[var(--surface)] border border-[color:var(--line)] text-[var(--accent)] flex-none">
                      <Icon :name="m.defaultIcon" :size="14" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-[12px] font-medium text-[color:var(--fg)] truncate flex items-center gap-[4px]">
                        <span>{{ m.label }}</span>
                        <span v-if="isAlreadyAdded(m.station)" class="text-[9.5px] text-[color:var(--fg-faint)] font-normal">
                          ✓
                        </span>
                      </div>
                      <div v-if="m.description" class="text-[10px] text-[color:var(--fg-faint)] truncate">
                        {{ m.description }}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-[6px]">
          <label class="text-[11.5px] font-medium text-[color:var(--fg-dim)]">
            Название карточки на экране <span class="text-[var(--accent)]">*</span>
          </label>
          <div
            class="flex items-center gap-[8px] h-[36px] px-[10px] rounded-[calc(var(--radius,12px)*0.6667)] bg-[var(--surface-2)] border border-solid border-[color:var(--line)] transition-colors focus-within:border-[var(--accent)]"
          >
            <input
              v-model="formTitle"
              type="text"
              placeholder="Название плитки на русском"
              spellcheck="false"
              class="flex-1 min-w-0 bg-transparent border-0 outline-none text-[13px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-faint)]"
            />
            <button
              v-if="formTitle"
              type="button"
              class="p-0 border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer"
              @click="formTitle = ''"
            >
              <Icon name="mingcute:close-circle-fill" :size="14" />
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-[6px]">
          <label class="text-[11.5px] font-medium text-[color:var(--fg-dim)]">
            Размер плитки
          </label>
          <div class="grid grid-cols-2 gap-[8px]">
            <button
              type="button"
              class="flex items-center justify-center gap-[8px] h-[34px] rounded-[calc(var(--radius,12px)*0.6667)] border border-solid transition-all cursor-pointer text-[12px] font-medium"
              :class="[
                formColSpan === 1
                  ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)] font-semibold'
                  : 'border-[color:var(--line)] bg-[var(--surface-2)] text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]',
              ]"
              @click="formColSpan = 1"
            >
              <Icon name="mingcute:aspect-ratio-line" :size="15" />
              <span>Обычная (1 колонка)</span>
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-[8px] h-[34px] rounded-[calc(var(--radius,12px)*0.6667)] border border-solid transition-all cursor-pointer text-[12px] font-medium"
              :class="[
                formColSpan === 2
                  ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)] font-semibold'
                  : 'border-[color:var(--line)] bg-[var(--surface-2)] text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]',
              ]"
              @click="formColSpan = 2"
            >
              <Icon name="mingcute:fullscreen-line" :size="15" />
              <span>Широкая (2 колонки)</span>
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-[8px]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-[6px]">
              <label class="text-[11.5px] font-medium text-[color:var(--fg-dim)]">
                Цвет карточки
              </label>
              <span class="text-[10.5px] text-[color:var(--fg-faint)]">
                ({{ GRADIENT_PRESETS.length }} палитр)
              </span>
            </div>
            <span class="text-[11px] text-[color:var(--fg-faint)]">
              {{ currentGradientName }}
            </span>
          </div>

          <div
            ref="colorStripRef"
            class="flex items-center gap-[5px] overflow-x-auto [scrollbar-width:none] py-[2px]"
            @wheel.prevent="onColorWheel"
          >
            <button
              v-for="cat in colorCategories"
              :key="cat.id"
              type="button"
              class="px-[9px] py-[4px] rounded-[6px] border border-solid text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors flex-none select-none"
              :class="[
                activeColorCategory === cat.id
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm font-semibold'
                  : 'border-[color:var(--line)] bg-[var(--surface-2)] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)]',
              ]"
              @click="activeColorCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>

          <div
            v-if="activeColorCategory !== 'custom'"
            class="grid grid-cols-6 sm:grid-cols-8 gap-[8px] max-h-[160px] overflow-y-auto pr-[4px] [scrollbar-width:thin] p-[2px]"
          >
            <button
              v-for="grad in displayedGradients"
              :key="grad.id"
              type="button"
              class="group relative h-[34px] rounded-[8px] border border-solid transition-all cursor-pointer flex items-center justify-center overflow-hidden shadow-sm hover:scale-[1.05]"
              :class="[
                formGradient === grad.gradient
                  ? 'border-white ring-2 ring-[var(--accent)] scale-[1.04]'
                  : 'border-white/20 hover:border-white/50',
              ]"
              :style="{ background: grad.gradient }"
              @click="formGradient = grad.gradient"
            >
              <Icon
                v-if="formGradient === grad.gradient"
                name="mingcute:check-fill"
                :size="14"
                class="text-white drop-shadow-md"
              />
              <q-tooltip
                anchor="top middle"
                self="bottom middle"
                :offset="[0, 6]"
                class="bg-[var(--surface-2)] text-[color:var(--fg)] text-[11px] border border-[color:var(--line)] rounded-[6px] px-[8px] py-[4px] shadow-lg"
              >
                {{ grad.name }}
              </q-tooltip>
            </button>
          </div>

          <div
            v-else
            class="flex flex-col gap-[10px] p-[12px] rounded-[calc(var(--radius,12px)*0.6667)] bg-[var(--surface-2)] border border-solid border-[color:var(--line)]"
          >
            <div class="flex items-center justify-between text-[11.5px] text-[color:var(--fg-dim)]">
              <span>Конструктор своего градиента:</span>
              <span class="text-[10.5px] text-[color:var(--fg-faint)]">Выберите 2 цвета</span>
            </div>
            <div class="flex items-center gap-[16px] flex-wrap">
              <div class="flex items-center gap-[8px]">
                <label class="text-[11px] text-[color:var(--fg-dim)] font-medium">Цвет 1:</label>
                <input
                  type="color"
                  v-model="customColor1"
                  class="w-[34px] h-[34px] p-0 border border-solid border-[color:var(--line)] rounded-[6px] cursor-pointer bg-transparent"
                  @input="applyCustomGradient"
                />
                <span class="text-[11px] font-mono text-[color:var(--fg-faint)]">{{ customColor1 }}</span>
              </div>
              <div class="flex items-center gap-[8px]">
                <label class="text-[11px] text-[color:var(--fg-dim)] font-medium">Цвет 2:</label>
                <input
                  type="color"
                  v-model="customColor2"
                  class="w-[34px] h-[34px] p-0 border border-solid border-[color:var(--line)] rounded-[6px] cursor-pointer bg-transparent"
                  @input="applyCustomGradient"
                />
                <span class="text-[11px] font-mono text-[color:var(--fg-faint)]">{{ customColor2 }}</span>
              </div>
              <button
                type="button"
                class="px-[10px] py-[5px] rounded-[6px] border border-solid border-[color:var(--line)] bg-[var(--surface)] text-[11px] text-[color:var(--fg)] hover:bg-[var(--hover)] cursor-pointer ml-auto"
                @click="swapCustomColors"
              >
                Поменять местами
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-[6px]">
          <div class="flex items-center justify-between">
            <label class="text-[11.5px] font-medium text-[color:var(--fg-dim)]">
              Иконка карточки
            </label>
            <span class="text-[11px] text-[color:var(--fg-faint)]">
              {{ formIcon }}
            </span>
          </div>

          <div
            class="flex items-center gap-[8px] h-[32px] px-[10px] rounded-[calc(var(--radius,12px)*0.6667)] bg-[var(--surface-2)] border border-solid border-[color:var(--line)] transition-colors focus-within:border-[var(--accent)]"
          >
            <Icon
              name="mingcute:search-2-line"
              :size="13"
              class="text-[color:var(--fg-faint)] flex-none"
            />
            <input
              v-model="iconQuery"
              type="text"
              placeholder="Поиск по иконкам (гитара, рок, кассета, релакс...)"
              class="flex-1 min-w-0 bg-transparent border-0 outline-none text-[12px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-faint)]"
            />
            <button
              v-if="iconQuery"
              type="button"
              class="p-0 border-0 bg-transparent text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer"
              @click="iconQuery = ''"
            >
              <Icon name="mingcute:close-circle-fill" :size="13" />
            </button>
          </div>

          <div
            class="grid grid-cols-8 gap-[6px] max-h-[120px] overflow-y-auto p-[4px] rounded-[calc(var(--radius,12px)*0.6667)] border border-solid border-[color:var(--line)] bg-[var(--surface-2)] [scrollbar-width:thin]"
          >
            <button
              v-for="item in filteredIcons"
              :key="item.id"
              type="button"
              :title="`${item.name} (${item.id})`"
              class="flex items-center justify-center h-[32px] rounded-[calc(var(--radius,12px)*0.5)] border border-solid transition-all cursor-pointer relative"
              :class="[
                formIcon === item.id
                  ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_25%,transparent)] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                  : 'border-transparent bg-transparent text-[color:var(--fg-dim)] hover:bg-[var(--hover)] hover:text-[color:var(--fg)]',
              ]"
              @click="formIcon = item.id"
            >
              <Icon :name="item.id" :size="16" />
            </button>
          </div>
        </div>

        <div class="pt-[4px]">
          <button
            type="button"
            class="flex items-center gap-[6px] text-[11px] text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] cursor-pointer bg-transparent border-0 p-0 transition-colors select-none"
            @click="showAdvanced = !showAdvanced"
          >
            <Icon :name="showAdvanced ? 'mingcute:down-line' : 'mingcute:right-line'" :size="12" />
            <span>Для продвинутых: точный идентификатор станции</span>
          </button>

          <div v-if="showAdvanced" class="mt-[8px] flex flex-col gap-[4px]">
            <div
              class="flex items-center gap-[8px] h-[32px] px-[10px] rounded-[calc(var(--radius,12px)*0.6667)] bg-[var(--surface-2)] border border-[color:var(--line)] transition-colors focus-within:border-[var(--accent)]"
            >
              <input
                v-model="formWaveStation"
                type="text"
                placeholder="genre:rock, activity:workout, artist:123"
                spellcheck="false"
                class="flex-1 min-w-0 bg-transparent border-0 outline-none text-[12px] text-[color:var(--fg)] font-mono placeholder:text-[color:var(--fg-faint)]"
              />
            </div>
            <span class="text-[10px] text-[color:var(--fg-faint)]">
              Текущая станция: <code class="text-[var(--accent)]">{{ formWaveStation || 'не выбрана' }}</code>
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-[4px] mt-[2px] flex-none">
        <button
          type="button"
          class="inline-flex h-[32px] items-center px-[14px] border-0 rounded-[calc(var(--radius,12px)*0.5833)] bg-transparent text-[12px] text-[color:var(--fg-dim)] hover:text-[color:var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer select-none"
          @click="close"
        >
          Отмена
        </button>

        <button
          type="button"
          class="inline-flex h-[34px] items-center px-[20px] border-0 rounded-[calc(var(--radius,12px)*0.5833)] bg-[var(--accent)] text-white text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-sm select-none"
          :disabled="!isValid"
          @click="save"
        >
          {{ isEditing ? "Сохранить изменения" : "Добавить карточку" }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from "vue";
import type { SearchCard } from "@/types/searchGrid";
import {
  GRADIENT_PRESETS,
  GENRE_CATALOG_GROUPS,
  MOOD_CATALOG_GROUPS,
  type StationOption,
} from "@/constants/searchPresets";
import { searchNavIcons } from "@/components/settings/navIcons";
import { api } from "@/api/client";
import type { Artist } from "@/api/types";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    card?: SearchCard | null;
    existingStations?: string[];
  }>(),
  {
    card: null,
    existingStations: () => [],
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: Omit<SearchCard, "id"> | SearchCard): void;
}>();

const isEditing = computed(() => Boolean(props.card?.id));

const formTitle = ref("");
const formIcon = ref("mingcute:guitar-line");
const formGradient = ref(GRADIENT_PRESETS[0].gradient);
const formWaveStation = ref("genre:rock");
const formColSpan = ref<1 | 2>(1);

type SourceTab = "artist" | "genre" | "mood";
const sourceTab = ref<SourceTab>("genre");
const showAdvanced = ref(false);

const colorCategories = [
  { id: "all", label: "Все" },
  { id: "neon", label: "Неон & Кибер" },
  { id: "dark", label: "Тёмные" },
  { id: "warm", label: "Огонь & Тёплые" },
  { id: "nature", label: "Природа & Океан" },
  { id: "pastel", label: "Лаунж & Пастель" },
  { id: "custom", label: "✨ Свой цвет" },
];
const activeColorCategory = ref("all");
const customColor1 = ref("#7c3aed");
const customColor2 = ref("#06b6d4");

const displayedGradients = computed(() => {
  if (activeColorCategory.value === "all") return GRADIENT_PRESETS;
  return GRADIENT_PRESETS.filter((g) => g.category === activeColorCategory.value);
});

function applyCustomGradient() {
  formGradient.value = `linear-gradient(135deg, ${customColor1.value} 0%, ${customColor2.value} 100%)`;
}

function swapCustomColors() {
  const tmp = customColor1.value;
  customColor1.value = customColor2.value;
  customColor2.value = tmp;
  applyCustomGradient();
}

const artistQuery = ref("");
const artistResults = ref<Artist[]>([]);
const isSearchingArtists = ref(false);
let artistSearchTimer: ReturnType<typeof setTimeout> | null = null;

const genreFilter = ref("");
const selectedGenreCategory = ref("all");
const iconQuery = ref("");

const genreStripRef = ref<HTMLDivElement | null>(null);
const genreCanScrollLeft = ref(false);
const genreCanScrollRight = ref(false);
const colorStripRef = ref<HTMLDivElement | null>(null);

function updateGenreScrollState() {
  const el = genreStripRef.value;
  if (!el) return;
  genreCanScrollLeft.value = el.scrollLeft > 2;
  genreCanScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 2;
}

function onGenreWheel(e: WheelEvent) {
  const el = genreStripRef.value;
  if (!el) return;
  el.scrollLeft += e.deltaY;
  updateGenreScrollState();
}

function scrollGenreStrip(direction: "left" | "right") {
  const el = genreStripRef.value;
  if (!el) return;
  const delta = direction === "left" ? -140 : 140;
  el.scrollBy({ left: delta, behavior: "smooth" });
  setTimeout(updateGenreScrollState, 220);
}

function onColorWheel(e: WheelEvent) {
  const el = colorStripRef.value;
  if (!el) return;
  el.scrollLeft += e.deltaY;
}

const genreGroupOptions = [
  { id: "all", name: "Все группы" },
  { id: "rock", name: "Рок & Панк" },
  { id: "electronic", name: "Электроника" },
  { id: "hiphop", name: "Рэп & Хип-хоп" },
  { id: "pop", name: "Поп & Азия" },
  { id: "instrumental", name: "Инструментал" },
];

const moodCatalogGroups = MOOD_CATALOG_GROUPS;

const filteredGenreGroups = computed(() => {
  const q = genreFilter.value.trim().toLowerCase();
  let groups = GENRE_CATALOG_GROUPS;

  if (selectedGenreCategory.value !== "all") {
    if (selectedGenreCategory.value === "rock") {
      groups = groups.filter((g) => g.name.includes("Рок"));
    } else if (selectedGenreCategory.value === "electronic") {
      groups = groups.filter((g) => g.name.includes("Электроника"));
    } else if (selectedGenreCategory.value === "hiphop") {
      groups = groups.filter((g) => g.name.includes("Рэп"));
    } else if (selectedGenreCategory.value === "pop") {
      groups = groups.filter((g) => g.name.includes("Поп"));
    } else if (selectedGenreCategory.value === "instrumental") {
      groups = groups.filter((g) => g.name.includes("Инструментал"));
    }
  }

  if (!q) return groups;

  return groups.map((g) => ({
    name: g.name,
    items: g.items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.subgenre && item.subgenre.toLowerCase().includes(q)) ||
        item.station.toLowerCase().includes(q),
    ),
  })).filter((g) => g.items.length > 0);
});

function isAlreadyAdded(station: string): boolean {
  if (!props.existingStations || !props.existingStations.length) return false;
  if (props.card && props.card.waveStation === station) return false;
  return props.existingStations.includes(station);
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      clearArtistSearch();
      return;
    }

    if (props.card) {
      formTitle.value = props.card.title;
      formIcon.value = props.card.icon;
      formGradient.value = props.card.gradient;
      formWaveStation.value = props.card.waveStation;
      formColSpan.value = props.card.colSpan === 2 ? 2 : 1;

      if (props.card.waveStation.startsWith("artist:")) {
        sourceTab.value = "artist";
      } else if (props.card.waveStation.startsWith("activity:") || props.card.waveStation.startsWith("mood:")) {
        sourceTab.value = "mood";
      } else {
        sourceTab.value = "genre";
      }
      showAdvanced.value = false;
    } else {
      formTitle.value = "";
      formIcon.value = "mingcute:music-2-line";
      formGradient.value = GRADIENT_PRESETS[1].gradient;
      formWaveStation.value = "";
      formColSpan.value = 1;
      sourceTab.value = "artist";
      showAdvanced.value = false;
    }
    activeColorCategory.value = "all";
    artistQuery.value = "";
    artistResults.value = [];
    genreFilter.value = "";
    selectedGenreCategory.value = "all";
    iconQuery.value = "";

    nextTick(() => {
      updateGenreScrollState();
    });
  },
  { immediate: true },
);

watch(sourceTab, (val) => {
  if (val === "genre") {
    nextTick(() => {
      updateGenreScrollState();
    });
  }
});

function onArtistSearchInput() {
  if (artistSearchTimer) clearTimeout(artistSearchTimer);
  const q = artistQuery.value.trim();
  if (q.length < 2) {
    artistResults.value = [];
    isSearchingArtists.value = false;
    return;
  }

  isSearchingArtists.value = true;
  artistSearchTimer = setTimeout(async () => {
    try {
      const res = await api.search(q);
      if (artistQuery.value.trim() !== q) return;
      if (res && res.artists) {
        artistResults.value = res.artists.slice(0, 6);
      } else {
        artistResults.value = [];
      }
    } catch (e) {
      if (artistQuery.value.trim() !== q) return;
      console.warn("Artist search failed in SearchCardDialog", e);
      artistResults.value = [];
    } finally {
      if (artistQuery.value.trim() === q) {
        isSearchingArtists.value = false;
      }
    }
  }, 320);
}

onBeforeUnmount(() => {
  if (artistSearchTimer) clearTimeout(artistSearchTimer);
});

function clearArtistSearch() {
  artistQuery.value = "";
  artistResults.value = [];
  isSearchingArtists.value = false;
  if (artistSearchTimer) clearTimeout(artistSearchTimer);
}

function selectArtist(artist: Artist) {
  formWaveStation.value = `artist:${artist.id}`;
  formTitle.value = artist.name;
  formIcon.value = "mingcute:mic-line";
  const grad = GRADIENT_PRESETS[formTitle.value.length % GRADIENT_PRESETS.length];
  formGradient.value = grad.gradient;
}

function selectGenre(g: StationOption) {
  formWaveStation.value = g.station;
  formTitle.value = g.label;
  formIcon.value = g.defaultIcon;
  formGradient.value = g.defaultGradient;
}

function selectMood(m: StationOption) {
  formWaveStation.value = m.station;
  formTitle.value = m.label;
  formIcon.value = m.defaultIcon;
  formGradient.value = m.defaultGradient;
}

const filteredIcons = computed(() => searchNavIcons(iconQuery.value));

const currentGradientName = computed(() => {
  const match = GRADIENT_PRESETS.find((g) => g.gradient === formGradient.value);
  if (match) return match.name;
  if (formGradient.value.startsWith("linear-gradient")) return "Пользовательский градиент";
  return "Свой цвет";
});

const isValid = computed(() => {
  return formTitle.value.trim().length > 0 && formWaveStation.value.trim().length > 0;
});

function onDialogUpdate(val: boolean) {
  emit("update:modelValue", val);
}

function close() {
  emit("update:modelValue", false);
}

function save() {
  if (!isValid.value) return;

  const payload: Omit<SearchCard, "id"> | SearchCard = {
    ...(props.card ? { id: props.card.id, isDefault: props.card.isDefault } : {}),
    title: formTitle.value.trim(),
    icon: formIcon.value.trim() || "mingcute:music-2-line",
    gradient: formGradient.value,
    waveStation: formWaveStation.value.trim(),
    colSpan: formColSpan.value,
    hidden: false,
  };

  emit("save", payload);
  close();
}
</script>
