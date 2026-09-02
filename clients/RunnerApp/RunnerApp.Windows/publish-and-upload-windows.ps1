<#
.SYNOPSIS
    Publishes the RunnerApp Windows binary and uploads it to the selected server(s).

.DESCRIPTION
    Builds RunnerApp.Windows.csproj as a self-contained win-x64 executable,
    renames RunnerApp.exe to AvintraRunnerService.exe, packages it into
    artifacts/AvintraRunnerService_<version>_win-x64.zip, and uploads the zip
    plus Install-AvintraRunnerService.ps1 to the chosen server combination.

    This script is intended to run on a Windows developer machine because no
    Windows Jenkins agent is available.

.PARAMETER Version
    Version string used in the artifact name. Defaults to the <Version> value
    from RunnerApp.Windows.csproj.

.PARAMETER TargetServers
    Server combination to upload to: uat | prod (the aliases
    1=uat, 2=prod are also accepted in the prompt).
    If omitted, the script prompts interactively.

.PARAMETER WhatIf
    Print the publish and upload plan without executing uploads.

.PARAMETER SkipUpload
    Publish only; do not upload.

.PARAMETER Runtime
    .NET runtime identifier. Defaults to win-x64.

.EXAMPLE
    .\publish-and-upload-windows.ps1

.EXAMPLE
    .\publish-and-upload-windows.ps1 -Version 0.2.18 -TargetServers dev -WhatIf
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
    [string] $Runtime = "win-x64"
)

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$Csproj = Join-Path $ScriptDir "RunnerApp.Windows.csproj"

if (-not (Test-Path $Csproj)) {
    throw "RunnerApp Windows project not found at $Csproj"
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

# --- Resolve target servers ----------------------------------------------------
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

# --- Publish ------------------------------------------------------------------
$OutputDir = Join-Path $ScriptDir "..\artifacts"
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$PublishDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $PublishDir | Out-Null

try {
    Write-Host "Publishing RunnerApp ($Runtime, self-contained) v$Version ..."

    $publishArgs = @(
        "publish", $Csproj,
        "-c", "Release",
        "-r", $Runtime,
        "--self-contained", "true",
        "-o", $PublishDir
    )

    if ($WhatIf) {
        Write-Host "[what-if] dotnet $($publishArgs -join ' ')"
    }
    else {
        $publishProcess = Start-Process -FilePath "dotnet" -ArgumentList $publishArgs -NoNewWindow -Wait -PassThru
        if ($publishProcess.ExitCode -ne 0) {
            throw "dotnet publish failed with exit code $($publishProcess.ExitCode)"
        }
    }

    $publishedExe = Join-Path $PublishDir "RunnerApp.exe"
    $renamedExe = Join-Path $PublishDir "AvintraRunnerService.exe"
    $zipName = "AvintraRunnerService_${Version}_${Runtime}.zip"
    $zipPath = Join-Path $OutputDir $zipName

    if ($WhatIf) {
        Write-Host "[what-if] mv $publishedExe $renamedExe"
        Write-Host "[what-if] zip $zipPath from $PublishDir"
    }
    else {
        if (-not (Test-Path $publishedExe)) {
            throw "Expected published executable not found: $publishedExe"
        }

        Move-Item -Path $publishedExe -Destination $renamedExe -Force

        $resolvedOutputDir = Resolve-Path $OutputDir
        $archiveItems = Get-ChildItem -Path $PublishDir -Force
        Compress-Archive -Path $archiveItems -DestinationPath $zipPath -Force
    }

    Write-Host "Published to $zipPath"
    if (-not $WhatIf) {
        Get-Item $zipPath | Select-Object -ExpandProperty Length | ForEach-Object { "  {0:N0} bytes" -f $_ }
    }

    # Copy the install provisioning script into the artifacts output.
    $installScript = Join-Path $ScriptDir "Install-AvintraRunnerService.ps1"
    $installArtifact = Join-Path $OutputDir "Install-AvintraRunnerService.ps1"
    if (Test-Path $installScript) {
        if ($WhatIf) {
            Write-Host "[what-if] cp $installScript $installArtifact"
        }
        else {
            Copy-Item -Path $installScript -Destination $installArtifact -Force
            Write-Host "Copied install script to $installArtifact"
        }
    }
    else {
        Write-Warning "Install-AvintraRunnerService.ps1 not found at $installScript"
    }

    # --- Upload --------------------------------------------------------------------
    if ($SkipUpload) {
        Write-Host "Upload skipped (-SkipUpload)."
        return
    }

    $remoteBinDir = '/var/www/aventisia.com/files/binaries'
    $remoteScriptsDir = '/var/www/aventisia.com/files/scripts'

    Write-Host "Uploading to: $($ServerList -join ', ')"
    foreach ($server in $ServerList) {
        if ($WhatIf) {
            Write-Host "[what-if] ssh admin@${server} 'mkdir -p $remoteBinDir $remoteScriptsDir'"
            Write-Host "[what-if] scp $zipPath admin@${server}:${remoteBinDir}/"
            Write-Host "[what-if] scp $installArtifact admin@${server}:${remoteScriptsDir}/"
        }
        else {
            Write-Host "Uploading to $server ..."
            ssh "admin@${server}" "mkdir -p $remoteBinDir $remoteScriptsDir"
            scp "$zipPath" "admin@${server}:${remoteBinDir}/"
            if (Test-Path $installArtifact) {
                scp "$installArtifact" "admin@${server}:${remoteScriptsDir}/"
            }
            Write-Host "Successfully uploaded RunnerApp Windows to $server"
        }
    }
}
finally {
    if (Test-Path $PublishDir) {
        Remove-Item -Path $PublishDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
