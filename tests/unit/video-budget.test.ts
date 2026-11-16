import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkBudgets } from '../../scripts/check-video-budget.mjs';

const dir = mkdtempSync(join(tmpdir(), 'video-'));
const file = (name: string, bytes: number) => writeFileSync(join(dir, name), Buffer.alloc(bytes));
file('hero.webm', 4_000_001);
file('medioo.mp4', 3_000_000);
file('bolo.webm', 3_000_001);
file('hero.jpg', 9_000_000);

test('hero files get the 4 MB budget, product files 3 MB, posters are ignored', () => {
  const rows = checkBudgets(dir) as { file: string; bytes: number; limit: number; ok: boolean }[];
  const by = Object.fromEntries(rows.map((r) => [r.file, r]));
  expect(by['hero.webm']).toMatchObject({ limit: 4_000_000, ok: false });
  expect(by['medioo.mp4']).toMatchObject({ limit: 3_000_000, ok: true });
  expect(by['bolo.webm']).toMatchObject({ limit: 3_000_000, ok: false });
  expect(by['hero.jpg']).toBeUndefined();
});
test('a missing directory means no videos and no failures', () => {
  expect(checkBudgets(join(dir, 'nope'))).toEqual([]);
});
