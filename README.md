![Joule — JEE Preparation Platform](docs/banner.png)

# Joule — JEE Preparation Platform

A self-hosted personal command center for JEE (Main + Advanced) preparation. Track the full syllabus, log study time and practice, run spaced-repetition revisions, analyse mock tests, and get actionable insights — all in one responsive web app.

Built with Next.js (App Router) and PostgreSQL. No external analytics, no third-party APIs, no telemetry — everything runs on your own infrastructure and your own data.

![The Joule dashboard in dark mode: streak and study-time stat cards, subject progress, a 30-day activity chart and weak-area ranking](docs/dashboard-dark.png)

*The dashboard — night shift. Every number on it is computed from your own logs.*

## Features

### Dashboard
- Welcome hero with today's date, current streak, and daily target progress.
- Stat cards: today's study time (vs target), current streak, questions solved, 30-day accuracy, mock average and best percentile.
- Per-subject preparation progress bars and "today's plan" (daily goals + due revisions).
- 30-day study activity charts (Recharts).
- **Weak areas** (chapters with accuracy below 65%) and **"What to study next"** — a priority engine that ranks chapters by exam weightage, accuracy, and staleness of the last study session.
- Recent mock tests table and a GitHub-style 182-day study **heatmap**.

### Syllabus tracking
- Complete JEE Main + Advanced syllabus for Physics, Chemistry and Mathematics (~67 chapters, each with topics).
- Per-chapter statuses: `Not Started → Learning → Completed → Revision Due → Mastered`, with topic-level checkboxes.
- Per-subject progress, filters by subject / Chemistry branch (Physical / Organic / Inorganic) / status.
- Every chapter carries JEE Main & Advanced weightage, average questions per paper, difficulty, and last-studied date.

![The syllabus page in light (vanilla paper) mode with subject progress and chapter status cards](docs/syllabus-light.png)

*The same dossier in day shift — vanilla paper, licorice ink. Theme is a per-user toggle.*

### Concept Labs (interactive Physics & Chemistry simulations)
- **21 interactive Physics simulations** rendered on `<canvas>` — one per Physics chapter:
  Error propagation, Projectile, Friction, Energy ramp, Angular momentum, Orbital mechanics, Viscosity, Piston (thermodynamics), Damped oscillator, Electric field lines, Drift velocity, Charge in a magnetic field, Bar magnet, AC generator, EM wave, Lens/refraction, Young's double slit, Photoelectric effect, Bohr atom, Rectifier, Vernier calipers.
- **7 Chemistry simulations** covering the highest-weightage chapters: Atomic orbital visualiser, Periodic trends explorer, VSEPR geometry workbench (drag-to-rotate 3D), Le Chatelier pressure tube (N₂O₄⇌2NO₂ with exact Kp(T)), Rate-law explorer (integrated zero/first/second order), Crystal-field splitting lab (high/low spin, CFSE, magnetic moment), and a Daniell cell driven by the Nernst equation.
- **8 JEE Advanced archetype labs**: collisions, rolling race, Doppler wavefronts, RC transients, radioactive decay, standing waves, tunnel piston, lens systems.
- Each lab pairs the simulation with authored JEE-level explanations, a **KaTeX-rendered formula sheet**, and exam "traps & tips".
- Chapter pages link to their lab, and labs link to the chapter tracker.

![The Daniell cell Nernst-equation lab: a canvas simulation of two beakers with Zn and Cu electrodes, a live voltmeter, concentration and temperature sliders, and readouts for E cell, Q and ΔG](docs/lab-galvanic.png)

*Concept Lab: the Daniell cell. Sliders drive the Nernst equation directly — the meter, electron flow and ion drift all follow E = E° − (RT/2F)·ln Q.*

### Study sessions & focus timer
- Built-in **focus timer** with presets (Pomodoro 25 / Deep 50 / Long 90 / Break 5), pause/resume, and a progress ring.
- Completed focus intervals can be logged as a study session with subject, chapter, and session type (`concept`, `practice`, `revision`, `analysis`, `lecture`, `reading`, `mock_test`).
- Manual session logging, session history, and weekly/monthly totals by subject.

### Revision (spaced repetition)
- Schedule topics for revision; default intervals `[1, 3, 7, 14, 30, 60]` days (configurable in Settings).
- "Due today", overdue and upcoming lists; completing a revision automatically schedules the next review at the next interval.
- Revisions surface on the dashboard, in notifications, and on the calendar.

### Goals
- Daily, weekly and long-term goals with metrics: `hours`, `questions`, `chapters`, `mocks`, or `custom`.
- Progress tracking with deadlines; weekly `mocks` goals auto-increment when you log a mock test.

### Practice logging
- **Questions**: log volume, correct/incorrect/skipped and difficulty per subject/chapter; keeps chapter tallies in sync.
- **Mistake Notebook**: record wrong questions with your reasoning and the correct solution, categorized by mistake type (`conceptual`, `calculation`, `silly`, `misread`, `formula_forgotten`, `time_pressure`, `guessing`), with an open → revisited → resolved workflow.

### Mock tests
- Record marks, subject-wise breakdown (Physics/Chemistry/Maths), attempted/correct/incorrect/skipped, negative marks, time, percentile and rank.
- **Analytics**: score%, percentile, accuracy and per-subject trends across all tests, plus attempt and negative-mark breakdowns.
- **Compare**: side-by-side comparison of up to 4 tests to see exactly what improved.

![Mock-test analytics: score, percentile and accuracy trend charts with per-subject breakdowns](docs/mock-analytics.png)

*Mock forensics — every test plotted, per-subject trends and attempt breakdowns.*

### Analytics & insights
- **Performance page**: study time, questions solved, consistency score, current/longest streak, daily minutes chart, subject time distribution, mock score trend, and a 182-day heatmap with 7d / 30d / 90d / all-time ranges.
- **JEE Weightage**: chapter-wise weightage and average questions for JEE Main and Advanced (2026 paper analysis; chapters dropped in the 2024 NTA syllabus revision show 0%).
- **Insights**: deterministic, rule-based observations generated from your own data — accuracy trends per subject, weakest subject, stale chapters, study-time vs question-volume balance, mock trend direction, and consistency. Nothing is fabricated or AI-generated.

### Personal & system
- **Personalization** (Settings → Personalize): profile picture by image URL (with emoji/initials fallback if the link breaks), emoji avatar with a bean color, app-wide accent color (links, focus rings, selection, sliders), default focus-timer length, week-start day for the calendar, 12/24-hour clock, and per-widget dashboard visibility — all stored per user and validated server-side. Defaults reproduce the stock UI exactly.
- **Journal**: daily reflection with mood, studied / understood / struggled / mistakes / tomorrow prompts.
- **Calendar**: month view aggregating study sessions, mock tests, revision due dates, goal deadlines, and journal entries.
- **Resources**: a library of books, videos, PDFs, websites, notes, problem sets and courses with tags, favorites, and completion flags.
- **Global search** (`Ctrl+K`): search chapters, mock tests, journal, mistakes, resources and goals.
- **Notifications**: an in-app bell with rule-generated notifications (revision due, daily target behind schedule, streak at risk, weekly study-time comparison, new best percentile, stale chapters) — deduplicated and respecting your notification preferences.
- **Settings**: profile (target exam, year, percentile/rank, prep level, daily study/question targets), revision intervals, notification toggles, theme (light / dark / system), password change, JSON data export, and account deletion.
- **Accounts**: email + password signup/login with bcrypt-hashed passwords, JWT sessions in httpOnly cookies (30 days), protected route group.

![The Joule login screen: pink J brand mark on dark paper with print registration marks, a squared sign-in card and a demo-account hint](docs/login.png)

*Access — the dossier cover. A seeded demo account (demo@jee.app) ships with the database.*

## Tech stack

| Layer       | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, React Server Components)               |
| UI          | React 19, Material UI (MUI v6) + Emotion, Tailwind CSS v4      |
| Language    | TypeScript (strict)                                            |
| Database    | PostgreSQL via Prisma 6 ORM                                    |
| Auth        | Custom JWT sessions (jose), bcryptjs password hashing          |
| Validation  | zod, react-hook-form                                           |
| Charts      | Recharts                                                       |
| Math       | KaTeX                                                          |
| State       | zustand                                                        |
| Utilities   | date-fns                                                       |

Mutations are implemented as typed **Server Actions** with zod validation; read paths are Server Components querying Prisma directly. Analytics (streaks, weightage, priorities, insights, heatmaps) live in a pure functions module (`lib/analytics.ts`).

## Project structure

```
app/
  (app)/              Protected route group: dashboard, syllabus, concepts, tracker,
                      sessions, revision, goals, questions, mistakes, mock-tests,
                      performance, weightage, insights, journal, calendar, resources, settings
  api/                Route handlers: auth logout, search, notifications, JSON export
  actions/            Server Actions: study.ts (sessions, questions, chapter state),
                      data.ts (journal, goals, tests, mistakes, revision, resources, settings)
  auth-actions.ts     Signup / login server actions
components/           MUI components incl. concept simulations (concepts/sims/*)
lib/
  analytics.ts        Pure analytics engine (streaks, heatmap, priorities, insights)
  auth.ts             Session creation/verification, signup/login
  notifications.ts    Deterministic notification generator
  concept-content.ts  Authored content for all Concept Labs (sections, formulas, tips)
  constants.ts        Subjects, statuses, mistake/resource/study types
prisma/
  schema.prisma       Data model (users, syllabus, tracking, practice, analytics)
  seed.ts             Seeds the full syllabus + year weightage + a demo account
proxy.ts              Auth redirects for protected paths
```

## Self-hosting

### Prerequisites

- **Node.js 20+** (Node 26 used in development) and `yarn 1.22` (or npm).
- **PostgreSQL 14+** running locally or reachable remotely.
- A domain + reverse proxy (optional, for HTTPS).

### 1. Clone & install

```bash
git clone <your-repo-url> joule
cd joule
yarn install
```

### 2. Configure environment

Create a `.env` file (`.env*` is git-ignored):

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/jeecommand?sslmode=require"

# Secret used to sign JWT session cookies (min 32 chars)
AUTH_SECRET="$(openssl rand -base64 32)"
```

> In production the app refuses to sign/verify sessions if `AUTH_SECRET` is unset; the `dev-secret-change-me-in-production` fallback applies only outside production. Always set a strong value in production.

### 3. Set up the database

The schema and migrations are committed in `prisma/migrations/`.

```bash
# Apply migrations (safe for production)
npx prisma migrate deploy

# Seed the syllabus, 2026 weightage data, and a demo account
npm run db:seed
```

The seed creates the full JEE syllabus (~67 chapters with topics), year-wise weightage rows, and a demo user:

```
demo@jee.app / demo1234
```

For development you can instead run `npm run db:migrate` (interactive `prisma migrate dev`) or `npm run db:studio` to inspect the database.

### 4. Run

**Development**

```bash
npm run dev
```

Open http://localhost:3000.

**Production**

```bash
npm run build
npm start        # listens on http://localhost:3000
```

Other useful scripts: `npm run lint`, `npm run db:seed`, `npm run db:studio`.

### Optional: Docker Compose

A minimal self-contained setup (app + PostgreSQL):

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: jee
      POSTGRES_PASSWORD: change-me
      POSTGRES_DB: jeecommand
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jee"]
      interval: 5s
      timeout: 5s
      retries: 10

  app:
    image: node:22-alpine
    restart: unless-stopped
    working_dir: /app
    command: sh -c "yarn install --production=false && npx prisma migrate deploy && npm run db:seed && npm run build && npm start"
    environment:
      DATABASE_URL: postgresql://jee:change-me@db:5432/jeecommand?sslmode=disable
      AUTH_SECRET: ${AUTH_SECRET:?set AUTH_SECRET in your shell}
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

Build the image once (`docker compose build`), then start with `docker compose up -d`.

### Reverse proxy & HTTPS

Terminate TLS at a reverse proxy in front of the Node server. Example Caddy:

```nginx
jee.yourdomain.com {
    reverse_proxy 127.0.0.1:3000
    encode gzip zstd
}
```

The session cookie is flagged `Secure` when `NODE_ENV=production`, so serve the app over HTTPS in production.

### Backups

Your data lives entirely in PostgreSQL. Two options:

**Built-in scripts** (pure Node, no local PostgreSQL install needed — works against any `DATABASE_URL` including hosted ones like Neon):

```bash
npm run db:backup                 # writes backups/joule-backup-<timestamp>.json (all tables)
npm run db:restore                # restores the newest backup (interactive confirmation)
npm run db:restore -- path/to/backup.json --yes   # restore a specific file without prompting
```

Backups are plain JSON containing every table; restore wipes and recreates all rows with their original ids (accounts, password hashes and cross-links survive verbatim) in a single transaction. Restoring refuses to run if the backup was taken on a newer schema than the local migrations. `backups/` is git-ignored — copy it off-machine for real durability.

**pg_dump** for a full physical dump:

```bash
pg_dump "postgresql://user:password@localhost:5432/jeecommand" > backup.sql
```

There is also a per-user JSON export built into the app (Settings → Export data) covering every record type.

### Updating

```bash
git pull
yarn install
npx prisma migrate deploy   # apply any new migrations
npm run build
npm start
```

## Security notes

- Passwords are hashed with **bcrypt (cost 12)**; sessions are **JWT (HS256)** stored in httpOnly, SameSite=Lax cookies with a 30-day expiry.
- All server actions and API routes re-authenticate the user and scope every query to `userId`.
- Mutations validate input with **zod** before touching the database.
- `.env` is git-ignored — never commit database credentials or `AUTH_SECRET`.
- The included `demo@jee.app` account is created by the seed; delete it before production if you don't want a known password on the system (you can remove the `seedDemoUser()` call in `prisma/seed.ts`). While it exists, its password can't be changed and the account can't be deleted from inside the app.

## Development notes

- **Next.js 16** — this codebase uses the modern conventions for this version (e.g., a top-level `proxy.ts` for request interception, `next dev`-managed agent rules). Consult the bundled docs in `node_modules/next/dist/docs/` before changing framework behaviour.
- Pages are `force-dynamic` since they reflect real-time user data against PostgreSQL.
- Concept sims are client components; authored concept text/formulas are server-side content rendered with KaTeX.

## Brand

The visual identity — "Jellybean Dossier" — is vanilla paper and licorice ink with squared corners and hard offset shadows; candy color exists only as the eight "beans" (bubblegum is the brand accent). The palette and all beans live in `lib/jellybeans.ts`, the mark is `app/icon.svg` (rasterised copies: `app/apple-touch-icon.png`, `docs/mark-512.png`), and display type is Space Grotesk with JetBrains Mono for the mono kickers. Screenshots in this README are of the seeded demo data.

## License

Private project. All data models, analytics and authored content are original to this repository.
