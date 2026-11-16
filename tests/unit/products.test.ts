import { products, getProduct, nextProduct, tryUrl } from '../../src/data/products';

test('order, names, categories, urls and status match the spec', () => {
  expect(products.map((p) => [p.num, p.name, p.category, p.url, p.live])).toEqual([
    ['01', 'Medioo', 'Health', 'https://medioo.eliooo.org/', true],
    ['02', 'Bolo', 'Speaking', 'https://bolo.eliooo.org/', true],
    ['03', 'Finioo', 'Finance', 'https://finioo.eliooo.org/', false],
    ['04', 'IntelliDrugs', 'Pharmacy data', 'https://drugdb.eliooo.org/', true],
  ]);
});
test('slugs are unique and themes match', () => {
  expect(products.map((p) => [p.slug, p.theme])).toEqual([
    ['medioo', 'medioo'], ['bolo', 'bolo'], ['finioo', 'finioo'], ['intellidrugs', 'drugs'],
  ]);
});
test('every product has the content its page needs', () => {
  for (const p of products) {
    expect(p.pitch.length).toBeGreaterThan(10);
    expect(p.what.length).toBeGreaterThanOrEqual(3);
    expect(p.what.length).toBeLessThanOrEqual(5);
    expect(p.hardProblems.length).toBeGreaterThanOrEqual(2);
    expect(p.hardProblems.length).toBeLessThanOrEqual(3);
    expect(p.stack.length).toBeGreaterThan(0);
  }
});
test('tryUrl is null exactly when not live, and flipping live exposes it', () => {
  const f = getProduct('finioo')!;
  expect(tryUrl(f)).toBeNull();
  expect(tryUrl({ ...f, live: true })).toBe('https://finioo.eliooo.org/');
});
test('nextProduct wraps', () => {
  expect(nextProduct('intellidrugs').slug).toBe('medioo');
  expect(nextProduct('medioo').slug).toBe('bolo');
});
test('copy has no emoji or exclamation marks', () => {
  const text = JSON.stringify(products);
  expect(text).not.toMatch(/!/);
  expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
});
test('copy starts unapproved (launch gate)', () => {
  expect(products.every((p) => p.copyApproved === false)).toBe(true);
});
