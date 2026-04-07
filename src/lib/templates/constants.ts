export const DEVICES = {
  remarkable2: { w: 495.72, h: 661.68, label: "reMarkable 2 (1404×1872)" },
  paperPro: { w: 571.68, h: 762.48, label: "Paper Pro (1620×2160)" },
  supernote: { w: 495.72, h: 661.68, label: "Supernote A5X (1404×1872)" },
  supernoteManta: { w: 571.68, h: 762.48, label: "Supernote Manta (1620×2160)" },
  booxNote: { w: 495.72, h: 661.68, label: "BOOX Note Air (1404×1872)" },
  booxTab: { w: 656.16, h: 874.88, label: "BOOX Tab Ultra (1860×2480)" },
  kindleScribe: { w: 656.16, h: 874.88, label: "Kindle Scribe (1860×2480)" },
  a4: { w: 595.28, h: 841.89, label: "A4" },
  letter: { w: 612, h: 792, label: "US Letter" },
} as const;

export type DeviceKey = keyof typeof DEVICES;

export const MM_TO_PT = 72 / 25.4;

export const DEFAULT_MARGIN = 28;

export const COLORS = {
  lineLight: [210, 210, 210] as const,
  lineMedium: [180, 180, 180] as const,
  lineDark: [140, 140, 140] as const,
  textLight: [160, 160, 160] as const,
  textMedium: [120, 120, 120] as const,
  textDark: [60, 60, 60] as const,
  marginRed: [220, 100, 100] as const,
  headerBg: [245, 245, 245] as const,
  headerBgDark: [30, 30, 30] as const,
  dot: [80, 80, 80] as const,
  white: [255, 255, 255] as const,
  black: [0, 0, 0] as const,
} as const;
