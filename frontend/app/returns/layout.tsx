import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refund Policy',
  description: 'Learn about TNT MKR return policy, warranty information, and how to request a replacement or refund for your custom 3D-printed phone case.',
  alternates: { canonical: 'https://www.tnt-mkr.com/returns' },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
