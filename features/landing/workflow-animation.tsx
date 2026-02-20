'use client';

import { motion } from 'framer-motion';
import { FileUp, Monitor, Share2, ShieldCheck, Smartphone } from 'lucide-react';

const steps = [
    {
        title: 'Create a Room',
        desc: 'Device A generates a secure code',
        icon: Monitor,
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
            </div>

            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-4">
                {/* Connecting lines for desktop */}
                <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-12 bg-gradient-to-r from-transparent via-primary/10 to-transparent md:block" />

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
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    delay: idx * 0.5,
                                }}
                                className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.08] bg-zinc-900/50 shadow-glass-lg backdrop-blur-sm transition-colors group-hover:border-primary/50"
                            >
                                <step.icon className="h-8 w-8 text-primary" />
                            </motion.div>

                            {/* Rotating border accent */}
                            <motion.div
                                className="absolute -inset-2 rounded-[2rem] border-2 border-primary/10"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>

                        <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Visual File Transfer Demo - Matching App style */}
            <div className="relative mt-24 flex h-64 w-full items-center justify-between overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-zinc-900/20 px-12 backdrop-blur-md md:px-24">
                {/* Device A - Computer */}
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="relative flex h-20 w-28 items-center justify-center rounded-xl border-4 border-zinc-800 bg-zinc-950 shadow-2xl"
                    >
                        {/* Camera/Sensor */}
                        <div className="absolute top-2 h-1 w-1 rounded-full bg-zinc-800" />

                        {/* Monitor Stand */}
                        <div className="absolute -bottom-3 h-3 w-8 rounded-b-lg bg-zinc-800" />
                        <div className="absolute -bottom-4 h-1 w-12 rounded-full bg-zinc-800" />
                    </motion.div>
                    <span className="absolute top-[calc(100%+2rem)] whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-white">
                        Sender
                    </span>
                </div>

                {/* Transfer Path */}
                <div className="relative mx-8 flex h-px flex-1 items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

                    {/* Animated File Packet */}
                    <motion.div
                        initial={{ left: '0%', x: '-50%', y: '-50%', opacity: 0 }}
                        animate={{
                            left: '100%',
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className="absolute top-1/2 z-20"
                    >
                        <FileUp className="h-8 w-8 text-primary/80" />
                    </motion.div>
                </div>

                {/* Device B - Mobile */}
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="relative flex h-24 w-16 items-center justify-center rounded-[1.5rem] border-4 border-zinc-800 bg-zinc-950 shadow-2xl"
                    ></motion.div>
                    <span className="absolute top-[calc(100%+1rem)] whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-white">
                        Receiver
                    </span>
                </div>
            </div>
        </div>
    );
}
