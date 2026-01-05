# TypeScript Best Practices Prompt

Strict TypeScript rules for type-safe code.

---

## Core Rules

1. **Never use `any`** - Use `unknown` and narrow with type guards
2. **Prefer `interface` for objects** - Use `type` for unions/intersections/primitives
3. **Explicit return types** - Required for all exported functions
4. **Handle null/undefined** - Use `?.` and `??` operators
5. **Type inference** - Let TypeScript infer obvious types (primitives, simple returns)
6. **No non-null assertions** - Avoid `!` operator unless absolutely certain

---

## Type Definitions

```typescript
// Interface for objects (extensible)
interface User {
    id: string;
    name: string;
    email?: string; // Optional with ?
    readonly createdAt: Date; // Readonly
}

// Type for unions, intersections, literals
type Status = 'pending' | 'active' | 'inactive';
type ID = string | number;
type Combined = User & { role: string };

// Const assertions for literals
const STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
} as const;
```

---

## Functions

```typescript
// Explicit return types for exports
export function calculate(a: number, b: number): number {
    return a + b;
}

// Generics for reusable logic
function filter<T>(array: T[], fn: (item: T) => boolean): T[] {
    return array.filter(fn);
}

// React event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};
```

---

## Type Safety

```typescript
// Use unknown, not any
function process(data: unknown) {
    if (typeof data === 'string') {
        return data.toUpperCase();
    }
}

// Type guards
function isUser(obj: unknown): obj is User {
    return typeof obj === 'object' && obj !== null && 'id' in obj;
}

// Discriminated unions
type Result = { status: 'success'; data: User } | { status: 'error'; error: string };

// Null safety
const name = user?.profile?.name ?? 'Anonymous';
```

---

## Utility Types

```typescript
Partial<T>; // All properties optional
Required<T>; // All properties required
Readonly<T>; // All properties readonly
Pick<T, K>; // Select specific properties
Omit<T, K>; // Exclude properties
Record<K, T>; // Key-value mapping
ReturnType<T>; // Extract function return type
```

---

## React

```typescript
// Component props
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  children?: React.ReactNode
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}

// Hooks
const [user, setUser] = useState<User | null>(null)
const inputRef = useRef<HTMLInputElement>(null)

// Reducer with discriminated unions
type Action =
  | { type: 'increment' }
  | { type: 'set'; payload: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 }
    case 'set': return { count: action.payload }
  }
}

// Context
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be within AuthProvider')
  return context
}
```

---

## API Types

```typescript
// Response types with discriminated unions
type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

async function fetchUser(id: string): Promise<ApiResult<User>> {
    try {
        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();
        return { success: true, data };
    } catch {
        return { success: false, error: 'Failed to fetch' };
    }
}
```

---

## Validation (Zod)

```typescript
import { z } from 'zod';

const UserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

type User = z.infer<typeof UserSchema>;
```

---

## Quick Rules

| ❌ Never        | ✅ Always               |
| --------------- | ----------------------- |
| `any`           | `unknown` + guards      |
| `data as User`  | `isUser(data)` check    |
| `user!.name`    | `user?.name ?? default` |
| No return type  | Explicit on exports     |
| Implicit params | Type all params         |

---

**Apply these rules to all TypeScript code. Prioritize type safety over convenience.**
