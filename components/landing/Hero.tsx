'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Laptop, Share2, Shield, Zap } from 'lucide-react';
import Image from 'next/image';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';

interface HeroProps {
    onEnterApp: () => void;
}

export function Hero({ onEnterApp }: HeroProps) {
    const handleScrollToHowItWorks = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }
    }, []);

    return (
        <section className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden px-4">
            {/* Minimalist Ambient Glow - Matching App Header style */}
            <div className="pointer-events-none absolute top-0 h-[500px] w-full bg-primary/5 opacity-50 blur-huge" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] bg-primary/5 opacity-30 blur-huge" />

            <div className="relative z-10 mx-auto max-w-5xl text-center">
                {/* Official Logo Integration */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 flex items-center justify-center gap-4"
                >
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        className="relative"
                    >
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                        <Image
                            src="/icon.svg"
                            alt="Flick Logo"
                            width={64}
                            height={64}
                            className="relative h-12 w-12 md:h-16 md:w-16"
                        />
                    </motion.div>
                    <span className="text-4xl font-black tracking-tighter md:text-5xl">
                        <span className="text-primary">Flick</span>
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-zinc-900/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary/80 backdrop-blur-3xl"
                >
                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
                    Secure P2P Protocol v2.5
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 text-6xl font-black leading-[0.95] tracking-tighter md:text-8xl lg:text-9xl"
                >
                    UNLIMITED
                    <br />
                    <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                        SHARING.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground/80 md:text-xl"
                >
                    Experience lightning-fast, private file transfers directly between your devices.
                    No cloud, no logs, just pure connectivity.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col items-center justify-center gap-6 sm:flex-row"
                >
                    <Button
                        size="lg"
                        onClick={onEnterApp}
                        className="group h-16 rounded-2xl bg-primary px-10 text-lg font-bold text-white shadow-[0_0_40px_rgba(14,165,233,0.2)] transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
                    >
                        Start Sharing Now
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="h-16 rounded-2xl border-white/10 bg-white/[0.03] px-10 text-lg font-bold backdrop-blur-md transition-all hover:bg-white/[0.08]"
                        onClick={handleScrollToHowItWorks}
                    >
                        How it works
                    </Button>
                </motion.div>

                {/* Micro Features - Subtle and Premium */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-24 grid grid-cols-2 gap-8 md:grid-cols-4"
                >
                    {[
                        { icon: Shield, label: 'End-to-End' },
                        { icon: Zap, label: 'Zero Limits' },
                        { icon: Share2, label: 'No Backend' },
                        { icon: Laptop, label: 'Cross Platform' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="group flex flex-col items-center gap-3 text-muted-foreground/40 transition-colors hover:text-primary/60"
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
