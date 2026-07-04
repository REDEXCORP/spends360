import { Suspense } from 'react';
import AuthLayout from '@/components/AuthLayout';
import InviteAcceptClient from '@/components/InviteAcceptClient';
import Loading from '@/components/Loading';

export const metadata = {
    title: 'Accept invitation',
    description: 'Accept your workspace invitation',
};

export default function InviteAcceptPage() {
    return (
        <AuthLayout>
            <Suspense fallback={<Loading />}>
                <InviteAcceptClient />
            </Suspense>
        </AuthLayout>
    );
}
