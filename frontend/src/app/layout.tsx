import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import { ReduxProvider } from '@/components/ReduxProvider';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: 'The future is now',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${inter.className} ${jetbrainsMono.variable} antialiased`}>
                <Toaster />
                <ReactQueryProvider>
                    <ReduxProvider>{children}</ReduxProvider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
