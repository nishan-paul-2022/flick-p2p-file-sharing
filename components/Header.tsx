'use client';

import { motion } from 'framer-motion';
import { Fingerprint, Settings } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';

const SettingsModal = dynamic(() => import('./SettingsModal').then((mod) => mod.SettingsModal), {
    ssr: false,
});
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface HeaderProps {
    isLogPanelOpen: boolean;
    toggleLogPanel: () => void;
    hasUnreadLogs: boolean;
}

export function Header({ isLogPanelOpen, toggleLogPanel, hasUnreadLogs }: HeaderProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    return (
        <>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-8 mt-1 flex w-full items-center justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/30 px-4 py-2 backdrop-blur-3xl md:mb-12 md:mt-2 md:rounded-full md:px-8 md:py-3"
            >
                {/* Ambient Glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-1/2 w-3/4 -translate-x-1/2 rounded-full bg-primary/10 opacity-50 blur-huge" />

                {/* Left: Fingerprint Icon (Event Logs) */}
                <div className="relative z-10 flex flex-1 justify-start">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-300 md:h-10 md:w-10 ${
                                    isLogPanelOpen
                                        ? 'border-white/20 bg-white/10'
                                        : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.08]'
                                }`}
                                onClick={toggleLogPanel}
                                aria-label="Toggle Event Logs"
                            >
                                <Fingerprint
                                    className={`h-4 w-4 transition-colors duration-300 md:h-5 md:w-5 ${
                                        isLogPanelOpen
                                            ? 'text-white'
                                            : 'text-white/40 group-hover:text-white/80'
                                    }`}
                                />
                                {/* Notification Dot */}
                                {hasUnreadLogs && (
                                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                                )}
                            </motion.button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={8}>
                            System Logs
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Center: Flick Logo */}
                <div className="relative z-10 mx-2 flex flex-1 justify-center">
                    <div className="flex items-center gap-2 md:gap-3">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                        >
                            <Image
                                src="/icon.svg"
                                alt="Flick Icon"
                                width={40}
                                height={40}
                                className="h-7 w-7 md:h-10 md:w-10"
                                priority
                            />
                        </motion.div>
                        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl lg:text-4xl">
                            <span className="text-primary">Flick</span>
                        </h1>
                    </div>
                </div>

                {/* Right: Settings & Slogan */}
                <div className="relative z-10 flex flex-1 justify-end gap-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] md:h-10 md:w-10"
                                onClick={() => setIsSettingsOpen(true)}
                                aria-label="Settings"
                            >
                                <Settings className="h-4 w-4 text-white/40 transition-colors duration-300 group-hover:text-white/80 md:h-5 md:w-5" />
                            </motion.button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={8}>
                            Connection Settings
                        </TooltipContent>
                    </Tooltip>
                </div>
            </motion.div>
        </>
    );
}
