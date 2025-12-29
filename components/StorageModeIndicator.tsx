'use client';

import { usePeerStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, HardDrive, Database } from 'lucide-react';
import { formatFileSize } from '@/lib/storage-mode';
import { useEffect } from 'react';

export function StorageModeIndicator() {
    const { storageCapabilities, initializeStorage } = usePeerStore();

    useEffect(() => {
        if (!storageCapabilities) {
            initializeStorage();
        }
    }, [storageCapabilities, initializeStorage]);

    if (!storageCapabilities) {
        return null;
    }

    const isPowerMode = storageCapabilities.mode === 'power';

    return (
        <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {isPowerMode ? (
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                <Zap className="w-5 h-5 text-green-500" />
                            </div>
                        ) : (
                            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <Shield className="w-5 h-5 text-yellow-500" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm">
                                    {isPowerMode ? 'Power Mode' : 'Compatibility Mode'}
                                </h3>
                                <Badge
                                    variant={isPowerMode ? 'default' : 'secondary'}
                                    className="text-xs"
                                >
                                    {storageCapabilities.browserInfo}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                                {isPowerMode
                                    ? 'Files streamed to disk • Zero memory pressure'
                                    : 'Files stored in memory • Universal compatibility'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {isPowerMode ? (
                            <HardDrive className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <Database className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div className="text-right">
                            <p className="text-xs font-medium">
                                {formatFileSize(storageCapabilities.maxFileSize)}
                            </p>
                            <p className="text-xs text-muted-foreground">Max Size</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
