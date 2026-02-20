'use client';

import { Footer } from '@/shared/components/layout/footer';

import { Hero } from './hero';
import { LandingCTA } from './landing-cta';
import { SetupGuide } from './setup-guide';
import { WorkflowAnimation } from './workflow-animation';

/**
 * Landing page composition root.
 * Each visual section is its own component; this file only
 * orchestrates layout and passes callbacks downward.
 */
export function LandingPage() {
    return (
        <div className="bg-background text-white selection:bg-primary/30">
            <Hero />

            <section className="border-y border-white/[0.08] bg-zinc-900/10 py-20 backdrop-blur-sm">
                <WorkflowAnimation />
            </section>

            <SetupGuide />

            <LandingCTA />

            <Footer />
        </div>
    );
}
