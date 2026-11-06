import type { SearchCard } from "@/types/searchGrid";

export interface GenrePreset {
  id: string;
  title: string;
  icon: string;
  gradient: string;
  waveStation: string;
}

export type GradientCategory = "all" | "neon" | "dark" | "warm" | "nature" | "pastel";

export interface GradientPreset {
  id: string;
  name: string;
  gradient: string;
  category: GradientCategory;
}

export interface StationOption {
  label: string;
  station: string;
  defaultIcon: string;
  defaultGradient: string;
  description?: string;
  subgenre?: string;
}

export interface StationCatalogGroup {
  name: string;
  items: StationOption[];
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: "neon-violet", name: "Неоновый фиолетовый", gradient: "linear-gradient(135deg, #a855f7 0%, #581c87 100%)", category: "neon" },
  { id: "cyber-amber", name: "Киберпанк", gradient: "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)", category: "neon" },
  { id: "midnight-phonk", name: "Полуночный фонк", gradient: "linear-gradient(135deg, #7c3aed 0%, #2e1065 100%)", category: "neon" },
  { id: "acid-rave", name: "Кислотный рейв", gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)", category: "neon" },
  { id: "laser-magenta", name: "Лазерная маджента", gradient: "linear-gradient(135deg, #ec4899 0%, #831843 100%)", category: "neon" },
  { id: "electric-cyan", name: "Электрик", gradient: "linear-gradient(135deg, #06b6d4 0%, #083344 100%)", category: "neon" },
  { id: "tokyo-pink", name: "Токийский закат", gradient: "linear-gradient(135deg, #f43f5e 0%, #4c0519 100%)", category: "neon" },
  { id: "matrix-lime", name: "Матрица", gradient: "linear-gradient(135deg, #84cc16 0%, #14532d 100%)", category: "neon" },

  { id: "dark-metal", name: "Тёмный метал", gradient: "linear-gradient(135deg, #475569 0%, #0f172a 100%)", category: "dark" },
  { id: "obsidian-slate", name: "Обсидиан", gradient: "linear-gradient(135deg, #334155 0%, #020617 100%)", category: "dark" },
  { id: "deep-velvet", name: "Глубокий бархат", gradient: "linear-gradient(135deg, #581c87 0%, #0f172a 100%)", category: "dark" },
  { id: "gothic-blood", name: "Готический алый", gradient: "linear-gradient(135deg, #881337 0%, #0f172a 100%)", category: "dark" },
  { id: "cosmic-void", name: "Космическая бездна", gradient: "linear-gradient(135deg, #1e1b4b 0%, #030712 100%)", category: "dark" },
  { id: "charcoal-smoke", name: "Дымчатый серый", gradient: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", category: "dark" },
  { id: "dark-emerald", name: "Тёмный изумруд", gradient: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)", category: "dark" },
  { id: "deep-abyss", name: "Глубокая пучина", gradient: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)", category: "dark" },

  { id: "ruby-rock", name: "Рубиновый рок", gradient: "linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)", category: "warm" },
  { id: "sunset-pop", name: "Закатный поп", gradient: "linear-gradient(135deg, #f43f5e 0%, #881337 100%)", category: "warm" },
  { id: "golden-hour", name: "Золотой час", gradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)", category: "warm" },
  { id: "crimson-flame", name: "Багровое пламя", gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)", category: "warm" },
  { id: "terracotta", name: "Терракота", gradient: "linear-gradient(135deg, #c2410c 0%, #431407 100%)", category: "warm" },
  { id: "desert-sand", name: "Пустынный песок", gradient: "linear-gradient(135deg, #d97706 0%, #451a03 100%)", category: "warm" },
  { id: "peach-sunrise", name: "Персиковый рассвет", gradient: "linear-gradient(135deg, #fb923c 0%, #9a3412 100%)", category: "warm" },
  { id: "copper-glow", name: "Медное сияние", gradient: "linear-gradient(135deg, #b45309 0%, #78350f 100%)", category: "warm" },

  { id: "emerald-indie", name: "Изумрудное инди", gradient: "linear-gradient(135deg, #059669 0%, #064e3b 100%)", category: "nature" },
  { id: "forest-acoustic", name: "Лесная акустика", gradient: "linear-gradient(135deg, #16a34a 0%, #14532d 100%)", category: "nature" },
  { id: "ocean-drive", name: "Океанский драйв", gradient: "linear-gradient(135deg, #0284c7 0%, #082f49 100%)", category: "nature" },
  { id: "arctic-frost", name: "Арктический мороз", gradient: "linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)", category: "nature" },
  { id: "teal-lagoon", name: "Морская лагуна", gradient: "linear-gradient(135deg, #0d9488 0%, #134e4a 100%)", category: "nature" },
  { id: "moss-stone", name: "Мох и скалы", gradient: "linear-gradient(135deg, #65a30d 0%, #365314 100%)", category: "nature" },
  { id: "nordic-sky", name: "Северное небо", gradient: "linear-gradient(135deg, #60a5fa 0%, #1e3a8a 100%)", category: "nature" },
  { id: "tropical-mint", name: "Тропическая мята", gradient: "linear-gradient(135deg, #2dd4bf 0%, #115e59 100%)", category: "nature" },

  { id: "chill-lavender", name: "Лавандовый чилл", gradient: "linear-gradient(135deg, #818cf8 0%, #312e81 100%)", category: "pastel" },
  { id: "mystic-ambient", name: "Мистический эмбиент", gradient: "linear-gradient(135deg, #6366f1 0%, #1e1b4b 100%)", category: "pastel" },
  { id: "velvet-jazz", name: "Бархатный джаз", gradient: "linear-gradient(135deg, #9333ea 0%, #3b0764 100%)", category: "pastel" },
  { id: "rose-gold", name: "Розовое золото", gradient: "linear-gradient(135deg, #fb7185 0%, #881337 100%)", category: "pastel" },
  { id: "soft-mallow", name: "Нежная пастила", gradient: "linear-gradient(135deg, #c084fc 0%, #581c87 100%)", category: "pastel" },
  { id: "powder-slate", name: "Пыльный сланец", gradient: "linear-gradient(135deg, #94a3b8 0%, #334155 100%)", category: "pastel" },
  { id: "vintage-plum", name: "Винтажная слива", gradient: "linear-gradient(135deg, #a21caf 0%, #4a044e 100%)", category: "pastel" },
  { id: "warm-cappuccino", name: "Тёплый капучино", gradient: "linear-gradient(135deg, #78350f 0%, #292524 100%)", category: "pastel" },
];

export const GENRE_CATALOG_GROUPS: StationCatalogGroup[] = [
  {
    name: "Рок, метал и панк",
    items: [
      { label: "Постпанк", station: "genre:postpunk", defaultIcon: "mingcute:moon-line", defaultGradient: "linear-gradient(135deg, #475569 0%, #0f172a 100%)", subgenre: "Меланхоличный постпанк и нью-вейв" },
      { label: "Панк-рок", station: "genre:punk", defaultIcon: "mingcute:fire-line", defaultGradient: "linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)", subgenre: "Драйвовый и энергичный панк" },
      { label: "Поп-панк", station: "genre:poppunk", defaultIcon: "mingcute:sparkles-line", defaultGradient: "linear-gradient(135deg, #f43f5e 0%, #881337 100%)", subgenre: "Бодрый калифорнийский поп-панк" },
      { label: "Гранж", station: "genre:grunge", defaultIcon: "mingcute:lightning-line", defaultGradient: "linear-gradient(135deg, #64748b 0%, #1e293b 100%)", subgenre: "Сиэтлский звук 90-х" },
      { label: "Металкор", station: "genre:metalcore", defaultIcon: "mingcute:skull-line", defaultGradient: "linear-gradient(135deg, #374151 0%, #111827 100%)", subgenre: "Брейкдауны и мощный скрим" },
      { label: "Хард-рок", station: "genre:hardrock", defaultIcon: "mingcute:guitar-line", defaultGradient: "linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)", subgenre: "Классический тяжёлый рок" },
      { label: "Хэви-метал", station: "genre:heavymetal", defaultIcon: "mingcute:sword-line", defaultGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", subgenre: "Золотая эра тяжёлого метала" },
      { label: "Симфоник-метал", station: "genre:symphonicmetal", defaultIcon: "mingcute:magic-hat-line", defaultGradient: "linear-gradient(135deg, #7c3aed 0%, #2e1065 100%)", subgenre: "Оркестр и оперный вокал" },
      { label: "Прогрессив-рок", station: "genre:prog", defaultIcon: "mingcute:earth-2-line", defaultGradient: "linear-gradient(135deg, #0284c7 0%, #082f49 100%)", subgenre: "Сложные ритмы и концептуальные альбомы" },
      { label: "Шугейз", station: "genre:shoegaze", defaultIcon: "mingcute:cloud-line", defaultGradient: "linear-gradient(135deg, #818cf8 0%, #312e81 100%)", subgenre: "Стена гитарного звука и реверберация" },
      { label: "Стоунер и дум", station: "genre:stonerrock", defaultIcon: "mingcute:fire-line", defaultGradient: "linear-gradient(135deg, #78350f 0%, #292524 100%)", subgenre: "Низкий строй и психоделика" },
      { label: "Эмо и мидвест", station: "genre:emo", defaultIcon: "mingcute:heart-line", defaultGradient: "linear-gradient(135deg, #f43f5e 0%, #4c0519 100%)", subgenre: "Искренняя гитарная меланхолия" },
      { label: "Русский рок", station: "genre:rusrock", defaultIcon: "mingcute:guitar-line", defaultGradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)", subgenre: "Легендарная отечественная сцена" },
    ],
  },
  {
    name: "Электроника и клубная музыка",
    items: [
      { label: "Синтвейв и ретровейв", station: "genre:synthwave", defaultIcon: "mingcute:audio-tape-line", defaultGradient: "linear-gradient(135deg, #a855f7 0%, #581c87 100%)", subgenre: "Неоновая атмосфера 80-х" },
      { label: "Drum & Bass", station: "genre:dnb", defaultIcon: "mingcute:sound-line-line", defaultGradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)", subgenre: "Быстрый ломаный ритм 174 BPM" },
      { label: "Ликвид-фанк", station: "genre:liquiddnb", defaultIcon: "mingcute:audio-waveform-line", defaultGradient: "linear-gradient(135deg, #06b6d4 0%, #0c4a6e 100%)", subgenre: "Мелодичный и мягкий драм-н-бэйс" },
      { label: "Техно и хард-техно", station: "genre:techno", defaultIcon: "mingcute:speaker-line", defaultGradient: "linear-gradient(135deg, #334155 0%, #0f172a 100%)", subgenre: "Плотный берлинский грув" },
      { label: "Хаус и дип-хаус", station: "genre:house", defaultIcon: "mingcute:headphone-line", defaultGradient: "linear-gradient(135deg, #0284c7 0%, #082f49 100%)", subgenre: "Клубный прямой ритм 4/4" },
      { label: "Вейпорвейв", station: "genre:vaporwave", defaultIcon: "mingcute:tree-line", defaultGradient: "linear-gradient(135deg, #c084fc 0%, #581c87 100%)", subgenre: "Ностальгический замедленный лоуфай" },
      { label: "Транс и псай-транс", station: "genre:trance", defaultIcon: "mingcute:sparkles-line", defaultGradient: "linear-gradient(135deg, #06b6d4 0%, #0c4a6e 100%)", subgenre: "Космический гипнотический транс" },
      { label: "Чиптюн и 8-bit", station: "genre:chiptune", defaultIcon: "mingcute:game-2-line", defaultGradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)", subgenre: "Музыка ретро-приставок" },
      { label: "Дабстеп и риддим", station: "genre:dubstep", defaultIcon: "mingcute:lightning-line", defaultGradient: "linear-gradient(135deg, #9333ea 0%, #3b0764 100%)", subgenre: "Тяжёлый саб-бас и вобл" },
      { label: "Эмбиент и дроун", station: "genre:ambient", defaultIcon: "mingcute:cloud-line", defaultGradient: "linear-gradient(135deg, #312e81 0%, #0f172a 100%)", subgenre: "Атмосферное погружение без бита" },
      { label: "Евроденс 90-х", station: "genre:eurodance", defaultIcon: "mingcute:disc-line", defaultGradient: "linear-gradient(135deg, #f43f5e 0%, #4c0519 100%)", subgenre: "Золотые дискотечные хиты 90-х" },
      { label: "Хардстайл", station: "genre:hardstyle", defaultIcon: "mingcute:fire-line", defaultGradient: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)", subgenre: "Жёсткая реверс-бочка 150 BPM" },
    ],
  },
  {
    name: "Рэп и хип-хоп",
    items: [
      { label: "Дрилл", station: "genre:drill", defaultIcon: "mingcute:flashlight-line", defaultGradient: "linear-gradient(135deg, #334155 0%, #020617 100%)", subgenre: "Скользящий 808-й бас и тёмное звучание" },
      { label: "Олдскул и бум-бэп", station: "genre:oldhiphop", defaultIcon: "mingcute:audio-tape-line", defaultGradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)", subgenre: "Золотая эра 90-х и виниловые сэмплы" },
      { label: "Клауд-рэп", station: "genre:cloudrap", defaultIcon: "mingcute:cloud-line", defaultGradient: "linear-gradient(135deg, #818cf8 0%, #312e81 100%)", subgenre: "Воздушные инструменталы и автотюн" },
      { label: "R&B и неосоул", station: "genre:rnb", defaultIcon: "mingcute:heart-fill", defaultGradient: "linear-gradient(135deg, #9333ea 0%, #3b0764 100%)", subgenre: "Чувственный вокал и мягкий грув" },
      { label: "Трэп", station: "genre:traprussian", defaultIcon: "mingcute:fire-line", defaultGradient: "linear-gradient(135deg, #dc2626 0%, #450a0a 100%)", subgenre: "Быстрые хэты и плотный бас" },
      { label: "Lo-Fi Hip-Hop", station: "genre:lofihiphop", defaultIcon: "mingcute:teacup-line", defaultGradient: "linear-gradient(135deg, #6366f1 0%, #1e1b4b 100%)", subgenre: "Шум пластинки и джазовые аккорды" },
      { label: "Джаз-рэп", station: "genre:jazzrap", defaultIcon: "mingcute:horn-line", defaultGradient: "linear-gradient(135deg, #d97706 0%, #78350f 100%)", subgenre: "Саксофон, контрабас и речитатив" },
    ],
  },
  {
    name: "Поп-музыка и вокал",
    items: [
      { label: "K-Pop", station: "genre:kpop", defaultIcon: "mingcute:sparkles-2-line", defaultGradient: "linear-gradient(135deg, #f43f5e 0%, #881337 100%)", subgenre: "Яркие корейские поп-айдолы" },
      { label: "J-Pop и J-Rock", station: "genre:jpop", defaultIcon: "mingcute:cat-line", defaultGradient: "linear-gradient(135deg, #ec4899 0%, #831843 100%)", subgenre: "Японский рок и поп-сцена" },
      { label: "Аниме OST", station: "genre:anime", defaultIcon: "mingcute:magic-hat-line", defaultGradient: "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)", subgenre: "Опенинги и саундтреки культовых аниме" },
      { label: "Синти-поп", station: "genre:synthpop", defaultIcon: "mingcute:star-line", defaultGradient: "linear-gradient(135deg, #c026d3 0%, #701a75 100%)", subgenre: "Синтезаторы и цепляющие мелодии" },
      { label: "Диско и ню-диско", station: "genre:disco", defaultIcon: "mingcute:disc-line", defaultGradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)", subgenre: "Танцевальный грув 70-80-х" },
      { label: "Шансон и романсы", station: "genre:chanson", defaultIcon: "mingcute:guitar-line", defaultGradient: "linear-gradient(135deg, #d97706 0%, #78350f 100%)", subgenre: "Душевные песни и романсы" },
      { label: "Советская эстрада", station: "genre:soviet", defaultIcon: "mingcute:radio-line", defaultGradient: "linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)", subgenre: "Тёплые ретро-шлягеры" },
      { label: "Латино и реггетон", station: "genre:latin", defaultIcon: "mingcute:sun-line", defaultGradient: "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)", subgenre: "Жаркие латиноамериканские ритмы" },
    ],
  },
  {
    name: "Джаз, блюз и соул",
    items: [
      { label: "Бибоп и свинг", station: "genre:bebop", defaultIcon: "mingcute:music-2-line", defaultGradient: "linear-gradient(135deg, #b45309 0%, #78350f 100%)", subgenre: "Виртуозный джаз золотой эры" },
      { label: "Кул-джаз", station: "genre:cooljazz", defaultIcon: "mingcute:horn-line", defaultGradient: "linear-gradient(135deg, #0284c7 0%, #082f49 100%)", subgenre: "Сдержанный и элегантный джаз" },
      { label: "Босса-нова", station: "genre:bossanova", defaultIcon: "mingcute:sun-line", defaultGradient: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)", subgenre: "Бразильская гитара и мягкий вокал" },
      { label: "Дельта-блюз", station: "genre:deltablues", defaultIcon: "mingcute:guitar-line", defaultGradient: "linear-gradient(135deg, #78350f 0%, #292524 100%)", subgenre: "Акустический блюз американского Юга" },
      { label: "Фанк", station: "genre:funk", defaultIcon: "mingcute:sparkles-line", defaultGradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)", subgenre: "Танцевальный слэп-бас и грув" },
      { label: "Классический соул", station: "genre:soul", defaultIcon: "mingcute:heart-fill", defaultGradient: "linear-gradient(135deg, #ec4899 0%, #831843 100%)", subgenre: "Мощный проникновенный вокал" },
    ],
  },
  {
    name: "Фолк, этно и акустика",
    items: [
      { label: "Скандинавский фолк", station: "genre:nordicfolk", defaultIcon: "mingcute:snowflake-line", defaultGradient: "linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)", subgenre: "Шаманские мотивы и тальхарпа" },
      { label: "Кельтский фолк", station: "genre:celtic", defaultIcon: "mingcute:leaf-line", defaultGradient: "linear-gradient(135deg, #16a34a 0%, #14532d 100%)", subgenre: "Волынки, флейты и ирландские баллады" },
      { label: "Инди-фолк", station: "genre:indiefolk", defaultIcon: "mingcute:sun-line", defaultGradient: "linear-gradient(135deg, #fb923c 0%, #9a3412 100%)", subgenre: "Тёплый акустический инди" },
      { label: "Кантри и блюграсс", station: "genre:country", defaultIcon: "mingcute:riding-line", defaultGradient: "linear-gradient(135deg, #d97706 0%, #78350f 100%)", subgenre: "Банджо, скрипка и истории дорог" },
      { label: "Славянский фолк", station: "genre:slavicfolk", defaultIcon: "mingcute:tree-line", defaultGradient: "linear-gradient(135deg, #65a30d 0%, #365314 100%)", subgenre: "Гусли, рожки и традиционные напевы" },
      { label: "Этно-электроника", station: "genre:ethnoelectro", defaultIcon: "mingcute:magic-hat-line", defaultGradient: "linear-gradient(135deg, #0d9488 0%, #134e4a 100%)", subgenre: "Народные инструменты с современным битом" },
    ],
  },
  {
    name: "Классическая музыка",
    items: [
      { label: "Неоклассика", station: "genre:neoclassical", defaultIcon: "mingcute:music-2-line", defaultGradient: "linear-gradient(135deg, #818cf8 0%, #312e81 100%)", subgenre: "Фортепиано, струнные и минимализм" },
      { label: "Эпоха барокко", station: "genre:baroque", defaultIcon: "mingcute:vip-crown-line", defaultGradient: "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)", subgenre: "Бах, Вивальди и клавесин" },
      { label: "Эпоха романтизма", station: "genre:romanticism", defaultIcon: "mingcute:heart-line", defaultGradient: "linear-gradient(135deg, #f43f5e 0%, #881337 100%)", subgenre: "Шопен, Чайковский и эмоциональная глубина" },
      { label: "Киномузыка", station: "genre:soundtrack", defaultIcon: "mingcute:film-line", defaultGradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)", subgenre: "Эпические оркестровые темы из фильмов" },
      { label: "Фортепианные соло", station: "genre:pianosolo", defaultIcon: "mingcute:voice-line", defaultGradient: "linear-gradient(135deg, #64748b 0%, #0f172a 100%)", subgenre: "Спокойные клавишные этюды" },
    ],
  },
];

export const MOOD_CATALOG_GROUPS: StationCatalogGroup[] = [
  {
    name: "Работа и концентрация",
    items: [
      { label: "Глубокий фокус", station: "activity:deepfocus", defaultIcon: "mingcute:brain-line", defaultGradient: "linear-gradient(135deg, #6366f1 0%, #1e1b4b 100%)", description: "Минималистичная музыка для сложной работы" },
      { label: "Программирование", station: "activity:coding", defaultIcon: "mingcute:terminal-box-line", defaultGradient: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)", description: "Ритмичный синтвейв и электронный грув" },
      { label: "Чтение и учёба", station: "activity:studying", defaultIcon: "mingcute:book-2-line", defaultGradient: "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)", description: "Тихие акустические инструменталы" },
      { label: "Творчество и вдохновение", station: "mood:inspiration", defaultIcon: "mingcute:magic-hat-line", defaultGradient: "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)", description: "Для рисования, письма и генерации идей" },
    ],
  },
  {
    name: "Спорт и тренировки",
    items: [
      { label: "Интенсивная тренировка", station: "activity:workout", defaultIcon: "mingcute:run-line", defaultGradient: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)", description: "Энергичная музыка с высоким темпом" },
      { label: "Кардио и пробежка", station: "activity:running", defaultIcon: "mingcute:heartbeat-line", defaultGradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)", description: "Чёткий ритм для поддержания темпа" },
      { label: "Заряд мотивации", station: "mood:energetic", defaultIcon: "mingcute:lightning-line", defaultGradient: "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)", description: "Мощный заряд энергии" },
    ],
  },
  {
    name: "Дорога и путешествия",
    items: [
      { label: "Ночной драйв", station: "mood:drive", defaultIcon: "mingcute:car-3-line", defaultGradient: "linear-gradient(135deg, #06b6d4 0%, #0c4a6e 100%)", description: "Атмосфера ночного города за рулём" },
      { label: "В дорогу", station: "activity:road-trip", defaultIcon: "mingcute:car-2-line", defaultGradient: "linear-gradient(135deg, #2563eb 0%, #172554 100%)", description: "Идеальный саундтрек для дальней поездки" },
      { label: "Прогулка пешком", station: "activity:walking", defaultIcon: "mingcute:tree-line", defaultGradient: "linear-gradient(135deg, #16a34a 0%, #14532d 100%)", description: "Спокойная музыка для прогулок на свежем воздухе" },
    ],
  },
  {
    name: "Отдых, сон и уют",
    items: [
      { label: "Вечерний релакс", station: "activity:relax", defaultIcon: "mingcute:wine-line", defaultGradient: "linear-gradient(135deg, #818cf8 0%, #312e81 100%)", description: "Спокойная музыка для вечернего отдыха" },
      { label: "Глубокий сон", station: "activity:sleep", defaultIcon: "mingcute:moon-stars-line", defaultGradient: "linear-gradient(135deg, #312e81 0%, #0f172a 100%)", description: "Успокаивающий эмбиент на ночь" },
      { label: "Медитация и покой", station: "mood:dreamy", defaultIcon: "mingcute:cloud-line", defaultGradient: "linear-gradient(135deg, #6366f1 0%, #1e1b4b 100%)", description: "Гармония, тишина и душевное равновесие" },
      { label: "Домашний уют", station: "activity:cozy", defaultIcon: "mingcute:teacup-line", defaultGradient: "linear-gradient(135deg, #b45309 0%, #451a03 100%)", description: "Тёплая и уютная музыка для дома" },
      { label: "Меланхолия и дождь", station: "mood:sad", defaultIcon: "mingcute:rain-line", defaultGradient: "linear-gradient(135deg, #475569 0%, #0f172a 100%)", description: "Светлая грусть и размышления" },
      { label: "Тёплая ностальгия", station: "mood:nostalgic", defaultIcon: "mingcute:audio-tape-line", defaultGradient: "linear-gradient(135deg, #a855f7 0%, #581c87 100%)", description: "Любимые треки юности" },
    ],
  },
  {
    name: "Праздник и эмоции",
    items: [
      { label: "Вечеринка и тусовка", station: "activity:party", defaultIcon: "mingcute:sparkles-3-line", defaultGradient: "linear-gradient(135deg, #a855f7 0%, #581c87 100%)", description: "Зажигательные хиты для компании" },
      { label: "Романтический вечер", station: "mood:romantic", defaultIcon: "mingcute:heart-line", defaultGradient: "linear-gradient(135deg, #f43f5e 0%, #881337 100%)", description: "Музыка для романтических свиданий" },
      { label: "Утренняя бодрость", station: "activity:wake-up", defaultIcon: "mingcute:sun-line", defaultGradient: "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)", description: "Лёгкий подъём и заряд бодрости на день" },
      { label: "Праздник и веселье", station: "mood:festive", defaultIcon: "mingcute:gift-line", defaultGradient: "linear-gradient(135deg, #ec4899 0%, #831843 100%)", description: "Праздничное настроение и позитив" },
      { label: "Игры и гейминг", station: "activity:gaming", defaultIcon: "mingcute:game-2-line", defaultGradient: "linear-gradient(135deg, #7c3aed 0%, #2e1065 100%)", description: "Энергичный саундтрек для побед" },
      { label: "Детям и сказки", station: "activity:kids", defaultIcon: "mingcute:lollipop-line", defaultGradient: "linear-gradient(135deg, #ec4899 0%, #831843 100%)", description: "Добрые детские песни и сказки" },
    ],
  },
];

export const ALL_CATALOG_STATIONS: StationOption[] = [
  ...GENRE_CATALOG_GROUPS.flatMap((g) => g.items),
  ...MOOD_CATALOG_GROUPS.flatMap((g) => g.items),
];

export const STATION_GROUPS = [
  ...GENRE_CATALOG_GROUPS,
  ...MOOD_CATALOG_GROUPS,
];

export const DEFAULT_SEARCH_CARDS: SearchCard[] = [
  {
    id: "rock",
    title: "Рок",
    icon: "mingcute:guitar-line",
    gradient: "linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)",
    waveStation: "genre:rock",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "pop",
    title: "Поп",
    icon: "mingcute:sparkles-2-line",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #881337 100%)",
    waveStation: "genre:pop",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "hiphop",
    title: "Хип-хоп и рэп",
    icon: "mingcute:mic-line",
    gradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)",
    waveStation: "genre:rusrap",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "electronic",
    title: "Электроника",
    icon: "mingcute:headphone-line",
    gradient: "linear-gradient(135deg, #0284c7 0%, #082f49 100%)",
    waveStation: "genre:electronic",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "phonk",
    title: "Фонк",
    icon: "mingcute:flashlight-line",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #2e1065 100%)",
    waveStation: "genre:phonk",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "indie",
    title: "Инди",
    icon: "mingcute:leaf-line",
    gradient: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
    waveStation: "genre:indie",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "metal",
    title: "Метал",
    icon: "mingcute:lightning-line",
    gradient: "linear-gradient(135deg, #475569 0%, #0f172a 100%)",
    waveStation: "genre:metal",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "lofi",
    title: "Lo-Fi и релакс",
    icon: "mingcute:teacup-line",
    gradient: "linear-gradient(135deg, #818cf8 0%, #312e81 100%)",
    waveStation: "activity:relax",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "workout",
    title: "Тренировка",
    icon: "mingcute:run-line",
    gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    waveStation: "activity:workout",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "soundtrack",
    title: "Саундтреки",
    icon: "mingcute:film-line",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)",
    waveStation: "genre:soundtrack",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "drive",
    title: "Ночной драйв",
    icon: "mingcute:car-3-line",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0c4a6e 100%)",
    waveStation: "mood:drive",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "sleep",
    title: "Сон и покой",
    icon: "mingcute:moon-stars-line",
    gradient: "linear-gradient(135deg, #312e81 0%, #0f172a 100%)",
    waveStation: "activity:sleep",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "retro80",
    title: "Ретро 80-х",
    icon: "mingcute:disc-line",
    gradient: "linear-gradient(135deg, #a855f7 0%, #581c87 100%)",
    waveStation: "genre:synthwave",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "hits90",
    title: "Хиты 90-х",
    icon: "mingcute:audio-tape-line",
    gradient: "linear-gradient(135deg, #ec4899 0%, #831843 100%)",
    waveStation: "genre:eurodance",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
  {
    id: "soviet",
    title: "Советская эстрада",
    icon: "mingcute:radio-line",
    gradient: "linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)",
    waveStation: "genre:soviet",
    colSpan: 1,
    isDefault: true,
    hidden: false,
  },
];

export const GENRE_PRESETS: GenrePreset[] = DEFAULT_SEARCH_CARDS.map((c) => ({
  id: c.id,
  title: c.title,
  icon: c.icon,
  gradient: c.gradient,
  waveStation: c.waveStation,
}));
