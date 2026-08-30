import type { Metadata } from 'next';
import '@/lib/serverStorageShim';
import './globals.css';
import { getConfig } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  return {
    title: {
      default: config.site.title,
      template: `%s | ${config.site.title}`,
    },
    description: config.site.description,
    keywords: [config.author.name, 'PhD', 'Research', config.author.institution],
    authors: [{ name: config.author.name }],
    creator: config.author.name,
    publisher: config.author.name,
    icons: {
      icon: config.site.favicon,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      title: config.site.title,
      description: config.site.description,
      siteName: `${config.author.name}'s Academic Website`,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getConfig();
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href={config.site.favicon} type="image/svg+xml" />
        <link
          rel="preload"
          as="font"
          type="font/otf"
          href="/fonts/custom/StyreneB-Regular.otf"
          crossOrigin=""
        />
        <link
          rel="preload"
          as="font"
          type="font/otf"
          href="/fonts/Copernicus/OTF/CopernicusTrial-Book.otf"
          crossOrigin=""
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const root = document.documentElement;
                root.classList.remove('light', 'dark');
                root.classList.add('light');
                root.setAttribute('data-theme', 'light');
                root.style.colorScheme = 'light';
                root.style.backgroundColor = '#ffffff';
              } catch (e) {
                const root = document.documentElement;
                root.classList.remove('dark');
                root.classList.add('light');
                root.setAttribute('data-theme', 'light');
                root.style.colorScheme = 'light';
                root.style.backgroundColor = '#ffffff';
              }
            `,
          }}
        />
      </head>
      <body className="editorial-body antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}
