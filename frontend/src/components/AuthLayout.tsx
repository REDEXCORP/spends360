import Image from 'next/image';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'DezyIt';

    return (
        <section className="flex min-h-screen flex-col lg:flex-row">
            <div className="hidden lg:flex lg:h-screen lg:w-1/2 lg:items-center lg:justify-center lg:bg-[#edede9]">
                <div className="flex flex-col items-center px-4 text-center">
                    <Image src="/logo.svg" alt="Logo" width={100} height={100} className="h-full w-full object-contain" />
                </div>
            </div>
            <div className="flex flex-1 items-center justify-center bg-background px-4 py-10 lg:w-1/2 lg:px-8">
                {children}
            </div>
        </section>
    );
}
