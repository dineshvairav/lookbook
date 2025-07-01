import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Providers from './providers'; // Import Providers
import { getSocialPreviewConfig } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const socialConfig = await getSocialPreviewConfig();
  
  // Fallback to a default or environment variable for the site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://usha1960.trade';

  // Ensure image URL is absolute for social media crawlers
  const imageUrl = socialConfig.imageUrl.startsWith('http')
    ? socialConfig.imageUrl
    : `${siteUrl}${socialConfig.imageUrl}`;

  return {
    title: socialConfig.title,
    description: socialConfig.description,
    openGraph: {
      title: socialConfig.title,
      description: socialConfig.description,
      url: siteUrl,
      siteName: socialConfig.title,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: socialConfig.description,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialConfig.title,
      description: socialConfig.description,
      images: [imageUrl],
    },
  };
}


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
