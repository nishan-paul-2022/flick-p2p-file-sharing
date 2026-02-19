'use client';

import { useRouter } from 'next/navigation';

import { LandingPage } from '@/components/landing/LandingPage';

export default function RootPage() {
    const router = useRouter();

    const handleEnterApp = () => {
        router.push('/app');
    };

    return <LandingPage onEnterApp={handleEnterApp} />;
}
