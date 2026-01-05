# Naming Conventions Prompt

> **Strict naming conventions for consistent, maintainable code.**

---

## Files & Components

| Type                 | Convention                               | Example                                                          |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| **React Components** | `PascalCase.tsx`                         | `UserProfile.tsx` → `export default function UserProfile()`      |
| **Hooks**            | `use-kebab-case.ts` → `useKebabCase()`   | `use-media-query.ts` → `export function useMediaQuery()`         |
| **Utils & Logic**    | `kebab-case.ts` (functions: `camelCase`) | `format-date.ts` → `formatDate()`, `parseDate()`                 |
| **UI Primitives**    | `kebab-case.tsx` → `PascalCase`          | `button.tsx` → `export function Button()`                        |
| **Contexts**         | `PascalCase.tsx` + `Context` suffix      | `AuthContext.tsx` → `AuthContext`, `AuthProvider`                |
| **Stores (Zustand)** | `use-kebab-case-store.ts`                | `use-auth-store.ts` → `useAuthStore()`                           |
| **Next.js Special**  | `lowercase` (enforced)                   | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` |
| **Tests**            | Match source + `.test`/`.spec`           | `UserProfile.test.tsx`, `use-auth.test.ts`                       |

---

## Code Elements

| Type                      | Convention                                         | Example                                            |
| ------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| **Types/Interfaces**      | `PascalCase`                                       | `UserProfile`, `ApiResponse`, `FileMetadata`       |
| **Enums**                 | Name: `PascalCase`, Values: `SCREAMING_SNAKE_CASE` | `enum Status { PENDING = 'PENDING' }`              |
| **Constants**             | `SCREAMING_SNAKE_CASE`                             | `API_BASE_URL`, `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT` |
| **Variables/Functions**   | `camelCase`                                        | `userName`, `handleClick()`, `fetchUserData()`     |
| **Environment Variables** | `SCREAMING_SNAKE_CASE`                             | `NEXT_PUBLIC_API_URL`, `DATABASE_URL`              |

---

## Directories & Assets

| Type              | Convention   | Example                                                 |
| ----------------- | ------------ | ------------------------------------------------------- |
| **Folders**       | `kebab-case` | `components/`, `api-helpers/`, `error-boundaries/`      |
| **Public Assets** | `kebab-case` | `logo-dark.svg`, `hero-image.jpg`                       |
| **CSS Files**     | `kebab-case` | `globals.css`, `button-styles.module.css`               |
| **Config Files**  | `kebab-case` | `next.config.js`, `tailwind.config.ts`, `tsconfig.json` |

---

## Project Structure Example

```
project/
├── app/
│   ├── page.tsx                    # Next.js (lowercase)
│   └── layout.tsx
├── components/
│   ├── Header.tsx                  # Component (PascalCase)
│   ├── FileTransferArea.tsx
│   └── ui/
│       ├── button.tsx              # Primitive (kebab → Pascal)
│       └── dialog.tsx
├── hooks/
│   ├── use-auth.ts                 # Hook (kebab → camel)
│   └── use-media-query.ts
├── utils/
│   ├── format-date.ts              # Util (kebab → camel)
│   └── api-helpers.ts
├── lib/
│   ├── constants.ts                # SCREAMING_SNAKE_CASE
│   └── types.ts                    # PascalCase
├── store/
│   └── use-auth-store.ts           # Store (kebab → camel)
├── contexts/
│   └── AuthContext.tsx             # Context (PascalCase)
├── styles/
│   └── globals.css                 # Style (kebab-case)
├── public/
│   └── logo-dark.svg               # Asset (kebab-case)
└── __tests__/
    └── UserProfile.test.tsx        # Test (match source)
```

---

## Common Mistakes

```typescript
// ❌ Component with kebab-case file
user-profile.tsx

// ❌ Hook with PascalCase
UseAuth.ts

// ❌ Hook function not camelCase
use_auth() or use-auth()

// ❌ Constant in camelCase
const apiBaseUrl = '...'

// ❌ Enum values not SCREAMING_SNAKE_CASE
enum Status { pending = 'pending' }

// ❌ Next.js file with wrong case
Page.tsx (should be page.tsx)
```

---

## Quick Rules

**File names determine internal naming:**

- `UserProfile.tsx` → Component must be `UserProfile`
- `use-auth.ts` → Hook must be `useAuth()`
- `button.tsx` → Component must be `Button`
- `format-date.ts` → Function should be `formatDate()`

**Case usage:**

- `PascalCase`: Components, Types, Interfaces, Contexts
- `camelCase`: Functions, Variables, Hook functions
- `kebab-case`: Files (hooks, utils, primitives, assets, folders)
- `SCREAMING_SNAKE_CASE`: Constants, Enum values, Env vars
- `lowercase`: Next.js special files only
