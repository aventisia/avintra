#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Provisions AvintraRunnerService as a Windows service.

.DESCRIPTION
    Downloads the Avintra Runner archive, extracts it to a fixed directory,
    registers it as a Windows service, and starts the service.

    The runner is published as a self-contained single-file binary, so the .NET 8
    runtime is bundled and does NOT need to be installed separately.

    The service/artifact name "AvintraRunnerService" distinguishes the headless
    runner service process from the Tauri desktop app, which extracts this same
    archive and renames the inner executable to AvintraRunnerApp.exe before
    launching it.

    Run this from an elevated PowerShell prompt. The script aborts if it is not
    running as Administrator.

.PARAMETER RunnerZipUrl
    URL of the AvintraRunnerService zip archive to download.
    Example: https://cdn.example.com/AvintraRunnerService_0.1.81_win-x64.zip

    Optional. When omitted, the script resolves the latest available version at
    runtime from the backend and downloads that archive.

    Can also be supplied via the environment variable AVINTRA_RUNNER_ZIP_URL.

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

.EXAMPLE
    Set $env variables then pipe the script from the web directly into PowerShell.
    The latest runner version is resolved automatically from the backend:

        $env:AVINTRA_APP_BASE_URL = "https://api.avintra.com"
        $env:AVINTRA_API_KEY = "my-api-key"
        $env:AVINTRA_TENANT_ID = "00000000-0000-0000-0000-000000000000"
        $env:AVINTRA_LINKED_USERNAME = "jdoe"
        irm https://example.com/files/scripts/Install-AvintraRunnerService.ps1 | iex

.EXAMPLE
    Run the downloaded script with explicit parameters:

        .\Install-AvintraRunnerService.ps1 `
            -AppBaseUrl "https://api.avintra.com" `
            -ApiKey "my-api-key" `
            -TenantId "00000000-0000-0000-0000-000000000000" `
            -LinkedUsername "jdoe"
#>
[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$RunnerZipUrl = $env:AVINTRA_RUNNER_ZIP_URL,

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
    [switch]$DoNotStart
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

function Resolve-RunnerZipUrl {
    param (
        [string]$AppBaseUrl,
        [string]$ExplicitZipUrl = $RunnerZipUrl
    )

    if (-not [string]::IsNullOrWhiteSpace($ExplicitZipUrl)) {
        return $ExplicitZipUrl
    }

    Write-Step "Resolving latest runner version from backend..."
    $base = $AppBaseUrl.TrimEnd('/')
    $latestUrl = "$base/files/binaries/runner/latest"
    $response = Invoke-RestMethod -Uri $latestUrl -UseBasicParsing

    # The backend wraps payloads in a ServiceResponse object; unwrap the inner DTO.
    $latest = $response.data
    if (-not $latest) {
        $latest = $response
    }

    if ([string]::IsNullOrWhiteSpace($latest.url)) {
        throw "Backend returned no runner download URL. Check that the runner archive is published."
    }

    Write-Host "Latest runner version: $($latest.version)" -ForegroundColor Green
    return $latest.url
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

function Install-RunnerArchive {
    param (
        [string]$Url,
        [string]$Destination
    )

    Write-Step "Downloading runner archive..."

    $tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    $zipPath = Join-Path $tempDir "AvintraRunnerService.zip"

    try {
        Invoke-WebRequest -Uri $Url -OutFile $zipPath -UseBasicParsing

        # Stop the service first so the running executable is not locked when we
        # replace the install directory (otherwise upgrades fail on a locked exe).
        Stop-RunnerServiceIfPresent -Name $ServiceName

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
        [string]$LinkedUsername
    )

    Write-Step "Registering Windows service '$ServiceName'..."

    $arguments = @(
        "--install",
        "--appBaseUrl", $AppBaseUrl,
        "--apiKey", $ApiKey,
        "--tenantId", $TenantId,
        "--linkedUsername", $LinkedUsername
    )

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

Write-Step "Avintra Runner Service provisioning started"

if (-not (Test-IsAdministrator)) {
    throw "This script must be run as Administrator. Open PowerShell with 'Run as administrator' and try again."
}

$resolvedRunnerZipUrl = Resolve-RunnerZipUrl -AppBaseUrl $AppBaseUrl -ExplicitZipUrl $RunnerZipUrl

Install-RunnerArchive -Url $resolvedRunnerZipUrl -Destination $InstallDir

$runnerExe = Join-Path $InstallDir "AvintraRunnerService.exe"
if (-not (Test-Path $runnerExe)) {
    throw "Runner executable not found at $runnerExe. The archive may be invalid."
}

Install-Service -ExecutablePath $runnerExe -AppBaseUrl $AppBaseUrl -ApiKey $ApiKey -TenantId $TenantId -LinkedUsername $LinkedUsername

Start-ServiceIfRequested -Name $ServiceName

Write-Host "`nProvisioning complete." -ForegroundColor Green
Write-Host "  Install directory : $InstallDir" -ForegroundColor Gray
Write-Host "  Service name      : $ServiceName" -ForegroundColor Gray
Write-Host "  Executable        : $runnerExe" -ForegroundColor Gray
Write-Host "`nUseful commands:" -ForegroundColor Gray
Write-Host "  sc query \"$ServiceName\"" -ForegroundColor Gray
Write-Host "  sc start \"$ServiceName\"" -ForegroundColor Gray
Write-Host "  sc stop \"$ServiceName\"" -ForegroundColor Gray
