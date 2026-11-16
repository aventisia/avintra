#!/usr/bin/env bash
#
# setup-fix.sh — Install the native npm binaries (esbuild, rollup, swc, canvas, ...) that a lockfile
# written on another OS leaves out, so services start without regenerating package-lock.json.
# Linux and macOS; on Windows use scripts/setup-fix.ps1. The work is done by scripts/setup-fix.mjs.
#
# Usage:
#   ./scripts/setup-fix.sh              # install missing native binaries
#   ./scripts/setup-fix.sh --check      # report only, change nothing
#   ./scripts/setup-fix.sh --reinstall  # delete clients/web-apps/node_modules, reinstall, then fix
#   ./scripts/setup-fix.sh --help
#
# Safe to re-run. It never edits package.json or package-lock.json.

set -euo pipefail

command -v node >/dev/null 2>&1 || { printf 'error: node is required (install Node.js 22+)\n' >&2; exit 1; }
exec node "$(dirname "${BASH_SOURCE[0]}")/setup-fix.mjs" "$@"
