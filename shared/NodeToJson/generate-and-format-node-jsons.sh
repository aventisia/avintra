#!/usr/bin/env bash
# Generate JSON files from NodeLibrary, then format only the files that were touched.
# Usage: ./format-generated-jsons.sh
# Must be run from the repository root (same folder as the .NET sln) or from shared/NodeToJson.

set -euo pipefail

# Resolve the repository root: prefer WORC_PLATFORM_ROOT, otherwise walk up from the script location.
if [ -n "${WORC_PLATFORM_ROOT:-}" ]; then
    repo_root="$WORC_PLATFORM_ROOT"
else
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    # The script lives in shared/NodeToJson, so repo root is two levels up.
    repo_root="$(cd "$script_dir/../.." && pwd)"
fi

node_to_json_project="$repo_root/shared/NodeToJson"

# 1. Generate JSON files from NodeLibrary.
echo "Running NodeToJson generator..."
(cd "$node_to_json_project" && dotnet run)

config_json_dir="$repo_root/clients/web-apps/apps/studio/src/features/dynamic-config-panel/constants/config-json"
action_selector_path="$repo_root/clients/web-apps/apps/studio/src/features/action-selector/constants/_ActionSelectorData.json"

if [ ! -d "$config_json_dir" ]; then
    echo "Could not find config-json directory at: $config_json_dir" >&2
    exit 1
fi

prettier="$repo_root/clients/web-apps/node_modules/.bin/prettier"
if [ ! -x "$prettier" ]; then
    echo "Could not find prettier at $prettier. Run 'npm install' first." >&2
    exit 1
fi

# Capture all JSON files touched in the last 60 minutes in config-json, plus the action selector file.
cutoff_minutes=60
files_to_format=()

while IFS= read -r -d '' file; do
    files_to_format+=("$file")
done < <(find "$config_json_dir" -maxdepth 1 -name "*.json" -type f -mmin "-$cutoff_minutes" -print0)

if [ -f "$action_selector_path" ] && [ "$(find "$action_selector_path" -maxdepth 0 -mmin "-$cutoff_minutes" -type f -print)" ]; then
    files_to_format+=("$action_selector_path")
fi

if [ "${#files_to_format[@]}" -eq 0 ]; then
    echo "No recently modified JSON files found. Nothing to format."
    exit 0
fi

echo "Formatting ${#files_to_format[@]} recently modified JSON file(s)..."

# Prettier must run from clients/web-apps so its plugins are resolvable.
prettier_working_dir="$repo_root/clients/web-apps"

# Invoke Prettier in small batches so we do not exceed shell command-line length limits.
batch_size=30
total=${#files_to_format[@]}
exit_code=0
for ((i = 0; i < total; i += batch_size)); do
    batch=("${files_to_format[@]:i:batch_size}")
    echo "  Batch $((i / batch_size + 1)): ${#batch[@]} file(s)"
    if ! (cd "$prettier_working_dir" && "$prettier" --write "${batch[@]}"); then
        exit_code=1
    fi
done

if [ "$exit_code" -ne 0 ]; then
    echo "Prettier failed for at least one batch." >&2
    exit "$exit_code"
fi

echo "Done."
