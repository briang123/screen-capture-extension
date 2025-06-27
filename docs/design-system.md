# Design System

## Screen Capture Extension

### Version: 1.0.0

**Last Updated:** 2025-06-27

---

## 1. Overview

This design system provides a comprehensive guide for creating consistent, accessible, and beautiful user interfaces for the Screen Capture Extension. It includes color tokens, typography, spacing, components, and implementation guidelines.

### 1.1 Design Principles

- **Clarity**: Clean, uncluttered interfaces that focus on the task at hand
- **Efficiency**: Streamlined workflows that minimize clicks and cognitive load
- **Accessibility**: Inclusive design that works for all users
- **Consistency**: Unified visual language across all components
- **Modernity**: Contemporary design that feels fresh and professional

### 1.2 Target Platforms

- **Chrome Extension Popup**: 400px width, compact interface
- **Editor Window**: 1200x800px, full-featured editing interface
- **Options Page**: Full-width responsive design
- **Content Script Overlays**: High-contrast, non-intrusive

---

## 2. Color System

### 2.1 Primary Colors

```css
/* Blue - Primary brand color */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6; /* Main brand color */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
```

### 2.2 Secondary Colors

```css
/* Gray - Neutral colors */
--color-secondary-50: #f8fafc;
--color-secondary-100: #f1f5f9;
--color-secondary-200: #e2e8f0;
--color-secondary-300: #cbd5e1;
--color-secondary-400: #94a3b8;
--color-secondary-500: #64748b;
--color-secondary-600: #475569;
--color-secondary-700: #334155;
--color-secondary-800: #1e293b;
--color-secondary-900: #0f172a;
```

### 2.3 Semantic Colors

```css
/* Success */
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;
--color-success-600: #16a34a;

/* Warning */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Error */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-600: #dc2626;

/* Info */
--color-info-50: #eff6ff;
--color-info-500: #3b82f6;
--color-info-600: #2563eb;
```

### 2.4 Background Colors

```css
/* Light theme */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f8fafc;
--color-bg-tertiary: #f1f5f9;

/* Dark theme */
--color-bg-primary-dark: #0f172a;
--color-bg-secondary-dark: #1e293b;
--color-bg-tertiary-dark: #334155;
```

### 2.5 Text Colors

```css
/* Light theme */
--color-text-primary: #1e293b;
--color-text-secondary: #475569;
--color-text-tertiary: #64748b;
--color-text-inverse: #ffffff;

/* Dark theme */
--color-text-primary-dark: #f1f5f9;
--color-text-secondary-dark: #cbd5e1;
--color-text-tertiary-dark: #94a3b8;
```

---

## 3. Typography

### 3.1 Font Family

```css
--font-family-primary:
  'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono:
  'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
```

### 3.2 Font Sizes

```css
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
```

### 3.3 Font Weights

```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 3.4 Line Heights

```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## 4. Spacing System

### 4.1 Base Spacing

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### 4.2 Component Spacing

```css
/* Padding */
--padding-xs: var(--space-2);
--padding-sm: var(--space-3);
--padding-md: var(--space-4);
--padding-lg: var(--space-6);
--padding-xl: var(--space-8);

/* Margins */
--margin-xs: var(--space-2);
--margin-sm: var(--space-3);
--margin-md: var(--space-4);
--margin-lg: var(--space-6);
--margin-xl: var(--space-8);
```

---

## 5. Border Radius

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
--radius-2xl: 1rem; /* 16px */
--radius-full: 9999px;
```

---

## 6. Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## 7. Component Library

### 7.1 Buttons

#### Primary Button

```css
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

#### Secondary Button

```css
.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
}
```

#### Danger Button

```css
.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2;
}
```

#### Button Sizes

```css
.btn-sm {
  @apply px-3 py-1.5 text-sm;
}
.btn-md {
  @apply px-4 py-2 text-base;
}
.btn-lg {
  @apply px-6 py-3 text-lg;
}
```

### 7.2 Form Elements

#### Input Field

```css
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
```

#### Select Dropdown

```css
.select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
```

#### Checkbox

```css
.checkbox {
  @apply w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500;
}
```

### 7.3 Cards

#### Basic Card

```css
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}
```

#### Interactive Card

```css
.card-interactive {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer;
}
```

### 7.4 Modals

#### Modal Overlay

```css
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}
```

#### Modal Content

```css
.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6;
}
```

### 7.5 Tooltips

#### Tooltip Container

```css
.tooltip {
  @apply absolute bg-gray-900 text-white px-2 py-1 rounded text-sm z-50;
}
```

---

## 8. Layout Components

### 8.1 Container

```css
.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
```

### 8.2 Grid System

```css
.grid-2 {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}
.grid-3 {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}
.grid-4 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}
```

### 8.3 Flexbox Utilities

```css
.flex-center {
  @apply flex items-center justify-center;
}
.flex-between {
  @apply flex items-center justify-between;
}
.flex-col-center {
  @apply flex flex-col items-center;
}
```

---

## 9. Animation & Transitions

### 9.1 Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-normal: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;
```

### 9.2 Hover Effects

```css
.hover-lift {
  @apply transition-transform hover:-translate-y-1;
}

.hover-scale {
  @apply transition-transform hover:scale-105;
}
```

### 9.3 Loading States

```css
.loading-spinner {
  @apply animate-spin rounded-full border-2 border-gray-300 border-t-blue-600;
}
```

---

## 10. Dark Mode Support

### 10.1 Dark Mode Classes

```css
.dark {
  color-scheme: dark;
}

.dark .bg-white {
  @apply bg-gray-900;
}
.dark .text-gray-900 {
  @apply text-gray-100;
}
.dark .border-gray-200 {
  @apply border-gray-700;
}
```

### 10.2 Dark Mode Variables

```css
:root {
  --color-bg-primary: #ffffff;
  --color-text-primary: #1e293b;
}

[data-theme='dark'] {
  --color-bg-primary: #0f172a;
  --color-text-primary: #f1f5f9;
}
```

---

## 11. Accessibility Guidelines

### 11.1 Focus Indicators

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

### 11.2 Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### 11.3 Screen Reader Support

```css
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
}
```

---

## 12. Responsive Design

### 12.1 Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 12.2 Mobile-First Approach

```css
/* Base styles (mobile) */
.component {
  @apply text-sm;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    @apply text-base;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    @apply text-lg;
  }
}
```

---

## 13. Implementation Guidelines

### 13.1 CSS Architecture

- Use Tailwind CSS utility classes for rapid development
- Create custom components for complex patterns
- Maintain consistent naming conventions
- Use CSS custom properties for theme values

### 13.2 Component Structure

```typescript
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}
```

### 13.3 File Organization

```
src/
├── styles/
│   ├── components/
│   │   ├── button.css
│   │   ├── form.css
│   │   └── modal.css
│   ├── utilities/
│   │   ├── spacing.css
│   │   └── typography.css
│   └── index.css
```

---

## 14. Design Tokens

### 14.1 Token Structure

```json
{
  "color": {
    "primary": {
      "50": "#eff6ff",
      "500": "#3b82f6",
      "900": "#1e3a8a"
    }
  },
  "spacing": {
    "1": "0.25rem",
    "4": "1rem",
    "8": "2rem"
  },
  "typography": {
    "fontFamily": {
      "primary": "Inter, system-ui, sans-serif"
    },
    "fontSize": {
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem"
    }
  }
}
```

---

## 15. Usage Examples

### 15.1 Button Component

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}) => {
  const baseClasses =
    'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### 15.2 Card Component

```tsx
interface CardProps {
  title?: string;
  children: React.ReactNode;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({ title, children, interactive = false }) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6';
  const interactiveClasses = interactive ? 'hover:shadow-md transition-shadow cursor-pointer' : '';

  return (
    <div className={`${baseClasses} ${interactiveClasses}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  );
};
```

---

## 16. Resources

### 16.1 Design Tools

- **Figma**: Design system and component library
- **Storybook**: Component documentation and testing
- **Chromatic**: Visual regression testing

### 16.2 Development Tools

- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: Vendor prefix automation

### 16.3 Accessibility Tools

- **axe-core**: Automated accessibility testing
- **Lighthouse**: Performance and accessibility audits
- **WAVE**: Web accessibility evaluation tool

---

**Document Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Next Review:** 2024-02-15
