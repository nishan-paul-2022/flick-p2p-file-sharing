'use client';

import { Github, Lock, Shield, Zap } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export function Footer() {
    return (
        <footer className="relative mt-10 overflow-hidden border-t border-white/[0.05] py-4">
            <div className="container relative mx-auto max-w-6xl px-4">
                {/* Single Line Features */}
                <div className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center text-xs font-medium text-white/90">
                    <div className="group flex cursor-default items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3.5 py-1.5 shadow-glass-sm transition-all duration-300 hover:opacity-80">
                        <Shield className="h-4 w-4 text-sky-400 transition-transform group-hover:scale-110" />
                        <span className="tracking-tight">
                            Direct P2P <span className="mx-1 text-white/40">—</span> No Server
                            Storage
                        </span>
                    </div>
                    <div className="group flex cursor-default items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3.5 py-1.5 shadow-glass-sm transition-all duration-300 hover:opacity-80">
                        <Zap className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-110" />
                        <span className="tracking-tight">Blazing Fast WebRTC</span>
                    </div>
                    <div className="group flex cursor-default items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3.5 py-1.5 shadow-glass-sm transition-all duration-300 hover:opacity-80">
                        <Lock className="h-4 w-4 text-emerald-400 transition-transform group-hover:scale-110" />
                        <span className="tracking-tight">100% Private & Anonymous</span>
                    </div>
                </div>

                {/* Minimal Bottom Bar */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-0 text-2xs font-bold uppercase tracking-widest-xl">
                    <a
                        href="https://kaiverse.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-1.5 text-white/40 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white"
                    >
                        <span>PRODUCED by</span>
                        <div className="flex items-center gap-2">
                            <Image
                                src="/author-logo.svg"
                                alt="KAI"
                                width={16}
                                height={16}
                                className="h-4 w-4 transition-all duration-700 group-hover:rotate-[360deg] group-hover:scale-125"
                            />
                            <span className="font-extrabold tracking-widest-2xl text-[#00F07C] transition-all duration-700 group-hover:rotate-[360deg]">
                                KAI
                            </span>
                        </div>
                    </a>

                    <a
                        href="https://github.com/nishan-paul-2022/flick-p2p-file-sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2.5 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-1.5 text-white/40 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white"
                    >
                        <span>SOURCE CODE</span>
                        <Github className="h-3.5 w-3.5 text-white transition-all duration-500 group-hover:rotate-[360deg]" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
