# React Best Practices Prompt

Guidelines for writing high-quality React code.

---

## Core Rules

1. **Use functional components only** - No class components
2. **TypeScript for everything** - Explicit prop types required
3. **Keep components small** - Single responsibility (< 200 lines)
4. **Avoid prop drilling** - Use Context or state management for deep props
5. **Explicit dependencies** - Always declare useEffect dependencies correctly
6. **Clean up side effects** - Return cleanup functions from useEffect

---

## Component Structure

```tsx
// ✅ Correct order
import statements
type/interface definitions
component function
  - hooks at top
  - handlers
  - render logic
export statement

// ✅ Example
import { useState, useEffect } from 'react'

interface UserCardProps {
  userId: string
}

export function UserCard({ userId }: UserCardProps) {
  // 1. Hooks first
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
    return () => cleanup()  // Cleanup
  }, [userId])

  // 2. Handlers
  const handleClick = () => {}

  // 3. Early returns
  if (!user) return <Loading />

  // 4. Render
  return <div>{user.name}</div>
}
```

---

## Component Design

```tsx
// ✅ Small, focused components
function UserProfile({ user }: Props) {
    return (
        <div>
            <UserAvatar user={user} />
            <UserInfo user={user} />
            <UserActions user={user} />
        </div>
    );
}

// ❌ God components with everything
function UserProfile() {
    // 500 lines of code...
}

// ✅ Descriptive names
function SubmitPaymentButton() {}

// ❌ Generic names
function Button() {}

// ✅ Single responsibility
function UserCard({ user }: Props) {
    return <div>{user.name}</div>;
}

// ❌ Multiple responsibilities
function UserCard({ user, onEdit, onDelete, showModal }: Props) {
    // Handles display, editing, deleting, modals...
}
```

---

## State Management

```tsx
// ✅ State close to where it's used
function UserList() {
  const [users, setUsers] = useState([])  // Used only here
  return <div>{users.map(...)}</div>
}

// ✅ Lift state when shared
function Parent() {
  const [filter, setFilter] = useState('')  // Shared by children
  return (
    <>
      <FilterInput value={filter} onChange={setFilter} />
      <UserList filter={filter} />
    </>
  )
}

// ✅ Don't duplicate state
const [user, setUser] = useState(props.user)  // ❌ Duplicates props
const user = props.user  // ✅ Use props directly

// ✅ Derive state when possible
const [users, setUsers] = useState([])
const activeUsers = users.filter(u => u.active)  // ✅ Derived

// ❌ Don't store derived state
const [users, setUsers] = useState([])
const [activeUsers, setActiveUsers] = useState([])  // ❌ Duplicate
```

---

## Hooks

```tsx
// ✅ Rules of Hooks
- Call hooks at top level only
- Call hooks in same order every render
- Only call from React functions

// ✅ Custom hooks for reusable logic
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchUser(userId)
      .then(data => !cancelled && setUser(data))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [userId])

  return { user, loading }
}

// ✅ Memoization when needed
const expensiveValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b]
)

const memoizedCallback = useCallback(
  () => doSomething(a, b),
  [a, b]
)

// ❌ Don't overuse memoization
const simple = useMemo(() => a + b, [a, b])  // ❌ Overhead > benefit
const simple = a + b  // ✅ Just compute it
```

---

## Side Effects

```tsx
// ✅ Correct useEffect usage
useEffect(() => {
    const subscription = api.subscribe(userId);
    return () => subscription.unsubscribe(); // Cleanup
}, [userId]); // Dependencies

// ❌ Missing dependencies
useEffect(() => {
    fetchData(userId); // ❌ userId not in deps
}, []);

// ❌ Missing cleanup
useEffect(() => {
    const timer = setInterval(() => {}, 1000);
    // ❌ No cleanup
}, []);

// ✅ With cleanup
useEffect(() => {
    const timer = setInterval(() => {}, 1000);
    return () => clearInterval(timer); // ✅ Cleanup
}, []);

// ✅ Multiple effects for different concerns
useEffect(() => {
    // Handle A
}, [a]);

useEffect(() => {
    // Handle B
}, [b]);

// ❌ One effect for everything
useEffect(() => {
    // Handle A and B and C...
}, [a, b, c]);
```

---

## Performance

```tsx
// ✅ React.memo for expensive components
export const ExpensiveList = React.memo(function ExpensiveList({ items }: Props) {
  return <div>{items.map(...)}</div>
})

// ✅ Lazy load routes/heavy components
const Dashboard = lazy(() => import('./Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  )
}

// ✅ Avoid inline objects/functions in props
// ❌ Creates new object every render
<Component style={{ margin: 10 }} />

// ✅ Define outside or use useMemo
const style = { margin: 10 }
<Component style={style} />

// ✅ Key prop for lists
{items.map(item => (
  <div key={item.id}>{item.name}</div>  // ✅ Stable key
))}

// ❌ Index as key for dynamic lists
{items.map((item, i) => (
  <div key={i}>{item.name}</div>  // ❌ Can cause bugs
))}
```

---

## Event Handlers

```tsx
// ✅ Naming: handle* for component, on* for props
interface Props {
    onSubmit: () => void; // Prop
}

function Form({ onSubmit }: Props) {
    const handleSubmit = (e: FormEvent) => {
        // Handler
        e.preventDefault();
        onSubmit();
    };

    return <form onSubmit={handleSubmit}>...</form>;
}

// ✅ Prevent default when needed
const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // ...
};

// ✅ Use proper event types
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {};
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {};
```

---

## Conditional Rendering

```tsx
// ✅ Early returns for loading/error states
if (loading) return <Loading />;
if (error) return <Error message={error} />;
return <Data data={data} />;

// ✅ Ternary for simple conditions
{
    isLoggedIn ? <Dashboard /> : <Login />;
}

// ✅ && for showing/hiding
{
    hasItems && <ItemList items={items} />;
}

// ❌ Don't use && with numbers (0 renders as "0")
{
    items.length && <ItemList />;
} // ❌ Shows "0" when empty

// ✅ Explicit check
{
    items.length > 0 && <ItemList />;
}
```

---

## Props

```tsx
// ✅ Destructure props
function User({ name, email }: UserProps) {}

// ❌ Don't use props object
function User(props: UserProps) {
  return <div>{props.name}</div>
}

// ✅ Default values
function Button({ variant = 'primary', disabled = false }: Props) {}

// ✅ Spread props when building wrappers
function CustomButton(props: ButtonProps) {
  return <button {...props} className="custom" />
}

// ✅ Boolean props (no value = true)
<Button disabled />  // ✅
<Button disabled={true} />  // Verbose but ok
```

---

## Forms

```tsx
// ✅ Controlled components
function LoginForm() {
    const [email, setEmail] = useState('');

    return <input value={email} onChange={(e) => setEmail(e.target.value)} />;
}

// ✅ Form validation libraries
import { z } from 'zod';
import { useForm } from 'react-hook-form';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

function LoginForm() {
    const { register, handleSubmit } = useForm({
        resolver: zodResolver(schema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('email')} />
            <input {...register('password')} type="password" />
        </form>
    );
}
```

---

## Error Handling

```tsx
// ✅ Error boundaries for component errors
class ErrorBoundary extends Component<Props, State> {
    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback />;
        }
        return this.props.children;
    }
}

// ✅ Try-catch for async operations
async function fetchData() {
    try {
        const data = await api.get('/users');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ✅ Show errors to users
{
    error && <Alert variant="error">{error}</Alert>;
}
```

---

## Common Pitfalls

| ❌ Avoid                      | ✅ Do Instead                      |
| ----------------------------- | ---------------------------------- |
| Mutating state directly       | Use setState with new object/array |
| Missing cleanup in useEffect  | Return cleanup function            |
| Wrong dependencies            | Include all used values            |
| Index as key in dynamic lists | Use stable unique IDs              |
| Prop drilling 5+ levels       | Context or state management        |
| Inline functions in JSX       | useCallback or define outside      |
| One giant component           | Split into smaller components      |
| Fetching in render            | useEffect or data fetching library |

---

## Quick Checklist

- [ ] TypeScript types for all props
- [ ] Cleanup functions in useEffect
- [ ] Correct dependency arrays
- [ ] Components under 200 lines
- [ ] Meaningful component names
- [ ] Memoization only when needed
- [ ] Error boundaries for failures
- [ ] Loading states for async operations
- [ ] Accessibility attributes (aria-\*)
- [ ] Keys for list items

---

**Apply these practices to all React code. Prioritize readability and maintainability.**
