#!/usr/bin/env bash
# eliooo.org deploy, run on the EC2 box by GitHub Actions:
#   IMAGE_TAG=<git sha> bash ~/elioo-web/deploy.sh
# Rollback: IMAGE_TAG=$(cat ~/elioo-web/PREV_TAG) bash ~/elioo-web/deploy.sh
#
# Zero downtime: the new container joins n8n_edge under the same alias (elioo-web) as the old one,
# so the shared Caddy reaches either while both run. The old one is removed only once the new one is healthy.
# Touches nothing but elioo-web containers and ghcr.io/khondokertanvirhossain/elioo-web images.
set -euo pipefail

: "${IMAGE_TAG:?IMAGE_TAG is required}"
REPO=ghcr.io/khondokertanvirhossain/elioo-web
STATE_DIR=${STATE_DIR:-$HOME/elioo-web}
NETWORK=${NETWORK:-n8n_edge}
HEALTH_TIMEOUT=${HEALTH_TIMEOUT:-60}
KEEP=3
NEW="elioo-web-${IMAGE_TAG:0:12}-$(date +%s)"

log() { printf '[deploy] %s\n' "$*"; }
mkdir -p "$STATE_DIR"

OLD=$(docker ps --filter 'name=^elioo-web-' --format '{{.Names}}' || true)

log "pulling $REPO:$IMAGE_TAG"
docker pull "$REPO:$IMAGE_TAG"

log "starting $NEW"
docker run -d --name "$NEW" --network "$NETWORK" --network-alias elioo-web --restart unless-stopped --memory 96m "$REPO:$IMAGE_TAG"

status=""
for _ in $(seq 1 "$HEALTH_TIMEOUT"); do
  status=$(docker inspect --format '{{.State.Health.Status}}' "$NEW" 2>/dev/null || true)
  [ "$status" = "healthy" ] && break
  sleep 1
done
if [ "$status" != "healthy" ]; then
  log "new container never became healthy (last status: ${status:-none}); removing it, the old one keeps serving"
  docker rm -f "$NEW" >/dev/null || true
  exit 1
fi

for c in $OLD; do
  [ "$c" = "$NEW" ] && continue
  log "removing $c"
  docker rm -f "$c" >/dev/null
done

PREV=$(cat "$STATE_DIR/TAG" 2>/dev/null || true)
if [ -n "$PREV" ] && [ "$PREV" != "$IMAGE_TAG" ]; then echo "$PREV" > "$STATE_DIR/PREV_TAG"; fi
echo "$IMAGE_TAG" > "$STATE_DIR/TAG"

# Keep the newest $KEEP tags of this repository plus the deployed and previous ones; never touch other images.
n=0
for tag in $(docker images "$REPO" --format '{{.Tag}}'); do
  [ "$tag" = "<none>" ] && continue
  n=$((n + 1))
  [ "$n" -le "$KEEP" ] && continue
  [ "$tag" = "$IMAGE_TAG" ] || [ "$tag" = "$PREV" ] && continue
  log "pruning $REPO:$tag"
  docker rmi "$REPO:$tag" >/dev/null || true
done

log "deployed $IMAGE_TAG as $NEW"
