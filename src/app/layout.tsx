import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Providers from './providers'; // Import Providers

export const metadata: Metadata = {
  title: 'ushªOªpp',
  description: 'Your one-stop destination for quality household goods, from traditional vessels to modern appliances.',
  openGraph: {
    title: 'ushªOªpp',
    description: 'Your one-stop destination for quality household goods, from traditional vessels to modern appliances.',
    url: 'https://usha1960.trade',
    siteName: 'ushªOªpp',
    images: [
      {
        url: '/home_1.png', // Must be an absolute URL in production
        width: 1200,
        height: 630,
        alt: 'A montage of quality household goods from ushªOªpp.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ushªOªpp',
    description: 'Your one-stop destination for quality household goods, from traditional vessels to modern appliances.',
    images: ['/home_1.png'], // Must be an absolute URL in production
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Providers> {/* Wrap children with Providers */}
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
