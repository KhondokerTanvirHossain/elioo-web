#!/usr/bin/env bash
# Builds the site image and checks how it serves. Usage: bash tests/deploy/image.test.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
IMG=elioo-web:test
NAME=elioo-web-imgtest-$$
fail=0
check() { if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$3] got [$2]"; fail=1; fi; }

docker build -q -f deploy/Dockerfile -t "$IMG" . >/dev/null
docker run -d --rm --name "$NAME" -p 127.0.0.1::8080 "$IMG" >/dev/null
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT
PORT=$(docker port "$NAME" 8080/tcp | head -1 | sed 's/.*://')
B="http://127.0.0.1:$PORT"
for i in $(seq 1 30); do curl -fs "$B/healthz" >/dev/null 2>&1 && break; sleep 0.5; done

code() { curl -s -o /dev/null -w '%{http_code}' "$B$1"; }
header() { curl -s -D - -o /dev/null ${3:-} "$B$1" | tr -d '\r' | awk -v h="$2" 'BEGIN{IGNORECASE=1} tolower($0) ~ "^"tolower(h)":" {sub(/^[^:]*: */,""); print; exit}'; }

check "/ is 200" "$(code /)" 200
check "/medioo is 200" "$(code /medioo)" 200
check "/healthz is 200" "$(code /healthz)" 200
check "/nope is 404" "$(code /nope)" 404
curl -s "$B/nope" | grep -q 'Not' && echo "ok   404 body is the site's 404 page" || { echo "FAIL 404 body"; fail=1; }
check "/tanvir is 308" "$(code /tanvir)" 308
check "/tanvir location" "$(header /tanvir Location)" "https://tanvir.eliooo.org"
ASSET=$(curl -s "$B/" | grep -o '/_astro/[^"]*\.css' | head -1)
check "hashed assets cached for a year" "$(header "$ASSET" Cache-Control)" "public, max-age=31536000, immutable"
check "html cached briefly" "$(header / Cache-Control)" "public, max-age=300"
ENC=$(header / Content-Encoding "-H Accept-Encoding:gzip")
[ "$ENC" = "gzip" ] && echo "ok   gzip when asked" || { echo "FAIL gzip: got [$ENC]"; fail=1; }
SIZE=$(docker image inspect -f '{{.Size}}' "$IMG")
[ "$SIZE" -lt 120000000 ] && echo "ok   image size $SIZE" || { echo "FAIL image size $SIZE"; fail=1; }
exit $fail
