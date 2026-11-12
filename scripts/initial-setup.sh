#!/usr/bin/env bash
#
# initial-setup.sh — Bootstrap this repository on a fresh clone.
#
# A fresh clone is missing every local, gitignored `.env` / `.env.local` file,
# and none of the project dependencies are installed. This script copies each
# committed `.env.example` template to the local env file its service expects,
# replaces each __GENERATED_BY_INITIAL_SETUP__ key with a local secret (an existing
# env-file value, else the OS environment value, else a random one; JWT_SECRET_KEY
# is shared by every service), and installs the dependencies plus dekit (npm install -g @dekit/cli, which runs
# the local stack from dekit.yaml), so the checkout can be built and run without
# doing it by hand. It also installs the pinned gitleaks binary and enables the
# committed pre-commit hook (core.hooksPath=scripts/hooks) that scans staged
# changes for secrets.
#
# System prerequisites (.NET 8 SDK, Node.js 22+ and npm, Python 3.12, Rust stable
# toolchain for the desktop-app Tauri shell) are NOT installed
# by this script; install them separately first. The script reports what it finds.
#
# Usage:
#   ./scripts/initial-setup.sh                  # create env files + install dependencies
#   ./scripts/initial-setup.sh --skip-install   # create env files only
#   ./scripts/initial-setup.sh --force          # overwrite existing env files
#   ./scripts/initial-setup.sh --help
#
# Existing env files are never overwritten unless --force is given, so the script
# is safe to re-run. It only writes the env files in ENV_FILES, installs
# dependencies, and sets core.hooksPath; it never commits, pushes, or deletes
# anything.

set -euo pipefail

TOTAL_STEPS=4
STEP=0
FORCE=0
SKIP_INSTALL=0

usage() {
  cat <<'USAGE'
initial-setup.sh — Bootstrap this repository on a fresh clone.

Copies each committed .env.example template to the local, gitignored env file
its service expects and installs the project dependencies plus dekit
(npm install -g @dekit/cli), installs gitleaks, and enables the secret-scanning
pre-commit hook. System prerequisites (.NET 8 SDK, Node.js 22+ and npm,
Python 3.12, Rust stable toolchain) must be installed separately first.

Usage:
  ./scripts/initial-setup.sh                  create env files and install dependencies
  ./scripts/initial-setup.sh --skip-install   create env files only
  ./scripts/initial-setup.sh --force          overwrite existing env files
  ./scripts/initial-setup.sh --help           show this help

Existing env files are never overwritten unless --force is given, so the script
is safe to re-run. It only writes env files, installs dependencies, and sets
core.hooksPath; it never commits, pushes, or deletes anything.
USAGE
}

die() { printf 'error: %s\n' "$*" >&2; exit 1; }
step() { STEP=$((STEP + 1)); printf '\n%s[%d/%d] %s%s\n' "$C_STEP" "$STEP" "$TOTAL_STEPS" "$*" "$C_RESET"; }
detail() { printf '      %s\n' "$*"; }
okmark() { printf '      [ok] %s\n' "$1"; }
keepmark() { printf '      [==] %s (exists, kept)\n' "$1"; }
omitmark() { printf '      [--] %s (%s)\n' "$1" "$2"; }
failmark() { printf '      [!!] %s\n' "$1"; }
indent() { sed 's/^/      /'; }

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
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --skip-install) SKIP_INSTALL=1 ;;
    --help|-h) usage; exit 0 ;;
    -*) die "unknown option: $arg" ;;
    *) die "unexpected argument: $arg" ;;
  esac
done

# ---------------------------------------------------------------------------
# Repository root
# ---------------------------------------------------------------------------
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$ROOT/Avplatform.sln" ] \
  || die "Avplatform.sln not found in $ROOT (run this script from the repository)"

printf 'initial-setup — bootstrapping the repository at:\n'
printf '  %s\n' "$ROOT"

# ---------------------------------------------------------------------------
# Step 1 — check prerequisites
# ---------------------------------------------------------------------------
report_tool() {
  local label="$1" cmd="$2"
  shift 2
  if command -v "$cmd" >/dev/null 2>&1; then
    local version
    version="$("$cmd" "$@" 2>/dev/null | head -n1 || true)"
    printf '      [ok] %-11s %s\n' "$label" "${version:-installed}"
  else
    printf '      [--] %-11s not found\n' "$label"
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

step "Checking prerequisites"
report_tool "git" git --version
report_tool "node" node --version
report_tool "npm" npm --version
report_tool "dotnet" dotnet --version
report_tool "rustc" rustc --version
report_tool "cargo" cargo --version
if [ "$(uname -s)" = "Linux" ]; then
  if command -v pkg-config >/dev/null 2>&1 && pkg-config --exists webkit2gtk-4.1; then
    printf '      [ok] %-11s %s\n' "webkit2gtk" "$(pkg-config --modversion webkit2gtk-4.1)"
  else
    printf '      [--] %-11s webkit2gtk-4.1 dev package not found (Tauri: https://v2.tauri.app/start/prerequisites/)\n' "webkit2gtk"
  fi
fi
if PY="$(resolve_python312)"; then
  report_tool "python" "$PY" --version
else
  printf '      [--] %-11s Python 3.12 not found\n' "python"
fi

# ---------------------------------------------------------------------------
# Step 2 — create gitignored env files from the committed .env.example templates
# ---------------------------------------------------------------------------
ENV_FILES=(
  apis/WorcBackend-legacy/AccountsAPIs/.env.local
  apis/WorcBackend-legacy/WorkspaceAPIs/.env.local
  apis/corsair/.env.local
  apis/llmpipeline/.env.local
  clients/web-apps/apps/accounts/.env
  clients/web-apps/apps/workspace/.env
  clients/web-apps/apps/studio/.env
  clients/web-apps/apps/desktop-app/.env
  tests/bruno/.env
)

GENERATED_MARKER="__GENERATED_BY_INITIAL_SETUP__"
GENERATED_KEYS=(JWT_SECRET_KEY AES_ENCRYPTION_KEY AES_INITIALIZATION_VECTOR CORSAIR_KEK)

random_base64() { head -c "$1" /dev/urandom | base64 | tr -d '\n'; }
random_hex() { head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'; }

generate_secret() {
  case "$1" in
    JWT_SECRET_KEY) random_base64 64 ;;
    AES_ENCRYPTION_KEY) random_base64 32 ;;
    AES_INITIALIZATION_VECTOR) random_base64 16 ;;
    CORSAIR_KEK) random_hex 32 ;;
  esac
}

existing_secret() {
  local key="$1" rel value
  for rel in "${ENV_FILES[@]}"; do
    [ -f "$ROOT/$rel" ] || continue
    value="$(sed -n "s/^${key}=//p" "$ROOT/$rel" | head -n1 | tr -d '\r')"
    if [ -n "$value" ] && [ "$value" != "$GENERATED_MARKER" ]; then
      printf '%s' "$value"
      return 0
    fi
  done
  printf '%s' "${!key:-}"
}

# IMPORTANT NOTE: keys are resolved before any template is copied, so --force keeps them;
# a new AES key or Corsair KEK cannot decrypt data already stored in the local databases.
resolve_generated_secrets() {
  local key value
  for key in "${GENERATED_KEYS[@]}"; do
    value="$(existing_secret "$key")"
    [ -n "$value" ] || value="$(generate_secret "$key")"
    printf -v "SECRET_$key" '%s' "$value"
  done
}

fill_generated_secrets() {
  local rel="$1" dst="$ROOT/$1" key var
  grep -q "=${GENERATED_MARKER}" "$dst" || return 0
  for key in "${GENERATED_KEYS[@]}"; do
    var="SECRET_$key"
    KEY="$key" VALUE="${!var}" MARKER="$GENERATED_MARKER" \
      perl -i -pe 's/^\Q$ENV{KEY}=$ENV{MARKER}\E(?=\r?$)/$ENV{KEY}=$ENV{VALUE}/' "$dst"
  done
  okmark "$rel (generated keys filled)"
}

copy_env_template() {
  local rel="$1"
  local dst="$ROOT/$rel"
  local src="${dst%/*}/.env.example"
  [ -f "$src" ] || die "template not found: ${src#"$ROOT"/}"
  if [ -e "$dst" ] && [ "$FORCE" -eq 0 ]; then
    keepmark "$rel"
    return 0
  fi
  cp "$src" "$dst"
  okmark "$rel"
}

step "Creating gitignored env files from .env.example templates"
resolve_generated_secrets
for rel in "${ENV_FILES[@]}"; do
  copy_env_template "$rel"
done
for rel in "${ENV_FILES[@]}"; do
  fill_generated_secrets "$rel"
done

# ---------------------------------------------------------------------------
# Step 3 — install dependencies
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

install_npm() {
  local label="$1" workdir="$2"
  if [ ! -f "$workdir/package.json" ]; then
    omitmark "$label" "${workdir#"$ROOT"/} not found"
  elif command -v npm >/dev/null 2>&1; then
    run_install "$label" "$workdir" npm install --force
  else
    omitmark "$label" "npm not found"
  fi
}

# IMPORTANT NOTE: the committed web-apps lockfile is generated on Windows/Linux, and npm's
# optional-dependency bug (https://github.com/npm/cli/issues/4828) then omits the macOS native
# builds. Install them with --no-save, matching each installed parent's version, so package.json
# and package-lock.json stay unchanged. One command keeps --no-save installs from removing each other.
install_macos_native_builds() {
  local dir="$1" arch entry parent version specs=()
  [ "$(uname -s)" = "Darwin" ] || return 0
  command -v node >/dev/null 2>&1 || return 0
  arch="$(node -p process.arch)"
  for entry in "@swc/core:@swc/core-darwin-$arch" "rollup:@rollup/rollup-darwin-$arch" "@napi-rs/canvas:@napi-rs/canvas-darwin-$arch"; do
    parent="${entry%%:*}"
    [ -f "$dir/node_modules/$parent/package.json" ] || continue
    version="$(cd "$dir" && node -p "require('./node_modules/$parent/package.json').version")"
    specs+=("${entry#*:}@$version")
  done
  [ "${#specs[@]}" -gt 0 ] || return 0
  run_install "web apps macOS native builds (npm install --no-save)" "$dir" npm install --no-save --force "${specs[@]}"
}

step "Installing dependencies"
if [ "$SKIP_INSTALL" -eq 1 ]; then
  detail "skipped (--skip-install)"
else
  LOGDIR="$(mktemp -d)"
  trap 'rm -rf "$LOGDIR"' EXIT

  install_npm "web apps (npm install)" "$ROOT/clients/web-apps"
  [ "$RUN_OK" -eq 1 ] && install_macos_native_builds "$ROOT/clients/web-apps"
  TAURI_DIR="$ROOT/clients/web-apps/apps/desktop-app/src-tauri"
  if [ ! -f "$TAURI_DIR/Cargo.toml" ]; then
    omitmark "desktop-app Rust deps (cargo fetch)" "src-tauri/Cargo.toml not found"
  elif command -v cargo >/dev/null 2>&1; then
    run_install "desktop-app Rust deps (cargo fetch)" "$TAURI_DIR" cargo fetch --locked
  else
    omitmark "desktop-app Rust deps (cargo fetch)" "cargo not found (install Rust via https://rustup.rs)"
  fi
  install_npm "corsair (npm install)" "$ROOT/apis/corsair"
  install_npm "docs (npm install)" "$ROOT/clients/docs"
  install_npm "bruno tests (npm install)" "$ROOT/tests/bruno"

  if command -v npm >/dev/null 2>&1; then
    run_install "dekit (npm install -g @dekit/cli)" "$ROOT" npm install -g @dekit/cli
  else
    omitmark "dekit (npm install -g @dekit/cli)" "npm not found"
  fi

  if [ ! -f "$ROOT/Avplatform.sln" ]; then
    omitmark "dotnet restore (Avplatform.sln)" "Avplatform.sln not found"
  elif command -v dotnet >/dev/null 2>&1; then
    run_install "dotnet restore (Avplatform.sln)" "$ROOT" dotnet restore Avplatform.sln
  else
    omitmark "dotnet restore (Avplatform.sln)" "dotnet not found"
  fi

  LLM_DIR="$ROOT/apis/llmpipeline"
  if [ ! -f "$LLM_DIR/requirements.txt" ]; then
    omitmark "llmpipeline (venv + pip)" "apis/llmpipeline not found"
  elif ! command -v python3 >/dev/null 2>&1 && ! command -v python >/dev/null 2>&1; then
    omitmark "llmpipeline (venv + pip)" "Python not found"
  elif PY="$(resolve_python312)"; then
    run_install "llmpipeline venv ($PY -m venv)" "$LLM_DIR" "$PY" -m venv venv
    if [ "$RUN_OK" -eq 1 ]; then
      run_install "llmpipeline pip install" "$LLM_DIR" ./venv/bin/pip install -r requirements.txt -r requirements-dev.txt
    fi
  else
    omitmark "llmpipeline (venv + pip)" "Python 3.12 not found"
  fi
fi

# ---------------------------------------------------------------------------
# Step 4 — secret scanning: gitleaks binary + pre-commit hook
# ---------------------------------------------------------------------------
step "Setting up secret scanning (gitleaks)"
if [ "$SKIP_INSTALL" -eq 1 ]; then
  detail "skipped (--skip-install)"
else
  run_install "gitleaks (scripts/install-gitleaks.sh)" "$ROOT" bash "$ROOT/scripts/install-gitleaks.sh"
  HOOKS_PATH="$(git -C "$ROOT" config --get core.hooksPath || true)"
  if [ "$RUN_OK" -eq 0 ]; then
    omitmark "pre-commit hook" "gitleaks install failed; the hook would block every commit"
  elif [ -n "$HOOKS_PATH" ] && [ "$HOOKS_PATH" != "scripts/hooks" ]; then
    omitmark "pre-commit hook" "core.hooksPath is already '$HOOKS_PATH'; set it to scripts/hooks yourself"
  else
    git -C "$ROOT" config core.hooksPath scripts/hooks
    okmark "pre-commit hook (core.hooksPath=scripts/hooks)"
  fi
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
printf '\nDone. Repository is bootstrapped.\n'
printf 'Next steps:\n'
printf '  - Local keys (JWT, AES, Corsair KEK) are generated. Set your PostgreSQL credentials\n'
printf '    and admin email in the API env files, and your Bruno login in tests/bruno/.env.\n'
printf '  - Run the stack: dekit up, then dekit attach (more commands at the top of dekit.yaml)\n'

if [ "$INSTALL_FAILED" -eq 1 ]; then
  printf '\nWarning: one or more dependency installs failed; see the output above.\n' >&2
  exit 1
fi
