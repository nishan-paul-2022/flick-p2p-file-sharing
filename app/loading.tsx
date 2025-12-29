'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Loading() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gradient-secondary overflow-hidden relative">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative"
                >
                    <div className="relative w-24 h-24 md:w-32 md:h-32">
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
                            className="object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                            priority
                        />
                    </div>
                </motion.div>
            </div>

            {/* Bottom Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-12 text-xs text-muted-foreground/50 font-mono tracking-widest"
            >
                FLICK - P2P FILE SHARING
            </motion.div>
        </div>
    );
}
