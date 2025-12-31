'use client';

import React from 'react';
import { Github, Shield, Zap, Lock } from 'lucide-react';

export function Footer() {
    return (
        <footer className="relative mt-20 py-12 border-t border-white/[0.05] overflow-hidden">
            <div className="container mx-auto px-4 max-w-6xl relative">
                {/* Single Line Features */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-3 mb-10 text-[14px] font-medium text-white/90 text-center md:text-left">
                    <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 group cursor-default">
                        <Shield className="w-4.5 h-4.5 text-sky-400 group-hover:scale-110 transition-transform" />
                        <span className="tracking-tight">
                            Direct P2P <span className="text-white/40 mx-1">—</span> No Server
                            Storage
                        </span>
                    </div>
                    <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 group cursor-default">
                        <Zap className="w-4.5 h-4.5 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="tracking-tight">Blazing Fast WebRTC</span>
                    </div>
                    <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 group cursor-default">
                        <Lock className="w-4.5 h-4.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="tracking-tight">100% Private & Anonymous</span>
                    </div>
                </div>

                {/* Minimal Bottom Bar */}
                <div className="pt-8 border-t border-white/[0.03] flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <a
                        href="https://kai.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-1.5 px-4 rounded-full bg-white/[0.02] border border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group"
                    >
                        <span>Crafted by</span>
                        <div className="flex items-center gap-2">
                            <img
                                src="/author-logo.svg"
                                alt="KAI"
                                className="w-4 h-4 transition-all duration-700 group-hover:rotate-[360deg] group-hover:scale-125"
                            />
                            <span className="font-extrabold tracking-[0.25em] text-[#00F07C]">
                                KAI
                            </span>
                        </div>
                    </a>

                    <a
                        href="https://github.com/nishan-paul-2022/flick-p2p-file-sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 py-1.5 px-4 rounded-full bg-white/[0.02] border border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group"
                    >
                        <span>SOURCE CODE</span>
                        <Github className="w-3.5 h-3.5 text-white group-hover:rotate-[360deg] transition-all duration-500" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
