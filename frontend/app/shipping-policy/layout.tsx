import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | Delivery Times & Rates',
  description: 'Learn about TNT MKR shipping options, delivery times, and rates for custom 3D-printed phone cases across the continental United States.',
  alternates: { canonical: 'https://www.tnt-mkr.com/shipping-policy' },
};

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
