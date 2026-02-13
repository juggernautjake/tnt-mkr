import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from 'next-themes';

const BASE_URL = 'https://www.tnt-mkr.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'TNT MKR | Custom 3D-Printed Phone Cases — Designed & Made in the USA',
    template: '%s | TNT MKR',
  },
  description:
    'Shop custom 3D-printed phone cases handcrafted in Texas. Choose your colors, pick your style, and protect your device with durable, faith-inspired designs made in the USA.',
  keywords: [
    'custom phone cases',
    '3D printed phone cases',
    'Light Phone III case',
    'custom Light Phone case',
    'customizable phone case',
    'made in USA phone cases',
    'phone case Texas',
    '3D printed accessories',
    'durable phone case',
    'faith-based business',
    'Christian phone cases',
    'niche phone accessories',
    'PLA phone case',
    'TPU phone case',
  ],
  authors: [{ name: 'TNT MKR', url: BASE_URL }],
  creator: 'TNT MKR',
  publisher: 'TNT MKR',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'TNT MKR',
    title: 'TNT MKR | Custom 3D-Printed Phone Cases — Designed & Made in the USA',
    description:
      'Shop custom 3D-printed phone cases handcrafted in Texas. Choose your colors, pick your style, and protect your device with durable designs.',
    images: [
      {
        url: '/icons/Phone_Case_Icon.png',
        width: 512,
        height: 512,
        alt: 'TNT MKR — Custom 3D-Printed Phone Cases',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@TNT_MKR',
    creator: '@TNT_MKR',
    title: 'TNT MKR | Custom 3D-Printed Phone Cases',
    description:
      'Shop custom 3D-printed phone cases handcrafted in Texas. Durable, stylish, faith-inspired designs.',
    images: ['/icons/Phone_Case_Icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="hGllIUF4r7WDYGL7wQpmCEPj7Vqg0uvNOTw8YGx4sTc" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'TNT MKR',
              url: BASE_URL,
              logo: `${BASE_URL}/icons/Phone_Case_Icon.png`,
              description:
                'TNT MKR designs and manufactures custom 3D-printed phone cases in Belton, Texas. Faith-driven, American-made, built to protect.',
              foundingDate: '2024',
              founders: [
                { '@type': 'Person', name: 'Jacob Maddux', jobTitle: 'CEO & Lead Designer' },
                { '@type': 'Person', name: 'Enoch Munson', jobTitle: 'CFO & Financial Advisor' },
              ],
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Belton',
                addressRegion: 'TX',
                addressCountry: 'US',
              },
              sameAs: [
                'https://www.facebook.com/TNT.MKR.Custom.Cases/',
                'https://www.instagram.com/tnt_mkr/',
                'https://x.com/TNT_MKR',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                url: `${BASE_URL}/contact`,
                email: 'support@tnt-mkr.com',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'TNT MKR',
              url: BASE_URL,
            }),
          }}
        />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeProvider attribute="class">
          <AuthProvider>
            <Navbar />
            <main style={{ flex: '1 0 auto' }}>{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}