import { test, expect, type Page } from '@playwright/test';

const SITE = 'http://localhost:4321';
const FIX = 'http://localhost:4322';
const routes = ['/', '/medioo', '/bolo', '/finioo', '/intellidrugs', '/blog', '/404'].map((r) => SITE + r);
routes.push(FIX + '/blog/first-post', FIX + '/');

async function noSideScroll(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
}

test.describe('phone width 360px', () => {
  test.use({ viewport: { width: 360, height: 740 } });
  for (const url of routes) {
    test(`no sideways scroll and no console errors: ${url}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(url);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      expect(await noSideScroll(page)).toBe(true);
      expect(errors).toEqual([]);
    });
  }

  test('mobile menu opens, closes on Escape and returns focus', async ({ page }) => {
    await page.goto(SITE + '/');
    const menu = page.getByRole('button', { name: 'Menu' });
    await menu.click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
    await expect(menu).toBeFocused();
  });
});

test.describe('JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });
  test('home still reads completely', async ({ page }) => {
    await page.goto(SITE + '/');
    await expect(page.locator('.e-statement')).toContainText('I build AI products for Bangladesh');
    for (const slug of ['medioo', 'bolo', 'finioo', 'intellidrugs']) {
      const card = page.locator(`#product-${slug}`);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeVisible();
    }
    await expect(page.locator('.e-stat__n')).toHaveText(['4', '3', '1']);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no smooth scroll, words fully lit, numbers final', async ({ page }) => {
    await page.goto(SITE + '/');
    expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(false);
    expect(await page.locator('.e-statement .w').count()).toBe(0);
    await page.locator('.e-stats').scrollIntoViewIfNeeded();
    await expect(page.locator('.e-stat__n')).toHaveText(['4', '3', '1']);
    const paused = await page.evaluate(() => [...document.querySelectorAll<HTMLVideoElement>('video[data-autoplay]')].every((v) => v.paused));
    expect(paused).toBe(true);
  });
});

test.describe('desktop motion', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('the first card scales down once later cards cover it', async ({ page }) => {
    await page.goto(SITE + '/');
    await page.locator('#product-finioo').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1200);
    const scale = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('#product-medioo')!).transform).a);
    expect(scale).toBeLessThan(1);
  });
});

test.describe('small phone', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  test('cards do not stick, so each video slot scrolls fully into view', async ({ page }) => {
    await page.goto(SITE + '/');
    const media = page.locator('#product-medioo .e-video');
    await media.scrollIntoViewIfNeeded();
    const box = await media.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(667);
    const position = await page.evaluate(() => getComputedStyle(document.querySelector('#product-medioo')!).position);
    expect(position).not.toBe('sticky');
  });
});

test('smooth scrolling and scroll motion load only on the home page', async ({ page }) => {
  const loaded: string[] = [];
  page.on('request', (r) => loaded.push(r.url()));
  await page.goto(SITE + '/bolo');
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(false);
  const productPageJs = new Set(loaded.filter((u) => u.endsWith('.js')));
  const homeLoaded: string[] = [];
  page.on('request', (r) => homeLoaded.push(r.url()));
  await page.goto(SITE + '/');
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(true);
  const extra = homeLoaded.filter((u) => u.endsWith('.js') && !productPageJs.has(u));
  expect(extra.length).toBeGreaterThan(0);
});
