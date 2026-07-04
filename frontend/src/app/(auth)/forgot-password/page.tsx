import AuthLayout from '@/components/AuthLayout';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';

export const metadata = {
    title: 'Forgot Password',
    description: 'Reset your account password',
};

export default function ForgotPasswordPage() {
    return (
        <AuthLayout>
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
