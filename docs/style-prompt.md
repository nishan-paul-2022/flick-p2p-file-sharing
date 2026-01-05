# Style Prompt

Tailwind CSS, design system, and styling conventions.

---

## Core Rules

1. **No inline styles** - Never use `style={{...}}`
2. **Tailwind utilities only** - All styling via Tailwind classes
3. **Mobile-first responsive** - Start with mobile, add breakpoints up
4. **Dark mode by default** - Design for dark theme
5. **Use cn() utility** - Combine conditional classes properly
6. **shadcn/ui components** - Use for all UI primitives

---

## Tailwind Patterns

```tsx
// ✅ Use cn() for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'primary' && "primary-classes"
)} />

// ❌ Never use inline styles
<div style={{ marginTop: '20px' }} />  // ❌

// ✅ Use Tailwind utilities
<div className="mt-5" />  // ✅

// ✅ Mobile-first responsive
<div className="w-full md:w-1/2 lg:w-1/3" />

// ❌ Desktop-first (wrong)
<div className="w-1/3 md:w-1/2 sm:w-full" />  // ❌
```

---

## Responsive Design

```tsx
// ✅ Breakpoint system (mobile-first)
xs: 320px   // Extra small devices
sm: 640px   // Small devices
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large devices
2xl: 1536px // 2X large devices

// ✅ Mobile-first pattern
<div className={cn(
  "p-4",           // Mobile: 16px padding
  "sm:p-6",        // Small: 24px padding
  "md:p-8",        // Medium: 32px padding
  "lg:p-12"        // Large: 48px padding
)} />

// ✅ Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" />

// ✅ Responsive text
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl" />

// ✅ Hide/show based on screen size
<div className="hidden md:block" />  // Show on md and up
<div className="block md:hidden" />  // Show only on mobile
```

---

## Dark Mode

```tsx
// ✅ Dark mode classes (always active)
<div className="bg-gray-900 text-gray-100" />

// ✅ Dark surfaces
<div className="bg-gray-950" />  // Darkest
<div className="bg-gray-900" />  // Dark
<div className="bg-gray-800" />  // Medium dark

// ✅ Dark borders
<div className="border border-gray-800" />
<div className="border border-white/10" />

// ✅ Dark text
<p className="text-gray-100" />   // Primary text
<p className="text-gray-400" />   // Secondary text
<p className="text-gray-600" />   // Muted text

// ❌ Don't use light mode classes
<div className="bg-white text-black" />  // ❌ Wrong for dark mode
```

---

## Spacing & Layout

```tsx
// ✅ Consistent spacing scale
<div className="p-4" />   // 16px padding
<div className="p-6" />   // 24px padding
<div className="p-8" />   // 32px padding

// ✅ Flex layouts
<div className="flex items-center justify-between gap-4" />

// ✅ Grid layouts
<div className="grid grid-cols-3 gap-4" />

// ✅ Container with max width
<div className="container mx-auto max-w-7xl px-4" />

// ✅ Aspect ratios
<div className="aspect-square" />   // 1:1
<div className="aspect-video" />    // 16:9
```

---

## Typography

```tsx
// ✅ Text sizes (dark mode optimized)
<h1 className="text-4xl font-bold text-gray-100" />
<h2 className="text-3xl font-semibold text-gray-100" />
<h3 className="text-2xl font-semibold text-gray-200" />
<p className="text-base text-gray-300" />
<span className="text-sm text-gray-400" />

// ✅ Font weights
font-normal    // 400
font-medium    // 500
font-semibold  // 600
font-bold      // 700

// ✅ Line height
leading-none    // 1
leading-tight   // 1.25
leading-normal  // 1.5
leading-relaxed // 1.625

// ✅ Letter spacing
tracking-tight   // -0.025em
tracking-normal  // 0
tracking-wide    // 0.025em

// ✅ Text overflow
<p className="truncate" />           // Single line ellipsis
<p className="line-clamp-2" />       // Two lines with ellipsis
```

---

## Colors (Dark Theme)

```tsx
// ✅ Background colors
bg - gray - 950; // Deep dark
bg - gray - 900; // Dark
bg - gray - 800; // Medium dark

// ✅ Border colors
border - gray - 800;
border - gray - 700;
border - white / 10;

// ✅ Text colors
text - gray - 100; // Primary
text - gray - 300; // Secondary
text - gray - 500; // Muted

// ✅ Accent colors (use sparingly)
text - blue - 500;
bg - blue - 500;
border - blue - 500;

// ✅ Status colors
text - green - 500; // Success
text - yellow - 500; // Warning
text - red - 500; // Error
```

---

## Animations

```tsx
// ✅ Transitions
<button className="transition-colors duration-200" />
<div className="transition-all duration-300" />

// ✅ Hover states
<button className="hover:bg-gray-800 hover:scale-105 transition" />

// ✅ Focus states
<input className="focus:ring-2 focus:ring-blue-500 focus:outline-none" />

// ✅ Active states
<button className="active:scale-95 transition" />

// ✅ Built-in animations
animate-spin      // Loading spinners
animate-pulse     // Skeleton loaders
animate-bounce    // Attention grabbers
animate-ping      // Notification badges

// ✅ Custom animations (define in globals.css)
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

---

## shadcn/ui Integration

```tsx
// ✅ Use shadcn/ui components
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

<Button variant="default">Click me</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Close</Button>

// ✅ Customize via className
<Button className="w-full md:w-auto" variant="default">
  Submit
</Button>

// ✅ Combine with other Tailwind classes
<Input className="max-w-sm" placeholder="Search..." />
```

---

## Component Patterns

```tsx
// ✅ Card component pattern
<div className={cn(
  "rounded-lg border bg-gray-900 p-6",
  "border-gray-800",
  "shadow-lg"
)}>
  <h3 className="text-xl font-semibold text-gray-100">Title</h3>
  <p className="text-gray-400 mt-2">Description</p>
</div>

// ✅ Button variants
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-800 hover:bg-gray-700 text-gray-100",
  ghost: "hover:bg-gray-800 text-gray-300"
}

<button className={cn(
  "px-4 py-2 rounded-md transition",
  buttonVariants.primary
)}>
  Button
</button>

// ✅ Input with icon
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
  <input className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-md" />
</div>
```

---

## Accessibility

```tsx
// ✅ Focus visible
<button className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" />

// ✅ Screen reader only
<span className="sr-only">Close menu</span>

// ✅ Proper contrast (dark mode)
// Text on dark backgrounds: Use gray-100 to gray-300
// Interactive elements: Ensure 4.5:1 contrast ratio

// ✅ Keyboard navigation
<button className="focus:ring-2 focus:ring-blue-500" />

// ✅ ARIA attributes
<button aria-label="Close dialog" aria-expanded={isOpen}>
  <XIcon />
</button>
```

---

## Performance

```tsx
// ✅ Avoid deeply nested Tailwind classes
// Use component classes in globals.css for repeated patterns

/* globals.css */
@layer components {
  .card {
    @apply rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-lg;
  }

  .btn-primary {
    @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition;
  }
}

// Usage
<div className="card">Content</div>
<button className="btn-primary">Click</button>

// ✅ Group related utilities
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing
  "p-4 gap-4",
  // Appearance
  "bg-gray-900 border border-gray-800 rounded-lg"
)} />
```

---

## Common Pitfalls

| ❌ Avoid                 | ✅ Use Instead                 |
| ------------------------ | ------------------------------ |
| Inline styles            | Tailwind utilities             |
| Desktop-first responsive | Mobile-first responsive        |
| Light mode classes       | Dark mode classes              |
| Hardcoded colors         | Design system colors           |
| px values in arbitrary   | Tailwind spacing scale         |
| Inconsistent spacing     | Consistent scale (4, 6, 8, 12) |
| No focus states          | Proper focus-visible           |
| Generic class names      | Descriptive utilities          |

---

## Quick Checklist

- [ ] No inline styles (`style={{}}`)
- [ ] Mobile-first responsive
- [ ] Dark mode colors only
- [ ] Proper focus states
- [ ] Consistent spacing scale
- [ ] shadcn/ui for primitives
- [ ] cn() for conditional classes
- [ ] Accessible contrast ratios
- [ ] Smooth transitions on interactions
- [ ] Proper hover/active states

---

**Apply these styling rules to all components. Maintain consistency and accessibility across the entire application.**
