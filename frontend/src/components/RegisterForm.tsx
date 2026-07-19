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
import { RegisterFormValues } from '@/helpers/types';
import { registerSchema } from '@/helpers/validation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/requests';
import { toastError } from '@/helpers';
import AuthFormHeader from '@/components/AuthFormHeader';

const inputClassName =
    'h-11 border-gray-300 bg-white transition-colors focus:border-primary dark:border-border dark:bg-background';

export default function RegisterForm() {
    const router = useRouter();
    const [showOtp, setShowOtp] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const registerMutation = useMutation({
        mutationFn: auth.register,
        onSuccess: (data: { email?: string }, variables: { email: string; password: string }) => {
            setEmail(data.email || variables.email);
            setShowOtp(true);
            setOtp('');
        },
        onError: (error: unknown) => toastError(error),
    });

    const verifyRegisterMutation = useMutation({
        mutationFn: auth.verifyRegister,
        onSuccess: () => router.push('/'),
        onError: (error: unknown) => toastError(error),
    });

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;
        verifyRegisterMutation.mutate({ email, otp });
    };

    if (showOtp) {
        return (
            <div className="mx-auto w-full max-w-md p-8">
                <AuthFormHeader title="Check your email" />
                <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        We&apos;ve sent a 6-digit code to <strong>{email}</strong>
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
                            disabled={verifyRegisterMutation.isPending || otp.length !== 6}
                            className="h-11 w-full bg-[#492FA6] text-white hover:bg-[#492FA6]/90 transition-all duration-300"
                        >
                            {verifyRegisterMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Verify email'
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
                            Back to register
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-md p-8">
            <AuthFormHeader title="Create your account" />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(data =>
                        registerMutation.mutate({
                            email: data.email,
                            password: data.password,
                        })
                    )}
                    className="space-y-5"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-normal text-foreground">Email address</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email address" className={inputClassName} {...field} />
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
                                        className={inputClassName}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-normal text-foreground">
                                    Confirm password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        className={inputClassName}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="h-11 w-full bg-[#264653] text-white hover:bg-[#264653]/90 transition-all duration-300"
                    >
                        {registerMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Send verification code'
                        )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Log In
                        </Link>
                    </div>
                </form>
            </Form>
        </div>
    );
}
