'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Share2, Shield, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface HeroProps {
    onEnterApp: () => void;
}

export function Hero({ onEnterApp }: HeroProps) {
    return (
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-20">
            {/* Animated Background Orbs */}
            <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 animate-pulse-slow rounded-full bg-brand-500/20 blur-[120px]" />
            <div className="pointer-events-none absolute -right-20 bottom-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-brand-600/10 blur-[150px]" />

            <div className="relative z-10 mx-auto max-w-5xl text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-400"
                >
                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                    Secure P2P Protocol v2.0
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-8 text-5xl font-black leading-[0.9] tracking-tighter md:text-8xl"
                >
                    SHARING WITHOUT
                    <br />
                    <span className="bg-gradient-to-b from-brand-400 to-brand-700 bg-clip-text text-transparent">
                        LIMITATIONS.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground/80 md:text-xl"
                >
                    Flick creates a direct, private bridge between your devices. No file size
                    limits, no cloud storage, just pure speed.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <Button
                        size="lg"
                        onClick={onEnterApp}
                        className="group h-16 rounded-2xl bg-brand-500 px-10 text-lg font-bold text-white shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all duration-300 hover:bg-brand-600"
                    >
                        Start Sharing Now
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        size="lg"
                        variant="link"
                        className="h-16 px-8 text-muted-foreground transition-colors hover:text-white"
                        onClick={() =>
                            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
                        }
                    >
                        How it works
                    </Button>
                </motion.div>

                {/* Micro Features */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-24 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8"
                >
                    {[
                        { icon: Shield, label: 'End-to-End' },
                        { icon: Zap, label: 'No Limits' },
                        { icon: Share2, label: 'Zero Config' },
                        { icon: Share2, label: 'Open Source' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-center gap-2 text-muted-foreground/50"
                        >
                            <item.icon className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
