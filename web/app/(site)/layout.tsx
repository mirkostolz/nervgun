import Link from 'next/link';
import './globals.css';
import type { Metadata } from 'next';
import { LogoutButton } from './logout-button';
import { NextAuthProvider } from './session-provider';

export const metadata: Metadata = {
  title: 'nervgun - Attacke auf das, was uns nervt',
  description: 'Bug reporting and feedback platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <NextAuthProvider>
          <header style={{
            padding: '10px 12px', 
            borderBottom: '1px solid #eee', 
            display: 'flex', 
            gap: 12, 
            alignItems: 'center',
            backgroundColor: '#f8f9fa'
          }}>
            <Link href="/" style={{ fontWeight: 700, color: '#333', textDecoration: 'none' }}>
              nervgun
            </Link>
            <span style={{ color: '#666', fontSize: '14px' }}>
              Attacke auf das, was uns nervt
            </span>
            <span style={{ flex: 1 }} />
            <LogoutButton />
          </header>
          <main style={{
            maxWidth: 900, 
            margin: '16px auto', 
            padding: '0 12px'
          }}>
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}