'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, Send, Trash2 } from 'lucide-react';

import { FileDropZone } from '@/components/FileDropZone';
import { FileList } from '@/components/FileList';
import { SortMenu } from '@/components/SortMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePeerStore } from '@/lib/store';

export function FileTransferArea() {
    const receivedFiles = usePeerStore((state) => state.receivedFiles);
    const outgoingFiles = usePeerStore((state) => state.outgoingFiles);

    // Tab State
    const activeTab = usePeerStore((state) => state.activeTab);
    const setActiveTab = usePeerStore((state) => state.setActiveTab);

    // Actions
    const downloadAllReceivedFiles = usePeerStore((state) => state.downloadAllReceivedFiles);
    const clearReceivedHistory = usePeerStore((state) => state.clearReceivedHistory);
    const clearSentHistory = usePeerStore((state) => state.clearSentHistory);

    // Sorting State
    const receivedSortBy = usePeerStore((state) => state.receivedSortBy);
    const setReceivedSortBy = usePeerStore((state) => state.setReceivedSortBy);
    const receivedSortOrder = usePeerStore((state) => state.receivedSortOrder);
    const setReceivedSortOrder = usePeerStore((state) => state.setReceivedSortOrder);
    const sentSortBy = usePeerStore((state) => state.sentSortBy);
    const setSentSortBy = usePeerStore((state) => state.setSentSortBy);
    const sentSortOrder = usePeerStore((state) => state.sentSortOrder);
    const setSentSortOrder = usePeerStore((state) => state.setSentSortOrder);

    // Derived State
    const completedCount = receivedFiles.filter((f) => f.status === 'completed').length;
    const isReceiving = receivedFiles.some((f) => f.status === 'transferring');
    const isSending = outgoingFiles.some((f) => f.status === 'transferring');

    return (
        <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Upload Zone */}
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

            {/* File Lists */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="glass-dark grid h-auto w-full grid-cols-2 rounded-xl border-white/10 p-1">
                    <TabsTrigger
                        value="received"
                        className="group gap-1 rounded-lg py-2.5 font-semibold transition-all duration-300 hover:bg-white/5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground md:gap-2 md:py-3"
                    >
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <motion.div
                                animate={
                                    isReceiving
                                        ? {
                                              y: [0, -3, 0],
                                              scale: [1, 1.1, 1],
                                          }
                                        : {}
                                }
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Download
                                    className={`h-3.5 w-3.5 transition-colors md:h-4 md:w-4 ${
                                        isReceiving
                                            ? 'text-primary'
                                            : 'group-data-[state=active]:text-foreground'
                                    }`}
                                />
                            </motion.div>
                            <span
                                className={`text-xs transition-colors duration-300 md:text-sm ${
                                    isReceiving ? 'font-medium text-primary' : ''
                                }`}
                            >
                                Received
                            </span>
                            <span
                                className={`ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-3xs font-bold transition-all duration-300 md:h-5 md:min-w-5 md:px-1.5 md:text-tiny-plus ${
                                    isReceiving
                                        ? 'bg-primary text-primary-foreground shadow-primary-glow-lg'
                                        : 'border border-white/5 bg-white/5 text-muted-foreground group-data-[state=active]:border-white/20 group-data-[state=active]:bg-white/10 group-data-[state=active]:text-foreground'
                                }`}
                            >
                                {receivedFiles.length}
                            </span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="sent"
                        className="group gap-1 rounded-lg py-2.5 font-semibold transition-all duration-300 hover:bg-white/5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground md:gap-2 md:py-3"
                    >
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <motion.div
                                animate={
                                    isSending
                                        ? {
                                              x: [0, 2, 0],
                                              y: [0, -2, 0],
                                              scale: [1, 1.1, 1],
                                          }
                                        : {}
                                }
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Send
                                    className={`h-3.5 w-3.5 transition-colors md:h-4 md:w-4 ${
                                        isSending
                                            ? 'text-primary'
                                            : 'group-data-[state=active]:text-foreground'
                                    }`}
                                />
                            </motion.div>
                            <span
                                className={`text-xs transition-colors duration-300 md:text-sm ${
                                    isSending ? 'font-medium text-primary' : ''
                                }`}
                            >
                                Sent
                            </span>
                            <span
                                className={`ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-3xs font-bold transition-all duration-300 md:ml-1 md:h-5 md:min-w-5 md:px-1.5 md:text-tiny-plus ${
                                    isSending
                                        ? 'bg-primary text-primary-foreground shadow-primary-glow-lg'
                                        : 'border border-white/5 bg-white/5 text-muted-foreground group-data-[state=active]:border-white/20 group-data-[state=active]:bg-white/10 group-data-[state=active]:text-foreground'
                                }`}
                            >
                                {outgoingFiles.length}
                            </span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                {/* Actions Bar */}
                <div className="mt-2 min-h-[40px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'received' ? (
                            <motion.div
                                key="received-actions"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center justify-between px-0.5"
                            >
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearReceivedHistory}
                                        disabled={receivedFiles.length === 0}
                                        className="glass-dark group h-9 gap-2 border-white/10 px-3 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-hover:text-red-500" />
                                        <span className="hidden text-xs font-medium sm:inline">
                                            Clear History
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={downloadAllReceivedFiles}
                                        disabled={completedCount === 0}
                                        className="glass-dark group h-9 gap-2 border-white/10 px-3 transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-500"
                                    >
                                        <Download className="h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-hover:text-emerald-500" />
                                        <span className="hidden text-xs font-medium sm:inline">
                                            Download All
                                        </span>
                                    </Button>
                                </div>

                                <SortMenu
                                    sortBy={receivedSortBy}
                                    onSortByChange={setReceivedSortBy}
                                    sortOrder={receivedSortOrder}
                                    onSortOrderChange={setReceivedSortOrder}
                                    disabled={receivedFiles.length === 0}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="sent-actions"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center justify-between px-0.5"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearSentHistory}
                                    disabled={outgoingFiles.length === 0}
                                    className="glass-dark group h-9 gap-2 border-white/10 px-3 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500"
                                >
                                    <Trash2 className="h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-hover:text-red-500" />
                                    <span className="hidden text-xs font-medium sm:inline">
                                        Clear History
                                    </span>
                                </Button>

                                <SortMenu
                                    sortBy={sentSortBy}
                                    onSortByChange={setSentSortBy}
                                    sortOrder={sentSortOrder}
                                    onSortOrderChange={setSentSortOrder}
                                    disabled={outgoingFiles.length === 0}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
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
