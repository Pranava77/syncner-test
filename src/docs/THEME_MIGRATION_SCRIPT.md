# Theme Migration Script

## Quick Migration Commands

Use these find-replace patterns to quickly update remaining components:

### Background Colors

```bash
# Main backgrounds
find: className=".*bg-black.*"
replace: style={{ backgroundColor: 'var(--color-primary-bg)' }}

find: className=".*bg-offblack.*"
replace: style={{ backgroundColor: 'var(--color-primary-bg)' }}

find: className=".*bg-white.*"
replace: style={{ backgroundColor: 'var(--color-surface)' }}

find: className=".*bg-gray-900.*"
replace: style={{ backgroundColor: 'var(--color-secondary-bg)' }}

find: className=".*bg-gray-800.*"
replace: style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
```

### Text Colors

```bash
# Text colors
find: className=".*text-paperwhite.*"
replace: style={{ color: 'var(--color-text-primary)' }}

find: className=".*text-white.*"
replace: style={{ color: 'var(--color-text-primary)' }}

find: className=".*text-teallight.*"
replace: style={{ color: 'var(--color-text-tertiary)' }}

find: className=".*text-gray-900.*"
replace: style={{ color: 'var(--color-text-primary)' }}

find: className=".*text-gray-600.*"
replace: style={{ color: 'var(--color-text-tertiary)' }}

find: className=".*text-gray-400.*"
replace: style={{ color: 'var(--color-text-muted)' }}
```

### Borders

```bash
# Borders
find: className=".*border-gray-200.*"
replace: style={{ borderColor: 'var(--color-border)' }}

find: className=".*border-gray-700.*"
replace: style={{ borderColor: 'var(--color-border)' }}

find: className=".*border-paperwhite/20.*"
replace: style={{ borderColor: 'var(--color-border)' }}

find: className=".*border-paperwhite/10.*"
replace: style={{ borderColor: 'var(--color-border-subtle)' }}
```

### Combined Patterns for Cards and Surfaces

```jsx
// Old card pattern
<div className="bg-paperwhite/10 border border-paperwhite/20 rounded-lg p-4">

// New themed card pattern
<div 
  className="rounded-lg p-4 border"
  style={{
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-md)'
  }}
>

// Old modal pattern
<div className="bg-offblack border border-paperwhite/20 rounded-xl p-6">

// New themed modal pattern
<div 
  className="rounded-xl p-6 border"
  style={{
    backgroundColor: 'var(--color-surface-elevated)',
    borderColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-lg)'
  }}
>
```

## Files Still Needing Updates

Run these commands to find files that may still need theme updates:

```bash
# Find files with hardcoded dark colors
grep -r "bg-black\|bg-offblack\|text-paperwhite\|text-teallight" src/ --include="*.tsx" --include="*.ts"

# Find files with gray scale colors
grep -r "bg-gray-\|text-gray-\|border-gray-" src/ --include="*.tsx" --include="*.ts"

# Find files with dark: variants (Tailwind)
grep -r "dark:" src/ --include="*.tsx" --include="*.ts"
```

## Component-Specific Updates

### Form Inputs
```jsx
// Old
<input className="bg-offblack text-paperwhite border border-paperwhite/20" />

// New
<input 
  className="border rounded"
  style={{
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border)'
  }}
/>
```

### Buttons
```jsx
// Old secondary button
<button className="bg-paperwhite/10 text-paperwhite border border-paperwhite/20">

// New themed button
<button 
  className="border rounded px-4 py-2"
  style={{
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border)'
  }}
>
```

### Navigation Items
```jsx
// Old nav item
<Link className="text-paperwhite hover:text-trueturquoise">

// New themed nav item
<Link 
  className="hover:text-trueturquoise transition-colors"
  style={{ color: 'var(--color-text-primary)' }}
>
```

## Theme Switcher Placement

Add theme switcher to any page missing it:

```jsx
// In the top-right corner of pages
<div className="absolute top-4 right-4">
  <ThemeSwitcher variant="button" size="sm" />
</div>

// In navigation bars
<div className="flex items-center gap-4">
  <ThemeSwitcher variant="icon" size="md" />
  {/* other nav items */}
</div>
```

## Testing Checklist

After applying theme updates:

1. ✅ Test light/dark mode switching
2. ✅ Check all pages render correctly in both themes
3. ✅ Verify modals and overlays work properly
4. ✅ Test form inputs and interactive elements
5. ✅ Check mobile responsiveness in both themes
6. ✅ Verify theme persistence on page reload
7. ✅ Test navigation and routing with themes
8. ✅ Check admin vs student layouts
9. ✅ Verify accessibility (contrast ratios)
10. ✅ Test error states and loading screens

## Common Issues and Solutions

### Issue: Component not updating theme
**Solution**: Check if component is using hardcoded colors instead of CSS variables

### Issue: Text not visible in light mode
**Solution**: Ensure text uses semantic color variables (--color-text-primary, etc.)

### Issue: Theme not persisting
**Solution**: Verify localStorage is working and theme slice is properly initialized

### Issue: Borders not visible
**Solution**: Make sure border colors use theme variables and have proper opacity

### Issue: Shadows look wrong
**Solution**: Use theme-aware shadow variables (--shadow-sm, --shadow-md, --shadow-lg)
