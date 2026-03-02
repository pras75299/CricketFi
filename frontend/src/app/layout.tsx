import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import AppWalletProvider from '@/components/custom/AppWalletProvider';
import { WalletButton } from '@/components/custom/WalletButton';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: 'CricketFi | On-chain Fantasy Cricket',
  description: 'Transparent. Instant. On-chain. Fantasy Cricket powered by Solana.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${sora.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center px-4 justify-between">
            <div className="flex items-center gap-2 font-sora font-bold text-lg">
              <span className="text-primary">🏏</span> CricketFi
            </div>
            <div className="flex items-center gap-4">
              <WalletButton className="[&>.wallet-adapter-button]:bg-primary [&>.wallet-adapter-button]:hover:bg-primary/80 [&>.wallet-adapter-button]:transition-colors [&>.wallet-adapter-button]:rounded-xl [&>.wallet-adapter-button]:h-10 [&>.wallet-adapter-button]:px-4 [&>.wallet-adapter-button]:font-sora [&>.wallet-adapter-button]:font-semibold" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <AppWalletProvider>
          <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
            {children}
          </main>
        </AppWalletProvider>

        {/* Mobile Bottom Navigation (Visible only on small screens) */}
        <nav className="md:hidden fixed bottom-0 w-full border-t bg-background flex items-center justify-around h-16 pb-safe">
            <div className="flex flex-col items-center justify-center w-full h-full text-primary">
                <span className="text-xs mt-1">Home</span>
            </div>
            <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                <span className="text-xs mt-1">Live</span>
            </div>
            <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                <span className="text-xs mt-1">My Teams</span>
            </div>
        </nav>
      </body>
    </html>
  );
}
