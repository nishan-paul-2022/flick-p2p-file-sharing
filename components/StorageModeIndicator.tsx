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
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-primary/20 shadow-lg hover:border-primary/40 transition-all duration-300 group"
        >
            <div
                className={`p-1 rounded-full ${isPowerMode ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}
            >
                {isPowerMode ? (
                    <Zap className="w-3.5 h-3.5 text-green-500" />
                ) : (
                    <Shield className="w-3.5 h-3.5 text-yellow-500" />
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
                className="bg-transparent border-primary/10 text-[9px] px-1.5 py-0 h-4 uppercase font-bold text-muted-foreground group-hover:text-primary transition-colors"
            >
                {storageCapabilities.browserInfo}
            </Badge>

            {/* Tooltip-like effect on hover */}
            <div className="absolute top-full right-0 mt-2 p-3 rounded-xl glass-dark border border-primary/20 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 w-64 z-50">
                <p className="text-xs font-semibold mb-1 text-primary">
                    {isPowerMode ? 'Direct Stream Enabled' : 'RAM Buffer Mode'}
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {isPowerMode
                        ? 'Files are streamed directly to your disk using OPFS. Zero RAM impact, support for unlimited file sizes.'
                        : "Files are buffered in memory. Best for smaller transfers on browsers that don't support disk streaming yet."}
                </p>
            </div>
        </motion.div>
    );
}
