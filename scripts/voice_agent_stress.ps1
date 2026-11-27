<#
.SYNOPSIS
Runs the voice-agent stress test from PowerShell.

.DESCRIPTION
This is the PowerShell entry point for voice_agent_stress.py. Start the stack
and wait for the LiveKit agent, then create a local
local-logs/voice-stress/voice-stress.json file with the target URL, iterations,
concurrency, agent names, and tokens or users, then pass that file with -Config.
A cold stack can return 502 or miss the first agent join. The local-* directory
is ignored, and the file can contain credentials.

Example voice-stress.json:

{
  "base_url": "https://local-avintra.aventisia.com",
  "iterations": 10,
  "concurrency": 1,
  "agents": ["Support agent", "Sales agent"],
  "tokens": ["paste-an-access-token-here"],
  "users": []
}

Run the cycles in the config by passing only its full path, one call at a time:

.\scripts\voice_agent_stress.ps1 -Config "C:\path\to\avintra-wt\wt-3\local-logs\voice-stress\voice-stress.json"

Relative -Config paths resolve against the current directory. Pass -Iterations
or -Concurrency to override the JSON values.

Validate the config and print the plan without making API calls:

.\scripts\voice_agent_stress.ps1 -Config "C:\path\to\avintra-wt\wt-3\local-logs\voice-stress\voice-stress.json" -DryRun

The Python script writes report.md, report.json, report.csv, and results.jsonl
under local-logs/voice-stress/runs/<utc-timestamp>.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Config,

    [ValidateRange(1, 2147483647)]
    [int]$Iterations,

    [ValidateRange(1, 2147483647)]
    [int]$Concurrency,

    [ValidateNotNullOrEmpty()]
    [string]$BaseUrl,

    [ValidateNotNullOrEmpty()]
    [string]$ReportDir,

    [ValidateNotNullOrEmpty()]
    [string]$PythonPath,

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$startingDirectory = (Get-Location).Path

function Resolve-InputPath([string]$PathValue) {
    if ([System.IO.Path]::IsPathRooted($PathValue)) {
        return [System.IO.Path]::GetFullPath($PathValue)
    }

    return [System.IO.Path]::GetFullPath(
        [System.IO.Path]::Combine($startingDirectory, $PathValue)
    )
}

$configPath = Resolve-InputPath $Config
if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
    throw "Config file was not found: $configPath"
}

if ($PSBoundParameters.ContainsKey("PythonPath")) {
    $pythonExecutable = Resolve-InputPath $PythonPath
} else {
    $pythonExecutable = Join-Path $repoRoot "apis/llmpipeline/venv/Scripts/python.exe"
}

if (-not (Test-Path -LiteralPath $pythonExecutable -PathType Leaf)) {
    throw "Python executable was not found: $pythonExecutable"
}

$pythonScript = Join-Path $PSScriptRoot "voice_agent_stress.py"
$pythonArguments = @(
    $pythonScript,
    "--config",
    $configPath
)

if ($PSBoundParameters.ContainsKey("Iterations")) {
    $pythonArguments += @("--iterations", $Iterations)
}

if ($PSBoundParameters.ContainsKey("BaseUrl")) {
    $pythonArguments += @("--base-url", $BaseUrl)
}

if ($PSBoundParameters.ContainsKey("Concurrency")) {
    $pythonArguments += @("--concurrency", $Concurrency)
}

if ($PSBoundParameters.ContainsKey("ReportDir")) {
    $pythonArguments += @("--report-dir", $ReportDir)
}

if ($DryRun) {
    $pythonArguments += "--dry-run"
}

Push-Location $repoRoot
try {
    & $pythonExecutable @pythonArguments
    $exitCode = $LASTEXITCODE
} finally {
    Pop-Location
}

exit $exitCode
