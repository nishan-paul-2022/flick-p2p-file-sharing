'use client';

import { motion } from 'framer-motion';

import { Footer } from '@/components/layout/Footer';

import { Hero } from './Hero';
import { SetupGuide } from './SetupGuide';
import { WorkflowAnimation } from './WorkflowAnimation';

interface LandingPageProps {
    onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
    return (
        <div className="bg-background text-white selection:bg-primary/30">
            <Hero onEnterApp={onEnterApp} />

            <section className="border-y border-white/[0.08] bg-zinc-900/10 py-20 backdrop-blur-sm">
                <WorkflowAnimation />
            </section>

            <SetupGuide />

            <div className="border-t border-white/[0.08] py-24 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* Background Glow */}
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-primary/5 blur-[120px]" />

                    <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                        Ready to begin?
                    </h2>
                    <h3 className="mb-12 text-4xl font-black md:text-6xl lg:text-7xl">
                        START <span className="text-primary">FLICKING.</span>
                    </h3>
                    <button
                        onClick={onEnterApp}
                        className="h-20 transform rounded-2xl bg-primary px-16 text-xl font-bold text-white shadow-[0_0_60px_rgba(14,165,233,0.3)] transition-all duration-300 hover:scale-105 hover:bg-primary/90 active:scale-95"
                    >
                        Launch Application
                    </button>

                    <p className="mt-8 text-xs font-medium uppercase tracking-widest text-muted-foreground/40">
                        Free. Private. Unlimited.
                    </p>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
}
