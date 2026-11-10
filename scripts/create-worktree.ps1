# create-worktree.ps1 — Create an isolated git worktree for this repository.
#
# The worktree is placed next to the main checkout, inside a shared
# "<repo-parent>\<repo-folder>-wt\" folder (e.g. "avintra-wt\"). Every local,
# gitignored `.env` and `.env.local` file is copied into the new worktree and
# its service ports are re-prefixed with the worktree number so multiple
# checkouts can run at once without port clashes. API env files also get WT<N>_-prefixed database names
# (WT<N>_AccountsDb, WT<N>_WorkspaceDb, WT<N>_CorsairDb), which the APIs create
# and seed on first start, and APP_BASE_URL=wt<N>-avintra.aventisia.com so the
# APIs accept requests for the worktree host.
#
# The worktree number N (1-50) is the only input: the worktree is named
# "wt-N" and its port prefix is N, so the name always identifies the ports.
#
# Port mapping:
#   2999 -> 1 299      3001 -> 1 301      4000 -> 1 400
#   2999 -> 2 299      3001 -> 2 301      4000 -> 2 400
#   i.e. new = N*1000 + floor(original/1000)*100 + (original % 100).
#
# Usage:
#   .\scripts\create-worktree.ps1                     # prompt for a number, detached HEAD
#   .\scripts\create-worktree.ps1 -Number 3           # worktree "wt-3", port prefix 3, detached HEAD
#   .\scripts\create-worktree.ps1 -Number 3 -Branch   # branch "wt-3-base-branch"
#   .\scripts\create-worktree.ps1 -Number 3 -SkipInstall   # do not install dependencies
#
# After the worktree is created and its env files are re-prefixed, the script
# bootstraps dependencies inside the new worktree: npm install for the web apps,
# Corsair, docs and Bruno collections; cargo fetch for the desktop-app Tauri
# Rust dependencies; dotnet restore for the root solution; and
# a Python 3.12 virtualenv + pip install for the LLM pipeline. A failing install
# is reported and the script exits non-zero, but the worktree is kept. Pass
# -SkipInstall to skip this step.
#
# Database copy: the local AccountsDb, WorkspaceDb and CorsairDb are backed up
# once to "<repo-parent>\pg_dumps\local_{accounts,workspace,corsair}_db.dump";
# a database is skipped when its dump already exists or the database itself does
# not. As the last step, each dump is restored into the worktree's WT<N>_*
# database unless that database already exists. Both steps connect with
# POSTGRESQL_HOST/PORT/USERNAME/PASSWORD and are skipped when the PostgreSQL
# client tools are missing or the server is unreachable.
#
# The script only creates the worktree, edits the copied env files, installs
# dependencies, and copies the local databases; it does NOT commit, push, or
# touch the main checkout's files.

param(
    [string]$Number,
    [switch]$Branch,
    [switch]$Detach,
    [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

$MaxWorktrees = 50
$TotalSteps = 7
$Step = 0
$BasePorts = @(2999, 3001, 3002, 3006, 3007, 4000, 4001, 4003, 4005, 4006)

$UseColor = -not [Console]::IsOutputRedirected -and [bool]$Host.UI.SupportsVirtualTerminal -and -not $env:NO_COLOR
if ($UseColor) {
    $Esc = [char]27
    $CStep = "$Esc[1;32m"
    $CReset = "$Esc[0m"
} else {
    $CStep = ''
    $CReset = ''
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

function Field([string]$Label, [string]$Value) {
    Write-Output ('      ' + ($Label + ':').PadRight(15) + $Value)
}

function Detail([string]$Text) {
    Write-Output "      $Text"
}

function OkMark([string]$Text) {
    Write-Output "      [ok] $Text"
}

function SkipMark([string]$Text) {
    Write-Output "      [--] $Text (no ports to update)"
}

function BadMark([string]$Text) {
    Write-Output "      [!!] $Text"
}

function OmitMark([string]$Text, [string]$Reason) {
    Write-Output "      [--] $Text ($Reason)"
}

function Invoke-Git {
    param([string[]]$GitArgs)
    $output = & git @GitArgs 2>$null
    if ($LASTEXITCODE -ne 0) { throw "git $($GitArgs -join ' ') failed" }
    return $output
}

# ---------------------------------------------------------------------------
# Resolve the main worktree (source of truth for env files and base ports)
# ---------------------------------------------------------------------------
try {
    $worktreeList = & git worktree list --porcelain 2>$null
    if ($LASTEXITCODE -ne 0) { Die 'not inside a git repository' }
} catch {
    Die 'not inside a git repository'
}

$mainLine = $worktreeList | Select-Object -First 1
$Main = $mainLine -replace '^worktree ', ''
if ([string]::IsNullOrWhiteSpace($Main)) { Die 'not inside a git repository' }

# ---------------------------------------------------------------------------
# Worktree number -> name and port prefix
# ---------------------------------------------------------------------------
if ([string]::IsNullOrWhiteSpace($Number)) {
    $Number = Read-Host "Enter worktree number (1-$MaxWorktrees)"
}
$Number = $Number.Trim()
if ([string]::IsNullOrWhiteSpace($Number)) { Die 'worktree number cannot be empty' }
if ($Number -notmatch '^[1-9][0-9]?$' -or [int]$Number -gt $MaxWorktrees) {
    Die "invalid worktree number '$Number' (use a whole number from 1 to $MaxWorktrees)"
}
$PortPrefix = [int]$Number
$Name = "wt-$PortPrefix"

$Parent = Split-Path -Parent $Main
$WtBase = Join-Path $Parent "$(Split-Path -Leaf $Main)-wt"
$WtPath = Join-Path $WtBase $Name

if ($Branch.IsPresent) {
    $BranchName = "$Name-base-branch"
    $Mode = "branch ($BranchName)"
} else {
    $Mode = 'detached HEAD'
}

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
if (Test-Path -LiteralPath $WtPath) { Die "worktree number $PortPrefix is in use; path already exists: $WtPath" }
if ($worktreeList -contains "worktree $($WtPath -replace '\\', '/')") {
    Die "worktree number $PortPrefix is in use; a worktree is registered at: $WtPath"
}
if ($Branch.IsPresent) {
    & git -C $Main show-ref --verify --quiet "refs/heads/$BranchName"
    if ($LASTEXITCODE -eq 0) { Die "branch '$BranchName' already exists" }
}

Write-Output 'create-worktree — setting up a new worktree'

# ---------------------------------------------------------------------------
# Step 1 — locate repository
# ---------------------------------------------------------------------------
Step 'Locating repository'
Field 'main checkout' $Main

# ---------------------------------------------------------------------------
# Step 2 — create worktree
# ---------------------------------------------------------------------------
Step 'Creating worktree'
Field 'name' $Name
Field 'path' $WtPath
Field 'mode' $Mode
Field 'port prefix' "$PortPrefix"

if (-not (Test-Path -LiteralPath $WtBase)) {
    New-Item -ItemType Directory -Path $WtBase | Out-Null
}

try {
    if ($Branch.IsPresent) {
        $gitOut = & git -C $Main worktree add -b $BranchName $WtPath 2>&1
    } else {
        $gitOut = & git -C $Main worktree add --detach $WtPath 2>&1
    }
    if ($LASTEXITCODE -ne 0) { throw ($gitOut -join "`n") }
} catch {
    $gitOut | ForEach-Object { Detail $_ }
    Die 'failed to create worktree'
}
$gitOut | ForEach-Object { Detail $_ }

# ---------------------------------------------------------------------------
# Step 3 — locate gitignored env files
# ---------------------------------------------------------------------------
Step 'Locating gitignored .env files'
$envFiles = & git -C $Main ls-files --others --ignored --exclude-standard --directory 2>$null
$envFiles = @($envFiles | Where-Object { $_ -match '(^|/)\.env(\.local)?$' })
if ($envFiles.Count -eq 0) {
    Detail '(none found)'
} else {
    Field 'found' "$($envFiles.Count) file(s)"
}

# ---------------------------------------------------------------------------
# Step 4 — copy env files and re-prefix ports
# ---------------------------------------------------------------------------
$Suffix = @{}
$BySuffix = @{}
foreach ($c in $BasePorts) {
    $Suffix["$c"] = $true
    $s = [math]::Floor($c / 1000) * 100 + ($c % 100)
    $BySuffix["$s"] = $c
}

function Convert-Port([string]$Port) {
    $p = [int]$Port
    $c = $null
    if ($Suffix.ContainsKey($Port)) {
        $c = $p
    } elseif ($Port.Length -eq 5 -and $Suffix.ContainsKey($Port.Substring(1))) {
        $c = [int]$Port.Substring(1)
    } elseif ($p -ge 1000 -and $p -lt 2000 -and $BySuffix.ContainsKey([string]($p - 1000))) {
        $c = $BySuffix[[string]($p - 1000)]
    } else {
        return $Port
    }
    return [string]([int]($PortPrefix * 1000 + [math]::Floor($c / 1000) * 100 + ($c % 100)))
}

$portPatterns = @(
    '(localhost:)(\d{4,5})',
    '(127\.0\.0\.1:)(\d{4,5})',
    '(\b[A-Za-z_]*PORT=)(\d{4,5})'
)

function Update-Ports([string]$Path) {
    $content = [System.IO.File]::ReadAllText($Path)
    $updated = $content
    foreach ($pattern in $portPatterns) {
        $updated = [System.Text.RegularExpressions.Regex]::Replace(
            $updated, $pattern, {
                param($m)
                $m.Groups[1].Value + (Convert-Port $m.Groups[2].Value)
            })
    }
    if ($updated -ne $content) {
        [System.IO.File]::WriteAllText($Path, $updated)
        return $true
    }
    return $false
}

$worktreeEnvPattern = '(?m)^[ \t]*(POSTGRESQL_ACCOUNTS_DB_NAME|POSTGRESQL_WORKSPACE_DB_NAME|POSTGRESQL_DATABASE|APP_BASE_URL)=.*(\r?\n|$)'

function Set-WorktreeEnv([string]$Path) {
    $prefix = "WT${PortPrefix}_"
    $content = [System.Text.RegularExpressions.Regex]::Replace([System.IO.File]::ReadAllText($Path), $worktreeEnvPattern, '')
    $content += "`nPOSTGRESQL_ACCOUNTS_DB_NAME=${prefix}AccountsDb`nPOSTGRESQL_WORKSPACE_DB_NAME=${prefix}WorkspaceDb`nPOSTGRESQL_DATABASE=${prefix}CorsairDb`nAPP_BASE_URL=wt${PortPrefix}-avintra.aventisia.com`n"
    [System.IO.File]::WriteAllText($Path, $content)
}

Step 'Copying env files and updating ports, database names and app base URL'
if ($envFiles.Count -eq 0) {
    Detail '(nothing to copy)'
} else {
    foreach ($rel in $envFiles) {
        $src = Join-Path $Main $rel
        if (-not (Test-Path -LiteralPath $src -PathType Leaf)) { continue }
        $dst = Join-Path $WtPath $rel
        $dstDir = Split-Path -Parent $dst
        if (-not (Test-Path -LiteralPath $dstDir)) {
            New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
        }
        Copy-Item -LiteralPath $src -Destination $dst -Force
        if (Update-Ports $dst) {
            OkMark $rel
        } else {
            SkipMark $rel
        }
        if ($rel -like 'apis/*') {
            Set-WorktreeEnv $dst
            OkMark "$rel (databases -> WT${PortPrefix}_*, APP_BASE_URL -> wt${PortPrefix}-avintra.aventisia.com)"
        }
    }
}

function Resolve-WorktreePath {
    param([string[]]$Parts)
    $path = $WtPath
    foreach ($part in $Parts) { $path = Join-Path $path $part }
    return $path
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

function Invoke-Task {
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
        $script:LastTaskOk = $true
    } else {
        BadMark $Label
        $output | ForEach-Object { Detail $_ }
        $script:LastTaskOk = $false
        $script:TaskFailed = $true
    }
}

$script:TaskFailed = $false
$script:LastTaskOk = $false

# ---------------------------------------------------------------------------
# Step 5 — back up the local databases
# ---------------------------------------------------------------------------
$env:PGHOST = if ($env:POSTGRESQL_HOST) { $env:POSTGRESQL_HOST } else { 'localhost' }
$env:PGPORT = if ($env:POSTGRESQL_PORT) { $env:POSTGRESQL_PORT } else { '5432' }
$env:PGUSER = if ($env:POSTGRESQL_USERNAME) { $env:POSTGRESQL_USERNAME } else { 'postgres' }
if ($env:POSTGRESQL_PASSWORD) { $env:PGPASSWORD = $env:POSTGRESQL_PASSWORD }

$DumpDir = Join-Path $Parent 'pg_dumps'
$Databases = @(
    @{ Source = $(if ($env:POSTGRESQL_ACCOUNTS_DB_NAME) { $env:POSTGRESQL_ACCOUNTS_DB_NAME } else { 'AccountsDb' }); File = 'local_accounts_db.dump'; Target = "WT${PortPrefix}_AccountsDb" },
    @{ Source = $(if ($env:POSTGRESQL_WORKSPACE_DB_NAME) { $env:POSTGRESQL_WORKSPACE_DB_NAME } else { 'WorkspaceDb' }); File = 'local_workspace_db.dump'; Target = "WT${PortPrefix}_WorkspaceDb" },
    @{ Source = $(if ($env:POSTGRESQL_DATABASE) { $env:POSTGRESQL_DATABASE } else { 'CorsairDb' }); File = 'local_corsair_db.dump'; Target = "WT${PortPrefix}_CorsairDb" }
)

function Get-Databases {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $names = & psql -d postgres -tAqc 'SELECT datname FROM pg_database' 2>$null
        if ($LASTEXITCODE -ne 0) { return $null }
        return ,@($names)
    } finally {
        $ErrorActionPreference = $prev
    }
}

function Get-PgSkipReason {
    foreach ($tool in @('psql', 'pg_dump', 'pg_restore', 'createdb', 'dropdb')) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { return "$tool not found" }
    }
    if ($null -eq (Get-Databases)) { return "cannot connect to PostgreSQL at $($env:PGHOST):$($env:PGPORT)" }
    return ''
}

$PgSkipReason = Get-PgSkipReason

Step 'Backing up local databases'
if ($PgSkipReason) {
    OmitMark 'database backup' $PgSkipReason
} else {
    Field 'folder' $DumpDir
    if (-not (Test-Path -LiteralPath $DumpDir)) {
        New-Item -ItemType Directory -Path $DumpDir | Out-Null
    }
    $existingDbs = Get-Databases
    foreach ($db in $Databases) {
        $dump = Join-Path $DumpDir $db.File
        if (Test-Path -LiteralPath $dump) {
            OmitMark $db.Source "backup exists: $($db.File)"
        } elseif ($existingDbs -notcontains $db.Source) {
            OmitMark $db.Source 'database not found'
        } else {
            $partial = "$dump.partial"
            Invoke-Task "$($db.Source) -> $($db.File)" $DumpDir 'pg_dump' @('-Fc', '-f', $partial, $db.Source)
            if ($script:LastTaskOk) {
                Move-Item -LiteralPath $partial -Destination $dump
            } else {
                Remove-Item -LiteralPath $partial -ErrorAction SilentlyContinue
            }
        }
    }
}

# ---------------------------------------------------------------------------
# Step 6 — bootstrap dependencies inside the worktree
# ---------------------------------------------------------------------------
Step 'Installing dependencies'
if ($SkipInstall.IsPresent) {
    Detail 'skipped (-SkipInstall)'
} else {
    $webAppsDir = Resolve-WorktreePath @('clients', 'web-apps')
    if (Test-Path -LiteralPath (Join-Path $webAppsDir 'package.json')) {
        Invoke-Task 'web apps (npm install)' $webAppsDir 'npm' @('install', '--force')
    } else {
        OmitMark 'web apps (npm install)' 'clients/web-apps not found'
    }

    $tauriDir = Resolve-WorktreePath @('clients', 'web-apps', 'apps', 'desktop-app', 'src-tauri')
    if (-not (Test-Path -LiteralPath (Join-Path $tauriDir 'Cargo.toml'))) {
        OmitMark 'desktop-app Rust deps (cargo fetch)' 'src-tauri/Cargo.toml not found'
    } elseif (Get-Command cargo -ErrorAction SilentlyContinue) {
        Invoke-Task 'desktop-app Rust deps (cargo fetch)' $tauriDir 'cargo' @('fetch', '--locked')
    } else {
        OmitMark 'desktop-app Rust deps (cargo fetch)' 'cargo not found (install Rust via https://rustup.rs)'
    }

    $corsairDir = Resolve-WorktreePath @('apis', 'corsair')
    if (Test-Path -LiteralPath (Join-Path $corsairDir 'package.json')) {
        Invoke-Task 'corsair (npm install)' $corsairDir 'npm' @('install', '--force')
    } else {
        OmitMark 'corsair (npm install)' 'apis/corsair not found'
    }

    $docsDir = Resolve-WorktreePath @('clients', 'docs')
    if (Test-Path -LiteralPath (Join-Path $docsDir 'package.json')) {
        Invoke-Task 'docs (npm install)' $docsDir 'npm' @('install', '--force')
    } else {
        OmitMark 'docs (npm install)' 'clients/docs not found'
    }

    $brunoDir = Resolve-WorktreePath @('tests', 'bruno')
    if (Test-Path -LiteralPath (Join-Path $brunoDir 'package.json')) {
        Invoke-Task 'bruno tests (npm install)' $brunoDir 'npm' @('install', '--force')
    } else {
        OmitMark 'bruno tests (npm install)' 'tests/bruno not found'
    }

    if (Test-Path -LiteralPath (Join-Path $WtPath 'Avplatform.sln')) {
        Invoke-Task 'dotnet restore (Avplatform.sln)' $WtPath 'dotnet' @('restore', 'Avplatform.sln')
    } else {
        OmitMark 'dotnet restore (Avplatform.sln)' 'Avplatform.sln not found'
    }

    $llmDir = Resolve-WorktreePath @('apis', 'llmpipeline')
    if (Test-Path -LiteralPath (Join-Path $llmDir 'requirements.txt')) {
        $py = Resolve-Python312
        if ($null -eq $py) {
            OmitMark 'llmpipeline (venv + pip)' 'Python 3.12 not found'
        } else {
            $venvArgs = @()
            if ($py.Count -gt 1) { $venvArgs = $py[1..($py.Count - 1)] }
            $venvArgs += @('-m', 'venv', 'venv')
            Invoke-Task 'llmpipeline venv' $llmDir $py[0] $venvArgs
            if ($script:LastTaskOk) {
                $venvRoot = Join-Path $llmDir 'venv'
                $venvPip = Join-Path (Join-Path $venvRoot 'bin') 'pip'
                if (-not (Test-Path -LiteralPath $venvPip)) {
                    $venvPip = Join-Path (Join-Path $venvRoot 'Scripts') 'pip.exe'
                }
                Invoke-Task 'llmpipeline pip install' $llmDir $venvPip @('-r', 'requirements.txt', '-r', 'requirements-dev.txt')
            }
        }
    } else {
        OmitMark 'llmpipeline (venv + pip)' 'apis/llmpipeline not found'
    }
}

# ---------------------------------------------------------------------------
# Step 7 — restore the backups into the worktree databases
# ---------------------------------------------------------------------------
Step 'Restoring worktree databases'
if ($PgSkipReason) {
    OmitMark 'database restore' $PgSkipReason
} else {
    $existingDbs = Get-Databases
    foreach ($db in $Databases) {
        $dump = Join-Path $DumpDir $db.File
        if (-not (Test-Path -LiteralPath $dump)) {
            OmitMark $db.Target "no backup: $($db.File)"
        } elseif ($existingDbs -contains $db.Target) {
            OmitMark $db.Target 'database already exists'
        } else {
            $label = "$($db.File) -> $($db.Target)"
            Invoke-Task "$label (createdb)" $DumpDir 'createdb' @($db.Target)
            if ($script:LastTaskOk) {
                Invoke-Task "$label (pg_restore)" $DumpDir 'pg_restore' @('--no-owner', '--no-acl', '-d', $db.Target, $dump)
                if (-not $script:LastTaskOk) {
                    & dropdb --if-exists $db.Target
                }
            }
        }
    }
}

Write-Output ''
Write-Output 'Done. New worktree is ready:'
Write-Output "  $WtPath"
Write-Output "Open it with: cd `"$WtPath`""

if ($script:TaskFailed) {
    [Console]::Error.WriteLine('')
    [Console]::Error.WriteLine('Warning: one or more steps failed; see the output above.')
    exit 1
}
