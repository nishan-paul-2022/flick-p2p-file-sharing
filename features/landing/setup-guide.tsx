'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    CheckCircle2,
    Copy,
    ExternalLink,
    Globe,
    Key,
    MousePointer2,
    Settings,
    Shield,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';

const providers = [
    {
        id: 'xirsys',
        name: 'Xirsys',
        desc: 'Enterprise WebRTC Infrastructure',
        steps: ['Sign up at xirsys.com', 'Create a Channel', 'Copy Ident & Secret'],
        icon: Globe,
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgColor: 'bg-blue-500/10',
        link: 'https://xirsys.com',
        keys: { ident: 'flick-user-88', secret: '••••••••••••••••' },
    },
    {
        id: 'metered',
        name: 'Metered',
        desc: 'Global TURN/STUN Network',
        steps: ['Create Metered account', 'Get App Key', 'Add to Flick settings'],
        icon: Zap,
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bgColor: 'bg-amber-500/10',
        link: 'https://metered.ca',
        keys: { ident: 'metered-prod-ak', secret: '••••••••••••••••' },
    },
];

export function SetupGuide() {
    const [activeProvider, setActiveProvider] = useState(providers[0]);
    const [isConfigured, setIsConfigured] = useState(false);
    const [animatingStep, setAnimatingStep] = useState(-1);

    const simulateSetup = async () => {
        setIsConfigured(false);
        for (let i = 0; i < 3; i++) {
            setAnimatingStep(i);
            await new Promise((resolve) => setTimeout(resolve, 800));
        }
        setAnimatingStep(-1);
        setIsConfigured(true);
    };

    return (
        <section className="relative overflow-hidden px-4 py-32">
            {/* Background Glows */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

            <div className="relative mx-auto max-w-7xl">
                <div className="mb-20 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-6 text-4xl font-black tracking-tight md:text-6xl"
                    >
                        MASTER YOUR <span className="text-primary">CONNECTION</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto max-w-2xl text-lg font-medium text-white/60"
                    >
                        Instant local sharing. One-click global setup.
                        <br className="hidden md:block" /> Perfect privacy, zero configuration
                        overhead.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-2">
                    {/* Left: Interactive Provider Selection */}
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4">
                            {providers.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setActiveProvider(p);
                                        setIsConfigured(false);
                                    }}
                                    className={`relative flex-1 rounded-3xl border p-6 text-left transition-all duration-500 ${
                                        activeProvider.id === p.id
                                            ? `${p.borderColor} ${p.bgColor}`
                                            : 'border-white/5 bg-white/[0.02] grayscale hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <p.icon
                                        className={`mb-4 h-6 w-6 ${
                                            activeProvider.id === p.id ? p.color : 'text-white/20'
                                        }`}
                                    />
                                    <h4 className="font-bold">{p.name}</h4>
                                    <p className="text-xs text-white/40">{p.desc}</p>
                                    {activeProvider.id === p.id && (
                                        <motion.div
                                            layoutId="provider-accent"
                                            className="shadow-glow-primary absolute bottom-4 right-4 h-2 w-2 rounded-full bg-primary"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="relative flex-1 overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/40 p-10 backdrop-blur-xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeProvider.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black">Quick Setup</h3>
                                        <a
                                            href={activeProvider.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                                        >
                                            Portal <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>

                                    <div className="space-y-6">
                                        {activeProvider.steps.map((step, idx) => (
                                            <motion.div
                                                key={idx}
                                                animate={{
                                                    opacity: animatingStep === idx ? 1 : 0.4,
                                                    x: animatingStep === idx ? 10 : 0,
                                                }}
                                                className="flex items-center gap-4"
                                            >
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-black ${
                                                        animatingStep === idx
                                                            ? 'border-primary bg-primary text-black'
                                                            : 'border-white/10 bg-zinc-900'
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </div>
                                                <span className="font-medium">{step}</span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={simulateSetup}
                                        disabled={animatingStep !== -1}
                                        className="h-14 w-full rounded-2xl bg-white text-black hover:bg-white/90"
                                    >
                                        {animatingStep !== -1 ? (
                                            <Activity className="h-5 w-5 animate-pulse" />
                                        ) : (
                                            'Run Live Demo'
                                        )}
                                    </Button>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: The Dynamic Mockup */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="relative h-full overflow-hidden rounded-[3rem] border border-white/10 bg-black/60 p-8 shadow-2xl backdrop-blur-2xl"
                        >
                            {/* Header */}
                            <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-red-500/50" />
                                    <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/50" />
                                    <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                                        Flick Interface
                                    </span>
                                </div>
                                <Settings className="h-4 w-4 text-white/20" />
                            </div>

                            {/* Status Bar */}
                            <div className="mb-10 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
                                <div className="flex items-center justify-center gap-3">
                                    <Activity
                                        className={`h-4 w-4 ${
                                            isConfigured ? 'text-primary' : 'text-white/20'
                                        }`}
                                    />
                                    <span
                                        className={`text-xs font-bold uppercase tracking-widest ${
                                            isConfigured ? 'text-primary' : 'text-white/40'
                                        }`}
                                    >
                                        {isConfigured
                                            ? 'Global Tunnel Active'
                                            : 'Waiting for Config'}
                                    </span>
                                </div>
                            </div>

                            {/* Form Fields with Live Typing Effect */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <span>Ident</span>
                                        <Key className="h-3 w-3" />
                                    </label>
                                    <div className="group relative flex h-14 items-center rounded-2xl border border-white/10 bg-zinc-900/50 px-5">
                                        <span className="text-sm font-medium">
                                            {animatingStep >= 1 ? activeProvider.keys.ident : ''}
                                        </span>
                                        {animatingStep === 1 && (
                                            <motion.div
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.8 }}
                                                className="ml-1 h-4 w-0.5 bg-primary"
                                            />
                                        )}
                                        <MousePointer2 className="absolute -right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <span>Secret</span>
                                        <Shield className="h-3 w-3" />
                                    </label>
                                    <div className="flex h-14 items-center rounded-2xl border border-white/10 bg-zinc-900/50 px-5">
                                        <span className="text-sm tracking-widest">
                                            {animatingStep >= 2 ? activeProvider.keys.secret : ''}
                                        </span>
                                        {animatingStep === 2 && (
                                            <motion.div
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.8 }}
                                                className="ml-1 h-4 w-0.5 bg-primary"
                                            />
                                        )}
                                    </div>
                                </div>

                                <motion.button
                                    animate={
                                        isConfigured
                                            ? { scale: [1, 1.02, 1], backgroundColor: '#0ea5e9' }
                                            : {}
                                    }
                                    className={`mt-4 h-16 w-full rounded-2xl font-black uppercase tracking-widest transition-all ${
                                        isConfigured
                                            ? 'bg-primary text-black'
                                            : 'bg-white/5 text-white/20'
                                    }`}
                                >
                                    {isConfigured ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Configuration Saved
                                        </div>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </motion.button>
                            </div>

                            {/* Visual Feedback on success */}
                            <AnimatePresence>
                                {isConfigured && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md"
                                    >
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <div className="shadow-glow-primary flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                                                <Zap className="h-10 w-10 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black uppercase tracking-tighter">
                                                    Systems Ready
                                                </h4>
                                                <p className="text-sm text-white/60">
                                                    Encryption active. Tunnel established.
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsConfigured(false)}
                                                className="mt-4 border-primary/40 text-primary hover:bg-primary/10"
                                            >
                                                Reset Demo
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 flex flex-wrap items-center justify-center gap-12 border-t border-white/5 pt-20"
                >
                    <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            Zero-Knowledge Protocol
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Copy className="h-5 w-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            Client-Side Storage
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            Global Coverage
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
