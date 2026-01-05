# 04 - React Design Patterns

> **Reusable structural solutions for common React problems across all projects.**

---

## When to Use Patterns

| Problem                            | Pattern                  |
| ---------------------------------- | ------------------------ |
| Reusable stateful logic            | Custom Hooks             |
| Share data without props           | Context / Provider       |
| Related components work together   | Compound Components      |
| Separate logic from UI             | Container/Presentational |
| Complex state transitions          | State Reducer            |
| Control component state externally | Controlled Props         |

---

## 1. Custom Hooks Pattern

**Purpose**: Extract and reuse stateful logic across components.

**When**: Duplicate state/effect logic in multiple components.

```tsx
// ✅ Custom hook encapsulates logic
function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue((v) => !v), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);

    return { value, toggle, setTrue, setFalse };
}

// Usage
function Modal() {
    const { value: isOpen, toggle, setFalse } = useToggle();

    return (
        <>
            <button onClick={toggle}>Open</button>
            {isOpen && <Dialog onClose={setFalse} />}
        </>
    );
}

// ✅ Data fetching hook
function useUserData(userId: string) {
    const [data, setData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        fetchUser(userId)
            .then((user) => !cancelled && setData(user))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, [userId]);

    return { data, loading, error };
}
```

---

## 2. Compound Components Pattern

**Purpose**: Related components that work together, sharing implicit state.

**When**: Creating component libraries (tabs, accordions, dropdowns).

```tsx
// ✅ Compound components with Context
interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

function Tabs({ children, defaultTab }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

function TabList({ children }: Props) {
  return <div role="tablist">{children}</div>
}

function Tab({ id, children }: Props) {
  const { activeTab, setActiveTab } = useContext(TabsContext)!
  const isActive = activeTab === id

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  )
}

function TabPanel({ id, children }: Props) {
  const { activeTab } = useContext(TabsContext)!
  if (activeTab !== id) return null

  return <div role="tabpanel">{children}</div>
}

// Attach sub-components
Tabs.List = TabList
Tabs.Tab = Tab
Tabs.Panel = TabPanel

// Usage - Flexible, readable API
<Tabs defaultTab="profile">
  <Tabs.List>
    <Tabs.Tab id="profile">Profile</Tabs.Tab>
    <Tabs.Tab id="settings">Settings</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="profile">Profile content</Tabs.Panel>
  <Tabs.Panel id="settings">Settings content</Tabs.Panel>
</Tabs>
```

---

## 3. Provider Pattern

**Purpose**: Share data deeply without prop drilling.

**When**: Global state (auth, theme, settings) needed across many components.

```tsx
// ✅ Provider with custom hook
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string) => {
        const user = await api.login(email, password);
        setUser(user);
    };

    const logout = () => setUser(null);

    const value = {
        user,
        login,
        logout,
        isAuthenticated: user !== null,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for consuming
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be within AuthProvider');
    }
    return context;
}

// Usage
function App() {
    return (
        <AuthProvider>
            <Header />
            <Dashboard />
        </AuthProvider>
    );
}

function Header() {
    const { user, logout } = useAuth(); // No prop drilling
    return (
        <div>
            {user?.name} <button onClick={logout}>Logout</button>
        </div>
    );
}
```

---

## 4. Container/Presentational Pattern

**Purpose**: Separate business logic from UI rendering.

**When**: Complex components with lots of state/logic.

```tsx
// ✅ Container: Logic and state
function UserListContainer() {
    const { data: users, loading, error } = useUserData();
    const [filter, setFilter] = useState('');

    const filteredUsers = users?.filter((u) => u.name.toLowerCase().includes(filter.toLowerCase()));

    if (loading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <UserListPresentation users={filteredUsers} filter={filter} onFilterChange={setFilter} />
    );
}

// ✅ Presentational: Pure UI
interface Props {
    users: User[];
    filter: string;
    onFilterChange: (value: string) => void;
}

function UserListPresentation({ users, filter, onFilterChange }: Props) {
    return (
        <div>
            <input
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
                placeholder="Search..."
            />
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
}
```

---

## 5. State Reducer Pattern

**Purpose**: Give users control over component's internal state management.

**When**: Building flexible, reusable components for libraries.

```tsx
// ✅ Toggle with state reducer
type ToggleState = { on: boolean };
type ToggleAction = { type: 'toggle' } | { type: 'reset' };

function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
    switch (action.type) {
        case 'toggle':
            return { on: !state.on };
        case 'reset':
            return { on: false };
        default:
            return state;
    }
}

interface UseToggleProps {
    reducer?: (state: ToggleState, action: ToggleAction) => ToggleState;
    initialState?: ToggleState;
}

function useToggle({ reducer = toggleReducer, initialState = { on: false } }: UseToggleProps = {}) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const toggle = () => dispatch({ type: 'toggle' });
    const reset = () => dispatch({ type: 'reset' });

    return { on: state.on, toggle, reset };
}

// Usage: User can customize behavior
function App() {
    const customReducer = (state: ToggleState, action: ToggleAction) => {
        // Custom logic: prevent toggle after 5 toggles
        if (state.toggleCount >= 5 && action.type === 'toggle') {
            return state;
        }
        return toggleReducer(state, action);
    };

    const { on, toggle } = useToggle({ reducer: customReducer });

    return <Switch on={on} onClick={toggle} />;
}
```

---

## 6. Controlled Props Pattern

**Purpose**: Allow parent to control component state externally.

**When**: Building reusable form inputs or components needing external control.

```tsx
// ✅ Controlled component (parent manages state)
interface ControlledInputProps {
    value: string;
    onChange: (value: string) => void;
}

function ControlledInput({ value, onChange }: ControlledInputProps) {
    return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

// Usage
function Form() {
    const [email, setEmail] = useState('');

    return <ControlledInput value={email} onChange={setEmail} />;
}

// ✅ Uncontrolled component (internal state)
function UncontrolledInput({ defaultValue }: Props) {
    const [value, setValue] = useState(defaultValue);

    return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

// ✅ Hybrid: Support both controlled and uncontrolled
function FlexibleInput({ value: controlledValue, onChange, defaultValue = '' }: Props) {
    const [internalValue, setInternalValue] = useState(defaultValue);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleChange = (newValue: string) => {
        if (!isControlled) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
    };

    return <input value={value} onChange={(e) => handleChange(e.target.value)} />;
}
```

---

## Pattern Selection Guide

| Use Case                  | Pattern                  |
| ------------------------- | ------------------------ |
| Reuse stateful logic      | Custom Hooks             |
| Share global state        | Context + Provider       |
| Related components        | Compound Components      |
| Separate logic/UI         | Container/Presentational |
| External state control    | Controlled Props         |
| Flexible state management | State Reducer            |
| Component library         | Compound + Custom Hooks  |

---

## Quick Rules

1. **Default to Custom Hooks** for reusable logic
2. **Use Compound Components** for component libraries
3. **Use Context sparingly** - only for truly global state
4. **Container/Presentational** for complex components
5. **State Reducer** for maximum flexibility in libraries

---

**Apply appropriate patterns based on the problem. Prefer composition and hooks for clean, maintainable code.**
