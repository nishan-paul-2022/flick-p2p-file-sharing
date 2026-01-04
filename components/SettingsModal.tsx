'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, RefreshCw, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { ProviderType, useSettings } from '@/lib/hooks/useSettings';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { formState, setters, status, handleSave } = useSettings(isOpen, onClose);
    const [activeTab, setActiveTab] = useState<ProviderType>('xirsys');
    const [mounted, setMounted] = useState(false);

    // Sync active tab with provider when loading completes
    useEffect(() => {
        if (!status.isLoading && isOpen) {
            setActiveTab(formState.provider);
        }
    }, [status.isLoading, isOpen, formState.provider]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const { provider, ident, secret, channel, meteredApiKey } = formState;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={!status.isSaving ? onClose : undefined}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-xl sm:max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Connection Settings
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={status.isSaving}
                                className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="relative min-h-[200px] overflow-y-auto px-4 py-4 sm:min-h-[300px] sm:px-6 sm:py-6">
                            <AnimatePresence>
                                {status.isLoading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        {/* Active Provider Selection */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                                                    Active Provider
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <ProviderCard
                                                    label="Xirsys"
                                                    active={provider === 'xirsys'}
                                                    onSelect={() => setters.setProvider('xirsys')}
                                                    disabled={status.isSaving}
                                                />
                                                <ProviderCard
                                                    label="Metered"
                                                    active={provider === 'metered'}
                                                    onSelect={() => setters.setProvider('metered')}
                                                    disabled={status.isSaving}
                                                />
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px w-full bg-white/10" />

                                        {/* Configuration Tabs */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                                                    Configuration
                                                </label>
                                            </div>

                                            <Tabs
                                                value={activeTab}
                                                onValueChange={(val) =>
                                                    setActiveTab(val as ProviderType)
                                                }
                                                className="w-full"
                                            >
                                                <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1">
                                                    <TabsTrigger
                                                        value="xirsys"
                                                        disabled={status.isSaving}
                                                        className="text-white/40 hover:text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm"
                                                    >
                                                        Xirsys
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="metered"
                                                        disabled={status.isSaving}
                                                        className="text-white/40 hover:text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm"
                                                    >
                                                        Metered
                                                    </TabsTrigger>
                                                </TabsList>

                                                <div className="mt-4 min-h-[180px]">
                                                    <TabsContent value="xirsys">
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="space-y-4"
                                                        >
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-white/70">
                                                                    Ident
                                                                </label>
                                                                <Input
                                                                    value={ident}
                                                                    onChange={(e) =>
                                                                        setters.setIdent(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    disabled={status.isSaving}
                                                                    className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-white/70">
                                                                    Secret
                                                                </label>
                                                                <Input
                                                                    value={secret}
                                                                    onChange={(e) =>
                                                                        setters.setSecret(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    type="password"
                                                                    disabled={status.isSaving}
                                                                    className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-white/70">
                                                                    Channel
                                                                </label>
                                                                <Input
                                                                    value={channel}
                                                                    onChange={(e) =>
                                                                        setters.setChannel(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    disabled={status.isSaving}
                                                                    className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    </TabsContent>
                                                    <TabsContent value="metered">
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="space-y-2"
                                                        >
                                                            <label className="text-sm font-medium text-white/70">
                                                                API Key
                                                            </label>
                                                            <Input
                                                                value={meteredApiKey}
                                                                onChange={(e) =>
                                                                    setters.setMeteredApiKey(
                                                                        e.target.value
                                                                    )
                                                                }
                                                                type="password"
                                                                disabled={status.isSaving}
                                                                className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
                                                            />
                                                        </motion.div>
                                                    </TabsContent>
                                                </div>
                                            </Tabs>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 bg-white/5 px-4 py-4 sm:px-6">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                disabled={status.isSaving}
                                className="h-11 px-6 text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:ring-white/20"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={
                                    status.isSaving ||
                                    !status.hasChanges ||
                                    status.isLoading ||
                                    !status.isValid
                                }
                                className="h-11 bg-white px-6 text-zinc-950 transition-all duration-300 hover:scale-[1.02] hover:bg-white focus-visible:ring-white/20 active:scale-100 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-white"
                            >
                                {status.isSaving ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Apply
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

function ProviderCard({
    label,
    active,
    onSelect,
    disabled,
}: {
    label: string;
    active: boolean;
    onSelect: () => void;
    disabled: boolean;
}) {
    return (
        <div
            onClick={() => !disabled && onSelect()}
            className={`relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
                active
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        >
            <div className="flex items-center justify-between">
                <span className={`font-medium ${active ? 'text-emerald-400' : 'text-white'}`}>
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
