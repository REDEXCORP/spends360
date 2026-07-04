import Image from 'next/image';
import Link from 'next/link';

export default function AuthFormHeader({ title }: { title: string }) {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Reach';

    return (
        <div className="mb-8">
            <Link href="/login" className="mb-8 flex items-center">
                <div className="flex items-center gap-2">
                    <Image
                        src="/favicon.ico"
                        alt="Logo"
                        width={40}
                        height={36}
                        className="h-9 w-10 object-contain"
                    />
                    <span className="hidden text-2xl font-bold text-foreground sm:block">{appName}</span>
                </div>
            </Link>
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        </div>
    );
}
