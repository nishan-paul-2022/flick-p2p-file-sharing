# Development Prompt System

A comprehensive, modular prompt system for building high-quality TypeScript + React + Next.js applications with Tailwind CSS, shadcn/ui, Lucide icons, and Zustand.

---

## 📚 Quick Start

1. **Start with** `00-overview.md` to understand the system structure
2. **Reference specific documents** based on your task (see matrix below)
3. **Apply all core principles** from the overview
4. **Cross-reference** related documents for comprehensive guidance

---

## 📖 Document Index

| #      | Document                                     | Purpose                                                    |
| ------ | -------------------------------------------- | ---------------------------------------------------------- |
| **00** | [Overview](./00-overview.md)                 | System structure, usage guide, and core principles         |
| **01** | [Conventions](./01-conventions.md)           | Naming standards for files, components, and code           |
| **02** | [TypeScript](./02-typescript.md)             | Type safety rules and TypeScript patterns                  |
| **03** | [React](./03-react.md)                       | React code quality and component structure                 |
| **04** | [React Patterns](./04-react-patterns.md)     | Structural solutions (hooks, context, compound components) |
| **05** | [Next.js](./05-nextjs.md)                    | Next.js framework-specific best practices                  |
| **06** | [Styling](./06-styling.md)                   | Tailwind CSS, shadcn/ui, Lucide icons, design system       |
| **07** | [State Management](./07-state-management.md) | Zustand patterns and global state management               |
| **08** | [Refactoring](./08-refactoring.md)           | Code cleanup and optimization checklist                    |

---

## 🎯 Usage Matrix

| Task                 | Primary Documents     | Secondary Documents           |
| -------------------- | --------------------- | ----------------------------- |
| **New Component**    | 03-react, 06-styling  | 01-conventions, 02-typescript |
| **New Page**         | 05-nextjs, 06-styling | 03-react, 01-conventions      |
| **Custom Hook**      | 04-react-patterns     | 02-typescript, 01-conventions |
| **API Route**        | 05-nextjs             | 02-typescript                 |
| **Zustand Store**    | 07-state-management   | 02-typescript, 01-conventions |
| **UI Styling**       | 06-styling            | 01-conventions                |
| **Refactoring**      | 08-refactoring        | All documents                 |
| **Type Definitions** | 02-typescript         | 01-conventions                |

---

## 🛠️ Tech Stack

- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **State**: Zustand
- **Design**: Dark mode, mobile-first responsive

---

## ✨ Core Principles

1. **Type Safety First** - No `any`, explicit types, strict mode
2. **Server Components Default** - Client only for interactivity
3. **Mobile-First Responsive** - Start mobile, scale up
4. **Dark Mode Only** - Exclusive dark theme design
5. **Performance Critical** - Optimized, lazy-loaded
6. **Consistent Naming** - Follow conventions strictly
7. **Clean Code** - No unused code, clear structure
8. **shadcn/ui Components** - For all UI primitives
9. **Accessibility** - ARIA, keyboard nav, contrast
10. **Path Aliases** - `@/` for all imports

---

## 📋 Integration Checklist

Before completing any task:

- [ ] Follows naming conventions (01-conventions)
- [ ] TypeScript strict mode, no `any`
- [ ] Server Components by default
- [ ] Mobile-first responsive design
- [ ] Dark mode styling
- [ ] Uses shadcn/ui for UI primitives
- [ ] Path aliases (`@/`) for imports
- [ ] Error handling and loading states
- [ ] Accessibility attributes
- [ ] No inline styles, Tailwind only
- [ ] Clean code, no unused imports

---

## 🔄 How to Use

### For AI/LLM Context

Provide the relevant documents as context based on the task:

```
For new feature: Include 00, 01, 02, 03, 04, 05, 06, 07
For new component: Include 00, 01, 03, 06
For refactoring: Include 00, 08, and all others
For styling: Include 00, 01, 06
For state management: Include 00, 04, 07, 02
```

### For Human Developers

1. Read `00-overview.md` first
2. Bookmark documents relevant to your work
3. Reference during code reviews
4. Use as onboarding material for new team members

---

## 🎨 Design Philosophy

- **Modular**: Each document focuses on one concern
- **Project-Agnostic**: Works for any project with this tech stack
- **Comprehensive**: Covers all aspects of development
- **Practical**: Real examples, not just theory
- **Consistent**: All documents follow same structure

---

## 📝 Document Structure

Each document follows this structure:

1. **Header** - Title and description
2. **Core Rules** - Essential principles
3. **Examples** - ✅ Good vs ❌ Bad patterns
4. **Patterns** - Common solutions
5. **Checklist** - Quick verification

---

## 🚀 Benefits

- **Consistency** - Same patterns across entire codebase
- **Quality** - Industry best practices built-in
- **Speed** - Quick reference for common tasks
- **Onboarding** - New developers get up to speed faster
- **Maintainability** - Clean, well-structured code
- **Scalability** - Patterns that grow with your project

---

## 🔧 Customization

These prompts are designed to be project-agnostic. To customize:

1. Fork/copy the documents
2. Adjust core principles in `00-overview.md`
3. Modify specific rules in individual documents
4. Keep the overall structure intact

---

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Lucide Icons](https://lucide.dev/)

---

## 🤝 Contributing

To improve this prompt system:

1. Identify gaps or inconsistencies
2. Propose changes with clear rationale
3. Ensure changes align with core principles
4. Update relevant documents
5. Test with real-world scenarios

---

**This prompt system is designed to work as a unified whole. Apply all principles together for consistent, high-quality code.**
