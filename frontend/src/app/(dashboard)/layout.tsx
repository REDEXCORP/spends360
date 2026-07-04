'use client';

import { AuthProvider } from '@/components/AuthProvider';
import AppLayout from '@/components/AppLayout';
import TelnyxProvider from '@/components/TelnyxProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <TelnyxProvider>
                <AppLayout>{children}</AppLayout>
            </TelnyxProvider>
        </AuthProvider>
    );
}
