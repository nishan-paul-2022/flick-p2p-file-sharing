'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Loading() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Animation */}
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
            </div>
        </div>
    );
}
