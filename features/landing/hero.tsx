'use client';

import { motion } from 'framer-motion';
import { HardDrive, MonitorSmartphone, Network, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';

import { Button } from '@/shared/components/ui/button';

export function Hero() {
    const handleScrollToHowItWorks = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }
    }, []);

    return (
        <section className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden px-4">
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

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 text-6xl font-black leading-[0.95] tracking-tighter md:text-8xl lg:text-9xl"
                >
                    <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                        SHARE UNLIMITED
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground/80 md:text-xl"
                >
                    Seamlessly share files directly between your devices with uncompromising
                    privacy. Zero cloud limits, zero data retention, zero compromise. Just
                    blazing-fast, secure peer-to-peer transfers.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col items-center justify-center gap-6 sm:flex-row"
                >
                    <Button
                        size="lg"
                        asChild
                        className="group h-16 rounded-2xl bg-primary px-10 text-lg font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
                    >
                        <Link href="/share">Start Sharing Now</Link>
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
                        { icon: ShieldCheck, label: 'Secure & Private' },
                        { icon: HardDrive, label: 'Unlimited Size' },
                        { icon: Network, label: 'Direct P2P' },
                        { icon: MonitorSmartphone, label: 'All Devices' },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 text-foreground">
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
