'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * Full-width call-to-action section at the bottom of the landing page.
 * Extracted from LandingPage so that landing composition stays clean and
 * this section can be modified / A-B tested independently.
 */
export function LandingCTA() {
    return (
        <div className="border-t border-white/[0.08] py-24 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
            >
                <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-white">
                    Ready to begin?
                </h2>
                <h3 className="mb-12 text-4xl font-black md:text-6xl lg:text-7xl">
                    START <span className="text-primary">FLICKING</span>
                </h3>
                <Link
                    href="/share"
                    className="inline-flex h-20 transform items-center justify-center rounded-2xl bg-primary px-16 text-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-primary/90 active:scale-95"
                >
                    Launch Application
                </Link>

                <p className="mt-8 text-xs font-medium uppercase tracking-widest text-white">
                    Free. Private. Unlimited.
                </p>
            </motion.div>
        </div>
    );
}
