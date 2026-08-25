#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  JOULE // JEE PREPARATION PLATFORM — local configure & run
#  Jellybean Dossier edition · PAPER #0A0908 · INK #DED5C6 · BEANS ×8
#
#  One command stands the app up from a clean clone:
#      ./joule.sh            → preflight → install → .env → migrate → seed → dev
#      ./joule.sh --prod     → same, then next build && next start
#
#  Subcommands: dev | build | start | seed | migrate | studio | backup |
#               restore | status | help
#  Flags:  -p/--port N   --prod  --open  --seed  --no-seed  --install
#          --offline (skip DB steps)  --no-color  -y/--yes
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# ═════════════════════════════════════════════════════════════════════════════
#  THE JAR — palette lifted verbatim from lib/jellybeans.ts
# ═════════════════════════════════════════════════════════════════════════════
INK="#221F1A"; BONE="#DED5C6"; PAPER="#0A0908"; CARD="#151310"
HAIR="#6B675E"; NEUTRAL="#8A857B"
BUBBLEGUM="#F2A9CB"; MINT="#8FD8B0"; LEMON="#F6D468"; SKY="#93C7F2"
LAVENDER="#BCA5EE"; TANGERINE="#FFB488"; CHERRY="#F08D8D"; LIME="#D8E96E"
JAR=("$BUBBLEGUM" "$MINT" "$LEMON" "$SKY" "$LAVENDER" "$TANGERINE" "$CHERRY" "$LIME")

COLOR=1
[[ -t 1 ]] || COLOR=0
[[ "${NO_COLOR:-}" ]] && COLOR=0
case "${TERM:-}" in dumb|"") COLOR=0;; esac

_TRUECOLOR=0
if [[ "$COLOR" == 1 ]]; then
  case "${COLORTERM:-}" in *truecolor*|*24bit*) _TRUECOLOR=1;; esac
  case "${TERM:-}" in *direct*|*truecolor*) _TRUECOLOR=1;; esac
fi

_hex2rgb() { local h="${1#\#}"; echo "$((16#${h:0:2})) $((16#${h:2:2})) $((16#${h:4:2}))"; }
_cube() { echo $(( 16 + 36 * ((($1 * 5 + 128) / 255)) + 6 * ((($2 * 5 + 128) / 255)) + ((($3 * 5 + 128) / 255)) )); }
fg() {
  [[ "$COLOR" == 1 ]] || { echo ""; return; }
  if [[ "$_TRUECOLOR" == 1 ]]; then local rgb; rgb=$(_hex2rgb "$1"); printf '\033[38;2;%sm' "${rgb// /;}"
  else printf '\033[38;5;%dm' "$(_cube $(_hex2rgb "$1"))"; fi
}
bg() {
  [[ "$COLOR" == 1 ]] || { echo ""; return; }
  if [[ "$_TRUECOLOR" == 1 ]]; then local rgb; rgb=$(_hex2rgb "$1"); printf '\033[48;2;%sm' "${rgb// /;}"
  else printf '\033[48;5;%dm' "$(_cube $(_hex2rgb "$1"))"; fi
}
RESET=$'\033[0m'; BOLD=$'\033[1m'; DIM=$'\033[2m'
if [[ "$COLOR" == 0 ]]; then RESET=""; BOLD=""; DIM=""; fi

# ═════════════════════════════════════════════════════════════════════════════
#  PRINT SHOP — dossier headers, bean pills, the jar row, the colophon
# ═════════════════════════════════════════════════════════════════════════════
COLUMNS=80
[[ -t 1 ]] && COLUMNS="$(tput cols 2>/dev/null || echo 80)"

dot() { printf '%s●%s' "$(fg "$1")" "$RESET"; }

pill() { # pill LABEL HEX — beans are the only rounded objects in the system
  printf '%s%s %s %s' "$(bg "$2")" "$(fg "$INK")" "$1" "$RESET"
}

rule() { # hairline under dossier headers
  local n=$(( COLUMNS > 6 ? COLUMNS - 4 : 74 )) line
  printf -v line '%*s' "$n" ''
  printf ' %s%s%s\n' "$DIM" "${line// /─}" "$RESET"
}

hdr() { # hdr 01 "PREFLIGHT" $SKY — mono eyebrow with the section's bean dot
  printf '\n %s %s%s//%s %s%s%s\n' \
    "$(dot "$3")" "$BOLD$DIM" "$1" "$RESET" "$BOLD" "$2" "$RESET"
  rule
}

ok()   { printf '  %s %s\n' "$(pill ' OK ' "$MINT")" "$*"; }
warn() { printf '  %s %s\n' "$(pill ' !! ' "$LEMON")" "$*"; }
err()  { printf '  %s %s\n' "$(pill 'FAIL' "$CHERRY")" "$*"; }
info() { printf '  %s %s\n' "$(pill 'INFO' "$SKY")" "$*"; }
skip() { printf '  %s %s\n' "$(pill 'SKIP' "$NEUTRAL")" "$*"; }

jar_row() { # signature element #1 — eight bean dots; $1 = terminator (default full reset)
  local end="${1:-$RESET}" out="" i=0 b
  for b in "${JAR[@]}"; do
    [[ $i -gt 0 ]] && out+=" "
    out+="$(fg "$b")●$end"; i=$((i + 1))
  done
  printf '%s' "$out"
}

center_line() { # center_line PLAIN COLORED TOTAL — pad by the PLAIN width
  local plain="$1" colored="$2" total="$3"
  local w=$(( total - ${#plain} )) l=0 r=0
  if (( w > 0 )); then l=$(( w / 2 )); r=$(( w - l )); fi
  printf '%*s%s%*s' "$l" '' "$colored" "$r" ''
}

banner() {
  local W=66
  local pad=$(( W - 2 ))
  # within the strip, segments end with selective resets (39m fg / 22m undim)
  # so the licorice paper background survives to the end of each line
  local pb="" pe="" bone="" jcol="" EF=$'\033[39m' ED=$'\033[22m'
  if [[ "$COLOR" == 1 ]]; then
    pb="$(bg "$PAPER")"; pe="$RESET"
    bone="$(fg "$BONE")"; jcol="$(fg "$BUBBLEGUM")"
  else EF=""; ED=""; fi
  printf '%s%s%s\n' "$pb" "$(printf '%*s' "$W" '')" "$pe"

  # wordmark — the J is the bubblegum brand tile, the rest is bone ink
  local j=( '██╗' '██║' '██║' '██║' '██║' '╚═╝' )
  local o=( ' ██████╗ ' '██╔═══██╗' '██║   ██║' '██║   ██║' '╚██████╔╝' ' ╚═════╝ ' )
  local u=( '██╗   ██╗' '██║   ██╗' '██║   ██╗' '██║   ██╗' '╚██╗ ██╔╝' ' ╚████╔╝ ' )
  local l=( '██╗     ' '██║     ' '██║     ' '██║     ' '███████╗' '╚══════╝' )
  local e=( '███████╗' '██╔════╝' '█████╗  ' '██╔══╝  ' '███████╗' '╚══════╝' )
  local i plain colored
  for i in 0 1 2 3 4 5; do
    plain="${j[$i]} ${o[$i]} ${u[$i]} ${l[$i]} ${e[$i]}"
    colored="${jcol}${j[$i]}$EF ${bone}${o[$i]} ${u[$i]} ${l[$i]} ${e[$i]}$EF"
    printf '%s %s %s\n' "$pb" "$(center_line "$plain" "$colored" "$pad")" "$pe"
  done

  printf '%s %s %s\n' "$pb" "$(center_line '● ● ● ● ● ● ● ●' "$(jar_row "$EF")" "$pad")" "$pe"
  printf '%s %s %s\n' "$pb" "$(printf '%*s' "$pad" '')" "$pe"
  local tag='JEE PREPARATION PLATFORM · SELF-HOSTED COMMAND CENTER'
  printf '%s %s %s\n' "$pb" "$(center_line "$tag" "$DIM$tag$ED$EF" "$pad")" "$pe"
  local colo='PAPER #0A0908 · INK #DED5C6 · BEANS ×8 · RADIUS 2 · GRAIN 5%'
  printf '%s %s %s\n' "$pb" "$(center_line "$colo" "$DIM$colo$ED$EF" "$pad")" "$pe"
  printf '%s%s%s\n' "$pb" "$(printf '%*s' "$W" '')" "$pe"
}

colophon() {
  printf '\n%s %s%s · PAPER #0A0908 · INK #DED5C6 · BEANS ×8 · RADIUS 2 · GRAIN 5%%%s\n' \
    "$(jar_row)" "$DIM" "" "$RESET"
}

die() { err "$*"; colophon; printf '\n'; exit 1; }

# ═════════════════════════════════════════════════════════════════════════════
#  SPINNER — a bean cycling through the jar while long work runs
# ═════════════════════════════════════════════════════════════════════════════
run_task() { # run_task LABEL cmd [args…]
  local label="$1"; shift
  local out; out="$(mktemp)"
  local spin_pid="" rc
  if [[ -t 2 ]] && [[ "$COLOR" == 1 ]]; then
    (
      i=0
      while :; do
        printf '\r  %s %s …\033[K' "$(fg "${JAR[$((i % 8))]}")●$RESET" "$label" >&2
        sleep 0.12; i=$((i + 1))
      done
    ) &
    spin_pid=$!
  fi
  "$@" >"$out" 2>&1
  rc=$?
  if [[ -n "$spin_pid" ]]; then
    kill "$spin_pid" 2>/dev/null; wait "$spin_pid" 2>/dev/null; printf '\r\033[K' >&2
  fi
  if [[ $rc -eq 0 ]]; then
    ok "$label"
  else
    err "$label"
    sed 's/^/      /' "$out" | tail -n 12 >&2
  fi
  rm -f "$out"
  return $rc
}

# ═════════════════════════════════════════════════════════════════════════════
#  PIPELINE STAGES — 01–06, beans assigned like lib/nav.ts sections
# ═════════════════════════════════════════════════════════════════════════════
NODE_MIN_MAJOR=20 NODE_MIN_MINOR=9
PM=""      # yarn (preferred, per packageManager field) or npm
PORT=3000
MODE="dev"
FORCE_INSTALL=0 DO_SEED="auto" OPEN=0 OFFLINE=0 ASSUME_YES=0
CMD="dev"

stage_preflight() { # 01 // OVERVIEW — bubblegum
  hdr "01" "PREFLIGHT" "$BUBBLEGUM"
  command -v node >/dev/null 2>&1 || die "node is not on PATH — install Node ≥ 20.9 first"
  local v major minor
  v="$(node -p 'process.versions.node')"
  major="${v%%.*}"; minor="$(cut -d. -f2 <<<"$v")"
  if (( major < NODE_MIN_MAJOR )) || { [[ "$major" == "$NODE_MIN_MAJOR" ]] && (( 10#$minor < NODE_MIN_MINOR )); }; then
    die "node $v found — Next.js 16 needs ≥ 20.9"
  fi
  ok "node v$v"
  if command -v yarn >/dev/null 2>&1; then PM="yarn"
  elif command -v npm >/dev/null 2>&1; then PM="npm"
  else die "neither yarn nor npm found on PATH"; fi
  ok "package manager: $PM $("$PM" --version 2>/dev/null | tail -n1)"
  if command -v openssl >/dev/null 2>&1; then ok "openssl present (AUTH_SECRET minting)"
  else warn "openssl missing — secrets fall back to /dev/urandom"; fi
}

stage_dependencies() { # 02 // PREPARATION — sky
  hdr "02" "DEPENDENCIES" "$SKY"
  if [[ "$FORCE_INSTALL" == 1 ]] || [[ ! -x node_modules/.bin/next ]] || [[ ! -x node_modules/.bin/prisma ]] || [[ ! -x node_modules/.bin/tsx ]]; then
    run_task "install dependencies ($PM install)" "$PM" install || die "dependency install failed"
  else
    ok "dependencies present ($(ls node_modules 2>/dev/null | wc -l | tr -d ' ') packages)"
  fi
  if [[ -d node_modules/.prisma/client ]]; then
    ok "prisma client generated"
  else
    run_task "generate prisma client" node_modules/.bin/prisma generate || die "prisma generate failed"
  fi
}

load_env() {
  [[ -f .env ]] || return 0
  local line k v
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*(#|$) ]] && continue
    k="${line%%=*}"; v="${line#*=}"
    [[ "$k" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"
    export "$k=$v"
  done < .env
}

stage_environment() { # 03 // PRACTICE — tangerine
  hdr "03" "ENVIRONMENT" "$TANGERINE"
  if [[ ! -f .env ]]; then
    local dburl="postgresql://joule:joule@localhost:5432/joule?schema=public" reply=""
    if [[ "$ASSUME_YES" != 1 ]] && [[ -t 0 ]]; then
      printf '  %s no %s.env%s found — minting one\n' "$(pill ' ?? ' "$LEMON")" "$BOLD" "$RESET"
      printf '  %s PostgreSQL URL [%s]: %s' "$(dot "$TANGERINE")" "$dburl" "$RESET"
      IFS= read -r reply || reply=""
      [[ -n "$reply" ]] && dburl="$reply"
    fi
    local secret
    if command -v openssl >/dev/null 2>&1; then secret="$(openssl rand -base64 32)"
    else secret="$(head -c 32 /dev/urandom | base64)"; fi
    cat > .env <<EOF
# Joule — local environment (written by joule.sh)
# PostgreSQL connection string
DATABASE_URL="$dburl"

# Secret used to sign JWT session cookies (min 32 chars)
AUTH_SECRET="$secret"
EOF
    ok ".env written (AUTH_SECRET minted, 32+ chars)"
    load_env
  else
    load_env
    ok ".env found"
    if ! grep -q '^AUTH_SECRET=..' .env 2>/dev/null; then
      local secret
      if command -v openssl >/dev/null 2>&1; then secret="$(openssl rand -base64 32)"
      else secret="$(head -c 32 /dev/urandom | base64)"; fi
      printf '\n# AUTH_SECRET appended by joule.sh\nAUTH_SECRET="%s"\n' "$secret" >> .env
      export AUTH_SECRET="$secret"
      warn "AUTH_SECRET was missing — appended a fresh one"
    fi
  fi
  [[ -n "${DATABASE_URL:-}" ]] || die "DATABASE_URL is not set — put a PostgreSQL URL in .env"
  ok "DATABASE_URL → $(mask_url "$DATABASE_URL")"
}

mask_url() { # keep credentials out of the transcript
  sed -E 's#^postgresql(\+[a-z]+)?://[^@]+@([^/?]+)(/[^?]*)?.*#\2\3#' <<<"$1"
}

db_probe() { # prints "OK chapters=N users=M" | "EMPTY …" | "CONN …"; rc 2 = unreachable
  # node -e resolves @prisma/client from cwd (the project root) — no temp file
  node -e '
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  try {
    const chapters = await p.chapter.count();
    const users = await p.user.count();
    console.log(`OK chapters=${chapters} users=${users}`);
  } catch (e) {
    const m = String((e && e.message) || e);
    if (/P2021|does not exist/i.test(m)) console.log("EMPTY schema-not-migrated");
    else console.log("CONN " + m.split("\n")[0].slice(0, 140));
  } finally { await p.$disconnect().catch(() => {}); }
})();
'
}

maybe_docker_db() { # offer a disposable postgres:16-alpine when the URL is local & dead
  local host; host="$(sed -E 's#^postgresql(\+[a-z]+)?://[^@]+@([^/:?]+).*#\2#' <<<"$DATABASE_URL")"
  [[ "$host" =~ ^(localhost|127\.0\.0\.1|\[::1\])$ ]] || return 1
  command -v docker >/dev/null 2>&1 || return 1
  local reply="n"
  if [[ "$ASSUME_YES" == 1 ]]; then reply="y"
  elif [[ -t 0 ]]; then
    printf '  %s start one with Docker? [y/N]: %s' "$(dot "$LEMON")" "$RESET"
    IFS= read -r reply || reply="n"
  fi
  [[ "$reply" =~ ^[Yy] ]] || return 1
  run_task "spawn postgres:16-alpine as 'joule-db'" \
    docker run -d --name joule-db -e POSTGRES_USER=joule -e POSTGRES_PASSWORD=joule \
      -e POSTGRES_DB=joule -p 5432:5432 -v joule-pgdata:/var/lib/postgresql/data postgres:16-alpine \
    || die "docker failed to start postgres"
  local i out=""
  for i in $(seq 1 30); do
    out="$(docker exec joule-db pg_isready -U joule -d joule 2>&1 || true)"
    grep -q 'accepting connections' <<<"$out" && break
    sleep 1
  done
  grep -q 'accepting connections' <<<"$out" || die "postgres container never became ready"
  ok "joule-db accepting connections on :5432"
}

stage_database() { # 04 // ANALYTICS — lemon
  hdr "04" "DATABASE" "$LEMON"
  local probe; probe="$(db_probe)" || true
  case "$probe" in
    OK*|EMPTY*) ok "postgres reachable — ${probe#OK }" ;;
    *)
      warn "postgres unreachable at $(mask_url "$DATABASE_URL")"
      if maybe_docker_db; then
        probe="$(db_probe)" || true
        case "$probe" in OK*|EMPTY*) ok "postgres reachable now";; *) die "still unreachable after docker boot";; esac
      else
        die "start postgres (or point .env at a live database) and re-run"
      fi
      ;;
  esac
  run_task "apply prisma migrations" node_modules/.bin/prisma migrate deploy \
    || die "migrate deploy failed — check DATABASE_URL / network"
}

stage_seed() { # 05 // PERSONAL — lavender
  hdr "05" "SEED" "$LAVENDER"
  case "$DO_SEED" in
    no)  skip "seeding disabled (--no-seed)"; return 0;;
    yes) :;;
    *)
      local probe; probe="$(db_probe)" || true
      case "$probe" in
        OK*) skip "already seeded (${probe#OK })"; return 0;;
        *)   warn "cannot probe data ($probe) — seeding anyway";;
      esac
      ;;
  esac
  run_task "seed syllabus + weightage + demo account" "$PM" run db:seed \
    || die "seed failed"
  info "demo login → demo@jee.app / demo1234"
}

print_login_card() {
  local h; h="$(fg "$HAIR")"; local v; v="$(fg "$SKY")"; local d; d="$DIM"
  local bar; printf -v bar '%*s' 44 ''; bar="${bar// /─}"
  printf '\n  %s┌%s┐%s\n' "$h" "$bar" "$RESET"
  printf '  %s│%s %sDEMO ACCOUNT%s                               %s│%s\n' "$h" "$RESET" "$d" "$RESET" "$h" "$RESET"
  printf '  %s│%s  email    %sdemo@jee.app%s                     %s│%s\n' "$h" "$RESET" "$v" "$RESET" "$h" "$RESET"
  printf '  %s│%s  password %sdemo1234%s                         %s│%s\n' "$h" "$RESET" "$v" "$RESET" "$h" "$RESET"
  printf '  %s└%s┘%s\n' "$h" "$bar" "$RESET"
}

stage_launch() { # 06 // SYSTEM — mint
  hdr "06" "LAUNCH" "$MINT"
  local url="http://localhost:$PORT"
  if [[ "$MODE" == "prod" ]]; then
    run_task "production build (next build)" node_modules/.bin/next build || die "build failed"
  fi
  printf '  %s %s\n' "$(pill ' ↑ ' "$MINT")" "serving on $url — Ctrl-C to log off"
  if [[ "$OPEN" == 1 ]]; then
    ( for _ in $(seq 1 120); do
        if command -v curl >/dev/null 2>&1; then
          curl -sf -o /dev/null "$url" 2>/dev/null || { sleep 0.5; continue; }
        else
          sleep 3
        fi
        command -v xdg-open >/dev/null 2>&1 && xdg-open "$url" >/dev/null 2>&1
        command -v open >/dev/null 2>&1 && open "$url" >/dev/null 2>&1
        exit 0
      done ) &
  fi
  print_login_card
  trap 'printf "\n"; warn "focus session ended — the desk lamp clicks off"; colophon; printf "\n"; exit 0' INT TERM
  if [[ "$MODE" == "prod" ]]; then
    node_modules/.bin/next start -p "$PORT"
  else
    node_modules/.bin/next dev -p "$PORT"
  fi
  local rc=$?
  trap - INT TERM
  colophon
  exit $rc
}

# ═════════════════════════════════════════════════════════════════════════════
#  AUX COMMANDS
# ═════════════════════════════════════════════════════════════════════════════
cmd_status() {
  banner
  stage_preflight
  stage_dependencies
  stage_environment
  hdr "04" "DATABASE" "$LEMON"
  local probe; probe="$(db_probe)" || true
  case "$probe" in
    OK*)  ok "reachable & seeded — ${probe#OK }";;
    EMPTY*) warn "reachable, schema not migrated yet (run: $0 migrate)";;
    *)    err "unreachable — ${probe#CONN }";;
  esac
  if [[ "$probe" == OK* || "$probe" == EMPTY* ]]; then
    local ms; ms="$(node_modules/.bin/prisma migrate status 2>&1 || true)"
    grep -qi 'up to date' <<<"$ms" && ok "migrations: up to date" || warn "migrations: pending (run: $0 migrate)"
  fi
  hdr "05" "BUILD" "$LAVENDER"
  [[ -d .next ]] && ok ".next build cache present" || skip "no build yet"
  colophon
}

cmd_help() {
  banner
  printf '\n %s %s00//%s %sUSAGE%s — the dossier index\n' \
    "$(dot "$BUBBLEGUM")" "$BOLD$DIM" "$RESET" "$BOLD" "$RESET"
  cat <<EOF

  ./joule.sh [command] [flags]          default: dev

  $(dot "$SKY") dev        install → env → migrate → seed → next dev
  $(dot "$TANGERINE") build      production build (next build)
  $(dot "$LEMON") start      serve the production build
  $(dot "$LAVENDER") seed       re-seed syllabus + demo data (idempotent)
  $(dot "$MINT") migrate    apply prisma migrations (deploy)
  $(dot "$BUBBLEGUM") studio    open prisma studio on :5555
  $(dot "$CHERRY") backup     JSON backup of every table → backups/
  $(dot "$CHERRY") restore    restore newest backup (interactive)
  $(dot "$NEUTRAL") status     preflight report without launching
  $(dot "$NEUTRAL") help       this page

  ${DIM}flags${RESET}   -p, --port N     port (default 3000)
          --prod          build + start instead of dev
          --open          open the browser once ready
          --seed          force seeding even if data exists
          --no-seed       skip seeding
          --install       force dependency install
          --offline       skip database stages (UI work only)
          --no-color      plain paper, no beans
          -y, --yes       non-interactive; accept defaults
EOF
  colophon
}

require_ready() { # env + deps for the aux commands, quietly
  stage_preflight >/dev/null
  if [[ ! -x node_modules/.bin/next ]] || [[ ! -x node_modules/.bin/prisma ]]; then
    hdr "02" "DEPENDENCIES" "$SKY"
    run_task "install dependencies" "$PM" install || die "install failed"
  fi
  load_env
  [[ -n "${DATABASE_URL:-}" ]] || die "DATABASE_URL missing — run ./$0 first"
}

# ═════════════════════════════════════════════════════════════════════════════
#  ARGV
# ═════════════════════════════════════════════════════════════════════════════
while [[ $# -gt 0 ]]; do
  case "$1" in
    dev|build|start|seed|migrate|studio|backup|restore|status|help) CMD="$1";;
    -p|--port) PORT="${2:?--port needs a value}"; shift;;
    --prod) MODE="prod";;
    --open) OPEN=1;;
    --seed) DO_SEED="yes";;
    --no-seed) DO_SEED="no";;
    --install) FORCE_INSTALL=1;;
    --offline) OFFLINE=1;;
    --no-color) COLOR=0;;
    -y|--yes) ASSUME_YES=1;;
    -h|--help) CMD="help";;
    *) printf 'unknown argument: %s\n\n' "$1" >&2; CMD="help";;
  esac
  shift
done

case "$CMD" in
  help)   cmd_help ;;
  status) cmd_status ;;
  dev)
    banner
    stage_preflight
    stage_dependencies
    stage_environment
    if [[ "$OFFLINE" == 1 ]]; then
      hdr "04" "DATABASE" "$LEMON"
      warn "offline mode — skipping migrate/seed"
    else
      stage_database
      stage_seed
    fi
    stage_launch
    ;;
  build)
    require_ready
    hdr "02" "BUILD" "$SKY"
    run_task "production build (next build)" node_modules/.bin/next build || die "build failed"
    colophon
    ;;
  start) require_ready; MODE="prod"; stage_launch ;;
  seed)  require_ready; DO_SEED="yes"; stage_seed; colophon ;;
  migrate) require_ready; hdr "04" "DATABASE" "$LEMON"; run_task "apply migrations" node_modules/.bin/prisma migrate deploy || die "migrate failed"; colophon ;;
  studio) require_ready; hdr "04" "DATABASE" "$LEMON"; info "prisma studio → http://localhost:5555"; exec node_modules/.bin/prisma studio ;;
  backup)  require_ready; hdr "05" "BACKUP" "$LAVENDER"; "$PM" run db:backup;  colophon ;;
  restore) require_ready; hdr "05" "RESTORE" "$LAVENDER"; "$PM" run db:restore; colophon ;;
esac
