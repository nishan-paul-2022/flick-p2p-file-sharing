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
        <div className="bg-[#020617] text-white selection:bg-brand-500/30">
            <Hero onEnterApp={onEnterApp} />

            <section className="border-y border-white/5 bg-surface-950/50 py-20">
                <WorkflowAnimation />
            </section>

            <SetupGuide />

            <div className="border-t border-white/5 py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="mb-8 text-3xl font-black md:text-5xl">READY TO FLICK?</h2>
                    <button
                        onClick={onEnterApp}
                        className="h-16 transform rounded-2xl bg-brand-500 px-12 text-xl font-bold text-white shadow-[0_0_50px_rgba(14,165,233,0.3)] transition-all duration-300 hover:scale-105 hover:bg-brand-600 active:scale-95"
                    >
                        Launch Application
                    </button>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
}
