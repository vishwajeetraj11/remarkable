/**
 * German Schwedenrätsel bank: >=40 entries, each a German answer plus an
 * icon-clue id (resolved via lib/i18n/clue-icons). Words are stored
 * umlaut-free already; anything with Ä/Ö/Ü/ß must pass normalizeForGrid.
 */
export interface ArrowWordDeEntry {
  word: string;
  icon: string;
}

export const ARROW_WORDS_DE: { word: string; clue: string }[] = [
  { word: "BAUM", clue: "plant" },
  { word: "BLUME", clue: "plant" },
  { word: "WALD", clue: "plant" },
  { word: "TIGER", clue: "animal" },
  { word: "HUND", clue: "animal" },
  { word: "KATZE", clue: "animal" },
  { word: "PFERD", clue: "animal" },
  { word: "VOGEL", clue: "animal" },
  { word: "FISCH", clue: "water" },
  { word: "AUTO", clue: "vehicle" },
  { word: "ZUG", clue: "vehicle" },
  { word: "FAHRRAD", clue: "vehicle" },
  { word: "BUS", clue: "vehicle" },
  { word: "FLUGZEUG", clue: "vehicle" },
  { word: "HAUS", clue: "house" },
  { word: "KIRCHE", clue: "house" },
  { word: "SCHULE", clue: "house" },
  { word: "TURM", clue: "house" },
  { word: "BROT", clue: "food" },
  { word: "KASE", clue: "food" },
  { word: "APFEL", clue: "food" },
  { word: "SUPPE", clue: "food" },
  { word: "KUCHEN", clue: "food" },
  { word: "BALL", clue: "sport" },
  { word: "TOR", clue: "sport" },
  { word: "SPORT", clue: "sport" },
  { word: "CLUB", clue: "sport" },
  { word: "FLUTE", clue: "music" },
  { word: "GEIGE", clue: "music" },
  { word: "LIED", clue: "music" },
  { word: "TAKT", clue: "music" },
  { word: "HAMMER", clue: "tool" },
  { word: "NAGEL", clue: "tool" },
  { word: "SAGE", clue: "tool" },
  { word: "BOHRER", clue: "tool" },
  { word: "MEER", clue: "water" },
  { word: "REGEN", clue: "water" },
  { word: "NEBEL", clue: "water" },
  { word: "QUELLE", clue: "water" },
  { word: "STERN", clue: "celestial" },
  { word: "MOND", clue: "celestial" },
  { word: "WOLKE", clue: "celestial" },
  { word: "SONNE", clue: "celestial" },
];
