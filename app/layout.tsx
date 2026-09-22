import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Our Beautiful Journey | Photo Album',
  description: 'A special digital memory album filled with love, laughter, and timeless moments.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💖</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen romantic-bg antialiased selection:bg-rose-200 selection:text-rose-900">
        {children}
      </body>
    </html>
  );
}

