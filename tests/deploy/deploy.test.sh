#!/usr/bin/env bash
# Runs deploy/deploy.sh against a fake docker that logs every call. Usage: bash tests/deploy/deploy.test.sh
set -uo pipefail
cd "$(dirname "$0")/../.."
fail=0
pass() { echo "ok   $1"; }
bad() { echo "FAIL $1"; fail=1; }

setup() {
  T=$(mktemp -d); mkdir -p "$T/bin" "$T/state"
  cat > "$T/bin/docker" <<'FAKE'
#!/usr/bin/env bash
echo "$*" >> "$FAKE/log"
case "$1" in
  ps) cat "$FAKE/ps" ;;
  inspect) cat "$FAKE/health" ;;
  images) cat "$FAKE/images" ;;
esac
exit 0
FAKE
  chmod +x "$T/bin/docker"
  echo elioo-web-aaa-1 > "$T/ps"; echo healthy > "$T/health"
  printf 'bbb\naaa\nzzz\nyyy\nxxx\n' > "$T/images"
  echo aaa > "$T/state/TAG"; : > "$T/log"
}
run() { PATH="$T/bin:$PATH" FAKE="$T" STATE_DIR="$T/state" HEALTH_TIMEOUT=2 bash deploy/deploy.sh > "$T/out" 2>&1; }
line_of() { grep -n -- "$1" "$T/log" | head -1 | cut -d: -f1; }

# 1. happy path
setup; IMAGE_TAG=bbb run; rc=$?
[ $rc -eq 0 ] && pass "deploy exits 0" || bad "deploy exit $rc: $(cat "$T/out")"
grep -q -- 'pull ghcr.io/khondokertanvirhossain/elioo-web:bbb' "$T/log" && pass "pulls the tag" || bad "pull"
grep -E -- '^run -d --name elioo-web-bbb-[0-9]+ --network n8n_edge --network-alias elioo-web --restart unless-stopped --memory 96m ghcr.io/khondokertanvirhossain/elioo-web:bbb$' "$T/log" >/dev/null && pass "runs on n8n_edge with the alias, no published port" || bad "run line: $(grep '^run' "$T/log")"
grep -q -- ' -p ' "$T/log" && bad "publishes a port" || pass "no -p"
p=$(line_of '^pull'); r=$(line_of '^run'); h=$(line_of '^inspect'); o=$(line_of '^rm -f elioo-web-aaa-1')
[ -n "$o" ] && [ "$p" -lt "$r" ] && [ "$r" -lt "$h" ] && [ "$h" -lt "$o" ] && pass "order: pull, run, health, remove old" || bad "order p=$p r=$r h=$h o=$o"
[ "$(cat "$T/state/TAG")" = bbb ] && [ "$(cat "$T/state/PREV_TAG")" = aaa ] && pass "TAG=bbb PREV_TAG=aaa" || bad "state files"
grep -q 'rmi ghcr.io/khondokertanvirhossain/elioo-web:yyy' "$T/log" && grep -q 'rmi ghcr.io/khondokertanvirhossain/elioo-web:xxx' "$T/log" && pass "prunes beyond newest three" || bad "prune old"
grep -E 'rmi .*:(bbb|aaa|zzz)$' "$T/log" >/dev/null && bad "pruned a kept tag" || pass "keeps newest three"
grep -E '^rmi ' "$T/log" | grep -v 'ghcr.io/khondokertanvirhossain/elioo-web:' >/dev/null && bad "touched another repository" || pass "only elioo-web images pruned"

# 2. never healthy: new container removed, old untouched, exit 1
setup; echo starting > "$T/health"; IMAGE_TAG=bbb run; rc=$?
[ $rc -ne 0 ] && pass "unhealthy exits non-zero" || bad "unhealthy exit 0"
grep -E '^rm -f elioo-web-bbb-[0-9]+$' "$T/log" >/dev/null && pass "removes the unhealthy new container" || bad "new not removed"
grep -q '^rm -f elioo-web-aaa-1' "$T/log" && bad "removed the old container" || pass "old container untouched"
[ "$(cat "$T/state/TAG")" = aaa ] && pass "TAG unchanged" || bad "TAG changed"

# 3. no IMAGE_TAG: fails before any docker call
setup; unset IMAGE_TAG; run; rc=$?
[ $rc -ne 0 ] && [ ! -s "$T/log" ] && pass "missing IMAGE_TAG fails with no docker calls" || bad "missing tag rc=$rc log=$(cat "$T/log")"

exit $fail
