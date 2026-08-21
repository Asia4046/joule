/**
 * Kanagawa — a palette drawn from the Great Wave off Kanagawa: deep sumi-ink
 * surfaces, old-paper whites, and jewel accents (crystal blue, spring green,
 * carp yellow, wave red, sakura pink). Dark-first; the light variant is a warm
 * washi-paper interpretation of the same hues.
 */
export const K = {
  // ink surfaces (dark)
  sumiInk0: "#16161D", // page background
  sumiInk1: "#1F1F28", // sidebar / paper
  sumiInk2: "#2A2A37", // elevated surfaces / hover
  sumiInk3: "#363646", // hairlines, strong borders
  sumiInk4: "#54546D", // muted borders / disabled
  waveBlue1: "#223249", // deep selection fill
  waveBlue2: "#2D4F67", // selection fill

  // text
  fujiWhite: "#DCD7BA", // primary text
  oldWhite: "#C8C093", // secondary-bright text
  katanaGray: "#717C7C", // dim text
  springViolet1: "#938AA9", // secondary text on dark
  springViolet2: "#9CABCA",

  // accents
  crystalBlue: "#7E9CD8",
  springBlue: "#7FB4CA",
  springGreen: "#98BB6C",
  carpYellow: "#E6C384",
  waveRed: "#E46876",
  sakuraPink: "#D27E99",
  surimiOrange: "#FFA066",
  autumnRed: "#C34043",
  autumnGreen: "#76946A",
  dragonBlue: "#658594",
  waveAqua: "#6A9589",

  // washi light variant
  washiBg: "#E9E5DA",
  washiPaper: "#F5F2E9",
  washiInk: "#2A2A37",
  washiDim: "#54546D",
  washiDivider: "#D5CFBE",

  /** Night ink — the reference-grade neutral scale the chrome sits on:
   *  true black page, hairline white borders, neutral text. Kanagawa hues
   *  live only in small marks and data colors. */
  night0: "#000000", // page
  night1: "#0A0A0C", // sidebar / rails
  night2: "#0E0E11", // cards
  night3: "#16161B", // hover / filled inputs
  nightLine: "rgba(255,255,255,0.08)",
  nightLine2: "rgba(255,255,255,0.16)",
  textHi: "#F4F4F5",
  textMid: "#A1A1AA",
  textDim: "#71717A",
} as const;

export type KanagawaToken = keyof typeof K;

/** Hex → rgba string with alpha. */
export const ka = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
