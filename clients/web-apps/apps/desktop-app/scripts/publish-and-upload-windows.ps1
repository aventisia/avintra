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

    Operation mode (-Mode):
      both    - build, sign and upload (default).
      publish - build (+ prod signing) only; no upload.
      upload  - no build; uploads the existing v<Version> installer (+ .sig).
                On prod, an unsigned installer is EV code-signed first and a
                missing updater .sig is regenerated before upload.

    This script is intended to run on a Windows developer machine because NSIS
    Windows installers cannot be cross-compiled from macOS/Linux and no Windows
    Jenkins agent is available.

.PARAMETER Version
    Version string used in artifact name checks. Defaults to the "version"
    value from src-tauri/tauri.conf.json.

.PARAMETER Mode
    Operation mode: both (publish + upload) | publish (no upload) |
    upload (no build; reuses existing artifacts). Aliases 1=both, 2=publish,
    3=upload are also accepted. Defaults to "both" when running
    non-interactively; prompts interactively when omitted.

.PARAMETER TargetServers
    Server combination to upload to: uat | prod | both (aliases 1=uat, 2=prod,
    3=both). If omitted, the script prompts interactively.

.PARAMETER WhatIf
    Print the build and upload plan without executing uploads.

.PARAMETER SkipSign
    Skip the EV code-signing + .sig regeneration steps (prod flow).

.PARAMETER NoSyncVersion
    Skip the release-version.ps1 sync step.

.EXAMPLE
    .\publish-and-upload-windows.ps1

.EXAMPLE
    .\publish-and-upload-windows.ps1 -TargetServers uat -WhatIf

.EXAMPLE
    .\publish-and-upload-windows.ps1 -Mode upload -TargetServers both
#>
#Requires -Version 5.1
[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string] $Version = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("publish", "upload", "both", "1", "2", "3")]
    [string] $Mode = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("uat", "prod", "both", "1", "2", "3")]
    [string] $TargetServers = "",

    [Parameter(Mandatory = $false)]
    [switch] $WhatIf,

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
            # Strip optional surrounding quotes. -and and -or have equal
            # precedence in PowerShell (left-to-right), so each quote pair
            # must be parenthesized explicitly.
            if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
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

# --- Resolve operation mode -----------------------------------------------------------
function Resolve-Mode {
    param ([string] $Choice)
    switch ($Choice) {
        "1" { return "both" }
        "2" { return "publish" }
        "3" { return "upload" }
        default { return $Choice }
    }
}

if ([string]::IsNullOrWhiteSpace($Mode)) {
    if ($Host.UI.RawUI -and ($WhatIf -eq $false)) {
        Write-Host "Select operation mode:"
        Write-Host "  1) publish and upload"
        Write-Host "  2) publish only (no upload)"
        Write-Host "  3) upload only (use existing artifacts, no build)"
        $Mode = Read-Host "Enter 1-3 or name (both/publish/upload)"
    }
    else {
        # Non-interactive default preserves the historical publish + upload flow.
        $Mode = "both"
    }
}

$Mode = Resolve-Mode -Choice $Mode

if (@("both", "publish", "upload") -notcontains $Mode) {
    throw "Unsupported mode: $Mode (use both | publish | upload)"
}

# --- Resolve target servers ----------------------------------------------------------
function Resolve-Servers {
    param ([string] $Choice)
    $normalized = switch ($Choice) {
        "1" { "uat" }
        "2" { "prod" }
        "3" { "both" }
        default { $_ }
    }
    switch ($normalized) {
        "uat" { return @("avuat.aventisia.com") }
        "prod" { return @("avweb1.aventisia.com") }
        "both" { return @("avuat.aventisia.com", "avweb1.aventisia.com") }
        default { throw "Unsupported server combination: $Choice" }
    }
}

# Publish-only mode has no upload target, so server selection is skipped and
# prod EV-signing is deferred to upload time (upload-only signs if unsigned).
if ($Mode -eq "publish") {
    if (-not [string]::IsNullOrWhiteSpace($TargetServers)) {
        Write-Warning "-TargetServers '$TargetServers' ignored in publish-only mode (no upload)."
    }
    $ServerList = @()
    $IsProd = $false
    Write-Host "Publish-only mode: server selection skipped; prod EV code-signing is applied at upload time."
}
else {
    if ([string]::IsNullOrWhiteSpace($TargetServers)) {
        if ($Host.UI.RawUI -and ($WhatIf -eq $false)) {
            Write-Host "Select target server(s):"
            Write-Host "  1) uat"
            Write-Host "  2) prod"
            Write-Host "  3) both (uat + prod)"
            $TargetServers = Read-Host "Enter 1-3 or name (uat/prod/both)"
        }
        else {
            throw "-TargetServers is required when running non-interactively or with -WhatIf"
        }
    }

    $ServerList = Resolve-Servers -Choice $TargetServers
    $NormalizedServers = switch ($TargetServers) {
        "1" { "uat" }
        "2" { "prod" }
        "3" { "both" }
        default { $TargetServers }
    }
    # Signing is tied to whether prod servers are targeted (including "both").
    $IsProd = ($NormalizedServers -eq "prod" -or $NormalizedServers -eq "both")
}

# --- Build ------------------------------------------------------------------------------
$NsisDir = Join-Path $DesktopAppDir "src-tauri\target\release\bundle\nsis"

if ($Mode -ne "upload") {
    # Clean previous artifacts so stale files are never uploaded. Skipped in
    # upload-only mode so existing build outputs can be re-used.
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
}
else {
    Write-Host "Upload-only mode: skipping build, using existing artifacts for v$Version ..."
}

# --- Locate artifacts ----------------------------------------------------------------------
$exeFilter = "AvintraDesktopApp_${Version}_x64-setup.exe"
$exePath = Get-ChildItem -Path $NsisDir -Filter $exeFilter -ErrorAction SilentlyContinue | Select-Object -First 1

if ($Mode -ne "upload" -and -not $exePath) {
    # Fresh build: the exact name is expected, but fall back to any installer
    # in the (just cleaned) bundle dir to stay resilient to naming changes.
    $exePath = Get-ChildItem -Path $NsisDir -Filter "AvintraDesktopApp_*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($exePath) {
        Write-Warning "Installer name '$($exePath.Name)' differs from the expected '$exeFilter'; continuing."
    }
}

if ($WhatIf) {
    Write-Host "[what-if] expected artifact: $NsisDir\$exeFilter (+ .sig)"
    $exePath = [System.IO.FileInfo] "$NsisDir\$exeFilter"
}
elseif (-not $exePath) {
    if ($Mode -eq "upload") {
        throw "No installer for v$Version found in $NsisDir. Build one first with -Mode publish or both, or pass -Version matching an existing build."
    }
    throw "No AvintraDesktopApp_*.exe found in $NsisDir after build."
}

# --- Updater .sig helper -----------------------------------------------------------------------
function Invoke-UpdaterSigRegen {
    param ([string] $ExePath)
    $tauriKey = [System.Environment]::GetEnvironmentVariable("TAURI_SIGNING_PRIVATE_KEY", "Process")
    $tauriPass = [System.Environment]::GetEnvironmentVariable("TAURI_SIGNING_PRIVATE_KEY_PASSWORD", "Process")
    if ([string]::IsNullOrWhiteSpace($tauriKey)) {
        throw "TAURI_SIGNING_PRIVATE_KEY is required to (re)generate the updater .sig"
    }
    Write-Host "Re-generating Tauri updater .sig ..."
    Push-Location $DesktopAppDir
    try {
        npx @tauri-apps/cli signer sign $ExePath -k $tauriKey -p $tauriPass
        if ($LASTEXITCODE -ne 0) { throw "tauri signer sign failed for $ExePath" }
    }
    finally {
        Pop-Location
    }
}

# --- Sign (prod flow) ------------------------------------------------------------------------
if ($WhatIf) {
    if ($IsProd -and -not $SkipSign) {
        Write-Host "[what-if] signtool sign $($exePath.FullName) (EV code-signing)"
        Write-Host "[what-if] npx @tauri-apps/cli signer sign $($exePath.FullName) (regenerate updater .sig)"
        if ($Mode -ne "upload") {
            Write-Host "[what-if] signtool sign UIInspector.exe"
        }
    }
}
elseif ($IsProd -and $SkipSign) {
    Write-Warning "Prod upload requested with -SkipSign: the installer will NOT be EV code-signed."
}
elseif ($IsProd) {
    $signtool = [System.Environment]::GetEnvironmentVariable("WINDOWS_SIGNTOOL_PATH", "Process")
    $certPath = [System.Environment]::GetEnvironmentVariable("WINDOWS_CERT_PATH", "Process")
    $kmsKeyring = [System.Environment]::GetEnvironmentVariable("WINDOWS_KMS_KEYRING", "Process")

    # Upload-only mode signs only when the existing installer is not yet signed.
    $needsSigning = $true
    if ($Mode -eq "upload") {
        $authSig = Get-AuthenticodeSignature -FilePath $exePath.FullName
        if ($authSig.Status -eq "Valid") {
            Write-Host "Installer is already EV code-signed; skipping signing."
            $needsSigning = $false
        }
        else {
            Write-Host "Installer is not EV code-signed (status: $($authSig.Status)); signing now ..."
        }
    }

    if ($needsSigning) {
        if ([string]::IsNullOrWhiteSpace($signtool) -or [string]::IsNullOrWhiteSpace($certPath) -or [string]::IsNullOrWhiteSpace($kmsKeyring)) {
            throw "Prod signing requires WINDOWS_SIGNTOOL_PATH, WINDOWS_CERT_PATH and WINDOWS_KMS_KEYRING in $SecretsFile (or pass -SkipSign)."
        }

        if (-not (Test-Path -LiteralPath $signtool)) {
            throw "signtool.exe not found at '$signtool' (WINDOWS_SIGNTOOL_PATH in $SecretsFile). Install the Windows SDK or fix the path."
        }

        if ($Mode -ne "upload") {
            Write-Host "EV code-signing the installer ..."
        }
        & $signtool sign /v /fd sha256 /t http://timestamp.sectigo.com /f $certPath /csp "Google Cloud KMS Provider" /kc $kmsKeyring $exePath.FullName
        if ($LASTEXITCODE -ne 0) { throw "signtool failed for $($exePath.FullName)" }
    }

    # The updater .sig must match the CURRENT installer bytes. Signing invalidates
    # the previous .sig, so publish/both always regenerates it; upload-only
    # regenerates it when missing and warns when it is stale.
    $sigPath = "$($exePath.FullName).sig"
    $sigIsMissing = -not (Test-Path -LiteralPath $sigPath)
    $sigIsStale = (-not $sigIsMissing) -and ((Get-Item -LiteralPath $sigPath).LastWriteTime -lt (Get-Item -LiteralPath $exePath.FullName).LastWriteTime)

    if ($Mode -eq "upload") {
        if ($sigIsMissing) {
            Invoke-UpdaterSigRegen -ExePath $exePath.FullName
        }
        elseif ($sigIsStale) {
            Write-Warning "Updater .sig is older than the installer: $sigPath. If the installer changed after its last signing, re-run with -Mode publish or both to regenerate it (the updater rejects stale signatures)."
        }
    }
    else {
        Invoke-UpdaterSigRegen -ExePath $exePath.FullName
    }

    if ($Mode -ne "upload") {
        Write-Host "Signing bundled binaries (UIInspector.exe) ..."
        foreach ($bin in @(
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
}

# --- Upload ------------------------------------------------------------------------------------
if ($Mode -eq "publish") {
    Write-Host "Upload skipped (mode: publish only)."
    return
}

$remoteDir = '/var/www/aventisia.com/files/binaries'

# Upload the installer + its updater signature. The .sig must be re-generated
# after EV signing (done above) so the updater accepts the signed exe.
$sigPath = "$($exePath.FullName).sig"

if (-not $WhatIf -and -not (Test-Path -LiteralPath $sigPath)) {
    throw "Updater signature not found: $sigPath. Re-run with -Mode publish or both to generate it."
}

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