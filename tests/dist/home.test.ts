import { page, allHtml } from './helpers';

const d = page('/');

test('one h1 with the accent word', () => {
  expect(d.querySelectorAll('h1').length).toBe(1);
  expect(d.querySelector('h1 .e-accent')?.textContent).toBe('worries in life.');
});
test('four product cards in order with their themes', () => {
  expect([...d.querySelectorAll('.e-stack > .e-card')].map((c) => c.className)).toEqual([
    'e-card e-card--medioo', 'e-card e-card--bolo', 'e-card e-card--finioo', 'e-card e-card--drugs',
  ]);
});
test('finioo shows launching soon and its url is never linked', () => {
  const f = d.querySelector('.e-card--finioo')!;
  expect(f.querySelector('.e-status--soon')?.textContent).toBe('Launching soon');
  expect(f.querySelector('.e-btn--try')).toBeNull();
  expect(allHtml()).not.toContain('href="https://finioo.eliooo.org');
});
test('live cards link out with the arrow and new tab', () => {
  const a = d.querySelector('.e-card--medioo .e-btn--try')!;
  expect(a.getAttribute('href')).toBe('https://medioo.eliooo.org/');
  expect(a.getAttribute('target')).toBe('_blank');
  expect(a.textContent).toContain('↗');
});
test('every card links to its product page', () => {
  expect([...d.querySelectorAll('.e-card .e-btn--more')].map((a) => a.getAttribute('href'))).toEqual([
    '/medioo', '/bolo', '/finioo', '/intellidrugs',
  ]);
});
test('statement is plain readable text in the HTML', () => {
  expect(d.querySelector('.e-statement')?.textContent).toContain('Engineering is what makes it safe to rely on');
});
test('stats render final values server-side', () => {
  expect([...d.querySelectorAll('.e-stat__n')].map((n) => n.textContent)).toEqual(['4', '3', '1']);
});
test('no blog teaser and no blog nav link when there are no posts', () => {
  expect(d.querySelector('.e-posts')).toBeNull();
  expect(d.querySelector('nav a[href="/blog"]')).toBeNull();
});
test('contact shows the address as text', () => {
  expect(d.querySelector('.e-contact__mail')?.textContent).toBe('k.tanvir.hossain@gmail.com');
});
test('sections the nav points at exist', () => {
  for (const id of ['products', 'founder', 'contact']) expect(d.getElementById(id)).not.toBeNull();
});
