'use client';

import { motion } from 'framer-motion';
import { Download, Send } from 'lucide-react';
import { ComponentProps } from 'react';

import { TabsTrigger } from '@/components/ui/tabs';

interface TransferTabTriggerProps extends ComponentProps<typeof TabsTrigger> {
    value: 'received' | 'sent';
    fileCount: number;
    isActiveTransfer: boolean;
}

export function TransferTabTrigger({
    value,
    fileCount,
    isActiveTransfer,
    className,
    ...props
}: TransferTabTriggerProps) {
    const Icon = value === 'received' ? Download : Send;

    return (
        <TabsTrigger
            value={value}
            className="group gap-1 rounded-lg py-2.5 font-semibold transition-all duration-300 hover:bg-white/5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground md:gap-2 md:py-3"
            {...props}
        >
            <div className="flex items-center gap-1.5 md:gap-2">
                <motion.div
                    animate={
                        isActiveTransfer
                            ? {
                                  y: value === 'received' ? [0, -3, 0] : [0, 2, 0], // Different animations
                                  x: value === 'received' ? 0 : [0, 2, 0],
                                  scale: [1, 1.1, 1],
                              }
                            : {}
                    }
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Icon
                        className={`h-3.5 w-3.5 transition-colors md:h-4 md:w-4 ${
                            isActiveTransfer
                                ? 'text-primary'
                                : 'group-data-[state=active]:text-foreground'
                        }`}
                    />
                </motion.div>
                <span
                    className={`text-xs transition-colors duration-300 md:text-sm ${
                        isActiveTransfer ? 'font-medium text-primary' : ''
                    }`}
                >
                    {value === 'received' ? 'Received' : 'Sent'}
                </span>
                <span
                    className={`ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-3xs font-bold transition-all duration-300 md:ml-1 md:h-5 md:min-w-5 md:px-1.5 md:text-tiny-plus ${
                        isActiveTransfer
                            ? 'bg-primary text-primary-foreground shadow-primary-glow-lg'
                            : 'border border-white/5 bg-white/5 text-muted-foreground group-data-[state=active]:border-white/20 group-data-[state=active]:bg-white/10 group-data-[state=active]:text-foreground'
                    }`}
                >
                    {fileCount}
                </span>
            </div>
        </TabsTrigger>
    );
}
