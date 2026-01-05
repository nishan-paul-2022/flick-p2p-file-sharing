# Complete AI Prompt System

## Tech Stack

TypeScript, React, Next.js, Tailwind CSS, shadcn/ui, Lucide Icons, Zustand

## Design Requirements

- Dark mode only
- Fully responsive (mobile-first)
- Modern, premium aesthetic
- High performance

---

## Document Structure

Use these prompts together for comprehensive code generation:

### 1. **CONVENTIONS.md**

Naming standards for all files, components, and code elements.

### 2. **TYPESCRIPT.md**

Type safety rules and TypeScript patterns.

### 3. **REACT_BEST_PRACTICES.md**

React code quality guidelines and component structure.

### 4. **REACT_PATTERNS.md**

React structural solutions (Custom Hooks, Compound Components, etc.).

### 5. **NEXTJS_BEST_PRACTICES.md**

Next.js framework-specific practices (Server/Client Components, routing, etc.).

### 6. **STYLING.md**

Tailwind CSS, design system, and styling conventions.

### 7. **REFACTOR.md**

Code refactoring checklist and cleanup guidelines.

---

## How to Use

**For New Features:**
Reference: CONVENTIONS + TYPESCRIPT + REACT_BEST_PRACTICES + REACT_PATTERNS + NEXTJS_BEST_PRACTICES + STYLING

**For Refactoring:**
Reference: REFACTOR + All above documents

**For UI Components:**
Reference: CONVENTIONS + REACT_BEST_PRACTICES + STYLING

**For State Management:**
Reference: REACT_PATTERNS (Provider, Custom Hooks) + TYPESCRIPT

---

## Core Principles (All Documents)

1. **Type Safety First** - TypeScript strict mode, no `any`
2. **Server Components Default** - Client components only when needed
3. **Mobile-First Responsive** - Start mobile, scale up
4. **Dark Mode Only** - Design for dark theme
5. **Performance Critical** - Fast, optimized, accessible
6. **Consistent Naming** - Follow conventions strictly
7. **Clean Code** - Remove unused code, clear structure
8. **shadcn/ui Components** - Use for all UI primitives

---

## Quick Reference Matrix

| Task             | Primary Docs                  | Secondary Docs                |
| ---------------- | ----------------------------- | ----------------------------- |
| New Component    | REACT_BEST_PRACTICES, STYLING | CONVENTIONS, TYPESCRIPT       |
| Custom Hook      | REACT_PATTERNS                | TYPESCRIPT, CONVENTIONS       |
| New Page         | NEXTJS_BEST_PRACTICES         | STYLING, REACT_BEST_PRACTICES |
| API Route        | NEXTJS_BEST_PRACTICES         | TYPESCRIPT                    |
| Refactoring      | REFACTOR                      | All documents                 |
| Type Definitions | TYPESCRIPT                    | CONVENTIONS                   |
| State Management | REACT_PATTERNS (Provider)     | TYPESCRIPT                    |
| Styling          | STYLING                       | CONVENTIONS                   |

---

**Apply all principles together. These documents are designed to work as a unified system.**
