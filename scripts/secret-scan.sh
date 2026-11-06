#!/usr/bin/env bash
#
# secret-scan.sh — run gitleaks over this repository.
#
# Usage:
#   ./scripts/secret-scan.sh            # full git history (what CI runs)
#   ./scripts/secret-scan.sh --staged   # staged changes only (pre-commit hook)
#
# Requires the gitleaks binary installed by scripts/install-gitleaks.sh or .ps1 (or one
# already on PATH). Findings are redacted so secrets do not reach logs.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_GITLEAKS="${GITLEAKS_INSTALL_DIR:-$HOME/.local/bin}/gitleaks"
STAGED=0

for arg in "$@"; do
  case "$arg" in
    --staged) STAGED=1 ;;
    --help|-h) sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) printf 'error: unknown option: %s\n' "$arg" >&2; exit 2 ;;
  esac
done

ARGS=(git "$ROOT" --redact --verbose --no-banner)
[ -t 1 ] || ARGS+=(--no-color)
if [ "$STAGED" -eq 1 ]; then
  ARGS+=(--pre-commit --staged)
fi

for candidate in "$LOCAL_GITLEAKS" "$LOCAL_GITLEAKS.exe"; do
  [ -x "$candidate" ] && exec "$candidate" "${ARGS[@]}"
done

if command -v gitleaks >/dev/null 2>&1; then
  exec gitleaks "${ARGS[@]}"
fi

printf 'error: gitleaks not found; run ./scripts/install-gitleaks.sh (install-gitleaks.ps1 on Windows) once\n' >&2
exit 2
