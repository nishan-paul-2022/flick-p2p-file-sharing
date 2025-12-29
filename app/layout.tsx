import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({
    subsets: ["latin"],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: "Flick - P2P File Sharing",
    description: "Share files instantly between devices with zero backend. Fast, secure, and private peer-to-peer file transfer.",
    keywords: ["file sharing", "P2P", "peer-to-peer", "WebRTC", "file transfer", "secure sharing"],
    authors: [{ name: "Flick" }],
    creator: "Flick",
    publisher: "Flick",
    metadataBase: new URL('https://flick-p2p.vercel.app'),
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://flick-p2p.vercel.app",
        title: "Flick - P2P File Sharing",
        description: "Share files instantly between devices with zero backend. Fast, secure, and private.",
        siteName: "Flick",
    },
    twitter: {
        card: "summary_large_image",
        title: "Flick - P2P File Sharing",
        description: "Share files instantly between devices with zero backend. Fast, secure, and private.",
    },
    robots: {
        index: true,
        follow: true,
    },
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Flick",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#020617" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </head>
            <body className={`${inter.variable} font-sans antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster
                        position="top-right"
                        richColors
                        closeButton
                        theme="dark"
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}
