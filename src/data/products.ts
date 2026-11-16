// The four products, in the order the site shows them. Copy is drafted from each product's
// design system and repository; `copyApproved` stays false until the owner signs it off.

export type ProductSlug = 'medioo' | 'bolo' | 'finioo' | 'intellidrugs';
export type ProductTheme = 'medioo' | 'bolo' | 'finioo' | 'drugs';

export interface Product {
  slug: ProductSlug;
  num: '01' | '02' | '03' | '04';
  name: string;
  category: string;
  theme: ProductTheme;
  url: string;
  live: boolean;
  worry: string;
  pitch: string;
  description: string;
  logo: { kind: 'image'; src: string; alt: string } | { kind: 'drugs-wordmark' };
  placeholder: { src: string; widthPct: number };
  video?: { webm?: string; mp4?: string; poster?: string };
  what: string[];
  stack: { label: string; value: string }[];
  architecture: string;
  hardProblems: { title: string; body: string }[];
  screens: { src: string; alt: string }[];
  copyApproved: boolean;
}

export const products: Product[] = [
  {
    slug: 'medioo',
    num: '01',
    name: 'Medioo',
    category: 'Health',
    theme: 'medioo',
    url: 'https://medioo.eliooo.org/',
    live: true,
    worry: "A parent's lab report arrives full of medical shorthand, and the family can't tell what is urgent.",
    pitch: "Your family's medical papers, explained in plain Bangla.",
    description:
      'Snap a lab report or prescription. Code checks the numbers and urgency; the model only words what code has already checked.',
    logo: { kind: 'image', src: '/brand/medioo-light.svg', alt: 'Medioo' },
    placeholder: { src: '/brand/mio.webp', widthPct: 34 },
    what: [
      "Keeps a family's medical papers in one place, for an adult child, often abroad, looking after a parent.",
      'Reads a photo of a lab report or prescription and says what is written on it in plain Bangla.',
      'Shows every value beside a crop of the exact printed line it came from.',
      'Marks what needs a doctor this week or now, and never calls anything normal or safe.',
    ],
    stack: [
      { label: 'Backend', value: 'Spring Boot 3 (WebFlux), Java 21, hexagonal architecture' },
      { label: 'Web', value: 'Next.js, phone-first, works without JavaScript' },
      { label: 'Data', value: 'PostgreSQL on Supabase (R2DBC)' },
      { label: 'Infra', value: 'Docker on EC2 behind Caddy, deployed by GitHub Actions' },
    ],
    architecture:
      'A reactive Spring Boot service owns documents, reading and urgency; a Next.js front end renders the screens families use. Urgency, numbers and medicines are decided by code before any model sees them. Model wording waits for a human review; the facts do not.',
    hardProblems: [
      {
        title: 'Code decides, the model words it',
        body: 'Urgency, value verdicts and medicines are computed by code. The model only writes a short explanation around facts that are already checked, and a value that does not parse is shown as "check the paper", never as normal.',
      },
      {
        title: 'Urgency only goes up',
        body: 'Once a document is marked as needing a doctor, that state appears on every screen, in every review state, on first paint, with no way to dismiss or soften it.',
      },
      {
        title: 'A crop beside every fact',
        body: 'Every value, medicine and note carries the crop of its own printed line, so a family can always check Medioo against the paper.',
      },
    ],
    screens: [],
    copyApproved: false,
  },
  {
    slug: 'bolo',
    num: '02',
    name: 'Bolo',
    category: 'Speaking',
    theme: 'bolo',
    url: 'https://bolo.eliooo.org/',
    live: true,
    worry: 'Many people learned English from books but freeze when they have to speak it, in interviews and at work.',
    pitch: 'A speaking buddy for Bangla speakers who freeze in English.',
    description:
      'Voice-first practice with a calm buddy at dusk, then a coach who replays your own voice and fixes one thing at a time.',
    logo: { kind: 'image', src: '/brand/bolo-wordmark-night.svg', alt: 'Bolo' },
    placeholder: { src: '/brand/bolo-mark.svg', widthPct: 22 },
    what: [
      'For Bangla speakers who know English on paper but freeze when they speak.',
      'You talk with Bolo for five minutes, out loud, with no scores while you talk.',
      'Afterwards a coach gives you three things to try, in your own recorded voice.',
      'Calm by design: no red states, no timers, no broken-streak graphics.',
    ],
    stack: [
      { label: 'Backend', value: 'Spring Boot 3, Java 21 virtual threads, hexagonal modules' },
      { label: 'Web', value: 'Next.js 15, desktop browser first' },
      { label: 'Voice', value: 'Browser to WebSocket relay, streaming speech-to-text, Claude, streaming text-to-speech' },
      { label: 'Infra', value: 'Docker on EC2 behind Caddy, PostgreSQL, S3' },
    ],
    architecture:
      'One Spring Boot app and one Next.js app on one box. The voice loop is cascaded through Java, so Bolo owns turn-taking, safety and scoring instead of handing them to a speech-to-speech model.',
    hardProblems: [
      {
        title: 'Scoring during the talk, not after it',
        body: 'Every turn is scored in the background while the learner keeps talking, so when the session ends only ranking and the coach write-up remain and the debrief stays fast.',
      },
      {
        title: 'Turn-taking in a browser',
        body: 'Owning the cascaded loop means Bolo decides when a turn has ended and hides model time inside the natural pause, instead of interrupting a nervous speaker.',
      },
    ],
    screens: [],
    copyApproved: false,
  },
  {
    slug: 'finioo',
    num: '03',
    name: 'Finioo',
    category: 'Finance',
    theme: 'finioo',
    url: 'https://finioo.eliooo.org/',
    live: false,
    worry: 'Founders need a financial model that investors and banks will trust, and building one usually means hiring an expert.',
    pitch: "An AI co-pilot that builds and runs a founder's business model.",
    description:
      'Talk to it, edit the numbers directly, or drive it from your own Claude over MCP. Every figure explains where it came from.',
    logo: { kind: 'image', src: '/brand/finioo-wordmark.svg', alt: 'Finioo' },
    placeholder: { src: '/brand/finioo-fox-head.svg', widthPct: 26 },
    what: [
      'For SaaS founders in Bangladesh and abroad, and for hospital promoters, who need a model they can defend.',
      'Build and run the model by talking, by touching the numbers, or through your own Claude over MCP.',
      'Every number opens its lineage: the formula, the inputs and the sources.',
      'Any screen becomes an investor- or bank-ready output without a redesign.',
    ],
    stack: [
      { label: 'Interface', value: 'Chat on the left, the model on the right, one command set for chat, voice, keyboard and direct edit' },
      { label: 'Integrations', value: 'MCP, so a founder can drive Finioo from their own Claude' },
      { label: 'Locale', value: 'BDT and USD, lakh and crore, Bangla and English' },
    ],
    architecture:
      'The conversation decides what the canvas shows. Anything a founder can say, they can also do by hand, and every change ends in a change card with one-tap undo.',
    hardProblems: [
      {
        title: 'Every number explains itself',
        body: 'Each figure carries its formula, inputs and sources, and a value the AI proposed is always tagged with its source, range and date.',
      },
      {
        title: 'Talk or touch, the same commands',
        body: 'Chat, voice, the command bar, direct edits and MCP all run the same commands, so nothing is possible in one mode and missing in another.',
      },
    ],
    screens: [],
    copyApproved: false,
  },
  {
    slug: 'intellidrugs',
    num: '04',
    name: 'IntelliDrugs',
    category: 'Pharmacy data',
    theme: 'drugs',
    url: 'https://drugdb.eliooo.org/',
    live: true,
    worry: 'The same medicine is sold under many brand names, and few people can check which ones are safe to take together.',
    pitch: "Bangladesh's drug database, honest about what it doesn't know.",
    description:
      'Every registered medicine, cross-checked against its source, with a pharmacist review desk. Missing interaction data is shown as missing, never as safe.',
    logo: { kind: 'drugs-wordmark' },
    placeholder: { src: '/brand/intellidrugs-icon.svg', widthPct: 18 },
    what: [
      'A knowledge base of drugs registered in Bangladesh.',
      'Every record is compared field by field with its source.',
      'Pharmacists review records at a keyboard-first review desk before they count as approved.',
      'When there is no interaction data, the page says so, and never presents it as safe.',
    ],
    stack: [
      { label: 'Pipeline', value: 'Python ETL loading source data into PostgreSQL' },
      { label: 'API', value: 'Java API serving the curated data' },
      { label: 'Web', value: 'Next.js site and review desk' },
      { label: 'Infra', value: 'Docker on EC2 behind Caddy, deployed by GitHub Actions' },
    ],
    architecture:
      'Four layers: a Python ETL loads and normalises source data, PostgreSQL holds raw and curated schemas, a Java API serves the curated records, and a Next.js site presents them to the public and to reviewers.',
    hardProblems: [
      {
        title: 'Absence is never safety',
        body: 'Missing interaction data has its own visual treatment and its own fixed sentence, and pairs that involve a substance with no data are reported as not checked, never as checked.',
      },
      {
        title: 'A human signs off',
        body: 'A record only counts as approved once a pharmacist has reviewed it against the source, and the approved state is the only place green appears.',
      },
    ],
    screens: [],
    copyApproved: false,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function nextProduct(slug: ProductSlug): Product {
  const i = products.findIndex((p) => p.slug === slug);
  return products[(i + 1) % products.length];
}

export function tryUrl(p: Product): string | null {
  return p.live ? p.url : null;
}
