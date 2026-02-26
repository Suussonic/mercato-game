import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { App as AntdApp } from 'antd';
// Ant Design et système de thème supprimés
import { I18nProvider } from '@/lib/I18nProvider';
import "../tailwind.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mercato",
  description: "Mercato",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" style={{ height: '100%' }}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ minHeight: '100dvh', margin: 0 }}>
        <AntdApp>
          <I18nProvider>
            {children}
          </I18nProvider>
        </AntdApp>
      </body>
    </html>
  );
}
