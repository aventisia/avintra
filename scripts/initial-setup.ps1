# initial-setup.ps1 — Bootstrap this repository on a fresh clone.
#
# A fresh clone is missing every local, gitignored `.env` / `.env.local` file,
# and none of the project dependencies are installed. This script copies each
# committed `.env.example` template to the local env file its service expects
# and installs the dependencies plus dekit (npm install -g @dekit/cli, which runs
# the local stack from dekit.yaml), so the checkout can be built and run without
# doing it by hand. It also installs the pinned gitleaks binary and enables the
# committed pre-commit hook (core.hooksPath=scripts/hooks) that scans staged
# changes for secrets.
#
# System prerequisites (.NET 8 SDK, Node.js 22+ and npm, Python 3.12, Rust stable
# toolchain for the desktop-app Tauri shell) are NOT installed
# by this script; install them separately first. The script reports what it finds.
#
# Usage:
#   .\scripts\initial-setup.ps1                  # create env files + install dependencies
#   .\scripts\initial-setup.ps1 -SkipInstall     # create env files only
#   .\scripts\initial-setup.ps1 -Force           # overwrite existing env files
#   .\scripts\initial-setup.ps1 -Help
#
# Existing env files are never overwritten unless -Force is given, so the script
# is safe to re-run. It only writes the env files in $EnvFiles, installs
# dependencies, and sets core.hooksPath; it never commits, pushes, or deletes
# anything.

param(
    [switch]$SkipInstall,
    [switch]$Force,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

$TotalSteps = 4
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
initial-setup.ps1 — Bootstrap this repository on a fresh clone.

Copies each committed .env.example template to the local, gitignored env file
its service expects and installs the project dependencies plus dekit
(npm install -g @dekit/cli), installs gitleaks, and enables the secret-scanning
pre-commit hook. System prerequisites (.NET 8 SDK, Node.js 22+ and npm,
Python 3.12, Rust stable toolchain) must be installed separately first.

Usage:
  .\scripts\initial-setup.ps1                  create env files and install dependencies
  .\scripts\initial-setup.ps1 -SkipInstall     create env files only
  .\scripts\initial-setup.ps1 -Force           overwrite existing env files
  .\scripts\initial-setup.ps1 -Help            show this help

Existing env files are never overwritten unless -Force is given, so the script
is safe to re-run. It only writes env files, installs dependencies, and sets
core.hooksPath; it never commits, pushes, or deletes anything.
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

Write-Output 'initial-setup — bootstrapping the repository at:'
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
Report-Tool 'rustc' 'rustc' @('--version')
Report-Tool 'cargo' 'cargo' @('--version')
if ($env:OS -eq 'Windows_NT') {
    $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
    $msvc = if (Test-Path -LiteralPath $vswhere) {
        & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property displayName
    }
    if ($msvc) {
        Write-Output ('      [ok] ' + 'msvc'.PadRight(11) + " $msvc")
    } else {
        Write-Output ('      [--] ' + 'msvc'.PadRight(11) + ' C++ build tools not found (Tauri: https://v2.tauri.app/start/prerequisites/)')
    }
}
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
# Step 2 — create gitignored env files from the committed .env.example templates
# ---------------------------------------------------------------------------
$EnvFiles = @(
    'apis/WorcBackend-legacy/AccountsAPIs/.env.local',
    'apis/WorcBackend-legacy/WorkspaceAPIs/.env.local',
    'apis/corsair/.env.local',
    'apis/llmpipeline/.env.local',
    'clients/web-apps/apps/accounts/.env',
    'clients/web-apps/apps/workspace/.env',
    'clients/web-apps/apps/studio/.env',
    'clients/web-apps/apps/desktop-app/.env',
    'tests/bruno/.env'
)

function Copy-EnvTemplate([string]$RelativePath) {
    $dst = Join-Path $Root $RelativePath
    $src = Join-Path (Split-Path -Parent $dst) '.env.example'
    if (-not (Test-Path -LiteralPath $src)) {
        Die "template not found: $(Split-Path -Parent $RelativePath)/.env.example"
    }
    if ((Test-Path -LiteralPath $dst) -and -not $Force.IsPresent) {
        KeepMark $RelativePath
        return
    }
    Copy-Item -LiteralPath $src -Destination $dst -Force
    OkMark $RelativePath
}

Step 'Creating gitignored env files from .env.example templates'
foreach ($rel in $EnvFiles) {
    Copy-EnvTemplate $rel
}

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
    $tauriDir = Join-Path $Root 'clients/web-apps/apps/desktop-app/src-tauri'
    if (-not (Test-Path -LiteralPath (Join-Path $tauriDir 'Cargo.toml'))) {
        OmitMark 'desktop-app Rust deps (cargo fetch)' 'src-tauri/Cargo.toml not found'
    } elseif (Get-Command cargo -ErrorAction SilentlyContinue) {
        Invoke-Install 'desktop-app Rust deps (cargo fetch)' $tauriDir 'cargo' @('fetch', '--locked')
    } else {
        OmitMark 'desktop-app Rust deps (cargo fetch)' 'cargo not found (install Rust via https://rustup.rs)'
    }
    Install-Npm 'corsair (npm install)' (Join-Path $Root 'apis/corsair') 'apis/corsair not found'
    Install-Npm 'docs (npm install)' (Join-Path $Root 'clients/docs') 'clients/docs not found'
    Install-Npm 'bruno tests (npm install)' (Join-Path $Root 'tests/bruno') 'tests/bruno not found'

    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Invoke-Install 'dekit (npm install -g @dekit/cli)' $Root 'npm' @('install', '-g', '@dekit/cli')
    } else {
        OmitMark 'dekit (npm install -g @dekit/cli)' 'npm not found'
    }

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
# Step 4 — secret scanning: gitleaks binary + pre-commit hook
# ---------------------------------------------------------------------------
Step 'Setting up secret scanning (gitleaks)'
if ($SkipInstall.IsPresent) {
    Detail 'skipped (-SkipInstall)'
} else {
    $psExe = (Get-Process -Id $PID).Path
    Invoke-Install 'gitleaks (scripts/install-gitleaks.ps1)' $Root $psExe @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'install-gitleaks.ps1'))
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $hooksPath = & git -C $Root config --get core.hooksPath 2>$null
    $ErrorActionPreference = $prev
    if (-not $script:LastInstallOk) {
        OmitMark 'pre-commit hook' 'gitleaks install failed; the hook would block every commit'
    } elseif ($hooksPath -and $hooksPath -ne 'scripts/hooks') {
        OmitMark 'pre-commit hook' "core.hooksPath is already '$hooksPath'; set it to scripts/hooks yourself"
    } else {
        & git -C $Root config core.hooksPath scripts/hooks
        OkMark 'pre-commit hook (core.hooksPath=scripts/hooks)'
    }
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
Write-Output ''
Write-Output 'Done. Repository is bootstrapped.'
Write-Output 'Next steps:'
Write-Output '  - Set the secrets listed (commented out) in each generated env file, either'
Write-Output '    in your OS environment or by uncommenting them there, before running the'
Write-Output '    services. Also set your Bruno login in tests/bruno/.env.'
Write-Output '  - Run the stack: dekit up, then dekit attach (more commands at the top of dekit.yaml)'

if ($script:InstallFailed) {
    [Console]::Error.WriteLine('')
    [Console]::Error.WriteLine('Warning: one or more dependency installs failed; see the output above.')
    exit 1
}
