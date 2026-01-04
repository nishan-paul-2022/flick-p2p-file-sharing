'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { get, set } from 'idb-keyval';
import { Check, RefreshCw, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from './ui/button';
import { Input } from './ui/input';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [provider, setProvider] = useState<'xirsys' | 'metered'>('xirsys');
    const [ident, setIdent] = useState('');
    const [secret, setSecret] = useState('');
    const [channel, setChannel] = useState('');
    const [meteredApiKey, setMeteredApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [initialSettings, setInitialSettings] = useState({
        provider: 'xirsys',
        ident: '',
        secret: '',
        channel: '',
        meteredApiKey: '',
    });

    useEffect(() => {
        if (isOpen) {
            const loadSettings = async () => {
                const storedProvider = (await get('turn_provider')) as
                    | 'xirsys'
                    | 'metered'
                    | undefined;
                const storedIdent = (await get('xirsys_ident')) as string | undefined;
                const storedSecret = (await get('xirsys_secret')) as string | undefined;
                const storedChannel = (await get('xirsys_channel')) as string | undefined;
                const storedMeteredKey = (await get('metered_api_key')) as string | undefined;

                const settings = {
                    provider: storedProvider || 'xirsys',
                    ident: storedIdent || '',
                    secret: storedSecret || '',
                    channel: storedChannel || '',
                    meteredApiKey: storedMeteredKey || '',
                };

                setProvider(settings.provider as 'xirsys' | 'metered');
                setIdent(settings.ident);
                setSecret(settings.secret);
                setChannel(settings.channel);
                setMeteredApiKey(settings.meteredApiKey);
                setInitialSettings(settings);
            };
            loadSettings();
        }
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save settings concurrently
            await Promise.all([
                set('turn_provider', provider),
                set('xirsys_ident', ident),
                set('xirsys_secret', secret),
                set('xirsys_channel', channel),
                set('metered_api_key', meteredApiKey),
                new Promise((resolve) => setTimeout(resolve, 800)), // Minimum UX delay
            ]);

            // Dynamically re-initialize peer connection with new credentials
            const { usePeerStore } = await import('@/lib/store');
            const store = usePeerStore.getState();

            // Clean up existing connection
            if (store.peer) {
                store.peer.destroy();
            }

            // Re-initialize (pass null code to join as new peer/host)
            await store.initializePeer(store.roomCode || undefined);

            // Notify user
            store.addLog('success', 'Settings Saved', 'Connection refreshed with new credentials');

            // Update initial settings after successful save
            setInitialSettings({
                provider,
                ident,
                secret,
                channel,
                meteredApiKey,
            });
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

    const hasChanges =
        provider !== initialSettings.provider ||
        ident !== initialSettings.ident ||
        secret !== initialSettings.secret ||
        channel !== initialSettings.channel ||
        meteredApiKey !== initialSettings.meteredApiKey;

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
                                    <h2 className="text-lg font-bold text-white">
                                        Connection Settings
                                    </h2>
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
                        <div className="space-y-6 px-6 py-6">
                            {/* Provider Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                                    TURN Provider
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setProvider('xirsys')}
                                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                                            provider === 'xirsys'
                                                ? 'border-white bg-white/10 text-white'
                                                : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        Xirsys
                                    </button>
                                    <button
                                        onClick={() => setProvider('metered')}
                                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                                            provider === 'metered'
                                                ? 'border-white bg-white/10 text-white'
                                                : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        Metered
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {provider === 'xirsys' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/70">
                                                Ident
                                            </label>
                                            <Input
                                                value={ident}
                                                onChange={(e) => setIdent(e.target.value)}
                                                className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/70">
                                                Secret
                                            </label>
                                            <Input
                                                value={secret}
                                                onChange={(e) => setSecret(e.target.value)}
                                                type="password"
                                                className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/70">
                                                Channel
                                            </label>
                                            <Input
                                                value={channel}
                                                onChange={(e) => setChannel(e.target.value)}
                                                className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70">
                                            API Key
                                        </label>
                                        <Input
                                            value={meteredApiKey}
                                            onChange={(e) => setMeteredApiKey(e.target.value)}
                                            type="password"
                                            className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-white/5 px-6 py-4">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="text-white/70 hover:bg-white/10 hover:text-white focus-visible:ring-white/20"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className="bg-white text-zinc-950 hover:bg-white/90 focus-visible:ring-white/20 disabled:opacity-30 disabled:hover:bg-white"
                            >
                                {isSaving ? (
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
