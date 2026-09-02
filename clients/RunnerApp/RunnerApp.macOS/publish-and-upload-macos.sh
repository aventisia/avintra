#!/usr/bin/env bash
# Publishes the RunnerApp macOS binary and uploads it to the selected server(s).
#
# Usage:
#   ./publish-and-upload-macos.sh [--version <ver>] [--target-servers uat|prod]
#                                 [--dry-run] [--skip-upload]
#
# Defaults:
#   --version        reads the <Version> from RunnerApp.Windows.csproj (the single source of truth)
#   --target-servers prompts interactively if not provided (1=uat, 2=prod)
#   --dry-run        print the publish and upload plan without executing uploads
#   --skip-upload    publish only; do not upload
#
# Output:
#   ./artifacts/AvintraRunnerApp_<version>_osx-x64.zip
#
# The macOS runner is a framework-dependent single-file executable:
# the target machine must have .NET 8 installed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSPROJ="$SCRIPT_DIR/RunnerApp.macOS.csproj"

VERSION=""
TARGET_SERVERS=""
DRY_RUN=false
SKIP_UPLOAD=false

# --- Parse arguments -----------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="$2"
      shift 2
      ;;
    --target-servers)
      TARGET_SERVERS="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-upload)
      SKIP_UPLOAD=true
      shift
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      echo "usage: $0 [--version <ver>] [--target-servers uat|prod] [--dry-run] [--skip-upload]" >&2
      exit 1
      ;;
  esac
done

# --- Resolve version ----------------------------------------------------------
if [[ ! -f "$CSPROJ" ]]; then
  echo "error: RunnerApp macOS project not found at $CSPROJ" >&2
  exit 1
fi

if [[ -z "$VERSION" ]]; then
  VERSION="$(sed -n 's:.*<Version>\(.*\)</Version>.*:\1:p' "$SCRIPT_DIR/../RunnerApp.Windows/RunnerApp.Windows.csproj" | head -n1 | tr -d '[:space:]')"
fi

if [[ -z "$VERSION" ]]; then
  echo "error: cannot determine version. Set <Version> in RunnerApp.Windows.csproj or pass --version." >&2
  exit 1
fi

# --- Resolve target servers ----------------------------------------------------
resolve_servers() {
  local choice="$1"
  case "$choice" in
    uat|1)            echo "avuat.aventisia.com" ;;
    prod|2)           echo "avweb1.aventisia.com avweb2.aventisia.com" ;;
    *)                echo "error: unsupported server combination: $choice" >&2; exit 1 ;;
  esac
}

if [[ -z "$TARGET_SERVERS" ]]; then
  if [[ -t 0 ]]; then
    echo "Select target server(s):"
    echo "  1) uat"
    echo "  2) prod"
    read -r -p "Enter 1-2 or name (uat/prod): " TARGET_SERVERS
  else
    echo "error: --target-servers is required when running non-interactively" >&2
    exit 1
  fi
fi

SERVER_LIST="$(resolve_servers "$TARGET_SERVERS")"

# --- Publish ------------------------------------------------------------------
OUTPUT_DIR="$SCRIPT_DIR/../artifacts"
mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR="$(cd "$OUTPUT_DIR" && pwd)"

PUBLISH_DIR="$(mktemp -d)"
trap 'rm -rf "$PUBLISH_DIR"' EXIT

echo "Publishing RunnerApp (osx-x64, framework-dependent) v$VERSION ..."

if [[ "$DRY_RUN" == true ]]; then
  echo "[dry-run] dotnet publish $CSPROJ -c Release -r osx-x64 --self-contained false -p:PublishSingleFile=true -o $PUBLISH_DIR"
else
  dotnet publish "$CSPROJ" \
    -c Release \
    -r osx-x64 \
    --self-contained false \
    -p:PublishSingleFile=true \
    -o "$PUBLISH_DIR"
fi

# Rename the published executable to AvintraRunnerApp.
PUBLISHED_EXE="$PUBLISH_DIR/RunnerApp"
RENAMED_EXE="$PUBLISH_DIR/AvintraRunnerApp"
ZIP_NAME="AvintraRunnerApp_${VERSION}_osx-x64.zip"
ZIP_PATH="$OUTPUT_DIR/$ZIP_NAME"

if [[ "$DRY_RUN" == true ]]; then
  echo "[dry-run] mv $PUBLISHED_EXE $RENAMED_EXE"
  echo "[dry-run] zip $ZIP_PATH from $PUBLISH_DIR"
else
  if [[ ! -f "$PUBLISHED_EXE" ]]; then
    echo "error: expected published executable not found: $PUBLISHED_EXE" >&2
    exit 1
  fi

  mv "$PUBLISHED_EXE" "$RENAMED_EXE"

  if command -v zip >/dev/null 2>&1; then
    (cd "$PUBLISH_DIR" && zip -qr "$ZIP_PATH" .)
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c "import shutil, sys; shutil.make_archive(sys.argv[1], 'zip', sys.argv[2])" \
      "${ZIP_PATH%.zip}" "$PUBLISH_DIR" >/dev/null
  else
    echo "error: neither 'zip' nor 'python3' is available; cannot create the runner archive." >&2
    exit 1
  fi
fi

echo "Published to $ZIP_PATH"
if [[ "$DRY_RUN" == false ]]; then
  ls -lh "$ZIP_PATH"
fi

# --- Upload --------------------------------------------------------------------
if [[ "$SKIP_UPLOAD" == true ]]; then
  echo "Upload skipped (--skip-upload)."
  exit 0
fi

REMOTE_DIR='/var/www/aventisia.com/files/binaries'

echo "Uploading to: $SERVER_LIST"
for server in $SERVER_LIST; do
  if [[ "$DRY_RUN" == true ]]; then
    echo "[dry-run] ssh admin@$server 'mkdir -p $REMOTE_DIR'"
    echo "[dry-run] scp $ZIP_PATH admin@$server:${REMOTE_DIR}/"
  else
    echo "Uploading to $server ..."
    ssh "admin@$server" "mkdir -p $REMOTE_DIR"
    scp "$ZIP_PATH" "admin@$server:${REMOTE_DIR}/"
    echo "Successfully uploaded RunnerApp macOS to $server"
  fi
done
