import type { Metadata } from 'next';
import { Geist, Geist_Mono, Literata } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { PageTransition } from '@/components/page-transition';
import { SupportWidget } from '@/components/support-widget';
import { AppSplash } from '@/components/app-splash';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'cyrillic'],
});

const literata = Literata({
  variable: '--font-literata',
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'FoodExpress — Доставка еды',
  description: 'Закажите еду из любимых ресторанов с доставкой на дом',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${literata.variable} min-h-screen antialiased`}>
        <Providers>
          <AppSplash />
          <Header />
          <main className="min-h-0">
            <PageTransition>{children}</PageTransition>
          </main>
          <SupportWidget />
        </Providers>
      </body>
    </html>
  );
}
