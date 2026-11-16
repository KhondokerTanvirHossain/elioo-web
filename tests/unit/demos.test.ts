import { graphemes, typeInto } from '../../src/lib/demos';
import { parseHTML } from 'linkedom';

test('Bangla text splits into whole grapheme clusters', () => {
  const g = graphemes('ক্ষমা');
  expect(g.join('')).toBe('ক্ষমা');
  expect(g.length).toBeLessThan([...'ক্ষমা'].length);
});
test('typing stops when a newer run takes over', async () => {
  const { document } = parseHTML('<p id="t"></p>');
  const el = document.getElementById('t')! as unknown as HTMLElement;
  let alive = true;
  const done = typeInto(el, 'hello world', 1, () => alive);
  alive = false;
  expect(await done).toBe(false);
  expect(el.textContent!.length).toBeLessThan('hello world'.length);
});

test('steps run in data-order when given, otherwise in page order', async () => {
  const { stepOrder } = await import('../../src/lib/demos');
  const { document } = parseHTML('<div data-demo="x"><b data-seq data-order="2" id="a"></b><b data-seq data-order="1" id="b"></b><b data-seq id="c"></b></div>');
  expect(stepOrder(document.querySelector('[data-demo]') as unknown as HTMLElement).map((e) => e.id)).toEqual(['b', 'a', 'c']);
});
