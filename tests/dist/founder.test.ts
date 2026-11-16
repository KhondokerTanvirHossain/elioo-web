import { page } from './helpers';

const d = page('/');
const f = d.querySelector('#founder')!;

test('large portrait with fixed dimensions', () => {
  const img = f.querySelector('img.e-founder__portrait')!;
  expect(img.getAttribute('src')).toBe('/images/tanvir-portrait.jpg');
  expect(img.getAttribute('width')).toBe('1086');
  expect(img.getAttribute('height')).toBe('1448');
  expect(img.getAttribute('alt')).toBe('Tanvir Hossain');
});
test('name, positioning and bio', () => {
  expect(f.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Tanvir Hossain');
  expect(f.querySelector('.e-founder__role')?.textContent).toContain('regulated systems');
});
test('three proof points from the portfolio', () => {
  expect([...f.querySelectorAll('.e-founder__fact b')].map((b) => b.textContent)).toEqual(['583K+', '600K+', '100%']);
});
test('where I have built links to each case study', () => {
  expect([...f.querySelectorAll('.e-founder__work a')].map((a) => a.getAttribute('href'))).toEqual([
    'https://tanvir.eliooo.org/work/better-health',
    'https://tanvir.eliooo.org/work/primefocus-rpm',
    'https://tanvir.eliooo.org/work/mra-ims',
    'https://tanvir.eliooo.org/work/agrani-internet-banking',
  ]);
});
test('see my work is the primary action', () => {
  const a = f.querySelector('.e-btn--primary')!;
  expect(a.getAttribute('href')).toBe('https://tanvir.eliooo.org');
  expect(a.textContent).toContain('About me');
});
