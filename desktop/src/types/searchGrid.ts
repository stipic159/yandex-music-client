export type GridDensity = "compact" | "normal" | "spacious";
export type CardHeight = "compact" | "normal" | "spacious";

export interface SearchCard {
  id: string;
  title: string;
  icon: string;
  gradient: string;
  waveStation: string;
  colSpan: 1 | 2;
  isDefault?: boolean;
  hidden?: boolean;
}

export interface SearchGridSettings {
  density: GridDensity;
  cardHeight: CardHeight;
  cards: SearchCard[];
}
