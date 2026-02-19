'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Globe, Key, Settings, Shield, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

const providers = [
    {
        name: 'Xirsys',
        desc: 'Industry standard WebRTC infrastructure. Reliable TURN/STUN servers for cross-network sharing.',
        steps: ['Sign up at xirsys.com', 'Create a Channel', 'Copy Ident & Secret'],
        icon: Globe,
        color: 'text-blue-400',
        link: 'https://xirsys.com',
    },
    {
        name: 'Metered',
        desc: 'Global TURN server network with a generous free tier. Perfect for global file transfers.',
        steps: ['Create Metered account', 'Get App Key', 'Add to Flick settings'],
        icon: Zap,
        color: 'text-amber-400',
        link: 'https://metered.ca',
    },
];

export function SetupGuide() {
    return (
        <section className="relative overflow-hidden px-4 py-24">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-[120px]" />

            <div className="relative mx-auto max-w-6xl">
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-400"
                    >
                        <Settings className="h-4 w-4" />
                        Infrastructure Setup
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-6 text-3xl font-bold tracking-tight md:text-5xl"
                    >
                        Master Your Connections
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto max-w-2xl text-lg text-muted-foreground"
                    >
                        Flick works instantly on local networks. For global transfers, connect your
                        own TURN servers in seconds.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
                        {providers.map((provider, idx) => (
                            <motion.div
                                key={provider.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-surface-900/50 p-8 transition-all duration-500 hover:border-brand-500/30"
                            >
                                <div className="absolute -right-24 -top-24 h-48 w-48 bg-brand-500/10 blur-[80px] transition-all duration-500 group-hover:bg-brand-500/20" />

                                <div className="relative z-10">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div
                                            className={`rounded-2xl border border-white/5 bg-surface-800 p-4 ${provider.color}`}
                                        >
                                            <provider.icon className="h-8 w-8" />
                                        </div>
                                        <a
                                            href={provider.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand-400"
                                        >
                                            API Portal <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>

                                    <h3 className="mb-3 text-2xl font-bold">
                                        {provider.name} Config
                                    </h3>
                                    <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                                        {provider.desc}
                                    </p>

                                    <div className="mb-8 space-y-4">
                                        {provider.steps.map((step, sIdx) => (
                                            <div key={sIdx} className="flex items-center gap-3">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10 text-[10px] font-bold text-brand-400">
                                                    {sIdx + 1}
                                                </div>
                                                <span className="text-sm text-foreground/80">
                                                    {step}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Visual Mockup of the Settings Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-brand-500/20 to-transparent p-1 shadow-2xl"
                    >
                        <div className="rounded-[2.2rem] bg-surface-950 p-6">
                            <div className="mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                                <Settings className="h-5 w-5 text-brand-400" />
                                <span className="text-sm font-bold uppercase tracking-widest">
                                    Flick Settings
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3 rounded-2xl border border-white/5 bg-surface-900 p-4">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Xirsys Ident</span>
                                        <Key className="h-3 w-3" />
                                    </div>
                                    <div className="flex h-10 w-full items-center rounded-xl border border-white/5 bg-black/40 px-4">
                                        <div className="h-1.5 w-24 rounded-full bg-brand-500/20" />
                                    </div>

                                    <div className="flex items-center justify-between pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Xirsys Secret</span>
                                        <Shield className="h-3 w-3" />
                                    </div>
                                    <div className="flex h-10 w-full items-center rounded-xl border border-white/5 bg-black/40 px-4">
                                        <div className="h-1.5 w-32 rounded-full bg-brand-500/20" />
                                    </div>
                                </div>

                                <Button className="w-full rounded-xl bg-brand-500 py-6 font-bold shadow-lg shadow-brand-500/20">
                                    Save Configuration
                                </Button>

                                <p className="text-center text-[10px] text-muted-foreground">
                                    Click the <Settings className="mx-1 inline h-3 w-3" /> icon in
                                    the app header to open this panel.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mx-auto mt-16 max-w-3xl rounded-[2rem] border border-brand-500/10 bg-brand-500/5 p-8 text-center"
                >
                    <div className="mb-4 flex items-center justify-center gap-3 text-brand-400">
                        <Shield className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            Privacy Guaranteed
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Your API keys are stored **exclusively** in your browser's local storage. We
                        never see, touch, or store your infrastructure credentials on any server.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
