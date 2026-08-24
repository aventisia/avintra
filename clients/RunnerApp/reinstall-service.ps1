#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Reinstalls the AvintraRunnerService from the published build output.

.DESCRIPTION
    Stops any existing AvintraRunnerService, uninstalls it, installs the freshly
    published binary, and starts the service. After start it prints the path to the
    runner debug log (C:\ProgramData\Avintra\Runner\logs\runner-debug.log).

.PARAMETER AppBaseUrl
    Backend API base URL, e.g. https://avdev.aventisia.com

.PARAMETER ApiKey
    Tenant API key used for machine registration.

.PARAMETER TenantId
    Tenant GUID.

.PARAMETER LinkedUsername
    Linked workspace username.

.PARAMETER Unattended
    Launch spawned worker processes in session 0 without UI. Defaults to interactive
    session workers that can display MessageBox / Office dialogs.

.EXAMPLE
    .\reinstall-service.ps1 `
        -AppBaseUrl "https://avdev.aventisia.com" `
        -ApiKey "your-api-key" `
        -TenantId "00000000-0000-0000-0000-000000000000" `
        -LinkedUsername "user@example.com"

.EXAMPLE
    .\reinstall-service.ps1 `
        -AppBaseUrl "https://avdev.aventisia.com" `
        -ApiKey "your-api-key" `
        -TenantId "00000000-0000-0000-0000-000000000000" `
        -LinkedUsername "user@example.com" `
        -Unattended
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$AppBaseUrl,

    [Parameter(Mandatory = $true)]
    [string]$ApiKey,

    [Parameter(Mandatory = $true)]
    [string]$TenantId,

    [Parameter(Mandatory = $true)]
    [string]$LinkedUsername,

    [Parameter(Mandatory = $false)]
    [switch]$Unattended
)

$ErrorActionPreference = "Stop"

$serviceName = "AvintraRunnerService"
$publishDir = Join-Path $PSScriptRoot "Published"

# The published assembly is named RunnerApp.exe even though the service name is AvintraRunnerService.
$exe = Join-Path $publishDir "RunnerApp.exe"

if (-not (Test-Path $exe)) {
    throw "Published runner not found at: $exe`nRun 'dotnet publish -c Release --property:PublishDir=./Published' first."
}

function Stop-ServiceGracefully {
    param ([string]$Name)
    try {
        $svc = Get-Service -Name $Name -ErrorAction SilentlyContinue
        if ($svc -and $svc.Status -ne [System.ServiceProcess.ServiceControllerStatus]::Stopped) {
            Write-Host "Stopping $Name..."
            sc.exe stop $Name | Out-Null
            Start-Sleep -Seconds 3
        }
    }
    catch {
        Write-Warning "Could not stop ${Name}: $_"
    }
}

Stop-ServiceGracefully -Name $serviceName

Write-Host "Uninstalling $serviceName..."
& $exe --uninstall
Start-Sleep -Seconds 2

Write-Host "Installing $serviceName from $exe..."
$installArgs = @(
    "--install",
    "--appBaseUrl", $AppBaseUrl,
    "--apiKey", $ApiKey,
    "--tenantId", $TenantId,
    "--linkedUsername", $LinkedUsername
)
if ($Unattended) {
    $installArgs += "--unattended"
}
& $exe @installArgs

Write-Host "Starting $serviceName..."
$result = sc.exe start $serviceName
Write-Host $result

$logFile = "C:\ProgramData\Avintra\Runner\logs\runner-debug.log"
Write-Host ""
Write-Host "Service reinstalled. Log file:"
Write-Host $logFile
Write-Host ""
Write-Host "Tail the log with:"
Write-Host "Get-Content `"$logFile`" -Wait -Tail 50"
