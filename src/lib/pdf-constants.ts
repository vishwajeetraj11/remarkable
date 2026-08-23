export const PAGE_SIZES = {
  A4: { w: 595.28, h: 841.89, label: "A4 (210 × 297 mm)" },
  Letter: { w: 612, h: 792, label: "Letter (8.5 × 11 in)" },
  eInk: {
    w: 495.72,
    h: 661.68,
    label: "reMarkable 2 / Paper Pure / Supernote / BOOX (1404 × 1872)",
  },
  paperPro: {
    w: 571.68,
    h: 762.48,
    label: "reMarkable Paper Pro (1620 × 2160)",
  },
  kindleScribe: {
    w: 656.16,
    h: 874.88,
    label: "Kindle Scribe (1860 × 2480)",
  },
} as const;

export type PageSizeKey = keyof typeof PAGE_SIZES;

export function shuffleArray<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
