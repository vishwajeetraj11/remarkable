/**
 * Grid text normalization for locales whose letters don't fit one cell.
 * German: Ä→AE Ö→OE Ü→UE ß→SS (Swiss-style spelling out, standard for
 * German grid puzzles). Output is A–Z only.
 */
const REPLACEMENTS: Record<string, string> = {
  Ä: "AE",
  Ö: "OE",
  Ü: "UE",
  ß: "SS",
  "ä": "AE",
  "ö": "OE",
  "ü": "UE",
  Á: "A",
  À: "A",
  Â: "A",
  É: "E",
  È: "E",
  Ê: "E",
  Í: "I",
  Î: "I",
  Ó: "O",
  Ô: "O",
  Ú: "U",
  Û: "U",
  Ç: "C",
};

export function normalizeForGrid(word: string): string {
  return word
    .toUpperCase()
    .split("")
    .map((ch) => REPLACEMENTS[ch] ?? ch)
    .join("")
    .replace(/[^A-Z]/g, "");
}
