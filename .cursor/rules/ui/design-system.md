# UI Design System

## Typography

### Font Family
- **Primary Font**: Inter

### Font Sizes
- **Headings**: 
  - H1: Inter 28px/36px, 700 weight
  - H2: Inter 24px/32px, 600 weight
  - H3: Inter 20px/28px, 600 weight
  - H4: Inter 18px/24px, 600 weight
- **Body Text**: 
  - Regular: Inter 16px/24px, 400 weight
  - Small: Inter 14px/20px, 400 weight
- **Form Labels**: Inter 14px/20px, 500 weight
- **Buttons**: Inter 16px/24px, 500 weight

### Implementation
```tsx
// Font Import in globals.css
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Apply in root layout
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

## Color Palette

### Primary Colors
- **Primary**: #0f766e (teal-700)
  - Hover: #0d9488 (teal-600)
  - Active: #0f766e (teal-700)
  - Light: #99f6e4 (teal-200)

### Secondary Colors
- **Secondary**: #475569 (slate-600)
  - Hover: #64748b (slate-500)
  - Active: #334155 (slate-700)
  - Light: #cbd5e1 (slate-300)

### Accent Color
- **Accent**: #f59e0b (amber-500)
  - Hover: #d97706 (amber-600)
  - Active: #b45309 (amber-700)
  - Light: #fcd34d (amber-300)

### Neutrals
- **White**: #ffffff
- **Gray-50**: #f8fafc
- **Gray-100**: #f1f5f9
- **Gray-200**: #e2e8f0
- **Gray-300**: #cbd5e1
- **Gray-400**: #94a3b8
- **Gray-500**: #64748b
- **Gray-600**: #475569
- **Gray-700**: #334155
- **Gray-800**: #1e293b
- **Gray-900**: #0f172a
- **Black**: #020617

### Semantic Colors
- **Success**: #22c55e (green-500)
- **Warning**: #f59e0b (amber-500)
- **Error**: #ef4444 (red-500)
- **Info**: #3b82f6 (blue-500)

### Implementation
```tsx
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f766e',
          hover: '#0d9488',
          active: '#0f766e',
          light: '#99f6e4',
        },
        secondary: {
          DEFAULT: '#475569',
          hover: '#64748b',
          active: '#334155',
          light: '#cbd5e1',
        },
        accent: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
          active: '#b45309',
          light: '#fcd34d',
        },
      },
    },
  },
  plugins: [],
}
```

## Spacing

- **Base Unit**: 4px
- **Spacing Scale**:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
  - 3xl: 64px
  - 4xl: 96px

## Border Radius

- **Small**: 4px
- **Medium**: 6px
- **Large**: 8px
- **XL**: 12px
- **Round**: 9999px (for pills and circles)

## Shadows

- **Small**: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **Medium**: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- **Large**: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- **XL**: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)

## Component Styling

### Buttons

```tsx
// components/ui/button.tsx
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover',
        secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
        tertiary: 'bg-transparent text-primary hover:underline',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

### Form Controls

#### Text Input

```tsx
// components/ui/input.tsx
import { cn } from '@/lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
```

#### Select

```tsx
// components/ui/select.tsx
import { cn } from '@/lib/utils';

export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
```

### Table

```tsx
// components/ui/table.tsx
import { cn } from '@/lib/utils';

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn('bg-gray-100', className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn('', className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        'border-b border-gray-200 transition-colors hover:bg-gray-50',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-gray-500',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn('p-4 align-middle', className)}
      {...props}
    />
  );
}
```

## Accessibility Considerations

- All components should support keyboard navigation
- Color contrast ratios should meet WCAG 2.1 AA standards
- Form elements should have associated labels
- Focus states should be clearly visible
- Interactive elements should have appropriate hover/focus states
- Icons should include appropriate ARIA attributes
