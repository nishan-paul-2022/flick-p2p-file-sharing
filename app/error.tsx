"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen gradient-secondary flex items-center justify-center p-4">
            <Card className="glass-dark max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-full bg-destructive/10">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <CardTitle>Something went wrong</CardTitle>
                    </div>
                    <CardDescription>
                        An error occurred while loading the application. Please try again.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error.message && (
                        <div className="p-3 rounded-lg bg-muted/50 text-sm font-mono text-muted-foreground">
                            {error.message}
                        </div>
                    )}
                    <Button onClick={reset} className="w-full" size="lg">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
