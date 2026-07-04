import AuthLayout from '@/components/AuthLayout';
import RegisterForm from '@/components/RegisterForm';

export const metadata = {
    title: 'Register',
    description: 'Create your account',
};

export default function RegisterPage() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
}
