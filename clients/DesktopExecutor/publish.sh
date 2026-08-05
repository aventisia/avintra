#!/usr/bin/env bash
# Publishes the DesktopExecutor as a self-contained, single-file Windows binary and
# packages it into a versioned zip ready for upload/distribution.
#
# Usage:
#   ./scripts/publish-executor.sh [--version <ver>] [--runtime <rid>] [--output <dir>]
#
# Defaults:
#   --version  reads the <Version> from DesktopExecutor.csproj (e.g. 0.1.0)
#   --runtime  win-x64
#   --output   ./artifacts
#
# Output:
#   <output>/DesktopExecutor_<version>_win-x64.zip
#
# This script is reusable for every new version: bump <Version> in the .csproj and rerun.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSPROJ="$SCRIPT_DIR/DesktopExecutor.csproj"

VERSION=""
RUNTIME="win-x64"
OUTPUT_DIR="$SCRIPT_DIR/artifacts"

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
    --output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      echo "usage: $0 [--version <ver>] [--runtime <rid>] [--output <dir>]" >&2
      exit 1
      ;;
  esac
done

# --- Resolve version ----------------------------------------------------------
if [[ -z "$VERSION" ]]; then
  VERSION="$(sed -n 's:.*<Version>\(.*\)</Version>.*:\1:p' "$CSPROJ" | head -n1 | tr -d '[:space:]')"
fi

if [[ -z "$VERSION" ]]; then
  echo "error: cannot determine version. Set <Version> in DesktopExecutor.csproj or pass --version." >&2
  exit 1
fi

if [[ ! -f "$CSPROJ" ]]; then
  echo "error: DesktopExecutor project not found at $CSPROJ" >&2
  exit 1
fi

echo "Publishing DesktopExecutor ($RUNTIME, self-contained) v$VERSION ..."

PUBLISH_DIR="$(mktemp -d)"
trap 'rm -rf "$PUBLISH_DIR"' EXIT

dotnet publish "$CSPROJ" \
  -c Release \
  -r "$RUNTIME" \
  --self-contained true \
  -p:PublishSingleFile=true \
  -o "$PUBLISH_DIR"

mkdir -p "$OUTPUT_DIR"

ZIP_NAME="DesktopExecutor_${VERSION}_${RUNTIME}.zip"
ZIP_PATH="$OUTPUT_DIR/$ZIP_NAME"

# Zip the published output (single-file exe). The zip is what gets distributed/downloaded.
if command -v zip >/dev/null 2>&1; then
  (cd "$PUBLISH_DIR" && zip -qr "$ZIP_PATH" .)
else
  powershell.exe -NoProfile -Command \
    "Compress-Archive -Path '$PUBLISH_DIR/*' -DestinationPath '$ZIP_PATH' -Force" 2>/dev/null \
    || { echo "error: neither 'zip' nor PowerShell Compress-Archive is available." >&2; exit 1; }
fi

echo "Published to $ZIP_PATH"
ls -lh "$ZIP_PATH"
