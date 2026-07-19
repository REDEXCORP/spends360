import AuthLayout from '@/components/AuthLayout';
import RegisterForm from '@/components/RegisterForm';

export const metadata = {
    title: 'Spends360 - Register',
    description: 'Create your Spends360 account',
};

export default function RegisterPage() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
}
