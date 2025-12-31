'use client';

import { usePeerStore } from '@/lib/store';
import { Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function StorageModeIndicator() {
    const { storageCapabilities, initializeStorage } = usePeerStore();

    useEffect(() => {
        if (!storageCapabilities) {
            initializeStorage();
        }
    }, [storageCapabilities, initializeStorage]);

    if (!storageCapabilities) {
        return null;
    }

    const isPowerMode = storageCapabilities.mode === 'power';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 md:gap-3 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-black/40 border border-white/5 shadow-sm transition-all duration-300 group"
        >
            <div
                className={cn(
                    'flex-shrink-0 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full transition-all duration-500 group-hover:scale-110',
                    isPowerMode
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'bg-brand-400/10 text-brand-400'
                )}
            >
                {isPowerMode ? (
                    <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                ) : (
                    <Shield className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                )}
            </div>

            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] text-white/90 whitespace-nowrap leading-none">
                {isPowerMode ? 'Power' : 'Safe'}
                <span className="hidden xs:inline"> Mode</span>
            </span>
        </motion.div>
    );
}
