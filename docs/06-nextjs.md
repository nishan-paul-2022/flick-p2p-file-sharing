# 05 - Next.js Best Practices

> **Guidelines for building high-quality Next.js applications across all projects.**

---

## Core Rules

1. **Server Components by default** - Use Client Components only when needed
2. **Colocate data fetching** - Fetch data where it's used
3. **Use proper file conventions** - page.tsx, layout.tsx, loading.tsx, error.tsx
4. **Optimize images** - Always use next/image
5. **Metadata for SEO** - Define metadata in layouts and pages
6. **No client-side secrets** - Use NEXT*PUBLIC* prefix carefully

---

## Server vs Client Components

```tsx
// ✅ Server Component (default) - NO 'use client'
// Use for: Data fetching, backend logic, SEO content
export default async function UserProfile({ params }: Props) {
    const user = await fetchUser(params.id); // Direct DB/API call

    return (
        <div>
            <h1>{user.name}</h1>
            <ClientButton userId={user.id} />
        </div>
    );
}

// ✅ Client Component - WITH 'use client'
// Use for: Interactivity, state, effects, browser APIs
('use client');

import { useState } from 'react';

export function ClientButton({ userId }: Props) {
    const [count, setCount] = useState(0);

    return <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>;
}
```

### When to Use Client Components

**MUST use 'use client' for:**

- `useState`, `useEffect`, `useReducer`
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`localStorage`, `window`, `document`)
- Custom hooks that use above
- Third-party libraries using React hooks

**Server Components (default) for:**

- Data fetching
- Direct database access
- Backend logic
- Static content
- SEO metadata

---

## Data Fetching

```tsx
// ✅ Server Component: async/await directly
export default async function Users() {
    const users = await fetch('https://api.example.com/users').then((res) => res.json());

    return <UserList users={users} />;
}

// ✅ Server Component: Direct DB query
import { db } from '@/lib/db';

export default async function Posts() {
    const posts = await db.post.findMany();
    return <PostList posts={posts} />;
}

// ✅ Parallel data fetching
export default async function Dashboard() {
    const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);

    return (
        <>
            <UserSection users={users} />
            <PostSection posts={posts} />
        </>
    );
}

// ✅ Client Component: Use hooks or libraries
('use client');

export function ClientData() {
    const { data, loading } = useSWR('/api/users');

    if (loading) return <Loading />;
    return <div>{data}</div>;
}

// ❌ Don't fetch in Client Components unless necessary
('use client');

export function BadExample() {
    useEffect(() => {
        fetch('/api/users'); // ❌ Should be Server Component
    }, []);
}
```

---

## File Structure & Routing

```tsx
// ✅ Standard file conventions
app/
├── layout.tsx           // Root layout
├── page.tsx             // Home page (/)
├── loading.tsx          // Loading UI
├── error.tsx            // Error boundary
├── not-found.tsx        // 404 page
│
├── dashboard/
│   ├── layout.tsx       // Dashboard layout
│   ├── page.tsx         // /dashboard
│   ├── loading.tsx      // Dashboard loading
│   └── settings/
│       └── page.tsx     // /dashboard/settings
│
├── users/
│   ├── page.tsx         // /users
│   └── [id]/
│       ├── page.tsx     // /users/:id
│       └── edit/
│           └── page.tsx // /users/:id/edit
│
└── api/
    └── users/
        └── route.ts     // API endpoint

// ✅ Route Groups (no URL segment)
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx     // /login
│   └── register/
│       └── page.tsx     // /register
│
└── (dashboard)/
    ├── layout.tsx       // Shared layout, no /dashboard in URL
    ├── users/
    │   └── page.tsx     // /users (not /dashboard/users)
    └── settings/
        └── page.tsx     // /settings

// ✅ Private folders (not routes)
app/
├── _components/         // Not a route
├── _lib/                // Not a route
└── dashboard/
    └── page.tsx
```

---

## Layouts

```tsx
// ✅ Root layout (required)
// app/layout.tsx
export default function RootLayout({ children }: Props) {
    return (
        <html lang="en">
            <body>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}

// ✅ Nested layout
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: Props) {
    return (
        <div>
            <Sidebar />
            <main>{children}</main>
        </div>
    );
}

// ✅ Layout with data fetching
export default async function DashboardLayout({ children }: Props) {
    const user = await getUser();

    return (
        <div>
            <Sidebar user={user} />
            <main>{children}</main>
        </div>
    );
}
```

---

## Loading & Error States

```tsx
// ✅ loading.tsx - Automatic loading UI
// app/dashboard/loading.tsx
export default function Loading() {
    return <Skeleton />;
}

// ✅ error.tsx - Error boundary
// app/dashboard/error.tsx
('use client'); // Must be client component

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div>
            <h2>Something went wrong!</h2>
            <p>{error.message}</p>
            <button onClick={reset}>Try again</button>
        </div>
    );
}

// ✅ Streaming with Suspense
export default function Page() {
    return (
        <div>
            <Header />
            <Suspense fallback={<Skeleton />}>
                <SlowComponent />
            </Suspense>
            <Footer />
        </div>
    );
}
```

---

## Metadata & SEO

```tsx
// ✅ Static metadata
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Home | My App',
    description: 'Welcome to my application',
    openGraph: {
        title: 'Home | My App',
        description: 'Welcome to my application',
        images: ['/og-image.jpg'],
    },
};

export default function Page() {
    return <div>Home</div>;
}

// ✅ Dynamic metadata
// app/users/[id]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const user = await fetchUser(params.id);

    return {
        title: `${user.name} | Users`,
        description: user.bio,
        openGraph: {
            images: [user.avatar],
        },
    };
}

// ✅ Metadata in layouts (inherited by children)
// app/dashboard/layout.tsx
export const metadata: Metadata = {
    title: {
        template: '%s | Dashboard',
        default: 'Dashboard',
    },
};
```

---

## Images & Assets

```tsx
// ✅ Always use next/image
import Image from 'next/image'

export function Avatar({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={100}
      height={100}
      priority  // For above-the-fold images
    />
  )
}

// ✅ Responsive images
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority
/>

// ✅ Remote images - configure in next.config.js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/images/**'
      }
    ]
  }
}

// ❌ Don't use <img> tag
<img src="/image.jpg" />  // ❌ No optimization
```

---

## Fonts

```tsx
// ✅ Use next/font for optimization
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono'
})

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

// CSS: Use CSS variables
.code {
  font-family: var(--font-roboto-mono);
}
```

---

## API Routes

```tsx
// ✅ Route handlers
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const users = await db.user.findMany();
    return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const user = await db.user.create({ data: body });
    return NextResponse.json(user, { status: 201 });
}

// ✅ Dynamic route handlers
// app/api/users/[id]/route.ts
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const user = await db.user.findUnique({
        where: { id: params.id },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
}

// ✅ CORS headers
export async function GET(request: NextRequest) {
    return NextResponse.json(data, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
    });
}
```

---

## Server Actions

```tsx
// ✅ Server Actions for mutations
// app/actions.ts
'use server';

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    const user = await db.user.create({
        data: { name, email },
    });

    revalidatePath('/users'); // Refresh data
    return { success: true, user };
}

// Usage in Client Component
('use client');

import { createUser } from '@/app/actions';

export function UserForm() {
    return (
        <form action={createUser}>
            <input name="name" required />
            <input name="email" type="email" required />
            <button type="submit">Create</button>
        </form>
    );
}

// ✅ With useFormState for validation
('use client');

import { useFormState } from 'react-dom';

export function UserForm() {
    const [state, formAction] = useFormState(createUser, null);

    return (
        <form action={formAction}>
            <input name="name" />
            {state?.errors?.name && <p>{state.errors.name}</p>}
            <button>Submit</button>
        </form>
    );
}
```

---

## Environment Variables

```bash
# ✅ Server-only variables (no prefix)
DATABASE_URL=postgresql://...
API_SECRET=secret123

# ✅ Client-exposed variables (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_NAME=My App
```

```tsx
// ✅ Server Component: Access any variable
export default async function Page() {
    const secret = process.env.API_SECRET; // ✅ Server-only
    const url = process.env.NEXT_PUBLIC_API_URL; // ✅ Also works
}

// ✅ Client Component: Only NEXT_PUBLIC_ variables
('use client');

export function Component() {
    const url = process.env.NEXT_PUBLIC_API_URL; // ✅ Works
    const secret = process.env.API_SECRET; // ❌ undefined in browser
}

// ❌ Never expose secrets to client
('use client');

const apiKey = 'sk_live_123'; // ❌ Visible in browser
```

---

## Caching & Revalidation

```tsx
// ✅ Static generation (default)
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
    .then(res => res.json())

  return <div>{data}</div>
}

// ✅ Revalidate every 60 seconds (ISR)
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }
  })
    .then(res => res.json())

  return <div>{data}</div>
}

// ✅ Dynamic rendering (always fresh)
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  })
    .then(res => res.json())

  return <div>{data}</div>
}

// ✅ Revalidate on demand
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateUser() {
  await db.user.update(...)
  revalidatePath('/users')  // Refresh /users page
  revalidateTag('users')     // Refresh all requests tagged 'users'
}
```

---

## Navigation

```tsx
// ✅ Link for internal navigation
import Link from 'next/link'

<Link href="/dashboard">Dashboard</Link>
<Link href={`/users/${user.id}`}>User Profile</Link>

// ✅ Programmatic navigation (Client Component)
'use client'

import { useRouter } from 'next/navigation'

export function LoginButton() {
  const router = useRouter()

  const handleLogin = async () => {
    await login()
    router.push('/dashboard')
    router.refresh()  // Refresh server components
  }

  return <button onClick={handleLogin}>Login</button>
}

// ✅ Prefetching (automatic on Link, manual if needed)
router.prefetch('/dashboard')

// ✅ redirect in Server Component/Action
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return <Dashboard user={user} />
}
```

---

## Middleware

```tsx
// ✅ middleware.ts in root
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Auth check
    const token = request.cookies.get('token');

    if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Add custom headers
    const response = NextResponse.next();
    response.headers.set('x-custom-header', 'value');

    return response;
}

// ✅ Matcher config
export const config = {
    matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

---

## Performance

```tsx
// ✅ Dynamic imports for code splitting
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false  // Client-side only if needed
})

// ✅ Lazy load below fold
export default function Page() {
  return (
    <div>
      <Header />
      <Hero />
      <Suspense fallback={<Loading />}>
        <BelowFold />
      </Suspense>
    </div>
  )
}

// ✅ Parallel routes for simultaneous loading
app/
└── dashboard/
    ├── @analytics/
    │   └── page.tsx
    ├── @users/
    │   └── page.tsx
    └── layout.tsx

// layout.tsx
export default function Layout({ analytics, users }: Props) {
  return (
    <>
      <Suspense fallback={<LoadingAnalytics />}>
        {analytics}
      </Suspense>
      <Suspense fallback={<LoadingUsers />}>
        {users}
      </Suspense>
    </>
  )
}
```

---

## Common Pitfalls

| ❌ Avoid                        | ✅ Do Instead                |
| ------------------------------- | ---------------------------- |
| 'use client' everywhere         | Server Components by default |
| Fetching in Client Components   | Fetch in Server Components   |
| Missing next/image              | Always use Image component   |
| No loading states               | Add loading.tsx files        |
| No error boundaries             | Add error.tsx files          |
| Exposing secrets to client      | Use server-only variables    |
| Manual route handlers for forms | Use Server Actions           |
| <img> tags                      | <Image> component            |
| Import 'next/router'            | Import 'next/navigation'     |

---

## Quick Checklist

- [ ] Server Components by default, Client only when needed
- [ ] Metadata defined for all pages
- [ ] Images use next/image component
- [ ] Fonts use next/font
- [ ] Loading states with loading.tsx
- [ ] Error handling with error.tsx
- [ ] Environment variables properly prefixed
- [ ] No secrets exposed to client
- [ ] Links use next/link
- [ ] Proper caching strategy (revalidate, no-store)

---

**Apply these practices to all Next.js code. Prioritize Server Components and proper data fetching patterns.**
