#!/usr/bin/env bash
#
# install-gitleaks.sh — install the pinned gitleaks binary for the current user.
#
# Downloads the release for the current OS/architecture, verifies its SHA-256
# against the published checksums, and installs it to ~/.local/bin (override
# with GITLEAKS_INSTALL_DIR). Run once per machine; re-running is a no-op when
# the pinned version is already installed.

set -euo pipefail

VERSION="8.30.1"
DEST_DIR="${GITLEAKS_INSTALL_DIR:-$HOME/.local/bin}"
DEST="$DEST_DIR/gitleaks"

case "$(uname -s)" in
  Linux) OS=linux ;;
  Darwin) OS=darwin ;;
  *)
    printf 'error: unsupported OS "%s"; download a release from https://github.com/gitleaks/gitleaks/releases/tag/v%s\n' "$(uname -s)" "$VERSION" >&2
    exit 2
    ;;
esac

case "$(uname -m)" in
  x86_64|amd64) ARCH=x64 ;;
  arm64|aarch64) ARCH=arm64 ;;
  *)
    printf 'error: unsupported architecture "%s"\n' "$(uname -m)" >&2
    exit 2
    ;;
esac

if [ -x "$DEST" ] && "$DEST" version 2>/dev/null | grep -Eq "^v?$VERSION$"; then
  printf 'gitleaks v%s is already installed at %s\n' "$VERSION" "$DEST"
  exit 0
fi

ASSET="gitleaks_${VERSION}_${OS}_${ARCH}.tar.gz"
BASE="https://github.com/gitleaks/gitleaks/releases/download/v${VERSION}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

printf 'Downloading %s...\n' "$ASSET"
curl -fsSL "$BASE/$ASSET" -o "$TMP/$ASSET"
curl -fsSL "$BASE/gitleaks_${VERSION}_checksums.txt" -o "$TMP/checksums.txt"

EXPECTED="$(awk -v file="$ASSET" '$2 == file { print $1 }' "$TMP/checksums.txt")"
if [ -z "$EXPECTED" ]; then
  printf 'error: no checksum published for %s\n' "$ASSET" >&2
  exit 1
fi

if command -v sha256sum >/dev/null 2>&1; then
  ACTUAL="$(sha256sum "$TMP/$ASSET" | awk '{ print $1 }')"
elif command -v shasum >/dev/null 2>&1; then
  ACTUAL="$(shasum -a 256 "$TMP/$ASSET" | awk '{ print $1 }')"
else
  printf 'error: sha256sum or shasum is required to verify the download\n' >&2
  exit 1
fi

if [ "$ACTUAL" != "$EXPECTED" ]; then
  printf 'error: checksum mismatch for %s\n' "$ASSET" >&2
  exit 1
fi

tar -xzf "$TMP/$ASSET" -C "$TMP" gitleaks
mkdir -p "$DEST_DIR"
install -m 0755 "$TMP/gitleaks" "$DEST"
printf 'Installed gitleaks v%s at %s\n' "$VERSION" "$DEST"
case ":$PATH:" in
  *":$DEST_DIR:"*) ;;
  *) printf 'Add it to PATH for direct use: export PATH="%s:$PATH"\n' "$DEST_DIR" ;;
esac
