#!/usr/bin/env bash
# Publishes the DesktopExecutor as a framework-dependent, single-file Windows binary and
# packages it into a versioned zip ready for upload/distribution.
#
# Usage:
#   ./publish.sh [--version <ver>] [--runtime <rid>] [--output <dir>]
#
# Defaults:
#   --version  reads the <Version> from DesktopExecutor.csproj (e.g. 0.1.0)
#   --runtime  win-x64
#   --output   ./artifacts
#
# Output:
#   <output>/AvintraDesktopRunner_<version>_<runtime>.zip
#
# The published single-file executable is renamed to AvintraDesktopRunner after
# publish while the project keeps the DesktopExecutor name internally. This avoids
# an "Ambiguous project name" NuGet error and matches the UI label "Desktop Runner".
#
# The .NET 8 runtime is NOT bundled; the target machine must install it first.
# The AvintraDesktopRunner --install command will fail with a clear message if the
# runtime is missing (use --skip-runtime-check to override the check).
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

echo "Publishing DesktopExecutor ($RUNTIME, framework-dependent) v$VERSION ..."

PUBLISH_DIR="$(mktemp -d)"
trap 'rm -rf "$PUBLISH_DIR"' EXIT

dotnet publish "$CSPROJ" \
  -c Release \
  -r "$RUNTIME" \
  --self-contained false \
  -p:PublishSingleFile=true \
  -o "$PUBLISH_DIR"

mkdir -p "$OUTPUT_DIR"

# Rename the published single-file executable to AvintraDesktopRunner.
# We do this after publish instead of setting AssemblyName to avoid an
# "Ambiguous project name" conflict during NuGet restore.
EXENAME="DesktopExecutor"
NEWEXENAME="AvintraDesktopRunner"
if [[ "$RUNTIME" == win-* ]]; then
  EXENAME="${EXENAME}.exe"
  NEWEXENAME="${NEWEXENAME}.exe"
fi
mv "$PUBLISH_DIR/$EXENAME" "$PUBLISH_DIR/$NEWEXENAME" 2>/dev/null || true

ZIP_NAME="AvintraDesktopRunner_${VERSION}_${RUNTIME}.zip"
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

# Copy the install provisioning script into the artifacts output so it can be
# uploaded to the server's scripts/ directory alongside the runner zip. This
# keeps the served script in sync with the source of truth.
INSTALL_SCRIPT="$SCRIPT_DIR/Install-AvintraDesktopRunner.ps1"
if [[ -f "$INSTALL_SCRIPT" ]]; then
  cp "$INSTALL_SCRIPT" "$OUTPUT_DIR/Install-AvintraDesktopRunner.ps1"
  echo "Copied install script to $OUTPUT_DIR/Install-AvintraDesktopRunner.ps1"
else
  echo "warning: Install-AvintraDesktopRunner.ps1 not found at $INSTALL_SCRIPT" >&2
fi

# Print the published binary names for quick verification.
echo "Published binaries:"
ls -1 "$PUBLISH_DIR" | sed 's/^/  - /'
