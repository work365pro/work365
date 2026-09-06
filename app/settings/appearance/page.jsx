// app/settings/appearance/page.jsx
'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Palette, Check, Moon, Sun } from 'lucide-react';

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('blue');
  const [saved, setSaved] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('w365_theme') || 'dark';
    const savedAccent = localStorage.getItem('w365_accent') || 'blue';
    setTheme(savedTheme);
    setAccent(savedAccent);
  }, []);

  // Apply theme
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('w365_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    showSaved();
  };

  // Apply accent color
  const handleAccentChange = (newAccent) => {
    setAccent(newAccent);
    localStorage.setItem('w365_accent', newAccent);
    document.documentElement.setAttribute('data-accent', newAccent);
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themes = [
    { 
      id: 'dark', 
      name: 'Dark Mode', 
      icon: Moon,
      preview: { bg: '#0b1220', card: '#111a2e', text: '#e5e7eb' }
    },
    { 
      id: 'light', 
      name: 'Light Mode', 
      icon: Sun,
      preview: { bg: '#f3f4f6', card: '#ffffff', text: '#111827' }
    }
  ];

  const accents = [
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'purple', name: 'Purple', color: '#8b5cf6' },
    { id: 'rose', name: 'Rose', color: '#f43f5e' },
    { id: 'amber', name: 'Amber', color: '#f59e0b' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Palette className="w-7 h-7 text-[var(--primary)]" />
              Appearance Settings
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Customize the look and feel of your workspace
            </p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-500">Saved!</span>
            </div>
          )}
        </div>

        {/* Theme Selection */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4">
            Theme Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                      : 'border-[var(--border-color)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: t.preview.bg }}
                      >
                        <Icon className="w-5 h-5" style={{ color: t.preview.text }} />
                      </div>
                      <span className="font-medium text-[var(--text-main)]">{t.name}</span>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div 
                    className="h-20 rounded-lg border border-[var(--border-color)] p-3"
                    style={{ backgroundColor: t.preview.bg }}
                  >
                    <div 
                      className="h-full rounded border border-[var(--border-color)] p-2"
                      style={{ backgroundColor: t.preview.card }}
                    >
                      <div 
                        className="h-2 w-12 rounded mb-2"
                        style={{ backgroundColor: t.preview.text, opacity: 0.8 }}
                      ></div>
                      <div 
                        className="h-2 w-20 rounded"
                        style={{ backgroundColor: t.preview.text, opacity: 0.4 }}
                      ></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Selection */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4">
            Accent Color
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {accents.map((a) => {
              const isSelected = accent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => handleAccentChange(a.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                      : 'border-[var(--border-color)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full shadow-lg"
                      style={{ backgroundColor: a.color }}
                    ></div>
                    <span className="text-sm font-medium text-[var(--text-main)]">
                      {a.name}
                    </span>
                    {isSelected && (
                      <div 
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: a.color }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-4">
          <p className="text-sm text-[var(--text-muted)]">
            <strong className="text-[var(--text-main)]">Note:</strong> Your preferences are saved locally in your browser. 
            Changes apply immediately across all pages.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}