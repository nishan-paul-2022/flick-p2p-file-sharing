import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen gradient-secondary flex items-center justify-center p-4">
            <Card className="glass-dark max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-full bg-primary/10">
                            <FileQuestion className="w-6 h-6 text-primary" />
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
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
