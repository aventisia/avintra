#!/usr/bin/env bash
#
# release-version.sh — Write the current release version into the Desktop app
# and Runner app from a single source of truth: the latest git tag.
#
# The version is derived from the most recent tag matching `v<X.Y.Z>` (e.g.
# `v0.1.86`). The leading `v` is stripped, and the resulting `X.Y.Z` is written
# into every file that needs a literal version string at build time.
#
# Usage:
#   ./scripts/release-version.sh            # use latest git tag (v0.1.86 -> 0.1.86)
#   ./scripts/release-version.sh 0.2.0      # override with an explicit version
#   ./scripts/release-version.sh --show     # print the resolved version only
#
# The script only edits files; it does NOT create git commits or tags.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
die() { echo "error: $*" >&2; exit 1; }

# Replace a regex (perl syntax) in a file. $1=file, $2=perl regex, $3=replacement.
replace() {
  local file="$1" regex="$2" repl="$3"
  [[ -f "$file" ]] || die "file not found: $file"
  perl -0pi -e "s{$regex}{$repl}g" "$file"
}

validate_version() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "invalid version '$1' (expected X.Y.Z)"
}

# ---------------------------------------------------------------------------
# Resolve the version
# ---------------------------------------------------------------------------
resolve_version() {
  if [[ $# -eq 1 && "$1" != "--show" ]]; then
    validate_version "$1"
    echo "$1"
    return
  fi

  local tag
  tag="$(git -C "$ROOT" describe --tags --abbrev=0 2>/dev/null || true)"
  if [[ -z "$tag" ]]; then
    die "no git tag found. Create a tag like 'v0.1.86' or pass an explicit version."
  fi

  # Strip a leading 'v' if present (v0.1.86 -> 0.1.86).
  local ver="${tag#v}"
  validate_version "$ver"
  echo "$ver"
}

# ---------------------------------------------------------------------------
# Propagation
# ---------------------------------------------------------------------------
propagate() {
  local new="$1"

  # 1. RunnerApp (.NET service)
  replace "$ROOT/clients/RunnerApp/RunnerApp.csproj" \
    '<Version>[0-9.]+</Version>' "<Version>$new</Version>"
  replace "$ROOT/clients/RunnerApp/RunnerApp.csproj" \
    '<InformationalVersion>[0-9.]+</InformationalVersion>' "<InformationalVersion>$new</InformationalVersion>"

  # 2. Desktop app (Tauri)
  replace "$ROOT/clients/web-apps/apps/desktop-app/src-tauri/tauri.conf.json" \
    '"version": "[0-9.]+"' "\"version\": \"$new\""
  # userAgent string also embeds the version
  replace "$ROOT/clients/web-apps/apps/desktop-app/src-tauri/tauri.conf.json" \
    'AvintraDesktopApp/[0-9.]+' "AvintraDesktopApp/$new"
  replace "$ROOT/clients/web-apps/apps/desktop-app/src-tauri/Cargo.toml" \
    '^version = "[0-9.]+"' "version = \"$new\""
  # Cargo.lock: only the "app" package entry (name = "app" followed by version)
  replace "$ROOT/clients/web-apps/apps/desktop-app/src-tauri/Cargo.lock" \
    'name = "app"\nversion = "[0-9.]+"' "name = \"app\"\nversion = \"$new\""

  # 3. Desktop-app npm package.json
  replace "$ROOT/clients/web-apps/apps/desktop-app/package.json" \
    '"version": "[0-9.]+"' "\"version\": \"$new\""
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if [[ "${1:-}" == "--show" ]]; then
  echo "$(resolve_version)"
  exit 0
fi

new="$(resolve_version "$@")"
propagate "$new"
echo "Release version set to $new (from git tag) across Desktop + Runner."
