'use client';

import { motion } from 'framer-motion';
import { FileUp, Laptop, Share2, ShieldCheck, Smartphone } from 'lucide-react';

const steps = [
    {
        title: 'Create a Room',
        desc: 'Device A generates a secure 6-char code',
        icon: Laptop,
    },
    {
        title: 'Connect',
        desc: 'Device B enters the code to join',
        icon: Smartphone,
    },
    {
        title: 'Direct Link',
        desc: 'P2P tunnel established via WebRTC',
        icon: Share2,
    },
    {
        title: 'Secure Transfer',
        desc: 'Files flow directly, zero server storage',
        icon: ShieldCheck,
    },
];

export function WorkflowAnimation() {
    return (
        <div className="relative mx-auto w-full max-w-4xl overflow-hidden px-4 py-20">
            <div className="mb-16 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent md:text-4xl"
                >
                    Seamless P2P Magic
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="mx-auto max-w-2xl text-lg text-muted-foreground"
                >
                    No clouds. No accounts. Just direct device-to-device transfers.
                </motion.p>
            </div>

            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-4">
                {/* Connecting lines for desktop */}
                <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-12 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent md:block" />

                {steps.map((step, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.2 }}
                        className="relative z-10 flex flex-col items-center text-center"
                    >
                        <div className="relative mb-6">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    delay: idx * 0.5,
                                }}
                                className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-surface-800 shadow-glass-lg backdrop-blur-sm transition-colors group-hover:border-brand-500/50"
                            >
                                <step.icon className="h-8 w-8 text-brand-400" />
                            </motion.div>

                            {/* Animated progress indicator */}
                            <motion.div
                                className="absolute -inset-2 rounded-[2rem] border-2 border-brand-500/20 border-t-brand-500"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>

                        <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                        <p className="px-4 text-sm leading-relaxed text-muted-foreground">
                            {step.desc}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Visual File Transfer Demo */}
            <div className="glass-dark relative mt-24 flex h-64 w-full items-center justify-between overflow-hidden rounded-[2.5rem] border-white/5 px-12 md:px-24">
                {/* Background Glow */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-brand-500/5 blur-[100px]" />

                {/* Device A */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="z-10 flex flex-col items-center gap-4"
                >
                    <div className="relative flex h-24 w-16 items-center justify-center rounded-2xl border-4 border-surface-700 bg-surface-900">
                        <div className="absolute top-2 h-1 w-1 rounded-full bg-surface-700" />
                        <Laptop className="h-6 w-6 text-brand-400/50" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-widest text-brand-400/80">
                        Sender
                    </span>
                </motion.div>

                {/* Transfer Path */}
                <div className="relative mx-8 h-px flex-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/40 to-brand-500/0" />

                    {/* Animated File Packets */}
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ x: '0%', opacity: 0 }}
                            animate={{
                                x: '100%',
                                opacity: [0, 1, 1, 0],
                                scale: [0.8, 1, 1, 0.8],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: i * 0.6,
                            }}
                            className="absolute top-1/2 -translate-y-1/2"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/20 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                                <FileUp className="h-5 w-5 text-brand-400" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Device B */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="z-10 flex flex-col items-center gap-4"
                >
                    <div className="relative flex h-24 w-16 items-center justify-center rounded-2xl border-4 border-surface-700 bg-surface-900">
                        <div className="absolute top-2 h-1 w-1 rounded-full bg-surface-700" />
                        <Smartphone className="h-6 w-6 text-brand-400/50" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-widest text-brand-400/80">
                        Receiver
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
