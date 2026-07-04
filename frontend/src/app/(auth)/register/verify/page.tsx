import AuthLayout from '@/components/AuthLayout';
import RegisterVerifyClient from '@/components/RegisterVerifyClient';

export const metadata = {
    title: 'Verify account',
    description: 'Verify your Spends360 account',
};

export default function RegisterVerifyPage() {
    return (
        <AuthLayout>
            <RegisterVerifyClient />
        </AuthLayout>
    );
}
