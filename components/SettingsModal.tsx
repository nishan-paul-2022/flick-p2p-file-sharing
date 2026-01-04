'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { get, set } from 'idb-keyval';
import { RefreshCw, Save, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from './ui/button';
import { Input } from './ui/input';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [ident, setIdent] = useState('');
    const [secret, setSecret] = useState('');
    const [channel, setChannel] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const loadCredentials = async () => {
                const storedIdent = (await get('xirsys_ident')) as string | undefined;
                const storedSecret = (await get('xirsys_secret')) as string | undefined;
                const storedChannel = (await get('xirsys_channel')) as string | undefined;

                setIdent(storedIdent || '');
                setSecret(storedSecret || '');
                setChannel(storedChannel || '');
            };
            loadCredentials();
        }
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save credentials concurrently
            await Promise.all([
                set('xirsys_ident', ident),
                set('xirsys_secret', secret),
                set('xirsys_channel', channel),
                new Promise((resolve) => setTimeout(resolve, 800)), // Minimum UX delay
            ]);

            // Dynamically re-initialize peer connection with new credentials
            // This avoids a full page reload for a smoother experience
            const { usePeerStore } = await import('@/lib/store');
            const store = usePeerStore.getState();

            // Clean up existing connection
            if (store.peer) {
                store.peer.destroy();
            }

            // Re-initialize (pass null code to join as new peer/host)
            // The store's initializePeer will internally fetch the new ICE servers
            await store.initializePeer(store.roomCode || undefined);

            // Notify user
            store.addLog('success', 'Settings Saved', 'Connection refreshed with new credentials');
        } catch (error) {
            console.error('Failed to save settings:', error);
            const { usePeerStore } = await import('@/lib/store');
            usePeerStore
                .getState()
                .addLog('error', 'Settings Error', 'Failed to save configuration');
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
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
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Settings</h2>
                                    <p className="text-xs text-white/50">
                                        Configure connection servers
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-4 px-6 py-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">
                                    Xirsys Identity
                                </label>
                                <Input
                                    value={ident}
                                    onChange={(e) => setIdent(e.target.value)}
                                    placeholder="e.g. your_username"
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">
                                    Xirsys Secret
                                </label>
                                <Input
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    type="password"
                                    placeholder="e.g. your_api_secret"
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">
                                    Xirsys Channel
                                </label>
                                <Input
                                    value={channel}
                                    onChange={(e) => setChannel(e.target.value)}
                                    placeholder="e.g. your_channel"
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                                />
                            </div>

                            <div className="mt-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-200">
                                Note: Settings are saved locally. Connection will momentarily
                                reconnect to apply changes.
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-white/5 px-6 py-4">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="text-white/70 hover:bg-white/10 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
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
