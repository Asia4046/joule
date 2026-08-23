import { z } from "zod";
import { J, type Bean, type BeanName } from "@/lib/jellybeans";

/**
 * User customization — one JSON column on UserPreference, one zod schema, one
 * merge-with-defaults reader. This module is pure (no prisma) so client
 * components can import the option lists; pages/actions call mergeCustomization
 * on the stored JSON. Defaults always reproduce the pre-customization UI.
 */

const beanNames = Object.keys(J.bean) as [BeanName, ...BeanName[]];

export const BEAN_CHOICES: { value: BeanName; label: string; bean: Bean }[] = (
  [
    ["bubblegum", "Bubblegum"],
    ["mint", "Mint"],
    ["lemon", "Lemon"],
    ["sky", "Sky"],
    ["lavender", "Lavender"],
    ["tangerine", "Tangerine"],
    ["cherry", "Cherry"],
    ["lime", "Lime"],
  ] as [BeanName, string][]
).map(([value, label]) => ({ value, label, bean: J.bean[value] }));

/** "" renders the user's initials instead of an emoji. */
export const AVATAR_EMOJIS = [
  "",
  "🎯",
  "🚀",
  "⚛️",
  "🧪",
  "📐",
  "🧠",
  "⚡",
  "🔥",
  "🌙",
  "🍀",
  "📚",
  "🏆",
  "💻",
  "🔭",
  "🪐",
  "📊",
  "✏️",
  "☕",
  "💡",
] as const;

export const DASHBOARD_WIDGETS = [
  { key: "hero", label: "Greeting hero" },
  { key: "streak", label: "Streak tile" },
  { key: "stats", label: "Stat cards" },
  { key: "progress", label: "Preparation progress" },
  { key: "todaysPlan", label: "Today's plan" },
  { key: "revisionDue", label: "Revision due" },
  { key: "activity", label: "Study activity chart" },
  { key: "weakAreas", label: "Weak areas" },
  { key: "nextUp", label: "What to study next" },
  { key: "recentTests", label: "Recent tests" },
  { key: "heatmap", label: "Consistency heatmap" },
] as const satisfies readonly { key: keyof Customization["dashboard"]; label: string }[];

export const customizationSchema = z.object({
  /** Accent bean — links, focus rings, selection, sliders. */
  accent: z.enum(beanNames),
  avatarEmoji: z.enum(AVATAR_EMOJIS),
  avatarBean: z.enum(beanNames),
  /** Profile-picture link — takes precedence over the emoji; "" means not set. */
  avatarUrl: z
    .string()
    .trim()
    .max(500, "Picture URL is too long")
    .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Picture URL must start with http:// or https://"),
  dashboard: z.object({
    hero: z.boolean(),
    streak: z.boolean(),
    stats: z.boolean(),
    progress: z.boolean(),
    todaysPlan: z.boolean(),
    revisionDue: z.boolean(),
    activity: z.boolean(),
    weakAreas: z.boolean(),
    nextUp: z.boolean(),
    recentTests: z.boolean(),
    heatmap: z.boolean(),
  }),
  /** Default focus-timer length in minutes (presets: 25 / 50 / 90). */
  focusMinutes: z.coerce.number().int().min(5).max(120),
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  hour12: z.boolean(),
});

export type Customization = z.infer<typeof customizationSchema>;

export const DEFAULT_CUSTOMIZATION: Customization = {
  accent: "bubblegum",
  avatarEmoji: "",
  avatarBean: "bubblegum",
  avatarUrl: "",
  dashboard: {
    hero: true,
    streak: true,
    stats: true,
    progress: true,
    todaysPlan: true,
    revisionDue: true,
    activity: true,
    weakAreas: true,
    nextUp: true,
    recentTests: true,
    heatmap: true,
  },
  focusMinutes: 25,
  weekStartsOn: 0,
  hour12: false,
};

/**
 * Merge stored JSON over defaults and strictly validate the result. Unknown or
 * invalid values (hand-edited DB rows, options removed in newer versions) fall
 * back to defaults rather than breaking rendering.
 */
export function mergeCustomization(raw: unknown): Customization {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_CUSTOMIZATION;
  const src = raw as Record<string, unknown>;
  const merged = {
    ...DEFAULT_CUSTOMIZATION,
    ...src,
    dashboard: {
      ...DEFAULT_CUSTOMIZATION.dashboard,
      ...(src.dashboard && typeof src.dashboard === "object" && !Array.isArray(src.dashboard)
        ? src.dashboard
        : {}),
    },
  };
  const parsed = customizationSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_CUSTOMIZATION;
}
