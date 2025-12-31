'use client';

import React from 'react';
import Image from 'next/image';
import { Github, Shield, Zap, Lock } from 'lucide-react';

export function Footer() {
    return (
        <footer className="relative mt-10 py-4 border-t border-white/[0.05] overflow-hidden">
            <div className="container mx-auto px-4 max-w-6xl relative">
                {/* Single Line Features */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-x-6 gap-y-1 mb-2 text-[13px] font-medium text-white/90 text-center md:text-left">
                    <div className="flex items-center gap-2 transition-all duration-300 hover:opacity-80 group cursor-default">
                        <Shield className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                        <span className="tracking-tight">
                            Direct P2P <span className="text-white/40 mx-1">—</span> No Server
                            Storage
                        </span>
                    </div>
                    <div className="flex items-center gap-2 transition-all duration-300 hover:opacity-80 group cursor-default">
                        <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="tracking-tight">Blazing Fast WebRTC</span>
                    </div>
                    <div className="flex items-center gap-2 transition-all duration-300 hover:opacity-80 group cursor-default">
                        <Lock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="tracking-tight">100% Private & Anonymous</span>
                    </div>
                </div>

                {/* Minimal Bottom Bar */}
                <div className="pt-0 flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <a
                        href="https://kai-king.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-1.5 px-4 rounded-full bg-white/[0.02] border border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group"
                    >
                        <span>PRODUCED by</span>
                        <div className="flex items-center gap-2">
                            <Image
                                src="/author-logo.svg"
                                alt="KAI"
                                width={16}
                                height={16}
                                className="w-4 h-4 transition-all duration-700 group-hover:rotate-[360deg] group-hover:scale-125"
                            />
                            <span className="font-extrabold tracking-[0.25em] text-[#00F07C] transition-all duration-700 group-hover:rotate-[360deg]">
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
