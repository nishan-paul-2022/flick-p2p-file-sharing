import { Heart } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
    return (
        <footer className="relative mt-12 overflow-hidden border-t border-white/5">
            <div className="container relative mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-10">
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-[0.3em] text-white">
                    <div className="flex items-center gap-2">
                        <span>© {new Date().getFullYear()}</span>
                        <span className="text-white">flick</span>
                    </div>

                    <span className="hidden h-1 w-1 rounded-full bg-white sm:block" />

                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2">
                            Built with <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </span>
                        <span>by</span>
                        <a
                            href="https://kaiverse.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 transition-all duration-500"
                        >
                            <div className="relative h-7 w-7 overflow-hidden rounded-full transition-all duration-500">
                                <Image
                                    src="/author-logo.svg"
                                    alt="KAI"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:rotate-[360deg] group-hover:scale-110"
                                />
                            </div>
                            <span className="text-sm font-black tracking-[0.2em] text-[#00F07C] transition-all duration-300 group-hover:text-[#00FF84]">
                                KAI
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
