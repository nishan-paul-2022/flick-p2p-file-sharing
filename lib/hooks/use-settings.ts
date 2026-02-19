import { get, set } from 'idb-keyval';
import { useEffect, useState } from 'react';

import { usePeerStore } from '@/lib/store';

export type ProviderType = 'xirsys' | 'metered';

export interface SettingsState {
    provider: ProviderType;
    ident: string;
    secret: string;
    channel: string;
    meteredApiKey: string;
}

export function useSettings(isOpen: boolean, onClose: () => void) {
    // Actions are stable Zustand references — safe to subscribe at hook level
    const peer = usePeerStore((state) => state.peer);
    const initializePeer = usePeerStore((state) => state.initializePeer);
    const roomCode = usePeerStore((state) => state.roomCode);
    const addLog = usePeerStore((state) => state.addLog);

    const [provider, setProvider] = useState<ProviderType>('xirsys');
    const [ident, setIdent] = useState('');
    const [secret, setSecret] = useState('');
    const [channel, setChannel] = useState('');
    const [meteredApiKey, setMeteredApiKey] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [initialSettings, setInitialSettings] = useState<SettingsState>({
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
                    const storedProvider = (await get('turn_provider')) as ProviderType | undefined;
                    const storedIdent = (await get('xirsys_ident')) as string | undefined;
                    const storedSecret = (await get('xirsys_secret')) as string | undefined;
                    const storedChannel = (await get('xirsys_channel')) as string | undefined;
                    const storedMeteredKey = (await get('metered_api_key')) as string | undefined;

                    const settings: SettingsState = {
                        provider: storedProvider || 'xirsys',
                        ident: storedIdent || '',
                        secret: storedSecret || '',
                        channel: storedChannel || '',
                        meteredApiKey: storedMeteredKey || '',
                    };

                    setProvider(settings.provider);
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
            await Promise.all([
                set('turn_provider', provider),
                set('xirsys_ident', ident),
                set('xirsys_secret', secret),
                set('xirsys_channel', channel),
                set('metered_api_key', meteredApiKey),
                new Promise((resolve) => setTimeout(resolve, 800)), // Artificial delay for better UX
            ]);

            if (peer) {
                peer.destroy();
            }

            await initializePeer(roomCode || undefined);

            addLog('success', 'Settings Saved', 'Connection refreshed with new credentials');

            setInitialSettings({
                provider,
                ident,
                secret,
                channel,
                meteredApiKey,
            });

            onClose();
        } catch (error) {
            console.error('Failed to save settings:', error);
            addLog('error', 'Settings Error', 'Failed to save configuration');
        } finally {
            setIsSaving(false);
        }
    };

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

    return {
        formState: {
            provider,
            ident,
            secret,
            channel,
            meteredApiKey,
        },
        setters: {
            setProvider,
            setIdent,
            setSecret,
            setChannel,
            setMeteredApiKey,
        },
        status: {
            isSaving,
            isLoading,
            hasChanges,
            isValid,
        },
        handleSave,
    };
}
