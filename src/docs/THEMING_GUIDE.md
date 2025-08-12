# Theme System Guide

## Overview

This application now supports both light and dark themes with a comprehensive theming system built using CSS custom properties (CSS variables) and Redux for state management.

## Features

✅ **Light and Dark Mode Support**
✅ **Persistent Theme Selection** (saved to localStorage)
✅ **Multiple Theme Switcher Variants** (button, toggle, icon)
✅ **CSS Custom Properties** for consistent theming
✅ **Smooth Transitions** between themes
✅ **Comprehensive Color Palette**
✅ **Theme-aware Components**

## Quick Start

### Using the Theme Switcher

The `ThemeSwitcher` component is available in three variants:

```tsx
// Button variant (default)
<ThemeSwitcher variant="button" />

// Toggle switch variant
<ThemeSwitcher variant="toggle" showLabels={true} />

// Icon-only variant
<ThemeSwitcher variant="icon" size="lg" />
```

### Accessing Theme State

```tsx
import { useAppSelector } from '../redux/store';

const { isDarkMode } = useAppSelector((state) => state.theme);
```

### Toggling Theme Programmatically

```tsx
import { useAppDispatch } from '../redux/store';
import { toggleTheme, setTheme } from '../redux/slices/themeSlice';

const dispatch = useAppDispatch();

// Toggle between light and dark
dispatch(toggleTheme());

// Set specific theme
dispatch(setTheme(true)); // Dark mode
dispatch(setTheme(false)); // Light mode
```

## CSS Variables

### Color System

The theming system uses CSS custom properties that automatically switch based on the `.dark` class:

#### Background Colors
- `--color-primary-bg`: Main background color
- `--color-secondary-bg`: Secondary background (sidebars, panels)
- `--color-tertiary-bg`: Tertiary background (cards, elevated surfaces)
- `--color-surface`: Surface color for components
- `--color-surface-elevated`: Elevated surface color

#### Text Colors
- `--color-text-primary`: Primary text color
- `--color-text-secondary`: Secondary text color
- `--color-text-tertiary`: Tertiary text color (captions, labels)
- `--color-text-muted`: Muted text color
- `--color-text-inverse`: Inverse text color (for dark backgrounds)

#### Accent Colors
- `--color-accent-primary`: Primary accent color (turquoise)
- `--color-accent-secondary`: Secondary accent color (light teal)
- `--color-accent-tertiary`: Tertiary accent color (varies by theme)

#### Border & Shadow
- `--color-border`: Standard border color
- `--color-border-subtle`: Subtle border color
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`: Theme-aware shadows

### Usage Examples

```css
/* Using CSS variables in your components */
.my-component {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}
```

```tsx
// Using CSS variables in React inline styles
<div style={{
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  borderColor: 'var(--color-border)'
}}>
  Content
</div>
```

## Helper Components

### ThemeContainer

A utility component for theme-aware containers:

```tsx
import ThemeContainer from '../components/ThemeContainer';

<ThemeContainer variant="surface" className="p-4 rounded-lg">
  Content with automatic theme background
</ThemeContainer>
```

Variants: `primary`, `secondary`, `surface`, `elevated`, `accent`

### ThemeText

A utility component for theme-aware text:

```tsx
import ThemeText from '../components/ThemeText';

<ThemeText variant="primary" as="h1" className="text-2xl">
  Themed heading
</ThemeText>

<ThemeText variant="tertiary" as="p">
  Themed paragraph with tertiary color
</ThemeText>
```

Variants: `primary`, `secondary`, `tertiary`, `muted`, `inverse`

## Theme Locations

The theme switcher is available in:

1. **Desktop Sidebar** (collapsed: icon, expanded: toggle)
2. **Mobile Header** (icon variant)
3. **Login Page** (button variant in top-right)

## Color Palette

### Light Mode
- **Primary Background**: `#FFFFFF`
- **Secondary Background**: `#F8F9FA`
- **Surface**: `#FFFFFF`
- **Primary Text**: `#111827`
- **Secondary Text**: `#374151`
- **Tertiary Text**: `#6B7280`
- **Borders**: `#E5E7EB`

### Dark Mode
- **Primary Background**: `#121212`
- **Secondary Background**: `#1F1F1F`
- **Surface**: `#1F1F1F`
- **Primary Text**: `#FAFAFA`
- **Secondary Text**: `#E5E7EB`
- **Tertiary Text**: `#A0D8EF`
- **Borders**: `#404040`

### Accent Colors (Both Themes)
- **Primary**: `#00B8D9` (True Turquoise)
- **Secondary**: `#A0D8EF` (Teal Light)
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Use semantic color names** (text-primary vs specific colors)
3. **Test both themes** when creating new components
4. **Use the helper components** for consistent theming
5. **Prefer CSS variables over Tailwind dark: variants**
6. **Maintain contrast ratios** for accessibility

## Migration Guide

To update existing components:

1. Replace hardcoded background colors:
   ```css
   /* Before */
   background-color: #121212;
   
   /* After */
   background-color: var(--color-primary-bg);
   ```

2. Replace hardcoded text colors:
   ```css
   /* Before */
   color: #FAFAFA;
   
   /* After */
   color: var(--color-text-primary);
   ```

3. Replace Tailwind dark variants:
   ```tsx
   {/* Before */}
   <div className="bg-white dark:bg-gray-900 text-black dark:text-white">
   
   {/* After */}
   <div style={{
     backgroundColor: 'var(--color-surface)',
     color: 'var(--color-text-primary)'
   }}>
   ```

## Troubleshooting

### Theme not persisting
- Ensure localStorage is available
- Check that `getInitialTheme()` is called in the theme slice

### Colors not switching
- Verify `.dark` class is added to `document.documentElement`
- Check App.tsx theme effect is working
- Ensure CSS variables are defined in both `:root` and `.dark`

### Component not updating
- Component might be using hardcoded colors
- Use CSS variables instead of static color values
- Check if component is wrapped in proper theme context
