import { LandingPageClient } from '@/features/landing/landing-page-client';

/**
 * Root page — Server Component.
 * Navigation logic is delegated to a dedicated client component so this file
 * stays free of 'use client' following Next.js's "push client boundary to
 * the leaves" best practice.
 */
export default function RootPage() {
    return <LandingPageClient />;
}
