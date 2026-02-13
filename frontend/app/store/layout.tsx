import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Custom Phone Cases | Choose Your Colors & Style',
  description:
    'Browse our collection of custom 3D-printed phone cases. Choose from multiple colors and styles for your Light Phone III. Handcrafted in Texas, shipped across the USA.',
  openGraph: {
    title: 'Shop Custom Phone Cases | TNT MKR',
    description:
      'Browse our collection of custom 3D-printed phone cases. Choose from multiple colors and styles.',
    url: 'https://www.tnt-mkr.com/store',
  },
  alternates: {
    canonical: 'https://www.tnt-mkr.com/store',
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
