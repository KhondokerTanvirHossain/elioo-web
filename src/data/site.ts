import { products } from './products';

// Site-wide copy. Drafted from the design system README's "Real copy"; the owner approves it before launch.
export const site = {
  copyApproved: false,
  description: 'elioo makes friendly bots for the big worries in life: four products, each built around one worry and engineered so you can trust what it tells you. Designed and built by Tanvir Hossain.',
  hero: {
    before: 'Friendly bots for the',
    lineTwo: 'big',
    accent: 'worries in life.',
    lede: 'A family of four friendly bots, each built around one worry people live with, and engineered so you can trust what they tell you.',
  },
  statement:
    'A friendly bot is good at reading, explaining and talking. Engineering is what makes it safe to rely on: code decides the facts, the bot only puts them into words, and a person checks what matters. Every elioo bot is built that way.',
  productsHeading: { before: 'Four worries.', accent: 'Four friendly bots.' },
  stats: [
    { n: products.length, label: 'products, designed and built by one person' },
    { n: products.filter((p) => p.live).length, label: 'live today, used by real people' },
    { n: 1, label: 'builder, from design to deploy' },
  ],
  founder: {
    first: 'Tanvir',
    last: 'Hossain',
    portrait: { src: '/images/tanvir-portrait.jpg', width: 1086, height: 1448 },
    role: 'Senior software engineer in Dhaka. A backend Java engineer who grew into owning delivery, platform and product for regulated systems.',
    bio: "I've spent my career on banking, government and healthcare systems, the kind where downtime and wrong numbers are not an option. elioo is where I take everything I learned there and build my own products, end to end: the design, the code, the infrastructure and the launch.",
    facts: [
      { n: '583K+', label: 'customers on an internet bank I helped build' },
      { n: '600K+', label: 'weekly transactions on a national microfinance platform' },
      { n: '100%', label: 'pass on a HIPAA compliance scan for a US health startup' },
    ],
    work: [
      { name: 'Better Health', what: 'Product and platform owner, digital prescriptions', years: '2025 – now', href: 'https://tanvir.eliooo.org/work/better-health' },
      { name: 'Primefocus Health', what: 'Engineering manager and architect, remote patient monitoring', years: '2024 – 2025', href: 'https://tanvir.eliooo.org/work/primefocus-rpm' },
      { name: 'MRA-IMS', what: 'Team lead, national microfinance platform', years: '2023 – 2024', href: 'https://tanvir.eliooo.org/work/mra-ims' },
      { name: 'Agrani Internet Banking', what: 'Backend engineer, then the face to the bank', years: '2021 – 2023', href: 'https://tanvir.eliooo.org/work/agrani-internet-banking' },
    ],
    portfolio: 'https://tanvir.eliooo.org',
    links: [
      { label: 'Portfolio', href: 'https://tanvir.eliooo.org' },
      { label: 'GitHub', href: 'https://github.com/KhondokerTanvirHossain' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/k-tanvir-hossain/' },
    ],
  },
  contact: {
    before: "Let's",
    accent: 'talk.',
    line: 'Hiring, investing, or building something similar? One email away.',
    email: 'k.tanvir.hossain@gmail.com',
  },
  source: 'https://github.com/KhondokerTanvirHossain/elioo-web',
};
