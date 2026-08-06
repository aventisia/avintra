#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Provisions AvintraDesktopRunner as a Windows service.

.DESCRIPTION
    This script validates (and installs if needed) the .NET 8 runtime and winget,
    downloads the Avintra Desktop Runner archive, extracts it to a fixed directory,
    registers it as a Windows service, and starts the service.

    Run this from an elevated PowerShell prompt. The script aborts if it is not
    running as Administrator.

.PARAMETER RunnerZipUrl
    URL of the AvintraDesktopRunner zip archive to download.
    Example: https://cdn.example.com/AvintraDesktopRunner_0.1.81_win-x64.zip

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
    Directory where the runner will be extracted. Default: C:\Program Files\AvintraDesktopRunner

.PARAMETER ServiceName
    Name of the Windows service. Default: AvintraDesktopRunner

.PARAMETER SkipRuntimeCheck
    Skip the .NET 8 runtime prerequisite check (useful for automated recovery).

.PARAMETER DoNotStart
    Install the service but do not start it immediately.

.EXAMPLE
    Set $env variables then pipe the script from the web directly into PowerShell.
    The latest runner version is resolved automatically from the backend:

        $env:AVINTRA_APP_BASE_URL = "https://api.avintra.com"
        $env:AVINTRA_API_KEY = "my-api-key"
        $env:AVINTRA_TENANT_ID = "00000000-0000-0000-0000-000000000000"
        $env:AVINTRA_LINKED_USERNAME = "jdoe"
        irm https://example.com/Install-AvintraDesktopRunner.ps1 | iex

.EXAMPLE
    Run the downloaded script with explicit parameters:

        .\Install-AvintraDesktopRunner.ps1 `
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
    [string]$InstallDir = "C:\Program Files\AvintraDesktopRunner",

    [Parameter(Mandatory = $false)]
    [string]$ServiceName = "AvintraDesktopRunner",

    [Parameter(Mandatory = $false)]
    [switch]$SkipRuntimeCheck,

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

function Test-IsAdministrator {
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [System.Security.Principal.WindowsPrincipal]::new($identity)
    return $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-IsDotNet8RuntimeInstalled {
    $dotnet = Get-Command "dotnet" -ErrorAction SilentlyContinue
    if (-not $dotnet) {
        return $false
    }

    try {
        $runtimes = & dotnet --list-runtimes 2>$null
        foreach ($line in $runtimes) {
            if ($line -like "Microsoft.NETCore.App 8.*" -or
                $line -like "Microsoft.WindowsDesktop.App 8.*") {
                return $true
            }
        }
    }
    catch {
        return $false
    }

    return $false
}

function Test-WingetInstalled {
    return [bool](Get-Command "winget" -ErrorAction SilentlyContinue)
}

function Install-Winget {
    # winget is shipped as part of App Installer (Microsoft.DesktopAppInstaller) from
    # the Microsoft Store. On client Windows this is usually present. On server SKUs
    # or locked-down environments the Store may be unavailable, so we also try the
    # direct msixbundle from GitHub as a fallback.

    Write-Host "Attempting to install winget (Microsoft.DesktopAppInstaller)..." -ForegroundColor Yellow

    $tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

    try {
        # Prefer installing from the Microsoft Store via Add-AppxPackage if possible.
        $appInstaller = Get-AppxPackage -Name "Microsoft.DesktopAppInstaller" -ErrorAction SilentlyContinue
        if ($appInstaller) {
            Write-Host "App Installer package is already registered; winget should be available." -ForegroundColor Yellow
            return
        }

        # Download the latest release of winget from the GitHub repository.
        $releasesUrl = "https://api.github.com/repos/microsoft/winget-cli/releases/latest"
        $release = Invoke-RestMethod -Uri $releasesUrl -UseBasicParsing
        $msixBundleAsset = $release.assets | Where-Object { $_.name -like "*.msixbundle" } | Select-Object -First 1

        if (-not $msixBundleAsset) {
            throw "Could not find a winget msixbundle asset in the latest GitHub release."
        }

        $licenseAsset = $release.assets | Where-Object { $_.name -like "*License*.xml" } | Select-Object -First 1
        $bundlePath = Join-Path $tempDir $msixBundleAsset.name

        Write-Host "Downloading winget installer..." -ForegroundColor DarkGray
        Invoke-WebRequest -Uri $msixBundleAsset.browser_download_url -OutFile $bundlePath -UseBasicParsing

        if ($licenseAsset) {
            $licensePath = Join-Path $tempDir $licenseAsset.name
            Invoke-WebRequest -Uri $licenseAsset.browser_download_url -OutFile $licensePath -UseBasicParsing
            Add-AppxProvisionedPackage -Online -PackagePath $bundlePath -LicensePath $licensePath -ErrorAction Stop | Out-Null
        }
        else {
            Add-AppxProvisionedPackage -Online -PackagePath $bundlePath -SkipLicense -ErrorAction Stop | Out-Null
        }

        # Refresh PATH so that the current process can find winget.
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("Path", "User")

        if (-not (Test-WingetInstalled)) {
            throw "winget was installed but is still not available on PATH."
        }
    }
    catch {
        Write-Warning "Failed to install winget automatically: $_"
        throw
    }
    finally {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Install-DotNet8Runtime {
    Write-Step ".NET 8 runtime is missing. Installing via winget..."

    if (-not (Test-WingetInstalled)) {
        Write-Host "winget is not installed. Attempting to install winget automatically..." -ForegroundColor Yellow
        try {
            Install-Winget
        }
        catch {
            Write-Host "" -ForegroundColor Red
            Write-Host "Failed to install winget automatically." -ForegroundColor Red
            Write-Host "The Avintra Desktop Runner requires the .NET 8 runtime." -ForegroundColor Red
            Write-Host "Please install .NET 8 manually from: https://dotnet.microsoft.com/en-us/download/dotnet/8.0" -ForegroundColor Red
            Write-Host "After .NET 8 is installed, re-run this script." -ForegroundColor Red
            throw "Cannot continue without .NET 8 runtime."
        }
    }

    # --accept-source-agreements and --accept-package-agreements allow unattended install.
    winget install Microsoft.DotNet.Runtime.8 --source winget --accept-source-agreements --accept-package-agreements --disable-interactivity

    if ($LASTEXITCODE -ne 0) {
        throw "winget install of Microsoft.DotNet.Runtime.8 failed with exit code $LASTEXITCODE."
    }

    # Refresh PATH in case dotnet was added.
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User")

    if (-not (Test-IsDotNet8RuntimeInstalled)) {
        throw ".NET 8 runtime installation reported success but runtime is still not detected."
    }

    Write-Host ".NET 8 runtime installed successfully." -ForegroundColor Green
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
    $zipPath = Join-Path $tempDir "AvintraDesktopRunner.zip"

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
    foreach ($arg in $arguments) {
        $psi.ArgumentList.Add($arg)
    }
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

Write-Step "Avintra Desktop Runner provisioning started"

if (-not (Test-IsAdministrator)) {
    throw "This script must be run as Administrator. Open PowerShell with 'Run as administrator' and try again."
}

if ($SkipRuntimeCheck) {
    Write-Warning "Skipping .NET 8 runtime check because -SkipRuntimeCheck was specified."
}
elseif (Test-IsDotNet8RuntimeInstalled) {
    Write-Host ".NET 8 runtime is already installed." -ForegroundColor Green
}
else {
    Install-DotNet8Runtime
}

$resolvedRunnerZipUrl = Resolve-RunnerZipUrl -AppBaseUrl $AppBaseUrl

Install-RunnerArchive -Url $resolvedRunnerZipUrl -Destination $InstallDir

$runnerExe = Join-Path $InstallDir "AvintraDesktopRunner.exe"
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
