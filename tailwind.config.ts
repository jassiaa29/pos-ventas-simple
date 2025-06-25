import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px'
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#2563eb', // Blue-600
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: '#f8fafc',
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					foreground: '#0f172a'
				},
				accent: {
					DEFAULT: '#06b6d4', // Cyan-500
					50: '#ecfeff',
					100: '#cffafe',
					200: '#a5f3fc',
					300: '#67e8f9',
					400: '#22d3ee',
					500: '#06b6d4',
					600: '#0891b2',
					700: '#0e7490',
					800: '#155e75',
					900: '#164e63',
					foreground: '#ffffff'
				},
				success: {
					DEFAULT: '#10b981',
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
					foreground: '#ffffff'
				},
				warning: {
					DEFAULT: '#f59e0b',
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f',
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: '#ef4444',
					50: '#fef2f2',
					100: '#fee2e2',
					200: '#fecaca',
					300: '#fca5a5',
					400: '#f87171',
					500: '#ef4444',
					600: '#dc2626',
					700: '#b91c1c',
					800: '#991b1b',
					900: '#7f1d1d',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f1f5f9',
					foreground: '#64748b'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#0f172a'
				},
				card: {
					DEFAULT: '#ffffff',
					foreground: '#0f172a'
				},
				sidebar: {
					DEFAULT: '#ffffff',
					foreground: '#334155',
					primary: '#2563eb',
					'primary-foreground': '#ffffff',
					accent: '#f1f5f9',
					'accent-foreground': '#334155',
					border: '#e2e8f0',
					ring: '#2563eb'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem'
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' }
				}
			},
			animation: {
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'pulse-subtle': 'pulse-subtle 2s infinite',
				'bounce-gentle': 'bounce-gentle 1s ease-in-out infinite'
			},
			fontFamily: {
				'sans': ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				'display': ['Outfit', 'Inter', 'sans-serif']
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
				'responsive-xs': ['0.75rem', { lineHeight: '1rem' }],
				'responsive-sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'responsive-base': ['1rem', { lineHeight: '1.5rem' }],
				'responsive-lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'responsive-xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'responsive-2xl': ['1.5rem', { lineHeight: '2rem' }]
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
