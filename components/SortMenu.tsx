'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useClickOutside } from '@/lib/hooks/use-click-outside';
import { useKeyDown } from '@/lib/hooks/use-key-down';
import { SortBy, SortOrder } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SortMenuProps {
    sortBy: SortBy;
    onSortByChange: (sortBy: SortBy) => void;
    sortOrder: SortOrder;
    onSortOrderChange: (sortOrder: SortOrder) => void;
    disabled?: boolean;
}

export function SortMenu({
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
    disabled = false,
}: SortMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsOpen(false));
    useKeyDown(['Escape'], () => setIsOpen(false));

    const getSortLabel = () => {
        const label = sortBy === 'name' ? 'Name' : 'Date';
        const order = sortOrder === 'asc' ? '↑' : '↓';
        return `${label} ${order}`;
    };

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'glass-dark group h-9 gap-2 border-white/10 px-3 text-xs font-medium transition-all duration-300 hover:border-primary/30 hover:bg-primary/5',
                    isOpen
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'text-muted-foreground/80 hover:text-primary'
                )}
            >
                <ArrowUpDown
                    className={cn(
                        'h-3.5 w-3.5 transition-colors duration-300',
                        isOpen ? 'text-primary' : 'group-hover:text-primary'
                    )}
                />
                <span className="flex items-center gap-1.5">
                    <span className="opacity-50">Sort:</span>
                    <span className="font-semibold text-foreground/90">{getSortLabel()}</span>
                </span>
                <ChevronDown
                    className={cn(
                        'h-3 w-3 opacity-50 transition-transform duration-300',
                        isOpen
                            ? 'rotate-180 text-primary opacity-100'
                            : 'group-hover:text-primary group-hover:opacity-100'
                    )}
                />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="glass-dark absolute right-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-white/10 p-1 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="space-y-1">
                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                                Sort By
                            </div>
                            <button
                                onClick={() => {
                                    onSortByChange('name');
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors',
                                    sortBy === 'name'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-white/5'
                                )}
                            >
                                <span>Name</span>
                                {sortBy === 'name' && <Check className="h-3.5 w-3.5" />}
                            </button>
                            <button
                                onClick={() => {
                                    onSortByChange('time');
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors',
                                    sortBy === 'time'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-white/5'
                                )}
                            >
                                <span>Date</span>
                                {sortBy === 'time' && <Check className="h-3.5 w-3.5" />}
                            </button>

                            <div className="my-1 h-[1px] bg-white/5" />

                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                                Order
                            </div>
                            <button
                                onClick={() => {
                                    onSortOrderChange('asc');
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors',
                                    sortOrder === 'asc'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-white/5'
                                )}
                            >
                                <span>Ascending</span>
                                {sortOrder === 'asc' && <Check className="h-3.5 w-3.5" />}
                            </button>
                            <button
                                onClick={() => {
                                    onSortOrderChange('desc');
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors',
                                    sortOrder === 'desc'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-white/5'
                                )}
                            >
                                <span>Descending</span>
                                {sortOrder === 'desc' && <Check className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
