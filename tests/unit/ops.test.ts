import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
const runbook = readFileSync('docs/RUNBOOK.md', 'utf8');

test('a failed smoke test rolls back to the previous tag', () => {
  expect(workflow).toMatch(/if: failure\(\) && steps\.smoke\.outcome == 'failure'/);
  expect(workflow).toContain('IMAGE_TAG=$(cat ~/elioo-web/PREV_TAG) bash ~/elioo-web/deploy.sh');
  expect(workflow).toMatch(/id: smoke/);
});
test('the runbook never replaces the bind-mounted Caddyfile and checks the container sees the edit', () => {
  expect(runbook).not.toMatch(/sed -i/);
  expect(runbook).toContain('docker exec n8n-caddy-1 cat /etc/caddy/Caddyfile | diff - ~/n8n/Caddyfile');
});
