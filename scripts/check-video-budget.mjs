// Fails when a video in public/video/ is over its budget (hero 4 MB, product clips 3 MB).
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERO_LIMIT = 4_000_000;
export const PRODUCT_LIMIT = 3_000_000;
const VIDEO = /\.(webm|mp4|mov|m4v)$/i;

export function checkBudgets(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => VIDEO.test(f))
    .map((file) => {
      const bytes = statSync(join(dir, file)).size;
      const limit = file.startsWith('hero.') ? HERO_LIMIT : PRODUCT_LIMIT;
      return { file, bytes, limit, ok: bytes <= limit };
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = checkBudgets(fileURLToPath(new URL('../public/video', import.meta.url)));
  for (const r of rows) console.log(`${r.ok ? 'ok  ' : 'OVER'} ${r.file} ${r.bytes} / ${r.limit}`);
  if (rows.some((r) => !r.ok)) process.exit(1);
  console.log(`video budget: ${rows.length} file(s) checked`);
}
