import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProviderCardProps {
    label: string;
    active: boolean;
    onSelect: () => void;
    disabled: boolean;
}

export function ProviderCard({ label, active, onSelect, disabled }: ProviderCardProps) {
    return (
        <div
            onClick={() => !disabled && onSelect()}
            className={cn(
                'relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-300',
                active
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                disabled && 'pointer-events-none opacity-50'
            )}
        >
            <div className="flex items-center justify-between">
                <span className={cn('font-medium', active ? 'text-emerald-400' : 'text-white')}>
                    {label}
                </span>
                {active && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black">
                        <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                )}
            </div>
        </div>
    );
}
