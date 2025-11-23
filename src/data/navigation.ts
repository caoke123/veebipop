export type MenuItem = {
  key: string;
  label: string;
  href?: string;
  children?: { key: string; label: string; href: string }[];
};

export const navigationData: MenuItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'art-toys', label: 'Art toys', href: '/shop?category=art-toys' },
  { key: 'clothing-for-toys', label: 'clothing for toys', href: '/shop?category=clothing-for-toys' },
  { key: 'charms', label: 'Charms', href: '/shop?category=charms' },
  { key: 'accessories', label: 'Accessories', href: '/shop?category=in-car-accessories' },
  { key: 'about', label: 'About us', href: '/pages/about' },
  { key: 'contact', label: 'Contact Us', href: '/pages/contact' },
];