# Refactoring Prompt

Comprehensive code cleanup and optimization checklist.

---

## Refactoring Role

**You are:** Expert Full-Stack Engineer specializing in TypeScript, React, Next.js, and modern web architecture.

**Task:** Refactor codebase to adhere to industry standards and best practices.

---

## Refactoring Checklist

### 1. Remove Unused Code

**Orphan Components**

- [ ] Remove unused React components
- [ ] Remove unused UI primitives
- [ ] Remove unused layout components

**Dead Functions**

- [ ] Remove unused utility functions
- [ ] Remove unused helper functions
- [ ] Remove unused event handlers

**Unused Imports**

- [ ] Remove unused import statements
- [ ] Remove unused type imports
- [ ] Remove unused library imports

**Unused Types**

- [ ] Remove unused TypeScript interfaces
- [ ] Remove unused type aliases
- [ ] Remove unused enums

**Unused Variables**

- [ ] Remove unused constants
- [ ] Remove unused local variables
- [ ] Remove unused state variables

---

### 2. Clean Up Comments

**Remove:**

- [ ] Commented-out code blocks
- [ ] Noisy/obvious comments ("increment counter")
- [ ] Outdated TODO comments
- [ ] Debugging console.logs

**Keep:**

- [ ] JSDoc for complex functions
- [ ] Explanation of "why" not "what"
- [ ] Important business logic context
- [ ] Complex algorithm explanations

```tsx
// ❌ Remove noisy comments
// This function adds two numbers
function add(a: number, b: number) {
    return a + b; // Return the sum
}

// ✅ Keep meaningful comments
/**
 * Calculates discounted price using tiered pricing model
 * Tier 1: 0-10 items = 0% discount
 * Tier 2: 11-50 items = 10% discount
 * Tier 3: 51+ items = 20% discount
 */
function calculateDiscountedPrice(quantity: number, unitPrice: number): number {
    // Complex business logic...
}
```

---

### 3. Consolidate Duplicate Logic

**Extract to Custom Hooks**

- [ ] Duplicate useState/useEffect patterns
- [ ] Repeated data fetching logic
- [ ] Shared form handling
- [ ] Common side effects

```tsx
// ❌ Duplicate logic in multiple components
function ComponentA() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);
}

function ComponentB() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);
}

// ✅ Extract to custom hook
function useData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}
```

**Extract to Utility Functions**

- [ ] Duplicate formatting logic
- [ ] Repeated calculations
- [ ] Common transformations
- [ ] Shared validation

```tsx
// ❌ Duplicate formatting
const date1 = new Date().toLocaleDateString('en-US');
const date2 = new Date().toLocaleDateString('en-US');

// ✅ Extract to utility
// utils/format-date.ts
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US');
}
```

---

### 4. Standardize UI Components

**shadcn/ui Migration**

- [ ] Replace custom buttons with shadcn/ui Button
- [ ] Replace custom inputs with shadcn/ui Input
- [ ] Replace custom dialogs with shadcn/ui Dialog
- [ ] Replace custom dropdowns with shadcn/ui Select
- [ ] Use shadcn/ui for all form elements

**Accessibility**

- [ ] Add ARIA labels where missing
- [ ] Ensure keyboard navigation works
- [ ] Add focus-visible states
- [ ] Ensure proper contrast ratios
- [ ] Add screen reader support

```tsx
// ❌ Custom button without accessibility
<button onClick={handleClick}>Click me</button>;

// ✅ shadcn/ui Button with accessibility
import { Button } from '@/components/ui/button';

<Button onClick={handleClick} aria-label="Submit form">
    Click me
</Button>;
```

---

### 5. Fix Import Paths

**Use Path Aliases**

- [ ] Replace relative imports with `@/` aliases
- [ ] Consistent import ordering
- [ ] Group imports logically

```tsx
// ❌ Relative imports
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../hooks/use-auth';
import { formatDate } from '../../../utils/format-date';

// ✅ Path aliases
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/utils/format-date';

// ✅ Import ordering
// 1. External libraries
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal aliases
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/utils/format-date';

// 3. Types
import type { User } from '@/lib/types';
```

---

### 6. Optimize Performance

**Component Optimization**

- [ ] Add React.memo for expensive components
- [ ] Use useMemo for expensive calculations
- [ ] Use useCallback for stable callbacks
- [ ] Split large components into smaller ones

**Code Splitting**

- [ ] Lazy load heavy components
- [ ] Dynamic imports for routes
- [ ] Suspend non-critical content

**Image Optimization**

- [ ] Replace `<img>` with `<Image>` from next/image
- [ ] Add proper width/height
- [ ] Use priority for above-fold images

```tsx
// ❌ No optimization
function ExpensiveList({ items }) {
  return <div>{items.map(...)}</div>
}

// ✅ With optimization
import { memo } from 'react'

export const ExpensiveList = memo(function ExpensiveList({ items }) {
  return <div>{items.map(...)}</div>
})
```

---

### 7. Type Safety Improvements

**Add Missing Types**

- [ ] Type all function parameters
- [ ] Type all function returns
- [ ] Type all component props
- [ ] Type all state variables

**Remove `any`**

- [ ] Replace `any` with `unknown`
- [ ] Add proper type guards
- [ ] Use discriminated unions

**Improve Type Inference**

- [ ] Use `as const` for literals
- [ ] Use proper generic constraints
- [ ] Leverage utility types

```tsx
// ❌ Missing types
function processData(data) {
    return data.map((item) => item.value);
}

// ✅ Proper types
function processData(data: Array<{ value: number }>): number[] {
    return data.map((item) => item.value);
}
```

---

### 8. Error Handling

**Add Error Boundaries**

- [ ] Wrap major sections in error boundaries
- [ ] Add error.tsx files in Next.js routes
- [ ] Show user-friendly error messages

**Add Try-Catch**

- [ ] Wrap async operations
- [ ] Handle fetch errors
- [ ] Provide fallback values

```tsx
// ❌ No error handling
async function fetchData() {
    const res = await fetch('/api/data');
    return res.json();
}

// ✅ With error handling
async function fetchData(): Promise<
    { success: true; data: Data } | { success: false; error: string }
> {
    try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

### 9. Code Structure

**Component Organization**

- [ ] Group related components in folders
- [ ] Colocate component-specific files
- [ ] Consistent file structure

**Separation of Concerns**

- [ ] Extract business logic from UI
- [ ] Use Container/Presentational pattern for complex components
- [ ] Keep components focused and small

---

### 10. Documentation

**Add JSDoc**

- [ ] Document complex functions
- [ ] Document public APIs
- [ ] Document business logic

**Update README**

- [ ] Document project setup
- [ ] Document folder structure
- [ ] Document scripts and commands

---

## Refactoring Process

1. **Analyze** - Read entire codebase, identify issues
2. **Plan** - Prioritize refactoring tasks
3. **Execute** - Make changes systematically
4. **Test** - Verify nothing breaks
5. **Document** - Update documentation

---

## Output Format

Provide:

1. **Summary** - Overview of all changes
2. **Removed** - List of deleted files/code
3. **Added** - List of new files/utilities
4. **Modified** - List of improved files
5. **Optimizations** - Performance improvements made
6. **Breaking Changes** - Any API changes (if applicable)

---

## Quality Gates

Before finishing refactoring:

- [ ] All TypeScript errors resolved
- [ ] No ESLint warnings
- [ ] All imports use path aliases
- [ ] No unused variables/imports
- [ ] All components follow naming conventions
- [ ] shadcn/ui used for all UI primitives
- [ ] Proper error handling everywhere
- [ ] Loading states for async operations
- [ ] Accessibility standards met
- [ ] Mobile responsive verified

---

**Refactor systematically. Prioritize type safety, performance, and maintainability.**
