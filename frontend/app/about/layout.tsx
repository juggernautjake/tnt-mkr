import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Handcrafted in Texas with Purpose',
  description:
    'TNT MKR is a faith-driven company based in Belton, Texas. Founded by Jacob Maddux and Enoch Munson, we design and manufacture custom 3D-printed phone cases with integrity and purpose.',
  openGraph: {
    title: 'About TNT MKR | Handcrafted in Texas with Purpose',
    description:
      'A faith-driven company based in Belton, Texas, designing custom 3D-printed phone cases with integrity and purpose.',
    url: 'https://www.tnt-mkr.com/about',
  },
  alternates: {
    canonical: 'https://www.tnt-mkr.com/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
