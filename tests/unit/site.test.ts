import { vi } from 'vitest';

test('the live count follows the products, so launching Finioo needs one edit', async () => {
  const real = await vi.importActual<typeof import('../../src/data/products')>('../../src/data/products');
  vi.resetModules();
  vi.doMock('../../src/data/products', () => ({ ...real, products: real.products.map((p) => ({ ...p, live: true })) }));
  const { site } = await import('../../src/data/site');
  vi.doUnmock('../../src/data/products');
  expect(site.stats.map((s) => s.n)).toEqual([4, 4, 1]);
});
test('copy never claims every product shipped while one is not live', async () => {
  vi.resetModules();
  const { site } = await import('../../src/data/site');
  const { products } = await import('../../src/data/products');
  if (products.some((p) => !p.live)) expect(JSON.stringify(site)).not.toMatch(/\bshipped\b/i);
});

test('the opening speaks about friendly bots and worries, not a country or "AI"', async () => {
  vi.resetModules();
  const { site } = await import('../../src/data/site');
  const opening = [site.hero.before, site.hero.accent, site.hero.lede, site.statement].join(' ');
  expect(opening).toMatch(/friendly bots?/i);
  expect(opening).not.toMatch(/Bangladesh/);
  expect(opening).not.toMatch(/\bAI\b/);
});
