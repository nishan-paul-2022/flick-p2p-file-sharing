'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronDown, Clock, FileText } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useClickOutside } from '@/shared/hooks/use-click-outside';
import { useKeyDown } from '@/shared/hooks/use-key-down';
import { SortBy, SortOrder } from '@/shared/types';
import { cn } from '@/shared/utils';

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

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className="glass-dark group h-9 gap-2 border-white/10 px-3 transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
                <ArrowUpDown className="h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-hover:text-primary" />
                <span className="hidden text-xs font-medium sm:inline">Sort</span>
                <ChevronDown
                    className={cn(
                        'h-3 w-3 text-muted-foreground/60 transition-all duration-300 group-hover:text-primary',
                        isOpen && 'rotate-180'
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
                        className="glass-dark absolute right-0 top-full z-50 mt-2 w-[180px] overflow-hidden rounded-xl border border-white/10 p-1.5 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    onSortByChange('name');
                                }}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all duration-200',
                                    'hover:bg-white/5',
                                    sortBy === 'name'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground'
                                )}
                            >
                                <FileText className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">Name</span>
                                {sortBy === 'name' && <Check className="h-3.5 w-3.5" />}
                            </button>

                            <button
                                onClick={() => {
                                    onSortByChange('time');
                                }}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all duration-200',
                                    'hover:bg-white/5',
                                    sortBy === 'time'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground'
                                )}
                            >
                                <Clock className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">Date</span>
                                {sortBy === 'time' && <Check className="h-3.5 w-3.5" />}
                            </button>

                            <div className="my-1 h-[1px] bg-white/5" />

                            <button
                                onClick={() => {
                                    onSortOrderChange('asc');
                                }}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all duration-200',
                                    'hover:bg-white/5',
                                    sortOrder === 'asc'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground'
                                )}
                            >
                                <ArrowUp className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">Ascending</span>
                                {sortOrder === 'asc' && <Check className="h-3.5 w-3.5" />}
                            </button>

                            <button
                                onClick={() => {
                                    onSortOrderChange('desc');
                                }}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all duration-200',
                                    'hover:bg-white/5',
                                    sortOrder === 'desc'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground'
                                )}
                            >
                                <ArrowDown className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">Descending</span>
                                {sortOrder === 'desc' && <Check className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
