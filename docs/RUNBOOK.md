# eliooo.org runbook

The site runs as container `elioo-web-<sha>-<time>` on the shared EC2 box (13.205.14.249, ap-south-1), on Docker network `n8n_edge` under the alias `elioo-web`, behind the shared Caddy (`n8n-caddy-1`, config `~/n8n/Caddyfile`). The box also serves medioo, bolo, drugdb and n8n: change only what is named here.

## Deploy

Automatic: a push to `main` that passes CI builds `ghcr.io/khondokertanvirhossain/elioo-web:<sha>`, copies `deploy/deploy.sh` to `~/elioo-web/` and runs it, then smoke-tests `vars.SMOKE_BASE_URL`.

By hand on the box:

    IMAGE_TAG=<sha> bash ~/elioo-web/deploy.sh

## Rollback

    IMAGE_TAG=$(cat ~/elioo-web/PREV_TAG) bash ~/elioo-web/deploy.sh

`~/elioo-web/TAG` is what is running; `PREV_TAG` is the one before it. The last three images are kept on the box.

## Logs and status

    docker ps --filter name=elioo-web
    docker logs $(docker ps -q --filter name=elioo-web)

## Changing the shared Caddyfile

Never restart, recreate or `docker compose up` the Caddy container: every site on the box goes down. Instead:

    cp ~/n8n/Caddyfile ~/n8n/Caddyfile.bak-$(date -u +%Y%m%dT%H%M%SZ)
    # edit in place (append with >>, or sed -i); do not replace the file, it is bind-mounted
    docker exec n8n-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
    docker exec n8n-caddy-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
    for h in medioo bolo drugdb; do curl -s -o /dev/null -w "$h %{http_code}\n" https://$h.eliooo.org/; done

The blocks for this site are `deploy/edge-staging.caddy` (before launch) and `deploy/edge-production.caddy` (after the DNS change).

## Videos

Drop Remotion exports in `public/video/` (see its README for names and budgets) and push. `npm run check` fails if one is over budget.
