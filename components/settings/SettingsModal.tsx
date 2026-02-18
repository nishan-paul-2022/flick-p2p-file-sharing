'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, RefreshCw, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Sub-components
import { MeteredConfig } from '@/components/settings/MeteredConfig';
import { ProviderCard } from '@/components/settings/ProviderCard';
import { XirsysConfig } from '@/components/settings/XirsysConfig';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKeyDown } from '@/lib/hooks/use-key-down';
import { ProviderType, useSettings } from '@/lib/hooks/use-settings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { formState, setters, status, handleSave } = useSettings(isOpen, onClose);
    const [activeTab, setActiveTab] = useState<ProviderType>('xirsys');
    const [mounted, setMounted] = useState(false);

    // Handle Escape key
    useKeyDown(['Escape'], () => {
        if (isOpen && !status.isSaving) {
            onClose();
        }
    });

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
                    role="presentation"
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 40 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-dark relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="settings-title"
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2
                                        id="settings-title"
                                        className="text-lg font-bold text-white"
                                    >
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

                                        <div className="h-px w-full bg-white/10" />

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
                                                        <XirsysConfig
                                                            ident={ident}
                                                            secret={secret}
                                                            channel={channel}
                                                            disabled={status.isSaving}
                                                            onIdentChange={setters.setIdent}
                                                            onSecretChange={setters.setSecret}
                                                            onChannelChange={setters.setChannel}
                                                        />
                                                    </TabsContent>
                                                    <TabsContent value="metered">
                                                        <MeteredConfig
                                                            apiKey={meteredApiKey}
                                                            disabled={status.isSaving}
                                                            onApiKeyChange={
                                                                setters.setMeteredApiKey
                                                            }
                                                        />
                                                    </TabsContent>
                                                </div>
                                            </Tabs>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 bg-white/5 px-4 py-4 sm:px-6">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={status.isSaving}
                                    className="h-11 px-6 text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:ring-white/20"
                                >
                                    Cancel
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={handleSave}
                                    disabled={
                                        status.isSaving ||
                                        !status.hasChanges ||
                                        status.isLoading ||
                                        !status.isValid
                                    }
                                    className="h-11 bg-white px-6 text-zinc-950 transition-all duration-300 hover:bg-white focus-visible:ring-white/20 disabled:opacity-30"
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
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
