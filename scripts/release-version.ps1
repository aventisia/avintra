# release-version.ps1 — Write the current release version into the Desktop app
# and Runner app from a single source of truth: the latest git tag.
#
# The version is derived from the most recent tag matching `v<X.Y.Z>` (e.g.
# `v0.1.86`). The leading `v` is stripped, and the resulting `X.Y.Z` is written
# into every file that needs a literal version string at build time.
#
# Usage:
#   .\scripts\release-version.ps1            # use latest git tag (v0.1.86 -> 0.1.86)
#   .\scripts\release-version.ps1 0.2.0      # override with an explicit version
#   .\scripts\release-version.ps1 --show     # print the resolved version only
#
# The script only edits files; it does NOT create git commits or tags.

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Replace-InFile {
    param(
        [string]$Path,
        [string]$Pattern,
        [string]$Replacement
    )
    if (-not (Test-Path $Path)) { throw "file not found: $Path" }
    $content = [System.IO.File]::ReadAllText($Path)
    $newContent = [System.Text.RegularExpressions.Regex]::Replace($content, $Pattern, $Replacement)
    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($Path, $newContent)
    }
}

function Assert-Version {
    param([string]$Version)
    if ($Version -notmatch '^[0-9]+\.[0-9]+\.[0-9]+$') {
        throw "invalid version '$Version' (expected X.Y.Z)"
    }
}

# ---------------------------------------------------------------------------
# Resolve the version
# ---------------------------------------------------------------------------
function Resolve-Version {
    param([string[]]$VersionArgs)

    if ($VersionArgs.Count -eq 1 -and $VersionArgs[0] -ne '--show') {
        Assert-Version -Version $VersionArgs[0]
        return $VersionArgs[0]
    }

    $tag = (& git -C $Root describe --tags --abbrev=0 2>$null)
    if ([string]::IsNullOrWhiteSpace($tag)) {
        throw "no git tag found. Create a tag like 'v0.1.86' or pass an explicit version."
    }

    # Strip a leading 'v' if present (v0.1.86 -> 0.1.86).
    $ver = $tag.Trim()
    if ($ver.StartsWith('v')) { $ver = $ver.Substring(1) }
    Assert-Version -Version $ver
    return $ver
}

# ---------------------------------------------------------------------------
# Propagation
# ---------------------------------------------------------------------------
function Propagate {
    param([string]$New)

    # 1. RunnerApp (.NET service)
    Replace-InFile -Path (Join-Path $Root 'clients/RunnerApp/RunnerApp.csproj') `
        -Pattern '<Version>[0-9.]+</Version>' `
        -Replacement "<Version>$New</Version>"
    Replace-InFile -Path (Join-Path $Root 'clients/RunnerApp/RunnerApp.csproj') `
        -Pattern '<InformationalVersion>[0-9.]+</InformationalVersion>' `
        -Replacement "<InformationalVersion>$New</InformationalVersion>"

    # 2. Desktop app (Tauri)
    Replace-InFile -Path (Join-Path $Root 'clients/web-apps/apps/desktop-app/src-tauri/tauri.conf.json') `
        -Pattern '"version": "[0-9.]+"' `
        -Replacement "`"version`": `"$New`""
    # userAgent string also embeds the version
    Replace-InFile -Path (Join-Path $Root 'clients/web-apps/apps/desktop-app/src-tauri/tauri.conf.json') `
        -Pattern 'AvintraDesktopApp/[0-9.]+' `
        -Replacement "AvintraDesktopApp/$New"
    Replace-InFile -Path (Join-Path $Root 'clients/web-apps/apps/desktop-app/src-tauri/Cargo.toml') `
        -Pattern '(?m)^version = "[0-9.]+"' `
        -Replacement "version = `"$New`""
    # Cargo.lock: only the "app" package entry (name = "app" followed by version)
    Replace-InFile -Path (Join-Path $Root 'clients/web-apps/apps/desktop-app/src-tauri/Cargo.lock') `
        -Pattern 'name = "app"\nversion = "[0-9.]+"' `
        -Replacement "name = `"app`"`nversion = `"$New`""

    # 3. Desktop-app npm package.json
    Replace-InFile -Path (Join-Path $Root 'clients/web-apps/apps/desktop-app/package.json') `
        -Pattern '"version": "[0-9.]+"' `
        -Replacement "`"version`": `"$New`""
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if ($args.Count -ge 1 -and $args[0] -eq '--show') {
    Write-Output (Resolve-Version -VersionArgs $args)
    exit 0
}

$new = Resolve-Version -VersionArgs $args
Propagate -New $new
Write-Output "Release version set to $new (from git tag) across Desktop + Runner."
