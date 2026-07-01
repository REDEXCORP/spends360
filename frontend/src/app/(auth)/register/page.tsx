import RegisterForm from '@/components/RegisterForm';

export const metadata = {
    title: 'Register',
    description: 'Create your account',
};

export default function RegisterPage() {
    return (
        <section className="flex min-h-screen">
            <div
                className="hidden lg:flex lg:w-[60%]"
                style={{ backgroundImage: 'url(https://picsum.photos/1920/1080)' }}
            />

            <div className="flex-1 lg:flex-none lg:w-[40%] flex items-center justify-center bg-background">
                <RegisterForm />
            </div>
        </section>
    );
}
