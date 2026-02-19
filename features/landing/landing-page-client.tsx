'use client';

import { useRouter } from 'next/navigation';

import { LandingPage } from '@/features/landing/landing-page';

/**
 * Thin client boundary for the landing page.
 * Owns the navigation callback so the parent Server Component
 * does not need a 'use client' directive.
 */
export function LandingPageClient() {
    const router = useRouter();

    const handleEnterApp = () => {
        router.push('/app');
    };

    return <LandingPage onEnterApp={handleEnterApp} />;
}
