<#
.SYNOPSIS
    Builds the AvintraDesktopApp (Tauri) Windows NSIS installer and uploads it
    to the selected server(s).

.DESCRIPTION
    Loads signing secrets from ../.env.local, syncs the release version from
    the latest git tag (scripts/release-version.ps1), runs `npx tauri build`,
    optionally EV code-signs the installer and re-generates the Tauri updater
    .sig (prod flow), and uploads AvintraDesktopApp_*.exe (+ .sig) to the chosen
    server combination.

    This script is intended to run on a Windows developer machine because NSIS
    Windows installers cannot be cross-compiled from macOS/Linux and no Windows
    Jenkins agent is available.

.PARAMETER Version
    Version string used in artifact name checks. Defaults to the "version"
    value from src-tauri/tauri.conf.json.

.PARAMETER TargetServers
    Server combination to upload to: uat | prod (aliases 1=uat, 2=prod).
    If omitted, the script prompts interactively.

.PARAMETER WhatIf
    Print the build and upload plan without executing uploads.

.PARAMETER SkipUpload
    Build only; do not upload.

.PARAMETER SkipSign
    Skip the EV code-signing + .sig regeneration steps (prod flow).

.PARAMETER NoSyncVersion
    Skip the release-version.ps1 sync step.

.EXAMPLE
    .\publish-and-upload-windows.ps1

.EXAMPLE
    .\publish-and-upload-windows.ps1 -TargetServers uat -WhatIf
#>
#Requires -Version 5.1
[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string] $Version = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("uat", "prod", "1", "2")]
    [string] $TargetServers = "",

    [Parameter(Mandatory = $false)]
    [switch] $WhatIf,

    [Parameter(Mandatory = $false)]
    [switch] $SkipUpload,

    [Parameter(Mandatory = $false)]
    [switch] $SkipSign,

    [Parameter(Mandatory = $false)]
    [switch] $NoSyncVersion
)

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$DesktopAppDir = Resolve-Path (Join-Path $ScriptDir "..")
$TauriConf = Join-Path $DesktopAppDir "src-tauri\tauri.conf.json"
$SecretsFile = Join-Path $DesktopAppDir "scripts\.env.local"

# --- Load signing secrets -------------------------------------------------------
$IsDryRunPlan = [bool]$WhatIf
if (-not (Test-Path $SecretsFile)) {
    if ($IsDryRunPlan) {
        Write-Warning ".env.local not found; continuing (plan only)."
    }
    else {
        throw "Secrets file not found at $SecretsFile. Copy scripts/.env.local.example to scripts/.env.local and fill in the values."
    }
}
else {
    Get-Content $SecretsFile | ForEach-Object {
        if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
            $name = $Matches[1]
            $value = $Matches[2].Trim()
            # Strip optional surrounding quotes
            if ($value.Length -ge 2 -and ($value.StartsWith('"') -and $value.EndsWith('"') -or $value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }

    if ([string]::IsNullOrWhiteSpace([System.Environment]::GetEnvironmentVariable("TAURI_SIGNING_PRIVATE_KEY", "Process")) -and -not $IsDryRunPlan) {
        throw "TAURI_SIGNING_PRIVATE_KEY is empty in $SecretsFile"
    }
}

# --- Resolve version --------------------------------------------------------------
if (-not (Test-Path $TauriConf)) {
    throw "tauri.conf.json not found at $TauriConf"
}

if ([string]::IsNullOrWhiteSpace($Version)) {
    $conf = Get-Content $TauriConf -Raw | ConvertFrom-Json
    $Version = $conf.version
}

if ([string]::IsNullOrWhiteSpace($Version)) {
    throw "Cannot determine version. Set `"version`" in src-tauri/tauri.conf.json or pass -Version."
}

$Version = $Version.Trim()

# --- Resolve target servers ----------------------------------------------------------
function Resolve-Servers {
    param ([string] $Choice)
    $normalized = switch ($Choice) {
        "1" { "uat" }
        "2" { "prod" }
        default { $_ }
    }
    switch ($normalized) {
        "uat" { return @("avuat.aventisia.com") }
        "prod" { return @("avweb1.aventisia.com", "avweb2.aventisia.com") }
        default { throw "Unsupported server combination: $Choice" }
    }
}

if ([string]::IsNullOrWhiteSpace($TargetServers)) {
    if ($Host.UI.RawUI -and ($WhatIf -eq $false)) {
        Write-Host "Select target server(s):"
        Write-Host "  1) uat"
        Write-Host "  2) prod"
        $TargetServers = Read-Host "Enter 1-2 or name (uat/prod)"
    }
    else {
        throw "-TargetServers is required when running non-interactively or with -WhatIf"
    }
}

$ServerList = Resolve-Servers -Choice $TargetServers
$IsProd = ($TargetServers -eq "prod" -or $TargetServers -eq "2")

# --- Build ------------------------------------------------------------------------------
$NsisDir = Join-Path $DesktopAppDir "src-tauri\target\release\bundle\nsis"

# Clean previous artifacts so stale files are never uploaded.
if (Test-Path $NsisDir) {
    Remove-Item -Path (Join-Path $NsisDir "*") -Force -ErrorAction SilentlyContinue
}

if (-not $NoSyncVersion -and -not $WhatIf) {
    $releaseScript = Join-Path $DesktopAppDir "..\..\..\..\scripts\release-version.ps1"
    Write-Host "Syncing release version from git tag (release-version.ps1) ..."
    & powershell -NoProfile -ExecutionPolicy Bypass -File $releaseScript
    if ($LASTEXITCODE -ne 0) {
        throw "release-version.ps1 failed. Create a git tag like v0.2.23 or pass -NoSyncVersion."
    }
}

Write-Host "Building AvintraDesktopApp (NSIS) v$Version ..."

if ($WhatIf) {
    Write-Host "[what-if] (cd $DesktopAppDir) npx tauri build"
}
else {
    Push-Location $DesktopAppDir
    try {
        npx tauri build
        if ($LASTEXITCODE -ne 0) { throw "npx tauri build failed" }
    }
    finally {
        Pop-Location
    }
}

# --- Locate artifacts ----------------------------------------------------------------------
$exePath = Get-ChildItem -Path $NsisDir -Filter "AvintraDesktopApp_*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($WhatIf) {
    Write-Host "[what-if] expected artifact: $NsisDir\AvintraDesktopApp_$Version-x64-setup.exe (+ .sig)"
    $exePath = [System.IO.FileInfo] "$NsisDir\AvintraDesktopApp_$Version-x64-setup.exe"
}
elseif (-not $exePath) {
    throw "No AvintraDesktopApp_*.exe found in $NsisDir after build."
}

# --- Sign (prod flow) ------------------------------------------------------------------------
if ($WhatIf) {
    if ($IsProd -and -not $SkipSign) {
        Write-Host "[what-if] signtool sign $($exePath.FullName) (EV code-signing)"
        Write-Host "[what-if] npx @tauri-apps/cli signer sign $($exePath.FullName) (regenerate updater .sig)"
        Write-Host "[what-if] signtool sign NodeExecutor.exe + UIInspector.exe"
    }
}
elseif ($IsProd -and -not $SkipSign) {
    $signtool = [System.Environment]::GetEnvironmentVariable("WINDOWS_SIGNTOOL_PATH", "Process")
    $certPath = [System.Environment]::GetEnvironmentVariable("WINDOWS_CERT_PATH", "Process")
    $kmsKeyring = [System.Environment]::GetEnvironmentVariable("WINDOWS_KMS_KEYRING", "Process")

    if ([string]::IsNullOrWhiteSpace($signtool) -or [string]::IsNullOrWhiteSpace($certPath) -or [string]::IsNullOrWhiteSpace($kmsKeyring)) {
        throw "Prod signing requires WINDOWS_SIGNTOOL_PATH, WINDOWS_CERT_PATH and WINDOWS_KMS_KEYRING in $SecretsFile (or pass -SkipSign)."
    }

    $tauriKey = [System.Environment]::GetEnvironmentVariable("TAURI_SIGNING_PRIVATE_KEY", "Process")
    $tauriPass = [System.Environment]::GetEnvironmentVariable("TAURI_SIGNING_PRIVATE_KEY_PASSWORD", "Process")

    Write-Host "EV code-signing the installer ..."
    & $signtool sign /v /fd sha256 /t http://timestamp.sectigo.com /f $certPath /csp "Google Cloud KMS Provider" /kc $kmsKeyring $exePath.FullName
    if ($LASTEXITCODE -ne 0) { throw "signtool failed for $($exePath.FullName)" }

    Write-Host "Re-generating Tauri updater .sig after code signing ..."
    Push-Location $DesktopAppDir
    try {
        npx @tauri-apps/cli signer sign $exePath.FullName -k $tauriKey -p $tauriPass
        if ($LASTEXITCODE -ne 0) { throw "tauri signer sign failed for $($exePath.FullName)" }
    }
    finally {
        Pop-Location
    }

    Write-Host "Signing bundled binaries (NodeExecutor.exe, UIInspector.exe) ..."
    foreach ($bin in @(
        (Join-Path $DesktopAppDir "src-tauri\binaries\runner\NodeExecutor.exe"),
        (Join-Path $DesktopAppDir "src-tauri\binaries\ui-inspector\UIInspector.exe")
    )) {
        if (Test-Path $bin) {
            & $signtool sign /v /fd sha256 /t http://timestamp.sectigo.com /f $certPath /csp "Google Cloud KMS Provider" /kc $kmsKeyring $bin
            if ($LASTEXITCODE -ne 0) { throw "signtool failed for $bin" }
        }
        else {
            Write-Warning "Bundled binary not found, skipping: $bin"
        }
    }
}
elseif ($IsProd) {
    Write-Warning "Prod upload requested with -SkipSign: the installer will NOT be EV code-signed."
}

# --- Upload ------------------------------------------------------------------------------------
if ($SkipUpload) {
    Write-Host "Upload skipped (-SkipUpload)."
    return
}

$remoteDir = '/var/www/aventisia.com/files/binaries'

# Upload the installer + its updater signature. The .sig must be re-generated
# after EV signing (done above) so the updater accepts the signed exe.
$sigPath = "$($exePath.FullName).sig"

Write-Host "Uploading to: $($ServerList -join ', ')"
foreach ($server in $ServerList) {
    if ($WhatIf) {
        Write-Host "[what-if] ssh admin@${server} 'mkdir -p $remoteDir'"
        Write-Host "[what-if] scp $($exePath.FullName) admin@${server}:${remoteDir}/"
        Write-Host "[what-if] scp $sigPath admin@${server}:${remoteDir}/"
    }
    else {
        Write-Host "Uploading to $server ..."
        ssh "admin@${server}" "mkdir -p $remoteDir"
        scp "$($exePath.FullName)" "admin@${server}:${remoteDir}/"
        scp "$sigPath" "admin@${server}:${remoteDir}/"
        Write-Host "Successfully uploaded AvintraDesktopApp Windows to $server"
    }
}