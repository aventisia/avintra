#!/usr/bin/env bash
#
# create-worktree.sh — Create an isolated git worktree for this repository.
#
# The worktree is placed next to the main checkout, inside a shared
# "<repo-parent>/avplatform-wt/" folder. Every local, gitignored `.env` and
# `.env.local` file is copied into the new worktree and its service ports are
# re-prefixed with the worktree number so multiple checkouts can run at once
# without port clashes. API env files also get WT<N>_-prefixed database names
# (WT<N>_AccountsDb, WT<N>_WorkspaceDb, WT<N>_CorsairDb), which the APIs create
# and seed on first start.
#
# The worktree number N (1-50) is the only input: the worktree is named
# "wt-N" and its port prefix is N, so the name always identifies the ports.
#
# Port mapping:
#   2999 -> 1 299      3001 -> 1 301      4000 -> 1 400
#   2999 -> 2 299      3001 -> 2 301      4000 -> 2 400
#   i.e. new = N*1000 + (original/1000)*100 + (original % 100).
#
# Usage:
#   ./scripts/create-worktree.sh                 # prompt for a number, detached HEAD
#   ./scripts/create-worktree.sh 3               # worktree "wt-3", port prefix 3, detached HEAD
#   ./scripts/create-worktree.sh 3 --branch      # branch "wt-3-base-branch"
#   ./scripts/create-worktree.sh 3 --skip-install   # do not install dependencies
#
# After the worktree is created and its env files are re-prefixed, the script
# bootstraps dependencies inside the new worktree: npm install for the web apps,
# Corsair, docs and Bruno collections; dotnet restore for the root solution; and
# a Python 3.12 virtualenv + pip install for the LLM pipeline. A failing install
# is reported and the script exits non-zero, but the worktree is kept. Pass
# --skip-install to skip this step.
#
# The script only creates the worktree, edits the copied env files, and installs
# dependencies; it does NOT commit, push, or touch the main checkout's files.

set -euo pipefail

WT_BASE_NAME="avplatform-wt"
MAX_WORKTREES=50
TOTAL_STEPS=5

# Canonical (main-checkout) service ports that participate in re-prefixing.
BASE_PORTS=(2999 3001 3002 3006 3007 4000 4001 4003 4005 4006)

die() { printf 'error: %s\n' "$*" >&2; exit 1; }
step() { STEP=$((STEP + 1)); printf '\n%s[%d/%d] %s%s\n' "$C_STEP" "$STEP" "$TOTAL_STEPS" "$*" "$C_RESET"; }
field() { printf '      %-15s %s\n' "$1:" "$2"; }
detail() { printf '      %s\n' "$*"; }
okmark() { printf '      [ok] %s\n' "$1"; }
skipmark() { printf '      [--] %s (no ports to update)\n' "$1"; }
failmark() { printf '      [!!] %s\n' "$1"; }
omitmark() { printf '      [--] %s (%s)\n' "$1" "$2"; }
indent() { sed 's/^/      /'; }
STEP=0

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ] && [ "${TERM:-dumb}" != "dumb" ]; then
  C_STEP=$'\033[1;32m'
  C_RESET=$'\033[0m'
else
  C_STEP=""
  C_RESET=""
fi

# ---------------------------------------------------------------------------
# Arguments
# ---------------------------------------------------------------------------
N=""
CREATE_BRANCH=0
SKIP_INSTALL=0
for arg in "$@"; do
  case "$arg" in
    --branch) CREATE_BRANCH=1 ;;
    --detach) CREATE_BRANCH=0 ;;
    --skip-install) SKIP_INSTALL=1 ;;
    -*) die "unknown option: $arg" ;;
    *) N="$arg" ;;
  esac
done

# ---------------------------------------------------------------------------
# Resolve the main worktree (source of truth for env files and base ports)
# ---------------------------------------------------------------------------
MAIN="$(git worktree list --porcelain 2>/dev/null | awk 'NR==1{sub(/^worktree /,""); print}')" \
  || die "not inside a git repository"
[ -n "$MAIN" ] || die "not inside a git repository"

# ---------------------------------------------------------------------------
# Worktree number -> name and port prefix
# ---------------------------------------------------------------------------
if [ -z "$N" ]; then
  printf 'Enter worktree number (1-%d): ' "$MAX_WORKTREES"
  read -r N || die "aborted"
fi
N="${N#"${N%%[![:space:]]*}"}"
N="${N%"${N##*[![:space:]]}"}"
[ -n "$N" ] || die "worktree number cannot be empty"
[[ "$N" =~ ^[1-9][0-9]?$ ]] && [ "$N" -le "$MAX_WORKTREES" ] \
  || die "invalid worktree number '$N' (use a whole number from 1 to $MAX_WORKTREES)"
WT_NAME="wt-$N"

PARENT="$(dirname "$MAIN")"
WT_BASE="$PARENT/$WT_BASE_NAME"
WT_PATH="$WT_BASE/$WT_NAME"

if [ "$CREATE_BRANCH" -eq 1 ]; then
  MODE="branch ($WT_NAME-base-branch)"
  BRANCH="$WT_NAME-base-branch"
else
  MODE="detached HEAD"
fi

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
[ -e "$WT_PATH" ] && die "worktree number $N is in use; path already exists: $WT_PATH"
if git worktree list --porcelain | grep -Fxq "worktree $WT_PATH"; then
  die "worktree number $N is in use; a worktree is registered at: $WT_PATH"
fi
if [ "$CREATE_BRANCH" -eq 1 ]; then
  git -C "$MAIN" show-ref --verify --quiet "refs/heads/$BRANCH" \
    && die "branch '$BRANCH' already exists"
fi

printf 'create-worktree — setting up a new worktree\n'

# ---------------------------------------------------------------------------
# Step 1 — locate repository
# ---------------------------------------------------------------------------
step "Locating repository"
field "main checkout" "$MAIN"

# ---------------------------------------------------------------------------
# Step 2 — create worktree
# ---------------------------------------------------------------------------
step "Creating worktree"
field "name" "$WT_NAME"
field "path" "$WT_PATH"
field "mode" "$MODE"
field "port prefix" "$N"
mkdir -p "$WT_BASE"
if [ "$CREATE_BRANCH" -eq 1 ]; then
  if ! out="$(git -C "$MAIN" worktree add -b "$BRANCH" "$WT_PATH" 2>&1)"; then
    printf '%s\n' "$out" | indent >&2
    die "failed to create worktree"
  fi
else
  if ! out="$(git -C "$MAIN" worktree add --detach "$WT_PATH" 2>&1)"; then
    printf '%s\n' "$out" | indent >&2
    die "failed to create worktree"
  fi
fi
printf '%s\n' "$out" | indent

# ---------------------------------------------------------------------------
# Step 3 — locate gitignored env files
# ---------------------------------------------------------------------------
step "Locating gitignored .env files"
ENV_FILES=()
while IFS= read -r rel; do
  [ -n "$rel" ] || continue
  ENV_FILES+=("$rel")
done < <(
  git -C "$MAIN" ls-files --others --ignored --exclude-standard --directory -z 2>/dev/null \
    | tr '\0' '\n' \
    | grep -E '(^|/)\.env(\.local)?$' || true
)
if [ "${#ENV_FILES[@]}" -eq 0 ]; then
  detail "(none found)"
else
  field "found" "${#ENV_FILES[@]} file(s)"
fi

# ---------------------------------------------------------------------------
# Step 4 — copy env files and re-prefix ports
# ---------------------------------------------------------------------------
PERL_PROG="$(cat <<'PERL'
BEGIN {
  @base = (2999, 3001, 3002, 3006, 3007, 4000, 4001, 4003, 4005, 4006);
  for $c (@base) {
    $suffix{$c} = 1;
    $bySuffix{ int($c/1000)*100 + ($c % 100) } = $c;
  }
  $N = $ENV{WT_PORT_PREFIX};
}
sub mp {
  my ($p) = @_;
  my $c;
  if ($suffix{$p}) { $c = $p; }
  elsif (length($p) == 5 && $suffix{substr($p, 1)}) { $c = substr($p, 1); }
  elsif ($p >= 1000 && $p < 2000 && $bySuffix{$p - 1000}) { $c = $bySuffix{$p - 1000}; }
  else { return $p; }
  return $N * 1000 + int($c/1000)*100 + ($c % 100);
}
s/(localhost:)(\d{4,5})/$1 . mp($2)/ge;
s/(127\.0\.0\.1:)(\d{4,5})/$1 . mp($2)/ge;
s/(\b[A-Za-z_]*PORT=)(\d{4,5})/$1 . mp($2)/ge;
PERL
)"

copy_and_prefix() {
  local rel="$1"
  local src="$MAIN/$rel"
  local dst="$WT_PATH/$rel"
  [ -f "$src" ] || return 0
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  local before
  before="$(cat "$dst")"
  WT_PORT_PREFIX="$N" perl -i -pe "$PERL_PROG" "$dst"
  if [ "$(cat "$dst")" != "$before" ]; then
    okmark "$rel"
  else
    skipmark "$rel"
  fi
}

set_db_names() {
  local rel="$1"
  local dst="$WT_PATH/$rel"
  local prefix="WT${N}_"
  [ -f "$dst" ] || return 0
  perl -i -ne 'print unless /^\s*(POSTGRESQL_ACCOUNTS_DB_NAME|POSTGRESQL_WORKSPACE_DB_NAME|POSTGRESQL_DATABASE)=/' "$dst"
  printf '\nPOSTGRESQL_ACCOUNTS_DB_NAME=%sAccountsDb\nPOSTGRESQL_WORKSPACE_DB_NAME=%sWorkspaceDb\nPOSTGRESQL_DATABASE=%sCorsairDb\n' \
    "$prefix" "$prefix" "$prefix" >>"$dst"
  okmark "$rel (databases -> ${prefix}*)"
}

step "Copying env files and updating ports and database names"
if [ "${#ENV_FILES[@]}" -eq 0 ]; then
  detail "(nothing to copy)"
else
  for rel in "${ENV_FILES[@]}"; do
    copy_and_prefix "$rel"
  done
  for rel in "${ENV_FILES[@]}"; do
    case "$rel" in apis/*) set_db_names "$rel" ;; esac
  done
fi

# ---------------------------------------------------------------------------
# Step 5 — bootstrap dependencies inside the worktree
# ---------------------------------------------------------------------------
INSTALL_FAILED=0
RUN_OK=1
LOGDIR=""

run_install() {
  local label="$1" workdir="$2" log
  shift 2
  log="$LOGDIR/$(printf '%s' "$label" | tr -c 'A-Za-z0-9._-' '_').log"
  printf '      [..] %s\n' "$label"
  if ( cd "$workdir" && "$@" ) >"$log" 2>&1; then
    okmark "$label"
    RUN_OK=1
  else
    failmark "$label"
    indent <"$log" >&2
    INSTALL_FAILED=1
    RUN_OK=0
  fi
}

resolve_python312() {
  local cand
  for cand in python3.12 python3 python; do
    if command -v "$cand" >/dev/null 2>&1 \
      && "$cand" -c 'import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 12) else 1)' 2>/dev/null; then
      printf '%s' "$cand"
      return 0
    fi
  done
  return 1
}

step "Installing dependencies"
if [ "$SKIP_INSTALL" -eq 1 ]; then
  detail "skipped (--skip-install)"
else
  LOGDIR="$(mktemp -d)"
  trap 'rm -rf "$LOGDIR"' EXIT

  if [ -f "$WT_PATH/clients/web-apps/package.json" ]; then
    run_install "web apps (npm install)" "$WT_PATH/clients/web-apps" npm install --force
  else
    omitmark "web apps (npm install)" "clients/web-apps not found"
  fi

  if [ -f "$WT_PATH/apis/corsair/package.json" ]; then
    run_install "corsair (npm install)" "$WT_PATH/apis/corsair" npm install --force
  else
    omitmark "corsair (npm install)" "apis/corsair not found"
  fi

  if [ -f "$WT_PATH/clients/docs/package.json" ]; then
    run_install "docs (npm install)" "$WT_PATH/clients/docs" npm install --force
  else
    omitmark "docs (npm install)" "clients/docs not found"
  fi

  if [ -f "$WT_PATH/tests/bruno/package.json" ]; then
    run_install "bruno tests (npm install)" "$WT_PATH/tests/bruno" npm install --force
  else
    omitmark "bruno tests (npm install)" "tests/bruno not found"
  fi

  if [ -f "$WT_PATH/Avplatform.sln" ]; then
    run_install "dotnet restore (Avplatform.sln)" "$WT_PATH" dotnet restore Avplatform.sln
  else
    omitmark "dotnet restore (Avplatform.sln)" "Avplatform.sln not found"
  fi

  LLM_DIR="$WT_PATH/apis/llmpipeline"
  if [ -f "$LLM_DIR/requirements.txt" ]; then
    if PY="$(resolve_python312)"; then
      run_install "llmpipeline venv ($PY -m venv)" "$LLM_DIR" "$PY" -m venv venv
      if [ "$RUN_OK" -eq 1 ]; then
        run_install "llmpipeline pip install" "$LLM_DIR" ./venv/bin/pip install -r requirements.txt -r requirements-dev.txt
      fi
    else
      omitmark "llmpipeline (venv + pip)" "Python 3.12 not found"
    fi
  else
    omitmark "llmpipeline (venv + pip)" "apis/llmpipeline not found"
  fi
fi

printf '\nDone. New worktree is ready:\n'
printf '  %s\n' "$WT_PATH"
printf 'Open it with: cd "%s"\n' "$WT_PATH"

if [ "$INSTALL_FAILED" -eq 1 ]; then
  printf '\nWarning: one or more dependency installs failed; see the output above.\n' >&2
  exit 1
fi
