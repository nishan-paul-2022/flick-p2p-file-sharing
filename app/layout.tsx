import '@/app/globals.css';

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider } from '@/shared/components/layout/theme-provider';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: {
        default: 'Flick - P2P File Sharing',
        template: '%s | Flick',
    },
    description:
        'Share files instantly between devices with zero backend. Fast, direct, and private peer-to-peer file transfer.',
    keywords: [
        'file sharing',
        'P2P',
        'peer-to-peer',
        'WebRTC',
        'file transfer',
        'private sharing',
        'secure transfer',
    ],
    authors: [{ name: 'Flick' }],
    creator: 'Flick',
    publisher: 'Flick',
    metadataBase: new URL('https://flickfile.vercel.app'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://flickfile.vercel.app',
        title: 'Flick - P2P File Sharing',
        description: 'Securely share files between devices in seconds with P2P technology.',
        siteName: 'Flick',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Flick - P2P File Sharing',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Flick - P2P File Sharing',
        description: 'Securely share files between devices in seconds with P2P technology.',
        images: ['/og-image.png'],
        creator: '@flick_p2p',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Flick',
    },
};

export const viewport: Viewport = {
    themeColor: '#020617',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </head>
            <body className={`${inter.variable} font-sans antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    forcedTheme="dark"
                    disableTransitionOnChange
                >
                    <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
