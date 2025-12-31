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
            className="flex items-center gap-1.5 md:gap-3 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-black/40 border border-white/5 shadow-sm transition-all duration-300 relative overflow-hidden"
        >
            <div
                className={cn(
                    'flex-shrink-0 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full transition-colors duration-300',
                    isPowerMode
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-blue-500/20 text-blue-500'
                )}
            >
                {isPowerMode ? (
                    <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                ) : (
                    <Shield className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                )}
            </div>

            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-white/90 whitespace-nowrap">
                {isPowerMode ? 'Power' : 'Compat'}
                <span className="hidden xs:inline"> Mode</span>
            </span>

            <div className="flex-shrink-0 px-1.5 md:px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/70 transition-colors truncate max-w-[50px] xs:max-w-none">
                {storageCapabilities.browserInfo}
            </div>
        </motion.div>
    );
}
