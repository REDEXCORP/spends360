import LoginForm from '@/components/LoginForm';

export const metadata = {
    title: 'Login',
    description: 'Sign in to your account',
};

export default function LoginPage() {
    return (
        <section className="flex min-h-screen">
            <div
                className="hidden lg:flex lg:w-[60%]"
                style={{ backgroundImage: 'url(https://picsum.photos/1920/1080)' }}
            />

            <div className="flex-1 lg:flex-none lg:w-[40%] flex items-center justify-center bg-background">
                <LoginForm />
            </div>
        </section>
    );
}
