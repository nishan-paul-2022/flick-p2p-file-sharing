import { motion } from 'framer-motion';

import { Input } from '@/components/ui/input';

interface MeteredConfigProps {
    apiKey: string;
    disabled: boolean;
    onApiKeyChange: (value: string) => void;
}

export function MeteredConfig({ apiKey, disabled, onApiKeyChange }: MeteredConfigProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
        >
            <label htmlFor="metered-api-key" className="text-sm font-medium text-white/70">
                API Key
            </label>
            <Input
                id="metered-api-key"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                type="password"
                disabled={disabled}
                className="border-white/10 bg-white/5 text-white focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 disabled:opacity-50"
            />
        </motion.div>
    );
}
