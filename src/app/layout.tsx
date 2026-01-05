import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'TITAN OMEGA',
  description: 'ERP Biométrico - TITAN OMEGA',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(() => {
  const stored = localStorage.getItem('titan-theme');
  const theme = stored || 'dark';
  document.documentElement.dataset.theme = theme;
})();
            `,
          }}
        />
      </head>
      <body className="bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
