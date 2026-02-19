import { Wifi, WifiOff } from 'lucide-react';

import { cn } from '@/shared/utils';
import { usePeerStore } from '@/store';

export function ConnectionStatus() {
    const connectionQuality = usePeerStore((state) => state.connectionQuality);

    const config = {
        excellent: {
            icon: Wifi,
            text: 'Live',
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            border: 'border-green-400/20',
        },
        good: {
            icon: Wifi,
            text: 'Stable',
            color: 'text-brand-400',
            bg: 'bg-brand-400/10',
            border: 'border-brand-400/20',
        },
        poor: {
            icon: Wifi,
            text: 'Weak',
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            border: 'border-amber-400/20',
        },
        disconnected: {
            icon: WifiOff,
            text: 'Offline',
            color: 'text-white/20',
            bg: 'bg-white/5',
            border: 'border-white/5',
        },
    };

    const state = config[connectionQuality as keyof typeof config] || config.disconnected;
    const Icon = state.icon;

    return (
        <div className={cn('connection-status', state.border)}>
            <div
                className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-500',
                    state.bg
                )}
            >
                <Icon className={cn('h-3 w-3 transition-colors duration-500', state.color)} />
            </div>
            <span
                className={cn(
                    'whitespace-nowrap text-3xs font-black uppercase leading-none tracking-widest-lg transition-colors duration-500',
                    state.color
                )}
            >
                {state.text}
            </span>
        </div>
    );
}
