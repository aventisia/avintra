# setup-fix.ps1 - Install the native npm binaries (esbuild, rollup, swc, canvas, ...) that a lockfile
# written on another OS leaves out, so services start without regenerating package-lock.json.
# Windows; on Linux and macOS use scripts/setup-fix.sh. The work is done by scripts/setup-fix.mjs.
#
# Usage:
#   .\scripts\setup-fix.ps1              # install missing native binaries
#   .\scripts\setup-fix.ps1 -Check       # report only, change nothing
#   .\scripts\setup-fix.ps1 -Reinstall   # delete clients\web-apps\node_modules, reinstall, then fix
#   .\scripts\setup-fix.ps1 -Help
#
# Safe to re-run. It never edits package.json or package-lock.json.

param(
    [switch]$Check,
    [switch]$Reinstall,
    [switch]$Help
)

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'error: node is required (install Node.js 22+)' -ForegroundColor Red
    exit 1
}

$NodeArgs = @(Join-Path $PSScriptRoot 'setup-fix.mjs')
if ($Check) { $NodeArgs += '--check' }
if ($Reinstall) { $NodeArgs += '--reinstall' }
if ($Help) { $NodeArgs += '--help' }

& node @NodeArgs
exit $LASTEXITCODE
