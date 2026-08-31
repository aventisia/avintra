#!/usr/bin/env bash
# Publishes the RunnerApp Linux binary as a framework-dependent single-file executable
# and packages it into a versioned zip ready for upload/distribution.
#
# This script is intended to run on the Jenkins Ubuntu agent (or any Linux dev box).
# The Windows runner is published manually from a Windows developer machine using
# ../RunnerApp.Windows/publish-and-upload-windows.ps1; it can no longer be built on
# Linux because RunnerApp.Windows targets net8.0-windows.
#
# Usage:
#   ./publish-ci.sh [--version <ver>] [--runtime <rid>] [--output <dir>] [--output-name <name>]
#
# Defaults:
#   --version      reads the <Version> from RunnerApp.Windows.csproj (single source of truth)
#   --runtime      linux-x64
#   --output       <RunnerApp>/artifacts
#   --output-name  AvintraRunnerApp (base name for the zip and inner exe)
#
# Output:
#   <output>/<output-name>_<version>_<runtime>.zip
#
# The published single-file executable is renamed to <output-name> after publish.
# The project keeps the RunnerApp name internally to avoid an "Ambiguous project name"
# NuGet error.
#
# The Linux publish is FRAMEWORK-DEPENDENT: the target machine must have .NET 8
# installed. This matches the existing Linux/macOS runner release model.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSPROJ="$SCRIPT_DIR/RunnerApp.Linux.csproj"
VERSION_CSPROJ="$SCRIPT_DIR/../RunnerApp.Windows/RunnerApp.Windows.csproj"

VERSION=""
RUNTIME="linux-x64"
OUTPUT_DIR="$SCRIPT_DIR/../artifacts"
OUTPUT_NAME="AvintraRunnerApp"

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
    --output-name)
      OUTPUT_NAME="$2"
      shift 2
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      echo "usage: $0 [--version <ver>] [--runtime <rid>] [--output <dir>] [--output-name <name>]" >&2
      exit 1
      ;;
  esac
done

# --- Resolve output directory (must be absolute before we cd into a temp dir) --
mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR="$(cd "$OUTPUT_DIR" && pwd)"

# --- Resolve version ----------------------------------------------------------
if [[ ! -f "$VERSION_CSPROJ" ]]; then
  echo "error: RunnerApp version source project not found at $VERSION_CSPROJ" >&2
  exit 1
fi

if [[ -z "$VERSION" ]]; then
  VERSION="$(sed -n 's:.*<Version>\(.*\)</Version>.*:\1:p' "$VERSION_CSPROJ" | head -n1 | tr -d '[:space:]')"
fi

if [[ -z "$VERSION" ]]; then
  echo "error: cannot determine version. Set <Version> in RunnerApp.Windows.csproj or pass --version." >&2
  exit 1
fi

echo "Publishing RunnerApp ($RUNTIME, framework-dependent single-file) v$VERSION ..."

PUBLISH_DIR="$(mktemp -d)"
trap 'rm -rf "$PUBLISH_DIR"' EXIT

dotnet publish "$CSPROJ" \
  -c Release \
  -r "$RUNTIME" \
  --self-contained false \
  -p:PublishSingleFile=true \
  -o "$PUBLISH_DIR"

mkdir -p "$OUTPUT_DIR"

# Rename the published executable to the requested output name.
EXENAME="RunnerApp"
NEWEXENAME="$OUTPUT_NAME"
mv "$PUBLISH_DIR/$EXENAME" "$PUBLISH_DIR/$NEWEXENAME" 2>/dev/null || true

ZIP_NAME="${OUTPUT_NAME}_${VERSION}_${RUNTIME}.zip"
ZIP_PATH="$OUTPUT_DIR/$ZIP_NAME"

# Zip the published output (single-file executable). The zip is what gets distributed/downloaded.
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

# Print the published binary names for quick verification.
echo "Published binaries:"
ls -1 "$PUBLISH_DIR" | sed 's/^/  - /'
