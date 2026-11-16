#!/usr/bin/env bash
# HTTPS smoke test after a deploy. Usage: SMOKE_BASE_URL=https://eliooo.org bash scripts/smoke.sh
set -uo pipefail
B=${SMOKE_BASE_URL:?SMOKE_BASE_URL is required}
B=${B%/}
fail=0

retry() { for _ in $(seq 1 10); do "$@" && return 0; sleep 5; done; return 1; }
status_is() { [ "$(curl -s -o /dev/null -w '%{http_code}' "$1")" = "$2" ]; }
body_has() { curl -fs "$1" | grep -q "$2"; }
redirects() { local out; out=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$1"); [ "$out" = "308 $2" ]; }
check() { local name=$1; shift; if retry "$@"; then echo "ok   $name"; else echo "FAIL $name"; fail=1; fi; }

check "home is up" body_has "$B/" "Four products."
check "/medioo 200" status_is "$B/medioo" 200
check "/blog 200" status_is "$B/blog" 200
check "/healthz 200" status_is "$B/healthz" 200
check "/tanvir redirects" redirects "$B/tanvir" "https://tanvir.eliooo.org/"

if [ "$B" = "https://eliooo.org" ]; then
  check "www redirects to apex" redirects "https://www.eliooo.org/" "https://eliooo.org/"
fi
exit $fail
