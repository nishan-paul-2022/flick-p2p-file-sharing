'use client';

import { Send } from 'lucide-react';

import { FileDropZone } from '@/components/FileDropZone';
import { FileList } from '@/components/FileList';
import { TransferActionsBar } from '@/components/TransferActionsBar';
import { TransferTabTrigger } from '@/components/TransferTabTrigger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { usePeerStore } from '@/lib/store';

export function FileTransferArea() {
    const receivedFiles = usePeerStore((state) => state.receivedFiles);
    const outgoingFiles = usePeerStore((state) => state.outgoingFiles);
    const activeTab = usePeerStore((state) => state.activeTab);
    const setActiveTab = usePeerStore((state) => state.setActiveTab);

    const isReceiving = receivedFiles.some((f) => f.status === 'transferring');
    const isSending = outgoingFiles.some((f) => f.status === 'transferring');

    const receivedSortBy = usePeerStore((state) => state.receivedSortBy);
    const receivedSortOrder = usePeerStore((state) => state.receivedSortOrder);
    const sentSortBy = usePeerStore((state) => state.sentSortBy);
    const sentSortOrder = usePeerStore((state) => state.sentSortOrder);

    return (
        <div className="flex flex-col gap-6 lg:col-span-8">
            <Card className="glass-dark border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-white/70" />
                        Send Files
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FileDropZone />
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="glass-dark grid h-auto w-full grid-cols-2 rounded-xl border-white/10 p-1">
                    <TransferTabTrigger
                        value="received"
                        fileCount={receivedFiles.length}
                        isActiveTransfer={isReceiving}
                    />
                    <TransferTabTrigger
                        value="sent"
                        fileCount={outgoingFiles.length}
                        isActiveTransfer={isSending}
                    />
                </TabsList>

                <div className="mt-2 min-h-[40px]">
                    <TransferActionsBar
                        type={activeTab as 'received' | 'sent'}
                        files={activeTab === 'received' ? receivedFiles : outgoingFiles}
                    />
                </div>

                <TabsContent value="received" className="mt-4">
                    <FileList
                        type="received"
                        sortBy={receivedSortBy}
                        sortOrder={receivedSortOrder}
                    />
                </TabsContent>

                <TabsContent value="sent" className="mt-4">
                    <FileList type="sent" sortBy={sentSortBy} sortOrder={sentSortOrder} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
