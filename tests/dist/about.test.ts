import { page } from './helpers';

const ABOUT = 'https://tanvir.eliooo.org';

test('the main menu has an About me link to the personal site', () => {
  const a = [...page('/').querySelectorAll('nav[aria-label="Main"] a')].find((x) => x.textContent?.includes('About me'));
  expect(a?.getAttribute('href')).toBe(ABOUT);
});
test('the mobile menu has it too', () => {
  const a = [...page('/').querySelectorAll('dialog[data-menu] a')].find((x) => x.textContent?.includes('About me'));
  expect(a?.getAttribute('href')).toBe(ABOUT);
});
test('the founder section leads to it', () => {
  const a = page('/').querySelector('#founder .e-btn--primary')!;
  expect(a.getAttribute('href')).toBe(ABOUT);
  expect(a.textContent).toContain('About me');
});
test('every page has the link (product page sample)', () => {
  const a = [...page('/bolo').querySelectorAll('nav[aria-label="Main"] a')].find((x) => x.textContent?.includes('About me'));
  expect(a?.getAttribute('href')).toBe(ABOUT);
});
