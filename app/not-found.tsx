'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
            <div className="relative z-10 flex flex-col items-center gap-14">
                {/* Logo Section - EXACTLY as in loading.tsx */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative"
                >
                    <div className="relative h-24 w-24 md:h-32 md:w-32">
                        {/* Pulse Ring */}
                        <motion.div
                            animate={{
                                scale: [1, 1.5],
                                opacity: [0.5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeOut',
                            }}
                            className="absolute inset-0 rounded-full border border-primary/50"
                        />
                        <Image
                            src="/icon.svg"
                            alt="Flick Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Simple Horizontal Layout - Minimal, Sleeek, No Glow */}
                <div className="flex items-center gap-5 text-sm font-medium tracking-tight md:text-base">
                    <span className="text-zinc-500">Page not found</span>
                    <div className="h-3 w-px bg-zinc-800" />
                    <Link href="/" className="text-zinc-300 transition-colors hover:text-white">
                        Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
