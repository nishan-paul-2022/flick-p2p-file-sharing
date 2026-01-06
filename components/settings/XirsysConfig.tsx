import { motion } from 'framer-motion';

import { Input } from '@/components/ui/input';

interface XirsysConfigProps {
    ident: string;
    secret: string;
    channel: string;
    disabled: boolean;
    onIdentChange: (value: string) => void;
    onSecretChange: (value: string) => void;
    onChannelChange: (value: string) => void;
}

export function XirsysConfig({
    ident,
    secret,
    channel,
    disabled,
    onIdentChange,
    onSecretChange,
    onChannelChange,
}: XirsysConfigProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
        >
            <div className="space-y-2">
                <label htmlFor="xirsys-ident" className="text-sm font-medium text-white/70">
                    Ident
                </label>
                <Input
                    id="xirsys-ident"
                    value={ident}
                    onChange={(e) => onIdentChange(e.target.value)}
                    disabled={disabled}
                    className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="xirsys-secret" className="text-sm font-medium text-white/70">
                    Secret
                </label>
                <Input
                    id="xirsys-secret"
                    value={secret}
                    onChange={(e) => onSecretChange(e.target.value)}
                    type="password"
                    disabled={disabled}
                    className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="xirsys-channel" className="text-sm font-medium text-white/70">
                    Channel
                </label>
                <Input
                    id="xirsys-channel"
                    value={channel}
                    onChange={(e) => onChannelChange(e.target.value)}
                    disabled={disabled}
                    className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
                />
            </div>
        </motion.div>
    );
}
