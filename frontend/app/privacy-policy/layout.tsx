import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how TNT MKR collects, uses, and protects your personal information when you shop for custom 3D-printed phone cases.',
  alternates: { canonical: 'https://www.tnt-mkr.com/privacy-policy' },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
