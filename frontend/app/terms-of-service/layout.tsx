import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Review the terms and conditions for purchasing custom 3D-printed phone cases from TNT MKR.',
  alternates: { canonical: 'https://www.tnt-mkr.com/terms-of-service' },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
