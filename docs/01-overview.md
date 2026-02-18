# Development Prompt System - Overview

> **Comprehensive prompt system for TypeScript + React + Next.js + Tailwind CSS + shadcn/ui + Zustand applications**

---

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand
- **Design**: Dark mode, fully responsive (mobile-first)

---

## Document Structure

| Document                   | Purpose                                                   | When to Use                |
| -------------------------- | --------------------------------------------------------- | -------------------------- |
| **02-conventions.md**      | Naming standards for files, components, and code elements | All development tasks      |
| **03-typescript.md**       | Type safety rules and TypeScript patterns                 | All TypeScript code        |
| **04-react.md**            | React code quality guidelines and component structure     | All React components       |
| **05-react-patterns.md**   | React structural solutions (hooks, context, etc.)         | Complex component logic    |
| **06-nextjs.md**           | Next.js framework-specific practices                      | Pages, layouts, API routes |
| **07-styling.md**          | Tailwind CSS, design system, and styling conventions      | All UI components          |
| **08-state-management.md** | Zustand patterns and state management                     | Global/shared state        |
| **09-refactoring.md**      | Code refactoring checklist and cleanup guidelines         | Code cleanup tasks         |

---

## Quick Reference Matrix

| Task             | Primary Docs                           | Secondary Docs                |
| ---------------- | -------------------------------------- | ----------------------------- |
| New Component    | 04-react, 07-styling                   | 02-conventions, 03-typescript |
| Custom Hook      | 05-react-patterns                      | 03-typescript, 02-conventions |
| New Page         | 06-nextjs                              | 07-styling, 04-react          |
| API Route        | 06-nextjs                              | 03-typescript                 |
| Zustand Store    | 08-state-management                    | 03-typescript, 02-conventions |
| Refactoring      | 09-refactoring                         | All documents                 |
| Type Definitions | 03-typescript                          | 02-conventions                |
| State Management | 08-state-management, 05-react-patterns | 03-typescript                 |
| Styling          | 07-styling                             | 02-conventions                |
| Form Handling    | 04-react, 06-nextjs                    | 03-typescript                 |

---

## Integration Checklist

Before considering any task complete, verify:

- [ ] **Type Safety** - TypeScript strict mode enabled, no `any` types, explicit type annotations
- [ ] **Server Components** - Using Server Components by default, Client components only when needed (state, effects, browser APIs)
- [ ] **Mobile-First** - Responsive design starting from mobile, scaling up with breakpoints
- [ ] **Dark Mode** - Designed exclusively for dark theme
- [ ] **Performance** - Code is optimized, fast, and lazy-loaded where appropriate
- [ ] **Naming Conventions** - All files, components, and variables follow conventions from `02-conventions`
- [ ] **Clean Code** - No unused code, clear structure, meaningful names
- [ ] **shadcn/ui** - Using shadcn/ui components for all UI primitives (buttons, inputs, dialogs, etc.)
- [ ] **Accessibility** - ARIA labels, keyboard navigation, proper contrast ratios
- [ ] **Path Aliases** - Using `@/` for all imports, no relative paths

---

## How to Use This System

1. **Read this overview** to understand the structure
2. **Reference specific documents** based on your task (see Quick Reference Matrix)
3. **Follow the Integration Checklist** to ensure all standards are met
4. **Cross-reference** related documents for comprehensive guidance
5. **Verify completeness** before considering any task done

---

**These documents are designed to work as a unified system. Apply all principles together for consistent, high-quality code.**
