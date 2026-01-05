# 07 - State Management with Zustand

> **Zustand patterns and best practices for global state management across all projects.**

---

## Core Rules

1. **Slice pattern for organization** - Separate concerns into logical slices
2. **TypeScript strict typing** - Type all state and actions
3. **Immutable updates** - Never mutate state directly
4. **Selective subscriptions** - Use selectors to prevent unnecessary re-renders
5. **Persist when needed** - Use middleware for localStorage/sessionStorage
6. **DevTools in development** - Enable Redux DevTools for debugging

---

## Basic Store Setup

```typescript
// ✅ Simple store with TypeScript
import { create } from 'zustand'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))

// Usage in component
function Counter() {
  const { count, increment, decrement } = useCounterStore()

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}
```

---

## Slice Pattern (Recommended)

```typescript
// ✅ Organize large stores with slices
// store/slices/user-slice.ts
import { StateCreator } from 'zustand';

export interface UserSlice {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const createUserSlice: StateCreator<
    UserSlice & SettingsSlice, // Combined type
    [],
    [],
    UserSlice
> = (set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
});

// store/slices/settings-slice.ts
export interface SettingsSlice {
    theme: 'dark' | 'light';
    language: string;
    setTheme: (theme: 'dark' | 'light') => void;
    setLanguage: (language: string) => void;
}

export const createSettingsSlice: StateCreator<UserSlice & SettingsSlice, [], [], SettingsSlice> = (
    set
) => ({
    theme: 'dark',
    language: 'en',
    setTheme: (theme) => set({ theme }),
    setLanguage: (language) => set({ language }),
});

// store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createUserSlice, UserSlice } from './slices/user-slice';
import { createSettingsSlice, SettingsSlice } from './slices/settings-slice';

type StoreState = UserSlice & SettingsSlice;

export const useStore = create<StoreState>()(
    devtools(
        persist(
            (...a) => ({
                ...createUserSlice(...a),
                ...createSettingsSlice(...a),
            }),
            {
                name: 'app-storage',
                partialize: (state) => ({
                    // Only persist specific fields
                    theme: state.theme,
                    language: state.language,
                }),
            }
        )
    )
);
```

---

## Selectors (Performance)

```typescript
// ✅ Use selectors to prevent unnecessary re-renders
// ❌ Bad - re-renders on ANY state change
function Component() {
  const store = useStore()  // Subscribes to entire store
  return <div>{store.user?.name}</div>
}

// ✅ Good - only re-renders when user changes
function Component() {
  const user = useStore((state) => state.user)
  return <div>{user?.name}</div>
}

// ✅ Multiple selectors
function Component() {
  const user = useStore((state) => state.user)
  const theme = useStore((state) => state.theme)

  return <div className={theme}>{user?.name}</div>
}

// ✅ Derived state with selector
function Component() {
  const isLoggedIn = useStore((state) => state.user !== null)

  return isLoggedIn ? <Dashboard /> : <Login />
}

// ✅ Shallow equality for objects/arrays
import { shallow } from 'zustand/shallow'

function Component() {
  const { user, theme } = useStore(
    (state) => ({ user: state.user, theme: state.theme }),
    shallow
  )
}
```

---

## Async Actions

```typescript
// ✅ Async actions with error handling
interface UserSlice {
  user: User | null
  loading: boolean
  error: string | null
  fetchUser: (id: string) => Promise<void>
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async (id) => {
    set({ loading: true, error: null })

    try {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) throw new Error('Failed to fetch user')

      const user = await response.json()
      set({ user, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      })
    }
  },
})

// Usage
function UserProfile({ userId }: Props) {
  const { user, loading, error, fetchUser } = useStore()

  useEffect(() => {
    fetchUser(userId)
  }, [userId, fetchUser])

  if (loading) return <Loading />
  if (error) return <Error message={error} />
  if (!user) return null

  return <div>{user.name}</div>
}
```

---

## Middleware

```typescript
// ✅ DevTools (development only)
import { devtools } from 'zustand/middleware';

export const useStore = create<StoreState>()(
    devtools(
        (set) => ({
            // state and actions
        }),
        { name: 'AppStore' } // Name in Redux DevTools
    )
);

// ✅ Persist to localStorage
import { persist } from 'zustand/middleware';

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            // state and actions
        }),
        {
            name: 'app-storage', // localStorage key
            partialize: (state) => ({
                // Only persist specific fields
                user: state.user,
                theme: state.theme,
            }),
        }
    )
);

// ✅ Combine middleware
export const useStore = create<StoreState>()(
    devtools(
        persist(
            (set) => ({
                // state and actions
            }),
            { name: 'app-storage' }
        ),
        { name: 'AppStore' }
    )
);

// ✅ Custom middleware for logging
const log = (config) => (set, get, api) =>
    config(
        (...args) => {
            console.log('  applying', args);
            set(...args);
            console.log('  new state', get());
        },
        get,
        api
    );

export const useStore = create(
    log((set) => ({
        /* ... */
    }))
);
```

---

## Immer for Complex Updates

```typescript
// ✅ Use Immer for nested state updates
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TodoState {
    todos: Todo[];
    addTodo: (text: string) => void;
    toggleTodo: (id: string) => void;
    updateTodo: (id: string, text: string) => void;
}

export const useTodoStore = create<TodoState>()(
    immer((set) => ({
        todos: [],

        addTodo: (text) =>
            set((state) => {
                state.todos.push({ id: crypto.randomUUID(), text, completed: false });
            }),

        toggleTodo: (id) =>
            set((state) => {
                const todo = state.todos.find((t) => t.id === id);
                if (todo) todo.completed = !todo.completed;
            }),

        updateTodo: (id, text) =>
            set((state) => {
                const todo = state.todos.find((t) => t.id === id);
                if (todo) todo.text = text;
            }),
    }))
);

// ❌ Without Immer (verbose)
toggleTodo: (id) =>
    set((state) => ({
        todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
    }));
```

---

## Resetting State

```typescript
// ✅ Reset entire store or specific slices
interface StoreState {
    user: User | null;
    settings: Settings;
    reset: () => void;
    resetUser: () => void;
}

const initialState = {
    user: null,
    settings: { theme: 'dark', language: 'en' },
};

export const useStore = create<StoreState>((set) => ({
    ...initialState,

    reset: () => set(initialState),
    resetUser: () => set({ user: null }),
}));
```

---

## Testing Zustand Stores

```typescript
// ✅ Testing stores
import { renderHook, act } from '@testing-library/react';
import { useCounterStore } from './store';

describe('Counter Store', () => {
    beforeEach(() => {
        // Reset store before each test
        useCounterStore.setState({ count: 0 });
    });

    it('increments count', () => {
        const { result } = renderHook(() => useCounterStore());

        act(() => {
            result.current.increment();
        });

        expect(result.current.count).toBe(1);
    });

    it('resets count', () => {
        const { result } = renderHook(() => useCounterStore());

        act(() => {
            result.current.increment();
            result.current.increment();
            result.current.reset();
        });

        expect(result.current.count).toBe(0);
    });
});
```

---

## File Structure

```
store/
├── index.ts                 # Main store export
├── slices/
│   ├── user-slice.ts        # User state and actions
│   ├── settings-slice.ts    # Settings state and actions
│   ├── ui-slice.ts          # UI state (modals, sidebars, etc.)
│   └── data-slice.ts        # Data/entities state
└── middleware/
    └── logger.ts            # Custom middleware
```

---

## Common Patterns

```typescript
// ✅ Computed values (derived state)
interface StoreState {
    items: Item[];
    filter: string;
    // Computed
    filteredItems: () => Item[];
}

export const useStore = create<StoreState>((set, get) => ({
    items: [],
    filter: '',

    filteredItems: () => {
        const { items, filter } = get();
        return items.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
    },
}));

// Usage
const filteredItems = useStore((state) => state.filteredItems());

// ✅ Optimistic updates
interface TodoSlice {
    todos: Todo[];
    addTodoOptimistic: (text: string) => Promise<void>;
}

export const createTodoSlice: StateCreator<TodoSlice> = (set, get) => ({
    todos: [],

    addTodoOptimistic: async (text) => {
        const tempId = `temp-${Date.now()}`;
        const tempTodo = { id: tempId, text, completed: false };

        // Optimistic update
        set((state) => ({ todos: [...state.todos, tempTodo] }));

        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                body: JSON.stringify({ text }),
            });
            const todo = await response.json();

            // Replace temp with real
            set((state) => ({
                todos: state.todos.map((t) => (t.id === tempId ? todo : t)),
            }));
        } catch (error) {
            // Rollback on error
            set((state) => ({
                todos: state.todos.filter((t) => t.id !== tempId),
            }));
        }
    },
});
```

---

## Best Practices

| ❌ Avoid                    | ✅ Do Instead                       |
| --------------------------- | ----------------------------------- |
| Subscribing to entire store | Use selectors for specific state    |
| Mutating state directly     | Use `set()` with new objects        |
| Large monolithic stores     | Split into slices                   |
| Storing derived state       | Compute on the fly or use selectors |
| No TypeScript types         | Strict typing for all state/actions |
| Persisting sensitive data   | Only persist non-sensitive state    |
| No error handling in async  | Try-catch with error state          |

---

## Quick Checklist

- [ ] TypeScript types for all state and actions
- [ ] Slice pattern for organization
- [ ] Selectors to prevent unnecessary re-renders
- [ ] DevTools middleware in development
- [ ] Persist middleware for localStorage (if needed)
- [ ] Immer for complex nested updates
- [ ] Error handling in async actions
- [ ] Loading states for async operations
- [ ] Reset functions for cleanup
- [ ] Shallow equality for object selectors

---

**Use Zustand for global state that needs to be shared across multiple components. For local state, prefer React's useState/useReducer.**
