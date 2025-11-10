export type MenuItem = {
  key: string;
  label: string;
  href?: string;
  children?: { key: string; label: string; href: string }[];
};

export const navigationData: MenuItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'news', label: 'News', href: '/blog/list' },
  {
    key: 'solutions',
    label: 'Solutions',
    children: [
      { key: 'faqs', label: 'FAQs', href: '/pages/faqs' },
    ],
  },
  {
    key: 'products',
    label: 'Products',
    children: [
      { key: 'collection', label: 'Collection', href: '/shop/collection' },
    ],
  },
  { key: 'about', label: 'About', href: '/pages/about' },
];