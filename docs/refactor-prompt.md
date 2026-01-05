# Refactoring Prompt

**Role**: You are an expert Full Stack Engineer specializing in TypeScript, React, Next.js, and Modern Web Architecture.

**Task**: Refactor the **entire codebase**, examining every single file and every single line of code to adhere to the highest industry standards and best practices.

**Guidelines**:

1.  **Orphan & Unused Code**:
    - Identify and remove all **orphan code**: unused components, functions, variables, types, or imports.
    - Clean up any files that are no longer referenced or necessary for the application.
2.  **Comments & Documentation**:
    - Remove all unnecessary, noisy, or "commented-out" code.
    - Retain or add only high-quality, industry-standard comments (e.g., JSDoc for complex logic, explaining _why_ instead of _what_).
3.  **TypeScript Best Practices**:
    - Ensure strict type safety across the entire project; avoid the usage of `any`.
    - Use interfaces or types appropriately for data structures.
    - Utilize advanced TypeScript features like Discriminated Unions and Utility Types where applicable.
    - Ensure proper error handling and type narrowing.
4.  **React Best Practices**:
    - Follow the Rules of Hooks strictly.
    - Use functional components with proper memoization (`useMemo`, `useCallback`) when dealing with expensive computations or preventing unnecessary re-renders.
    - Adhere to the Single Responsibility Principle: keep components small and focused.
    - Implement proper prop-drilling alternatives (Context API or State Management) when necessary.
5.  **Next.js Best Practices**:
    - Use Server Components by default for better performance and SEO.
    - Mark components with `"use client"` only when interactive features or browser APIs are required.
    - Leverage Next.js App Router features like Layouts, Loading, and Error boundaries.
    - Optimize images and fonts using Next.js built-in components.
6.  **CSS & Tailwind CSS**:
    - Use Tailwind CSS for all styling; avoid inline styles.
    - Use the `cn` utility (clsx + tailwind-merge) for dynamic class merging.
7.  **shadcn/ui**:
    - Standardize UI elements using shadcn/ui components.
    - Ensure high accessibility (a11y) standards by following Radix UI patterns.
    - Customize shadcn components via `tailwind.config.ts` rather than overriding with ad-hoc classes where possible.
8.  **Logic & Redundancy**:
    - Eliminate redundant code and consolidate duplicate logic into reusable hooks or utility functions.
    - Ensure imports use **path aliases** (e.g., `@/components/...`, `@/lib/...`, `@/hooks/...`) as defined in `tsconfig.json`.
    - Follow strict **naming conventions**:
        - **React Components**: `PascalCase.tsx`
        - **Hooks & Logic Files**: `kebab-case.ts`
        - **UI Primitives (shadcn/ui style)**: `kebab-case.tsx`
        - **Public Assets**: `kebab-case`
        - **Types & Interfaces**: `PascalCase`
        - **Variables & Functions**: `camelCase`

**Output**: Provide a comprehensive refactoring of the codebase with a clear summary of all changes, removals, and optimizations performed.
