'use client';

import Link from 'next/link';

export default function RegisterVerifyClient() {
    return (
        <div className="mx-auto w-full max-w-md p-8 text-center">
            <p className="text-sm text-muted-foreground">
                Email verification now uses a one-time code. Register again and enter the OTP from your email.
            </p>
            <Link href="/register" className="mt-6 inline-block text-sm text-[#492FA6] hover:underline">
                Go to register
            </Link>
        </div>
    );
}
