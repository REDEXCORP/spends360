import AuthLayout from '@/components/AuthLayout';
import RegisterVerifyClient from '@/components/RegisterVerifyClient';

export const metadata = {
    title: 'Verify account',
    description: 'Verify your Reach account',
};

export default function RegisterVerifyPage() {
    return (
        <AuthLayout>
            <RegisterVerifyClient />
        </AuthLayout>
    );
}
