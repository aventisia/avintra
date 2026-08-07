#!/usr/bin/env bash
# Publishes the DesktopExecutor as a self-contained, single-file Windows binary and
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
# The publish is SELF-CONTAINED: the .NET 8 runtime is embedded in the single-file
# executable, so the target machine does NOT need .NET 8 installed. This removes the
# need for winget installs or runtime checks in the provisioning scripts.
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
  -p:IncludeNativeLibrariesForSelfExtract=true \
  -p:EnableCompressionInSingleFile=true \
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
elif command -v python3 >/dev/null 2>&1; then
  # Fallback for Linux build agents without the `zip` CLI (common in minimal containers).
  python3 -c "import shutil, sys; shutil.make_archive(sys.argv[1], 'zip', sys.argv[2])" \
    "${ZIP_PATH%.zip}" "$PUBLISH_DIR" >/dev/null
else
  echo "error: neither 'zip' nor 'python3' is available; cannot create the runner archive." >&2
  exit 1
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

# Copy the download-only provisioning script (used by the Tauri desktop app on
# first launch) into the artifacts output so it can be uploaded alongside the
# install script.
DOWNLOAD_SCRIPT="$SCRIPT_DIR/Download-AvintraDesktopRunner.ps1"
if [[ -f "$DOWNLOAD_SCRIPT" ]]; then
  cp "$DOWNLOAD_SCRIPT" "$OUTPUT_DIR/Download-AvintraDesktopRunner.ps1"
  echo "Copied download script to $OUTPUT_DIR/Download-AvintraDesktopRunner.ps1"
else
  echo "warning: Download-AvintraDesktopRunner.ps1 not found at $DOWNLOAD_SCRIPT" >&2
fi

# Print the published binary names for quick verification.
echo "Published binaries:"
ls -1 "$PUBLISH_DIR" | sed 's/^/  - /'
