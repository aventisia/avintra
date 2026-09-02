#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Provisions AvintraRunnerService as a Windows service from a local archive.

.DESCRIPTION
    Uses a locally-built runner archive (zip), extracts it to a fixed directory,
    registers it as a Windows service, and starts the service.

    This is identical to Install-AvintraRunnerService.ps1 except it does NOT
    download anything from the internet. Use it for fast local iteration when
    you have slow internet or are testing a freshly-published build.

    The runner is published as a self-contained single-file binary, so the .NET 8
    runtime is bundled and does NOT need to be installed separately.

    Run this from an elevated PowerShell prompt. The script aborts if it is not
    running as Administrator.

.PARAMETER RunnerZipPath
    Path to the local AvintraRunnerService zip archive.

    If omitted, the script looks for the most recent
    AvintraRunnerService_*_win-x64.zip file in ..\artifacts (the default output
    of publish-and-upload-windows.ps1).

    Can also be supplied via the environment variable AVINTRA_RUNNER_ZIP_PATH.

.PARAMETER AppBaseUrl
    Backend API base URL, e.g. https://api.avintra.com

    Can also be supplied via the environment variable AVINTRA_APP_BASE_URL.

.PARAMETER ApiKey
    Tenant API key used by the service to register with the backend.

    Can also be supplied via the environment variable AVINTRA_API_KEY.

.PARAMETER TenantId
    Tenant ID (GUID) used together with the API key.

    Can also be supplied via the environment variable AVINTRA_TENANT_ID.

.PARAMETER LinkedUsername
    Linked workspace username used together with the API key.

    Can also be supplied via the environment variable AVINTRA_LINKED_USERNAME.

.PARAMETER InstallDir
    Directory where the runner will be extracted. Default: C:\Program Files\AvintraRunnerService

.PARAMETER ServiceName
    Name of the Windows service. Default: AvintraRunnerService

.PARAMETER DoNotStart
    Install the service but do not start it immediately.

.PARAMETER Unattended
    Launch spawned worker processes in session 0 without UI instead of the default
    active interactive session. Use this for headless servers or when the runner must
    never show UI. UI-dependent nodes will fail fast instead of blocking.

.EXAMPLE
    Set $env variables then run the local script. The latest local zip is used
    automatically:

        $env:AVINTRA_APP_BASE_URL = "https://api.avintra.com"
        $env:AVINTRA_API_KEY = "my-api-key"
        $env:AVINTRA_TENANT_ID = "00000000-0000-0000-0000-000000000000"
        $env:AVINTRA_LINKED_USERNAME = "jdoe"
        .\Install-AvintraRunnerService-Local.ps1

.EXAMPLE
    Use a specific local archive:

        .\Install-AvintraRunnerService-Local.ps1 `
            -RunnerZipPath "..\artifacts\AvintraRunnerService_0.2.23_win-x64.zip" `
            -AppBaseUrl "https://api.avintra.com" `
            -ApiKey "my-api-key" `
            -TenantId "00000000-0000-0000-0000-000000000000" `
            -LinkedUsername "jdoe"
#>
[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$RunnerZipPath = $env:AVINTRA_RUNNER_ZIP_PATH,

    [Parameter(Mandatory = $false)]
    [string]$AppBaseUrl = $env:AVINTRA_APP_BASE_URL,

    [Parameter(Mandatory = $false)]
    [string]$ApiKey = $env:AVINTRA_API_KEY,

    [Parameter(Mandatory = $false)]
    [string]$TenantId = $env:AVINTRA_TENANT_ID,

    [Parameter(Mandatory = $false)]
    [string]$LinkedUsername = $env:AVINTRA_LINKED_USERNAME,

    [Parameter(Mandatory = $false)]
    [string]$InstallDir = "C:\Program Files\AvintraRunnerService",

    [Parameter(Mandatory = $false)]
    [string]$ServiceName = "AvintraRunnerService",

    [Parameter(Mandatory = $false)]
    [switch]$DoNotStart,

    [Parameter(Mandatory = $false)]
    [switch]$Unattended
)

$ErrorActionPreference = "Stop"

# Validate required parameters.
$requiredParams = @{
    AppBaseUrl     = $AppBaseUrl
    ApiKey         = $ApiKey
    TenantId       = $TenantId
    LinkedUsername = $LinkedUsername
}

foreach ($entry in $requiredParams.GetEnumerator()) {
    if ([string]::IsNullOrWhiteSpace($entry.Value)) {
        throw "Missing required value for $($entry.Key). Provide it as a named parameter or set the corresponding `$env:AVINTRA_$($entry.Key.ToUpperInvariant()) environment variable."
    }
}

# --- Helpers ------------------------------------------------------------------

function Write-Step {
    param ([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Resolve-RunnerZipPath {
    param (
        [string]$ExplicitZipPath
    )

    if (-not [string]::IsNullOrWhiteSpace($ExplicitZipPath)) {
        $resolved = Resolve-Path $ExplicitZipPath -ErrorAction SilentlyContinue
        if (-not $resolved) {
            throw "Local archive not found: $ExplicitZipPath"
        }
        return $resolved.Path
    }

    Write-Step "Resolving latest local runner archive..."
    $scriptDir = $PSScriptRoot
    $artifactsDir = Join-Path $scriptDir "..\artifacts"

    if (-not (Test-Path $artifactsDir)) {
        throw "No local archive provided and artifacts directory not found: $artifactsDir. Run publish-and-upload-windows.ps1 first, or pass -RunnerZipPath."
    }

    $latestZip = Get-ChildItem -Path $artifactsDir -Filter "AvintraRunnerService_*_win-x64.zip" -File |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $latestZip) {
        throw "No AvintraRunnerService_*_win-x64.zip archive found in $artifactsDir. Run publish-and-upload-windows.ps1 first, or pass -RunnerZipPath."
    }

    Write-Host "Using local archive: $($latestZip.FullName)" -ForegroundColor Green
    Write-Host "Archive size: $($latestZip.Length) bytes" -ForegroundColor Gray
    return $latestZip.FullName
}

function Test-IsAdministrator {
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [System.Security.Principal.WindowsPrincipal]::new($identity)
    return $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Stop-RunnerServiceIfPresent {
    param ([string]$Name)

    $service = Get-Service -Name $Name -ErrorAction SilentlyContinue
    if (-not $service) {
        return
    }

    if ($service.Status -ne [System.ServiceProcess.ServiceControllerStatus]::Stopped) {
        Write-Host "Stopping existing service '$Name' before replacing files..." -ForegroundColor Yellow
        Stop-Service -Name $Name -Force -ErrorAction Stop
        # Give the service a moment to fully release the executable before we delete it.
        Start-Sleep -Seconds 2
    }
}

function Remove-RunnerServiceRegistrationIfPresent {
    param ([string]$Name)

    $service = Get-Service -Name $Name -ErrorAction SilentlyContinue
    if (-not $service) {
        return
    }

    Write-Host "Deleting existing service registration '$Name' before re-installing..." -ForegroundColor Yellow

    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = "sc.exe"
    $psi.Arguments = "delete `"$Name`""
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true

    $process = [System.Diagnostics.Process]::Start($psi)
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    if ($stdout) { Write-Host $stdout }
    if ($stderr) { Write-Warning $stderr }

    # Wait until the service entry is actually gone from the SCM database.
    $maxWaitSeconds = 15
    $elapsed = 0
    while ($elapsed -lt $maxWaitSeconds) {
        $stillThere = Get-Service -Name $Name -ErrorAction SilentlyContinue
        if (-not $stillThere) {
            Write-Host "Service registration removed." -ForegroundColor Green
            return
        }
        Start-Sleep -Seconds 1
        $elapsed++
    }

    Write-Warning "Service '$Name' is still reported by the service manager; it may be marked for deletion. Continuing anyway..."
}

function Install-RunnerArchive {
    param (
        [string]$SourceZipPath,
        [string]$Destination
    )

    Write-Step "Staging runner archive from local disk..."

    $tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    $zipPath = Join-Path $tempDir "AvintraRunnerService.zip"

    try {
        Copy-Item -Path $SourceZipPath -Destination $zipPath -Force

        # Stop the service first so the running executable is not locked when we
        # replace the install directory (otherwise upgrades fail on a locked exe).
        Stop-RunnerServiceIfPresent -Name $ServiceName

        # Remove the existing service registration so the runner's `sc create`
        # step succeeds (stopping alone leaves the SCM entry behind).
        Remove-RunnerServiceRegistrationIfPresent -Name $ServiceName

        # Clean destination to avoid stale files from a previous version.
        if (Test-Path $Destination) {
            Write-Host "Removing existing install directory: $Destination" -ForegroundColor DarkGray
            Remove-Item -Path $Destination -Recurse -Force
        }
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null

        Write-Host "Extracting runner archive..." -ForegroundColor DarkGray
        Expand-Archive -Path $zipPath -DestinationPath $Destination -Force
    }
    finally {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Install-Service {
    param (
        [string]$ExecutablePath,
        [string]$AppBaseUrl,
        [string]$ApiKey,
        [string]$TenantId,
        [string]$LinkedUsername,
        [switch]$Unattended
    )

    Write-Step "Registering Windows service '$ServiceName'..."

    $arguments = @(
        "--install",
        "--appBaseUrl", $AppBaseUrl,
        "--apiKey", $ApiKey,
        "--tenantId", $TenantId,
        "--linkedUsername", $LinkedUsername
    )

    if ($Unattended) {
        $arguments += "--unattended"
    }

    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $ExecutablePath
    # Build the argument string instead of using $psi.ArgumentList, which is only
    # available in PowerShell 7+ (Core). In Windows PowerShell 5.1, .ArgumentList is
    # $null and calling .Add() throws "cannot call a method on a null-valued expression".
    # Quote any argument containing whitespace so values with spaces survive parsing.
    $psi.Arguments = ($arguments | ForEach-Object {
            if ($_ -match '\s') { '"' + ($_ -replace '"', '\"') + '"' } else { $_ }
        }) -join ' '
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true

    $process = [System.Diagnostics.Process]::Start($psi)
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    if ($stdout) { Write-Host $stdout }
    if ($stderr) { Write-Warning $stderr }

    if ($process.ExitCode -ne 0) {
        throw "Service installation failed with exit code $($process.ExitCode)."
    }

    Write-Host "Service installed successfully." -ForegroundColor Green
}

function Start-ServiceIfRequested {
    param ([string]$Name)

    if ($DoNotStart) {
        Write-Host "Skipping service start because -DoNotStart was specified." -ForegroundColor Yellow
        return
    }

    Write-Step "Starting service '$Name'..."
    Start-Service -Name $Name -ErrorAction Stop
    Write-Host "Service started." -ForegroundColor Green
}

# --- Main ----------------------------------------------------------------------

Write-Step "Avintra Runner Service local provisioning started"

if (-not (Test-IsAdministrator)) {
    throw "This script must be run as Administrator. Open PowerShell with 'Run as administrator' and try again."
}

$resolvedRunnerZipPath = Resolve-RunnerZipPath -ExplicitZipPath $RunnerZipPath

Install-RunnerArchive -SourceZipPath $resolvedRunnerZipPath -Destination $InstallDir

$runnerExe = Join-Path $InstallDir "AvintraRunnerService.exe"
if (-not (Test-Path $runnerExe)) {
    throw "Runner executable not found at $runnerExe. The archive may be invalid."
}

Install-Service -ExecutablePath $runnerExe -AppBaseUrl $AppBaseUrl -ApiKey $ApiKey -TenantId $TenantId -LinkedUsername $LinkedUsername -Unattended:$Unattended

Start-ServiceIfRequested -Name $ServiceName

Write-Host "`nProvisioning complete." -ForegroundColor Green
Write-Host "  Install directory : $InstallDir" -ForegroundColor Gray
Write-Host "  Service name      : $ServiceName" -ForegroundColor Gray
Write-Host "  Executable        : $runnerExe" -ForegroundColor Gray
Write-Host "`nUseful commands:" -ForegroundColor Gray
Write-Host "  sc query \"$ServiceName\"" -ForegroundColor Gray
Write-Host "  sc start \"$ServiceName\"" -ForegroundColor Gray
Write-Host "  sc stop \"$ServiceName\"" -ForegroundColor Gray
