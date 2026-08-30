#!/usr/bin/env bash
# Publishes RunnerApp locally for desktop-app development on Linux/WSL.
#
# Builds RunnerApp as a self-contained single-file executable and stages it into
# the desktop app's local runtime directory:
#
#     $XDG_DATA_HOME/AvintraDesktopApp/binaries/runner-app
#     (falls back to $HOME/.local/share/AvintraDesktopApp/binaries/runner-app)
#
# The published executable is renamed from RunnerApp to AvintraRunnerApp (no
# .exe extension) so it matches the cross-platform sidecar naming convention.
# A version.txt marker is written so the desktop app's runner check reports the
# correct installed version.
#
# This script is intended for local development only. Use publish.sh for
# CI/distribution builds that produce a versioned zip artifact.
#
# Usage:
#   ./publish-local.sh [--version <ver>] [--runtime <rid>] [--force]
#
# Defaults:
#   --version  reads the <Version> from RunnerApp.Windows.csproj
#   --runtime  linux-x64

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

VERSION=""
RUNTIME="linux-x64"
FORCE=false

# --- Parse arguments -----------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="$2"
      shift 2
      ;;
    --runtime)
      RUNTIME="$2"
      shift 2
      ;;
    --force)
      FORCE=true
      shift
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      echo "usage: $0 [--version <ver>] [--runtime <rid>] [--force]" >&2
      exit 1
      ;;
  esac
done

# Select the matching platform project.
if [[ "$RUNTIME" == win-* ]]; then
  CSPROJ="$SCRIPT_DIR/RunnerApp.Windows/RunnerApp.Windows.csproj"
else
  CSPROJ="$SCRIPT_DIR/RunnerApp.Linux/RunnerApp.Linux.csproj"
fi

if [[ ! -f "$CSPROJ" ]]; then
  echo "error: RunnerApp project not found at $CSPROJ" >&2
  exit 1
fi

# --- Resolve version ----------------------------------------------------------
if [[ -z "$VERSION" ]]; then
  VERSION="$(sed -n 's:.*<Version>\(.*\)</Version>.*:\1:p' "$CSPROJ" | head -n1 | tr -d '[:space:]')"
fi

if [[ -z "$VERSION" ]]; then
  echo "error: cannot determine version. Set <Version> in RunnerApp.Windows.csproj or pass --version." >&2
  exit 1
fi

# --- Resolve destination ------------------------------------------------------
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
DESTINATION="$DATA_HOME/AvintraDesktopApp/binaries/runner-app"

# --- Publish ------------------------------------------------------------------
PUBLISH_DIR="$(mktemp -d)"
trap 'rm -rf "$PUBLISH_DIR"' EXIT

echo "Publishing RunnerApp ($RUNTIME, self-contained) v$VERSION ..."

dotnet publish "$CSPROJ" \
  -c Release \
  -r "$RUNTIME" \
  --self-contained true \
  -p:PublishSingleFile=true \
  -p:IncludeNativeLibrariesForSelfExtract=true \
  -p:EnableCompressionInSingleFile=true \
  -o "$PUBLISH_DIR"

# --- Stage into desktop app local directory ------------------------------------
mkdir -p "$DESTINATION"
rm -rf "${DESTINATION:?}"/*

PUBLISHED_EXE="$PUBLISH_DIR/RunnerApp"
if [[ "$RUNTIME" == win-* ]]; then
  PUBLISHED_EXE="${PUBLISHED_EXE}.exe"
fi

if [[ ! -f "$PUBLISHED_EXE" ]]; then
  echo "error: expected published executable not found: $PUBLISHED_EXE" >&2
  exit 1
fi

TARGET_EXE="$DESTINATION/AvintraRunnerApp"
if [[ "$RUNTIME" == win-* ]]; then
  TARGET_EXE="${TARGET_EXE}.exe"
fi

cp "$PUBLISHED_EXE" "$TARGET_EXE"
echo "$VERSION" > "$DESTINATION/version.txt"

echo "Staged local runner at $DESTINATION"
ls -1 "$DESTINATION" | sed 's/^/  - /'
