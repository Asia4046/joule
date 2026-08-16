# JEE Command — "Paper & Ink" Design System

Master source of truth for the visual language. Page-level overrides may live in
`design-system/jee-command/pages/`; if present, they override this file.

Direction: a Claude-inspired monochrome — warm paper, warm ink, one terracotta
accent — with brutalist structure: zero rounding, hairline ink borders, hard
offset shadows. Layouts use bento grids on the dashboard. Simulations and
graphs keep data colors; all UI chrome is monochrome.

## Surfaces

- Light mode: paper background `#F0EEE6`, cards `#FBFAF6`, ink borders
  `#1F1E1D`, hard shadow `4px 4px 0 #1F1E1D`.
- Dark mode: background `#1B1A18`, cards `#26251F`, cream borders `#E8E5DB`,
  hard shadow `4px 4px 0 #000`.
- Sidebar is always ink `#1F1E1D` (both modes): cream active item with a
  terracotta hard shadow, widgets on `#2A2926` with `#57544C` borders.
- Radius is **0 everywhere** (theme `shape.borderRadius = 0`).
- Cards lift on hover: translate(-2px,-2px) + shadow grows to 6px 6px.

## Color tokens

| Token | Value |
| --- | --- |
| Accent (primary) | `#D97757` terracotta (light) / `#DE8468` (dark) |
| Ink | `#1F1E1D` |
| Paper | `#F0EEE6` |
| Card | `#FBFAF6` |
| Text secondary | `#6E6B64` (light) / `#A8A49B` (dark) |
| Divider | `#DDD9CF` (light) / `#3D3B35` (dark) |

Buttons: primary = ink block (cream text in dark mode) with terracotta hard
shadow; press = translate into the shadow. Links/focus/active = terracotta.

Data-encoding colors (charts, progress bars, statuses — muted-warm so they sit
on paper): Physics `#C05C3C`, Chemistry `#43806B`, Mathematics `#3E5F8A`.
Statuses: not started `#8A877F`, learning `#C77D2E`, completed `#43806B`,
revision due `#BF4B4B`, mastered `#2E6E4E`. Calendar: study `#C05C3C`,
test `#BF4B4B`, revision `#C77D2E`, journal `#8A7CA8`, goal `#43806B`.
Heatmap ramp (terracotta): `#EADFD7 → #E0BFAE → #D97757 → #B4552F → #7F3A1F`.

Physics simulations keep wavelength-accurate spectrum colors (`useCanvas.ts`,
photoelectric/YDSE sims) — physics, not branding.

## Typography

- Display/headings (h1–h6) and big numerals: **Source Serif 4**
  (`--font-serif`), weight 600, tight tracking (`.jee-serif`).
- Body/UI: **Inter** (`--font-inter`), buttons weight 700. Numerals use
  `.jee-num` (tabular + lining).
- Eyebrow labels: 0.6–0.64rem caps, letter-spacing 0.1–0.14em, weight 700.

## Layout

- Dashboard is a 12-column bento grid (`repeat(12, 1fr)`, 16px gap); tiles span
  3–8 columns, full-width on mobile. The streak tile is the single terracotta
  surface (ink text, ink border, ink hard shadow).
- Content max width 1280, shell padding 24.

## Signature elements (do not remove)

1. Ink rail sidebar with live ClockCard (serif time + terracotta day bar) and
   daily serif QuoteCard (`components/SidebarWidgets.tsx`).
2. Terracotta "J" brand mark (square, ink border, hard shadow).
3. Hard-shadow press physics on buttons and cards.
4. Zero rounding across every MUI component.
5. Bento dashboard with one accent tile.

## Accessibility floor

Contrast ≥ 4.5:1 for text, visible focus states, keyboard nav intact,
reduced-motion respected (`globals.css`), touch targets ≥ 44px on mobile nav.
