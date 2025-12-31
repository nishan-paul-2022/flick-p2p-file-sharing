'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Fingerprint, Sparkles } from 'lucide-react';

interface HeaderProps {
    isLogPanelOpen: boolean;
    toggleLogPanel: () => void;
    hasUnreadLogs: boolean;
}

export function Header({ isLogPanelOpen, toggleLogPanel, hasUnreadLogs }: HeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mt-1 md:mt-2 mb-8 md:mb-12 w-full bg-zinc-900/30 border border-white/[0.08] rounded-2xl md:rounded-full px-4 md:px-8 py-2 md:py-3 backdrop-blur-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden"
        >
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-primary/10 blur-[60px] rounded-full pointer-events-none opacity-50" />

            {/* Left: Fingerprint Icon (Event Logs) */}
            <div className="flex-1 flex justify-start relative z-10">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border backdrop-blur-md shadow-lg group cursor-pointer transition-all duration-300 relative ${
                        isLogPanelOpen
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                    onClick={toggleLogPanel}
                    aria-label="Toggle Event Logs"
                >
                    <Fingerprint
                        className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${
                            isLogPanelOpen
                                ? 'text-white'
                                : 'text-white/40 group-hover:text-white/80'
                        }`}
                    />
                    {/* Notification Dot */}
                    {hasUnreadLogs && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)] animate-pulse" />
                    )}
                </motion.div>
            </div>

            {/* Center: Flick Logo */}
            <div className="flex-[2] md:flex-1 flex justify-center relative z-10 mx-2">
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
                            className="w-7 h-7 md:w-10 md:h-10"
                            priority
                        />
                    </motion.div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
                        <span className="text-primary">Flick</span>
                    </h1>
                </div>
            </div>

            {/* Right: Slogan */}
            <div className="flex-1 hidden md:flex justify-end relative z-10">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-[10px] lg:text-xs font-bold tracking-tight text-white/90 truncate max-w-[120px] lg:max-w-none">
                        Securely share files across devices
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
