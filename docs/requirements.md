```
Create an industry-standard file sharing PWA using Next.js 16+ (App Router) and PeerJS for real peer-to-peer file transfer between devices (PC, mobile, tablet). This is for personal use only.

CORE REQUIREMENTS:
- Room-based P2P file sharing using PeerJS
- Both devices can send/receive files simultaneously (bidirectional)
- Generate random 6-character room codes or join existing rooms
- Real-time connection status and file transfer progress
- Drag-and-drop and click-to-upload file selection
- Download shared files with one click
- Copy room code to clipboard
- Disconnect and leave room functionality
- Display file metadata: name, size, type, timestamp
- Progressive Web App (PWA) with offline support and installability

TECHNICAL STACK & BEST PRACTICES:
- Next.js 16+ with App Router (not Pages Router)
- React Server Components where appropriate, Client Components for interactivity
- PeerJS library for WebRTC peer-to-peer connections ('use client' directive required)
- Tailwind CSS for styling with mobile-first approach
- shadcn/ui components: Button, Card, Input, Badge, Alert, Dialog, Toast, Skeleton
- Custom hooks for PeerJS connection logic (usePeerConnection, useFileTransfer)
- Proper error boundaries and Suspense boundaries
- Next.js Metadata API for SEO and PWA manifest
- TypeScript with strict mode enabled
- Clean architecture: app/(routes), components/, lib/, hooks/
- Performance: React.memo, useCallback, useMemo, dynamic imports
- Accessibility: ARIA labels, semantic HTML, keyboard navigation

UI/UX REQUIREMENTS:
- Modern, sleek, minimalist design with Framer Motion animations
- Dark mode with next-themes (system preference detection)
- Fully responsive: mobile (320px+), tablet (768px+), desktop (1024px+)
- Glass morphism effects with backdrop-blur
- Micro-interactions: hover states, loading skeletons, success animations
- Sonner toast notifications for connection events and file transfers
- Color scheme: Zinc/slate dark mode, indigo/violet accents
- Instant page transitions with Next.js Link
- Optimistic UI updates
- Loading states with Suspense and skeletons

NEXT.JS SPECIFIC:
- App Router with proper loading.tsx and error.tsx files
- Server Components for static content
- Client Components ('use client') for PeerJS and interactive features
- next/image for optimized images
- Dynamic imports for code splitting: dynamic(() => import('./peer-connection'), { ssr: false })
- Metadata API for SEO and Open Graph tags
- Route handlers (app/api/) if needed for any server logic
- Middleware for security headers
- Environment variables in .env.local

PWA CONFIGURATION:
- next-pwa plugin for service worker generation
- manifest.ts with theme colors, icons, display: 'standalone'
- Offline fallback page
- Cache strategies: network-first for API, cache-first for static
- Install prompt with beforeinstallprompt event
- iOS meta tags for Add to Home Screen

FILE TRANSFER IMPLEMENTATION:
- Chunk files into 16KB pieces for efficient P2P transfer
- ArrayBuffer for binary data handling
- Show real-time progress bars using React state
- Support files up to 500MB
- Validate file types and sizes client-side
- Queue system for multiple simultaneous transfers
- Retry logic for failed chunks
- Cancel transfer functionality

PEERJS INTEGRATION:
- Initialize PeerJS with custom configuration (iceServers for NAT traversal)
- Handle peer events: open, connection, data, error, close
- Implement connection timeout and retry logic
- Clean up peer connections on component unmount
- Handle multiple peers in same room (broadcast to all)
- Display connection quality indicator
- Reconnection logic if connection drops

PERFORMANCE OPTIMIZATIONS:
- Image optimization with next/image
- Font optimization with next/font
- Code splitting with dynamic imports
- Lazy loading for non-critical components
- Virtual scrolling for large file lists (react-window)
- Debounce search/filter inputs
- Memoize expensive computations
- Optimize bundle size (analyze with @next/bundle-analyzer)

SECURITY & PRIVACY:
- Content Security Policy headers
- No data persistence on server (pure client-side P2P)
- Input sanitization for room codes (alphanumeric only)
- Rate limiting for room creation
- Validate peer connections before file transfer
- No analytics or tracking scripts

CODE QUALITY:
- ESLint with Next.js config
- Prettier for formatting
- Husky for pre-commit hooks
- TypeScript strict mode
- JSDoc comments for complex functions
- Unit tests with Jest and React Testing Library
- E2E tests with Playwright

DEPLOYMENT READY:
- Environment variables properly configured
- Build optimization enabled
- Edge runtime where applicable
- Vercel deployment configuration
- Error tracking ready (optional Sentry integration)
- Performance monitoring ready

FEATURES TO EXCLUDE:
- User authentication/accounts
- Database/backend storage
- Chat functionality
- Video/audio calling
- File editing
- Social features
- Analytics
- Multiple simultaneous rooms
- File history/archive

OUTPUT REQUIREMENTS:
- Complete Next.js 16+ project structure
- All components properly typed with TypeScript
- Fully functional PeerJS P2P file transfer
- Beautiful, modern UI with dark mode
- Production-ready code following Next.js best practices
- PWA installable on all devices
- Zero backend dependencies (pure frontend + P2P)

CRITICAL: Use 'use client' directive for any component that uses PeerJS, hooks, or browser APIs. Keep Server Components for static layouts and metadata.
```
