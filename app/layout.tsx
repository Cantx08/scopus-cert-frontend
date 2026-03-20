import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SidebarProvider } from '@/contexts/SidebarContext';
import MainLayout from '@/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Certificados de Publicaciones',
  description: 'Generación de certificados PDF a partir de publicaciones en Scopus',
  keywords: 'Scopus, certificados, publicaciones, investigación, EPN',
  icons: {
    icon: '/logo_viiv.png',
    shortcut: '/logo_viiv.png',
    apple: '/logo_viiv.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SidebarProvider>
          <MainLayout>{children}</MainLayout>
        </SidebarProvider>
      </body>
    </html>
  );
}
