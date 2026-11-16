#!/usr/bin/env bash
# HTTPS smoke test after a deploy. Usage: SMOKE_BASE_URL=https://eliooo.org bash scripts/smoke.sh
set -uo pipefail
B=${SMOKE_BASE_URL:?SMOKE_BASE_URL is required}
B=${B%/}
fail=0

retry() { for _ in $(seq 1 10); do "$@" && return 0; sleep 5; done; return 1; }
C="curl -s --max-time 15"
status_is() { [ "$($C -o /dev/null -w '%{http_code}' "$1")" = "$2" ]; }
body_has() { local body; body=$($C -f "$1") || return 1; [[ "$body" == *"$2"* ]]; }
redirects() { local out; out=$($C -o /dev/null -w '%{http_code} %{redirect_url}' "$1"); [ "$out" = "308 $2" ]; }
check() { local name=$1; shift; if retry "$@"; then echo "ok   $name"; else echo "FAIL $name"; fail=1; fi; }

check "home is up" body_has "$B/" 'id="products"'
check "/medioo 200" status_is "$B/medioo" 200
check "/blog 200" status_is "$B/blog" 200
check "/healthz 200" status_is "$B/healthz" 200
check "/tanvir redirects" redirects "$B/tanvir" "https://tanvir.eliooo.org/"

if [ "$B" = "https://eliooo.org" ]; then
  check "www redirects to apex" redirects "https://www.eliooo.org/" "https://eliooo.org/"
fi
exit $fail
