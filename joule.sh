#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  JOULE // JEE PREPARATION PLATFORM — local configure & run
#  Jellybean Dossier edition · PAPER #0A0908 · INK #DED5C6 · BEANS ×8
#
#  The terminal UI is a Bubble Tea (charmbracelet) program living in tui/.
#  This launcher builds it once, caches the binary in .tui/, and execs it —
#  every argument passes straight through:
#
#      ./joule.sh            → preflight → install → .env → migrate → seed → dev
#      ./joule.sh --prod     → same, then next build && next start
#
#  Subcommands: dev | build | start | seed | migrate | studio | backup |
#               restore | status | help
#  Flags:  -p/--port N   --prod  --open  --seed  --no-seed  --install
#          --offline (skip DB steps)  --no-color  -y/--yes
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BIN="$ROOT/.tui/joule-tui"

rebuild=0
if [[ ! -x "$BIN" ]]; then
  rebuild=1
elif [[ -n "$(find "$ROOT/tui" -name '*.go' -newer "$BIN" -print -quit 2>/dev/null)" ]]; then
  rebuild=1
fi

if [[ "$rebuild" == 1 ]]; then
  command -v go >/dev/null 2>&1 || {
    echo "joule: Go ≥ 1.22 is required to build the terminal UI — https://go.dev/dl" >&2
    exit 1
  }
  mkdir -p "$ROOT/.tui"
  (cd "$ROOT/tui" && go build -o "$BIN" .) || exit 1
fi

exec env JOULE_ROOT="$ROOT" "$BIN" "$@"
