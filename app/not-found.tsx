import { FileQuestion, Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
    return (
        <div className="gradient-secondary flex min-h-screen items-center justify-center p-4">
            <Card className="glass-dark w-full max-w-md">
                <CardHeader>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-3">
                            <FileQuestion className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Page Not Found</CardTitle>
                    </div>
                    <CardDescription>
                        The page you're looking for doesn't exist or has been moved.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/">
                        <Button className="w-full" size="lg">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
