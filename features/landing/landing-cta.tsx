'use client';

import { motion } from 'framer-motion';

interface LandingCTAProps {
    onEnterApp: () => void;
}

/**
 * Full-width call-to-action section at the bottom of the landing page.
 * Extracted from LandingPage so that landing composition stays clean and
 * this section can be modified / A-B tested independently.
 */
export function LandingCTA({ onEnterApp }: LandingCTAProps) {
    return (
        <div className="border-t border-white/[0.08] py-24 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
            >
                <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                    Ready to begin?
                </h2>
                <h3 className="mb-12 text-4xl font-black md:text-6xl lg:text-7xl">
                    START <span className="text-primary">FLICKING.</span>
                </h3>
                <button
                    onClick={onEnterApp}
                    className="h-20 transform rounded-2xl bg-primary px-16 text-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-primary/90 active:scale-95"
                >
                    Launch Application
                </button>

                <p className="mt-8 text-xs font-medium uppercase tracking-widest text-muted-foreground/40">
                    Free. Private. Unlimited.
                </p>
            </motion.div>
        </div>
    );
}
