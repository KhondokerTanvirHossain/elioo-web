import { products } from './products';

// Site-wide copy. Drafted from the design system README's "Real copy"; the owner approves it before launch.
export const site = {
  copyApproved: false,
  description: 'elioo is a one-person product studio in Dhaka: four AI products, designed and built by Tanvir Hossain.',
  hero: {
    before: 'Four products.',
    lineTwo: 'One',
    accent: 'builder.',
    lede: 'A family of AI products, designed and built by one person in Dhaka.',
  },
  statement:
    'I build AI products for Bangladesh, from the first sketch to production, on my own. Each one solves one worry, and each one I built end to end.',
  productsHeading: { before: 'Four products. Each one', accent: 'solves one worry.' },
  stats: [
    { n: products.length, label: 'products, designed and built by one person' },
    { n: products.filter((p) => p.live).length, label: 'live today, used by real people' },
    { n: 1, label: 'builder, from design to deploy' },
  ],
  founder: {
    first: 'Tanvir',
    last: 'Hossain',
    photo: '/images/tanvir.jpg',
    bio: "I'm a senior software engineer in Dhaka. I've spent years building banking, government and healthcare systems; elioo is where I design, build and ship my own products end to end.",
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
