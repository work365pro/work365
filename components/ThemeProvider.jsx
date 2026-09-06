  // components/ThemeProvider.jsx
  'use client';

  import { useEffect } from 'react';

  export default function ThemeProvider({ children }) {
    useEffect(() => {
      const savedTheme = localStorage.getItem('w365_theme') || 'dark';
      const savedAccent = localStorage.getItem('w365_accent') || 'blue';
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.documentElement.setAttribute('data-accent', savedAccent);
    }, []);

    return <>{children}</>;
  }