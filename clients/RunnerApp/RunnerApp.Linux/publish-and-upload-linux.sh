#!/usr/bin/env bash
# Publishes the RunnerApp Linux binary and uploads it to the selected server(s).
#
# Usage:
#   ./publish-and-upload-linux.sh [--version <ver>] [--target-servers uat|prod|both]
#                                 [--mode both|publish|upload] [--dry-run]
#
# Defaults:
#   --version        reads the <Version> from RunnerApp.Windows.csproj (the single source of truth)
#   --target-servers prompts interactively if not provided (1=uat, 2=prod, 3=both)
#   --mode           prompts interactively if not provided (1=both, 2=publish, 3=upload)
#   --dry-run        print the publish and upload plan without executing uploads
#
# Output:
#   ./artifacts/AvintraRunnerApp_<version>_linux-x64.zip
#
# The Linux runner is a framework-dependent single-file executable:
# the target machine must have .NET 8 installed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSPROJ="$SCRIPT_DIR/RunnerApp.Linux.csproj"

VERSION=""
TARGET_SERVERS=""
MODE=""
DRY_RUN=false

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
    --mode)
      MODE="$2"
      shift 2
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      echo "usage: $0 [--version <ver>] [--target-servers uat|prod|both] [--mode both|publish|upload] [--dry-run]" >&2
      exit 1
      ;;
  esac
done

# --- Resolve version ----------------------------------------------------------
if [[ ! -f "$CSPROJ" ]]; then
  echo "error: RunnerApp Linux project not found at $CSPROJ" >&2
  exit 1
fi

if [[ -z "$VERSION" ]]; then
  VERSION="$(sed -n 's:.*<Version>\(.*\)</Version>.*:\1:p' "$SCRIPT_DIR/../RunnerApp.Windows/RunnerApp.Windows.csproj" | head -n1 | tr -d '[:space:]')"
fi

if [[ -z "$VERSION" ]]; then
  echo "error: cannot determine version. Set <Version> in RunnerApp.Windows.csproj or pass --version." >&2
  exit 1
fi

# --- Resolve operation mode -----------------------------------------------------
resolve_mode() {
  local choice="$1"
  case "$choice" in
    both|1)      echo "both" ;;
    publish|2)   echo "publish" ;;
    upload|3)    echo "upload" ;;
    *)           echo "error: unsupported mode: $choice (use both | publish | upload)" >&2; exit 1 ;;
  esac
}

if [[ -z "$MODE" ]]; then
  if [[ -t 0 ]]; then
    echo "Select operation mode:"
    echo "  1) publish and upload"
    echo "  2) publish only (no upload)"
    echo "  3) upload only (use existing artifacts, no build)"
    read -r -p "Enter 1-3 or name (both/publish/upload): " MODE
  else
    MODE="both"
  fi
fi

MODE="$(resolve_mode "$MODE")"

# --- Resolve target servers ----------------------------------------------------
resolve_servers() {
  local choice="$1"
  case "$choice" in
    uat|1)            echo "avuat.aventisia.com" ;;
    prod|2)           echo "avweb1.aventisia.com" ;;
    both|3)           echo "avuat.aventisia.com avweb1.aventisia.com" ;;
    *)                echo "error: unsupported server combination: $choice" >&2; exit 1 ;;
  esac
}

# Publish-only mode has no upload target, so server selection is skipped.
if [[ "$MODE" == "publish" ]]; then
  if [[ -n "$TARGET_SERVERS" ]]; then
    echo "note: --target-servers is ignored in publish-only mode (no upload)."
  fi
  SERVER_LIST=""
else
  if [[ -z "$TARGET_SERVERS" ]]; then
    if [[ -t 0 ]]; then
      echo "Select target server(s):"
      echo "  1) uat"
      echo "  2) prod"
      echo "  3) both (uat + prod)"
      read -r -p "Enter 1-3 or name (uat/prod/both): " TARGET_SERVERS
    else
      echo "error: --target-servers is required when running non-interactively" >&2
      exit 1
    fi
  fi

  SERVER_LIST="$(resolve_servers "$TARGET_SERVERS")"
fi

# --- Publish ------------------------------------------------------------------
OUTPUT_DIR="$SCRIPT_DIR/../artifacts"
mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR="$(cd "$OUTPUT_DIR" && pwd)"

PUBLISH_DIR="$(mktemp -d)"
trap 'rm -rf "$PUBLISH_DIR"' EXIT

if [[ "$MODE" == "upload" ]]; then
  echo "Upload-only mode: skipping publish, using existing artifacts for v$VERSION ..."
  if [[ "$DRY_RUN" == true ]]; then
    echo "[dry-run] locate $OUTPUT_DIR/AvintraRunnerApp_${VERSION}_linux-x64.zip"
  fi
else
  echo "Publishing RunnerApp (linux-x64, framework-dependent) v$VERSION ..."

  if [[ "$DRY_RUN" == true ]]; then
    echo "[dry-run] dotnet publish $CSPROJ -c Release -r linux-x64 --self-contained false -p:PublishSingleFile=true -o $PUBLISH_DIR"
  else
    dotnet publish "$CSPROJ" \
      -c Release \
      -r linux-x64 \
      --self-contained false \
      -p:PublishSingleFile=true \
      -o "$PUBLISH_DIR"
  fi
fi

# Rename the published executable to AvintraRunnerApp.
PUBLISHED_EXE="$PUBLISH_DIR/RunnerApp"
RENAMED_EXE="$PUBLISH_DIR/AvintraRunnerApp"
ZIP_NAME="AvintraRunnerApp_${VERSION}_linux-x64.zip"
ZIP_PATH="$OUTPUT_DIR/$ZIP_NAME"

if [[ "$MODE" == "upload" ]]; then
  # Upload-only: locate the previously published archive for this version.
  if [[ ! -f "$ZIP_PATH" ]]; then
    echo "error: archive for v$VERSION not found at $ZIP_PATH. Publish first with --mode publish or both, or pass --version matching an existing archive." >&2
    exit 1
  fi
elif [[ "$DRY_RUN" == true ]]; then
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
if [[ "$DRY_RUN" == false && "$MODE" != "upload" ]]; then
  ls -lh "$ZIP_PATH"
fi

# --- Upload --------------------------------------------------------------------
if [[ "$MODE" == "publish" ]]; then
  echo "Upload skipped (mode: publish only)."
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
    echo "Successfully uploaded RunnerApp Linux to $server"
  fi
done
