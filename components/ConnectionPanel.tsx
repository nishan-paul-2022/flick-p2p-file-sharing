"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Wifi, WifiOff, LogOut, RefreshCw } from 'lucide-react';
import { generateRoomCode, isValidRoomCode, copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ConnectionPanelProps {
    roomCode: string | null;
    peerId: string | null;
    isConnected: boolean;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
    onCreateRoom: (code: string) => void;
    onJoinRoom: (code: string) => void;
    onDisconnect: () => void;
}

export function ConnectionPanel({
    roomCode,
    peerId,
    isConnected,
    connectionQuality,
    onCreateRoom,
    onJoinRoom,
    onDisconnect,
}: ConnectionPanelProps) {
    const [joinCode, setJoinCode] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCreateRoom = () => {
        const code = generateRoomCode();
        onCreateRoom(code);
        toast.success('Room created', {
            description: `Room code: ${code}`,
        });
    };

    const handleJoinRoom = () => {
        const code = joinCode.toUpperCase().trim();

        if (!isValidRoomCode(code)) {
            toast.error('Invalid room code', {
                description: 'Room code must be 6 alphanumeric characters',
            });
            return;
        }

        onJoinRoom(code);
        setJoinCode('');
    };

    const handleCopyCode = async () => {
        if (!roomCode) return;

        const success = await copyToClipboard(roomCode);
        if (success) {
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getQualityBadge = () => {
        switch (connectionQuality) {
            case 'excellent':
                return <Badge variant="success" className="gap-1"><Wifi className="w-3 h-3" /> Excellent</Badge>;
            case 'good':
                return <Badge variant="default" className="gap-1"><Wifi className="w-3 h-3" /> Good</Badge>;
            case 'poor':
                return <Badge variant="warning" className="gap-1"><Wifi className="w-3 h-3" /> Poor</Badge>;
            default:
                return <Badge variant="outline" className="gap-1"><WifiOff className="w-3 h-3" /> Disconnected</Badge>;
        }
    };

    return (
        <Card className="glass-dark border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Connection</CardTitle>
                        <CardDescription>Create or join a room to share files</CardDescription>
                    </div>
                    {getQualityBadge()}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {!roomCode ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div>
                            <Button
                                onClick={handleCreateRoom}
                                className="w-full gradient-primary shadow-lg shadow-primary/50 hover:shadow-primary/70 transition-all"
                                size="lg"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Create New Room
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or join existing</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter room code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                maxLength={6}
                                className="uppercase font-mono text-lg tracking-wider"
                            />
                            <Button onClick={handleJoinRoom} disabled={joinCode.length !== 6}>
                                Join
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                            <p className="text-sm text-muted-foreground mb-2">Your Room Code</p>
                            <div className="flex items-center justify-between gap-2">
                                <code className="text-3xl font-bold tracking-wider font-mono gradient-primary bg-clip-text text-transparent">
                                    {roomCode}
                                </code>
                                <Button
                                    onClick={handleCopyCode}
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {peerId && (
                            <div className="p-3 rounded-lg bg-muted/50 text-xs">
                                <p className="text-muted-foreground mb-1">Peer ID</p>
                                <code className="font-mono break-all">{peerId}</code>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                <span className="text-sm font-medium">
                                    {isConnected ? 'Connected' : 'Waiting for peer...'}
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={onDisconnect}
                            variant="destructive"
                            className="w-full"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Leave Room
                        </Button>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}
