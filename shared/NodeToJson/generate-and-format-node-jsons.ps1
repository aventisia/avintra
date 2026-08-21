#!/usr/bin/env pwsh
# Generate JSON files from NodeLibrary, then format only the files that were touched.
# Usage: ./format-generated-jsons.ps1
# Must be run from the repository root (same folder as the .NET sln) or from shared/NodeToJson.

$ErrorActionPreference = "Stop"

# Resolve the repository root: prefer WORC_PLATFORM_ROOT, otherwise walk up from the script location.
$repoRoot = if ($env:WORC_PLATFORM_ROOT) { $env:WORC_PLATFORM_ROOT } else {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    # The script lives in shared/NodeToJson, so repo root is two levels up.
    Resolve-Path (Join-Path $scriptDir ".." "..") | Select-Object -ExpandProperty Path
}

$nodeToJsonProject = Join-Path $repoRoot "shared" "NodeToJson"

# 1. Generate JSON files from NodeLibrary.
Write-Host "Running NodeToJson generator..."
$originalLocation = Get-Location
Set-Location $nodeToJsonProject
try {
    & dotnet run
    if ($LASTEXITCODE -ne 0) {
        Write-Error "NodeToJson generation failed with exit code $LASTEXITCODE."
        exit $LASTEXITCODE
    }
}
finally {
    Set-Location $originalLocation
}

$configJsonDir = Join-Path $repoRoot "clients" "web-apps" "apps" "studio" "src" "features" "dynamic-config-panel" "constants" "config-json"
$actionSelectorPath = Join-Path $repoRoot "clients" "web-apps" "apps" "studio" "src" "features" "action-selector" "constants" "_ActionSelectorData.json"

if (-not (Test-Path $configJsonDir)) {
    Write-Error "Could not find config-json directory at: $configJsonDir"
    exit 1
}

# Locate the prettier binary inside clients/web-apps/node_modules/.bin.
$prettier = Join-Path $repoRoot "clients" "web-apps" "node_modules" ".bin" "prettier.cmd"
if (-not (Test-Path $prettier)) {
    $prettierFallback = Join-Path $repoRoot "clients" "web-apps" "node_modules" ".bin" "prettier"
    if (Test-Path $prettierFallback) { $prettier = $prettierFallback }
    else {
        Write-Error "Could not find prettier in clients/web-apps/node_modules/.bin. Run 'npm install' first."
        exit 1
    }
}

# Capture all JSON files touched in the last 60 minutes in config-json, plus the action selector file.
$cutoff = (Get-Date).AddMinutes(-60)
$filesToFormat = Get-ChildItem -Path $configJsonDir -Filter "*.json" -File |
    Where-Object { $_.LastWriteTime -ge $cutoff } |
    Select-Object -ExpandProperty FullName

if (Test-Path $actionSelectorPath) {
    $actionSelectorInfo = Get-Item $actionSelectorPath
    if ($actionSelectorInfo.LastWriteTime -ge $cutoff) {
        $filesToFormat += $actionSelectorPath
    }
}

if ($filesToFormat.Count -eq 0) {
    Write-Host "No recently modified JSON files found. Nothing to format."
    exit 0
}

Write-Host "Formatting $($filesToFormat.Count) recently modified JSON file(s)..."

# Prettier must run from clients/web-apps so its plugins are resolvable.
$prettierWorkingDir = Join-Path $repoRoot "clients" "web-apps"

# Invoke Prettier in small batches so we do not exceed Windows' command-line length limit.
$batchSize = 30
$exitCode = 0
$originalLocation = Get-Location
Set-Location $prettierWorkingDir

try {
    for ($i = 0; $i -lt $filesToFormat.Count; $i += $batchSize) {
        $end = [Math]::Min($i + $batchSize - 1, $filesToFormat.Count - 1)
        $batch = $filesToFormat[$i..$end]
        Write-Host "  Batch $($i / $batchSize + 1): $($batch.Count) file(s)"
        & $prettier --write @batch
        if ($LASTEXITCODE -ne 0) { $exitCode = $LASTEXITCODE }
    }
}
finally {
    Set-Location $originalLocation
}

if ($exitCode -ne 0) {
    Write-Error "Prettier failed with exit code $exitCode."
    exit $exitCode
}

Write-Host "Done."
