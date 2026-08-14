#!/usr/bin/env bash
# Publishes the RunnerApp as a self-contained Windows binary and packages it
# into a versioned zip ready for upload/distribution.
#
# Usage:
#   ./publish.sh [--version <ver>] [--runtime <rid>] [--output <dir>]
#
# Defaults:
#   --version  reads the <Version> from RunnerApp.csproj (e.g. 0.1.0)
#   --runtime  win-x64
#   --output   ./artifacts
#
# Output:
#   <output>/AvintraRunnerService_<version>_<runtime>.zip
#
# The published single-file executable is renamed to AvintraRunnerService after
# publish while the project keeps the RunnerApp name internally. This avoids
# an "Ambiguous project name" NuGet error. The service name and artifact prefix
# use "AvintraRunnerService" to distinguish the runner service process from the
# Tauri desktop app (which extracts this same zip and renames the inner exe to
# AvintraRunnerApp.exe before launching it).
#
# The publish is SELF-CONTAINED: the .NET 8 runtime is embedded in the single-file
# executable, so the target machine does NOT need .NET 8 installed. This removes the
# need for winget installs or runtime checks in the provisioning scripts.
#
# This script is reusable for every new version: bump <Version> in the .csproj and rerun.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSPROJ="$SCRIPT_DIR/RunnerApp.csproj"

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
  echo "error: cannot determine version. Set <Version> in RunnerApp.csproj or pass --version." >&2
  exit 1
fi

if [[ ! -f "$CSPROJ" ]]; then
  echo "error: RunnerApp project not found at $CSPROJ" >&2
  exit 1
fi

echo "Publishing RunnerApp ($RUNTIME, self-contained) v$VERSION ..."

PUBLISH_DIR="$(mktemp -d)"
trap 'rm -rf "$PUBLISH_DIR"' EXIT

# On non-Windows build agents (e.g. Ubuntu Jenkins) the Office PIA is not available and is
# not required for the build. Office is resolved dynamically at runtime on the user's
# Windows machine via late binding. If OFFICE_PIA_PATH is set, forward it to MSBuild.
PUBLISH_ARGS=(-c Release -r "$RUNTIME" --self-contained true -o "$PUBLISH_DIR")
if [[ -n "${OFFICE_PIA_PATH:-}" ]]; then
  PUBLISH_ARGS+=(/p:OfficePiaPath="$OFFICE_PIA_PATH")
fi

dotnet publish "$CSPROJ" "${PUBLISH_ARGS[@]}"

mkdir -p "$OUTPUT_DIR"

# Rename the published executable to AvintraRunnerService.
# We do this after publish instead of setting AssemblyName to avoid an
# "Ambiguous project name" conflict during NuGet restore.
EXENAME="RunnerApp"
NEWEXENAME="AvintraRunnerService"
if [[ "$RUNTIME" == win-* ]]; then
  EXENAME="${EXENAME}.exe"
  NEWEXENAME="${NEWEXENAME}.exe"
fi
mv "$PUBLISH_DIR/$EXENAME" "$PUBLISH_DIR/$NEWEXENAME" 2>/dev/null || true

ZIP_NAME="AvintraRunnerService_${VERSION}_${RUNTIME}.zip"
ZIP_PATH="$OUTPUT_DIR/$ZIP_NAME"

# Zip the published output (executable + dependencies). The zip is what gets distributed/downloaded.
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
INSTALL_SCRIPT="$SCRIPT_DIR/Install-AvintraRunnerService.ps1"
if [[ -f "$INSTALL_SCRIPT" ]]; then
  cp "$INSTALL_SCRIPT" "$OUTPUT_DIR/Install-AvintraRunnerService.ps1"
  echo "Copied install script to $OUTPUT_DIR/Install-AvintraRunnerService.ps1"
else
  echo "warning: Install-AvintraRunnerService.ps1 not found at $INSTALL_SCRIPT" >&2
fi

# Print the published binary names for quick verification.
echo "Published binaries:"
ls -1 "$PUBLISH_DIR" | sed 's/^/  - /'
