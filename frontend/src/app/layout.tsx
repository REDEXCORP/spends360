import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import { ReduxProvider } from '@/components/ReduxProvider';

const geistSans = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: 'The future is now',
    icons: {
        icon: '/logo.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Toaster />
                <ReactQueryProvider>
                    <ReduxProvider>{children}</ReduxProvider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
