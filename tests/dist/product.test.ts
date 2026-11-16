import { page, exists, allHtml } from './helpers';

const products = [
  ['medioo', 'Medioo', 'medioo'],
  ['bolo', 'Bolo', 'bolo'],
  ['finioo', 'Finioo', 'finioo'],
  ['intellidrugs', 'IntelliDrugs', 'drugs'],
] as const;

describe.each(products)('/%s', (slug, name, theme) => {
  test('exists with one h1, the product name, and a titled page', () => {
    expect(exists(`/${slug}`)).toBe(true);
    const d = page(`/${slug}`);
    expect(d.querySelectorAll('h1').length).toBe(1);
    expect(d.querySelector('h1')?.textContent?.trim()).toBe(name);
    expect(d.querySelector('title')?.textContent).toBe(`${name} · elioo`);
  });
  test('header uses the product theme', () => {
    expect(page(`/${slug}`).querySelector(`.e-product-header.e-card--${theme}`)).not.toBeNull();
  });
  test('sections in order, and no empty Screens section', () => {
    const hs = [...page(`/${slug}`).querySelectorAll('.e-product-body h2')].map((h) => h.textContent?.trim());
    expect(hs).toEqual(['What it does', 'How I built it', 'Status and links']);
  });
});

test('finioo says launching soon and never links its url', () => {
  const d = page('/finioo');
  expect(d.querySelector('.e-product-header .e-status--soon')?.textContent).toBe('Launching soon');
  expect(allHtml()).not.toContain('href="https://finioo.eliooo.org');
});
test('next product wraps from intellidrugs to medioo', () => {
  expect(page('/intellidrugs').querySelector('.e-next')?.getAttribute('href')).toBe('/medioo');
  expect(page('/medioo').querySelector('.e-next')?.getAttribute('href')).toBe('/bolo');
});
test('medioo try it opens the live site in a new tab', () => {
  const a = page('/medioo').querySelector('.e-product-header .e-btn--try')!;
  expect(a.getAttribute('href')).toBe('https://medioo.eliooo.org/');
  expect(a.getAttribute('target')).toBe('_blank');
});
