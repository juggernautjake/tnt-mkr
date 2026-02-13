import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom 3D-Printed Phone Case | Choose Your Colors',
  description: 'Customize your 3D-printed phone case with your choice of colors and materials. Designed and manufactured in Belton, Texas. Durable protection, unique style.',
  openGraph: {
    type: 'website',
    images: [{ url: '/icons/Phone_Case_Icon.png', width: 512, height: 512, alt: 'TNT MKR Custom Phone Case' }],
  },
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
