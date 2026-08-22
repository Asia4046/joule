# Joule — JEE Preparation Platform

A self-hosted personal command center for JEE (Main + Advanced) preparation. Track the full syllabus, log study time and practice, run spaced-repetition revisions, analyse mock tests, and get actionable insights — all in one responsive web app.

Built with Next.js (App Router) and PostgreSQL. No external analytics, no third-party APIs, no telemetry — everything runs on your own infrastructure and your own data.

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

### Concept Labs (interactive Physics simulations)
- **21 interactive simulations** rendered on `<canvas>` — one per Physics chapter:
  Error propagation, Projectile, Friction, Energy ramp, Angular momentum, Orbital mechanics, Viscosity, Piston (thermodynamics), Damped oscillator, Electric field lines, Drift velocity, Charge in a magnetic field, Bar magnet, AC generator, EM wave, Lens/refraction, Young's double slit, Photoelectric effect, Bohr atom, Rectifier, Vernier calipers.
- Each lab pairs the simulation with authored JEE-level explanations, a **KaTeX-rendered formula sheet**, and exam "traps & tips".
- Chapter pages link to their lab, and labs link to the chapter tracker.

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

### Analytics & insights
- **Performance page**: study time, questions solved, consistency score, current/longest streak, daily minutes chart, subject time distribution, mock score trend, and a 182-day heatmap with 7d / 30d / 90d / all-time ranges.
- **JEE Weightage**: chapter-wise weightage and average questions for JEE Main and Advanced (2026 paper analysis; chapters dropped in the 2024 NTA syllabus revision show 0%).
- **Insights**: deterministic, rule-based observations generated from your own data — accuracy trends per subject, weakest subject, stale chapters, study-time vs question-volume balance, mock trend direction, and consistency. Nothing is fabricated or AI-generated.

### Personal & system
- **Journal**: daily reflection with mood, studied / understood / struggled / mistakes / tomorrow prompts.
- **Calendar**: month view aggregating study sessions, mock tests, revision due dates, goal deadlines, and journal entries.
- **Resources**: a library of books, videos, PDFs, websites, notes, problem sets and courses with tags, favorites, and completion flags.
- **Global search** (`Ctrl+K`): search chapters, mock tests, journal, mistakes, resources and goals.
- **Notifications**: an in-app bell with rule-generated notifications (revision due, daily target behind schedule, streak at risk, weekly study-time comparison, new best percentile, stale chapters) — deduplicated and respecting your notification preferences.
- **Settings**: profile (target exam, year, percentile/rank, prep level, daily study/question targets), revision intervals, notification toggles, theme (light / dark / system), password change, JSON data export, and account deletion.
- **Accounts**: email + password signup/login with bcrypt-hashed passwords, JWT sessions in httpOnly cookies (30 days), protected route group.

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

> The app falls back to `dev-secret-change-me-in-production` if `AUTH_SECRET` is unset. Always set a strong value in production.

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

Your data lives entirely in PostgreSQL. Back it up with `pg_dump`:

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
- The included `demo@jee.app` account is created by the seed; delete it before production if you don't want a known password on the system (you can remove the `seedDemoUser()` call in `prisma/seed.ts`).

## Development notes

- **Next.js 16** — this codebase uses the modern conventions for this version (e.g. a top-level `proxy.ts` for request interception, `next dev`-managed agent rules). Consult the bundled docs in `node_modules/next/dist/docs/` before changing framework behaviour.
- Pages are `force-dynamic` since they reflect real-time user data against PostgreSQL.
- Concept sims are client components; authored concept text/formulas are server-side content rendered with KaTeX.

## License

Private project. All data models, analytics and authored content are original to this repository.
