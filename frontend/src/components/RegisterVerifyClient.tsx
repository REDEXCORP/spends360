'use client';

import Link from 'next/link';

export default function RegisterVerifyClient() {
    return (
        <div className="mx-auto w-full max-w-md p-8 text-center">
            <p className="text-sm text-muted-foreground">
                Account verification is done with a one-time code on the registration page.
            </p>
            <Link href="/register" className="mt-4 inline-block text-sm text-[#492FA6] hover:underline">
                Go to register
            </Link>
        </div>
    );
}
