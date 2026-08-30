#Requires -Version 5.1
<#
.SYNOPSIS
    Publishes RunnerApp locally for desktop-app development on Windows.

.DESCRIPTION
    Builds RunnerApp as a self-contained executable and stages it into the
    desktop app's local runtime directory:

        %LOCALAPPDATA%\AvintraDesktopApp\binaries\runner-app

    The published executable is renamed from RunnerApp.exe to
    AvintraRunnerApp.exe so it matches the file the desktop app expects to
    launch (see runner_management.rs). A version.txt marker is written so the
    desktop app's runner check reports the correct installed version.

    This script is intended for local development only. Use publish.sh for
    CI/distribution builds that produce a versioned zip artifact.

.PARAMETER Version
    Version string written to version.txt and used in messages.
    Defaults to the <Version> value from RunnerApp.Windows.csproj.

.PARAMETER Runtime
    .NET runtime identifier to publish for. Defaults to win-x64.

.PARAMETER Force
    Allow overwriting an existing local installation. Present for compatibility
    with future switches; the script always overwrites by default.

.EXAMPLE
    .\publish-local.ps1

.EXAMPLE
    .\publish-local.ps1 -Version 0.1.90 -Runtime win-x64
#>
[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string] $Version = "",

    [Parameter(Mandatory = $false)]
    [string] $Runtime = "win-x64",

    [Parameter(Mandatory = $false)]
    [switch] $Force
)

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$Csproj = Join-Path $ScriptDir "RunnerApp.Windows\RunnerApp.Windows.csproj"

if (-not (Test-Path $Csproj)) {
    throw "RunnerApp project not found at $Csproj"
}

# --- Resolve version ----------------------------------------------------------
if ([string]::IsNullOrWhiteSpace($Version)) {
    $CsprojXml = [xml](Get-Content $Csproj -Raw)
    $Version = $CsprojXml.Project.PropertyGroup.Version | Select-Object -First 1
    if ([string]::IsNullOrWhiteSpace($Version)) {
        $Version = $CsprojXml.Project.PropertyGroup.InformationalVersion | Select-Object -First 1
    }
}

if ([string]::IsNullOrWhiteSpace($Version)) {
    throw "Cannot determine version. Set <Version> in RunnerApp.Windows.csproj or pass -Version."
}

$Version = $Version.Trim()

# --- Resolve destination ------------------------------------------------------
$LocalAppData = [Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData)
$Destination = Join-Path $LocalAppData "AvintraDesktopApp\binaries\runner-app"

# --- Publish ------------------------------------------------------------------
$PublishDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $PublishDir | Out-Null

try {
    Write-Host "Publishing RunnerApp ($Runtime, self-contained) v$Version ..."

    $publishProcess = Start-Process -FilePath "dotnet" -ArgumentList @(
        "publish", $Csproj,
        "-c", "Release",
        "-r", $Runtime,
        "--self-contained", "true",
        "-o", $PublishDir
    ) -NoNewWindow -Wait -PassThru

    if ($publishProcess.ExitCode -ne 0) {
        throw "dotnet publish failed with exit code $($publishProcess.ExitCode)"
    }

    # --- Stage into desktop app local directory --------------------------------
    if (Test-Path $Destination) {
        Write-Host "Cleaning existing local runner directory: $Destination"
        Remove-Item -Path "$Destination\*" -Recurse -Force -ErrorAction SilentlyContinue
    }
    else {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }

    # The runner is published as a self-contained executable. Copy the whole
    # publish directory so all managed dependencies (including Office interop
    # assemblies) are available at runtime.
    Get-ChildItem -Path $PublishDir -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Substring($PublishDir.Length + 1)
        $targetPath = Join-Path $Destination $relativePath
        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
        }
        else {
            # Rename RunnerApp.exe to AvintraRunnerApp.exe during staging.
            if ($_.Name -eq "RunnerApp.exe") {
                $targetPath = Join-Path $Destination "AvintraRunnerApp.exe"
            }
            Copy-Item -Path $_.FullName -Destination $targetPath -Force -ErrorAction Stop
        }
    }

    $runnerExe = Join-Path $Destination "AvintraRunnerApp.exe"
    if (-not (Test-Path $runnerExe)) {
        throw "Expected runner executable not found after staging: $runnerExe"
    }

    $VersionFile = Join-Path $Destination "version.txt"
    Set-Content -Path $VersionFile -Value $Version -NoNewline -Force

    Write-Host "Staged local runner at $Destination"
    Write-Host "  - $(Join-Path $Destination "AvintraRunnerApp.exe")"
    Write-Host "  - $VersionFile"
}
finally {
    Remove-Item -Path $PublishDir -Recurse -Force -ErrorAction SilentlyContinue
}
