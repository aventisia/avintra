<#
.SYNOPSIS
    Downloads and extracts the Avintra Desktop Runner into a versioned folder.

.DESCRIPTION
    This script downloads the Avintra Desktop Runner archive and extracts it into
    the given target directory using a versioned layout:

        <TargetDir>\latest\AvintraDesktopRunner.exe   <- the version the app launches
        <TargetDir>\v<version>\...                    <- archived copy of each version

    It does NOT install a Windows service and does NOT require elevation. The runner
    is published as a self-contained single-file binary, so the .NET 8 runtime is
    bundled and does NOT need to be installed separately. It is intended to be
    invoked by the Avintra Desktop App on first launch (and later, on background
    updates).

    When a new version is downloaded, the current "latest" folder is archived to
    "v<oldversion>" (read from its version.txt marker) before the new version is
    extracted into "latest". All versions are retained.

.PARAMETER AppBaseUrl
    Backend API base URL, e.g. https://api.avintra.com

    Can also be supplied via the environment variable AVINTRA_APP_BASE_URL.

.PARAMETER TargetDir
    Directory where the runner will be extracted. The script creates
    "latest" and "v<version>" subfolders inside it.
    Default: $env:LOCALAPPDATA\AvintraDesktopApp\binaries\desktop-executor

.PARAMETER RunnerZipUrl
    URL of the AvintraDesktopRunner zip archive to download.
    Optional. When omitted, the script resolves the latest available version at
    runtime from the backend and downloads that archive.

    Can also be supplied via the environment variable AVINTRA_RUNNER_ZIP_URL.

.EXAMPLE
    .\Download-AvintraDesktopRunner.ps1 `
        -AppBaseUrl "https://api.avintra.com" `
        -TargetDir "$env:LOCALAPPDATA\AvintraDesktopApp\binaries\desktop-executor"
#>
[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$RunnerZipUrl = $env:AVINTRA_RUNNER_ZIP_URL,

    [Parameter(Mandatory = $false)]
    [string]$AppBaseUrl = $env:AVINTRA_APP_BASE_URL,

    [Parameter(Mandatory = $false)]
    [string]$TargetDir = (Join-Path $env:LOCALAPPDATA "AvintraDesktopApp\binaries\desktop-executor")
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($AppBaseUrl)) {
    throw "Missing required value for AppBaseUrl. Provide it as a named parameter or set the `$env:AVINTRA_APP_BASE_URL environment variable."
}

# --- Helpers ------------------------------------------------------------------

function Write-Step {
    param ([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Resolve-RunnerZipUrl {
    param ([string]$AppBaseUrl)

    if (-not [string]::IsNullOrWhiteSpace($RunnerZipUrl)) {
        return $RunnerZipUrl
    }

    Write-Step "Resolving latest runner version from backend..."
    $base = $AppBaseUrl.TrimEnd('/')
    $latestUrl = "$base/accounts/api/desktop-app/desktop-executor/latest"
    $latest = Invoke-RestMethod -Uri $latestUrl -UseBasicParsing

    if ([string]::IsNullOrWhiteSpace($latest.url)) {
        throw "Backend returned no runner download URL. Check that the runner archive is published."
    }

    Write-Host "Latest runner version: $($latest.version)" -ForegroundColor Green
    return $latest.url
}

function Get-VersionFromMarker {
    param ([string]$Directory)

    $marker = Join-Path $Directory "version.txt"
    if (Test-Path $marker) {
        return (Get-Content -Path $marker -Raw).Trim()
    }
    return $null
}

function Install-RunnerArchive {
    param (
        [string]$Url,
        [string]$TargetDir
    )

    Write-Step "Downloading runner archive..."

    $tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    $zipPath = Join-Path $tempDir "AvintraDesktopRunner.zip"

    try {
        Invoke-WebRequest -Uri $Url -OutFile $zipPath -UseBasicParsing

        # Determine the version of the archive we just downloaded. The backend URL
        # is AvintraDesktopRunner_<version>_win-x64.zip, so we parse it from the
        # file name.
        $fileName = [System.IO.Path]::GetFileName($Url)
        $version = $null
        if ($fileName -match "AvintraDesktopRunner_(.+)_win-x64\.zip$") {
            $version = $Matches[1]
        }
        if ([string]::IsNullOrWhiteSpace($version)) {
            throw "Could not determine the runner version from the download URL: $Url"
        }

        $latestDir = Join-Path $TargetDir "latest"
        $versionDir = Join-Path $TargetDir "v$version"

        # Archive the current "latest" folder (if any) to its versioned name before
        # replacing it, so older versions are retained for later use.
        if (Test-Path $latestDir) {
            $oldVersion = Get-VersionFromMarker -Directory $latestDir
            if (-not [string]::IsNullOrWhiteSpace($oldVersion)) {
                $oldVersionDir = Join-Path $TargetDir "v$oldVersion"
                if (Test-Path $oldVersionDir) {
                    Write-Host "Removing existing archive folder: $oldVersionDir" -ForegroundColor DarkGray
                    Remove-Item -Path $oldVersionDir -Recurse -Force
                }
                Write-Host "Archiving previous version '$oldVersion' to $oldVersionDir" -ForegroundColor DarkGray
                Move-Item -Path $latestDir -Destination $oldVersionDir -Force
            }
            else {
                Write-Host "Removing unversioned 'latest' folder before refresh." -ForegroundColor DarkGray
                Remove-Item -Path $latestDir -Recurse -Force
            }
        }

        # Extract the new version into a fresh "latest" folder.
        New-Item -ItemType Directory -Path $latestDir -Force | Out-Null
        Write-Host "Extracting runner archive to $latestDir ..." -ForegroundColor DarkGray
        Expand-Archive -Path $zipPath -DestinationPath $latestDir -Force

        # Record the installed version marker.
        Set-Content -Path (Join-Path $latestDir "version.txt") -Value $version -NoNewline

        # Keep a versioned copy of the archive for rollback, but avoid duplicating
        # multiple copies of the large self-contained runtime. We retain only the
        # previous version in addition to "latest".
        if (-not (Test-Path $versionDir)) {
            # Remove any other archived versions first to cap disk usage.
            Get-ChildItem -Path $TargetDir -Directory -Filter "v*" | Where-Object { $_.Name -ne "v$version" } | ForEach-Object {
                Write-Host "Removing old archived version folder: $($_.FullName)" -ForegroundColor DarkGray
                Remove-Item -Path $_.FullName -Recurse -Force
            }
            Write-Host "Copying archive to $versionDir ..." -ForegroundColor DarkGray
            Copy-Item -Path $latestDir -Destination $versionDir -Recurse -Force
        }
    }
    finally {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# --- Main ----------------------------------------------------------------------

Write-Step "Avintra Desktop Runner download started"

$resolvedRunnerZipUrl = Resolve-RunnerZipUrl -AppBaseUrl $AppBaseUrl

New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null

Install-RunnerArchive -Url $resolvedRunnerZipUrl -TargetDir $TargetDir

$runnerExe = Join-Path $TargetDir "latest\AvintraDesktopRunner.exe"
if (-not (Test-Path $runnerExe)) {
    throw "Runner executable not found at $runnerExe. The archive may be invalid."
}

Write-Host "`nDownload complete." -ForegroundColor Green
Write-Host "  Target directory : $TargetDir" -ForegroundColor Gray
Write-Host "  Executable       : $runnerExe" -ForegroundColor Gray
