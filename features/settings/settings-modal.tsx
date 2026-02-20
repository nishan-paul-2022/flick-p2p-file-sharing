'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { useSettings } from '@/features/settings/hooks/use-settings';
// Sub-components
import { MeteredConfig } from '@/features/settings/metered-config';
import { ProviderCard } from '@/features/settings/provider-card';
import { XirsysConfig } from '@/features/settings/xirsys-config';
import { Button } from '@/shared/components/ui/button';
import { useKeyDown } from '@/shared/hooks/use-key-down';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const subscribe = () => () => {};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { formState, setters, status, handleSave } = useSettings(isOpen, onClose);

    const isClient = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );

    // Handle Escape key
    useKeyDown(['Escape'], () => {
        if (isOpen && !status.isSaving) {
            onClose();
        }
    });

    if (!isClient) {
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
                                <SlidersHorizontal className="h-5 w-5 text-primary" />
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

                                        <div className="min-h-[180px]">
                                            {provider === 'xirsys' ? (
                                                <XirsysConfig
                                                    ident={ident}
                                                    secret={secret}
                                                    channel={channel}
                                                    disabled={status.isSaving}
                                                    onIdentChange={setters.setIdent}
                                                    onSecretChange={setters.setSecret}
                                                    onChannelChange={setters.setChannel}
                                                />
                                            ) : (
                                                <MeteredConfig
                                                    apiKey={meteredApiKey}
                                                    disabled={status.isSaving}
                                                    onApiKeyChange={setters.setMeteredApiKey}
                                                />
                                            )}
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
                                    className="h-11 min-w-[140px] bg-white px-4 text-zinc-950 transition-all duration-300 hover:bg-white focus-visible:ring-white/20 disabled:opacity-30"
                                >
                                    {status.isSaving ? (
                                        <div className="flex items-center justify-center gap-2 opacity-70">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                                            <span className="text-sm font-medium tracking-wide">
                                                Applying
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <Check className="h-4 w-4" />
                                            <span className="text-sm font-medium">Apply</span>
                                        </div>
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
