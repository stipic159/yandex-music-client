import { ref, computed } from "vue";
import type { SearchCard, SearchGridSettings, GridDensity, CardHeight } from "@/types/searchGrid";
import { DEFAULT_SEARCH_CARDS } from "@/constants/searchPresets";

const STORAGE_KEY = "mashiro:search_grid_v1";

const density = ref<GridDensity>("normal");
const cardHeight = ref<CardHeight>("normal");
const cards = ref<SearchCard[]>([]);
const isLoaded = ref(false);

function cloneDefaultCards(): SearchCard[] {
  return JSON.parse(JSON.stringify(DEFAULT_SEARCH_CARDS)) as SearchCard[];
}

function loadSettings() {
  if (isLoaded.value) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SearchGridSettings>;
      if (parsed && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
        cards.value = parsed.cards.map((c) => ({
          ...c,
          colSpan: c.colSpan === 2 ? 2 : 1,
          hidden: Boolean(c.hidden),
        }));
        if (parsed.density && ["compact", "normal", "spacious"].includes(parsed.density)) {
          density.value = parsed.density;
        }
        if (parsed.cardHeight && ["compact", "normal", "spacious"].includes(parsed.cardHeight)) {
          cardHeight.value = parsed.cardHeight;
        }
        isLoaded.value = true;
        return;
      }
    }
  } catch (e) {
    console.warn("Failed to load search grid settings from localStorage", e);
  }

  cards.value = cloneDefaultCards();
  density.value = "normal";
  cardHeight.value = "normal";
  isLoaded.value = true;
}

function persistSettings() {
  try {
    const payload: SearchGridSettings = {
      density: density.value,
      cardHeight: cardHeight.value,
      cards: cards.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("Failed to save search grid settings to localStorage", e);
  }
}

export function useSearchGrid() {
  loadSettings();

  const visibleCards = computed(() => cards.value.filter((c) => !c.hidden));
  const hiddenCards = computed(() => cards.value.filter((c) => c.hidden));
  const hasHiddenCards = computed(() => hiddenCards.value.length > 0);

  function addCard(newCard: Omit<SearchCard, "id">) {
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const card: SearchCard = {
      ...newCard,
      id,
      isDefault: false,
      hidden: false,
      colSpan: newCard.colSpan === 2 ? 2 : 1,
    };
    cards.value.push(card);
    persistSettings();
    return card;
  }

  function updateCard(id: string, patch: Partial<SearchCard>) {
    const idx = cards.value.findIndex((c) => c.id === id);
    if (idx === -1) return;
    cards.value[idx] = {
      ...cards.value[idx],
      ...patch,
      colSpan: patch.colSpan ? (patch.colSpan === 2 ? 2 : 1) : cards.value[idx].colSpan,
    };
    persistSettings();
  }

  function removeCard(id: string) {
    const card = cards.value.find((c) => c.id === id);
    if (!card) return;
    card.hidden = true;
    persistSettings();
  }

  function deleteCard(id: string) {
    const idx = cards.value.findIndex((c) => c.id === id);
    if (idx === -1) return;
    cards.value.splice(idx, 1);
    persistSettings();
  }

  function restoreCard(id: string) {
    const card = cards.value.find((c) => c.id === id);
    if (card) {
      card.hidden = false;
      persistSettings();
    }
  }

  function restoreAllHidden() {
    for (const card of cards.value) {
      if (card.hidden) {
        card.hidden = false;
      }
    }
    persistSettings();
  }

  function reorderCards(fromVisibleIndex: number, toVisibleIndex: number) {
    const visible = visibleCards.value;
    if (
      fromVisibleIndex < 0 ||
      fromVisibleIndex >= visible.length ||
      toVisibleIndex < 0 ||
      toVisibleIndex >= visible.length ||
      fromVisibleIndex === toVisibleIndex
    ) {
      return;
    }

    const itemToMove = visible[fromVisibleIndex];
    const targetItem = visible[toVisibleIndex];
    const actualFrom = cards.value.findIndex((c) => c.id === itemToMove.id);
    const actualTo = cards.value.findIndex((c) => c.id === targetItem.id);

    if (actualFrom !== -1 && actualTo !== -1) {
      const [removed] = cards.value.splice(actualFrom, 1);
      cards.value.splice(actualTo, 0, removed);
      persistSettings();
    }
  }

  function insertCardRelative(sourceId: string, targetId: string, position: "before" | "after") {
    if (sourceId === targetId) return;

    const current = [...cards.value];
    const sourceIndex = current.findIndex((c) => c.id === sourceId);
    let targetIndex = current.findIndex((c) => c.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const [item] = current.splice(sourceIndex, 1);
    item.hidden = false;
    targetIndex = current.findIndex((c) => c.id === targetId);
    const insertAt = position === "after" ? targetIndex + 1 : targetIndex;
    current.splice(insertAt, 0, item);

    cards.value = current;
    persistSettings();
  }

  function toggleCardSpan(id: string) {
    const card = cards.value.find((c) => c.id === id);
    if (card) {
      card.colSpan = card.colSpan === 2 ? 1 : 2;
      persistSettings();
    }
  }

  function setDensity(val: GridDensity) {
    density.value = val;
    persistSettings();
  }

  function setCardHeight(val: CardHeight) {
    cardHeight.value = val;
    persistSettings();
  }

  function resetToDefaults() {
    cards.value = cloneDefaultCards();
    density.value = "normal";
    cardHeight.value = "normal";
    persistSettings();
  }

  function exportConfig(): string {
    return JSON.stringify(
      {
        version: 1,
        density: density.value,
        cardHeight: cardHeight.value,
        cards: cards.value,
      },
      null,
      2,
    );
  }

  function importConfig(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.cards)) {
        return { success: false, error: "Некорректный формат файла" };
      }
      cards.value = parsed.cards.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => c && c.id && c.title && c.waveStation,
      );
      if (["compact", "normal", "spacious"].includes(parsed.density)) {
        density.value = parsed.density;
      }
      if (["compact", "normal", "spacious"].includes(parsed.cardHeight)) {
        cardHeight.value = parsed.cardHeight;
      }
      persistSettings();
      return { success: true };
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "Ошибка парсинга JSON",
      };
    }
  }

  return {
    density,
    cardHeight,
    cards,
    visibleCards,
    hiddenCards,
    hasHiddenCards,
    addCard,
    updateCard,
    removeCard,
    deleteCard,
    restoreCard,
    restoreAllHidden,
    reorderCards,
    insertCardRelative,
    toggleCardSpan,
    setDensity,
    setCardHeight,
    resetToDefaults,
    exportConfig,
    importConfig,
  };
}
