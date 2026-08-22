/**
 * Jellybean Dossier — a palette for an editorial "technical dossier" UI:
 * vanilla-paper / licorice ink surfaces printed with film grain, and a jar of
 * candy accents ("beans"). Every bean has a pastel `fill` (marks, surfaces,
 * text on dark) and a `deep` variant that clears 4.5:1 on vanilla paper
 * (text, borders on light). Beans are the only pill-shaped objects in the
 * system; everything else is squared at 2px like a spec sheet.
 */
export const J = {
  // paper & ink — light ("vanilla paper")
  paperLight: "#FAF7EF", // page background
  cardLight: "#FFFFFF", // cards
  fieldLight: "#FFFFFF", // inputs
  hairLight: "#E8E2D3", // hairline borders / dividers
  inkLight: "#221F1A", // licorice ink — text, strong borders

  // paper & ink — dark ("licorice")
  paperDark: "#0A0908", // page
  railDark: "#100F0D", // sidebar rail
  cardDark: "#151310", // cards
  fieldDark: "#100F0D", // inputs
  hairDark: "rgba(223,214,198,0.15)",
  hairDarkStrong: "rgba(223,214,198,0.30)",
  boneDark: "#DED5C6", // bone ink — primary text on dark

  // text ramp tiers (secondary/dim) — min 4.5:1 on their paper
  inkMidLight: "rgba(34,31,26,0.66)",
  boneMidDark: "rgba(222,213,198,0.64)",

  // the jar — brand bean is bubblegum
  bean: {
    bubblegum: { fill: "#F2A9CB", deep: "#AC3E70" },
    mint: { fill: "#8FD8B0", deep: "#1D7347" },
    lemon: { fill: "#F6D468", deep: "#7E5E00" },
    sky: { fill: "#93C7F2", deep: "#29618F" },
    lavender: { fill: "#BCA5EE", deep: "#5F43A0" },
    tangerine: { fill: "#FFB488", deep: "#B34A16" },
    cherry: { fill: "#F08D8D", deep: "#AE3535" },
    lime: { fill: "#D8E96E", deep: "#5B6A0E" },
  } as const,

  /** Brand accent (focus rings, links, active marks, selection). */
  accent: { light: "#AC3E70", dark: "#F2A9CB" },
} as const;

export type BeanName = keyof typeof J.bean;
export type Bean = { fill: string; deep: string };

/** Data-encoding colors — subjects. */
export const SUBJECT_COLORS: Record<string, Bean> = {
  Physics: J.bean.tangerine,
  Chemistry: J.bean.mint,
  Mathematics: J.bean.sky,
};

/** Pick the readable bean color for the active mode. */
export const beanOn = (bean: Bean, dark: boolean) => (dark ? bean.fill : bean.deep);

/** Hex/rgba → rgba string with alpha. Pure — safe in Server Components. */
export const withA = (hex: string, a: number) => {
  if (hex.startsWith("rgba")) return hex.replace(/[\d.]+\)$/, `${a})`);
  if (hex.startsWith("rgb")) return hex.replace("rgb(", "rgba(").replace(")", `, ${a})`);
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/** Study heatmap — mint jellybean ramp, light paper. */
export const HEAT_LIGHT = ["#EEE8D8", "#D3ECDE", "#9ADBB5", "#52C083", "#1D7347"] as const;
/** Study heatmap — mint jellybean ramp, licorice paper. */
export const HEAT_DARK = ["#1D1A15", "#1F3E2C", "#2B5E41", "#3D9162", "#6FCE97"] as const;

/** Calendar entry types — one bean each. */
export const EVENT_COLORS: Record<string, Bean> = {
  study: J.bean.sky,
  test: J.bean.cherry,
  revision: J.bean.lemon,
  journal: J.bean.lavender,
  goal: J.bean.mint,
};
