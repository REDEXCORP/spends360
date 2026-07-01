'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Profile } from '@/helpers/interfaces';
import { RegisterFormValues } from '@/helpers/types';
import { registerSchema, verifyOtpSchema } from '@/helpers/validation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/requests';
import { toastError, toastSuccess } from '@/helpers';
import { useDispatch } from 'react-redux';
import { setProfile } from '@/store/slices/profileSlice';

type Step = 'register' | 'verify';

export default function RegisterForm() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [step, setStep] = useState<Step>('register');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const registerMutation = useMutation({
        mutationFn: (data: RegisterFormValues) => auth.register(data),
        onSuccess: (data: { message: string; email: string }) => {
            setEmail(data.email);
            setOtp('');
            setStep('verify');
            toastSuccess(data.message);
        },
        onError: (error: unknown) => toastError(error),
    });

    const verifyMutation = useMutation({
        mutationFn: auth.verifyOtp,
        onSuccess: (data: { message: string; user: Profile }) => {
            dispatch(setProfile(data.user));
            toastSuccess(data.message);
            router.push('/');
        },
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

    const handleVerify = () => {
        const result = verifyOtpSchema.safeParse({ email, otp });
        if (!result.success) {
            toastError(result.error.issues[0]?.message ?? 'Invalid verification code');
            return;
        }
        verifyMutation.mutate({ email, otp });
    };

    if (step === 'verify') {
        return (
            <div className="w-full max-w-md mx-auto p-8">
                <div className="mb-8">
                    <Link href="/" className="flex items-center mb-8">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.svg" alt="Logo" width={40} height={36} className="w-10 h-9 object-contain" />
                            <span className="font-bold text-2xl hidden sm:block text-foreground">Spends360</span>
                        </div>
                    </Link>
                    <h2 className="text-2xl font-semibold text-foreground">Verify your email</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className="h-11 w-11" />
                                <InputOTPSlot index={1} className="h-11 w-11" />
                                <InputOTPSlot index={2} className="h-11 w-11" />
                                <InputOTPSlot index={3} className="h-11 w-11" />
                                <InputOTPSlot index={4} className="h-11 w-11" />
                                <InputOTPSlot index={5} className="h-11 w-11" />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <Button
                        type="button"
                        disabled={verifyMutation.isPending || otp.length !== 6}
                        onClick={handleVerify}
                        className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-300"
                    >
                        {verifyMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify'}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        <button
                            type="button"
                            onClick={() => {
                                setStep('register');
                                setOtp('');
                            }}
                            className="text-primary hover:underline"
                        >
                            Back to registration
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto p-8">
            <div className="mb-8">
                <Link href="/" className="flex items-center mb-8">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.svg" alt="Logo" width={40} height={36} className="w-10 h-9 object-contain" />
                        <span className="font-bold text-2xl hidden sm:block text-foreground">Spends360</span>
                    </div>
                </Link>
                <h2 className="text-2xl font-semibold text-foreground">Create your account</h2>
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(data => registerMutation.mutate(data))}
                    className="space-y-5"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-normal text-foreground">Email address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Email address"
                                        className="h-11 bg-white dark:bg-background border-gray-300 dark:border-border focus:border-primary transition-colors"
                                        {...field}
                                    />
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
                                        className="h-11 bg-white dark:bg-background border-gray-300 dark:border-border focus:border-primary transition-colors"
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
                                <FormLabel className="text-sm font-normal text-foreground">Confirm password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Confirm password"
                                        className="h-11 bg-white dark:bg-background border-gray-300 dark:border-border focus:border-primary transition-colors"
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
                        className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-300"
                    >
                        {registerMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create'}
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
