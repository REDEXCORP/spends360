'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { CircleCheck, Loader2 } from 'lucide-react';
import { auth } from '@/requests';
import { toastError } from '@/helpers';
import Link from 'next/link';

export default function RegisterVerifyClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [message, setMessage] = useState('Verifying your account...');

    const verifyMutation = useMutation({
        mutationFn: (verificationToken: string) => auth.verifyRegister(verificationToken),
        onSuccess: data => {
            setMessage(data.message || 'Email verified. You can now sign in.');
            setTimeout(() => router.push('/login'), 2000);
        },
        onError: (error: unknown) => {
            toastError(error);
            setMessage('This verification link is invalid or has expired or verification already completed.');
        },
    });

    useEffect(() => {
        if (!token) {
            setMessage('Missing verification token.');
            return;
        }
        verifyMutation.mutate(token);
    }, [token]);

    const isLoading = verifyMutation.isPending;
    const isError = verifyMutation.isError || !token;
    const isSuccess = verifyMutation.isSuccess;

    return (
        <div className="mx-auto w-full max-w-md p-8 text-center">
            <div className="mt-6 flex flex-col items-center gap-4">
                {isLoading ? <Loader2 className="h-10 w-10 animate-spin text-[#492FA6]" /> : null}
                {isSuccess ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                        <CircleCheck className="h-10 w-10 text-green-600 dark:text-green-400" strokeWidth={1.75} />
                    </div>
                ) : null}
                <p className="text-sm text-muted-foreground">{message}</p>
                {isSuccess ? (
                    <p className="text-xs text-muted-foreground">Redirecting you to sign in...</p>
                ) : null}
                {isError ? (
                    <Link href="/register" className="text-sm text-[#492FA6] hover:underline">
                        Register again
                    </Link>
                ) : null}
                {isSuccess ? (
                    <Link href="/login" className="text-sm text-[#492FA6] hover:underline">
                        Go to sign in
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
