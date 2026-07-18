'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { LoginFormValues } from '@/helpers/types';
import { loginSchema } from '@/helpers/validation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/requests';
import { toastError } from '@/helpers';
import AuthFormHeader from '@/components/AuthFormHeader';

export default function LoginForm() {
    const router = useRouter();
    const [showOtp, setShowOtp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    const loginMutation = useMutation({
        mutationFn: auth.login,
        onSuccess: (data: { requiresOtp?: boolean; email?: string }, variables: LoginFormValues) => {
            if (data.requiresOtp) {
                setShowOtp(true);
                setEmail(data.email || variables.email);
                setPassword(variables.password);
            } else {
                router.push('/');
            }
        },
        onError: (error: unknown) => toastError(error),
    });

    const verifyOtpMutation = useMutation({
        mutationFn: auth.verifyOtp,
        onSuccess: () => router.push('/'),
        onError: (error: unknown) => toastError(error),
    });

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;
        verifyOtpMutation.mutate({ email, otp, password });
    };

    return (
        <div className="mx-auto w-full max-w-md p-8">
            <AuthFormHeader title={showOtp ? 'Check your email' : 'Sign in to your account'} />

            {showOtp ? (
                <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        We&apos;ve sent a 6-digit code to {email}
                    </p>
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="flex justify-center">
                            <InputOTP maxLength={6} value={otp} onChange={value => setOtp(value)} autoFocus>
                                <InputOTPGroup className="gap-2">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <InputOTPSlot
                                            key={index}
                                            index={index}
                                            className="h-12 w-10 rounded-md border text-lg md:h-14 md:w-12"
                                        />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            type="submit"
                            disabled={verifyOtpMutation.isPending || otp.length !== 6}
                            className="h-11 w-full bg-primary transition-all duration-300 hover:bg-primary/90"
                        >
                            {verifyOtpMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Verify identity'
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="link"
                            onClick={() => {
                                setShowOtp(false);
                                setOtp('');
                            }}
                            className="w-full text-muted-foreground"
                        >
                            Back to sign in
                        </Button>
                    </form>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => loginMutation.mutate(data))} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-normal text-foreground">
                                        Email address
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email address" className="h-11 border-gray-300 bg-white transition-colors focus:border-primary dark:border-border dark:bg-background" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-normal text-foreground">Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            className="h-11 border-gray-300 bg-white transition-colors focus:border-primary dark:border-border dark:bg-background"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-end text-sm">
                            <Link
                                href="/forgot-password"
                                className="text-primary transition-all hover:text-primary/80 hover:underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="h-11 w-full bg-[#264653] text-white hover:bg-[#264653]/90 transition-all duration-300"
                        >
                            {loginMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Sign in'
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-primary hover:underline">
                                Register
                            </Link>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
}
