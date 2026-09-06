  // app/layout.js
  import './globals.css';
  import ThemeProvider from '@/components/ThemeProvider';

  export const metadata = {
    title: 'WORK 365 - UAE PRO Pipeline',
    description: 'UAE PRO Department Management System',
  };

  export default function RootLayout({ children }) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen">{children}</body>
      </html>
    );
  }