'use client';

import { usePeerStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

import { useEffect } from 'react';

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
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-white/10 shadow-lg hover:border-white/20 transition-all duration-300 group"
        >
            <div
                className={`p-1 rounded-full ${isPowerMode ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}
            >
                {isPowerMode ? (
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                )}
            </div>

            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground hidden sm:block">
                        {isPowerMode ? 'Power Mode' : 'Compatibility Mode'}
                    </span>
                </div>
            </div>

            <Badge
                variant="outline"
                className="bg-transparent border-white/10 text-[9px] px-1.5 py-0 h-4 uppercase font-bold text-muted-foreground group-hover:text-foreground transition-colors"
            >
                {storageCapabilities.browserInfo}
            </Badge>

            {/* Tooltip-like effect on hover */}
            <div className="absolute top-full right-0 mt-2 p-3 rounded-xl glass-dark border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 w-56 z-50">
                <p
                    className={`text-xs font-semibold mb-1 ${isPowerMode ? 'text-emerald-500' : 'text-amber-500'}`}
                >
                    {isPowerMode ? 'Direct Storage' : 'Memory Buffer'}
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {isPowerMode
                        ? 'Saves directly to disk. Unlimited file sizes.'
                        : 'Buffers in RAM. Best for small files.'}
                </p>
            </div>
        </motion.div>
    );
}
