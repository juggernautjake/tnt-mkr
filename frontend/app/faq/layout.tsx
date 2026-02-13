import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Shipping, Returns & Customization',
  description:
    'Find answers about TNT MKR custom phone cases — shipping times, return policy, materials used, phone compatibility, payment methods, and more.',
  openGraph: {
    title: 'FAQ | TNT MKR Custom Phone Cases',
    description:
      'Find answers about shipping, returns, materials, phone compatibility, and payment methods.',
    url: 'https://www.tnt-mkr.com/faq',
  },
  alternates: {
    canonical: 'https://www.tnt-mkr.com/faq',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
