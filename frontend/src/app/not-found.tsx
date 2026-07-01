import { Metadata } from 'next';

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: 'The future is now',
};

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-center px-6">
            <h1 className="text-9xl font-extrabold text-white tracking-widest animate-pulse">404</h1>
            <p className="mt-8 text-gray-400 max-w-md">
                The page you are looking for does not exist or has been moved.
            </p>
        </div>
    );
}
