import { Github } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export function Footer() {
    return (
        <footer className="relative mt-10 overflow-hidden border-t border-white/[0.05] py-4">
            <div className="container relative mx-auto max-w-6xl px-4">
                <div className="flex flex-wrap items-center justify-center gap-2 pt-0 text-2xs font-bold uppercase tracking-widest-xl">
                    <a
                        href="https://kaiverse.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-7 items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.02] px-3 text-white/40 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white"
                    >
                        <span>PRODUCED by</span>
                        <div className="flex items-center gap-2">
                            <Image
                                src="/author-logo.svg"
                                alt="KAI"
                                width={24}
                                height={24}
                                className="h-6 w-6 transition-all duration-700 group-hover:rotate-[360deg] group-hover:scale-125"
                            />
                            <span className="text-xs font-extrabold tracking-widest-2xl text-[#00F07C] transition-all duration-700 group-hover:rotate-[360deg]">
                                KAI
                            </span>
                        </div>
                    </a>

                    <a
                        href="https://github.com/nishan-paul-2022/flick-p2p-file-sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-7 items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.02] px-3 text-white/40 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white"
                    >
                        <span>SOURCE CODE</span>
                        <Github className="h-4 w-4 text-white transition-all duration-500 group-hover:rotate-[360deg]" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
