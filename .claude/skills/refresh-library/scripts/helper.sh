#!/usr/bin/env bash
# Pepipedia library refresh helper.
#
#   helper.sh fetch         Download every Pepipedia monograph into $WORK/raw
#   helper.sh diff          Compare against src/lib/data/library.json; write $WORK/todo.json
#   helper.sh merge         Rebuild library.json from $WORK/raw + $WORK/paraphrased.json
#   helper.sh check-store   Confirm every NovaEvum product link still answers 200
#
# WORK defaults to a temp dir that survives between steps of one refresh.
set -euo pipefail

ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
WORK="${WORK:-${TMPDIR:-/tmp}/pepipedia-refresh}"
LIB="$ROOT/src/lib/data/library.json"
PY="$(dirname "$0")/library.py"
export ROOT WORK LIB

cmd="${1:-}"
case "$cmd" in
  fetch)
    rm -rf "$WORK/raw"
    mkdir -p "$WORK/raw"
    python3 "$PY" fetch
    ;;
  diff)
    python3 "$PY" diff
    ;;
  merge)
    python3 "$PY" merge
    ;;
  check-store)
    fail=0
    # Worksheet slugs only: stop before the stacks list, whose slugs are not products.
    slugs=$(sed '/^export const stacks/q' "$ROOT/src/lib/data/protocols.ts" | grep -oE '^    slug: "[^"]+"' | cut -d'"' -f2)
    for slug in $slugs; do
      code=$(curl -s -o /dev/null -m 15 -A "Mozilla/5.0" -w '%{http_code}' "https://www.novaevum.ca/shop/$slug")
      if [ "$code" = "200" ]; then echo "ok    $slug"; else echo "FAIL  $slug ($code)"; fail=1; fi
    done
    exit "$fail"
    ;;
  *)
    echo "usage: $0 {fetch|diff|merge|check-store}" >&2
    exit 2
    ;;
esac
