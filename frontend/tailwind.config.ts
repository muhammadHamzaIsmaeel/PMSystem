import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS configuration with mobile-first approach
 * Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: {
          DEFAULT: '#2563eb', // User's Blue
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb', // Main
          700: '#1d4ed8',
        },
        secondary: {
          DEFAULT: '#64748b', // User's Slate
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b', // Main
          600: '#475569',
          800: '#1e293b', // Your Text Color
          900: '#0f172a',
        },
        success: {
          DEFAULT: '#10b981', // User's Emerald
          50: '#ecfdf5',
          100: '#d1fae5',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          DEFAULT: '#f59e0b', // User's Amber
          50: '#fffbeb',
          100: '#fef3c7',
          700: '#b45309',
        },
        error: {
          DEFAULT: '#ef4444', // User's Red
          50: '#fef2f2',
          100: '#fee2e2',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
