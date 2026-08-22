# Joule — "Jellybean Dossier" Design System

Master source of truth for the visual language. Page-level overrides may live
in `design-system/joule/pages/`; if present, they override this file.

Direction: the editorial "technical dossier" school (ryoku.dev ×
supermemory.ai) printed with a candy jar. A strict ink-on-paper monochrome
chrome — hairline borders, squared 2px corners, mono micro-labels, numbered
sections, film grain over everything — where color appears only as
**jellybeans**: pill-shaped accents assigned to meaningful entities
(subjects, statuses, nav sections, calendar event kinds). The beans are the
only rounded objects in the whole system: everything else is squared like a
spec sheet. The one-liner: *the only soft things in a hard grind.*

## Surfaces

- Light mode ("vanilla paper"): page `#FAF7EF`, cards `#FFFFFF` with
  hairline border `#E8E2D3`. Full ink borders are reserved for
  interactive/primary elements (buttons, dialogs, active nav, menus).
- Dark mode ("licorice"): page `#0A0908`, sidebar rail `#100F0D`, cards
  `#151310`, hairlines `rgba(223,214,198,0.15)` (strong: `0.30`).
- Sidebar matches its paper in both modes (no more permanent ink rail).
- Radius is **2px everywhere** (theme `shape.borderRadius = 2`) — except
  beans (chips, dots, progress bars) which are pills (999).
- Shadows are hard offsets only, and only on press/hover or floating
  surfaces (dialogs, menus): e.g. `4px 4px 0 rgba(34,31,26,0.14)` light /
  `4px 4px 0 rgba(0,0,0,0.85)` dark. No blur, no glow.
- Film grain: `body::after` SVG fractal-noise overlay at 5% opacity
  (`app/globals.css`) across the whole app, both modes.
- Cards lift on hover: translate(-2px,-2px) + hard offset shadow grows.
  Buttons press: hover lifts into shadow, active squashes flat.

## Color tokens (`lib/jellybeans.ts`)

| Token | Value |
| --- | --- |
| Ink (light text/borders) | `#221F1A` |
| Paper (light) | `#FAF7EF` |
| Hairline (light) | `#E8E2D3` |
| Bone (dark text) | `#DED5C6` |
| Paper (dark) | `#0A0908` |
| Card (dark) | `#151310` |
| Text secondary | `rgba(34,31,26,0.66)` light / `rgba(222,213,198,0.64)` dark |

The jar — every bean has a pastel `fill` (marks, surfaces, text on dark)
and a `deep` variant that clears 4.5:1 on vanilla paper (text, borders on
light). Light mode uses `deep` for text; dark mode uses `fill`.

| Bean | Fill | Deep | Encodes |
| --- | --- | --- | --- |
| bubblegum | `#F2A9CB` | `#AC3E70` | **brand accent** — focus, links, active marks, selection |
| mint | `#8FD8B0` | `#1D7347` | Chemistry, completed, goal |
| lemon | `#F6D468` | `#7E5E00` | learning, revision |
| sky | `#93C7F2` | `#29618F` | Mathematics, study |
| lavender | `#BCA5EE` | `#5F43A0` | journal |
| tangerine | `#FFB488` | `#B34A16` | Physics |
| cherry | `#F08D8D` | `#AE3535` | errors, tests, revision due |
| lime | `#D8E96E` | `#5B6A0E` | spare |

Statuses: not started `#8A857B` (neutral), learning lemon, completed mint,
revision due cherry, mastered `#0E5A38` (deep forest). Calendar kinds:
study sky, test cherry, revision lemon, journal lavender, goal mint.
Heatmap = mint ramp (`HEAT_LIGHT` / `HEAT_DARK` in `lib/jellybeans.ts`).

Nav sections each carry a bean (Overview bubblegum, Preparation sky,
Practice tangerine, Analytics lemon, Personal lavender, System mint) —
see `lib/nav.ts`.

Physics simulations keep wavelength-accurate spectrum colors (`useCanvas.ts`)
— physics, not branding.

## Typography

- Display/headings (h1–h6), brand, big numerals: **Space Grotesk**
  (`--font-display`, `.jee-display`), weight 700, tight tracking.
- Body/UI: **Inter** (`--font-inter`).
- Micro-labels, numbers, kbd, tooltips: **JetBrains Mono** (`--font-mono`,
  `.jee-mono`) — ALL-CAPS at 0.58–0.68rem with 0.1–0.22em tracking.
- Numerals use `.jee-num` (tabular + lining).

## Layout

- Dashboard is a 12-column bento grid (`repeat(12, 1fr)`, 16px gap).
- Content max width 1280, shell padding 24. Mobile: bottom nav (5 items)
  with bean-colored top bar on the active tab.
- Page headers are dossier headers: mono `NN // SECTION` eyebrow with the
  section's bean dot, Space Grotesk title, hairline rule below.

## Signature elements (do not remove)

1. The **jar row** — eight bean dots under the wordmark (sidebar Brand,
   landing footer) and the printed colophon strip (auth pages, landing
   hero: "PAPER #0A0908 · INK #DED5C6 · BEANS ×8 · RADIUS 2 · GRAIN 5%").
2. Bubblegum "J" brand mark — squared candy tile with ink border and hard
   offset shadow.
3. The streak tile — the single candy surface on the dashboard
   (bubblegum fill, ink border/text, hard shadow) in both modes.
4. Numbered everything: nav groups `01–06`, page headers `NN // SECTION`,
   landing sections, feature cards `F.01`, labs `LAB 01`.
5. Squared cards + pill beans contrast; hard-press hover physics.
6. Film grain across the whole app; print registration marks on auth.

## Accessibility floor

Contrast ≥ 4.5:1 for text (all `deep` beans clear this on vanilla paper;
fills are for marks/surfaces only), visible focus rings (2px bubblegum,
global `*:focus-visible`), keyboard nav intact, reduced-motion respected
(`globals.css`), touch targets ≥ 44px on mobile nav.
