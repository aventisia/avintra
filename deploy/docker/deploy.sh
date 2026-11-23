#!/usr/bin/env bash
# Deploys one avintra commit on this server; installed as /opt/avintra/deploy.sh (see README.md).
#   GitHub Actions: ssh deploy@<host> <full-sha>   (forced command; the SHA arrives in SSH_ORIGINAL_COMMAND)
#   By hand:        sudo -H -u deploy /opt/avintra/deploy.sh <full-sha>
set -euo pipefail

SHA="${1:-${SSH_ORIGINAL_COMMAND:-}}"
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "usage: deploy.sh <40-char commit sha>" >&2; exit 2; }
DIR=/opt/avintra
FILES=/var/www/aventisia.com/files
SOURCE_URL="https://raw.githubusercontent.com/aventisia/avintra/${SHA}/deploy/docker"
cd "$DIR"

exec 9>"$DIR/.deploy.lock"
flock -n 9 || { echo "another deploy is running" >&2; exit 3; }

PREVIOUS_TAG="$(sed -n 's/^AVINTRA_TAG=\([^[:space:]#]*\).*/\1/p' .env)"
[ -n "$PREVIOUS_TAG" ] || { echo ".env has no AVINTRA_TAG= line" >&2; exit 2; }
# IMPORTANT NOTE: the exported tag overrides .env, which keeps the last good tag until this deploy succeeds.
export AVINTRA_TAG="sha-${SHA:0:7}"
compose_file=compose.next.yml
changes_started=0

dc() { docker compose -f "$compose_file" "$@"; }

# IMPORTANT NOTE: the images run as root, so copies run as the owner of $FILES to keep the shared folder usable by a bare-metal rollback.
FILES_OWNER="$(stat -c %u:%g "$FILES")"

files_run() {
  local service=$1 script=$2
  shift 2
  dc run --rm --no-deps --user "$FILES_OWNER" -v "$FILES:/files" --entrypoint sh "$service" -c "set -e; $script" sh "$@"
}

# IMPORTANT NOTE: the copy lands beside the live folder and is renamed in, so readers never see a partial tree, only a missing one between the two renames.
sync_seed_folder() {
  files_run "$1" '
    mkdir -p "$(dirname "/files/$2")"
    rm -rf "/files/$2.new" "/files/$2.old"
    cp -R "$1" "/files/$2.new"
    if [ -e "/files/$2" ]; then mv "/files/$2" "/files/$2.old"; fi
    mv "/files/$2.new" "/files/$2"
    rm -rf "/files/$2.old"' "$2" "$3"
}

sync_seed_folders() {
  sync_seed_folder workspace-api /seed/skills skills &&
    sync_seed_folder corsair-api /seed/corsair-configs configs/Corsair &&
    sync_seed_folder accounts-api /seed/scripts scripts
}

http_answers() {
  local status
  status="$(curl -s -o /dev/null --max-time 5 -w '%{http_code}' "$1" || true)"
  [ "$status" != 000 ] && [ "$status" -lt 500 ]
}

corsair_healthy() {
  dc exec -T corsair-api node -e \
    "fetch('http://127.0.0.1:4006/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))" 2>/dev/null
}

wait_until() {
  local name=$1
  shift
  for _ in $(seq 1 60); do
    "$@" && return 0
    sleep 3
  done
  echo "$name is not answering" >&2
  return 1
}

wait_for_services() {
  local url
  for url in http://127.0.0.1:4000/ http://127.0.0.1:4001/ http://127.0.0.1:4003/health-check \
             http://127.0.0.1:4004/ http://127.0.0.1:7880/ http://127.0.0.1:8080/ \
             http://127.0.0.1:8081/ http://127.0.0.1:8082/; do
    wait_until "$url" http_answers "$url" || return 1
  done
  wait_until corsair-api corsair_healthy
}

# IMPORTANT NOTE: Corsair migrations are not reverted, so the restored release runs against the newer schema; safe while migrations only add.
roll_back() {
  if [ ! -f compose.yml ]; then
    echo "no previous release to restore; the new containers are left running" >&2
    return 0
  fi
  echo "==> restoring $PREVIOUS_TAG" >&2
  export AVINTRA_TAG="$PREVIOUS_TAG"
  compose_file=compose.yml
  sync_seed_folders && dc up -d --remove-orphans
}

on_exit() {
  local status=$?
  set +e
  if [ "$status" -ne 0 ] && [ "$changes_started" -eq 1 ]; then
    roll_back || { echo "rollback failed; check docker compose ps" >&2; dc ps; }
  fi
  exit "$status"
}
trap on_exit EXIT

echo "==> $AVINTRA_TAG: fetching compose.yml and deploy.sh"
curl -fsSL -o compose.next.yml "$SOURCE_URL/compose.yml" -o deploy.next.sh "$SOURCE_URL/deploy.sh"
cmp -s deploy.next.sh "${BASH_SOURCE[0]}" \
  || echo "WARNING: this deploy.sh differs from the one at $SHA; reinstall it (deploy/docker/README.md)" >&2
rm -f deploy.next.sh

echo "==> pulling (waits up to 20 min for CI to finish pushing)"
for i in $(seq 1 40); do
  dc pull --quiet && break
  [ "$i" -eq 40 ] && { echo "images for $AVINTRA_TAG not found" >&2; exit 4; }
  sleep 30
done

changes_started=1
echo "==> syncing skills, Corsair configs and the Runner install script into $FILES"
sync_seed_folders

echo "==> Corsair migrate and seed"
dc run --rm --no-deps corsair-api sh -c 'node dist/migrate.js && node dist/seed-corsair-tools.js'

echo "==> starting"
dc up -d --remove-orphans

echo "==> waiting for every service to answer (up to 3 min each)"
wait_for_services || { dc ps; exit 5; }

mv compose.next.yml compose.yml
sed -i "s/^AVINTRA_TAG=.*/AVINTRA_TAG=${AVINTRA_TAG}/" .env
changes_started=0
echo "$(date -Is) $SHA" >> deploy.log
docker image prune -af --filter until=720h >/dev/null
echo "==> deployed $AVINTRA_TAG"
