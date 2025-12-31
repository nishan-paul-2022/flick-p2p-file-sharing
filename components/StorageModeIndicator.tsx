'use client';

import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';
import { useEffect } from 'react';

import { usePeerStore } from '@/lib/store';
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
            className="group flex items-center gap-2 rounded-full border border-white/5 bg-black/40 px-3 py-1.5 shadow-glass-sm transition-all duration-300"
        >
            <div
                className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-110',
                    isPowerMode
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'bg-brand-400/10 text-brand-400'
                )}
            >
                {isPowerMode ? (
                    <Zap className="h-3 w-3 fill-current" />
                ) : (
                    <Shield className="h-3 w-3 fill-current" />
                )}
            </div>

            <span className="text-3xs font-black uppercase leading-none tracking-widest-lg text-white/90">
                {isPowerMode ? 'Power' : 'Safe'} Mode
            </span>
        </motion.div>
    );
}
