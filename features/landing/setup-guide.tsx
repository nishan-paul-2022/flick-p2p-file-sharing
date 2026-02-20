'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    Check,
    Copy,
    ExternalLink,
    Globe,
    MousePointer2,
    Settings,
    Shield,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';

const providers = [
    {
        id: 'xirsys',
        name: 'Xirsys',
        desc: 'Enterprise WebRTC Infrastructure',
        steps: [
            <span key="1">
                Sign up at{' '}
                <a
                    href="https://xirsys.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                    xirsys.com <ExternalLink className="h-3 w-3" />
                </a>
            </span>,
            'Create a Channel',
            'Copy Ident & Secret',
            'Add to Flick settings',
        ],
        icon: Globe,
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgColor: 'bg-blue-500/10',
        link: 'https://xirsys.com',
        keys: { ident: 'XOR2025', secret: '••••••••••••••••••••', channel: 'Flick' },
    },
    {
        id: 'metered',
        name: 'Metered',
        desc: 'Global TURN/STUN Network',
        steps: [
            <span key="1">
                Sign up at{' '}
                <a
                    href="https://metered.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                    metered.ca <ExternalLink className="h-3 w-3" />
                </a>
            </span>,
            'Get API Key',
            'Add to Flick settings',
        ],
        icon: Zap,
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bgColor: 'bg-amber-500/10',
        link: 'https://metered.ca',
        keys: { ident: '', secret: '••••••••••••••••••••', channel: '' },
    },
];

export function SetupGuide() {
    const [activeProvider, setActiveProvider] = useState(providers[0]);
    const [isConfigured, setIsConfigured] = useState(false);
    const [animatingStep, setAnimatingStep] = useState(-1);

    const stepsCount = activeProvider.id === 'xirsys' ? 4 : 3;
    const lastStepIndex = stepsCount - 1;
    const isDemoRunning = animatingStep >= 0 && animatingStep < lastStepIndex;

    const simulateSetup = async () => {
        setIsConfigured(false);
        setAnimatingStep(-1);
        for (let i = 0; i < stepsCount; i++) {
            setAnimatingStep(i);
            await new Promise((resolve) => setTimeout(resolve, 800));
        }
        // Demo done: fields stay filled, Apply looks active, Run Live Demo becomes clickable again
    };

    const isTypingComplete = animatingStep === lastStepIndex;

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
                                        setAnimatingStep(-1);
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
                                    </div>

                                    <div className="space-y-6">
                                        {activeProvider.steps.map((step, idx) => (
                                            <motion.div
                                                key={idx}
                                                animate={{
                                                    opacity: animatingStep === idx ? 1 : 0.4,
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
                                        disabled={isDemoRunning}
                                        className="h-14 w-full rounded-2xl bg-white text-black hover:bg-white/90"
                                    >
                                        {isDemoRunning ? (
                                            <Activity className="h-5 w-5 animate-pulse" />
                                        ) : (
                                            'Run Live Demo'
                                        )}
                                    </Button>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: The Dynamic Mockup - Matching provided images */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="relative h-full overflow-hidden rounded-[2.5rem] bg-[#0A0A0A] p-0 shadow-2xl transition-all"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                        <Settings className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        Connection Settings
                                    </span>
                                </div>
                                <X className="h-5 w-5 text-white/40" />
                            </div>

                            <div className="h-px w-full bg-white/[0.05]" />

                            <div className="p-8 pb-32">
                                {/* Configuration Status Indicator */}
                                <AnimatePresence>
                                    {isConfigured && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mb-8 overflow-hidden"
                                        >
                                            <div className="flex items-center gap-3 rounded-2xl border border-[#00F07C]/30 bg-[#00F07C]/5 px-4 py-3">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F07C]/20">
                                                    <Activity className="h-3 w-3 text-[#00F07C]" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00F07C]">
                                                    Global Tunnel Active
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Provider Toggle */}
                                <div className="mb-8 space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        Active Provider
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {providers.map((p) => (
                                            <div
                                                key={p.id}
                                                className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition-all ${
                                                    activeProvider.id === p.id
                                                        ? 'border-[#008F4C]/50 bg-[#008F4C]/10 text-[#00F07C]'
                                                        : 'border-white/5 bg-zinc-900/50 text-white/60'
                                                }`}
                                            >
                                                <span className="text-sm font-semibold">
                                                    {p.name}
                                                </span>
                                                {activeProvider.id === p.id && (
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F07C]">
                                                        <Check className="h-3 w-3 text-black" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Fields */}
                                <div className="space-y-6">
                                    {activeProvider.id === 'xirsys' ? (
                                        <>
                                            <div className="space-y-3">
                                                <label className="text-xs font-medium text-white/40">
                                                    Ident
                                                </label>
                                                <div className="relative flex h-12 items-center rounded-xl border border-white/5 bg-zinc-900/80 px-4">
                                                    <span className="text-sm text-white/90">
                                                        {animatingStep >= 0 || isConfigured
                                                            ? activeProvider.keys.ident
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-medium text-white/40">
                                                    Secret
                                                </label>
                                                <div className="flex h-12 items-center rounded-xl border border-white/5 bg-zinc-900/80 px-4">
                                                    <span className="text-sm tracking-widest text-white/90">
                                                        {animatingStep >= 1 || isConfigured
                                                            ? activeProvider.keys.secret
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-medium text-white/40">
                                                    Channel
                                                </label>
                                                <div className="relative flex h-12 items-center rounded-xl border border-white/5 bg-zinc-900/80 px-4">
                                                    <span className="text-sm text-white/90">
                                                        {animatingStep >= 2 || isConfigured
                                                            ? activeProvider.keys.channel
                                                            : ''}
                                                    </span>
                                                    <MousePointer2 className="absolute -right-4 top-10 h-5 w-5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            <label className="text-xs font-medium text-white/40">
                                                API Key
                                            </label>
                                            <div className="flex h-12 items-center rounded-xl border border-white/5 bg-zinc-900/80 px-4">
                                                <span className="text-sm tracking-widest text-white/90">
                                                    {animatingStep >= 1 || isConfigured
                                                        ? activeProvider.keys.secret
                                                        : ''}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer - Apply looks active when fields filled but not clickable */}
                            <div className="absolute bottom-0 left-0 flex w-full items-center justify-end gap-4 bg-[#111111]/80 px-8 py-6 backdrop-blur-md">
                                <span className="text-sm font-medium text-white/60">Cancel</span>
                                <div
                                    className={`flex cursor-default items-center gap-2 rounded-xl px-8 py-3 font-bold transition-all ${
                                        isTypingComplete
                                            ? 'bg-white text-black shadow-lg shadow-white/10'
                                            : 'bg-white/10 text-white/40'
                                    }`}
                                    aria-hidden
                                >
                                    <Check className="h-4 w-4" />
                                    Apply
                                </div>
                            </div>
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
