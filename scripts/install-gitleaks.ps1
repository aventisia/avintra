#
# install-gitleaks.ps1 — install the pinned gitleaks binary for the current user.
#
# Windows counterpart of install-gitleaks.sh (which it runs on Linux and macOS).
# Downloads the release for the current architecture, verifies its SHA-256
# against the published checksums, and installs gitleaks.exe to ~\.local\bin
# (override with GITLEAKS_INSTALL_DIR), where scripts/secret-scan.sh looks first.
# Run once per machine; re-running is a no-op when the pinned version is installed.

$ErrorActionPreference = 'Stop'

if ($PSVersionTable.PSEdition -eq 'Core' -and -not $IsWindows) {
    & bash (Join-Path $PSScriptRoot 'install-gitleaks.sh')
    exit $LASTEXITCODE
}

$Version = '8.30.1'
$DestDir = if ($env:GITLEAKS_INSTALL_DIR) { $env:GITLEAKS_INSTALL_DIR } else { Join-Path $HOME '.local\bin' }
$Dest = Join-Path $DestDir 'gitleaks.exe'

$Arch = switch ($env:PROCESSOR_ARCHITECTURE) {
    'AMD64' { 'x64' }
    'ARM64' { 'arm64' }
    'x86' { 'x32' }
    default {
        [Console]::Error.WriteLine("error: unsupported architecture '$env:PROCESSOR_ARCHITECTURE'")
        exit 2
    }
}

if (Test-Path -LiteralPath $Dest) {
    $installed = & $Dest version 2>$null
    if ($installed -match "^v?$([regex]::Escape($Version))$") {
        Write-Output "gitleaks v$Version is already installed at $Dest"
        exit 0
    }
}

$Asset = "gitleaks_${Version}_windows_${Arch}.zip"
$Base = "https://github.com/gitleaks/gitleaks/releases/download/v$Version"
$Tmp = Join-Path ([IO.Path]::GetTempPath()) ([Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $Tmp | Out-Null

try {
    Write-Output "Downloading $Asset..."
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -UseBasicParsing -Uri "$Base/$Asset" -OutFile (Join-Path $Tmp $Asset)
    Invoke-WebRequest -UseBasicParsing -Uri "$Base/gitleaks_${Version}_checksums.txt" -OutFile (Join-Path $Tmp 'checksums.txt')

    $expected = Get-Content (Join-Path $Tmp 'checksums.txt') |
        ForEach-Object { $parts = $_ -split '\s+'; if ($parts[1] -eq $Asset) { $parts[0] } } |
        Select-Object -First 1
    if (-not $expected) {
        [Console]::Error.WriteLine("error: no checksum published for $Asset")
        exit 1
    }
    $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $Tmp $Asset)).Hash
    if ($actual -ne $expected) {
        [Console]::Error.WriteLine("error: checksum mismatch for $Asset")
        exit 1
    }

    Expand-Archive -LiteralPath (Join-Path $Tmp $Asset) -DestinationPath (Join-Path $Tmp 'x')
    New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
    Copy-Item -LiteralPath (Join-Path $Tmp 'x\gitleaks.exe') -Destination $Dest -Force
    Write-Output "Installed gitleaks v$Version at $Dest"
    if (-not (($env:Path -split ';') -contains $DestDir)) {
        Write-Output "Add $DestDir to your user PATH to run gitleaks directly; the hook and scripts/secret-scan.sh find it without that."
    }
} finally {
    Remove-Item -Recurse -Force -LiteralPath $Tmp -ErrorAction SilentlyContinue
}
