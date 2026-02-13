import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Get Help with Your Order',
  description:
    'Have a question about your TNT MKR order or our custom 3D-printed phone cases? Reach out and we will respond within 2 business days.',
  openGraph: {
    title: 'Contact Us | TNT MKR',
    description:
      'Have a question about your order or our products? Reach out and we will respond within 2 business days.',
    url: 'https://www.tnt-mkr.com/contact',
  },
  alternates: {
    canonical: 'https://www.tnt-mkr.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
