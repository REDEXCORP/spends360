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
import {
    ForgotPasswordFormValues,
    ResetPasswordFormValues,
} from '@/helpers/types';
import { forgotPasswordSchema, resetPasswordSchema } from '@/helpers/validation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/requests';
import { toastError, toastSuccess } from '@/helpers';
import AuthFormHeader from '@/components/AuthFormHeader';

const inputClassName =
    'h-11 border-gray-300 bg-white transition-colors focus:border-primary dark:border-border dark:bg-background';

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const forgotMutation = useMutation({
        mutationFn: auth.forgotPassword,
        onSuccess: (_data, variables) => {
            setEmail(variables.email);
            setStep('reset');
            toastSuccess('If an account exists, a reset code was sent to your email.');
        },
        onError: (error: unknown) => toastError(error),
    });

    const resetMutation = useMutation({
        mutationFn: auth.resetPassword,
        onSuccess: () => {
            toastSuccess('Password updated. You can sign in now.');
            router.push('/login');
        },
        onError: (error: unknown) => toastError(error),
    });

    const emailForm = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const resetForm = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            otp: '',
            password: '',
            confirmPassword: '',
        },
    });

    const handleResetSubmit = (data: ResetPasswordFormValues) => {
        resetMutation.mutate({
            email,
            otp: data.otp || otp,
            password: data.password,
        });
    };

    return (
        <div className="mx-auto w-full max-w-md p-8">
            <AuthFormHeader title={step === 'email' ? 'Forgot your password' : 'Reset your password'} />

            {step === 'email' ? (
                <Form {...emailForm}>
                    <form
                        onSubmit={emailForm.handleSubmit(data => forgotMutation.mutate(data))}
                        className="space-y-5"
                    >
                        <p className="text-sm text-muted-foreground">
                            Enter your email and we will send a reset code if an account exists.
                        </p>

                        <FormField
                            control={emailForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-normal text-foreground">
                                        Email address
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email address" className={inputClassName} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={forgotMutation.isPending}
                            className="h-11 w-full bg-[#492FA6] text-white hover:bg-[#492FA6]/90 transition-all duration-300"
                        >
                            {forgotMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Send reset code'
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Remember your password?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Log In
                            </Link>
                        </div>
                    </form>
                </Form>
            ) : (
                <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-5">
                        <p className="text-sm text-muted-foreground">
                            Enter the 6-digit code sent to {email}
                        </p>

                        <FormItem className="flex flex-col items-center">
                            <FormLabel className="mb-3 self-start text-sm font-normal text-foreground">
                                Reset code
                            </FormLabel>
                            <FormControl>
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={value => {
                                        setOtp(value);
                                        resetForm.setValue('otp', value);
                                    }}
                                    autoFocus
                                >
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
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        <FormField
                            control={resetForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-normal text-foreground">
                                        New password
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

                        <FormField
                            control={resetForm.control}
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
                            disabled={resetMutation.isPending || otp.length !== 6}
                            className="h-11 w-full bg-[#492FA6] text-white hover:bg-[#492FA6]/90 transition-all duration-300"
                        >
                            {resetMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Update password'
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="link"
                            className="w-full text-muted-foreground"
                            onClick={() => {
                                setStep('email');
                                setOtp('');
                                resetForm.reset();
                            }}
                        >
                            Use a different email
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    );
}
