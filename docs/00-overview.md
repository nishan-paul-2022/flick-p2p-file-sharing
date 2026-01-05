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

This prompt system consists of modular documents that work together as a unified system:

### Core Documents

| Document                   | Purpose                                                   | When to Use                |
| -------------------------- | --------------------------------------------------------- | -------------------------- |
| **01-conventions.md**      | Naming standards for files, components, and code elements | All development tasks      |
| **02-typescript.md**       | Type safety rules and TypeScript patterns                 | All TypeScript code        |
| **03-react.md**            | React code quality guidelines and component structure     | All React components       |
| **04-react-patterns.md**   | React structural solutions (hooks, context, etc.)         | Complex component logic    |
| **05-nextjs.md**           | Next.js framework-specific practices                      | Pages, layouts, API routes |
| **06-styling.md**          | Tailwind CSS, design system, and styling conventions      | All UI components          |
| **07-state-management.md** | Zustand patterns and state management                     | Global/shared state        |
| **08-refactoring.md**      | Code refactoring checklist and cleanup guidelines         | Code cleanup tasks         |

---

## Usage Guide

### For New Features

**Reference**: `01-conventions` + `02-typescript` + `03-react` + `04-react-patterns` + `05-nextjs` + `06-styling` + `07-state-management`

### For New Components

**Reference**: `01-conventions` + `03-react` + `06-styling`

### For New Pages/Routes

**Reference**: `01-conventions` + `05-nextjs` + `06-styling`

### For State Management

**Reference**: `04-react-patterns` + `07-state-management` + `02-typescript`

### For Refactoring

**Reference**: `08-refactoring` + All other documents

### For Styling/UI

**Reference**: `06-styling` + `01-conventions`

---

## Core Principles (Apply to All Code)

1. **Type Safety First** - TypeScript strict mode, no `any`, explicit types
2. **Server Components Default** - Client components only when needed (state, effects, browser APIs)
3. **Mobile-First Responsive** - Start mobile, scale up with breakpoints
4. **Dark Mode Only** - Design exclusively for dark theme
5. **Performance Critical** - Fast, optimized, lazy-loaded where appropriate
6. **Consistent Naming** - Follow conventions strictly across all files
7. **Clean Code** - Remove unused code, clear structure, meaningful names
8. **shadcn/ui Components** - Use for all UI primitives (buttons, inputs, dialogs, etc.)
9. **Accessibility** - ARIA labels, keyboard navigation, proper contrast
10. **Path Aliases** - Use `@/` for all imports, no relative paths

---

## Quick Reference Matrix

| Task             | Primary Docs                           | Secondary Docs                |
| ---------------- | -------------------------------------- | ----------------------------- |
| New Component    | 03-react, 06-styling                   | 01-conventions, 02-typescript |
| Custom Hook      | 04-react-patterns                      | 02-typescript, 01-conventions |
| New Page         | 05-nextjs                              | 06-styling, 03-react          |
| API Route        | 05-nextjs                              | 02-typescript                 |
| Zustand Store    | 07-state-management                    | 02-typescript, 01-conventions |
| Refactoring      | 08-refactoring                         | All documents                 |
| Type Definitions | 02-typescript                          | 01-conventions                |
| State Management | 07-state-management, 04-react-patterns | 02-typescript                 |
| Styling          | 06-styling                             | 01-conventions                |
| Form Handling    | 03-react, 05-nextjs                    | 02-typescript                 |

---

## Integration Checklist

Before considering any task complete:

- [ ] Follows naming conventions from `01-conventions`
- [ ] TypeScript strict mode with no `any` types
- [ ] Server Components by default, Client only when necessary
- [ ] Mobile-first responsive design
- [ ] Dark mode styling
- [ ] Uses shadcn/ui for UI primitives
- [ ] Path aliases (`@/`) for all imports
- [ ] Proper error handling and loading states
- [ ] Accessibility attributes (ARIA, keyboard navigation)
- [ ] No inline styles, Tailwind utilities only
- [ ] Clean, documented code with no unused imports/variables

---

## How to Use This System

1. **Read this overview** to understand the structure
2. **Reference specific documents** based on your task (see Quick Reference Matrix)
3. **Apply all core principles** regardless of which documents you're using
4. **Cross-reference** related documents for comprehensive guidance
5. **Use the checklist** to verify completeness

---

**These documents are designed to work as a unified system. Apply all principles together for consistent, high-quality code.**
