'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { get, set } from 'idb-keyval';
import { Check, Loader2, RefreshCw, Settings, X } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'xirsys' | 'metered'>('xirsys');
    const [ident, setIdent] = useState('');
    const [secret, setSecret] = useState('');
    const [channel, setChannel] = useState('');
    const [meteredApiKey, setMeteredApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
                try {
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
                    setActiveTab(settings.provider as 'xirsys' | 'metered');
                    setIdent(settings.ident);
                    setSecret(settings.secret);
                    setChannel(settings.channel);
                    setMeteredApiKey(settings.meteredApiKey);
                    setInitialSettings(settings);
                } catch (error) {
                    console.error('Failed to load settings:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadSettings();
        } else {
            setIsLoading(true);
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
        !isLoading &&
        (provider !== initialSettings.provider ||
            ident !== initialSettings.ident ||
            secret !== initialSettings.secret ||
            channel !== initialSettings.channel ||
            meteredApiKey !== initialSettings.meteredApiKey);

    const isValid =
        provider === 'xirsys'
            ? ident.trim() !== '' && secret.trim() !== '' && channel.trim() !== ''
            : meteredApiKey.trim() !== '';

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
                    onClick={!isSaving ? onClose : undefined}
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
                                disabled={isSaving}
                                className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div
                            className="relative min-h-[300px] px-6 py-6"
                            style={{ minHeight: '300px' }}
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
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
                                                <div
                                                    onClick={() =>
                                                        !isSaving && setProvider('xirsys')
                                                    }
                                                    className={`relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
                                                        provider === 'xirsys'
                                                            ? 'border-emerald-500/50 bg-emerald-500/10'
                                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                                    } ${isSaving ? 'pointer-events-none opacity-50' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span
                                                            className={`font-medium ${provider === 'xirsys' ? 'text-emerald-400' : 'text-white'}`}
                                                        >
                                                            Xirsys
                                                        </span>
                                                        {provider === 'xirsys' && (
                                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black">
                                                                <Check
                                                                    className="h-3 w-3"
                                                                    strokeWidth={3}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div
                                                    onClick={() =>
                                                        !isSaving && setProvider('metered')
                                                    }
                                                    className={`relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
                                                        provider === 'metered'
                                                            ? 'border-emerald-500/50 bg-emerald-500/10'
                                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                                    } ${isSaving ? 'pointer-events-none opacity-50' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span
                                                            className={`font-medium ${provider === 'metered' ? 'text-emerald-400' : 'text-white'}`}
                                                        >
                                                            Metered
                                                        </span>
                                                        {provider === 'metered' && (
                                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black">
                                                                <Check
                                                                    className="h-3 w-3"
                                                                    strokeWidth={3}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
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

                                            {/* Tabs */}
                                            <div className="flex rounded-lg bg-white/5 p-1">
                                                <button
                                                    onClick={() => setActiveTab('xirsys')}
                                                    disabled={isSaving}
                                                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                                                        activeTab === 'xirsys'
                                                            ? 'bg-white/10 text-white shadow-sm'
                                                            : 'text-white/40 hover:text-white/60'
                                                    } ${isSaving ? 'cursor-not-allowed opacity-50' : ''}`}
                                                >
                                                    Xirsys Settings
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('metered')}
                                                    disabled={isSaving}
                                                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                                                        activeTab === 'metered'
                                                            ? 'bg-white/10 text-white shadow-sm'
                                                            : 'text-white/40 hover:text-white/60'
                                                    } ${isSaving ? 'cursor-not-allowed opacity-50' : ''}`}
                                                >
                                                    Metered Settings
                                                </button>
                                            </div>

                                            {/* Form Fields */}
                                            <div className="min-h-[180px]">
                                                {activeTab === 'xirsys' ? (
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
                                                                    setIdent(e.target.value)
                                                                }
                                                                disabled={isSaving}
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
                                                                    setSecret(e.target.value)
                                                                }
                                                                type="password"
                                                                disabled={isSaving}
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
                                                                    setChannel(e.target.value)
                                                                }
                                                                disabled={isSaving}
                                                                className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ) : (
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
                                                                setMeteredApiKey(e.target.value)
                                                            }
                                                            type="password"
                                                            disabled={isSaving}
                                                            className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
                                                        />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-white/5 px-6 py-4">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                disabled={isSaving}
                                className="h-11 px-6 text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:ring-white/20"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges || isLoading || !isValid}
                                className="h-11 bg-white px-6 text-zinc-950 transition-all duration-300 hover:scale-[1.02] hover:bg-white focus-visible:ring-white/20 active:scale-100 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-white"
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
