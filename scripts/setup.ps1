# setup.ps1 — Bootstrap this repository on a fresh clone.
#
# A fresh clone is missing every local, gitignored `.env` / `.env.local` file,
# and none of the project dependencies are installed. This script creates the
# env files the services expect and installs the dependencies, so the checkout
# can be built and run without doing it by hand.
#
# System prerequisites (.NET 8 SDK, Node.js + npm, Python 3.12) are NOT installed
# by this script; install them separately first. The script reports what it finds.
#
# Usage:
#   .\scripts\setup.ps1                  # create env files + install dependencies
#   .\scripts\setup.ps1 -SkipInstall     # create env files only
#   .\scripts\setup.ps1 -Force           # overwrite existing env files
#   .\scripts\setup.ps1 -Help
#
# Existing env files are never overwritten unless -Force is given, so the script
# is safe to re-run. It only writes the env files below and installs
# dependencies; it never commits, pushes, or deletes anything.

param(
    [switch]$SkipInstall,
    [switch]$Force,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

$TotalSteps = 3
$Step = 0

$UseColor = -not [Console]::IsOutputRedirected -and [bool]$Host.UI.SupportsVirtualTerminal -and -not $env:NO_COLOR
if ($UseColor) {
    $Esc = [char]27
    $CStep = "$Esc[1;32m"
    $CReset = "$Esc[0m"
} else {
    $CStep = ''
    $CReset = ''
}

function Show-Usage {
    Write-Output @'
setup.ps1 — Bootstrap this repository on a fresh clone.

Creates the local, gitignored environment files the services expect and installs
the project dependencies. System prerequisites (.NET 8 SDK, Node.js + npm,
Python 3.12) must be installed separately first.

Usage:
  .\scripts\setup.ps1                  create env files and install dependencies
  .\scripts\setup.ps1 -SkipInstall     create env files only
  .\scripts\setup.ps1 -Force           overwrite existing env files
  .\scripts\setup.ps1 -Help            show this help

Existing env files are never overwritten unless -Force is given, so the script
is safe to re-run. It only writes env files and installs dependencies; it never
commits, pushes, or deletes anything.
'@
}

function Die([string]$Message) {
    [Console]::Error.WriteLine("error: $Message")
    exit 1
}

function Step([string]$Text) {
    $script:Step++
    Write-Output ''
    Write-Output ("$CStep[$script:Step/$TotalSteps] $Text$CReset")
}

function Detail([string]$Text) {
    Write-Output "      $Text"
}

function OkMark([string]$Text) {
    Write-Output "      [ok] $Text"
}

function KeepMark([string]$Text) {
    Write-Output "      [==] $Text (exists, kept)"
}

function OmitMark([string]$Text, [string]$Reason) {
    Write-Output "      [--] $Text ($Reason)"
}

function BadMark([string]$Text) {
    Write-Output "      [!!] $Text"
}

if ($Help.IsPresent) {
    Show-Usage
    exit 0
}

# ---------------------------------------------------------------------------
# Repository root
# ---------------------------------------------------------------------------
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $Root 'Avplatform.sln'))) {
    Die "Avplatform.sln not found in $Root (run this script from the repository)"
}

Write-Output 'setup — bootstrapping the repository at:'
Write-Output "  $Root"

# ---------------------------------------------------------------------------
# Step 1 — check prerequisites
# ---------------------------------------------------------------------------
function Report-Tool {
    param([string]$Label, [string]$Command, [string[]]$VersionArgs)
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        $prev = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        $version = $null
        try {
            $version = & $Command @VersionArgs 2>$null | Select-Object -First 1
        } finally {
            $ErrorActionPreference = $prev
        }
        $shown = if ($version) { $version } else { 'installed' }
        Write-Output ('      [ok] ' + $Label.PadRight(11) + " $shown")
    } else {
        Write-Output ('      [--] ' + $Label.PadRight(11) + ' not found')
    }
}

function Resolve-Python312 {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        if (Get-Command py -ErrorAction SilentlyContinue) {
            & py -3.12 -c 'import sys' 2>$null
            if ($LASTEXITCODE -eq 0) { return ,@('py', '-3.12') }
        }
        foreach ($cand in @('python3.12', 'python3', 'python')) {
            if (Get-Command $cand -ErrorAction SilentlyContinue) {
                & $cand -c 'import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 12) else 1)' 2>$null
                if ($LASTEXITCODE -eq 0) { return ,@($cand) }
            }
        }
    } finally {
        $ErrorActionPreference = $prev
    }
    return $null
}

Step 'Checking prerequisites'
Report-Tool 'git' 'git' @('--version')
Report-Tool 'node' 'node' @('--version')
Report-Tool 'npm' 'npm' @('--version')
Report-Tool 'dotnet' 'dotnet' @('--version')
$py = Resolve-Python312
if ($null -eq $py) {
    Write-Output ('      [--] ' + 'python'.PadRight(11) + ' Python 3.12 not found')
} else {
    $pyExe = $py[0]
    $pyArgs = @('--version')
    if ($py.Count -gt 1) { $pyArgs = $py[1..($py.Count - 1)] + @('--version') }
    Report-Tool 'python' $pyExe $pyArgs
}

# ---------------------------------------------------------------------------
# Step 2 — create gitignored env files
# ---------------------------------------------------------------------------
function Write-EnvFile {
    param([string]$RelativePath, [string]$Content)
    $dst = Join-Path $Root $RelativePath
    if ((Test-Path -LiteralPath $dst) -and -not $Force.IsPresent) {
        KeepMark $RelativePath
        return
    }
    $dir = Split-Path -Parent $dst
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($dst, $Content)
    OkMark $RelativePath
}

Step 'Creating gitignored env files'

$accountsEnv = @'
# Local development overrides for AccountsAPIs (gitignored).
# Loaded only when ASPNETCORE_ENVIRONMENT=Localhost.
# Run with this directory as the working directory so the file is found.

ASPNETCORE_URLS=http://localhost:4000

ACCOUNTS_API_BASE_URL=https://local-avintra.aventisia.com/accounts/
WORKSPACE_API_BASE_URL=https://local-avintra.aventisia.com/worc/
LLMPIPELINE_API_BASE_URL=https://local-avintra.aventisia.com/llmpipeline/
CAMEL_API_BASE_URL=http://localhost:4005
CORSAIR_API_BASE_URL=http://localhost:4006
'@ + "`n"
Write-EnvFile 'apis/WorcBackend-legacy/AccountsAPIs/.env.local' $accountsEnv

$workspaceEnv = @'
# Local development overrides for WorkspaceAPIs (gitignored).
# Loaded only when ASPNETCORE_ENVIRONMENT=Localhost.
# Run with this directory as the working directory so the file is found.

ASPNETCORE_URLS=http://localhost:4001

ACCOUNTS_API_BASE_URL=https://localhost:4000
WORKSPACE_API_BASE_URL=https://localhost:4001
LLMPIPELINE_API_BASE_URL=http://localhost:4003
CAMEL_API_BASE_URL=http://localhost:4005
CORSAIR_API_BASE_URL=http://localhost:4006
'@ + "`n"
Write-EnvFile 'apis/WorcBackend-legacy/WorkspaceAPIs/.env.local' $workspaceEnv

$corsairEnv = @'
# Local development overrides for the Corsair sidecar (gitignored).
# Mirrors apis/corsair/.env.example; fill in the values marked "env_var".

PORT=4006
CORSAIR_API_BASE_URL=http://localhost:4006
APP_BASE_URL=local-avintra.aventisia.com

# Value encryption key for stored credentials — replace with a real local key.
CORSAIR_KEK=env_var

POSTGRESQL_HOST=localhost
POSTGRESQL_PORT=5432
POSTGRESQL_USERNAME=env_var
POSTGRESQL_PASSWORD=env_var

ACCOUNTS_API_BASE_URL=https://localhost:4000
WORKSPACE_API_BASE_URL=https://localhost:4001
LLMPIPELINE_API_BASE_URL=http://localhost:4003
CAMEL_API_BASE_URL=http://localhost:4005
'@ + "`n"
Write-EnvFile 'apis/corsair/.env.local' $corsairEnv

$llmEnv = @'
# Local development overrides for the LLM Pipeline (gitignored).
# Secrets (OPENAI_API_KEY, POSTGRESQL_*, ...) live in the committed .env as
# "env_var" placeholders; set them here or in the OS environment to run locally.

SSL_VERIFY=false
UVICORN_PORT=4003

ACCOUNTS_API_BASE_URL=https://localhost:4000
WORKSPACE_API_BASE_URL=https://localhost:4001
LLMPIPELINE_API_BASE_URL=http://localhost:4003
CAMEL_API_BASE_URL=http://localhost:4005
CORSAIR_API_BASE_URL=http://localhost:4006
'@ + "`n"
Write-EnvFile 'apis/llmpipeline/.env.local' $llmEnv

$webApps = @(
    @{ App = 'accounts'; Port = 3001 },
    @{ App = 'workspace'; Port = 3002 },
    @{ App = 'studio'; Port = 3006 },
    @{ App = 'atlas'; Port = 3007 },
    @{ App = 'desktop-app'; Port = 2999 }
)
foreach ($entry in $webApps) {
    $content = "# Local development port override (gitignored).`nVITE_PORT=$($entry.Port)`n"
    Write-EnvFile "clients/web-apps/apps/$($entry.App)/.env" $content
}

$brunoEnv = @'
# Local secrets — gitignored. Replace with your own account before running.
MY_EMAIL=you@example.com
MY_PWD=your-password
ACCOUNTS_API_PORT=4000
WORKSPACE_API_PORT=4001
LLMPIPELINE_API_PORT=4003
CAMEL_API_PORT=4005
CORSAIR_API_PORT=4006
'@ + "`n"
Write-EnvFile 'tests/bruno/.env' $brunoEnv

# ---------------------------------------------------------------------------
# Step 3 — install dependencies
# ---------------------------------------------------------------------------
function Invoke-Install {
    param([string]$Label, [string]$WorkDir, [string]$Exe, [string[]]$Arguments)
    Write-Output "      [..] $Label"
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $code = 1
    $output = @()
    try {
        Push-Location -LiteralPath $WorkDir
        try {
            $output = & $Exe @Arguments 2>&1
            $code = $LASTEXITCODE
        } finally {
            Pop-Location
        }
    } catch {
        $output = @($_)
        $code = 1
    } finally {
        $ErrorActionPreference = $prev
    }
    if ($code -eq 0) {
        OkMark $Label
        $script:LastInstallOk = $true
    } else {
        BadMark $Label
        $output | ForEach-Object { Detail $_ }
        $script:LastInstallOk = $false
        $script:InstallFailed = $true
    }
}

function Install-Npm {
    param([string]$Label, [string]$WorkDir, [string]$MissingReason)
    if (-not (Test-Path -LiteralPath (Join-Path $WorkDir 'package.json'))) {
        OmitMark $Label $MissingReason
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        Invoke-Install $Label $WorkDir 'npm' @('install', '--force')
    } else {
        OmitMark $Label 'npm not found'
    }
}

Step 'Installing dependencies'
$script:InstallFailed = $false
$script:LastInstallOk = $false
if ($SkipInstall.IsPresent) {
    Detail 'skipped (-SkipInstall)'
} else {
    Install-Npm 'web apps (npm install)' (Join-Path $Root 'clients/web-apps') 'clients/web-apps not found'
    Install-Npm 'corsair (npm install)' (Join-Path $Root 'apis/corsair') 'apis/corsair not found'
    Install-Npm 'docs (npm install)' (Join-Path $Root 'clients/docs') 'clients/docs not found'
    Install-Npm 'bruno tests (npm install)' (Join-Path $Root 'tests/bruno') 'tests/bruno not found'

    if (-not (Test-Path -LiteralPath (Join-Path $Root 'Avplatform.sln'))) {
        OmitMark 'dotnet restore (Avplatform.sln)' 'Avplatform.sln not found'
    } elseif (Get-Command dotnet -ErrorAction SilentlyContinue) {
        Invoke-Install 'dotnet restore (Avplatform.sln)' $Root 'dotnet' @('restore', 'Avplatform.sln')
    } else {
        OmitMark 'dotnet restore (Avplatform.sln)' 'dotnet not found'
    }

    $llmDir = Join-Path $Root 'apis/llmpipeline'
    if (-not (Test-Path -LiteralPath (Join-Path $llmDir 'requirements.txt'))) {
        OmitMark 'llmpipeline (venv + pip)' 'apis/llmpipeline not found'
    } else {
        $py = Resolve-Python312
        if ($null -eq $py) {
            OmitMark 'llmpipeline (venv + pip)' 'Python 3.12 not found'
        } else {
            $venvArgs = @()
            if ($py.Count -gt 1) { $venvArgs = $py[1..($py.Count - 1)] }
            $venvArgs += @('-m', 'venv', 'venv')
            Invoke-Install 'llmpipeline venv' $llmDir $py[0] $venvArgs
            if ($script:LastInstallOk) {
                $venvRoot = Join-Path $llmDir 'venv'
                $venvPip = Join-Path (Join-Path $venvRoot 'bin') 'pip'
                if (-not (Test-Path -LiteralPath $venvPip)) {
                    $venvPip = Join-Path (Join-Path $venvRoot 'Scripts') 'pip.exe'
                }
                Invoke-Install 'llmpipeline pip install' $llmDir $venvPip @('-r', 'requirements.txt', '-r', 'requirements-dev.txt')
            }
        }
    }
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
Write-Output ''
Write-Output 'Done. Repository is bootstrapped.'
Write-Output 'Next steps:'
Write-Output '  - Fill in real secrets in the generated env files (PostgreSQL, API keys,'
Write-Output '    JWT/AES keys, Bruno login) before running the services.'
Write-Output '  - Web apps:   npm --prefix clients/web-apps run dev'
Write-Output '  - Backend:    cd apis/WorcBackend-legacy/AccountsAPIs; dotnet run'
Write-Output '  - LLM:        cd apis/llmpipeline; $env:ENV="local"; .\venv\Scripts\python dev.py'

if ($script:InstallFailed) {
    [Console]::Error.WriteLine('')
    [Console]::Error.WriteLine('Warning: one or more dependency installs failed; see the output above.')
    exit 1
}
