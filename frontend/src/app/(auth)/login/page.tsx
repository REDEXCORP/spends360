import AuthLayout from '@/components/AuthLayout';
import LoginForm from '@/components/LoginForm';

export const metadata = {
    title: 'Login',
    description: 'Sign in to your account',
};

export default function LoginPage() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
}
